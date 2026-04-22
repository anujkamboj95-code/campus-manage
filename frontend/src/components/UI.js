export const StatusBadge = ({ status }) => {
  const map = {
    pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected',
    upcoming: 'badge-upcoming', ongoing: 'badge-ongoing', completed: 'badge-completed',
    registered: 'badge-approved', cancelled: 'badge-rejected'
  };
  return <span className={map[status] || 'badge-pending'}>{status}</span>;
};

export const Spinner = () => (
  <div className="flex justify-center items-center py-12">
    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

export const EmptyState = ({ message = 'No data found' }) => (
  <div className="text-center py-12 text-gray-500">{message}</div>
);

export const StatCard = ({ label, value, icon: Icon, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600', green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600', orange: 'bg-orange-50 text-orange-600'
  };
  return (
    <div className="card flex items-center gap-4">
      <div className={`p-3 rounded-xl ${colors[color]}`}><Icon size={24} /></div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
};
