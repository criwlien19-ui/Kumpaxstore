const fs = require("fs");
const path = require("path");

const PROMO_FILE = path.join(__dirname, "promotions.json");

function normalizePromo(promo = {}) {
  return {
    id: promo.id || `promo_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    title: (promo.title || "").trim(),
    message: (promo.message || "").trim(),
    discountType: promo.discountType === "amount" ? "amount" : "percent",
    discountValue: Number(promo.discountValue || 0),
    scope: promo.scope === "category" || promo.scope === "products" ? promo.scope : "all",
    category: (promo.category || "").trim(),
    productIds: Array.isArray(promo.productIds) ? promo.productIds.map(Number).filter(Boolean) : [],
    popupEnabled: !!promo.popupEnabled,
    active: promo.active !== false,
    startAt: promo.startAt || null,
    endAt: promo.endAt || null,
    ctaLabel: (promo.ctaLabel || "Voir l'offre").trim(),
    updatedAt: new Date().toISOString(),
    createdAt: promo.createdAt || new Date().toISOString(),
  };
}

async function ensurePromoFile() {
  if (!fs.existsSync(PROMO_FILE)) {
    await fs.promises.writeFile(PROMO_FILE, "[]", "utf-8");
  }
}

async function readPromotions() {
  await ensurePromoFile();
  const raw = await fs.promises.readFile(PROMO_FILE, "utf-8");
  const parsed = raw ? JSON.parse(raw) : [];
  return Array.isArray(parsed) ? parsed : [];
}

async function writePromotions(promotions) {
  await fs.promises.writeFile(PROMO_FILE, JSON.stringify(promotions, null, 2), "utf-8");
}

function isPromotionCurrentlyActive(promo) {
  if (!promo.active) return false;
  const now = Date.now();
  const startOk = !promo.startAt || new Date(promo.startAt).getTime() <= now;
  const endOk = !promo.endAt || new Date(promo.endAt).getTime() >= now;
  return startOk && endOk;
}

module.exports = {
  normalizePromo,
  readPromotions,
  writePromotions,
  isPromotionCurrentlyActive,
};
