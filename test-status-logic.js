const OdooClient = require('./odoo.client');
require('dotenv').config();

const odoo = new OdooClient({
  url: process.env.ODOO_URL,
  db: process.env.ODOO_DB,
  username: process.env.ODOO_USER,
  password: process.env.ODOO_PASS,
});

async function changeOrderStatus(odooId, state) {
  const orders = await odoo.searchRead({ model: "sale.order", domain: [["id", "=", odooId]], fields: ["note"], limit: 1 });
  if (!orders.length) return console.log("Order not found");
  let note = orders[0].note || "";

  if (state === "done") {
    // Pour "Livrée", on s'assure que la commande est confirmée (sale) puis on ajoute le tag
    await odoo.execute({ model: "sale.order", method: "action_confirm", ids: [odooId] }).catch(err => {
      console.log("action_confirm failed (ignored):", err.message);
    });
    if (!note.includes("[STATUS:done]")) {
      const newNote = (note + "\n[STATUS:done]").trim();
      console.log("Writing new note:", newNote);
      await odoo.write({ model: "sale.order", ids: [odooId], values: { note: newNote } });
    } else {
      console.log("Already done.");
    }
  } else {
    // On retire le tag virtuel s'il existe
    if (note.includes("[STATUS:done]")) {
      const newNote = note.replace(/\n?\[STATUS:done\]/g, "").trim();
      console.log("Writing new note to remove done:", newNote);
      await odoo.write({ model: "sale.order", ids: [odooId], values: { note: newNote } });
    }
    const methodMap = { cancel: "action_cancel", draft: "action_draft", sale: "action_confirm" };
    if (methodMap[state]) {
      console.log("Executing method:", methodMap[state]);
      await odoo.execute({ model: "sale.order", method: methodMap[state], ids: [odooId] });
    }
  }
  console.log("Success!");
}

async function run() {
  await changeOrderStatus(2, "done");
}
run().catch(console.error);
