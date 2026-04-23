/* ═══════════════════════════════════════════════
   KUMPAX STORE — Navbar + Bottom Navigation (Mobile-First)
   Dark Upgrade : Top Promo Bar défilante + Cart animé
   ═══════════════════════════════════════════════ */

const PROMO_BAR_MESSAGES = [
  { icon: "⚡", text: "Livraison Partout au Sénégal" },
  { icon: "🔒", text: "Paiement sécurisé — Wave & Orange Money" },
  { icon: "🎁", text: "500+ clients satisfaits cette semaine" },
  { icon: "🚚", text: "Livraison 24-48h à Dakar" },
  { icon: "📞", text: "Support 7j/7 — +221 78 384 91 97" },
  { icon: "💎", text: "Produits authentiques & garantis" },
];

function TopPromoBar() {
  // Double le tableau pour l'illusion du défilement infini
  const items = [...PROMO_BAR_MESSAGES, ...PROMO_BAR_MESSAGES];
  return (
    <div className="top-promo-bar" role="marquee" aria-label="Informations promotionnelles">
      <div className="top-promo-bar-track">
        {items.map((msg, i) => (
          <span key={i} className="top-promo-bar-item">
            <span>{msg.icon}</span>
            <span>{msg.text}</span>
            {i < items.length - 1 && <span className="top-promo-bar-sep">·</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

function Navbar({ go, setCartOpen, q, setQ, categories = CATS }) {
  const { count } = useCart();
  const { count: wc } = useWish();
  const [searchOpen, setSearchOpen] = useState(false);
  const [activePage, setActivePage] = useState("home");
  const [prevCount, setPrevCount] = useState(count);
  const [cartPing, setCartPing] = useState(false);
  const searchRef = useRef(null);

  // Keep activePage in sync
  const nav = (page, opts) => {
    setActivePage(page);
    go(page, opts);
    setSearchOpen(false);
  };

  // Ping badge panier quand le count augmente
  useEffect(() => {
    if (count > prevCount) {
      setCartPing(true);
      setTimeout(() => setCartPing(false), 900);
    }
    setPrevCount(count);
  }, [count]);

  // Close search on Escape
  useEffect(() => {
    const h = e => e.key === "Escape" && setSearchOpen(false);
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 80);
    }
  }, [searchOpen]);

  return (
    <>
      {/* ── Top Promo Bar ── */}
      <TopPromoBar />

      {/* ── Top bar ── */}
      <nav className="top-nav" role="navigation" aria-label="Navigation principale">
        <div className="top-nav-inner">

          {/* Logo */}
          <button onClick={() => nav("home")} aria-label="Accueil Kumpax Store"
            style={{ display: "flex", alignItems: "center", gap: 9, border: "none", background: "none", minHeight: "auto", padding: 0 }}>
            <span className="wordmark-embed wordmark-embed-nav">
              <span className="wordmark-kumpax">Kumpax</span>
              <span className="wordmark-dot">.</span>
              <span className="wordmark-store">Store</span>
            </span>
          </button>

          {/* Desktop search */}
          <div className="hide-mobile" style={{ flex: 1, maxWidth: 380, position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 15, pointerEvents: "none" }}>🔍</span>
            <input value={q} onChange={e => setQ(e.target.value)}
              onKeyDown={e => e.key === "Enter" && q.trim() && nav("catalog")}
              placeholder="Rechercher un produit..."
              aria-label="Rechercher un produit"
              style={{ width: "100%", paddingLeft: 42, paddingRight: q ? 36 : 16, paddingTop: 11, paddingBottom: 11, borderRadius: 14, border: "1px solid var(--border)", background: "var(--glass-bg-2)", color: "var(--text-primary)", fontSize: 14, fontFamily: FONT_BODY }} />
            {q && <button onClick={() => setQ("")} aria-label="Effacer" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", color: "var(--text-muted)", fontSize: 14, minHeight: "auto" }}>✕</button>}
          </div>

          {/* Desktop actions */}
          <div className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button onClick={() => nav("wishlist")} aria-label={`Favoris${wc > 0 ? `, ${wc}` : ""}`}
              style={{ position: "relative", padding: "8px", borderRadius: 12, border: "none", background: "none", color: "var(--text-muted)", fontSize: 19, transition: "color 150ms", minHeight: "auto" }}
              onMouseEnter={e => e.currentTarget.style.color = "var(--cyan)"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>
              🤍
              {wc > 0 && <span style={{ position: "absolute", top: 2, right: 2, width: 16, height: 16, borderRadius: "50%", background: "#EF4444", color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{wc}</span>}
            </button>
            <button onClick={() => setCartOpen(true)} aria-label={`Panier${count > 0 ? `, ${count} articles` : ""}`} style={{
              position: "relative", display: "flex", alignItems: "center", gap: 7, padding: "9px 16px",
              borderRadius: 12, border: "1px solid var(--border-blue)", background: "rgba(4,58,248,0.15)",
              color: "var(--cyan)", fontWeight: 700, fontSize: 13, fontFamily: FONT_CTA,
              transition: "all 200ms var(--ease-out)", minHeight: "auto",
              boxShadow: "0 0 12px rgba(4,58,248,0.2)",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(4,58,248,0.28)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(4,58,248,0.4)" }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(4,58,248,0.15)"; e.currentTarget.style.boxShadow = "0 0 12px rgba(4,58,248,0.2)" }}>
              🛒 Panier
              {count > 0 && <span className={cartPing ? "cart-badge-ping" : ""} style={{ position: "absolute", top: -5, right: -5, width: 20, height: 20, borderRadius: "50%", background: "linear-gradient(135deg, var(--blue), var(--cyan))", color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(4,58,248,0.5)" }}>{count}</span>}
            </button>
          </div>

          {/* Mobile — search icon only */}
          <button onClick={() => setSearchOpen(true)} className="show-mobile-only" aria-label="Rechercher"
            style={{ padding: "8px 10px", border: "none", background: "none", fontSize: 20, color: "var(--text-muted)", minHeight: "auto" }}>
            🔍
          </button>
        </div>

        {/* Desktop categories bar */}
        <div className="hide-mobile" style={{ maxWidth: 1280, margin: "0 auto", padding: "0 20px 12px", display: "flex", gap: 28, overflowX: "auto", scrollbarWidth: "none" }} role="menubar" aria-label="Catégories">
          {["Tous", ...categories.map(c => c.name)].map(c => (
            <button key={c} onClick={() => nav("catalog", { cat: c })} role="menuitem"
              className="nav-link" style={{ border: "none", background: "none", cursor: "pointer", padding: "0 0 4px", fontFamily: FONT_BODY, minHeight: "auto" }}>
              {c}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Mobile search overlay (slides up) ── */}
      {searchOpen && (
        <div className="search-overlay" onClick={() => setSearchOpen(false)} role="dialog" aria-modal="true" aria-label="Recherche">
          <div className="search-sheet" onClick={e => e.stopPropagation()}>
            {/* Handle */}
            <div style={{ width: 36, height: 4, borderRadius: 2, background: "var(--border)", margin: "0 auto 16px" }} />
            <div className="search-input-wrap">
              <span style={{ fontSize: 18, flexShrink: 0 }}>🔍</span>
              <input
                ref={searchRef}
                value={q}
                onChange={e => setQ(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && q.trim()) { nav("catalog"); } }}
                placeholder="Rechercher un produit..."
                aria-label="Rechercher un produit"
              />
              {q && <button onClick={() => setQ("")} aria-label="Effacer" style={{ border: "none", background: "none", color: "var(--text-muted)", fontSize: 16, flexShrink: 0, minHeight: "auto" }}>✕</button>}
            </div>
            {/* Quick categories */}
            <div style={{ marginTop: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 10, fontFamily: FONT_HEADING }}>Catégories rapides</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {categories.slice(0, 6).map(c => (
                  <button key={c.id} onClick={() => { nav("catalog", { cat: c.name }); }} style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
                    borderRadius: 99, border: "1px solid var(--border)", background: "var(--glass-bg-2)",
                    fontSize: 13, fontWeight: 500, fontFamily: FONT_BODY, cursor: "pointer",
                    color: "var(--text-secondary)", minHeight: "auto",
                  }}>
                    <span>{c.icon}</span>{c.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom Navigation Bar (mobile only) ── */}
      <nav className="bottom-nav" role="navigation" aria-label="Navigation principale mobile">
        {[
          { page: "home", icon: "🏠", label: "Accueil" },
          { page: "catalog", icon: "🛍", label: "Catalogue" },
          { page: "wishlist", icon: "🤍", label: "Favoris", badge: wc },
        ].map(item => (
          <button key={item.page} className={`bottom-nav-item${activePage === item.page ? " active" : ""}`}
            onClick={() => nav(item.page)} aria-label={item.label}>
            <span className="icon">{item.icon}</span>
            <span className="label">{item.label}</span>
            {item.badge > 0 && <span className="bottom-nav-badge">{item.badge}</span>}
          </button>
        ))}

        {/* Cart — central emphasis */}
        <button className="bottom-nav-item" onClick={() => setCartOpen(true)} aria-label={`Panier${count > 0 ? `, ${count} articles` : ""}`}
          style={{ position: "relative", overflow: "visible" }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, var(--blue), var(--cyan))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, marginTop: -14,
            boxShadow: "0 4px 16px rgba(4,58,248,.35)",
          }}>🛒</div>
          {count > 0 && <span className={`bottom-nav-badge${cartPing ? " cart-badge-ping" : ""}`} style={{ top: -2, right: "calc(50% - 18px)" }}>{count}</span>}
          <span className="label" style={{ marginTop: 2, overflow: "visible" }}>Panier</span>
        </button>
      </nav>
    </>
  );
}
