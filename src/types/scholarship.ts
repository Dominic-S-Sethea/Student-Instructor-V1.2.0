export type DegreeLevel = 'Bachelor' | 'Master' | 'PhD';

export type FieldOfStudy =
  | 'Business'
  | 'Engineering'
  | 'Computer Science'
  | 'Medicine'
  | 'Agriculture'
  | 'Education'
  | 'Other';

export type ScholarshipRegion =
  | 'USA'
  | 'Canada'
  | 'Europe'
  | 'Australia'
  | 'Japan'
  | 'Korea'
  | 'China'
  | 'Singapore'
  | 'ASEAN'
  | 'Cambodia'
  | 'Global';

export type FundingType = 'Fully funded' | 'Tuition only' | 'Partial funding';

export type StudentCategory =
  | 'High School Students'
  | 'University Students'
  | 'Graduates & Professionals';

export type VerificationStatus =
  | 'Verified Official'
  | 'Pending Verification'
  | 'Community Reported'
  | 'Requires Update';

export interface ScholarshipChangeRecord {
  id: string;
  date: string;
  field: string;
  oldValue: string;
  newValue: string;
  detectedBy: string;
  verified: boolean;
}

export interface ScholarshipItem {
  id: string;
  name: string;
  nameKm: string;
  provider: string;
  providerKm: string;
  country: string;
  countryKm: string;
  region: ScholarshipRegion;
  degreeLevel: DegreeLevel[];
  fieldOfStudy: FieldOfStudy[];
  overview: string;
  overviewKm: string;

  // Eligibility
  nationalityRequirement: string;
  nationalityRequirementKm: string;
  minGpa: number | null; // e.g. 3.0 or null
  maxAge: number | null; // e.g. 35 or null
  workExpYears: number; // e.g. 0, 2
  englishRequirement: {
    testType: 'IELTS' | 'TOEFL' | 'Duolingo' | 'Exempt / Not Required' | 'Institutional';
    minScore: string;
    details: string;
    detailsKm: string;
  };
  requiredDocuments: string[];
  requiredDocumentsKm: string[];
  eligibleStudentCategories: ('High School Students' | 'University Students' | 'Graduates / Professionals')[];

  // Financial Information
  fundingType: FundingType;
  fundingTypeKm: string;
  totalEstimatedValueUSD: number;
  tuitionCoverage: string;
  tuitionCoverageKm: string;
  accommodation: string;
  accommodationKm: string;
  monthlyAllowance: string;
  monthlyAllowanceKm: string;
  flightSupport: string;
  flightSupportKm: string;
  insurance: string;
  insuranceKm: string;
  otherBenefits: string[];
  otherBenefitsKm: string[];

  // Application
  openingDate: string;
  deadline: string;
  deadlineType: 'Fixed Date' | 'Annual Cycle' | 'Rolling';
  applicationLink: string;
  selectionStages: string[];
  selectionStagesKm: string[];

  // Verification & Quality
  officialSourceUrl: string;
  verificationStatus: VerificationStatus;
  lastVerifiedDate: string;
  lastUpdatedDate: string;
  updateFrequency: 'Quarterly' | 'Bi-annual' | 'Annual' | 'Continuous';
  qualityScore: number; // 0 - 100
  verifiedBadge: boolean;
  verifierName: string;
  popularityCount: number;

  // Change detection records
  changeHistory?: ScholarshipChangeRecord[];
}

export interface ScholarshipFiltersState {
  searchQuery: string;
  region: string; // 'all' or ScholarshipRegion
  degreeLevel: string; // 'all' or DegreeLevel
  fieldOfStudy: string; // 'all' or FieldOfStudy
  fundingType: string; // 'all' or FundingType
  minGpaMax: number | null;
  englishReq: string; // 'all' | 'ielts_le_6' | 'ielts_le_6.5' | 'no_english_required'
  studentCategory: string; // 'all' | 'High School Students' | 'University Students' | 'Graduates / Professionals'
  onlyVerified: boolean;
  sortBy: 'latest_updated' | 'deadline_approaching' | 'fully_funded' | 'most_popular';
}

export type ScholarshipFilters = ScholarshipFiltersState;

export interface UserSavedScholarship {
  scholarshipId: string;
  savedAt: string;
  deadlineReminderEnabled: boolean;
  reminderDaysBefore: number;
  notes?: string;
}

export interface UserErrorReport {
  id: string;
  scholarshipId: string;
  scholarshipName: string;
  reportedField: 'deadline' | 'eligibility' | 'funding' | 'link_broken' | 'other';
  description: string;
  suggestedCorrection?: string;
  officialSourceUrl?: string;
  reporterEmail?: string;
  submittedAt: string;
  status: 'Pending Review' | 'Verified & Fixed' | 'Dismissed';
  adminNotes?: string;
}

export interface OrganizationSubmission {
  id: string;
  organizationName: string;
  contactPerson: string;
  contactEmail: string;
  officialWebsite: string;
  scholarshipName: string;
  scholarshipNameKm?: string;
  country: string;
  region: ScholarshipRegion;
  degreeLevel: DegreeLevel[];
  fieldOfStudy: FieldOfStudy[];
  fundingType: FundingType;
  fundingDetails: string;
  eligibilitySummary: string;
  deadline: string;
  applicationLink: string;
  officialSourceUrl: string;
  submittedAt: string;
  status: 'Pending Admin Review' | 'Approved & Published' | 'Rejected';
  reviewNotes?: string;
}
