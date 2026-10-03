// src/mock/customers.js
//testing through mock later test with real API

export const TYPE_OPTIONS = ['Vendor', 'Customer', 'Both']

export const initialCustomers = [
  { id: 1, name: 'Acme Corp',           email: 'orders@acme.com',       phone: '+1-555-0101', contactPerson: 'Jane Smith',  address: '123 Main St',        type: 'Vendor' },
  { id: 2, name: 'GlobalSupply Ltd',    email: 'supply@global.com',     phone: '+1-555-0102', contactPerson: 'Bob Lee',     address: '456 Trade Ave',      type: 'Vendor' },
  { id: 3, name: 'TechParts Inc',       email: 'sales@techparts.com',   phone: '+1-555-0103', contactPerson: 'Carol White', address: '789 Tech Blvd',      type: 'Vendor' },
  { id: 4, name: 'Crestline Retail',    email: 'buying@crestline.com',  phone: '+1-555-0203', contactPerson: 'Mike Ross',   address: '5 Commerce St',      type: 'Both' },
  { id: 5, name: 'Blue Horizon Traders',email: 'contact@bluehorizon.com', phone: '+1-555-0301', contactPerson: 'Anita Rao', address: '22 Harbor Rd',     type: 'Customer' },
  { id: 6, name: 'Nimbus Components',   email: 'info@nimbuscomp.com',   phone: '+1-555-0410', contactPerson: 'David Kim',   address: '9 Industrial Park',  type: 'Vendor' },
]

let nextId = initialCustomers.length + 1
export function getNextId() {
  return nextId++
}