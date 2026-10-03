// src/pages/purchase-orders/RFQList.jsx

import { useEffect, useState } from 'react'
import { Plus, Eye, Edit2, Trash2 } from 'lucide-react'

import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

import {
  Th,
  Td,
  TrHover,
  EmptyRow,
  FilterPill,
  PageHeader,
  TabBar,
} from '../../components/ui/Table'

import { prototypeRfqsApi } from '../../api/rfqs'
import {
  toArray,
  formatDate,
  partnerName,
  sameStatus,
} from './rfqUtils'
import RFQForm from './RFQForm'
import RFQDetail from './RFQDetail'
import Badge from './RFQStatusBadge'




const LIST_PATH = '/purchase-orders/rfqs'
const ROUTE_RE = /\/rfqs\/([^/]+)(?:\/(edit))?\/?$/

function parseRoute(pathname) {
  const match = pathname.match(ROUTE_RE)
  if (!match) return { view: 'list' }
  if (match[1] === 'new') return { view: 'list', create: true }
  return { view: 'detail', id: decodeURIComponent(match[1]), edit: match[2] === 'edit' }
}

function getListPath(pathname) {
  return ROUTE_RE.test(pathname) ? pathname.replace(ROUTE_RE, '/rfqs') : pathname
}

function getRfqBase(listPath) {
  return /\/rfqs\/?$/.test(listPath) ? listPath.replace(/\/$/, '') : LIST_PATH
}




const STATUSES = ['All', 'Draft', 'Sent', 'Quoted', 'Converted']




function vendorNameFromInvitations(vendorData, vendorId) {
  const list = toArray(vendorData)
  const match =
    list.find((v) => String(v.vendorId ?? v.vendor?.id ?? v.id) === String(vendorId)) ||
    (list.length === 1 ? list[0] : null)

  if (!match) return null
  return match.vendorName || match.vendor?.name || match.name || null
}



// RFQ LIST (page entry)


