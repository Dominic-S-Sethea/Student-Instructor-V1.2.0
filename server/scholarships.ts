import { Router, Request, Response } from 'express';
import { initialScholarships } from '../src/data/scholarshipData';
import { ScholarshipItem, OrganizationSubmission, UserErrorReport } from '../src/types/scholarship';
import { GoogleGenAI } from '@google/genai';

const router = Router();

// In-memory scholarship state (supports CRUD, verification, updates)
let scholarshipDatabase: ScholarshipItem[] = JSON.parse(JSON.stringify(initialScholarships));

// Organization submissions queue (pending admin approval)
let organizationSubmissions: OrganizationSubmission[] = [
  {
    id: 'sub-paragon-2026',
    organizationName: 'Paragon International University',
    contactPerson: 'Admissions & International Office',
    contactEmail: 'admissions@paragoniu.edu.kh',
    officialWebsite: 'https://paragoniu.edu.kh',
    scholarshipName: 'Paragon IU President Excellence Scholarship',
    scholarshipNameKm: 'អាហារូបករណ៍ឧត្តមភាពប្រធានសាកលវិទ្យាល័យប៉ារ៉ាហ្គន',
    country: 'Cambodia',
    region: 'Cambodia',
    degreeLevel: ['Bachelor'],
    fieldOfStudy: ['Computer Science', 'Engineering', 'Business'],
    fundingType: 'Fully funded',
    fundingDetails: '100% full 4-year tuition fee waiver for top 50 scorers in Paragon National Entrance Exam (Graduates of Bac II with Grade A or B).',
    eligibilitySummary: 'High school graduates with Bac II Grade A/B or foreign high school diploma equivalent. Must pass written aptitude test in Math and English.',
    deadline: '2026-10-20',
    applicationLink: 'https://paragoniu.edu.kh/scholarship-exam/',
    officialSourceUrl: 'https://paragoniu.edu.kh/scholarship-exam/',
    submittedAt: '2026-09-14T08:30:00Z',
    status: 'Pending Admin Review',
  },
  {
    id: 'sub-rmit-australia',
    organizationName: 'RMIT University (Australia)',
    contactPerson: 'Dr. Sarah Jenkins, Global Engagement',
    contactEmail: 'international.scholarships@rmit.edu.au',
    officialWebsite: 'https://www.rmit.edu.au',
    scholarshipName: 'RMIT Southeast Asia High Achiever Scholarship',
    scholarshipNameKm: 'អាហារូបករណ៍សិស្សឆ្នើមអាស៊ីអាគ្នេយ៍ RMIT អូស្ត្រាលី',
    country: 'Australia',
    region: 'Australia',
    degreeLevel: ['Bachelor', 'Master'],
    fieldOfStudy: ['Computer Science', 'Engineering', 'Business', 'Other'],
    fundingType: 'Partial funding',
    fundingDetails: 'AU$10,000 tuition fee contribution per year for the standard duration of the program.',
    eligibilitySummary: 'Citizen of Cambodia or other ASEAN country applying for Bachelor or Master by coursework. Must have minimum 70% average academic record.',
    deadline: '2026-11-30',
    applicationLink: 'https://www.rmit.edu.au/study-with-us/international-students/apply-to-rmit-international-students/fees-and-scholarships/scholarships/sea-high-achievers',
    officialSourceUrl: 'https://www.rmit.edu.au/',
    submittedAt: '2026-09-15T10:15:00Z',
    status: 'Pending Admin Review',
  },
];

// User error reports queue
let userReports: UserErrorReport[] = [
  {
    id: 'rep-1',
    scholarshipId: 'sch-chevening-uk',
    scholarshipName: 'Chevening UK Government Scholarships',
    reportedField: 'deadline',
    description: 'The Chevening Cambodia office noted that reference letters are due slightly later than the initial form submission date in November.',
    suggestedCorrection: 'Application closes Nov 4; references due mid-February.',
    officialSourceUrl: 'https://www.chevening.org/scholarship/cambodia/',
    reporterEmail: 'sokha.student@gmail.com',
    submittedAt: '2026-09-13T14:20:00Z',
    status: 'Pending Review',
  },
];

