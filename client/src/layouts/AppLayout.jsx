import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import {
  Activity,
  BarChart3,
  Fuel,
  LayoutDashboard,
  ShieldCheck,
  Truck,
  Waypoints
} from 'lucide-react';
import Sidebar from '../components/ui/Sidebar';
import Navbar from '../components/ui/Navbar';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { pageTransition } from '../animations/pageTransitions';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/vehicles', label: 'Vehicle Registry', icon: Truck },
  { to: '/trips', label: 'Trip Dispatcher', icon: Waypoints },
  { to: '/maintenance', label: 'Maintenance', icon: ShieldCheck },
  { to: '/expenses', label: 'Expense & Fuel', icon: Fuel },
  { to: '/drivers', label: 'Drivers', icon: Activity },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 }
];

const AppLayout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-100 via-indigo-50 to-cyan-50 px-4 py-5 transition-colors duration-300 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <div className="pointer-events-none absolute -top-24 left-1/3 h-72 w-72 rounded-full bg-fuchsia-400/15 blur-3xl dark:bg-fuchsia-700/20" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-cyan-400/15 blur-3xl dark:bg-indigo-600/20" />

      <div className="relative mx-auto grid max-w-[1500px] grid-cols-1 gap-4 lg:grid-cols-[auto_1fr]">
        <Sidebar items={navItems} collapsed={collapsed} onToggle={() => setCollapsed((prev) => !prev)} />

        <section className="space-y-4">
          <Navbar role={user?.role || 'User'} isDark={isDark} onToggleTheme={toggleTheme} onLogout={logout} />
          <AnimatePresence mode="wait">
            <motion.main
              key={location.pathname}
              initial={pageTransition.initial}
              animate={pageTransition.animate}
              exit={pageTransition.exit}
              transition={pageTransition.transition}
              className="space-y-4"
            >
              <Outlet />
            </motion.main>
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
};

export default AppLayout;
