/* ═══════════════════════════════════════════════
   KUMPAX STORE — Composants Réutilisables
   (Btn, StatusBadge, SafeImg, Stars)
   ═══════════════════════════════════════════════ */

// ── Bouton principal ──
const Btn = ({ onClick, children, style, disabled, outline }) => (
  <button onClick={onClick} disabled={disabled} style={{
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
    padding: "10px 20px", borderRadius: 12, fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 13,
    cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? .5 : 1,
    transition: "opacity .15s, transform .1s",
    ...(outline
      ? { border: `2px solid ${BLUE}`, background: "transparent", color: BLUE }
      : { border: "none", background: grad, color: "#fff" }),
    ...style
  }}
    onMouseDown={e => { if (!disabled) e.currentTarget.style.transform = "scale(.97)"; }}
    onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
    onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
  >{children}</button>
);

// ── Badge de statut commande ──
const StatusBadge = ({ s }) => {
  const m = {
    "Livré": ["#d1fae5", "#047857"],
    "En attente": ["#fef3c7", "#b45309"],
    "En transit": ["#dbeafe", "#1d4ed8"],
    "Annulé": ["#fee2e2", "#dc2626"]
  };
  const [bg, cl] = m[s] || ["#f1f5f9", "#64748b"];
  return <span style={{ padding: "3px 10px", borderRadius: 9999, fontSize: 11, fontWeight: 700, background: bg, color: cl }}>{s}</span>;
};

// ── Image sécurisée (avec fallback) ──
const SafeImg = ({ src, alt, style, className }) => (
  <img src={src || PLACEHOLDER} alt={alt || ""} style={style} className={className}
    loading="lazy"
    onError={e => { e.currentTarget.src = PLACEHOLDER; }} />
);

// ── Étoiles de notation ──
const Stars = ({ rating, size = 11 }) => (
  <span style={{ display: "inline-flex", gap: 1 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <span key={i} style={{ color: i <= Math.round(rating) ? "#fbbf24" : "#e2e8f0", fontSize: size }}>★</span>
    ))}
  </span>
);
