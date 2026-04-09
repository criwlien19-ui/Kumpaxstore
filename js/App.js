/* ═══════════════════════════════════════════════
   KUMPAX STORE — App (Point d'entrée)
   ═══════════════════════════════════════════════ */

// Mot de passe admin (modifiable ici)
const ADMIN_PASSWORD = "kumpax2024";

function App() {
  const path = window.location.pathname;
  // Détection de l'URL admin
  const initPage = path.toLowerCase() === "/admin" ? "admin" : "home";

  const [page, setPage] = useState(initPage);
  const [prod, setProd] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [q, setQ] = useState("");
  const [initCat, setInitCat] = useState("Tous");

  // État global produits & catégories (chargés une seule fois depuis Odoo/mock)
  const [allProducts, setAllProducts] = useState(PRODS);
  const [categories, setCategories] = useState(CATS);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    if (!window.USE_ODOO) return; // en mode démo, on garde les données mock
    (async () => {
      setDataLoading(true);
      try {
        const [pRes, cRes] = await Promise.all([window.api.getProducts(), window.api.getCategories()]);
        if (pRes.success) {
          setAllProducts(pRes.data && pRes.data.length ? pRes.data : []);
        }
        if (cRes.success) {
          setCategories(cRes.data && cRes.data.length ? cRes.data : []);
        }
      } catch (e) {
        console.warn("Chargement Odoo échoué", e.message);
      } finally {
        setDataLoading(false);
      }
    })();
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
        <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
          <Navbar go={go} setCartOpen={setCartOpen} q={q} setQ={setQ} categories={categories} />
          <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} go={go} />
          {/* Bannière mode démo */}
          {!window.USE_ODOO && (
            <div style={{ background: "#fef3c7", borderBottom: "1px solid #fde68a", padding: "7px 16px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 11, color: "#92400e", fontWeight: 600 }}>
              ⚠️ Mode démo — données simulées. Pour connecter Odoo, configurez <code style={{ background: "rgba(0,0,0,.07)", padding: "1px 5px", borderRadius: 4 }}>window.KUMPAX_USE_ODOO=true</code> et <code style={{ background: "rgba(0,0,0,.07)", padding: "1px 5px", borderRadius: 4 }}>window.KUMPAX_API_URL</code>
            </div>
          )}
          <main className="fade-in" key={page}>
            {page === "home" && <Home go={go} products={allProducts} categories={categories} loading={dataLoading} />}
            {page === "catalog" && <Catalog go={go} initCat={initCat} q={q} products={allProducts} categories={categories} />}
            {page === "product" && prod && <ProductPage p={prod} go={go} allProducts={allProducts} />}
            {page === "checkout" && <Checkout go={go} />}
            {page === "wishlist" && <Wishlist go={go} allProducts={allProducts} />}
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
