import { apiGet, apiPost, clearCsrfToken, setCsrfToken } from './apiClient';

export interface AuthUser {
  id: string;
  email: string;
  role: 'student' | 'admin' | 'organization' | 'mentor';
  status: string;
  created_at?: string;
}

export interface StudentProfile {
  id: string;
  user_id: string;
  name: string;
  education_level: string;
  school?: string | null;
  university?: string | null;
  language: string;
  major?: string | null;
  target_career?: string | null;
  location?: string | null;
  interests?: string[] | string;
  favorite_subjects?: string[] | string;
  goals?: string | null;
  updated_at?: string;
}

export interface EducationEntry {
  id: string;
  student_id: string;
  institution: string;
  degree: string;
  start_date?: string | null;
  end_date?: string | null;
  achievements?: string | null;
}

export interface SessionState {
  authenticated: boolean;
  user: AuthUser | null;
  profile: StudentProfile | null;
  education: EducationEntry[];
  csrfToken?: string;
}

export const authClient = {
  async getSession(): Promise<SessionState> {
    const session = await apiGet<SessionState>('/api/auth/session');
    if (session?.csrfToken) {
      setCsrfToken(session.csrfToken);
    }
    return session;
  },

  async login(email: string, password: string): Promise<SessionState> {
    const res = await apiPost<{
      user: AuthUser;
      profile: StudentProfile | null;
      education: EducationEntry[];
      csrfToken?: string;
    }>('/api/auth/login', { email, password });
    if (res.csrfToken) {
      setCsrfToken(res.csrfToken);
    }
    return {
      authenticated: true,
      user: res.user,
      profile: res.profile || null,
      education: res.education || [],
      csrfToken: res.csrfToken,
    };
  },

  async register(params: {
    email: string;
    password: string;
    role: 'student' | 'organization';
    name: string;
    education_level?: string;
    organization_name?: string;
  }): Promise<SessionState> {
    const res = await apiPost<{
      user: AuthUser;
      profile: StudentProfile | null;
      education: EducationEntry[];
      csrfToken?: string;
    }>('/api/auth/register', params);
    if (res.csrfToken) {
      setCsrfToken(res.csrfToken);
    }
    return {
      authenticated: true,
      user: res.user,
      profile: res.profile || null,
      education: res.education || [],
      csrfToken: res.csrfToken,
    };
  },

  async logout(): Promise<void> {
    try {
      await apiPost('/api/auth/logout');
    } finally {
      clearCsrfToken();
    }
  },
};
