import crypto from 'node:crypto';
import { Router, Request, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware';
import { PrivacyService } from '../services/privacyService';
import { aiSafetyService } from '../services/aiSafetyService';
import { AnalyticsRepository } from '../repositories/analyticsRepository';
import { validate } from '../middleware/validationMiddleware';
import { DigitalWorldChatSchema } from '../validators/apiSchemas';
import { safeErrorMessage } from '../utils/httpErrors';

const router = Router();
const privacyService = new PrivacyService();
const analyticsRepo = new AnalyticsRepository();

// ==========================================================
// CDES DIGITAL CAMPUS WORLD - REPOSITORIES & TYPES
// ==========================================================

export interface DigitalZone {
  id: string;
  zoneKey: 'student_home' | 'campus_plaza' | 'grand_library' | 'stem_laboratory' | 'career_center' | 'innovation_workshop' | 'community_commons';
  nameEn: string;
  nameKm: string;
  tagline: string;
  description: string;
  pedagogicalFocus: string;
  visualTheme: {
    skyColor: string;
    ambientLight: string;
    accentColor: string;
    architecturalStyle: string;
  };
  keyNPC: {
    name: string;
    role: string;
    avatarUrl: string;
    greetingEn: string;
    greetingKm: string;
  };
  interactiveHotspots: Array<{
    id: string;
    labelEn: string;
    labelKm: string;
    type: 'simulation_terminal' | 'socratic_study_desk' | 'achievement_wall' | 'career_hologram' | 'community_circle' | 'telescope';
    action: string;
  }>;
  activeLearnersCount: number;
}

export interface EducationalGameDef {
  id: string;
  gameKey: 'animal_racing_physics' | 'angkor_adventure_hydraulics' | 'phnom_penh_smart_city' | 'quantum_stem_lab';
  titleEn: string;
  titleKm: string;
  subtitle: string;
  genre: string;
  learningObjective: string;
  stemCompetencies: string[];
  mechanicsDescription: string;
  inspiration: string;
  difficultyRating: string;
  estimatedSessionMin: number;
  currentHighLevelMetrics: {
    totalSessionsCompleted: number;
    avgMasteryLiftPercent: number;
    topConceptMastered: string;
  };
}

export interface AICompanionMithState {
  name: string;
  khmerName: string;
  title: string;
  archetype: 'socratic_mentor' | 'supportive_peer' | 'curious_explorer' | 'strict_evaluator';
  affinityLevel: number;
  affinityXp: number;
  currentMood: 'attentive' | 'proud' | 'curious' | 'motivational' | 'deep_thought';
  dialogueHistory: Array<{
    id: string;
    speaker: 'mith' | 'student';
    text: string;
    timestamp: string;
    emotionalTone?: string;
  }>;
  activeGuidanceAdvice: {
    headlineEn: string;
    headlineKm: string;
    rationale: string;
    recommendedZone: string;
    recommendedGameOrModule: string;
    meritBonus: number;
  };
}

// In-Memory Digital World State
const DIGITAL_ZONES: DigitalZone[] = [
  {
    id: 'zone-home',
    zoneKey: 'student_home',
    nameEn: 'Student Home Sanctuary',
    nameKm: 'ជម្រកសិក្សាផ្ទាល់ខ្លួន',
    tagline: 'Private reflection, customizable study desk, and achievement gallery',
    description: 'A serene personal sanctuary overlooking Phnom Penh skyline or Mekong sunrise. Customized with academic trophies, research manuscripts, and focused ambient lighting.',
    pedagogicalFocus: 'Metacognitive reflection, daily learning habits, and emotional self-regulation.',
    visualTheme: {
      skyColor: '#1e1b4b',
      ambientLight: '#fef3c7',
      accentColor: '#3b82f6',
      architecturalStyle: 'Warm Minimalist Khmer Modernism with Teak Wood & Natural Sunlight',
    },
    keyNPC: {
      name: 'Mith (មិត្ត)',
      role: 'Socratic Education Companion',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      greetingEn: 'Welcome back to your sanctuary! Ready to calibrate today’s learning trajectory?',
      greetingKm: 'សូមស្វាគមន៍មកកាន់បន្ទប់សិក្សាផ្ទាល់ខ្លួន! តើយើងត្រៀមខ្លួនសម្រាប់គោលដៅថ្ងៃនេះហើយឬនៅ?',
    },
    interactiveHotspots: [
      { id: 'spot-h1', labelEn: 'Study Workstation', labelKm: 'តុសិក្សាស៊ីជម្រៅ', type: 'socratic_study_desk', action: 'launch_focus_session' },
      { id: 'spot-h2', labelEn: 'National Merit Wall', labelKm: 'ជញ្ជាំងកិត្តិយសជាតិ', type: 'achievement_wall', action: 'view_trophies' },
      { id: 'spot-h3', labelEn: 'Companion Pod', labelKm: 'កន្លែងពិគ្រោះជាមួយមិត្ត', type: 'community_circle', action: 'talk_to_mith' },
    ],
    activeLearnersCount: 4210,
  },
  {
    id: 'zone-plaza',
    zoneKey: 'campus_plaza',
    nameEn: 'Central Campus Plaza',
    nameKm: 'ទីលានកណ្តាលសាកលវិទ្យាល័យឌីជីថល',
    tagline: 'The vibrant crossroads of Cambodian student intellectual life',
    description: 'A grand public square featuring a glowing Knowledge Sundial, university bulletin displays, student guild kiosks, and daily quest boards.',
    pedagogicalFocus: 'Social learning, civic engagement, peer study discovery, and communal motivation.',
    visualTheme: {
      skyColor: '#0284c7',
      ambientLight: '#ffffff',
      accentColor: '#0ea5e9',
      architecturalStyle: 'Open-air Agora with Angkorian stone archways and digital holographic banners',
    },
    keyNPC: {
      name: 'Professor Sokha',
      role: 'Dean of Student Affairs',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      greetingEn: 'Today’s national STEM hackathon is gathering near the bell tower!',
      greetingKm: 'ការប្រកួតប្រជែង STEM ថ្នាក់ជាតិថ្ងៃនេះកំពុងប្រមូលផ្តុំនៅក្បែរប៉មកណ្តាល!',
    },
    interactiveHotspots: [
      { id: 'spot-p1', labelEn: 'National Scholarship Bulletin', labelKm: 'ក្តារព័ត៌មានអាហារូបករណ៍', type: 'career_hologram', action: 'open_scholarships' },
      { id: 'spot-p2', labelEn: 'Knowledge Sundial', labelKm: 'នាឡិកាពន្លឺពុទ្ធិ', type: 'community_circle', action: 'view_active_streaks' },
      { id: 'spot-p3', labelEn: 'Study Guild Hub', labelKm: 'មណ្ឌលក្រុមសិក្សា', type: 'community_circle', action: 'join_peer_circle' },
    ],
    activeLearnersCount: 8940,
  },
  {
    id: 'zone-library',
    zoneKey: 'grand_library',
    nameEn: 'Grand Digital Library',
    nameKm: 'បណ្ណាល័យឌីជីថលដ៏មហិមា',
    tagline: 'Infinite archives of verified curricula, research papers, and Bac II archives',
    description: 'Towering multi-story bookstacks infused with fiber-optic illumination. Whisper-quiet reading pavilions with AI-driven cross-referencing.',
    pedagogicalFocus: 'Deep reading comprehension, academic literacy, research methodology, and historical inquiry.',
    visualTheme: {
      skyColor: '#064e3b',
      ambientLight: '#fef08a',
      accentColor: '#10b981',
      architecturalStyle: 'Neo-Classical Library with Sandstone Bas-Reliefs and Cybernetic Stacks',
    },
    keyNPC: {
      name: 'Archivist Kolab',
      role: 'Chief Curator of Cambodian Knowledge',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      greetingEn: 'Every question you ask here bridges centuries of Cambodian scholarship.',
      greetingKm: 'រាល់សំណួរដែលប្អូនស្រាវជ្រាវនៅទីនេះ ផ្សារភ្ជាប់ចំណេះដឹងជាច្រើនជំនាន់នៃប្រទេសយើង។',
    },
    interactiveHotspots: [
      { id: 'spot-l1', labelEn: 'RAG Knowledge Terminal', labelKm: 'ស្ថានីយចំណេះដឹងឆ្លាតវៃ', type: 'simulation_terminal', action: 'open_rag_search' },
      { id: 'spot-l2', labelEn: 'Bac II Past Exam Vault', labelKm: 'ឃ្លាំងវិញ្ញាសាប្រឡងបាក់ឌុប', type: 'socratic_study_desk', action: 'open_exam_vault' },
      { id: 'spot-l3', labelEn: 'Silent Socratic Pod', labelKm: 'បន្ទប់សមាធិបញ្ញា', type: 'socratic_study_desk', action: 'enter_deep_study' },
    ],
    activeLearnersCount: 6510,
  },
  {
    id: 'zone-stem-lab',
    zoneKey: 'stem_laboratory',
    nameEn: 'Advanced STEM Laboratory',
    nameKm: 'មន្ទីរពិសោធន៍ STEM ទំនើបកម្រិតខ្ពស់',
    tagline: 'Hands-on virtual physics, molecular chemistry, and robotics testbeds',
    description: 'State-of-the-art interactive cleanrooms where students manipulate particle accelerators, synthetic gene sequencers, and electrical circuits without safety hazards.',
    pedagogicalFocus: 'Empirical scientific inquiry, hypothesis testing, physics kinematics, and mathematical verification.',
    visualTheme: {
      skyColor: '#311042',
      ambientLight: '#e0e7ff',
      accentColor: '#8b5cf6',
      architecturalStyle: 'Futuristic High-Tech Cleanroom with Holographic Reaction Chambers',
    },
    keyNPC: {
      name: 'Dr. Vicheth',
      role: 'Lead STEM Physics Researcher',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      greetingEn: 'Remember: In physics, an unexpected measurement is an invitation to discovery.',
      greetingKm: 'ចូរចាំថា៖ ក្នុងរូបវិទ្យា លទ្ធផលដែលមិននឹកស្មានដល់គឺជាការចាប់ផ្តើមនៃការរកឃើញថ្មី។',
    },
    interactiveHotspots: [
      { id: 'spot-s1', labelEn: 'Circuit & Quantum Workbench', labelKm: 'តុពិសោធន៍សៀគ្វីអគ្គិសនី', type: 'simulation_terminal', action: 'launch_circuit_lab' },
      { id: 'spot-s2', labelEn: 'Molecular Chemistry Chamber', labelKm: 'បន្ទប់ពិសោធន៍គីមីម៉ូលេគុល', type: 'simulation_terminal', action: 'launch_chem_lab' },
      { id: 'spot-s3', labelEn: 'Kinematics Track', labelKm: 'ផ្លូវពិសោធន៍ចលនារូបវិទ្យា', type: 'simulation_terminal', action: 'launch_physics_track' },
    ],
    activeLearnersCount: 5120,
  },
  {
    id: 'zone-career',
    zoneKey: 'career_center',
    nameEn: 'Future Career Center',
    nameKm: 'មជ្ឈមណ្ឌលអនាគតការងារ និងអាជីព',
    tagline: 'Holographic industry pavilions, salary forecasts, and mentor consultations',
    description: 'Glass-walled corporate pavilions representing Cambodia’s fastest-growing sectors: FinTech, Artificial Intelligence, Renewable Energy, and Biotechnology.',
    pedagogicalFocus: 'Career literacy, labor market ROI mapping, interview readiness, and professional networking.',
    visualTheme: {
      skyColor: '#1e293b',
      ambientLight: '#f1f5f9',
      accentColor: '#059669',
      architecturalStyle: 'Skyline Glass Atrium with Real-Time Industry Hologram Displays',
    },
    keyNPC: {
      name: 'Counselor Chanlina',
      role: 'Executive Director of Career Navigation',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
      greetingEn: 'Let’s map your math and coding mastery into entry-level software engineering benchmarks!',
      greetingKm: 'តោះយើងផ្គូផ្គងជំនាញគណិត និងកូដរបស់ប្អូន ទៅកាន់កម្រិតប្រាក់បៀវត្សរ៍វិស្វករសូហ្វវែរ!',
    },
    interactiveHotspots: [
      { id: 'spot-c1', labelEn: 'Industry Hologram Pavilion', labelKm: 'ពន្លាឧស្សាហកម្មបច្ចេកវិទ្យា', type: 'career_hologram', action: 'explore_industry_sectors' },
      { id: 'spot-c2', labelEn: 'Salary & ROI Simulation Terminal', labelKm: 'ស្ថានីយគណនាប្រាក់បៀវត្សរ៍', type: 'simulation_terminal', action: 'launch_roi_calculator' },
      { id: 'spot-c3', labelEn: 'Mock Interview Pod', labelKm: 'បន្ទប់ហាត់សម្ភាសន៍ការងារ', type: 'socratic_study_desk', action: 'start_mock_interview' },
    ],
    activeLearnersCount: 4380,
  },
  {
    id: 'zone-innovation',
    zoneKey: 'innovation_workshop',
    nameEn: 'Innovation Workshop & Makerspace',
    nameKm: 'រោងជាងនវានុវត្តន៍ និងបង្កើតថ្មី',
    tagline: '3D printers, code compilers, and digital startup incubation labs',
    description: 'An energetic open makerspace filled with workbenches, Arduino microcontrollers, WebGL code canvases, and collaborative prototyping whiteboards.',
    pedagogicalFocus: 'Constructivist learning, engineering design cycle, agile software prototyping, and venture creation.',
    visualTheme: {
      skyColor: '#451a03',
      ambientLight: '#fed7aa',
      accentColor: '#ea580c',
      architecturalStyle: 'Industrial Loft with Exposed Steel Trusses and Active Prototyping Workbenches',
    },
    keyNPC: {
      name: 'Mentor Dara',
      role: 'Chief Makerspace Engineer',
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
      greetingEn: 'Ideas are cheap in the digital age. Execution, debugging, and resilience build the nation.',
      greetingKm: 'គំនិតគឺមានច្រើន ប៉ុន្តែការអនុវត្ត ការកែកូដ និងការតស៊ូទើបកសាងអនាគតប្រទេសបាន។',
    },
    interactiveHotspots: [
      { id: 'spot-w1', labelEn: 'Rapid 3D Prototype Workbench', labelKm: 'តុបោះពុម្ព 3D បែបគំរូ', type: 'simulation_terminal', action: 'launch_3d_maker' },
      { id: 'spot-w2', labelEn: 'Compiler & Scripting Hub', labelKm: 'ស្ថានីយសរសេរកូដ និងតេស្ត', type: 'simulation_terminal', action: 'launch_code_sandbox' },
      { id: 'spot-w3', labelEn: 'Startup Pitch Stage', labelKm: 'វេទិកាធ្វើបទបង្ហាញគម្រោង', type: 'community_circle', action: 'view_startup_pitches' },
    ],
    activeLearnersCount: 3890,
  },
  {
    id: 'zone-community',
    zoneKey: 'community_commons',
    nameEn: 'Community Commons & Amphitheater',
    nameKm: 'ទីលានសហគមន៍ និងរោងមហោស្រពបើកចំហ',
    tagline: 'Biodiverse botanical gardens, study circles, and acoustic evening symposiums',
    description: 'Lush tropical Khmer gardens featuring lotus ponds and an acoustic sandstone amphitheater. The heart of student wellbeing, peer dialogue, and cultural events.',
    pedagogicalFocus: 'Social-emotional learning (SEL), peer mentorship, collaborative debate, and stress reduction.',
    visualTheme: {
      skyColor: '#042f2e',
      ambientLight: '#ccfbf1',
      accentColor: '#14b8a6',
      architecturalStyle: 'Lush Tropical Botanical Landscape with Stone Stepped Amphitheater',
    },
    keyNPC: {
      name: 'Vannak',
      role: 'Student Community Leader',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      greetingEn: 'Sit by the lotus pond. Sometimes the best way to solve a tough math problem is to take a breath.',
      greetingKm: 'អង្គុយសម្រាកក្បែរស្រះឈូកសិនមកប្អូន! ពេលខ្លះការដកដង្ហើមវែងៗជួយឱ្យយើងដោះស្រាយលំហាត់ពិបាកបាន។',
    },
    interactiveHotspots: [
      { id: 'spot-o1', labelEn: 'Lotus Pond Reflection Bench', labelKm: 'បង់អង្គុយសម្រាកក្បែរស្រះឈូក', type: 'community_circle', action: 'start_mindfulness_break' },
      { id: 'spot-o2', labelEn: 'Open Amphitheater Stage', labelKm: 'វេទិកាចែករំលែកមតិសិស្ស', type: 'community_circle', action: 'join_live_debate' },
      { id: 'spot-o3', labelEn: 'Peer Tutoring Circle', labelKm: 'រង្វង់បង្រៀនគ្នាទៅវិញទៅមក', type: 'community_circle', action: 'open_peer_tutors' },
    ],
    activeLearnersCount: 6150,
  },
];

const EDUCATIONAL_GAMES: EducationalGameDef[] = [
  {
    id: 'game-animal-racing',
    gameKey: 'animal_racing_physics',
    titleEn: 'Animal Racing: Kinematics & Genetics',
    titleKm: 'ការប្រណាំងសត្វ៖ ចលនារូបវិទ្យា និងពន្ធុវិទ្យា',
    subtitle: 'Inspired by Palworld & Chocobo Racing, grounded in Grade 11-12 STEM physics',
    genre: 'Kinematic Simulation & Optimization Strategy',
    learningObjective: 'Master parametric trajectory equations, Newton’s second law (F=ma), drag coefficient minimization, and genetic trait inheritance.',
    stemCompetencies: [
      'MoEYS Physics 11: Uniformly Accelerated Motion',
      'Calculus: Local Maxima & Friction Limits',
      'Biology: Punnett Squares & Polygenic Inheritance',
      'Algorithmic Optimization'
    ],
    mechanicsDescription: 'Students raise digital cyber-fauna (Kouprey, Giant Ibis, Mekong Dolphin). To win competitive races, students calculate launch angles, stamina decay curves, and aerodynamic drift vectors using actual physics equations rather than twitch button-mashing.',
    inspiration: 'Palworld creature breeding meets Kerbal Space Program mechanics.',
    difficultyRating: 'Intermediate (Grade 10–12)',
    estimatedSessionMin: 15,
    currentHighLevelMetrics: {
      totalSessionsCompleted: 24890,
      avgMasteryLiftPercent: 28.4,
      topConceptMastered: 'Drag force integration over time & projectile apex',
    },
  },
  {
    id: 'game-angkor-adventure',
    gameKey: 'angkor_adventure_hydraulics',
    titleEn: 'Angkor Adventure: Ancient Hydraulic Engineering',
    titleKm: 'ដំណើរផ្សងព្រេងអង្គរ៖ វិស្វកម្មធារាសាស្ត្រសម័យបុរាណ',
    subtitle: 'Historical archaeology meets fluid mechanics and civil engineering',
    genre: 'Narrative Mystery & Environmental Engineering',
    learningObjective: 'Understand hydrostatic pressure, Bernoulli’s principle, topographic gravity flow, and climate resilience in ancient civil engineering.',
    stemCompetencies: [
      'Fluid Mechanics: Bernoulli’s Principle & Flow Rate (Q=Av)',
      'Civil Engineering: Gradient Slope Calculations & Sedimentation',
      'Cambodian History & Heritage Architecture',
      'Environmental Systems & Monsoon Water Reservoir Management'
    ],
    mechanicsDescription: 'Students role-play as a Royal Engineer in 12th-century Angkor. They must restore the vast East and West Baray reservoirs to prevent catastrophic drought and flood, calculating water volumetric displacement and canal elevation slopes.',
    inspiration: 'The Witness puzzle rigor meets Assassin’s Creed historical immersion.',
    difficultyRating: 'Advanced (Grade 11–12 + Foundation Year)',
    estimatedSessionMin: 20,
    currentHighLevelMetrics: {
      totalSessionsCompleted: 18450,
      avgMasteryLiftPercent: 34.2,
      topConceptMastered: 'Hydrostatic pressure gradients & Baray flow balancing',
    },
  },
  {
    id: 'game-smart-city',
    gameKey: 'phnom_penh_smart_city',
    titleEn: 'Phnom Penh 2035: Smart City Simulation',
    titleKm: 'ភ្នំពេញ ២០៣៥៖ ការគ្រប់គ្រងទីក្រុងវៃឆ្លាត',
    subtitle: 'Inspired by SimCity & Cities: Skylines with localized socioeconomic modeling',
    genre: 'Systems Dynamics, Municipal Economics & Urban Planning',
    learningObjective: 'Apply multi-variable systems thinking: balancing clean solar/hydro grids, traffic congestion queues, education funding, and GDP growth.',
    stemCompetencies: [
      'Microeconomics: Elasticity of Demand & Tax Allocation',
      'Systems Engineering: Closed-loop Feedback & Latency',
      'Environmental Science: Carbon Accounting & Renewable Energy Mix',
      'Data-Driven Resource Allocation'
    ],
    mechanicsDescription: 'Students manage a district of Phnom Penh in the year 2035. Every decision (building a vocational tech school vs. expanding coal power vs. building light rail transit) shifts live variables in a dynamic differential equation matrix.',
    inspiration: 'The Sims / SimCity meets national development economics.',
    difficultyRating: 'Intermediate-Advanced (Grade 10–12)',
    estimatedSessionMin: 25,
    currentHighLevelMetrics: {
      totalSessionsCompleted: 15320,
      avgMasteryLiftPercent: 31.8,
      topConceptMastered: 'Capital budgeting tradeoffs & renewable energy grid stability',
    },
  },
  {
    id: 'game-quantum-stem',
    gameKey: 'quantum_stem_lab',
    titleEn: 'Quantum Lab: Particle & Logic Sandbox',
    titleKm: 'បន្ទប់ពិសោធន៍កង់ទិច៖ គ្រាប់ភាគល្អិត និងតក្កវិជ្ជា',
    subtitle: 'Microscopic virtual reality sandbox for chemistry and digital circuit logic',
    genre: 'Interactive Sandbox & Micro-Experimentation',
    learningObjective: 'Directly experience atomic electron orbitals, stoichiometry balance, Boolean logic gate circuits, and photon excitation.',
    stemCompetencies: [
      'MoEYS Chemistry: Redox Reactions & Ionic Bond Energies',
      'Computer Science: Logic Gates (AND/OR/XOR/NAND) & ALU Design',
      'Modern Physics: Wave-Particle Duality & Spectroscopy',
      'Scientific Method & Precision Error Quantification'
    ],
    mechanicsDescription: 'A modular sandbox where students build working 8-bit computers from raw silicon gates, or synthesize organic polymers by colliding molecules in thermal simulation chambers.',
    inspiration: 'Turing Complete meets PhET Interactive Simulations with modern WebGPU fidelity.',
    difficultyRating: 'All Grades (Scalable Modules)',
    estimatedSessionMin: 12,
    currentHighLevelMetrics: {
      totalSessionsCompleted: 39120,
      avgMasteryLiftPercent: 41.5,
      topConceptMastered: 'Stoichiometric balancing & Boolean half-adder construction',
    },
  },
];

const DEFAULT_COMPANION_TEMPLATE: AICompanionMithState = {
  name: 'Mith',
  khmerName: 'មិត្ត (Mith)',
  title: 'Socratic Education Companion & Life Guide',
  archetype: 'socratic_mentor',
  affinityLevel: 1,
  affinityXp: 0,
  currentMood: 'attentive',
  dialogueHistory: [
    {
      id: 'msg-welcome',
      speaker: 'mith',
      text: 'Welcome to the CDES Digital Campus! What subject or scholarship goal would you like to explore today?',
      timestamp: 'Session start',
      emotionalTone: 'encouraging',
    },
  ],
  activeGuidanceAdvice: {
    headlineEn: 'Explore Verified STEM & Scholarship Roadmaps',
    headlineKm: 'ស្វែងយល់ពីផែនទីសិក្សា STEM និងអាហារូបករណ៍',
    rationale: 'Start a focused dialogue or simulation lab to build personalized mastery checkpoints.',
    recommendedZone: 'stem_laboratory',
    recommendedGameOrModule: 'quantum_stem_lab',
    meritBonus: 40,
  },
};

const MAX_COMPANION_USERS = 200;
const MAX_DIALOGUE_HISTORY = 40;
const companionStatesByUser = new Map<string, AICompanionMithState>();

function cloneDefaultCompanion(): AICompanionMithState {
  return {
    ...DEFAULT_COMPANION_TEMPLATE,
    dialogueHistory: DEFAULT_COMPANION_TEMPLATE.dialogueHistory.map((m) => ({ ...m })),
    activeGuidanceAdvice: { ...DEFAULT_COMPANION_TEMPLATE.activeGuidanceAdvice },
  };
}

function getOrCreateUserCompanion(userId: string): AICompanionMithState {
  const existing = companionStatesByUser.get(userId);
  if (existing) {
    companionStatesByUser.delete(userId);
    companionStatesByUser.set(userId, existing);
    return existing;
  }
  if (companionStatesByUser.size >= MAX_COMPANION_USERS) {
    const oldestKey = companionStatesByUser.keys().next().value;
    if (oldestKey !== undefined) {
      companionStatesByUser.delete(oldestKey);
    }
  }
  const fresh = cloneDefaultCompanion();
  companionStatesByUser.set(userId, fresh);
  return fresh;
}

// ==========================================================
// API ENDPOINTS
// ==========================================================

/**
 * GET /api/digital-world/overview
 * Returns digital world meta, zones, active population, weather, and neutral companion template.
 */
router.get('/overview', (_req: Request, res: Response) => {
  try {
    const totalActiveUsers = DIGITAL_ZONES.reduce((acc, z) => acc + z.activeLearnersCount, 0);

    return res.json({
      success: true,
      data: {
        worldName: 'CDES Digital Campus World',
        worldNameKm: 'ពិភពសាកលវិទ្យាល័យឌីជីថល CDES',
        currentSeason: 'Season 2026: Bac II National Champions',
        serverClockTime: '14:45 GMT+7',
        environmentState: {
          weather: 'Tropical Breeze',
          timeOfDay: 'Golden Hour (Sunset Horizon)',
          dayNightCycleDurationMinutes: 60,
          ambientColorGrading: 'warm_golden_hour',
        },
        totalActiveLearners: totalActiveUsers,
        totalZonesCount: DIGITAL_ZONES.length,
        zones: DIGITAL_ZONES,
        games: EDUCATIONAL_GAMES,
        aiCompanion: cloneDefaultCompanion(),
      },
    });
  } catch (err: unknown) {
    return res.status(500).json({ success: false, error: safeErrorMessage(err, 'Failed to fetch digital world overview', 500) });
  }
});

/**
 * GET /api/digital-world/zones/:zoneKey
 * Fetches specific zone detail, hotspots, and active NPC dialog.
 */
router.get('/zones/:zoneKey', (req: Request, res: Response) => {
  try {
    const { zoneKey } = req.params;
    const zone = DIGITAL_ZONES.find((z) => z.zoneKey === zoneKey);

    if (!zone) {
      return res.status(404).json({ success: false, error: 'Zone not found' });
    }

    return res.json({
      success: true,
      data: zone,
    });
  } catch (err: unknown) {
    return res.status(500).json({ success: false, error: safeErrorMessage(err, 'Failed to load zone', 500) });
  }
});

/**
 * GET /api/digital-world/games
 * Returns the four educational simulation games architectures.
 */
router.get('/games', (_req: Request, res: Response) => {
  return res.json({
    success: true,
    data: EDUCATIONAL_GAMES,
  });
});

/**
 * POST /api/digital-world/companion/chat
 * Interacts with user-scoped AI Companion "Mith" (Socratic guidance).
 */
router.post('/companion/chat', authenticateToken, validate(DigitalWorldChatSchema, 'body'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { message } = req.body as { message: string };
    const actingUserId = req.user!.userId;
    const inputCheck = aiSafetyService.inspectInput(message);
    if (!inputCheck.isSafe) {
      const guardedReply = inputCheck.guidanceNote || 'Let us focus on safe, constructive study planning.';
      return res.json({
        success: true,
        persisted: false,
        data: {
          reply: guardedReply,
          companionState: cloneDefaultCompanion(),
        },
      });
    }

    const sanitizedUserMessage = aiSafetyService.sanitizeOutput(message).sanitizedText;
    const memoryAllowed = privacyService.canUseAIMemory(actingUserId);
    const companionState = memoryAllowed ? getOrCreateUserCompanion(actingUserId) : cloneDefaultCompanion();

    const studentMsgId = `msg-${crypto.randomUUID()}`;
    companionState.dialogueHistory.push({
      id: studentMsgId,
      speaker: 'student',
      text: sanitizedUserMessage,
      timestamp: new Date().toISOString(),
    });

    // Dynamic Socratic responses based on keywords
    let replyText = 'I hear your determination! Let us break this down into first principles. What is the fundamental constraint we must satisfy?';
    let emotionalTone = 'encouraging';

    const lower = sanitizedUserMessage.toLowerCase();
    if (lower.includes('scholarship') || lower.includes('cadt') || lower.includes('university')) {
      replyText = 'Securing a top scholarship is a marathon, not a sprint. Your Grade 12 calculus and English readiness are key. Would you like to review the Techo Digital admission criteria at the Career Center?';
      emotionalTone = 'visionary';
    } else if (lower.includes('tired') || lower.includes('stress') || lower.includes('anxious')) {
      replyText = 'It is completely normal to feel fatigued before Bac II. Take a 10-minute stroll through the Community Commons lotus pond. Your brain consolidates memory when you rest.';
      emotionalTone = 'empathetic';
    } else if (lower.includes('physics') || lower.includes('math') || lower.includes('angkor') || lower.includes('racing')) {
      replyText = 'Excellent curiosity! Why not test your hypothesis inside the Angkor Adventure hydraulic simulation or the Animal Racing track? Seeing the numbers move in real-time makes the concept stick forever.';
      emotionalTone = 'socratic_hint';
    }

    const mithMsgId = `msg-${crypto.randomUUID()}`;
    companionState.dialogueHistory.push({
      id: mithMsgId,
      speaker: 'mith',
      text: replyText,
      timestamp: new Date().toISOString(),
      emotionalTone,
    });
    if (companionState.dialogueHistory.length > MAX_DIALOGUE_HISTORY) {
      companionState.dialogueHistory.splice(0, companionState.dialogueHistory.length - MAX_DIALOGUE_HISTORY);
    }

    if (memoryAllowed) {
      companionState.affinityXp += 25;
      if (companionState.affinityXp >= 1000) {
        companionState.affinityLevel += 1;
        companionState.affinityXp = 0;
      }
    }

    return res.json({
      success: true,
      persisted: memoryAllowed,
      data: {
        reply: replyText,
        companionState,
      },
    });
  } catch (err: unknown) {
    return res.status(500).json({ success: false, error: safeErrorMessage(err, 'Companion chat failed', 500) });
  }
});

