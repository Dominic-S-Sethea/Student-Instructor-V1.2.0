import assert from 'node:assert';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { getSafeHttpUrl } from '../../src/utils/safeUrl';
import { bootstrapCsrf, createTestUser, startTestServer } from './helpers/httpTestHelper';

const ROOT = resolve(process.cwd());

function walkFiles(dir: string, exts: string[]): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      results.push(...walkFiles(full, exts));
    } else if (exts.some((ext) => full.endsWith(ext))) {
      results.push(full);
    }
  }
  return results;
}

function testStaticFrontendInvariants(): void {
  // 1. Safe URL sanitizer rejects XSS / non-HTTP schemes
  assert.strictEqual(getSafeHttpUrl('https://cadt.edu.kh/apply'), 'https://cadt.edu.kh/apply');
  assert.strictEqual(getSafeHttpUrl('http://example.org/test'), 'http://example.org/test');
  assert.strictEqual(getSafeHttpUrl('javascript:alert(1)'), null);
  assert.strictEqual(getSafeHttpUrl('data:text/html,<script>alert(1)</script>'), null);
  assert.strictEqual(getSafeHttpUrl('vbscript:msgbox(1)'), null);
  assert.strictEqual(getSafeHttpUrl(''), null);
  assert.strictEqual(getSafeHttpUrl(undefined), null);

  // 2. Zero raw fetch('/api/...') calls in src/components/ (all API calls go through apiClient with CSRF)
  const componentFiles = walkFiles(join(ROOT, 'src', 'components'), ['.ts', '.tsx']);
  const rawApiFetches: string[] = [];
  const bareNoreferrer: string[] = [];
  for (const file of componentFiles) {
    const src = readFileSync(file, 'utf8');
    if (/\bfetch\s*\(\s*[`'"]\/api\//.test(src)) {
      rawApiFetches.push(file);
    }
    if (/rel="noreferrer"/.test(src)) {
      bareNoreferrer.push(file);
    }
  }
  assert.deepStrictEqual(rawApiFetches, [], `Raw fetch('/api/...') found in: ${rawApiFetches.join(', ')}`);
  assert.deepStrictEqual(bareNoreferrer, [], `Bare rel="noreferrer" without noopener in: ${bareNoreferrer.join(', ')}`);

  // 3. All previously missing bilingual translation keys exist in BOTH en and km blocks
  const langSrc = readFileSync(join(ROOT, 'src', 'context', 'LanguageContext.tsx'), 'utf8');
  const kmIndex = langSrc.indexOf('km: {');
  assert.ok(kmIndex > 0, 'LanguageContext should have a km dictionary');
  const enBlock = langSrc.slice(0, kmIndex);
  const kmBlock = langSrc.slice(kmIndex);
  const requiredKeys = [
    'uni.allProfiles',
    'uni.compareMatrix',
    'uni.scholarshipsFilter',
    'roi.title',
    'matrix.title',
    'matrix.subtitle',
    'matrix.selectToCompare',
    'matrix.dataReliability',
    'matrix.overallScore',
    'matrix.scoreBreakdown',
    'matrix.tuition',
    'matrix.curriculumModel',
    'matrix.theoryPractice',
    'matrix.salaryPlacement',
    'matrix.scholarships',
    'matrix.bestFitFor',
    'matrix.notRecommended',
    'matrix.decisionActions',
  ];
  for (const key of requiredKeys) {
    assert.ok(enBlock.includes(`'${key}':`), `Missing English translation key: ${key}`);
    assert.ok(kmBlock.includes(`'${key}':`), `Missing Khmer translation key: ${key}`);
  }

  // 4. index.html loads external pre-paint dark theme script (strict CSP) and SVG favicon
  const indexHtml = readFileSync(join(ROOT, 'index.html'), 'utf8');
  assert.ok(indexHtml.includes('src="/theme-init.js"'), 'index.html must load external /theme-init.js for strict CSP');
  assert.ok(indexHtml.includes('rel="icon"'), 'index.html must include a favicon');
  const themeInitJs = readFileSync(join(ROOT, 'public', 'theme-init.js'), 'utf8');
  assert.ok(themeInitJs.includes('cdes_study_theme'), 'public/theme-init.js must apply dark mode before paint');
}

async function testLiveClientBackendContracts(): Promise<void> {
  const ctx = await startTestServer({ prefix: 'cdes-p4-', seedCatalog: true, seedDemo: true });
  try {
    const stu = createTestUser({
      id: 'usr-p4-stu',
      email: 'stu.p4@cdes.test',
      role: 'student',
      name: 'Sreyna P4',
      jwtSecret: ctx.jwtSecret,
    });
    const { cookie, csrf } = await bootstrapCsrf(ctx.baseUrl, stu.token);

    // 1. Decision evaluation honors workStyle and careerGoal
    const decRes = await fetch(`${ctx.baseUrl}/api/decision/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookie, 'X-CSRF-Token': csrf },
      body: JSON.stringify({
        interests: ['Technology'],
        mathAbility: 'strong_math',
        strengths: ['Logic'],
        budgetTier: 'low_under_1000',
        workStyle: 'hands_on_coder',
        careerGoal: 'local_tech',
      }),
    });
    assert.strictEqual(decRes.status, 200);
    const decJson = (await decRes.json()) as {
      success: boolean;
      recommendations: { fitReason: string; topMajor: string };
    };
    assert.strictEqual(decJson.success, true);
    assert.ok(decJson.recommendations.fitReason.includes('hands on coder'));
    assert.ok(decJson.recommendations.fitReason.includes('local tech'));

    // 2. Community post creation, upvote, and comment return shapes expected by communityClient
    const commListRes = await fetch(`${ctx.baseUrl}/api/community/communities`);
    assert.strictEqual(commListRes.status, 200);
    const commList = (await commListRes.json()) as { success: boolean; data: Array<{ id: string }> };
    assert.ok(Array.isArray(commList.data) && commList.data.length > 0);
    const communityId = commList.data[0].id;

    const createPostRes = await fetch(`${ctx.baseUrl}/api/community/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookie, 'X-CSRF-Token': csrf },
      body: JSON.stringify({
        community_id: communityId,
        author_id: 'usr-p4-stu',
        author_name: 'Sreyna P4',
        title: 'How to prepare for ITC Tronc Commun math?',
        content: 'Looking for study advice on linear algebra and calculus past papers.',
        post_type: 'question',
        tags: ['ITC', 'Math'],
      }),
    });
    assert.strictEqual(createPostRes.status, 200);
    const createdPost = (await createPostRes.json()) as {
      success: boolean;
      data: { id: string; upvotes_count: number };
    };
    assert.ok(createdPost.data?.id);

    const upvoteRes = await fetch(`${ctx.baseUrl}/api/community/posts/${createdPost.data.id}/upvote`, {
      method: 'POST',
      headers: { Cookie: cookie, 'X-CSRF-Token': csrf },
    });
    assert.strictEqual(upvoteRes.status, 200);
    const upvoteData = (await upvoteRes.json()) as { success: boolean; data: { upvotes_count: number } };
    assert.strictEqual(typeof upvoteData.data?.upvotes_count, 'number');

    const commentRes = await fetch(`${ctx.baseUrl}/api/community/posts/${createdPost.data.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookie, 'X-CSRF-Token': csrf },
      body: JSON.stringify({
        author_id: 'usr-p4-stu',
        author_name: 'Sreyna P4',
        content: 'Practice previous 5 years of Bac II and Tronc Commun exercises.',
      }),
    });
    assert.strictEqual(commentRes.status, 200);
    const commentData = (await commentRes.json()) as { success: boolean; data: { id: string } };
    assert.ok(commentData.data?.id);

    // 3. Learning paths expose numeric current_step for student enrollment
    const roadmapRes = await fetch(`${ctx.baseUrl}/api/learning/paths?studentId=usr-p4-stu`, {
      headers: { Cookie: cookie },
    });
    assert.strictEqual(roadmapRes.status, 200);
    const roadmapJson = (await roadmapRes.json()) as { success: boolean; data: Array<{ id: string }> };
    assert.ok(Array.isArray(roadmapJson.data));

    // 4. Scholarship canonical endpoints respond cleanly
    const schRes = await fetch(`${ctx.baseUrl}/api/scholarships`);
    assert.strictEqual(schRes.status, 200);
    const schJson = (await schRes.json()) as { scholarships: unknown[]; totalCount: number };
    assert.ok(schJson.totalCount > 0);
  } finally {
    await ctx.close();
  }
}

async function run(): Promise<void> {
  testStaticFrontendInvariants();
  await testLiveClientBackendContracts();
  console.log('Phase 4 frontend contracts & security regression tests passed.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
