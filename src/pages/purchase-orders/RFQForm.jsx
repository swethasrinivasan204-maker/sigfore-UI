// src/pages/purchase-orders/RFQForm.jsx

import { useEffect, useRef, useState } from 'react'
import { Plus, Trash2, ChevronDown, Check, Search, X, Paperclip, FileText } from 'lucide-react'

import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'

import { prototypeRfqsApi, isRfqMockMode, rfqSender } from '../../api/rfqs'
import SendRfqModal from './SendRfqModal'
import {
  toArray,
  toDateInput,
  toId,
  invitationVendorId,
  lineProductId,
  lineQty,
  isVendorPartner,
  ATTACHMENT_ACCEPT,
  ATTACHMENT_HINT,
  ATTACHMENT_MAX_MB,
  formatFileSize,
  validateAttachment,
  attachmentSummary,
} from './rfqUtils'



// RFQ FORM 


function emptyForm(products = []) {
  return {
    vendorIds: [],
    requiredDate: '',
    notes: '',
    lineItems: [newLine(products)],
  }
}


let lineKeySeq = 0
function nextLineKey() {
  lineKeySeq += 1
  return `line-${lineKeySeq}`
}


function newLine(products = []) {
  return { key: nextLineKey(), catalogId: products[0]?.id != null ? String(products[0].id) : '', qty: 1, attachment: null, attachmentError: '' }
}


function productUom(products, catalogId) {
  return products.find((p) => String(p.id) === String(catalogId))?.uom || ''
}


function validate(form, lines, linesEditable) {
  const errors = {}
  if (form.vendorIds.length === 0) errors.vendorIds = 'Select at least one vendor'
  if (!form.requiredDate) errors.requiredDate = 'Required date needed'
  if (linesEditable) {
    if (lines.length === 0) errors.lineItems = 'Add at least one item'
    else if (lines.some((li) => !(Number(li.qty) > 0))) errors.lineItems = 'Every item needs a quantity greater than 0'
  }
  return errors
}

const FORM_LABEL_CLASS =
  'block text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-2'

const FORM_INPUT_CLASS =
  'w-full border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300'

const FORM_INPUT_ERROR_CLASS = 'border-rose-400 focus:ring-rose-100 focus:border-rose-400'

const FORM_SECONDARY_BUTTON_CLASS =
  'px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-[14px] font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50'

function FieldError({ children }) {
  return children ? <p className="text-xs text-rose-500 mt-1.5">{children}</p> : null
}

