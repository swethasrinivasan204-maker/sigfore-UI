// src/mock/db.js


export function getNextId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

export function appendEvent(collection, docId, eventFields) {
  const doc = collection.find(d => d.id === docId)
  if (!doc) return
  if (!doc.statusEvents) doc.statusEvents = []
  doc.statusEvents.push({
    id:         getNextId('evt'),
    date:       new Date().toISOString(),
    note:       '',
    ...eventFields,
  })
}

const contacts = [
  { id: 'v1', name: 'Acme Corp',         email: 'orders@acme.com',    phone: '+1-555-0101', contactPerson: 'Jane Smith',   address: '123 Main St',        type: 'Vendor' },
  { id: 'v2', name: 'GlobalSupply Ltd',  email: 'supply@global.com',  phone: '+1-555-0102', contactPerson: 'Bob Lee',      address: '456 Trade Ave',      type: 'Vendor' },
  { id: 'v3', name: 'TechParts Inc',     email: 'sales@techparts.com',phone: '+1-555-0103', contactPerson: 'Carol White',  address: '789 Tech Blvd',      type: 'Vendor' },
  { id: 'bp1', name: 'Brightworks Manufacturing', email: 'po@brightworks.com', phone: '+1-555-0201', contactPerson: 'Alex Turner', address: '10 Factory Rd', type: 'Customer' },
  { id: 'bp2', name: 'NovaTech Solutions',        email: 'orders@novatech.io',  phone: '+1-555-0202', contactPerson: 'Sara Patel',  address: '22 Innovation Dr', type: 'Customer' },
  { id: 'bp3', name: 'Crestline Retail',          email: 'buying@crestline.com',phone: '+1-555-0203', contactPerson: 'Mike Ross',   address: '5 Commerce St',    type: 'Both' },
]

// ─── Catalog ─────────────────────────────────────────────────────────────────