export default function RFQList() {
  const [route, setRoute] = useState(() => parseRoute(window.location.pathname))
  const [listPath] = useState(() => getListPath(window.location.pathname))
  const rfqBase = getRfqBase(listPath)

  const [rfqs, setRfqs] = useState([])
  const [vendorNames, setVendorNames] = useState({})
  const [itemCounts, setItemCounts] = useState({})
  const [partners, setPartners] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [activeTab, setActiveTab] = useState('sent')

  const [modal, setModal] = useState(() => {
    if (route.create) return { rfqId: null }
    if (route.view === 'detail' && route.edit) return { rfqId: route.id }
    return null
  })
  const [detailVersion, setDetailVersion] = useState(0)


  // navigation

  function go(path, { replace = false } = {}) {
    if (replace) window.history.replaceState({}, '', path)
    else window.history.pushState({}, '', path)
    setRoute(parseRoute(path))
    window.scrollTo(0, 0)
  }

  function openDetail(id) {
    go(`${rfqBase}/${encodeURIComponent(id)}`)
  }

  function backToList() {
    go(listPath)
  }

  useEffect(() => {
    function onPopState() {
      const next = parseRoute(window.location.pathname)
      setRoute(next)
      if (next.create) setModal({ rfqId: null })
      else if (next.view === 'detail' && next.edit) setModal({ rfqId: next.id })
      else setModal(null)
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])


  // data

  async function loadRfqs() {
    try {
      setLoading(true)
      setError('')

      const [data, partnerData, productData] = await Promise.all([
        prototypeRfqsApi.list(),
        prototypeRfqsApi.partners().catch((err) => {
          console.warn('Could not load partners', err)
          return []
        }),
        prototypeRfqsApi.products().catch((err) => {
          console.warn('Could not load products', err)
          return []
        }),
      ])

      const list = toArray(data)
      const partnerList = toArray(partnerData)
      setRfqs(list)
      setPartners(partnerList)
      setProducts(toArray(productData))

      const vendorMap = {}
      const countMap = {}

      await Promise.all(
        list.map(async (rfq) => {
          // VENDOR
          if (rfq.vendorId == null) {
            vendorMap[rfq.id] = '—'
          } else {
            const name = partnerName(partnerList, rfq.vendorId)
            if (name) {
              vendorMap[rfq.id] = name
            } else {
              try {
                const vendorData = await prototypeRfqsApi.vendors(rfq.id)
                vendorMap[rfq.id] = vendorNameFromInvitations(vendorData, rfq.vendorId) || '—'
              } catch (vendorError) {
                console.warn(`Could not load vendor for RFQ ${rfq.id}`, vendorError)
                vendorMap[rfq.id] = '—'
              }
            }
          }

          // ITEMS
          if (Array.isArray(rfq.lineItems)) {
            countMap[rfq.id] = rfq.lineItems.length
          } else {
            try {
              const lineData = await prototypeRfqsApi.lines(rfq.id)
              countMap[rfq.id] = toArray(lineData).length
            } catch (lineError) {
              console.warn(`Could not load lines for RFQ ${rfq.id}`, lineError)
              countMap[rfq.id] = 0
            }
          }
        })
      )

      setVendorNames(vendorMap)
      setItemCounts(countMap)
    } catch (err) {
      console.error('RFQ prototype API error:', err)
      setError(err.message || 'Failed to load RFQs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRfqs()
  }, [])


  //delete

  async function handleDelete(rfq) {
    if (!window.confirm(`Delete ${rfq.rfqNumber}?`)) return false

    try {
      await prototypeRfqsApi.delete(rfq.id)
      setRfqs((prev) => prev.filter((r) => String(r.id) !== String(rfq.id)))
      return true
    } catch (err) {
      console.error('RFQ delete error:', err)
      window.alert(err.message || 'Failed to delete RFQ')
      return false
    }
  }


  //modal

 
  function cleanModalUrl() {
    const current = parseRoute(window.location.pathname)
    if (current.create) go(listPath, { replace: true })
    else if (current.view === 'detail' && current.edit) {
      go(`${rfqBase}/${encodeURIComponent(current.id)}`, { replace: true })
    }
  }

  function closeModal() {
    setModal(null)
    cleanModalUrl()
  }

  function handleSaved() {
    setModal(null)
    cleanModalUrl()
    loadRfqs()
    setDetailVersion((v) => v + 1)
  }


  //sort 

  const sorted = [...rfqs].sort((a, b) =>
    String(b.createdAt || '').localeCompare(String(a.createdAt || ''))
  )

  const displayed =
    statusFilter === 'All'
      ? sorted
      : sorted.filter((rfq) => sameStatus(rfq.status, statusFilter))


 
 

  const formModal = (
    <RFQForm
      open={!!modal}
      rfqId={modal?.rfqId ?? null}
      partners={partners}
      products={products}
      onClose={closeModal}
      onSaved={handleSaved}
    />
  )

  if (route.view === 'detail') {
    return (
      <>
        <RFQDetail
          key={`${route.id}-${detailVersion}`}
          id={route.id}
          partners={partners}
          products={products}
          onBack={backToList}
          onEdit={(rfq) => setModal({ rfqId: rfq.id })}
          onDelete={async (rfq) => {
            if (await handleDelete(rfq)) backToList()
          }}
          onChanged={loadRfqs}
        />
        {formModal}
      </>
    )
  }

  return (
    <div className="flex flex-col max-w-screen-xl">

      {/* HEADER */}
      <PageHeader
        title="Request for Quotations"
        subtitle={`${rfqs.length} RFQs`}
        action={
          <Button onClick={() => setModal({ rfqId: null })}>
            <Plus size={14} /> New RFQ
          </Button>
        }
      />

      {/* TAB */}
      <TabBar
        tabs={[['sent', 'Sent RFQs']]}
        active={activeTab}
        onChange={setActiveTab}
      />

      {/* ERROR */}
      {error && (
        <Card className="mb-4 p-4 text-[13px] text-rose-600 bg-rose-50">
          {error}
        </Card>
      )}

      {loading ? (
        <Card className="py-16 text-center text-[13px] text-slate-400">Loading…</Card>
      ) : (
        <>
          {/* STATUS FILTER */}
          <div className="flex gap-2 flex-wrap mb-4">
            {STATUSES.map((status) => (
              <FilterPill
                key={status}
                active={statusFilter === status}
                onClick={() => setStatusFilter(status)}
              >
                {status}
              </FilterPill>
            ))}
          </div>

          {/* TABLE */}
          <Card>
            <table className="w-full">
              <thead className="border-b border-slate-100">
                <tr>
                  {['RFQ #', 'Vendor', 'Date', 'Items', 'Status', ''].map((h) => (
                    <Th key={h}>{h}</Th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {displayed.length === 0 && (
                  <EmptyRow colSpan={6} message="No RFQs match this filter." />
                )}

                {displayed.map((rfq) => (
                  <TrHover key={rfq.id} onClick={() => openDetail(rfq.id)}>
                    <Td>
                      <span className="font-semibold text-indigo-600">{rfq.rfqNumber}</span>
                    </Td>

                    <Td className="font-medium">{vendorNames[rfq.id] || '—'}</Td>

                    <Td className="text-slate-400 tabular">{formatDate(rfq.createdAt)}</Td>

                    <Td className="text-slate-400">{itemCounts[rfq.id] ?? 0}</Td>

                    <Td><Badge status={rfq.status} /></Td>

                    <Td>
                      <div className="flex gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => openDetail(rfq.id)}
                          className="p-1.5 text-slate-300 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                          title="View"
                        >
                          <Eye size={14} />
                        </button>

                        {sameStatus(rfq.status, 'Draft') && (
                          <>
                            <button
                              onClick={() => setModal({ rfqId: rfq.id })}
                              className="p-1.5 text-slate-300 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={14} />
                            </button>

                            <button
                              onClick={() => handleDelete(rfq)}
                              className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </Td>
                  </TrHover>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}

      {formModal}
    </div>
  )
}
