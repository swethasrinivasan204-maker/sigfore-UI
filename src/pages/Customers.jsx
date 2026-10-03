// src/pages/Customers.jsx

import { useState,useRef } from 'react'
import { Plus, Edit2, Trash2, Search,Upload} from 'lucide-react'
import * as XLSX from 'xlsx'
import { initialCustomers, getNextId, TYPE_OPTIONS } from '../mock/customers'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import Input, { Select } from '../components/ui/Input'
import { Th, Td, TrHover, EmptyRow, FilterPill, PageHeader } from '../components/ui/Table'

const TYPE_BADGE = {
  Vendor:   'bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-200',
  Customer: 'bg-sky-50 text-sky-600 ring-1 ring-inset ring-sky-200',
  Both:     'bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-200',
}

//Add form
function CustomerForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    email: initial?.email || '',
    phone: initial?.phone || '',
    contactPerson: initial?.contactPerson || '',
    address: initial?.address || '',
    type: initial?.type || 'Vendor',
  })
const [errors, setErrors] = useState({})

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (form.email && !form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Valid email required'
    return e
  }
function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSave(form)
  }
return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} error={errors.name} placeholder="e.g. Acme Corp" />
        <Select label="Type" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
          {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} error={errors.email} placeholder="contact@company.com" />
        <Input label="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91-99999-00000" />
      </div>
      <Input label="Contact Person" value={form.contactPerson} onChange={e => setForm(f => ({ ...f, contactPerson: e.target.value }))} placeholder="e.g. Rahul Sharma" />
      <Input label="Address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="e.g. 12 MG Road, Bengaluru" />
      <div className="flex gap-2 pt-2">
        <Button type="submit">{initial ? 'Save Changes' : 'Add Contact'}</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}

// page
export default function Customers()
{
  const [customers, setCustomers] = useState(initialCustomers)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [modal, setModal] = useState(null)
  const [toastMsg, setToastMsg] = useState(null)
  const fileInputRef = useRef(null)
   function showToast(text, type = 'success') {
      setToastMsg({ text, type })
      window.clearTimeout(showToast._t)
      showToast._t = window.setTimeout(() => setToastMsg(null), 2500)
}

 function handleSave(form)
{
    if (modal.mode === 'create') {
      setCustomers(prev => [...prev, { id: getNextId(), ...form }])
      showToast('Contact added', 'success')
    } else {
      setCustomers(prev => prev.map(c => c.id === modal.customer.id ? { ...c, ...form } : c))
      showToast('Contact updated', 'success')
    }
    setModal(null)
}
function handleDelete(customer) {
    if (!confirm(`Delete "${customer.name}"?`)) return
    setCustomers(prev => prev.filter(c => c.id !== customer.id))
    showToast('Contact deleted', 'info')
  }
function handleExcelUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  e.target.value = ''
  const reader = new FileReader()
  reader.onload = evt => {
    try {
      const wb = XLSX.read(evt.target.result, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(ws, { defval: '' })
      const imported = []
      rows.forEach(row => {
        const name = (row['Name'] || row['name'] || '').toString().trim()
        if (!name) return
        const rawType = (row['Type'] || row['type'] || '').toString().trim()
        const type = TYPE_OPTIONS.includes(rawType) ? rawType : 'Vendor'
        imported.push({
          id: getNextId(),
          name,
          email: (row['Email'] || row['email'] || '').toString().trim(),
          phone: (row['Phone'] || row['phone'] || '').toString().trim(),
          contactPerson: (row['Contact Person'] || row['contactPerson'] || row['contact_person'] || '').toString().trim(),
          address: (row['Address'] || row['address'] || '').toString().trim(),
          type,
        })
      })
      if (imported.length > 0) {
        setCustomers(prev => [...prev, ...imported])
        showToast(`${imported.length} contact${imported.length > 1 ? 's' : ''} imported`, 'success')
      } else {
        showToast('No valid contacts found in file', 'error')
      }
    } catch {
      showToast('Failed to parse file', 'error')
    }
  }
  reader.readAsArrayBuffer(file)
}
 const displayed = customers.filter(c => {
    const matchType = typeFilter === 'All' || c.type === typeFilter
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.contactPerson || '').toLowerCase().includes(search.toLowerCase())
    return matchType && matchSearch
  })
