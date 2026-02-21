import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Loader from '../components/Loader';
import { roleHome } from '../utils/roleUtils';

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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-100 to-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-800">FleetFlow Login</h1>
        <p className="mt-1 text-sm text-slate-500">Secure access by role</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-slate-600">Email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">Password</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <div className="mt-4 text-sm text-slate-500">{loading ? <Loader text="Authenticating" /> : 'Use seeded accounts for demo.'}</div>
      </div>
    </div>
  );
};

export default LoginPage;
