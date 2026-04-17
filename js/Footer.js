/* ═══════════════════════════════════════════════
   KUMPAX STORE — Footer
   ═══════════════════════════════════════════════ */

function Footer({ go }) {
  const year = new Date().getFullYear();

  return (
    <footer role="contentinfo" style={{ background: "#0A1929", color: "#fff", marginTop: 0 }}>
      {/* Main footer content */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 20px 32px" }}>
        <div className="footer-grid" style={{ display: "grid", gap: 32, marginBottom: 36 }}>

          {/* Brand column */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <span className="logo-embed logo-embed-footer">
                <img
                  src="assets/kumpax-logo.png"
                  alt="Kumpax Store"
                  style={{ height: 48, width: "auto", objectFit: "contain", display: "block" }}
                />
              </span>
            </div>
            <p style={{ color: "#64748B", fontSize: 13, lineHeight: 1.7, marginBottom: 20, maxWidth: 280, fontFamily: FONT_BODY }}>
              Le shopping premium au Sénégal. Produits authentiques, livraison rapide, paiement flexible.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                "Facebook",
                "Instagram",
                "Twitter",
              ].map((label, i) => (
                <button key={i} aria-label={label} style={{
                  minWidth: 82, height: 34, borderRadius: 10, padding: "0 12px",
                  background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.08)",
                  cursor: "pointer", fontSize: 12, color: "#cbd5e1", display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 200ms",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.12)"; e.currentTarget.style.transform = "translateY(-2px)" }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.06)"; e.currentTarget.style.transform = "none" }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation columns */}
          {[
            { t: "Boutique", items: ["Smartphones", "Vêtements", "Électroménager", "TV & Audio"] },
            { t: "Service",  items: ["À propos", "Contact", "FAQ", "Retours"] },
            { t: "Contact",  items: ["+221 78 384 91 97", "support@kumpax.sn", "Dakar, Sénégal", "Lun–Sam 8h–20h"] },
          ].map((col, i) => (
            <nav key={i} aria-label={col.t}>
              <p style={{
                fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
                color: "#475569", marginBottom: 14, fontFamily: FONT_HEADING,
              }}>{col.t}</p>
              {col.items.map(l => (
                <p key={l} onClick={() => go("catalog")} style={{
                  fontSize: 13, color: "#64748B", marginBottom: 8, cursor: "pointer",
                  fontFamily: FONT_BODY, transition: "color 200ms",
                  wordBreak: "break-word", overflowWrap: "break-word",
                }}
                  onMouseEnter={e => e.currentTarget.style.color = "#FBBF24"}
                  onMouseLeave={e => e.currentTarget.style.color = "#64748B"}>
                  {l}
                </p>
              ))}
            </nav>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: "1px solid rgba(255,255,255,.06)", paddingTop: 20,
          display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12,
        }}>
          <p style={{ fontSize: 12, color: "#475569", fontFamily: FONT_BODY }}>
            © {year} Kumpax Store. Tous droits réservés. 🇸🇳
          </p>
        </div>
      </div>
    </footer>
  );
}
