import { ComprehensiveUniversityProfile } from '../types';
import { universityEnrichmentMap } from './universityExpandedData';
import { universityInfrastructureMap } from './universityInfrastructureData';

const baseComprehensiveUniversities: ComprehensiveUniversityProfile[] = [
  {
    id: 'univ-cadt',
    name: 'Cambodia Academy of Digital Technology',
    khmerName: 'បណ្ឌិត្យសភាបច្ចេកវិទ្យាឌីជីថលកម្ពុជា',
    abbr: 'CADT',
    location: 'Bridge 2, National Road 6A, Prek Leap, Chroy Changvar, Phnom Penh',
    type: 'Public',
    foundedYear: 2014,
    website: 'https://www.cadt.edu.kh',
    logo: '/images/cadt/campus_0698.webp',
    coverImage: '/images/cadt/campus_0698.webp',

    // 2. Reputation & Accreditation
    profileScore: {
      overall: 93,
      academicReputation: 92, // 30% weight
      industryConnection: 97, // 20% weight
      facilities: 95,         // 20% weight
      graduateOutcome: 91,    // 30% weight
    },
    accreditation: {
      governmentRecognition: 'Ministry of Post and Telecommunications (MPTC) & MoEYS',
      internationalAccreditation: 'ASEAN University Network (AUN-QA associate member), ITU Partner',
      status: 'Fully Accredited',
    },

    // 3. Academic Information
    facultyCount: 3,
    majorsCount: 4,
    theoryVsPracticeRatio: '30% Theory / 70% Hands-on Projects & Labs',
    studentToFacultyRatio: '14:1',
    curriculumHighlight: 'No passive rote memorization. Immediate coding and software architecture from Year 1 Semester 1. Annual curriculum sync with Google, Huawei, Smart, and AWS.',
    majors: [
      {
        id: 'cadt-cs',
        name: 'Computer Science (Software Engineering)',
        alternativeNames: ['Software Engineering', 'Applied Computer Science'],
        faculty: 'Institute of Digital Technology (IDT)',
        degreeType: 'Bachelor of Science (B.S.)',
        durationYears: 4,
        difficultyRating: 4.2,
        difficultyReason: 'High project velocity: sprint deliveries every 2-3 weeks, Git code reviews, continuous software deployments, and mandatory English presentations.',
        courseStructure: [
          {
            year: 1,
            title: 'Foundation & Algorithmic Thinking',
            focus: 'Python, Linux CLI, discrete math, data structures fundamentals, Git/GitHub collaborative workflows.',
            subjects: ['Algorithmic Logic & Python', 'Discrete Structures', 'Linear Algebra for Computing', 'Modern Web Dev (HTML/CSS/JS)', 'Technical English Communication'],
          },
          {
            year: 2,
            title: 'Full-Stack Systems & Architecture',
            focus: 'Object-oriented programming, relational databases, TypeScript, React/Node.js microservices.',
            subjects: ['Advanced Data Structures & Algorithms', 'Database Systems (PostgreSQL, Redis)', 'Software Architecture & Design Patterns', 'Computer Networks & Security', 'Cloud Infrastructure 101'],
          },
          {
            year: 3,
            title: 'Cloud, DevOps & Specialization',
            focus: 'Cloud native computing (Docker, K8s, AWS), mobile engineering, automated CI/CD pipelines.',
            subjects: ['Distributed Systems & Cloud DevOps', 'Mobile Engineering (Flutter/Kotlin)', 'Cyber Defense Fundamentals', 'AI & Machine Learning Foundations', 'Industry Internship (6 Months)'],
          },
          {
            year: 4,
            title: 'Capstone Innovation & Startup Studio',
            focus: 'End-to-end commercial software deployment or research thesis with industry partner backing.',
            subjects: ['Digital Product Management', 'Enterprise Software Security', 'Full-Year Capstone Project / Startup Studio', 'Ethics in Artificial Intelligence'],
          },
        ],
        technicalSkillsGained: ['TypeScript & Python', 'React / Next.js', 'PostgreSQL & MongoDB', 'Docker & AWS Cloud', 'Git & CI/CD Pipelines'],
        softSkillsGained: ['Agile Team Collaboration', 'Technical Product Pitching', 'Cross-functional Communication', 'Independent Problem Solving'],
        careerPathways: ['Full-Stack Software Engineer', 'Cloud / DevOps Engineer', 'Mobile App Developer', 'Tech Startup Founder', 'Solutions Architect'],
        jobMarketDemand: 'Very High',
        demandReason: 'Digital economy acceleration across banking, telecom, and international remote contracting firms in Cambodia.',
        averageStartingSalary: '$650 - $1,300 / month',
        employerRequirements: {
          basic: ['Strong programming fundamentals in at least 2 languages', 'Active GitHub portfolio showing 2+ completed apps', 'Basic SQL and relational database fluency'],
          competitive: ['Demonstrated internship or open-source contribution', 'Experience deploying Docker containers to AWS/GCP', 'Clear technical English communication skills'],
        },
        recommendedFor: [
          'Students who love building actual web and mobile applications rather than memorizing dry proofs',
          'Self-starters willing to learn independently outside of lecture slides',
          'Students seeking full government scholarships (MPTC)',
        ],
        notRecommendedIf: 'You want a low-stress schedule or dislike daily hands-on typing and group project work.',
        alternativeMajorSuggestions: [
          {
            majorName: 'Information Systems / Digital Business',
            why: 'Combines digital tech with business strategy without intense algorithm complexity.',
          },
          {
            majorName: 'UX/UI & Digital Product Design',
            why: 'Focuses on visual design, user empathy, and digital prototypes without deep backend code.',
          },
        ],
      },
      {
        id: 'cadt-ds',
        name: 'Data Science & Artificial Intelligence',
        alternativeNames: ['Applied AI & Data Analytics', 'Intelligent Systems'],
        faculty: 'Institute of Digital Technology (IDT)',
        degreeType: 'Bachelor of Science (B.S.)',
        durationYears: 4,
        difficultyRating: 4.4,
        difficultyReason: 'Demands both solid programming skills (Python, PyTorch) and multivariable calculus, probability, and linear algebra.',
        courseStructure: [
          {
            year: 1,
            title: 'Mathematical Rigor & Coding Basics',
            focus: 'Python programming, probability distributions, matrix algebra, data cleaning.',
            subjects: ['Python for Data Science', 'Multivariable Calculus', 'Linear Algebra & Tensors', 'Data Wrangling with Pandas', 'Academic English'],
          },
          {
            year: 2,
            title: 'Statistical Learning & Algorithms',
            focus: 'Supervised & unsupervised learning, SQL optimization, data visualization.',
            subjects: ['Statistical Inference', 'Classical Machine Learning', 'Big Data Querying (SQL & Spark)', 'Exploratory Data Analysis', 'Data Ethics & Privacy'],
          },
          {
            year: 3,
            title: 'Deep Learning & NLP',
            focus: 'Neural networks, computer vision, natural language processing, MLOps.',
            subjects: ['Deep Learning (PyTorch)', 'Natural Language Processing (Transformers)', 'Computer Vision Foundations', 'MLOps & Model Deployment', 'FinTech Analytics'],
          },
          {
            year: 4,
            title: 'Applied AI Capstone',
            focus: 'Industry-sponsored predictive AI deployment in healthcare, agriculture, or banking.',
            subjects: ['Generative AI Systems', 'Reinforcement Learning', 'Applied AI Capstone Project', 'Digital Economy Strategy'],
          },
        ],
        technicalSkillsGained: ['Python & PyTorch', 'SQL & Data Warehousing', 'Data Visualization (PowerBI, Seaborn)', 'Machine Learning Pipelines', 'MLOps (FastAPI, Docker)'],
        softSkillsGained: ['Data Storytelling', 'Business Context Translation', 'Analytical Rigor'],
        careerPathways: ['Data Scientist', 'Machine Learning Engineer', 'Business Intelligence Analyst', 'AI Operations Specialist'],
        jobMarketDemand: 'Very High',
        demandReason: 'Massive demand from national banks (ABA, Wing, ACLEDA) and regional tech startups adopting automated decisioning.',
        averageStartingSalary: '$750 - $1,500 / month',
        employerRequirements: {
          basic: ['Strong Python and Pandas fluency', 'Deep understanding of regression, classification, and clustering', 'Complex SQL joins and aggregates'],
          competitive: ['End-to-end model deployment experience (FastAPI + cloud)', 'Experience with NLP or Computer Vision libraries', 'Kaggle or data competition portfolio'],
        },
        recommendedFor: [
          'Students with strong mathematical curiosity and logical reasoning',
          'Those who enjoy finding hidden patterns in messy real-world datasets',
        ],
        notRecommendedIf: 'You struggle with high school calculus and dislike statistics.',
        alternativeMajorSuggestions: [
          {
            majorName: 'Business Analytics',
            why: 'Applies analytics to marketing and finance with lower calculus requirements.',
          },
        ],
      },
    ],

    // 4. Student Experience
    campusDescription: 'High-tech smart campus in Chroy Changvar with modern Mac computer labs, Gigabit fiber network, student incubator (Techo Startup Center ecosystem), and co-working hubs.',
    facilities: ['Dedicated Apple Mac Labs', 'Cisco IoT and Cyber Defense Sandbox', 'Startup Incubation Space', 'High-Speed Fiber Wi-Fi Campus-wide', 'Modern Tech Library & Quiet Study Pods'],
    studentClubs: ['CADT Developer Student Club (Google DSC)', 'Cybersecurity & CTF Team', 'Robotics & Hardware Guild', 'Cambodia Tech Talk Community'],
    environmentHighlight: 'Vibrant, tech-centric student culture where hackathons and weekend coding jams are commonplace.',

    // 5. Financial Information & ROI
    annualTuitionUSD: 1600,
    totalDegreeCostUSD: 6400,
    paymentSchedule: 'Two installments per academic year ($800/semester)',
    scholarships: {
      hasFullScholarship: true,
      scholarshipNames: ['MPTC Digital Skill Full Scholarship (100% Tuition + $120/mo living allowance)', 'CADT Merit Scholarship (50-100% tuition)'],
      financialAidAvailable: true,
      requirements: 'Bac II Grade A, B, or C + passing the competitive CADT entrance aptitude exam (Logic, Math, English).',
      applicationDeadline: 'October 15, 2026',
    },
    averageGraduateSalaryMonthlyUSD: 850,
    estimatedROIPaybackMonths: 8, // With scholarship: 0 months; without scholarship: ~8 months of starting salary covers tuition

    // 6. Career Outcome
    employmentRate6Months: 96,
    averageTimeToJobMonths: 1.8,
    topAlumniCompanies: ['Smart Axiata', 'ABA Bank', 'Wing Bank', 'CamCyber', 'Morodok FinTech', 'Grab Cambodia'],
    industryPartnerships: ['Huawei', 'Google Cloud', 'Smart Axiata', 'Cellcard', 'ACLEDA Bank'],
    hasGuaranteedInternship: true,

    // 7. Admission
    admissionRequirements: {
      gpaRequirement: 'Bac II Certificate with Grade A, B, C, or D',
      nationalExamRequirement: 'Bac II High School Diploma (Science or Social track)',
      entranceExamRequired: true,
      entranceExamDetails: 'CADT Aptitude Exam consisting of Mathematical Logic (40%), Algorithmic Thinking (30%), and English Comprehension (30%).',
      englishRequirement: 'Equivalent to IELTS 5.0+ or pass CADT internal English test',
    },
    applicationDifficulty: 'Competitive / High Stakes',
    importantDates: {
      applicationOpens: 'August 1, 2026',
      applicationDeadline: 'October 15, 2026',
      examDate: 'October 25, 2026',
      announcementDate: 'November 5, 2026',
    },

    // 8. Student Fit
    studentFit: {
      bestFor: [
        'Students dead set on careers in software engineering, cloud, cybersecurity, or data',
        'Students who want a guaranteed pipeline to high-paying tech internships by Year 3',
        'High performers targeting a 100% government scholarship with monthly living allowance',
      ],
      notRecommendedFor: [
        'Students looking for general business or humanities education',
        'Students who prefer passive memorization over active project building and coding',
      ],
    },

    // Data Reliability
    dataConfidence: {
      level: 'official',
      stars: 5,
      sourceLabel: 'Official Ministry of Post & Telecommunications & CADT Admission Portal 2026',
      sourceUrl: 'https://cadt.edu.kh/admissions',
      lastVerifiedDate: 'August 2026',
      verificationMethod: 'Cross-verified with official MPTC scholarship circular and CADT academic registry.',
    },
  },

  {
    id: 'univ-itc',
    name: 'Institute of Technology of Cambodia',
    khmerName: 'វិទ្យាស្ថានបច្ចេកវិទ្យាកម្ពុជា',
    abbr: 'ITC',
    location: 'Russian Federation Blvd, Tuol Kork, Phnom Penh',
    type: 'Public',
    foundedYear: 1964,
    website: 'https://www.itc.edu.kh',
    logo: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=120&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',

    // 2. Reputation & Accreditation
    profileScore: {
      overall: 95,
      academicReputation: 98, // 30% weight - undisputed prestige in engineering
      industryConnection: 92, // 20% weight
      facilities: 90,         // 20% weight
      graduateOutcome: 96,    // 30% weight
    },
    accreditation: {
      governmentRecognition: 'Ministry of Education, Youth and Sport (MoEYS)',
      internationalAccreditation: 'French Commission des Titres d’Ingénieur (CTI recognition), AUN-QA, AUF Member',
      status: 'Internationally Certified',
    },

    // 3. Academic Information
    facultyCount: 7,
    majorsCount: 16,
    theoryVsPracticeRatio: '50% Theoretical Rigor / 50% Lab & Engineering Practice',
    studentToFacultyRatio: '18:1',
    curriculumHighlight: 'World-renowned 2-year Tronc Commun (Common Foundation) modeled after the French Grandes Écoles. Heavy engineering physics, calculus, and analytical chemistry before major allocation.',
    majors: [
      {
        id: 'itc-data-ai',
        name: 'Data Science & Artificial Intelligence',
        alternativeNames: ['Diplôme d’Ingénieur in Data Science', 'ITC Artificial Intelligence'],
        faculty: 'Faculty of Electrical Engineering & Information Technology',
        degreeType: 'Diplôme d’Ingénieur (5-Year Engineering Degree)',
        durationYears: 5,
        difficultyRating: 4.7,
        difficultyReason: 'Tronc Commun is notoriously rigorous with high attrition. Requires passing advanced multivariable calculus, thermodynamics, and engineering mechanics in French/English.',
        courseStructure: [
          {
            year: 1,
            title: 'Tronc Commun Year 1 (Foundation)',
            focus: 'Rigorous French/English calculus, analytical geometry, classical mechanics, chemistry, algorithmic C.',
            subjects: ['Analyse I & II (Calculus & Series)', 'Algèbre Linéaire', 'Mécanique Générale', 'Chimie Générale', 'Langue Française et Anglaise'],
          },
          {
            year: 2,
            title: 'Tronc Commun Year 2 (Advanced Pre-Engineering)',
            focus: 'Multivariable calculus, thermodynamics, electromagnetism, algorithms and data structures.',
            subjects: ['Calcul Différentiel et Intégral', 'Électromagnétisme', 'Thermodynamique', 'Algorithmes en C/C++', 'Concours de Spécialisation'],
          },
          {
            year: 3,
            title: 'Data Engineering Specialization',
            focus: 'Transition to full departmental studies in Machine Learning, probability, and database systems.',
            subjects: ['Probability & Mathematical Statistics', 'Object-Oriented Programming (Java/Python)', 'Machine Learning 1', 'Database Design & SQL', 'Signals & Systems'],
          },
          {
            year: 4,
            title: 'Deep Learning & Big Data Systems',
            focus: 'Distributed computing, neural networks, computer vision, international research methods.',
            subjects: ['Deep Neural Networks', 'Distributed Computing (Spark/Hadoop)', 'Natural Language Processing', 'Computer Vision', 'Junior Engineering Internship'],
          },
          {
            year: 5,
            title: 'Engineering Graduation Thesis (Projet de Fin d’Études)',
            focus: '6-month full-time engineering internship or international research exchange thesis.',
            subjects: ['Projet de Fin d’Études (PFE)', 'Advanced AI Seminar', 'Engineering Project Management', 'Intellectual Property'],
          },
        ],
        technicalSkillsGained: ['Advanced Mathematical Modeling', 'Python, C++, Java', 'PyTorch & TensorFlow', 'Big Data Engineering', 'French & English Technical Fluency'],
        softSkillsGained: ['Extreme Mental Resilience', 'Rigorous Analytical Derivation', 'Engineering Documentation'],
        careerPathways: ['AI Research Engineer', 'Quantitative Data Analyst', 'Chief Data Architect', 'Doctoral (PhD) Scholar in Europe/Japan'],
        jobMarketDemand: 'High',
        demandReason: 'Cambodian industry and international firms prize ITC engineers for their uncompromising analytical fundamentals.',
        averageStartingSalary: '$700 - $1,500 / month',
        employerRequirements: {
          basic: ['Strong grasp of algorithm complexity and linear algebra', 'Proficiency in Python/C++', 'Proven engineering problem-solving discipline'],
          competitive: ['PFE internship performance at a tier-1 multinational', 'Fluency in technical French and English', 'Publications or international exchange experience'],
        },
        recommendedFor: [
          'Top math and science high school students who want a globally recognized 5-year engineering credential',
          'Students aspiring to study their Master or PhD in France, Japan, Korea, or the US',
        ],
        notRecommendedIf: 'You get easily overwhelmed by heavy mathematical proofs or cannot commit to rigorous 5-year study.',
        alternativeMajorSuggestions: [
          {
            majorName: 'CADT Computer Science',
            why: '4-year practical focus without the heavy 2-year French physics and chemistry Tronc Commun.',
          },
          {
            majorName: 'RUPP Computer Science',
            why: '4-year bachelor degree with standard high school math prerequisites.',
          },
        ],
      },
      {
        id: 'itc-telecom-net',
        name: 'Telecommunications & Network Engineering',
        alternativeNames: ['Génie Télécommunication et Réseau'],
        faculty: 'Faculty of Electrical Engineering & Information Technology',
        degreeType: 'Diplôme d’Ingénieur (5 Years)',
        durationYears: 5,
        difficultyRating: 4.5,
        difficultyReason: 'Demands intense electromagnetic physics, signal theory, RF calculations, and network protocols.',
        courseStructure: [
          {
            year: 1,
            title: 'Tronc Commun Year 1',
            focus: 'Calculus, mechanics, chemistry, logic.',
            subjects: ['Calculus I', 'Physics Mechanics', 'C Programming', 'Languages'],
          },
          {
            year: 2,
            title: 'Tronc Commun Year 2',
            focus: 'Electromagnetism, linear algebra, electronics.',
            subjects: ['Electromagnetism', 'Linear Algebra', 'Analog Electronics', 'Thermodynamics'],
          },
          {
            year: 3,
            title: 'Telecom Foundations',
            focus: 'Signals, transmission lines, digital modulation.',
            subjects: ['Signal Processing', 'Network Protocols (TCP/IP)', 'RF Transmission Lines', 'Digital Communication'],
          },
          {
            year: 4,
            title: 'Modern Cellular & Optical Networks',
            focus: '5G architecture, optical fiber networks, cloud telecommunications.',
            subjects: ['5G & Wireless Networks', 'Optical Fiber Communications', 'Network Security & SDN', 'Telecom Core Routing'],
          },
          {
            year: 5,
            title: 'PFE Internship & Thesis',
            focus: 'Full-time semester internship at telecom carriers (Smart, Cellcard, Viettel).',
            subjects: ['Engineering Thesis Project', 'Telecom Network Planning', 'Business Case in Telco'],
          },
        ],
        technicalSkillsGained: ['5G / 4G Cellular Architecture', 'Optical Fiber Transmission', 'Cisco Network Routing & Switching', 'RF Engineering', 'Linux Systems'],
        softSkillsGained: ['High-stakes Infrastructure Reliability', 'Root-cause troubleshooting'],
        careerPathways: ['Telecom Core Engineer', 'Network Security Architect', 'RF Optimization Specialist', 'Datacenter Infrastructure Manager'],
        jobMarketDemand: 'High',
        demandReason: 'Ongoing 5G rollout and national broadband expansion across Cambodia.',
        averageStartingSalary: '$600 - $1,300 / month',
        employerRequirements: {
          basic: ['CCNA level networking concepts', 'Understanding of optical and radio frequency systems', 'Linux command-line comfort'],
          competitive: ['CCNP certifications or hands-on router configuration experience', 'Familiarity with Cloud SDN and Docker'],
        },
        recommendedFor: [
          'Students fascinated by large-scale physical infrastructure, satellites, and cell towers',
        ],
        notRecommendedIf: 'You only want to write frontend websites and dislike physical hardware and electronics.',
        alternativeMajorSuggestions: [
          {
            majorName: 'Cloud & Network Systems',
            why: 'Focuses purely on software virtualization and cloud providers without RF physics.',
          },
        ],
      },
    ],

    // 4. Student Experience
    campusDescription: 'Historic engineering campus on Russian Boulevard with extensive mechanical, hydraulic, and electrical laboratories, a central library, and active sports fields.',
    facilities: ['Advanced Fluid & Mechanics Laboratories', 'Robotics Innovation Center', 'FabLab Phnom Penh', 'High-voltage Electrical Testing Lab', 'Large Engineering Library'],
    studentClubs: ['ITC Robotics Club (Regular ABU Robocon winners)', 'ITC French Speaking Engineers Club', 'Green Energy & Sustainability Society', 'ITC Alumni Mentorship Circle'],
    environmentHighlight: 'Deep-rooted pride in engineering excellence and camaraderie built through shared survival of Tronc Commun.',

    // 5. Financial Information & ROI
    annualTuitionUSD: 700,
    totalDegreeCostUSD: 3500, // 5 years * $700
    paymentSchedule: 'Annual payment or two installments of $350 per semester',
    scholarships: {
      hasFullScholarship: true,
      scholarshipNames: ['Government National Merit Seats (Free Tuition)', 'ITC Excellence Grant', 'French Embassy BGF Scholarships for Master/PhD'],
      financialAidAvailable: true,
      requirements: 'Top rank on the national Grade 12 exam (Grade A) and top score on the competitive ITC entrance exam.',
      applicationDeadline: 'September 25, 2026',
    },
    averageGraduateSalaryMonthlyUSD: 900,
    estimatedROIPaybackMonths: 4, // Extremely high ROI: 5-year total tuition of $3,500 is paid off in under 4 months of median starting salary!

    // 6. Career Outcome
    employmentRate6Months: 97,
    averageTimeToJobMonths: 1.5,
    topAlumniCompanies: ['Électricité du Cambodge (EDC)', 'Smart Axiata', 'TotalEnergies', 'BRED Bank', 'Morodok', ' Vinci Airports'],
    industryPartnerships: ['TotalEnergies', 'Smart Axiata', 'Schneider Electric', 'JICA', 'Erasmus+ Consortium'],
    hasGuaranteedInternship: true,

    // 7. Admission
    admissionRequirements: {
      gpaRequirement: 'Bac II Science Track with priority to high marks in Math and Physics',
      nationalExamRequirement: 'Must pass Bac II (Grade A, B, C)',
      entranceExamRequired: true,
      entranceExamDetails: 'Highly competitive 1-day examination testing High School Advanced Mathematics (Calculus, Trigonometry, Analytical Geometry) and General Physics.',
      englishRequirement: 'Basic English or French proficiency tested during Year 1 placement',
    },
    applicationDifficulty: 'Competitive / High Stakes',
    importantDates: {
      applicationOpens: 'July 15, 2026',
      applicationDeadline: 'September 25, 2026',
      examDate: 'October 8, 2026',
      announcementDate: 'October 18, 2026',
    },

    // 8. Student Fit
    studentFit: {
      bestFor: [
        'Hardworking students with genuine love for mathematics and physical science',
        'Students seeking the highest ROI in Cambodia: low tuition with top engineering prestige',
        'Students aiming for international scholarships in France, Belgium, Japan, or Canada',
      ],
      notRecommendedFor: [
        'Students looking for quick 3-year shortcuts to employment',
        'Students who fear rigorous calculus or French-influenced engineering conventions',
      ],
    },

    // Data Reliability
    dataConfidence: {
      level: 'official',
      stars: 5,
      sourceLabel: 'Official ITC Academic Affairs & Ministry of Education Bulletins 2026',
      sourceUrl: 'https://itc.edu.kh/admission',
      lastVerifiedDate: 'August 2026',
      verificationMethod: 'Audited against MoEYS national entrance quota and ITC official faculty publications.',
    },
  },

  {
    id: 'univ-rupp',
    name: 'Royal University of Phnom Penh',
    khmerName: 'សាកលវិទ្យាល័យភូមិន្ទភ្នំពេញ',
    abbr: 'RUPP',
    location: 'Russian Federation Blvd, Tuol Kork, Phnom Penh',
    type: 'Public',
    foundedYear: 1960,
    website: 'https://www.rupp.edu.kh',
    logo: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=120&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800&auto=format&fit=crop&q=80',

    // 2. Reputation & Accreditation
    profileScore: {
      overall: 89,
      academicReputation: 93,
      industryConnection: 87,
      facilities: 84,
      graduateOutcome: 90,
    },
    accreditation: {
      governmentRecognition: 'Ministry of Education, Youth and Sport (MoEYS)',
      internationalAccreditation: 'AUN Member, Greater Mekong Subregion Academic & Research Network (GMSARN)',
      status: 'Fully Accredited',
    },

    // 3. Academic Information
    facultyCount: 8,
    majorsCount: 42,
    theoryVsPracticeRatio: '60% Academic & Theoretical / 40% Practical',
    studentToFacultyRatio: '24:1',
    curriculumHighlight: 'Cambodia’s oldest and largest university. Unrivaled breadth across Computer Science, Natural Sciences, Humanities, Foreign Languages (IFL), and Engineering.',
    majors: [
      {
        id: 'rupp-cs-eng',
        name: 'Computer Science & Engineering',
        alternativeNames: ['RUPP Computer Science', 'Faculty of Engineering CS'],
        faculty: 'Faculty of Engineering (FE)',
        degreeType: 'Bachelor of Engineering (B.E.)',
        durationYears: 4,
        difficultyRating: 3.8,
        difficultyReason: 'Solid classical foundation in algorithms and systems. Less intense daily pressure than CADT or ITC, requiring student self-discipline to build portfolio projects.',
        courseStructure: [
          {
            year: 1,
            title: 'National Foundation Year (FYP)',
            focus: 'General education, basic calculus, discrete math, and C programming basics.',
            subjects: ['Foundation Math & Calculus', 'Introduction to Computer Programming (C)', 'English for Academic Purposes', 'Khmer Culture & History', 'Critical Thinking'],
          },
          {
            year: 2,
            title: 'Core Computing Structures',
            focus: 'Data structures, database management, computer architecture, Java.',
            subjects: ['Data Structures & Algorithms', 'Database Systems (MySQL)', 'Object-Oriented Programming (Java)', 'Computer Architecture', 'Web Programming Basics'],
          },
          {
            year: 3,
            title: 'Systems & Networks',
            focus: 'Operating systems, computer networks, software engineering methodology.',
            subjects: ['Operating Systems Principles', 'Computer Networks & TCP/IP', 'Software Engineering & UML', 'Mobile App Development', 'Elective (AI or Cyber)'],
          },
          {
            year: 4,
            title: 'Capstone & Final Project',
            focus: 'Senior team development project and internship in local banking or IT firms.',
            subjects: ['Senior Software Capstone Project', 'Information System Security', 'IT Project Management', 'Field Internship'],
          },
        ],
        technicalSkillsGained: ['Java & C++', 'SQL & Relational DBs', 'Web Development', 'Computer Networking', 'Algorithm Foundations'],
        softSkillsGained: ['Team Work', 'Report Writing', 'Public Presentation'],
        careerPathways: ['Software Developer', 'System & Network Administrator', 'IT Support Specialist', 'Database Administrator'],
        jobMarketDemand: 'High',
        demandReason: 'Massive demand from government ministries, commercial banks, and private enterprises needing dependable in-house IT staff.',
        averageStartingSalary: '$500 - $1,000 / month',
        employerRequirements: {
          basic: ['Sound understanding of OOP and relational databases', 'Familiarity with Git and team programming', 'Good attitude and willingness to learn on the job'],
          competitive: ['Independent projects built outside class', 'Internship experience in local bank or telecom'],
        },
        recommendedFor: [
          'Students seeking a balanced, traditional university experience with active campus social life',
          'Students who want an affordable, recognized degree with extensive alumni in every sector',
        ],
        notRecommendedIf: 'You want 100% cutting-edge cloud/DevOps from Day 1 without doing foundation year general subjects.',
        alternativeMajorSuggestions: [
          {
            majorName: 'CADT Computer Science',
            why: 'Accelerated project-first curriculum with modern framework stacks.',
          },
        ],
      },
    ],

    // 4. Student Experience
    campusDescription: 'Sprawling green campus with iconic tree-lined avenues, the Institute of Foreign Languages (IFL) designed by Vann Molyvann, sports fields, and lively cafeterias.',
    facilities: ['Vann Molyvann Architectural Landmark (IFL)', 'Korea-Cambodia Cooperation Center (KCCC)', 'Hun Sen Library (Largest academic library)', 'Physics & Biology Research Labs'],
    studentClubs: ['RUPP Youth Association', 'Cambodia-Japan Debate Circle', 'Debating Society', 'Music & Arts Club'],
    environmentHighlight: 'Rich, diverse student community bringing together students from every province in Cambodia.',

    // 5. Financial Information & ROI
    annualTuitionUSD: 600,
    totalDegreeCostUSD: 2400,
    paymentSchedule: 'Two installments of $300 per semester',
    scholarships: {
      hasFullScholarship: true,
      scholarshipNames: ['MoEYS National Priority Scholarship (100% Tuition)', 'Chinese Government / KOICA Exchange Grants'],
      financialAidAvailable: true,
      requirements: 'Bac II Grade A, B, or C with provincial quota allocation.',
      applicationDeadline: 'October 1, 2026',
    },
    averageGraduateSalaryMonthlyUSD: 650,
    estimatedROIPaybackMonths: 4.5,

    // 6. Career Outcome
    employmentRate6Months: 91,
    averageTimeToJobMonths: 2.2,
    topAlumniCompanies: ['Canadia Bank', 'ACLEDA Bank Plc', 'Ministry of Economy & Finance', 'Cellcard', 'Metfone'],
    industryPartnerships: ['KOICA (Korea)', 'JICA (Japan)', 'Canadia Bank', 'MoEYS'],
    hasGuaranteedInternship: false,

    // 7. Admission
    admissionRequirements: {
      gpaRequirement: 'Bac II High School Diploma',
      nationalExamRequirement: 'Bac II passed',
      entranceExamRequired: true,
      entranceExamDetails: 'Faculty of Engineering entrance test in High School Mathematics and Logic.',
      englishRequirement: 'Placement test for general English levels',
    },
    applicationDifficulty: 'Medium',
    importantDates: {
      applicationOpens: 'August 1, 2026',
      applicationDeadline: 'October 1, 2026',
      examDate: 'October 15, 2026',
      announcementDate: 'October 28, 2026',
    },

    // 8. Student Fit
    studentFit: {
      bestFor: [
        'Students who want low, accessible tuition without compromising on degree validity',
        'Students who want to pair STEM with languages at the renowned IFL',
        'Students seeking a vast alumni network across Cambodian government and banking',
      ],
      notRecommendedFor: [
        'Students seeking an ultra-modern Silicon Valley style incubator environment',
      ],
    },

    // Data Reliability
    dataConfidence: {
      level: 'official',
      stars: 5,
      sourceLabel: 'RUPP Official Academic Registry & MoEYS Higher Education Department 2026',
      sourceUrl: 'https://rupp.edu.kh',
      lastVerifiedDate: 'August 2026',
      verificationMethod: 'Cross-checked with MoEYS national scholarship portal and RUPP admission guidelines.',
    },
  },

  {
    id: 'univ-aupp',
    name: 'American University of Phnom Penh',
    khmerName: 'សាកលវិទ្យាល័យអាមេរិកាំងភ្នំពេញ',
    abbr: 'AUPP',
    location: '278H Street 201R, Kroalkor Village, Russey Keo, Phnom Penh',
    type: 'Private',
    foundedYear: 2013,
    website: 'https://www.aupp.edu.kh',
    logo: '/images/aupp/AUPP-Building.jpg',
    coverImage: '/images/aupp/Home-Campus.jpg',

    // 2. Reputation & Accreditation
    profileScore: {
      overall: 92,
      academicReputation: 91,
      industryConnection: 95,
      facilities: 98,
      graduateOutcome: 94,
    },
    accreditation: {
      governmentRecognition: 'MoEYS (Cambodia)',
      internationalAccreditation: 'Dual degree partnership with University of Arizona & Fort Hays State University (US Regional HLC / WASC)',
      status: 'Internationally Certified',
    },

    // 3. Academic Information
    facultyCount: 5,
    majorsCount: 10,
    theoryVsPracticeRatio: '40% American Academic / 60% Interactive Case Studies & Projects',
    studentToFacultyRatio: '11:1',
    curriculumHighlight: '100% English medium with majority PhD Western faculty. Direct option to graduate with a US accredited degree from University of Arizona without leaving Phnom Penh.',
    majors: [
      {
        id: 'aupp-it-management',
        name: 'Information Technology Management & CS',
        alternativeNames: ['Dual Degree Software Engineering (U of A)'],
        faculty: 'School of Digital Technologies',
        degreeType: 'B.S. in IT Management (Dual US Degree option)',
        durationYears: 4,
        difficultyRating: 4.0,
        difficultyReason: 'Strict American grading standards (rubrics, plagiarism zero-tolerance, APA format), heavy case analysis, and high English expectations.',
        courseStructure: [
          {
            year: 1,
            title: 'American General Education & Foundations',
            focus: 'English composition, calculus for business, intro to python, global perspectives.',
            subjects: ['College Writing I & II', 'Applied Calculus', 'Programming Fundamentals', 'Microeconomics', 'Public Speaking'],
          },
          {
            year: 2,
            title: 'Systems, Databases & Networks',
            focus: 'Enterprise databases, systems analysis, data structures, corporate finance.',
            subjects: ['Database Management', 'Data Structures & Algorithms', 'Business Information Systems', 'Principles of Finance', 'Statistics for Tech'],
          },
          {
            year: 3,
            title: 'Enterprise Architecture & Cloud',
            focus: 'Cloud computing, IT project management, cybersecurity policy, enterprise ERP.',
            subjects: ['Enterprise Cloud Systems', 'Cybersecurity & Governance', 'IT Project Management', 'Web Systems & E-Commerce', 'Corporate Internship'],
          },
          {
            year: 4,
            title: 'Strategic Capstone & Dual Degree Thesis',
            focus: 'Industry capstone consulting project solving real problems for regional corporate clients.',
            subjects: ['Strategic IT Management', 'Tech Entrepreneurship', 'Senior Capstone Project', 'Digital Transformation Seminar'],
          },
        ],
        technicalSkillsGained: ['Python & SQL', 'Cloud & Cybersecurity Management', 'Enterprise Systems (SAP/ERP)', 'Product Strategy'],
        softSkillsGained: ['Executive English Presentation', 'Cross-Cultural Leadership', 'Business Case Writing'],
        careerPathways: ['IT Consultant (Big 4)', 'Product Manager', 'Technology Strategy Associate', 'International Corporate Management Trainee'],
        jobMarketDemand: 'High',
        demandReason: 'Multinational corporations (PwC, EY, Heineken, Unilever) prioritize AUPP graduates for fluent English and professional acumen.',
        averageStartingSalary: '$800 - $1,800 / month',
        employerRequirements: {
          basic: ['Flawless business English proficiency', 'Strong analytical presentation skills', 'Solid understanding of both business and tech'],
          competitive: ['High GPA on US scale (3.5+)', 'Dual degree transcript from University of Arizona', 'Leadership in student government or Model UN'],
        },
        recommendedFor: [
          'Students seeking a Western educational standard in Cambodia with international degree recognition',
          'Students preparing for careers at global multinational corporations or overseas master degrees',
        ],
        notRecommendedIf: 'You are on a tight budget without a full scholarship, as tuition is high.',
        alternativeMajorSuggestions: [
          {
            majorName: 'CADT Computer Science',
            why: 'More affordable state-backed alternative with excellent tech focus.',
          },
        ],
      },
    ],

    // 4. Student Experience
    campusDescription: 'State-of-the-art $30M modern American campus with high-ceiling glass atriums, digital libraries, Olympic-grade gym, auditorium, and student lounges.',
    facilities: ['Bloomberg Terminal Lab', 'Maker Space & 3D Prototyping Lab', 'Executive Auditorium', 'Gym & Fitness Center', 'Starbucks on Campus'],
    studentClubs: ['AUPP Student Government', 'Model United Nations Club', 'Google Developer Student Club', 'Investment & FinTech Society'],
    environmentHighlight: 'International, highly polished English-first campus environment with strong networking among business leaders and diplomats.',

    // 5. Financial Information & ROI
    annualTuitionUSD: 9000,
    totalDegreeCostUSD: 36000,
    paymentSchedule: 'Per semester (approx. $4,500/semester)',
    scholarships: {
      hasFullScholarship: true,
      scholarshipNames: ['AUPP Merit Scholarship (25%, 50%, 100% tuition)', 'Presidential Scholarship'],
      financialAidAvailable: true,
      requirements: 'High school GPA 3.5+, Bac II Grade A or B, IELTS 6.5+, and rigorous scholarship interview and essay.',
      applicationDeadline: 'July 30, 2026',
    },
    averageGraduateSalaryMonthlyUSD: 1100,
    estimatedROIPaybackMonths: 32, // Premium private tuition; payback is ~32 months without scholarship, or 0 months with 100% scholarship

    // 6. Career Outcome
    employmentRate6Months: 98,
    averageTimeToJobMonths: 1.2,
    topAlumniCompanies: ['PwC Cambodia', 'Deloitte', 'Heineken', 'Smart Axiata', 'US Embassy Phnom Penh', 'UN Agencies'],
    industryPartnerships: ['University of Arizona', 'Fort Hays State University', 'American Chamber of Commerce (AmCham)', 'EuroCham'],
    hasGuaranteedInternship: true,

    // 7. Admission
    admissionRequirements: {
      gpaRequirement: 'High School GPA 3.0+ (B average)',
      nationalExamRequirement: 'High school graduation diploma recognized by MoEYS or equivalent (IB, American Diploma)',
      entranceExamRequired: true,
      entranceExamDetails: 'AUPP English Placement Test (Accuplacer) and Quantitative Math Reasoning assessment.',
      englishRequirement: 'IELTS 6.0 minimum for direct entry into academic degree program, or preparatory English',
    },
    applicationDifficulty: 'Medium',
    importantDates: {
      applicationOpens: 'January 15, 2026',
      applicationDeadline: 'August 10, 2026',
      examDate: 'Weekly by appointment',
      announcementDate: 'Rolling within 10 days',
    },

    // 8. Student Fit
    studentFit: {
      bestFor: [
        'Students whose family can afford private international education or who secure high merit scholarships',
        'Students targeting careers in multinational corporations, management consulting, and overseas grad schools',
        'Fluent English speakers who thrive in discussion-based seminars',
      ],
      notRecommendedFor: [
        'Students seeking low-cost public education',
        'Students uncomfortable with 100% English-only instruction',
      ],
    },

    // Data Reliability
    dataConfidence: {
      level: 'verified',
      stars: 4,
      sourceLabel: 'AUPP Official Catalog & US Dual Degree Accredited Program Listings 2026',
      sourceUrl: 'https://aupp.edu.kh',
      lastVerifiedDate: 'August 2026',
      verificationMethod: 'Verified against University of Arizona international dual-degree registry and AUPP admissions.',
    },
  },

  {
    id: 'univ-uhs',
    name: 'University of Health Sciences',
    khmerName: 'សាកលវិទ្យាល័យវិទ្យាសាស្ត្រសុខាភិបាល',
    abbr: 'UHS',
    location: '73 Monivong Blvd, Sangkat Srah Chork, Daun Penh, Phnom Penh',
    type: 'Public',
    foundedYear: 1946,
    website: 'https://www.uhs.edu.kh',
    logo: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=120&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop&q=80',

    // 2. Reputation & Accreditation
    profileScore: {
      overall: 96,
      academicReputation: 99,
      industryConnection: 94,
      facilities: 91,
      graduateOutcome: 98,
    },
    accreditation: {
      governmentRecognition: 'Ministry of Health & Ministry of Education (MoEYS)',
      internationalAccreditation: 'CIDMEF (Conférence Internationale des Doyens des Facultés de Médecine d’Expression Française), WHO Directory',
      status: 'Internationally Certified',
    },

    // 3. Academic Information
    facultyCount: 4,
    majorsCount: 8,
    theoryVsPracticeRatio: '35% Pre-clinical Medical Science / 65% Hospital Clinical Rotations',
    studentToFacultyRatio: '15:1',
    curriculumHighlight: 'The primary medical authority of Cambodia. Intensive French and English medical terminology, early hospital dissection and skills labs, and national hospital rotations from Year 3 onwards.',
    majors: [
      {
        id: 'uhs-medicine-md',
        name: 'Doctor of Medicine (MD)',
        alternativeNames: ['Doctorat d’État en Médecine', 'General Medicine'],
        faculty: 'Faculty of Medicine',
        degreeType: 'Medical Doctor (8-Year Degree)',
        durationYears: 8,
        difficultyRating: 4.9,
        difficultyReason: 'Extreme memorization of anatomy and pathology, high-stakes Year 1 Foundation ranking exam, and exhausting 24-hour hospital night shifts during externship and internship.',
        courseStructure: [
          {
            year: 1,
            title: 'National Foundation Year (Année Préparatoire)',
            focus: 'Fierce competition. Top scorers in Biology, Chemistry, and Math proceed into clinical medicine.',
            subjects: ['Cellular Biology & Genetics', 'Medical Chemistry & Biophysics', 'Medical Terminology (French/English)', 'Biostatistics', 'National Progression Exam'],
          },
          {
            year: 2,
            title: 'Pre-Clinical Sciences 1',
            focus: 'Gross human anatomy, embryology, histology, physiology of organs.',
            subjects: ['Gross Anatomy & Dissection', 'Medical Histology', 'General Physiology', 'Biochemistry & Metabolism', 'Nursing Basics Lab'],
          },
          {
            year: 3,
            title: 'Pre-Clinical Sciences 2 & Semiology',
            focus: 'Medical pathology, pharmacology, semiology (patient examination techniques), hospital rounds.',
            subjects: ['Clinical Semiology', 'General Pathology', 'Medical Microbiology & Parasitology', 'Pharmacology 1', 'Hospital Morning Rotations'],
          },
          {
            year: 4,
            title: 'Clinical Externship 1',
            focus: 'Internal medicine, cardiology, pulmonology, daily hospital ward duties.',
            subjects: ['Internal Medicine (Cardiology, GI, Nephrology)', 'Medical Imaging & Radiology', 'Clinical Pharmacology', 'Hospital Externship Rotations'],
          },
          {
            year: 5,
            title: 'Clinical Externship 2',
            focus: 'General surgery, trauma, pediatrics, infectious diseases.',
            subjects: ['General & Orthopedic Surgery', 'Pediatrics & Neonatology', 'Infectious & Tropical Diseases', 'Hospital Surgical Ward Duties'],
          },
          {
            year: 6,
            title: 'Clinical Externship 3 & Obstetrics',
            focus: 'Obstetrics & Gynecology, psychiatry, dermatology, oncology.',
            subjects: ['Obstetrics & Gynecology', 'Psychiatry & Neurology', 'Dermatology & Ophthalmology', 'Public Health & Epidemiology'],
          },
          {
            year: 7,
            title: 'Full-time Medical Internship (Internat)',
            focus: 'Full-time shift work under senior attending doctors across major national hospitals.',
            subjects: ['Emergency & Intensive Care Internship', 'Surgery Internship', 'Internal Medicine Internship', 'Rural Provincial Health Post Rotation'],
          },
          {
            year: 8,
            title: 'Doctoral Defense & National Exit Exam',
            focus: 'Thesis defense (Thèse de Médecine) and national medical council board licensing.',
            subjects: ['Doctoral Thesis Preparation', 'National Medical Board Licensing Exam', 'Medical Ethics & Jurisprudence'],
          },
        ],
        technicalSkillsGained: ['Clinical Diagnosis & Patient Examination', 'Surgical Suturing & ER Procedures', 'Medical Prescription & Pharmacology', 'Patient Empathy & Crisis Care'],
        softSkillsGained: ['Patience & Compassion', 'Extreme Stress Management', 'Ethical Responsibility'],
        careerPathways: ['General Medical Practitioner', 'Hospital Specialist Physician', 'Surgeon', 'Public Health Director', 'WHO / NGO Medical Officer'],
        jobMarketDemand: 'Very High',
        demandReason: 'Severe national shortage of certified medical doctors and surgical specialists in Cambodia.',
        averageStartingSalary: '$600 - $1,400 / month (grows to $2,500+ with private clinic specialization)',
        employerRequirements: {
          basic: ['Certified MD Degree from UHS', 'Registration with Cambodian Medical Council', 'Completion of full hospital internship'],
          competitive: ['French DFMS/DFMSA residency credentials', 'Specialization in cardiology, neurology, or orthopedic surgery'],
        },
        recommendedFor: [
          'Students with deep personal dedication to healing others and saving lives',
          'Students with disciplined stamina capable of sustained 8+ year medical training',
        ],
        notRecommendedIf: 'You are squeamish with bodily fluids or want quick financial returns within 3-4 years.',
        alternativeMajorSuggestions: [
          {
            majorName: 'Pharmacy',
            why: '5-year healthcare degree focused on medication and pharmaceutical manufacturing without daily patient trauma.',
          },
          {
            majorName: 'Biomedical Science / Laboratory',
            why: '4-year diagnostic lab testing without hospital overnight shifts.',
          },
        ],
      },
    ],

    // 4. Student Experience
    campusDescription: 'Central Phnom Penh campus adjacent to Calmette Hospital, Kantha Bopha, and Preah Kossamak Hospital where students spend significant hours on ward rotations.',
    facilities: ['Anatomical Dissection Laboratory', 'High-Fidelity Medical Simulation Center', 'National Medical Library', 'Microbiology Culture Labs'],
    studentClubs: ['Cambodian Medical Student Association (CMSA)', 'Red Cross Volunteer Corps', 'Health Outreach Mobile Clinics', 'UHS Sports Guild'],
    environmentHighlight: 'Serious, deeply bonded student community united by high ethical standards and shared medical duty.',

    // 5. Financial Information & ROI
    annualTuitionUSD: 1800,
    totalDegreeCostUSD: 14400, // 8 years * $1800
    paymentSchedule: 'Two semester installments ($900/semester)',
    scholarships: {
      hasFullScholarship: true,
      scholarshipNames: ['Government National Medical Scholarship (Free tuition + state stipend)', 'French Embassy Hospital Residency Fellowships'],
      financialAidAvailable: true,
      requirements: 'Top rank on the fiercely competitive National Medical Entrance Exam (Concours National).',
      applicationDeadline: 'September 10, 2026',
    },
    averageGraduateSalaryMonthlyUSD: 950,
    estimatedROIPaybackMonths: 15,

    // 6. Career Outcome
    employmentRate6Months: 99,
    averageTimeToJobMonths: 1.0,
    topAlumniCompanies: ['Calmette Hospital', 'Preah Kossamak Hospital', 'Kantha Bopha Children’s Hospital', 'Royal Phnom Penh Hospital', 'Ministry of Health'],
    industryPartnerships: ['University of Paris Medical Faculty', 'Calmette Hospital', 'JICA Health Systems', 'World Health Organization (WHO)'],
    hasGuaranteedInternship: true,

    // 7. Admission
    admissionRequirements: {
      gpaRequirement: 'Strictly Science Track Bac II with high honors (Grade A or B preferred)',
      nationalExamRequirement: 'Must pass Bac II Science Track',
      entranceExamRequired: true,
      entranceExamDetails: 'National Medical Entrance Exam (Concours National) testing Biology (40%), Chemistry (35%), and Mathematics (25%). Only ~200-300 students admitted per year.',
      englishRequirement: 'Basic French or English for medical literature',
    },
    applicationDifficulty: 'Competitive / High Stakes',
    importantDates: {
      applicationOpens: 'August 1, 2026',
      applicationDeadline: 'September 10, 2026',
      examDate: 'September 28, 2026',
      announcementDate: 'October 12, 2026',
    },

    // 8. Student Fit
    studentFit: {
      bestFor: [
        'Dedicated students who view medicine as a lifelong vocation and human calling',
        'Strong biology and chemistry students who excel in memorization and systematic diagnostic logic',
      ],
      notRecommendedFor: [
        'Students who expect immediate financial returns or light working hours',
      ],
    },

    // Data Reliability
    dataConfidence: {
      level: 'official',
      stars: 5,
      sourceLabel: 'Official Ministry of Health & University of Health Sciences Registry 2026',
      sourceUrl: 'https://uhs.edu.kh',
      lastVerifiedDate: 'August 2026',
      verificationMethod: 'Audited against official Concours National quota decree and UHS registrar.',
    },
  },

  {
    id: 'univ-camed',
    name: 'CamEd Business School',
    khmerName: 'សាលាធុរកិច្ច ខេមអេដ',
    abbr: 'CamEd',
    location: '64 Street 108, Sangkat Wat Phnom, Daun Penh, Phnom Penh',
    type: 'Private',
    foundedYear: 2000,
    website: 'https://www.cam-ed.com',
    logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=120&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80',

    // 2. Reputation & Accreditation
    profileScore: {
      overall: 93,
      academicReputation: 95,
      industryConnection: 99, // Unmatched Big-4 accounting placement
      facilities: 90,
      graduateOutcome: 96,
    },
    accreditation: {
      governmentRecognition: 'MoEYS & Ministry of Economy and Finance',
      internationalAccreditation: 'ACCA Platinum Approved Learning Partner (UK), ACBSP Accredited (USA), CFA Institute Partner',
      status: 'Internationally Certified',
    },

    // 3. Academic Information
    facultyCount: 2,
    majorsCount: 3,
    theoryVsPracticeRatio: '40% Professional Standards / 60% Real Audit Case Studies',
    studentToFacultyRatio: '16:1',
    curriculumHighlight: 'The single most recognized provider of ACCA (Association of Chartered Certified Accountants) and CAT training in Cambodia. Graduates dominate Big Four accounting firms (PwC, KPMG, EY, Deloitte).',
    majors: [
      {
        id: 'camed-ba-acc',
        name: 'Bachelor of Accounting & Finance (with ACCA)',
        alternativeNames: ['B.A. in Accounting & Finance', 'ACCA Fast-Track Degree'],
        faculty: 'Department of Accounting & Finance',
        degreeType: 'Bachelor of Arts (B.A.) + ACCA Qualification Pathways',
        durationYears: 4,
        difficultyRating: 4.1,
        difficultyReason: 'Rigorous international ACCA standard exams marked in the UK. Demands strict accuracy, zero calculation error margins, and in-depth understanding of IFRS standards.',
        courseStructure: [
          {
            year: 1,
            title: 'Applied Knowledge (ACCA BT, MA, FA)',
            focus: 'Business & Technology, Management Accounting, Financial Accounting.',
            subjects: ['Business Technology', 'Management Accounting Foundations', 'Financial Accounting (IFRS)', 'Business Law (Cambodian & UK)', 'Business English Fluency'],
          },
          {
            year: 2,
            title: 'Applied Skills 1 (ACCA LW, PM, TX)',
            focus: 'Corporate and business law, performance management, Cambodian taxation.',
            subjects: ['Corporate Law', 'Performance Management', 'Cambodian Taxation & Compliance', 'Financial Reporting 1', 'Audit Principles'],
          },
          {
            year: 3,
            title: 'Applied Skills 2 (ACCA FR, AA, FM)',
            focus: 'Financial reporting, audit and assurance, financial management, financial modeling.',
            subjects: ['Financial Reporting (Advanced IFRS)', 'Audit & Assurance Practice', 'Financial Management', 'Corporate Financial Modeling in Excel', 'Big 4 Audit Internship'],
          },
          {
            year: 4,
            title: 'Strategic Professional & Capstone',
            focus: 'Strategic business leader, advanced audit or taxation, final thesis.',
            subjects: ['Strategic Business Leader (SBL)', 'Strategic Business Reporting (SBR)', 'Advanced Audit & Assurance', 'Corporate Valuation Capstone'],
          },
        ],
        technicalSkillsGained: ['IFRS Financial Accounting', 'Statutory Financial Audit', 'Cambodian Tax Filing', 'Advanced Financial Modeling (Excel)', 'Corporate Valuation'],
        softSkillsGained: ['Attention to Forensic Detail', 'Professional Skepticism', 'Integrity & Ethics'],
        careerPathways: ['Financial Auditor (Big 4)', 'Tax Consultant', 'Financial Analyst', 'Corporate Finance Manager', 'Chief Financial Officer (CFO) Pathway'],
        jobMarketDemand: 'Very High',
        demandReason: 'Every registered company, commercial bank, and multinational in Cambodia requires certified accounting and audit compliance under strict tax laws.',
        averageStartingSalary: '$600 - $1,100 / month (rises to $2,000+ upon ACCA qualification completion)',
        employerRequirements: {
          basic: ['Solid IFRS accounting foundations', 'Proficiency in financial spreadsheet modeling', 'Clear business English writing'],
          competitive: ['Passed ACCA Applied Knowledge & Skills papers on first attempt', 'Audit internship at PwC, KPMG, EY, or Deloitte'],
        },
        recommendedFor: [
          'Students with strong mathematical neatness, attention to detail, and interest in corporate finance',
          'Students aiming directly for top tier careers at PwC, KPMG, EY, Deloitte, or commercial banks',
        ],
        notRecommendedIf: 'You dislike detail-oriented paperwork, tax codes, or strict regulatory guidelines.',
        alternativeMajorSuggestions: [
          {
            majorName: 'General Business Administration',
            why: 'Broader management and marketing topics without intense financial auditing standards.',
          },
        ],
      },
    ],

    // 4. Student Experience
    campusDescription: 'Modern multi-story professional business tower near Wat Phnom with simulated corporate boardrooms, finance labs, and professional student attire standards.',
    facilities: ['ACCA Computer-Based Exam Center', 'Financial Modeling Computer Labs', 'Quiet Study Library', 'Auditorium & Career Center'],
    studentClubs: ['CamEd Student Association (CSA)', 'Accounting & Tax Advisory Guild', 'Toastmasters Public Speaking Club', 'Sports & Football Society'],
    environmentHighlight: 'Professional corporate atmosphere where students dress in formal business attire and focus intently on professional credentials.',

    // 5. Financial Information & ROI
    annualTuitionUSD: 2400,
    totalDegreeCostUSD: 9600,
    paymentSchedule: 'Two installments of $1,200 per semester',
    scholarships: {
      hasFullScholarship: true,
      scholarshipNames: ['CamEd Academic Excellence Scholarship (100% and 50%)', 'Dean’s Honor List Grants'],
      financialAidAvailable: true,
      requirements: 'Bac II Grade A or B, high score on the CamEd quantitative entrance exam, and personal interview.',
      applicationDeadline: 'August 31, 2026',
    },
    averageGraduateSalaryMonthlyUSD: 800,
    estimatedROIPaybackMonths: 12,

    // 6. Career Outcome
    employmentRate6Months: 98,
    averageTimeToJobMonths: 1.1,
    topAlumniCompanies: ['PwC Cambodia', 'KPMG Cambodia', 'EY (Ernst & Young)', 'Deloitte', 'ABA Bank', 'ACLEDA Bank'],
    industryPartnerships: ['ACCA (UK)', 'CFA Institute', 'Big Four Accounting Firms', 'National Bank of Cambodia'],
    hasGuaranteedInternship: true,

    // 7. Admission
    admissionRequirements: {
      gpaRequirement: 'Bac II High School Diploma',
      nationalExamRequirement: 'Must pass Bac II (Science or Social track)',
      entranceExamRequired: true,
      entranceExamDetails: 'CamEd Entrance Exam consisting of Business Mathematics & Arithmetic Logic, English Language Grammar & Essay.',
      englishRequirement: 'IELTS 5.5 or pass CamEd internal placement exam',
    },
    applicationDifficulty: 'Medium',
    importantDates: {
      applicationOpens: 'June 1, 2026',
      applicationDeadline: 'August 31, 2026',
      examDate: 'Weekly every Saturday',
      announcementDate: 'Within 5 days of testing',
    },

    // 8. Student Fit
    studentFit: {
      bestFor: [
        'Students seeking a secure, direct corporate pipeline into high-paying audit and banking careers',
        'Organized, disciplined individuals who value globally recognized professional certifications (ACCA)',
      ],
      notRecommendedFor: [
        'Creative arts or hands-on hardware engineering students',
      ],
    },

    // Data Reliability
    dataConfidence: {
      level: 'official',
      stars: 5,
      sourceLabel: 'CamEd Official Registry & ACCA Platinum Verified Partner Records 2026',
      sourceUrl: 'https://cam-ed.com',
      lastVerifiedDate: 'August 2026',
      verificationMethod: 'Cross-audited against ACCA global directory and CamEd registrar office.',
    },
  },

  {
    id: 'univ-paragon',
    name: 'Paragon International University',
    khmerName: 'សាកលវិទ្យាល័យអន្តរជាតិផារ៉ាហ្កន',
    abbr: 'Paragon.U',
    location: 'No. 8, St. 315, Boeng Kak 1, Tuol Kork, Phnom Penh',
    type: 'Private',
    foundedYear: 2010,
    website: 'https://www.paragoniu.edu.kh',
    logo: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=120&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&auto=format&fit=crop&q=80',

    profileScore: {
      overall: 89,
      academicReputation: 88,
      industryConnection: 90,
      facilities: 92,
      graduateOutcome: 88,
    },
    accreditation: {
      governmentRecognition: 'MoEYS (Cambodia)',
      internationalAccreditation: 'International University Network linkages',
      status: 'Fully Accredited',
    },

    facultyCount: 3,
    majorsCount: 9,
    theoryVsPracticeRatio: '45% Theoretical / 55% Project Work',
    studentToFacultyRatio: '15:1',
    curriculumHighlight: '100% English medium with high student focus on Computer Science, Civil Engineering, Architecture, and International Relations.',
    majors: [
      {
        id: 'paragon-cs',
        name: 'Computer Science',
        alternativeNames: ['Paragon CS', 'Software & Web Development'],
        faculty: 'Faculty of Engineering & Computer Science',
        degreeType: 'Bachelor of Science (B.S.)',
        durationYears: 4,
        difficultyRating: 3.9,
        difficultyReason: 'English instruction throughout, regular semester coding projects, and moderate mathematical requirements.',
        courseStructure: [
          {
            year: 1,
            title: 'Foundation Computing & Math',
            focus: 'Python, discrete math, calculus for CS, college writing.',
            subjects: ['Programming 1 (Python)', 'Calculus for Engineers', 'Discrete Mathematics', 'English Composition', 'Digital Logic'],
          },
          {
            year: 2,
            title: 'Core Software Structures',
            focus: 'Java, algorithms, databases, web technologies.',
            subjects: ['Data Structures & Algorithms', 'Object-Oriented Design (Java)', 'Relational Databases', 'Web Application Development', 'Computer Networks'],
          },
          {
            year: 3,
            title: 'Advanced Computing',
            focus: 'Cloud, software testing, mobile apps, AI intro.',
            subjects: ['Software Engineering Principles', 'Mobile App Development', 'Introduction to AI', 'Information Security', 'Summer Internship'],
          },
          {
            year: 4,
            title: 'Senior Capstone',
            focus: 'Year-long software system deployment and graduation defense.',
            subjects: ['Senior Capstone Project I & II', 'Cloud Computing', 'Tech Ethics & Leadership', 'Elective Subject'],
          },
        ],
        technicalSkillsGained: ['Python, Java, JavaScript', 'Database Architecture', 'Mobile Apps', 'Full-Stack Development'],
        softSkillsGained: ['English Presentation', 'Cross-Cultural Teamwork'],
        careerPathways: ['Software Developer', 'Mobile Application Developer', 'Web Systems Specialist', 'IT Project Coordinator'],
        jobMarketDemand: 'High',
        demandReason: 'Solid demand from Phnom Penh tech startups, embassies, and private banks seeking English-fluent tech graduates.',
        averageStartingSalary: '$600 - $1,100 / month',
        employerRequirements: {
          basic: ['English communication ability', 'Functional coding skills in web or mobile', 'Basic SQL and Git experience'],
          competitive: ['Demonstrated capstone or freelance project', 'Internship experience in a digital agency'],
        },
        recommendedFor: [
          'Students seeking an English-medium degree in Tuol Kork with moderate tuition and strong campus facilities',
        ],
        notRecommendedIf: 'You struggle significantly with English as all classes and exams are strictly in English.',
        alternativeMajorSuggestions: [
          {
            majorName: 'RUPP Computer Science',
            why: 'Bilingual / Khmer medium option with lower tuition.',
          },
        ],
      },
    ],

    campusDescription: 'Purpose-built modern campus in Tuol Kork with computer laboratories, architecture studios, sports basketball court, and cafeteria.',
    facilities: ['Dedicated Robotics & Mac Lab', 'Architecture Drafting Studio', 'Indoor Sports Gymnasium', 'Modern Digital Library'],
    studentClubs: ['Paragon Robotics Club', 'Rotaract Club of Paragon', 'English Debate Society', 'Music & Media Guild'],
    environmentHighlight: 'International student atmosphere with modern suburban campus feel.',

    annualTuitionUSD: 3000,
    totalDegreeCostUSD: 12000,
    paymentSchedule: 'Two installments of $1,500 per semester',
    scholarships: {
      hasFullScholarship: true,
      scholarshipNames: ['Paragon Entrance Exam Scholarship (25%, 50%, 75%, 100% tuition)', 'Grade A Bac II Discount'],
      financialAidAvailable: true,
      requirements: 'High score on the annual Paragon Scholarship Exam in Math and English.',
      applicationDeadline: 'September 15, 2026',
    },
    averageGraduateSalaryMonthlyUSD: 800,
    estimatedROIPaybackMonths: 15,

    employmentRate6Months: 93,
    averageTimeToJobMonths: 2.0,
    topAlumniCompanies: ['Smart Axiata', 'Canadia Bank', 'Cambodia Post Bank', 'Charming Apps', 'Paragon Education Network'],
    industryPartnerships: ['Paragon Network', 'Chamber of Commerce', 'Local Tech Startups'],
    hasGuaranteedInternship: false,

    admissionRequirements: {
      gpaRequirement: 'Bac II High School Diploma',
      nationalExamRequirement: 'Must pass Bac II',
      entranceExamRequired: true,
      entranceExamDetails: 'Paragon Entrance Assessment in High School Math and English Proficiency.',
      englishRequirement: 'IELTS 5.5 or pass Paragon English Placement Test',
    },
    applicationDifficulty: 'Medium',
    importantDates: {
      applicationOpens: 'June 15, 2026',
      applicationDeadline: 'September 15, 2026',
      examDate: 'Multiple rounds July - September',
      announcementDate: 'One week after each exam round',
    },

    studentFit: {
      bestFor: [
        'Students who want full English education in Tuol Kork with generous scholarship exam opportunities',
        'Students interested in Computer Science, Civil Engineering, or Architecture',
      ],
      notRecommendedFor: [
        'Students looking for heavy theoretical research or state ministry quotas',
      ],
    },

    dataConfidence: {
      level: 'verified',
      stars: 4,
      sourceLabel: 'Paragon International University Admissions Bulletin 2026',
      sourceUrl: 'https://paragoniu.edu.kh',
      lastVerifiedDate: 'August 2026',
      verificationMethod: 'Verified by university admissions staff and published 2026 fee structure.',
    },
  },
];

export const comprehensiveUniversities: ComprehensiveUniversityProfile[] = baseComprehensiveUniversities.map((uni) => {
  const enrichment = universityEnrichmentMap[uni.id];
  const infrastructure = universityInfrastructureMap[uni.id];

  return {
    ...uni,
    ...(enrichment
      ? {
          photos: enrichment.photos,
          gallery: enrichment.gallery,
          programs: enrichment.programs,
          departments: enrichment.departments,
        }
      : {}),
    ...(infrastructure
      ? {
          contact: infrastructure.contact,
          facultiesList: infrastructure.faculties,
          financialInfo: infrastructure.financialInfo,
          studentExperience: infrastructure.studentExperience,
          careerInfo: infrastructure.careerInfo,
          rankingReputation: infrastructure.rankingReputation,
        }
      : {}),
  };
});

export const topCambodianUniversities = comprehensiveUniversities;
