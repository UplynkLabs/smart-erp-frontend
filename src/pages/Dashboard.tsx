import { useEffect, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Boxes, CircleDollarSign, FileWarning, ShoppingCart, Truck } from 'lucide-react';
import { apiRequest, getPage } from '../services/api';
import { money } from './ResourcePage';

type Summary = { totalActiveItems: number; lowStockItemCount: number; totalStockValue: number };
type Procurement = { openPurchaseOrders: number; partiallyReceivedPurchaseOrders: number; totalOutstandingPayable: number };
type Expenses = { totalDraft: number; totalApproved: number; totalPaid: number; byCategory: { categoryId: string; categoryName: string; totalPaid: number }[] };
type Order = { orderId: string; orderNumber: string; status: string; total: number; createdAt: string };

export default function Dashboard() {
  const [inventory, setInventory] = useState<Summary | null>(null);
  const [procurement, setProcurement] = useState<Procurement | null>(null);
  const [expenses, setExpenses] = useState<Expenses | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [lowStock, setLowStock] = useState<{ inventoryItemId: string; name: string; currentStock: number; unit: string }[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    void Promise.allSettled([
      apiRequest<Summary>('/api/v1/reports/inventory'),
      apiRequest<Procurement>('/api/v1/reports/procurement'),
      apiRequest<Expenses>('/api/v1/reports/expenses'),
      getPage<Order>('/api/v1/pos/orders'),
      apiRequest<{ inventoryItemId: string; name: string; currentStock: number; unit: string }[]>('/api/v1/inventory/items/low-stock'),
    ]).then((results) => {
      if (!active) return;
      if (results[0].status === 'fulfilled') setInventory(results[0].value);
      if (results[1].status === 'fulfilled') setProcurement(results[1].value);
      if (results[2].status === 'fulfilled') setExpenses(results[2].value);
      if (results[3].status === 'fulfilled') setOrders(results[3].value.data.slice(0, 5));
      if (results[4].status === 'fulfilled') setLowStock(results[4].value.slice(0, 5));
      const failed = results.filter((result) => result.status === 'rejected');
      if (failed.length === results.length) setError('Could not load dashboard data. Check the API connection and your branch access.');
    });
    return () => { active = false; };
  }, []);

  const metrics = [
    { label: 'Recent orders', value: orders.length.toString(), detail: 'Latest orders for this branch', icon: ShoppingCart, tone: 'violet' },
    { label: 'Stock value', value: inventory ? money(inventory.totalStockValue) : '—', detail: `${inventory?.totalActiveItems ?? '—'} active stock items`, icon: Boxes, tone: 'blue' },
    { label: 'Low stock alerts', value: inventory?.lowStockItemCount.toString() ?? '—', detail: 'Items below reorder level', icon: FileWarning, tone: 'amber' },
    { label: 'Supplier payable', value: procurement ? money(procurement.totalOutstandingPayable) : '—', detail: `${procurement?.openPurchaseOrders ?? '—'} open purchase orders`, icon: Truck, tone: 'green' },
  ];

  return <main className="module-page dashboard-page">
    <div className="module-heading"><div><div className="eyebrow">OVERVIEW · LIVE ORGANIZATION DATA</div><h1>Good to see you</h1><p>Your operational and finance snapshot.</p></div><div className="dashboard-today">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</div></div>
    {error && <div className="module-alert error" role="alert">{error}</div>}
    <section className="metric-grid">{metrics.map(({ label, value, detail, icon: Icon, tone }) => <article className="metric-card" key={label}><div className={`metric-icon ${tone}`}><Icon size={18}/></div><div className="metric-label">{label}</div><div className="metric-value">{value}</div><div className="metric-detail">{detail}</div></article>)}</section>
    <section className="dashboard-grid">
      <article className="module-card"><div className="module-card-head"><div><strong>Recent orders</strong><span className="dashboard-card-caption">POS activity from your current branch</span></div><span className="dashboard-inline-icon"><CircleDollarSign size={18}/></span></div>
        {orders.length ? <div className="dashboard-list">{orders.map((order) => <div className="dashboard-row" key={order.orderId}><div className="dashboard-order-mark">{order.orderNumber.slice(-2)}</div><div className="dashboard-list-main"><strong>{order.orderNumber}</strong><span>{new Date(order.createdAt).toLocaleString()}</span></div><span className={`module-badge ${order.status.toLowerCase()}`}>{order.status}</span><b>{money(order.total)}</b></div>)}</div> : <div className="module-empty">Order activity will appear here.</div>}
      </article>
      <article className="module-card"><div className="module-card-head"><div><strong>Low stock</strong><span className="dashboard-card-caption">Review items that need attention</span></div><span className="dashboard-inline-icon amber"><FileWarning size={18}/></span></div>
        {lowStock.length ? <div className="dashboard-list">{lowStock.map((item) => <div className="dashboard-row" key={item.inventoryItemId}><div className="dashboard-stock-dot"/><div className="dashboard-list-main"><strong>{item.name}</strong><span>Current stock</span></div><b className="dashboard-low-qty">{item.currentStock} {item.unit}</b></div>)}</div> : <div className="module-empty">No low stock items found.</div>}
      </article>
    </section>
    <section className="dashboard-grid dashboard-bottom-grid">
      <article className="module-card"><div className="module-card-head"><div><strong>Expense overview</strong><span className="dashboard-card-caption">Organization wide</span></div><span className="dashboard-inline-icon green"><ArrowDownRight size={18}/></span></div><div className="expense-overview"><div><span>Draft</span><strong>{money(expenses?.totalDraft)}</strong></div><div><span>Approved</span><strong>{money(expenses?.totalApproved)}</strong></div><div><span>Paid</span><strong>{money(expenses?.totalPaid)}</strong></div></div></article>
      <article className="module-card"><div className="module-card-head"><div><strong>Purchase pipeline</strong><span className="dashboard-card-caption">Purchase orders awaiting action</span></div><span className="dashboard-inline-icon blue"><ArrowUpRight size={18}/></span></div><div className="expense-overview"><div><span>Open orders</span><strong>{procurement?.openPurchaseOrders ?? '—'}</strong></div><div><span>Partially received</span><strong>{procurement?.partiallyReceivedPurchaseOrders ?? '—'}</strong></div></div></article>
    </section>
  </main>;
}
