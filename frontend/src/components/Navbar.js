import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import {
  LayoutDashboard, Building2, CalendarDays, BookOpen,
  Bell, LogOut, Menu, X, Users, BarChart3, ChevronDown
} from 'lucide-react';

const navItems = {
  admin: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/rooms', icon: Building2, label: 'Rooms' },
    { to: '/bookings', icon: BookOpen, label: 'Bookings' },
    { to: '/events', icon: CalendarDays, label: 'Events' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  ],
  teacher: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/rooms', icon: Building2, label: 'Rooms' },
    { to: '/bookings', icon: BookOpen, label: 'My Bookings' },
    { to: '/events', icon: CalendarDays, label: 'Events' },
  ],
  student: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/rooms', icon: Building2, label: 'Rooms' },
    { to: '/bookings', icon: BookOpen, label: 'My Bookings' },
    { to: '/events', icon: CalendarDays, label: 'Events' },
    { to: '/my-registrations', icon: Users, label: 'My Events' },
  ],
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    api.get('/notifications').then(r => setNotifications(r.data)).catch(() => {});
  }, [location.pathname]);

  const unread = notifications.filter(n => !n.read).length;

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const items = navItems[user?.role] || [];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-blue-600 text-lg">
            <Building2 size={24} /> CampusRM
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {items.map(({ to, icon: Icon, label }) => (
              <Link key={to} to={to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${location.pathname === to ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}>
                <Icon size={16} /> {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button onClick={() => setShowNotif(!showNotif)}
              className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600">
              <Bell size={20} />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unread}
                </span>
              )}
            </button>
            {showNotif && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50">
                <div className="flex items-center justify-between p-3 border-b">
                  <span className="font-semibold text-sm">Notifications</span>
                  <button onClick={markAllRead} className="text-xs text-blue-600 hover:underline">Mark all read</button>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-center text-gray-500 text-sm py-6">No notifications</p>
                  ) : notifications.map(n => (
                    <div key={n._id} className={`p-3 border-b last:border-0 text-sm ${!n.read ? 'bg-blue-50' : ''}`}>
                      <p className="text-gray-700">{n.message}</p>
                      <p className="text-gray-400 text-xs mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <span className="text-sm text-gray-600">{user?.name}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium
              ${user?.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                user?.role === 'teacher' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
              {user?.role}
            </span>
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
              <LogOut size={18} />
            </button>
          </div>

          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t bg-white px-4 py-3 space-y-1">
          {items.map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to} onClick={() => setOpen(false)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                ${location.pathname === to ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}>
              <Icon size={16} /> {label}
            </Link>
          ))}
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 w-full">
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}
    </nav>
  );
}
