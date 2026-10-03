// src/components/ui/Button.jsx

const VARIANT_STYLES = {
  primary:   { background: 'linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%)', boxShadow: '0 2px 8px rgba(99,102,241,0.4), 0 1px 2px rgba(0,0,0,0.08)' },
  secondary: { boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 1px rgba(0,0,0,0.04)' },
  danger:    {},
  ghost:     {},
}
const variants = {
  primary:   'text-white active:opacity-90',
  secondary: 'bg-white text-slate-700 border border-slate-200 hover:border-indigo-200 hover:bg-slate-50/80 active:bg-slate-100',
  danger:    'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 hover:border-rose-300 active:bg-rose-200',
  ghost:     'text-indigo-600 hover:bg-indigo-50/80 hover:text-indigo-700',
}
const sizes = {
  sm: 'px-3 py-1.5 text-[12px] gap-1.5 rounded-lg',
  md: 'px-4 py-2 text-[13px] gap-2 rounded-xl',
}

export default function Button({ children, variant = 'primary', size = 'md', className = '', disabled, style, ...props }) {
  return (
    <button
      className={`inline-flex items-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] ${variants[variant]} ${sizes[size]} ${className}`}
      style={{ ...VARIANT_STYLES[variant], ...style }}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}