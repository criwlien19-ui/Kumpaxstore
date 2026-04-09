/* ═══════════════════════════════════════════════
   KUMPAX STORE — Product Card
   Card produit enrichie : stock indicator, sous-catégorie,
   image agrandie, meilleur UX mobile.
   ═══════════════════════════════════════════════ */

function ProductCard({ p, go }) {
  const { dispatch } = useCart();
  const { ids, toggle } = useWish();
  const { push } = useToast();
  const [added, setAdded] = useState(false);
  const disc = p.orig ? Math.round((1 - p.price / p.orig) * 100) : 0;
  const liked = ids.has(p.id);
  const oos = p.stock === 0;

  // Indicateur de stock
  const stockLevel = p.stock === 0 ? "oos" : p.stock <= 5 ? "low" : "ok";
  const stockColor  = stockLevel === "oos" ? "#dc2626" : stockLevel === "low" ? "#b45309" : "#047857";
  const stockBg     = stockLevel === "oos" ? "#fef2f2" : stockLevel === "low" ? "#fffbeb" : "#ecfdf5";
  const stockLabel  = stockLevel === "oos" ? "Rupture" : stockLevel === "low" ? `⚠ ${p.stock} restants` : "En stock";

  const add = () => {
    if (oos) return;
    dispatch({ type: "ADD", p });
    push(p.name.slice(0, 22) + "... ajouté !");
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <div
      className="card"
      style={{
        background: "#fff", borderRadius: 18, overflow: "hidden",
        border: "1px solid #f1f5f9", boxShadow: "0 1px 6px rgba(0,0,0,.07)",
        display: "flex", flexDirection: "column", transition: "all .25s ease",
        cursor: "default", position: "relative"
      }}
    >
      {/* ── Image ── */}
      <div
        style={{ position: "relative", overflow: "hidden", cursor: "pointer" }}
        onClick={() => go("product", { product: p })}
      >
        <SafeImg
          src={p.img} alt={p.name}
          className="card-img"
          style={{ width: "100%", height: 200, objectFit: "cover", display: "block", transition: "transform .5s ease" }}
        />

        {/* Badge promotionnel */}
        {p.badge && (
          <span style={{
            position: "absolute", top: 8, left: 8, padding: "3px 10px", borderRadius: 99,
            fontSize: 10, fontWeight: 700, background: "rgba(255,255,255,.95)",
            color: "#1e293b", boxShadow: "0 1px 4px rgba(0,0,0,.12)"
          }}>{p.badge}</span>
        )}

        {/* Badge remise */}
        {disc > 0 && (
          <span style={{
            position: "absolute", top: 8, right: 36, padding: "3px 8px", borderRadius: 99,
            fontSize: 10, fontWeight: 800, background: "#ef4444", color: "#fff"
          }}>-{disc}%</span>
        )}

        {/* Overlay rupture de stock */}
        {oos && (
          <div style={{
            position: "absolute", inset: 0, background: "rgba(255,255,255,.75)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <span style={{
              fontSize: 11, fontWeight: 800, color: "#dc2626",
              background: "#fff", padding: "4px 14px", borderRadius: 99, boxShadow: "0 2px 8px rgba(0,0,0,.1)"
            }}>Rupture de stock</span>
          </div>
        )}

        {/* Bouton favori */}
        <button
          onClick={(e) => { e.stopPropagation(); toggle(p.id); push(liked ? "Retiré des favoris" : "Ajouté aux favoris 💛"); }}
          style={{
            position: "absolute", top: 8, right: 8, width: 30, height: 30,
            borderRadius: "50%", background: "rgba(255,255,255,.95)", border: "none",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, transition: "transform .2s", boxShadow: "0 1px 4px rgba(0,0,0,.12)"
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.18)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        >
          {liked ? "❤️" : "🤍"}
        </button>
      </div>

      {/* ── Infos ── */}
      <div style={{ padding: "12px 12px 10px", display: "flex", flexDirection: "column", flex: 1 }}>

        {/* Catégorie + sous-catégorie */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4, flexWrap: "wrap" }}>
          <p style={{ fontSize: 9, color: "#94a3b8", textTransform: "uppercase", letterSpacing: .05, fontWeight: 600 }}>{p.cat}</p>
          {p.subcat && (
            <>
              <span style={{ fontSize: 9, color: "#cbd5e1" }}>›</span>
              <span style={{
                fontSize: 9, fontWeight: 700, color: BLUE,
                background: "#eff6ff", padding: "1px 6px", borderRadius: 6
              }}>{p.subcat}</span>
            </>
          )}
        </div>

        {/* Nom du produit — cliquable */}
        <p
          onClick={() => go("product", { product: p })}
          style={{
            fontWeight: 700, fontSize: 13, lineHeight: 1.35, marginBottom: 6, cursor: "pointer",
            flex: 1, overflow: "hidden", display: "-webkit-box",
            WebkitLineClamp: 2, WebkitBoxOrient: "vertical"
          }}
          onMouseEnter={e => e.currentTarget.style.color = BLUE}
          onMouseLeave={e => e.currentTarget.style.color = "#1e293b"}
        >
          {p.name}
        </p>

        {/* Notes */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
          <Stars rating={p.rating} />
          <span style={{ fontSize: 10, color: "#94a3b8" }}>({p.rev})</span>
        </div>

        {/* Indicateur de stock */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          padding: "2px 8px", borderRadius: 8, background: stockBg,
          marginBottom: 8, alignSelf: "flex-start"
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: stockColor, display: "inline-block" }} />
          <span style={{ fontSize: 9, fontWeight: 700, color: stockColor }}>{stockLabel}</span>
        </div>

        {/* Prix + Bouton */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: "auto", gap: 6 }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 900, color: BLUE }}>{fmt(p.price)}</p>
            {p.orig && <p style={{ fontSize: 10, color: "#94a3b8", textDecoration: "line-through" }}>{fmt(p.orig)}</p>}
          </div>
          <button
            onClick={add}
            disabled={oos}
            style={{
              display: "flex", alignItems: "center", gap: 4,
              padding: "8px 12px", borderRadius: 10, border: "none",
              cursor: oos ? "not-allowed" : "pointer",
              fontWeight: 700, fontSize: 11, fontFamily: "'Sora',sans-serif",
              background: added ? "#10b981" : oos ? "#f1f5f9" : BLUE,
              color: oos ? "#94a3b8" : "#fff", opacity: 1,
              transition: "background .2s, transform .1s",
              flexShrink: 0
            }}
            onMouseEnter={e => { if (!oos) e.currentTarget.style.transform = "scale(1.05)"; }}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          >
            {added ? "✓ OK" : oos ? "Indispo" : "+ Ajouter"}
          </button>
        </div>
      </div>
    </div>
  );
}
