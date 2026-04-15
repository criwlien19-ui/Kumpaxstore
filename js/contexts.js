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
  const defaultDuration = 3200;

  const clearToastTimer = useCallback((id) => {
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const scheduleToastRemoval = useCallback((id, duration) => {
    clearToastTimer(id);
    timers.current[id] = setTimeout(() => {
      setToasts(t => t.filter(x => x.id !== id));
      delete timers.current[id];
    }, duration || defaultDuration);
  }, [clearToastTimer]);

  // Nettoyage de tous les timers au démontage (évite les setState sur composant mort)
  useEffect(() => {
    return () => {
      Object.values(timers.current).forEach(clearTimeout);
    };
  }, []);

  const push = useCallback((msg, type = "success") => {
    const payload = typeof msg === "string"
      ? { title: msg, type }
      : { ...msg, type: msg.type || type };
    const groupKey = payload.groupKey || `${payload.type}|${payload.title || ""}|${payload.subtitle || ""}`;
    const duration = payload.duration || defaultDuration;

    setToasts(prev => {
      const existing = prev.find(t => t.groupKey === groupKey);
      if (existing) {
        const merged = prev.map(t => t.id === existing.id ? {
          ...t,
          ...payload,
          groupKey,
          count: (t.count || 1) + 1,
          duration,
        } : t);
        scheduleToastRemoval(existing.id, duration);
        return merged;
      }
      const id = Date.now() + Math.random();
      const created = { id, ...payload, groupKey, count: 1, duration };
      scheduleToastRemoval(id, duration);
      return [...prev, created];
    });
  }, [scheduleToastRemoval]);

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div style={{
        position: "fixed", bottom: 88, right: 14,
        zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "flex-end",
        gap: 10, pointerEvents: "none", width: "min(92vw, 360px)"
      }}>
        {toasts.map(t => (
          <div key={t.id} className="toast-in" style={{
            width: "100%",
            padding: 10,
            borderRadius: 14,
            color: "#0F172A",
            display: "flex",
            alignItems: "center",
            gap: 10,
            boxShadow: "0 12px 28px rgba(15,23,42,.16)",
            border: "1px solid #E2E8F0",
            background: "#fff",
            pointerEvents: "auto",
            position: "relative",
            overflow: "hidden"
          }}>
            {t.image && (
              <img
                src={t.image}
                alt={t.title || "Produit"}
                style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover", flexShrink: 0, border: "1px solid #E2E8F0" }}
                onError={e => { e.currentTarget.style.display = "none"; }}
              />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: t.type === "error" ? "#DC2626" : t.type === "warn" ? "#B45309" : "#0F172A", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {t.title || "Notification"} {t.count > 1 ? `x${t.count}` : ""}
              </p>
              {t.subtitle && (
                <p style={{ fontSize: 11, color: "#64748B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {t.subtitle}
                </p>
              )}
              {t.price && (
                <p style={{ fontSize: 11, color: BLUE, fontWeight: 700, marginTop: 2 }}>{t.price}</p>
              )}
            </div>
            {t.actionLabel && typeof t.action === "function" && (
              <button
                onClick={t.action}
                style={{ border: "none", background: "#EFF6FF", color: BLUE, fontSize: 11, fontWeight: 700, padding: "8px 10px", borderRadius: 10, minHeight: "auto" }}
              >
                {t.actionLabel}
              </button>
            )}
            <span style={{ fontSize: 16, flexShrink: 0 }}>
              {t.type === "error" ? "✕" : t.type === "warn" ? "⚠" : "✓"}
            </span>
            <span
              style={{
                position: "absolute",
                left: 0,
                bottom: 0,
                height: 3,
                width: "100%",
                background: t.type === "error" ? "#FCA5A5" : t.type === "warn" ? "#FCD34D" : "#93C5FD",
                transformOrigin: "left",
                animation: `toastProgress ${t.duration || defaultDuration}ms linear forwards`,
              }}
            />
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

const useToast = () => useContext(ToastCtx);

// Export hooks to window for usage in other scripts
window.useCart = useCart;
window.useWish = useWish;
window.useToast = useToast;
