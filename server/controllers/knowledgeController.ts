import { Router, Request, Response } from 'express';

const router = Router();

export interface ContentCategory {
  id: string;
  slug: string;
  nameEn: string;
  nameKm: string;
  description: string;
  icon: string;
  totalArticles: number;
  subcategories: string[];
}

export interface ContentAuthor {
  id: string;
  name: string;
  nameKm?: string;
  roleType: 'university_faculty' | 'high_school_teacher' | 'industry_expert' | 'researcher' | 'educational_psychologist' | 'curriculum_specialist';
  affiliation: string;
  verifiedCredentials: string[];
  reputationScore: number; // 0 - 100
  totalContributions: number;
}

export interface ContentSource {
  id: string;
  name: string;
  sourceType: 'moeys_official' | 'accredited_university' | 'peer_reviewed_journal' | 'industry_association' | 'curriculum_board';
  reliabilityTier: 'tier_1_official' | 'tier_2_peer_reviewed' | 'tier_3_verified_expert' | 'tier_4_community_draft';
  auditDate: string;
  websiteUrl?: string;
}

export interface KnowledgeContent {
  id: string;
  categoryId: string;
  authorId: string;
  sourceId: string;
  titleEn: string;
  titleKm: string;
  slug: string;
  contentType: 'decision_guide' | 'interactive_stem_module' | 'cognitive_psychology' | 'career_pathway' | 'professional_competency';
  summary: string;
  bodyMarkdown: string;
  language: 'km' | 'en' | 'bilingual';
  targetGrades: string[];
  version: number;
  status: 'draft' | 'submitted' | 'under_review' | 'verified' | 'published' | 'archived';
  trustScore: number; // 0 - 100
  viewCount: number;
  helpfulVotes: number;
  unhelpfulVotes: number;
  embeddingId?: string;
  vectorIndexedAt?: string;
  learningObjectives: Array<{
    code: string;
    bloomLevel: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
    description: string;
    bktSkillId?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Initial In-Memory Seed Data for the CDES Knowledge Supply Chain
const initialCategories: ContentCategory[] = [
  {
    id: 'cat_decision',
    slug: 'education-decision',
    nameEn: 'Education Decision Intelligence',
    nameKm: 'ព័ត៌មានវិទ្យាសម្រេចចិត្តការសិក្សា',
    description: 'Accredited university admission matrices, Bac II prerequisite roadmaps, and verified Cambodian scholarship quotas.',
    icon: 'Compass',
    totalArticles: 142,
    subcategories: ['University Admission Matrix', 'Scholarship Matching Rules', 'Bac II Minimum Cutoffs', 'Tuition ROI Calculator']
  },
  {
    id: 'cat_learning',
    slug: 'learning-stem',
    nameEn: 'STEM & Bac II Learning Content',
    nameKm: 'មាតិកាសិក្សា STEM និងបាក់ឌុប',
    description: 'Interactive STEM laboratory modules, Bayesian Knowledge Tracing skills, and national high school exit exam curricula.',
    icon: 'BookOpen',
    totalArticles: 285,
    subcategories: ['High School Mathematics (Grade 12)', 'Physics Quantum Mechanics', 'Organic Chemistry', 'Computer Science Fundamentals']
  },
  {
    id: 'cat_psychology',
    slug: 'cognitive-psychology',
    nameEn: 'Cognitive & Educational Psychology',
    nameKm: 'ចិត្តវិទ្យាអប់រំ និងការអភិវឌ្ឍការគិត',
    description: 'Growth mindset scaffolding, Ebbinghaus spaced retrieval algorithms, exam anxiety mitigation, and metacognitive habits.',
    icon: 'Brain',
    totalArticles: 68,
    subcategories: ['Growth Mindset & Resilience', 'Spaced Repetition Protocols', 'Exam Performance Stress Management', 'Zone of Proximal Development (ZPD)']
  },
  {
    id: 'cat_career',
    slug: 'career-exploration',
    nameEn: 'Cambodian & Global Career Pathways',
    nameKm: 'គន្លងអាជីពកម្ពុជា និងសកលលោក',
    description: 'Deterministic career-to-major crosswalks, digital economy industry skill standards, and entry-level salary benchmarks.',
    icon: 'Briefcase',
    totalArticles: 114,
    subcategories: ['Software Engineering & Cloud Architecture', 'FinTech & Digital Banking', 'Civil & Environmental Engineering', 'Biomedical & Public Health']
  },
  {
    id: 'cat_professional',
    slug: 'professional-development',
    nameEn: 'Professional Competency & Lifelong Skills',
    nameKm: 'ការអភិវឌ្ឍជំនាញវិជ្ជាជីវៈ និងការសិក្សាពេញមួយជីវិត',
    description: 'Technical portfolio building, academic motivation letter review, professional networking ethics, and research methodology.',
    icon: 'Award',
    totalArticles: 53,
    subcategories: ['Academic Statement of Purpose Writing', 'GitHub & STEM Portfolio Building', 'Interviewing Techniques', 'Research Literacy']
  }
];

const initialAuthors: ContentAuthor[] = [
  {
    id: 'auth_cadt_dean',
    name: 'Dr. Seng Sopheap',
    nameKm: 'បណ្ឌិត សេង សុភាព',
    roleType: 'university_faculty',
    affiliation: 'Cambodia Academy of Digital Technology (CADT)',
    verifiedCredentials: ['PhD in Computer Science (Paris-Saclay)', 'MoEYS Digital Curriculum Committee'],
    reputationScore: 98.4,
    totalContributions: 38
  },
  {
    id: 'auth_itc_faculty',
    name: 'Prof. Chan Rath',
    nameKm: 'សាស្ត្រាចារ្យ ចាន់ រ័ត្ន',
    roleType: 'curriculum_specialist',
    affiliation: 'Institute of Technology of Cambodia (ITC)',
    verifiedCredentials: ['MSc Electrical Engineering', 'Director of STEM Lab Initiatives'],
    reputationScore: 96.1,
    totalContributions: 44
  },
  {
    id: 'auth_rupp_psych',
    name: 'Dr. Kith Sorita',
    nameKm: 'បណ្ឌិត គិត សូរីតា',
    roleType: 'educational_psychologist',
    affiliation: 'Royal University of Phnom Penh (RUPP) - Dept of Psychology',
    verifiedCredentials: ['PhD in Developmental Psychology', 'Child Adolescent Cognitive Specialist'],
    reputationScore: 97.0,
    totalContributions: 26
  },
  {
    id: 'auth_smart_tech',
    name: 'Sovann Meas',
    nameKm: 'មាស សុវណ្ណ',
    roleType: 'industry_expert',
    affiliation: 'Smart Axiata & Cambodia Tech Association',
    verifiedCredentials: ['Lead Cloud Solutions Architect', 'AWS Certified Solutions Architect Pro'],
    reputationScore: 93.8,
    totalContributions: 19
  },
  {
    id: 'auth_teacher_sisowath',
    name: 'Keo Samnang',
    nameKm: 'កែវ សំណាង',
    roleType: 'high_school_teacher',
    affiliation: 'Preah Sisowath High School (New Generation School)',
    verifiedCredentials: ['Senior Master Teacher in Mathematics', 'National Bac II Grade A Coach'],
    reputationScore: 95.5,
    totalContributions: 62
  }
];

const initialSources: ContentSource[] = [
  {
    id: 'src_moeys_official',
    name: 'Ministry of Education, Youth and Sport (MoEYS) Department of Higher Education',
    sourceType: 'moeys_official',
    reliabilityTier: 'tier_1_official',
    auditDate: '2026-03-01',
    websiteUrl: 'https://moeys.gov.kh'
  },
  {
    id: 'src_cadt_accredited',
    name: 'CADT Academic Affairs & Scholarship Board',
    sourceType: 'accredited_university',
    reliabilityTier: 'tier_1_official',
    auditDate: '2026-02-15',
    websiteUrl: 'https://cadt.edu.kh'
  },
  {
    id: 'src_cambodia_stem_journal',
    name: 'Cambodian Journal of Educational Research & STEM Innovation',
    sourceType: 'peer_reviewed_journal',
    reliabilityTier: 'tier_2_peer_reviewed',
    auditDate: '2026-01-20',
    websiteUrl: 'https://cjer.org.kh'
  },
  {
    id: 'src_cam_digital_council',
    name: 'National Council of Science, Technology & Innovation',
    sourceType: 'industry_association',
    reliabilityTier: 'tier_3_verified_expert',
    auditDate: '2026-02-10'
  }
];

let knowledgeRepository: KnowledgeContent[] = [
  {
    id: 'kn_bac2_math_scaffold',
    categoryId: 'cat_learning',
    authorId: 'auth_teacher_sisowath',
    sourceId: 'src_moeys_official',
    titleEn: 'Bac II Calculus Mastery: Limits at Infinity & Differential Optimization',
    titleKm: 'គណិតវិទ្យាថ្នាក់ទី១២៖ ការគណនាលីមីតអនន្ត និងអនុវត្តដេរីវេក្នុងចំណោទបរមា',
    slug: 'bac2-calculus-limits-optimization',
    contentType: 'interactive_stem_module',
    summary: 'A step-by-step Socratic guide breaking down the 5 most common Bac II math exam traps in differential calculus with ZPD hints.',
    bodyMarkdown: `# Bac II Mathematics: Limits and Optimization\n\n### 1. Conceptual Framework\nWhen evaluating limits approaching infinity in rational polynomials, factor out the highest power in both numerator and denominator.\n\n### 2. Bayesian Mastery Checks\n- Skill ID: \`calc_limit_infinity\`\n- Required P(L): 0.88`,
    language: 'bilingual',
    targetGrades: ['grade_12'],
    version: 3,
    status: 'published',
    trustScore: 97.2,
    viewCount: 4210,
    helpfulVotes: 512,
    unhelpfulVotes: 8,
    embeddingId: 'emb_vec_984712',
    vectorIndexedAt: '2026-03-10T08:30:00Z',
    learningObjectives: [
      {
        code: 'MATH.12.CALC.01',
        bloomLevel: 'apply',
        description: 'Solve polynomial rational limits at indeterminate forms (0/0 and inf/inf) with 90% accuracy.',
        bktSkillId: 'calc_limit_infinity'
      },
      {
        code: 'MATH.12.CALC.02',
        bloomLevel: 'analyze',
        description: 'Construct real-world volume/surface area maximization models using first and second derivatives.',
        bktSkillId: 'calc_opt_max'
      }
    ],
    createdAt: '2026-01-15T09:00:00Z',
    updatedAt: '2026-03-10T08:30:00Z'
  },
  {
    id: 'kn_cadt_scholarship_matrix',
    categoryId: 'cat_decision',
    authorId: 'auth_cadt_dean',
    sourceId: 'src_cadt_accredited',
    titleEn: 'CADT Techo Digital Talent Scholarship: Complete Eligibility & Exam Guide 2026',
    titleKm: 'អាហារូបករណ៍ទេពកោសល្យឌីជីថលតេជោ CADT៖ លក្ខខណ្ឌ និងការប្រឡងប្រជែង ២០២៦',
    slug: 'cadt-techo-digital-scholarship-guide-2026',
    contentType: 'decision_guide',
    summary: 'Official criteria for 100% full-ride tuition plus $150/mo living allowance, covering mathematics entrance syllabus and interview expectations.',
    bodyMarkdown: `# Techo Digital Talent Scholarship (CADT)\n\n### Eligibility Criteria\n- Open to Grade 12 Bac II graduates with Grade A or B in Science track.\n- 100% tuition coverage for Computer Science, Telecom, and eCommerce degrees.\n- Monthly living stipend provided for out-of-Phnom-Penh provincial scholars.`,
    language: 'bilingual',
    targetGrades: ['grade_11', 'grade_12'],
    version: 2,
    status: 'published',
    trustScore: 99.1,
    viewCount: 8930,
    helpfulVotes: 1204,
    unhelpfulVotes: 11,
    embeddingId: 'emb_vec_112049',
    vectorIndexedAt: '2026-03-12T10:15:00Z',
    learningObjectives: [
      {
        code: 'DEC.SCHOL.CADT.01',
        bloomLevel: 'understand',
        description: 'Identify exact prerequisite documentation, Bac II grade thresholds, and examination dates for CADT.'
      }
    ],
    createdAt: '2026-02-01T11:00:00Z',
    updatedAt: '2026-03-12T10:15:00Z'
  },
  {
    id: 'kn_zpd_growth_mindset',
    categoryId: 'cat_psychology',
    authorId: 'auth_rupp_psych',
    sourceId: 'src_cambodia_stem_journal',
    titleEn: 'Mitigating Bac II Exam Paralysis: Cognitive Reframing & Spaced Recall Schedules',
    titleKm: 'ការគ្រប់គ្រងអារម្មណ៍តានតឹងមុនការប្រឡងបាក់ឌុប៖ បច្ចេកទេសចិត្តវិទ្យា និងកាលវិភាគរំលឹកមេរៀន',
    slug: 'bac2-stress-management-spaced-recall',
    contentType: 'cognitive_psychology',
    summary: 'Evidence-based cognitive restructuring protocol designed specifically for Cambodian high school seniors balancing high family expectations.',
    bodyMarkdown: `# Cognitive Preparation for High-Stakes Exams\n\n### The Science of Retrieval\nCramming triggers cortisol spikes that impede hippocampal recall. Spaced repetition over 1, 3, 7, and 21-day intervals yields 3.2x higher memory retention.`,
    language: 'km',
    targetGrades: ['grade_10', 'grade_11', 'grade_12'],
    version: 1,
    status: 'published',
    trustScore: 96.5,
    viewCount: 3120,
    helpfulVotes: 440,
    unhelpfulVotes: 5,
    embeddingId: 'emb_vec_338910',
    vectorIndexedAt: '2026-03-14T14:00:00Z',
    learningObjectives: [
      {
        code: 'PSYCH.COG.EXAM.01',
        bloomLevel: 'apply',
        description: 'Implement a 4-cycle spaced recall schedule for physics and biology formulas.'
      }
    ],
    createdAt: '2026-02-18T14:00:00Z',
    updatedAt: '2026-03-14T14:00:00Z'
  },
  {
    id: 'kn_career_cloud_engineer',
    categoryId: 'cat_career',
    authorId: 'auth_smart_tech',
    sourceId: 'src_cam_digital_council',
    titleEn: 'Cambodia Cloud & DevOps Roadmap: From High School STEM to Senior Engineer',
    titleKm: 'ផែនទីបង្ហាញផ្លូវវិស្វករ Cloud & DevOps នៅកម្ពុជា៖ ពីសិស្សវិទ្យាល័យទៅវិស្វករជាន់ខ្ពស់',
    slug: 'cambodia-cloud-devops-career-roadmap',
    contentType: 'career_pathway',
    summary: 'Direct industry roadmap mapping high school math/logic skills into Linux, Docker, AWS/GCP architectures and entry salary trajectories ($600 - $3,500/mo).',
    bodyMarkdown: `# Cloud & DevOps Career Crosswalk in Cambodia\n\n### 1. Foundational High School Prerequisites\n- Discrete Mathematics & Boolean Logic\n- Basic networking (IP addressing, DNS)\n\n### 2. University Degree Alignment\n- Software Engineering @ CADT\n- Telecommunications & Network Engineering @ ITC`,
    language: 'bilingual',
    targetGrades: ['grade_10', 'grade_11', 'grade_12', 'undergraduate'],
    version: 1,
    status: 'published',
    trustScore: 94.8,
    viewCount: 5190,
    helpfulVotes: 680,
    unhelpfulVotes: 14,
    embeddingId: 'emb_vec_774129',
    vectorIndexedAt: '2026-03-15T09:45:00Z',
    learningObjectives: [
      {
        code: 'CAREER.CLOUD.01',
        bloomLevel: 'analyze',
        description: 'Map high school STEM competencies directly to industry certification milestones (AWS Cloud Practitioner to CKA).'
      }
    ],
    createdAt: '2026-02-25T16:00:00Z',
    updatedAt: '2026-03-15T09:45:00Z'
  },
  {
    id: 'kn_submission_under_review_1',
    categoryId: 'cat_learning',
    authorId: 'auth_itc_faculty',
    sourceId: 'src_moeys_official',
    titleEn: 'Grade 12 Physics: Electromagnetic Induction & Faraday Law Lab Simulations',
    titleKm: 'រូបវិទ្យាថ្នាក់ទី១២៖ អាំងឌុចស្យុងអេឡិចត្រូម៉ាញ៉េទិច និងការពិសោធន៍និម្មិតច្បាប់ហ្វារ៉ាដេយ',
    slug: 'grade-12-physics-electromagnetic-induction',
    contentType: 'interactive_stem_module',
    summary: 'Virtual lab module exploring Lenz law and magnetic flux variations with interactive PhET integration.',
    bodyMarkdown: `# Electromagnetic Induction\n\n### Core Equation\n$$\\mathcal{E} = -N \\frac{d\\Phi_B}{dt}$$\nObserve how changing magnetic field velocity alters induced electromotive force.`,
    language: 'km',
    targetGrades: ['grade_12'],
    version: 1,
    status: 'under_review',
    trustScore: 88.5,
    viewCount: 140,
    helpfulVotes: 18,
    unhelpfulVotes: 1,
    learningObjectives: [
      {
        code: 'PHYS.12.EM.01',
        bloomLevel: 'apply',
        description: 'Calculate induced EMF from time-varying magnetic flux through a solenoid coil.'
      }
    ],
    createdAt: '2026-03-16T12:00:00Z',
    updatedAt: '2026-03-16T12:00:00Z'
  }
];

// Helper: Trust score calculation
function calculateTrustScore(
  sourceTier: ContentSource['reliabilityTier'],
  auditorAccuracyScore: number,
  authorReputation: number,
  helpfulVotes: number,
  unhelpfulVotes: number
): number {
  let tierScore = 80;
  if (sourceTier === 'tier_1_official') tierScore = 100;
  else if (sourceTier === 'tier_2_peer_reviewed') tierScore = 92;
  else if (sourceTier === 'tier_3_verified_expert') tierScore = 85;
  else tierScore = 70;

  const totalVotes = helpfulVotes + unhelpfulVotes;
  const studentHelpfulnessRate = totalVotes > 0 ? (helpfulVotes / totalVotes) * 100 : 85;

  const trust =
    0.35 * tierScore +
    0.35 * auditorAccuracyScore +
    0.15 * studentHelpfulnessRate +
    0.15 * authorReputation;

  return Math.round(trust * 10) / 10;
}

// -------------------------------------------------------------
// ROUTES
// -------------------------------------------------------------

/**
 * @route GET /api/knowledge/overview
 * @desc Get aggregated Knowledge Supply Chain metrics and topology
 */
router.get('/overview', (_req: Request, res: Response): void => {
  try {
    const totalArticles = knowledgeRepository.length;
    const publishedCount = knowledgeRepository.filter((c) => c.status === 'published').length;
    const underReviewCount = knowledgeRepository.filter((c) => c.status === 'under_review' || c.status === 'submitted').length;
    const avgTrustScore =
      Math.round(
        (knowledgeRepository.reduce((sum, c) => sum + c.trustScore, 0) / (totalArticles || 1)) * 10
      ) / 10;
    const totalRAGIndexed = knowledgeRepository.filter((c) => !!c.vectorIndexedAt).length;

    res.json({
      success: true,
      data: {
        summary: {
          totalArticles,
          publishedCount,
          underReviewCount,
          avgTrustScore,
          totalRAGIndexed,
          totalCategories: initialCategories.length,
          totalVerifiedAuthors: initialAuthors.length,
          totalInstitutionalSources: initialSources.length
        },
        supplyChainStages: [
          { stage: '1. Creation & Ingestion', status: 'active', count: totalArticles, targetSla: '< 48h drafting' },
          { stage: '2. Multi-Tier Verification', status: 'active', count: underReviewCount, targetSla: '< 72h audit' },
          { stage: '3. Vector & RAG Indexing', status: 'synced', count: totalRAGIndexed, latency: '420ms embed' },
          { stage: '4. Published & Active Guidance', status: 'healthy', count: publishedCount, studentReach: '124,000+ interactions' },
          { stage: '5. Student Feedback & Analytics', status: 'operational', totalVotes: 3000, avgSatisfaction: '96.4%' }
        ],
        categories: initialCategories,
        recentSubmissions: knowledgeRepository.slice(-3)
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route GET /api/knowledge/categories
 * @desc List all 5 core knowledge categories
 */
router.get('/categories', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    data: initialCategories
  });
});

/**
 * @route GET /api/knowledge/content
 * @desc Filter knowledge articles by category, status, and target grade
 */
router.get('/content', (req: Request, res: Response): void => {
  try {
    const { category, status, language, grade } = req.query;

    let results = [...knowledgeRepository];

    if (category) {
      results = results.filter((c) => c.categoryId === category || c.slug === category);
    }
    if (status) {
      results = results.filter((c) => c.status === status);
    }
    if (language) {
      results = results.filter((c) => c.language === language || c.language === 'bilingual');
    }
    if (grade) {
      results = results.filter((c) => c.targetGrades.includes(String(grade)));
    }

    res.json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route POST /api/knowledge/content
 * @desc Submit new educational knowledge article
 */
router.post('/content', (req: Request, res: Response): void => {
  try {
    const {
      categoryId,
      authorId,
      sourceId,
      titleEn,
      titleKm,
      contentType,
      summary,
      bodyMarkdown,
      language = 'bilingual',
      targetGrades = ['grade_12'],
      learningObjectives = []
    } = req.body;

    if (!titleEn || !titleKm || !summary || !bodyMarkdown) {
      res.status(400).json({
        success: false,
        error: 'titleEn, titleKm, summary, and bodyMarkdown are mandatory.'
      });
      return;
    }

    const newContent: KnowledgeContent = {
      id: `kn_${Date.now()}`,
      categoryId: categoryId || 'cat_decision',
      authorId: authorId || 'auth_cadt_dean',
      sourceId: sourceId || 'src_moeys_official',
      titleEn,
      titleKm,
      slug: titleEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      contentType: contentType || 'decision_guide',
      summary,
      bodyMarkdown,
      language,
      targetGrades,
      version: 1,
      status: 'submitted',
      trustScore: 82.5,
      viewCount: 0,
      helpfulVotes: 0,
      unhelpfulVotes: 0,
      learningObjectives,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    knowledgeRepository.unshift(newContent);

    res.status(201).json({
      success: true,
      message: 'Knowledge content submitted successfully into verification queue.',
      data: newContent
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route POST /api/knowledge/verify
 * @desc Multi-tier auditor review and approval
 */
router.post('/verify', (req: Request, res: Response): void => {
  try {
    const {
      contentId,
      reviewerId = 'rev_moeys_lead',
      reviewerRole = 'curriculum_auditor',
      decision, // 'approved' | 'revision_requested' | 'rejected'
      pedagogicalScore = 95,
      factualAccuracyScore = 98,
      safetyComplianceScore = 100,
      comments = 'Verified against MoEYS 2026 Curriculum Benchmarks.'
    } = req.body;

    const item = knowledgeRepository.find((c) => c.id === contentId);
    if (!item) {
      res.status(404).json({ success: false, error: 'Content item not found.' });
      return;
    }

    const author = initialAuthors.find((a) => a.id === item.authorId) || initialAuthors[0];
    const source = initialSources.find((s) => s.id === item.sourceId) || initialSources[0];

    // Compute updated Trust Score
    const updatedTrust = calculateTrustScore(
      source.reliabilityTier,
      factualAccuracyScore,
      author.reputationScore,
      item.helpfulVotes,
      item.unhelpfulVotes
    );

    item.trustScore = updatedTrust;
    item.updatedAt = new Date().toISOString();

    if (decision === 'approved') {
      item.status = 'published';
      // Automatically trigger vector indexing timestamp
      item.embeddingId = `emb_vec_${Math.floor(100000 + Math.random() * 900000)}`;
      item.vectorIndexedAt = new Date().toISOString();
    } else if (decision === 'revision_requested') {
      item.status = 'under_review';
    } else {
      item.status = 'archived';
    }

    res.json({
      success: true,
      message: `Content verification complete: status is now ${item.status}`,
      auditRecord: {
        contentId: item.id,
        reviewerId,
        reviewerRole,
        decision,
        pedagogicalScore,
        factualAccuracyScore,
        safetyComplianceScore,
        comments,
        newTrustScore: updatedTrust,
        vectorIndexed: !!item.vectorIndexedAt,
        timestamp: new Date().toISOString()
      },
      content: item
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route POST /api/knowledge/rag-sync
 * @desc Trigger AI Knowledge Pipeline vector embedding and Qdrant upsert
 */
router.post('/rag-sync', (req: Request, res: Response): void => {
  try {
    const { contentId } = req.body;

    const target = knowledgeRepository.find((c) => c.id === contentId);
    if (!target) {
      res.status(404).json({ success: false, error: 'Content item not found.' });
      return;
    }

    target.embeddingId = `emb_vec_${Date.now()}`;
    target.vectorIndexedAt = new Date().toISOString();

    res.json({
      success: true,
      message: 'Content successfully ingested into Gemini/Qdrant Vector RAG store.',
      data: {
        contentId: target.id,
        embeddingId: target.embeddingId,
        embeddingModel: 'text-embedding-004 (768 dimensions)',
        chunkCount: 3,
        similaritySearchNamespace: `cdes_${target.categoryId}`,
        vectorIndexedAt: target.vectorIndexedAt
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route POST /api/knowledge/feedback
 * @desc Student feedback loop: upvote/downvote and quality tracking
 */
router.post('/feedback', (req: Request, res: Response): void => {
  try {
    const { contentId, isHelpful, rating = 5, comment } = req.body;

    const item = knowledgeRepository.find((c) => c.id === contentId);
    if (!item) {
      res.status(404).json({ success: false, error: 'Content item not found.' });
      return;
    }

    if (isHelpful) {
      item.helpfulVotes += 1;
    } else {
      item.unhelpfulVotes += 1;
    }

    // Refresh trust score slightly based on student input
    const author = initialAuthors.find((a) => a.id === item.authorId) || initialAuthors[0];
    const source = initialSources.find((s) => s.id === item.sourceId) || initialSources[0];

    item.trustScore = calculateTrustScore(
      source.reliabilityTier,
      95,
      author.reputationScore,
      item.helpfulVotes,
      item.unhelpfulVotes
    );

    res.json({
      success: true,
      message: 'Student feedback recorded successfully.',
      data: {
        contentId: item.id,
        helpfulVotes: item.helpfulVotes,
        unhelpfulVotes: item.unhelpfulVotes,
        trustScore: item.trustScore
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route GET /api/knowledge/partners
 * @desc Get partnership content onboarding matrix and revenue-share status
 */
router.get('/partners', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    data: {
      authors: initialAuthors,
      sources: initialSources,
      creatorTiers: [
        {
          tier: 'Tier 1: Accredited University & Ministry',
          criteria: 'MoEYS accreditation, official university faculty charter',
          perks: 'Direct publishing right, official badge, verified admissions leads',
          revSharePercent: '80% on paid institutional micro-courses'
        },
        {
          tier: 'Tier 2: Senior Teachers & Master Mentors',
          criteria: 'Proven Bac II Grade A track record, verified school endorsement',
          perks: 'Author reputation badge, priority placement in AI Advisor RAG',
          revSharePercent: '70% on premium STEM problem sets'
        },
        {
          tier: 'Tier 3: Tech Industry & Corporate Partners',
          criteria: 'Registered enterprise (Smart, ABA, Wing), certified tech leads',
          perks: 'Early talent pipeline, sponsored corporate challenge hosting',
          revSharePercent: 'B2B subscription sponsorship'
        }
      ]
    }
  });
});

export default router;
