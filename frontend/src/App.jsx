import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Component, Suspense, lazy } from "react";

// Layout
import Layout from "@/components/layout/Layout";

// Pages (lazy-loaded for code splitting)
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const Watchlist = lazy(() => import("./pages/Watchlist"));
const StockDetail = lazy(() => import("./pages/StockDetail"));
const NotFound = lazy(() => import("./pages/NotFound"));

// ─── Global Error Boundary ───────────────────────────────────────────────────
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-fin-bg flex items-center justify-center p-6">
          <div className="fin-card p-8 max-w-lg w-full text-center space-y-4">
            <div className="text-5xl">💥</div>
            <h2 className="text-xl font-bold font-display text-fin-text-primary">
              Something crashed
            </h2>
            <p className="text-sm text-fin-text-secondary font-mono">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <button
              className="fin-btn-primary"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = "/";
              }}
            >
              ↩ Go back to Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Page-level Suspense Fallback ────────────────────────────────────────────
function PageFallback() {
  return (
    <div className="min-h-screen bg-fin-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-fin-border border-t-fin-blue rounded-full animate-spin" />
        <span className="text-fin-text-secondary text-sm">Loading…</span>
      </div>
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            {/* Public routes */}
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes — Layout handles auth redirect */}
            <Route element={<Layout />}>
              <Route index                  element={<Dashboard />} />
              <Route path="portfolio"       element={<Portfolio />} />
              <Route path="watchlist"       element={<Watchlist />} />
              <Route path="stocks/:symbol"  element={<StockDetail />} />
            </Route>

            {/* Fallbacks */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*"    element={<Navigate to="/404" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}