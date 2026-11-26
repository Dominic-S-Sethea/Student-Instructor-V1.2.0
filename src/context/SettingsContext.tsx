import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  DEFAULT_USER_SETTINGS,
  normalizeUserSettings,
  type PartialUserSettings,
  type UserSettings,
} from '../../shared/types/userSettings';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import { useLanguage } from './LanguageContext';
import { settingsClient } from '../services/settingsClient';

export type SettingsSyncStatus = 'local' | 'saving' | 'synced' | 'offline_fallback';

interface SettingsContextValue {
  settings: UserSettings;
  syncStatus: SettingsSyncStatus;
  updateSettings: (patch: PartialUserSettings) => void;
  resetSettings: () => Promise<void>;
}

export const SETTINGS_STORAGE_KEY = 'cdes_user_settings_v1';

const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_USER_SETTINGS,
  syncStatus: 'local',
  updateSettings: () => {},
  resetSettings: async () => {},
});

function readLocalSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      return normalizeUserSettings(JSON.parse(raw));
    }
    const legacyTheme = localStorage.getItem('cdes_study_theme');
    const legacyLang = localStorage.getItem('preferred_language');
    const legacySidebar = localStorage.getItem('cdes_sidebar_collapsed');
    return normalizeUserSettings({
      themeMode:
        legacyTheme === 'dark' || legacyTheme === 'light' || legacyTheme === 'system'
          ? legacyTheme
          : DEFAULT_USER_SETTINGS.themeMode,
      language: legacyLang === 'km' || legacyLang === 'en' ? legacyLang : DEFAULT_USER_SETTINGS.language,
      sidebarDefaultCollapsed: legacySidebar === 'true',
    });
  } catch {
    return { ...DEFAULT_USER_SETTINGS };
  }
}

function persistLocalSettings(next: UserSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
    localStorage.setItem('cdes_sidebar_collapsed', String(next.sidebarDefaultCollapsed));
  } catch {
    // Ignore storage quota or private mode restrictions
  }
}

function applySettingsToDocument(next: UserSettings): void {
  const root = document.documentElement;
  root.dataset.accent = next.accentColor;
  root.dataset.layout = next.layoutWidth;
  root.dataset.density = next.cardDensity;
  root.dataset.font = next.fontFamily;
  root.dataset.fontScale = next.fontScale;
  root.dataset.lineSpacing = next.lineSpacing;
  if (next.highContrast) {
    root.dataset.contrast = 'high';
  } else {
    delete root.dataset.contrast;
  }
  if (next.reducedMotion) {
    root.dataset.reduceMotion = 'true';
  } else {
    delete root.dataset.reduceMotion;
  }
}

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authenticated, user } = useAuth();
  const { setTheme } = useTheme();
  const { setLanguage } = useLanguage();

  const [settings, setSettings] = useState<UserSettings>(readLocalSettings);
  const [syncStatus, setSyncStatus] = useState<SettingsSyncStatus>('local');
  const pendingPatchRef = useRef<PartialUserSettings>({});
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadedUserIdRef = useRef<string | null>(null);

  // Apply DOM attributes and local cache whenever settings change
  useEffect(() => {
    applySettingsToDocument(settings);
    persistLocalSettings(settings);
  }, [settings]);

  // Sync ThemeContext and LanguageContext whenever Settings values change
  useEffect(() => {
    setTheme(settings.themeMode);
  }, [settings.themeMode, setTheme]);

  useEffect(() => {
    setLanguage(settings.language);
  }, [settings.language, setLanguage]);

  // Hydrate server-persisted settings when a user signs in (and reset sync status on sign-out)
  useEffect(() => {
    const userId = authenticated && user?.id ? user.id : null;
    if (!userId) {
      loadedUserIdRef.current = null;
      setSyncStatus('local');
      return;
    }
    if (loadedUserIdRef.current === userId) {
      return;
    }
    loadedUserIdRef.current = userId;
    let cancelled = false;

    void settingsClient
      .getSettings()
      .then((serverSettings) => {
        if (cancelled) return;
        const normalized = normalizeUserSettings(serverSettings);
        setSettings(normalized);
        setTheme(normalized.themeMode);
        setLanguage(normalized.language);
        setSyncStatus('synced');
      })
      .catch(() => {
        if (!cancelled) {
          setSyncStatus('offline_fallback');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authenticated, user?.id, setTheme, setLanguage]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const flushServerUpdate = useCallback(() => {
    const patch = pendingPatchRef.current;
    pendingPatchRef.current = {};
    if (Object.keys(patch).length === 0) return;

    setSyncStatus('saving');
    void settingsClient
      .updateSettings(patch)
      .then((saved) => {
        const normalized = normalizeUserSettings(saved);
        setSettings(normalized);
        setSyncStatus('synced');
      })
      .catch(() => {
        setSyncStatus('offline_fallback');
      });
  }, []);

  const updateSettings = useCallback(
    (patch: PartialUserSettings): void => {
      setSettings((prev) => {
        const merged = normalizeUserSettings({ ...prev, ...patch });
        return merged;
      });
      if (patch.themeMode) {
        setTheme(patch.themeMode);
      }
      if (patch.language) {
        setLanguage(patch.language);
      }

      if (!authenticated) {
        setSyncStatus('local');
        return;
      }

      pendingPatchRef.current = { ...pendingPatchRef.current, ...patch };
      setSyncStatus('saving');
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(flushServerUpdate, 250);
    },
    [authenticated, flushServerUpdate, setTheme, setLanguage],
  );

  const resetSettings = useCallback(async (): Promise<void> => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    pendingPatchRef.current = {};
    const defaults = { ...DEFAULT_USER_SETTINGS };
    setSettings(defaults);
    setTheme(defaults.themeMode);
    setLanguage(defaults.language);

    if (!authenticated) {
      setSyncStatus('local');
      return;
    }

    setSyncStatus('saving');
    try {
      const resetFromServer = await settingsClient.resetSettings();
      const normalized = normalizeUserSettings(resetFromServer);
      setSettings(normalized);
      setSyncStatus('synced');
    } catch {
      setSyncStatus('offline_fallback');
    }
  }, [authenticated, setTheme, setLanguage]);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      syncStatus,
      updateSettings,
      resetSettings,
    }),
    [settings, syncStatus, updateSettings, resetSettings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export function useSettings(): SettingsContextValue {
  return useContext(SettingsContext);
}
