import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/vehicles', label: 'Vehicle Registry' },
  { to: '/trips', label: 'Trip Dispatcher' },
  { to: '/maintenance', label: 'Maintenance' },
  { to: '/expenses', label: 'Expense & Fuel' },
  { to: '/drivers', label: 'Drivers' },
  { to: '/analytics', label: 'Analytics' }
];

const Layout = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/dashboard" className="text-lg font-semibold text-indigo-700">
            FleetFlow
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">{user?.role}</span>
            <button onClick={logout} className="btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-4 lg:grid-cols-[220px_1fr]">
        <aside className="card h-fit p-2">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="space-y-4">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
