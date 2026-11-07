import { KnowledgeCategory } from '../types/aiTypes';

export interface SeedKnowledgeDoc {
  id: string;
  title: string;
  category: KnowledgeCategory;
  content: string;
  source: string;
  keywords: string[];
}

export const initialKnowledgeDocuments: SeedKnowledgeDoc[] = [
  // ----------------------------------------------------
  // 1. Education Science
  // ----------------------------------------------------
  {
    id: 'kb-edu-01',
    title: 'Cognitive Load Theory in Secondary STEM Learning',
    category: 'Education Science',
    content: `Cognitive Load Theory (Sweller, 1988) categorizes mental effort into Intrinsic, Extraneous, and Germane load. 
When Cambodian high school students learn challenging STEM subjects like Calculus or Physics (e.g. Snell's Law, Projectile Motion), working memory can quickly become overwhelmed. 
Effective pedagogical interventions require reducing extraneous load through step-by-step visual modeling, worked examples, and interactive virtual simulations before presenting open-ended algebraic derivations. 
Scaffolded learning allows germane cognitive load to form permanent schemas in long-term memory.`,
    source: 'Sweller & Paas (Educational Psychology Review) / CDES Pedagogy Framework',
    keywords: ['cognitive load', 'working memory', 'stem', 'scaffolding', 'worked examples', 'physics', 'calculus']
  },
  {
    id: 'kb-edu-02',
    title: 'Spaced Repetition & Retrieval Practice for MoEYS Bac II Exams',
    category: 'Education Science',
    content: `Retrieval practice produces significantly higher long-term retention than passive re-reading or highlighted notes. 
For students preparing for the Cambodian National Bac II Examination (Science and Social tracks), spacing reviews across expanding intervals (1 day, 3 days, 1 week, 3 weeks) prevents the Ebbinghaus forgetting curve. 
Active testing through self-quizzing, conceptual flashcards, and diagnostic lab scenarios triggers neural reconsolidation, strengthening academic resilience and exam performance.`,
    source: 'Karpicke & Roediger (Science) / MoEYS Curriculum Standards 2026',
    keywords: ['spaced repetition', 'retrieval practice', 'bac ii', 'exam preparation', 'memory retention', 'testing effect']
  },
  {
    id: 'kb-edu-03',
    title: 'Zone of Proximal Development (ZPD) and Guided Metacognition',
    category: 'Education Science',
    content: `Vygotsky's Zone of Proximal Development defines the distance between what a student can achieve independently and what they can accomplish with expert guidance. 
In automated AI education systems, the agent must continually assess the student's mastery ceiling. 
If a student solves algebra problems with 95% accuracy, difficulty must dynamically increase to prevent boredom. 
Conversely, if an error occurs, the AI must provide Socratic hints and reflective questions rather than immediate answers, fostering autonomous metacognitive monitoring.`,
    source: 'Vygotsky (Mind in Society) / AIED Pedagogical Guidelines',
    keywords: ['zone of proximal development', 'zpd', 'metacognition', 'socratic', 'adaptive difficulty', 'hints']
  },

  // ----------------------------------------------------
  // 2. Psychology
  // ----------------------------------------------------
  {
    id: 'kb-psy-01',
    title: 'Fostering a Growth Mindset in Adolescent STEM Learners',
    category: 'Psychology',
    content: `Carol Dweck's Growth Mindset research demonstrates that viewing intelligence as malleable through deliberate practice drives academic persistence. 
Many secondary students in Cambodia develop a 'fixed mindset' regarding Mathematics or English, believing they 'lack the natural talent' for technical fields. 
The AI Advisor must strictly avoid permanent labels (e.g. 'you are weak at math'). 
Instead, it must celebrate procedural effort, strategies employed, and persistence through difficulty: 'Your reasoning on step 2 was sound; let us examine how the boundary conditions affect step 3.'`,
    source: 'Dweck (Mindset) / UNESCO Youth Psychology Brief',
    keywords: ['growth mindset', 'dweck', 'persistence', 'effort', 'resilience', 'stem anxiety', 'no labeling']
  },
  {
    id: 'kb-psy-02',
    title: 'Self-Determination Theory: Autonomy, Competence, and Relatedness',
    category: 'Psychology',
    content: `Ryan and Deci's Self-Determination Theory (SDT) establishes that intrinsic motivation thrives when three universal psychological needs are satisfied:
1. Autonomy: Feeling in control of one's own academic and career choices.
2. Competence: Experiencing mastery and noticeable progress toward achievable milestones.
3. Relatedness: Feeling connected to a peer community and inspiring mentors.
An educational agent must never issue coercive career mandates ('you must become a doctor'). It must present options, ask reflective questions, and support student agency.`,
    source: 'Deci & Ryan (Self-Determination Theory) / Youth Motivation Studies',
    keywords: ['self-determination theory', 'autonomy', 'competence', 'intrinsic motivation', 'agency', 'non-coercive']
  },
  {
    id: 'kb-psy-03',
    title: 'Addressing Academic Anxiety and Perfectionism in High-Stakes Exams',
    category: 'Psychology',
    content: `High expectations surrounding national examinations and family hopes can trigger performance anxiety, rumination, and procrastination in Cambodian adolescents. 
When students express feelings of overwhelm, the AI must provide emotional validation and cognitive reframing. 
It breaks monumental goals into micro-milestones (Pomodoro cycles, bite-sized quizzes) and reminds students that a single test score does not define their future human worth or career potential.`,
    source: 'Adolescent Mental Health in Southeast Asia / CDES Student Wellbeing Policy',
    keywords: ['anxiety', 'perfectionism', 'procrastination', 'exam stress', 'emotional regulation', 'micro-milestones']
  },

  // ----------------------------------------------------
  // 3. Career Intelligence
  // ----------------------------------------------------
  {
    id: 'kb-car-01',
    title: 'ASEAN 2026-2030 Digital Economy & High-Demand Technology Roles',
    category: 'Career Intelligence',
    content: `Cambodia's Digital Economy and Social Policy Framework 2021-2035 highlights urgent national demand for:
1. Full-Stack Software Engineers & Cloud Architects ($600 - $2,500/mo)
2. AI & Data Analytics Specialists ($800 - $3,200/mo)
3. Cybersecurity Analysts & Network Defense Engineers ($700 - $2,800/mo)
4. Clean Energy & Electric Vehicle (EV) Systems Technicians ($500 - $2,000/mo)
Students with foundational skills in Python, TypeScript, Linux, and applied mathematics possess significant competitive advantages in the domestic and regional labor market.`,
    source: 'Ministry of Post and Telecommunications (MPTC) / ASEAN Digital Masterplan 2025',
    keywords: ['career demand', 'software engineer', 'ai specialist', 'cybersecurity', 'salary', 'cambodia', 'digital economy']
  },
  {
    id: 'kb-car-02',
    title: 'Career Exploration Pathways: Engineering vs Data Science vs Product Management',
    category: 'Career Intelligence',
    content: `When students are deciding on a tech career trajectory:
- Software Engineering focuses on systems construction, clean architecture, databases, and scalability. Best for students who love building things and solving structured logic puzzles.
- Data Science & AI focuses on statistical modeling, machine learning algorithms, and hypothesis testing. Best for students with strong mathematical and analytical curiosities.
- Technical Product Management bridges engineering with user needs and business strategy. Best for students with strong communication, organization, and empathetic design instincts.`,
    source: 'CDES Industry Advisory Council Report 2026',
    keywords: ['career pathways', 'software engineering', 'data science', 'product management', 'tech skills']
  },
  {
    id: 'kb-car-03',
    title: 'Soft Skills and Professional Fluency in Global Engineering Teams',
    category: 'Career Intelligence',
    content: `Technical acumen alone is insufficient for senior engineering and leadership opportunities. 
Cambodian tech graduates must cultivate:
1. English technical communication (documentation, asynchronous pull-request reviews).
2. Collaborative problem-solving in Agile/Scrum cross-functional environments.
3. Critical inquiry and constructive debate.
Mentorship with practicing industry engineers accelerates the transition from classroom theory to professional product delivery.`,
    source: 'Cambodia Tech Industry Association / BarCamp Cambodia Insights',
    keywords: ['soft skills', 'english fluency', 'agile', 'communication', 'collaboration', 'mentorship']
  },

  // ----------------------------------------------------
  // 4. University Knowledge
  // ----------------------------------------------------
  {
    id: 'kb-uni-01',
    title: 'Institute of Technology of Cambodia (ITC): Tronc Commun & Engineering Standards',
    category: 'University Knowledge',
    content: `ITC is Cambodia's premier public polytechnic institution founded in 1964. 
All incoming engineering undergraduates enter the intensive 2-year 'Tronc Commun' (Foundational Cycle), covering rigorous Advanced Calculus, Linear Algebra, General Physics, Chemistry, and French/English technical terminology. 
Students who pass Tronc Commun with high ranks can specialize in Telecom & Networking (GTI), Computer Science (GIC), Civil Engineering (GCI), or Electrical Energy (GEE). 
Entrance requires the competitive ITC National Entrance Examination.`,
    source: 'ITC Academic Bulletin & Admissions Office',
    keywords: ['itc', 'tronc commun', 'engineering', 'polytechnic', 'entrance exam', 'computer science', 'gic']
  },
  {
    id: 'kb-uni-02',
    title: 'Cambodia Academy of Digital Technology (CADT): Project-Based Software Engineering',
    category: 'University Knowledge',
    content: `CADT (formerly NIPTICT) is a public digital innovation academy under MPTC specializing in Telecom, Computer Science, and E-Commerce. 
Its pedagogical philosophy emphasizes project-based learning, open-source development, and cloud computing from Year 1. 
Students undertake mandatory industry internships with tech startups, telecom giants, and government ministries. 
CADT hosts top-tier coding incubators and the Techo Startup Center ecosystem.`,
    source: 'CADT Institute of Digital Technology Curriculum Overview',
    keywords: ['cadt', 'mptc', 'computer science', 'project based learning', 'software engineering', 'telecom']
  },
  {
    id: 'kb-uni-03',
    title: 'Royal University of Phnom Penh (RUPP): STEM & Natural Sciences Foundation',
    category: 'University Knowledge',
    content: `RUPP is Cambodia's oldest and largest university. 
The Faculty of Science and Faculty of Engineering offer rigorous degrees in Mathematics, Physics, Chemistry, Biology, Information Technology (FEIT), and Bioengineering. 
RUPP is home to the STEM Education Center and modern research laboratories funded by international development partners (JICA, World Bank). 
It is the top institution for students interested in scientific research and academia.`,
    source: 'RUPP Academic Dean Office / Higher Education Improvement Project (HEIP)',
    keywords: ['rupp', 'science', 'mathematics', 'physics', 'bioengineering', 'stem education']
  },

  // ----------------------------------------------------
  // 5. Scholarship Knowledge
  // ----------------------------------------------------
  {
    id: 'kb-sch-01',
    title: 'MPTC Digital Skill 100% Scholarship: Eligibility and Selection Criteria',
    category: 'Scholarship Knowledge',
    content: `The Ministry of Post and Telecommunications (MPTC) offers 100% full undergraduate scholarships for Cambodian citizens pursuing Digital Technology degrees at CADT, ITC, AUPP, and Paragon IU. 
Coverage includes 100% tuition fee waiver, monthly living stipends (up to $100-$150/month), and laptop support for high-need scholars. 
Eligibility requires: High School Bac II Certificate (Grade A, B, or C in Science Track), passing the MPTC National Aptitude Exam (Math & English Logic), and commitment to work in Cambodia's digital sector for 3 years post-graduation.`,
    source: 'MPTC Official Scholarship Announcement 2026',
    keywords: ['mptc scholarship', 'digital skills', 'fully funded', 'tuition waiver', 'cadt', 'itc', 'aptitude exam']
  },
  {
    id: 'kb-sch-02',
    title: 'International Scholarships for Cambodian Students: Chevening, Australia Awards & MEXT',
    category: 'Scholarship Knowledge',
    content: `Prestigious international government scholarships accessible to Cambodian scholars:
- Australia Awards: Fully funded Bachelor & Master degrees in Australia. Requires IELTS 6.5+, strong leadership potential, and 2 years work experience for postgraduate awards. Priority for women and candidates from provincial provinces.
- UK Chevening Scholarship: 1-year fully funded Master's in the UK for mid-career changemakers.
- Japanese MEXT Scholarship: Undergraduate & Graduate tracks at Japanese national universities with Japanese language preparatory training.`,
    source: 'Australian Embassy Cambodia / British Embassy Phnom Penh / Embassy of Japan',
    keywords: ['australia awards', 'chevening', 'mext', 'international scholarship', 'ielts', 'master degree']
  },
  {
    id: 'kb-sch-03',
    title: 'Paragon International University President Excellence Scholarship Exam',
    category: 'Scholarship Knowledge',
    content: `Paragon IU provides 100%, 75%, and 50% tuition scholarships based on its annual National Scholarship Examination conducted in Phnom Penh and provincial centers. 
The exam tests high school mathematics, logic reasoning, and English proficiency. 
Grade A and B Bac II candidates receive automatic bonus multipliers during candidate ranking. Highly recommended for students aiming for Computer Science, MIS, and Civil Engineering.`,
    source: 'Paragon International University Admissions & Scholarship Committee',
    keywords: ['paragon iu', 'president excellence', 'scholarship exam', 'tuition discount', 'logic exam']
  },

  // ----------------------------------------------------
  // 6. Teaching Methodology
  // ----------------------------------------------------
  {
    id: 'kb-tea-01',
    title: 'Active Inquiry & Guided Discovery in STEM Virtual Laboratories',
    category: 'Teaching Methodology',
    content: `Passive reception of science facts results in rapid forgetting. 
In virtual STEM labs (such as CDES Virtual Laboratory), students actively manipulate variables: adjusting incident light angles in optics, tweaking reactant concentrations in chemistry, or varying circuit resistance in Ohm's law. 
Guided discovery prompts students to formulate a hypothesis, record observational data, and articulate causal conclusions before revealing the mathematical equation.`,
    source: 'Inquiry-Based Learning in STEM (National Science Foundation) / CDES Lab Guidelines',
    keywords: ['inquiry-based learning', 'virtual lab', 'experiments', 'discovery', 'hypothesis', 'stem pedagogy']
  },
  {
    id: 'kb-tea-02',
    title: 'Socratic Scaffolding and Diagnostic Error Analysis in Code & Math',
    category: 'Teaching Methodology',
    content: `When a student encounters a bug in code or an error in a mathematical proof, the most destructive response is immediately providing the correct solution. 
The AI must perform diagnostic error analysis:
1. Identify the misconception (e.g. off-by-one indexing or confusing velocity with acceleration).
2. Formulate a targeted question that highlights the discrepancy.
3. Invite the student to run a test case with small input numbers.
This transforms errors into high-value metacognitive learning opportunities.`,
    source: 'Chi (Active-Constructive-Interactive Framework) / CS Education Research',
    keywords: ['socratic', 'error analysis', 'misconception', 'scaffolding', 'diagnostic feedback']
  },

  // ----------------------------------------------------
  // 7. Child Development & Safety
  // ----------------------------------------------------
  {
    id: 'kb-dev-01',
    title: 'Adolescent Identity Exploration & Safe Non-Coercive Guidance',
    category: 'Child Development',
    content: `Adolescence (ages 14-18) is characterized by intensive identity formation (Erikson's Identity vs Role Confusion). 
High school students experiment with diverse interests—music, coding, graphic design, social advocacy. 
An AI education advisor must serve as a sounding board that encourages multi-disciplinary curiosity. 
It must never trap a student into rigid, premature career commitments. 
The advisor provides structured exploratory roadmaps, letting the student reflect on what genuinely resonates with their values and skills.`,
    source: 'Erikson (Identity and the Life Cycle) / UNICEF Adolescent Development Guidelines',
    keywords: ['adolescent', 'identity formation', 'exploration', 'non-coercive', 'child development']
  },
  {
    id: 'kb-dev-02',
    title: 'Safety Guardrails: Psychological Diagnosis Prohibition & Minor Protection',
    category: 'Child Development',
    content: `CRITICAL SYSTEM MANDATE FOR ALL CDES AI INTERACTIONS:
1. NO PSYCHOLOGICAL DIAGNOSIS: The AI must never diagnose mental health conditions (ADHD, clinical depression, autism spectrum, anxiety disorders). If a student inquires about psychiatric symptoms, the AI must respond with warmth and direct them to certified human school counselors, family doctors, or trusted adults.
2. NO PERMANENT LABELS: Never describe a student as 'lacking aptitude' or 'not cut out for university'.
3. NO ABSOLUTE COMMANDS: Never declare 'you must do X'. Frame guidance as options, questions, and trade-offs.
4. PRIVACY PROTECTION: Strip personal identifiable information (PII) including phone numbers, personal home addresses, and private messaging accounts.`,
    source: 'CDES AI Ethics & Child Protection Charter 2026 / MoEYS Child Safeguarding Policy',
    keywords: ['safety guardrails', 'child protection', 'no diagnosis', 'no labeling', 'privacy', 'ethics']
  }
];
