/* ═══════════════════════════════════════════════
   KUMPAX STORE — Pages
   (Home, Catalog, ProductPage, Checkout, Wishlist, Account)
   ═══════════════════════════════════════════════ */

// ══════════════════════════════════════════════
// ── HOME ──
// ══════════════════════════════════════════════
function Home({ go, products = PRODS, categories = CATS, loading = false }) {
  return (
    <div>
      {/* Hero */}
      <div style={{ background: grad, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: .08 }}>
          <div style={{ position: "absolute", top: 30, left: 60, width: 200, height: 200, borderRadius: "50%", background: "#fff", filter: "blur(60px)" }} />
          <div style={{ position: "absolute", bottom: 0, right: 40, width: 150, height: 150, borderRadius: "50%", background: "#fbbf24", filter: "blur(50px)" }} />
        </div>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 16px 56px", position: "relative" }}>
          <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 32, alignItems: "center" }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,.15)", borderRadius: 99, padding: "6px 16px", fontSize: 12, fontWeight: 600, color: "#fff", marginBottom: 20 }}>
                ⚡ Livraison gratuite à Dakar
              </div>
              <h1 style={{ fontSize: "clamp(26px,5vw,46px)", fontWeight: 900, color: "#fff", lineHeight: 1.15, marginBottom: 16 }}>
                Le Shopping<br />Premium au<br /><span style={{ color: "#fbbf24" }}>Sénégal 🇸🇳</span>
              </h1>
              <p style={{ color: "rgba(255,255,255,.8)", fontSize: 14, lineHeight: 1.7, marginBottom: 24, maxWidth: 400 }}>
                Des milliers de produits authentiques et importés, livrés chez vous en 24–48h.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 32 }}>
                <button onClick={() => go("catalog")} style={{ padding: "10px 22px", background: "#fbbf24", color: "#1e293b", border: "none", borderRadius: 12, fontWeight: 800, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 4px 16px rgba(251,191,36,.4)", fontFamily: "'Sora',sans-serif" }}>
                  Explorer le catalogue →
                </button>
                <button onClick={() => go("catalog", { cat: "Vêtements" })} style={{ padding: "10px 22px", background: "rgba(255,255,255,.15)", color: "#fff", border: "1px solid rgba(255,255,255,.3)", borderRadius: 12, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "'Sora',sans-serif" }}>
                  Mode Sénégalaise
                </button>
              </div>
              <div className="hero-stats" style={{ display: "flex", gap: 32 }}>
                {[["5K+", "Produits"], ["98%", "Satisfaits"], ["24h", "Livraison"]].map(([v, l]) => (
                  <div key={l}><p style={{ fontSize: 20, fontWeight: 900, color: "#fbbf24" }}>{v}</p><p style={{ fontSize: 11, color: "rgba(255,255,255,.6)" }}>{l}</p></div>
                ))}
              </div>
            </div>
            <div className="hide-mobile" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, width: 280 }}>
              {products.slice(0, 4).map((p, i) => (
                <div key={p.id} onClick={() => go("product", { product: p })} style={{ background: "rgba(255,255,255,.1)", backdropFilter: "blur(10px)", borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,.2)", cursor: "pointer", marginTop: i === 1 ? 24 : 0, transition: "background .2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.2)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.1)"}>
                  <SafeImg src={p.img} alt={p.name} style={{ width: "100%", height: 90, objectFit: "cover" }} />
                  <div style={{ padding: 8 }}>
                    <p style={{ color: "#fff", fontSize: 10, fontWeight: 700, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{p.name}</p>
                    <p style={{ color: "#fbbf24", fontSize: 10, fontWeight: 900 }}>{fmt(p.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Trust */}
      <div style={{ background: "#fff", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "12px 16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 8 }}>
            {[["🚚", "Livraison 24-48h", "À Dakar et régions"], ["🔒", "Paiement Sécurisé", "Wave & Orange Money"], ["🔄", "Retour Facile", "7 jours garantis"], ["📞", "Support 7j/7", "+221 78 384 91 97"]].map(([ic, t, s], i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: 10, borderRadius: 12, cursor: "default" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{ic}</div>
                <div><p style={{ fontSize: 11, fontWeight: 700, color: "#1e293b" }}>{t}</p><p style={{ fontSize: 10, color: "#94a3b8" }}>{s}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 16px" }}>
        {/* Categories */}
        <section style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0f172a" }}>Catégories Populaires</h2>
              <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>Trouvez ce qu'il vous faut</p>
            </div>
            <button onClick={() => go("catalog")} style={{ fontSize: 12, fontWeight: 700, color: BLUE, border: "none", background: "none", cursor: "pointer" }}>Voir tout →</button>
          </div>
          <div className="cat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 10 }}>
            {categories.map(c => (
              <button key={c.id} onClick={() => go("catalog", { cat: c.name })} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "14px 8px",
                borderRadius: 16, border: "1px solid transparent", background: c.bg, cursor: "pointer",
                transition: "all .2s", fontFamily: "'Sora',sans-serif"
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,.1)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}>
                <span style={{ fontSize: 26 }}>{c.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#334155", textAlign: "center", lineHeight: 1.2 }}>{c.name}</span>
                <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 8px", borderRadius: 99, background: "rgba(255,255,255,.6)", color: c.accent }}>{c.count}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Trending */}
        <section style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                <span style={{ fontSize: 14, color: "#f59e0b" }}>📈</span>
                <span style={{ fontSize: 10, fontWeight: 800, color: "#f59e0b", textTransform: "uppercase", letterSpacing: .1 }}>Tendances Sénégal</span>
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0f172a" }}>Produits du Moment</h2>
            </div>
            <button onClick={() => go("catalog")} style={{ fontSize: 12, fontWeight: 700, color: BLUE, border: "none", background: "none", cursor: "pointer" }}>Voir tout →</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 14 }}>
            {loading
              ? [...Array(8)].map((_, i) => <div key={i} style={{ background: "#fff", borderRadius: 16, overflow: "hidden", border: "1px solid #f1f5f9" }}><Skeleton h={170} r={0} mb={0} /><div style={{ padding: 12 }}><Skeleton h={12} w="60%" mb={8} /><Skeleton h={14} mb={6} /><Skeleton h={10} w="40%" /></div></div>)
              : products.slice(0, 8).map(p => <ProductCard key={p.id} p={p} go={go} />)
            }
          </div>
        </section>

        {/* Promo */}
        <div style={{ borderRadius: 24, padding: "32px 36px", background: grad, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: -40, bottom: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,.08)" }} />
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 20, position: "relative" }}>
            <div>
              <p style={{ color: "#fbbf24", fontWeight: 800, fontSize: 11, marginBottom: 6, textTransform: "uppercase", letterSpacing: .08 }}>🎉 Offre Spéciale — Durée limitée</p>
              <h3 style={{ fontSize: "clamp(20px,4vw,30px)", fontWeight: 900, color: "#fff", marginBottom: 8 }}>Jusqu'à <span style={{ color: "#fbbf24" }}>-30%</span> sur les Smartphones</h3>
              <p style={{ color: "rgba(255,255,255,.7)", fontSize: 13 }}>Profitez-en avant la fin du mois !</p>
            </div>
            <button onClick={() => go("catalog", { cat: "Smartphones" })} style={{ padding: "12px 26px", background: "#fbbf24", color: "#1e293b", border: "none", borderRadius: 14, fontWeight: 800, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 20px rgba(251,191,36,.5)", fontFamily: "'Sora',sans-serif", flexShrink: 0 }}>
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
function Catalog({ go, initCat, q, products = PRODS, categories = CATS }) {
  const [cat, setCat] = useState(initCat || "Tous");
  const [subcat, setSubcat] = useState(""); // sous-catégorie active
  const [sort, setSort] = useState("popular");
  const [budget, setBudget] = useState([0, 1000000]);
  const [vis, setVis] = useState(12);
  const [filterOpen, setFilterOpen] = useState(false); // modal filtre mobile

  useEffect(() => { if (initCat) setCat(initCat); }, [initCat]);

  // Réinitialiser la sous-catégorie et le "voir plus" lors du changement de catégorie ou tri
  useEffect(() => { setVis(12); setSubcat(""); }, [cat, sort]);

  // Catégorie courante (avec ses sous-catégories)
  const activeCatObj = categories.find(c => c.name === cat);

  const list = useMemo(() => products.filter(p => {
    const catOk = cat === "Tous" || p.cat === cat;
    const subcatOk = !subcat || p.subcat === subcat;
    const priceOk = p.price >= budget[0] && p.price <= budget[1];
    const qOk = !q.trim() || p.name.toLowerCase().includes(q.toLowerCase()) || p.cat.toLowerCase().includes(q.toLowerCase());
    return catOk && subcatOk && priceOk && qOk;
  }).sort((a, b) => sort === "price_asc" ? a.price - b.price : sort === "price_desc" ? b.price - a.price : sort === "rating" ? b.rating - a.rating : b.rev - a.rev), [cat, subcat, sort, budget, q]);

  // Nombre de filtres actifs (pour le badge du bouton FAB mobile)
  const activeFilters = (cat !== "Tous" ? 1 : 0) + (subcat ? 1 : 0) + (budget[0] !== 0 || budget[1] !== 1000000 ? 1 : 0);

  // Contenu de la sidebar (partagé entre desktop et modal mobile)
  const SidebarContent = () => (
    <>
      <p style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: .1, marginBottom: 8 }}>Catégories</p>
      {["Tous", ...categories.map(c => c.name)].map(c => (
        <button key={c} onClick={() => { setCat(c); setSubcat(""); }} style={{
          display: "block", width: "100%", textAlign: "left", padding: "7px 12px", borderRadius: 10, border: "none",
          background: cat === c ? BLUE : "transparent", color: cat === c ? "#fff" : "#475569",
          fontSize: 12, fontWeight: cat === c ? 700 : 500, cursor: "pointer", marginBottom: 2,
          fontFamily: "'Sora',sans-serif", transition: "all .15s"
        }}>{c}</button>
      ))}

      {/* Sous-catégories de la catégorie active */}
      {activeCatObj && activeCatObj.subcategories && (
        <>
          <p style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: .1, margin: "14px 0 8px" }}>Sous-catégories</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {activeCatObj.subcategories.map(sc => (
              <button
                key={sc}
                className={`subcategory-pill${subcat === sc ? " active" : ""}`}
                onClick={() => setSubcat(subcat === sc ? "" : sc)}
              >{sc}</button>
            ))}
          </div>
        </>
      )}

      <p style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: .1, margin: "16px 0 8px" }}>Trier par</p>
      <select value={sort} onChange={e => setSort(e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12, background: "#fff", fontFamily: "'Sora',sans-serif" }}>
        <option value="popular">Plus populaires</option>
        <option value="rating">Mieux notés</option>
        <option value="price_asc">Prix croissant</option>
        <option value="price_desc">Prix décroissant</option>
      </select>
      <p style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: .1, margin: "16px 0 8px" }}>Budget</p>
      {[[0, 100000, "< 100K"], [100000, 300000, "100K–300K"], [300000, 600000, "300K–600K"], [600000, 1000000, "> 600K"]].map(([mn, mx, lb]) => (
        <button key={lb} onClick={() => setBudget([mn, mx])} style={{
          display: "block", width: "100%", textAlign: "left", padding: "6px 12px", borderRadius: 10, border: "none",
          background: budget[0] === mn && budget[1] === mx ? "#eff6ff" : "transparent",
          color: budget[0] === mn && budget[1] === mx ? BLUE : "#475569",
          fontSize: 12, fontWeight: budget[0] === mn && budget[1] === mx ? 700 : 500, cursor: "pointer", marginBottom: 2,
          fontFamily: "'Sora',sans-serif"
        }}>{lb}</button>
      ))}
      {(cat !== "Tous" || subcat || budget[0] !== 0 || budget[1] !== 1000000) && (
        <button onClick={() => { setCat("Tous"); setSubcat(""); setBudget([0, 1000000]); }} style={{ width: "100%", marginTop: 12, padding: "7px 12px", borderRadius: 10, border: "1px solid #e2e8f0", background: "none", fontSize: 11, color: "#94a3b8", cursor: "pointer", fontFamily: "'Sora',sans-serif" }}>
          ✕ Effacer les filtres
        </button>
      )}
    </>
  );

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "20px 16px 40px" }}>
      {/* Fil d'Ariane */}
      <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 16, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <button onClick={() => go("home")} style={{ border: "none", background: "none", cursor: "pointer", color: "#94a3b8", fontSize: 11 }} onMouseEnter={e => e.currentTarget.style.color = BLUE} onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}>Accueil</button>
        <span>›</span><span style={{ color: "#1e293b", fontWeight: 600 }}>Catalogue</span>
        {cat !== "Tous" && <><span>›</span><span style={{ color: BLUE, fontWeight: 600 }}>{cat}</span></>}
        {subcat && <><span>›</span><span style={{ color: "#7c3aed", fontWeight: 600 }}>{subcat}</span></>}
        {q && <><span>›</span><span style={{ color: BLUE, fontWeight: 600 }}>"{q}"</span></>}
      </div>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        {/* Sidebar desktop */}
        <aside style={{ width: 210, flexShrink: 0 }} className="hide-mobile">
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}>
            <SidebarContent />
          </div>
        </aside>

        {/* Grille produits */}
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 14 }}>
            <strong style={{ color: "#1e293b" }}>{list.length}</strong> produit{list.length !== 1 ? "s" : ""} trouvé{list.length !== 1 ? "s" : ""}
            {subcat && <span style={{ marginLeft: 8, fontSize: 11, background: "#eff6ff", color: BLUE, padding: "2px 8px", borderRadius: 8, fontWeight: 700 }}>› {subcat}</span>}
          </p>
          {list.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8" }}>
              <p style={{ fontSize: 40, marginBottom: 12, opacity: .3 }}>📦</p>
              <p style={{ fontWeight: 700, color: "#64748b", marginBottom: 8 }}>Aucun produit trouvé</p>
              <button onClick={() => { setCat("Tous"); setSubcat(""); setBudget([0, 1000000]); }} style={{ fontSize: 12, color: BLUE, border: "none", background: "none", cursor: "pointer", textDecoration: "underline" }}>Effacer les filtres</button>
            </div>
          ) : (
            <>
              <div className="catalog-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: 14, marginBottom: 20 }}>
                {list.slice(0, vis).map(p => <ProductCard key={p.id} p={p} go={go} />)}
              </div>
              {vis < list.length && (
                <div style={{ textAlign: "center", marginTop: 8 }}>
                  <button onClick={() => setVis(v => v + 8)} style={{ padding: "10px 28px", borderRadius: 12, border: `2px solid ${BLUE}`, background: "none", color: BLUE, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'Sora',sans-serif", transition: "all .2s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = BLUE; e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = BLUE; }}>
                    Voir plus ({list.length - vis} restants)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Bouton filtre flottant (mobile) ── */}
      <button className="filter-fab" onClick={() => setFilterOpen(true)}>
        🎚 Filtres{activeFilters > 0 && <span style={{ background: "#fbbf24", color: "#1e293b", borderRadius: 99, padding: "1px 7px", fontSize: 10, marginLeft: 4 }}>{activeFilters}</span>}
      </button>

      {/* ── Modal filtre mobile (bottom-sheet) ── */}
      {filterOpen && (
        <div className="filter-overlay" onClick={() => setFilterOpen(false)}>
          <div className="filter-sheet" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <p style={{ fontWeight: 900, fontSize: 16 }}>Filtres</p>
              <button onClick={() => setFilterOpen(false)} style={{ border: "none", background: "none", fontSize: 22, cursor: "pointer", color: "#94a3b8" }}>✕</button>
            </div>
            <SidebarContent />
            <button onClick={() => setFilterOpen(false)} style={{ marginTop: 16, width: "100%", padding: "13px 20px", borderRadius: 12, border: "none", background: BLUE, color: "#fff", fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "'Sora',sans-serif" }}>
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
function ProductPage({ p, go, allProducts = PRODS }) {
  const { dispatch } = useCart();
  const { ids, toggle } = useWish();
  const { push } = useToast();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const liked = ids.has(p.id);
  const disc = p.orig ? Math.round((1 - p.price / p.orig) * 100) : 0;
  const max = p.stock ?? 99;

  useEffect(() => { setQty(1); setAdded(false); }, [p.id]);

  const related = allProducts.filter(x => x.cat === p.cat && x.id !== p.id).slice(0, 4);

  const add = () => {
    for (let i = 0; i < qty; i++) dispatch({ type: "ADD", p });
    push(`${p.name.slice(0, 20)}... ajouté au panier !`);
    setAdded(true); setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "20px 16px 40px" }}>
      <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 20, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <button onClick={() => go("home")} style={{ border: "none", background: "none", cursor: "pointer", color: "#94a3b8", fontSize: 11 }}>Accueil</button>
        <span>›</span>
        <button onClick={() => go("catalog", { cat: p.cat })} style={{ border: "none", background: "none", cursor: "pointer", color: "#94a3b8", fontSize: 11 }}>{p.cat}</button>
        <span>›</span>
        <span style={{ color: "#1e293b", fontWeight: 600 }}>{p.name}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 40 }} className="md:grid-cols-2">
        {/* Image */}
        <div>
          <div style={{ borderRadius: 24, overflow: "hidden", aspectRatio: "1", background: "#f8fafc", position: "relative" }}>
            <SafeImg src={p.img} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            {disc > 0 && <span style={{ position: "absolute", top: 16, left: 16, padding: "4px 12px", borderRadius: 99, background: "#ef4444", color: "#fff", fontSize: 12, fontWeight: 800 }}>-{disc}%</span>}
          </div>
        </div>

        {/* Info */}
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: .08, color: BLUE, background: "#eff6ff", padding: "3px 10px", borderRadius: 99 }}>{p.cat}</span>
            {p.badge && <span style={{ fontSize: 10, fontWeight: 800, background: "#fef3c7", color: "#b45309", padding: "3px 10px", borderRadius: 99 }}>{p.badge}</span>}
          </div>
          <h1 style={{ fontSize: "clamp(18px,3vw,26px)", fontWeight: 900, color: "#0f172a", lineHeight: 1.25, marginBottom: 12 }}>{p.name}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Stars rating={p.rating} size={14} />
            <span style={{ fontWeight: 700, fontSize: 13, color: "#334155" }}>{p.rating}</span>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>({p.rev} avis)</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 30, fontWeight: 900, color: BLUE }}>{fmt(p.price)}</span>
            {p.orig && <span style={{ fontSize: 14, color: "#94a3b8", textDecoration: "line-through", marginBottom: 4 }}>{fmt(p.orig)}</span>}
          </div>
          <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.7, marginBottom: 16 }}>{p.desc}</p>
          {p.specs && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 16 }}>
              {p.specs.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, background: "#f8fafc", borderRadius: 10, padding: "7px 10px", fontSize: 11, fontWeight: 600, color: "#334155" }}>
                  <span style={{ color: BLUE, fontSize: 12 }}>✓</span>{s}
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16, fontSize: 12, fontWeight: 600, color: max > 5 ? "#047857" : max > 0 ? "#b45309" : "#dc2626" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: max > 5 ? "#10b981" : max > 0 ? "#f59e0b" : "#ef4444", display: "inline-block" }} />
            {max > 5 ? "En stock" : max > 0 ? `⚠ Plus que ${max} en stock` : "Rupture de stock"}
          </div>
          {max > 0 && (
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 38, height: 44, border: "none", background: "none", cursor: "pointer", fontSize: 16, fontWeight: 700 }}>−</button>
                <span style={{ width: 40, textAlign: "center", fontWeight: 800, fontSize: 14 }}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(q + 1, max))} disabled={qty >= max} style={{ width: 38, height: 44, border: "none", background: "none", cursor: qty >= max ? "not-allowed" : "pointer", fontSize: 16, fontWeight: 700, opacity: qty >= max ? .4 : 1 }}>+</button>
              </div>
              <button onClick={add} style={{
                flex: 1, padding: "12px 16px", borderRadius: 12, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13,
                background: added ? "#10b981" : grad, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "'Sora',sans-serif", transition: "background .2s"
              }}>
                {added ? "✓ Ajouté au panier !" : "🛒 Ajouter au panier"}
              </button>
              <button onClick={() => { toggle(p.id); push(liked ? "Retiré des favoris" : "Ajouté aux favoris 💛"); }} style={{ width: 44, height: 44, borderRadius: 12, border: `2px solid ${liked ? "#fca5a5" : "#e2e8f0"}`, background: liked ? "#fef2f2" : "none", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {liked ? "❤️" : "🤍"}
              </button>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
            {[["🚚", "Livraison 24-48h"], ["🔒", "Garanti Officiel"], ["🔄", "Retour 7 jours"]].map(([ic, t], i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "#f8fafc", borderRadius: 12, padding: 10, textAlign: "center" }}>
                <span style={{ fontSize: 18 }}>{ic}</span>
                <span style={{ fontSize: 10, color: "#475569", fontWeight: 600, lineHeight: 1.3 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: "#0f172a", marginBottom: 14 }}>Produits similaires</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: 14 }}>
            {related.map(rp => <ProductCard key={rp.id} p={rp} go={go} />)}
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
    prenom: "", telephone: "", adresse: "",
    payMethod: "cod",
    deliveryMode: "home",   // "home" | "relay"
    relayPoint: "",         // ID du point relais choisi
    payProvider: "wave",    // "wave" | "orange_money" | "yas"
  });
  const pay = form.payMethod;
  const setPay = (v) => setForm(f => ({ ...f, payMethod: v }));
  const [err, setErr] = useState({});
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [payProgress, setPayProgress] = useState(0); // 0: off, 1: attente, 2: succès
  const orderId = useRef(null);

  useEffect(() => { setErr({}); }, [step]);

  const inp = e => { setForm(f => ({ ...f, [e.target.name]: e.target.value })); setErr(er => ({ ...er, [e.target.name]: "" })); };

  /** Détermine l'adresse effective selon le mode de livraison */
  const effectiveAdresse = form.deliveryMode === "relay"
    ? (RELAY_POINTS.find(r => r.id === form.relayPoint)?.label || "")
    : form.adresse;

  /** Label du provider paiement sélectionné */
  const providerLabel = PAYMENT_PROVIDERS.find(p => p.id === form.payProvider)?.label || "Mobile Money";
  const providerColor = PAYMENT_PROVIDERS.find(p => p.id === form.payProvider)?.color || BLUE;

  const finalizeOrder = async () => {
    setSubmitting(true);
    try {
      const res = await window.api.createOrder({
        delivery: { ...form, adresse: effectiveAdresse },
        items: items.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
        payMethod: form.payMethod,
        deliveryMode: form.deliveryMode,
        payProvider: form.payMethod === "online" ? form.payProvider : null,
      });
      if (res.success) {
        orderId.current = res.data?.orderName;
        dispatch({ type: "CLEAR" });
        setDone(true);
        push("Commande enregistrée ! 🎉");
      } else {
        push(res.error || "Erreur lors de la commande", "error");
      }
    } catch (e) { push("Erreur réseau : " + e.message, "error"); }
    finally { setSubmitting(false); }
  };

  const submit = async () => {
    if (form.payMethod !== "cod" && payProgress === 0) {
      setPayProgress(1);
      setTimeout(() => setPayProgress(2), 3500);
      setTimeout(() => { setPayProgress(0); finalizeOrder(); }, 5000);
      return;
    }
    finalizeOrder();
  };

  const validate = () => {
    const e = {};
    if (!form.prenom.trim()) e.prenom = "Requis";
    if (!/^\d{9}$/.test(form.telephone.replace(/\s/g, ""))) e.telephone = "9 chiffres requis";
    if (form.deliveryMode === "home" && !form.adresse.trim()) e.adresse = "Requise";
    if (form.deliveryMode === "relay" && !form.relayPoint) e.relayPoint = "Choisissez un point relais";
    setErr(e);
    if (Object.keys(e).length) { push("Veuillez corriger les erreurs", "error"); return false; }
    return true;
  };

  if (!done && items.length === 0) return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 48, marginBottom: 12, opacity: .3 }}>🛒</p>
        <p style={{ fontWeight: 700, color: "#64748b", marginBottom: 16 }}>Votre panier est vide</p>
        <Btn onClick={() => go("catalog")}>Voir les produits</Btn>
      </div>
    </div>
  );

  if (done) return (
    <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ maxWidth: 400, width: "100%", textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 36, boxShadow: "0 8px 24px rgba(16,185,129,.3)" }}>✓</div>
        <h2 style={{ fontSize: 24, fontWeight: 900, color: "#0f172a", marginBottom: 10 }}>Commande enregistrée ! 🎉</h2>
        <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, marginBottom: 20 }}>Merci <strong>{form.prenom}</strong> ! Vous recevrez un SMS de confirmation au <strong>+221 {form.telephone}</strong>.</p>
        <div style={{ background: "#eff6ff", borderRadius: 16, padding: 16, textAlign: "left", marginBottom: 20 }}>
          <p style={{ fontSize: 14, fontWeight: 900, color: DARK_BLUE, marginBottom: 10 }}>
            {orderId.current ? `Réf : ${orderId.current}` : "Commande en cours de traitement"}
          </p>
          {[
            ["Mode livraison", form.deliveryMode === "home" ? "🏠 Livraison à domicile" : "📦 Point Relais"],
            ["Adresse", effectiveAdresse || form.adresse],
            ["Délai estimé", form.deliveryMode === "relay" ? "24–72h" : "24–48h"],
            ["Paiement", pay === "cod" ? "💵 À la livraison" : `${PAYMENT_PROVIDERS.find(p => p.id === form.payProvider)?.emoji} ${providerLabel}`],
          ].map(([k, v]) => (
            <p key={k} style={{ fontSize: 12, color: "#2563eb", marginBottom: 4 }}>{k} : <strong>{v}</strong></p>
          ))}
        </div>
        <Btn onClick={() => go("home")} style={{ width: "100%", borderRadius: 12 }}>Retour à l'accueil →</Btn>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 16px 40px" }}>
      <button onClick={() => go("catalog")} style={{ border: "none", background: "none", cursor: "pointer", color: "#94a3b8", fontSize: 12, marginBottom: 16, display: "flex", alignItems: "center", gap: 4 }}>← Retour au catalogue</button>
      <h1 style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", marginBottom: 20 }}>Finaliser la commande</h1>

      {/* Steps indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
        {[{ n: 1, l: "Livraison" }, { n: 2, l: "Paiement" }, { n: 3, l: "Confirmation" }].map((s, i) => (
          <React.Fragment key={s.n}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: step >= s.n ? BLUE : "#f1f5f9", color: step >= s.n ? "#fff" : "#94a3b8", transition: "all .2s" }}>
              <span style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(255,255,255,.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>
                {step > s.n ? "✓" : s.n}
              </span>
              {s.l}
            </div>
            {i < 2 && <div style={{ flex: 1, maxWidth: 30, height: 2, background: step > s.n ? BLUE : "#e2e8f0", transition: "background .2s" }} />}
          </React.Fragment>
        ))}
      </div>

      <div className="checkout-main-grid" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 20, alignItems: "start" }}>
        <div>
          {/* ── Step 1 : Livraison ── */}
          {step === 1 && (
            <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #f1f5f9", padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginBottom: 20 }}>📍 Infos de livraison</h2>

              {/* Prénom */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "#94a3b8", marginBottom: 4, textTransform: "uppercase" }}>Prénom *</label>
                <input name="prenom" value={form.prenom} onChange={inp} placeholder="Moussa"
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${err.prenom ? "#fca5a5" : "#e2e8f0"}`, fontSize: 13, fontFamily: "'Sora',sans-serif", background: err.prenom ? "#fff5f5" : "#fff" }} />
                {err.prenom && <p style={{ fontSize: 10, color: "#ef4444", marginTop: 3 }}>{err.prenom}</p>}
              </div>

              {/* Téléphone */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "#94a3b8", marginBottom: 4, textTransform: "uppercase" }}>Téléphone *</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#f8fafc", fontSize: 12, color: "#64748b", flexShrink: 0, display: "flex", alignItems: "center", gap: 4 }}>🇸🇳 +221</div>
                  <div style={{ flex: 1 }}>
                    <input name="telephone" value={form.telephone} onChange={inp} placeholder="77 000 00 00"
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${err.telephone ? "#fca5a5" : "#e2e8f0"}`, fontSize: 13, fontFamily: "'Sora',sans-serif" }} />
                    {err.telephone && <p style={{ fontSize: 10, color: "#ef4444", marginTop: 3 }}>{err.telephone}</p>}
                  </div>
                </div>
              </div>

              {/* Mode de livraison */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "#94a3b8", marginBottom: 8, textTransform: "uppercase" }}>Mode de livraison *</label>
                <div style={{ display: "flex", gap: 10 }}>
                  {DELIVERY_MODES.map(mode => (
                    <button
                      key={mode.id}
                      className={`delivery-card${form.deliveryMode === mode.id ? " active" : ""}`}
                      onClick={() => setForm(f => ({ ...f, deliveryMode: mode.id, relayPoint: "" }))}
                      style={{ flex: 1 }}
                    >
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: form.deliveryMode === mode.id ? "#dbeafe" : "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{mode.icon}</div>
                      <div style={{ textAlign: "left" }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: form.deliveryMode === mode.id ? BLUE : "#1e293b" }}>{mode.label}</p>
                        <p style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{mode.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Adresse ou Point Relais */}
              <div style={{ marginBottom: 20 }}>
                {form.deliveryMode === "home" ? (
                  <>
                    <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "#94a3b8", marginBottom: 4, textTransform: "uppercase" }}>Adresse de livraison *</label>
                    <input name="adresse" value={form.adresse} onChange={inp} placeholder="Rue, numéro, quartier, Dakar..."
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${err.adresse ? "#fca5a5" : "#e2e8f0"}`, fontSize: 13, fontFamily: "'Sora',sans-serif", background: err.adresse ? "#fff5f5" : "#fff" }} />
                    {err.adresse && <p style={{ fontSize: 10, color: "#ef4444", marginTop: 3 }}>{err.adresse}</p>}
                  </>
                ) : (
                  <>
                    <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "#94a3b8", marginBottom: 4, textTransform: "uppercase" }}>Choisir un Point Relais *</label>
                    <select
                      name="relayPoint" value={form.relayPoint}
                      onChange={e => { setForm(f => ({ ...f, relayPoint: e.target.value })); setErr(er => ({ ...er, relayPoint: "" })); }}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${err.relayPoint ? "#fca5a5" : "#e2e8f0"}`, fontSize: 13, fontFamily: "'Sora',sans-serif", background: err.relayPoint ? "#fff5f5" : "#fff" }}
                    >
                      <option value="">-- Sélectionner un point relais --</option>
                      {RELAY_POINTS.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                    </select>
                    {err.relayPoint && <p style={{ fontSize: 10, color: "#ef4444", marginTop: 3 }}>{err.relayPoint}</p>}
                  </>
                )}
              </div>

              <Btn onClick={() => { if (validate()) setStep(2); }} style={{ width: "100%", borderRadius: 12, padding: "13px 20px" }}>
                Continuer vers le paiement →
              </Btn>
            </div>
          )}

          {/* ── Step 2 : Paiement ── */}
          {step === 2 && (
            <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #f1f5f9", padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginBottom: 20 }}>💳 Méthode de paiement</h2>

              {/* Choix COD / Mobile */}
              {[
                { v: "cod",    icon: "💵", title: "Paiement à la livraison", sub: "Payez en cash à la réception" },
                { v: "online", icon: "📱", title: "Mobile Money",            sub: "Wave, Orange Money ou Yas" },
              ].map(({ v, icon, title, sub }) => (
                <label key={v} onClick={() => setPay(v)} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: 14, borderRadius: 14, border: `2px solid ${pay === v ? BLUE : "#e2e8f0"}`, background: pay === v ? "#eff6ff" : "#fff", cursor: "pointer", marginBottom: 10, transition: "all .2s" }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${pay === v ? BLUE : "#cbd5e1"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                    {pay === v && <div style={{ width: 8, height: 8, borderRadius: "50%", background: BLUE }} />}
                  </div>
                  <span style={{ fontSize: 22 }}>{icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{title}</p>
                    <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{sub}</p>

                    {/* Sélecteur de provider Mobile Money */}
                    {v === "online" && pay === "online" && (
                      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                        {PAYMENT_PROVIDERS.map(pv => (
                          <button
                            key={pv.id}
                            className={`payment-provider-btn${form.payProvider === pv.id ? " active" : ""}`}
                            onClick={e => { e.stopPropagation(); setForm(f => ({ ...f, payProvider: pv.id })); }}
                            style={{
                              borderColor: form.payProvider === pv.id ? pv.color : "#e2e8f0",
                              background: form.payProvider === pv.id ? pv.bg : "#fff",
                            }}
                          >
                            <span style={{ fontSize: 22 }}>{pv.emoji}</span>
                            <span style={{ fontSize: 10, fontWeight: 800, color: form.payProvider === pv.id ? pv.color : "#475569" }}>{pv.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </label>
              ))}

              {/* Simulateur paiement mobile */}
              {pay === "online" && payProgress === 1 && (
                <div style={{ padding: 16, background: `${PAYMENT_PROVIDERS.find(p => p.id === form.payProvider)?.bg || "#eff6ff"}`, borderRadius: 14, marginBottom: 16, textAlign: "center" }}>
                  <div className="pulse-pay" style={{ fontSize: 32, marginBottom: 8 }}>{PAYMENT_PROVIDERS.find(p => p.id === form.payProvider)?.emoji}</div>
                  <p style={{ fontWeight: 800, color: providerColor, fontSize: 13, marginBottom: 4 }}>Paiement {providerLabel} en cours…</p>
                  <p style={{ fontSize: 11, color: "#64748b" }}>Validez la transaction sur votre téléphone</p>
                </div>
              )}
              {pay === "online" && payProgress === 2 && (
                <div style={{ padding: 14, background: "#ecfdf5", borderRadius: 14, marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 22 }}>✅</span>
                  <p style={{ fontWeight: 700, color: "#047857", fontSize: 13 }}>Paiement {providerLabel} validé !</p>
                </div>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button onClick={() => setStep(1)} style={{ padding: "10px 16px", borderRadius: 10, border: "1px solid #e2e8f0", background: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Sora',sans-serif" }}>← Retour</button>
                <Btn onClick={() => setStep(3)} style={{ flex: 1, borderRadius: 12 }}>Vérifier la commande →</Btn>
              </div>
            </div>
          )}

          {/* ── Step 3 : Confirmation ── */}
          {step === 3 && (
            <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #f1f5f9", padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginBottom: 16 }}>📋 Récapitulatif final</h2>
              <div style={{ background: "#f8fafc", borderRadius: 12, padding: 12, marginBottom: 16 }}>
                {[
                  ["Client", form.prenom],
                  ["Téléphone", `+221 ${form.telephone}`],
                  ["Mode livraison", form.deliveryMode === "home" ? "🏠 Domicile" : "📦 Point Relais"],
                  ["Adresse", effectiveAdresse || form.adresse],
                  ["Paiement", pay === "cod" ? "💵 À la livraison" : `${PAYMENT_PROVIDERS.find(p => p.id === form.payProvider)?.emoji} ${providerLabel}`],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12 }}>
                    <span style={{ color: "#94a3b8" }}>{k}</span>
                    <span style={{ fontWeight: 600, textAlign: "right", maxWidth: "60%" }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ maxHeight: 180, overflowY: "auto", marginBottom: 16 }}>
                {items.map(item => (
                  <div key={item.id} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                    <SafeImg src={item.img} alt={item.name} style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 11, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</p>
                      <p style={{ fontSize: 10, color: "#94a3b8" }}>× {item.qty}</p>
                    </div>
                    <p style={{ fontSize: 11, fontWeight: 800, color: BLUE, flexShrink: 0 }}>{fmt(item.price * item.qty)}</p>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 12, marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>
                  <span>Livraison</span><span style={{ color: "#059669", fontWeight: 700 }}>Gratuite 🎉</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 900, fontSize: 15 }}>
                  <span>Total à payer</span><span style={{ color: BLUE }}>{fmt(total)}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setStep(2)} style={{ padding: "10px 16px", borderRadius: 10, border: "1px solid #e2e8f0", background: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Sora',sans-serif" }}>← Retour</button>
                <button
                  onClick={submit}
                  disabled={submitting}
                  style={{ flex: 1, padding: "13px 20px", borderRadius: 12, border: "none", background: submitting ? "#94a3b8" : "#10b981", color: "#fff", fontWeight: 800, fontSize: 13, cursor: submitting ? "not-allowed" : "pointer", fontFamily: "'Sora',sans-serif", boxShadow: submitting ? "none" : "0 4px 16px rgba(16,185,129,.35)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all .2s" }}
                >
                  {submitting
                    ? <><span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }} />Envoi...</>
                    : <>✓ Confirmer la commande</>}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Récapitulatif sidebar (desktop uniquement) */}
        <div style={{ width: 240, flexShrink: 0 }} className="hide-mobile">
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", padding: 16, marginBottom: 12, boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}>
            <p style={{ fontWeight: 800, fontSize: 13, marginBottom: 12 }}>Votre commande</p>
            <div style={{ maxHeight: 180, overflowY: "auto", marginBottom: 12 }}>
              {items.map(item => (
                <div key={item.id} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                  <SafeImg src={item.img} alt={item.name} style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 10, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</p>
                    <p style={{ fontSize: 10, color: "#94a3b8" }}>×{item.qty}</p>
                  </div>
                  <p style={{ fontSize: 10, fontWeight: 800, color: BLUE, flexShrink: 0 }}>{fmt(item.price * item.qty)}</p>
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#94a3b8", marginBottom: 4 }}>
                <span>Livraison</span><span style={{ color: "#059669", fontWeight: 700 }}>Gratuite</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 900, fontSize: 14 }}>
                <span>Total</span><span style={{ color: BLUE }}>{fmt(total)}</span>
              </div>
            </div>
          </div>
          <div style={{ background: "#eff6ff", borderRadius: 14, padding: 12 }}>
            {[["🔒", "Paiement sécurisé"], ["🚚", "Livraison 24-48h"], ["📞", "Support 7j/7"]].map(([ic, t]) => (
              <p key={t} style={{ fontSize: 11, color: "#1d4ed8", display: "flex", alignItems: "center", gap: 6, marginBottom: 4, fontWeight: 600 }}><span>{ic}</span>{t}</p>
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
function Wishlist({ go, allProducts = PRODS }) {
  const { ids } = useWish();
  const wish = allProducts.filter(p => ids.has(p.id));
  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "20px 16px 40px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
        ❤️ Mes Favoris <span style={{ fontSize: 15, color: "#94a3b8", fontWeight: 500 }}>({wish.length})</span>
      </h1>
      {wish.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8" }}>
          <p style={{ fontSize: 48, marginBottom: 12, opacity: .3 }}>🤍</p>
          <p style={{ fontWeight: 700, color: "#64748b", marginBottom: 16 }}>Aucun favori pour l'instant</p>
          <Btn onClick={() => go("catalog")}>Découvrir les produits</Btn>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: 14 }}>
          {wish.map(p => <ProductCard key={p.id} p={p} go={go} />)}
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
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 16px 40px" }}>
      <div style={{ background: "#fff", borderRadius: 24, border: "1px solid #f1f5f9", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,.06)" }}>
        <div style={{ background: grad, padding: "32px 24px", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 30 }}>👤</div>
          <h2 style={{ color: "#fff", fontWeight: 900, fontSize: 18 }}>Bienvenue !</h2>
          <p style={{ color: "rgba(255,255,255,.7)", fontSize: 12, marginTop: 4 }}>Connectez-vous pour accéder à votre compte</p>
        </div>
        <div style={{ padding: 24 }}>
          <Btn style={{ width: "100%", borderRadius: 12, padding: "12px 20px", marginBottom: 10 }}>👤 Se connecter</Btn>
          <Btn outline style={{ width: "100%", borderRadius: 12, padding: "12px 20px", marginBottom: 20 }}>Créer un compte</Btn>
          <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 16 }}>
            {["🛍 Mes commandes", "📍 Mes adresses", "❤️ Mes favoris", "⚙️ Paramètres"].map(item => (
              <button key={item} onClick={item.includes("favoris") ? () => go("wishlist") : undefined} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "10px 12px", borderRadius: 10, border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: "'Sora',sans-serif", marginBottom: 2 }}
                onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                onMouseLeave={e => e.currentTarget.style.background = "none"}>
                <span>{item}</span><span style={{ color: "#94a3b8" }}>›</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
