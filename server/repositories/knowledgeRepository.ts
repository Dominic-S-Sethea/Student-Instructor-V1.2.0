import { getDatabase } from '../db/connection';
import { KnowledgeDocument, KnowledgeEmbedding, KnowledgeCategory, RetrievedKnowledgeChunk } from '../types/aiTypes';
import { embeddingService } from '../services/embeddingService';

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
  public getAllEmbeddings(): Array<KnowledgeEmbedding & { parsedVector: number[] }> {
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

    return rows.map(r => {
      let parsedVector: number[] = [];
      let parsedMeta: any = {};
      try {
        parsedVector = JSON.parse(r.vector);
      } catch {
        parsedVector = [];
      }
      try {
        parsedMeta = JSON.parse(r.metadata);
      } catch {
        parsedMeta = {};
      }
      return {
        id: r.id,
        document_id: r.document_id,
        vector: parsedVector,
        parsedVector,
        metadata: parsedMeta,
        created_at: r.created_at
      };
    });
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

    // Filter by category if requested
    const candidates = categoryFilter
      ? allEmbeddings.filter(e => e.metadata.category === categoryFilter)
      : allEmbeddings;

    const scored = candidates.map(item => ({
      item,
      vector: item.parsedVector,
      similarity: embeddingService.cosineSimilarity(queryVector, item.parsedVector)
    }));

    scored.sort((a, b) => b.similarity - a.similarity);
    const topScored = scored.slice(0, topK);

    // Retrieve document content for top matches
    return topScored.map(({ item, similarity }) => {
      const doc = this.getDocumentById(item.document_id);
      const snippet = doc ? (doc.content.length > 300 ? doc.content.slice(0, 300) + '...' : doc.content) : '';
      return {
        documentId: item.document_id,
        title: item.metadata.title || doc?.title || 'Knowledge Reference',
        category: (item.metadata.category || doc?.category || 'Education Science') as KnowledgeCategory,
        snippet,
        source: item.metadata.source || doc?.source || null,
        similarityScore: Number(similarity.toFixed(4))
      };
    });
  }
}

export const knowledgeRepository = new KnowledgeRepository();
