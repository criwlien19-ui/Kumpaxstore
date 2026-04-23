const OdooClient = require('./odoo.client');
const { ProductService } = require('./product.service');
require('dotenv').config();

const odoo = new OdooClient({
  url: process.env.ODOO_URL,
  db: process.env.ODOO_DB,
  username: process.env.ODOO_USER,
  password: process.env.ODOO_PASS,
});

async function test() {
  const ps = new ProductService(odoo);
  try {
    const cats = await ps.listCategories();
    console.log("Success! Found", cats.length, "categories");
  } catch (err) {
    console.error("Error calling listCategories:", err.message);
  }
}

test();
