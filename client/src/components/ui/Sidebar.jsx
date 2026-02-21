import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ items, collapsed, onToggle }) => {
  return (
    <motion.aside
      animate={{ width: collapsed ? 86 : 248 }}
      transition={{ duration: 0.24, ease: 'easeInOut' }}
      className="sticky top-5 h-[calc(100vh-2.5rem)] overflow-hidden rounded-2xl border border-white/70 bg-white/70 p-3 shadow-xl shadow-slate-200/40 backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/70 dark:shadow-black/20"
    >
      <button
        onClick={onToggle}
        className="mb-3 w-full rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
      >
        {collapsed ? 'Expand' : 'Collapse'}
      </button>
      <nav className="space-y-1.5">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/30'
                  : 'text-slate-600 hover:bg-indigo-50 dark:text-slate-300 dark:hover:bg-slate-800/70'
              }`
            }
          >
            <item.icon className="text-base" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </motion.aside>
  );
};

export default Sidebar;
