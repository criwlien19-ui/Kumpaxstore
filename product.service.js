/**
 * ============================================================
 * KUMPAX — Service Produits (Odoo ↔ Frontend)
 * ============================================================
 * Fait le mapping entre les champs Odoo et le format
 * attendu par le frontend Kumpax.
 *
 * Modèles Odoo utilisés :
 *   product.template  → produits maîtres
 *   product.category  → catégories internes
 * ============================================================
 */

// Mapping catégories Odoo → catégories Kumpax
// Clé = nom catégorie dans Odoo, valeur = données UI Kumpax
const CATEGORY_MAP = {
  "Smartphones":    { icon: "📱", color: "#EFF6FF", accent: "#1E40AF" },
  "Vêtements":      { icon: "👕", color: "#F0FDF4", accent: "#166534" },
  "Électroménager": { icon: "🏠", color: "#FFF7ED", accent: "#9A3412" },
  "TV & Audio":     { icon: "📺", color: "#FDF4FF", accent: "#7E22CE" },
  "Beauté":         { icon: "💄", color: "#FFF1F2", accent: "#BE123C" },
  "Alimentation":   { icon: "🛒", color: "#F0FDFA", accent: "#0F766E" },
  "All":            { icon: "🏪", color: "#F8FAFC", accent: "#64748B" },
};

/**
 * Convertit un product.template Odoo en objet Kumpax
 */
function mapProduct(odooProduct) {
  const catName = Array.isArray(odooProduct.categ_id)
    ? odooProduct.categ_id[1]
    : "Général";

  // Transforme l'image base64 Odoo en data URL
  const image = odooProduct.image_1920
    ? `data:image/png;base64,${odooProduct.image_1920}`
    : null;

  // Calcule le badge automatiquement selon le stock
  let badge = null;
  if (odooProduct.qty_available <= 0) badge = "Rupture";
  else if (odooProduct.qty_available <= 5) badge = "Stock limité";
  else if (odooProduct.is_published) badge = "Disponible";

  return {
    id:            odooProduct.id,
    name:          odooProduct.name,
    cat:           catName,
    price:         odooProduct.list_price,
    orig:          odooProduct.compare_list_price || null, // prix barré
    img:           image,
    rating:        odooProduct.avg_rating || 0,
    rev:           odooProduct.rating_count || 0,
    badge:         badge,
    stock:         Math.max(0, odooProduct.qty_available || 0),
    desc:          odooProduct.description_sale || odooProduct.description || "",
    specs:         parseSpecs(odooProduct.description_picking || ""),
    reference:     odooProduct.default_code || "",
    active:        odooProduct.active,
    // Champs Odoo bruts gardés pour debug
    _odoo: {
      id:         odooProduct.id,
      categ_id:   odooProduct.categ_id,
      uom_id:     odooProduct.uom_id,
      currency_id:odooProduct.currency_id,
    }
  };
}

/**
 * Parse les specs depuis le champ description_picking
 * Format attendu dans Odoo : "RAM: 8GB | CPU: Snapdragon 8 | Ecran: 6.7\""
 */
function parseSpecs(descPickup) {
  if (!descPickup) return [];
  return descPickup
    .split("|")
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .slice(0, 6); // max 6 specs affichées
}

/**
 * Convertit une catégorie Odoo en catégorie Kumpax
 */
function mapCategory(odooCategory, productCount = 0) {
  const uiData = CATEGORY_MAP[odooCategory.name] || {
    icon: "📦",
    color: "#F8FAFC",
    accent: "#64748B",
  };
  return {
    id:    odooCategory.id,
    name:  odooCategory.name,
    count: productCount,
    ...uiData,
  };
}

// ─── Champs à fetcher depuis Odoo ─────────────────────────
const PRODUCT_FIELDS = [
  "id",
  "name",
  "list_price",
  "compare_list_price",   // Odoo 16+ : prix barré
  "categ_id",
  "qty_available",
  "description_sale",
  "description",
  "description_picking",  // utilisé pour les specs
  "image_1920",
  "default_code",
  "active",
  "is_published",
  "avg_rating",
  "rating_count",
  "uom_id",
  "currency_id",
];

const CATEGORY_FIELDS = ["id", "name", "parent_id", "complete_name"];

// ─── Service Produits ──────────────────────────────────────
class ProductService {
  constructor(odooClient) {
    this.odoo = odooClient;
  }

  /**
   * Liste les produits publiés et actifs
   */
  async list({ category = null, search = "", limit = 100, offset = 0 } = {}) {
    const domain = [
      ["active", "=", true],
      ["sale_ok", "=", true],
      ["type", "!=", "service"], // exclure les services purs
    ];

    if (category && category !== "Tous") {
      domain.push(["categ_id.name", "=", category]);
    }
    if (search) {
      domain.push(["name", "ilike", search]);
    }

    const products = await this.odoo.searchRead({
      model:  "product.template",
      domain,
      fields: PRODUCT_FIELDS,
      limit,
      offset,
      order:  "name asc",
    });

    return products.map(mapProduct);
  }

  /**
   * Récupère un produit par ID
   */
  async getById(id) {
    const results = await this.odoo.searchRead({
      model:  "product.template",
      domain: [["id", "=", parseInt(id)]],
      fields: PRODUCT_FIELDS,
      limit:  1,
    });
    if (!results.length) return null;
    return mapProduct(results[0]);
  }

  /**
   * Liste les catégories avec compteur produits
   */
  async listCategories() {
    // Récupère les catégories présentes dans les produits actifs
    const cats = await this.odoo.searchRead({
      model:  "product.category",
      domain: [],
      fields: CATEGORY_FIELDS,
    });

    // Compte les produits par catégorie
    const counts = await Promise.all(
      cats.map(async (cat) => {
        const count = await this.odoo.callKw({
          model:  "product.template",
          method: "search_count",
          args:   [[["categ_id", "=", cat.id], ["active", "=", true], ["sale_ok", "=", true]]],
        });
        return { id: cat.id, count };
      })
    );

    const countMap = Object.fromEntries(counts.map(c => [c.id, c.count]));

    return cats
      .filter(cat => countMap[cat.id] > 0)
      .map(cat => mapCategory(cat, countMap[cat.id]));
  }

  /**
   * Met à jour le stock (après vente)
   */
  async updateStock(productTemplateId, quantity) {
    // Récupère le product.product correspondant (variant)
    const variants = await this.odoo.searchRead({
      model:  "product.product",
      domain: [["product_tmpl_id", "=", productTemplateId]],
      fields: ["id", "qty_available"],
      limit:  1,
    });
    if (!variants.length) throw new Error("Variante produit non trouvée");
    return variants[0];
  }
}

module.exports = { ProductService, mapProduct, mapCategory, PRODUCT_FIELDS };
