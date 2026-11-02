import { date, money, type ResourceConfig } from './ResourcePage';

export const inventoryModule: ResourceConfig = {
  title: 'Inventory', subtitle: 'Track on-hand stock, reorder levels, and inventory value.', endpoint: '/api/v1/inventory/items', paged: true, search: true,
  columns: [
    { key: 'name', label: 'Item' }, { key: 'currentStock', label: 'On hand', format: (value, row) => `${value ?? 0} ${row.unit ?? ''}` },
    { key: 'reorderLevel', label: 'Reorder at' }, { key: 'averageCost', label: 'Average cost', format: money },
    { key: 'isLowStock', label: 'Stock health', format: (value) => value ? 'Reorder needed' : 'Healthy' },
  ],
  fields: [
    { key: 'name', label: 'Item name', required: true }, { key: 'warehouseId', label: 'Warehouse', required: true, load: '/api/v1/inventory/warehouses' },
    { key: 'unit', label: 'Unit of measure', required: true }, { key: 'reorderLevel', label: 'Reorder level', type: 'number', required: true },
  ],
};

export const customersModule: ResourceConfig = {
  title: 'Customers', subtitle: 'Maintain customer contacts, account status, and credit balances.', endpoint: '/api/v1/customers', paged: true, search: true,
  columns: [
    { key: 'fullName', label: 'Customer' }, { key: 'phone', label: 'Phone' }, { key: 'email', label: 'Email' },
    { key: 'status', label: 'Status' }, { key: 'creditLimit', label: 'Credit limit', format: money }, { key: 'outstandingBalance', label: 'Outstanding', format: money },
  ],
  fields: [
    { key: 'fullName', label: 'Full name', required: true }, { key: 'phone', label: 'Phone' }, { key: 'email', label: 'Email', type: 'email' },
    { key: 'address', label: 'Address', type: 'textarea' }, { key: 'creditLimit', label: 'Credit limit (PKR)', type: 'number', required: true },
  ],
};

export const suppliersModule: ResourceConfig = {
  title: 'Suppliers', subtitle: 'Manage supplier contacts and outstanding balances.', endpoint: '/api/v1/suppliers', paged: true, search: true,
  columns: [
    { key: 'name', label: 'Supplier' }, { key: 'contactPhone', label: 'Phone' }, { key: 'contactEmail', label: 'Email' },
    { key: 'isActive', label: 'Status', format: (value) => value ? 'Active' : 'Inactive' }, { key: 'outstandingPayable', label: 'Outstanding payable', format: money },
  ],
  fields: [{ key: 'name', label: 'Supplier name', required: true }, { key: 'contactPhone', label: 'Contact phone' }, { key: 'contactEmail', label: 'Contact email', type: 'email' }],
};

export const purchasesModule: ResourceConfig = {
  title: 'Purchases', subtitle: 'Review purchase orders and approve orders ready for purchasing.', endpoint: '/api/v1/procurement/purchase-orders', paged: true,
  columns: [
    { key: 'poNumber', label: 'Purchase order' }, { key: 'supplierId', label: 'Supplier ID' }, { key: 'status', label: 'Status' },
    { key: 'totalAmount', label: 'Order total', format: money }, { key: 'approvedAt', label: 'Approved', format: date },
  ],
  fields: [
    { key: 'supplierId', label: 'Supplier', required: true, load: '/api/v1/suppliers', paged: true },
    { key: 'inventoryItemId', label: 'Inventory item', required: true, load: '/api/v1/inventory/items', paged: true, optionValue: 'inventoryItemId', optionLabel: 'name' },
    { key: 'quantity', label: 'Quantity', type: 'number', required: true }, { key: 'unitCost', label: 'Unit cost (PKR)', type: 'number', required: true },
  ],
  createPayload: (values) => ({ supplierId: values.supplierId, items: [{ inventoryItemId: values.inventoryItemId, quantity: Number(values.quantity), unitCost: Number(values.unitCost) }] }),
  actions: [
    { label: 'Approve', whenStatus: 'Draft', endpoint: (row) => `/api/v1/procurement/purchase-orders/${row.purchaseOrderId}/approve`, tone: 'primary' },
    { label: 'Approve', whenStatus: 'PendingApproval', endpoint: (row) => `/api/v1/procurement/purchase-orders/${row.purchaseOrderId}/approve`, tone: 'primary' },
    { label: 'Receive balance', endpoint: (row) => `/api/v1/procurement/purchase-orders/${row.purchaseOrderId}/goods-receipts`, whenStatus: 'Approved', tone: 'quiet', body: (row) => ({ items: (row.items as { purchaseOrderItemId: string; quantityOutstanding: number }[]).filter((item) => item.quantityOutstanding > 0).map((item) => ({ purchaseOrderItemId: item.purchaseOrderItemId, quantityReceived: item.quantityOutstanding })) }) },
    { label: 'Receive balance', endpoint: (row) => `/api/v1/procurement/purchase-orders/${row.purchaseOrderId}/goods-receipts`, whenStatus: 'PartiallyReceived', body: (row) => ({ items: (row.items as { purchaseOrderItemId: string; quantityOutstanding: number }[]).filter((item) => item.quantityOutstanding > 0).map((item) => ({ purchaseOrderItemId: item.purchaseOrderItemId, quantityReceived: item.quantityOutstanding })) }) },
  ],
};

