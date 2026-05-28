import { create } from "zustand";
import { portfolioAPI } from "@/services/api";

const usePortfolioStore = create((set) => ({
  items: [],
  summary: null,
  loading: false,
  error: null,

  fetchPortfolio: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await portfolioAPI.get();
      set({ items: data.items, summary: data.summary });
    } catch (err) {
      set({ error: err.response?.data?.detail || "Failed to fetch portfolio" });
    } finally {
      set({ loading: false });
    }
  },

  addItem: async (itemData) => {
    try {
      await portfolioAPI.add(itemData);
      // Re-fetch to get updated prices
      const { data } = await portfolioAPI.get();
      set({ items: data.items, summary: data.summary });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to add item";
      return { success: false, error: msg };
    }
  },

  removeItem: async (id) => {
    try {
      await portfolioAPI.remove(id);
      const { data } = await portfolioAPI.get();
      set({ items: data.items, summary: data.summary });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.detail };
    }
  },

  clearError: () => set({ error: null }),
}));

export default usePortfolioStore;