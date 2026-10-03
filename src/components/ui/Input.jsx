// src/components/ui/Input.jsx

const base = 'w-full px-3 py-2 bg-white border rounded-xl text-[13px] text-slate-800 placeholder-slate-400 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 shadow-sm'
const err = 'border-rose-400 focus:ring-rose-400/25 focus:border-rose-400'
const ok = 'border-slate-200 hover:border-slate-300'

const labelClass = 'text-[11px] font-semibold text-slate-500 uppercase tracking-[0.06em]'

export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className={labelClass}>{label}</label>}
      <input className={`${base} ${error ? err : ok} ${className}`} {...props} />
      {error && <p className="text-xs text-rose-500 mt-0.5">{error}</p>}
    </div>
  )
}

export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className={labelClass}>{label}</label>}
      <select className={`${base} bg-white ${error ? err : ok} ${className}`} {...props}>
        {children}
      </select>
      {error && <p className="text-xs text-rose-500 mt-0.5">{error}</p>}
    </div>
  )
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className={labelClass}>{label}</label>}
      <textarea className={`${base} ${error ? err : ok} ${className}`} rows={3} {...props} />
      {error && <p className="text-xs text-rose-500 mt-0.5">{error}</p>}
    </div>
  )
}