const catalog = [
  
  { id: 'c1',  sku: 'SKU-001', name: 'Steel Bolts M8',       category: 'Hardware',     unitPrice: 0.45,  itemType: 'raw_material', uom: 'pcs',  minStockLevel: 500 },
  { id: 'c2',  sku: 'SKU-002', name: 'Aluminum Sheet 2mm',   category: 'Raw Material', unitPrice: 12.50, itemType: 'raw_material', uom: 'sheet',minStockLevel: 20 },
  { id: 'c3',  sku: 'SKU-003', name: 'Circuit Board Rev2',   category: 'Electronics',  unitPrice: 34.00, itemType: 'raw_material', uom: 'pcs',  minStockLevel: 10 },
  { id: 'c4',  sku: 'SKU-004', name: 'Rubber Gasket 50mm',   category: 'Hardware',     unitPrice: 1.20,  itemType: 'raw_material', uom: 'pcs',  minStockLevel: 50 },
  { id: 'c5',  sku: 'SKU-005', name: 'Copper Wire 1m',       category: 'Electronics',  unitPrice: 3.75,  itemType: 'raw_material', uom: 'mtr',  minStockLevel: 50 },
  { id: 'c6',  sku: 'SKU-006', name: 'Plastic Housing A4',   category: 'Packaging',    unitPrice: 8.00,  itemType: 'raw_material', uom: 'pcs',  minStockLevel: 30 },
  { id: 'c7',  sku: 'SKU-007', name: 'LED Strip 5V',         category: 'Electronics',  unitPrice: 15.90, itemType: 'raw_material', uom: 'mtr',  minStockLevel: 10 },
  { id: 'c8',  sku: 'SKU-008', name: 'Steel Rod 10mm',       category: 'Raw Material', unitPrice: 6.30,  itemType: 'raw_material', uom: 'mtr',  minStockLevel: 15 },
  { id: 'c9',  sku: 'SKU-009', name: 'Thermal Paste 5g',     category: 'Electronics',  unitPrice: 4.50,  itemType: 'raw_material', uom: 'pcs',  minStockLevel: 20 },
  { id: 'c10', sku: 'SKU-010', name: 'Nylon Washer M6',      category: 'Hardware',     unitPrice: 0.15,  itemType: 'raw_material', uom: 'pcs',  minStockLevel: 200 },
  { id: 'c11', sku: 'SKU-011', name: 'Servo Motor 12V',      category: 'Electronics',  unitPrice: 22.00, itemType: 'raw_material', uom: 'pcs',  minStockLevel: 5 },
  { id: 'c12', sku: 'SKU-012', name: 'Bubble Wrap Roll',     category: 'Packaging',    unitPrice: 18.00, itemType: 'raw_material', uom: 'roll', minStockLevel: 5 },
  { id: 'c13', sku: 'SKU-013', name: 'Stainless Pipe 1in',   category: 'Raw Material', unitPrice: 9.80,  itemType: 'raw_material', uom: 'mtr',  minStockLevel: 10 },
  { id: 'c14', sku: 'SKU-014', name: 'Heat Shrink Tube',     category: 'Electronics',  unitPrice: 2.10,  itemType: 'raw_material', uom: 'mtr',  minStockLevel: 30 },
  { id: 'c15', sku: 'SKU-015', name: 'Acrylic Panel 3mm',    category: 'Raw Material', unitPrice: 14.00, itemType: 'raw_material', uom: 'sheet',minStockLevel: 10 },
  { id: 'c16', sku: 'SKU-016', name: 'Machine Screw M4',     category: 'Hardware',     unitPrice: 0.30,  itemType: 'raw_material', uom: 'pcs',  minStockLevel: 300 },
  { id: 'c17', sku: 'SKU-017', name: 'Power Supply 24V',     category: 'Electronics',  unitPrice: 45.00, itemType: 'raw_material', uom: 'pcs',  minStockLevel: 3 },
  { id: 'c18', sku: 'SKU-018', name: 'Corrugated Box L',     category: 'Packaging',    unitPrice: 3.20,  itemType: 'raw_material', uom: 'pcs',  minStockLevel: 50 },
  { id: 'c19', sku: 'SKU-019', name: 'Bearing 6205',         category: 'Hardware',     unitPrice: 7.60,  itemType: 'raw_material', uom: 'pcs',  minStockLevel: 10 },
  { id: 'c20', sku: 'SKU-020', name: 'Silicone Sealant',     category: 'Hardware',     unitPrice: 5.40,  itemType: 'raw_material', uom: 'tube', minStockLevel: 10 },

  // Finished goods 
  { id: 'c21', sku: 'FG-001', name: 'LED Panel Light 24W',        category: 'Lighting',    unitPrice: 145.00, itemType: 'finished_good', uom: 'pcs', minStockLevel: 10 },
  { id: 'c22', sku: 'FG-002', name: 'Industrial Control Box',     category: 'Enclosures',  unitPrice: 280.00, itemType: 'finished_good', uom: 'pcs', minStockLevel: 5 },
  { id: 'c23', sku: 'FG-003', name: 'Servo Drive Assembly 12V',   category: 'Drives',      unitPrice: 320.00, itemType: 'finished_good', uom: 'pcs', minStockLevel: 5 },
  { id: 'c24', sku: 'FG-004', name: 'Precision Bracket Weldment', category: 'Fabrication', unitPrice: 95.00,  itemType: 'finished_good', uom: 'pcs', minStockLevel: 8 },
  { id: 'c25', sku: 'FG-005', name: 'Power Distribution Unit',    category: 'Electrical',  unitPrice: 410.00, itemType: 'finished_good', uom: 'pcs', minStockLevel: 3 },
]

