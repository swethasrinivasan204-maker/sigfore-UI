// src/components/ui/Card.jsx

export default function Card({ children, className = '', ...props })
{
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/70 ${className}`}
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 24px rgba(99,102,241,0.07), 0 8px 32px rgba(0,0,0,0.03)' }}
      {...props}
    >
      {children}
    </div>
  )
 }