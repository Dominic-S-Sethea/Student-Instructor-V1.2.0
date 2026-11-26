import React from 'react';
import { Check, Layout, PanelLeft, Type } from 'lucide-react';
import type {
  CardDensity,
  FontFamilyPreference,
  FontScale,
  LayoutWidth,
  LineSpacing,
  PartialUserSettings,
  UserSettings,
} from '../../../shared/types/userSettings';

interface WorkspaceTypographySectionProps {
  settings: UserSettings;
  isKhmer: boolean;
  onUpdate: (patch: PartialUserSettings) => void;
}

const LAYOUT_OPTIONS: Array<{
  id: LayoutWidth;
  labelEn: string;
  labelKm: string;
  metaEn: string;
  metaKm: string;
  barWidthClass: string;
}> = [
  {
    id: 'standard',
    labelEn: 'Standard',
    labelKm: 'ស្តង់ដារ',
    metaEn: '1280px centered',
    metaKm: '1280px កណ្តាល',
    barWidthClass: 'w-3/5',
  },
  {
    id: 'wide',
    labelEn: 'Wide',
    labelKm: 'ទូលាយ (Wide)',
    metaEn: '1536px workspace',
    metaKm: '1536px ទូលាយ',
    barWidthClass: 'w-4/5',
  },
  {
    id: 'full',
    labelEn: 'Full Widescreen',
    labelKm: 'ពេញអេក្រង់ (Widescreen)',
    metaEn: '100% edge-to-edge',
    metaKm: '100% ពេញទទឹងអេក្រង់',
    barWidthClass: 'w-full',
  },
];

const FONT_OPTIONS: Array<{
  id: FontFamilyPreference;
  labelEn: string;
  labelKm: string;
  tag: string;
  previewFont: string;
}> = [
  {
    id: 'jakarta',
    labelEn: 'Plus Jakarta Sans',
    labelKm: 'Plus Jakarta Sans (លំនាំដើម)',
    tag: 'Default',
    previewFont: "'Plus Jakarta Sans', 'Kantumruy Pro', sans-serif",
  },
  {
    id: 'inter',
    labelEn: 'Inter Clean',
    labelKm: 'Inter Clean',
    tag: 'UI Sans',
    previewFont: "'Inter', 'Kantumruy Pro', sans-serif",
  },
  {
    id: 'serif',
    labelEn: 'Merriweather Serif',
    labelKm: 'Merriweather Serif',
    tag: 'Editorial',
    previewFont: "'Merriweather', 'Kantumruy Pro', Georgia, serif",
  },
  {
    id: 'system',
    labelEn: 'System Native',
    labelKm: 'ពុម្ពអក្សរប្រព័ន្ធ',
    tag: 'Fast OS',
    previewFont: "system-ui, -apple-system, 'Segoe UI', 'Kantumruy Pro', sans-serif",
  },
  {
    id: 'mono',
    labelEn: 'JetBrains Mono',
    labelKm: 'JetBrains Mono',
    tag: 'Technical',
    previewFont: "'JetBrains Mono', 'Kantumruy Pro', monospace",
  },
];

const SCALE_OPTIONS: Array<{ id: FontScale; label: string; pct: string }> = [
  { id: 'sm', label: 'Small', pct: '92%' },
  { id: 'md', label: 'Default', pct: '100%' },
  { id: 'lg', label: 'Large', pct: '108%' },
  { id: 'xl', label: 'Extra Large', pct: '116%' },
];

