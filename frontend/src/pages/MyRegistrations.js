import { useFetch } from '../hooks/useFetch';
import api from '../api';
import toast from 'react-hot-toast';
import { StatusBadge, Spinner, EmptyState } from '../components/UI';
import { Calendar, X } from 'lucide-react';

export default function MyRegistrations() {
  const { data: registrations, loading, refetch } = useFetch('/registrations/my', []);

  const handleCancel = async id => {
    if (!window.confirm('Cancel this registration?')) return;
    try {
      await api.put(`/registrations/${id}/cancel`);
      toast.success('Registration cancelled');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Event Registrations</h1>
      {loading ? <Spinner /> : registrations?.length === 0 ? <EmptyState message="No registrations yet" /> : (
        <div className="space-y-3">
          {registrations.map(reg => (
            <div key={reg._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="bg-purple-50 p-2 rounded-lg mt-0.5"><Calendar size={18} className="text-purple-600" /></div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{reg.event_id?.name}</h3>
                      <StatusBadge status={reg.status} />
                      <StatusBadge status={reg.event_id?.status} />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {reg.event_id?.date} · {reg.event_id?.start_time}–{reg.event_id?.end_time}
                    </p>
                    <p className="text-sm text-gray-500">Venue: {reg.event_id?.room_id?.room_name}</p>
                    <p className="text-xs text-gray-400 mt-1">Registered: {new Date(reg.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                {reg.status === 'registered' && (
                  <button onClick={() => handleCancel(reg._id)} className="flex items-center gap-1 text-sm text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg">
                    <X size={14} /> Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
