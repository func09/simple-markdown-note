import { create } from "zustand";

interface AppState {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
}

export const useStore = create<AppState>((set) => ({
  theme: "light",
  setTheme: (theme) => set({ theme }),
}));
