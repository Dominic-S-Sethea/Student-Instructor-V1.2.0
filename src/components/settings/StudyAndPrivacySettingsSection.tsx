import React from 'react';
import { Award, Bell, Bot, Globe, ShieldCheck } from 'lucide-react';
import type {
  AdvisorResponseStyle,
  DeadlineReminderDays,
  DefaultScholarshipsTab,
  InterfaceLanguage,
  PartialUserSettings,
  UserSettings,
} from '../../../shared/types/userSettings';
import type { TabView } from '../../types';
import { PrivacySettingsSection } from './PrivacySettingsSection';

interface StudyAndPrivacySettingsSectionProps {
  settings: UserSettings;
  isKhmer: boolean;
  onUpdate: (patch: PartialUserSettings) => void;
  onNavigateTab: (tab: TabView) => void;
  onOpenAuthModal?: () => void;
}

export const StudyAndPrivacySettingsSection: React.FC<StudyAndPrivacySettingsSectionProps> = ({
  settings,
  isKhmer,
  onUpdate,
  onNavigateTab,
  onOpenAuthModal,
}) => {
  return (
    <div className="space-y-6">
      <section
        aria-labelledby="settings-study-heading"
        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-6 shadow-2xs"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2
              id="settings-study-heading"
              className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100"
            >
              {isKhmer ? 'ភាសា អាហារូបករណ៍ និងទីប្រឹក្សាសិក្សា' : 'Language, Scholarships & Study Defaults'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              {isKhmer
                ? 'កំណត់ភាសាប្រព័ន្ធ បញ្ជីអាហារូបករណ៍លំនាំដើម រយៈពេលរំលឹក និងរបៀបឆ្លើយរបស់ទីប្រឹក្សា AI។'
                : 'Customize interface language, default scholarship directory, reminder timing, and AI Advisor style.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Interface Language */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Globe className="w-3.5 h-3.5" />
              <span>{isKhmer ? 'ភាសាប្រព័ន្ធ' : 'Interface Language'}</span>
            </div>
            <div role="radiogroup" aria-label="Interface Language" className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: 'en', label: 'English (EN)' },
                  { id: 'km', label: 'ភាសាខ្មែរ (KM)' },
                ] as Array<{ id: InterfaceLanguage; label: string }>
              ).map((opt) => {
                const selected = settings.language === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    data-setting-lang={opt.id}
                    onClick={() => onUpdate({ language: opt.id })}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      selected
                        ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Default Scholarships Directory */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isKhmer ? 'ផ្ទាំងអាហារូបករណ៍លំនាំដើម' : 'Default Scholarships View'}
            </div>
            <div role="radiogroup" aria-label="Default Scholarships View" className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: 'flagship', en: 'Flagship Grants', km: 'អាហារូបករណ៍សំខាន់ៗ' },
                  { id: 'top_universities', en: 'Top 100 Global Aid', km: 'សាកលវិទ្យាល័យកំពូល ១០០' },
                ] as Array<{ id: DefaultScholarshipsTab; en: string; km: string }>
              ).map((opt) => {
                const selected = settings.defaultScholarshipsTab === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    data-setting-sch-tab={opt.id}
                    onClick={() => onUpdate({ defaultScholarshipsTab: opt.id })}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      selected
                        ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {isKhmer ? opt.km : opt.en}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Deadline Reminder Lead Time */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Bell className="w-3.5 h-3.5" />
              <span>{isKhmer ? 'រំលឹកថ្ងៃផុតកំណត់ជាមុន' : 'Deadline Reminder Lead Time'}</span>
            </div>
            <div role="radiogroup" aria-label="Deadline Reminder Lead Time" className="grid grid-cols-3 gap-2">
              {([3, 7, 14] as DeadlineReminderDays[]).map((days) => {
                const selected = settings.deadlineReminderDays === days;
                return (
                  <button
                    key={days}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    data-setting-reminder={days}
                    onClick={() => onUpdate({ deadlineReminderDays: days })}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      selected
                        ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {isKhmer ? `${days} ថ្ងៃមុន` : `${days} days`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Study Advisor Style */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Bot className="w-3.5 h-3.5" />
              <span>{isKhmer ? 'របៀបឆ្លើយរបស់ទីប្រឹក្សា AI' : 'Study Advisor Response Style'}</span>
            </div>
            <div role="radiogroup" aria-label="Study Advisor Response Style" className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'balanced', en: 'Balanced', km: 'តុល្យភាព' },
                  { id: 'concise', en: 'Concise', km: 'ខ្លីចំគោលដៅ' },
                  { id: 'bilingual', en: 'EN + KM', km: 'ពីរភាសា' },
                ] as Array<{ id: AdvisorResponseStyle; en: string; km: string }>
              ).map((opt) => {
                const selected = settings.advisorResponseStyle === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    data-setting-advisor-style={opt.id}
                    onClick={() => onUpdate({ advisorResponseStyle: opt.id })}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      selected
                        ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {isKhmer ? opt.km : opt.en}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Verified Scholarships Switch */}
        <button
          type="button"
          role="switch"
          aria-checked={settings.onlyVerifiedScholarshipsByDefault}
          data-setting-toggle="onlyVerifiedScholarshipsByDefault"
          onClick={() =>
            onUpdate({ onlyVerifiedScholarshipsByDefault: !settings.onlyVerifiedScholarshipsByDefault })
          }
          className="w-full flex items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {isKhmer
                  ? 'បង្ហាញតែអាហារូបករណ៍ដែលបានផ្ទៀងផ្ទាត់ជាលំនាំដើម'
                  : 'Only Verified Scholarships by Default'}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {isKhmer
                  ? 'ត្រងយកតែអាហារូបករណ៍ដែលមានប្រភពផ្លូវការនៅពេលបើកបញ្ជីអាហារូបករណ៍'
                  : 'Filter scholarship search to official source-verified listings on load'}
              </div>
            </div>
          </div>
          <span
            className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 flex items-center ${
              settings.onlyVerifiedScholarshipsByDefault
                ? 'bg-blue-600 justify-end'
                : 'bg-slate-300 dark:bg-slate-600 justify-start'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white shadow-xs" />
          </span>
        </button>
      </section>

      <PrivacySettingsSection
        isKhmer={isKhmer}
        onNavigateTab={onNavigateTab}
        onOpenAuthModal={onOpenAuthModal}
      />
    </div>
  );
};
