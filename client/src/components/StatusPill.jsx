const classes = {
  Available: 'bg-emerald-100 text-emerald-700',
  'On Trip': 'bg-indigo-100 text-indigo-700',
  'In Shop': 'bg-amber-100 text-amber-700',
  Suspended: 'bg-rose-100 text-rose-700',
  'Out of Service': 'bg-slate-200 text-slate-700',
  'On Duty': 'bg-emerald-100 text-emerald-700',
  'Off Duty': 'bg-slate-200 text-slate-700',
  Draft: 'bg-slate-200 text-slate-700',
  Dispatched: 'bg-indigo-100 text-indigo-700',
  Completed: 'bg-emerald-100 text-emerald-700',
  Cancelled: 'bg-rose-100 text-rose-700'
};

const StatusPill = ({ status }) => {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${classes[status] || 'bg-slate-100 text-slate-700'}`}>
      {status}
    </span>
  );
};

export default StatusPill;
