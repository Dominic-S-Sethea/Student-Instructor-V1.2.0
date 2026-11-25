import React, { useEffect, useState } from 'react';
import { ShieldCheck, Trash2, Plus, Save, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { profileClient, PrivacyConsentState } from '../services/profileClient';
import type { EducationEntry } from '../services/authClient';

export const StudentEducationAndPrivacyPanel: React.FC = () => {
  const { authenticated, user, profile, education, refreshSession } = useAuth();
  const { language } = useLanguage();
  const isKhmer = language === 'km';

  const [name, setName] = useState(profile?.name || '');
  const [educationLevel, setEducationLevel] = useState(profile?.education_level || 'Grade 12');
  const [school, setSchool] = useState(profile?.school || '');
  const [major, setMajor] = useState(profile?.major || '');
  const [targetCareer, setTargetCareer] = useState(profile?.target_career || '');
  const [location, setLocation] = useState(profile?.location || '');

  const [institution, setInstitution] = useState('');
  const [degree, setDegree] = useState('');
  const [eduList, setEduList] = useState<EducationEntry[]>(education);

  const [consent, setConsent] = useState<PrivacyConsentState | null>(null);
  const [parentEmail, setParentEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setName(profile?.name || '');
    setEducationLevel(profile?.education_level || 'Grade 12');
    setSchool(profile?.school || '');
    setMajor(profile?.major || '');
    setTargetCareer(profile?.target_career || '');
    setLocation(profile?.location || '');
    setEduList(education);
  }, [profile, education]);

  useEffect(() => {
    if (!authenticated || user?.role !== 'student') {
      setConsent(null);
      return;
    }
    let active = true;
    profileClient
      .getProfile()
      .then((res) => {
        if (!active) return;
        setEduList(res.education || []);
        if (res.profile) {
          setName(res.profile.name || '');
          setEducationLevel(res.profile.education_level || 'Grade 12');
          setSchool(res.profile.school || '');
          setMajor(res.profile.major || '');
          setTargetCareer(res.profile.target_career || '');
          setLocation(res.profile.location || '');
        }
      })
      .catch(() => { /* surfaced on action */ });

    profileClient
      .getPrivacyConsent()
      .then((c) => {
        if (!active) return;
        setConsent(c);
        setParentEmail(c.parentEmail || '');
      })
      .catch(() => { /* non-student roles */ });

    return () => { active = false; };
  }, [authenticated, user?.id, user?.role]);

  if (!authenticated) {
    return (
      <div className="rounded-3xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-6 text-sm text-amber-900 dark:text-amber-200">
        <div className="flex items-center gap-2 font-bold">
          <Lock className="h-4 w-4" />
          <span>Sign in required to manage your private education profile</span>
        </div>
        <p className="mt-1 text-xs text-amber-800 dark:text-amber-300">
          Use the Sign In / Register button in the top navigation bar to create or access your persistent profile.
        </p>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setStatusMsg(null);
    try {
      await profileClient.updateProfile({
        name: name.trim(),
        education_level: educationLevel.trim(),
        school: school.trim() || null,
        major: major.trim() || null,
        target_career: targetCareer.trim() || null,
        location: location.trim() || null,
      });
      await refreshSession();
      setStatusMsg('Profile saved to your account.');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddEducation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institution.trim() || !degree.trim()) return;
    setSaving(true);
    setErrorMsg(null);
    setStatusMsg(null);
    try {
      const added = await profileClient.addEducation({
        institution: institution.trim(),
        degree: degree.trim(),
        achievements: null,
      });
      setEduList((prev) => [added, ...prev]);
      setInstitution('');
      setDegree('');
      await refreshSession();
      setStatusMsg('Education record added.');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to add education entry.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEducation = async (entryId: string) => {
    setErrorMsg(null);
    try {
      await profileClient.deleteEducation(entryId);
      setEduList((prev) => prev.filter((item) => item.id !== entryId));
      await refreshSession();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to remove education record.');
    }
  };

  const handleConsentChange = async (patch: {
    allowAnalyticsTracking?: boolean;
    allowResearchInclusion?: boolean;
    allowAiMemory?: boolean;
    withdrawAll?: boolean;
  }) => {
    setErrorMsg(null);
    setStatusMsg(null);
    try {
      const updated = await profileClient.updatePrivacyConsent(patch);
      setConsent(updated);
      setStatusMsg(
        updated.blockedReasons?.length
          ? 'Saved. Optional sharing stays disabled until parent or guardian verification completes.'
          : 'Privacy settings updated.'
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to update privacy preferences.');
    }
  };

  const handleRequestGuardian = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentEmail.trim()) return;
    setErrorMsg(null);
    try {
      const updated = await profileClient.requestParentalVerification(parentEmail.trim());
      setConsent(updated);
      setStatusMsg('Guardian email saved (pending approval).');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to record guardian email.');
    }
  };

  const fields = [
    { id: 'profile-name', label: isKhmer ? 'ឈ្មោះពេញ' : 'Full Name', value: name, set: setName, placeholder: '' },
    { id: 'profile-level', label: isKhmer ? 'កម្រិតសិក្សា' : 'Education Level', value: educationLevel, set: setEducationLevel, placeholder: '' },
    { id: 'profile-school', label: isKhmer ? 'សាលារៀន / សាកលវិទ្យាល័យ' : 'School / Institution', value: school, set: setSchool, placeholder: 'Sisowath High School' },
    { id: 'profile-location', label: isKhmer ? 'ខេត្ត / រាជធានី' : 'Province / Location', value: location, set: setLocation, placeholder: 'Phnom Penh' },
    { id: 'profile-major', label: isKhmer ? 'មុខជំនាញគោលដៅ' : 'Target Major', value: major, set: setMajor, placeholder: 'Computer Science' },
    { id: 'profile-career', label: isKhmer ? 'អាជីពគោលដៅ' : 'Target Career', value: targetCareer, set: setTargetCareer, placeholder: 'Software Engineer' },
  ];

  return (
    <div className="space-y-6">
      {(statusMsg || errorMsg) && (
        <div
          className={`flex items-center gap-2 rounded-2xl border p-3.5 text-xs font-medium ${
            errorMsg
              ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300'
              : 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200'
          }`}
        >
          {errorMsg ? <AlertCircle className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}
          <span>{errorMsg || statusMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <form onSubmit={handleSaveProfile} className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {isKhmer ? 'កែសម្រួលប្រវត្តិរូបផ្ទាល់ខ្លួន' : 'Edit Private Profile'}
            </h2>
            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300 truncate max-w-[180px]">
              {user?.email}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {fields.map((f) => (
              <div key={f.id}>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300" htmlFor={f.id}>
                  {f.label}
                </label>
                <input
                  id={f.id}
                  type="text"
                  value={f.value}
                  onChange={(e) => f.set(e.target.value)}
                  placeholder={f.placeholder || undefined}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>
            ))}
          </div>
          <button
            id="save-profile-btn"
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{saving ? 'Saving...' : isKhmer ? 'រក្សាទុកប្រវត្តិរូប' : 'Save Profile'}</span>
          </button>
        </form>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {isKhmer ? `ប្រវត្តិការសិក្សា (${eduList.length})` : `Education History (${eduList.length})`}
          </h2>
          <form onSubmit={handleAddEducation} className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="School / University"
              aria-label="Education institution"
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
            />
            <input
              type="text"
              value={degree}
              onChange={(e) => setDegree(e.target.value)}
              placeholder="Grade / Degree"
              aria-label="Education degree or grade"
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
            />
            <button
              id="add-education-btn"
              type="submit"
              disabled={saving || !institution.trim() || !degree.trim()}
              className="inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{isKhmer ? 'បន្ថែម' : 'Add Record'}</span>
            </button>
          </form>

          {eduList.length === 0 ? (
            <p className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3.5 text-xs text-slate-500 dark:text-slate-400">
              No education entries recorded yet. Add your current high school or university above.
            </p>
          ) : (
            <ul className="space-y-2">
              {eduList.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100">{entry.institution}</div>
                    <div className="text-slate-600 dark:text-slate-300">{entry.degree}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleDeleteEducation(entry.id)}
                    aria-label={`Remove ${entry.institution}`}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {consent && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {isKhmer ? 'មជ្ឈមណ្ឌលឯកជនភាព និងសុវត្ថិភាពសិស្ស' : 'Student Privacy & Safety Center'}
                </h2>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {isKhmer
                  ? 'ប្រវត្តិរូបរបស់អ្នកត្រូវបានរក្សាទុកជាឯកជនជាលំនាំដើម — ការវិភាគ និងការស្រាវជ្រាវត្រូវបានបិទជានិច្ច រហូតដល់អ្នកបើកវា។'
                  : 'Your profile is private by default — analytics and research sharing stay OFF unless you turn them on.'}
              </p>
            </div>
            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-semibold uppercase text-slate-700 dark:text-slate-300">
              Consent: {consent.consentStatus} • Guardian: {consent.parentVerificationStatus}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
            <label className="flex items-center gap-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 p-3 cursor-pointer text-slate-800 dark:text-slate-200">
              <input
                type="checkbox"
                checked={consent.allowAnalyticsTracking}
                onChange={(e) => void handleConsentChange({ allowAnalyticsTracking: e.target.checked })}
                className="rounded text-blue-600"
              />
              <span>Analytics telemetry</span>
            </label>
            <label className="flex items-center gap-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 p-3 cursor-pointer text-slate-800 dark:text-slate-200">
              <input
                type="checkbox"
                checked={consent.allowAiMemory}
                onChange={(e) => void handleConsentChange({ allowAiMemory: e.target.checked })}
                className="rounded text-blue-600"
              />
              <span>Study Advisor memory</span>
            </label>
            <label className="flex items-center gap-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 p-3 cursor-pointer text-slate-800 dark:text-slate-200">
              <input
                type="checkbox"
                checked={consent.allowResearchInclusion}
                onChange={(e) => void handleConsentChange({ allowResearchInclusion: e.target.checked })}
                className="rounded text-blue-600"
              />
              <span>Anonymized research cohort</span>
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <form onSubmit={handleRequestGuardian} className="flex flex-wrap items-center gap-2">
              <input
                type="email"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                placeholder="Parent or guardian email (for under-18 students)"
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 min-w-[230px]"
              />
              <button
                type="submit"
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
              >
                Save Guardian Email
              </button>
            </form>

            <button
              type="button"
              onClick={() => void handleConsentChange({ withdrawAll: true })}
              className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50 px-3 py-2 text-xs font-semibold text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/60 cursor-pointer"
            >
              Turn Off All Optional Sharing
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
