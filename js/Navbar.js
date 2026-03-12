/* ═══════════════════════════════════════════════
   KUMPAX STORE — Navbar
   ═══════════════════════════════════════════════ */

function Navbar({ go, setCartOpen, q, setQ, categories = CATS }) {
  const { count } = useCart();
  const { count: wc } = useWish();
  const [mob, setMob] = useState(false);

  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 40, background: "#fff", borderBottom: "1px solid #f1f5f9", boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, gap: 12 }}>

        {/* Logo */}
        <button onClick={() => go("home")} style={{ display: "flex", alignItems: "center", gap: 8, border: "none", background: "none", cursor: "pointer" }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: grad, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 16 }}>🛍</span>
          </div>
          <span style={{ fontSize: 18, fontWeight: 900, color: DARK_BLUE, fontFamily: "'Sora',sans-serif" }}>Kumpax<span style={{ color: "#f59e0b" }}>.</span></span>
        </button>

        {/* Search */}
        <div className="hide-mobile" style={{ flex: 1, maxWidth: 340 }}>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 14 }}>🔍</span>
            <input value={q} onChange={e => setQ(e.target.value)}
              onKeyDown={e => e.key === "Enter" && q.trim() && go("catalog")}
              placeholder="Rechercher un produit..."
              style={{ width: "100%", paddingLeft: 34, paddingRight: q ? 30 : 12, paddingTop: 8, paddingBottom: 8, borderRadius: 12, border: "1px solid #e2e8f0", background: "#f8fafc", fontSize: 13, fontFamily: "'Sora',sans-serif" }}/>
            {q && <button onClick={() => setQ("")} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", cursor: "pointer", color: "#94a3b8", fontSize: 14 }}>✕</button>}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button onClick={() => go("wishlist")} className="hide-mobile" style={{ position: "relative", padding: "8px 10px", borderRadius: 10, border: "none", background: "none", cursor: "pointer", color: "#64748b", fontSize: 18 }}>
            🤍
            {wc > 0 && <span style={{ position: "absolute", top: 2, right: 2, width: 16, height: 16, borderRadius: "50%", background: "#ef4444", color: "#fff", fontSize: 9, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{wc}</span>}
          </button>
          <button onClick={() => go("account")} className="hide-mobile" style={{ padding: "8px 10px", borderRadius: 10, border: "none", background: "none", cursor: "pointer", color: "#64748b", fontSize: 18 }}>👤</button>
          <button onClick={() => setCartOpen(true)} style={{ position: "relative", display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: "none", background: "#eff6ff", cursor: "pointer", color: BLUE, fontWeight: 700, fontSize: 13, fontFamily: "'Sora',sans-serif" }}>
            🛒 <span className="hide-mobile">Panier</span>
            {count > 0 && <span style={{ position: "absolute", top: -4, right: -4, width: 20, height: 20, borderRadius: "50%", background: BLUE, color: "#fff", fontSize: 10, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{count}</span>}
          </button>
          <button onClick={() => setMob(!mob)} className="show-mobile-only" style={{ padding: 8, borderRadius: 10, border: "none", background: "none", cursor: "pointer", fontSize: 18 }}>
            {mob ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Categories bar */}
      <div className="hide-mobile" style={{ maxWidth: 1280, margin: "0 auto", padding: "0 16px 10px", display: "flex", gap: 20, overflowX: "auto" }}>
        {["Tous", ...categories.map(c => c.name)].map(c => (
          <button key={c} onClick={() => go("catalog", { cat: c })} className="nav-link" style={{ border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, color: "#64748b", whiteSpace: "nowrap", padding: "0 0 4px", fontFamily: "'Sora',sans-serif" }}>
            {c}
          </button>
        ))}
      </div>

      {/* Mobile menu */}
      {mob && (
        <div style={{ background: "#fff", borderTop: "1px solid #f1f5f9", padding: "12px 16px" }}>
          <div style={{ position: "relative", marginBottom: 10 }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>🔍</span>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Rechercher..."
              style={{ width: "100%", paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, borderRadius: 10, border: "1px solid #e2e8f0", background: "#f8fafc", fontSize: 13, fontFamily: "'Sora',sans-serif" }}/>
          </div>
          {categories.map(c => (
            <button key={c.id} onClick={() => { go("catalog", { cat: c.name }); setMob(false); }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 4px", border: "none", background: "none", cursor: "pointer", fontSize: 13, color: "#334155", fontFamily: "'Sora',sans-serif" }}>
              <span>{c.icon}</span>{c.name}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
