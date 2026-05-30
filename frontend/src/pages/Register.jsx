import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, LineChart, User, Mail, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import useAuthStore from "../store/authStore";
import { useRedirectIfAuthed } from "../hooks/useAuth";

const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLORS = ["", "bg-fin-red", "bg-yellow-500", "bg-fin-yellow", "bg-fin-green"];

function passwordStrength(pw) {
  let score = 0;
  if (pw.length >= 8)           score++;
  if (/[A-Z]/.test(pw))         score++;
  if (/[0-9]/.test(pw))         score++;
  if (/[^A-Za-z0-9]/.test(pw))  score++;
  return score;
}

function Field({
  id,
  label,
  type = "text",
  placeholder,
  icon: Icon,
  fieldName,
  value,
  onChange,
  error,
  right,
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-fin-text-secondary">
        {label}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-fin-text-secondary"
          />
        )}

        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`fin-input ${Icon ? "pl-9" : "pl-4"} ${
            right ? "pr-10" : ""
          } w-full ${error ? "border-fin-red" : ""}`}
        />

        {right}
      </div>

      {error && (
        <p className="text-xs text-fin-red">
          ⚠ {error}
        </p>
      )}
    </div>
  );
}

export default function Register() {
  // useRedirectIfAuthed();

  const [form, setForm] = useState({
    username: "", email: "", password: "", confirm: "", full_name: "",
  });
  const [showPwd, setShowPwd]     = useState(false);
  const [errors, setErrors]       = useState({});
  const { register, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const strength = passwordStrength(form.password);

  const validate = () => {
    const e = {};
    if (!form.username || form.username.length < 3)
      e.username = "Username must be at least 3 characters";
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email))
      e.email = "Enter a valid email";
    if (!form.password || form.password.length < 6)
      e.password = "Password must be at least 6 characters";
    if (form.password !== form.confirm)
      e.confirm = "Passwords don't match";
    return e;
  };

  const handleChange = (field) => (e) => {
  const value = e.target.value;

  setForm((prev) => ({
    ...prev,
    [field]: value,
  }));
};
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const result = await register({
      username: form.username,
      email: form.email,
      password: form.password,
      full_name: form.full_name || undefined,
    });
    if (result.success) navigate("/", { replace: true });
  };

  
  return (
    <div className="min-h-screen bg-fin-bg flex">
      {/* Left branding */}
      <div className="hidden lg:flex flex-col justify-between w-[42%] bg-fin-surface border-r border-fin-border p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute top-[-80px] right-[-80px] w-72 h-72 bg-fin-green/10 rounded-full blur-3xl" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-fin-green flex items-center justify-center shadow-lg shadow-fin-green/30">
            <LineChart size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold font-display text-fin-text-primary">
            Fin<span className="text-fin-green">dash</span>
          </span>
        </div>

        <div className="relative z-10 space-y-6">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold font-display text-fin-text-primary leading-tight"
          >
            Start your
            <br />
            <span className="text-fin-green">trading journey.</span>
          </motion.h1>
          <div className="space-y-3">
            {[
  "Real-time NIFTY & SENSEX quotes",
  "Portfolio P&L with live prices",
  "RSI, MACD & Bollinger Bands",
  "Personalised watchlist",
].map((feature, i) => (
  <div
    key={feature}
    className="flex items-center gap-2 text-sm text-fin-text-secondary"
  >
    <CheckCircle2 size={14} className="text-fin-green shrink-0" />
    {feature}
  </div>
))}
          </div>
        </div>

        <p className="text-xs text-fin-text-secondary relative z-10">
          © {new Date().getFullYear()} Findash · Free to use
        </p>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm space-y-6 py-8"
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

          <div>
            <h2 className="text-2xl font-bold font-display text-fin-text-primary">
              Create account
            </h2>
            <p className="text-sm text-fin-text-secondary mt-1">
              Join Findash — it's free
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-fin-red/10 border border-fin-red/30 text-fin-red text-sm px-4 py-3 rounded-lg"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full name */}
           <Field
  label="Full Name (optional)"
  placeholder="Raj Sharma"
  icon={User}
  value={form.full_name}
  onChange={handleChange("full_name")}
  error={errors.full_name}
/>
            {/* <input
  type="text"
  value={form.full_name}
  onChange={(e) =>
    setForm((prev) => ({
      ...prev,
      full_name: e.target.value,
    }))
  }
/> */}

            {/* Username */}
            <Field
  label="Username *"
  placeholder="rajsharma"
  icon={User}
  value={form.username}
  onChange={handleChange("username")}
  error={errors.username}
/>
            {/* <input
  value={form.username}
  onChange={handleChange("username")}
/> */}

            {/* Email */}
            <Field
  label="Email *"
  type="email"
  placeholder="you@example.com"
  icon={Mail}
  value={form.email}
  onChange={handleChange("email")}
  error={errors.email}
/>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-fin-text-secondary">
                Password *
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-fin-text-secondary"
                />
                <input
                  type={showPwd ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange("password")}
                  placeholder="Min 6 characters"
                  className={`fin-input pl-9 pr-10 w-full ${errors.password ? "border-fin-red" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-fin-text-secondary hover:text-fin-text-primary"
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {/* Strength bar */}
              {form.password && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((n) => (
                      <div
                        key={n}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          strength >= n ? STRENGTH_COLORS[strength] : "bg-fin-border"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-fin-text-secondary">
                    Strength:{" "}
                    <span className={`font-medium ${strength >= 3 ? "text-fin-green" : strength >= 2 ? "text-fin-yellow" : "text-fin-red"}`}>
                      {STRENGTH_LABELS[strength]}
                    </span>
                  </p>
                </div>
              )}
              {errors.password && <p className="text-xs text-fin-red">⚠ {errors.password}</p>}
            </div>

            {/* Confirm */}
            <Field
  label="Confirm Password *"
  type="password"
  placeholder="••••••••"
  icon={Lock}
  value={form.confirm}
  onChange={handleChange("confirm")}
  error={errors.confirm}
/>

            <button
              type="submit"
              disabled={loading}
              className="fin-btn-primary w-full flex items-center justify-center gap-2 h-11 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create Account <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-fin-text-secondary">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-fin-blue hover:text-blue-400 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}