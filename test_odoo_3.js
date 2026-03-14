
const OdooClient = require("./odoo.client");
require("dotenv").config();

const odoo = new OdooClient({
  url: process.env.ODOO_URL,
  db: process.env.ODOO_DB,
  username: process.env.ODOO_USER,
  password: process.env.ODOO_PASS,
});

async function test() {
  await odoo.authenticate();
  
  // 1. Check template 12 if it exists
  const tmpl = await odoo.searchRead({ model: "product.template", domain: [["id", "=", 12]], fields: ["name", "product_variant_ids"], limit: 1 });
  console.log("Template 12:", JSON.stringify(tmpl));

  // 2. Check all products to see what IDs we actually have
  const allProds = await odoo.searchRead({ model: "product.template", fields: ["name", "id"], limit: 5 });
  console.log("Real product samples:", JSON.stringify(allProds));

  // 3. Inspect fields of product.product
  // We'll try common names for the template link
  const variants = await odoo.searchRead({
    model: "product.product",
    domain: [],
    fields: ["id", "product_tmpl_id", "name"],
    limit: 5
  });
  console.log("Variant samples:", JSON.stringify(variants));
}

test();
