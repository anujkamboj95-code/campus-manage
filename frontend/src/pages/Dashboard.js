import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { StatCard, Spinner, StatusBadge } from '../components/UI';
import { Building2, BookOpen, CalendarDays, Users, Clock } from 'lucide-react';

const BennettLogo = () => (
  <svg viewBox="0 0 300 80" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <rect width="300" height="80" fill="none"/>
    {/* Red square emblem */}
    <rect x="8" y="8" width="28" height="28" fill="#c8102e" rx="2"/>
    <rect x="8" y="44" width="28" height="28" fill="#c8102e" rx="2"/>
    <rect x="44" y="8" width="28" height="28" fill="#c8102e" rx="2"/>
    <rect x="44" y="44" width="13" height="13" fill="#c8102e" rx="1"/>
    <rect x="59" y="59" width="13" height="13" fill="#c8102e" rx="1"/>
    {/* Bennett University text */}
    <text x="88" y="34" fontFamily="Georgia, serif" fontWeight="700" fontSize="22" fill="#1a1a2e" letterSpacing="1">BENNETT</text>
    <text x="88" y="58" fontFamily="Georgia, serif" fontWeight="400" fontSize="14" fill="#c8102e" letterSpacing="3">UNIVERSITY</text>
    {/* Tagline */}
    <line x1="88" y1="65" x2="292" y2="65" stroke="#c8102e" strokeWidth="1"/>
    <text x="88" y="75" fontFamily="Arial, sans-serif" fontSize="8" fill="#666" letterSpacing="1.5">TIMES OF INDIA GROUP</text>
  </svg>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user.role === 'admin') {
          const { data: analytics } = await api.get('/analytics');
          setData({ type: 'admin', ...analytics });
        } else {
          const [bookings, events, regs] = await Promise.all([
            api.get('/bookings'),
            api.get('/events'),
            user.role === 'student' ? api.get('/registrations/my') : Promise.resolve({ data: [] })
          ]);
          setData({ type: 'user', bookings: bookings.data, events: events.data, registrations: regs.data });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return <Spinner />;

  if (data?.type === 'admin') {
    const bookingStats = {};
    data.bookingsByStatus?.forEach(b => { bookingStats[b._id] = b.count; });
    return (
      <div className="space-y-6">
        {/* Bennett University Hero Banner */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#0f3460] p-8 text-white shadow-lg">
          <div className="absolute inset-0 opacity-5">
            {[...Array(6)].map((_, i) => <div key={i} className="absolute w-32 h-32 border-2 border-white rounded-full" style={{top:`${i*15-10}%`,left:`${i*18-5}%`}}/>)}
          </div>
          <div className="absolute top-0 right-0 w-64 h-full opacity-10">
            <BennettLogo />
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="w-48 h-14 mb-3"><BennettLogo /></div>
              <p className="text-blue-200 text-sm">Campus Resource & Event Management System</p>
              <p className="text-white/60 text-xs mt-1">Greater Noida, Uttar Pradesh</p>
            </div>
            <div className="hidden md:block text-right">
              <p className="text-3xl font-bold text-white">{new Date().toLocaleDateString('en-IN',{weekday:'long'})}</p>
              <p className="text-blue-200">{new Date().toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</p>
            </div>
          </div>
        </div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Users" value={data.totalUsers} icon={Users} color="blue" />
          <StatCard label="Total Rooms" value={data.totalRooms} icon={Building2} color="green" />
          <StatCard label="Total Bookings" value={data.totalBookings} icon={BookOpen} color="purple" />
          <StatCard label="Total Events" value={data.totalEvents} icon={CalendarDays} color="orange" />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="font-semibold mb-4">Booking Status Overview</h2>
            <div className="space-y-3">
              {['pending', 'approved', 'rejected'].map(s => (
                <div key={s} className="flex items-center justify-between">
                  <StatusBadge status={s} />
                  <span className="font-semibold">{bookingStats[s] || 0}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="font-semibold mb-4">Most Used Rooms</h2>
            <div className="space-y-2">
              {data.topRooms?.length === 0 && <p className="text-gray-500 text-sm">No data yet</p>}
              {data.topRooms?.map((r, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{r.room_name}</span>
                  <span className="font-medium text-blue-600">{r.count} bookings</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold mb-4">Recent Bookings</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500 border-b">
                <th className="pb-2">User</th><th className="pb-2">Room</th>
                <th className="pb-2">Date</th><th className="pb-2">Status</th>
              </tr></thead>
              <tbody>
                {data.recentBookings?.map(b => (
                  <tr key={b._id} className="border-b last:border-0">
                    <td className="py-2">{b.user_id?.name} <span className="text-xs text-gray-400">({b.user_id?.role})</span></td>
                    <td className="py-2">{b.room_id?.room_name}</td>
                    <td className="py-2">{b.date}</td>
                    <td className="py-2"><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  const pendingBookings = data?.bookings?.filter(b => b.status === 'pending') || [];
  const approvedBookings = data?.bookings?.filter(b => b.status === 'approved') || [];
  const upcomingEvents = data?.events?.filter(e => e.status === 'upcoming') || [];

  return (
    <div className="space-y-6">
      {/* Bennett University Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#0f3460] p-8 text-white shadow-lg">
        <div className="absolute inset-0 opacity-5">
          {[...Array(6)].map((_, i) => <div key={i} className="absolute w-32 h-32 border-2 border-white rounded-full" style={{top:`${i*15-10}%`,left:`${i*18-5}%`}}/>)}
        </div>
        <div className="absolute top-0 right-0 w-64 h-full opacity-10">
          <BennettLogo />
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="w-48 h-14 mb-3"><BennettLogo /></div>
            <p className="text-blue-200 text-sm">Campus Resource & Event Management System</p>
            <p className="text-white/60 text-xs mt-1">Greater Noida, Uttar Pradesh</p>
          </div>
          <div className="hidden md:block text-right">
            <p className="text-3xl font-bold text-white">{new Date().toLocaleDateString('en-IN',{weekday:'long'})}</p>
            <p className="text-blue-200">{new Date().toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</p>
          </div>
        </div>
      </div>
      <h1 className="text-2xl font-bold">Welcome, {user.name}!</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="My Bookings" value={data?.bookings?.length || 0} icon={BookOpen} color="blue" />
        <StatCard label="Pending" value={pendingBookings.length} icon={Clock} color="orange" />
        <StatCard label="Approved" value={approvedBookings.length} icon={Building2} color="green" />
        <StatCard label="Upcoming Events" value={upcomingEvents.length} icon={CalendarDays} color="purple" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold mb-4">Recent Bookings</h2>
          {data?.bookings?.length === 0 ? <p className="text-gray-500 text-sm">No bookings yet</p> :
            data?.bookings?.slice(0, 5).map(b => (
              <div key={b._id} className="flex items-center justify-between py-2 border-b last:border-0 text-sm">
                <div>
                  <p className="font-medium">{b.room_id?.room_name}</p>
                  <p className="text-gray-500">{b.date} · {b.start_time}–{b.end_time}</p>
                </div>
                <StatusBadge status={b.status} />
              </div>
            ))}
        </div>

        <div className="card">
          <h2 className="font-semibold mb-4">Upcoming Events</h2>
          {upcomingEvents.length === 0 ? <p className="text-gray-500 text-sm">No upcoming events</p> :
            upcomingEvents.slice(0, 5).map(e => (
              <div key={e._id} className="py-2 border-b last:border-0 text-sm">
                <p className="font-medium">{e.name}</p>
                <p className="text-gray-500">{e.date} · {e.room_id?.room_name}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
