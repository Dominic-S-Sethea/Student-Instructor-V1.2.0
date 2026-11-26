import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authClient, AuthUser, EducationEntry, SessionState, StudentProfile } from '../services/authClient';
import { analytics } from '../utils/analytics';
import { clearLegacyUnscopedSavedScholarships } from '../utils/savedScholarships';

interface AuthContextValue {
  authenticated: boolean;
  user: AuthUser | null;
  profile: StudentProfile | null;
  education: EducationEntry[];
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<SessionState>;
  register: (params: {
    email: string;
    password: string;
    role: 'student' | 'organization';
    name: string;
    education_level?: string;
    organization_name?: string;
  }) => Promise<SessionState>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  setProfileData: (profile: StudentProfile | null, education: EducationEntry[]) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [education, setEducation] = useState<EducationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const applySession = useCallback((session: SessionState) => {
    const isAuth = Boolean(session?.authenticated && session?.user);
    setAuthenticated(isAuth);
    setUser(session?.user || null);
    setProfile(session?.profile || null);
    setEducation(session?.education || []);
    analytics.setUserId(session?.user?.id || 'guest');
    setError(null);
  }, []);

  const refreshSession = useCallback(async () => {
    setLoading(true);
    try {
      const session = await authClient.getSession();
      applySession(session);
    } catch (err) {
      setAuthenticated(false);
      setUser(null);
      setProfile(null);
      setEducation([]);
      analytics.setUserId('guest');
      setError(err instanceof Error ? err.message : 'Unable to verify session');
    } finally {
      setLoading(false);
    }
  }, [applySession]);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      const session = await authClient.login(email, password);
      applySession(session);
      return session;
    },
    [applySession]
  );

  const register = useCallback(
    async (params: {
      email: string;
      password: string;
      role: 'student' | 'organization';
      name: string;
      education_level?: string;
      organization_name?: string;
    }) => {
      const session = await authClient.register(params);
      applySession(session);
      return session;
    },
    [applySession]
  );

  const logout = useCallback(async () => {
    await authClient.logout();
    setAuthenticated(false);
    setUser(null);
    setProfile(null);
    setEducation([]);
    analytics.setUserId('guest');
    analytics.clear();
    clearLegacyUnscopedSavedScholarships();
  }, []);

  const setProfileData = useCallback((nextProfile: StudentProfile | null, nextEducation: EducationEntry[]) => {
    setProfile(nextProfile);
    setEducation(nextEducation);
  }, []);

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      authenticated,
      user,
      profile,
      education,
      loading,
      error,
      login,
      register,
      logout,
      refreshSession,
      setProfileData,
    }),
    [authenticated, user, profile, education, loading, error, login, register, logout, refreshSession, setProfileData]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
