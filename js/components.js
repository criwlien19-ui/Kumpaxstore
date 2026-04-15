/* ═══════════════════════════════════════════════
   KUMPAX STORE — Composants réutilisables
   ═══════════════════════════════════════════════ */
const { useState, useContext, createContext, useReducer, useEffect, useRef, useCallback, useMemo } = React;

// ── Bouton principal ──
const Btn = ({ onClick, children, style, disabled, outline, size = "md" }) => {
  const sizes = {
    sm: { padding: "8px 16px", fontSize: 12, borderRadius: 10 },
    md: { padding: "11px 22px", fontSize: 13, borderRadius: 12 },
    lg: { padding: "14px 28px", fontSize: 14, borderRadius: 14 },
  };
  const s = sizes[size] || sizes.md;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
      ...s,
      fontFamily: FONT_HEADING, fontWeight: 600, letterSpacing: "-0.01em",
      cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? .5 : 1, border: "none",
      transition: `all 250ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
      ...(outline
        ? { border: `2px solid ${BLUE}`, background: "transparent", color: BLUE }
        : { background: grad, color: "#fff", boxShadow: "0 4px 14px rgba(30,64,175,.25)" }),
      ...style
    }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.transform = "translateY(-1px) scale(1.02)" }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none" }}
    >{children}</button>
  );
};

// ── Badge de statut ──
const StatusBadge = ({ s }) => {
  const m = {
    "Livré":      ["#D1FAE5", "#047857"],
    "En attente": ["#FEF3C7", "#B45309"],
    "En transit": ["#DBEAFE", "#1D4ED8"],
    "Annulé":     ["#FEE2E2", "#DC2626"],
  };
  const [bg, cl] = m[s] || ["#F1F5F9", "#64748B"];
  return <span style={{
    padding: "4px 12px", borderRadius: 9999, fontSize: 11, fontWeight: 600,
    background: bg, color: cl, fontFamily: FONT_BODY
  }}>{s}</span>;
};

// ── Image sécurisée (fallback) ──
const SafeImg = ({ src, alt, style, className }) => (
  <img
    src={src || PLACEHOLDER} alt={alt || "Produit Kumpax"} loading="lazy"
    style={style} className={className}
    onError={e => { e.currentTarget.src = PLACEHOLDER; }}
  />
);

// ── Étoiles de notation ──
const Stars = ({ rating, size = 12 }) => (
  <span style={{ display: "inline-flex", gap: 1 }} aria-label={`Note: ${rating} sur 5`}>
    {[1, 2, 3, 4, 5].map(i => (
      <span key={i} style={{ color: i <= Math.round(rating) ? "#FBBF24" : "#E2E8F0", fontSize: size }}>★</span>
    ))}
  </span>
);

// ── Skeleton loader ──
const Skeleton = ({ w = "100%", h = 16, r = 8, mb = 0 }) => (
  <div style={{
    width: w, height: h, borderRadius: r, marginBottom: mb,
    background: "linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s infinite",
  }} />
);

// ── Hook API générique ──
function useApi(fn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const refresh = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fn();
      if (res.success) setData(res.data);
      else setError(res.error);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, deps);
  useEffect(() => { refresh(); }, [refresh]);
  return { data, loading, error, refresh };
}
