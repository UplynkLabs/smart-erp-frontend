import { useEffect, useState } from 'react';
import { ArrowDownToLine, Boxes, ReceiptText, Truck } from 'lucide-react';
import { apiRequest } from '../services/api';
import { money } from './ResourcePage';

type Data = { inventory: { totalActiveItems: number; lowStockItemCount: number; totalStockValue: number }; procurement: { openPurchaseOrders: number; partiallyReceivedPurchaseOrders: number; totalOutstandingPayable: number }; expenses: { totalDraft: number; totalApproved: number; totalPaid: number; byCategory: { categoryId: string; categoryName: string; totalPaid: number }[] } };

export default function Reports() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { void Promise.all([
    apiRequest<Data['inventory']>('/api/v1/reports/inventory'),
    apiRequest<Data['procurement']>('/api/v1/reports/procurement'),
    apiRequest<Data['expenses']>('/api/v1/reports/expenses'),
  ]).then(([inventory, procurement, expenses]) => setData({ inventory, procurement, expenses })).catch((e: unknown) => setError(e instanceof Error ? e.message : 'Could not load reports.')); }, []);

  const exportCsv = () => {
    if (!data) return;
    const rows = [['Report', 'Metric', 'Value'],
      ['Inventory', 'Active items', String(data.inventory.totalActiveItems)], ['Inventory', 'Low stock items', String(data.inventory.lowStockItemCount)], ['Inventory', 'Stock value (PKR)', String(data.inventory.totalStockValue)],
      ['Procurement', 'Open orders', String(data.procurement.openPurchaseOrders)], ['Procurement', 'Partially received orders', String(data.procurement.partiallyReceivedPurchaseOrders)], ['Procurement', 'Outstanding payable (PKR)', String(data.procurement.totalOutstandingPayable)],
      ['Expenses', 'Draft (PKR)', String(data.expenses.totalDraft)], ['Expenses', 'Approved (PKR)', String(data.expenses.totalApproved)], ['Expenses', 'Paid (PKR)', String(data.expenses.totalPaid)],
      ...data.expenses.byCategory.map((item) => ['Expenses by category', item.categoryName, String(item.totalPaid)]),
    ];
    const csv = rows.map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(',')).join('\r\n');
    const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); link.download = 'uplynk-branch-report.csv'; link.click(); URL.revokeObjectURL(link.href);
  };

  return <main className="module-page"><div className="module-heading"><div><div className="eyebrow">ANALYTICS · ORGANIZATION OVERVIEW</div><h1>Reports</h1><p>Operational summaries from inventory, procurement, and expenses.</p></div><button className="module-button primary" onClick={exportCsv} disabled={!data}><ArrowDownToLine size={16}/>Export CSV</button></div>
    {error && <div className="module-alert error" role="alert">{error}</div>}
    {!data ? <div className="module-card module-empty">Loading report data…</div> : <>
      <section className="report-summary-grid">
        {[{ title: 'Inventory', icon: Boxes, rows: [['Active items', data.inventory.totalActiveItems], ['Low stock alerts', data.inventory.lowStockItemCount], ['Inventory value', money(data.inventory.totalStockValue)]] },
          { title: 'Procurement', icon: Truck, rows: [['Open purchase orders', data.procurement.openPurchaseOrders], ['Partially received', data.procurement.partiallyReceivedPurchaseOrders], ['Outstanding payables', money(data.procurement.totalOutstandingPayable)]] },
          { title: 'Expenses', icon: ReceiptText, rows: [['Draft', money(data.expenses.totalDraft)], ['Approved', money(data.expenses.totalApproved)], ['Paid', money(data.expenses.totalPaid)]] },
        ].map(({ title, icon: Icon, rows }) => <article className="module-card report-summary-card" key={title}><div className="report-summary-title"><span className="dashboard-inline-icon"><Icon size={18}/></span><strong>{title}</strong></div>{rows.map(([label, value]) => <div className="report-summary-row" key={label}><span>{label}</span><b>{value}</b></div>)}</article>)}
      </section>
      <section className="module-card report-category-card"><div className="module-card-head"><div><strong>Paid expenses by category</strong><span className="dashboard-card-caption">Expenses posted to accounts by category</span></div></div>{data.expenses.byCategory.length ? <div className="module-table-wrap"><table className="module-table"><thead><tr><th>Category</th><th>Total paid</th></tr></thead><tbody>{data.expenses.byCategory.map((row) => <tr key={row.categoryId}><td>{row.categoryName}</td><td>{money(row.totalPaid)}</td></tr>)}</tbody></table></div> : <div className="module-empty">Paid expense breakdown will appear here.</div>}</section>
    </>}
  </main>;
}
