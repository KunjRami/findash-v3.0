import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, LineChart, Lock, Mail, ArrowRight } from "lucide-react";
import useAuthStore from "@/store/authStore";
import { useRedirectIfAuthed } from "@/hooks/useAuth";

export default function Login() {
  useRedirectIfAuthed();

  const [form, setForm]         = useState({ email: "", password: "" });
  const [showPwd, setShowPwd]   = useState(false);
  const [errors, setErrors]     = useState({});

  const { login, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.email)                      e.email    = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password)                   e.password = "Password is required";
    return e;
  };

  const handleChange = (field) => (ev) => {
    setForm((p) => ({ ...p, [field]: ev.target.value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
    if (error)         clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const result = await login(form.email, form.password);
    if (result.success) navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-fin-bg flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[42%] bg-fin-surface border-r border-fin-border p-12 relative overflow-hidden">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Glow */}
        <div className="absolute bottom-[-80px] left-[-80px] w-72 h-72 bg-fin-blue/10 rounded-full blur-3xl" />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-fin-blue flex items-center justify-center shadow-lg shadow-fin-blue/30">
            <LineChart size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold font-display text-fin-text-primary">
            Fin<span className="text-fin-blue">dash</span>
          </span>
        </div>

        {/* Hero text */}
        <div className="relative z-10 space-y-5">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold font-display text-fin-text-primary leading-tight"
          >
            Markets in
            <br />
            <span className="text-fin-blue">your pocket.</span>
          </motion.h1>
          <p className="text-fin-text-secondary leading-relaxed max-w-xs">
            Real-time NIFTY & SENSEX data, technical indicators, portfolio P&L tracking — all in one place.
          </p>

          {/* Stats row */}
          <div className="flex gap-6 pt-4">
            {[
              { label: "Stocks tracked", value: "25+" },
              { label: "Indicators", value: "6" },
              { label: "Live indices", value: "3" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-xl font-bold font-num text-fin-blue">{s.value}</div>
                <div className="text-xs text-fin-text-secondary mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-fin-text-secondary relative z-10">
          © {new Date().getFullYear()} Findash · For educational use only
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm space-y-8"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 justify-center">
            <div className="w-8 h-8 rounded-lg bg-fin-blue flex items-center justify-center">
              <LineChart size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold font-display text-fin-text-primary">
              Fin<span className="text-fin-blue">dash</span>
            </span>
          </div>

          {/* Heading */}
          <div>
            <h2 className="text-2xl font-bold font-display text-fin-text-primary">
              Welcome back
            </h2>
            <p className="text-sm text-fin-text-secondary mt-1">
              Sign in to your Findash account
            </p>
          </div>

          {/* Global error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-fin-red/10 border border-fin-red/30 text-fin-red text-sm px-4 py-3 rounded-lg"
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-fin-text-secondary">Email</label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-fin-text-secondary"
                />
                <input
                  type="email"
                  value={form.email}
                  onChange={handleChange("email")}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={`fin-input pl-9 w-full ${errors.email ? "border-fin-red" : ""}`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-fin-red">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-fin-text-secondary">Password</label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-fin-text-secondary"
                />
                <input
                  type={showPwd ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange("password")}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`fin-input pl-9 pr-10 w-full ${errors.password ? "border-fin-red" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-fin-text-secondary hover:text-fin-text-primary transition-colors"
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-fin-red">{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="fin-btn-primary w-full flex items-center justify-center gap-2 h-11"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-fin-text-secondary">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-fin-blue hover:text-blue-400 font-medium transition-colors"
            >
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}