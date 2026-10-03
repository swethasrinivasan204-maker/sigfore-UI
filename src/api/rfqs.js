// src/api/rfqs.js

// ============================================================
// PROTOTYPE API
// iLiteERP backend
//
// SigFore React
//      ↓
// /prototype-api
//      ↓
// Vite proxy
//      ↓
// http://localhost:8080/api/v1
// ============================================================

import { mockDb, getNextId, appendEvent, getNextRfqNumber } from '../mock/db'
import { viewableType } from '../pages/purchase-orders/rfqUtils'

const API_BASE = '/prototype-api'

async function request(path, { method = 'GET', body, errorLabel = 'Request failed' } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const message = await response.text().catch(() => '')
    throw new Error(message || `${errorLabel} (${response.status})`)
  }

  const text = await response.text()
  return text ? JSON.parse(text) : null
}

const realRfqsApi = {
  list:       ()                 => request('/rfqs', { errorLabel: 'Failed to load RFQs' }),
  get:         (id)               => request(`/rfqs/${id}`, { errorLabel: 'Failed to load RFQ' }),
  vendors:     (id)               => request(`/rfqs/${id}/vendors`, { errorLabel: 'Failed to load RFQ vendors' }),
  lines:       (id)               => request(`/rfqs/${id}/lines`, { errorLabel: 'Failed to load RFQ lines' }),
  create:      (data)             => request('/rfqs', { method: 'POST', body: data, errorLabel: 'Failed to create RFQ' }),
  update:      (id, data)         => request(`/rfqs/${id}`, { method: 'PUT', body: data, errorLabel: 'Failed to update RFQ' }),
  addLine:     (id, line)         => request(`/rfqs/${id}/lines`, { method: 'POST', body: line, errorLabel: 'Failed to add line' }),
  updateLine:  (id, lineId, line) => request(`/rfqs/${id}/lines/${lineId}`, { method: 'PUT', body: line, errorLabel: 'Failed to update line' }),
  deleteLine:  (id, lineId)       => request(`/rfqs/${id}/lines/${lineId}`, { method: 'DELETE', errorLabel: 'Failed to delete line' }),
  inviteVendor:(id, vendorId)     => request(`/rfqs/${id}/vendors`, { method: 'POST', body: { vendorId }, errorLabel: 'Failed to invite vendor' }),
  send:        (id)               => request(`/rfqs/${id}/send`, { method: 'POST', errorLabel: 'Failed to send RFQ' }),
  award:       (id, vendorId)     => request(`/rfqs/${id}/vendors/${vendorId}/award`, { method: 'POST', errorLabel: 'Failed to award RFQ' }),
  delete:      (id)               => request(`/rfqs/${id}`, { method: 'DELETE', errorLabel: 'Failed to delete RFQ' }),

  // Same lookups the prototype uses for vendor and product names
  partners:    ()                 => request('/partners', { errorLabel: 'Failed to load partners' }),
  products:    ()                 => request('/products', { errorLabel: 'Failed to load products' }),
}

// ============================================================
// MOCK API (VITE_RFQ_MOCK=true)
// Same methods as the prototype API, backed by the in-memory
// mock database in src/mock/db.js
// ============================================================

// Return copies so screens never mutate the mock database directly
const respond = (data) => Promise.resolve(data == null ? null : structuredClone(data))

function findRfq(id) {
  const rfq = mockDb.rfqs.find((r) => String(r.id) === String(id))
  if (!rfq) throw new Error(`RFQ not found (404)`)
  return rfq
}

// Seed lines have no id; give each one an id the first time it is needed
function rfqLines(rfq) {
  rfq.lineItems.forEach((li) => { li.id ??= getNextId('li') })
  return rfq.lineItems
}

function findLine(rfq, lineId) {
  const line = rfqLines(rfq).find((li) => String(li.id) === String(lineId))
  if (!line) throw new Error(`RFQ line not found (404)`)
  return line
}

// Mock attachments: file name, type and size, plus a browser object URL for the selected file
// so RFQ Detail can open it. Nothing is uploaded; the URL dies when the page reloads.
function attachmentMeta(attachment, previous) {
  let url = attachment?.url ?? previous?.url ?? null
  if (attachment?.file) {
    // Give PDFs and images an explicit type so the browser previews them instead of downloading
    const type = viewableType(attachment.name)
    url = URL.createObjectURL(type ? new Blob([attachment.file], { type }) : attachment.file)
  }
  if (!attachment) url = null
  if (previous?.url && previous.url !== url) URL.revokeObjectURL(previous.url)
  return attachment ? { name: attachment.name, type: attachment.type || '', size: Number(attachment.size) || 0, url } : null
}

// SigFore has no logged-in user context yet, so mock events record no actor name.
// The actor should come from the server (the signed-in user) once real auth is wired up.
function setStatus(rfq, toStatus, eventFields = {}) {
  if (rfq.status === toStatus) return
  appendEvent(mockDb.rfqs, rfq.id, { actorType: 'user', event: 'status_change', fromStatus: rfq.status, toStatus, ...eventFields })
  rfq.status = toStatus
}

