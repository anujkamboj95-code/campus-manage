import { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import { StatusBadge, Spinner, EmptyState } from '../components/UI';
import { Plus, Check, X, Trash2, Calendar } from 'lucide-react';

const defaultForm = { room_id: '', date: '', start_time: '', end_time: '', purpose: '' };

export default function Bookings() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [form, setForm] = useState(defaultForm);
  const [statusFilter, setStatusFilter] = useState('');

  const { data: bookings, loading, refetch } = useFetch('/bookings', []);
  const { data: rooms } = useFetch('/rooms');

  const filtered = bookings?.filter(b => !statusFilter || b.status === statusFilter) || [];

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await api.post('/bookings', form);
      toast.success('Booking request submitted');
      setShowModal(false);
      setForm(defaultForm);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}/status`, { status, admin_note: adminNote });
      toast.success(`Booking ${status}`);
      setShowApproveModal(false);
      setAdminNote('');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this booking?')) return;
    try {
      await api.delete(`/bookings/${id}`);
      toast.success('Booking deleted');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  const openApprove = booking => { setSelectedBooking(booking); setShowApproveModal(true); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{user.role === 'admin' ? 'All Bookings' : 'My Bookings'}</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Booking
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['', 'pending', 'approved', 'rejected'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : filtered.length === 0 ? <EmptyState message="No bookings found" /> : (
        <div className="space-y-3">
          {filtered.map(b => (
            <div key={b._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-50 p-2 rounded-lg mt-0.5"><Calendar size={18} className="text-blue-600" /></div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{b.room_id?.room_name}</h3>
                      <StatusBadge status={b.status} />
                      {user.role === 'admin' && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                          ${b.user_id?.role === 'teacher' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                          {b.user_id?.role}
                        </span>
                      )}
                    </div>
                    {user.role === 'admin' && <p className="text-sm text-gray-500">{b.user_id?.name} · {b.user_id?.email}</p>}
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">{b.date}</span> · {b.start_time} – {b.end_time}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">Purpose: {b.purpose}</p>
                    {b.admin_note && <p className="text-sm text-orange-600 mt-0.5">Note: {b.admin_note}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {user.role === 'admin' && b.status === 'pending' && (
                    <button onClick={() => openApprove(b)} className="btn-primary text-sm py-1.5 px-3">Review</button>
                  )}
                  {(b.user_id?._id === user.id || b.user_id === user.id || user.role === 'admin') && b.status === 'pending' && (
                    <button onClick={() => handleDelete(b._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title="New Booking Request" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Room</label>
              <select className="input" value={form.room_id} onChange={e => setForm({ ...form, room_id: e.target.value })} required>
                <option value="">Select a room</option>
                {rooms?.filter(r => r.availability).map(r => (
                  <option key={r._id} value={r._id}>{r.room_name} ({r.type}, cap: {r.capacity})</option>
                ))}
              </select>
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
              <label className="block text-sm font-medium mb-1">Purpose</label>
              <select className="input" value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} required>
                <option value="">Select purpose</option>
                {['Extra Class', 'Meeting', 'Fest', 'Workshop', 'Seminar', 'Exam', 'Other'].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary flex-1">Submit Request</button>
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {showApproveModal && selectedBooking && (
        <Modal title="Review Booking" onClose={() => setShowApproveModal(false)}>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
              <p><span className="font-medium">User:</span> {selectedBooking.user_id?.name} ({selectedBooking.user_id?.role})</p>
              <p><span className="font-medium">Room:</span> {selectedBooking.room_id?.room_name}</p>
              <p><span className="font-medium">Date:</span> {selectedBooking.date}</p>
              <p><span className="font-medium">Time:</span> {selectedBooking.start_time} – {selectedBooking.end_time}</p>
              <p><span className="font-medium">Purpose:</span> {selectedBooking.purpose}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Admin Note (optional)</label>
              <textarea className="input" rows={2} value={adminNote} onChange={e => setAdminNote(e.target.value)} placeholder="Add a note..." />
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleStatus(selectedBooking._id, 'approved')} className="btn-success flex items-center gap-2 flex-1">
                <Check size={16} /> Approve
              </button>
              <button onClick={() => handleStatus(selectedBooking._id, 'rejected')} className="btn-danger flex items-center gap-2 flex-1">
                <X size={16} /> Reject
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
