import { create } from "zustand";
import { watchlistAPI } from "@/services/api";

const useWatchlistStore = create((set) => ({
  items: [],
  loading: false,
  error: null,

  fetchWatchlist: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await watchlistAPI.get();
      set({ items: data });
    } catch (err) {
      set({ error: err.response?.data?.detail || "Failed to fetch watchlist" });
    } finally {
      set({ loading: false });
    }
  },

  addItem: async (symbol, company_name) => {
    try {
      await watchlistAPI.add({ symbol, company_name });
      const { data } = await watchlistAPI.get();
      set({ items: data });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to add to watchlist";
      return { success: false, error: msg };
    }
  },

  removeItem: async (id) => {
    try {
      await watchlistAPI.remove(id);
      set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.detail };
    }
  },
}));

export default useWatchlistStore;