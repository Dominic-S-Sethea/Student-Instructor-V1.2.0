import { getDatabase, getDbFilePath } from '../db/connection';
import { KnowledgeDocument, KnowledgeEmbedding, KnowledgeCategory, RetrievedKnowledgeChunk } from '../types/aiTypes';
import { embeddingService } from '../services/embeddingService';
import { safeJsonParse } from '../utils/safeJson';

type ParsedEmbedding = KnowledgeEmbedding & { parsedVector: number[] };

let cachedDbPath: string | null = null;
let cachedEmbeddings: ParsedEmbedding[] | null = null;

export class KnowledgeRepository {
  /**
   * Insert or update a knowledge document
   */
  public upsertDocument(doc: KnowledgeDocument): void {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO knowledge_documents (id, title, category, content, source, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        category = excluded.category,
        content = excluded.content,
        source = excluded.source
    `);
    stmt.run(doc.id, doc.title, doc.category, doc.content, doc.source || null, doc.created_at);
  }

  /**
   * Insert an embedding vector for a document
   */
  public upsertEmbedding(embedding: KnowledgeEmbedding): void {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO knowledge_embeddings (id, document_id, vector, metadata, created_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        vector = excluded.vector,
        metadata = excluded.metadata
    `);
    stmt.run(
      embedding.id,
      embedding.document_id,
      JSON.stringify(embedding.vector),
      JSON.stringify(embedding.metadata),
      embedding.created_at
    );
    cachedEmbeddings = null;
  }

  /**
   * Retrieve all knowledge documents, optionally filtered by category
   */
  public getAllDocuments(category?: KnowledgeCategory): KnowledgeDocument[] {
    const db = getDatabase();
    if (category) {
      const rows = db.prepare('SELECT * FROM knowledge_documents WHERE category = ? ORDER BY title ASC').all(category) as unknown as KnowledgeDocument[];
      return rows;
    }
    const rows = db.prepare('SELECT * FROM knowledge_documents ORDER BY category ASC, title ASC').all() as unknown as KnowledgeDocument[];
    return rows;
  }

  /**
   * Retrieve a single document by ID
   */
  public getDocumentById(id: string): KnowledgeDocument | null {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM knowledge_documents WHERE id = ?').get(id) as unknown as KnowledgeDocument | undefined;
    return row || null;
  }

  /**
   * Retrieve all embeddings with parsed vectors
   */
  public getAllEmbeddings(): ParsedEmbedding[] {
    const currentDbPath = getDbFilePath();
    if (cachedEmbeddings && cachedDbPath === currentDbPath) {
      return cachedEmbeddings;
    }

    const db = getDatabase();
    const rows = db.prepare(`
      SELECT id, document_id, vector, metadata, created_at
      FROM knowledge_embeddings
    `).all() as Array<{
      id: string;
      document_id: string;
      vector: string;
      metadata: string;
      created_at: string;
    }>;

    const parsed: ParsedEmbedding[] = rows.map((r) => {
      const parsedVector = safeJsonParse<number[]>(r.vector, []);
      const rawMeta = safeJsonParse<Partial<KnowledgeEmbedding['metadata']>>(r.metadata, {});
      const metadata: KnowledgeEmbedding['metadata'] = {
        ...rawMeta,
        title: typeof rawMeta.title === 'string' ? rawMeta.title : '',
        category: rawMeta.category ?? 'Education Science',
        source: rawMeta.source ?? null,
      };
      return {
        id: r.id,
        document_id: r.document_id,
        vector: parsedVector,
        parsedVector,
        metadata,
        created_at: r.created_at,
      };
    });
    cachedDbPath = currentDbPath;
    cachedEmbeddings = parsed;
    return parsed;
  }

  /**
   * Perform Semantic Vector Search against all knowledge documents
   */
  public semanticSearch(
    query: string,
    topK: number = 4,
    categoryFilter?: KnowledgeCategory
  ): RetrievedKnowledgeChunk[] {
    const queryVector = embeddingService.generateEmbedding(query);
    const allEmbeddings = this.getAllEmbeddings();

    if (allEmbeddings.length === 0) {
      return [];
    }

    const candidates = categoryFilter
      ? allEmbeddings.filter((e) => e.metadata.category === categoryFilter)
      : allEmbeddings;

    const scored = candidates.map((item) => ({
      item,
      similarity: embeddingService.cosineSimilarity(queryVector, item.parsedVector),
    }));

    scored.sort((a, b) => b.similarity - a.similarity);
    const topScored = scored.slice(0, topK);
    if (topScored.length === 0) return [];

    const db = getDatabase();
    const docIds = topScored.map((t) => t.item.document_id);
    const placeholders = docIds.map(() => '?').join(', ');
    const docs = db
      .prepare(`SELECT * FROM knowledge_documents WHERE id IN (${placeholders})`)
      .all(...docIds) as unknown as KnowledgeDocument[];
    const docMap = new Map(docs.map((d) => [d.id, d]));

    return topScored.map(({ item, similarity }) => {
      const doc = docMap.get(item.document_id);
      const snippet = doc ? (doc.content.length > 300 ? `${doc.content.slice(0, 300)}...` : doc.content) : '';
      return {
        documentId: item.document_id,
        title: item.metadata.title || doc?.title || 'Knowledge Reference',
        category: (item.metadata.category || doc?.category || 'Education Science') as KnowledgeCategory,
        snippet,
        source: item.metadata.source || doc?.source || null,
        similarityScore: Number(similarity.toFixed(4)),
      };
    });
  }
}

export const knowledgeRepository = new KnowledgeRepository();
