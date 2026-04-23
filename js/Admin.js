// Admin.js — uses globals: React hooks from components.js, fmt from data.js, useToast from contexts.js

/* ═══════════════════════════════════════════════
   KUMPAX STORE — Admin Panel (JWT + Odoo)
   ═══════════════════════════════════════════════ */

function Admin({ onExit }) {
  const [auth, setAuth] = useState(!!sessionStorage.getItem("admin_token"));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingToken, setCheckingToken] = useState(!!sessionStorage.getItem("admin_token"));
  const { push } = useToast();

  useEffect(() => {
    if (!sessionStorage.getItem("admin_token")) return;
    (async () => {
      try {
        const res = await window.api.adminValidateSession();
        if (!res.success) {
          window.api.adminLogout();
          setAuth(false);
        }
      } catch {
        window.api.adminLogout();
        setAuth(false);
      } finally {
        setCheckingToken(false);
      }
    })();
  }, []);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!username || !password) return push("Veuillez remplir tous les champs", "warn");

    setLoading(true);
    try {
      const res = await window.api.adminLogin(username, password);
      if (res.success) {
        setAuth(true);
        push("Bienvenue, " + res.username);
      } else {
        push(res.error || res.technicalError || "Identifiants incorrects", "error");
      }
    } catch (err) {
      push("Impossible de se connecter au serveur admin", "error");
    } finally {
      setLoading(false);
    }
  };

  if (checkingToken) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", color: "#64748b", fontWeight: 600 }}>
        Vérification de session admin...
      </div>
    );
  }

  if (!auth) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <div style={{ background: "#fff", padding: 40, borderRadius: 24, boxShadow: "0 10px 25px -5px rgba(0,0,0,.05)", width: "100%", maxWidth: 360, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 20 }}>🛡️</div>
          <h1 style={{ fontSize: 20, fontWeight: 900, marginBottom: 24, letterSpacing: "-0.5px" }}>Kumpax Admin</h1>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Nom d'utilisateur"
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={{ width: "100%", padding: 16, borderRadius: 12, border: "2px solid #e2e8f0", fontSize: 14, outline: "none", marginBottom: 16 }}
              autoFocus
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width: "100%", padding: 16, borderRadius: 12, border: "2px solid #e2e8f0", fontSize: 14, outline: "none", marginBottom: 16 }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{ width: "100%", padding: 16, borderRadius: 12, border: "none", background: loading ? "#94a3b8" : "linear-gradient(135deg, #1E40AF, #3B82F6)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
          <p style={{ color: "#64748b", fontSize: 12, cursor: "pointer", marginTop: 24 }} onClick={onExit}>← Retour au site</p>
        </div>
      </div>
    );
  }

  return <AdminApp onExit={() => { window.api.adminLogout(); setAuth(false); onExit(); }} />;
}

