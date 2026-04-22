import { useFetch } from '../hooks/useFetch';
import { StatusBadge, Spinner, StatCard } from '../components/UI';
import { Building2, BookOpen, CalendarDays, Users } from 'lucide-react';

export default function Analytics() {
  const { data, loading } = useFetch('/analytics', []);

  if (loading) return <Spinner />;
  if (!data) return null;

  const bookingStats = {};
  data.bookingsByStatus?.forEach(b => { bookingStats[b._id] = b.count; });

  const eventStats = {};
  data.eventsByStatus?.forEach(e => { eventStats[e._id] = e.count; });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={data.totalUsers} icon={Users} color="blue" />
        <StatCard label="Total Rooms" value={data.totalRooms} icon={Building2} color="green" />
        <StatCard label="Total Bookings" value={data.totalBookings} icon={BookOpen} color="purple" />
        <StatCard label="Total Events" value={data.totalEvents} icon={CalendarDays} color="orange" />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="card">
          <h2 className="font-semibold mb-4">Bookings by Status</h2>
          <div className="space-y-3">
            {['pending', 'approved', 'rejected'].map(s => (
              <div key={s} className="flex items-center justify-between">
                <StatusBadge status={s} />
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-gray-100 rounded-full h-2">
                    <div className="h-2 rounded-full bg-blue-500"
                      style={{ width: `${data.totalBookings ? ((bookingStats[s] || 0) / data.totalBookings) * 100 : 0}%` }} />
                  </div>
                  <span className="font-semibold text-sm w-6 text-right">{bookingStats[s] || 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold mb-4">Events by Status</h2>
          <div className="space-y-3">
            {['pending', 'upcoming', 'ongoing', 'completed', 'rejected'].map(s => (
              <div key={s} className="flex items-center justify-between">
                <StatusBadge status={s} />
                <span className="font-semibold text-sm">{eventStats[s] || 0}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold mb-4">Most Used Rooms</h2>
          {data.topRooms?.length === 0 ? (
            <p className="text-gray-500 text-sm">No booking data yet</p>
          ) : (
            <div className="space-y-3">
              {data.topRooms?.map((r, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                    <span className="text-sm font-medium">{r.room_name}</span>
                  </div>
                  <span className="text-sm text-blue-600 font-semibold">{r.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold mb-4">Recent Bookings</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-3 font-medium">User</th>
                <th className="pb-3 font-medium">Role</th>
                <th className="pb-3 font-medium">Room</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recentBookings?.map(b => (
                <tr key={b._id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3">{b.user_id?.name}</td>
                  <td className="py-3 capitalize">{b.user_id?.role}</td>
                  <td className="py-3">{b.room_id?.room_name}</td>
                  <td className="py-3">{b.date}</td>
                  <td className="py-3"><StatusBadge status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
