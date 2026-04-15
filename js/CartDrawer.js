/* ═══════════════════════════════════════════════
   KUMPAX STORE — Cart Drawer
   ═══════════════════════════════════════════════ */

function CartDrawer({ open, onClose, go }) {
  const { items, total, dispatch } = useCart();
  const { push } = useToast();

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} aria-hidden="true" style={{
        position: "fixed", inset: 0, background: "rgba(15,23,42,.45)", zIndex: 50,
        opacity: open ? 1 : 0, pointerEvents: open ? "all" : "none",
        transition: "opacity .3s ease", backdropFilter: open ? "blur(4px)" : "none",
      }} />

      {/* Drawer */}
      <aside role="dialog" aria-modal="true" aria-label="Panier"
        className={`cart-drawer ${open ? "open" : "closed"}`}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", borderBottom: "1px solid #F1F5F9", flexShrink: 0 }}>
          <span style={{ fontWeight: 700, fontSize: 16, fontFamily: FONT_HEADING, letterSpacing: "-0.01em" }}>
            Mon Panier <span style={{ color: "#94A3B8", fontWeight: 400, fontSize: 14 }}>({items.length})</span>
          </span>
          <button onClick={onClose} aria-label="Fermer le panier" style={{
            border: "none", background: "#F1F5F9", borderRadius: 10,
            width: 36, height: 36, cursor: "pointer", fontSize: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 150ms", flexShrink: 0, minHeight: "auto",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "#E2E8F0"}
            onMouseLeave={e => e.currentTarget.style.background = "#F1F5F9"}>✕</button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
          {items.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12, textAlign: "center" }}>
              <span style={{ fontSize: 52, opacity: .12 }}>🛒</span>
              <p style={{ fontWeight: 600, fontSize: 14, color: "#64748B", fontFamily: FONT_BODY }}>Votre panier est vide</p>
              <button onClick={onClose} style={{ fontSize: 13, color: BLUE, border: "none", background: "none", fontFamily: FONT_BODY, textDecoration: "underline", minHeight: "auto" }}>Continuer les achats</button>
            </div>
          ) : items.map(item => (
            <div key={item.id} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <SafeImg src={item.img} alt={item.name} style={{ width: 56, height: 56, borderRadius: 12, objectFit: "cover", flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.35, fontFamily: FONT_BODY, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{item.name}</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: BLUE, marginTop: 4, fontFamily: FONT_HEADING }}>{fmt(item.price)}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                  <button onClick={() => { if (item.qty === 1) { dispatch({ type: "REMOVE", id: item.id }); push("Retiré", "warn"); } else dispatch({ type: "QTY", id: item.id, qty: item.qty - 1 }); }}
                    aria-label="Diminuer la quantité"
                    style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid #E2E8F0", background: "#F8FAFC", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "auto" }}>−</button>
                  <span style={{ fontSize: 13, fontWeight: 700, width: 24, textAlign: "center", fontFamily: FONT_HEADING }}>{item.qty}</span>
                  <button onClick={() => { if (item.qty >= (item.stock ?? 99)) { push("Stock max atteint", "warn"); return; } dispatch({ type: "QTY", id: item.id, qty: item.qty + 1 }); }}
                    aria-label="Augmenter la quantité"
                    style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid #E2E8F0", background: "#F8FAFC", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "auto" }}>+</button>
                  <button onClick={() => { dispatch({ type: "REMOVE", id: item.id }); push("Retiré", "warn"); }}
                    aria-label={`Supprimer ${item.name}`}
                    style={{ marginLeft: "auto", border: "none", background: "none", color: "#EF4444", fontSize: 16, transition: "transform 150ms", minHeight: "auto" }}
                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.15)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "none"}>🗑</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        {items.length > 0 && (
          <div style={{ borderTop: "1px solid #F1F5F9", padding: "16px 20px", flexShrink: 0, paddingBottom: "calc(16px + env(safe-area-inset-bottom))" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 12, color: "#94A3B8", fontFamily: FONT_BODY }}>Livraison</span>
              <span style={{ fontSize: 12, color: "#059669", fontWeight: 700, fontFamily: FONT_BODY }}>Gratuite 🎉</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontWeight: 700, fontFamily: FONT_HEADING, fontSize: 15 }}>Total</span>
              <span style={{ fontWeight: 700, fontSize: 18, color: BLUE, fontFamily: FONT_HEADING }}>{fmt(total)}</span>
            </div>
            <Btn onClick={() => { onClose(); go("checkout"); }} style={{ width: "100%", borderRadius: 14, padding: "14px 20px" }}>
              Commander maintenant →
            </Btn>
            <button onClick={() => dispatch({ type: "CLEAR" })} style={{ width: "100%", marginTop: 10, border: "none", background: "none", fontSize: 12, color: "#94A3B8", fontFamily: FONT_BODY, transition: "color 150ms", minHeight: "auto" }}
              onMouseEnter={e => e.currentTarget.style.color = "#EF4444"}
              onMouseLeave={e => e.currentTarget.style.color = "#94A3B8"}>Vider le panier</button>
          </div>
        )}
      </aside>
    </>
  );
}