// ─── Application Admin Principale ──────────────────────────────
function AdminApp({ onExit }) {
  const [tab, setTab] = useState("dash");
  const { push } = useToast();

  const [stats, setStats] = useState(null);
  const [chart, setChart] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [promoProducts, setPromoProducts] = useState([]);

  const [odooStatus, setOdooStatus] = useState("checking");

  const loadDashboard = useCallback(async () => {
    try {
      const [sRes, cRes] = await Promise.all([window.api.adminGetStats(), window.api.adminGetSalesChart(14)]);
      if (sRes.success) setStats(sRes.data);
      if (cRes.success) setChart(cRes.data);
      setOdooStatus("ok");
    } catch { setOdooStatus("error"); }
  }, []);

  const loadProducts = useCallback(async () => {
    const r = await window.api.adminGetProducts();
    if (r.success) setProducts(r.data);
  }, []);

  const loadOrders = useCallback(async () => {
    const r = await window.api.adminGetOrders();
    if (r.success) setOrders(r.data);
  }, []);

  const loadCustomers = useCallback(async () => {
    const r = await window.api.adminGetCustomers();
    if (r.success) setCustomers(r.data);
  }, []);

  const loadPromotions = useCallback(async () => {
    const r = await window.api.adminGetPromotions();
    if (r.success) setPromotions(r.data);
  }, []);

  const loadPromotionProducts = useCallback(async (search = "") => {
    const r = await window.api.adminGetProductsLite(search, 500);
    if (r.success) setPromoProducts(r.data || []);
  }, []);

  useEffect(() => {
    if (tab === "dash") loadDashboard();
    else if (tab === "products") loadProducts();
    else if (tab === "orders") loadOrders();
    else if (tab === "customers") loadCustomers();
    else if (tab === "promotions") { loadPromotions(); loadPromotionProducts(); }
  }, [tab, loadDashboard, loadProducts, loadOrders, loadCustomers, loadPromotions, loadPromotionProducts]);

  const TABS = { dash: "Tableau de bord", products: "Produits & Stocks", orders: "Commandes", customers: "Clients", promotions: "Promotions & Réductions" };
  const grad = "linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)";

  const NavBtn = ({ id, ic, label }) => (
    <button onClick={() => setTab(id)} style={{
      display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "9px 12px", borderRadius: 10, border: "none",
      background: tab === id ? grad : "transparent", color: tab === id ? "#fff" : "#64748b",
      fontSize: 12, fontWeight: tab === id ? 700 : 500, cursor: "pointer", fontFamily: "'Sora',sans-serif", marginBottom: 2, transition: "all .15s"
    }}><span>{ic}</span>{label}</button>
  );

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f8fafc", overflow: "hidden", fontFamily: "'Sora',sans-serif" }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: "#fff", borderRight: "1px solid #f1f5f9", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "16px 14px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>🛡️</div>
          <div><p style={{ fontWeight: 900, fontSize: 11, color: "#0f172a" }}>Kumpax Store</p><p style={{ fontSize: 10, color: "#94a3b8" }}>Administration</p></div>
        </div>
        <nav style={{ flex: 1, padding: 12 }}>
          <NavBtn id="dash" ic="📊" label="Tableau de bord" />
          <NavBtn id="products" ic="📦" label="Produits & Stocks" />
          <NavBtn id="orders" ic="🛍" label="Commandes" />
          <NavBtn id="customers" ic="👥" label="Clients" />
          <NavBtn id="promotions" ic="🏷️" label="Promotions" />
        </nav>
        <div style={{ padding: 12, borderTop: "1px solid #f1f5f9" }}>
          <button
            onClick={() => { if (window.confirm("Se déconnecter de l'admin Kumpax ?")) onExit(); }}
            style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "9px 12px", borderRadius: 10, border: "none", background: "#fef2f2", color: "#ef4444", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            🚩 Déconnexion
          </button>
        </div>
      </aside>

      {/* Content */}
      <main style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        <div style={{ background: "#fff", borderBottom: "1px solid #f1f5f9", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
          <div>
            <h1 style={{ fontWeight: 900, fontSize: 15, color: "#0f172a" }}>{TABS[tab]}</h1>
            <p style={{ fontSize: 10, color: "#94a3b8" }}>Données synchronisées avec Odoo</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 99, fontSize: 10, fontWeight: 700,
              background: odooStatus === "ok" ? "#d1fae5" : odooStatus === "error" ? "#fee2e2" : "#fef3c7",
              color: odooStatus === "ok" ? "#047857" : odooStatus === "error" ? "#dc2626" : "#b45309"
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
              {odooStatus === "ok" ? "🔗 Odoo Live" : odooStatus === "error" ? "⚠ Odoo Hors Ligne" : "⏳ Connexion..."}
            </div>
          </div>
        </div>

        <div style={{ padding: 24, flex: 1 }}>
          {tab === "dash" && (stats ? <AdminDashboard stats={stats} chart={chart} /> : <div style={{display:'flex',alignItems:'center',justifyContent:'center',padding:60,color:'#94a3b8',fontSize:13,fontWeight:600}}>⏳ Chargement du tableau de bord...</div>)}
          {tab === "products" && <AdminProducts products={products} refresh={loadProducts} />}
          {tab === "orders" && <AdminOrders orders={orders} refresh={loadOrders} />}
          {tab === "customers" && <AdminCustomers customers={customers} />}
          {tab === "promotions" && <AdminPromotions promotions={promotions} products={promoProducts} refresh={loadPromotions} reloadProducts={loadPromotionProducts} />}
        </div>
      </main>
    </div>
  );
}

// ─── 1. Tableau de Bord ──────────────────────────────────────────
function AdminDashboard({ stats, chart }) {
  const Kpis = [
    { l: "Chiffre d'affaires", v: fmt(stats.revenue), ch: stats.revGrowth ? `+${parseFloat(stats.revGrowth)}% MoM` : null, bg: "#eff6ff", c: "#1d4ed8", ic: "📊" },
    { l: "Commandes aujourd'hui", v: stats.ordersToday ?? 0, ch: `${stats.ordersThisMonth || 0} ce mois`, bg: "#f0fdf4", c: "#059669", ic: "🛘" },
    { l: "Produits en ligne", v: stats.productCount, bg: "#fffbeb", c: "#d97706", ic: "📦" },
    { l: "Clients (Odoo)", v: stats.customerCount, bg: "#f5f3ff", c: "#7c3aed", ic: "👥" },
  ];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
        {Kpis.map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 16, padding: 16, border: "1px solid #f1f5f9", boxShadow: "0 1px 4px rgba(0,0,0,.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{s.ic}</div>
              {s.ch && <span style={{ fontSize: 9, fontWeight: 800, color: s.c, background: s.bg, padding: "3px 8px", borderRadius: 99 }}>{s.ch}</span>}
            </div>
            <p style={{ fontSize: 17, fontWeight: 900, color: "#0f172a" }}>{s.v}</p>
            <p style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{s.l}</p>
          </div>
        ))}
      </div>

      {chart.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", padding: 20, marginBottom: 20 }}>
          <p style={{ fontWeight: 800, fontSize: 13, marginBottom: 16 }}>Ventes des 14 derniers jours</p>
          <SalesChart data={chart} />
        </div>
      )}
    </div>
  );
}

