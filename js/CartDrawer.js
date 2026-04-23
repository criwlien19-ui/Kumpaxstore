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
        position: "fixed", inset: 0, background: "rgba(15,23,42,.45)", zIndex: 109,
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
          <div className="cart-drawer-footer" style={{ borderTop: "1px solid var(--border-light)", padding: "16px 20px", flexShrink: 0, paddingBottom: "calc(16px + env(safe-area-inset-bottom))" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: FONT_BODY }}>Livraison</span>
              <span style={{ fontSize: 12, color: "var(--cyan)", fontWeight: 700, fontFamily: FONT_BODY }}>Partout 🚚</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontWeight: 700, fontFamily: FONT_HEADING, fontSize: 15, color: "var(--text-primary)" }}>Total</span>
              <span style={{ fontWeight: 700, fontSize: 18, color: "var(--cta-gold)", fontFamily: FONT_CTA }}>{fmt(total)}</span>
            </div>
            <button onClick={() => { onClose(); go("checkout"); }} className="cta-primary" style={{ width: "100%", borderRadius: 14, padding: "14px 20px", fontSize: 14, animation: "ctaBreathe 3s ease-in-out infinite" }}>
              🚀 Commander maintenant
            </button>
            {/* Trust badges paiement */}
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              {[
                { icon: (
                    <svg viewBox="0 0 64 64" width="12" height="12" style={{ display: 'block' }}>
                      <path d="M22 34 C12 24 6 32 14 42 C16 46 22 42 22 42 Z" fill="#fff" />
                      <path d="M32 4 C22 4 20 20 20 44 C20 58 26 60 32 60 C38 60 44 58 44 44 C44 20 42 4 32 4 Z" fill="#fff" />
                      <ellipse cx="32" cy="42" rx="8" ry="12" fill="#05081A" />
                      <circle cx="26" cy="20" r="2.5" fill="#05081A" />
                      <circle cx="38" cy="20" r="2.5" fill="#05081A" />
                      <path d="M28 25 L36 25 L32 30 Z" fill="#F97316" />
                      <path d="M20 58 C14 58 16 64 24 64 C26 64 24 58 20 58 Z" fill="#F97316" />
                      <path d="M44 58 C50 58 48 64 40 64 C38 64 40 58 44 58 Z" fill="#F97316" />
                    </svg>
                  ), label: "Wave" },
                { icon: (
                    <svg viewBox="0 0 64 64" width="12" height="12" style={{ display: 'block' }}>
                      <g strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none">
                        <path d="M 10 14 L 30 14 L 30 34 M 10 34 L 30 14" stroke="#fff" />
                        <path d="M 54 50 L 34 50 L 34 30 M 54 30 L 34 50" stroke="#FF6600" />
                      </g>
                    </svg>
                  ), label: "Orange Money" },
                { icon: "💵", label: "Cash" },
                { icon: "🔒", label: "Sécurisé" },
              ].map((b, i) => (
                <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, fontFamily: FONT_BODY, color: "var(--text-muted)", padding: "4px 8px", borderRadius: 6, background: "var(--glass-bg-2)", border: "1px solid var(--border-light)" }}>
                  {b.icon} {b.label}
                </span>
              ))}
            </div>
            <button onClick={() => dispatch({ type: "CLEAR" })} style={{ width: "100%", marginTop: 10, border: "none", background: "none", fontSize: 12, color: "var(--text-muted)", fontFamily: FONT_BODY, transition: "color 150ms", minHeight: "auto" }}
              onMouseEnter={e => e.currentTarget.style.color = "#EF4444"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>Vider le panier</button>
          </div>
        )}
      </aside>
    </>
  );
}
