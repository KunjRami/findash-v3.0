import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Search, X, ExternalLink } from "lucide-react";
import useWatchlistStore from "../../store/watchlistStore";
import { stocksAPI } from "../../services/api";
import { formatCurrency, cleanSymbol } from "../../utils/formatters";

/* ── Add-stock search panel ────────────────────────────────────── */
function AddPanel({ onClose }) {
  const addItem = useWatchlistStore((s) => s.addItem);
  const [query, setQuery]       = useState("");
  const [results, setResults]   = useState([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding]     = useState(null);
  const [msg, setMsg]           = useState("");
  const timer = useRef(null);

  const handleSearch = (val) => {
    setQuery(val);
    setMsg("");
    clearTimeout(timer.current);
    if (!val.trim()) { setResults([]); return; }
    timer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await stocksAPI.search(val);
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
  };

  const handleAdd = async (stock) => {
    setAdding(stock.symbol);
    const result = await addItem(stock.symbol, stock.name);
    setAdding(null);
    if (result.success) { setMsg(`${cleanSymbol(stock.symbol)} added!`); setResults([]); setQuery(""); }
    else setMsg(result.error || "Already in watchlist");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fin-card w-full max-w-md p-5 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-fin-text-primary">Add to Watchlist</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-fin-muted text-fin-text-secondary">
            <X size={16} />
          </button>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-fin-text-secondary" />
          <input
            autoFocus
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search symbol or company…"
            className="fin-input pl-9 w-full text-sm h-10"
          />
          {searching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-fin-blue border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {msg && (
          <p className={`text-xs px-3 py-2 rounded-lg ${msg.includes("added") ? "bg-emerald-950 text-fin-green" : "bg-red-950 text-fin-red"}`}>
            {msg}
          </p>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="rounded-xl border border-fin-border overflow-hidden max-h-64 overflow-y-auto">
            {results.map((s) => (
              <div
                key={s.symbol}
                className="flex items-center justify-between px-4 py-2.5 hover:bg-fin-muted transition-colors border-b border-fin-border/50 last:border-0"
              >
                <div>
                  <span className="text-sm font-mono font-bold text-fin-blue">{cleanSymbol(s.symbol)}</span>
                  <span className="ml-2 text-xs text-fin-text-secondary">{s.name}</span>
                </div>
                <button
                  onClick={() => handleAdd(s)}
                  disabled={adding === s.symbol}
                  className="fin-btn-primary text-xs h-7 px-3"
                >
                  {adding === s.symbol ? (
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><Plus size={11} /> Add</>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

/* ── Main Table ────────────────────────────────────────────────── */
export default function WatchlistTable() {
  const { items, removeItem } = useWatchlistStore();
  const [showAdd, setShowAdd] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const navigate = useNavigate();

  const handleDelete = async (id) => {
    setDeleting(id);
    await removeItem(id);
    setDeleting(null);
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-fin-text-secondary">
          {items.length} stock{items.length !== 1 ? "s" : ""} tracked
        </p>
        <button
          onClick={() => setShowAdd(true)}
          className="fin-btn-primary flex items-center gap-1.5 text-sm h-9 px-4"
        >
          <Plus size={14} /> Add Stock
        </button>
      </div>

      {items.length === 0 ? (
        <div className="fin-card flex flex-col items-center justify-center py-16 gap-4">
          <div className="text-4xl opacity-30">🔖</div>
          <p className="text-fin-text-secondary text-sm">Your watchlist is empty</p>
          <button onClick={() => setShowAdd(true)} className="fin-btn-primary text-sm h-9 px-5">
            <Plus size={14} className="inline mr-1.5" /> Add your first stock
          </button>
        </div>
      ) : (
        <div className="fin-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-fin-muted/40 border-b border-fin-border">
              <tr>
                {["Symbol", "Company", "Price", "Added", ""].map((h) => (
                  <th
                    key={h}
                    className={`px-4 py-2.5 text-xs font-semibold text-fin-text-secondary uppercase tracking-wider
                      ${h === "Price" || h === "" ? "text-right" : "text-left"}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-fin-border/50 hover:bg-fin-muted/30 transition-colors group"
                >
                  {/* Symbol */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate(`/stocks/${cleanSymbol(item.symbol)}`)}
                      className="font-mono font-bold text-fin-blue hover:underline flex items-center gap-1"
                    >
                      {cleanSymbol(item.symbol)}
                      <ExternalLink size={11} className="opacity-0 group-hover:opacity-60 transition-opacity" />
                    </button>
                  </td>

                  {/* Company */}
                  <td className="px-4 py-3 text-fin-text-secondary text-xs max-w-[180px] truncate">
                    {item.company_name}
                  </td>

                  {/* Price */}
                  <td className="px-4 py-3 text-right font-num font-semibold text-fin-text-primary">
                    {item.current_price ? formatCurrency(item.current_price) : "—"}
                  </td>

                  {/* Added date */}
                  <td className="px-4 py-3 text-fin-text-secondary text-xs">
                    {new Date(item.created_at).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
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
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {showAdd && <AddPanel onClose={() => setShowAdd(false)} />}
      </AnimatePresence>
    </>
  );
}