function SalesChart({ data }) {
  const max = Math.max(...data.map(d => d.amount), 1);
  return (
    <div style={{ display: "flex", height: 180, alignItems: "flex-end", gap: 6, paddingTop: 20 }}>
      {data.map((d, i) => {
        const height = (d.amount / max) * 100 + "%";
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, position: "relative" }}>
            {/* Tooltip on hover — events are on the bar below */}
            <div style={{ opacity: 0, position: "absolute", top: -30, background: "#1e293b", color: "#fff", fontSize: 10, padding: "4px 8px", borderRadius: 6, whiteSpace: "nowrap", pointerEvents: "none", transition: "opacity .2s" }}>
              {fmt(d.amount)}
            </div>
            <div style={{ width: "100%", background: "#e2e8f0", borderRadius: 4, height: 140, display: "flex", alignItems: "flex-end", overflow: "hidden" }}
              onMouseEnter={e => e.currentTarget.previousSibling.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.previousSibling.style.opacity = 0}>
              <div style={{ width: "100%", height, background: "linear-gradient(180deg, #3B82F6 0%, #1D4ED8 100%)", borderRadius: 4, transition: "height 0.3s" }} />
            </div>
            <span style={{ fontSize: 9, color: "#94a3b8", transform: "rotate(-45deg) translate(-4px, -4px)", transformOrigin: "right" }}>{d.date.slice(5)}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── 2. Produits & Stocks ───────────────────────────────────────
function AdminProducts({ products, refresh }) {
  const { push } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [cats, setCats] = useState([]);

  // Nouveau produit
  const [form, setForm] = useState({ name: "", list_price: "", categ_id: "", stock: "" });

  useEffect(() => {
    window.api.getCategories().then(r => {
      if (r.success) setCats(r.data);
    });
  }, []);

  const handleCreate = async () => {
    if (!form.name || !form.list_price) return push("Nom et Prix requis", "warn");
    const r = await window.api.adminCreateProduct(form);
    if (r.success) {
      if (form.stock && +form.stock > 0) {
        await window.api.adminUpdateStock(r.data.id, +form.stock);
      }
      push("Produit créé !");
      setShowAdd(false);
      setForm({ name: "", list_price: "", categ_id: "", stock: "" });
      refresh();
    } else push(r.error, "error");
  };

  const handleUpdateStock = async (id, currentQty) => {
    const qty = prompt("Nouvelle quantité en stock :", currentQty);
    if (qty === null || isNaN(qty)) return;
    const r = await window.api.adminUpdateStock(id, +qty);
    if (r.success) { push("Stock mis à jour"); refresh(); }
    else push(r.error, "error");
  };

  const handleEditProduct = async (p) => {
    const name = prompt("Nom du produit :", p.name);
    if (name === null) return; // annulé
    const priceStr = prompt("Prix de vente (FCFA) :", p.list_price);
    if (priceStr === null) return;
    const price = parseFloat(priceStr);
    if (!name.trim()) return push("Le nom est obligatoire", "warn");
    if (!Number.isFinite(price) || price < 0) return push("Prix invalide", "warn");
    const r = await window.api.adminUpdateProduct(p.id, { name: name.trim(), list_price: price });
    if (r.success) { push("Produit mis à jour"); refresh(); }
    else push(r.error, "error");
  };

  const handleArchive = async (id) => {
    if (!window.confirm("Archiver ce produit dans Odoo ?")) return;
    const r = await window.api.adminArchiveProduct(id);
    if (r.success) { push("Produit archivé"); refresh(); }
    else push(r.error, "error");
  };

  const [searchProd, setSearchProd] = useState("");
  const filtered = products.filter(p => !searchProd || p.name.toLowerCase().includes(searchProd.toLowerCase()));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
        <p style={{ fontSize: 12, fontWeight: 700 }}>{filtered.length}/{products.length} Produits Odoo actifs</p>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input placeholder="🔍 Rechercher un produit..." value={searchProd} onChange={e => setSearchProd(e.target.value)} style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 11, minWidth: 180 }} />
          <button onClick={refresh} style={{ background: "#e2e8f0", color: "#0f172a", border: "none", padding: "7px 12px", borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 700 }}>🔄 Rafraîchir</button>
          <button onClick={() => setShowAdd(!showAdd)} style={{ background: showAdd ? "#e2e8f0" : "#1E40AF", color: showAdd ? "#000" : "#fff", border: "none", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
            {showAdd ? "Fermer" : "+ Nouveau produit"}
          </button>
        </div>
      </div>

      {showAdd && (
        <div style={{ background: "#fff", padding: 20, borderRadius: 12, border: "1px solid #e2e8f0", marginBottom: 20 }}>
          <h3 style={{ fontSize: 13, marginBottom: 12 }}>Création (Synchronisé avec Odoo)</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <input placeholder="Nom du produit" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc" }} />
            <input placeholder="Prix (FCFA)" type="number" value={form.list_price} onChange={e => setForm({ ...form, list_price: e.target.value })} style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc" }} />
            <select value={form.categ_id} onChange={e => setForm({ ...form, categ_id: e.target.value })} style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc" }}>
              <option value="">Sélectionner catégorie Odoo</option>
              {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input placeholder="Stock initial (Optionnel)" type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc" }} />
          </div>
          <button onClick={handleCreate} style={{ marginTop: 12, background: "#059669", color: "#fff", padding: "10px 20px", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 700 }}>Créer dans Odoo</button>
        </div>
      )}

      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f1f5f9", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
          <thead style={{ background: "#f8fafc", color: "#64748b", textTransform: "uppercase" }}>
            <tr>
              <th style={{ padding: 12, textAlign: "left" }}>ID</th>
              <th style={{ padding: 12, textAlign: "left" }}>Produit</th>
              <th style={{ padding: 12, textAlign: "left" }}>Prix</th>
              <th style={{ padding: 12, textAlign: "left" }}>Stock</th>
              <th style={{ padding: 12, textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                <td style={{ padding: 12, color: "#94a3b8" }}>#{p.id}</td>
                <td style={{ padding: 12, fontWeight: 600 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {p.image_1920 ? <img src={`data:image/png;base64,${p.image_1920}`} style={{ width: 24, height: 24, borderRadius: 4, objectFit: "cover" }} /> : <div style={{ width: 24, height: 24, background: "#e2e8f0", borderRadius: 4 }} />}
                    {p.name}
                  </div>
                </td>
                <td style={{ padding: 12, color: "#1E40AF", fontWeight: 700 }}>{fmt(p.list_price)}</td>
                <td style={{ padding: 12 }}>
                  <span onClick={() => handleUpdateStock(p.id, p.qty_available)} style={{ cursor: "pointer", padding: "4px 8px", borderRadius: 99, background: p.qty_available > 0 ? "#d1fae5" : "#fee2e2", color: p.qty_available > 0 ? "#047857" : "#dc2626", fontWeight: 700 }}>
                    {p.qty_available} ✏️
                  </span>
                </td>
                <td style={{ padding: 12, textAlign: "right" }}>
                  <button onClick={() => handleEditProduct(p)} style={{ background: "none", border: "none", color: "#1E40AF", cursor: "pointer", marginRight: 8 }}>Modifier ✏️</button>
                  <button onClick={() => handleArchive(p.id)} style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer" }}>Archiver 🗑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── 3. Commandes ───────────────────────────────────────────────
function AdminOrders({ orders, refresh }) {
  const { push } = useToast();
  const [invoiceRefs, setInvoiceRefs] = useState({});
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkState, setBulkState] = useState("sale");
  const [displayedOrders, setDisplayedOrders] = useState(orders || []);
  const [filters, setFilters] = useState({
    state: "all",
    customer: "",
    dateFrom: "",
    dateTo: "",
    minTotal: "",
    maxTotal: "",
  });
  const [loadingFilters, setLoadingFilters] = useState(false);

  useEffect(() => {
    const nextRefs = {};
    (orders || []).forEach(o => {
      nextRefs[o.id] = o.invoiceReference || o.invoice_reference || o.invoiceRef || o.invoice_ref || "";
    });
    setInvoiceRefs(nextRefs);
    setSelectedIds(prev => prev.filter(id => (orders || []).some(o => o.id === id)));
    setDisplayedOrders(orders || []);
  }, [orders]);

  const handleStatusChange = async (id, state) => {
    // Mise à jour optimiste de l'UI
    setDisplayedOrders(prev => prev.map(o => 
      o.id === id ? { ...o, rawState: state, status: statusOpts.find(x => x.v === state)?.l || state } : o
    ));

    const r = await window.api.adminUpdateOrderStatus(id, state);
    if (r.success) { 
      push("Statut mis à jour"); 
      refresh(); 
    } else { 
      push(r.error, "error"); 
      refresh(); // Revert on failure
    }
  };

  const handleInvoiceRefSave = async (id) => {
    const invoiceReference = (invoiceRefs[id] || "").trim();
    const r = await window.api.adminUpdateOrderInvoiceReference(id, invoiceReference);
    if (r.success) {
      push("Référence facture enregistrée");
      refresh();
    } else {
      push(r.error || "Impossible d'enregistrer la référence facture", "error");
    }
  };

  const statusOpts = [
    { v: "draft", l: "Brouillon" },
    { v: "sale", l: "Confirmée" },
    { v: "done", l: "Livrée" },
    { v: "cancel", l: "Annulée" }
  ];

  const applyFilters = async () => {
    setLoadingFilters(true);
    const r = await window.api.adminGetOrders(filters);
    if (r.success) {
      setDisplayedOrders(r.data || []);
      setSelectedIds([]);
      push("Filtres appliqués");
    } else push(r.error || "Impossible de filtrer les commandes", "error");
    setLoadingFilters(false);
  };

  const resetFilters = async () => {
    const init = { state: "all", customer: "", dateFrom: "", dateTo: "", minTotal: "", maxTotal: "" };
    setFilters(init);
    setLoadingFilters(true);
    const r = await window.api.adminGetOrders(init);
    if (r.success) {
      setDisplayedOrders(r.data || []);
      setSelectedIds([]);
      push("Filtres réinitialisés");
    } else push(r.error || "Impossible de réinitialiser les filtres", "error");
    setLoadingFilters(false);
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === displayedOrders.length) setSelectedIds([]);
    else setSelectedIds(displayedOrders.map(o => o.id));
  };

  const handleBulkStatus = async () => {
    if (!selectedIds.length) return push("Sélectionne au moins une commande", "warn");
    
    // Mise à jour optimiste
    setDisplayedOrders(prev => prev.map(o => 
      selectedIds.includes(o.id) ? { ...o, rawState: bulkState, status: statusOpts.find(x => x.v === bulkState)?.l || bulkState } : o
    ));

    const r = await window.api.adminBulkUpdateOrderStatus(selectedIds, bulkState);
    if (r.success) {
      push(`Statut mis à jour pour ${r.data?.updated || selectedIds.length} commande(s)`);
      setSelectedIds([]);
      refresh();
    } else {
      push(r.error || "Échec de la mise à jour en masse", "error");
      refresh(); // Revert
    }
  };

  const exportCSV = () => {
    if (!displayedOrders.length) return push("Aucune commande à exporter", "warn");
    const headers = ["Réf","Date","Client","Téléphone","Adresse","Articles","Total (FCFA)","Paiement","Statut","Note","Réf Facture"];
    const rows = displayedOrders.map(o => [
      o.ref, o.date,
      `"${(o.customer||'').replace(/"/g,'""')}"`,
      `"${(o.telephone||'').replace(/"/g,'""')}"`,
      `"${(o.adresse||'').replace(/"/g,'""')}"`,
      o.lines?.length || o.items || 0,
      o.total, `"${(o.payMethod||'').replace(/"/g,'""')}"`, o.status,
      `"${(o.note||'').replace(/"/g,'""')}"`, `"${(o.invoiceReference||'').replace(/"/g,'""')}"`
    ]);
    const csv = [headers.join(";"), ...rows.map(r => r.join(";"))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `kumpax-commandes-${new Date().toISOString().split("T")[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
    push(`${displayedOrders.length} commande(s) exportées`);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <p style={{ fontSize: 12, fontWeight: 700 }}>{displayedOrders.length} Commande(s)</p>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={refresh} style={{ background: "#e2e8f0", color: "#0f172a", border: "none", borderRadius: 8, padding: "7px 12px", fontSize: 11, cursor: "pointer", fontWeight: 700 }}>🔄 Rafraîchir</button>
          <button onClick={exportCSV} style={{ background: "#059669", color: "#fff", border: "none", borderRadius: 8, padding: "7px 12px", fontSize: 11, cursor: "pointer", fontWeight: 700 }}>📥 Export CSV</button>
        </div>
      </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0,1fr))", gap: 8 }}>
          <select value={filters.state} onChange={e => setFilters({ ...filters, state: e.target.value })} style={{ padding: 8, borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 11 }}>
            <option value="all">Tous statuts</option>
            {statusOpts.map(opt => <option key={opt.v} value={opt.v}>{opt.l}</option>)}
          </select>
          <input placeholder="Client..." value={filters.customer} onChange={e => setFilters({ ...filters, customer: e.target.value })} style={{ padding: 8, borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 11 }} />
          <input type="date" value={filters.dateFrom} onChange={e => setFilters({ ...filters, dateFrom: e.target.value })} style={{ padding: 8, borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 11 }} />
          <input type="date" value={filters.dateTo} onChange={e => setFilters({ ...filters, dateTo: e.target.value })} style={{ padding: 8, borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 11 }} />
          <input type="number" placeholder="Min FCFA" value={filters.minTotal} onChange={e => setFilters({ ...filters, minTotal: e.target.value })} style={{ padding: 8, borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 11 }} />
          <input type="number" placeholder="Max FCFA" value={filters.maxTotal} onChange={e => setFilters({ ...filters, maxTotal: e.target.value })} style={{ padding: 8, borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 11 }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, gap: 8, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={applyFilters} disabled={loadingFilters} style={{ background: "#1e40af", color: "#fff", border: "none", borderRadius: 8, padding: "7px 10px", fontSize: 11, cursor: "pointer", fontWeight: 700 }}>
              {loadingFilters ? "Filtrage..." : "Appliquer filtres"}
            </button>
            <button onClick={resetFilters} disabled={loadingFilters} style={{ background: "#e2e8f0", color: "#0f172a", border: "none", borderRadius: 8, padding: "7px 10px", fontSize: 11, cursor: "pointer", fontWeight: 700 }}>
              Réinitialiser
            </button>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#475569", fontWeight: 700 }}>{selectedIds.length} sélectionnée(s)</span>
            <select value={bulkState} onChange={e => setBulkState(e.target.value)} style={{ padding: 7, borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 11 }}>
              {statusOpts.map(opt => <option key={opt.v} value={opt.v}>{opt.l}</option>)}
            </select>
            <button onClick={handleBulkStatus} style={{ background: "#059669", color: "#fff", border: "none", borderRadius: 8, padding: "7px 10px", fontSize: 11, cursor: "pointer", fontWeight: 700 }}>
              Action en masse
            </button>
          </div>
        </div>
      {/* === TABLE COMMANDES === */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f1f5f9", overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
        <thead style={{ background: "#f8fafc", color: "#64748b", textTransform: "uppercase" }}>
          <tr>
            <th style={{ padding: 12, textAlign: "center" }}>
              <input type="checkbox" checked={displayedOrders.length > 0 && selectedIds.length === displayedOrders.length} onChange={toggleSelectAll} />
            </th>
            <th style={{ padding: 12, textAlign: "left" }}>Détails</th>
            <th style={{ padding: 12, textAlign: "left" }}>Réf (Odoo)</th>
            <th style={{ padding: 12, textAlign: "left" }}>Date</th>
            <th style={{ padding: 12, textAlign: "left" }}>Client</th>
            <th style={{ padding: 12, textAlign: "left" }}>Téléphone</th>
            <th style={{ padding: 12, textAlign: "left" }}>Adresse</th>
            <th style={{ padding: 12, textAlign: "center" }}>Articles</th>
            <th style={{ padding: 12, textAlign: "left" }}>Total</th>
            <th style={{ padding: 12, textAlign: "left" }}>Paiement</th>
            <th style={{ padding: 12, textAlign: "left" }}>Réf facture Odoo</th>
            <th style={{ padding: 12, textAlign: "center" }}>Statut</th>
          </tr>
        </thead>
        <tbody>
          {displayedOrders.map(o => {
            const isExpanded = expandedOrderId === o.id;
            return (
              <React.Fragment key={o.id}>
                <tr style={{ borderTop: "1px solid #f1f5f9" }}>
                  <td style={{ padding: 12, textAlign: "center" }}>
                    <input type="checkbox" checked={selectedIds.includes(o.id)} onChange={() => toggleSelect(o.id)} />
                  </td>
                  <td style={{ padding: 12 }}>
                    <button
                      onClick={() => setExpandedOrderId(isExpanded ? null : o.id)}
                      style={{ border: "1px solid #cbd5e1", background: "#fff", borderRadius: 6, cursor: "pointer", fontSize: 10, padding: "4px 8px", fontWeight: 700 }}
                    >
                      {isExpanded ? "Masquer" : "Voir"}
                    </button>
                  </td>
                  <td style={{ padding: 12, fontWeight: 700 }}>{o.ref}</td>
                  <td style={{ padding: 12, color: "#94a3b8" }}>{o.date}</td>
                  <td style={{ padding: 12, fontWeight: 600 }}>{o.customer}</td>
                  <td style={{ padding: 12, color: "#1E40AF", fontWeight: 600 }}>{o.telephone || <span style={{ color: "#cbd5e1" }}>—</span>}</td>
                  <td style={{ padding: 12, color: "#475569", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={o.adresse}>{o.adresse || <span style={{ color: "#cbd5e1" }}>—</span>}</td>
                  <td style={{ padding: 12, textAlign: "center", color: "#334155", fontWeight: 700 }}>{o.lines?.length || o.items || 0}</td>
                  <td style={{ padding: 12, fontWeight: 700, color: "#1E40AF" }}>{fmt(o.total)}</td>
                  <td style={{ padding: 12, color: "#475569", fontSize: 10 }}>{o.payMethod || <span style={{ color: "#cbd5e1" }}>—</span>}</td>
                  <td style={{ padding: 12 }}>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <input
                        value={invoiceRefs[o.id] || ""}
                        onChange={e => setInvoiceRefs(prev => ({ ...prev, [o.id]: e.target.value }))}
                        placeholder="Ex: INV/2026/0012"
                        style={{ padding: "6px 8px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 10, minWidth: 140 }}
                      />
                      <button
                        onClick={() => handleInvoiceRefSave(o.id)}
                        style={{ background: "#0ea5e9", color: "#fff", border: "none", borderRadius: 6, padding: "6px 8px", fontSize: 10, cursor: "pointer", fontWeight: 700 }}
                      >
                        Enregistrer
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: 12, textAlign: "center" }}>
                    <select 
                      value={o.rawState} 
                      onChange={e => handleStatusChange(o.id, e.target.value)} 
                      style={{ 
                        padding: "4px 8px", 
                        borderRadius: 99, 
                        fontSize: 10, 
                        fontWeight: 700,
                        border: "1px solid transparent",
                        cursor: "pointer",
                        outline: "none",
                        background: o.rawState === "sale" ? "#dbeafe" : o.rawState === "done" ? "#d1fae5" : o.rawState === "cancel" ? "#fee2e2" : "#f1f5f9",
                        color: o.rawState === "sale" ? "#1d4ed8" : o.rawState === "done" ? "#047857" : o.rawState === "cancel" ? "#dc2626" : "#475569"
                      }}
                    >
                      {statusOpts.map(opt => <option key={opt.v} value={opt.v}>{opt.l}</option>)}
                    </select>
                  </td>
                </tr>
                {isExpanded && (
                  <tr style={{ background: "#f8fafc" }}>
                    <td colSpan={12} style={{ padding: 12 }}>
                      <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", padding: 12 }}>
                        <p style={{ fontSize: 11, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>Détails de commande</p>
                        {/* Delivery info parsed from note */}
                        {!!o.note && (() => {
                          const lines = o.note.split("\n").filter(Boolean);
                          return (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12, padding: 10, background: "#f8fafc", borderRadius: 8, fontSize: 11 }}>
                              {lines.map((line, idx) => {
                                const [label, ...rest] = line.split(":");
                                const value = rest.join(":").trim();
                                if (!value) return <p key={idx} style={{ gridColumn: "1/-1", color: "#475569" }}>{line}</p>;
                                return (
                                  <div key={idx}>
                                    <span style={{ color: "#94a3b8", fontWeight: 600 }}>{label.trim()}:</span>{" "}
                                    <span style={{ color: "#0f172a", fontWeight: 700 }}>{value}</span>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                        {!!o.lines?.length ? (
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
                            <thead>
                              <tr style={{ background: "#f8fafc" }}>
                                <th style={{ padding: 8, textAlign: "left" }}>Produit</th>
                                <th style={{ padding: 8, textAlign: "right" }}>Qté</th>
                                <th style={{ padding: 8, textAlign: "right" }}>PU</th>
                                <th style={{ padding: 8, textAlign: "right" }}>Sous-total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {o.lines.map(line => (
                                <tr key={line.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                                  <td style={{ padding: 8, color: "#334155" }}>{line.name}</td>
                                  <td style={{ padding: 8, textAlign: "right" }}>{line.qty}</td>
                                  <td style={{ padding: 8, textAlign: "right" }}>{fmt(line.unitPrice)}</td>
                                  <td style={{ padding: 8, textAlign: "right", fontWeight: 700, color: "#1e40af" }}>{fmt(line.subtotal)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p style={{ fontSize: 11, color: "#94a3b8" }}>Aucun détail de ligne disponible.</p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
    </div>
  );
}

// ─── 4. Clients ───────────────────────────────────────────────
function AdminCustomers({ customers }) {
  const [searchCust, setSearchCust] = useState("");
  const filtered = customers.filter(c => {
    if (!searchCust) return true;
    const q = searchCust.toLowerCase();
    return (c.name||"").toLowerCase().includes(q) || (c.phone||"").includes(q) || (c.email||"").toLowerCase().includes(q);
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <p style={{ fontSize: 12, fontWeight: 700 }}>{filtered.length}/{customers.length} Clients Odoo</p>
        <input placeholder="🔍 Rechercher un client..." value={searchCust} onChange={e => setSearchCust(e.target.value)} style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 11, minWidth: 200 }} />
      </div>
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f1f5f9", overflow: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
        <thead style={{ background: "#f8fafc", color: "#64748b", textTransform: "uppercase" }}>
          <tr>
            <th style={{ padding: 12, textAlign: "left" }}>ID Odoo</th>
            <th style={{ padding: 12, textAlign: "left" }}>Nom</th>
            <th style={{ padding: 12, textAlign: "left" }}>Téléphone</th>
            <th style={{ padding: 12, textAlign: "left" }}>Email</th>
            <th style={{ padding: 12, textAlign: "left" }}>Adresse</th>
            <th style={{ padding: 12, textAlign: "left" }}>Inscription</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(c => (
            <tr key={c.id} style={{ borderTop: "1px solid #f1f5f9" }}>
              <td style={{ padding: 12, color: "#94a3b8" }}>#{c.id}</td>
              <td style={{ padding: 12, fontWeight: 600 }}>{c.name}</td>
              <td style={{ padding: 12, color: "#1E40AF" }}>{c.phone}</td>
              <td style={{ padding: 12, color: "#64748b" }}>{c.email || "—"}</td>
              <td style={{ padding: 12, color: "#64748b" }}>{[c.street, c.city].filter(Boolean).join(", ") || "—"}</td>
              <td style={{ padding: 12, color: "#94a3b8" }}>{c.create_date ? c.create_date.split(" ")[0] : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  );
}

// ─── 5. Promotions ───────────────────────────────────────────────
function AdminPromotions({ promotions, products = [], refresh, reloadProducts }) {
  const { push } = useToast();
  const [productSearch, setProductSearch] = useState("");
  const [form, setForm] = useState({
    title: "",
    message: "",
    discountType: "percent",
    discountValue: "",
    scope: "all",
    category: "",
    productIds: [],
    popupEnabled: true,
    active: true,
    ctaLabel: "Voir l'offre",
    startAt: "",
    endAt: "",
  });

  useEffect(() => {
    if (form.scope !== "products") return;
    const timer = setTimeout(() => {
      if (typeof reloadProducts === "function") reloadProducts(productSearch.trim());
    }, 260);
    return () => clearTimeout(timer);
  }, [productSearch, reloadProducts, form.scope]);

  const createPromotion = async () => {
    if (!form.title.trim()) return push("Titre requis", "warn");
    if (!(+form.discountValue > 0)) return push("Réduction invalide", "warn");
    if (form.startAt && Number.isNaN(new Date(form.startAt).getTime())) return push("Date de début invalide", "warn");
    if (form.endAt && Number.isNaN(new Date(form.endAt).getTime())) return push("Date de fin invalide", "warn");
    if (form.startAt && form.endAt && new Date(form.startAt).getTime() > new Date(form.endAt).getTime()) {
      return push("La date de fin doit être après la date de début", "warn");
    }
    if (form.scope === "products" && !(form.productIds || []).length) {
      return push("Sélectionne au moins un produit Odoo", "warn");
    }
    const payload = {
      ...form,
      discountValue: +form.discountValue,
      productIds: form.productIds || [],
      startAt: form.startAt || null,
      endAt: form.endAt || null,
    };
    const r = await window.api.adminCreatePromotion(payload);
    if (r.success) {
      push("Promotion créée");
      setForm({
        title: "",
        message: "",
        discountType: "percent",
        discountValue: "",
        scope: "all",
        category: "",
        productIds: [],
        popupEnabled: true,
        active: true,
        ctaLabel: "Voir l'offre",
        startAt: "",
        endAt: "",
      });
      refresh();
    } else push(r.error || "Erreur création promotion", "error");
  };

  const addProductToPromo = (id) => {
    const pid = parseInt(id);
    if (!pid) return;
    if ((form.productIds || []).includes(pid)) return;
    setForm({ ...form, productIds: [...(form.productIds || []), pid] });
  };

  const removeProductFromPromo = (id) => {
    setForm({ ...form, productIds: (form.productIds || []).filter(x => x !== id) });
  };

  const togglePromotion = async (promo, field) => {
    const r = await window.api.adminUpdatePromotion(promo.id, { [field]: !promo[field] });
    if (r.success) {
      push("Promotion mise à jour");
      refresh();
    } else push(r.error || "Erreur de mise à jour", "error");
  };

  const removePromotion = async (id) => {
    if (!window.confirm("Supprimer cette promotion ?")) return;
    const r = await window.api.adminDeletePromotion(id);
    if (r.success) {
      push("Promotion supprimée");
      refresh();
    } else push(r.error || "Erreur suppression", "error");
  };

  const getPromoVisibility = (promo) => {
    if (!promo?.active) return { ok: false, label: "Inactive" };
    const now = Date.now();
    const start = promo.startAt ? new Date(promo.startAt).getTime() : null;
    const end = promo.endAt ? new Date(promo.endAt).getTime() : null;
    if (start && Number.isFinite(start) && start > now) return { ok: false, label: "Pas commencée" };
    if (end && Number.isFinite(end) && end < now) return { ok: false, label: "Expirée" };
    return { ok: true, label: "Affichée" };
  };

  return (
    <div>
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 16, marginBottom: 16 }}>
        <h3 style={{ fontSize: 13, marginBottom: 10 }}>Créer une promotion</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <input placeholder="Titre (ex: Mega Week-end)" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={{ padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }} />
          <input placeholder="Message popup" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} style={{ padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }} />
          <select value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value })} style={{ padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }}>
            <option value="percent">Pourcentage (%)</option>
            <option value="amount">Montant fixe (FCFA)</option>
          </select>
          <input type="number" placeholder="Valeur réduction" value={form.discountValue} onChange={e => setForm({ ...form, discountValue: e.target.value })} style={{ padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }} />
          <select value={form.scope} onChange={e => setForm({ ...form, scope: e.target.value })} style={{ padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }}>
            <option value="all">Tous les produits</option>
            <option value="category">Catégorie</option>
            <option value="products">Produits spécifiques</option>
          </select>
          <input placeholder="Catégorie (si scope=category)" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }} />
          <input
            placeholder="Rechercher un produit Odoo..."
            value={productSearch}
            onChange={e => setProductSearch(e.target.value)}
            disabled={form.scope !== "products"}
            style={{ padding: 10, border: "1px solid #cbd5e1", borderRadius: 8, background: form.scope !== "products" ? "#f8fafc" : "#fff" }}
          />
          <select
            value=""
            onChange={e => addProductToPromo(e.target.value)}
            disabled={form.scope !== "products"}
            style={{ padding: 10, border: "1px solid #cbd5e1", borderRadius: 8, background: form.scope !== "products" ? "#f8fafc" : "#fff" }}
          >
            <option value="">Ajouter un produit Odoo...</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name} (#{p.id})</option>)}
          </select>
          <input placeholder="Libellé bouton popup" value={form.ctaLabel} onChange={e => setForm({ ...form, ctaLabel: e.target.value })} style={{ padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }} />
          <input type="datetime-local" value={form.startAt} onChange={e => setForm({ ...form, startAt: e.target.value })} style={{ padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }} />
          <input type="datetime-local" value={form.endAt} onChange={e => setForm({ ...form, endAt: e.target.value })} style={{ padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }} />
        </div>
        {form.scope === "products" && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
            {(form.productIds || []).map(pid => {
              const product = products.find(p => p.id === pid);
              return (
                <span key={pid} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 9px", borderRadius: 99, background: "#eff6ff", color: "#1e40af", fontSize: 11, fontWeight: 700 }}>
                  {product ? product.name : `Produit #${pid}`}
                  <button onClick={() => removeProductFromPromo(pid)} style={{ border: "none", background: "none", color: "#1e40af", cursor: "pointer", minHeight: "auto", padding: 0 }}>✕</button>
                </span>
              );
            })}
            {!form.productIds?.length && <span style={{ fontSize: 11, color: "#94a3b8" }}>Aucun produit sélectionné.</span>}
          </div>
        )}
        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}><input type="checkbox" checked={form.popupEnabled} onChange={e => setForm({ ...form, popupEnabled: e.target.checked })} /> Popup activée</label>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}><input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} /> Promotion active</label>
        </div>
        <button onClick={createPromotion} style={{ marginTop: 12, background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, padding: "10px 14px", fontWeight: 700, cursor: "pointer" }}>
          Créer la promotion
        </button>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f1f5f9", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
          <thead style={{ background: "#f8fafc", color: "#64748b", textTransform: "uppercase" }}>
            <tr>
              <th style={{ padding: 12, textAlign: "left" }}>Titre</th>
              <th style={{ padding: 12, textAlign: "left" }}>Réduction</th>
              <th style={{ padding: 12, textAlign: "left" }}>Portée</th>
              <th style={{ padding: 12, textAlign: "center" }}>Popup</th>
              <th style={{ padding: 12, textAlign: "center" }}>Active</th>
              <th style={{ padding: 12, textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {promotions.map(promo => (
              <tr key={promo.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                <td style={{ padding: 12 }}>
                  <p style={{ fontWeight: 700 }}>{promo.title}</p>
                  <p style={{ color: "#64748b", marginTop: 3 }}>{promo.message || "—"}</p>
                  {(() => {
                    const v = getPromoVisibility(promo);
                    return (
                      <span style={{
                        display: "inline-block",
                        marginTop: 6,
                        padding: "3px 8px",
                        borderRadius: 99,
                        fontSize: 10,
                        fontWeight: 700,
                        background: v.ok ? "#d1fae5" : "#fee2e2",
                        color: v.ok ? "#047857" : "#b91c1c",
                      }}>
                        {v.label}
                      </span>
                    );
                  })()}
                </td>
                <td style={{ padding: 12, fontWeight: 700, color: "#1E40AF" }}>
                  {promo.discountType === "percent" ? `-${promo.discountValue}%` : `-${fmt(promo.discountValue)}`}
                </td>
                <td style={{ padding: 12 }}>
                  {promo.scope === "all"
                    ? "Tous"
                    : promo.scope === "category"
                      ? `Catégorie: ${promo.category || "—"}`
                      : `Produits: ${(promo.productIds || []).map(pid => products.find(p => p.id === pid)?.name || `#${pid}`).join(", ") || "—"}`}
                </td>
                <td style={{ padding: 12, textAlign: "center" }}>
                  <button onClick={() => togglePromotion(promo, "popupEnabled")} style={{ border: "none", borderRadius: 99, padding: "4px 10px", background: promo.popupEnabled ? "#d1fae5" : "#f1f5f9", cursor: "pointer" }}>
                    {promo.popupEnabled ? "ON" : "OFF"}
                  </button>
                </td>
                <td style={{ padding: 12, textAlign: "center" }}>
                  <button onClick={() => togglePromotion(promo, "active")} style={{ border: "none", borderRadius: 99, padding: "4px 10px", background: promo.active ? "#dbeafe" : "#f1f5f9", cursor: "pointer" }}>
                    {promo.active ? "ON" : "OFF"}
                  </button>
                </td>
                <td style={{ padding: 12, textAlign: "right" }}>
                  <button onClick={() => removePromotion(promo.id)} style={{ border: "none", background: "none", color: "#dc2626", cursor: "pointer", fontWeight: 700 }}>
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
            {!promotions.length && (
              <tr>
                <td colSpan={6} style={{ padding: 16, textAlign: "center", color: "#94a3b8" }}>
                  Aucune promotion pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
