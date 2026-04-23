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
    const fields = await odoo.callKw({
      model: "sale.order",
      method: "fields_get",
      args: [],
      kwargs: { attributes: ["string", "type", "selection"] }
    });
    console.log("delivery_status:", fields.delivery_status);
    console.log("state:", fields.state);
  } catch (err) {
    console.error(err);
  }
}

test();
