import { useEffect } from "react";
import { motion } from "framer-motion";
import { BookmarkCheck } from "lucide-react";
import useWatchlistStore from "../store/watchlistStore";
import WatchlistTable from "../components/watchlist/WatchlistTable";

export default function Watchlist() {
  const { fetchWatchlist } = useWatchlistStore();

  useEffect(() => { fetchWatchlist(); }, []);

  return (
    <div className="space-y-6 pb-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold font-display text-fin-text-primary flex items-center gap-2">
          <BookmarkCheck size={22} className="text-fin-purple" /> Watchlist
        </h1>
        <p className="text-fin-text-secondary text-sm mt-1">
          Monitor stocks you care about — click any to view charts & indicators
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <WatchlistTable />
      </motion.div>
    </div>
  );
}