const rfqs = [
  // Draft 
  { id: 'r1',  rfqNumber: 'RFQ-0001', rfqGroupId: 'rg1',  vendorId: null, status: 'Draft',     requiredDate: '2026-07-10', notes: 'Urgent requirement for production line', lineItems: [{ catalogId: 'c1', qty: 500 }, { catalogId: 'c4', qty: 100 }], createdAt: '2026-06-01', statusEvents: [], vendorInvitations: [] },

  // Sent 
  { id: 'r2',  rfqNumber: 'RFQ-0002', rfqGroupId: 'rg2',  vendorId: null, status: 'Sent',      requiredDate: '2026-07-15', notes: '', lineItems: [{ catalogId: 'c2', qty: 20 }, { catalogId: 'c8', qty: 15 }], createdAt: '2026-06-03', statusEvents: [], vendorInvitations: [
    { id: 'vi2a', vendorId: 'v1', status: 'Pending',  validUntil: null, notes: '', quotedAt: null, awardedAt: null, quoteLines: [] },
    { id: 'vi2b', vendorId: 'v2', status: 'Pending',  validUntil: null, notes: '', quotedAt: null, awardedAt: null, quoteLines: [] },
    { id: 'vi2c', vendorId: 'v3', status: 'Pending',  validUntil: null, notes: '', quotedAt: null, awardedAt: null, quoteLines: [] },
  ]},

  // Quoted by 2 vendors 
  { id: 'r3',  rfqNumber: 'RFQ-0003', rfqGroupId: 'rg3',  vendorId: null, status: 'Quoted',    requiredDate: '2026-07-05', notes: 'Check compatibility with Rev1', lineItems: [{ catalogId: 'c3', qty: 10 }, { catalogId: 'c5', qty: 50 }], createdAt: '2026-06-05', statusEvents: [], vendorInvitations: [
    { id: 'vi3a', vendorId: 'v1', status: 'Quoted', validUntil: '2026-08-05', notes: 'Fast delivery from local stock', quotedAt: '2026-06-08T10:00:00Z', awardedAt: null, quoteLines: [
      { id: 'vql3a1', catalogId: 'c3', qty: 10, unitPrice: 32.50, leadDays: 5 },
      { id: 'vql3a2', catalogId: 'c5', qty: 50, unitPrice: 3.60, leadDays: 3 },
    ]},
    { id: 'vi3b', vendorId: 'v2', status: 'Quoted', validUntil: '2026-07-30', notes: 'Bulk discount applied', quotedAt: '2026-06-09T14:00:00Z', awardedAt: null, quoteLines: [
      { id: 'vql3b1', catalogId: 'c3', qty: 10, unitPrice: 31.00, leadDays: 8 },
      { id: 'vql3b2', catalogId: 'c5', qty: 50, unitPrice: 3.40, leadDays: 7 },
    ]},
    { id: 'vi3c', vendorId: 'v3', status: 'Pending', validUntil: null, notes: '', quotedAt: null, awardedAt: null, quoteLines: [] },
  ]},

  // Converted — awarded to v1, single invite for historical record
  { id: 'r4',  rfqNumber: 'RFQ-0004', rfqGroupId: 'rg4',  vendorId: 'v1', status: 'Converted', requiredDate: '2026-06-30', notes: '', lineItems: [{ catalogId: 'c7', qty: 5 }, { catalogId: 'c11', qty: 3 }], createdAt: '2026-06-07', statusEvents: [], vendorInvitations: [
    { id: 'vi4a', vendorId: 'v1', status: 'Awarded', validUntil: '2026-07-07', notes: '', quotedAt: '2026-06-10T09:00:00Z', awardedAt: '2026-06-11T09:00:00Z', quoteLines: [
      { id: 'vql4a1', catalogId: 'c7', qty: 5, unitPrice: 15.90, leadDays: 4 },
      { id: 'vql4a2', catalogId: 'c11', qty: 3, unitPrice: 22.00, leadDays: 6 },
    ]},
  ]},

  // Draft
  { id: 'r5',  rfqNumber: 'RFQ-0005', rfqGroupId: 'rg5',  vendorId: null, status: 'Draft',     requiredDate: '2026-07-20', notes: 'Annual packaging order', lineItems: [{ catalogId: 'c6', qty: 200 }, { catalogId: 'c12', qty: 10 }], createdAt: '2026-06-08', statusEvents: [], vendorInvitations: [] },

  // Sent to 2 vendors — both pending
  { id: 'r6',  rfqNumber: 'RFQ-0006', rfqGroupId: 'rg6',  vendorId: null, status: 'Sent',      requiredDate: '2026-07-12', notes: '', lineItems: [{ catalogId: 'c9', qty: 30 }, { catalogId: 'c14', qty: 100 }], createdAt: '2026-06-09', statusEvents: [], vendorInvitations: [
    { id: 'vi6a', vendorId: 'v2', status: 'Pending', validUntil: null, notes: '', quotedAt: null, awardedAt: null, quoteLines: [] },
    { id: 'vi6b', vendorId: 'v3', status: 'Pending', validUntil: null, notes: '', quotedAt: null, awardedAt: null, quoteLines: [] },
  ]},

  // Quoted — all 3 vendors quoted; buyer has awarded v1
  { id: 'r7',  rfqNumber: 'RFQ-0007', rfqGroupId: 'rg7',  vendorId: 'v1', status: 'Quoted',    requiredDate: '2026-07-08', notes: 'Replace last batch', lineItems: [{ catalogId: 'c16', qty: 1000 }, { catalogId: 'c10', qty: 500 }], createdAt: '2026-06-10', statusEvents: [], vendorInvitations: [
    { id: 'vi7a', vendorId: 'v1', status: 'Awarded',     validUntil: '2026-08-08', notes: 'Competitive price, preferred vendor', quotedAt: '2026-06-13T08:00:00Z', awardedAt: '2026-06-14T10:00:00Z', quoteLines: [
      { id: 'vql7a1', catalogId: 'c16', qty: 1000, unitPrice: 0.28, leadDays: 7 },
      { id: 'vql7a2', catalogId: 'c10', qty: 500, unitPrice: 0.14, leadDays: 7 },
    ]},
    { id: 'vi7b', vendorId: 'v2', status: 'Not Awarded', validUntil: '2026-07-28', notes: '', quotedAt: '2026-06-12T11:00:00Z', awardedAt: null, quoteLines: [
      { id: 'vql7b1', catalogId: 'c16', qty: 1000, unitPrice: 0.30, leadDays: 10 },
      { id: 'vql7b2', catalogId: 'c10', qty: 500, unitPrice: 0.16, leadDays: 10 },
    ]},
    { id: 'vi7c', vendorId: 'v3', status: 'Not Awarded', validUntil: '2026-07-20', notes: '', quotedAt: '2026-06-14T09:00:00Z', awardedAt: null, quoteLines: [
      { id: 'vql7c1', catalogId: 'c16', qty: 1000, unitPrice: 0.32, leadDays: 14 },
      { id: 'vql7c2', catalogId: 'c10', qty: 500, unitPrice: 0.15, leadDays: 12 },
    ]},
  ]},

  // Converted
  { id: 'r8',  rfqNumber: 'RFQ-0008', rfqGroupId: 'rg8',  vendorId: 'v2', status: 'Converted', requiredDate: '2026-06-25', notes: '', lineItems: [{ catalogId: 'c17', qty: 2 }, { catalogId: 'c3', qty: 5 }], createdAt: '2026-06-11', statusEvents: [], vendorInvitations: [
    { id: 'vi8a', vendorId: 'v2', status: 'Awarded', validUntil: '2026-07-25', notes: '', quotedAt: '2026-06-14T10:00:00Z', awardedAt: '2026-06-15T10:00:00Z', quoteLines: [
      { id: 'vql8a1', catalogId: 'c17', qty: 2, unitPrice: 44.00, leadDays: 5 },
      { id: 'vql8a2', catalogId: 'c3',  qty: 5, unitPrice: 33.50, leadDays: 4 },
    ]},
  ]},

  // Draft
  { id: 'r9',  rfqNumber: 'RFQ-0009', rfqGroupId: 'rg9',  vendorId: null, status: 'Draft',     requiredDate: '2026-07-25', notes: 'New project materials', lineItems: [{ catalogId: 'c13', qty: 8 }, { catalogId: 'c15', qty: 6 }], createdAt: '2026-06-12', statusEvents: [], vendorInvitations: [] },

  // Sent to 2 vendors — both pending
  { id: 'r10', rfqNumber: 'RFQ-0010', rfqGroupId: 'rg10', vendorId: null, status: 'Sent',      requiredDate: '2026-07-18', notes: '', lineItems: [{ catalogId: 'c19', qty: 12 }, { catalogId: 'c20', qty: 20 }], createdAt: '2026-06-14', statusEvents: [], vendorInvitations: [
    { id: 'vi10a', vendorId: 'v1', status: 'Pending', validUntil: null, notes: '', quotedAt: null, awardedAt: null, quoteLines: [] },
    { id: 'vi10b', vendorId: 'v3', status: 'Pending', validUntil: null, notes: '', quotedAt: null, awardedAt: null, quoteLines: [] },
  ]},
]

export const mockDb = {
  contacts, catalog, rfqs,
}

let rfqCounter = 11
export function getNextRfqNumber() {
  return `RFQ-${String(rfqCounter++).padStart(4, '0')}`
}


Object.defineProperty(mockDb, 'vendors', {
  get() { return this.contacts.filter(c => c.type === 'Vendor' || c.type === 'Both') },
})
