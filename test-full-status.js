const express = require('express');
const router = express.Router();
// we can test the function directly

const OdooClient = require('./odoo.client');
require('dotenv').config();

const odoo = new OdooClient({
  url: process.env.ODOO_URL,
  db: process.env.ODOO_DB,
  username: process.env.ODOO_USER,
  password: process.env.ODOO_PASS,
});

async function changeOrderStatus(odooId, state) {
  const orders = await odoo.searchRead({ model: "sale.order", domain: [["id", "=", odooId]], fields: ["note", "state"], limit: 1 });
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

async function run() {
  try {
    console.log("Setting to draft...");
    await changeOrderStatus(2, "draft");
    console.log("Success draft");

    console.log("Setting to sale...");
    await changeOrderStatus(2, "sale");
    console.log("Success sale");
    
    console.log("Setting to done...");
    await changeOrderStatus(2, "done");
    console.log("Success done");

    console.log("Setting to cancel...");
    await changeOrderStatus(2, "cancel");
    console.log("Success cancel");
  } catch(e) {
    console.error("Error:", e.message);
  }
}
run();
