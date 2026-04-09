// Standard React hooks from global scope
const { useState, useEffect, useCallback, useMemo } = React;
// Use global fmt if defined, otherwise define fallback
const fmt = window.fmt || (p => (p||0).toLocaleString('fr-FR') + ' FCFA');
// Use global useToast from context
const useToast = window.useToast || (() => ({ push: console.log }));

/* ═══════════════════════════════════════════════
   KUMPAX STORE — Admin Panel (JWT + Odoo)
   ═══════════════════════════════════════════════ */

function Admin({ onExit }) {
  const [auth, setAuth] = useState(!!sessionStorage.getItem("admin_token"));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { push } = useToast();

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
        push(res.error || "Identifiants incorrects", "error");
      }
    } catch (err) {
      push("Impossible de se connecter au serveur", "error");
    } finally {
      setLoading(false);
    }
  };

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
  
  const [odooStatus, setOdooStatus] = useState("checking");

  const loadDashboard = async () => {
    try {
      const [sRes, cRes] = await Promise.all([window.api.adminGetStats(), window.api.adminGetSalesChart(14)]);
      if (sRes.success) setStats(sRes.data);
      if (cRes.success) setChart(cRes.data);
      setOdooStatus("ok");
    } catch { setOdooStatus("error"); }
  };

  const loadProducts = async () => {
    const r = await window.api.adminGetProducts();
    if (r.success) setProducts(r.data);
  };

  const loadOrders = async () => {
    const r = await window.api.adminGetOrders();
    if (r.success) setOrders(r.data);
  };

  const loadCustomers = async () => {
    const r = await window.api.adminGetCustomers();
    if (r.success) setCustomers(r.data);
  };

  useEffect(() => {
    if (tab === "dash") loadDashboard();
    else if (tab === "products") loadProducts();
    else if (tab === "orders") loadOrders();
    else if (tab === "customers") loadCustomers();
  }, [tab]);

  const TABS = { dash: "Tableau de bord", products: "Produits & Stocks", orders: "Commandes", customers: "Clients" };
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
        </nav>
        <div style={{ padding: 12, borderTop: "1px solid #f1f5f9" }}>
          <button onClick={onExit} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "9px 12px", borderRadius: 10, border: "none", background: "#fef2f2", color: "#ef4444", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            🚪 Déconnexion
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
          {tab === "dash" && stats && <AdminDashboard stats={stats} chart={chart} />}
          {tab === "products" && <AdminProducts products={products} refresh={loadProducts} />}
          {tab === "orders" && <AdminOrders orders={orders} refresh={loadOrders} />}
          {tab === "customers" && <AdminCustomers customers={customers} />}
        </div>
      </main>
    </div>
  );
}

