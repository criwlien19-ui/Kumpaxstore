/**
 * ============================================================
 * KUMPAX STORE — Odoo JSON-RPC Client
 * ============================================================
 * Gère toute la communication bas-niveau avec l'API Odoo.
 * Compatible Odoo 16 & 17 (JSON-RPC 2.0).
 *
 * Endpoints utilisés :
 *   POST /web/session/authenticate   → login
 *   POST /web/dataset/call_kw        → appels modèles ORM
 *   POST /web/session/destroy        → logout
 * ============================================================
 */

const axios = require("axios");

class OdooClient {
  constructor({ url, db, username, password }) {
    if (!url || !db || !username || !password) {
      throw new Error("OdooClient: url, db, username, password sont obligatoires.");
    }
    this.url = url.replace(/\/$/, ""); // ex: https://mycompany.odoo.com
    this.db = db;
    this.username = username;
    this.password = password;
    this.uid = null;   // user ID après authentification
    this.sessionId = null;   // cookie de session
    this._authPromise = null; // évite les auth concurrentes
  }

  // ─── Authentification ─────────────────────────────────────
  async authenticate() {
    // Si déjà authentifié et session valide, on réutilise
    if (this.uid && this.sessionId) return this.uid;

    // Évite les authentifications parallèles (race condition)
    if (this._authPromise) return this._authPromise;

    this._authPromise = this._doAuthenticate();
    try {
      this.uid = await this._authPromise;
      return this.uid;
    } finally {
      this._authPromise = null;
    }
  }

  async _doAuthenticate() {
    try {
      const res = await axios.post(
        `${this.url}/web/session/authenticate`,
        {
          jsonrpc: "2.0",
          method: "call",
          params: { db: this.db, login: this.username, password: this.password },
        },
        { headers: { "Content-Type": "application/json" }, withCredentials: true }
      );

      const result = res.data?.result;
      if (!result?.uid) {
        throw new Error(`Authentification Odoo échouée : ${JSON.stringify(res.data?.error || "Identifiants invalides")}`);
      }

      // Récupère le cookie de session pour les requêtes suivantes
      const setCookie = res.headers["set-cookie"];
      if (setCookie) {
        const sessionCookie = setCookie.find(c => c.startsWith("session_id="));
        if (sessionCookie) {
          this.sessionId = sessionCookie.split(";")[0]; // "session_id=xxxx"
        }
      }

      console.log(`✅ Odoo connecté — uid=${result.uid}, db=${this.db}`);
      return result.uid;
    } catch (err) {
      this.uid = null;
      this.sessionId = null;
      throw new Error(`Connexion Odoo impossible : ${err.message}`);
    }
  }

  // ─── Appel générique JSON-RPC ──────────────────────────────
  async _rpc(endpoint, params, isRetry = false) {
    await this.authenticate();

    const headers = { "Content-Type": "application/json" };
    if (this.sessionId) headers["Cookie"] = this.sessionId;

    try {
      const res = await axios.post(
        `${this.url}${endpoint}`,
        { jsonrpc: "2.0", method: "call", id: Date.now(), params },
        { headers, timeout: 15000 } // timeout 15s
      );

      if (res.data?.error) {
        // Session expirée (code 100 ou 300 selon Odoo)
        const errorCode = res.data.error.code;
        if ((errorCode === 100 || errorCode === 300) && !isRetry) {
          console.warn(`[Odoo] Session expirée (code ${errorCode}), reconnexion...`);
          this.uid = null;
          this.sessionId = null;
          return this._rpc(endpoint, params, true); // retry unique
        }
        throw new Error(JSON.stringify(res.data.error));
      }

      return res.data.result;
    } catch (err) {
      throw new Error(`Odoo RPC [${endpoint}] : ${err.message}`);
    }
  }

  // ─── Méthode principale : appel ORM ───────────────────────
  async callKw({ model, method, args = [], kwargs = {} }) {
    return this._rpc("/web/dataset/call_kw", {
      model,
      method,
      args,
      kwargs: {
        context: { lang: "fr_FR", tz: "Africa/Dakar" },
        ...kwargs,
      },
    });
  }

  // ─── Helpers ORM raccourcis ────────────────────────────────
  async searchRead({ model, domain = [], fields = [], limit = 100, offset = 0, order = "" }) {
    return this.callKw({
      model,
      method: "search_read",
      args: [domain],
      kwargs: { fields, limit, offset, order },
    });
  }

  async search({ model, domain = [], limit = 100 }) {
    return this.callKw({
      model,
      method: "search",
      args: [domain],
      kwargs: { limit },
    });
  }

  async read({ model, ids, fields = [] }) {
    return this.callKw({ model, method: "read", args: [ids], kwargs: { fields } });
  }

  async create({ model, values }) {
    return this.callKw({ model, method: "create", args: [values] });
  }

  async write({ model, ids, values }) {
    return this.callKw({ model, method: "write", args: [ids, values] });
  }

  async unlink({ model, ids }) {
    return this.callKw({ model, method: "unlink", args: [ids] });
  }

  async execute({ model, method, ids = [], kwargs = {} }) {
    return this.callKw({ model, method, args: [ids], kwargs });
  }
}

module.exports = OdooClient;
