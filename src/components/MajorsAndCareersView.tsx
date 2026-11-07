import React, { useState } from 'react';
import {
  Compass,
  Search,
  BookOpen,
  GraduationCap,
  TrendingUp,
  Award,
  DollarSign,
  CheckCircle2,
  Bookmark,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Filter,
  X,
  Briefcase,
  Layers,
  MapPin,
  Calendar,
  AlertCircle,
  Users,
  MessageSquare,
  HelpCircle,
  Clock,
  Building,
} from 'lucide-react';
import { OpportunityItem, TabView, Mentor } from '../types';
import { initialOpportunities, initialMentors } from '../data/mockData';

export interface MajorRoadmap {
  id: string;
  majorName: string;
  field: 'Computing & AI' | 'Engineering' | 'Health Sciences' | 'Business & FinTech';
  degreeType: string;
  duration: string;
  universities: {
    name: string;
    abbr: string;
    type: 'Public Premier' | 'Digital Academy' | 'National University' | 'Medical Premier';
    logoText: string;
  }[];
  bacIIRequirements: string[];
  troncCommunDifficulty: 'Very High (Calculus Heavy)' | 'High (Practical Sprint)' | 'Intense (Concours Ranking)' | 'Moderate';
  foundationYearSummary: string;
  salaryBenchmark: {
    junior: string;
    mid: string;
    senior: string;
  };
  keySkills: string[];
  careerRoles: string[];
  yearByYearCurriculum: {
    year: string;
    focus: string;
    courses: string[];
  }[];
  associatedScholarships: string[];
  insiderTip: string;
  ratingScore: number;
  matchedMentorId?: string;
}

