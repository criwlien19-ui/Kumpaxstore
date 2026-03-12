/* ═══════════════════════════════════════════════
   KUMPAX STORE — Contexts React
   (Cart, Wishlist, Toast)
   ═══════════════════════════════════════════════ */

const { useState, useContext, createContext, useReducer, useEffect, useRef, useCallback, useMemo } = React;

// ══════════════════════════════════════════════
// ── CART CONTEXT ──
// ══════════════════════════════════════════════
const CartCtx = createContext(null);

function cartReducer(s, a) {
  switch (a.type) {
    case "ADD": {
      const ex = s.find(i => i.id === a.p.id);
      if (ex) {
        if (ex.qty >= (a.p.stock ?? 99)) return s;
        return s.map(i => i.id === a.p.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...s, { ...a.p, qty: 1 }];
    }
    case "REMOVE":
      return s.filter(i => i.id !== a.id);
    case "QTY":
      return s.map(i => i.id === a.id ? { ...i, qty: Math.min(Math.max(1, a.qty), i.stock ?? 99) } : i);
    case "CLEAR":
      return [];
    default:
      return s;
  }
}

// Charge le panier depuis localStorage (élimine les entrées corrompues)
function loadCart() {
  try {
    const raw = localStorage.getItem("kumpax_cart");
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}

function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, [], loadCart);
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  // Persistance automatique à chaque changement du panier
  useEffect(() => {
    try { localStorage.setItem("kumpax_cart", JSON.stringify(items)); }
    catch { /* storage plein ou désactivé */ }
  }, [items]);

  return <CartCtx.Provider value={{ items, total, count, dispatch }}>{children}</CartCtx.Provider>;
}

const useCart = () => useContext(CartCtx);

// ══════════════════════════════════════════════
// ── WISHLIST CONTEXT ──
// ══════════════════════════════════════════════
const WishCtx = createContext(null);

// Charge la wishlist depuis localStorage
function loadWish() {
  try {
    const raw = localStorage.getItem("kumpax_wish");
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch { return new Set(); }
}

function WishProvider({ children }) {
  const [ids, setIds] = useState(loadWish);
  const toggle = useCallback(id => setIds(p => {
    const n = new Set(p);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  }), []);

  // Persistance automatique à chaque changement de la wishlist
  useEffect(() => {
    try { localStorage.setItem("kumpax_wish", JSON.stringify([...ids])); }
    catch { /* storage plein ou désactivé */ }
  }, [ids]);

  return <WishCtx.Provider value={{ ids, toggle, count: ids.size }}>{children}</WishCtx.Provider>;
}

const useWish = () => useContext(WishCtx);

// ══════════════════════════════════════════════
// ── TOAST CONTEXT ──
// ══════════════════════════════════════════════
const ToastCtx = createContext(null);

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  // Ref pour tracker les timeouts actifs et les nettoyer
  const timers = useRef({});

  // Nettoyage de tous les timers au démontage (évite les setState sur composant mort)
  useEffect(() => {
    return () => {
      Object.values(timers.current).forEach(clearTimeout);
    };
  }, []);

  const push = useCallback((msg, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg, type }]);
    timers.current[id] = setTimeout(() => {
      setToasts(t => t.filter(x => x.id !== id));
      delete timers.current[id];
    }, 2800);
  }, []);

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div style={{
        position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)",
        zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "center",
        gap: 8, pointerEvents: "none"
      }}>
        {toasts.map(t => (
          <div key={t.id} className="toast-in" style={{
            padding: "10px 18px", borderRadius: 12, color: "#fff", fontSize: 12, fontWeight: 700,
            display: "flex", alignItems: "center", gap: 8, boxShadow: "0 8px 24px rgba(0,0,0,.2)",
            background: t.type === "error" ? "#ef4444" : t.type === "warn" ? "#f59e0b" : "#10b981"
          }}>
            {t.type === "error" ? "✕" : t.type === "warn" ? "⚠" : "✓"} {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

const useToast = () => useContext(ToastCtx);
