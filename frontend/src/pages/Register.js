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

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 70%, #1a1a2e 100%)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #c8102e, transparent)' }} />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #c8102e, transparent)' }} />
        {[...Array(8)].map((_, i) => (
          <div key={i} className="absolute border border-white/5 rounded-full"
            style={{ width: `${(i + 1) * 120}px`, height: `${(i + 1) * 120}px`, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
        ))}
      </div>

      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl w-full max-w-md p-8 relative z-10">
        <div className="w-56 h-14 mx-auto mb-6"><BennettLogo /></div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-slate-400 mt-1 text-sm">Join Bennett University Campus System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
            <input className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-400"
              placeholder="John Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-400"
              type="email" placeholder="you@bennett.edu.in" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <input className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-400"
              type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Role</label>
            <select className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-400"
              value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="student" className="text-gray-900">Student</option>
              <option value="teacher" className="text-gray-900">Teacher</option>
            </select>
          </div>
          <button type="submit"
            className="w-full py-2.5 rounded-lg font-semibold text-white transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #c8102e, #9b0a23)' }}
            disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-red-400 hover:text-red-300 font-medium">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
