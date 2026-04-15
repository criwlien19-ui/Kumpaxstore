/* ═══════════════════════════════════════════════
   KUMPAX STORE — Product Card (editorial mobile-first)
   ═══════════════════════════════════════════════ */

function ProductCard({ p, go, editorial = false, promotions = [] }) {
  const { dispatch } = useCart();
  const { ids, toggle } = useWish();
  const { push } = useToast();
  const [added, setAdded] = useState(false);
  const disc = p.orig ? Math.round((1 - p.price / p.orig) * 100) : 0;
  const liked = ids.has(p.id);
  const oos = p.stock === 0;
  const pricing = getDiscountedPricing(p, promotions);
  const displayedPrice = pricing.price;
  const displayedOrig = pricing.orig;
  const effectiveProduct = displayedPrice !== p.price ? { ...p, price: displayedPrice, orig: displayedOrig } : p;
  const promoDisc = displayedOrig ? Math.round((1 - displayedPrice / displayedOrig) * 100) : 0;

  const add = e => {
    e.stopPropagation();
    if (oos) return;
    dispatch({ type: "ADD", p: effectiveProduct });
    push({
      title: "Ajouté au panier",
      subtitle: p.name,
      image: p.img,
      price: fmt(displayedPrice),
      type: "success",
      actionLabel: "Voir panier",
      action: () => window.dispatchEvent(new CustomEvent("kumpax:open-cart")),
      groupKey: `cart-add-${p.id}`,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  const wishToggle = e => {
    e.stopPropagation();
    toggle(p.id);
    push({
      title: liked ? "Retiré des favoris" : "Ajouté aux favoris",
      subtitle: p.name,
      image: p.img,
      price: fmt(p.price),
      type: liked ? "warn" : "success",
    });
  };

  // ── EDITORIAL MODE — Full-bleed image with overlay ──
  if (editorial) {
    return (
      <article className="card-editorial" style={{ cursor: "pointer" }} onClick={() => go("product", { product: p })}>
        <SafeImg src={p.img} alt={p.name} className="card-editorial-img" />
        <div className="card-editorial-overlay">
          {/* Wishlist */}
          <button onClick={wishToggle} aria-label={liked ? "Retirer des favoris" : "Ajouter aux favoris"}
            style={{ position: "absolute", top: 12, right: 12, width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,.15)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, minHeight: "auto" }}>
            {liked ? "❤️" : "🤍"}
          </button>
          {/* Badges */}
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            {p.badge && <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: "rgba(255,191,36,.9)", color: "#1E293B", fontFamily: FONT_BODY }}>{p.badge}</span>}
            {promoDisc > 0 && <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 99, background: "#EF4444", color: "#fff", fontFamily: FONT_HEADING }}>-{promoDisc}%</span>}
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", fontFamily: FONT_BODY, marginBottom: 4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{p.name}</p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#FBBF24", fontFamily: FONT_HEADING, letterSpacing: "-0.01em" }}>{fmt(displayedPrice)}</span>
            <button onClick={add} disabled={oos} aria-label={`Ajouter ${p.name} au panier`} style={{
              padding: "8px 14px", borderRadius: 10, border: "none",
              background: added ? "#10B981" : "rgba(255,255,255,.15)",
              backdropFilter: "blur(10px)", color: "#fff",
              fontSize: 12, fontWeight: 600, fontFamily: FONT_BODY,
              opacity: oos ? .5 : 1, cursor: oos ? "not-allowed" : "pointer",
              transition: "background 200ms", minHeight: "auto",
            }}>
              {added ? "✓" : "+ Ajouter"}
            </button>
          </div>
        </div>
      </article>
    );
  }

  // ── STANDARD MODE ──
  return (
    <article
      className="card"
      onClick={() => go("product", { product: p })}
      style={{ cursor: "pointer", display: "flex", flexDirection: "column" }}
    >
      {/* Image */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        <SafeImg src={p.img} alt={p.name} className="card-img"
          style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }} />

        {/* Top-left badges */}
        <div style={{ position: "absolute", top: 8, left: 8, display: "flex", flexDirection: "column", gap: 4 }}>
          {p.badge && <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 99, background: "rgba(255,255,255,.92)", backdropFilter: "blur(8px)", color: "#1E293B", fontFamily: FONT_BODY, whiteSpace: "nowrap" }}>{p.badge}</span>}
          {promoDisc > 0 && <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 99, background: "#EF4444", color: "#fff", fontFamily: FONT_HEADING }}>-{promoDisc}%</span>}
        </div>

        {/* OOS overlay */}
        {oos && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,.75)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#DC2626", background: "#fff", padding: "5px 14px", borderRadius: 99, fontFamily: FONT_BODY, boxShadow: "0 2px 8px rgba(0,0,0,.08)" }}>Rupture</span>
          </div>
        )}

        {/* Wishlist */}
        <button onClick={wishToggle} aria-label={liked ? "Retirer des favoris" : "Ajouter aux favoris"}
          style={{
            position: "absolute", top: 8, right: 8, width: 32, height: 32, borderRadius: "50%",
            background: liked ? "rgba(254,242,242,.95)" : "rgba(255,255,255,.9)",
            backdropFilter: "blur(8px)", border: liked ? "1.5px solid #FCA5A5" : "none",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
            transition: "transform 200ms var(--ease-bounce)", minHeight: "auto",
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.15)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
          {liked ? "❤️" : "🤍"}
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: "12px 12px 14px", display: "flex", flexDirection: "column", flex: 1 }}>
        <p style={{ fontSize: 10, color: "#94A3B8", marginBottom: 4, textTransform: "uppercase", letterSpacing: ".06em", fontWeight: 500, fontFamily: FONT_BODY }}>{p.cat}</p>

        <p style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.4, marginBottom: 6, flex: 1, fontFamily: FONT_BODY, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{p.name}</p>

        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
          <Stars rating={p.rating} size={11} />
          <span style={{ fontSize: 11, color: "#94A3B8", fontFamily: FONT_BODY }}>({p.rev})</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, marginTop: "auto" }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: BLUE, fontFamily: FONT_HEADING, letterSpacing: "-0.01em", lineHeight: 1 }}>{fmt(displayedPrice)}</p>
            {displayedOrig && <p style={{ fontSize: 11, color: "#94A3B8", textDecoration: "line-through", fontFamily: FONT_BODY, marginTop: 2 }}>{fmt(displayedOrig)}</p>}
          </div>
          <button
            onClick={add}
            disabled={oos}
            aria-label={`Ajouter ${p.name} au panier`}
            style={{
              padding: "8px 12px", borderRadius: 10, border: "none", flexShrink: 0,
              background: added ? "#10B981" : BLUE, color: "#fff",
              fontSize: 11, fontWeight: 600, fontFamily: FONT_BODY,
              opacity: oos ? .5 : 1, cursor: oos ? "not-allowed" : "pointer",
              transition: "all 250ms var(--ease-bounce)", minHeight: "auto",
              boxShadow: added ? "0 2px 8px rgba(16,185,129,.3)" : "0 2px 8px rgba(30,64,175,.2)",
            }}>
            {added ? "✓" : "+"}
          </button>
        </div>
      </div>
    </article>
  );
}
