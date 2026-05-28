import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-fin-bg flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6 max-w-md"
      >
        <div className="font-display text-8xl font-bold text-fin-blue/20 select-none">404</div>
        <h1 className="text-2xl font-bold font-display text-fin-text-primary">Page not found</h1>
        <p className="text-fin-text-secondary">
          This route doesn't exist in our system. Perhaps it got delisted.
        </p>
        <Link
          to="/"
          className="fin-btn-primary inline-flex items-center gap-2"
        >
          ← Back to Dashboard
        </Link>
      </motion.div>
    </div>
  );
}