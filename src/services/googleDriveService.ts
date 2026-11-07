import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { ComprehensiveUniversityProfile } from '../types';

// Ensure Firebase is initialized once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Configure Google Auth Provider with Google Drive Scopes
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive');
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/drive.readonly');

// In-memory token cache (do NOT store in localStorage per security requirements)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  webContentLink?: string;
  webViewLink?: string;
  iconLink?: string;
  createdTime?: string;
  size?: string;
}

/**
 * Initialize Firebase Auth listener.
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else if (!isSigningIn) {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Sign in with Google using popup and obtain Google Drive OAuth access token.
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Could not obtain Google Drive OAuth access token.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: unknown) {
    console.error('Google Sign In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Retrieve the current in-memory access token.
 */
export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

/**
 * Sign out and clear cached token.
 */
export const logout = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
};

/**
 * Fetch files from user's Google Drive.
 */
export const listDriveFiles = async (
  query?: string,
  pageSize = 25
): Promise<DriveFile[]> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not authenticated with Google Drive. Please sign in first.');
  }

  const defaultQuery = "trashed = false";
  const finalQuery = query ? `(${defaultQuery}) and (${query})` : defaultQuery;

  const url = new URL('https://www.googleapis.com/drive/v3/files');
  url.searchParams.set(
    'fields',
    'files(id, name, mimeType, thumbnailLink, webContentLink, webViewLink, iconLink, createdTime, size)'
  );
  url.searchParams.set('pageSize', pageSize.toString());
  url.searchParams.set('q', finalQuery);
  url.searchParams.set('orderBy', 'modifiedTime desc');

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to fetch Google Drive files: ${res.statusText}`);
  }

  const data = await res.json();
  return data.files || [];
};

/**
 * Search specifically for image files in Google Drive to use for university photos.
 */
export const searchDriveImages = async (): Promise<DriveFile[]> => {
  return listDriveFiles("mimeType contains 'image/'", 30);
};

/**
 * Export university dossier and data checklist as a formatted document to Google Drive.
 */
export const exportDossierToGoogleDrive = async (
  university: ComprehensiveUniversityProfile
): Promise<DriveFile> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not authenticated with Google Drive. Please sign in first.');
  }

  const fileName = `${university.abbr || university.name}_University_Data_Infrastructure_Dossier.md`;

  const markdownContent = `# ${university.name} (${university.khmerName || university.abbr})
## Comprehensive University Data Infrastructure Dossier
Audited for Cambodia Higher Education Explorer • Generated ${new Date().toLocaleDateString()}

---

### 1. Basic Profile
- **Institution Name:** ${university.name}
- **Khmer Name:** ${university.khmerName || 'Blank'}
- **Abbreviation:** ${university.abbr}
- **Type:** ${university.type}
- **Founded Year:** ${university.foundedYear}
- **Location / Campus:** ${university.location}
- **Official Website:** ${university.website}
- **Phone:** ${university.contact?.phone || 'Blank'}
- **Email:** ${university.contact?.email || 'Blank'}
- **Address:** ${university.contact?.address || university.location}
- **Admissions Office:** ${university.contact?.admissionsOffice || 'Blank'}

---

### 2. Academic Information
- **Total Faculties:** ${university.facultyCount}
- **Total Majors:** ${university.majorsCount}
- **Theory vs Practice Ratio:** ${university.theoryVsPracticeRatio}
- **Student to Faculty Ratio:** ${university.studentToFacultyRatio}
- **Key Curriculum Highlight:** ${university.curriculumHighlight}

#### Faculties List:
${(university.facultiesList || [])
  .map(
    (f, idx) => `
${idx + 1}. **${f.name}** ${f.khmerName ? `(${f.khmerName})` : ''}
   - Dean: ${f.dean || 'Blank'}
   - Departments: ${f.departments.join(', ') || 'Blank'}
   - Overview: ${f.description || 'Blank'}`
  )
  .join('\n')}

