/* ═══════════════════════════════════════════════
   KUMPAX STORE — Couche API Odoo
   ═══════════════════════════════════════════════
   Configurez l'URL de votre serveur bridge ici.
   En dev local  : http://localhost:3001
   En production : https://api.kumpax.sn
   ═══════════════════════════════════════════════ */

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_URL = window.KUMPAX_API_URL !== undefined ? window.KUMPAX_API_URL : (isLocal ? "http://localhost:3001" : "");
const USE_ODOO = window.KUMPAX_USE_ODOO === true; // false = mode démo (données mock)

const api = {
  // Récupère les produits (avec filtres optionnels)
  async getProducts(params = {}) {
    if (!USE_ODOO) return { success: true, data: PRODS };
    const qs = new URLSearchParams(params).toString();
    const r = await fetch(`${API_URL}/api/products${qs ? "?" + qs : ""}`);
    return r.json();
  },

  // Récupère les catégories depuis Odoo
  async getCategories() {
    if (!USE_ODOO) return { success: true, data: CATS };
    const r = await fetch(`${API_URL}/api/products/categories`);
    return r.json();
  },

  // Récupère un produit par ID
  async getProduct(id) {
    if (!USE_ODOO) return { success: true, data: PRODS.find(p => p.id === id) || null };
    const r = await fetch(`${API_URL}/api/products/${id}`);
    return r.json();
  },

  // Crée une commande dans Odoo
  async createOrder(payload) {
    if (!USE_ODOO) {
      // Simule une réponse Odoo en mode démo
      await new Promise(r => setTimeout(r, 900));
      return { success: true, data: { orderName: `S${Math.floor(Math.random() * 90000 + 10000)}`, status: "sale" } };
    }
    const r = await fetch(`${API_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return r.json();
  },

  // Récupère les commandes (admin)
  async getOrders(params = {}) {
    if (!USE_ODOO) return { success: true, data: INIT_ORDERS };
    const qs = new URLSearchParams(params).toString();
    const r = await fetch(`${API_URL}/api/orders${qs ? "?" + qs : ""}`);
    return r.json();
  },

  // Met à jour le statut d'une commande (admin)
  async updateOrderStatus(id, state) {
    if (!USE_ODOO) return { success: true };
    const r = await fetch(`${API_URL}/api/orders/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state }),
    });
    return r.json();
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
    const r = await fetch(`${API_URL}/api/orders/customer/${phone}`);
    return r.json();
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