return (
    <div className="flex flex-col max-w-screen-xl">
      <PageHeader
        title="Contacts"
        subtitle={`${customers.length} total contacts`}
        action={ <div className="flex gap-2">
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept=".xlsx,.xls,.csv"
                              className="hidden"
                              onChange={handleExcelUpload}
                            />
                            <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                              <Upload size={14} /> Upload Excel
                            </Button>
          <Button onClick={() => setModal({ mode: 'create' })}>
            <Plus size={14} /> Add Contact
          </Button>
          </div>
            }
      />
     <div className="flex flex-wrap gap-3 items-center mb-4">
              <div className="relative flex-1 min-w-56">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
       />

     <input
             value={search}
             onChange={e => setSearch(e.target.value)}
             placeholder="Search by name, email, or contact person…"
             className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-[13px] text-slate-700
             placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
        />
     </div>
              <div className="flex gap-2">
                  {['All', ...TYPE_OPTIONS].map(type => (
                      <FilterPill key={type} active={typeFilter === type} onClick={() => setTypeFilter(type)}>{type}</FilterPill>
                      ))}
                  </div>
      </div>
           <Card>
                 <table className="w-full">
                   <thead className="border-b border-slate-100">
                     <tr>
                       {['Name', 'Type', 'Contact Person', 'Email', 'Phone', 'Address', ''].map(h => <Th key={h}>{h}</Th>)}
                     </tr>
                   </thead>
                   <tbody>
                     {displayed.length === 0 ? (
                       <EmptyRow
                         colSpan={7}
                         message={search ? 'No contacts match your search.' : 'No contacts yet. Add your first contact to get started.'}
                   />
                   ) : displayed.map(customer => (
                       <TrHover key={customer.id}>
                           <Td><span className="font-semibold text-slate-800">{customer.name}</span></Td>
                              <Td>
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${TYPE_BADGE[customer.type] || 'bg-slate-100 text-slate-500'}`}>
                                       {customer.type}
                                     </span>
                                   </Td>
                                   <Td>{customer.contactPerson || <span className="text-slate-300">—</span>}</Td>
                                   <Td>{customer.email || <span className="text-slate-300">—</span>}</Td>
                                   <Td>{customer.phone || <span className="text-slate-300">—</span>}</Td>
                                   <Td>{customer.address || <span className="text-slate-300">—</span>}</Td>
                                   <Td>
                                     <div className="flex gap-1 justify-end">
                                       <button onClick={() => setModal({ mode: 'edit', customer })} className="p-1.5 text-slate-300 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"><Edit2 size={14} /></button>
                                       <button onClick={() => handleDelete(customer)} className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"><Trash2 size={14} /></button>
                                </div>
                                </Td>
                                </TrHover>
                                ))}
                                </tbody>
                                </table>
                                </Card>
                                 <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === 'create' ? 'Add Contact' : 'Edit Contact'}>
                                        {modal && <CustomerForm initial={modal.customer} onSave={handleSave} onCancel={() => setModal(null)} />}
                                            </Modal>
                                  {
                                      toastMsg && (<div
                                      className={`fixed bottom-5 right-5 px-4 py-2.5 rounded-xl text-[13px] font-medium text-white shadow-lg z-[60] ${
                                             toastMsg.type === 'error' ? 'bg-rose-500' : toastMsg.type === 'info' ? 'bg-slate-700' : 'bg-indigo-600'
                                           }`}
                                         >
                                           {toastMsg.text}
                                         </div>
                                       )}
                                     </div>
                                   )
                                 }

