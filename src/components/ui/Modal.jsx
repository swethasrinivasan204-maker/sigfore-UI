// src/components/ui/Modal.jsx

import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

if (!open) return null
  const widths = {
      sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl'
      }
  return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={onClose} />
        {/* Sheet */}
        <div className={`relative bg-white rounded-2xl shadow-xl w-full ${widths[size]} max-h-[90vh] overflow-y-auto ring-1 ring-slate-900/5`}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-[14px] font-semibold text-slate-900 leading-none">{title}</h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <X size={15} />
            </button>
          </div>
          <div className="px-6 py-5">{children}</div>
        </div>
      </div>
    )
}
