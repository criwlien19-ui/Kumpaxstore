
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
  
  const products = await odoo.searchRead({
    model: "product.template",
    domain: [],
    fields: ["name", "id", "list_price"],
    limit: 50
  });
  console.log("Odoo Products:", JSON.stringify(products));

  const cats = await odoo.searchRead({
    model: "product.category",
    domain: [],
    fields: ["name", "id"],
    limit: 50
  });
  console.log("Odoo Categories:", JSON.stringify(cats));
}

test();
