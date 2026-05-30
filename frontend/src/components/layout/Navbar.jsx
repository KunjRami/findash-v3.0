import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Menu, X, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { stocksAPI } from "../../services/api";
import { cleanSymbol } from "../../utils/formatters";

export default function Navbar({ onMenuClick }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);
  const timeoutRef = useRef(null);
  const navigate = useNavigate();

  const handleSearch = (val) => {
    setQuery(val);
    clearTimeout(timeoutRef.current);
    if (!val.trim()) { setResults([]); setShowDropdown(false); return; }
    timeoutRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await stocksAPI.search(val);
        setResults(data);
        setShowDropdown(true);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  };

  const handleSelect = (symbol) => {
    setQuery("");
    setResults([]);
    setShowDropdown(false);
    navigate(`/stocks/${cleanSymbol(symbol)}`);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="h-14 flex items-center gap-4 px-4 md:px-6 bg-fin-surface border-b border-fin-border shrink-0">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="md:hidden text-fin-text-secondary hover:text-fin-text-primary transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Search */}
      <div className="relative flex-1 max-w-md" ref={searchRef}>
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-fin-text-secondary"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search stocks… (e.g. RELIANCE, TCS)"
            className="fin-input pl-9 pr-4 w-full text-sm h-9"
          />
          {searching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-fin-blue border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {/* Dropdown */}
        <AnimatePresence>
          {showDropdown && results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="absolute z-50 top-full mt-1 w-full bg-fin-card border border-fin-border rounded-xl shadow-2xl overflow-hidden"
            >
              {results.map((r) => (
                <button
                  key={r.symbol}
                  onClick={() => handleSelect(r.symbol)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-fin-muted transition-colors text-left"
                >
                  <div>
                    <span className="text-sm font-mono font-semibold text-fin-blue">
                      {cleanSymbol(r.symbol)}
                    </span>
                    <span className="ml-2 text-sm text-fin-text-secondary">{r.name}</span>
                  </div>
                  <span className="text-xs text-fin-text-secondary bg-fin-muted px-2 py-0.5 rounded">
                    {r.exchange}
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <button className="p-2 rounded-lg text-fin-text-secondary hover:bg-fin-muted hover:text-fin-text-primary transition-colors">
          <Bell size={18} />
        </button>
        <div className="text-xs text-fin-text-secondary font-num hidden md:block">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "short", day: "numeric", month: "short", year: "numeric",
          })}
        </div>
      </div>
    </header>
  );
}