export const payablesModule: ResourceConfig = {
  title: 'Payables', subtitle: 'Track supplier balances and record payments against outstanding payables.', endpoint: '/api/v1/procurement/payables', paged: true,
  columns: [
    { key: 'payableId', label: 'Payable reference', format: (value) => String(value).slice(0, 8).toUpperCase() }, { key: 'amount', label: 'Original amount', format: money },
    { key: 'amountPaid', label: 'Paid', format: money }, { key: 'amountOutstanding', label: 'Outstanding', format: money }, { key: 'status', label: 'Status' },
  ],
  actions: [{ label: 'Pay outstanding', whenStatus: 'Outstanding', endpoint: (row) => `/api/v1/procurement/payables/${row.payableId}/payments`, body: (row) => ({ amount: row.amountOutstanding, method: 0 }), tone: 'primary' },
    { label: 'Pay remaining', whenStatus: 'PartiallyPaid', endpoint: (row) => `/api/v1/procurement/payables/${row.payableId}/payments`, body: (row) => ({ amount: row.amountOutstanding, method: 0 }), tone: 'quiet' }],
};

export const expensesModule: ResourceConfig = {
  title: 'Expenses', subtitle: 'Record, approve, and pay branch expenses with an audit trail.', endpoint: '/api/v1/expenses', paged: true,
  columns: [
    { key: 'expenseNumber', label: 'Expense' }, { key: 'description', label: 'Description' }, { key: 'expenseDate', label: 'Date', format: date },
    { key: 'amount', label: 'Amount', format: money }, { key: 'status', label: 'Status' }, { key: 'paymentMethod', label: 'Payment method' },
  ],
  fields: [
    { key: 'categoryId', label: 'Category', required: true, load: '/api/v1/expenses/categories' }, { key: 'description', label: 'Description', required: true },
    { key: 'amount', label: 'Amount (PKR)', type: 'number', required: true }, { key: 'expenseDate', label: 'Expense date', type: 'date', required: true },
  ],
  actions: [
    { label: 'Approve', whenStatus: 'Draft', endpoint: (row) => `/api/v1/expenses/${row.expenseId}/approve`, tone: 'primary' },
    { label: 'Pay by cash', whenStatus: 'Approved', endpoint: (row) => `/api/v1/expenses/${row.expenseId}/pay`, body: { paymentMethod: 0 }, tone: 'primary' },
  ],
};

export const accountingModule: ResourceConfig = {
  title: 'Accounting', subtitle: 'Review balanced double-entry transactions generated by POS, expenses, and supplier payments.', endpoint: '/api/v1/accounting/transactions', paged: true,
  columns: [
    { key: 'transactionType', label: 'Type' }, { key: 'description', label: 'Description' }, { key: 'occurredAt', label: 'Date', format: date },
    { key: 'totalDebit', label: 'Debit', format: money }, { key: 'totalCredit', label: 'Credit', format: money },
    { key: 'isBalanced', label: 'Balanced', format: (value) => value ? 'Yes' : 'Review' },
  ],
};

export const auditModule: ResourceConfig = {
  title: 'Audit logs', subtitle: 'Inspect recorded organization activities and system changes.', endpoint: '/api/v1/audit/logs', paged: true,
  columns: [
    { key: 'occurredAt', label: 'Time', format: (value) => value ? new Date(String(value)).toLocaleString() : '—' }, { key: 'action', label: 'Activity' },
    { key: 'entityType', label: 'Record type' }, { key: 'entityId', label: 'Record ID', format: (value) => value ? String(value).slice(0, 8).toUpperCase() : '—' },
    { key: 'userId', label: 'User ID', format: (value) => value ? String(value).slice(0, 8).toUpperCase() : 'System' },
  ],
};
