import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const BennettLogo = () => (
  <svg viewBox="0 0 300 80" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <rect x="8" y="8" width="28" height="28" fill="#c8102e" rx="2"/>
    <rect x="8" y="44" width="28" height="28" fill="#c8102e" rx="2"/>
    <rect x="44" y="8" width="28" height="28" fill="#c8102e" rx="2"/>
    <rect x="44" y="44" width="13" height="13" fill="#c8102e" rx="1"/>
    <rect x="59" y="59" width="13" height="13" fill="#c8102e" rx="1"/>
    <text x="88" y="34" fontFamily="Georgia, serif" fontWeight="700" fontSize="22" fill="white" letterSpacing="1">BENNETT</text>
    <text x="88" y="58" fontFamily="Georgia, serif" fontWeight="400" fontSize="14" fill="#f87171" letterSpacing="3">UNIVERSITY</text>
    <line x1="88" y1="65" x2="292" y2="65" stroke="#f87171" strokeWidth="1"/>
    <text x="88" y="75" fontFamily="Arial, sans-serif" fontSize="8" fill="#94a3b8" letterSpacing="1.5">TIMES OF INDIA GROUP</text>
  </svg>
);

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 70%, #1a1a2e 100%)' }}>
      {/* Decorative background circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #c8102e, transparent)' }} />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #c8102e, transparent)' }} />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full opacity-5" style={{ background: 'radial-gradient(circle, #ffffff, transparent)' }} />
        {[...Array(8)].map((_, i) => (
          <div key={i} className="absolute border border-white/5 rounded-full"
            style={{ width: `${(i + 1) * 120}px`, height: `${(i + 1) * 120}px`, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
        ))}
      </div>

      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-center items-start w-1/2 px-16 relative z-10">
        <div className="w-72 h-20 mb-8"><BennettLogo /></div>
        <h2 className="text-4xl font-bold text-white leading-tight mb-4">
          Campus Resource &<br /><span className="text-red-400">Event Management</span>
        </h2>
        <p className="text-slate-400 text-lg mb-8">Streamline room bookings and college events at Bennett University.</p>
        <div className="space-y-3">
          {['Book rooms instantly', 'Manage college events', 'Admin approval workflow', 'Real-time notifications'].map(f => (
            <div key={f} className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-slate-300 text-sm">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 px-6 relative z-10">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl w-full max-w-md p-8">
          {/* Mobile logo */}
          <div className="lg:hidden w-56 h-14 mx-auto mb-6"><BennettLogo /></div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
            <p className="text-slate-400 mt-1 text-sm">Sign in to your Bennett account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
              <input
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                type="email" placeholder="you@bennett.edu.in"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <input
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                type="password" placeholder="••••••••"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button type="submit"
              className="w-full py-2.5 rounded-lg font-semibold text-white transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #c8102e, #9b0a23)' }}
              disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-5 p-4 bg-white/5 border border-white/10 rounded-lg text-xs text-slate-400 space-y-1">
            <p className="font-medium text-slate-300">Need an account?</p>
            <p>Contact your campus administrator to get access credentials.</p>
          </div>

          <p className="text-center text-sm text-slate-400 mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-red-400 hover:text-red-300 font-medium">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
