import { create } from 'zustand';

export type Theme = 'day' | 'dark';
export type Language = 'zh' | 'en';

interface SettingsState {
  theme: Theme;
  language: Language;
  initialized: boolean;

  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  init: () => void;
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: 'day',
  language: 'zh',
  initialized: false,

  setTheme: (theme) => {
    applyTheme(theme);
    localStorage.setItem('mockery_theme', theme);
    set({ theme });
  },

  setLanguage: (language) => {
    localStorage.setItem('mockery_language', language);
    set({ language });
  },

  init: () => {
    if (typeof window === 'undefined') return;
    const savedTheme = (localStorage.getItem('mockery_theme') as Theme | null) ?? 'day';
    const savedLanguage = (localStorage.getItem('mockery_language') as Language | null) ?? 'zh';
    applyTheme(savedTheme);
    set({ theme: savedTheme, language: savedLanguage, initialized: true });
  },
}));
