import React, { useState } from 'react';

type Product = {
  id: string;
  name: string;
  price: number;
  emoji: string;
  category: string;
};

type CartItem = Product & { qty: number };

const MENU_ITEMS: Product[] = [
  { id: '1', name: 'Chicken Burger', price: 480, emoji: '🍔', category: 'Burgers' },
  { id: '2', name: 'Margherita Pizza', price: 950, emoji: '🍕', category: 'Pizza' },
  { id: '3', name: 'Zinger Meal', price: 620, emoji: '🍗', category: 'Chicken' },
  { id: '4', name: 'Pepsi 500ml', price: 120, emoji: '🥤', category: 'Drinks' },
  { id: '5', name: 'Fries (Large)', price: 250, emoji: '🍟', category: 'Sides' },
  { id: '6', name: 'Brownie', price: 320, emoji: '🍰', category: 'Desserts' },
  { id: '7', name: 'Latte', price: 380, emoji: '☕', category: 'Drinks' },
  { id: '8', name: 'Caesar Salad', price: 550, emoji: '🥗', category: 'Sides' },
  { id: '9', name: 'Combo Meal A', price: 850, emoji: '🍱', category: 'Burgers' },
];

const CATEGORIES = ['All items', 'Burgers', 'Pizza', 'Chicken', 'Drinks', 'Desserts', 'Sides'];
const PAYMENT_METHODS = ['Cash', 'Card', 'JazzCash'];

export default function POS() {
  const [activeCategory, setActiveCategory] = useState('All items');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const filteredMenu = activeCategory === 'All items' 
    ? MENU_ITEMS 
    : MENU_ITEMS.filter(item => item.category === activeCategory);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return { ...item, qty: newQty > 0 ? newQty : 0 };
      }
      return item;
    }).filter(item => item.qty > 0));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const tax = Math.round(subtotal * 0.17);
  const total = subtotal + tax;

  const handleCharge = () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setCart([]);
      }, 3000);
    }, 1500);
  };

  return (
    <div className="pos-layout">
      {/* Menu Area */}
      <div className="pos-menu">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <div style={{ fontFamily: 'var(--sans)', fontSize: '18px', fontWeight: 600, color: 'var(--text)' }}>Point of Sale</div>
            <div style={{ fontSize: '12px', color: 'var(--text-3)' }}>Main Branch · Table / Counter</div>
          </div>
          <div className="branch-pill" style={{ fontSize: '11px' }}>
            <div className="branch-dot"></div>Cashier: Admin
          </div>
        </div>

        <div className="pos-cats" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
          {CATEGORIES.map(cat => (
            <div 
              key={cat} 
              className={`cat-pill ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
              style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              {cat}
            </div>
          ))}
        </div>

        <div className="menu-grid">
          {filteredMenu.map(item => (
            <div key={item.id} className="menu-item" onClick={() => addToCart(item)}>
              <div className="menu-item-emoji">{item.emoji}</div>
              <div className="menu-item-name">{item.name}</div>
              <div className="menu-item-price">PKR {item.price}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Area */}
      <div className="pos-cart">
        <div className="cart-header">
          Current Order
          <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-3)' }}>Walk-in</span>
        </div>
        
        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="state-container" style={{ minHeight: '200px', height: '100%', padding: '20px' }}>
              <div className="state-icon" style={{ fontSize: '32px', marginBottom: '12px' }}>🛒</div>
              <div className="state-title" style={{ fontSize: '16px' }}>Cart is empty</div>
              <div className="state-desc" style={{ fontSize: '12px' }}>Select items from the menu to add them to the cart.</div>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-name">{item.name}</div>
                <div className="cart-qty-ctrl">
                  <div className="qty-btn" onClick={() => updateQty(item.id, -1)}>−</div>
                  <div className="qty-num">{item.qty}</div>
                  <div className="qty-btn" onClick={() => updateQty(item.id, 1)}>+</div>
                </div>
                <div className="cart-item-price">PKR {item.price * item.qty}</div>
              </div>
            ))
          )}
        </div>

        <div className="cart-footer">
          <div className="cart-totals">
            <div className="cart-row"><span>Subtotal</span><span>PKR {subtotal}</span></div>
            <div className="cart-row"><span>Tax (17%)</span><span>PKR {tax}</span></div>
            <div className="cart-row"><span>Discount</span><span style={{ color: 'var(--green)' }}>−PKR 0</span></div>
            <div className="cart-row total"><span>Total</span><span>PKR {total}</span></div>
          </div>
          
          <div className="pay-methods">
            {PAYMENT_METHODS.map(method => (
              <div 
                key={method} 
                className={`pay-btn ${paymentMethod === method ? 'active' : ''}`}
                onClick={() => setPaymentMethod(method)}
              >
                {method}
              </div>
            ))}
          </div>
          
          <button 
            className={`charge-btn ${isSuccess ? 'success' : ''}`} 
            onClick={handleCharge}
            disabled={cart.length === 0 || isProcessing}
            style={{ 
              opacity: cart.length === 0 ? 0.5 : 1,
              background: isSuccess ? 'var(--green)' : isProcessing ? 'var(--accent-glow)' : 'var(--accent)'
            }}
          >
            {isSuccess ? 'Payment Successful!' : isProcessing ? 'Processing...' : `Charge PKR ${total}`}
          </button>
        </div>
      </div>
    </div>
  );
}
