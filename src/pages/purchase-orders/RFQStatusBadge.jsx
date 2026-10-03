// src/pages/purchase-orders/RFQStatusBadge.jsx


const BADGE_STYLES = {
  draft:         'bg-slate-50 text-slate-600 border-slate-200',
  sent:          'bg-indigo-50 text-indigo-600 border-indigo-200',
  quoted:        'bg-violet-50 text-violet-600 border-violet-200',
  converted:     'bg-emerald-50 text-emerald-600 border-emerald-200',
  pending:       'bg-amber-50 text-amber-600 border-amber-200',
  awarded:       'bg-emerald-50 text-emerald-600 border-emerald-200',
  rejected:      'bg-rose-50 text-rose-600 border-rose-200',
  'not awarded': 'bg-slate-50 text-slate-500 border-slate-200',
  cancelled:     'bg-rose-50 text-rose-600 border-rose-200',
}

export default function Badge({ status }) {
  const key = String(status || '').toLowerCase()
  const label = key ? key.charAt(0).toUpperCase() + key.slice(1) : '—'
  const style = BADGE_STYLES[key] || 'bg-slate-50 text-slate-500 border-slate-200'

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[12px] font-semibold whitespace-nowrap ${style}`}
    >
      {label}
    </span>
  )
}