#### Majors Offered:
${university.majors
  .map(
    (m, idx) => `
${idx + 1}. **${m.name}** (${m.degreeType}, ${m.durationYears} Years)
   - Faculty: ${m.faculty}
   - Demand: ${m.jobMarketDemand} | Difficulty: ${m.difficultyRating}/5
   - Starting Salary: ${m.averageStartingSalary}
   - Pathways: ${m.careerPathways.join(', ')}`
  )
  .join('\n')}

---

### 3. Financial Information
- **Annual Tuition:** $${university.annualTuitionUSD.toLocaleString()} USD
- **4-Year Degree Tuition:** $${university.totalDegreeCostUSD.toLocaleString()} USD
- **Payment Schedule:** ${university.paymentSchedule}
- **Scholarships:** ${university.scholarships.scholarshipNames.join(' • ')}
- **Scholarship Eligibility:** ${university.scholarships.requirements}
- **Financial Aid:** ${university.financialInfo?.scholarshipDetails?.financialAidDetails || 'Blank'}

#### Itemized Other Costs:
- **Registration Fee:** ${university.financialInfo?.otherCosts?.registrationFee || 'Blank'}
- **Laboratory Fee:** ${university.financialInfo?.otherCosts?.laboratoryFee || 'Blank'}
- **Books & Materials:** ${university.financialInfo?.otherCosts?.booksAndMaterials || 'Blank'}
- **Uniform:** ${university.financialInfo?.otherCosts?.uniform || 'Blank'}
- **Dormitory Cost:** ${university.financialInfo?.otherCosts?.dormitoryCost || 'Blank'}
- **Graduation Fee:** ${university.financialInfo?.otherCosts?.graduationFee || 'Blank'}
- **Fee Notes:** ${university.financialInfo?.otherCosts?.details || 'Blank'}

---

### 4. Student Experience & Facilities
- **Campus Facilities:** ${university.studentExperience?.campusFacilities.join(', ') || 'Blank'}
- **Library Facilities:** ${university.studentExperience?.library?.description || 'Blank'}
- **Laboratories:** ${
    university.studentExperience?.laboratory?.map((l) => `${l.name} (${l.specialization})`).join('; ') || 'Blank'
  }
- **Student Clubs:** ${university.studentExperience?.studentClubs.join(', ') || 'Blank'}
- **Dormitory:** ${university.studentExperience?.dormitory?.description || 'Blank'}

---

### 5. Admission Requirements
- **High School Bac II Requirement:** ${university.admissionRequirements.nationalExamRequirement}
- **Entrance Exam Required:** ${university.admissionRequirements.entranceExamRequired ? 'Yes' : 'No'}
- **Entrance Exam Details:** ${university.admissionRequirements.entranceExamDetails}
- **English Requirement:** ${university.admissionRequirements.englishRequirement}
- **Application Deadline:** ${university.importantDates.applicationDeadline}
- **Exam Date:** ${university.importantDates.examDate}

---

### 6. Career Outcomes
- **6-Month Employment Rate:** ${university.employmentRate6Months}%
- **Average Time to Job:** ${university.averageTimeToJobMonths} Months
- **Median Starting Salary:** $${university.averageGraduateSalaryMonthlyUSD}/month
- **Industry Partners:** ${(university.industryPartnerships || university.careerInfo?.industryConnections || []).join(', ')}

---

### 7. Accreditation & Reputation
- **Government Recognition:** ${university.accreditation.governmentRecognition}
- **Accreditation Status:** ${university.accreditation.status}
- **International Accreditation:** ${university.accreditation.internationalAccreditation || 'Blank'}
- **National Ranking:** ${university.rankingReputation?.nationalRank || 'Top National Ranking'}
- **Overall Profile Score:** ${university.profileScore.overall}/100
`;

  const metadata = {
    name: fileName,
    mimeType: 'text/markdown',
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: text/markdown; charset=UTF-8\r\n\r\n' +
    markdownContent +
    closeDelimiter;

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to save file to Google Drive: ${res.statusText}`);
  }

  return await res.json();
};
