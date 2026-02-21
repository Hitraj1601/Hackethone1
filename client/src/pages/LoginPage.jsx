import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Loader from '../components/Loader';
import { roleHome } from '../utils/roleUtils';
import Button from '../components/ui/Button';
import FloatingInput from '../components/ui/FloatingInput';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('manager@fleetflow.io');
  const [password, setPassword] = useState('Password123!');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const user = await login(email, password);
      toast.success('Login successful');
      navigate(roleHome[user.role] || '/dashboard');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-indigo-50 to-cyan-100 px-4 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <div className="pointer-events-none absolute -left-16 top-10 h-72 w-72 rounded-full bg-indigo-400/25 blur-3xl dark:bg-indigo-700/30" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-fuchsia-400/20 blur-3xl dark:bg-fuchsia-700/30" />

      <div className="relative w-full max-w-md rounded-2xl border border-white/70 bg-white/75 p-6 shadow-2xl shadow-slate-300/40 backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-900/75 dark:shadow-black/20">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">FleetFlow Login</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Secure access by role</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <FloatingInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <FloatingInput label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </Button>
        </form>

        <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">{loading ? <Loader text="Authenticating" /> : 'Use seeded accounts for demo.'}</div>
      </div>
    </div>
  );
};

export default LoginPage;
