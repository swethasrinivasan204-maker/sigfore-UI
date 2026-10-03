// src/components/ui/StatusTimeline.jsx


import { ArrowRight, FileText, Link } from 'lucide-react'

function formatDate(iso) {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
}

const EVENT_ICON = {
  status_change:    ArrowRight,
  document_created: FileText,
  document_linked:  Link,
}


export default function StatusTimeline({ events = [] }) {
  if (events.length === 0) {
    return <p className="text-[13px] text-slate-400">No activity recorded yet.</p>
  }

  
  const sorted = events
    .map((ev, i) => ({ ev, i }))
    .sort((a, b) => (new Date(b.ev.date) - new Date(a.ev.date)) || (b.i - a.i))
    .map(({ ev }) => ev)

  return (
    <div className="flex flex-col gap-3">
      {sorted.map((ev, index) => {
        const Icon = EVENT_ICON[ev.event] || ArrowRight
        const isDocEvent = ev.event === 'document_created' || ev.event === 'document_linked'
        const meta = [ev.date && formatDate(ev.date), ev.note].filter(Boolean).join(' · ')

        return (
          <div key={ev.id ?? index} className="flex items-start gap-3">
            
            <div className="mt-0.5 w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
              <Icon size={13} className="text-slate-400" />
            </div>

           
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[14px] text-slate-700">
                  {isDocEvent ? (
                    <>
                      <span className="font-medium">{ev.docNumber || ev.docType}</span>{' '}
                      {ev.event === 'document_created' ? 'created' : 'linked'}
                    </>
                  ) : (
                    <>
                      <span className="font-medium">{ev.fromStatus || '—'}</span>
                      {' → '}
                      <span className="font-medium">{ev.toStatus || '—'}</span>
                    </>
                  )}
                </span>

                
                {ev.actor && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                    ev.actorType === 'system'
                      ? 'bg-slate-100 text-slate-400'
                      : 'bg-indigo-50 text-indigo-600'
                  }`}>
                    {ev.actor}
                  </span>
                )}
              </div>

              
              {meta && <p className="text-[11px] text-slate-400 mt-0.5 break-words">{meta}</p>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
