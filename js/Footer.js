/* ═══════════════════════════════════════════════
   KUMPAX STORE — Footer
   ═══════════════════════════════════════════════ */

function Footer({ go }) {
  return (
    <footer style={{ background: "#0a1929", color: "#fff", marginTop: 40 }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 24, marginBottom: 28 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🛍</div>
              <span style={{ fontSize: 17, fontWeight: 900 }}>Kumpax<span style={{ color: "#fbbf24" }}>.</span></span>
            </div>
            <p style={{ color: "#64748b", fontSize: 11, lineHeight: 1.7, marginBottom: 12 }}>Le shopping premium au Sénégal. Produits authentiques, livraison rapide.</p>
            <div style={{ display: "flex", gap: 6 }}>
              {["📘", "📸", "🐦"].map((ic, i) => <button key={i} style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(255,255,255,.08)", border: "none", cursor: "pointer", fontSize: 14 }}>{ic}</button>)}
            </div>
          </div>
          {[
            { t: "Boutique", items: ["Smartphones", "Vêtements", "Électroménager", "TV & Audio"] },
            { t: "Service", items: ["À propos", "Contact", "FAQ", "Retours"] },
            { t: "Contact", items: ["+221 78 384 91 97", "kumpax@kumpax.sn", "Dakar, Sénégal", "Lun–Sam 8h–20h"] }
          ].map((col, i) => (
            <div key={i}>
              <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: .1, color: "#475569", marginBottom: 10 }}>{col.t}</p>
              {col.items.map(l => <p key={l} onClick={() => go("catalog")} style={{ fontSize: 11, color: "#64748b", marginBottom: 6, cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.color = "#fbbf24"}
                onMouseLeave={e => e.currentTarget.style.color = "#64748b"}>{l}</p>)}
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,.08)", paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <p style={{ fontSize: 10, color: "#475569" }}>© 2026 Kumpax Store. Tous droits réservés. 🇸🇳</p>
          <div style={{ display: "flex", gap: 6 }}>
            {["Wave", "Orange Money", "Free Money", "Cash"].map(m => <span key={m} style={{ fontSize: 9, background: "rgba(255,255,255,.08)", padding: "3px 8px", borderRadius: 99, color: "#64748b" }}>{m}</span>)}
          </div>
        </div>
      </div>
    </footer>
  );
}
