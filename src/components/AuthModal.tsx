import React, { useState } from 'react';
import { X, LogIn, UserPlus, AlertCircle, GraduationCap, Building2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface AuthModalProps {
  initialMode?: 'login' | 'register';
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ initialMode = 'login', onClose }) => {
  const { login, register } = useAuth();
  const { language } = useLanguage();
  const isKhmer = language === 'km';
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [role, setRole] = useState<'student' | 'organization'>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [educationLevel, setEducationLevel] = useState('Grade 12');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await register({
          email: email.trim(),
          password,
          role,
          name: name.trim() || (role === 'organization' ? 'Organization Partner' : 'Student'),
          education_level: role === 'student' ? educationLevel : undefined,
          organization_name: role === 'organization' ? name.trim() : undefined,
        });
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={mode === 'login' ? 'Sign In' : 'Create Account'}
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {mode === 'login'
                ? isKhmer ? 'ចូលគណនី CDES' : 'Sign in to Student Instructor'
                : isKhmer ? 'បង្កើតគណនីថ្មី' : 'Create your free account'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isKhmer
                ? 'រក្សាទុកប្រវត្តិសិក្សា និងអាហារូបករណ៍របស់អ្នកដោយឯកជន'
                : 'Private by default — analytics sharing starts off.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close authentication dialog"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-sm font-semibold">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 cursor-pointer transition-colors ${
              mode === 'login'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            <LogIn className="h-4 w-4" />
            <span>{isKhmer ? 'ចូលគណនី' : 'Sign In'}</span>
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 cursor-pointer transition-colors ${
              mode === 'register'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            <UserPlus className="h-4 w-4" />
            <span>{isKhmer ? 'ចុះឈ្មោះ' : 'Register'}</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50 p-3 text-sm text-red-700 dark:text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <>
              <div>
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                  {isKhmer ? 'ប្រភេទគណនី' : 'Account Type'}
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`rounded-xl border p-3 text-left transition-colors cursor-pointer ${
                      role === 'student'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-200'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 mb-1 text-blue-600 dark:text-blue-400" />
                    <div className="text-xs font-bold">Student</div>
                    <div className="text-[11px] opacity-80">Scholarships &amp; study plan</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('organization')}
                    className={`rounded-xl border p-3 text-left transition-colors cursor-pointer ${
                      role === 'organization'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-200'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Building2 className="w-4 h-4 mb-1 text-emerald-600 dark:text-emerald-400" />
                    <div className="text-xs font-bold">Organization</div>
                    <div className="text-[11px] opacity-80">Submit scholarships</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200" htmlFor="auth-name">
                  {role === 'organization' ? 'Organization / Contact Name' : 'Full Name'}
                </label>
                <input
                  id="auth-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={role === 'organization' ? 'Cambodia STEM Foundation' : 'Sokha Chan'}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {role === 'student' && (
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200" htmlFor="auth-grade">
                    Education Level
                  </label>
                  <select
                    id="auth-grade"
                    value={educationLevel}
                    onChange={(e) => setEducationLevel(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12 (Bac II)</option>
                    <option value="University">University Student</option>
                  </select>
                </div>
              )}
            </>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200" htmlFor="auth-email">
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.org"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200" htmlFor="auth-password">
              Password {mode === 'register' && '(at least 8 characters)'}
            </label>
            <input
              id="auth-password"
              type="password"
              required
              minLength={mode === 'register' ? 8 : 1}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-60 cursor-pointer"
          >
            {submitting
              ? 'Please wait...'
              : mode === 'login'
                ? 'Sign In'
                : 'Create Account'}
          </button>

          <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Protected session cookies &amp; student privacy defaults</span>
          </div>
        </form>
      </div>
    </div>
  );
};
