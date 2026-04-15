/* ═══════════════════════════════════════════════
   KUMPAX STORE — Couche API Odoo
   ═══════════════════════════════════════════════
   Configurez l'URL de votre serveur bridge ici.
   En dev local  : http://localhost:3001
   En production : https://api.kumpax.sn
   ═══════════════════════════════════════════════ */

const { API_URL, USE_ODOO } = window;

const api = {
  async _request(url, options = {}) {
    try {
      const r = await fetch(url, options);
      const raw = await r.text();
      let data = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {
        data = null;
      }

      if (!r.ok) {
        return {
          success: false,
          error: data?.error || data?.message || `Erreur HTTP ${r.status}`,
          status: r.status,
        };
      }
      if (data && typeof data === "object") return data;
      return { success: true, data: data ?? {} };
    } catch (e) {
      return { success: false, error: e.message || "Erreur réseau" };
    }
  },

  // Récupère les produits (avec filtres optionnels)
  async getProducts(params = {}) {
    if (!USE_ODOO) return { success: true, data: PRODS };
    const qs = new URLSearchParams(params).toString();
    return this._request(`${API_URL}/api/products${qs ? "?" + qs : ""}`);
  },

  // Récupère les catégories depuis Odoo
  async getCategories() {
    if (!USE_ODOO) return { success: true, data: CATS };
    return this._request(`${API_URL}/api/products/categories`);
  },

  // Récupère un produit par ID
  async getProduct(id) {
    if (!USE_ODOO) return { success: true, data: PRODS.find(p => p.id === id) || null };
    return this._request(`${API_URL}/api/products/${id}`);
  },

  // Crée une commande dans Odoo
  async createOrder(payload) {
    if (!USE_ODOO) {
      // Simule une réponse Odoo en mode démo
      await new Promise(r => setTimeout(r, 900));
      return { success: true, data: { orderName: `S${Math.floor(Math.random() * 90000 + 10000)}`, status: "sale" } };
    }
    return this._request(`${API_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },

  // Récupère les commandes (admin)
  async getOrders(params = {}) {
    if (!USE_ODOO) return { success: true, data: INIT_ORDERS };
    const qs = new URLSearchParams(params).toString();
    return this._request(`${API_URL}/api/orders${qs ? "?" + qs : ""}`);
  },

  // Met à jour le statut d'une commande (admin)
  async updateOrderStatus(id, state) {
    if (!USE_ODOO) return { success: true };
    return this._request(`${API_URL}/api/orders/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state }),
    });
  },

  // Vérifie la connexion Odoo
  async healthCheck() {
    try {
      const r = await fetch(`${API_URL}/api/health`, { signal: AbortSignal.timeout(3000) });
      return r.json();
    } catch { return { status: "error", odoo: "unreachable" }; }
  },

  // Récupère les commandes d'un client par son téléphone
  async getCustomerOrders(phone) {
    if (!USE_ODOO) return { success: true, data: [] };
    return this._request(`${API_URL}/api/orders/customer/${phone}`);
  },

  async getActivePromotions() {
    return this._request(`${API_URL}/api/promotions/active`);
  },

  // ══════════════════════════════════════════════════════════
  // CALLS ADMIN (Sécurisés par JWT)
  // ══════════════════════════════════════════════════════════

  // Helper pour les entêtes admin
  _getAdminHeaders() {
    const token = sessionStorage.getItem("admin_token");
    return {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : ""
    };
  },

  async adminLogin(username, password) {
    const data = await this._request(`${API_URL}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    if (data.success && data.token) {
      sessionStorage.setItem("admin_token", data.token);
    }
    return data;
  },

  adminLogout() {
    sessionStorage.removeItem("admin_token");
  },

  async adminGetStats() {
    return this._request(`${API_URL}/api/admin/stats`, { headers: this._getAdminHeaders() });
  },

  async adminGetSalesChart(days = 30) {
    return this._request(`${API_URL}/api/admin/sales-chart?days=${days}`, { headers: this._getAdminHeaders() });
  },

  async adminGetProducts(search = "", limit = 200, offset = 0) {
    const qs = new URLSearchParams({ search, limit, offset }).toString();
    return this._request(`${API_URL}/api/admin/products?${qs}`, { headers: this._getAdminHeaders() });
  },

  async adminGetProductsLite(search = "", limit = 500) {
    const qs = new URLSearchParams({ search, limit }).toString();
    const lite = await this._request(`${API_URL}/api/admin/products/min?${qs}`, { headers: this._getAdminHeaders() });
    if (lite.success) return lite;
    // Fallback robuste si route non redémarrée ou indisponible
    return this.adminGetProducts(search, limit, 0);
  },

  async adminCreateProduct(payload) {
    return this._request(`${API_URL}/api/admin/products`, {
      method: "POST",
      headers: this._getAdminHeaders(),
      body: JSON.stringify(payload)
    });
  },

  async adminUpdateProduct(id, payload) {
    return this._request(`${API_URL}/api/admin/products/${id}`, {
      method: "PATCH",
      headers: this._getAdminHeaders(),
      body: JSON.stringify(payload)
    });
  },

  async adminArchiveProduct(id) {
    return this._request(`${API_URL}/api/admin/products/${id}`, {
      method: "DELETE",
      headers: this._getAdminHeaders()
    });
  },

  async adminUpdateStock(id, quantity) {
    return this._request(`${API_URL}/api/admin/stock/${id}`, {
      method: "PATCH",
      headers: this._getAdminHeaders(),
      body: JSON.stringify({ quantity })
    });
  },

  async adminGetOrders(state = "all", limit = 100, offset = 0) {
    const qs = new URLSearchParams({ state, limit, offset }).toString();
    return this._request(`${API_URL}/api/admin/orders?${qs}`, { headers: this._getAdminHeaders() });
  },

  async adminUpdateOrderStatus(id, state) {
    return this._request(`${API_URL}/api/admin/orders/${id}/status`, {
      method: "PATCH",
      headers: this._getAdminHeaders(),
      body: JSON.stringify({ state })
    });
  },

  async adminUpdateOrderInvoiceReference(id, invoiceReference) {
    return this._request(`${API_URL}/api/admin/orders/${id}/invoice-reference`, {
      method: "PATCH",
      headers: this._getAdminHeaders(),
      body: JSON.stringify({ invoiceReference })
    });
  },

  async adminGetCustomers(search = "", limit = 200) {
    const qs = new URLSearchParams({ search, limit }).toString();
    return this._request(`${API_URL}/api/admin/customers?${qs}`, { headers: this._getAdminHeaders() });
  },

  async adminGetPromotions() {
    return this._request(`${API_URL}/api/admin/promotions`, { headers: this._getAdminHeaders() });
  },

  async adminCreatePromotion(payload) {
    return this._request(`${API_URL}/api/admin/promotions`, {
      method: "POST",
      headers: this._getAdminHeaders(),
      body: JSON.stringify(payload),
    });
  },

  async adminUpdatePromotion(id, payload) {
    return this._request(`${API_URL}/api/admin/promotions/${id}`, {
      method: "PATCH",
      headers: this._getAdminHeaders(),
      body: JSON.stringify(payload),
    });
  },

  async adminDeletePromotion(id) {
    return this._request(`${API_URL}/api/admin/promotions/${id}`, {
      method: "DELETE",
      headers: this._getAdminHeaders(),
    });
  },
};

// ── Hook générique pour appels API avec état loading/error ──
function useApi(fn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const refresh = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fn();
      if (res.success) setData(res.data); else setError(res.error);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, deps);
  useEffect(() => { refresh(); }, [refresh]);
  return { data, loading, error, refresh };
}

// ── Composant skeleton loader ──
const Skeleton = ({ w = "100%", h = 16, r = 8, mb = 0 }) => (
  <div style={{
    width: w, height: h, borderRadius: r,
    background: "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)",
    backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", marginBottom: mb
  }} />
);

// ── Exposer globalement pour Babel Standalone ──
window.api = api;
window.useApi = useApi;
window.Skeleton = Skeleton;
