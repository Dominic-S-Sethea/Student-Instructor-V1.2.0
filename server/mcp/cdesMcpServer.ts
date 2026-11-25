import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { z } from 'zod';
import {
  McpSourceCitation,
  McpToolExecutionResult,
  runEvaluateMajorFit,
  runGetMyStudyProfile,
  runGetScholarshipDetail,
  runGetTopGlobalUniversityDetail,
  runSearchCambodianUniversities,
  runSearchCommunityAndEvents,
  runSearchLearningAndKnowledge,
  runSearchScholarships,
  runSearchTopGlobalUniversities,
} from './cdesAppTools';
import {
  runFactStoreAdd,
  runFactStoreFeedback,
  runFactStoreProbe,
  runFactStoreReason,
  runFactStoreSearch,
  runMemoryDocUpdate,
} from './cdesMemoryTools';

export interface ScopedMcpContext {
  userId: string | null;
  userRole: string | null;
}

export interface McpToolDescriptor {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface ScopedMcpSession {
  listTools(): Promise<McpToolDescriptor[]>;
  callTool(name: string, args: Record<string, unknown>): Promise<McpToolExecutionResult>;
  close(): Promise<void>;
}

function toToolResponse(result: McpToolExecutionResult): {
  content: Array<{ type: 'text'; text: string }>;
} {
  return {
    content: [{ type: 'text', text: JSON.stringify(result) }],
  };
}

function registerAllTools(server: McpServer, ctx: ScopedMcpContext): void {
  server.registerTool(
    'search_scholarships',
    {
      description: 'Search verified domestic & international scholarships with real deadlines, funding coverage, and official URLs.',
      inputSchema: {
        query: z.string().optional(),
        region: z.string().optional(),
        degree: z.string().optional(),
        field: z.string().optional(),
        funding: z.string().optional(),
        onlyVerified: z.boolean().optional(),
        limit: z.number().int().min(1).max(20).optional(),
      },
    },
    async (args) => toToolResponse(runSearchScholarships(args))
  );

  server.registerTool(
    'get_scholarship_detail',
    {
      description: 'Get full verified dossier for a scholarship ID (eligibility, stipend, insurance, documents, official source).',
      inputSchema: { scholarshipId: z.string().min(1) },
    },
    async ({ scholarshipId }) => toToolResponse(runGetScholarshipDetail(scholarshipId))
  );

  server.registerTool(
    'search_top_global_universities',
    {
      description: 'Search the Top 100 Global University Fellowships & Financial Aid directory across 11 hubs.',
      inputSchema: {
        query: z.string().optional(),
        region: z.string().optional(),
        degree: z.string().optional(),
        maxQsRank: z.number().int().optional(),
        limit: z.number().int().min(1).max(15).optional(),
      },
    },
    async (args) => toToolResponse(runSearchTopGlobalUniversities(args))
  );

  server.registerTool(
    'get_top_global_university_detail',
    {
      description: 'Get full aid dossier and Cambodian student tips for a Top 100 Global University.',
      inputSchema: { idOrName: z.string().min(1) },
    },
    async ({ idOrName }) => toToolResponse(runGetTopGlobalUniversityDetail(idOrName))
  );

  server.registerTool(
    'search_cambodian_universities',
    {
      description: 'Search Cambodian universities (CADT, ITC, RUPP, UHS, AUPP, CamEd, Paragon.U) with tuition, majors, and accreditation.',
      inputSchema: {
        query: z.string().optional(),
        type: z.enum(['all', 'Public', 'Private']).optional(),
      },
    },
    async (args) => toToolResponse(runSearchCambodianUniversities(args))
  );

  server.registerTool(
    'evaluate_major_fit',
    {
      description: 'Run the deterministic Major Fit & University Match planning estimate.',
      inputSchema: {
        interests: z.array(z.string()).optional(),
        mathAbility: z.enum(['loves_math', 'moderate_math', 'hates_math']).optional(),
        strengths: z.array(z.string()).optional(),
        budgetTier: z.string().optional(),
      },
    },
    async (args) => toToolResponse(runEvaluateMajorFit(args))
  );

  server.registerTool(
    'search_learning_and_knowledge',
    {
      description: 'Search study library topics, STEM lab experiments, and knowledge base articles.',
      inputSchema: {
        query: z.string(),
        limit: z.number().int().min(1).max(10).optional(),
      },
    },
    async (args) => toToolResponse(runSearchLearningAndKnowledge(args))
  );

  server.registerTool(
    'search_community_and_events',
    {
      description: 'Browse public student study communities and discussions.',
      inputSchema: {
        category: z.string().optional(),
        query: z.string().optional(),
      },
    },
    async (args) => toToolResponse(runSearchCommunityAndEvents(args))
  );

  server.registerTool(
    'get_my_study_profile',
    {
      description: 'Read the currently signed-in student profile and education timeline.',
      inputSchema: {},
    },
    async () => toToolResponse(runGetMyStudyProfile(ctx.userId))
  );

  server.registerTool(
    'fact_store_add',
    {
      description: 'Save a learned student preference, goal, strength, growth area, or milestone to Hermes memory (consent-gated).',
      inputSchema: {
        factText: z.string().min(3).max(400),
        category: z
          .enum(['preference', 'goal', 'strength', 'growth_area', 'milestone', 'target_school', 'study_habit'])
          .optional(),
        entities: z.array(z.string()).optional(),
        keywords: z.array(z.string()).optional(),
        source: z.enum(['explicit_user', 'observed_pattern']).optional(),
      },
    },
    async (args) => toToolResponse(runFactStoreAdd(ctx.userId, args))
  );

  server.registerTool(
    'fact_store_search',
    {
      description: 'Search saved student preferences and growth facts (English & Khmer).',
      inputSchema: {
        query: z.string(),
        category: z
          .enum(['preference', 'goal', 'strength', 'growth_area', 'milestone', 'target_school', 'study_habit'])
          .optional(),
      },
    },
    async (args) => toToolResponse(runFactStoreSearch(ctx.userId, args))
  );

  server.registerTool(
    'fact_store_probe',
    {
      description: 'Look up all active student memory facts mentioning an entity like CADT, ITC, Bac II, or math.',
      inputSchema: { entity: z.string().min(1) },
    },
    async (args) => toToolResponse(runFactStoreProbe(ctx.userId, args))
  );

  server.registerTool(
    'fact_store_reason',
    {
      description: 'Find student memory facts linking multiple entities (e.g., ["user", "scholarship"]).',
      inputSchema: { entities: z.array(z.string()).min(1) },
    },
    async (args) => toToolResponse(runFactStoreReason(ctx.userId, args))
  );

  server.registerTool(
    'fact_store_feedback',
    {
      description: 'Confirm, correct, end, or revert an existing student memory fact.',
      inputSchema: {
        factId: z.string().min(1),
        action: z.enum(['confirm', 'correct', 'end', 'revert']),
        updatedText: z.string().optional(),
        note: z.string().optional(),
      },
    },
    async (args) => toToolResponse(runFactStoreFeedback(ctx.userId, args))
  );

  server.registerTool(
    'memory_doc_update',
    {
      description: 'Update or consolidate the student USER (max 3000 chars) or MEMORY (max 10000 chars) profile summary.',
      inputSchema: {
        docType: z.enum(['USER', 'MEMORY']),
        content: z.string(),
      },
    },
    async (args) => toToolResponse(runMemoryDocUpdate(ctx.userId, args))
  );
}

/** Creates an isolated, per-request embedded MCP Server + Client connected via InMemoryTransport. */
export async function createScopedMcpSession(ctx: ScopedMcpContext): Promise<ScopedMcpSession> {
  const mcpServer = new McpServer({
    name: 'cdes-student-instructor-mcp',
    version: '1.2.0',
  });
  registerAllTools(mcpServer, ctx);

  const client = new Client(
    { name: 'cdes-advisor-host', version: '1.2.0' },
    { capabilities: {} }
  );

  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await mcpServer.connect(serverTransport);
  await client.connect(clientTransport);

  return {
    async listTools(): Promise<McpToolDescriptor[]> {
      const res = await client.listTools();
      return (res.tools || []).map((t) => ({
        name: t.name,
        description: t.description || '',
        inputSchema: (t.inputSchema as Record<string, unknown>) || { type: 'object', properties: {} },
      }));
    },

    async callTool(name: string, args: Record<string, unknown>): Promise<McpToolExecutionResult> {
      const res = await client.callTool({ name, arguments: args });
      const contentArr = Array.isArray(res.content) ? res.content : [];
      const firstText = contentArr.find(
        (c): c is { type: 'text'; text: string } =>
          typeof c === 'object' && c !== null && 'type' in c && c.type === 'text' && 'text' in c
      );
      if (!firstText) {
        return { payload: { ok: true }, citations: [] };
      }
      try {
        const parsed = JSON.parse(firstText.text) as Partial<McpToolExecutionResult>;
        return {
          payload: parsed.payload !== undefined ? parsed.payload : parsed,
          citations: Array.isArray(parsed.citations) ? (parsed.citations as McpSourceCitation[]) : [],
        };
      } catch {
        return { payload: firstText.text, citations: [] };
      }
    },

    async close(): Promise<void> {
      await client.close().catch(() => undefined);
      await mcpServer.close().catch(() => undefined);
    },
  };
}
