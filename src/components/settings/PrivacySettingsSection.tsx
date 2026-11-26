import React, { useEffect, useState } from 'react';
import { ArrowRight, Lock, UserCheck } from 'lucide-react';
import type { TabView } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { profileClient, type PrivacyConsentState } from '../../services/profileClient';

interface PrivacySettingsSectionProps {
  isKhmer: boolean;
  onNavigateTab: (tab: TabView) => void;
  onOpenAuthModal?: () => void;
}

const PRIVACY_TOGGLES = [
  {
    key: 'allowAiMemory',
    en: 'AI Study Memory',
    km: 'អង្គចងចាំការសិក្សា AI',
    descEn: 'Allow the Study Advisor to remember your academic goals across chats.',
    descKm: 'អនុញ្ញាតឱ្យទីប្រឹក្សា AI ចងចាំគោលដៅសិក្សារបស់អ្នក។',
  },
  {
    key: 'allowAnalyticsTracking',
    en: 'Learning Analytics',
    km: 'ការវិភាគវឌ្ឍនភាពសិក្សា',
    descEn: 'Record non-sensitive exploration events to personalize recommendations.',
    descKm: 'កត់ត្រាសកម្មភាពសិក្សាដើម្បីកែលម្អការណែនាំមុខជំនាញ។',
  },
  {
    key: 'allowResearchInclusion',
    en: 'Anonymized Research Inclusion',
    km: 'ចូលរួមក្នុងការស្រាវជ្រាវអនាមិក',
    descEn: 'Opt in to anonymized Cambodian education outcome statistics.',
    descKm: 'យល់ព្រមប្រើទិន្នន័យអនាមិកសម្រាប់ស្ថិតិអប់រំកម្ពុជា។',
  },
] as const;

export const PrivacySettingsSection: React.FC<PrivacySettingsSectionProps> = ({
  isKhmer,
  onNavigateTab,
  onOpenAuthModal,
}) => {
  const { authenticated } = useAuth();
  const [privacy, setPrivacy] = useState<PrivacyConsentState | null>(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!authenticated) {
      setPrivacy(null);
      setNotice(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void profileClient
      .getPrivacyConsent()
      .then((state) => {
        if (!cancelled) setPrivacy(state);
      })
      .catch(() => {
        if (!cancelled) setPrivacy(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authenticated]);

  const handleToggle = async (
    field: 'allowAiMemory' | 'allowAnalyticsTracking' | 'allowResearchInclusion',
  ): Promise<void> => {
    if (!privacy) return;
    setNotice(null);
    try {
      const updated = await profileClient.updatePrivacyConsent({ [field]: !privacy[field] });
      setPrivacy(updated);
      setNotice(isKhmer ? 'បានរក្សាទុកការកំណត់ឯកជនភាព។' : 'Privacy preference saved to your account.');
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Unable to update privacy consent.');
    }
  };

  return (
    <section
      aria-labelledby="settings-privacy-heading"
      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5 shadow-2xs"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2
              id="settings-privacy-heading"
              className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100"
            >
              {isKhmer ? 'ឯកជនភាព អង្គចងចាំ AI និងទិន្នន័យ' : 'Privacy, AI Memory & Data Controls'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              {isKhmer
                ? 'គ្រប់គ្រងការយល់ព្រមលើទិន្នន័យសិក្សា និងអង្គចងចាំទីប្រឹក្សា AI ដោយផ្ទាល់។'
                : 'Directly manage your backend consent controls for AI memory, analytics, and anonymized research.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTab('profile')}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <span>{isKhmer ? 'ទៅកាន់គណនី & ការលុបទិន្នន័យ' : 'Account & Data Erasure'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {!authenticated ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              {isKhmer
                ? 'ចូលគណនីដើម្បីធ្វើសមកាលកម្មការកំណត់ទាំងអស់លើឧបករណ៍នានា និងគ្រប់គ្រងអង្គចងចាំ AI។'
                : 'Sign in to sync your display preferences across devices and manage AI memory & privacy consent.'}
            </div>
          </div>
          {onOpenAuthModal && (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {isKhmer ? 'ចូលគណនី' : 'Sign In'}
            </button>
          )}
        </div>
      ) : loading ? (
        <div className="text-xs text-slate-500 dark:text-slate-400 py-2">
          {isKhmer ? 'កំពុងផ្ទុកការកំណត់ឯកជនភាព...' : 'Loading account privacy controls...'}
        </div>
      ) : privacy ? (
        <div className="space-y-2.5">
          {PRIVACY_TOGGLES.map((item) => {
            const checked = Boolean(privacy[item.key]);
            return (
              <button
                key={item.key}
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => void handleToggle(item.key)}
                className="w-full flex items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {isKhmer ? item.km : item.en}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    {isKhmer ? item.descKm : item.descEn}
                  </div>
                </div>
                <span
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 flex items-center ${
                    checked ? 'bg-blue-600 justify-end' : 'bg-slate-300 dark:bg-slate-600 justify-start'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-white shadow-xs" />
                </span>
              </button>
            );
          })}
          {notice && (
            <p role="status" className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 pt-1">
              {notice}
            </p>
          )}
        </div>
      ) : (
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {isKhmer
            ? 'ការគ្រប់គ្រងឯកជនភាពលម្អិតមាននៅក្នុងទំព័រ ប្រវត្តិរូបខ្ញុំ។'
            : 'Detailed privacy controls are available inside My Profile.'}
        </div>
      )}
    </section>
  );
};
