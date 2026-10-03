// src/components/ui/Table.jsx


export function Th({ children, className = '' }) {
  return (
    <th className={`px-5 py-3.5 text-left text-[10.5px] font-bold text-slate-300 uppercase tracking-[0.1em] ${className}`}>
      {children}
    </th>
  )
}

export function Td({ children, className = '' }) {
  return (
    <td className={`px-5 py-3.5 text-[13px] text-slate-700 ${className}`}>
      {children}
    </td>
  )
}

export function TrHover({ children, onClick }) {
  return (
    <tr
      onClick={onClick}
      className={`border-b border-slate-50 transition-colors last:border-0 ${onClick ? 'cursor-pointer' : ''}`}
      onMouseEnter={onClick ? e => { e.currentTarget.style.background = '#f8f9ff' } : null}
      onMouseLeave={onClick ? e => { e.currentTarget.style.background = '' } : null}
    >
      {children}
    </tr>
  )
}

export function EmptyRow({ colSpan, message = 'No records found.' }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-16 text-center">
        <p className="text-[13px] text-slate-400 font-medium">{message}</p>
      </td>
    </tr>
  )
}

export function FilterPill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all duration-150 ${
        active
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
          : 'bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50'
      }`}
    >
      {children}
    </button>
  )
}


export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <h1 className="text-[22px] font-bold text-slate-900 tracking-tight leading-none">{title}</h1>
        {subtitle && <p className="text-[13px] text-slate-400 mt-1.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

// Tab bar 
export function TabBar({ tabs, active, onChange }) {
  return (
    <div className="flex gap-0 border-b border-slate-200 mb-5">
      {tabs.map(([key, label]) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`px-4 py-2.5 text-[13px] font-medium border-b-2 -mb-px transition-colors ${
            active === key
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}