/* ═══════════════════════════════════════════════
   KUMPAX STORE — App (Point d'entrée)
   ═══════════════════════════════════════════════ */

function App() {
  const path = window.location.pathname.replace(/\/+$/, "").toLowerCase() || "/";
  const initPage = path === "/admin" ? "admin" : "home";

  const [page, setPage] = useState(initPage);
  const [prod, setProd] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [q, setQ] = useState("");
  const [initCat, setInitCat] = useState("Tous");

  // État global produits & catégories (chargés une seule fois depuis Odoo/mock)
  const [allProducts, setAllProducts] = useState(window.USE_ODOO ? [] : PRODS);
  const [categories, setCategories] = useState(window.USE_ODOO ? [] : CATS);
  const [dataLoading, setDataLoading] = useState(false);
  const [promotions, setPromotions] = useState([]);

  useEffect(() => {
    if (!window.USE_ODOO) return;
    (async () => {
      setDataLoading(true);
      try {
        const [pRes, cRes] = await Promise.all([window.api.getProducts(), window.api.getCategories()]);
        if (pRes.success) setAllProducts(pRes.data && pRes.data.length ? pRes.data : []);
        if (cRes.success) setCategories(cRes.data && cRes.data.length ? cRes.data : []);
      } catch (e) { console.warn("Chargement Odoo échoué", e.message); }
      finally { setDataLoading(false); }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const res = await window.api.getActivePromotions();
      if (res.success) setPromotions(res.data || []);
    })();
  }, []);

  useEffect(() => {
    const openCart = () => setCartOpen(true);
    window.addEventListener("kumpax:open-cart", openCart);
    return () => window.removeEventListener("kumpax:open-cart", openCart);
  }, []);

  const go = useCallback((target, opts = {}) => {
    if (opts.product) setProd(opts.product);
    if (opts.cat) setInitCat(opts.cat);
    setPage(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <CartProvider><WishProvider><ToastProvider>
      {page === "admin" ? (
        <Admin onExit={() => { window.history.pushState({}, "", "/"); setPage("home"); }} url={window.API_URL} />
      ) : (
        <div style={{ minHeight: "100vh", background: "#F8FAFC" }}>
          <Navbar go={go} setCartOpen={setCartOpen} q={q} setQ={setQ} categories={categories} />
          <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} go={go} />

          {/* Demo banner */}
          {!window.USE_ODOO && (
            <div style={{
              background: "#FEF3C7", borderBottom: "1px solid #FDE68A",
              padding: "8px 20px", display: "flex", alignItems: "center", justifyContent: "center",
              gap: 8, fontSize: 12, color: "#92400E", fontWeight: 600, fontFamily: FONT_BODY,
            }}>
              ⚠️ Mode démo — données simulées.
            </div>
          )}

          <main className="fade-in" key={page}>
            {page === "home" && <Home go={go} products={allProducts} categories={categories} loading={dataLoading} promotions={promotions} />}
            {page === "catalog" && <Catalog go={go} initCat={initCat} q={q} products={allProducts} categories={categories} promotions={promotions} />}
            {page === "product" && prod && <ProductPage p={prod} go={go} allProducts={allProducts} promotions={promotions} />}
            {page === "checkout" && <Checkout go={go} />}
            {page === "wishlist" && <Wishlist go={go} allProducts={allProducts} promotions={promotions} />}
            {page === "account" && <Account go={go} />}
          </main>

          <Footer go={go} />
        </div>
      )}
    </ToastProvider></WishProvider></CartProvider>
  );
}

// ── Montage React ──
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
