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
const { normalizePromo, readPromotions, writePromotions } = require("./promotions.store");

function parseInvoiceReferenceFromNote(note) {
  const text = String(note || "");
  const match = text.match(/^\[INVOICE_REF:([^\]]*)\]\s*/);
  return match ? match[1].trim() : "";
}

/**
 * Extrait les infos de livraison depuis la note structurée Odoo.
 * Format attendu (créé par order.service.js) :
 *   Mode livraison: Livraison à domicile\n
 *   Adresse: Rue X, Dakar\n
 *   Téléphone: +221 77 000 00 00\n
 *   Paiement: À la livraison (Cash)
 */
function parseDeliveryNote(rawNote) {
  const note = String(rawNote || "").replace(/^\[INVOICE_REF:[^\]]*\]\s*/, "");
  const result = { adresse: "", telephone: "", payMethod: "", deliveryMode: "" };
  note.split("\n").forEach(line => {
    // On sépare au premier ":" uniquement
    const colonIdx = line.indexOf(":");
    if (colonIdx < 0) return;
    const key = line.slice(0, colonIdx).trim().toLowerCase();
    const val = line.slice(colonIdx + 1).trim();
    if (key === "adresse") result.adresse = val;
    else if (key === "téléphone" || key === "telephone") result.telephone = val;
    else if (key === "paiement") result.payMethod = val;
    else if (key === "mode livraison") result.deliveryMode = val;
  });
  return result;
}

function upsertInvoiceReferenceInNote(note, invoiceReference) {
  const cleanedNote = String(note || "").replace(/^\[INVOICE_REF:[^\]]*\]\s*/,"").trim();
  const cleanedRef = String(invoiceReference || "").trim();
  if (!cleanedRef) return cleanedNote;
  return `[INVOICE_REF:${cleanedRef}]${cleanedNote ? ` ${cleanedNote}` : ""}`;
}

