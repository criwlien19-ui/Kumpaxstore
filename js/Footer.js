/* ═══════════════════════════════════════════════
   KUMPAX STORE — Footer (Dark Upgrade)
   Trust badges, paiement, liens SEO
   ═══════════════════════════════════════════════ */

function Footer({ go }) {
  const year = new Date().getFullYear();

  const trustBadges = [
    { icon: "🔒", label: "Paiement Sécurisé" },
    { icon: (
        <svg viewBox="0 0 64 64" width="16" height="16" style={{ display: 'block' }}>
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
        <svg viewBox="0 0 64 64" width="16" height="16" style={{ display: 'block' }}>
          <g strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d="M 10 14 L 30 14 L 30 34 M 10 34 L 30 14" stroke="#fff" />
            <path d="M 54 50 L 34 50 L 34 30 M 54 30 L 34 50" stroke="#FF6600" />
          </g>
        </svg>
      ), label: "Orange Money" },
    { icon: "💵", label: "Cash à la livraison" },
    { icon: "🚚", label: "Livraison Partout" },
    { icon: "🔄", label: "Retour 7 jours" },
  ];

  return (
    <footer role="contentinfo" style={{ background: "rgba(5,8,26,0.98)", borderTop: "1px solid var(--border)", marginTop: 0 }}>

      {/* ── Trust badges strip ── */}
      <div style={{ borderBottom: "1px solid var(--border-light)", padding: "16px 20px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div className="trust-badge-row" style={{ justifyContent: "center" }}>
            {trustBadges.map((b, i) => (
              <div key={i} className="trust-badge" style={{ animationDelay: `${i * 60}ms` }}>
                <span className="trust-badge-icon">{b.icon}</span>
                <span>{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 20px 28px" }}>
        <div className="footer-grid" style={{ display: "grid", gap: 32, marginBottom: 32 }}>

          {/* Brand column */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <span className="wordmark-embed wordmark-embed-footer">
                <span className="wordmark-kumpax">Kumpax</span>
                <span className="wordmark-dot">.</span>
                <span className="wordmark-store">Store</span>
              </span>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.7, marginBottom: 20, maxWidth: 280, fontFamily: FONT_BODY }}>
              Le shopping premium au Sénégal. Produits authentiques, livraison rapide, paiement flexible.
            </p>

            {/* Social */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {[
                { label: "Facebook", icon: "f" },
                { label: "Instagram", icon: "ig" },
                { label: "WhatsApp", icon: "wa" },
              ].map((s, i) => (
                <button key={i} aria-label={s.label} style={{
                  minWidth: 82, height: 34, borderRadius: 10, padding: "0 12px",
                  background: "rgba(255,255,255,.06)", border: "1px solid var(--border)",
                  cursor: "pointer", fontSize: 12, color: "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 200ms", fontFamily: FONT_BODY,
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,240,255,0.1)"; e.currentTarget.style.borderColor = "var(--border-hover)"; e.currentTarget.style.transform = "translateY(-2px)" }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.06)"; e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "none" }}>
                  {s.label}
                </button>
              ))}
            </div>

            {/* Contact rapide */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <a href="tel:+221783849197" style={{ fontSize: 13, color: "var(--text-secondary)", fontFamily: FONT_BODY, display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}
                onMouseEnter={e => e.currentTarget.style.color = "var(--cyan)"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--text-secondary)"}>
                📞 +221 78 384 91 97
              </a>
              <a href="mailto:support@kumpax.sn" style={{ fontSize: 13, color: "var(--text-secondary)", fontFamily: FONT_BODY, display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}
                onMouseEnter={e => e.currentTarget.style.color = "var(--cyan)"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--text-secondary)"}>
                ✉️ support@kumpax.sn
              </a>
            </div>
          </div>

          {/* Navigation columns */}
          {[
            { t: "Boutique", items: [
              { l: "Smartphones", action: () => go("catalog") },
              { l: "Vêtements", action: () => go("catalog") },
              { l: "Électroménager", action: () => go("catalog") },
              { l: "TV & Audio", action: () => go("catalog") },
              { l: "Beauté", action: () => go("catalog") },
              { l: "Alimentation", action: () => go("catalog") },
            ]},
            { t: "Service Client", items: [
              { l: "FAQ", action: () => go("home") },
              { l: "Politique de retour", action: () => go("home") },
              { l: "Conditions générales", action: () => go("home") },
              { l: "Confidentialité", action: () => go("home") },
            ]},
            { t: "Informations", items: [
              { l: "À propos de Kumpax", action: () => go("home") },
              { l: "Dakar, Sénégal 🇸🇳", action: null },
              { l: "Lun–Sam 8h–20h", action: null },
              { l: "Livraison Partout", action: null },
            ]},
          ].map((col, i) => (
            <nav key={i} aria-label={col.t}>
              <p style={{
                fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
                color: "var(--text-muted)", marginBottom: 14, fontFamily: FONT_HEADING,
              }}>{col.t}</p>
              {col.items.map(item => (
                <p key={item.l} onClick={item.action || undefined} style={{
                  fontSize: 13, color: "var(--text-muted)", marginBottom: 10, cursor: item.action ? "pointer" : "default",
                  fontFamily: FONT_BODY, transition: "color 200ms",
                  wordBreak: "break-word", overflowWrap: "break-word",
                }}
                  onMouseEnter={e => item.action && (e.currentTarget.style.color = "var(--cyan)")}
                  onMouseLeave={e => item.action && (e.currentTarget.style.color = "var(--text-muted)")}>
                  {item.l}
                </p>
              ))}
            </nav>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: "1px solid var(--border-light)", paddingTop: 20,
          display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12,
        }}>
          <p style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: FONT_BODY }}>
            © {year} Kumpax Store. Tous droits réservés. 🇸🇳
          </p>
          <p style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: FONT_BODY }}>
            Fait avec ❤️ au Sénégal
          </p>
        </div>
      </div>
    </footer>
  );
}