export default function RFQForm({ open, rfqId, partners, products, onClose, onSaved }) {
  const isEdit = rfqId != null

  const [form, setForm] = useState(emptyForm)
  const [original, setOriginal] = useState({ lines: [], vendorIds: [] })
  
  const [linesEditable, setLinesEditable] = useState(true)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  
  const [sendState, setSendState] = useState(null)
  const [sendBusy, setSendBusy] = useState(false)
  const [sendError, setSendError] = useState('')

  useEffect(() => {
    if (!open) return
    setFormError('')
    setErrors({})
    setLinesEditable(true)

    if (!isEdit) {
      setForm(emptyForm(products))
      setOriginal({ lines: [], vendorIds: [] })
      return
    }

    let cancelled = false
    setLoading(true)

    Promise.all([
      prototypeRfqsApi.get(rfqId),
      prototypeRfqsApi.lines(rfqId).catch((err) => {
        console.warn(`Could not load lines for RFQ ${rfqId}`, err)
        return null
      }),
      prototypeRfqsApi.vendors(rfqId).catch(() => []),
    ])
      .then(([rfq, lineData, vendorData]) => {
        if (cancelled) return

        
        const canEditLines = lineData !== null
        const lines = toArray(lineData).map((li) => ({
          key: nextLineKey(),
          id: li.id ?? null,
          catalogId: lineProductId(li) != null ? String(lineProductId(li)) : '',
          qty: lineQty(li) || 1,
          attachment: li.attachment ?? null,
          attachmentError: '',
        }))

        const sourceInvites = toArray(vendorData).length ? toArray(vendorData) : toArray(rfq?.vendorInvitations)
        const vendorIds = sourceInvites
          .map(invitationVendorId)
          .filter((v) => v != null)
          .map(String)
        if (rfq?.vendorId != null && !vendorIds.includes(String(rfq.vendorId))) {
          vendorIds.push(String(rfq.vendorId))
        }

        setLinesEditable(canEditLines)
        setOriginal({ lines, vendorIds })
        setForm({
          vendorIds,
          requiredDate: toDateInput(rfq?.requiredDate),
          notes: rfq?.notes || '',
          lineItems: lines.length ? lines : [newLine(products)],
        })
      })
      .catch((err) => {
        if (!cancelled) setFormError(err.message || 'Failed to load RFQ')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, rfqId])

  useEffect(() => {
    if (!open || isEdit || products.length === 0) return
    setForm((f) => ({
      ...f,
      lineItems: f.lineItems.map((li) => (li.catalogId ? li : { ...li, ...newLine(products), qty: li.qty })),
    }))
  }, [open, isEdit, products])

  // Vendor dropdown
  const [vendorMenuOpen, setVendorMenuOpen] = useState(false)
  const [vendorSearch, setVendorSearch] = useState('')
  const vendorMenuRef = useRef(null)

  useEffect(() => {
    if (!vendorMenuOpen) return
    function onMouseDown(e) {
      if (vendorMenuRef.current && !vendorMenuRef.current.contains(e.target)) setVendorMenuOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [vendorMenuOpen])

  useEffect(() => {
    if (!open) setVendorMenuOpen(false)
  }, [open])

  useEffect(() => {
    if (!vendorMenuOpen) setVendorSearch('')
  }, [vendorMenuOpen])

  const vendorOptions = partners.filter(isVendorPartner)
  const vendorQuery = vendorSearch.trim().toLowerCase()
  const filteredVendors = vendorQuery
    ? vendorOptions.filter((v) =>
        `${v.name || ''} ${v.email || ''}`.toLowerCase().includes(vendorQuery)
      )
    : vendorOptions

  function selectAllVendors() {
    setForm((f) => {
      const ids = new Set(f.vendorIds)
      filteredVendors.forEach((v) => ids.add(String(v.id)))
      return { ...f, vendorIds: [...ids] }
    })
  }

  function clearVendors() {
   
    setForm((f) => ({ ...f, vendorIds: f.vendorIds.filter((id) => original.vendorIds.includes(id)) }))
  }

  const selectedVendors = vendorOptions.filter((v) => form.vendorIds.includes(String(v.id)))

  function toggleVendor(id) {
    const key = String(id)
    if (original.vendorIds.includes(key)) return 
    setForm((f) => ({
      ...f,
      vendorIds: f.vendorIds.includes(key)
        ? f.vendorIds.filter((v) => v !== key)
        : [...f.vendorIds, key],
    }))
  }

  function updateLine(index, patch) {
    setForm((f) => ({
      ...f,
      lineItems: f.lineItems.map((li, i) => (i === index ? { ...li, ...patch } : li)),
    }))
  }

  
  function selectAttachment(index, file) {
    if (!file) return
    const attachmentError = validateAttachment(file)
    if (attachmentError) {
      updateLine(index, { attachmentError })
      return
    }
    updateLine(index, { attachment: { name: file.name, type: file.type, size: file.size, file }, attachmentError: '' })
  }

  function removeAttachment(index) {
    updateLine(index, { attachment: null, attachmentError: '' })
  }

  function addLine() {
    setForm((f) => ({ ...f, lineItems: [...f.lineItems, newLine(products)] }))
  }

  function removeLine(index) {
    setForm((f) => ({
      ...f,
      lineItems: f.lineItems.length > 1 ? f.lineItems.filter((_, i) => i !== index) : f.lineItems,
    }))
  }

  async function save(action) {
    const lines = form.lineItems.filter((li) => li.catalogId)

    const nextErrors = validate(form, lines, linesEditable)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setFormError('')
    setSaving(true)

    try {
      const header = { requiredDate: form.requiredDate, notes: form.notes }
      let id = rfqId

      if (isEdit) {
        await prototypeRfqsApi.update(id, header)
      } else {
        const created = await prototypeRfqsApi.create(header)
        id = created?.id
        if (id == null) throw new Error('RFQ was created but the server did not return its id.')
      }

      // Lines
      if (linesEditable) {
        if (isEdit) {
          for (const old of original.lines) {
            if (old.id != null && !lines.some((li) => li.id === old.id)) {
              await prototypeRfqsApi.deleteLine(id, old.id)
            }
          }
        }
        for (const li of lines) {
          const payload = { catalogId: toId(li.catalogId), qty: Number(li.qty) }
          if (li.id != null) await prototypeRfqsApi.updateLine(id, li.id, payload, li.attachment)
          else await prototypeRfqsApi.addLine(id, payload, li.attachment)
        }
      }

      
      for (const vendorId of form.vendorIds) {
        if (!original.vendorIds.includes(vendorId)) {
          await prototypeRfqsApi.inviteVendor(id, toId(vendorId))
        }
      }

     
      if (action === 'send') {
        const saved = await prototypeRfqsApi.get(id)
        setSendState({
          id,
          rfqNumber: saved?.rfqNumber || `RFQ ${id}`,
          requiredDate: toDateInput(saved?.requiredDate) || form.requiredDate,
          items: lines.map((li) => ({
            name: products.find((p) => String(p.id) === String(li.catalogId))?.name || `#${li.catalogId}`,
            qty: Number(li.qty),
          })),
          vendors: form.vendorIds.map((vid) => partners.find((p) => String(p.id) === vid) || { id: vid, name: `Vendor #${vid}` }),
        })
        return
      }

      onSaved()
    } catch (err) {
      console.error('RFQ save error:', err)
      setFormError(err.message || 'Failed to save RFQ')
    } finally {
      setSaving(false)
    }
  }

  async function finishSend() {
    try {
      setSendBusy(true)
      setSendError('')
      await prototypeRfqsApi.send(sendState.id)
      setSendState(null)
      onSaved()
    } catch (err) {
      console.error('RFQ send error:', err)
      setSendError(err.message || 'Failed to send RFQ')
    } finally {
      setSendBusy(false)
    }
  }

  function cancelSend() {
    setSendState(null)
    setSendError('')
    onSaved()
  }

 
  const attachedSummary = linesEditable
    ? attachmentSummary(form.lineItems.filter((li) => li.catalogId).map((li) => li.attachment))
    : ''

  return (
    <>
    <Modal open={open && !sendState} onClose={onClose} title={isEdit ? 'Edit RFQ' : 'New RFQ'} size="lg">
      {loading ? (
        <div className="py-12 text-center text-[13px] text-slate-400">Loading…</div>
      ) : (
        <div className="flex flex-col gap-5 min-w-0">

          {/* VENDORS */}
          <div ref={vendorMenuRef} className="relative">
            <label className="block text-[15px] font-medium text-slate-700 mb-2">Vendors</label>

            {selectedVendors.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {selectedVendors.map((v) => {
                  const locked = original.vendorIds.includes(String(v.id))
                  return (
                    <span
                      key={v.id}
                      title={locked ? 'Already invited' : undefined}
                      className="inline-flex max-w-full items-center gap-1 px-2.5 py-1 rounded-full border border-indigo-200 bg-indigo-50 text-[12px] font-medium text-indigo-700"
                    >
                      <span className="truncate">{v.name}</span>
                      {!locked && (
                        <button
                          type="button"
                          onClick={() => toggleVendor(v.id)}
                          className="ml-0.5 text-indigo-400 hover:text-indigo-700"
                          title="Remove vendor"
                        >
                          <X size={11} />
                        </button>
                      )}
                    </span>
                  )
                })}
              </div>
            )}

            <button
              type="button"
              onClick={() => setVendorMenuOpen((o) => !o)}
              className={`${FORM_INPUT_CLASS} ${errors.vendorIds ? FORM_INPUT_ERROR_CLASS : ''} flex items-center justify-between gap-2 text-left`}
            >
              <span className="truncate text-slate-500">
                {selectedVendors.length === 0
                  ? 'Select vendors...'
                  : `${selectedVendors.length} vendor${selectedVendors.length > 1 ? 's' : ''} selected`}
              </span>
              <ChevronDown
                size={16}
                className={`shrink-0 text-slate-500 transition-transform ${vendorMenuOpen ? 'rotate-180' : ''}`}
              />
            </button>
            <FieldError>{errors.vendorIds}</FieldError>

            {vendorMenuOpen && (
              <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">

                {/* search */}
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100">
                  <Search size={14} className="shrink-0 text-slate-400" />
                  <input
                    autoFocus
                    type="text"
                    value={vendorSearch}
                    onChange={(e) => setVendorSearch(e.target.value)}
                    placeholder="Search vendors..."
                    className="w-full bg-transparent text-[14px] text-slate-700 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>

                {/* options */}
                <div className="max-h-60 overflow-auto py-1">
                  {filteredVendors.length === 0 ? (
                    <div className="px-4 py-3 text-[13px] text-slate-400">
                      {vendorOptions.length === 0 ? 'No vendors found.' : 'No vendors match your search.'}
                    </div>
                  ) : (
                    filteredVendors.map((v) => {
                      const key = String(v.id)
                      const selected = form.vendorIds.includes(key)
                      const locked = original.vendorIds.includes(key)
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => toggleVendor(v.id)}
                          disabled={locked}
                          title={locked ? 'Already invited' : undefined}
                          className="w-full flex items-center gap-3.5 px-4 py-2 text-left hover:bg-slate-50 disabled:cursor-default disabled:hover:bg-white"
                        >
                          <span
                            className={`w-[18px] h-[18px] shrink-0 rounded border flex items-center justify-center ${
                              selected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
                            } ${locked ? 'opacity-60' : ''}`}
                          >
                            {selected && <Check size={12} strokeWidth={3} />}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-[14px] text-slate-700">{v.name}</span>
                            {v.email && (
                              <span className="block truncate text-[12.5px] text-slate-400">{v.email}</span>
                            )}
                          </span>
                        </button>
                      )
                    })
                  )}
                </div>

                {/* footer */}
                <div className="flex items-center justify-between px-4 py-2 border-t border-slate-100 bg-slate-50">
                  <button
                    type="button"
                    onClick={selectAllVendors}
                    disabled={filteredVendors.length === 0}
                    className="text-[13px] font-medium text-indigo-600 hover:text-indigo-700 disabled:opacity-40"
                  >
                    Select all
                  </button>
                  <button
                    type="button"
                    onClick={clearVendors}
                    className="text-[13px] text-slate-400 hover:text-slate-600"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* REQUIRED DATE */}
          <div className="w-full sm:w-1/2">
            <label className={FORM_LABEL_CLASS}>Required date</label>
            <input
              type="date"
              value={form.requiredDate}
              onChange={(e) => setForm((f) => ({ ...f, requiredDate: e.target.value }))}
              className={`${FORM_INPUT_CLASS} ${errors.requiredDate ? FORM_INPUT_ERROR_CLASS : ''}`}
            />
            <FieldError>{errors.requiredDate}</FieldError>
          </div>

          {/* NOTES */}
          <div>
            <label className={FORM_LABEL_CLASS}>Notes (optional)</label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className={FORM_INPUT_CLASS}
            />
          </div>

          {/* LINE ITEMS */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[15px] font-medium text-slate-700">Line Items</span>
              {linesEditable && (
                <button
                  type="button"
                  onClick={addLine}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[14px] font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  <Plus size={15} /> Add
                </button>
              )}
            </div>

            {!linesEditable ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-700">
                The line items for this RFQ could not be loaded, so they can't be changed here.
                Saving will update the vendors, required date and notes only.
              </div>
            ) : (
              <>
                <p className="mb-2 text-[12px] text-slate-400">
                  Attachment (one per line): {ATTACHMENT_HINT}, up to {ATTACHMENT_MAX_MB} MB.
                </p>
                <FieldError>{errors.lineItems}</FieldError>
                <div className={`flex flex-col gap-3 ${errors.lineItems ? 'mt-2' : ''}`}>
                  {form.lineItems.map((li, index) => {
                    const uom = productUom(products, li.catalogId)
                    const fileInputId = `rfq-attachment-${li.key}`
                    return (
                      <div
                        key={li.key}
                        className="flex flex-col gap-2 min-w-0 rounded-2xl border border-slate-100 bg-slate-50/70 p-3"
                      >
                      <div className="flex flex-wrap sm:flex-nowrap gap-2.5 items-center min-w-0">
                        <select
                          value={li.catalogId}
                          onChange={(e) => updateLine(index, { catalogId: e.target.value })}
                          className={`${FORM_INPUT_CLASS} basis-full sm:basis-0 sm:flex-1 min-w-0 truncate`}
                        >
                          <option value="">Select product…</option>
                          {products.map((p) => (
                            <option key={p.id} value={String(p.id)}>{p.name}</option>
                          ))}
                        </select>

                        <input
                          type="number"
                          min="1"
                          value={li.qty}
                          onChange={(e) => updateLine(index, { qty: e.target.value })}
                          placeholder="Qty"
                          aria-label="Quantity"
                          className={`${FORM_INPUT_CLASS} px-3! flex-1 sm:flex-none sm:w-24 min-w-0`}
                        />

                        {uom && (
                          <span
                            title={uom}
                            className="shrink-0 max-w-[6rem] truncate px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-100 text-[12px] font-semibold uppercase text-slate-600"
                          >
                            {uom}
                          </span>
                        )}

                       
                        {li.attachment && (
                          <span className="order-last basis-full sm:order-none sm:basis-auto shrink min-w-0 sm:max-w-[13rem] inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border border-slate-200 bg-white text-[12px] text-slate-600 shadow-sm">
                            <FileText size={12} className="shrink-0 text-slate-400" />
                            <span className="min-w-0 truncate" title={li.attachment.name}>{li.attachment.name}</span>
                            <span className="shrink-0 text-[10px] text-slate-400">{formatFileSize(li.attachment.size)}</span>
                            <button
                              type="button"
                              onClick={() => removeAttachment(index)}
                              className="shrink-0 ml-auto sm:ml-0.5 text-slate-300 hover:text-rose-500"
                              title="Remove attachment"
                            >
                              <X size={11} />
                            </button>
                          </span>
                        )}

                        <label
                          htmlFor={fileInputId}
                          title={li.attachment ? 'Replace attachment' : `Attach a file: ${ATTACHMENT_HINT}, up to ${ATTACHMENT_MAX_MB} MB`}
                          className="shrink-0 cursor-pointer p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                        >
                          <Paperclip size={16} />
                        </label>
                        <input
                          id={fileInputId}
                          type="file"
                          accept={ATTACHMENT_ACCEPT}
                          className="hidden"
                          onChange={(e) => {
                            selectAttachment(index, e.target.files?.[0])
                            e.target.value = ''
                          }}
                        />

                        <button
                          type="button"
                          onClick={() => removeLine(index)}
                          disabled={form.lineItems.length === 1}
                          className="shrink-0 p-1.5 text-slate-300 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors disabled:opacity-60 disabled:hover:text-slate-300 disabled:hover:bg-transparent"
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <FieldError>{li.attachmentError}</FieldError>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          {formError && (
            <div className="rounded-xl bg-rose-50 px-4 py-2.5 text-[13px] text-rose-600">{formError}</div>
          )}

        
          {attachedSummary && (
            <div className="rounded-xl bg-slate-50 px-4 py-2.5 text-[12px] text-slate-500">
              <span className="font-medium text-slate-600">Attached: {attachedSummary}</span>
              <span className="block mt-0.5">
                {isRfqMockMode
                  ? 'Mock mode: files are kept in this browser session only and are lost on refresh. Files are not uploaded.'
                  : 'Attachments are not uploaded yet: the server has no attachment storage, so they are not saved with the RFQ.'}
              </span>
            </div>
          )}

          {/* FOOTER */}
          <div className="flex flex-wrap justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} disabled={saving} className={FORM_SECONDARY_BUTTON_CLASS}>
              Cancel
            </button>
            <button type="button" onClick={() => save('draft')} disabled={saving} className={FORM_SECONDARY_BUTTON_CLASS}>
              {saving ? 'Saving…' : 'Save as Draft'}
            </button>
            <Button onClick={() => save('send')} disabled={saving}>
              Send RFQ
            </Button>
          </div>
        </div>
      )}
    </Modal>

    
    {sendState && (
      <SendRfqModal
        open
        onClose={cancelSend}
        rfqNumber={sendState.rfqNumber}
        requiredDate={sendState.requiredDate}
        items={sendState.items}
        vendors={sendState.vendors}
        sender={rfqSender()}
        onDone={finishSend}
        busy={sendBusy}
        error={sendError}
      />
    )}
    </>
  )
}
