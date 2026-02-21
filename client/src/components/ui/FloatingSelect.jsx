import { Children, isValidElement } from 'react';
import { motion } from 'framer-motion';

const FloatingSelect = ({ label, value, onChange, children, className = '', error, placeholder, ...props }) => {
  const active = String(value ?? '').length > 0;
  const hasEmptyOption = Children.toArray(children).some(
    (child) => isValidElement(child) && String(child.props?.value ?? '') === ''
  );
  const shouldFloatLabel = active || Boolean(placeholder) || hasEmptyOption;

  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={onChange}
        className={`peer h-11 w-full rounded-xl border bg-white/80 px-3 pt-4 text-sm outline-none transition dark:bg-slate-900/70 ${
          error
            ? 'border-rose-400 focus:border-rose-500'
            : 'border-slate-200 focus:border-indigo-400 dark:border-slate-700'
        }`}
        {...props}
      >
        {placeholder ? (
          <option value="" disabled={props.required} hidden>
            {placeholder}
          </option>
        ) : null}
        {children}
      </select>
      <label
        className={`pointer-events-none absolute left-3 top-2 origin-left text-xs transition-all ${
          shouldFloatLabel
            ? 'scale-90 text-indigo-500 dark:text-indigo-300'
            : 'translate-y-3 text-slate-400 peer-focus:translate-y-0 peer-focus:scale-90 peer-focus:text-indigo-500'
        }`}
      >
        {label}
      </label>
      {error && (
        <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mt-1 text-xs text-rose-500">
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default FloatingSelect;
