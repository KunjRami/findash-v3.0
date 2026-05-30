// src/components/ui/LoadingSkeleton.jsx
// All skeleton variants used across pages

/* ── Base shimmer block ─────────────────────────────────────────── */
export function Skeleton({ className = "", style }) {
  return (
    <div
      className={`shimmer rounded-lg ${className}`}
      style={style}
    />
  );
}

/* ── Stat / KPI card ─────────────────────────────────────────────── */
export function StatCardSkeleton() {
  return (
    <div className="fin-card p-5 space-y-3 animate-pulse">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

/* ── Compact stock / index card ──────────────────────────────────── */
export function StockCardSkeleton() {
  return (
    <div className="fin-card p-4 space-y-2.5 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-28" />
        </div>
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-20" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-3 w-14" />
        <Skeleton className="h-3 w-14" />
        <Skeleton className="h-3 w-14" />
      </div>
    </div>
  );
}

/* ── Chart area skeleton ─────────────────────────────────────────── */
export function ChartSkeleton({ height = 280 }) {
  return (
    <div
      className="fin-card w-full overflow-hidden animate-pulse"
      style={{ height }}
    >
      {/* fake axis labels */}
      <div className="flex flex-col justify-between h-full p-4">
        <div className="flex items-end gap-1 h-full pt-4">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 bg-fin-border/60 rounded-sm"
              style={{ height: `${20 + Math.random() * 60}%` }}
            />
          ))}
        </div>
        <Skeleton className="h-3 w-full mt-2" />
      </div>
    </div>
  );
}

/* ── Table row skeleton ──────────────────────────────────────────── */
export function TableRowSkeleton({ cols = 6 }) {
  return (
    <tr className="border-b border-fin-border animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton
            className="h-4"
            style={{ width: `${50 + Math.random() * 50}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

/* ── Full table skeleton ─────────────────────────────────────────── */
export function TableSkeleton({ rows = 5, cols = 6 }) {
  return (
    <div className="fin-card overflow-hidden">
      {/* header */}
      <div className="flex gap-4 px-4 py-3 border-b border-fin-border bg-fin-muted/30 animate-pulse">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      <table className="w-full">
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Mover card skeleton ─────────────────────────────────────────── */
export function MoverCardSkeleton() {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg animate-pulse">
      <div className="space-y-1.5">
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="h-3 w-28" />
      </div>
      <div className="text-right space-y-1.5">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-5 w-14 rounded-full ml-auto" />
      </div>
    </div>
  );
}

/* ── Full page centre-spinner ────────────────────────────────────── */
export function PageLoader({ label = "Loading…" }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="w-9 h-9 rounded-full border-2 border-fin-border border-t-fin-blue animate-spin" />
      <p className="text-fin-text-secondary text-sm animate-pulse">{label}</p>
    </div>
  );
}

/* ── Inline spinner ──────────────────────────────────────────────── */
export function Spinner({ size = 16, className = "" }) {
  return (
    <div
      className={`inline-block rounded-full border-2 border-fin-border border-t-fin-blue animate-spin ${className}`}
      style={{ width: size, height: size }}
    />
  );
}