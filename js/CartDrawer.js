/* ═══════════════════════════════════════════════
   KUMPAX STORE — Cart Drawer
   ═══════════════════════════════════════════════ */

function CartDrawer({ open, onClose, go }) {
  const { items, total, dispatch } = useCart();
  const { push } = useToast();

  return (
    <>
      {/* Overlay */}
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 50,
        opacity: open ? 1 : 0, pointerEvents: open ? "all" : "none", transition: "opacity .3s"
      }}/>

      {/* Drawer */}
      <div className={open ? "slide-in" : ""} style={{
        position: "fixed", right: 0, top: 0, height: "100%", width: 320, background: "#fff",
        zIndex: 51, boxShadow: "-8px 0 40px rgba(0,0,0,.15)", display: "flex", flexDirection: "column",
        transform: open ? "translateX(0)" : "translateX(100%)", transition: "transform .3s ease"
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
          <span style={{ fontWeight: 800, fontSize: 15 }}>Mon Panier <span style={{ color: "#94a3b8", fontWeight: 400 }}>({items.length})</span></span>
          <button onClick={onClose} style={{ border: "none", background: "#f1f5f9", borderRadius: 10, width: 32, height: 32, cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
          {items.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12, color: "#94a3b8", textAlign: "center" }}>
              <span style={{ fontSize: 48, opacity: .2 }}>🛒</span>
              <p style={{ fontWeight: 600, fontSize: 13 }}>Votre panier est vide</p>
              <button onClick={onClose} style={{ fontSize: 12, color: BLUE, border: "none", background: "none", cursor: "pointer", textDecoration: "underline" }}>Continuer les achats</button>
            </div>
          ) : items.map(item => (
            <div key={item.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <SafeImg src={item.img} alt={item.name} style={{ width: 54, height: 54, borderRadius: 10, objectFit: "cover", flexShrink: 0 }}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{item.name}</p>
                <p style={{ fontSize: 12, fontWeight: 800, color: BLUE, marginTop: 2 }}>{fmt(item.price)}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                  <button onClick={() => { if (item.qty === 1) { dispatch({ type: "REMOVE", id: item.id }); push("Article retiré", "warn"); } else dispatch({ type: "QTY", id: item.id, qty: item.qty - 1 }); }} style={{ width: 22, height: 22, borderRadius: 6, border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                  <span style={{ fontSize: 12, fontWeight: 700, width: 20, textAlign: "center" }}>{item.qty}</span>
                  <button onClick={() => { if (item.qty >= (item.stock ?? 99)) { push("Stock maximum atteint", "warn"); return; } dispatch({ type: "QTY", id: item.id, qty: item.qty + 1 }); }} style={{ width: 22, height: 22, borderRadius: 6, border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                  <button onClick={() => { dispatch({ type: "REMOVE", id: item.id }); push("Retiré", "warn"); }} style={{ marginLeft: "auto", border: "none", background: "none", cursor: "pointer", color: "#ef4444", fontSize: 14 }}>🗑</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ borderTop: "1px solid #f1f5f9", padding: "16px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: "#94a3b8" }}>Livraison</span>
              <span style={{ fontSize: 11, color: "#059669", fontWeight: 700 }}>Gratuite 🎉</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontWeight: 800 }}>Total</span>
              <span style={{ fontWeight: 900, fontSize: 17, color: BLUE }}>{fmt(total)}</span>
            </div>
            <Btn onClick={() => { onClose(); go("checkout"); }} style={{ width: "100%", borderRadius: 12, padding: "12px 20px" }}>
              Commander maintenant →
            </Btn>
            <button onClick={() => dispatch({ type: "CLEAR" })} style={{ width: "100%", marginTop: 8, border: "none", background: "none", cursor: "pointer", fontSize: 11, color: "#94a3b8", padding: 4 }}>Vider le panier</button>
          </div>
        )}
      </div>
    </>
  );
}
