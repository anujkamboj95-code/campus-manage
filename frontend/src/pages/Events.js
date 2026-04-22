import { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import { StatusBadge, Spinner, EmptyState } from '../components/UI';
import { Plus, Check, X, Users, Calendar, Trash2, Search } from 'lucide-react';

const CATEGORIES = ['hackathon', 'fest', 'workshop', 'seminar', 'meeting', 'other'];
const defaultForm = { name: '', description: '', date: '', start_time: '', end_time: '', room_id: '', max_participants: '', category: 'other' };

export default function Events() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showParticipants, setShowParticipants] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [participants, setParticipants] = useState([]);

  const queryStr = `?status=${statusFilter}&search=${search}`;
  const { data: events, loading, refetch } = useFetch(`/events${queryStr}`, [statusFilter, search]);
  const { data: rooms } = useFetch('/rooms');

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await api.post('/events', { ...form, max_participants: Number(form.max_participants) });
      toast.success('Event submitted for approval');
      setShowModal(false);
      setForm(defaultForm);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await api.put(`/events/${id}/status`, { status });
      toast.success(`Event ${status}`);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await api.delete(`/events/${id}`);
      toast.success('Event deleted');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  const handleRegister = async id => {
    try {
      await api.post('/registrations', { event_id: id });
      toast.success('Registered successfully!');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  const viewParticipants = async event => {
    const { data } = await api.get(`/registrations/event/${event._id}`);
    setParticipants(data);
    setShowParticipants(event);
  };

  const categoryColors = {
    hackathon: 'bg-purple-100 text-purple-700', fest: 'bg-pink-100 text-pink-700',
    workshop: 'bg-blue-100 text-blue-700', seminar: 'bg-green-100 text-green-700',
    meeting: 'bg-orange-100 text-orange-700', other: 'bg-gray-100 text-gray-700'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Events</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Create Event
        </button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9" placeholder="Search events..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-auto" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          {['pending', 'upcoming', 'ongoing', 'completed', 'rejected'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? <Spinner /> : events?.length === 0 ? <EmptyState message="No events found" /> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map(event => (
            <div key={event._id} className="card hover:shadow-md transition-shadow flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${categoryColors[event.category]}`}>
                  {event.category}
                </span>
                <StatusBadge status={event.status} />
              </div>
              <h3 className="font-semibold text-lg mb-1">{event.name}</h3>
              <p className="text-sm text-gray-500 mb-3 flex-1 line-clamp-2">{event.description}</p>
              <div className="space-y-1 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1.5"><Calendar size={14} /> {event.date} · {event.start_time}–{event.end_time}</div>
                <div className="flex items-center gap-1.5"><Users size={14} /> Max {event.max_participants} participants</div>
                <p className="text-gray-500">Venue: {event.room_id?.room_name}</p>
                <p className="text-gray-500">By: {event.created_by?.name} ({event.created_by?.role})</p>
              </div>

              <div className="flex flex-wrap gap-2 pt-3 border-t">
                {user.role === 'admin' && event.status === 'pending' && (
                  <>
                    <button onClick={() => handleStatus(event._id, 'approved')} className="btn-success text-sm py-1.5 px-3 flex items-center gap-1">
                      <Check size={14} /> Approve
                    </button>
                    <button onClick={() => handleStatus(event._id, 'rejected')} className="btn-danger text-sm py-1.5 px-3 flex items-center gap-1">
                      <X size={14} /> Reject
                    </button>
                  </>
                )}
                {event.status === 'upcoming' && user.role === 'student' && (
                  <button onClick={() => handleRegister(event._id)} className="btn-primary text-sm py-1.5 px-3">Register</button>
                )}
                <button onClick={() => viewParticipants(event)} className="btn-secondary text-sm py-1.5 px-3 flex items-center gap-1">
                  <Users size={14} /> Participants
                </button>
                {(event.created_by?._id === user.id || user.role === 'admin') && (
                  <button onClick={() => handleDelete(event._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg ml-auto">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title="Create Event" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Event Name</label>
              <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea className="input" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max Participants</label>
                <input className="input" type="number" min="1" value={form.max_participants} onChange={e => setForm({ ...form, max_participants: e.target.value })} required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input className="input" type="date" min={new Date().toISOString().split('T')[0]}
                value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Start Time</label>
                <input className="input" type="time" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Time</label>
                <input className="input" type="time" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Venue (Room)</label>
              <select className="input" value={form.room_id} onChange={e => setForm({ ...form, room_id: e.target.value })} required>
                <option value="">Select a room</option>
                {rooms?.filter(r => r.availability).map(r => (
                  <option key={r._id} value={r._id}>{r.room_name} (cap: {r.capacity})</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary flex-1">Submit Event</button>
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {showParticipants && (
        <Modal title={`Participants – ${showParticipants.name}`} onClose={() => setShowParticipants(null)}>
          {participants.length === 0 ? <EmptyState message="No registrations yet" /> : (
            <div className="space-y-2">
              {participants.map((p, i) => (
                <div key={p._id} className="flex items-center gap-3 py-2 border-b last:border-0">
                  <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-medium">{i + 1}</span>
                  <div>
                    <p className="font-medium text-sm">{p.user_id?.name}</p>
                    <p className="text-xs text-gray-500">{p.user_id?.email} · {p.user_id?.role}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
