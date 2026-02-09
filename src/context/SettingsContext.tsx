import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ThemeId } from '../constants/themes';
import type { TuningId } from '../constants/tunings';
import { DEFAULT_THEME } from '../constants/themes';
import { DEFAULT_TUNING_ID } from '../constants/tunings';

const STORAGE_KEY = 'mini-guitar-tuner-settings';

export interface Settings {
  theme: ThemeId;
  tuningId: TuningId;
  refToneVolume: number;
  refToneDuration: number;
  calibrationCents: number;
}

const defaultSettings: Settings = {
  theme: DEFAULT_THEME,
  tuningId: DEFAULT_TUNING_ID,
  refToneVolume: 0.5,
  refToneDuration: 1.5,
  calibrationCents: 0,
};

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      theme: parsed.theme ?? defaultSettings.theme,
      tuningId: parsed.tuningId ?? defaultSettings.tuningId,
      refToneVolume: typeof parsed.refToneVolume === 'number' ? parsed.refToneVolume : defaultSettings.refToneVolume,
      refToneDuration: typeof parsed.refToneDuration === 'number' ? parsed.refToneDuration : defaultSettings.refToneDuration,
      calibrationCents: typeof parsed.calibrationCents === 'number' ? parsed.calibrationCents : defaultSettings.calibrationCents,
    };
  } catch {
    return defaultSettings;
  }
}

function saveSettings(s: Settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch (_) {}
}

type SettingsContextValue = {
  settings: Settings;
  setTheme: (theme: ThemeId) => void;
  setTuningId: (id: TuningId) => void;
  setRefToneVolume: (v: number) => void;
  setRefToneDuration: (v: number) => void;
  setCalibrationCents: (v: number) => void;
  resetSettings: () => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettingsState] = useState<Settings>(loadSettings);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  const persist = useCallback((next: Partial<Settings>) => {
    setSettingsState((prev) => {
      const nextSettings = { ...prev, ...next };
      saveSettings(nextSettings);
      return nextSettings;
    });
  }, []);

  const setTheme = useCallback((theme: ThemeId) => persist({ theme }), [persist]);
  const setTuningId = useCallback((tuningId: TuningId) => persist({ tuningId }), [persist]);
  const setRefToneVolume = useCallback((refToneVolume: number) => persist({ refToneVolume }), [persist]);
  const setRefToneDuration = useCallback((refToneDuration: number) => persist({ refToneDuration }), [persist]);
  const setCalibrationCents = useCallback((calibrationCents: number) => persist({ calibrationCents }), [persist]);
  const resetSettings = useCallback(() => {
    setSettingsState(defaultSettings);
    saveSettings(defaultSettings);
  }, []);

  const value: SettingsContextValue = {
    settings,
    setTheme,
    setTuningId,
    setRefToneVolume,
    setRefToneDuration,
    setCalibrationCents,
    resetSettings,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
