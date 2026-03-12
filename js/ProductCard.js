/* ═══════════════════════════════════════════════
   KUMPAX STORE — Product Card
   ═══════════════════════════════════════════════ */

function ProductCard({ p, go }) {
  const { dispatch } = useCart();
  const { ids, toggle } = useWish();
  const { push } = useToast();
  const [added, setAdded] = useState(false);
  const disc = p.orig ? Math.round((1 - p.price / p.orig) * 100) : 0;
  const liked = ids.has(p.id);
  const oos = p.stock === 0;

  const add = () => {
    if (oos) return;
    dispatch({ type: "ADD", p });
    push(p.name.slice(0, 22) + "... ajouté !");
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <div className="card" style={{ background: "#fff", borderRadius: 16, overflow: "hidden", border: "1px solid #f1f5f9", boxShadow: "0 1px 4px rgba(0,0,0,.06)", display: "flex", flexDirection: "column", transition: "all .25s ease", cursor: "default" }}>
      {/* Image */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        <SafeImg src={p.img} alt={p.name} className="card-img" style={{ width: "100%", height: 170, objectFit: "cover", display: "block", transition: "transform .5s ease" }}/>
        {p.badge && <span style={{ position: "absolute", top: 8, left: 8, padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 700, background: "rgba(255,255,255,.95)", color: "#1e293b", boxShadow: "0 1px 4px rgba(0,0,0,.1)" }}>{p.badge}</span>}
        {disc > 0 && <span style={{ position: "absolute", top: 8, right: 34, padding: "2px 7px", borderRadius: 99, fontSize: 10, fontWeight: 800, background: "#ef4444", color: "#fff" }}>-{disc}%</span>}
        {oos && <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,.75)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 11, fontWeight: 800, color: "#dc2626", background: "#fff", padding: "4px 12px", borderRadius: 99, boxShadow: "0 2px 8px rgba(0,0,0,.1)" }}>Rupture de stock</span></div>}
        <button onClick={() => { toggle(p.id); push(liked ? "Retiré des favoris" : "Ajouté aux favoris 💛"); }} style={{ position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,.95)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, transition: "transform .2s" }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.15)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
          {liked ? "❤️" : "🤍"}
        </button>
      </div>

      {/* Info */}
      <div style={{ padding: 12, display: "flex", flexDirection: "column", flex: 1 }}>
        <p style={{ fontSize: 10, color: "#94a3b8", marginBottom: 2, textTransform: "uppercase", letterSpacing: .05 }}>{p.cat}</p>
        <p onClick={() => go("product", { product: p })} style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.35, marginBottom: 6, cursor: "pointer", flex: 1, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
          onMouseEnter={e => e.currentTarget.style.color = BLUE}
          onMouseLeave={e => e.currentTarget.style.color = "#1e293b"}>
          {p.name}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
          <Stars rating={p.rating}/>
          <span style={{ fontSize: 10, color: "#94a3b8" }}>({p.rev})</span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: "auto" }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 900, color: BLUE }}>{fmt(p.price)}</p>
            {p.orig && <p style={{ fontSize: 10, color: "#94a3b8", textDecoration: "line-through" }}>{fmt(p.orig)}</p>}
          </div>
          <button onClick={add} disabled={oos} style={{
            display: "flex", alignItems: "center", gap: 4, padding: "7px 11px", borderRadius: 10, border: "none",
            cursor: oos ? "not-allowed" : "pointer", fontWeight: 700, fontSize: 11, fontFamily: "'Sora',sans-serif",
            background: added ? "#10b981" : BLUE, color: "#fff", opacity: oos ? .5 : 1, transition: "background .2s"
          }}>
            {added ? "✓ OK" : "+ Ajouter"}
          </button>
        </div>
      </div>
    </div>
  );
}
