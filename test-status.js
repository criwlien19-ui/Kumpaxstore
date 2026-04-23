const OdooClient = require('./odoo.client');
require('dotenv').config();

const odoo = new OdooClient({
  url: process.env.ODOO_URL,
  db: process.env.ODOO_DB,
  username: process.env.ODOO_USER,
  password: process.env.ODOO_PASS,
});

async function test() {
  try {
    const orders = await odoo.searchRead({
      model: "sale.order",
      domain: [],
      fields: ["id", "state"],
      limit: 1
    });
    if (!orders.length) return console.log("No orders");
    const order = orders[0];
    console.log("Order found:", order);
    
    try {
      console.log(`Trying to write state='done' on order ${order.id}...`);
      await odoo.write({ model:"sale.order", ids:[order.id], values: { state: "done" } });
      console.log(`✅ write succeeded!`);
    } catch (err) {
      console.log(`❌ write failed:`, err.message);
    }
  } catch (err) {
    console.error(err);
  }
}

test();
