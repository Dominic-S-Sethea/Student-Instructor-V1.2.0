import React, { useState } from 'react';
import {
  CheckCircle2,
  Cloud,
  Copy,
  HardDrive,
  RotateCcw,
  Settings as SettingsIcon,
  Sliders,
} from 'lucide-react';
import type { TabView } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useSettings } from '../../context/SettingsContext';
import { AppearanceSettingsSection } from './AppearanceSettingsSection';
import { WorkspaceTypographySection } from './WorkspaceTypographySection';
import { StudyAndPrivacySettingsSection } from './StudyAndPrivacySettingsSection';

interface SettingsViewProps {
  onNavigateTab: (tab: TabView) => void;
  onOpenAuthModal?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onNavigateTab,
  onOpenAuthModal,
}) => {
  const { language } = useLanguage();
  const isKhmer = language === 'km';
  const { settings, syncStatus, updateSettings, resetSettings } = useSettings();
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [copiedDemo, setCopiedDemo] = useState(false);

  const handleReset = async (): Promise<void> => {
    await resetSettings();
    setResetMessage(
      isKhmer
        ? 'បានកំណត់ការកំណត់ទាំងអស់ត្រឡប់ទៅលំនាំដើមវិញ។'
        : 'All display & study preferences restored to defaults.',
    );
    window.setTimeout(() => setResetMessage(null), 4000);
  };

  const sampleText = isKhmer
    ? 'គន្លឹះ៖ អ្នកអាចអូសជ្រើសរើស និងចម្លងអត្ថបទគ្រប់កន្លែងលើវេទិកានេះ — រួមទាំងកាតអាហារូបករណ៍ តារាងប្រៀបធៀបសាកលវិទ្យាល័យ និងរបាយការណ៍លម្អិត។'
    : 'Tip: Every heading, card, badge, and comparison table cell on this platform is selectable and copiable — try highlighting this sentence.';

  const handleCopySample = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(sampleText);
      setCopiedDemo(true);
      window.setTimeout(() => setCopiedDemo(false), 2000);
    } catch {
      // Clipboard API may be unavailable in restricted HTTP contexts
    }
  };

  const syncBadge =
    syncStatus === 'synced'
      ? {
          icon: Cloud,
          text: isKhmer ? 'បានរក្សាទុកក្នុងគណនី' : 'Synced to Account',
          cls: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        }
      : syncStatus === 'saving'
        ? {
            icon: Sliders,
            text: isKhmer ? 'កំពុងរក្សាទុក...' : 'Saving changes...',
            cls: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
          }
        : {
            icon: HardDrive,
            text: isKhmer ? 'រក្សាទុកក្នុងកម្មវិធីរុករក' : 'Saved on This Browser',
            cls: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
          };

  const SyncIcon = syncBadge.icon;

  return (
    <div
      id="settings-panel-root"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6"
    >
      {/* Header Banner */}
      <header className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {isKhmer ? 'ការកំណត់ប្រព័ន្ធ (Settings)' : 'Platform Settings'}
                </h1>
                <span
                  data-settings-sync={syncStatus}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${syncBadge.cls}`}
                >
                  <SyncIcon className="w-3 h-3" />
                  <span>{syncBadge.text}</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
                {isKhmer
                  ? 'កែសម្រួលប្លង់ Widescreen ពណ៌ស្បែក ពុម្ពអក្សរ ទំហំអក្សរ និងការកំណត់សិក្សាតាមតម្រូវការរបស់អ្នក។ ការផ្លាស់ប្តូរមានប្រសិទ្ធភាពភ្លាមៗ។'
                  : 'Personalize widescreen layout, theme color, reading typography, study defaults, and privacy controls. All changes apply live.'}
              </p>
            </div>
          </div>

          <button
            id="settings-reset-btn"
            type="button"
            onClick={() => void handleReset()}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isKhmer ? 'កំណត់ត្រឡប់ដើមវិញ' : 'Reset to Defaults'}</span>
          </button>
        </div>

        {resetMessage && (
          <div
            role="status"
            className="mt-4 inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{resetMessage}</span>
          </div>
        )}

        {/* Live Reading & Accent Preview Strip */}
        <div className="mt-5 rounded-xl border border-blue-200/80 dark:border-blue-900/70 bg-blue-50/50 dark:bg-blue-950/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-300">
              <span>{isKhmer ? 'ការមើលជាមុនផ្ទាល់ (Live Preview)' : 'Live Workspace Preview'}</span>
              <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px]">
                {settings.layoutWidth.toUpperCase()} • {settings.accentColor.toUpperCase()} • {settings.fontFamily.toUpperCase()} ({settings.fontScale.toUpperCase()})
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
              {sampleText}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleCopySample()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <Copy className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{copiedDemo ? (isKhmer ? 'បានចម្លង!' : 'Copied!') : (isKhmer ? 'ចម្លងគំរូ' : 'Copy Sample')}</span>
          </button>
        </div>
      </header>

      <AppearanceSettingsSection settings={settings} isKhmer={isKhmer} onUpdate={updateSettings} />
      <WorkspaceTypographySection settings={settings} isKhmer={isKhmer} onUpdate={updateSettings} />
      <StudyAndPrivacySettingsSection
        settings={settings}
        isKhmer={isKhmer}
        onUpdate={updateSettings}
        onNavigateTab={onNavigateTab}
        onOpenAuthModal={onOpenAuthModal}
      />
    </div>
  );
};
