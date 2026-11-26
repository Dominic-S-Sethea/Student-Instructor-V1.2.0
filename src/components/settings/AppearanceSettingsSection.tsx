import React from 'react';
import { Check, Contrast, Monitor, Moon, Palette, Sparkles, Sun } from 'lucide-react';
import type {
  PartialUserSettings,
  ThemeAccent,
  ThemeModePreference,
  UserSettings,
} from '../../../shared/types/userSettings';

interface AppearanceSettingsSectionProps {
  settings: UserSettings;
  isKhmer: boolean;
  onUpdate: (patch: PartialUserSettings) => void;
}

const THEME_MODES: Array<{
  id: ThemeModePreference;
  labelEn: string;
  labelKm: string;
  descEn: string;
  descKm: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    id: 'light',
    labelEn: 'Calm Light',
    labelKm: 'ផ្ទៃភ្លឺស្ងប់ស្ងាត់',
    descEn: 'Clean paper canvas for daytime reading',
    descKm: 'ផ្ទៃស្អាតងាយស្រួលអានពេលថ្ងៃ',
    icon: Sun,
  },
  {
    id: 'dark',
    labelEn: 'Dark Study',
    labelKm: 'ផ្ទៃងងឹតសិក្សា',
    descEn: 'Low-glare navy slate for night sessions',
    descKm: 'កាត់បន្ថយពន្លឺសម្រាប់សិក្សាពេលយប់',
    icon: Moon,
  },
  {
    id: 'system',
    labelEn: 'System Auto',
    labelKm: 'តាមប្រព័ន្ធឧបករណ៍',
    descEn: 'Automatically matches your OS theme',
    descKm: 'ប្តូរដោយស្វ័យប្រវត្តិតាមឧបករណ៍អ្នក',
    icon: Monitor,
  },
];

const ACCENT_SWATCHES: Array<{
  id: ThemeAccent;
  labelEn: string;
  labelKm: string;
  hex: string;
  softHex: string;
}> = [
  { id: 'blue', labelEn: 'Academic Blue', labelKm: 'ខៀវសិក្សា', hex: '#2563eb', softHex: '#dbeafe' },
  { id: 'emerald', labelEn: 'Emerald Scholar', labelKm: 'បៃតងមរកត', hex: '#047857', softHex: '#d1fae5' },
  { id: 'teal', labelEn: 'Teal Calm', labelKm: 'ខៀវបៃតងស្រាល', hex: '#0f766e', softHex: '#ccfbf1' },
  { id: 'amber', labelEn: 'Amber Warm', labelKm: 'ទឹកក្រូចកក់ក្តៅ', hex: '#b45309', softHex: '#fef3c7' },
  { id: 'slate', labelEn: 'Slate Minimal', labelKm: 'ប្រផេះសាមញ្ញ', hex: '#334155', softHex: '#e2e8f0' },
];