const majorsData: MajorRoadmap[] = [
  {
    id: 'major-ds-ai',
    majorName: 'Data Science & Artificial Intelligence',
    field: 'Computing & AI',
    degreeType: 'Bachelor of Engineering (B.E.)',
    duration: '4 - 5 Years',
    universities: [
      { name: 'Institute of Technology of Cambodia', abbr: 'ITC', type: 'Public Premier', logoText: 'ITC' },
      { name: 'Cambodia Academy of Digital Tech', abbr: 'CADT', type: 'Digital Academy', logoText: 'CADT' },
    ],
    bacIIRequirements: [
      'Grade 12 Science Track (Bac II Grade A, B, or C preferred)',
      'High performance in Advanced Mathematics and Physics',
      'Pass ITC or CADT Aptitude Entrance Examination',
    ],
    troncCommunDifficulty: 'Very High (Calculus Heavy)',
    foundationYearSummary:
      'At ITC, Year 1 & 2 Tronc Commun immerses students in French/English engineering mathematics, differential equations, linear algebra, and physics before specializing.',
    salaryBenchmark: {
      junior: '$500 - $800 / mo',
      mid: '$900 - $1,700 / mo',
      senior: '$1,800 - $3,500+ / mo',
    },
    keySkills: ['Python & PyTorch', 'Machine Learning Algorithms', 'SQL & Data Warehousing', 'Linear Algebra & Statistics', 'Big Data Engineering'],
    careerRoles: ['Machine Learning Engineer', 'Data Analyst / BI Specialist', 'AI Research Scientist', 'FinTech Risk Modeling Analyst'],
    yearByYearCurriculum: [
      { year: 'Year 1 (Tronc Commun)', focus: 'Foundational Rigor', courses: ['Calculus I & II', 'Linear Algebra', 'General Physics', 'Introductory Python & Logic'] },
      { year: 'Year 2 (Core Computing)', focus: 'Algorithmic Systems', courses: ['Data Structures & Algorithms', 'Discrete Mathematics', 'Relational Databases', 'Probability & Statistics'] },
      { year: 'Year 3 (Machine Learning)', focus: 'Deep Predictive Modeling', courses: ['Applied Machine Learning', 'Neural Networks', 'Cloud Data Pipelines (GCP/AWS)', 'Big Data with Spark'] },
      { year: 'Year 4 (Senior Capstone)', focus: 'Production AI Deployment', courses: ['Computer Vision / NLP', 'AI Ethics & Governance', 'Graduation Thesis / Company Internship'] },
    ],
    associatedScholarships: ['MPTC Digital Skill Full Scholarship', 'ITC Merit Tuition Waiver'],
    insiderTip: 'Do not wait for Year 3 to learn Git and Kaggle competitions. Building personal data projects in Year 1 puts you ahead for summer internships.',
    ratingScore: 98,
    matchedMentorId: 'men-001',
  },
  {
    id: 'major-se-cloud',
    majorName: 'Software Engineering & Cloud Architecture',
    field: 'Computing & AI',
    degreeType: 'Bachelor of Science (B.S.) / B.E.',
    duration: '4 Years',
    universities: [
      { name: 'Cambodia Academy of Digital Tech', abbr: 'CADT', type: 'Digital Academy', logoText: 'CADT' },
      { name: 'Royal University of Phnom Penh', abbr: 'RUPP', type: 'National University', logoText: 'RUPP' },
      { name: 'Paragon International University', abbr: 'Paragon', type: 'Digital Academy', logoText: 'PIU' },
    ],
    bacIIRequirements: [
      'Grade 12 Bac II Diploma (Math & English proficiency)',
      'CADT or RUPP FE Entrance Exam in Logic & Computing',
    ],
    troncCommunDifficulty: 'High (Practical Sprint)',
    foundationYearSummary:
      'CADT avoids traditional abstract theory; students write production TypeScript, React, and Python from week one with weekly group agile sprints.',
    salaryBenchmark: {
      junior: '$550 - $900 / mo',
      mid: '$1,000 - $1,900 / mo',
      senior: '$2,000 - $4,200+ / mo (Remote USD)',
    },
    keySkills: ['TypeScript / Node.js', 'React & Next.js', 'Docker & Kubernetes', 'Microservices Architecture', 'CI/CD Pipelines'],
    careerRoles: ['Full-Stack Software Engineer', 'Cloud / DevOps Architect', 'Mobile App Developer', 'Tech Startup Founder'],
    yearByYearCurriculum: [
      { year: 'Year 1', focus: 'Programming Fundamentals', courses: ['Modern JavaScript / Python', 'Git & Team Collaboration', 'Web Fundamentals', 'Computer Architecture'] },
      { year: 'Year 2', focus: 'System Design & Databases', courses: ['Object-Oriented Design', 'SQL & NoSQL Systems', 'Data Structures & Algorithms', 'API Engineering'] },
      { year: 'Year 3', focus: 'Full-Stack & Cloud', courses: ['Distributed Cloud Systems', 'DevOps & Containerization', 'Mobile App Development', 'Cybersecurity Basics'] },
      { year: 'Year 4', focus: 'Industry Capstone', courses: ['Enterprise Software Architecture', '6-Month Tech Company Internship', 'Startup Studio Project'] },
    ],
    associatedScholarships: ['MPTC Digital Skill Full Scholarship', 'SmartEdu University Scholarship'],
    insiderTip: 'Software companies in Phnom Penh care far more about your GitHub repositories and deployed live apps than exam scores.',
    ratingScore: 96,
    matchedMentorId: 'men-002',
  },
  {
    id: 'major-medicine',
    majorName: 'Doctor of Medicine (MD)',
    field: 'Health Sciences',
    degreeType: 'Doctorat d’État en Médecine',
    duration: '8 Years',
    universities: [
      { name: 'University of Health Sciences', abbr: 'UHS', type: 'Medical Premier', logoText: 'UHS' },
      { name: 'University of Puthisastra', abbr: 'UP', type: 'National University', logoText: 'UP' },
    ],
    bacIIRequirements: [
      'Strictly Grade 12 Science Track (High Grade A or B)',
      'National Medical Entrance Exam (Concours National) in Biology, Chemistry, and Math',
    ],
    troncCommunDifficulty: 'Intense (Concours Ranking)',
    foundationYearSummary:
      'Year 1 Foundation Year at UHS is high-stakes. Thousands sit for the entrance exam, and strict ranking GPA decides whether you enter Medicine, Dentistry, or Pharmacy.',
    salaryBenchmark: {
      junior: '$400 - $700 / mo (Residency)',
      mid: '$800 - $1,600 / mo',
      senior: '$2,000 - $5,000+ / mo (Specialist / Clinic)',
    },
    keySkills: ['Clinical Diagnostics', 'Human Anatomy & Physiology', 'Pathology & Pharmacology', 'Emergency Trauma Care', 'Patient Empathy'],
    careerRoles: ['Hospital Medical Officer', 'Specialist Physician (Cardio / Neuro / Peds)', 'Surgeon', 'Public Health Consultant'],
    yearByYearCurriculum: [
      { year: 'Year 1', focus: 'National Foundation Year', courses: ['Biophysics & Biochemistry', 'Cell Biology & Genetics', 'Medical Ethics', 'General Chemistry'] },
      { year: 'Years 2 - 3', focus: 'Pre-Clinical Sciences', courses: ['Human Gross Anatomy', 'Histology', 'Physiology', 'Medical Microbiology & Immunology'] },
      { year: 'Years 4 - 6', focus: 'Clinical Externship', courses: ['Internal Medicine', 'General Surgery', 'Pediatrics', 'Obstetrics & Gynecology', 'Hospital Ward Rotations'] },
      { year: 'Years 7 - 8', focus: 'Internship & Thesis', courses: ['Full-Time Hospital Internship', 'Specialty Rotation', 'National State Medical Defense Thesis'] },
    ],
    associatedScholarships: ['Government Public Health Merit Seats'],
    insiderTip: 'Master spaced repetition software (Anki) early. Medical school requires retaining thousands of anatomical terms and pharmacological dosages.',
    ratingScore: 94,
    matchedMentorId: 'men-004',
  },
  {
    id: 'major-pharmacy',
    majorName: 'Doctor of Pharmacy (Pharm.D.)',
    field: 'Health Sciences',
    degreeType: 'Doctor of Pharmacy (5 - 6 Years)',
    duration: '5 - 6 Years',
    universities: [
      { name: 'University of Health Sciences', abbr: 'UHS', type: 'Medical Premier', logoText: 'UHS' },
      { name: 'University of Puthisastra', abbr: 'UP', type: 'National University', logoText: 'UP' },
    ],
    bacIIRequirements: [
      'Grade 12 Science Track (Grade A, B, or C)',
      'National Health Entrance Exam (Chemistry & Biology focus)',
    ],
    troncCommunDifficulty: 'Intense (Concours Ranking)',
    foundationYearSummary:
      'Rigorous organic chemistry, pharmaceutical botany, biochemistry, and human cellular biology in Year 1.',
    salaryBenchmark: {
      junior: '$450 - $750 / mo',
      mid: '$850 - $1,600 / mo',
      senior: '$1,800 - $3,500+ / mo (Import / Wholesale)',
    },
    keySkills: ['Pharmacology & Toxicology', 'Medicinal Organic Chemistry', 'Hospital Pharmacy Dispensing', 'Drug Regulatory Affairs', 'Clinical Trials QA'],
    careerRoles: ['Clinical Hospital Pharmacist', 'Pharmaceutical Regulatory Officer', 'Medical Representative / Product Manager', 'Pharmacy Business Owner'],
    yearByYearCurriculum: [
      { year: 'Year 1', focus: 'Foundation Chemistry & Biology', courses: ['Organic Chemistry I', 'Pharmaceutical Botany', 'General Physiology', 'Biostatistics'] },
      { year: 'Years 2 - 3', focus: 'Drug Actions & Formulations', courses: ['Pharmacology & Therapeutics', 'Pharmacognosy', 'Pharmaceutics & Formulation', 'Microbiology'] },
      { year: 'Year 4', focus: 'Clinical Pharmacy & Toxicology', courses: ['Clinical Pharmacokinetics', 'Hospital Pharmacy Practice', 'Toxicology', 'Drug Law & Ethics'] },
      { year: 'Year 5', focus: 'Hospital Rotations & Defense', courses: ['Hospital Clinical Internship', 'Community Pharmacy Placement', 'Graduation Thesis Defense'] },
    ],
    associatedScholarships: ['UHS Merit Exemption', 'Ministry of Health Bursaries'],
    insiderTip: 'Pharmaceutical regulatory affairs and import distribution are among the fastest growing healthcare businesses in Cambodia.',
    ratingScore: 92,
  },
  {
    id: 'major-cybersecurity',
    majorName: 'Cybersecurity & Information Defense',
    field: 'Computing & AI',
    degreeType: 'Bachelor of Science (B.S.)',
    duration: '4 Years',
    universities: [
      { name: 'Cambodia Academy of Digital Tech', abbr: 'CADT', type: 'Digital Academy', logoText: 'CADT' },
      { name: 'Royal University of Phnom Penh', abbr: 'RUPP', type: 'National University', logoText: 'RUPP' },
    ],
    bacIIRequirements: [
      'Grade 12 Bac II (Math / Science or ICT track)',
      'Entrance aptitude in logic, networking principles, and English',
    ],
    troncCommunDifficulty: 'High (Practical Sprint)',
    foundationYearSummary:
      'First-year curriculum balances networking protocols, Linux administration, and foundational programming in Python and C.',
    salaryBenchmark: {
      junior: '$600 - $950 / mo',
      mid: '$1,100 - $2,000 / mo',
      senior: '$2,200 - $4,500+ / mo',
    },
    keySkills: ['Network Penetration Testing', 'SOC Incident Handling', 'Cryptography & PKI', 'Linux Hardening', 'SIEM & Cloud Security'],
    careerRoles: ['Cybersecurity Analyst', 'Ethical Hacker / Pen-Tester', 'Security Operations Center (SOC) Lead', 'Banking Cyber Defense Officer'],
    yearByYearCurriculum: [
      { year: 'Year 1', focus: 'Networks & Systems', courses: ['Computer Networks & TCP/IP', 'Linux System Administration', 'Programming with Python', 'Digital Logic'] },
      { year: 'Year 2', focus: 'Security Fundamentals', courses: ['Applied Cryptography', 'Operating Systems Internals', 'Information Security Policies', 'Database Security'] },
      { year: 'Year 3', focus: 'Defensive & Offensive Tech', courses: ['Ethical Hacking & Pen-Testing', 'Malware Analysis', 'Cloud Security (AWS/Azure)', 'Digital Forensics'] },
      { year: 'Year 4', focus: 'Live Operations & Capstone', courses: ['Incident Response & Threat Hunting', 'Security Auditing & Compliance', 'Industry Defense Internship'] },
    ],
    associatedScholarships: ['MPTC Cybersecurity Talent Scholarship', 'JICA Cyber Shield Fellowship'],
    insiderTip: 'Participate in local and ASEAN Capture-the-Flag (CTF) student competitions. Top telecom and banks scout winners directly.',
    ratingScore: 95,
  },
  {
    id: 'major-civil-eng',
    majorName: 'Civil & Structural Engineering',
    field: 'Engineering',
    degreeType: "Diplôme d'Ingénieur (5 Years)",
    duration: '5 Years',
    universities: [
      { name: 'Institute of Technology of Cambodia', abbr: 'ITC', type: 'Public Premier', logoText: 'ITC' },
    ],
    bacIIRequirements: [
      'Grade 12 Bac II (Strong Math & Physics)',
      'ITC Concours Entrance Exam (Math, Physics, Chemistry)',
    ],
    troncCommunDifficulty: 'Very High (Calculus Heavy)',
    foundationYearSummary:
      'The traditional French engineering Tronc Commun at ITC tests students in advanced calculus, solid mechanics, and materials science.',
    salaryBenchmark: {
      junior: '$450 - $750 / mo',
      mid: '$850 - $1,500 / mo',
      senior: '$1,800 - $3,200+ / mo',
    },
    keySkills: ['AutoCAD & Civil 3D', 'BIM Modeling (Revit)', 'Structural Mechanics', 'Soil & Geotechnical Analysis', 'Project Estimation & QA'],
    careerRoles: ['Structural Design Engineer', 'Construction Project Manager', 'Geotechnical Consultant', 'Urban Infrastructure Planner'],
    yearByYearCurriculum: [
      { year: 'Years 1 - 2', focus: 'Engineering Tronc Commun', courses: ['Differential Calculus', 'Engineering Mechanics', 'Thermodynamics', 'Strength of Materials'] },
      { year: 'Year 3', focus: 'Civil Fundamentals', courses: ['Fluid Mechanics', 'Surveying & Topography', 'Concrete Materials Technology', 'Structural Analysis I'] },
      { year: 'Year 4', focus: 'Advanced Design & BIM', courses: ['Reinforced Concrete Design', 'Steel Structure Engineering', 'Soil Mechanics & Foundations', 'AutoCAD & Revit'] },
      { year: 'Year 5', focus: 'Ingénieur Thesis', courses: ['Construction Management', 'Infrastructure Environmental Impact', 'Final Ingénieur Graduation Defense'] },
    ],
    associatedScholarships: ['ITC Excellence Exemption', 'JICA Civil Infrastructure Grants'],
    insiderTip: 'Learn BIM (Building Information Modeling) and Revit software early. Modern developers in Cambodia are rapidly phasing out 2D blueprints.',
    ratingScore: 91,
    matchedMentorId: 'men-001',
  },
  {
    id: 'major-arch-urban',
    majorName: 'Architecture & Sustainable Urban Design',
    field: 'Engineering',
    degreeType: 'Bachelor of Architecture (B.Arch - 5 Years)',
    duration: '5 Years',
    universities: [
      { name: 'Institute of Technology of Cambodia', abbr: 'ITC', type: 'Public Premier', logoText: 'ITC' },
      { name: 'Royal University of Fine Arts', abbr: 'RUFA', type: 'National University', logoText: 'RUFA' },
      { name: 'Norton University', abbr: 'Norton', type: 'National University', logoText: 'NU' },
    ],
    bacIIRequirements: [
      'Grade 12 Bac II (Science or Arts track)',
      'Aptitude Exam in Freehand Drawing, Spatial Geometry, and Math',
    ],
    troncCommunDifficulty: 'High (Practical Sprint)',
    foundationYearSummary:
      'Intensive studio drafting, spatial proportions, design history, and physical model making during Year 1.',
    salaryBenchmark: {
      junior: '$400 - $700 / mo',
      mid: '$800 - $1,600 / mo',
      senior: '$1,700 - $3,500+ / mo (Studio Principal)',
    },
    keySkills: ['ArchCAD & SketchUp', 'Revit BIM & Enscape', 'Sustainable Green Building (LEED)', 'Urban Masterplanning', 'Interior Space Conception'],
    careerRoles: ['Architectural Designer', 'Urban Planner', 'BIM Coordinator', 'Landscape & Heritage Architect'],
    yearByYearCurriculum: [
      { year: 'Year 1', focus: 'Design Fundamentals & Drawing', courses: ['Architectural Graphics & Freehand', 'History of Architecture', 'Visual Design Theory', 'Basic Physics & Structures'] },
      { year: 'Year 2', focus: 'Residential & Spatial Studios', courses: ['Studio Design II (Residential)', 'Building Materials & Methods', 'Computer-Aided Design (CAD)', 'Environmental Systems'] },
      { year: 'Year 3', focus: 'Commercial & Mixed-Use', courses: ['Studio Design III (Commercial)', 'Structural Systems for Architects', 'Sustainable Building Design', 'BIM Modeling'] },
      { year: 'Years 4 - 5', focus: 'Urban Scale & Thesis', courses: ['Urban Design Studio', 'Professional Practice & Building Codes', 'Comprehensive Graduation Thesis'] },
    ],
    associatedScholarships: ['RUFA Talent Grants', 'Norton Merit Scholarships'],
    insiderTip: 'Start documenting your design projects in a Behance / online portfolio right from Year 1. Architecture firms hire based on portfolio quality.',
    ratingScore: 90,
  },
  {
    id: 'major-fintech-biz',
    majorName: 'Digital Business & FinTech',
    field: 'Business & FinTech',
    degreeType: 'Bachelor of Digital Economy / FinTech',
    duration: '4 Years',
    universities: [
      { name: 'National University of Management', abbr: 'NUM', type: 'National University', logoText: 'NUM' },
      { name: 'Cambodia Academy of Digital Tech', abbr: 'CADT', type: 'Digital Academy', logoText: 'CADT' },
      { name: 'Royal University of Law & Economics', abbr: 'RULE', type: 'National University', logoText: 'RULE' },
    ],
    bacIIRequirements: [
      'Grade 12 Bac II (General or Science Track)',
      'Aptitude in Mathematics, Business English, and Analytical Thinking',
    ],
    troncCommunDifficulty: 'Moderate',
    foundationYearSummary:
      'Blends introductory programming, financial accounting, economic theory, and digital business modeling.',
    salaryBenchmark: {
      junior: '$500 - $850 / mo',
      mid: '$950 - $1,800 / mo',
      senior: '$2,000 - $3,800+ / mo',
    },
    keySkills: ['Bakong / QR Payment Architecture', 'Financial Modeling & Excel', 'Product Management', 'Data Visualization (PowerBI)', 'E-Commerce Logistics'],
    careerRoles: ['FinTech Product Manager', 'Digital Payment Operations Specialist', 'Business Intelligence Analyst', 'E-Commerce Growth Lead'],
    yearByYearCurriculum: [
      { year: 'Year 1', focus: 'Economics & Digital Tools', courses: ['Micro/Macroeconomics', 'Business Mathematics', 'Python for Business Analysis', 'Principles of Management'] },
      { year: 'Year 2', focus: 'Finance & Technology', courses: ['Financial Accounting', 'Corporate Finance', 'Database Management', 'Digital Marketing & Growth'] },
      { year: 'Year 3', focus: 'FinTech Ecosystems', courses: ['Mobile Payments & Bakong API', 'Blockchain & Digital Assets', 'Financial Data Analytics', 'FinTech Regulations'] },
      { year: 'Year 4', focus: 'Product Studio & Capstone', courses: ['Digital Product Management', 'Startup Venture Finance', 'Bank / FinTech Corporate Internship'] },
    ],
    associatedScholarships: ['SmartEdu University Scholarship', 'National Bank of Cambodia Fellowships'],
    insiderTip: 'Familiarize yourself with the National Bank of Cambodia’s Bakong payment system. Banking tech is the fastest growing corporate sector in Cambodia.',
    ratingScore: 93,
    matchedMentorId: 'men-003',
  },
];