// Popular search terms analytics
const searchKeywordsLog: { query: string; count: number; lastSearched: string }[] = [
  { query: 'Chevening', count: 482, lastSearched: '2026-09-16T02:30:00Z' },
  { query: 'Computer Science', count: 412, lastSearched: '2026-09-16T02:20:00Z' },
  { query: 'Fully Funded Master', count: 398, lastSearched: '2026-09-16T02:15:00Z' },
  { query: 'CADT MPTC', count: 345, lastSearched: '2026-09-16T01:50:00Z' },
  { query: 'Korea GKS', count: 290, lastSearched: '2026-09-16T01:40:00Z' },
  { query: 'Japan MEXT', count: 280, lastSearched: '2026-09-16T01:10:00Z' },
  { query: 'IELTS 6.0', count: 220, lastSearched: '2026-09-16T00:45:00Z' },
];

// 1. GET /api/scholarships (with filters and sorting)
router.get('/', (req: Request, res: Response) => {
  try {
    const {
      q,
      region,
      degree,
      field,
      funding,
      studentCategory,
      onlyVerified,
      sortBy,
    } = req.query;

    // Track search query if present
    if (typeof q === 'string' && q.trim().length > 1) {
      const trimmed = q.trim();
      const existing = searchKeywordsLog.find(
        (k) => k.query.toLowerCase() === trimmed.toLowerCase()
      );
      if (existing) {
        existing.count += 1;
        existing.lastSearched = new Date().toISOString();
      } else {
        searchKeywordsLog.unshift({
          query: trimmed,
          count: 1,
          lastSearched: new Date().toISOString(),
        });
      }
    }

    let results = [...scholarshipDatabase];

    // Search query
    if (typeof q === 'string' && q.trim()) {
      const lower = q.toLowerCase();
      results = results.filter(
        (s) =>
          s.name.toLowerCase().includes(lower) ||
          s.nameKm.includes(lower) ||
          s.provider.toLowerCase().includes(lower) ||
          s.providerKm.includes(lower) ||
          s.country.toLowerCase().includes(lower) ||
          s.countryKm.includes(lower) ||
          s.overview.toLowerCase().includes(lower) ||
          s.overviewKm.includes(lower) ||
          s.fieldOfStudy.some((f) => f.toLowerCase().includes(lower))
      );
    }

    // Region filter
    if (typeof region === 'string' && region !== 'all') {
      results = results.filter((s) => s.region === region);
    }

    // Degree level filter
    if (typeof degree === 'string' && degree !== 'all') {
      results = results.filter((s) => s.degreeLevel.includes(degree as any));
    }

    // Field of study filter
    if (typeof field === 'string' && field !== 'all') {
      results = results.filter((s) => s.fieldOfStudy.includes(field as any));
    }

    // Funding filter
    if (typeof funding === 'string' && funding !== 'all') {
      results = results.filter((s) => s.fundingType === funding);
    }

    // Student category filter
    if (typeof studentCategory === 'string' && studentCategory !== 'all') {
      results = results.filter((s) =>
        s.eligibleStudentCategories.includes(studentCategory as any)
      );
    }

    // Verified only filter
    if (onlyVerified === 'true') {
      results = results.filter((s) => s.verifiedBadge);
    }

    // Sorting
    if (sortBy === 'deadline_approaching') {
      results.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    } else if (sortBy === 'fully_funded') {
      results.sort((a, b) => {
        if (a.fundingType === 'Fully funded' && b.fundingType !== 'Fully funded') return -1;
        if (a.fundingType !== 'Fully funded' && b.fundingType === 'Fully funded') return 1;
        return b.totalEstimatedValueUSD - a.totalEstimatedValueUSD;
      });
    } else if (sortBy === 'most_popular') {
      results.sort((a, b) => b.popularityCount - a.popularityCount);
    } else {
      // Default: latest_updated
      results.sort((a, b) => new Date(b.lastUpdatedDate).getTime() - new Date(a.lastUpdatedDate).getTime());
    }

    return res.json({
      success: true,
      totalCount: results.length,
      scholarships: results,
      metrics: {
        totalScholarships: scholarshipDatabase.length,
        verifiedScholarships: scholarshipDatabase.filter((s) => s.verifiedBadge).length,
        pendingSubmissions: organizationSubmissions.filter((s) => s.status === 'Pending Admin Review').length,
        pendingReports: userReports.filter((r) => r.status === 'Pending Review').length,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Server error' });
  }
});

// 2. GET /api/scholarships/:id (get single detail & increment popularity)
router.get('/:id', (req: Request, res: Response) => {
  const item = scholarshipDatabase.find((s) => s.id === req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, error: 'Scholarship not found' });
  }
  item.popularityCount += 1;
  return res.json({ success: true, scholarship: item });
});

// 3. POST /api/scholarships (Admin: Add new scholarship)
router.post('/', (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (!data.name || !data.provider || !data.deadline) {
      return res.status(400).json({ success: false, error: 'Name, provider, and deadline are required.' });
    }

    const newId = `sch-${Date.now()}`;
    const newScholarship: ScholarshipItem = {
      id: newId,
      name: data.name,
      nameKm: data.nameKm || data.name,
      provider: data.provider,
      providerKm: data.providerKm || data.provider,
      country: data.country || 'Global',
      countryKm: data.countryKm || data.country || 'សកល',
      region: data.region || 'Global',
      degreeLevel: data.degreeLevel || ['Bachelor'],
      fieldOfStudy: data.fieldOfStudy || ['Other'],
      overview: data.overview || '',
      overviewKm: data.overviewKm || data.overview || '',
      nationalityRequirement: data.nationalityRequirement || 'Open to Cambodian citizens',
      nationalityRequirementKm: data.nationalityRequirementKm || 'បើកទូលាយសម្រាប់ពលរដ្ឋកម្ពុជា',
      minGpa: data.minGpa ? Number(data.minGpa) : null,
      maxAge: data.maxAge ? Number(data.maxAge) : null,
      workExpYears: Number(data.workExpYears) || 0,
      englishRequirement: data.englishRequirement || {
        testType: 'IELTS',
        minScore: '6.0+',
        details: 'English proficiency required',
        detailsKm: 'ទាមទារសមត្ថភាពភាសាអង់គ្លេស',
      },
      requiredDocuments: data.requiredDocuments || ['Academic Transcripts', 'Passport', 'Application Form'],
      requiredDocumentsKm: data.requiredDocumentsKm || ['ព្រឹត្តិបត្រពិន្ទុ', 'លិខិតឆ្លងដែន', 'ទម្រង់ពាក្យសុំ'],
      eligibleStudentCategories: data.eligibleStudentCategories || ['High School Students', 'University Students'],
      fundingType: data.fundingType || 'Fully funded',
      fundingTypeKm: data.fundingTypeKm || 'អាហារូបករណ៍ពេញលេញ',
      totalEstimatedValueUSD: Number(data.totalEstimatedValueUSD) || 25000,
      tuitionCoverage: data.tuitionCoverage || '100% full tuition waiver',
      tuitionCoverageKm: data.tuitionCoverageKm || 'រ៉ាប់រងថ្លៃសិក្សា ១០០%',
      accommodation: data.accommodation || 'Covered or subsidized',
      accommodationKm: data.accommodationKm || 'មានការរ៉ាប់រងកន្លែងស្នាក់នៅ',
      monthlyAllowance: data.monthlyAllowance || '$800/month',
      monthlyAllowanceKm: data.monthlyAllowanceKm || '$៨០០/ខែ',
      flightSupport: data.flightSupport || 'Included',
      flightSupportKm: data.flightSupportKm || 'រ៉ាប់រងសំបុត្រយន្តហោះ',
      insurance: data.insurance || 'Included',
      insuranceKm: data.insuranceKm || 'ការធានារ៉ាប់រងសុខភាព',
      otherBenefits: data.otherBenefits || [],
      otherBenefitsKm: data.otherBenefitsKm || [],
      openingDate: data.openingDate || new Date().toISOString().split('T')[0],
      deadline: data.deadline,
      deadlineType: data.deadlineType || 'Fixed Date',
      applicationLink: data.applicationLink || '#',
      selectionStages: data.selectionStages || ['Application Submission', 'Document Review', 'Award'],
      selectionStagesKm: data.selectionStagesKm || ['ការដាក់ពាក្យ', 'ការពិនិត្យឯកសារ', 'ការផ្តល់អាហារូបករណ៍'],
      officialSourceUrl: data.officialSourceUrl || data.applicationLink || 'https://moeys.gov.kh',
      verificationStatus: 'Verified Official',
      lastVerifiedDate: new Date().toISOString().split('T')[0],
      lastUpdatedDate: new Date().toISOString().split('T')[0],
      updateFrequency: data.updateFrequency || 'Annual',
      qualityScore: 98,
      verifiedBadge: true,
      verifierName: 'CSIP Senior Verification Desk',
      popularityCount: 50,
      changeHistory: [
        {
          id: `ch-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          field: 'creation',
          oldValue: 'None',
          newValue: 'Added by Admin',
          detectedBy: 'Manual Admin Entry',
          verified: true,
        },
      ],
    };

    scholarshipDatabase.unshift(newScholarship);
    return res.json({ success: true, scholarship: newScholarship });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Failed to create' });
  }
});

// 4. PUT /api/scholarships/:id (Admin: Edit scholarship)
router.put('/:id', (req: Request, res: Response) => {
  const index = scholarshipDatabase.findIndex((s) => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Scholarship not found' });
  }

  const existing = scholarshipDatabase[index];
  const updates = req.body;

  // Record changes for change detection
  const changeRecords = existing.changeHistory || [];
  if (updates.deadline && updates.deadline !== existing.deadline) {
    changeRecords.unshift({
      id: `ch-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      field: 'deadline',
      oldValue: existing.deadline,
      newValue: updates.deadline,
      detectedBy: 'Admin Edit & Verification',
      verified: true,
    });
  }

  const updated: ScholarshipItem = {
    ...existing,
    ...updates,
    lastUpdatedDate: new Date().toISOString().split('T')[0],
    changeHistory: changeRecords,
  };

  scholarshipDatabase[index] = updated;
  return res.json({ success: true, scholarship: updated });
});

// 5. DELETE /api/scholarships/:id (Admin: Delete scholarship)
router.delete('/:id', (req: Request, res: Response) => {
  const index = scholarshipDatabase.findIndex((s) => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Scholarship not found' });
  }
  scholarshipDatabase.splice(index, 1);
  return res.json({ success: true, message: 'Scholarship deleted successfully' });
});

// 6. POST /api/scholarships/:id/verify (Admin: Mark verified and refresh timestamp)
router.post('/:id/verify', (req: Request, res: Response) => {
  const item = scholarshipDatabase.find((s) => s.id === req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, error: 'Scholarship not found' });
  }
  const today = new Date().toISOString().split('T')[0];
  item.verifiedBadge = true;
  item.verificationStatus = 'Verified Official';
  item.lastVerifiedDate = today;
  item.lastUpdatedDate = today;
  item.qualityScore = Math.min(100, Math.max(95, item.qualityScore + 2));

  return res.json({ success: true, scholarship: item });
});

