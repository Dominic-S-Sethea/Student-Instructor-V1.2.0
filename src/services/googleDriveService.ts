import type { User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import type { ComprehensiveUniversityProfile } from '../types';

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

const PLACEHOLDER_KEY = 'your-firebase-api-key-here';

function resolveFirebaseConfig() {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey || '';
  if (!apiKey || apiKey === PLACEHOLDER_KEY) {
    return null;
  }
  return {
    ...firebaseConfig,
    apiKey,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId,
    appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfig.appId,
  };
}

export function isGoogleDriveConfigured(): boolean {
  return resolveFirebaseConfig() !== null;
}

async function getFirebaseAuthInstance() {
  const cfg = resolveFirebaseConfig();
  if (!cfg) {
    throw new Error('Google Drive integration is not configured (set VITE_FIREBASE_API_KEY).');
  }
  const [{ initializeApp, getApps, getApp }, { getAuth, GoogleAuthProvider }] = await Promise.all([
    import('firebase/app'),
    import('firebase/auth'),
  ]);
  const app = !getApps().length ? initializeApp(cfg) : getApp();
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/drive');
  provider.addScope('https://www.googleapis.com/auth/drive.file');
  provider.addScope('https://www.googleapis.com/auth/drive.readonly');
  return { auth, provider };
}

/**
 * Initialize Firebase Auth listener lazily when configured.
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
): (() => void) => {
  if (!isGoogleDriveConfigured()) {
    onAuthFailure?.();
    return () => {};
  }
  let cancelled = false;
  let unsub: (() => void) | undefined;

  void getFirebaseAuthInstance()
    .then(async ({ auth }) => {
      const { onAuthStateChanged } = await import('firebase/auth');
      if (cancelled) return;
      unsub = onAuthStateChanged(auth, (user: User | null) => {
        if (user && cachedAccessToken) {
          onAuthSuccess?.(user, cachedAccessToken);
        } else if (!isSigningIn) {
          cachedAccessToken = null;
          onAuthFailure?.();
        }
      });
    })
    .catch(() => {
      onAuthFailure?.();
    });

  return () => {
    cancelled = true;
    unsub?.();
  };
};

/**
 * Sign in with Google using popup and obtain Google Drive OAuth access token.
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const { auth, provider } = await getFirebaseAuthInstance();
    const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Could not obtain Google Drive OAuth access token.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => cachedAccessToken;

export const logout = async (): Promise<void> => {
  if (isGoogleDriveConfigured()) {
    const { auth } = await getFirebaseAuthInstance();
    const { signOut } = await import('firebase/auth');
    await signOut(auth);
  }
  cachedAccessToken = null;
};

export const listDriveFiles = async (
  query?: string,
  pageSize = 25
): Promise<DriveFile[]> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not authenticated with Google Drive. Please sign in first.');
  }

  const defaultQuery = 'trashed = false';
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
    const errorData = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
    throw new Error(errorData.error?.message || `Failed to fetch Google Drive files: ${res.statusText}`);
  }

  const data = (await res.json()) as { files?: DriveFile[] };
  return data.files || [];
};

export const searchDriveImages = async (): Promise<DriveFile[]> => {
  return listDriveFiles("mimeType contains 'image/'", 30);
};

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

- **Type:** ${university.type} | **Founded:** ${university.foundedYear} | **Location:** ${university.location}
- **Annual Tuition:** $${university.annualTuitionUSD.toLocaleString()} USD | **4-Year Tuition:** $${university.totalDegreeCostUSD.toLocaleString()} USD
- **Website:** ${university.website}
`;

  const metadata = { name: fileName, mimeType: 'text/markdown' };
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;
  const body =
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
      body,
    }
  );

  if (!res.ok) {
    const errorData = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
    throw new Error(errorData.error?.message || `Failed to save file to Google Drive: ${res.statusText}`);
  }

  return (await res.json()) as DriveFile;
};