// ─── 1. Tableau de Bord ──────────────────────────────────────────
function AdminDashboard({ stats, chart }) {
  const Kpis = [
    { l: "Chiffre d'affaires", v: fmt(stats.revenue), ch: stats.revGrowth ? `+${stats.revGrowth}% MoM` : null, bg: "#eff6ff", c: "#1d4ed8", ic: "📊" },
    { l: "Commandes confirmées", v: stats.ordersConfirmed, ch: `${stats.ordersThisMonth} ce mois`, bg: "#f0fdf4", c: "#059669", ic: "🛍" },
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
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, group: "true", position: "relative" }}>
            {/* Tooltip on hover */}
            <div style={{ opacity: 0, position: "absolute", top: -30, background: "#1e293b", color: "#fff", fontSize: 10, padding: "4px 8px", borderRadius: 6, whiteSpace: "nowrap", pointerEvents: "none", transition: "opacity .2s" }}
                 onMouseEnter={e => e.currentTarget.style.opacity = 1}
                 onMouseLeave={e => e.currentTarget.style.opacity = 0}
            >
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

  const handleArchive = async (id) => {
    if (!window.confirm("Archiver ce produit dans Odoo ?")) return;
    const r = await window.api.adminArchiveProduct(id);
    if (r.success) { push("Produit archivé"); refresh(); }
    else push(r.error, "error");
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 700 }}>{products.length} Produits Odoo actifs</p>
        <button onClick={() => setShowAdd(!showAdd)} style={{ background: showAdd ? "#e2e8f0" : "#1E40AF", color: showAdd ? "#000" : "#fff", border: "none", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
          {showAdd ? "Fermer" : "+ Nouveau Article"}
        </button>
      </div>

      {showAdd && (
        <div style={{ background: "#fff", padding: 20, borderRadius: 12, border: "1px solid #e2e8f0", marginBottom: 20 }}>
          <h3 style={{ fontSize: 13, marginBottom: 12 }}>Création (Synchronisé avec Odoo)</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <input placeholder="Nom du produit" value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc" }} />
            <input placeholder="Prix (FCFA)" type="number" value={form.list_price} onChange={e => setForm({...form, list_price: e.target.value})} style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc" }} />
            <select value={form.categ_id} onChange={e => setForm({...form, categ_id: e.target.value})} style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc" }}>
              <option value="">Sélectionner catégorie Odoo</option>
              {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input placeholder="Stock initial (Optionnel)" type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc" }} />
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
            {products.map(p => (
              <tr key={p.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                <td style={{ padding: 12, color: "#94a3b8" }}>#{p.id}</td>
                <td style={{ padding: 12, fontWeight: 600 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {p.image_1920 ? <img src={`data:image/png;base64,${p.image_1920}`} style={{ width: 24, height: 24, borderRadius: 4, objectFit: "cover" }} /> : <div style={{width: 24, height: 24, background: "#e2e8f0", borderRadius: 4}}/>}
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

  const handleStatusChange = async (id, state) => {
    const r = await window.api.adminUpdateOrderStatus(id, state);
    if (r.success) { push("Statut mis à jour"); refresh(); }
    else push(r.error, "error");
  };

  const statusOpts = [
    { v: "draft", l: "Brouillon" },
    { v: "sale", l: "Confirmée" },
    { v: "done", l: "Livrée" },
    { v: "cancel", l: "Annulée" }
  ];

  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f1f5f9", overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
        <thead style={{ background: "#f8fafc", color: "#64748b", textTransform: "uppercase" }}>
          <tr>
            <th style={{ padding: 12, textAlign: "left" }}>Réf (Odoo)</th>
            <th style={{ padding: 12, textAlign: "left" }}>Date</th>
            <th style={{ padding: 12, textAlign: "left" }}>Client</th>
            <th style={{ padding: 12, textAlign: "left" }}>Total</th>
            <th style={{ padding: 12, textAlign: "center" }}>Statut Actuel</th>
            <th style={{ padding: 12, textAlign: "right" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id} style={{ borderTop: "1px solid #f1f5f9" }}>
              <td style={{ padding: 12, fontWeight: 700 }}>{o.ref}</td>
              <td style={{ padding: 12, color: "#94a3b8" }}>{o.date}</td>
              <td style={{ padding: 12, fontWeight: 600 }}>{o.customer}</td>
              <td style={{ padding: 12, fontWeight: 700, color: "#1E40AF" }}>{fmt(o.total)}</td>
              <td style={{ padding: 12, textAlign: "center" }}>
                <span style={{ padding: "4px 8px", borderRadius: 99, fontSize: 9, fontWeight: 700, 
                  background: o.rawState === "sale" ? "#dbeafe" : o.rawState === "done" ? "#d1fae5" : o.rawState === "cancel" ? "#fee2e2" : "#f1f5f9",
                  color: o.rawState === "sale" ? "#1d4ed8" : o.rawState === "done" ? "#047857" : o.rawState === "cancel" ? "#dc2626" : "#475569" }}>
                  {o.status}
                </span>
              </td>
              <td style={{ padding: 12, textAlign: "right" }}>
                <select value={o.rawState} onChange={e => handleStatusChange(o.id, e.target.value)} style={{ padding: 4, borderRadius: 4, border: "1px solid #ccc", fontSize: 10 }}>
                  {statusOpts.map(opt => <option key={opt.v} value={opt.v}>{opt.l}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── 4. Clients ───────────────────────────────────────────────
function AdminCustomers({ customers }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f1f5f9", overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
        <thead style={{ background: "#f8fafc", color: "#64748b", textTransform: "uppercase" }}>
          <tr>
            <th style={{ padding: 12, textAlign: "left" }}>ID Odoo</th>
            <th style={{ padding: 12, textAlign: "left" }}>Nom</th>
            <th style={{ padding: 12, textAlign: "left" }}>Téléphone</th>
            <th style={{ padding: 12, textAlign: "left" }}>Inscription</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(c => (
            <tr key={c.id} style={{ borderTop: "1px solid #f1f5f9" }}>
              <td style={{ padding: 12, color: "#94a3b8" }}>#{c.id}</td>
              <td style={{ padding: 12, fontWeight: 600 }}>{c.name}</td>
              <td style={{ padding: 12, color: "#1E40AF" }}>{c.phone}</td>
              <td style={{ padding: 12, color: "#94a3b8" }}>{c.create_date ? c.create_date.split(" ")[0] : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
