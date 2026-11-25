import assert from 'node:assert';
import { createScopedMcpSession } from '../mcp/cdesMcpServer';
import { hermesMemoryService } from '../services/hermesMemoryService';
import { PrivacyService } from '../services/privacyService';
import {
  runGeminiMcpAdvisorTurn,
  type AdvisorInteractionRequest,
  type AdvisorInteractionRunner,
} from '../services/geminiAdvisorOrchestrator';
import { bootstrapCsrf, createTestUser, startTestServer } from './helpers/httpTestHelper';

async function run(): Promise<void> {
  const ctx = await startTestServer({ prefix: 'cdes-mcp-', disableRateLimit: true });
  try {
    const { token: tokenA } = createTestUser({
      id: 'usr-mem-a', email: 'stua@cdes.test', role: 'student', name: 'Sokha Chan', jwtSecret: ctx.jwtSecret,
    });
    const { token: tokenB } = createTestUser({
      id: 'usr-mem-b', email: 'stub@cdes.test', role: 'student', name: 'Dara Lim', jwtSecret: ctx.jwtSecret,
    });

    const privacyService = new PrivacyService();
    privacyService.updateConsent('usr-mem-a', { isMinor: false, allowAiMemory: true }, 'admin');
    privacyService.updateConsent('usr-mem-b', { isMinor: true, allowAiMemory: false }, 'student');

    // 1. Embedded MCP server (InMemoryTransport): guest vs consented vs unconsented
    const guestSession = await createScopedMcpSession({ userId: null, userRole: null });
    try {
      const tools = await guestSession.listTools();
      assert.strictEqual(tools.length, 15, 'Expected all 15 embedded MCP tools registered');

      const sch = await guestSession.callTool('search_scholarships', { limit: 5 });
      assert.ok((sch.payload as { returned: number }).returned > 0 && sch.citations.length > 0);
      const topUnis = await guestSession.callTool('search_top_global_universities', { limit: 3 });
      assert.ok((topUnis.payload as { returned: number }).returned > 0);
      const khUnis = await guestSession.callTool('search_cambodian_universities', { query: 'CADT' });
      assert.ok((khUnis.payload as { totalMatches: number }).totalMatches >= 1);
      const learn = await guestSession.callTool('search_learning_and_knowledge', { query: 'Math', limit: 3 });
      assert.ok((learn.payload as { subjectsCount?: number }).subjectsCount !== undefined);
      const community = await guestSession.callTool('search_community_and_events', {});
      assert.ok(Array.isArray((community.payload as { communities?: unknown[] }).communities));
      const fit = await guestSession.callTool('evaluate_major_fit', {
        interests: ['Technology', 'Software Engineering'], mathAbility: 'loves_math', budgetTier: 'low_under_1000',
      });
      assert.ok(Boolean((fit.payload as { topMajor?: string }).topMajor));
      const guestProfile = await guestSession.callTool('get_my_study_profile', {});
      assert.strictEqual((guestProfile.payload as { authenticated: boolean }).authenticated, false);
      const guestWrite = await guestSession.callTool('fact_store_add', { factText: 'Should not write', category: 'goal' });
      assert.strictEqual((guestWrite.payload as { enabled: boolean }).enabled, false);
    } finally {
      await guestSession.close();
    }

    const sessionB = await createScopedMcpSession({ userId: 'usr-mem-b', userRole: 'student' });
    try {
      const profileB = await sessionB.callTool('get_my_study_profile', {});
      assert.strictEqual((profileB.payload as { profile?: { name: string } | null }).profile?.name, 'Dara Lim');
      const writeB = await sessionB.callTool('fact_store_add', { factText: 'Minor unconsented', category: 'goal' });
      assert.strictEqual((writeB.payload as { enabled: boolean }).enabled, false);
    } finally {
      await sessionB.close();
    }

    // 2. Hermes memory features: sanitize, multilingual EN/KM entity probing, feedback, pruning, 10-turn nudge
    const addRes1 = hermesMemoryService.addFact('usr-mem-a', {
      factText: 'Preparing for <script>alert(1)</script>CADT Computer Science & អាហារូបករណ៍ MEXT',
      category: 'goal',
      source: 'explicit_user',
    });
    assert.strictEqual(addRes1.enabled, true);
    assert.ok(addRes1.fact && !addRes1.fact.factText.includes('<script>'));

    const dupRes = hermesMemoryService.addFact('usr-mem-a', { factText: addRes1.fact.factText, category: 'goal' });
    assert.strictEqual(dupRes.deduplicated, true);
    assert.ok((dupRes.fact?.trustScore || 0) > (addRes1.fact.trustScore || 0));

    const kmSearch = hermesMemoryService.searchFacts('usr-mem-a', 'scholarship');
    assert.ok(kmSearch.facts.length >= 1, 'Multilingual synonym search must match អាហារូបករណ៍ / scholarship');
    const reasoned = hermesMemoryService.reasonEntities('usr-mem-a', ['cadt', 'អាហារូបករណ៍']);
    assert.ok(reasoned.facts.length >= 1);

    const corrected = hermesMemoryService.applyFactFeedback(
      'usr-mem-a', addRes1.fact.id, 'correct', 'Targeting CADT Data Science and MEXT Research Scholarship'
    );
    assert.strictEqual(corrected.fact?.factText, 'Targeting CADT Data Science and MEXT Research Scholarship');
    const reverted = hermesMemoryService.applyFactFeedback('usr-mem-a', addRes1.fact.id, 'revert');
    assert.strictEqual(reverted.fact?.factText, addRes1.fact.factText);

    const longUserContent = Array.from({ length: 80 }, (_, idx) => `Line ${idx}: Studying Bac II math and physics daily.`).join('\n');
    const prunedDoc = hermesMemoryService.updateMemoryDoc('usr-mem-a', 'USER', longUserContent);
    assert.strictEqual(prunedDoc.truncated, true);
    assert.ok((prunedDoc.doc?.content.length || 0) <= 3000, 'USER.md must obey 3000-char limit');

    for (let i = 1; i <= 10; i++) {
      const turn = hermesMemoryService.recordUserTurn('usr-mem-a');
      if (i === 10) assert.strictEqual(turn.shouldNudge, true, '10th turn must trigger memory consolidation nudge');
    }
    assert.strictEqual(hermesMemoryService.getPromptInjectionBundle('usr-mem-a').shouldNudge, true);

    // 3. Mocked Gemini Interactions + Embedded MCP tool-call loop & Web citation extraction
    const capturedRequests: AdvisorInteractionRequest[] = [];
    let callIndex = 0;
    const mockRunner: AdvisorInteractionRunner = {
      create: async (params) => {
        capturedRequests.push(params);
        callIndex += 1;
        if (callIndex === 1) {
          return {
            id: 'int-step-1',
            steps: [
              { type: 'function_call', id: 'fc-sch-1', name: 'search_scholarships', arguments: { limit: 2 } },
              { type: 'function_call', id: 'fc-mem-1', name: 'fact_store_add', arguments: { factText: 'Prefers concise English + Khmer examples', category: 'study_habit' } },
            ],
          };
        }
        return {
          id: 'int-step-2',
          output_text: 'Here are verified scholarship options tailored to your CADT goal.',
          steps: [{
            type: 'model_output',
            content: [{
              type: 'text',
              text: 'Here are verified scholarship options tailored to your CADT goal.',
              annotations: [{ type: 'url_citation', title: 'MEXT Official Portal', url: 'https://www.studyinjapan.go.jp/en/' }],
            }],
          }],
        };
      },
    };

    const orchestrated = await runGeminiMcpAdvisorTurn({
      userId: 'usr-mem-a', userRole: 'student', prompt: 'Which verified scholarships match my goal?', messages: [], interactionRunner: mockRunner,
    });
    assert.strictEqual(callIndex, 2);
    assert.strictEqual(capturedRequests[1]?.previous_interaction_id, 'int-step-1');
    assert.ok(capturedRequests[0]?.system_instruction?.includes('[HERMES USER PROFILE (USER.md)]'));
    assert.ok(capturedRequests[0]?.system_instruction?.includes('[MEMORY NUDGE]'));
    assert.ok(capturedRequests[0]?.tools?.some((t) => t.type === 'google_search'));
    assert.ok(orchestrated.toolsUsed.includes('search_scholarships'));
    assert.ok(orchestrated.toolsUsed.includes('fact_store_add'));
    assert.ok(orchestrated.retrievedSources.length >= 1);
    assert.strictEqual(orchestrated.webSources[0]?.url, 'https://www.studyinjapan.go.jp/en/');
    assert.ok(orchestrated.memoryUpdates.length >= 1);

    // 4. Express /api/memory REST routes & IDOR/consent checks
    const unauth = await fetch(`${ctx.baseUrl}/api/memory`);
    assert.strictEqual(unauth.status, 401);

    const { cookie: cookieB, csrf: csrfB } = await bootstrapCsrf(ctx.baseUrl, tokenB);
    const unconsentedPost = await fetch(`${ctx.baseUrl}/api/memory/facts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookieB, 'X-CSRF-Token': csrfB },
      body: JSON.stringify({ factText: 'Should fail consent', category: 'goal' }),
    });
    assert.strictEqual(unconsentedPost.status, 403);

    const { cookie: cookieA, csrf: csrfA } = await bootstrapCsrf(ctx.baseUrl, tokenA);
    const getA = await fetch(`${ctx.baseUrl}/api/memory`, { headers: { Cookie: cookieA } });
    assert.strictEqual(getA.status, 200);
    const snapA = (await getA.json()) as { enabled: boolean; facts: Array<{ id: string }> };
    assert.strictEqual(snapA.enabled, true);
    assert.ok(snapA.facts.length >= 2);

    const delA = await fetch(`${ctx.baseUrl}/api/memory`, {
      method: 'DELETE', headers: { Cookie: cookieA, 'X-CSRF-Token': csrfA },
    });
    assert.strictEqual(delA.status, 200);
    assert.strictEqual(hermesMemoryService.getMemorySnapshot('usr-mem-a').facts.length, 0);

    console.log('MCP_AND_HERMES_MEMORY_TESTS_PASSED');
  } finally {
    await ctx.close();
  }
}

void run().catch((err) => {
  console.error(err);
  process.exit(1);
});
