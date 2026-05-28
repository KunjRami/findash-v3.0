import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// Inject JWT on every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("findash_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (err) => Promise.reject(err)
);

// Handle 401 → logout
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("findash_token");
      localStorage.removeItem("findash_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  me: () => api.get("/auth/me"),
};

// ─── Stocks ──────────────────────────────────────────────────────────────────
export const stocksAPI = {
  marketOverview: () => api.get("/stocks/market-overview"),
  topMovers: () => api.get("/stocks/top-movers"),
  search: (q) => api.get(`/stocks/search?q=${encodeURIComponent(q)}`),
  detail: (symbol, period = "3mo") =>
    api.get(`/stocks/${symbol}?period=${period}`),
};

// ─── Portfolio ────────────────────────────────────────────────────────────────
export const portfolioAPI = {
  get: () => api.get("/portfolio/"),
  add: (data) => api.post("/portfolio/", data),
  update: (id, data) => api.put(`/portfolio/${id}`, data),
  remove: (id) => api.delete(`/portfolio/${id}`),
};

// ─── Watchlist ────────────────────────────────────────────────────────────────
export const watchlistAPI = {
  get: () => api.get("/watchlist/"),
  add: (data) => api.post("/watchlist/", data),
  remove: (id) => api.delete(`/watchlist/${id}`),
};

export default api;