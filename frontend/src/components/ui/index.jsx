// ─── Button ───────────────────────────────────────────────────────────────────
export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  loading = false,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-fin-blue hover:bg-blue-600 text-white",
    danger: "bg-fin-red hover:bg-red-600 text-white",
    ghost: "bg-transparent hover:bg-fin-muted text-fin-text-secondary hover:text-fin-text-primary",
    outline: "border border-fin-border hover:bg-fin-muted text-fin-text-primary",
    success: "bg-fin-green hover:bg-emerald-600 text-white",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className = "", ...props }) {
  return (
    <div className={`fin-card ${className}`} {...props}>
      {children}
    </div>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({ label, error, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-fin-text-secondary">{label}</label>
      )}
      <input
        className={`fin-input w-full ${error ? "border-fin-red focus:border-fin-red" : ""} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-fin-red">{error}</p>}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function ChangeBadge({ value, showIcon = true }) {
  const isPositive = value >= 0;
  const cls = isPositive ? "fin-badge-gain" : "fin-badge-loss";
  return (
    <span className={cls}>
      {showIcon && (isPositive ? "▲" : "▼")}
      {Math.abs(value).toFixed(2)}%
    </span>
  );
}

// ─── LoadingSpinner ───────────────────────────────────────────────────────────
export function LoadingSpinner({ size = "md", className = "" }) {
  const sizes = { sm: "w-4 h-4", md: "w-8 h-8", lg: "w-12 h-12" };
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizes[size]} border-2 border-fin-border border-t-fin-blue rounded-full animate-spin`}
      />
    </div>
  );
}

// ─── PageLoader ───────────────────────────────────────────────────────────────
export function PageLoader() {
  return (
    <div className="h-64 flex flex-col items-center justify-center gap-3">
      <LoadingSpinner size="lg" />
      <p className="text-fin-text-secondary text-sm animate-pulse">Loading data…</p>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export function Skeleton({ className = "" }) {
  return <div className={`shimmer rounded-lg ${className}`} />;
}

// ─── ErrorMessage ─────────────────────────────────────────────────────────────
export function ErrorMessage({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <div className="text-4xl">⚠️</div>
      <p className="text-fin-text-secondary">{message || "Something went wrong"}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, trend, icon, accent }) {
  const accentMap = {
    green: "border-fin-green/30 bg-fin-green/5",
    red: "border-fin-red/30 bg-fin-red/5",
    blue: "border-fin-blue/30 bg-fin-blue/5",
    purple: "border-fin-purple/30 bg-fin-purple/5",
  };
  return (
    <Card className={`p-5 ${accentMap[accent] || ""}`}>
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-fin-text-secondary uppercase tracking-wider font-medium">
            {label}
          </span>
          <span className="text-2xl font-bold font-num text-fin-text-primary">{value}</span>
          {sub && <span className="text-xs text-fin-text-secondary font-num">{sub}</span>}
        </div>
        {icon && (
          <div className="text-2xl p-2 rounded-lg bg-fin-muted">{icon}</div>
        )}
      </div>
      {trend !== undefined && (
        <div className="mt-3">
          <ChangeBadge value={trend} />
        </div>
      )}
    </Card>
  );
}