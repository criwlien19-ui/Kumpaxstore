/**
 * ============================================================
 * KUMPAX STORE — Routes Admin (/api/admin/*)
 * ============================================================
 * Toutes les routes admin sont protégées par JWT sauf /login.
 *
 * Routes :
 *   POST   /api/admin/login              → Authentification
 *   GET    /api/admin/stats              → KPIs globaux
 *   GET    /api/admin/sales-chart        → Graphique ventes 30j
 *   GET    /api/admin/products           → Liste produits complète
 *   POST   /api/admin/products           → Créer produit Odoo
 *   PATCH  /api/admin/products/:id       → Modifier produit Odoo
 *   DELETE /api/admin/products/:id       → Archiver produit Odoo
 *   PATCH  /api/admin/stock/:id          → Ajuster stock (stock.quant)
 *   GET    /api/admin/orders             → Liste commandes
 *   PATCH  /api/admin/orders/:id/status  → Changer statut commande
 *   GET    /api/admin/customers          → Liste clients Odoo
 *   GET    /api/admin/categories         → Liste catégories Odoo
 * ============================================================
 */

const express = require("express");
const router  = express.Router();
const { checkCredentials, generateToken, verifyAdminJWT } = require("./admin.auth");

module.exports = (odoo, productService, orderService) => {

  // ══════════════════════════════════════════════════════════
  // POST /api/admin/login — Authentification
  // ══════════════════════════════════════════════════════════
  router.post("/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ success: false, error: "username et password sont requis." });
      }
      const ok = await checkCredentials(username, password);
      if (!ok) {
        return res.status(401).json({ success: false, error: "Identifiants incorrects." });
      }
      const token = generateToken(username);
      res.json({ success: true, token, username });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ── Toutes les routes suivantes sont protégées par JWT ────
  router.use(verifyAdminJWT);

  // ══════════════════════════════════════════════════════════
  // GET /api/admin/stats — KPIs globaux
  // ══════════════════════════════════════════════════════════
  router.get("/stats", async (req, res) => {
    try {
      const [orders, products, partners] = await Promise.all([
        odoo.searchRead({
          model: "sale.order",
          domain: [],
          fields: ["id", "state", "amount_total", "date_order"],
          limit: 1000,
        }),
        odoo.callKw({ model: "product.template", method: "search_count", args: [[ ["type", "!=", "service"], ["active", "=", true] ]] }),
        odoo.callKw({ model: "res.partner", method: "search_count", args: [[ ["customer_rank", ">", 0] ]] }),
      ]);

      const confirmedOrders = orders.filter(o => ["sale", "done"].includes(o.state));
      const revenue = confirmedOrders.reduce((s, o) => s + (o.amount_total || 0), 0);

      // Calcul MoM (mois en cours vs mois précédent)
      const now = new Date();
      const thisMonth = orders.filter(o => {
        const d = new Date(o.date_order);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
      const lastMonth = orders.filter(o => {
        const d = new Date(o.date_order);
        const lm = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        const ly = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        return d.getMonth() === lm && d.getFullYear() === ly;
      });

      const revThisMonth  = thisMonth.filter(o => ["sale","done"].includes(o.state)).reduce((s,o) => s+o.amount_total, 0);
      const revLastMonth  = lastMonth.filter(o => ["sale","done"].includes(o.state)).reduce((s,o) => s+o.amount_total, 0);
      const revGrowth     = revLastMonth > 0 ? (((revThisMonth - revLastMonth) / revLastMonth) * 100).toFixed(1) : null;

      res.json({
        success: true,
        data: {
          revenue,
          revGrowth,
          ordersTotal:       orders.length,
          ordersThisMonth:   thisMonth.length,
          ordersConfirmed:   confirmedOrders.length,
          productCount:      products,
          customerCount:     partners,
          ordersByStatus: {
            draft:  orders.filter(o => o.state === "draft").length,
            sale:   orders.filter(o => o.state === "sale").length,
            done:   orders.filter(o => o.state === "done").length,
            cancel: orders.filter(o => o.state === "cancel").length,
          },
        },
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ══════════════════════════════════════════════════════════
  // GET /api/admin/sales-chart — Ventes 30 derniers jours
  // ══════════════════════════════════════════════════════════
  router.get("/sales-chart", async (req, res) => {
    try {
      const days = Math.min(parseInt(req.query.days) || 30, 90);
      const since = new Date();
      since.setDate(since.getDate() - days);
      const sinceStr = since.toISOString().split("T")[0] + " 00:00:00";

      const orders = await odoo.searchRead({
        model: "sale.order",
        domain: [
          ["date_order", ">=", sinceStr],
          ["state", "in", ["sale", "done"]],
        ],
        fields: ["date_order", "amount_total"],
        limit: 5000,
      });

      // Agrège par jour
      const byDay = {};
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        byDay[d.toISOString().split("T")[0]] = 0;
      }
      orders.forEach(o => {
        const day = o.date_order.split(" ")[0];
        if (byDay[day] !== undefined) byDay[day] += o.amount_total || 0;
      });

      const chart = Object.entries(byDay).map(([date, amount]) => ({ date, amount }));
      res.json({ success: true, data: chart });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ══════════════════════════════════════════════════════════
  // GET /api/admin/products — Liste produits (admin, tous champs)
  // ══════════════════════════════════════════════════════════
  router.get("/products", async (req, res) => {
    try {
      const { search = "", limit = 200, offset = 0 } = req.query;
      const domain = [["active", "=", true]];
      if (search) domain.push(["name", "ilike", search]);

      const products = await odoo.searchRead({
        model: "product.template",
        domain,
        fields: [
          "id","name","list_price","categ_id","qty_available",
          "description_sale","image_1920","default_code","type",
          "active","uom_id","standard_price",
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: "name asc",
      });

      res.json({ success: true, data: products, count: products.length });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ══════════════════════════════════════════════════════════
  // POST /api/admin/products — Créer un produit dans Odoo
  // ══════════════════════════════════════════════════════════
  router.post("/products", async (req, res) => {
    try {
      const { name, categ_id, list_price, description_sale, default_code, image_1920, type = "consu", standard_price = 0 } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, error: "Le nom du produit est obligatoire." });
      }
      if (list_price === undefined || isNaN(+list_price) || +list_price < 0) {
        return res.status(400).json({ success: false, error: "Le prix de vente (list_price) est invalide." });
      }

      // Récupère l'UoM par défaut (unité)
      const uoms = await odoo.searchRead({
        model: "uom.uom",
        domain: [["name", "=", "Units"]],
        fields: ["id"],
        limit: 1,
      });
      const uomId = uoms.length ? uoms[0].id : 1;

      const values = {
        name:            name.trim(),
        list_price:      +list_price,
        standard_price:  +standard_price,
        type,
        uom_id:          uomId,
        uom_po_id:       uomId,
        active:          true,
      };

      if (categ_id)        values.categ_id        = parseInt(categ_id);
      if (description_sale) values.description_sale = description_sale;
      if (default_code)    values.default_code    = default_code;
      if (image_1920)      values.image_1920      = image_1920;  // base64 string

      const newId = await odoo.create({ model: "product.template", values });
      console.log(`[Admin] Produit créé dans Odoo: id=${newId}, name=${name}`);

      res.json({ success: true, data: { id: newId, name } });
    } catch (err) {
      console.error("[Admin POST /products]", err.message);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ══════════════════════════════════════════════════════════
  // PATCH /api/admin/products/:id — Modifier un produit Odoo
  // ══════════════════════════════════════════════════════════
  router.patch("/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (!id) return res.status(400).json({ success: false, error: "ID invalide." });

      const { name, list_price, categ_id, description_sale, default_code, image_1920, standard_price } = req.body;
      const values = {};
      if (name          !== undefined) values.name            = name.trim();
      if (list_price    !== undefined) values.list_price      = +list_price;
      if (standard_price!== undefined) values.standard_price  = +standard_price;
      if (categ_id      !== undefined) values.categ_id        = parseInt(categ_id);
      if (description_sale !== undefined) values.description_sale = description_sale;
      if (default_code  !== undefined) values.default_code    = default_code;
      if (image_1920    !== undefined) values.image_1920      = image_1920;

      if (!Object.keys(values).length) {
        return res.status(400).json({ success: false, error: "Aucun champ à mettre à jour." });
      }

      await odoo.write({ model: "product.template", ids: [id], values });
      console.log(`[Admin] Produit modifié: id=${id}`);
      res.json({ success: true, data: { id } });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ══════════════════════════════════════════════════════════
  // DELETE /api/admin/products/:id — Archiver produit (≠ supprimer)
  // ══════════════════════════════════════════════════════════
  router.delete("/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (!id) return res.status(400).json({ success: false, error: "ID invalide." });

      // Odoo : on archive plutôt que supprimer pour conserver l'historique
      await odoo.write({ model: "product.template", ids: [id], values: { active: false } });
      console.log(`[Admin] Produit archivé: id=${id}`);
      res.json({ success: true, data: { id, archived: true } });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ══════════════════════════════════════════════════════════
  // PATCH /api/admin/stock/:id — Ajuster le stock via stock.quant
  // Respecte les règles Odoo (stock.quant = seule méthode correcte)
  // ══════════════════════════════════════════════════════════
  router.patch("/stock/:id", async (req, res) => {
    try {
      const productTemplateId = parseInt(req.params.id);
      const newQty = parseFloat(req.body.quantity);

      if (!productTemplateId) return res.status(400).json({ success: false, error: "ID produit invalide." });
      if (isNaN(newQty) || newQty < 0) return res.status(400).json({ success: false, error: "Quantité invalide (doit être >= 0)." });

      // 1. Récupère la variante product.product
      const variants = await odoo.searchRead({
        model: "product.product",
        domain: [["product_tmpl_id", "=", productTemplateId]],
        fields: ["id", "name"],
        limit: 1,
      });
      if (!variants.length) throw new Error(`Aucune variante trouvée pour le template ID ${productTemplateId}`);

      const productId = variants[0].id;

      // 2. Récupère l'emplacement stock par défaut (WH/Stock)
      const locations = await odoo.searchRead({
        model: "stock.location",
        domain: [["complete_name", "ilike", "WH/Stock"], ["usage", "=", "internal"]],
        fields: ["id", "complete_name"],
        limit: 1,
      });
      if (!locations.length) throw new Error("Emplacement stock WH/Stock introuvable dans Odoo.");

      const locationId = locations[0].id;

      // 3. Met à jour via stock.quant (méthode correcte Odoo)
      await odoo.callKw({
        model: "stock.quant",
        method: "create",
        args: [],
        kwargs: {
          vals: {
            product_id:  productId,
            location_id: locationId,
            inventory_quantity: newQty,
          }
        }
      });

      // Alternative si create ne suffit pas : utilise _update_available_quantity via action "Apply All"
      // On utilise d'abord la méthode la plus simple disponible sur Odoo 16/17
      const quants = await odoo.searchRead({
        model: "stock.quant",
        domain: [
          ["product_id", "=", productId],
          ["location_id", "=", locationId],
        ],
        fields: ["id", "quantity", "inventory_quantity"],
        limit: 1,
      });

      if (quants.length) {
        // Met à jour le quant existant
        await odoo.write({
          model: "stock.quant",
          ids: [quants[0].id],
          values: { inventory_quantity: newQty },
        });
        // Applique l'inventaire (valide l'ajustement)
        await odoo.execute({
          model: "stock.quant",
          method: "action_apply_inventory",
          ids: [quants[0].id],
        });
      }

      console.log(`[Admin] Stock ajusté: product.template=${productTemplateId}, product.product=${productId}, qty=${newQty}`);
      res.json({ success: true, data: { productId, newQty, locationId } });
    } catch (err) {
      console.error("[Admin PATCH /stock]", err.message);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ══════════════════════════════════════════════════════════
  // GET /api/admin/orders — Liste commandes (admin)
  // ══════════════════════════════════════════════════════════
  router.get("/orders", async (req, res) => {
    try {
      const { limit = 100, offset = 0, state } = req.query;
      const domain = [];
      if (state && state !== "all") domain.push(["state", "=", state]);

      const orders = await odoo.searchRead({
        model: "sale.order",
        domain,
        fields: ["id","name","partner_id","state","amount_total","date_order","order_line","note"],
        limit: Math.min(parseInt(limit), 500),
        offset: parseInt(offset),
        order: "date_order desc",
      });

      const stateLabels = { draft:"Brouillon", sent:"Envoyée", sale:"Confirmée", done:"Livrée", cancel:"Annulée" };
      const mapped = orders.map(o => ({
        id:       o.id,
        ref:      o.name,
        customer: Array.isArray(o.partner_id) ? o.partner_id[1] : "",
        total:    o.amount_total,
        status:   stateLabels[o.state] || o.state,
        rawState: o.state,
        date:     o.date_order ? o.date_order.split(" ")[0] : "",
        items:    o.order_line?.length || 0,
        note:     o.note || "",
      }));

      res.json({ success: true, data: mapped });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ══════════════════════════════════════════════════════════
  // PATCH /api/admin/orders/:id/status — Changer statut commande
  // ══════════════════════════════════════════════════════════
  const ALLOWED_STATES = new Set(["draft", "sale", "done", "cancel"]);
  router.patch("/orders/:id/status", async (req, res) => {
    try {
      const odooId = parseInt(req.params.id);
      const { state } = req.body;

      if (!odooId || isNaN(odooId)) return res.status(400).json({ success: false, error: "ID commande invalide." });
      if (!state || !ALLOWED_STATES.has(state)) {
        return res.status(400).json({ success: false, error: `État invalide. Valeurs : ${[...ALLOWED_STATES].join(", ")}` });
      }

      const methodMap = { cancel:"action_cancel", draft:"action_draft", sale:"action_confirm", done:"action_done" };
      if (methodMap[state]) {
        await odoo.execute({ model:"sale.order", method:methodMap[state], ids:[odooId] });
      }
      console.log(`[Admin] Commande ${odooId} → ${state}`);
      res.json({ success: true, data: { odooId, state } });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ══════════════════════════════════════════════════════════
  // GET /api/admin/customers — Clients Odoo
  // ══════════════════════════════════════════════════════════
  router.get("/customers", async (req, res) => {
    try {
      const { limit = 200, search = "" } = req.query;
      const domain = [["customer_rank", ">", 0]];
      if (search) domain.push(["name", "ilike", search]);

      const customers = await odoo.searchRead({
        model: "res.partner",
        domain,
        fields: ["id","name","phone","email","street","city","country_id","create_date"],
        limit: parseInt(limit),
        order: "create_date desc",
      });

      res.json({ success: true, data: customers });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ══════════════════════════════════════════════════════════
  // GET /api/admin/categories — Catégories Odoo
  // ══════════════════════════════════════════════════════════
  router.get("/categories", async (req, res) => {
    try {
      const cats = await odoo.searchRead({
        model: "product.category",
        domain: [],
        fields: ["id", "name", "complete_name", "parent_id"],
        order: "name asc",
      });
      res.json({ success: true, data: cats });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
};
