  import { useState } from "react";
  import { Outlet } from "react-router-dom";
  import { AnimatePresence, motion } from "framer-motion";
  import Sidebar from "./Sidebar";
  import Navbar from "./Navbar";
  import { useRequireAuth } from "../../hooks/useAuth";

  export default function Layout() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const authed = useRequireAuth();
    if (!authed) return null;

    return (
      <div className="flex h-screen overflow-hidden bg-fin-bg">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-40 md:hidden"
                onClick={() => setMobileOpen(false)}
              />
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed left-0 top-0 h-full z-50 md:hidden"
              >
                <Sidebar onClose={() => setMobileOpen(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Navbar onMenuClick={() => setMobileOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <motion.div
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.25 }}
>
              <Outlet />
            </motion.div>
          </main>
        </div>
      </div>
    );
  }