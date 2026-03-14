const createDOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

class OrderService {
  constructor(odooClient) {
    this.odoo = odooClient;
  }

  // ─── 1. Gestion Client ────────────────────────────────────

  /**
   * Trouve un client par téléphone, ou le crée s'il n'existe pas
   */
  async findOrCreatePartner({ prenom, telephone, adresse }) {
    const fullName = prenom.trim();
    const cleanPhone = telephone.replace(/\s/g, "");
    const fullPhone = cleanPhone.startsWith("+221")
      ? cleanPhone
      : `+221${cleanPhone}`;

    // Cherche par numéro de téléphone (unique par client)
    const existing = await this.odoo.searchRead({
      model: "res.partner",
      domain: [["phone", "=", fullPhone]],
      fields: ["id", "name", "phone"],
      limit: 1,
    });

    if (existing.length) {
      console.log(`[Partner] Client existant trouvé: id=${existing[0].id}`);
      return existing[0].id;
    }

    // Crée le nouveau client
    const partnerId = await this.odoo.create({
      model: "res.partner",
      values: {
        name: fullName,
        phone: fullPhone,
        street: adresse,
        country_id: 68, // 68 = Sénégal dans Odoo (res.country)
        customer_rank: 1,
        lang: "fr_FR",
      },
    });

    console.log(`[Partner] Nouveau client créé: id=${partnerId}, name=${fullName}`);
    return partnerId;
  }

  // ─── 2. Création Commande ─────────────────────────────────

  /**
   * Crée une commande de vente complète dans Odoo
   *
   * @param {Object} orderData
   * @param {Object} orderData.delivery  - infos livraison { prenom, nom, telephone, adresse, quartier, ville }
   * @param {Array}  orderData.items     - [{ id, name, price, qty }]
   * @param {string} orderData.payMethod - "cod" | "online"
   * @param {string} orderData.note      - note interne optionnelle
   *
   * @returns {Object} { orderId, orderName, status }
   */
  async createOrder({ delivery, items, payMethod = "cod", note = "" }) {
    // 1. Trouver ou créer le partenaire
    const partnerId = await this.findOrCreatePartner(delivery);

    // 2. Préparer les notes de livraison
    const cleanNote = note ? DOMPurify.sanitize(note, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }) : "";
    const deliveryNote = [
      `Adresse: ${delivery.adresse}`,
      `Téléphone: +221 ${delivery.telephone}`,
      `Paiement: ${payMethod === "cod" ? "À la livraison (Cash)" : "Mobile Money (Wave/Orange Money)"}`,
      cleanNote ? `Note: ${cleanNote}` : "",
    ].filter(Boolean).join("\n");

    // 3. Créer l'en-tête de commande (sale.order)
    const saleOrderId = await this.odoo.create({
      model: "sale.order",
      values: {
        partner_id: partnerId,
        partner_invoice_id: partnerId,
        partner_shipping_id: partnerId,
        note: deliveryNote,
      },
    });

    console.log(`[Order] Commande créée: id=${saleOrderId}`);

    // 4. Ajouter les lignes de commande
    await this._createOrderLines(saleOrderId, items);

    // 5. Confirmer la commande → passe en état "sale"
    await this.odoo.execute({
      model: "sale.order",
      method: "action_confirm",
      ids: [saleOrderId],
    });

    // 6. Lire le numéro de commande généré par Odoo (ex: S00042)
    const orders = await this.odoo.read({
      model: "sale.order",
      ids: [saleOrderId],
      fields: ["name", "state", "amount_total", "date_order"],
    });

    const order = orders[0];
    console.log(`[Order] Confirmée: ${order.name}, total=${order.amount_total}`);

    return {
      odooId: saleOrderId,
      orderName: order.name,       // ex: "S00042"
      status: order.state,      // "sale"
      total: order.amount_total,
      date: order.date_order,
    };
  }

  // ─── 3. Lignes de commande ─────────────────────────────────

  /**
   * Crée les lignes sale.order.line pour une commande
   */
  async _createOrderLines(saleOrderId, items) {
    // Parallélisation : toutes les lignes créées simultanément
    await Promise.all(items.map(async (item) => {
      // Récupère le product.product (variante) depuis l'ID product.template
      const variants = await this.odoo.searchRead({
        model: "product.product",
        domain: [["product_tmpl_id", "=", item.id]],
        fields: ["id"],
        limit: 1,
      });

      if (!variants.length) {
        throw new Error(`Aucune variante (product.product) trouvée pour le template ID ${item.id} (${item.name})`);
      }

      const productProductId = variants[0].id;

      await this.odoo.create({
        model: "sale.order.line",
        values: {
          order_id: saleOrderId,
          product_id: productProductId,
          product_uom_qty: item.qty,
          price_unit: item.price,
          name: item.name,
        },
      });
    }));
    console.log(`[Order] ${items.length} ligne(s) de commande ajoutée(s)`);
  }

  // ─── 4. Récupération commandes ────────────────────────────

  /**
   * Liste les commandes récentes (pour le dashboard admin)
   */
  async listOrders({ limit = 50, offset = 0, state = null } = {}) {
    const domain = [];
    if (state) domain.push(["state", "=", state]);

    const orders = await this.odoo.searchRead({
      model: "sale.order",
      domain,
      fields: [
        "id", "name", "partner_id", "state", "amount_total",
        "date_order", "order_line",
      ],
      limit,
      offset,
      order: "date_order desc",
    });

    return orders.map(OrderService.mapOrder);
  }

  /**
   * Récupère les commandes d'un client par son téléphone
   */
  async getCustomerOrders(phone) {
    const fullPhone = phone.startsWith("+221") ? phone : `+221${phone}`;

    // 1. Trouver le client
    const partners = await this.odoo.searchRead({
      model: "res.partner",
      domain: [["phone", "=", fullPhone]],
      fields: ["id"],
      limit: 1
    });

    if (!partners.length) return [];

    // 2. Récupérer ses commandes
    const orders = await this.odoo.searchRead({
      model: "sale.order",
      domain: [["partner_id", "=", partners[0].id]],
      fields: ["id", "name", "state", "amount_total", "date_order", "order_line"],
      order: "date_order desc"
    });

    return orders.map(OrderService.mapOrder);
  }

  /**
   * Met à jour le statut d'une commande
   */
  async updateOrderStatus(odooOrderId, newState) {
    const methodMap = {
      "cancel": "action_cancel",
      "draft": "action_draft",
      "sale": "action_confirm",
    };
    if (methodMap[newState]) {
      await this.odoo.execute({
        model: "sale.order",
        method: methodMap[newState],
        ids: [odooOrderId],
      });
    }
    return { success: true, newState };
  }

  // ─── Helpers ──────────────────────────────────────────────

  static mapOrder(o) {
    const stateLabels = {
      draft: "Brouillon",
      sent: "Envoyée",
      sale: "Confirmée",
      done: "Livrée",
      cancel: "Annulée",
    };
    return {
      id: o.id,
      ref: o.name,
      customer: Array.isArray(o.partner_id) ? o.partner_id[1] : "",
      total: o.amount_total,
      status: stateLabels[o.state] || o.state,
      date: o.date_order ? o.date_order.split(" ")[0] : "",
      items: o.order_line?.length || 0,
    };
  }
}

module.exports = OrderService;
