/**
 * ============================================================
 * KUMPAX STORE — Admin Auth (JWT)
 * ============================================================
 * Fournit :
 *   - generateToken(user)   → crée un JWT signé 8h
 *   - verifyAdminJWT        → middleware Express de vérification
 * ============================================================
 */

const jwt     = require("jsonwebtoken");
const bcrypt  = require("bcryptjs");

const JWT_SECRET   = process.env.JWT_SECRET   || "kumpax-secret-please-change";
const ADMIN_USER   = process.env.ADMIN_USER   || "Criwlien26";
const ADMIN_HASH   = process.env.ADMIN_PASS_HASH;

// ─── Vérifie les credentials ────────────────────────────────
async function checkCredentials(username, password) {
  const normalizedUser = String(username || "").trim();
  const normalizedPass = String(password || "");
  if (!normalizedUser || !normalizedPass) return false;

  if (normalizedUser.toLowerCase() !== String(ADMIN_USER || "").trim().toLowerCase()) return false;

  // Hash bcrypt prioritaire si bien configuré
  if (ADMIN_HASH && /^\$2[aby]\$\d{2}\$/.test(ADMIN_HASH)) {
    const isMatch = await bcrypt.compare(normalizedPass, ADMIN_HASH);
    if (isMatch) return true;
  }

  // Fallback explicite pour dépannage local
  const plainFallback = process.env.ADMIN_PASS_PLAIN || process.env.ADMIN_PASS || "";
  return normalizedPass === plainFallback;
}

// ─── Génère un JWT signé ─────────────────────────────────────
function generateToken(username) {
  return jwt.sign(
    { username, role: "admin" },
    JWT_SECRET,
    { expiresIn: "8h" }
  );
}

// ─── Middleware Express de vérification JWT ──────────────────
function verifyAdminJWT(req, res, next) {
  const authHeader = req.headers["authorization"] || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, error: "Token manquant — authentification requise." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "admin") throw new Error("Rôle insuffisant");
    req.adminUser = decoded.username;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: "Token invalide ou expiré." });
  }
}

module.exports = { checkCredentials, generateToken, verifyAdminJWT };