export const AppearanceSettingsSection: React.FC<AppearanceSettingsSectionProps> = ({
  settings,
  isKhmer,
  onUpdate,
}) => {
  return (
    <section
      aria-labelledby="settings-appearance-heading"
      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-6 shadow-2xs"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <Palette className="w-5 h-5" />
        </div>
        <div>
          <h2
            id="settings-appearance-heading"
            className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100"
          >
            {isKhmer ? 'រូបរាង និងពណ៌ស្បែក' : 'Appearance & Theme Color'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            {isKhmer
              ? 'ជ្រើសរើសផ្ទៃភ្លឺ ឬងងឹត ពណ៌សម្គាល់សំខាន់ៗ និងការកែសម្រួលសម្រាប់ភាពងាយស្រួលភ្នែក។'
              : 'Choose your study lighting mode, primary accent palette, and visual comfort preferences.'}
          </p>
        </div>
      </div>

      {/* Color Mode */}
      <div className="space-y-2.5">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {isKhmer ? 'របៀបពណ៌ផ្ទៃ' : 'Color Mode'}
        </div>
        <div
          role="radiogroup"
          aria-label={isKhmer ? 'របៀបពណ៌ផ្ទៃ' : 'Color Mode'}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          {THEME_MODES.map((mode) => {
            const Icon = mode.icon;
            const selected = settings.themeMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                role="radio"
                aria-checked={selected}
                data-setting-theme={mode.id}
                onClick={() => onUpdate({ themeMode: mode.id })}
                className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  selected
                    ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/50 dark:border-blue-400 ring-1 ring-blue-600/20'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                    <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>{isKhmer ? mode.labelKm : mode.labelEn}</span>
                  </span>
                  {selected && (
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {isKhmer ? mode.descKm : mode.descEn}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Accent Color Swatches */}
      <div className="space-y-2.5">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {isKhmer ? 'ពណ៌សម្គាល់សំខាន់ (Theme Color)' : 'Theme Accent Color'}
        </div>
        <div
          role="radiogroup"
          aria-label={isKhmer ? 'ពណ៌សម្គាល់សំខាន់' : 'Theme Accent Color'}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5"
        >
          {ACCENT_SWATCHES.map((swatch) => {
            const selected = settings.accentColor === swatch.id;
            return (
              <button
                key={swatch.id}
                type="button"
                role="radio"
                aria-checked={selected}
                data-setting-accent={swatch.id}
                onClick={() => onUpdate({ accentColor: swatch.id })}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  selected
                    ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/70'
                }`}
              >
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs border border-black/10"
                  style={{ backgroundColor: swatch.hex }}
                >
                  {selected && <Check className="w-3.5 h-3.5 text-white" />}
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {isKhmer ? swatch.labelKm : swatch.labelEn}
                  </span>
                  <span
                    className="inline-block mt-1 h-1.5 w-10 rounded-full"
                    style={{ backgroundColor: swatch.softHex }}
                  />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Accessibility Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        <button
          type="button"
          role="switch"
          aria-checked={settings.highContrast}
          data-setting-toggle="highContrast"
          onClick={() => onUpdate({ highContrast: !settings.highContrast })}
          className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <div className="flex items-start gap-2.5 min-w-0">
            <Contrast className="w-4 h-4 text-slate-600 dark:text-slate-300 mt-0.5 shrink-0" />
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {isKhmer ? 'បង្កើនកម្រិតពណ៌ច្បាស់ (High Contrast)' : 'High-Contrast Text & Borders'}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {isKhmer
                  ? 'ធ្វើឱ្យអក្សរ និងស៊ុមបន្ទាត់កាន់តែច្បាស់សម្រាប់ការអានយូរ'
                  : 'Sharper ink contrast and card borders for easier reading'}
              </div>
            </div>
          </div>
          <span
            className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 flex items-center ${
              settings.highContrast ? 'bg-blue-600 justify-end' : 'bg-slate-300 dark:bg-slate-600 justify-start'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white shadow-xs" />
          </span>
        </button>

        <button
          type="button"
          role="switch"
          aria-checked={settings.reducedMotion}
          data-setting-toggle="reducedMotion"
          onClick={() => onUpdate({ reducedMotion: !settings.reducedMotion })}
          className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <div className="flex items-start gap-2.5 min-w-0">
            <Sparkles className="w-4 h-4 text-slate-600 dark:text-slate-300 mt-0.5 shrink-0" />
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {isKhmer ? 'កាត់បន្ថយចលនា (Reduce Animations)' : 'Reduce Animations'}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {isKhmer
                  ? 'បិទចលនារអិល និងការប្តូរទំព័រដើម្បីផ្តោតអារម្មណ៍ល្អ'
                  : 'Minimize transitions and motion effects across views'}
              </div>
            </div>
          </div>
          <span
            className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 flex items-center ${
              settings.reducedMotion ? 'bg-blue-600 justify-end' : 'bg-slate-300 dark:bg-slate-600 justify-start'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white shadow-xs" />
          </span>
        </button>
      </div>
    </section>
  );
};
