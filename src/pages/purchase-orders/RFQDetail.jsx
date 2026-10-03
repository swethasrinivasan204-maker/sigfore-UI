// src/pages/purchase-orders/RFQDetail.jsx

import { useEffect, useState } from 'react'
import { ArrowLeft, Edit2, Trash2, Send, Tag, Award, RefreshCw, FileText, Clock } from 'lucide-react'

import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import StatusChangeModal from '../../components/ui/StatusChangeModal'
import StatusTimeline from '../../components/ui/StatusTimeline'
import { Th, Td, EmptyRow } from '../../components/ui/Table'

import { prototypeRfqsApi, isRfqMockMode } from '../../api/rfqs'
import Badge from './RFQStatusBadge'
import {
  toArray,
  formatDate,
  formatCurrency,
  invitationVendorId,
  lineProductId,
  lineQty,
  partnerName,
  productName,
  sameStatus,
  formatFileSize,
  attachmentKind,
  attachmentSummary,
  viewableType,
} from './rfqUtils'



// RFQ DETAIL 


const RFQ_STATUSES = ['Draft', 'Sent', 'Quoted', 'Converted', 'Cancelled']

const INVITE_STYLES = {
  awarded:       'bg-emerald-50 text-emerald-600 border-emerald-200',
  quoted:        'bg-indigo-50 text-indigo-600 border-indigo-200',
  'not awarded': 'bg-slate-50 text-slate-500 border-slate-200',
}

