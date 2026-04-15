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
const morgan = require("morgan");
const compression = require("compression");
const OdooClient = require("./odoo.client");
const { ProductService } = require("./product.service");
const OrderService = require("./order.service");
const productRoutes = require("./products");
const orderRoutes = require("./orders");
const adminRoutes = require("./admin.routes");
const promotionsRoutes = require("./promotions");

const app = express();

// ── Performance & Logging ──────────────────────────────────
app.use(morgan("dev"));
app.use(compression());

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
const allowedOrigins = (process.env.FRONTEND_URL || "").split(",").map(o => o.trim());
app.use(cors({
  origin: (origin, callback) => {
    // Autorise les requêtes sans origine (comme mobile apps ou curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes("*")) {
      callback(null, true);
    } else {
      callback(new Error("CORS: Origine non autorisée par la politique de sécurité de Kumpax."));
    }
  },
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
app.use("/api/admin", adminRoutes(odoo, productService, orderService));
app.use("/api/promotions", promotionsRoutes());

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
  if (err.message.includes("CORS")) {
    return res.status(403).json({ success: false, error: err.message });
  }
  console.error("[ERROR]", err.message);
  res.status(500).json({ success: false, error: "Erreur interne du serveur" });
});

// ── Frontend & 404 ─────────────────────────────────────────
// Sert les fichiers statiques (CSS, JS, images, index.html)
const path = require("path");
app.use(express.static(__dirname));

// Pour les routes front-end (React), on renvoie toujours index.html
app.get(/^(?!\/api).+/, (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Pour les routes d'API non trouvées
app.use("/api", (req, res) => {
  res.status(404).json({ success: false, error: "Route API non trouvée" });
});

// ── Démarrage ──────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Kumpax API démarrée sur http://localhost:${PORT}`);
  console.log(`📡 Odoo cible : ${process.env.ODOO_URL}`);
  console.log(`🗄  Base Odoo : ${process.env.ODOO_DB}\n`);
  odoo.authenticate().catch(err => console.error("⚠️  Odoo auth:", err.message));
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\n❌ ERREUR: Le port ${PORT} est déjà utilisé par un autre processus.`);
    console.error(`💡 Solution: Exécutez 'npx kill-port ${PORT}' ou changez le PORT dans .env\n`);
    process.exit(1);
  }
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM reçu. Fermeture du serveur...");
  server.close(() => {
    console.log("Serveur fermé.");
    process.exit(0);
  });
});

module.exports = app;
