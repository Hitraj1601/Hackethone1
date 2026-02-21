const colorMap = {
  success: 'bg-emerald-600',
  error: 'bg-rose-600',
  info: 'bg-indigo-600'
};

const ToastContainer = ({ toasts }) => {
  return (
    <div className="fixed right-4 top-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div key={toast.id} className={`${colorMap[toast.type]} rounded-lg px-4 py-2 text-sm text-white shadow-lg`}>
          {toast.message}
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