function InviteStatus({ status }) {
  const style = INVITE_STYLES[String(status || '').toLowerCase()] || 'bg-amber-50 text-amber-600 border-amber-200'
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full border text-[12px] font-semibold whitespace-nowrap ${style}`}>
      {status || '—'}
    </span>
  )
}

function quoteTotal(quoteLines) {
  return (quoteLines || []).reduce((sum, l) => sum + (Number(l.unitPrice) || 0) * (Number(l.qty) || 0), 0)
}

function averageLeadDays(quoteLines) {
  if (!quoteLines?.length) return null
  return Math.round(quoteLines.reduce((sum, l) => sum + (Number(l.leadDays) || 0), 0) / quoteLines.length)
}

export default function RFQDetail({ id, partners, products, onBack, onEdit, onDelete, onChanged }) {
  const [rfq, setRfq] = useState(null)
  const [lines, setLines] = useState([])
  const [linesError, setLinesError] = useState(false)
  const [invitations, setInvitations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [busy, setBusy] = useState('')
  const [statusOpen, setStatusOpen] = useState(false)

  async function load() {
    try {
      setLoading(true)
      setError('')
      const [rfqData, lineData, vendorData] = await Promise.all([
        prototypeRfqsApi.get(id),
        prototypeRfqsApi.lines(id).catch((err) => {
          console.warn(`Could not load lines for RFQ ${id}`, err)
          return null
        }),
        prototypeRfqsApi.vendors(id).catch((err) => {
          console.warn(`Could not load vendors for RFQ ${id}`, err)
          return []
        }),
      ])
      setRfq(rfqData)
      setLinesError(lineData === null)
      setLines(lineData === null ? [] : toArray(lineData))
      setInvitations(toArray(vendorData))
    } catch (err) {
      console.error('RFQ detail error:', err)
      setError(err.message || 'Failed to load RFQ')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  async function runAction(name, action) {
    try {
      setBusy(name)
      setActionError('')
      await action()
      await load()
      onChanged()
      return true
    } catch (err) {
      console.error(`RFQ ${name} error:`, err)
      setActionError(err.message || `Failed to ${name} RFQ`)
      return false
    } finally {
      setBusy('')
    }
  }

  function handleSend() {
    if (!window.confirm(`Send ${rfq.rfqNumber} to the invited vendors?`)) return
    runAction('send', () => prototypeRfqsApi.send(rfq.id))
  }

  function handleAward(vendorId) {
    runAction('award', () => prototypeRfqsApi.award(rfq.id, vendorId))
  }

  function openStatusModal() {
    setActionError('')
    setStatusOpen(true)
  }

  
  function handleStatusChange({ nextStatus, photos, note, actingAsSupplier }) {
    return runAction('update', () =>
      prototypeRfqsApi.update(rfq.id, { status: nextStatus }, { photos, note, actingAsSupplier })
    )
  }

  const isDraft = sameStatus(rfq?.status, 'Draft')
  const canUpdateStatus = rfq && !['cancelled', 'converted'].includes(String(rfq.status || '').toLowerCase())
  const awardedInvite = invitations.find((inv) => sameStatus(inv.status, 'Awarded'))
  const isAwarded = !!awardedInvite
  const assignedVendor = partnerName(partners, rfq?.vendorId)
  const attachmentsSummary = attachmentSummary(lines.map((line) => line.attachment))
  const quotedCount =invitations.filter((inv) => sameStatus(inv.status, 'Quoted') || sameStatus(inv.status, 'Awarded')).length

  function vendorName(inv) {
    const vid = invitationVendorId(inv)
    return inv.vendorName || inv.vendor?.name || partnerName(partners, vid) || `Vendor #${vid}`
  }

  function productOf(line) {
    const pid = lineProductId(line)
    return products.find((p) => String(p.id) === String(pid))
  }

  return (
    <div className="flex flex-col max-w-screen-xl">

      <button
        onClick={onBack}
        className="self-start inline-flex items-center gap-1.5 mb-3 text-[13px] font-medium text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft size={14} /> Request for Quotations
      </button>

      {loading ? (
        <Card className="py-16 text-center text-[13px] text-slate-400">Loading…</Card>
      ) : error || !rfq ? (
        <Card className="p-4 text-[13px] text-rose-600 bg-rose-50">
          {error || 'RFQ not found.'}
        </Card>
      ) : (
        <div className="flex flex-col gap-4">

          {/* HEADER */}
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-[20px] font-bold text-slate-900 tracking-tight">
              {rfq.rfqNumber || `RFQ ${rfq.id}`}
            </h2>
            <Badge status={rfq.status} />
            {isAwarded && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-[12px] font-semibold text-emerald-600">
                <Award size={11} /> Awarded to {vendorName(awardedInvite)}
              </span>
            )}
          </div>

          
          <Card className="p-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              <DetailField label="Vendor(s)">
                {invitations.length > 0 ? `${invitations.length} invited` : assignedVendor || '—'}
              </DetailField>
              <DetailField label="Created">{formatDate(rfq.createdAt)}</DetailField>
              <DetailField label="Required By">{formatDate(rfq.requiredDate)}</DetailField>
              <DetailField label="Items">{linesError ? '—' : lines.length}</DetailField>
            </div>
            {rfq.notes && (
              <p className="mt-5 text-[13px] text-slate-600 bg-slate-50 rounded-xl p-3 whitespace-pre-wrap">
                {rfq.notes}
              </p>
            )}
          </Card>

        {/*LINE ITEMS */} 
          <Card>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-5 pt-4 pb-2">
              <h3 className="text-[14px] font-semibold text-slate-700">Line Items</h3>
             
              {attachmentsSummary && (
                <span className="ml-auto text-[12px] text-slate-400">
                  Attached: {attachmentsSummary}{isRfqMockMode && ' · mock, not uploaded'}
                </span>
              )}
            </div>
            {linesError ? (
              <div className="mx-5 mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-700">
                The line items for this RFQ could not be loaded. The prototype backend returned an
                error for <code className="font-mono text-[12px]">GET /rfqs/{rfq.id}/lines</code>.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-slate-100">
                    <tr>
                      {['Item', 'SKU', 'Category', 'Qty', 'UOM', 'Attachment'].map((h) => <Th key={h}>{h}</Th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {lines.length === 0 && <EmptyRow colSpan={6} message="No items on this RFQ." />}
                    {lines.map((line, index) => {
                      const product = productOf(line)
                      return (
                        <tr key={line.id ?? index} className="border-b border-slate-50 last:border-0">
                          <Td className="font-medium">{productName(products, line)}</Td>
                          <Td className="text-slate-400">{product?.sku || '—'}</Td>
                          <Td className="text-slate-400">{product?.category || '—'}</Td>
                          <Td className="tabular">{lineQty(line)}</Td>
                          <Td className="text-slate-400 text-[12px] uppercase">{line.uom || product?.uom || '—'}</Td>
                        
                          <Td className="text-[12px]">
                            {line.attachment ? (
                              <span className="flex items-center gap-1.5 min-w-0 max-w-[16rem] text-slate-600">
                                <FileText size={12} className="shrink-0 text-slate-400" />
                                {line.attachment.url ? (
                                
                                  <a
                                    href={line.attachment.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    
                                    download={viewableType(line.attachment.name) ? undefined : line.attachment.name}
                                    title={viewableType(line.attachment.name) ? `Open ${line.attachment.name}` : `Download ${line.attachment.name}`}
                                    className="min-w-0 truncate text-indigo-600 hover:underline"
                                  >
                                    {line.attachment.name}
                                  </a>
                                ) : (
                                  <span className="min-w-0 truncate" title={line.attachment.name}>{line.attachment.name}</span>
                                )}
                                <span className="shrink-0 text-[11px] text-slate-400">
                                  {attachmentKind(line.attachment.name)} · {formatFileSize(line.attachment.size)}
                                </span>
                              </span>
                            ) : (
                              <span className="text-slate-300">No attachment</span>
                            )}
                          </Td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* VENDOR QUOTES */}
          {invitations.length > 0 && (
            <Card>
              <div className="flex items-center gap-2 px-5 pt-4 pb-2">
                <Tag size={15} className="text-indigo-600" />
                <h3 className="text-[14px] font-semibold text-slate-700">Vendor Quotes</h3>
                <span className="ml-auto text-[12px] text-slate-400">
                  {quotedCount} of {invitations.length} quoted
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-slate-100">
                    <tr>
                      {['Vendor', 'Status', 'Valid Until', 'Total', 'Lead Days (avg)', ''].map((h) => <Th key={h}>{h}</Th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {invitations.map((inv, index) => {
                      const total = quoteTotal(inv.quoteLines)
                      const avgLead = averageLeadDays(inv.quoteLines)
                      const thisAwarded = sameStatus(inv.status, 'Awarded')
                      return (
                        <tr
                          key={inv.id ?? index}
                          className={`border-b border-slate-50 last:border-0 ${thisAwarded ? 'bg-emerald-50/60' : ''}`}
                        >
                          <Td className="font-medium">{vendorName(inv)}</Td>
                          <Td><InviteStatus status={inv.status} /></Td>
                          <Td className="text-slate-400 tabular">{formatDate(inv.validUntil)}</Td>
                          <Td className="font-semibold tabular">{total > 0 ? formatCurrency(total) : '—'}</Td>
                          <Td className="text-slate-400 tabular">{avgLead != null ? `${avgLead}d` : '—'}</Td>
                          <Td className="text-right">
                            {sameStatus(inv.status, 'Quoted') && !isAwarded && (
                              <Button
                                size="sm"
                                onClick={() => handleAward(invitationVendorId(inv))}
                                disabled={!!busy}
                              >
                                <Award size={13} /> {busy === 'award' ? 'Awarding…' : 'Award'}
                              </Button>
                            )}
                            {thisAwarded && (
                              <span className="text-[12px] font-semibold text-emerald-600">Awarded</span>
                            )}
                          </Td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              
              {invitations
                .filter((inv) => (inv.quoteLines || []).length > 0)
                .map((inv, index) => (
                  <div key={inv.id ?? index} className="mx-5 mt-2 mb-4 pt-4 border-t border-slate-100">
                    <p className="text-[12px] font-semibold text-slate-500 mb-2">{vendorName(inv)} — Line Detail</p>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr>
                            {['Item', 'Qty', 'UOM', 'Unit Price', 'Lead Days', 'Total'].map((h) => <Th key={h}>{h}</Th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {inv.quoteLines.map((ql, i) => {
                            const product = productOf(ql)
                            return (
                              <tr key={ql.id ?? i} className="border-b border-slate-50 last:border-0">
                                <Td>{product?.name || `Item #${ql.catalogId}`}</Td>
                                <Td className="tabular">{ql.qty}</Td>
                                <Td className="text-slate-400 text-[12px] uppercase">{product?.uom || '—'}</Td>
                                <Td className="tabular">{formatCurrency(ql.unitPrice)}</Td>
                                <Td className="text-slate-400 tabular">{ql.leadDays || '—'}</Td>
                                <Td className="font-medium tabular">
                                  {formatCurrency((Number(ql.unitPrice) || 0) * (Number(ql.qty) || 0))}
                                </Td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
            </Card>
          )}

          {/* ACTIVITY */}
          {(rfq.statusEvents || []).length > 0 && (
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Clock size={15} className="text-slate-400" />
                <h3 className="text-[14px] font-semibold text-slate-700">Activity</h3>
              </div>
              <StatusTimeline events={rfq.statusEvents} />
            </Card>
          )}

          {actionError && (
            <div className="rounded-xl bg-rose-50 px-4 py-2.5 text-[13px] text-rose-600">{actionError}</div>
          )}

          {/* ACTIONS */}
          <div className="flex flex-wrap gap-2">
            {isDraft && (
              <>
                <Button onClick={handleSend} disabled={!!busy}>
                  <Send size={14} /> {busy === 'send' ? 'Sending…' : 'Send RFQ'}
                </Button>
                <Button variant="secondary" onClick={() => onEdit(rfq)} disabled={!!busy}>
                  <Edit2 size={14} /> Edit
                </Button>
                <Button variant="danger" onClick={() => onDelete(rfq)} disabled={!!busy}>
                  <Trash2 size={14} /> Delete
                </Button>
              </>
            )}
            {canUpdateStatus && (
              <Button onClick={openStatusModal} disabled={!!busy}>
                <RefreshCw size={14} /> Update Status
              </Button>
            )}
          </div>

          {/* UPDATE STATUS */}
          <StatusChangeModal
            open={statusOpen}
            onClose={() => setStatusOpen(false)}
            title={`Update Status — ${rfq.rfqNumber || `RFQ ${rfq.id}`}`}
            statuses={RFQ_STATUSES}
            currentStatus={rfq.status}
            onConfirm={handleStatusChange}
            canActAsSupplier
            busy={busy === 'update'}
            error={actionError}
            photoNotice={isRfqMockMode
              ? 'Mock mode: photos are kept in this browser session only and are not uploaded.'
              : 'Photos are not uploaded yet: the server has no attachment storage, so they are not saved.'}
          />
        </div>
      )}
    </div>
  )
}

function DetailField({ label, children }) {
  return (
    <div>
      <div className="text-[11px] font-semibold text-slate-400 mb-1">{label}</div>
      <div className="text-[13px] font-medium text-slate-700">{children}</div>
    </div>
  )
}
