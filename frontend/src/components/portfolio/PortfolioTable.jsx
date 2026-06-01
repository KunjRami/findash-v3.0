import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, TrendingUp, TrendingDown, X, ChevronUp, ChevronDown } from "lucide-react";
import usePortfolioStore from "../../store/portfolioStore";
import { formatCurrency, cleanSymbol } from "../../utils/formatters";
import AddHoldingModal from "./AddHoldingModal";


/* ── Sort helper ───────────────────────────────────────────────── */
function useSorted(items) {
  const [col, setCol] = useState("symbol");
  const [asc, setAsc] = useState(true);

  const sort = (key) => {
    if (col === key) setAsc((p) => !p);
    else { setCol(key); setAsc(true); }
  };

  const sorted = [...(items || [])].sort((a, b) => {
    const va = a[col] ?? 0, vb = b[col] ?? 0;
    return typeof va === "string"
      ? asc ? va.localeCompare(vb) : vb.localeCompare(va)
      : asc ? va - vb : vb - va;
  });

  const Th = ({ label, field, right = false }) => (
    <th
      onClick={() => sort(field)}
      className={`px-4 py-2.5 text-xs font-semibold text-fin-text-secondary uppercase tracking-wider cursor-pointer
        select-none hover:text-fin-text-primary transition-colors whitespace-nowrap
        ${right ? "text-right" : "text-left"}`}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {col === field
          ? asc ? <ChevronUp size={11} /> : <ChevronDown size={11} />
          : <ChevronUp size={11} className="opacity-20" />}
      </span>
    </th>
  );

  return { sorted, Th };
}

/* ── Main table ─────────────────────────────────────────────────── */
export default function PortfolioTable() {
  // const { items, summary, removeItem } = usePortfolioStore();
  const items = usePortfolioStore((s) => s.items);
const summary = usePortfolioStore((s) => s.summary);
const removeItem = usePortfolioStore((s) => s.removeItem);
  const [showAdd, setShowAdd] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const navigate = useNavigate();
  const { sorted, Th } = useSorted(items);

  const handleDelete = async (id) => {
    setDeleting(id);
    await removeItem(id);
    setDeleting(null);
  };

  return (
    <>
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-fin-text-secondary">
          {items.length} holding{items.length !== 1 ? "s" : ""}
        </p>
        <button
          onClick={() => setShowAdd(true)}
          className="fin-btn-primary flex items-center gap-2 text-sm h-9 px-4"
        >
          <Plus size={14} /> Add Holding
        </button>
      </div>

      {items.length === 0 ? (
        <div className="fin-card flex flex-col items-center justify-center py-16 gap-4">
          <div className="text-4xl opacity-30">📊</div>
          <p className="text-fin-text-secondary text-sm">No holdings yet</p>
          <button onClick={() => setShowAdd(true)} className="fin-btn-primary text-sm h-9 px-5">
            <Plus size={14} className="inline mr-1.5" /> Add your first holding
          </button>
        </div>
      ) : (
        <div className="fin-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-fin-muted/40 border-b border-fin-border">
              <tr>
                <Th label="Symbol"        field="symbol"         />
                <Th label="Qty"           field="quantity"       right />
                <Th label="Avg Buy"       field="buy_price"      right />
                <Th label="CMP"           field="current_price"  right />
                <Th label="Invested"      field="invested_value" right />
                <Th label="Value"         field="current_value"  right />
                <Th label="P&L"           field="pnl"            right />
                <Th label="P&L %"         field="pnl_percent"    right />
                <th className="px-4 py-2.5 text-xs text-fin-text-secondary w-10" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((item) => {
                const isUp = (item.pnl ?? 0) >= 0;
                return (
                  <tr
                    key={item.id}
                    className="border-b border-fin-border/50 hover:bg-fin-muted/30 transition-colors"
                  >
                    {/* Symbol */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate(`/stocks/${cleanSymbol(item.symbol)}`)}
                        className="text-left group"
                      >
                        <p className="font-num font-bold text-fin-blue group-hover:underline">
                          {cleanSymbol(item.symbol)}
                        </p>
                        <p className="text-xs text-fin-text-secondary truncate max-w-[140px]">
                          {item.company_name}
                        </p>
                      </button>
                    </td>

                    {/* Qty */}
                    <td className="px-4 py-3 text-right font-num text-fin-text-primary">
                      {item.quantity}
                    </td>

                    {/* Buy price */}
                    <td className="px-4 py-3 text-right font-num text-fin-text-secondary">
                      {formatCurrency(item.buy_price)}
                    </td>

                    {/* CMP */}
                    <td className="px-4 py-3 text-right font-num font-semibold text-fin-text-primary">
                      {item.current_price ? formatCurrency(item.current_price) : "—"}
                    </td>

                    {/* Invested */}
                    <td className="px-4 py-3 text-right font-num text-fin-text-secondary">
                      {formatCurrency(item.invested_value)}
                    </td>

                    {/* Current value */}
                    <td className="px-4 py-3 text-right font-num text-fin-text-primary">
                      {formatCurrency(item.current_value)}
                    </td>

                    {/* P&L amount */}
                    <td className={`px-4 py-3 text-right font-num font-semibold ${isUp ? "text-fin-green" : "text-fin-red"}`}>
                      {isUp ? "+" : ""}{formatCurrency(item.pnl)}
                    </td>

                    {/* P&L % */}
                    <td className={`px-4 py-3 text-right ${isUp ? "text-fin-green" : "text-fin-red"}`}>
                      <span className={`inline-flex items-center gap-0.5 text-xs font-num font-bold
                        px-1.5 py-0.5 rounded ${isUp ? "bg-emerald-950" : "bg-red-950"}`}>
                        {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {Math.abs(item.pnl_percent).toFixed(2)}%
                      </span>
                    </td>

                    {/* Delete */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deleting === item.id}
                        className="p-1.5 rounded-lg text-fin-text-secondary hover:text-fin-red hover:bg-fin-red/10
                          transition-all disabled:opacity-40"
                      >
                        {deleting === item.id ? (
                          <div className="w-3.5 h-3.5 border-2 border-fin-red/30 border-t-fin-red rounded-full animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary bar */}
      {summary && items.length > 0 && (
        <div className="fin-card mt-3 px-4 py-3 flex flex-wrap gap-x-8 gap-y-2">
          {[
            { label: "Invested",     value: formatCurrency(summary.total_invested),      color: "text-fin-text-primary" },
            { label: "Current",      value: formatCurrency(summary.total_current_value), color: "text-fin-text-primary" },
            { label: "Total P&L",
              value: `${summary.total_pnl >= 0 ? "+" : ""}${formatCurrency(summary.total_pnl)}`,
              color: summary.total_pnl >= 0 ? "text-fin-green" : "text-fin-red" },
            { label: "Return",
              value: `${summary.total_pnl_percent >= 0 ? "+" : ""}${summary.total_pnl_percent.toFixed(2)}%`,
              color: summary.total_pnl_percent >= 0 ? "text-fin-green" : "text-fin-red" },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <p className="text-xs text-fin-text-secondary">{label}</p>
              <p className={`font-num font-bold text-sm ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
  <AddHoldingModal
    onClose={() => setShowAdd(false)}
  />
)}
    </>
  );
}