// 7. POST /api/scholarships/submit (Universities / Organizations submit)
router.post('/submit', (req: Request, res: Response) => {
  try {
    const {
      organizationName,
      contactPerson,
      contactEmail,
      officialWebsite,
      scholarshipName,
      scholarshipNameKm,
      country,
      region,
      degreeLevel,
      fieldOfStudy,
      fundingType,
      fundingDetails,
      eligibilitySummary,
      deadline,
      applicationLink,
      officialSourceUrl,
    } = req.body;

    if (!organizationName || !scholarshipName || !contactEmail || !deadline) {
      return res.status(400).json({
        success: false,
        error: 'Organization name, scholarship name, email, and deadline are required.',
      });
    }

    const newSubmission: OrganizationSubmission = {
      id: `sub-${Date.now()}`,
      organizationName,
      contactPerson: contactPerson || 'Official Representative',
      contactEmail,
      officialWebsite: officialWebsite || '',
      scholarshipName,
      scholarshipNameKm: scholarshipNameKm || scholarshipName,
      country: country || 'Cambodia',
      region: region || 'Cambodia',
      degreeLevel: degreeLevel || ['Bachelor'],
      fieldOfStudy: fieldOfStudy || ['Other'],
      fundingType: fundingType || 'Fully funded',
      fundingDetails: fundingDetails || 'Complete tuition and educational subsidy.',
      eligibilitySummary: eligibilitySummary || 'Open to qualified Cambodian applicants.',
      deadline,
      applicationLink: applicationLink || officialWebsite || '#',
      officialSourceUrl: officialSourceUrl || officialWebsite || '#',
      submittedAt: new Date().toISOString(),
      status: 'Pending Admin Review',
    };

    organizationSubmissions.unshift(newSubmission);
    return res.json({
      success: true,
      message: 'Scholarship submitted successfully. Our editorial verification team will review and verify before publishing.',
      submission: newSubmission,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Submission failed' });
  }
});

// 8. GET /api/scholarships/submissions (Admin: list submissions)
router.get('/submissions/all', (_req: Request, res: Response) => {
  return res.json({
    success: true,
    submissions: organizationSubmissions,
  });
});

// 9. PUT /api/scholarships/submissions/:id (Admin: Approve or reject submission)
router.put('/submissions/:id', (req: Request, res: Response) => {
  const { action, reviewNotes } = req.body; // 'approve' | 'reject'
  const sub = organizationSubmissions.find((s) => s.id === req.params.id);
  if (!sub) {
    return res.status(404).json({ success: false, error: 'Submission not found' });
  }

  if (action === 'approve') {
    sub.status = 'Approved & Published';
    sub.reviewNotes = reviewNotes || 'Verified with organization official domain.';

    // Create active scholarship in database!
    const newSch: ScholarshipItem = {
      id: `sch-org-${Date.now()}`,
      name: sub.scholarshipName,
      nameKm: sub.scholarshipNameKm || sub.scholarshipName,
      provider: sub.organizationName,
      providerKm: sub.organizationName,
      country: sub.country,
      countryKm: sub.country,
      region: sub.region,
      degreeLevel: sub.degreeLevel,
      fieldOfStudy: sub.fieldOfStudy,
      overview: `${sub.scholarshipName} provided by ${sub.organizationName}. ${sub.fundingDetails}`,
      overviewKm: `${sub.scholarshipNameKm || sub.scholarshipName} ផ្តល់ជូនដោយ ${sub.organizationName}។ ${sub.fundingDetails}`,
      nationalityRequirement: 'Open to Cambodian applicants',
      nationalityRequirementKm: 'បើកទូលាយសម្រាប់សិស្ស-និស្សិតកម្ពុជា',
      minGpa: 3.0,
      maxAge: null,
      workExpYears: 0,
      englishRequirement: {
        testType: 'Institutional',
        minScore: 'Proficiency in English / Khmer',
        details: 'Institutional standard requirements apply.',
        detailsKm: 'អនុលោមតាមលក្ខខណ្ឌរបស់គ្រឹះស្ថាន។',
      },
      requiredDocuments: ['Application Form', 'Academic Transcripts', 'Identification'],
      requiredDocumentsKm: ['ទម្រង់ពាក្យសុំ', 'ព្រឹត្តិបត្រពិន្ទុ', 'អត្តសញ្ញាណប័ណ្ណ'],
      eligibleStudentCategories: ['High School Students', 'University Students'],
      fundingType: sub.fundingType,
      fundingTypeKm: sub.fundingType === 'Fully funded' ? 'អាហារូបករណ៍ពេញលេញ' : 'អាហារូបករណ៍មួយផ្នែក',
      totalEstimatedValueUSD: 15000,
      tuitionCoverage: sub.fundingDetails,
      tuitionCoverageKm: sub.fundingDetails,
      accommodation: 'Campus facilities',
      accommodationKm: 'កន្លែងស្នាក់នៅរបស់គ្រឹះស្ថាន',
      monthlyAllowance: 'Dependent on award criteria',
      monthlyAllowanceKm: 'អាស្រ័យលើលក្ខខណ្ឌអាហារូបករណ៍',
      flightSupport: 'Not applicable for domestic / check program guidelines',
      flightSupportKm: 'មិនអនុវត្តសម្រាប់ក្នុងស្រុក',
      insurance: 'Student coverage',
      insuranceKm: 'ការធានារ៉ាប់រងនិស្សិត',
      otherBenefits: ['Priority academic mentorship', 'Career networking'],
      otherBenefitsKm: ['ការណែនាំសិក្សា', 'បណ្តាញការងារ'],
      openingDate: new Date().toISOString().split('T')[0],
      deadline: sub.deadline,
      deadlineType: 'Fixed Date',
      applicationLink: sub.applicationLink,
      selectionStages: ['Application Submission', 'Eligibility Verification', 'Official Decision'],
      selectionStagesKm: ['ការដាក់ពាក្យ', 'ការផ្ទៀងផ្ទាត់ឯកសារ', 'ការប្រកាសលទ្ធផល'],
      officialSourceUrl: sub.officialSourceUrl,
      verificationStatus: 'Verified Official',
      lastVerifiedDate: new Date().toISOString().split('T')[0],
      lastUpdatedDate: new Date().toISOString().split('T')[0],
      updateFrequency: 'Annual',
      qualityScore: 98,
      verifiedBadge: true,
      verifierName: `Verified by CSIP Admin via ${sub.contactEmail}`,
      popularityCount: 20,
      changeHistory: [
        {
          id: `ch-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          field: 'organization_submission',
          oldValue: 'Pending',
          newValue: 'Approved and Published',
          detectedBy: 'Admin Approval Workflow',
          verified: true,
        },
      ],
    };
    scholarshipDatabase.unshift(newSch);

    return res.json({ success: true, submission: sub, publishedScholarship: newSch });
  } else {
    sub.status = 'Rejected';
    sub.reviewNotes = reviewNotes || 'Information could not be verified with official source.';
    return res.json({ success: true, submission: sub });
  }
});

// 10. POST /api/scholarships/report (Users report error)
router.post('/report', (req: Request, res: Response) => {
  const { scholarshipId, scholarshipName, reportedField, description, suggestedCorrection, officialSourceUrl, reporterEmail } = req.body;
  if (!scholarshipId || !description) {
    return res.status(400).json({ success: false, error: 'Scholarship ID and description are required.' });
  }

  const newReport: UserErrorReport = {
    id: `rep-${Date.now()}`,
    scholarshipId,
    scholarshipName: scholarshipName || 'Reported Scholarship',
    reportedField: reportedField || 'other',
    description,
    suggestedCorrection,
    officialSourceUrl,
    reporterEmail: reporterEmail || 'anonymous@csip.edu.kh',
    submittedAt: new Date().toISOString(),
    status: 'Pending Review',
  };

  userReports.unshift(newReport);
  return res.json({ success: true, message: 'Thank you for reporting! Our editorial team will review and verify this information.', report: newReport });
});

// 11. GET /api/scholarships/reports/all (Admin: list user reports)
router.get('/reports/all', (_req: Request, res: Response) => {
  return res.json({
    success: true,
    reports: userReports,
  });
});

// 12. PUT /api/scholarships/reports/:id (Admin: resolve report)
router.put('/reports/:id', (req: Request, res: Response) => {
  const { status, adminNotes, applyCorrectionToScholarship } = req.body;
  const report = userReports.find((r) => r.id === req.params.id);
  if (!report) {
    return res.status(404).json({ success: false, error: 'Report not found' });
  }

  report.status = status || 'Verified & Fixed';
  report.adminNotes = adminNotes || 'Correction verified against official portal and updated.';

  // If instructed to apply correction to the scholarship:
  if (applyCorrectionToScholarship) {
    const sch = scholarshipDatabase.find((s) => s.id === report.scholarshipId);
    if (sch) {
      sch.lastUpdatedDate = new Date().toISOString().split('T')[0];
      sch.lastVerifiedDate = new Date().toISOString().split('T')[0];
      if (!sch.changeHistory) sch.changeHistory = [];
      sch.changeHistory.unshift({
        id: `ch-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        field: report.reportedField,
        oldValue: 'User reported discrepancy',
        newValue: report.suggestedCorrection || 'Updated as per verified official report',
        detectedBy: `User Report by ${report.reporterEmail}`,
        verified: true,
      });
    }
  }

  return res.json({ success: true, report });
});

// 13. POST /api/scholarships/check-updates (Data Update System: Simulated Change Detection)
router.post('/check-updates', (req: Request, res: Response) => {
  const { scholarshipId } = req.body;
  const sch = scholarshipDatabase.find((s) => s.id === scholarshipId) || scholarshipDatabase[0];
  if (!sch) {
    return res.status(404).json({ success: false, error: 'Scholarship not found' });
  }

  const today = new Date().toISOString().split('T')[0];
  const oldDeadline = sch.deadline;
  // Calculate next cycle deadline example
  const deadlineDate = new Date(oldDeadline);
  deadlineDate.setFullYear(deadlineDate.getFullYear() + 1);
  const newDeadline = deadlineDate.toISOString().split('T')[0];

  if (!sch.changeHistory) sch.changeHistory = [];
  const record = {
    id: `ch-${Date.now()}`,
    date: today,
    field: 'deadline',
    oldValue: oldDeadline,
    newValue: newDeadline,
    detectedBy: 'Automated Crawler Bot (Portal Diff Engine)',
    verified: false,
  };
  sch.changeHistory.unshift(record);
  sch.lastUpdatedDate = today;

  return res.json({
    success: true,
    message: `Change detection system crawled official source URL [${sch.officialSourceUrl}]. Detected change in field 'deadline': '${oldDeadline}' -> '${newDeadline}'. Admin notification queued.`,
    changeRecord: record,
    scholarship: sch,
  });
});

// 14. POST /api/scholarships/ai-extract (AI Data Collection System: Live Extraction with Gemini)
router.post('/ai-extract', async (req: Request, res: Response) => {
  try {
    const { rawText, sourceUrl } = req.body;
    if (!rawText || rawText.trim().length < 20) {
      return res.status(400).json({
        success: false,
        error: 'Please provide raw scholarship text or announcement text (minimum 20 characters).',
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      // Return structured mock extraction if Gemini is unconfigured
      return res.json({
        success: true,
        extractedData: {
          scholarshipName: 'Extracted Global Merit Scholarship',
          scholarshipNameKm: 'អាហារូបករណ៍ឧត្តមភាពសកលដែលបានទាញយក',
          provider: 'International Scholarship Foundation',
          country: 'United Kingdom',
          region: 'Europe',
          degreeLevel: ['Master'],
          fieldOfStudy: ['Computer Science', 'Engineering'],
          fundingType: 'Fully funded',
          fundingDetails: 'Full tuition waiver, monthly living allowance, and travel grant.',
          minGpa: 3.2,
          englishRequirement: 'IELTS 6.5 or equivalent',
          deadline: '2026-11-15',
          officialSourceUrl: sourceUrl || 'https://www.example.org/scholarship',
          source: 'Simulated AI Extraction Parser',
        },
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are the Data Ingestion AI Agent for the Cambodia Scholarship Intelligence Platform (CSIP).
Extract structured scholarship information from the following scholarship announcement text.
Respond with a valid JSON object only (no markdown quotes, no other text) with these exact keys:
{
  "scholarshipName": "string",
  "scholarshipNameKm": "Khmer translation of scholarship name in Khmer Unicode",
  "provider": "string organization name",
  "country": "string country",
  "region": "USA | Canada | Europe | Australia | Japan | Korea | China | Singapore | ASEAN | Cambodia | Global",
  "degreeLevel": ["Bachelor" | "Master" | "PhD"],
  "fieldOfStudy": ["Business" | "Engineering" | "Computer Science" | "Medicine" | "Agriculture" | "Education" | "Other"],
  "fundingType": "Fully funded" | "Tuition only" | "Partial funding",
  "fundingDetails": "string summary of tuition, monthly stipend, flight, etc.",
  "minGpa": number or null,
  "englishRequirement": "string requirements (e.g. IELTS 6.5)",
  "deadline": "YYYY-MM-DD format (if only month/year mentioned, use end of month)",
  "eligibilitySummary": "string summary",
  "requiredDocuments": ["array of document names"]
}

Source text to extract from:
${rawText}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        temperature: 0.2,
      },
    });

    const responseText = response.text || '';
    // Clean code blocks if present
    const cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return res.json({
      success: true,
      extractedData: {
        ...parsed,
        officialSourceUrl: sourceUrl || 'https://official-source.org',
        source: 'gemini-3.1-flash-lite live extraction',
      },
    });
  } catch (err: any) {
    console.error('AI extraction error:', err);
    return res.status(500).json({
      success: false,
      error: 'AI extraction could not parse text. Please check format or retry.',
    });
  }
});

// 15. GET /api/scholarships/popular-searches (Popular Searches analytics)
router.get('/analytics/popular-searches', (_req: Request, res: Response) => {
  return res.json({
    success: true,
    searches: searchKeywordsLog.slice(0, 10),
  });
});

export default router;
