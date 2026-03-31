import type { MeResponse } from "api";
import { create } from "zustand";

interface AuthState {
  user: MeResponse | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  setAuth: (user: MeResponse) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  user: null,
  isAuthenticated: false,
  setAuth: (user) => set({ user, isAuthenticated: true }),
  clearAuth: () => set({ user: null, isAuthenticated: false }),
}));
