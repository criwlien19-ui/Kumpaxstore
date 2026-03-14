/* ═══════════════════════════════════════════════
   KUMPAX STORE — Admin Panel
   ═══════════════════════════════════════════════ */

function Admin({ onExit }) {
  const [tab, setTab] = useState("dash");
  const [orders, setOrders] = useState(INIT_ORDERS);
  const [prods, setProds] = useState(PRODS);
  const [showAdd, setShowAdd] = useState(false);
  const [np, setNp] = useState({ name: "", cat: "Smartphones", price: "", orig: "", stock: "", desc: "" });
  const [npErr, setNpErr] = useState({});
  const [odooStatus, setOdooStatus] = useState("checking");
  const [loadingProds, setLoadingProds] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const { push } = useToast();

  // Vérification connexion Odoo au démarrage
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const h = await window.api.healthCheck();
        if (mounted) setOdooStatus(h.status === "ok" ? "ok" : "error");
      } catch {
        if (mounted) setOdooStatus("error");
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Chargement produits depuis Odoo
  const loadProducts = useCallback(async () => {
    setLoadingProds(true);
    try {
      const res = await window.api.getProducts();
      if (res.success && res.data) setProds(res.data);
      else push("Impossible de charger les produits Odoo", "warn");
    } catch (e) { push("Erreur produits: " + e.message, "error"); }
    finally { setLoadingProds(false); }
  }, []);

  // Chargement commandes depuis Odoo
  const loadOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const res = await window.api.getOrders();
      if (res.success && res.data) setOrders(res.data);
      else push("Impossible de charger les commandes Odoo", "warn");
    } catch (e) { push("Erreur commandes: " + e.message, "error"); }
    finally { setLoadingOrders(false); }
  }, []);

  useEffect(() => { loadProducts(); loadOrders(); }, []);

  // Changement statut commande via Odoo
  const changeOrderStatus = async (orderId, odooId, newState) => {
    const statusMap = { "En attente": "draft", "En transit": "sale", "Livré": "done", "Annulé": "cancel" };
    try {
      await window.api.updateOrderStatus(odooId, statusMap[newState] || newState);
      setOrders(or => or.map(x => (x.id === orderId || x.odooId === odooId) ? { ...x, status: newState } : x));
      push(`Commande mise à jour → ${newState}`);
    } catch (e) {
      setOrders(or => or.map(x => x.id === orderId ? { ...x, status: newState } : x));
      push(`Statut: ${newState}`);
    }
  };

  const stats = [
    { l: "Chiffre d'affaires", v: fmt(orders.filter(o => o.status === "Livrée" || o.status === "Confirmée").reduce((s, o) => s + (o.total || 0), 0) || 0), ch: "+12%", bg: "#eff6ff", c: BLUE, ic: "📊" },
    { l: "Commandes", v: orders.length, ch: "+8%", bg: "#f0fdf4", c: "#059669", ic: "🛍" },
    { l: "Produits actifs", v: prods.length, ch: "+3", bg: "#fffbeb", c: "#d97706", ic: "📦" },
    { l: "Clients", v: new Set(orders.map(o => o.customer)).size || 0, ch: "+24", bg: "#f5f3ff", c: "#7c3aed", ic: "👥" },
  ];
  const TABS = { dash: "Tableau de bord", products: "Produits", orders: "Commandes", customers: "Clients", analytics: "Statistiques", settings: "Paramètres" };

  const saveProduct = () => {
    const e = {};
    if (!np.name.trim()) e.name = "Requis";
    if (!np.price || isNaN(+np.price) || +np.price <= 0) e.price = "Prix invalide";
    setNpErr(e);
    if (Object.keys(e).length) { push("Corriger les erreurs", "error"); return; }
    setProds(p => [{ id: Date.now(), name: np.name, cat: np.cat, price: +np.price, orig: np.orig ? +np.orig : null, stock: +np.stock || 0, rating: 0, rev: 0, img: PLACEHOLDER, badge: "Nouveau", desc: np.desc, specs: [] }, ...p]);
    setNp({ name: "", cat: "Smartphones", price: "", orig: "", stock: "", desc: "" });
    setNpErr({}); setShowAdd(false); push("Produit ajouté !");
  };

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
      <aside style={{ width: 210, background: "#fff", borderRight: "1px solid #f1f5f9", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "16px 14px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>🛍</div>
          <div><p style={{ fontWeight: 900, fontSize: 11, color: "#0f172a" }}>Kumpax Store</p><p style={{ fontSize: 10, color: "#94a3b8" }}>Administration</p></div>
        </div>
        <nav style={{ flex: 1, padding: 12 }}>
          <NavBtn id="dash" ic="📊" label="Tableau de bord" />
          <NavBtn id="products" ic="📦" label="Produits" />
          <NavBtn id="orders" ic="🛍" label="Commandes" />
          <NavBtn id="customers" ic="👥" label="Clients" />
          <NavBtn id="analytics" ic="📈" label="Statistiques" />
        </nav>
        <div style={{ padding: 12, borderTop: "1px solid #f1f5f9" }}>
          <NavBtn id="settings" ic="⚙️" label="Paramètres" />
          <button onClick={onExit} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "9px 12px", borderRadius: 10, border: "none", background: "none", color: "#ef4444", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Sora',sans-serif" }}>
            🚪 Retour boutique
          </button>
        </div>
      </aside>

      {/* Content */}
      <main style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        <div style={{ background: "#fff", borderBottom: "1px solid #f1f5f9", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
          <div>
            <h1 style={{ fontWeight: 900, fontSize: 15, color: "#0f172a" }}>{TABS[tab]}</h1>
            <p style={{ fontSize: 10, color: "#94a3b8" }}>Bonjour, Administrateur 👋</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 99, fontSize: 10, fontWeight: 700,
              background: odooStatus === "ok" ? "#d1fae5" : odooStatus === "error" ? "#fee2e2" : "#fef3c7",
              color: odooStatus === "ok" ? "#047857" : odooStatus === "error" ? "#dc2626" : "#b45309"
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
              {odooStatus === "ok" ? "🔗 Odoo connecté" : odooStatus === "error" ? "⚠ Odoo hors ligne" : "⏳ Vérification..."}
            </div>
            <div style={{ position: "relative", cursor: "pointer", fontSize: 18 }}>🔔<span style={{ position: "absolute", top: 0, right: 0, width: 7, height: 7, borderRadius: "50%", background: "#ef4444", border: "1px solid #fff" }} /></div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#eff6ff", borderRadius: 10, padding: "6px 10px" }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: BLUE, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 900 }}>A</div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#334155" }}>Admin</span>
            </div>
          </div>
        </div>

        <div style={{ padding: 24, flex: 1 }}>
          {/* Dashboard */}
          {tab === "dash" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
                {stats.map((s, i) => (
                  <div key={i} style={{ background: "#fff", borderRadius: 16, padding: 16, border: "1px solid #f1f5f9", boxShadow: "0 1px 4px rgba(0,0,0,.05)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{s.ic}</div>
                      <span style={{ fontSize: 10, fontWeight: 800, color: "#059669", background: "#ecfdf5", padding: "2px 7px", borderRadius: 99, display: "flex", alignItems: "center", gap: 2 }}>↑{s.ch}</span>
                    </div>
                    <p style={{ fontSize: 17, fontWeight: 900, color: "#0f172a" }}>{s.v}</p>
                    <p style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{s.l}</p>
                  </div>
                ))}
              </div>

              <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", overflow: "hidden", marginBottom: 16 }}>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ fontWeight: 800, fontSize: 13 }}>Commandes récentes</p>
                  <button onClick={() => setTab("orders")} style={{ fontSize: 11, fontWeight: 700, color: BLUE, border: "none", background: "none", cursor: "pointer" }}>Voir toutes</button>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                  <thead><tr style={{ background: "#f8fafc" }}>{["Réf.", "Client", "Ville", "Total", "Statut"].map(h => <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", fontSize: 10, letterSpacing: .05 }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.id} style={{ borderTop: "1px solid #f8fafc" }}>
                        <td style={{ padding: "10px 16px", fontWeight: 800, color: "#334155" }}>{o.id}</td>
                        <td style={{ padding: "10px 16px", fontWeight: 600 }}>{o.customer}</td>
                        <td style={{ padding: "10px 16px", color: "#94a3b8" }}>{o.city}</td>
                        <td style={{ padding: "10px 16px", fontWeight: 800, color: BLUE }}>{fmt(o.total)}</td>
                        <td style={{ padding: "10px 16px" }}><StatusBadge s={o.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", padding: 20 }}>
                <p style={{ fontWeight: 800, fontSize: 13, marginBottom: 14 }}>Top Produits</p>
                {prods.slice(0, 5).map((p, i) => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 10, fontWeight: 900, color: "#94a3b8", width: 16 }}>#{i + 1}</span>
                    <SafeImg src={p.img} alt={p.name} style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover" }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</p>
                      <p style={{ fontSize: 10, color: "#94a3b8" }}>{p.rev} ventes · {p.cat}</p>
                    </div>
                    <p style={{ fontSize: 11, fontWeight: 800, color: BLUE, flexShrink: 0 }}>{fmt(p.price)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Products */}
          {tab === "products" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <p style={{ fontSize: 11, color: "#94a3b8" }}>{prods.length} produit(s)</p>
                <button onClick={() => setShowAdd(!showAdd)} style={{ padding: "8px 16px", borderRadius: 10, border: "none", background: showAdd ? "#f1f5f9" : grad, color: showAdd ? "#475569" : "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Sora',sans-serif" }}>
                  {showAdd ? "✕ Annuler" : "+ Nouveau produit"}
                </button>
              </div>
              {showAdd && (
                <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", padding: 20, marginBottom: 16 }}>
                  <p style={{ fontWeight: 800, fontSize: 13, marginBottom: 14 }}>Nouveau produit</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                    {[["name", "Nom *", "Ex: Samsung A54"], ["price", "Prix FCFA *", "250000"], ["orig", "Prix barré", "280000"], ["stock", "Stock", "50"]].map(([k, l, ph]) => (
                      <div key={k}>
                        <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#94a3b8", marginBottom: 4, textTransform: "uppercase" }}>{l}</label>
                        <input value={np[k]} onChange={e => { setNp(p => ({ ...p, [k]: e.target.value })); setNpErr(er => ({ ...er, [k]: "" })); }} placeholder={ph}
                          style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `1px solid ${npErr[k] ? "#fca5a5" : "#e2e8f0"}`, fontSize: 12, fontFamily: "'Sora',sans-serif" }} />
                        {npErr[k] && <p style={{ fontSize: 10, color: "#ef4444", marginTop: 2 }}>{npErr[k]}</p>}
                      </div>
                    ))}
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#94a3b8", marginBottom: 4, textTransform: "uppercase" }}>Catégorie</label>
                    <select value={np.cat} onChange={e => setNp(p => ({ ...p, cat: e.target.value }))} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12, fontFamily: "'Sora',sans-serif", background: "#fff" }}>
                      {CATS.map(c => <option key={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#94a3b8", marginBottom: 4, textTransform: "uppercase" }}>Description</label>
                    <textarea value={np.desc} onChange={e => setNp(p => ({ ...p, desc: e.target.value }))} rows={2} placeholder="Description..." style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12, fontFamily: "'Sora',sans-serif", resize: "none" }} />
                  </div>
                  <div style={{ border: "2px dashed #e2e8f0", borderRadius: 12, padding: "16px", textAlign: "center", color: "#94a3b8", fontSize: 11, marginBottom: 14, cursor: "pointer" }}>
                    📤 Cliquer pour ajouter une image
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => { setShowAdd(false); setNpErr({}); }} style={{ padding: "8px 16px", borderRadius: 10, border: "1px solid #e2e8f0", background: "none", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'Sora',sans-serif" }}>Annuler</button>
                    <button onClick={saveProduct} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: grad, color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Sora',sans-serif" }}>Enregistrer le produit</button>
                  </div>
                </div>
              )}
              <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                    <thead><tr style={{ background: "#f8fafc" }}>{["Produit", "Catégorie", "Prix", "Stock", "Note", "Actions"].map(h => <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", fontSize: 10 }}>{h}</th>)}</tr></thead>
                    <tbody>
                      {prods.map(p => (
                        <tr key={p.id} style={{ borderTop: "1px solid #f8fafc" }}>
                          <td style={{ padding: "10px 14px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <SafeImg src={p.img} alt="" style={{ width: 30, height: 30, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
                              <span style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>{p.name}</span>
                            </div>
                          </td>
                          <td style={{ padding: "10px 14px", color: "#94a3b8" }}>{p.cat}</td>
                          <td style={{ padding: "10px 14px", fontWeight: 800, color: BLUE }}>{fmt(p.price)}</td>
                          <td style={{ padding: "10px 14px" }}>
                            <span style={{
                              padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 700,
                              background: (p.stock || 0) > 10 ? "#d1fae5" : (p.stock || 0) > 0 ? "#fef3c7" : "#fee2e2",
                              color: (p.stock || 0) > 10 ? "#047857" : (p.stock || 0) > 0 ? "#b45309" : "#dc2626"
                            }}>
                              {p.stock || 0} unités
                            </span>
                          </td>
                          <td style={{ padding: "10px 14px", fontWeight: 700 }}>{p.rating || "—"}</td>
                          <td style={{ padding: "10px 14px" }}>
                            <div style={{ display: "flex", gap: 4 }}>
                              <button style={{ width: 26, height: 26, borderRadius: 8, border: "none", background: "#eff6ff", cursor: "pointer", fontSize: 12 }}>👁</button>
                              <button style={{ width: 26, height: 26, borderRadius: 8, border: "none", background: "#f8fafc", cursor: "pointer", fontSize: 12 }}>✏️</button>
                              <button onClick={() => {
                                if (window.confirm(`Supprimer « ${p.name} » ? Cette action est irréversible.`)) { setProds(pr => pr.filter(x => x.id !== p.id)); push("Produit supprimé", "warn"); }
                              }} style={{ width: 26, height: 26, borderRadius: 8, border: "none", background: "#fef2f2", cursor: "pointer", fontSize: 12 }}>🗑</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Orders */}
          {tab === "orders" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 16 }}>
                {[["Brouillon", "#f1f5f9", "#475569"], ["Confirmée", "#dbeafe", "#1d4ed8"], ["Livrée", "#d1fae5", "#047857"], ["Annulée", "#fee2e2", "#dc2626"]].map(([s, bg, c]) => (
                  <div key={s} style={{ background: bg, borderRadius: 12, padding: "10px 14px", textAlign: "center" }}>
                    <p style={{ fontSize: 20, fontWeight: 900, color: c }}>{orders.filter(o => o.status === s).length}</p>
                    <p style={{ fontSize: 10, fontWeight: 600, color: c }}>{s}</p>
                  </div>
                ))}
              </div>
              <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                    <thead><tr style={{ background: "#f8fafc" }}>{["Réf.", "Client", "Date", "Ville", "Articles", "Total", "Statut", "Changer"].map(h => <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", fontSize: 10 }}>{h}</th>)}</tr></thead>
                    <tbody>
                      {orders.map(o => (
                        <tr key={o.id} style={{ borderTop: "1px solid #f8fafc" }}>
                          <td style={{ padding: "10px 14px", fontWeight: 800, color: "#334155" }}>{o.id}</td>
                          <td style={{ padding: "10px 14px", fontWeight: 600 }}>{o.customer}</td>
                          <td style={{ padding: "10px 14px", color: "#94a3b8" }}>{o.date}</td>
                          <td style={{ padding: "10px 14px", color: "#94a3b8" }}>{o.city}</td>
                          <td style={{ padding: "10px 14px", color: "#94a3b8" }}>{o.items}</td>
                          <td style={{ padding: "10px 14px", fontWeight: 800, color: BLUE }}>{fmt(o.total)}</td>
                          <td style={{ padding: "10px 14px" }}><StatusBadge s={o.status} /></td>
                          <td style={{ padding: "10px 14px" }}>
                            <select value={o.status} onChange={e => { changeOrderStatus(o.id, o.odooId || o.id, e.target.value); }}
                              style={{ padding: "5px 8px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 11, fontFamily: "'Sora',sans-serif", background: "#fff", cursor: "pointer" }}>
                              {["Brouillon", "Confirmée", "Livrée", "Annulée"].map(s => <option key={s}>{s}</option>)}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Customers */}
          {tab === "customers" && (
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9" }}>
                <p style={{ fontWeight: 800, fontSize: 13 }}>Base Clients ({new Set(orders.map(o => o.customer)).size})</p>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                  <thead><tr style={{ background: "#f8fafc" }}>{["Client", "Ville", "Dernière commande", "Total Dépensé", "Commandes"].map(h => <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", fontSize: 10 }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {Object.values(orders.reduce((acc, o) => {
                      if (!acc[o.customer]) acc[o.customer] = { name: o.customer, city: o.city, total: 0, count: 0, last: o.date };
                      acc[o.customer].total += o.total;
                      acc[o.customer].count += 1;
                      if (new Date(o.date) > new Date(acc[o.customer].last)) acc[o.customer].last = o.date;
                      return acc;
                    }, {})).map(c => (
                      <tr key={c.name} style={{ borderTop: "1px solid #f8fafc" }}>
                        <td style={{ padding: "10px 14px", fontWeight: 800, color: "#334155" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#eff6ff", color: BLUE, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>{c.name.charAt(0)}</div>
                            {c.name}
                          </div>
                        </td>
                        <td style={{ padding: "10px 14px", color: "#94a3b8" }}>{c.city || "—"}</td>
                        <td style={{ padding: "10px 14px", color: "#94a3b8" }}>{c.last || "—"}</td>
                        <td style={{ padding: "10px 14px", fontWeight: 800, color: BLUE }}>{fmt(c.total)}</td>
                        <td style={{ padding: "10px 14px" }}><span style={{ padding: "3px 8px", background: "#f1f5f9", borderRadius: 99, fontWeight: 700 }}>{c.count}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Analytics (En développement visuel avancé) */}
          {["analytics", "settings"].includes(tab) && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 200, color: "#94a3b8", gap: 8, textAlign: "center" }}>
              <span style={{ fontSize: 40, opacity: .4 }}>📊</span>
              <p style={{ fontWeight: 700, color: "#64748b", fontSize: 13 }}>Module en développement</p>
              <p style={{ fontSize: 11 }}>Les graphiques avancés arriveront dans la version 2.0 !</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
