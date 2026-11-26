export type ThemeModePreference = 'light' | 'dark' | 'system';
export type ThemeAccent = 'blue' | 'emerald' | 'teal' | 'amber' | 'slate';
export type LayoutWidth = 'standard' | 'wide' | 'full';
export type CardDensity = 'comfortable' | 'compact';
export type FontFamilyPreference = 'jakarta' | 'inter' | 'serif' | 'system' | 'mono';
export type FontScale = 'sm' | 'md' | 'lg' | 'xl';
export type LineSpacing = 'normal' | 'relaxed';
export type DefaultScholarshipsTab = 'flagship' | 'top_universities';
export type AdvisorResponseStyle = 'balanced' | 'concise' | 'bilingual';
export type DeadlineReminderDays = 3 | 7 | 14;
export type InterfaceLanguage = 'en' | 'km';

export interface UserSettings {
  themeMode: ThemeModePreference;
  accentColor: ThemeAccent;
  highContrast: boolean;
  reducedMotion: boolean;
  layoutWidth: LayoutWidth;
  sidebarDefaultCollapsed: boolean;
  cardDensity: CardDensity;
  fontFamily: FontFamilyPreference;
  fontScale: FontScale;
  lineSpacing: LineSpacing;
  language: InterfaceLanguage;
  defaultScholarshipsTab: DefaultScholarshipsTab;
  onlyVerifiedScholarshipsByDefault: boolean;
  deadlineReminderDays: DeadlineReminderDays;
  advisorResponseStyle: AdvisorResponseStyle;
}

export type PartialUserSettings = Partial<UserSettings>;

export const DEFAULT_USER_SETTINGS: UserSettings = {
  themeMode: 'light',
  accentColor: 'blue',
  highContrast: false,
  reducedMotion: false,
  layoutWidth: 'standard',
  sidebarDefaultCollapsed: false,
  cardDensity: 'comfortable',
  fontFamily: 'jakarta',
  fontScale: 'md',
  lineSpacing: 'normal',
  language: 'en',
  defaultScholarshipsTab: 'flagship',
  onlyVerifiedScholarshipsByDefault: true,
  deadlineReminderDays: 7,
  advisorResponseStyle: 'balanced',
};

const VALID_THEME_MODES = new Set<ThemeModePreference>(['light', 'dark', 'system']);
const VALID_ACCENTS = new Set<ThemeAccent>(['blue', 'emerald', 'teal', 'amber', 'slate']);
const VALID_LAYOUTS = new Set<LayoutWidth>(['standard', 'wide', 'full']);
const VALID_DENSITIES = new Set<CardDensity>(['comfortable', 'compact']);
const VALID_FONTS = new Set<FontFamilyPreference>(['jakarta', 'inter', 'serif', 'system', 'mono']);
const VALID_SCALES = new Set<FontScale>(['sm', 'md', 'lg', 'xl']);
const VALID_SPACINGS = new Set<LineSpacing>(['normal', 'relaxed']);
const VALID_LANGUAGES = new Set<InterfaceLanguage>(['en', 'km']);
const VALID_SCH_TABS = new Set<DefaultScholarshipsTab>(['flagship', 'top_universities']);
const VALID_ADVISOR_STYLES = new Set<AdvisorResponseStyle>(['balanced', 'concise', 'bilingual']);
const VALID_REMINDER_DAYS = new Set<DeadlineReminderDays>([3, 7, 14]);

export function normalizeUserSettings(raw: unknown): UserSettings {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_USER_SETTINGS };
  }
  const src = raw as Record<string, unknown>;
  return {
    themeMode: VALID_THEME_MODES.has(src.themeMode as ThemeModePreference)
      ? (src.themeMode as ThemeModePreference)
      : DEFAULT_USER_SETTINGS.themeMode,
    accentColor: VALID_ACCENTS.has(src.accentColor as ThemeAccent)
      ? (src.accentColor as ThemeAccent)
      : DEFAULT_USER_SETTINGS.accentColor,
    highContrast:
      typeof src.highContrast === 'boolean' ? src.highContrast : DEFAULT_USER_SETTINGS.highContrast,
    reducedMotion:
      typeof src.reducedMotion === 'boolean' ? src.reducedMotion : DEFAULT_USER_SETTINGS.reducedMotion,
    layoutWidth: VALID_LAYOUTS.has(src.layoutWidth as LayoutWidth)
      ? (src.layoutWidth as LayoutWidth)
      : DEFAULT_USER_SETTINGS.layoutWidth,
    sidebarDefaultCollapsed:
      typeof src.sidebarDefaultCollapsed === 'boolean'
        ? src.sidebarDefaultCollapsed
        : DEFAULT_USER_SETTINGS.sidebarDefaultCollapsed,
    cardDensity: VALID_DENSITIES.has(src.cardDensity as CardDensity)
      ? (src.cardDensity as CardDensity)
      : DEFAULT_USER_SETTINGS.cardDensity,
    fontFamily: VALID_FONTS.has(src.fontFamily as FontFamilyPreference)
      ? (src.fontFamily as FontFamilyPreference)
      : DEFAULT_USER_SETTINGS.fontFamily,
    fontScale: VALID_SCALES.has(src.fontScale as FontScale)
      ? (src.fontScale as FontScale)
      : DEFAULT_USER_SETTINGS.fontScale,
    lineSpacing: VALID_SPACINGS.has(src.lineSpacing as LineSpacing)
      ? (src.lineSpacing as LineSpacing)
      : DEFAULT_USER_SETTINGS.lineSpacing,
    language: VALID_LANGUAGES.has(src.language as InterfaceLanguage)
      ? (src.language as InterfaceLanguage)
      : DEFAULT_USER_SETTINGS.language,
    defaultScholarshipsTab: VALID_SCH_TABS.has(src.defaultScholarshipsTab as DefaultScholarshipsTab)
      ? (src.defaultScholarshipsTab as DefaultScholarshipsTab)
      : DEFAULT_USER_SETTINGS.defaultScholarshipsTab,
    onlyVerifiedScholarshipsByDefault:
      typeof src.onlyVerifiedScholarshipsByDefault === 'boolean'
        ? src.onlyVerifiedScholarshipsByDefault
        : DEFAULT_USER_SETTINGS.onlyVerifiedScholarshipsByDefault,
    deadlineReminderDays: VALID_REMINDER_DAYS.has(src.deadlineReminderDays as DeadlineReminderDays)
      ? (src.deadlineReminderDays as DeadlineReminderDays)
      : DEFAULT_USER_SETTINGS.deadlineReminderDays,
    advisorResponseStyle: VALID_ADVISOR_STYLES.has(src.advisorResponseStyle as AdvisorResponseStyle)
      ? (src.advisorResponseStyle as AdvisorResponseStyle)
      : DEFAULT_USER_SETTINGS.advisorResponseStyle,
  };
}
