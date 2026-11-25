export type DataConfidenceLevel = 'official' | 'verified' | 'community' | 'unverified';

export interface DataConfidenceBadge {
  level: DataConfidenceLevel;
  stars: number;
  sourceLabel: string;
  sourceUrl?: string;
  lastVerifiedDate: string;
  verificationMethod: string;
}

export interface UniversityProfileScore {
  overall: number;
  academicReputation: number;
  industryConnection: number;
  facilities: number;
  graduateOutcome: number;
}

export interface CourseYearStructure {
  year: number;
  title: string;
  focus: string;
  subjects: string[];
}

export interface MajorProgramDetail {
  id: string;
  name: string;
  alternativeNames: string[];
  faculty: string;
  degreeType: string;
  durationYears: number;
  difficultyRating: number;
  difficultyReason: string;
  courseStructure: CourseYearStructure[];
  technicalSkillsGained: string[];
  softSkillsGained: string[];
  careerPathways: string[];
  jobMarketDemand: 'High' | 'Very High' | 'Moderate' | 'Growing';
  demandReason: string;
  averageStartingSalary: string;
  employerRequirements: {
    basic: string[];
    competitive: string[];
  };
  recommendedFor: string[];
  notRecommendedIf: string;
  alternativeMajorSuggestions: Array<{
    majorName: string;
    why: string;
  }>;
  level?: string;
  languageOfInstruction?: string;
  description?: string;
}

export interface UniversityGalleryImage {
  url: string;
  caption: string;
  category?: 'Campus & Architecture' | 'Labs & Tech Centers' | 'Classrooms & Libraries' | 'Student Life & Events';
}

export interface UniversityProgramItem {
  name: string;
  level: 'Bachelor' | 'Master' | 'Doctoral' | 'Engineering Degree' | 'Associate' | 'Professional Certification';
  duration: string;
  language: string;
  degreeAwarded: string;
  description?: string;
}

export interface UniversityDepartmentItem {
  name: string;
  faculty: string;
  description?: string;
  keySpecializations?: string[];
}

export interface UniversityContact {
  phone: string;
  email: string;
  address: string;
  website?: string;
  admissionsOffice?: string;
}

export interface UniversityFacultyItem {
  name: string;
  khmerName?: string;
  dean?: string;
  departments: string[];
  description?: string;
}

export interface UniversityOtherCosts {
  registrationFee: string;
  laboratoryFee: string;
  booksAndMaterials: string;
  uniform: string;
  dormitoryCost: string;
  graduationFee: string;
  details?: string;
}

export interface UniversityFinancialInfo {
  tuitionFeePerYearUSD: number;
  totalDegreeCostUSD: number;
  paymentSchedule: string;
  financialAid?: string | boolean;
  scholarshipDetails: {
    hasFullScholarship: boolean;
    scholarshipNames: string[];
    financialAidAvailable: boolean | string;
    financialAidDetails: string;
    requirements: string;
    applicationDeadline: string;
  };
  otherCosts: UniversityOtherCosts;
}

export interface UniversityStudentExperience {
  campusFacilities: string[];
  library: {
    name: string;
    description: string;
    digitalLibrary: string;
    studySpaces: string;
    digitalAccess?: string;
  };
  laboratory: {
    name: string;
    specialization: string;
  }[];
  laboratories?: {
    name: string;
    specialization: string;
  }[];
  studentClubs: string[];
  dormitory: {
    available: boolean | string;
    description: string;
    type: string;
    pricingOrEligibility: string;
    pricing?: string;
  };
}

export interface UniversityCareerInfo {
  graduateEmploymentRate: string;
  averageStartingSalaryUSD: string;
  industryConnections: string[];
  internshipOpportunity: {
    status: string;
    details: string;
    partnerCompanies: string[];
  };
  alumniNetwork: {
    associationName: string;
    overview: string;
    topCompanies: string[];
  };
}

export interface UniversityRankingInfo {
  nationalRank: string;
  nationalRanking?: string;
  regionalStanding: string;
  reputationHighlights: string[] | string;
  academicReputationScore: number;
  theoryVsPracticeRatio: string;
  studentToFacultyRatio: string;
}

export interface UniversityAccreditationDetails {
  institutionalAccreditation: string;
  nationalAccreditationBody: string;
  regionalAccreditation?: string;
  internationalAccreditation?: string;
  status: string;
  certifiedYear?: string;
  validUntil?: string;
  verificationSource?: string;
}

export interface ComprehensiveUniversityProfile {
  id: string;
  name: string;
  khmerName?: string;
  abbr: string;
  location: string;
  type: 'Public' | 'Private' | 'Semi-Autonomous';
  foundedYear: number;
  website: string;
  logo: string;
  coverImage: string;
  photos?: string[];
  gallery?: UniversityGalleryImage[];
  programs?: UniversityProgramItem[];
  departments?: UniversityDepartmentItem[];
  contact?: UniversityContact;
  facultiesList?: UniversityFacultyItem[];
  financialInfo?: UniversityFinancialInfo;
  studentExperience?: UniversityStudentExperience;
  careerInfo?: UniversityCareerInfo;
  rankingReputation?: UniversityRankingInfo;
  profileScore: UniversityProfileScore;
  accreditation: {
    governmentRecognition: string;
    internationalAccreditation?: string;
    professionalAccreditation?: string;
    status: 'Fully Accredited' | 'Provisional' | 'Internationally Certified' | 'Not specified';
    isKnown?: boolean;
    accAccreditation?: string;
    verificationSource?: string;
  };
  facultyCount: number;
  majorsCount: number;
  theoryVsPracticeRatio: string;
  studentToFacultyRatio: string;
  curriculumHighlight: string;
  majors: MajorProgramDetail[];
  rankingInfo?: UniversityRankingInfo;
  campusDescription: string;
  facilities: string[];
  studentClubs: string[];
  environmentHighlight: string;
  annualTuitionUSD: number;
  totalDegreeCostUSD: number;
  paymentSchedule: string;
  scholarships: {
    hasFullScholarship: boolean;
    scholarshipNames: string[];
    financialAidAvailable: boolean;
    requirements: string;
    applicationDeadline: string;
  };
  averageGraduateSalaryMonthlyUSD: number;
  estimatedROIPaybackMonths: number;
  employmentRate6Months: number;
  averageTimeToJobMonths: number;
  topAlumniCompanies: string[];
  industryPartnerships: string[];
  hasGuaranteedInternship: boolean;
  admissionRequirements: {
    gpaRequirement: string;
    nationalExamRequirement: string;
    entranceExamRequired: boolean;
    entranceExamDetails: string;
    englishRequirement: string;
  };
  applicationDifficulty: 'Easy' | 'Medium' | 'Competitive / High Stakes';
  importantDates: {
    applicationOpens: string;
    applicationDeadline: string;
    examDate: string;
    announcementDate: string;
  };
  studentFit: {
    bestFor: string[];
    notRecommendedFor: string[];
  };
  dataConfidence: DataConfidenceBadge;
}