function validatePromotionWindow(promo) {
  const hasStart = !!promo.startAt;
  const hasEnd = !!promo.endAt;
  const startTime = hasStart ? new Date(promo.startAt).getTime() : null;
  const endTime = hasEnd ? new Date(promo.endAt).getTime() : null;

  if (hasStart && Number.isNaN(startTime)) {
    return "Date de début invalide.";
  }
  if (hasEnd && Number.isNaN(endTime)) {
    return "Date de fin invalide.";
  }
  if (hasStart && hasEnd && startTime > endTime) {
    return "La date de fin doit être après la date de début.";
  }
  return null;
}

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

  // Validation légère de session admin (n'appelle pas Odoo)
  router.get("/me", async (req, res) => {
    res.json({
      success: true,
      data: {
        username: req.adminUser || "admin",
        role: "admin",
      },
    });
  });

  // Health admin (inclut la santé Odoo)
  router.get("/health", async (req, res) => {
    try {
      await odoo.authenticate();
      res.json({ success: true, data: { odoo: "connected" } });
    } catch (err) {
      res.status(503).json({
        success: false,
        error: "Connexion Odoo indisponible",
        details: err.message,
      });
    }
  });

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

      // Commandes du jour
      const today = now.toISOString().split("T")[0];
      const ordersToday = orders.filter(o => o.date_order && o.date_order.startsWith(today));

      res.json({
        success: true,
        data: {
          revenue,
          revGrowth,
          ordersTotal:       orders.length,
          ordersThisMonth:   thisMonth.length,
          ordersConfirmed:   confirmedOrders.length,
          ordersToday:       ordersToday.length,
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
  // GET /api/admin/products/min — Liste légère pour sélecteurs
  // ══════════════════════════════════════════════════════════
  router.get("/products/min", async (req, res) => {
    try {
      const { search = "", limit = 500 } = req.query;
      const domain = [["active", "=", true]];
      if (search) domain.push(["name", "ilike", search]);

      const products = await odoo.searchRead({
        model: "product.template",
        domain,
        fields: ["id", "name", "list_price", "categ_id"],
        limit: Math.min(parseInt(limit) || 500, 1000),
        order: "name asc",
      });

      res.json({ success: true, data: products });
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

      // 3. Cherche d'abord un quant existant (évite les doublons)
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
      } else {
        // Crée un nouveau quant seulement s'il n'existe pas
        const newQuantId = await odoo.callKw({
          model: "stock.quant",
          method: "create",
          args: [{
            product_id:  productId,
            location_id: locationId,
            inventory_quantity: newQty,
          }],
        });
        // Applique l'inventaire sur le nouveau quant
        await odoo.execute({
          model: "stock.quant",
          method: "action_apply_inventory",
          ids: [newQuantId],
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
      const { limit = 100, offset = 0, state, customer = "", minTotal, maxTotal, dateFrom, dateTo } = req.query;
      const domain = [];
      if (state && state !== "all") domain.push(["state", "=", state]);
      if (customer) domain.push(["partner_id.name", "ilike", customer]);
      if (minTotal !== undefined && minTotal !== "" && !Number.isNaN(Number(minTotal))) {
        domain.push(["amount_total", ">=", Number(minTotal)]);
      }
      if (maxTotal !== undefined && maxTotal !== "" && !Number.isNaN(Number(maxTotal))) {
        domain.push(["amount_total", "<=", Number(maxTotal)]);
      }
      if (dateFrom) domain.push(["date_order", ">=", `${dateFrom} 00:00:00`]);
      if (dateTo) domain.push(["date_order", "<=", `${dateTo} 23:59:59`]);

      const orders = await odoo.searchRead({
        model: "sale.order",
        domain,
        fields: ["id","name","partner_id","state","amount_total","date_order","order_line","note"],
        limit: Math.min(parseInt(limit), 500),
        offset: parseInt(offset),
        order: "date_order desc",
      });
      const orderIds = orders.map(o => o.id).filter(Boolean);
      let lineMap = {};
      if (orderIds.length) {
        const lines = await odoo.searchRead({
          model: "sale.order.line",
          domain: [["order_id", "in", orderIds]],
          fields: ["id", "order_id", "name", "product_uom_qty", "price_unit", "price_subtotal"],
          limit: 5000,
          order: "id asc",
        });
        lineMap = lines.reduce((acc, line) => {
          const orderId = Array.isArray(line.order_id) ? line.order_id[0] : line.order_id;
          if (!orderId) return acc;
          if (!acc[orderId]) acc[orderId] = [];
          acc[orderId].push({
            id: line.id,
            name: line.name || "Produit",
            qty: Number(line.product_uom_qty || 0),
            unitPrice: Number(line.price_unit || 0),
            subtotal: Number(line.price_subtotal || 0),
          });
          return acc;
        }, {});
      }

      const stateLabels = { draft:"Brouillon", sent:"Envoyée", sale:"Confirmée", done:"Livrée", cancel:"Annulée" };
      const mapped = orders.map(o => {
        let rawNote = String(o.note || "").replace(/<[^>]+>/g, "").trim();
        let isDone = false;
        
        // Extraction du tag virtuel pour le statut Livrée
        if (rawNote.includes("[STATUS:done]")) {
          isDone = true;
          rawNote = rawNote.replace(/\[STATUS:done\]/g, "").trim();
        }

        const cleanNote = rawNote.replace(/^\[INVOICE_REF:[^\]]*\]\s*/, "");
        const delivery = parseDeliveryNote(rawNote);
        const actualState = isDone ? "done" : o.state;

        return {
          id:           o.id,
          ref:          o.name,
          customer:     Array.isArray(o.partner_id) ? o.partner_id[1] : "",
          total:        o.amount_total,
          status:       stateLabels[actualState] || actualState,
          rawState:     actualState,
          date:         o.date_order ? o.date_order.split(" ")[0] : "",
          items:        o.order_line?.length || 0,
          note:         cleanNote,
          invoiceReference: parseInvoiceReferenceFromNote(o.note),
          lines:        lineMap[o.id] || [],
          // Champs livraison extraits de la note structurée
          adresse:      delivery.adresse,
          telephone:    delivery.telephone,
          payMethod:    delivery.payMethod,
          deliveryMode: delivery.deliveryMode,
        };
      });

      res.json({ success: true, data: mapped });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ══════════════════════════════════════════════════════════
  // HELPER : Changement de statut avec support du statut virtuel "done"
  // ══════════════════════════════════════════════════════════
  async function changeOrderStatus(odooId, state) {
    const orders = await odoo.searchRead({ model: "sale.order", domain: [["id", "=", odooId]], fields: ["note"], limit: 1 });
    if (!orders.length) return;
    let note = orders[0].note || "";

    if (state === "done") {
      // Pour "Livrée", on s'assure que la commande est confirmée (sale) puis on ajoute le tag
      await odoo.execute({ model: "sale.order", method: "action_confirm", ids: [odooId] }).catch(() => {});
      if (!note.includes("[STATUS:done]")) {
        await odoo.write({ model: "sale.order", ids: [odooId], values: { note: (note + "\n[STATUS:done]").trim() } });
      }
    } else {
      // On retire le tag virtuel s'il existe
      if (note.includes("[STATUS:done]")) {
        await odoo.write({ model: "sale.order", ids: [odooId], values: { note: note.replace(/\n?\[STATUS:done\]/g, "").trim() } });
      }
      const methodMap = { cancel: "action_cancel", draft: "action_draft", sale: "action_confirm" };
      if (methodMap[state]) {
        await odoo.execute({ model: "sale.order", method: methodMap[state], ids: [odooId] });
      }
    }
  }

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

      await changeOrderStatus(odooId, state);
      console.log(`[Admin] Commande ${odooId} → ${state}`);
      res.json({ success: true, data: { odooId, state } });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ══════════════════════════════════════════════════════════
  // PATCH /api/admin/orders/bulk-status — MAJ statut en masse
  // ══════════════════════════════════════════════════════════
  router.patch("/orders/bulk-status", async (req, res) => {
    try {
      const ids = Array.isArray(req.body?.ids) ? req.body.ids.map(n => parseInt(n)).filter(Boolean) : [];
      const state = req.body?.state;
      if (!ids.length) {
        return res.status(400).json({ success: false, error: "Aucune commande sélectionnée." });
      }
      if (!state || !ALLOWED_STATES.has(state)) {
        return res.status(400).json({ success: false, error: `État invalide. Valeurs : ${[...ALLOWED_STATES].join(", ")}` });
      }
      
      for (const id of ids) {
        await changeOrderStatus(id, state);
      }
      res.json({ success: true, data: { ids, state, updated: ids.length } });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ══════════════════════════════════════════════════════════
  // PATCH /api/admin/orders/:id/invoice-reference
  // ══════════════════════════════════════════════════════════
  router.patch("/orders/:id/invoice-reference", async (req, res) => {
    try {
      const odooId = parseInt(req.params.id);
      const invoiceReference = String(req.body?.invoiceReference || "").trim();
      if (!odooId || isNaN(odooId)) return res.status(400).json({ success: false, error: "ID commande invalide." });

      const rows = await odoo.read({
        model: "sale.order",
        ids: [odooId],
        fields: ["note"],
      });
      if (!rows?.length) return res.status(404).json({ success: false, error: "Commande introuvable." });

      const nextNote = upsertInvoiceReferenceInNote(rows[0].note || "", invoiceReference);
      await odoo.write({
        model: "sale.order",
        ids: [odooId],
        values: { note: nextNote },
      });
      res.json({ success: true, data: { odooId, invoiceReference } });
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

  // ══════════════════════════════════════════════════════════
  // Promotions (CRUD) — stockage JSON local
  // ══════════════════════════════════════════════════════════
  router.get("/promotions", async (req, res) => {
    try {
      const promotions = await readPromotions();
      promotions.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
      res.json({ success: true, data: promotions });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.post("/promotions", async (req, res) => {
    try {
      const promo = normalizePromo(req.body || {});
      if (!promo.title) return res.status(400).json({ success: false, error: "Le titre de la promotion est obligatoire." });
      if (!(promo.discountValue > 0)) return res.status(400).json({ success: false, error: "La réduction doit être supérieure à 0." });
      if (promo.discountType === "percent" && promo.discountValue > 100) {
        return res.status(400).json({ success: false, error: "La réduction en pourcentage ne peut pas dépasser 100%." });
      }
      const windowError = validatePromotionWindow(promo);
      if (windowError) return res.status(400).json({ success: false, error: windowError });

      const list = await readPromotions();
      list.unshift(promo);
      await writePromotions(list);
      res.json({ success: true, data: promo });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.patch("/promotions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const list = await readPromotions();
      const idx = list.findIndex(p => p.id === id);
      if (idx < 0) return res.status(404).json({ success: false, error: "Promotion introuvable." });

      const merged = normalizePromo({ ...list[idx], ...req.body, id: list[idx].id, createdAt: list[idx].createdAt });
      if (!merged.title) return res.status(400).json({ success: false, error: "Le titre de la promotion est obligatoire." });
      if (!(merged.discountValue > 0)) return res.status(400).json({ success: false, error: "La réduction doit être supérieure à 0." });
      if (merged.discountType === "percent" && merged.discountValue > 100) {
        return res.status(400).json({ success: false, error: "La réduction en pourcentage ne peut pas dépasser 100%." });
      }
      const windowError = validatePromotionWindow(merged);
      if (windowError) return res.status(400).json({ success: false, error: windowError });

      list[idx] = merged;
      await writePromotions(list);
      res.json({ success: true, data: merged });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.delete("/promotions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const list = await readPromotions();
      const next = list.filter(p => p.id !== id);
      if (next.length === list.length) {
        return res.status(404).json({ success: false, error: "Promotion introuvable." });
      }
      await writePromotions(next);
      res.json({ success: true, data: { id, deleted: true } });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
};
