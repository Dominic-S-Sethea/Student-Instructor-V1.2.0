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
  | 'Unverified'
  | 'Community Reported'
  | 'Requires Update';

export interface TriStateBenefit {
  state: 'included' | 'excluded' | 'unknown';
  label: string;
  labelKm: string;
  isKnown: boolean;
}

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
  minGpa: number | null;
  maxAge: number | null;
  workExpYears: number | null;
  englishRequirement: {
    testType: string;
    minScore: string;
    details: string;
    detailsKm: string;
  };
  requiredDocuments: string[];
  requiredDocumentsKm: string[];
  eligibleStudentCategories: string[];

  // Financial Information
  fundingType: FundingType;
  fundingTypeKm: string;
  totalEstimatedValueUSD: number | null;
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
  benefitStates?: {
    monthlyAllowanceKnown: boolean;
    accommodation: TriStateBenefit;
    flightSupport: TriStateBenefit;
    insurance: TriStateBenefit;
  };
  otherBenefits: string[];
  otherBenefitsKm: string[];

  // Application
  openingDate: string | null;
  deadline: string;
  deadlineType: 'Fixed Date' | 'Annual Cycle' | 'Rolling' | 'Unknown';
  deadlineStatus?: 'open' | 'closing_soon' | 'expired' | 'rolling' | 'unknown';
  daysRemaining?: number | null;
  applicationLink: string;
  selectionStages: string[];
  selectionStagesKm: string[];

  // Verification & Quality
  officialSourceUrl: string;
  verificationStatus: VerificationStatus;
  verificationState?: 'verified' | 'unverified' | 'pending';
  lastVerifiedDate: string | null;
  lastUpdatedDate: string | null;
  updateFrequency: 'Quarterly' | 'Bi-annual' | 'Annual' | 'Continuous';
  qualityScore: number;
  verifiedBadge: boolean;
  verifierName: string | null;
  popularityCount: number;

  changeHistory?: ScholarshipChangeRecord[];
}

export interface ScholarshipFiltersState {
  searchQuery: string;
  region: string;
  degreeLevel: string;
  fieldOfStudy: string;
  fundingType: string;
  minGpaMax: number | null;
  englishReq: string;
  studentCategory: string;
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
  submittedByUserId?: string | null;
  publishedScholarshipId?: string | null;
  submittedAt: string;
  status: 'Pending Admin Review' | 'Approved & Published' | 'Rejected';
  reviewNotes?: string;
}
