/* ═══════════════════════════════════════════════
   KUMPAX STORE — Pages
   (Home, Catalog, ProductPage, Checkout, Wishlist, Account)
   ═══════════════════════════════════════════════ */

function PromoPopup({ promotions = [], products = [], go }) {
  const [open, setOpen] = useState(false);
  const [dismissedId, setDismissedId] = useState(() => {
    try { return localStorage.getItem("kumpax_promo_dismissed") || ""; } catch { return ""; }
  });
  const [eligible, setEligible] = useState(false);
  const [triggerReason, setTriggerReason] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(null);

  const popupPromo = useMemo(
    () => promotions.find(p => p.popupEnabled && p.active && p.id !== dismissedId),
    [promotions, dismissedId]
  );

  useEffect(() => {
    if (!popupPromo || open) return;
    let shownThisSession = false;
    let idleTimer = null;
    let opened = false;

    const safeGetNum = (k) => {
      try { return Number(sessionStorage.getItem(k) || 0); } catch { return 0; }
    };
    const safeSetNum = (k, v) => {
      try { sessionStorage.setItem(k, String(v)); } catch {}
    };
    const safeGetTs = (k) => {
      try { return Number(localStorage.getItem(k) || 0); } catch { return 0; }
    };
    const safeSetTs = (k, v) => {
      try { localStorage.setItem(k, String(v)); } catch {}
    };

    const now = Date.now();
    const lastShown = safeGetTs("kumpax_promo_last_shown_at");
    const cooldownMs = 4 * 60 * 60 * 1000; // 4h
    const alreadyShownCount = safeGetNum("kumpax_promo_shown_count_session");
    if ((lastShown && (now - lastShown) < cooldownMs) || alreadyShownCount >= 1) return;

    const markShownAndOpen = (reason) => {
      if (opened || shownThisSession) return;
      opened = true;
      shownThisSession = true;
      safeSetTs("kumpax_promo_last_shown_at", Date.now());
      safeSetNum("kumpax_promo_shown_count_session", alreadyShownCount + 1);
      setTriggerReason(reason);
      setEligible(true);
      setOpen(true);
    };

    const scheduleIdleOpen = () => {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => markShownAndOpen("idle"), 12000);
    };

    const onScroll = () => {
      const doc = document.documentElement;
      const h = Math.max(1, doc.scrollHeight - window.innerHeight);
      const ratio = window.scrollY / h;
      if (ratio >= 0.45) markShownAndOpen("scroll");
    };

    const onMouseOut = (e) => {
      if (e.relatedTarget === null && e.clientY <= 0) {
        markShownAndOpen("exit-intent");
      }
    };

    const onUserActivity = () => {
      if (opened) return;
      scheduleIdleOpen();
    };

    const baseDelay = setTimeout(() => {
      markShownAndOpen("entry");
      scheduleIdleOpen();
    }, 3500);

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("mouseout", onMouseOut);
    window.addEventListener("mousemove", onUserActivity, { passive: true });
    window.addEventListener("keydown", onUserActivity);
    window.addEventListener("touchstart", onUserActivity, { passive: true });

    return () => {
      clearTimeout(baseDelay);
      if (idleTimer) clearTimeout(idleTimer);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseout", onMouseOut);
      window.removeEventListener("mousemove", onUserActivity);
      window.removeEventListener("keydown", onUserActivity);
      window.removeEventListener("touchstart", onUserActivity);
    };
  }, [popupPromo, open]);

  useEffect(() => {
    if (!popupPromo?.endAt || !open) {
      setSecondsLeft(null);
      return;
    }
    const tick = () => {
      const endTs = new Date(popupPromo.endAt).getTime();
      const left = Math.floor((endTs - Date.now()) / 1000);
      setSecondsLeft(left > 0 ? left : 0);
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [popupPromo, open]);

  if (!popupPromo || !open || !eligible) return null;

  const popupProducts = (popupPromo.productIds || [])
    .map(pid => products.find(p => p.id === pid))
    .filter(Boolean)
    .slice(0, 4);

  const close = (remember = false) => {
    setOpen(false);
    if (remember) {
      setDismissedId(popupPromo.id);
      try { localStorage.setItem("kumpax_promo_dismissed", popupPromo.id); } catch {}
    }
  };

  const reasonLabel = triggerReason === "exit-intent"
    ? "Avant de partir"
    : triggerReason === "scroll"
      ? "Sélection pour vous"
      : triggerReason === "idle"
        ? "Offre à ne pas rater"
        : "Offre du moment";

  const formatCountdown = (s) => {
    if (s === null || s <= 0) return null;
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };
  const countdown = formatCountdown(secondsLeft);

  return (
    <div onClick={() => close(false)} style={{ position: "fixed", inset: 0, background: "radial-gradient(circle at 20% 15%, rgba(59,130,246,.20), rgba(2,6,23,.82))", backdropFilter: "blur(2px)", zIndex: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={e => e.stopPropagation()} className="toast-in" style={{ width: "min(92vw, 500px)", background: "#fff", borderRadius: 24, overflow: "hidden", boxShadow: "0 28px 80px rgba(2,6,23,.45)", border: "1px solid #E2E8F0" }}>
        <div style={{ background: "linear-gradient(130deg, #0F4C81 0%, #1E40AF 55%, #3B82F6 100%)", color: "#fff", padding: "22px 20px 18px", position: "relative" }}>
          <div style={{ position: "absolute", right: -30, top: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,.12)" }} />
          <button onClick={() => close(false)} style={{ position: "absolute", right: 12, top: 12, border: "none", background: "rgba(255,255,255,.18)", color: "#fff", borderRadius: 10, width: 30, height: 30, minHeight: "auto" }}>✕</button>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <p style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", opacity: .9, fontFamily: FONT_HEADING, margin: 0 }}>{reasonLabel}</p>
            {countdown && <span style={{ fontSize: 10, fontWeight: 700, background: "rgba(251,191,36,.2)", color: "#FDE68A", border: "1px solid rgba(251,191,36,.35)", padding: "3px 8px", borderRadius: 99 }}>Se termine dans {countdown}</span>}
          </div>
          <h3 style={{ fontSize: 26, lineHeight: 1.12, marginTop: 10, fontFamily: FONT_HEADING }}>
            {popupPromo.discountType === "percent" ? `-${popupPromo.discountValue}%` : `-${fmt(popupPromo.discountValue)}`} sur une sélection
          </h3>
        </div>
        <div style={{ padding: 18 }}>
          <p style={{ fontSize: 17, fontWeight: 700, marginBottom: 6, color: "#0F172A", fontFamily: FONT_HEADING }}>{popupPromo.title}</p>
          <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.6, marginBottom: 16, fontFamily: FONT_BODY }}>{popupPromo.message || "Profitez de cette réduction avant la fin de l'offre."}</p>
          {popupProducts.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
              {popupProducts.map(pp => {
                const pricing = getDiscountedPricing(pp, [popupPromo]);
                return (
                  <button key={pp.id} onClick={() => { close(false); go("product", { product: pp }); }} style={{ border: "1px solid #E2E8F0", borderRadius: 12, background: "#fff", padding: 6, textAlign: "left", cursor: "pointer", minHeight: "auto", boxShadow: "0 4px 10px rgba(15,23,42,.05)" }}>
                    <SafeImg src={pp.img} alt={pp.name} style={{ width: "100%", height: 72, borderRadius: 8, objectFit: "cover", marginBottom: 6 }} />
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#0F172A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 2 }}>{pp.name}</p>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#1E40AF" }}>{fmt(pricing.price)}</p>
                  </button>
                );
              })}
            </div>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => { close(false); go("catalog"); }} style={{ flex: 1, border: "none", borderRadius: 12, background: BLUE, color: "#fff", padding: "12px 14px", fontWeight: 700, fontFamily: FONT_HEADING, boxShadow: "0 8px 18px rgba(30,64,175,.28)" }}>
              {popupPromo.ctaLabel || "Voir l'offre"}
            </button>
            <button onClick={() => close(true)} style={{ border: "1px solid #E2E8F0", borderRadius: 12, background: "#fff", color: "#64748B", padding: "12px 14px", minHeight: "auto" }}>
              Plus tard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// ── HOME ──
// ══════════════════════════════════════════════
function Home({ go, products = PRODS, categories = CATS, loading = false, promotions = [] }) {
  return (
    <div>
      <PromoPopup promotions={promotions} products={products} go={go} />
      {/* ── Hero — asymmetric layout with grain texture ── */}
      <div className="grain" style={{ background: grad, position: "relative", overflow: "hidden" }}>
        {/* Organic blobs */}
        <div style={{ position: "absolute", inset: 0, opacity: .06, pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: -20, left: "10%", width: 280, height: 280, borderRadius: "50%", background: "#fff", filter: "blur(80px)" }} />
          <div style={{ position: "absolute", bottom: -40, right: "5%", width: 200, height: 200, borderRadius: "50%", background: "#FBBF24", filter: "blur(60px)" }} />
          <div style={{ position: "absolute", top: "60%", left: "45%", width: 120, height: 120, borderRadius: "50%", background: "#fff", filter: "blur(50px)" }} />
        </div>

        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(36px,8vw,72px) 16px clamp(40px,8vw,72px)", position: "relative", zIndex: 2 }}>
          <div className="hero-grid" style={{ display: "grid", gap: 48, alignItems: "center" }}>

            {/* Left — text content */}
            <div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(255,255,255,.12)", borderRadius: 99,
                padding: "7px 18px", fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,.9)",
                marginBottom: 28, fontFamily: FONT_BODY, backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,.1)",
              }}>
                ⚡ Livraison gratuite à Dakar
              </div>

              <h1 style={{
                fontSize: "clamp(30px, 5vw, 52px)", fontWeight: 700, color: "#fff",
                lineHeight: 1.1, marginBottom: 20, fontFamily: FONT_HEADING, letterSpacing: "-0.03em",
              }}>
                Le Shopping<br />Premium au<br /><span style={{ color: "#FBBF24" }}>Sénégal 🇸🇳</span>
              </h1>

              <p style={{
                color: "rgba(255,255,255,.7)", fontSize: 15, lineHeight: 1.75,
                marginBottom: 32, maxWidth: 420, fontFamily: FONT_BODY,
              }}>
                Des milliers de produits authentiques et importés, livrés chez vous en 24–48h. Paiement flexible.
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 40 }}>
                <button onClick={() => go("catalog")} style={{
                  padding: "13px 26px", background: "#FBBF24", color: "#1E293B", border: "none",
                  borderRadius: 14, fontWeight: 600, fontSize: 14, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 8,
                  boxShadow: "0 4px 20px rgba(251,191,36,.35)", fontFamily: FONT_HEADING,
                  transition: "all 250ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px) scale(1.03)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "none"}>
                  Explorer le catalogue →
                </button>
                <button onClick={() => go("catalog", { cat: "Vêtements" })} style={{
                  padding: "13px 26px", background: "rgba(255,255,255,.1)", color: "#fff",
                  border: "1px solid rgba(255,255,255,.2)", borderRadius: 14, fontWeight: 500,
                  fontSize: 14, cursor: "pointer", fontFamily: FONT_BODY, backdropFilter: "blur(8px)",
                  transition: "all 200ms",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.18)"; e.currentTarget.style.borderColor = "rgba(255,255,255,.35)" }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,.2)" }}>
                  Mode Sénégalaise
                </button>
              </div>

              <div className="hero-stats" style={{ display: "flex", gap: 36 }}>
                {[["5K+", "Produits"], ["98%", "Satisfaits"], ["24h", "Livraison"]].map(([v, l]) => (
                  <div key={l}>
                    <p style={{ fontSize: 22, fontWeight: 700, color: "#FBBF24", fontFamily: FONT_HEADING, letterSpacing: "-0.02em" }}>{v}</p>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,.5)", fontFamily: FONT_BODY }}>{l}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — product grid (desktop) */}
            <div className="hero-mini-grid hide-mobile" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, width: "100%", maxWidth: 320 }}>
              {products.slice(0, 4).map((p, i) => (
                <div key={p.id} onClick={() => go("product", { product: p })} style={{
                  background: "rgba(255,255,255,.08)", backdropFilter: "blur(12px)",
                  borderRadius: 16, overflow: "hidden",
                  border: "1px solid rgba(255,255,255,.12)", cursor: "pointer",
                  marginTop: i === 1 || i === 3 ? 20 : 0,
                  transition: "all 250ms cubic-bezier(0.16, 1, 0.3, 1)",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.16)"; e.currentTarget.style.transform = "translateY(-4px)" }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.08)"; e.currentTarget.style.transform = "none" }}>
                  <SafeImg src={p.img} alt={p.name} style={{ width: "100%", height: 100, objectFit: "cover" }} />
                  <div style={{ padding: 10 }}>
                    <p style={{ color: "#fff", fontSize: 11, fontWeight: 600, fontFamily: FONT_BODY, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{p.name}</p>
                    <p style={{ color: "#FBBF24", fontSize: 11, fontWeight: 700, fontFamily: FONT_HEADING, marginTop: 2 }}>{fmt(p.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Trust bar — horizontal scroll on mobile ── */}
      <div style={{ background: "#fff", borderBottom: "1px solid #F1F5F9" }}>
        <div style={{ overflowX: "auto", scrollbarWidth: "none" }}>
          <div style={{ display: "flex", gap: 4, padding: "10px 16px", width: "max-content", minWidth: "100%" }}>
            {[
              ["🚚", "Livraison 24-48h", "À Dakar"],
              ["🔒", "Paiement Sécurisé", "Wave & OM"],
              ["🔄", "Retour Facile", "7 jours"],
              ["📞", "Support 7j/7", "+221 78 384 91 97"],
            ].map(([ic, t, s], i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 14, flexShrink: 0, minWidth: 140 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>{ic}</div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#1E293B", fontFamily: FONT_BODY, whiteSpace: "nowrap" }}>{t}</p>
                  <p style={{ fontSize: 11, color: "#94A3B8", fontFamily: FONT_BODY, whiteSpace: "nowrap" }}>{s}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(32px,6vw,56px) 16px clamp(40px,6vw,64px)" }}>

        {/* Categories — Bento-style grid */}
        <section style={{ marginBottom: 64 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0F172A", fontFamily: FONT_HEADING, letterSpacing: "-0.02em" }}>Catégories Populaires</h2>
              <p style={{ fontSize: 13, color: "#94A3B8", marginTop: 4, fontFamily: FONT_BODY }}>Trouvez ce qu'il vous faut</p>
            </div>
            <button onClick={() => go("catalog")} style={{ fontSize: 13, fontWeight: 600, color: BLUE, border: "none", background: "none", cursor: "pointer", fontFamily: FONT_BODY, transition: "opacity 150ms" }}
              onMouseEnter={e => e.currentTarget.style.opacity = ".7"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}>Voir tout →</button>
          </div>
          <div className="cat-grid stagger" style={{ display: "grid", gap: 10 }}>
            {categories.map(c => (
              <button key={c.id} onClick={() => go("catalog", { cat: c.name })} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "18px 10px",
                borderRadius: 18, border: "1px solid transparent", background: c.bg, cursor: "pointer",
                fontFamily: FONT_BODY, transition: "all 250ms cubic-bezier(0.16, 1, 0.3, 1)",
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,.08)"; e.currentTarget.style.transform = "translateY(-4px)" }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none" }}>
                <span style={{ fontSize: 30 }}>{c.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#334155", textAlign: "center", lineHeight: 1.3 }}>{c.name}</span>
                <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 10px", borderRadius: 99, background: "rgba(255,255,255,.7)", color: c.accent }}>{c.count}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Trending products */}
        <section style={{ marginBottom: 64 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 14, color: "#F59E0B" }}>📈</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#F59E0B", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: FONT_HEADING }}>Tendances Sénégal</span>
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0F172A", fontFamily: FONT_HEADING, letterSpacing: "-0.02em" }}>Produits du Moment</h2>
            </div>
            <button onClick={() => go("catalog")} style={{ fontSize: 13, fontWeight: 600, color: BLUE, border: "none", background: "none", cursor: "pointer", fontFamily: FONT_BODY }}>Voir tout →</button>
          </div>
          {/* Mobile: horizontal scroll strip — Desktop: grid */}
          <div className="show-mobile-only">
            <div className="product-scroll">
              {loading
                ? [...Array(6)].map((_, i) => <div key={i} className="product-scroll-item" style={{ background: "#fff", borderRadius: 18, overflow: "hidden" }}><div className="skeleton" style={{ height: 140 }} /><div style={{ padding: 10 }}><div className="skeleton" style={{ height: 10, width: "60%", marginBottom: 6 }} /><div className="skeleton" style={{ height: 12, marginBottom: 4 }} /></div></div>)
                : products.slice(0, 8).map(p => <div key={p.id} className="product-scroll-item"><ProductCard p={p} go={go} promotions={promotions} /></div>)
              }
            </div>
          </div>
          <div className="hide-mobile stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            {loading
              ? [...Array(8)].map((_, i) => <div key={i} style={{ background: "#fff", borderRadius: 18, overflow: "hidden", border: "1px solid #F1F5F9" }}><div className="skeleton" style={{ height: 160 }} /><div style={{ padding: 14 }}><div className="skeleton" style={{ height: 10, width: "60%", marginBottom: 8 }} /><div className="skeleton" style={{ height: 13, marginBottom: 6 }} /></div></div>)
              : products.slice(0, 8).map(p => <ProductCard key={p.id} p={p} go={go} promotions={promotions} />)
            }
          </div>
        </section>

        {/* Promo banner — with diagonal vibe */}
        <div style={{
          borderRadius: 28, padding: "40px 40px", background: grad,
          position: "relative", overflow: "hidden",
        }} className="grain">
          {/* Decorative elements */}
          <div style={{ position: "absolute", right: -50, bottom: -50, width: 240, height: 240, borderRadius: "50%", background: "rgba(255,255,255,.06)" }} />
          <div style={{ position: "absolute", left: -30, top: -30, width: 150, height: 150, borderRadius: "50%", background: "rgba(251,191,36,.08)" }} />

          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 24, position: "relative", zIndex: 2 }}>
            <div style={{ maxWidth: 500 }}>
              <p style={{ color: "#FBBF24", fontWeight: 700, fontSize: 11, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: FONT_HEADING }}>
                🎉 Offre Spéciale — Durée limitée
              </p>
              <h3 style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 700, color: "#fff", marginBottom: 10, fontFamily: FONT_HEADING, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                Jusqu'à <span style={{ color: "#FBBF24" }}>-30%</span> sur les Smartphones
              </h3>
              <p style={{ color: "rgba(255,255,255,.6)", fontSize: 14, fontFamily: FONT_BODY }}>Profitez-en avant la fin du mois !</p>
            </div>
            <button onClick={() => go("catalog", { cat: "Smartphones" })} style={{
              padding: "14px 30px", background: "#FBBF24", color: "#1E293B", border: "none",
              borderRadius: 14, fontWeight: 600, fontSize: 14, cursor: "pointer",
              boxShadow: "0 4px 20px rgba(251,191,36,.4)", fontFamily: FONT_HEADING, flexShrink: 0,
              transition: "all 250ms cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px) scale(1.04)"}
              onMouseLeave={e => e.currentTarget.style.transform = "none"}>
              Profiter →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// ── CATALOG ──
// ══════════════════════════════════════════════
function Catalog({ go, initCat, q, products = PRODS, categories = CATS, promotions = [] }) {
  const [cat, setCat] = useState(initCat || "Tous");
  const [subcat, setSubcat] = useState("");
  const [sort, setSort] = useState("popular");
  const [budget, setBudget] = useState([0, 1000000]);
  const [vis, setVis] = useState(12);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => { if (initCat) setCat(initCat); }, [initCat]);
  useEffect(() => { setVis(12); setSubcat(""); }, [cat, sort]);

  const activeCatObj = categories.find(c => c.name === cat);

  const list = useMemo(() => products.filter(p => {
    const catOk = cat === "Tous" || p.cat === cat;
    const subcatOk = !subcat || p.subcat === subcat;
    const priceOk = p.price >= budget[0] && p.price <= budget[1];
    const qOk = !q.trim() || p.name.toLowerCase().includes(q.toLowerCase()) || p.cat.toLowerCase().includes(q.toLowerCase());
    return catOk && subcatOk && priceOk && qOk;
  }).sort((a, b) => sort === "price_asc" ? a.price - b.price : sort === "price_desc" ? b.price - a.price : sort === "rating" ? b.rating - a.rating : b.rev - a.rev), [cat, subcat, sort, budget, q, products]);

  const activeFilters = (cat !== "Tous" ? 1 : 0) + (subcat ? 1 : 0) + (budget[0] !== 0 || budget[1] !== 1000000 ? 1 : 0);

  const SidebarContent = () => (
    <>
      <p style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10, fontFamily: FONT_HEADING }}>Catégories</p>
      {["Tous", ...categories.map(c => c.name)].map(c => (
        <button key={c} onClick={() => { setCat(c); setSubcat(""); }} style={{
          display: "block", width: "100%", textAlign: "left", padding: "8px 14px", borderRadius: 11, border: "none",
          background: cat === c ? BLUE : "transparent", color: cat === c ? "#fff" : "#475569",
          fontSize: 13, fontWeight: cat === c ? 600 : 500, cursor: "pointer", marginBottom: 2,
          fontFamily: FONT_BODY, transition: "all 150ms",
        }}>{c}</button>
      ))}
      {activeCatObj && activeCatObj.subcategories && (
        <>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", margin: "16px 0 10px", fontFamily: FONT_HEADING }}>Sous-catégories</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {activeCatObj.subcategories.map(sc => (
              <button key={sc} className={`subcategory-pill${subcat === sc ? " active" : ""}`}
                onClick={() => setSubcat(subcat === sc ? "" : sc)}>{sc}</button>
            ))}
          </div>
        </>
      )}
      <p style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", margin: "18px 0 10px", fontFamily: FONT_HEADING }}>Trier par</p>
      <select value={sort} onChange={e => setSort(e.target.value)} style={{ width: "100%", padding: "9px 12px", borderRadius: 11, border: "1px solid #E2E8F0", fontSize: 13, background: "#fff", fontFamily: FONT_BODY }}>
        <option value="popular">Plus populaires</option>
        <option value="rating">Mieux notés</option>
        <option value="price_asc">Prix croissant</option>
        <option value="price_desc">Prix décroissant</option>
      </select>
      <p style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", margin: "18px 0 10px", fontFamily: FONT_HEADING }}>Budget</p>
      {[[0, 100000, "< 100K"], [100000, 300000, "100K–300K"], [300000, 600000, "300K–600K"], [600000, 1000000, "> 600K"]].map(([mn, mx, lb]) => (
        <button key={lb} onClick={() => setBudget([mn, mx])} style={{
          display: "block", width: "100%", textAlign: "left", padding: "7px 14px", borderRadius: 11, border: "none",
          background: budget[0] === mn && budget[1] === mx ? "#EFF6FF" : "transparent",
          color: budget[0] === mn && budget[1] === mx ? BLUE : "#475569",
          fontSize: 13, fontWeight: budget[0] === mn && budget[1] === mx ? 600 : 500,
          cursor: "pointer", marginBottom: 2, fontFamily: FONT_BODY,
        }}>{lb}</button>
      ))}
      {(cat !== "Tous" || subcat || budget[0] !== 0 || budget[1] !== 1000000) && (
        <button onClick={() => { setCat("Tous"); setSubcat(""); setBudget([0, 1000000]); }} style={{
          width: "100%", marginTop: 14, padding: "8px 14px", borderRadius: 11,
          border: "1px solid #E2E8F0", background: "none", fontSize: 12, color: "#94A3B8",
          cursor: "pointer", fontFamily: FONT_BODY, transition: "all 150ms",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#EF4444"; e.currentTarget.style.color = "#EF4444" }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.color = "#94A3B8" }}>
          ✕ Effacer les filtres
        </button>
      )}
    </>
  );

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 20px 48px" }}>
      {/* Breadcrumb */}
      <nav aria-label="Fil d'Ariane" style={{ fontSize: 12, color: "#94A3B8", marginBottom: 20, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", fontFamily: FONT_BODY }}>
        <button onClick={() => go("home")} style={{ border: "none", background: "none", cursor: "pointer", color: "#94A3B8", fontSize: 12, transition: "color 150ms" }}
          onMouseEnter={e => e.currentTarget.style.color = BLUE} onMouseLeave={e => e.currentTarget.style.color = "#94A3B8"}>Accueil</button>
        <span>›</span><span style={{ color: "#1E293B", fontWeight: 600 }}>Catalogue</span>
        {cat !== "Tous" && <><span>›</span><span style={{ color: BLUE, fontWeight: 600 }}>{cat}</span></>}
        {subcat && <><span>›</span><span style={{ color: "#7C3AED", fontWeight: 600 }}>{subcat}</span></>}
        {q && <><span>›</span><span style={{ color: BLUE, fontWeight: 600 }}>"{q}"</span></>}
      </nav>

      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        {/* Desktop sidebar */}
        <aside style={{ width: 220, flexShrink: 0 }} className="hide-mobile">
          <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #F1F5F9", padding: 18, boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
            <SidebarContent />
          </div>
        </aside>

        {/* Product grid */}
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, color: "#94A3B8", marginBottom: 16, fontFamily: FONT_BODY }}>
            <strong style={{ color: "#1E293B" }}>{list.length}</strong> produit{list.length !== 1 ? "s" : ""} trouvé{list.length !== 1 ? "s" : ""}
            {subcat && <span style={{ marginLeft: 8, fontSize: 11, background: "#EFF6FF", color: BLUE, padding: "3px 10px", borderRadius: 8, fontWeight: 600 }}>› {subcat}</span>}
          </p>
          {list.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 20px", color: "#94A3B8" }}>
              <p style={{ fontSize: 48, marginBottom: 14, opacity: .2 }}>📦</p>
              <p style={{ fontWeight: 600, color: "#64748B", marginBottom: 10, fontFamily: FONT_HEADING }}>Aucun produit trouvé</p>
              <button onClick={() => { setCat("Tous"); setSubcat(""); setBudget([0, 1000000]); }} style={{ fontSize: 13, color: BLUE, border: "none", background: "none", cursor: "pointer", textDecoration: "underline", fontFamily: FONT_BODY }}>Effacer les filtres</button>
            </div>
          ) : (
            <>
              <div className="catalog-grid" style={{ display: "grid", gap: 16, marginBottom: 24 }}>
                {list.slice(0, vis).map(p => <ProductCard key={p.id} p={p} go={go} promotions={promotions} />)}
              </div>
              {vis < list.length && (
                <div style={{ textAlign: "center", marginTop: 12 }}>
                  <button onClick={() => setVis(v => v + 8)} style={{
                    padding: "11px 32px", borderRadius: 14, border: `2px solid ${BLUE}`,
                    background: "none", color: BLUE, fontWeight: 600, fontSize: 13,
                    cursor: "pointer", fontFamily: FONT_HEADING,
                    transition: "all 200ms",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = BLUE; e.currentTarget.style.color = "#fff" }}
                    onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = BLUE }}>
                    Voir plus ({list.length - vis} restants)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile FAB */}
      <button className="filter-fab" onClick={() => setFilterOpen(true)} aria-label="Ouvrir les filtres">
        🎚 Filtres{activeFilters > 0 && <span style={{ background: "#FBBF24", color: "#1E293B", borderRadius: 99, padding: "2px 8px", fontSize: 10, marginLeft: 4, fontWeight: 700 }}>{activeFilters}</span>}
      </button>

      {/* Mobile filter sheet */}
      {filterOpen && (
        <div className="filter-overlay" onClick={() => setFilterOpen(false)}>
          <div className="filter-sheet" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <p style={{ fontWeight: 700, fontSize: 18, fontFamily: FONT_HEADING }}>Filtres</p>
              <button onClick={() => setFilterOpen(false)} aria-label="Fermer les filtres" style={{ border: "none", background: "none", fontSize: 24, cursor: "pointer", color: "#94A3B8" }}>✕</button>
            </div>
            <SidebarContent />
            <button onClick={() => setFilterOpen(false)} style={{
              marginTop: 20, width: "100%", padding: "14px 20px", borderRadius: 14,
              border: "none", background: BLUE, color: "#fff", fontWeight: 600, fontSize: 14,
              cursor: "pointer", fontFamily: FONT_HEADING,
            }}>
              Voir {list.length} résultat{list.length !== 1 ? "s" : ""}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


// ══════════════════════════════════════════════
// ── PRODUCT PAGE ──
// ══════════════════════════════════════════════
function ProductPage({ p, go, allProducts = PRODS, promotions = [] }) {
  const { dispatch } = useCart();
  const { ids, toggle } = useWish();
  const { push } = useToast();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const liked = ids.has(p.id);
  const pricing = getDiscountedPricing(p, promotions);
  const effectiveProduct = pricing.price !== p.price ? { ...p, price: pricing.price, orig: pricing.orig } : p;
  const disc = pricing.orig ? Math.round((1 - pricing.price / pricing.orig) * 100) : 0;
  const max = p.stock ?? 99;

  useEffect(() => { setQty(1); setAdded(false); }, [p.id]);

  const related = allProducts.filter(x => x.cat === p.cat && x.id !== p.id).slice(0, 4);

  const add = () => {
    for (let i = 0; i < qty; i++) dispatch({ type: "ADD", p: effectiveProduct });
    push({
      title: "Produit ajouté au panier",
      subtitle: p.name,
      image: p.img,
      price: fmt(pricing.price),
      type: "success",
      actionLabel: "Voir panier",
      action: () => window.dispatchEvent(new CustomEvent("kumpax:open-cart")),
      groupKey: `cart-add-${p.id}`,
    });
    setAdded(true); setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "20px 16px clamp(80px,15vw,48px)" }}>
      {/* Breadcrumb */}
      <nav aria-label="Fil d'Ariane" style={{ fontSize: 12, color: "#94A3B8", marginBottom: 24, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", fontFamily: FONT_BODY }}>
        <button onClick={() => go("home")} style={{ border: "none", background: "none", cursor: "pointer", color: "#94A3B8", fontSize: 12 }}>Accueil</button>
        <span>›</span>
        <button onClick={() => go("catalog", { cat: p.cat })} style={{ border: "none", background: "none", cursor: "pointer", color: "#94A3B8", fontSize: 12 }}>{p.cat}</button>
        <span>›</span>
        <span style={{ color: "#1E293B", fontWeight: 600 }}>{p.name}</span>
      </nav>

      <div className="product-detail-grid" style={{ display: "grid", gap: 40, marginBottom: 48 }}>
        {/* Image */}
        <div>
          <div style={{ borderRadius: 24, overflow: "hidden", aspectRatio: "1", background: "#F8FAFC", position: "relative" }}>
            <SafeImg src={p.img} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 500ms cubic-bezier(0.16, 1, 0.3, 1)" }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
              onMouseLeave={e => e.currentTarget.style.transform = "none"} />
            {disc > 0 && <span style={{ position: "absolute", top: 18, left: 18, padding: "5px 14px", borderRadius: 99, background: "#EF4444", color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: FONT_HEADING }}>-{disc}%</span>}
          </div>
        </div>

        {/* Info */}
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: BLUE, background: "#EFF6FF", padding: "4px 12px", borderRadius: 99, fontFamily: FONT_HEADING }}>{p.cat}</span>
            {p.badge && <span style={{ fontSize: 10, fontWeight: 700, background: "#FEF3C7", color: "#B45309", padding: "4px 12px", borderRadius: 99, fontFamily: FONT_HEADING }}>{p.badge}</span>}
          </div>
          <h1 style={{ fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 700, color: "#0F172A", lineHeight: 1.25, marginBottom: 14, fontFamily: FONT_HEADING, letterSpacing: "-0.02em" }}>{p.name}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Stars rating={p.rating} size={15} />
            <span style={{ fontWeight: 600, fontSize: 14, color: "#334155", fontFamily: FONT_HEADING }}>{p.rating}</span>
            <span style={{ fontSize: 13, color: "#94A3B8", fontFamily: FONT_BODY }}>({p.rev} avis)</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 32, fontWeight: 700, color: BLUE, fontFamily: FONT_HEADING, letterSpacing: "-0.02em" }}>{fmt(pricing.price)}</span>
            {pricing.orig && <span style={{ fontSize: 15, color: "#94A3B8", textDecoration: "line-through", marginBottom: 4, fontFamily: FONT_BODY }}>{fmt(pricing.orig)}</span>}
          </div>
          <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.75, marginBottom: 20, fontFamily: FONT_BODY }}>{p.desc}</p>
          {p.specs && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
              {p.specs.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, background: "#F8FAFC", borderRadius: 12, padding: "9px 12px", fontSize: 12, fontWeight: 600, color: "#334155", fontFamily: FONT_BODY }}>
                  <span style={{ color: BLUE, fontSize: 13 }}>✓</span>{s}
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, fontSize: 13, fontWeight: 600, fontFamily: FONT_BODY, color: max > 5 ? "#047857" : max > 0 ? "#B45309" : "#DC2626" }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: max > 5 ? "#10B981" : max > 0 ? "#F59E0B" : "#EF4444", display: "inline-block" }} />
            {max > 5 ? "En stock" : max > 0 ? `⚠ Plus que ${max} en stock` : "Rupture de stock"}
          </div>
          {max > 0 && (
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", border: "1px solid #E2E8F0", borderRadius: 14, overflow: "hidden" }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Diminuer la quantité" style={{ width: 42, height: 48, border: "none", background: "none", cursor: "pointer", fontSize: 17, fontWeight: 600 }}>−</button>
                <span style={{ width: 44, textAlign: "center", fontWeight: 700, fontSize: 15, fontFamily: FONT_HEADING }}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(q + 1, max))} disabled={qty >= max} aria-label="Augmenter la quantité" style={{ width: 42, height: 48, border: "none", background: "none", cursor: qty >= max ? "not-allowed" : "pointer", fontSize: 17, fontWeight: 600, opacity: qty >= max ? .4 : 1 }}>+</button>
              </div>
              <button onClick={add} style={{
                flex: 1, padding: "14px 18px", borderRadius: 14, border: "none", cursor: "pointer",
                fontWeight: 600, fontSize: 14, fontFamily: FONT_HEADING,
                background: added ? "#10B981" : grad, color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all 250ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                boxShadow: added ? "0 4px 16px rgba(16,185,129,.3)" : "0 4px 16px rgba(30,64,175,.25)",
              }}
                onMouseEnter={e => { if (!added) e.currentTarget.style.transform = "scale(1.02)" }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none" }}>
                {added ? "✓ Ajouté au panier !" : "🛒 Ajouter au panier"}
              </button>
              <button onClick={() => {
                toggle(p.id);
                push({
                  title: liked ? "Retiré des favoris" : "Ajouté aux favoris",
                  subtitle: p.name,
                  image: p.img,
                  price: fmt(p.price),
                  type: liked ? "warn" : "success",
                  groupKey: `wishlist-${p.id}`,
                });
              }}
                aria-label={liked ? "Retirer des favoris" : "Ajouter aux favoris"}
                style={{
                  width: 48, height: 48, borderRadius: 14,
                  border: `2px solid ${liked ? "#FCA5A5" : "#E2E8F0"}`,
                  background: liked ? "#FEF2F2" : "none", cursor: "pointer", fontSize: 20,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 200ms",
                }}>
                {liked ? "❤️" : "🤍"}
              </button>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {[["🚚", "Livraison 24-48h"], ["🔒", "Garanti Officiel"], ["🔄", "Retour 7 jours"]].map(([ic, t], i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, background: "#F8FAFC", borderRadius: 14, padding: 12, textAlign: "center" }}>
                <span style={{ fontSize: 20 }}>{ic}</span>
                <span style={{ fontSize: 11, color: "#475569", fontWeight: 600, lineHeight: 1.3, fontFamily: FONT_BODY }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Sticky CTA (mobile only) ── */}
      <div className="sticky-cta">
        <div>
          <p style={{ fontWeight: 700, fontSize: 15, color: BLUE, fontFamily: FONT_HEADING }}>{fmt(pricing.price)}</p>
          {pricing.orig && <p style={{ fontSize: 11, color: "#94A3B8", textDecoration: "line-through", fontFamily: FONT_BODY }}>{fmt(pricing.orig)}</p>}
        </div>
        {max > 0 ? (
          <button onClick={add} style={{
            flex: 1, padding: "14px 20px", borderRadius: 14, border: "none",
            background: added ? "#10B981" : grad, color: "#fff",
            fontWeight: 700, fontSize: 14, fontFamily: FONT_HEADING,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "background 200ms",
          }}>
            {added ? "✓ Ajouté !" : "🛒 Ajouter au panier"}
          </button>
        ) : (
          <span style={{ flex: 1, textAlign: "center", fontSize: 13, fontWeight: 700, color: "#DC2626", fontFamily: FONT_BODY }}>Rupture de stock</span>
        )}
      </div>

      {related.length > 0 && (
        <section>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0F172A", marginBottom: 18, fontFamily: FONT_HEADING, letterSpacing: "-0.01em" }}>Produits similaires</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            {related.map(rp => <ProductCard key={rp.id} p={rp} go={go} promotions={promotions} />)}
          </div>
        </section>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════
// ── CHECKOUT ──
// ══════════════════════════════════════════════
function Checkout({ go }) {
  const { items, total, dispatch } = useCart();
  const { push } = useToast();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    nomComplet: "", telephone: "", adresse: "",
  });
  const [err, setErr] = useState({});
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const orderId = useRef(null);

  useEffect(() => { setErr({}); }, [step]);

  const inp = e => { setForm(f => ({ ...f, [e.target.name]: e.target.value })); setErr(er => ({ ...er, [e.target.name]: "" })); };

  const effectiveAdresse = form.adresse;

  const finalizeOrder = async () => {
    setSubmitting(true);
    try {
      const res = await window.api.createOrder({
        delivery: { ...form, adresse: effectiveAdresse },
        items: items.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
        payMethod: "cod", deliveryMode: "home",
        payProvider: null,
      });
      if (res.success) {
        orderId.current = res.data?.orderName;
        dispatch({ type: "CLEAR" }); setDone(true); push("Commande enregistrée ! 🎉");
      } else {
        push(res.error || res.technicalError || "Erreur lors de la commande", "error");
      }
    } catch (e) { push("Erreur réseau : " + (e?.message || "inconnue"), "error"); }
    finally { setSubmitting(false); }
  };

  const submit = async () => finalizeOrder();

  const validate = () => {
    const e = {};
    if (!form.nomComplet.trim()) e.nomComplet = "Requis";
    if (!/^\d{9}$/.test(form.telephone.replace(/\s/g, ""))) e.telephone = "9 chiffres requis";
    if (!form.adresse.trim()) e.adresse = "Requise";
    setErr(e);
    if (Object.keys(e).length) { push("Veuillez corriger les erreurs", "error"); return false; }
    return true;
  };

  // Empty cart
  if (!done && items.length === 0) return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 52, marginBottom: 14, opacity: .15 }}>🛒</p>
        <p style={{ fontWeight: 600, color: "#64748B", marginBottom: 18, fontFamily: FONT_HEADING, fontSize: 16 }}>Votre panier est vide</p>
        <Btn onClick={() => go("catalog")}>Voir les produits</Btn>
      </div>
    </div>
  );

  // Success
  if (done) return (
    <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
        <div style={{ width: 76, height: 76, borderRadius: "50%", background: "#10B981", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 38, color: "#fff", boxShadow: "0 8px 24px rgba(16,185,129,.3)" }}>✓</div>
        <h2 style={{ fontSize: 26, fontWeight: 700, color: "#0F172A", marginBottom: 12, fontFamily: FONT_HEADING, letterSpacing: "-0.02em" }}>Commande enregistrée ! 🎉</h2>
        <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.6, marginBottom: 24, fontFamily: FONT_BODY }}>Merci <strong>{form.nomComplet}</strong> ! Vous recevrez un SMS de confirmation au <strong>+221 {form.telephone}</strong>.</p>
        <div style={{ background: "#EFF6FF", borderRadius: 18, padding: 18, textAlign: "left", marginBottom: 24 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: DARK_BLUE, marginBottom: 12, fontFamily: FONT_HEADING }}>
            {orderId.current ? `Réf : ${orderId.current}` : "Commande en cours de traitement"}
          </p>
          {[
            ["Adresse", effectiveAdresse || form.adresse],
            ["Délai estimé", "24–48h"],
          ].map(([k, v]) => (
            <p key={k} style={{ fontSize: 13, color: "#2563EB", marginBottom: 5, fontFamily: FONT_BODY }}>{k} : <strong>{v}</strong></p>
          ))}
        </div>
        <Btn onClick={() => go("home")} style={{ width: "100%", borderRadius: 14 }}>Retour à l'accueil →</Btn>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px 48px" }}>
      <button onClick={() => go("catalog")} style={{ border: "none", background: "none", cursor: "pointer", color: "#94A3B8", fontSize: 13, marginBottom: 20, display: "flex", alignItems: "center", gap: 6, fontFamily: FONT_BODY }}>← Retour au catalogue</button>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0F172A", marginBottom: 24, fontFamily: FONT_HEADING, letterSpacing: "-0.02em" }}>Finaliser la commande</h1>

      {/* Steps */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 28, flexWrap: "wrap" }}>
        {[{ n: 1, l: "Livraison" }, { n: 2, l: "Confirmation" }].map((s, i) => (
          <React.Fragment key={s.n}>
            <div style={{
              display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 99,
              fontSize: 12, fontWeight: 600, fontFamily: FONT_BODY,
              background: step >= s.n ? BLUE : "#F1F5F9", color: step >= s.n ? "#fff" : "#94A3B8",
              transition: "all 200ms",
            }}>
              <span style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>
                {step > s.n ? "✓" : s.n}
              </span>
              {s.l}
            </div>
            {i < 1 && <div style={{ flex: 1, maxWidth: 32, height: 2, borderRadius: 1, background: step > s.n ? BLUE : "#E2E8F0", transition: "background 200ms" }} />}
          </React.Fragment>
        ))}
      </div>

      <div className="checkout-main-grid" style={{ display: "grid", gap: 24, alignItems: "start" }}>
        <div>
          {/* Step 1 */}
          {step === 1 && (
            <div style={{ background: "#fff", borderRadius: 22, border: "1px solid #F1F5F9", padding: 28, boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", marginBottom: 22, fontFamily: FONT_HEADING }}>📍 Infos de livraison</h2>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94A3B8", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: FONT_HEADING }}>Nom complet *</label>
                <input name="nomComplet" value={form.nomComplet} onChange={inp} placeholder="Moussa Diallo"
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: `1px solid ${err.nomComplet ? "#FCA5A5" : "#E2E8F0"}`, fontSize: 14, fontFamily: FONT_BODY, background: err.nomComplet ? "#FFF5F5" : "#fff" }} />
                {err.nomComplet && <p style={{ fontSize: 11, color: "#EF4444", marginTop: 4, fontFamily: FONT_BODY }}>{err.nomComplet}</p>}
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94A3B8", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: FONT_HEADING }}>Téléphone *</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ padding: "11px 14px", borderRadius: 12, border: "1px solid #E2E8F0", background: "#F8FAFC", fontSize: 13, color: "#64748B", flexShrink: 0, display: "flex", alignItems: "center", gap: 4, fontFamily: FONT_BODY }}>🇸🇳 +221</div>
                  <div style={{ flex: 1 }}>
                    <input name="telephone" value={form.telephone} onChange={inp} placeholder="77 000 00 00"
                      style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: `1px solid ${err.telephone ? "#FCA5A5" : "#E2E8F0"}`, fontSize: 14, fontFamily: FONT_BODY }} />
                    {err.telephone && <p style={{ fontSize: 11, color: "#EF4444", marginTop: 4, fontFamily: FONT_BODY }}>{err.telephone}</p>}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94A3B8", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: FONT_HEADING }}>Adresse de livraison *</label>
                  <input name="adresse" value={form.adresse} onChange={inp} placeholder="Rue, numéro, quartier, Dakar..."
                    style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: `1px solid ${err.adresse ? "#FCA5A5" : "#E2E8F0"}`, fontSize: 14, fontFamily: FONT_BODY, background: err.adresse ? "#FFF5F5" : "#fff" }} />
                  {err.adresse && <p style={{ fontSize: 11, color: "#EF4444", marginTop: 4, fontFamily: FONT_BODY }}>{err.adresse}</p>}
                </>
              </div>

              <Btn onClick={() => { if (validate()) setStep(2); }} style={{ width: "100%", borderRadius: 14, padding: "14px 20px" }}>
                Continuer →
              </Btn>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div style={{ background: "#fff", borderRadius: 22, border: "1px solid #F1F5F9", padding: 28, boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", marginBottom: 18, fontFamily: FONT_HEADING }}>📋 Récapitulatif final</h2>
              <div style={{ background: "#F8FAFC", borderRadius: 14, padding: 14, marginBottom: 18 }}>
                {[
                  ["Client", form.nomComplet], ["Téléphone", `+221 ${form.telephone}`],
                  ["Adresse", effectiveAdresse || form.adresse],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 7, fontSize: 13, fontFamily: FONT_BODY }}>
                    <span style={{ color: "#94A3B8" }}>{k}</span>
                    <span style={{ fontWeight: 600, textAlign: "right", maxWidth: "60%" }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ maxHeight: 200, overflowY: "auto", marginBottom: 18 }}>
                {items.map(item => (
                  <div key={item.id} style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                    <SafeImg src={item.img} alt={item.name} style={{ width: 40, height: 40, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, fontFamily: FONT_BODY, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</p>
                      <p style={{ fontSize: 11, color: "#94A3B8", fontFamily: FONT_BODY }}>× {item.qty}</p>
                    </div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: BLUE, flexShrink: 0, fontFamily: FONT_HEADING }}>{fmt(item.price * item.qty)}</p>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: 14, marginBottom: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#94A3B8", marginBottom: 7, fontFamily: FONT_BODY }}>
                  <span>Livraison</span><span style={{ color: "#059669", fontWeight: 600 }}>Gratuite 🎉</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 16, fontFamily: FONT_HEADING }}>
                  <span>Total à payer</span><span style={{ color: BLUE }}>{fmt(total)}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => setStep(1)} style={{ padding: "11px 18px", borderRadius: 12, border: "1px solid #E2E8F0", background: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: FONT_BODY }}>← Retour</button>
                <button onClick={submit} disabled={submitting} style={{
                  flex: 1, padding: "14px 20px", borderRadius: 14, border: "none",
                  background: submitting ? "#94A3B8" : "#10B981", color: "#fff",
                  fontWeight: 600, fontSize: 14, cursor: submitting ? "not-allowed" : "pointer",
                  fontFamily: FONT_HEADING,
                  boxShadow: submitting ? "none" : "0 4px 16px rgba(16,185,129,.3)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "all 200ms",
                }}>
                  {submitting
                    ? <><span style={{ width: 17, height: 17, border: "2px solid rgba(255,255,255,.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }} />Envoi...</>
                    : <>✓ Confirmer la commande</>}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ width: 250, flexShrink: 0 }} className="hide-mobile">
          <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #F1F5F9", padding: 18, marginBottom: 14, boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
            <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 14, fontFamily: FONT_HEADING }}>Votre commande</p>
            <div style={{ maxHeight: 200, overflowY: "auto", marginBottom: 14 }}>
              {items.map(item => (
                <div key={item.id} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                  <SafeImg src={item.img} alt={item.name} style={{ width: 36, height: 36, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, fontFamily: FONT_BODY, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</p>
                    <p style={{ fontSize: 10, color: "#94A3B8", fontFamily: FONT_BODY }}>×{item.qty}</p>
                  </div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: BLUE, flexShrink: 0, fontFamily: FONT_HEADING }}>{fmt(item.price * item.qty)}</p>
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94A3B8", marginBottom: 5, fontFamily: FONT_BODY }}>
                <span>Livraison</span><span style={{ color: "#059669", fontWeight: 600 }}>Gratuite</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 15, fontFamily: FONT_HEADING }}>
                <span>Total</span><span style={{ color: BLUE }}>{fmt(total)}</span>
              </div>
            </div>
          </div>
          <div style={{ background: "#EFF6FF", borderRadius: 16, padding: 14 }}>
            {[["🚚", "Livraison 24-48h"], ["📞", "Support 7j/7"]].map(([ic, t]) => (
              <p key={t} style={{ fontSize: 12, color: "#1D4ED8", display: "flex", alignItems: "center", gap: 8, marginBottom: 5, fontWeight: 600, fontFamily: FONT_BODY }}><span>{ic}</span>{t}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// ── WISHLIST ──
// ══════════════════════════════════════════════
function Wishlist({ go, allProducts = PRODS, promotions = [] }) {
  const { ids } = useWish();
  const wish = allProducts.filter(p => ids.has(p.id));
  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 20px 48px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0F172A", marginBottom: 24, display: "flex", alignItems: "center", gap: 10, fontFamily: FONT_HEADING, letterSpacing: "-0.02em" }}>
        ❤️ Mes Favoris <span style={{ fontSize: 16, color: "#94A3B8", fontWeight: 400 }}>({wish.length})</span>
      </h1>
      {wish.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", color: "#94A3B8" }}>
          <p style={{ fontSize: 52, marginBottom: 14, opacity: .15 }}>🤍</p>
          <p style={{ fontWeight: 600, color: "#64748B", marginBottom: 18, fontFamily: FONT_HEADING, fontSize: 16 }}>Aucun favori pour l'instant</p>
          <Btn onClick={() => go("catalog")}>Découvrir les produits</Btn>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
          {wish.map(p => <ProductCard key={p.id} p={p} go={go} promotions={promotions} />)}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════
// ── ACCOUNT ──
// ══════════════════════════════════════════════
function Account({ go }) {
  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "32px 20px 48px" }}>
      <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #F1F5F9", padding: "32px 24px", textAlign: "center" }}>
        <p style={{ color: "#64748B", fontSize: 14, fontFamily: FONT_BODY }}>
          Espace compte temporairement indisponible.
        </p>
      </div>
    </div>
  );
}
