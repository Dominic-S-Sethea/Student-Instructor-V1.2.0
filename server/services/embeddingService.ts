/**
 * CDES Vector Search & Embedding Pipeline
 * Provides robust 128-dimensional semantic dense vector generation,
 * L2 normalization, and vector cosine similarity search.
 */

export class EmbeddingService {
  private readonly vectorDim = 128;

  // Domain terms dictionary for high-signal education & career semantics
  private readonly domainVocab: string[] = [
    // Education Science
    'cognition', 'cognitive', 'load', 'memory', 'retention', 'scaffolding', 'retrieval',
    'pedagogy', 'formative', 'assessment', 'metacognition', 'curriculum', 'stem', 'mastery',
    'spaced', 'repetition', 'inquiry', 'zone', 'proximal', 'development',
    // Psychology
    'mindset', 'growth', 'fixed', 'intrinsic', 'extrinsic', 'motivation', 'resilience',
    'perseverance', 'grit', 'self-determination', 'autonomy', 'competence', 'agency',
    'reflection', 'anxiety', 'perfectionism', 'engagement', 'curiosity',
    // Career Intelligence
    'career', 'engineering', 'software', 'developer', 'artificial', 'intelligence', 'robotics',
    'automation', 'cybersecurity', 'data', 'cloud', 'telecom', 'asean', 'cambodia', 'phnom',
    'penh', 'market', 'demand', 'salary', 'industry', 'digital', 'economy', 'startup',
    // University Knowledge
    'university', 'institution', 'faculty', 'major', 'degree', 'bachelor', 'tronc', 'commun',
    'itc', 'cadt', 'rupp', 'aupp', 'paragon', 'uhs', 'entrance', 'exam', 'bac', 'accreditation',
    'foundation', 'polytechnic', 'engineering', 'science', 'mathematics',
    // Scholarship Knowledge
    'scholarship', 'funding', 'tuition', 'stipend', 'allowance', 'mptc', 'chevening', 'australia',
    'awards', 'mext', 'daad', 'eligibility', 'gpa', 'ielts', 'toefl', 'merit', 'financial',
    'deadline', 'application', 'waiver', 'fully', 'funded',
    // Teaching Methodology
    'teaching', 'socratic', 'simulation', 'virtual', 'lab', 'experiment', 'hypothesis',
    'diagnostic', 'hands-on', 'feedback', 'scaffold', 'interactive', 'problem-solving',
    // Child Development & Safety
    'adolescent', 'identity', 'exploration', 'minor', 'safety', 'guidance', 'counselor',
    'wellbeing', 'parental', 'consent', 'ethics', 'growth', 'non-coercive', 'options'
  ];

  /**
   * Generates a normalized 128-dimensional dense vector for any text chunk.
   */
  public generateEmbedding(text: string): number[] {
    const vector = new Array<number>(this.vectorDim).fill(0);
    const cleaned = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
    const tokens = cleaned.split(/\s+/).filter(t => t.length > 1);

    if (tokens.length === 0) {
      return vector;
    }

    // 1. Domain vocabulary weighting
    this.domainVocab.forEach((term, idx) => {
      const dimIndex = idx % this.vectorDim;
      let count = 0;
      for (const token of tokens) {
        if (token === term || (token.length > 4 && term.startsWith(token)) || (term.length > 4 && token.startsWith(term))) {
          count++;
        }
      }
      if (count > 0) {
        vector[dimIndex] += Math.log(1 + count) * 2.5;
      }
    });

    // 2. Character 3-gram & token hashing into remaining dimensions
    tokens.forEach((token, tIdx) => {
      // Word hash
      let hash = 5381;
      for (let i = 0; i < token.length; i++) {
        hash = ((hash << 5) + hash) + token.charCodeAt(i);
      }
      const primaryDim = Math.abs(hash) % this.vectorDim;
      const positionalWeight = 1.0 / (1.0 + Math.log10(1 + tIdx * 0.1));
      vector[primaryDim] += positionalWeight;

      // N-gram sub-tokens
      if (token.length >= 3) {
        for (let i = 0; i <= token.length - 3; i++) {
          const gram = token.slice(i, i + 3);
          let gHash = 17;
          for (let j = 0; j < 3; j++) {
            gHash = ((gHash << 3) + gHash) + gram.charCodeAt(j);
          }
          const gramDim = Math.abs(gHash) % this.vectorDim;
          vector[gramDim] += 0.35;
        }
      }
    });

    // 3. L2 Normalization so Euclidean length = 1
    let sumSq = 0;
    for (let i = 0; i < this.vectorDim; i++) {
      sumSq += vector[i] * vector[i];
    }
    const magnitude = Math.sqrt(sumSq);
    if (magnitude > 0) {
      for (let i = 0; i < this.vectorDim; i++) {
        vector[i] = Number((vector[i] / magnitude).toFixed(6));
      }
    }

    return vector;
  }

  /**
   * Computes Cosine Similarity between two dense normalized vectors in range [0, 1]
   */
  public cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
    const len = Math.min(vecA.length, vecB.length);
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < len; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    if (denom === 0) return 0;
    const similarity = dotProduct / denom;
    // Bound strictly to [0, 1]
    return Math.max(0, Math.min(1, similarity));
  }

  /**
   * Ranks an array of items by cosine similarity against a query vector
   */
  public rankBySimilarity<T extends { vector: number[] }>(
    queryVector: number[],
    candidates: T[],
    topK: number = 5
  ): Array<T & { similarity: number }> {
    const scored = candidates.map(item => ({
      ...item,
      similarity: this.cosineSimilarity(queryVector, item.vector)
    }));

    scored.sort((a, b) => b.similarity - a.similarity);
    return scored.slice(0, topK);
  }
}

export const embeddingService = new EmbeddingService();
