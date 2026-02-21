import { LuMoon, LuSun } from 'react-icons/lu';
import { Link } from 'react-router-dom';
import Button from './Button';

const Navbar = ({ role, isDark, onToggleTheme, onLogout }) => {
  return (
    <header className="sticky top-4 z-30 rounded-2xl border border-white/70 bg-white/70 px-4 py-3 shadow-xl shadow-slate-200/40 backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-900/70 dark:shadow-black/20">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link to="/dashboard" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            FleetFlow
          </Link>
          <span className="rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300">
            {role}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleTheme}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-white/70 text-slate-600 transition hover:scale-105 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            aria-label="Toggle dark mode"
          >
            {isDark ? <LuSun /> : <LuMoon />}
          </button>
          <Button variant="secondary" onClick={onLogout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
