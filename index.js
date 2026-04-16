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
const envOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
const defaultOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
];

// CORS robuste : on autorise si l'origine (protocole inclus) correspond,
// ou si le hostname correspond (ex: http vs https, ou URL sans schéma).
const allowedOrigins = new Set([...defaultOrigins, ...envOrigins]);
const allowAllOrigins = allowedOrigins.has("*");
const allowedHosts = new Set();
const allowedHostSuffixes = new Set(); // ex: "*.kumpax.sn" => suffix "kumpax.sn"

for (const entry of allowedOrigins) {
  if (!entry || entry === "*") continue;
  let host = entry;
  try {
    if (entry.includes("://")) host = new URL(entry).host; // inclut éventuellement le port
  } catch {
    // Fallback: l'entrée est peut-être juste un hostname (ex: "kumpax.sn")
  }
  if (host.startsWith("*.")) allowedHostSuffixes.add(host.slice(2));
  else allowedHosts.add(host);
}

app.use(cors((req, callback) => {
  const origin = req.header("Origin");

  const corsOptions = {
    origin: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };

  // Autorise les requêtes sans origine (mobile apps, curl, serveur à serveur).
  if (!origin) return callback(null, corsOptions);

  // Si FRONTEND_URL n'est pas configuré, autorise en local/dev par défaut.
  if (!envOrigins.length) return callback(null, corsOptions);

  // 1) Match exact sur l'origine complète (protocol + host + port)
  if (allowAllOrigins || allowedOrigins.has(origin)) return callback(null, corsOptions);

  // 2) Match sur hostname (ignore http/https)
  let originHost = origin;
  let originHostname = origin;
  try {
    const originUrl = new URL(origin);
    originHost = originUrl.host; // inclut éventuellement le port
    originHostname = originUrl.hostname;
  } catch {
    // origin invalide => on laisse échouer le CORS ci-dessous
  }
  if (allowedHosts.has(originHost)) return callback(null, corsOptions);

  // 3) Wildcards en suffix (ex: "*.kumpax.sn")
  for (const suffix of allowedHostSuffixes) {
    if (originHostname === suffix || originHostname.endsWith("." + suffix)) return callback(null, corsOptions);
  }

  return callback(new Error("CORS: Origine non autorisée par la politique de sécurité de Kumpax."));
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
