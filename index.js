/**
 * ============================================================
 * KUMPAX STORE — Serveur API (Bridge Odoo)
 * ============================================================
 */
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const OdooClient = require("./odoo.client");
const { ProductService } = require("./product.service");
const OrderService = require("./order.service");
const productRoutes = require("./products");
const orderRoutes = require("./orders");

const app = express();

// ── Sécurité HTTP (headers) ────────────────────────────────
app.use(helmet());

// ── Rate Limiting : 200 req / 15 min par IP ────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Trop de requêtes, réessayez dans 15 minutes." },
});
app.use("/api", limiter);

// ── Middlewares ────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "1mb" })); // taille max body

// ── Odoo Client (singleton) ────────────────────────────────
const odoo = new OdooClient({
  url: process.env.ODOO_URL,
  db: process.env.ODOO_DB,
  username: process.env.ODOO_USER,
  password: process.env.ODOO_PASS,
});

// ── Services ───────────────────────────────────────────────
const productService = new ProductService(odoo);
const orderService = new OrderService(odoo);

// ── Routes ─────────────────────────────────────────────────
app.use("/api/products", productRoutes(productService));
app.use("/api/orders", orderRoutes(orderService));

// Health check + test connexion Odoo
app.get("/api/health", async (req, res) => {
  try {
    await odoo.authenticate();
    res.json({ status: "ok", odoo: "connected", uid: odoo.uid });
  } catch (err) {
    res.status(503).json({ status: "error", odoo: err.message });
  }
});

// ── Gestion erreur globale ─────────────────────────────────
app.use((err, req, res, next) => {
  console.error("[ERROR]", err.message);
  res.status(500).json({ success: false, error: "Erreur interne du serveur" });
});

// ── 404 ────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route non trouvée" });
});

// ── Démarrage ──────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`\n🚀 Kumpax API démarrée sur http://localhost:${PORT}`);
    console.log(`📡 Odoo cible : ${process.env.ODOO_URL}`);
    console.log(`🗄  Base Odoo : ${process.env.ODOO_DB}\n`);
    odoo.authenticate().catch(err => console.error("⚠️  Odoo auth:", err.message));
  });
} else {
  // En production / Vercel, on tente l'authentification Odoo au chargement
  odoo.authenticate().catch(err => console.error("⚠️  Odoo auth:", err.message));
}

module.exports = app;