interface MajorsAndCareersViewProps {
  opportunities?: OpportunityItem[];
  savedOpportunityIds?: string[];
  onToggleSaveOpportunity?: (id: string) => void;
  onNavigateTab?: (tab: TabView) => void;
  onStartAIChatWithPrompt?: (prompt: string) => void;
  onOpenBooking?: (mentor: Mentor) => void;
  onAskAdvisor?: (topic: string) => void;
  mentors?: Mentor[];
}

export const MajorsAndCareersView: React.FC<MajorsAndCareersViewProps> = ({
  opportunities = initialOpportunities,
  savedOpportunityIds = [],
  onToggleSaveOpportunity,
  onNavigateTab,
  onStartAIChatWithPrompt,
  onOpenBooking,
  onAskAdvisor,
  mentors = initialMentors,
}) => {
  const [activeTab, setActiveTab] = useState<'majors' | 'scholarships' | 'salaries'>('majors');
  const [selectedField, setSelectedField] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMajorForModal, setSelectedMajorForModal] = useState<MajorRoadmap | null>(null);

  // Scholarship filter state
  const [scholarshipSearchQuery, setScholarshipSearchQuery] = useState('');
  const [selectedScholarshipType, setSelectedScholarshipType] = useState<string>('ALL');

  // Ensure safe fallback for opportunities list
  const safeOpportunities = opportunities && opportunities.length > 0 ? opportunities : initialOpportunities;

  const fields = [
    { label: 'All Majors & Fields', value: 'ALL' },
    { label: 'Computing & AI', value: 'Computing & AI' },
    { label: 'Engineering', value: 'Engineering' },
    { label: 'Health Sciences', value: 'Health Sciences' },
    { label: 'Business & FinTech', value: 'Business & FinTech' },
  ];

  const filteredMajors = majorsData.filter((major) => {
    const matchesField = selectedField === 'ALL' || major.field === selectedField;
    const q = searchQuery.toLowerCase().trim();
    if (!matchesField) return false;
    if (!q) return true;
    return (
      major.majorName.toLowerCase().includes(q) ||
      major.field.toLowerCase().includes(q) ||
      major.degreeType.toLowerCase().includes(q) ||
      major.universities.some(
        (u) => u.name.toLowerCase().includes(q) || u.abbr.toLowerCase().includes(q)
      ) ||
      major.careerRoles.some((r) => r.toLowerCase().includes(q)) ||
      major.keySkills.some((s) => s.toLowerCase().includes(q)) ||
      major.bacIIRequirements.some((b) => b.toLowerCase().includes(q))
    );
  });

  const filteredScholarships = safeOpportunities.filter((opp) => {
    const matchesType =
      selectedScholarshipType === 'ALL' ||
      opp.type.toLowerCase().includes(selectedScholarshipType.toLowerCase()) ||
      opp.tags.some((t) => t.toLowerCase().includes(selectedScholarshipType.toLowerCase()));
    const q = scholarshipSearchQuery.toLowerCase().trim();
    if (!matchesType) return false;
    if (!q) return true;
    return (
      opp.title.toLowerCase().includes(q) ||
      opp.provider.toLowerCase().includes(q) ||
      opp.description.toLowerCase().includes(q) ||
      opp.tags.some((t) => t.toLowerCase().includes(q)) ||
      opp.location.toLowerCase().includes(q)
    );
  });

  const handleConsultAIAboutMajor = (major: MajorRoadmap) => {
    const prompt = `I want to learn more about studying ${major.majorName} in Cambodia at universities like ${major.universities.map((u) => u.abbr).join(', ')}. What should I prepare in Grade 12 Bac II, how difficult is the foundation year, and what are the top career prospects?`;
    if (onStartAIChatWithPrompt) {
      onStartAIChatWithPrompt(prompt);
    } else if (onAskAdvisor) {
      onAskAdvisor(major.majorName);
    } else if (onNavigateTab) {
      onNavigateTab('advisor');
    }
  };

  const handleConnectWithMentorForMajor = (major: MajorRoadmap) => {
    const matched =
      mentors.find((m) => m.id === major.matchedMentorId) ||
      mentors.find((m) =>
        major.universities.some(
          (u) => m.university.toLowerCase().includes(u.abbr.toLowerCase()) || m.major.toLowerCase().includes(major.field.toLowerCase())
        )
      ) ||
      mentors[0];

    if (onOpenBooking && matched) {
      onOpenBooking(matched);
    } else if (onNavigateTab) {
      onNavigateTab('mentors');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in-50 duration-300">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Majors & Careers Directory
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Cambodia Curated
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                Comprehensive degree roadmaps, Bac II prerequisite requirements, foundation year survival guides, and Cambodian market salary benchmarks.
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl shrink-0 border border-slate-200">
          <button
            onClick={() => setActiveTab('majors')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'majors'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span>Degree Roadmaps ({majorsData.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('scholarships')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'scholarships'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            <span>Scholarships ({safeOpportunities.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('salaries')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'salaries'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-amber-600" />
            <span>Salary Benchmarks</span>
          </button>
        </div>
      </div>

      {/* TAB 1: MAJORS ROADMAPS */}
      {activeTab === 'majors' && (
        <div className="space-y-6">
          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search majors, universities (ITC, CADT, UHS), skills..."
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
              {fields.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setSelectedField(f.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    selectedField === f.value
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Empty Search State */}
          {filteredMajors.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                <Search className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">No matching majors found</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  We couldn&apos;t find any majors matching &quot;{searchQuery}&quot; under the selected category.
                </p>
              </div>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedField('ALL');
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
              >
                Reset Search &amp; Filters
              </button>
            </div>
          ) : (
            /* Majors Grid */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredMajors.map((major) => (
                <div
                  key={major.id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5 group"
                >
                  <div className="space-y-4">
                    {/* Top Row: Field Badge, Degree Duration */}
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {major.field}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {major.duration} • {major.degreeType}
                      </span>
                    </div>

                    {/* Major Title */}
                    <div>
                      <h2
                        onClick={() => setSelectedMajorForModal(major)}
                        className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition cursor-pointer"
                      >
                        {major.majorName}
                      </h2>

                      {/* Universities Offering */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <span className="text-[11px] text-slate-400 font-medium mr-1">Offered at:</span>
                        {major.universities.map((u, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            {u.abbr}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Foundation Year / Tronc Commun Callout */}
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-indigo-600" />
                          Foundation Year / Tronc Commun:
                        </span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                          {major.troncCommunDifficulty}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {major.foundationYearSummary}
                      </p>
                    </div>

                    {/* High Demand Skills */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Core Technical Skills Taught:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {major.keySkills.map((sk, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] font-semibold px-2.5 py-0.5 bg-blue-50 text-blue-800 rounded-md border border-blue-100"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Salary Benchmark Bar */}
                    <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-100 flex items-center justify-between text-xs text-emerald-950">
                      <div>
                        <span className="text-[10px] uppercase font-extrabold text-emerald-700 block tracking-wider">
                          Estimated Cambodia Salary:
                        </span>
                        <span className="font-bold text-emerald-900">
                          Junior {major.salaryBenchmark.junior}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-emerald-600 block">Senior / Lead:</span>
                        <span className="font-bold text-emerald-900">{major.salaryBenchmark.senior}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleConsultAIAboutMajor(major)}
                      className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Ask AI Advisor</span>
                    </button>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedMajorForModal(major)}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition shadow-xs flex items-center space-x-1.5"
                      >
                        <span>Curriculum &amp; Roadmaps</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CURATED SCHOLARSHIPS */}
      {activeTab === 'scholarships' && (
        <div className="space-y-6">
          <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-900">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                Verified university scholarships, government full-tuition bursaries (MPTC), and corporate grants available for Grade 12 students.
              </span>
            </div>
            <span className="font-bold shrink-0">{safeOpportunities.length} Verified Scholarships</span>
          </div>

          {/* Scholarship Search & Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={scholarshipSearchQuery}
                onChange={(e) => setScholarshipSearchQuery(e.target.value)}
                placeholder="Search scholarship name, provider, tech..."
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
              {[
                { label: 'All Grants', value: 'ALL' },
                { label: 'Full Scholarships', value: 'Full' },
                { label: 'Technology / MPTC', value: 'Technology' },
                { label: 'Living Allowance', value: 'Stipend' },
              ].map((pill) => (
                <button
                  key={pill.value}
                  onClick={() => setSelectedScholarshipType(pill.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    selectedScholarshipType === pill.value
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {filteredScholarships.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-3">
              <p className="text-xs text-slate-500">No scholarships matching your criteria.</p>
              <button
                onClick={() => {
                  setScholarshipSearchQuery('');
                  setSelectedScholarshipType('ALL');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                Reset Scholarship Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredScholarships.map((opp) => {
                const isSaved = savedOpportunityIds?.includes(opp.id) || false;
                return (
                  <div
                    key={opp.id}
                    className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {opp.type}
                        </span>
                        <button
                          onClick={() => onToggleSaveOpportunity?.(opp.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isSaved
                              ? 'text-indigo-600 bg-indigo-50'
                              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                          }`}
                          title={isSaved ? 'Remove from Saved' : 'Save Scholarship'}
                        >
                          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-indigo-600' : ''}`} />
                        </button>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                        {opp.title}
                      </h3>

                      <p className="text-xs text-indigo-600 font-semibold">{opp.provider}</p>

                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Coverage:</span>
                          <span className="font-bold text-emerald-700">{opp.coverageOrStipend}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Deadline:</span>
                          <span className="font-bold text-slate-800">{opp.deadline}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Location:</span>
                          <span className="text-slate-700 truncate">{opp.location}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                        {opp.description}
                      </p>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {opp.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-emerald-700 font-bold flex items-center space-x-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{opp.matchScore}% Match for your Profile</span>
                      </span>

                      <a
                        href={opp.link}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 transition shadow-xs"
                      >
                        <span>Official Portal</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SALARY BENCHMARKS */}
      {activeTab === 'salaries' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Cambodia Tech &amp; Engineering Salary Benchmarks 2026
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Compiled from verified job postings, alumni reporting at ITC/CADT/RUPP, and ASEAN remote employment standards.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-extrabold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4 rounded-l-xl">Specialization &amp; Major</th>
                  <th className="py-3 px-4">Junior (0-2 Yrs)</th>
                  <th className="py-3 px-4">Mid-Level (3-5 Yrs)</th>
                  <th className="py-3 px-4">Senior / Lead (5+ Yrs)</th>
                  <th className="py-3 px-4 rounded-r-xl">Top Employers in Cambodia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {majorsData.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{m.majorName}</p>
                      <span className="text-[10px] text-slate-400">{m.field}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-700">{m.salaryBenchmark.junior}</td>
                    <td className="py-3.5 px-4 font-semibold text-indigo-700">{m.salaryBenchmark.mid}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{m.salaryBenchmark.senior}</td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {m.universities.map((u) => u.abbr).join(', ')} Alumni Network
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p>
              <strong>Note on Remote &amp; International Salaries:</strong> Cambodian engineers who master English proficiency and modern cloud/AI stacks (TypeScript, Python, AWS) frequently land remote positions in Singapore, Australia, and US startups paying $2,500 - $5,000+/month while residing in Cambodia.
            </p>
          </div>
        </div>
      )}

      {/* Full Major Details Modal */}
      {selectedMajorForModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedMajorForModal(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {selectedMajorForModal.field}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  {selectedMajorForModal.majorName}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedMajorForModal.degreeType} • {selectedMajorForModal.duration}
                </p>
              </div>
              <button
                onClick={() => setSelectedMajorForModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* University Partners */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Top Universities Offering This Program
              </h4>
              <div className="grid sm:grid-cols-2 gap-3">
                {selectedMajorForModal.universities.map((u, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center text-xs shrink-0">
                      {u.logoText}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs">{u.name}</p>
                      <p className="text-[11px] text-indigo-600 font-semibold">{u.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bac II Requirements */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                High School Bac II Entrance Requirements
              </h4>
              <ul className="space-y-1 text-xs text-slate-700">
                {selectedMajorForModal.bacIIRequirements.map((req, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Year-by-Year Curriculum Roadmap */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                4-Year Curriculum Roadmap
              </h4>
              <div className="grid sm:grid-cols-2 gap-3">
                {selectedMajorForModal.yearByYearCurriculum.map((yr, i) => (
                  <div key={i} className="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{yr.year}</span>
                      <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                        {yr.focus}
                      </span>
                    </div>
                    <ul className="text-[11px] text-slate-600 space-y-0.5 list-disc list-inside">
                      {yr.courses.map((c, ci) => (
                        <li key={ci}>{c}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Senior Insider Advice */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-1.5 text-xs text-indigo-950">
              <span className="font-bold flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Senior Student Tip:</span>
              </span>
              <p className="italic text-slate-700">&quot;{selectedMajorForModal.insiderTip}&quot;</p>
            </div>

            {/* Connect with Senior Mentor CTA */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Want 1-on-1 guidance for this major?</h4>
                  <p className="text-[11px] text-slate-500">
                    Connect with senior students and alumni from {selectedMajorForModal.universities.map(u => u.abbr).join('/')}.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  const m = selectedMajorForModal;
                  setSelectedMajorForModal(null);
                  handleConnectWithMentorForMajor(m);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shrink-0 transition"
              >
                Meet Mentor
              </button>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  const m = selectedMajorForModal;
                  setSelectedMajorForModal(null);
                  handleConsultAIAboutMajor(m);
                }}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs"
              >
                <Sparkles className="w-4 h-4" />
                <span>Ask AI Advisor About {selectedMajorForModal.majorName}</span>
              </button>

              <button
                onClick={() => setSelectedMajorForModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
