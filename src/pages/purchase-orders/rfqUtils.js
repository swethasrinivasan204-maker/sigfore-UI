// src/pages/purchase-orders/rfqUtils.js


export function toArray(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.content)) return data.content
  if (Array.isArray(data?.lines)) return data.lines
  if (Array.isArray(data?.vendors)) return data.vendors
  return []
}

export function formatDate(value) {
  if (!value) return '—'
  if (typeof value === 'string') return value.slice(0, 10)
  return value
}

export function toDateInput(value) {
  return value ? String(value).slice(0, 10) : ''
}


export function toId(value) {
  return /^\d+$/.test(String(value)) ? Number(value) : value
}

export function invitationVendorId(inv) {
  return inv?.vendorId ?? inv?.vendor?.id ?? null
}

export function lineProductId(line) {
  return line?.catalogId ?? line?.productId ?? line?.product?.id ?? null
}

export function lineQty(line) {
  return line?.qty ?? line?.quantity ?? 0
}

export function partnerName(partners, id) {
  if (id == null) return null
  return partners.find((p) => String(p.id) === String(id))?.name || null
}

export function productName(products, line) {
  const id = lineProductId(line)
  const product = products.find((p) => String(p.id) === String(id))
  return line?.productName || line?.name || product?.name || (id != null ? `#${id}` : '—')
}

export function sameStatus(a, b) {
  return String(a || '').toLowerCase() === String(b || '').toLowerCase()
}


export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(amount) || 0)
}

export function isVendorPartner(partner) {
  const type = String(partner?.type || '').toLowerCase()
  return !type || type === 'vendor' || type === 'both'
}



export const ATTACHMENT_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'png', 'jpg', 'jpeg']
export const ATTACHMENT_ACCEPT = ATTACHMENT_EXTENSIONS.map((ext) => `.${ext}`).join(',')
export const ATTACHMENT_HINT = 'PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, or JPEG'
export const ATTACHMENT_MAX_MB = 1


const VIEWABLE_TYPES = { pdf: 'application/pdf', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg' }

function extensionOf(name) {
  const parts = String(name || '').toLowerCase().split('.')
  return parts.length > 1 ? parts.pop() : ''
}

export function viewableType(name) {
  return VIEWABLE_TYPES[extensionOf(name)] || null
}

export function formatFileSize(size) {
  const bytes = Number(size) || 0
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function attachmentKind(name) {
  return extensionOf(name).toUpperCase()
}


export function validateAttachment(file) {
  if (!ATTACHMENT_EXTENSIONS.includes(extensionOf(file?.name))) {
    return `"${file?.name}" is not supported. Please attach a ${ATTACHMENT_HINT} file.`
  }
  if (file.size > ATTACHMENT_MAX_MB * 1024 * 1024) {
    return `"${file.name}" is too large. Maximum file size is ${ATTACHMENT_MAX_MB} MB.`
  }
  return ''
}


export function attachmentSummary(attachments) {
  const list = attachments.filter(Boolean)
  if (!list.length) return ''
  const kinds = [...new Set(list.map((a) => attachmentKind(a.name)))].join(', ')
  const total = list.reduce((sum, a) => sum + (Number(a.size) || 0), 0)
  return `${list.length} attachment${list.length > 1 ? 's' : ''} (${kinds}, ${formatFileSize(total)})`
}