export const WorkspaceTypographySection: React.FC<WorkspaceTypographySectionProps> = ({
  settings,
  isKhmer,
  onUpdate,
}) => {
  return (
    <div className="space-y-6">
      {/* Layout & Widescreen Section */}
      <section
        aria-labelledby="settings-layout-heading"
        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-6 shadow-2xs"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Layout className="w-5 h-5" />
          </div>
          <div>
            <h2
              id="settings-layout-heading"
              className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100"
            >
              {isKhmer ? 'ប្លង់អេក្រង់ និង Widescreen' : 'Layout & Widescreen'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              {isKhmer
                ? 'ពង្រីកទទឹងទំព័រសម្រាប់អេក្រង់ធំ គ្រប់គ្រងរបារចំហៀងឆ្វេង និងដង់ស៊ីតេកាត។'
                : 'Control content width on wide monitors, default left sidebar width, and card spacing.'}
            </p>
          </div>
        </div>

        {/* Page Width Selector */}
        <div className="space-y-2.5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {isKhmer ? 'ទទឹងទំព័រ (Page Width / Widescreen)' : 'Page Width (Widescreen)'}
          </div>
          <div
            role="radiogroup"
            aria-label={isKhmer ? 'ទទឹងទំព័រ' : 'Page Width'}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            {LAYOUT_OPTIONS.map((opt) => {
              const selected = settings.layoutWidth === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  data-setting-layout={opt.id}
                  onClick={() => onUpdate({ layoutWidth: opt.id })}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    selected
                      ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/50 dark:border-blue-400 ring-1 ring-blue-600/20'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  {/* Visual mini monitor diagram */}
                  <div className="h-9 rounded-lg bg-slate-200/80 dark:bg-slate-800 p-1.5 flex items-center justify-center mb-2.5 border border-slate-300/60 dark:border-slate-700">
                    <div
                      className={`h-full rounded-sm transition-all ${opt.barWidthClass} ${
                        selected ? 'bg-blue-600 dark:bg-blue-400' : 'bg-slate-400/80 dark:bg-slate-500'
                      }`}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {isKhmer ? opt.labelKm : opt.labelEn}
                    </span>
                    {selected && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    {isKhmer ? opt.metaKm : opt.metaEn}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Left Sidebar Default + Card Density */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <PanelLeft className="w-3.5 h-3.5" />
              <span>{isKhmer ? 'របារចំហៀងឆ្វេងលំនាំដើម' : 'Left Sidebar Default'}</span>
            </div>
            <div role="radiogroup" aria-label="Left Sidebar Default" className="grid grid-cols-2 gap-2">
              {[
                { val: false, en: 'Expanded (272px)', km: 'បើកពេញ (272px)' },
                { val: true, en: 'Icon Rail (76px)', km: 'របារតូច (76px)' },
              ].map((opt) => {
                const selected = settings.sidebarDefaultCollapsed === opt.val;
                return (
                  <button
                    key={String(opt.val)}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    data-setting-sidebar-collapsed={String(opt.val)}
                    onClick={() => onUpdate({ sidebarDefaultCollapsed: opt.val })}
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

          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isKhmer ? 'ដង់ស៊ីតេកាត និងតារាង' : 'Card & Table Density'}
            </div>
            <div role="radiogroup" aria-label="Card and Table Density" className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: 'comfortable', en: 'Comfortable', km: 'ធូរស្រួល' },
                  { id: 'compact', en: 'Compact', km: 'បង្រួមចង្អៀត' },
                ] as Array<{ id: CardDensity; en: string; km: string }>
              ).map((opt) => {
                const selected = settings.cardDensity === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    data-setting-density={opt.id}
                    onClick={() => onUpdate({ cardDensity: opt.id })}
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
      </section>

      {/* Typography & Reading Section */}
      <section
        aria-labelledby="settings-typography-heading"
        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-6 shadow-2xs"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Type className="w-5 h-5" />
          </div>
          <div>
            <h2
              id="settings-typography-heading"
              className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100"
            >
              {isKhmer ? 'ពុម្ពអក្សរ និងការអាន' : 'Typography & Reading'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              {isKhmer
                ? 'ប្តូរពុម្ពអក្សរ ទំហំអក្សរ និងគម្លាតបន្ទាត់ (រក្សាពុម្ពអក្សរខ្មែរ Kantumruy Pro ឱ្យច្បាស់ជានិច្ច)។'
                : 'Pick your preferred reading font, text size, and line spacing (Kantumruy Pro stays preserved for Khmer).'}
            </p>
          </div>
        </div>

        {/* Font Family Picker */}
        <div className="space-y-2.5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {isKhmer ? 'ពុម្ពអក្សរ (Font Family)' : 'Font Family'}
          </div>
          <div
            role="radiogroup"
            aria-label={isKhmer ? 'ពុម្ពអក្សរ' : 'Font Family'}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5"
          >
            {FONT_OPTIONS.map((font) => {
              const selected = settings.fontFamily === font.id;
              return (
                <button
                  key={font.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  data-setting-font={font.id}
                  onClick={() => onUpdate({ fontFamily: font.id })}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    selected
                      ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/50 dark:border-blue-400 ring-1 ring-blue-600/20'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span
                      className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-none"
                      style={{ fontFamily: font.previewFont }}
                    >
                      Aa កខ
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                      {font.tag}
                    </span>
                  </div>
                  <div
                    className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-2 truncate"
                    style={{ fontFamily: font.previewFont }}
                  >
                    {isKhmer ? font.labelKm : font.labelEn}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Font Size Scale & Line Spacing */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isKhmer ? 'ទំហំអក្សរ (Font Size Scale)' : 'Font Size Scale'}
            </div>
            <div role="radiogroup" aria-label="Font Size Scale" className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SCALE_OPTIONS.map((opt) => {
                const selected = settings.fontScale === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    data-setting-scale={opt.id}
                    onClick={() => onUpdate({ fontScale: opt.id })}
                    className={`px-3 py-2.5 rounded-xl border text-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      selected
                        ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-xs font-bold">{opt.label}</div>
                    <div className={`text-[11px] mt-0.5 ${selected ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                      {opt.pct}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isKhmer ? 'គម្លាតបន្ទាត់ (Line Spacing)' : 'Reading Line Spacing'}
            </div>
            <div role="radiogroup" aria-label="Reading Line Spacing" className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: 'normal', en: 'Standard', km: 'ស្តង់ដារ' },
                  { id: 'relaxed', en: 'Relaxed', km: 'ទូលាយស្រួលអាន' },
                ] as Array<{ id: LineSpacing; en: string; km: string }>
              ).map((opt) => {
                const selected = settings.lineSpacing === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    data-setting-spacing={opt.id}
                    onClick={() => onUpdate({ lineSpacing: opt.id })}
                    className={`px-3 py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
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
      </section>
    </div>
  );
};