/**
 * POST /api/digital-world/game-telemetry
 * Telemetry endpoint recording educational simulation events into SQLite when analytics consent is active.
 */
router.post('/game-telemetry', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const actingStudentId = req.user!.userId;
    const {
      gameKey,
      eventType,
      trialCount = 1,
      bktInferredSkill,
      priorProbability = 0.5,
      posteriorProbability = 0.75,
      gameStatePayload = {},
    } = (req.body || {}) as Record<string, unknown>;

    if (!privacyService.canCollectAnalytics(actingStudentId)) {
      return res.json({
        success: true,
        persisted: false,
        reason: 'consent_disabled',
        message: 'Telemetry skipped under current student privacy consent.',
      });
    }

    const safePrior = typeof priorProbability === 'number' && Number.isFinite(priorProbability) ? priorProbability : 0.5;
    const safePosterior = typeof posteriorProbability === 'number' && Number.isFinite(posteriorProbability) ? posteriorProbability : 0.75;
    const safeTrials = typeof trialCount === 'number' && Number.isFinite(trialCount) ? Math.max(1, Math.trunc(trialCount)) : 1;
    const safeGameId = typeof gameKey === 'string' && gameKey.trim() ? gameKey.trim().slice(0, 100) : 'digital_campus_sim';
    const safeEventType = typeof eventType === 'string' && eventType.trim() ? eventType.trim().slice(0, 100) : 'simulation_step';
    const safeSkill = typeof bktInferredSkill === 'string' && bktInferredSkill.trim() ? bktInferredSkill.trim().slice(0, 120) : 'kinematic_trajectory_calculation';

    const saved = analyticsRepo.logGameEvent({
      student_id: actingStudentId,
      user_id: actingStudentId,
      game_id: safeGameId,
      level: safeTrials,
      action: safeEventType,
      score: Math.round(safePosterior * 100),
      success: true,
      metadata: {
        bktInferredSkill: safeSkill,
        priorProbability: safePrior,
        posteriorProbability: safePosterior,
        gameStatePayload: gameStatePayload && typeof gameStatePayload === 'object' ? gameStatePayload : {},
      },
    });

    const eventRecord = {
      id: saved.id,
      studentId: actingStudentId,
      gameKey: safeGameId,
      eventType: safeEventType,
      trialCount: safeTrials,
      bktInferredSkill: safeSkill,
      priorProbability: safePrior,
      posteriorProbability: safePosterior,
      gameStatePayload: gameStatePayload && typeof gameStatePayload === 'object' ? gameStatePayload : {},
      recordedAt: saved.timestamp,
      studentIntelligenceLinked: true,
    };

    return res.json({
      success: true,
      persisted: true,
      message: 'Telemetry logged and persisted to analytics database.',
      data: eventRecord,
    });
  } catch (err: unknown) {
    return res.status(500).json({ success: false, error: safeErrorMessage(err, 'Telemetry failed', 500) });
  }
});

export default router;
