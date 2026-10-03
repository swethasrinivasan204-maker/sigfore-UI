// src/pages/purchase-orders/SendRfqModal.jsx


import { useState } from 'react'
import { MessageCircle, Mail } from 'lucide-react'

import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'


function whatsappNumber(phone) {
  return String(phone || '').replace(/\D/g, '')
}


function buildMessage({ rfqNumber, requiredDate, items, sender }) {
  const itemLines = items.map((it) => `- ${it.name} x ${it.qty}`).join('\n')
  const closing = sender?.replyEmail
    ? `Please send your best quote to ${sender.replyEmail}`
    : 'Please send your best quote.'
  return `RFQ: ${rfqNumber}\nFrom: ${sender?.companyName || 'Us'}\nRequired by: ${requiredDate || '—'}\nItems:\n${itemLines}\n${closing}`
}


export default function SendRfqModal({ open, onClose, rfqNumber, requiredDate, items, vendors, sender, onDone, busy = false, error = '' }) {
  const [index, setIndex] = useState(0)

  const vendor = vendors[Math.min(index, vendors.length - 1)]
  const isLastVendor = index >= vendors.length - 1
  const message = buildMessage({ rfqNumber, requiredDate, items, sender })
  const subject = `Request for Quotation — ${rfqNumber}`
  const phone = whatsappNumber(vendor?.phone)

  function openWhatsApp() {
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
  }

  function openEmail() {
    window.location.href = `mailto:${vendor.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`
  }

  function handleClose() {
    if (busy) return
    setIndex(0)
    onClose()
  }

  const titleSuffix = vendors.length > 1 ? ` — Vendor ${index + 1} of ${vendors.length}: ${vendor?.name || ''}` : ''

  return (
    <Modal open={open} onClose={handleClose} title={`Send RFQ${titleSuffix}`} size="md">
      <div className="flex flex-col gap-4">

        {/* Vendor info */}
        <div className="bg-slate-50 rounded-xl p-4 text-[14px] flex flex-col gap-1 min-w-0">
          <p className="font-semibold text-slate-800 truncate">{vendor?.name || '—'}</p>
          <p className="text-slate-500 truncate">{vendor?.email || 'No email on file'}</p>
          <p className="text-slate-500 truncate">{vendor?.phone || 'No phone on file'}</p>
        </div>

        {/* Message preview */}
        <div>
          <p className="text-[12px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Message Preview</p>
          <pre className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-[12px] text-slate-700 whitespace-pre-wrap break-words font-mono leading-relaxed">
            {message}
          </pre>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 flex-wrap">
            <Button onClick={openWhatsApp} disabled={!phone} title={phone ? undefined : 'This vendor has no phone number'}>
              <MessageCircle size={15} /> Open WhatsApp
            </Button>
            <Button variant="secondary" onClick={openEmail} disabled={!vendor?.email} title={vendor?.email ? undefined : 'This vendor has no email'}>
              <Mail size={15} /> Send Email
            </Button>
          </div>
          <p className="text-[11px] text-slate-400">
            These open WhatsApp or your email app with the message filled in. Nothing is sent automatically.
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-50 px-4 py-2.5 text-[13px] text-rose-600">{error}</div>
        )}

        {/* Navigation / done */}
        <div className="flex justify-end pt-3 border-t border-slate-100">
          {isLastVendor ? (
            <Button variant="secondary" onClick={onDone} disabled={busy}>
              {busy ? 'Sending…' : 'Done'}
            </Button>
          ) : (
            <Button onClick={() => setIndex((i) => i + 1)}>Next Vendor →</Button>
          )}
        </div>
      </div>
    </Modal>
  )
}
