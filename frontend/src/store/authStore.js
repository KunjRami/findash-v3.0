import { create } from "zustand";
import { authAPI } from "@/services/api";

const TOKEN_KEY = "findash_token";
const USER_KEY = "findash_user";

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem(USER_KEY) || "null"),
  token: localStorage.getItem(TOKEN_KEY) || null,
  loading: false,
  error: null,

  isAuthenticated: () => !!get().token,

  setAuth: (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ token, user, error: null });
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authAPI.login({ email, password });
      get().setAuth(data.access_token, data.user);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.detail || "Login failed";
      set({ error: msg });
      return { success: false, error: msg };
    } finally {
      set({ loading: false });
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authAPI.register(userData);
      get().setAuth(data.access_token, data.user);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.detail || "Registration failed";
      set({ error: msg });
      return { success: false, error: msg };
    } finally {
      set({ loading: false });
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({ user: null, token: null, error: null });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;