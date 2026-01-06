import { create } from 'zustand';

type ThemeState = {
  isDarkMode: boolean;
  toggleTheme: () => void;
  currentScene: string;
  setScene: (scene: string) => void;
};

export const useThemeStore = create<ThemeState>((set) => ({
  isDarkMode: false, // Default light (Pink theme from image)
  toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  currentScene: 'hero',
  setScene: (scene) => set({ currentScene: scene }),
}));
