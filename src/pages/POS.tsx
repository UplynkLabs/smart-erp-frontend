import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { apiRequest, createRecord, getList, getSession } from '../services/api';

type Product = { menuItemId: string; name: string; price: number; categoryName: string; taxRate?: number | null };
type CartItem = Product & { qty: number };
type Shift = { id: string; status: string; openingFloat: number };
type Order = { orderId: string; orderNumber: string; total: number; amountDue: number };
type Payment = { invoiceNumber?: string; changeDue?: number | null; orderStatus: string };
const money = (value: number) => `PKR ${value.toLocaleString('en-PK', { maximumFractionDigits: 2 })}`;
const ORDER_TYPES = [{ label: 'Dine in', value: 0 }, { label: 'Takeaway', value: 1 }, { label: 'Delivery', value: 2 }];

export default function POS() {
  const [menu, setMenu] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState('All items');
  const [orderType, setOrderType] = useState(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [shift, setShift] = useState<Shift | null>(null);
  const [shiftLoading, setShiftLoading] = useState(true);
  const [openingFloat, setOpeningFloat] = useState('0');
  const [closingCash, setClosingCash] = useState('0');
  const [showCloseShift, setShowCloseShift] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);
  const canCloseShift = getSession()?.permissions.includes('pos.shift.close') ?? false;

  const loadShift = async () => {
    setShiftLoading(true);
    try { setShift(await apiRequest<Shift>('/api/v1/pos/shifts/current')); }
    catch { setShift(null); }
    finally { setShiftLoading(false); }
  };

  useEffect(() => {
    let active = true;
    void getList<Product>('/api/v1/menu/items').then((items) => { if (active) setMenu(items); }).catch((e: unknown) => { if (active) setError(e instanceof Error ? e.message : 'Could not load the menu.'); });
    void loadShift();
    return () => { active = false; };
  }, []);

  const categories = useMemo(() => ['All items', ...new Set(menu.map((item) => item.categoryName))], [menu]);
  const filteredMenu = activeCategory === 'All items' ? menu : menu.filter((item) => item.categoryName === activeCategory);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const estimatedTax = Math.round(subtotal * 0.16 * 100) / 100;
  const estimatedTotal = subtotal + estimatedTax;

  const addToCart = (product: Product) => {
    setError(''); setMessage(''); setInvoiceNumber('');
    setCart((previous) => {
      const existing = previous.find((item) => item.menuItemId === product.menuItemId);
      return existing ? previous.map((item) => item.menuItemId === product.menuItemId ? { ...item, qty: item.qty + 1 } : item) : [...previous, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => setCart((previous) => previous.map((item) => item.menuItemId === id ? { ...item, qty: item.qty + delta } : item).filter((item) => item.qty > 0));

  const openShift = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setIsProcessing(true); setError('');
    try {
      const opened = await createRecord<Shift>('/api/v1/pos/shifts/open', { openingFloat: Number(openingFloat) });
      setShift(opened); setMessage('Your register shift is open.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not open the register shift.'); }
    finally { setIsProcessing(false); }
  };

  const closeShift = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!shift) return;
    setIsProcessing(true); setError(''); setMessage('');
    try {
      const closed = await apiRequest<{ expectedCash: number; cashVariance: number }>(`/api/v1/pos/shifts/${shift.id}/close`, { method: 'POST', body: JSON.stringify({ closingCashCounted: Number(closingCash) }) });
      setShift(null); setShowCloseShift(false);
      setMessage(`Shift closed. Expected ${money(closed.expectedCash)} · variance ${money(closed.cashVariance)}.`);
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not close this shift.'); }
    finally { setIsProcessing(false); }
  };

  const handleCharge = async () => {
    if (!cart.length || isProcessing) return;
    setError(''); setMessage(''); setInvoiceNumber('');
    if (!shift) { setError('Open a register shift before taking orders.'); return; }
    if (paymentMethod !== 'Cash') { setError('Card and online settlement are not configured yet. Choose cash to complete this sale.'); return; }
    setIsProcessing(true);
    try {
      const order = pendingOrder ?? await createRecord<Order>('/api/v1/pos/orders', {
        orderType, clientTransactionId: crypto.randomUUID(), items: cart.map((item) => ({ menuItemId: item.menuItemId, quantity: item.qty })),
      });
      if (!pendingOrder) setPendingOrder(order);
      const payment = await createRecord<Payment>(`/api/v1/pos/orders/${order.orderId}/payments`, { method: 0, amount: Number(order.amountDue || order.total), amountTendered: Number(order.amountDue || order.total), clientTransactionId: crypto.randomUUID() });
      setInvoiceNumber(payment.invoiceNumber ?? order.orderNumber);
      setMessage(`${order.orderNumber} paid. ${payment.changeDue ? `Change due ${money(payment.changeDue)}.` : ''}`);
      setCart([]); setPendingOrder(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not complete the sale.');
    } finally { setIsProcessing(false); }
  };

  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const visibleOrderTotal = pendingOrder?.total ?? estimatedTotal;

  return <div className="pos-layout">
    <div className="pos-menu">
      <div className="pos-heading"><div><h1>Point of Sale</h1><p>{shift ? 'Register shift open · Server priced checkout' : 'Open a register shift to start sales'}</p></div><div className="pos-heading-tools"><label className="order-type-select"><span>Order type</span><select value={orderType} onChange={(event) => setOrderType(Number(event.target.value))}>{ORDER_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select></label>{shift && <span className="pos-live-badge"><i/>Shift open</span>}{shift && canCloseShift && <button type="button" className="module-button quiet" onClick={() => setShowCloseShift((shown) => !shown)}>Close shift</button>}</div></div>
      {error && <div className="module-alert error" role="alert">{error}</div>}{message && <div className="module-alert success" role="status">{message}{invoiceNumber && <strong className="invoice-number"> Invoice · {invoiceNumber}</strong>}</div>}
      {!shiftLoading && !shift && <form className="shift-open-card" onSubmit={openShift}><div><strong>Open register shift</strong><span>Enter the cash float available at the beginning of this shift.</span></div><label>Opening float <span>PKR</span><input type="number" min="0" step="0.01" value={openingFloat} onChange={(event) => setOpeningFloat(event.target.value)} required/></label><button className="module-button primary" disabled={isProcessing}>{isProcessing ? 'Opening…' : 'Open shift'}</button></form>}
      {shift && showCloseShift && <form className="shift-open-card" onSubmit={closeShift}><div><strong>Close register shift</strong><span>Enter the cash counted in the drawer. Unsettled orders must be cleared first.</span></div><label>Cash counted <span>PKR</span><input type="number" min="0" step="0.01" value={closingCash} onChange={(event) => setClosingCash(event.target.value)} required/></label><button className="module-button primary" disabled={isProcessing}>{isProcessing ? 'Closing…' : 'Confirm close'}</button></form>}
      {shiftLoading ? <div className="module-empty">Checking register shift…</div> : <>
        <div className="pos-cats">{categories.map((category) => <button type="button" key={category} className={`cat-pill ${activeCategory === category ? 'active' : ''}`} onClick={() => setActiveCategory(category)}>{category}</button>)}</div>
        {filteredMenu.length ? <div className="menu-grid">{filteredMenu.map((item) => <button key={item.menuItemId} type="button" className="menu-item" onClick={() => addToCart(item)} disabled={!shift}><span className="menu-item-emoji">{item.categoryName === 'Drinks' ? '🥤' : item.categoryName === 'Mains' ? '🍽️' : '🍴'}</span><span className="menu-item-name">{item.name}</span><span className="menu-item-price">{money(item.price)}</span><span className="menu-item-category">{item.categoryName}</span></button>)}</div> : <div className="module-empty">{error ? 'Menu is unavailable until the API is connected.' : 'No available menu items were found.'}</div>}
      </>}
    </div>
    <aside className="pos-cart"><div className="cart-header">Current order <span>Walk-in · {ORDER_TYPES.find((type) => type.value === orderType)?.label}</span></div><div className="cart-items">{cart.length ? cart.map((item) => <div key={item.menuItemId} className="cart-item"><div className="cart-item-name">{item.name}<small>{money(item.price)} each</small></div><div className="cart-qty-ctrl"><button type="button" className="qty-btn" aria-label={`Remove one ${item.name}`} onClick={() => updateQty(item.menuItemId, -1)}>−</button><span className="qty-num">{item.qty}</span><button type="button" className="qty-btn" aria-label={`Add one ${item.name}`} onClick={() => updateQty(item.menuItemId, 1)}>+</button></div><div className="cart-item-price">{money(item.price * item.qty)}</div></div>) : <div className="cart-empty"><div className="state-icon">🛒</div><strong>Cart is empty</strong><span>Select items from the menu to start an order.</span></div>}</div>
      <div className="cart-footer"><div className="cart-totals"><div className="cart-row"><span>Subtotal</span><span>{money(subtotal)}</span></div><div className="cart-row"><span>Estimated tax</span><span>{money(estimatedTax)}</span></div><div className="cart-row total"><span>Estimated total</span><span>{money(visibleOrderTotal)}</span></div><small>Final tax and total are calculated by the server.</small></div><div className="pay-methods">{['Cash', 'Card', 'Online'].map((method) => <button type="button" key={method} className={`pay-btn ${paymentMethod === method ? 'active' : ''}`} onClick={() => setPaymentMethod(method)}>{method}</button>)}</div><button className="charge-btn" onClick={() => void handleCharge()} disabled={!cart.length || !shift || isProcessing}>{isProcessing ? 'Processing…' : pendingOrder ? `Complete payment · ${money(visibleOrderTotal)}` : `Charge · ${money(estimatedTotal)}`}</button></div>
    </aside>
  </div>;
}
