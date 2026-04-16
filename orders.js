// routes/orders.js
const express = require("express");
const router = express.Router();

// États Odoo autorisés (whitelist de sécurité)
const ALLOWED_STATES = new Set(["draft", "sale", "done", "cancel"]);

// Middleware d'authentification admin
const checkAdminAuth = (req, res, next) => {
  const token = req.headers["authorization"] || req.headers["x-admin-token"];
  const expectedToken = process.env.ADMIN_TOKEN;

  if (!expectedToken || token !== expectedToken) {
    return res.status(401).json({ success: false, error: "Non autorisé : Token admin invalide ou manquant." });
  }
  next();
};

module.exports = (orderService) => {
  function normalizeItems(items) {
    return items.map((item, index) => {
      const id = Number(item?.id);
      const qty = Number(item?.qty);
      const price = Number(item?.price);
      const name = String(item?.name || "").trim();

      if (!Number.isFinite(id) || id <= 0) {
        throw new Error(`Article #${index + 1}: identifiant produit invalide.`);
      }
      if (!name) {
        throw new Error(`Article #${index + 1}: nom du produit manquant.`);
      }
      if (!Number.isFinite(qty) || qty <= 0) {
        throw new Error(`Article #${index + 1}: quantité invalide.`);
      }
      if (!Number.isFinite(price) || price < 0) {
        throw new Error(`Article #${index + 1}: prix invalide.`);
      }

      return { id, name, qty, price };
    });
  }

  // POST /api/orders  → crée un devis dans Odoo
  router.post("/", async (req, res) => {
    try {
      const { delivery, items, payMethod, deliveryMode, payProvider, note } = req.body;

      // Validation des champs obligatoires
      if (!delivery || !Array.isArray(items) || !items.length) {
        return res.status(400).json({ success: false, error: "delivery et items (non vide) sont requis" });
      }
      const customerName = (delivery.nomComplet || delivery.prenom || "").trim();
      if (!customerName || !delivery.telephone || !delivery.adresse) {
        return res.status(400).json({ success: false, error: "Champs livraison incomplets (nomComplet/prenom, telephone, adresse requis)" });
      }
      // Valide le numéro de téléphone (9 chiffres)
      const phone = delivery.telephone.replace(/\s/g, "");
      if (!/^\d{9}$/.test(phone) && !/^\+221\d{9}$/.test(phone)) {
        return res.status(400).json({ success: false, error: "Numéro de téléphone invalide" });
      }
      // Valide le mode de livraison
      if (deliveryMode && ![ "home", "relay" ].includes(deliveryMode)) {
        return res.status(400).json({ success: false, error: "deliveryMode invalide (home | relay)" });
      }
      // Valide le provider de paiement mobile si besoin
      const VALID_PROVIDERS = ["wave", "orange_money", "yas"];
      if (payMethod === "online" && payProvider && !VALID_PROVIDERS.includes(payProvider)) {
        return res.status(400).json({ success: false, error: `payProvider invalide. Valeurs autorisées : ${VALID_PROVIDERS.join(", ")}` });
      }
      let normalizedItems = [];
      try {
        normalizedItems = normalizeItems(items);
      } catch (validationErr) {
        return res.status(400).json({ success: false, error: validationErr.message });
      }

      // Compatibilité ascendante/descendante: normalise le nom client pour le service Odoo
      const normalizedDelivery = {
        ...delivery,
        prenom: customerName,
        nomComplet: customerName,
      };

      const result = await orderService.createOrder({
        delivery: normalizedDelivery,
        items: normalizedItems,
        payMethod,
        deliveryMode,
        payProvider,
        note,
      });
      res.json({ success: true, data: result });
    } catch (err) {
      console.error("[POST /orders]", err.message);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET /api/orders?limit=&offset=&state=
  router.get("/", checkAdminAuth, async (req, res) => {
    try {
      const { limit = 50, offset = 0, state } = req.query;

      // Validation des paramètres numériques
      const parsedLimit = Math.min(Math.max(1, parseInt(limit) || 50), 200);
      const parsedOffset = Math.max(0, parseInt(offset) || 0);

      const orders = await orderService.listOrders({ limit: parsedLimit, offset: parsedOffset, state });
      res.json({ success: true, data: orders });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET /api/orders/customer/:phone
  router.get("/customer/:phone", async (req, res) => {
    try {
      const phone = req.params.phone.replace(/\s/g, "");
      if (!/^\d{9}$/.test(phone) && !/^\+221\d{9}$/.test(phone)) {
        return res.status(400).json({ success: false, error: "Numéro de téléphone invalide" });
      }

      const orders = await orderService.getCustomerOrders(phone);
      res.json({ success: true, data: orders });
    } catch (err) {
      console.error("[GET /orders/customer]", err.message);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // PATCH /api/orders/:id/status
  router.patch("/:id/status", checkAdminAuth, async (req, res) => {
    try {
      const { state } = req.body;
      const orderId = parseInt(req.params.id);

      // Validation — whitelist des états autorisés
      if (!state || !ALLOWED_STATES.has(state)) {
        return res.status(400).json({
          success: false,
          error: `État invalide. Valeurs autorisées : ${[...ALLOWED_STATES].join(", ")}`,
        });
      }
      if (!orderId || isNaN(orderId)) {
        return res.status(400).json({ success: false, error: "ID commande invalide" });
      }

      const result = await orderService.updateOrderStatus(orderId, state);
      res.json({ success: true, data: result });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
};
