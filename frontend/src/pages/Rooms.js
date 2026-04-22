import { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import { StatusBadge, Spinner, EmptyState } from '../components/UI';
import { Plus, Edit2, Trash2, Search, Users, Building2 } from 'lucide-react';

const ROOM_TYPES = ['classroom', 'lab', 'auditorium', 'conference', 'seminar'];

const defaultForm = { room_name: '', type: 'classroom', capacity: '', availability: true, facilities: '' };

export default function Rooms() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);

  const queryStr = `?search=${search}&type=${typeFilter}`;
  const { data: rooms, loading, refetch } = useFetch(`/rooms${queryStr}`, [search, typeFilter]);

  const openAdd = () => { setEditing(null); setForm(defaultForm); setShowModal(true); };
  const openEdit = room => {
    setEditing(room);
    setForm({ ...room, facilities: room.facilities?.join(', ') || '' });
    setShowModal(true);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const payload = { ...form, capacity: Number(form.capacity), facilities: form.facilities.split(',').map(f => f.trim()).filter(Boolean) };
    try {
      if (editing) {
        await api.put(`/rooms/${editing._id}`, payload);
        toast.success('Room updated');
      } else {
        await api.post('/rooms', payload);
        toast.success('Room added');
      }
      setShowModal(false);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this room?')) return;
    try {
      await api.delete(`/rooms/${id}`);
      toast.success('Room deleted');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rooms</h1>
        {user.role === 'admin' && (
          <button onClick={openAdd} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Room
          </button>
        )}
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9" placeholder="Search rooms..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-auto" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {loading ? <Spinner /> : rooms?.length === 0 ? <EmptyState message="No rooms found" /> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map(room => (
            <div key={room._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-50 p-2 rounded-lg"><Building2 size={20} className="text-blue-600" /></div>
                  <div>
                    <h3 className="font-semibold">{room.room_name}</h3>
                    <span className="text-xs text-gray-500 capitalize">{room.type}</span>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${room.availability ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {room.availability ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                <Users size={14} /> <span>{room.capacity} capacity</span>
              </div>
              {room.facilities?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {room.facilities.map(f => <span key={f} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">{f}</span>)}
                </div>
              )}
              {user.role === 'admin' && (
                <div className="flex gap-2 pt-3 border-t">
                  <button onClick={() => openEdit(room)} className="btn-secondary flex items-center gap-1 text-sm py-1.5">
                    <Edit2 size={14} /> Edit
                  </button>
                  <button onClick={() => handleDelete(room._id)} className="btn-danger flex items-center gap-1 text-sm py-1.5">
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title={editing ? 'Edit Room' : 'Add Room'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Room Name</label>
              <input className="input" value={form.room_name} onChange={e => setForm({ ...form, room_name: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Capacity</label>
                <input className="input" type="number" min="1" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Facilities (comma separated)</label>
              <input className="input" placeholder="Projector, AC, Whiteboard" value={form.facilities} onChange={e => setForm({ ...form, facilities: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="avail" checked={form.availability} onChange={e => setForm({ ...form, availability: e.target.checked })} />
              <label htmlFor="avail" className="text-sm font-medium">Available</label>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary flex-1">{editing ? 'Update' : 'Add Room'}</button>
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
