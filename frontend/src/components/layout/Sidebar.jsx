import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  TrendingUp,
  Briefcase,
  BookmarkCheck,
  LogOut,
  LineChart,
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import logo from "../../assets/findash-logo.png";

const NAV_ITEMS = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/portfolio", icon: Briefcase, label: "Portfolio" },
  { to: "/watchlist", icon: BookmarkCheck, label: "Watchlist" },
];

export default function Sidebar({ onClose }) {
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="flex flex-col h-full bg-fin-surface border-r border-fin-border w-64 shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-fin-border">
        <div className="w-8 h-8 rounded-lg bg-fin-blue flex items-center justify-center">
          <LineChart size={18} className="text-white" />
        </div>
        <span className="text-lg font-bold font-display text-fin-text-primary tracking-tight">
          Fin<span className="text-fin-blue">dash</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="text-xs font-semibold text-fin-text-secondary uppercase tracking-wider px-3 pb-2">
          Main Menu
        </p>
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            onClick={onClose}
            className={({ isActive }) =>
              `fin-sidebar-item text-sm ${isActive ? "active" : ""}`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-fin-border space-y-1">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-fin-blue/20 flex items-center justify-center text-fin-blue font-bold text-sm">
            {user?.username?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-fin-text-primary truncate">
              {user?.full_name || user?.username}
            </p>
            <p className="text-xs text-fin-text-secondary truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="fin-sidebar-item w-full text-sm text-fin-red hover:text-fin-red hover:bg-fin-red/10"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </motion.aside>
  );
}