// Update Status extras, recorded on the status event like the prototype does.
// Photos keep only name/type/size plus a browser object URL; nothing is uploaded.
function statusEventFields({ photos = [], note = '', actingAsSupplier = false } = {}) {
  return {
    ...(actingAsSupplier ? { actor: 'Supplier (via Buyer)' } : {}),
    actorType: actingAsSupplier ? 'vendor' : 'user',
    note,
    photos: photos.map((p) => ({ name: p.name, type: p.type || '', size: Number(p.size) || 0, url: URL.createObjectURL(p.file) })),
  }
}

const mockRfqsApi = {
  list: async () => respond(mockDb.rfqs),
  get:  async (id) => respond(findRfq(id)),

  vendors: async (id) => respond(findRfq(id).vendorInvitations),
  lines:   async (id) => respond(rfqLines(findRfq(id))),

  create: async (data) => {
    const rfq = {
      id: getNextId('r'), rfqNumber: getNextRfqNumber(), rfqGroupId: getNextId('rg'), vendorId: null,
      status: 'Draft', requiredDate: data?.requiredDate || '', notes: data?.notes || '',
      lineItems: [], createdAt: new Date().toISOString().slice(0, 10), statusEvents: [], vendorInvitations: [],
    }
    // Like the prototype, creating an RFQ records no status event
    mockDb.rfqs.push(rfq)
    return respond(rfq)
  },

  // `statusExtras` ({ photos, note, actingAsSupplier }) is an optional extra argument
  // the real API ignores, so its request body stays { status }
  update: async (id, data = {}, statusExtras) => {
    const rfq = findRfq(id)
    const { status, ...fields } = data
    Object.assign(rfq, fields)
    if (status) setStatus(rfq, status, statusExtras ? statusEventFields(statusExtras) : {})
    return respond(rfq)
  },

  // `attachment` is an optional extra argument the real API ignores, so its request body
  // is unchanged. Only metadata is kept here; the file itself is never uploaded.
  addLine: async (id, line, attachment) => {
    const rfq = findRfq(id)
    const created = { id: getNextId('li'), catalogId: line.catalogId, qty: Number(line.qty), attachment: attachmentMeta(attachment) }
    rfqLines(rfq).push(created)
    return respond(created)
  },

  updateLine: async (id, lineId, line, attachment) => {
    const existing = findLine(findRfq(id), lineId)
    Object.assign(existing, { catalogId: line.catalogId, qty: Number(line.qty) })
    if (attachment !== undefined) existing.attachment = attachmentMeta(attachment, existing.attachment)
    return respond(existing)
  },

  deleteLine: async (id, lineId) => {
    const rfq = findRfq(id)
    attachmentMeta(null, findLine(rfq, lineId).attachment)
    rfq.lineItems = rfq.lineItems.filter((li) => String(li.id) !== String(lineId))
    return respond(null)
  },

  inviteVendor: async (id, vendorId) => {
    const rfq = findRfq(id)
    let invite = rfq.vendorInvitations.find((inv) => String(inv.vendorId) === String(vendorId))
    if (!invite) {
      invite = { id: getNextId('vi'), vendorId, status: 'Pending', validUntil: null, notes: '', quotedAt: null, awardedAt: null, quoteLines: [] }
      rfq.vendorInvitations.push(invite)
    }
    return respond(invite)
  },

  send: async (id) => {
    const rfq = findRfq(id)
    setStatus(rfq, 'Sent')
    return respond(rfq)
  },

  // Matches the prototype's awarded RFQ (r7): winner Awarded, other quotes Not Awarded
  award: async (id, vendorId) => {
    const rfq = findRfq(id)
    const winner = rfq.vendorInvitations.find((inv) => String(inv.vendorId) === String(vendorId))
    if (!winner || winner.status !== 'Quoted') throw new Error('Only a quoted vendor can be awarded')
    rfq.vendorInvitations.forEach((inv) => {
      if (inv === winner) {
        inv.status = 'Awarded'
        inv.awardedAt = new Date().toISOString()
      } else if (inv.status === 'Quoted') {
        inv.status = 'Not Awarded'
      }
    })
    rfq.vendorId = winner.vendorId
    return respond(rfq)
  },

  delete: async (id) => {
    findRfq(id)
    mockDb.rfqs.splice(mockDb.rfqs.findIndex((r) => String(r.id) === String(id)), 1)
    return respond(null)
  },

  partners: async () => respond(mockDb.contacts),
  products: async () => respond(mockDb.catalog),
}

export const isRfqMockMode = import.meta.env.VITE_RFQ_MOCK === 'true'

export const prototypeRfqsApi = isRfqMockMode ? mockRfqsApi : realRfqsApi

// Sender shown in the Send RFQ message preview. SigFore has no current-user/company
// context yet (in mock or real mode), so there is no sender and the preview uses its defaults.
export function rfqSender() {
  return null
}
