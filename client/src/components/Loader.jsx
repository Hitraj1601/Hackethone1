const Loader = ({ text = 'Loading...' }) => {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2 text-sm text-slate-500 shadow-sm backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/60 dark:text-slate-300">
      <span className="relative h-5 w-5">
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-500 dark:border-indigo-800 dark:border-t-indigo-400" />
        <span className="absolute inset-1 animate-ping rounded-full bg-indigo-400/20" />
      </span>
      {text}
    </div>
  );
};

export default Loader;
