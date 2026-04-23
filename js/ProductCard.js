/* ═══════════════════════════════════════════════
   KUMPAX STORE — Product Card (Dark Upgrade)
   Déclencheurs psychologiques : rareté, urgence,
   preuve sociale, ancrage de prix, CTAs reformulés
   ═══════════════════════════════════════════════ */

// ── Helper : badge stock ──
function StockBadge({ stock }) {
  if (stock === 0) return null;
  if (stock <= 3) return (
    <span className="badge-stock badge-stock-critical">⚠️ Plus que {stock} en stock</span>
  );
  if (stock <= 8) return (
    <span className="badge-stock badge-stock-low">🔥 Plus que {stock} en stock</span>
  );
  return null; // stock ok : on n'affiche pas (crée de la rareté artificielle en ne la montrant QUE quand c'est faible)
}

// ── Helper : Stars ──
function CardStars({ rating, size = 11 }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span style={{ color: "#FBBF24", fontSize: size, letterSpacing: 1, lineHeight: 1 }}>
      {"★".repeat(full)}{half ? "½" : ""}{"☆".repeat(5 - full - (half ? 1 : 0))}
    </span>
  );
}

function ProductCard({ p, go, editorial = false, promotions = [] }) {
  const { dispatch } = useCart();
  const { ids, toggle } = useWish();
  const { push } = useToast();
  const [added, setAdded] = useState(false);
  const [cartBadgePing, setCartBadgePing] = useState(false);

  const liked = ids.has(p.id);
  const oos = p.stock === 0;
  const pricing = getDiscountedPricing(p, promotions);
  const displayedPrice = pricing.price;
  const displayedOrig = pricing.orig;
  const effectiveProduct = displayedPrice !== p.price ? { ...p, price: displayedPrice, orig: displayedOrig } : p;
  const promoDisc = displayedOrig ? Math.round((1 - displayedPrice / displayedOrig) * 100) : 0;
  const viewers = getViewers(p.id);

  const add = e => {
    e.stopPropagation();
    if (oos) return;
    dispatch({ type: "ADD", p: effectiveProduct });
    push({
      title: "Ajouté au panier ! 🛒",
      subtitle: p.name,
      image: p.img,
      price: fmt(displayedPrice),
      type: "success",
      actionLabel: "Voir panier →",
      action: () => window.dispatchEvent(new CustomEvent("kumpax:open-cart")),
      groupKey: `cart-add-${p.id}`,
    });
    setAdded(true);
    setCartBadgePing(true);
    setTimeout(() => setAdded(false), 1400);
    setTimeout(() => setCartBadgePing(false), 1000);
  };

  const wishToggle = e => {
    e.stopPropagation();
    toggle(p.id);
    push({
      title: liked ? "Retiré des favoris" : "Ajouté aux favoris ❤️",
      subtitle: p.name,
      image: p.img,
      price: fmt(p.price),
      type: liked ? "warn" : "success",
    });
  };

  // ── EDITORIAL MODE ──
  if (editorial) {
    return (
      <article className="card-editorial" style={{ cursor: "pointer" }} onClick={() => go("product", { product: p })}>
        <SafeImg src={p.img} alt={p.name} className="card-editorial-img" />
        <div className="card-editorial-overlay">
          <button onClick={wishToggle} aria-label={liked ? "Retirer des favoris" : "Ajouter aux favoris"}
            style={{ position: "absolute", top: 12, right: 12, width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,.15)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, minHeight: "auto" }}>
            {liked ? "❤️" : "🤍"}
          </button>
          <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
            {p.badge && <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: "rgba(255,191,36,.9)", color: "#1E293B", fontFamily: FONT_BODY }}>{p.badge}</span>}
            {promoDisc > 0 && <span className="badge-promo-pct">-{promoDisc}%</span>}
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", fontFamily: FONT_BODY, marginBottom: 4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{p.name}</p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <div>
              <span className="price-new" style={{ fontSize: 15 }}>{fmt(displayedPrice)}</span>
              {displayedOrig && <span className="price-old" style={{ fontSize: 11 }}>{fmt(displayedOrig)}</span>}
            </div>
            <button onClick={add} disabled={oos} aria-label={`Je le veux — ${p.name}`} style={{
              padding: "8px 14px", borderRadius: 10, border: "none",
              background: added ? "#10B981" : "rgba(255,255,255,.15)",
              backdropFilter: "blur(10px)", color: "#fff",
              fontSize: 12, fontWeight: 700, fontFamily: FONT_CTA,
              opacity: oos ? .5 : 1, cursor: oos ? "not-allowed" : "pointer",
              transition: "background 200ms", minHeight: "auto",
            }}>
              {added ? "✓ Ajouté" : "Je le veux →"}
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
          style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }} loading="lazy" />

        {/* Badges top-left */}
        <div style={{ position: "absolute", top: 8, left: 8, display: "flex", flexDirection: "column", gap: 4 }}>
          {p.badge && <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 99, background: "rgba(255,255,255,.92)", backdropFilter: "blur(8px)", color: "#1E293B", fontFamily: FONT_BODY, whiteSpace: "nowrap" }}>{p.badge}</span>}
          {promoDisc > 0 && <span className="badge-promo-pct">-{promoDisc}%</span>}
        </div>

        {/* OOS overlay */}
        {oos && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(5,8,26,0.75)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#FCA5A5", background: "rgba(239,68,68,.2)", border: "1px solid rgba(239,68,68,.4)", padding: "5px 14px", borderRadius: 99, fontFamily: FONT_BODY }}>Rupture de stock</span>
          </div>
        )}

        {/* Wishlist */}
        <button onClick={wishToggle} aria-label={liked ? "Retirer des favoris" : "Ajouter aux favoris"}
          style={{
            position: "absolute", top: 8, right: 8, width: 32, height: 32, borderRadius: "50%",
            background: liked ? "rgba(254,242,242,.95)" : "rgba(255,255,255,.15)",
            backdropFilter: "blur(8px)", border: liked ? "1.5px solid #FCA5A5" : "1px solid rgba(255,255,255,.2)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
            transition: "transform 200ms var(--ease-bounce)", minHeight: "auto",
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.2)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
          {liked ? "❤️" : "🤍"}
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: "12px 12px 14px", display: "flex", flexDirection: "column", flex: 1, gap: 6 }}>
        <p style={{ fontSize: 9, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 600, fontFamily: FONT_BODY, marginBottom: 0 }}>{p.cat}</p>

        <p style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.4, flex: 1, fontFamily: FONT_BODY, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", color: "var(--text-primary)" }}>{p.name}</p>

        {/* Rating + viewers */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <CardStars rating={p.rating} size={10} />
          <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: FONT_BODY }}>({p.rev})</span>
          <span className="live-viewers">
            <span className="live-dot" />
            {viewers} regardent
          </span>
        </div>

        {/* Stock badge */}
        <StockBadge stock={p.stock} />

        {/* Prix ancré + CTA */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, marginTop: "auto" }}>
          <div className="price-anchor">
            <span className="price-new" style={{ fontSize: 14 }}>{fmt(displayedPrice)}</span>
            {displayedOrig && (
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span className="price-old" style={{ fontSize: 11 }}>{fmt(displayedOrig)}</span>
                {promoDisc > 0 && <span className="price-save">−{promoDisc}%</span>}
              </div>
            )}
          </div>
          <button
            onClick={add}
            disabled={oos}
            aria-label={`Je le veux — ${p.name}`}
            className={cartBadgePing ? "cart-badge-ping" : ""}
            style={{
              padding: "9px 13px", borderRadius: 10, border: "none", flexShrink: 0,
              background: added ? "#10B981" : "linear-gradient(135deg, #E85D2F, #c94922)",
              color: "#fff",
              fontSize: 11, fontWeight: 700, fontFamily: FONT_CTA,
              opacity: oos ? .5 : 1, cursor: oos ? "not-allowed" : "pointer",
              transition: "all 250ms var(--ease-bounce)", minHeight: "auto",
              boxShadow: added ? "0 2px 8px rgba(16,185,129,.4)" : "0 2px 12px rgba(232,93,47,0.4)",
              whiteSpace: "nowrap",
            }}>
            {oos ? "Indispo" : added ? "✓" : "Je le veux →"}
          </button>
        </div>
      </div>
    </article>
  );
}
