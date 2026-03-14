
const OdooClient = require("./odoo.client");
require("dotenv").config();

const odoo = new OdooClient({
  url: process.env.ODOO_URL,
  db: process.env.ODOO_DB,
  username: process.env.ODOO_USER,
  password: process.env.ODOO_PASS,
});

const FIELDS = [
  "id", "name", "list_price", "categ_id", "qty_available",
  "description_sale", "description", "description_picking",
  "image_1920", "default_code", "active", "avg_rating",
  "rating_count", "uom_id", "currency_id"
];

async function test() {
  try {
    await odoo.authenticate();
    console.log("Auth success");

    for (const f of FIELDS) {
      try {
        await odoo.searchRead({
          model: "product.template",
          domain: [["id", ">", 0]],
          fields: [f],
          limit: 1
        });
        console.log(`✅ ${f} is VALID`);
      } catch (e) {
        console.log(`❌ ${f} is INVALID: ${e.message}`);
      }
    }

    const DOMAIN_FIELDS = ["active", "sale_ok", "type"];
    for (const df of DOMAIN_FIELDS) {
      try {
        await odoo.search({ model: "product.template", domain: [[df, "=", df === "type" ? "consu" : true]], limit: 1 });
        console.log(`✅ Domain field ${df} is VALID`);
      } catch (e) {
        console.log(`❌ Domain field ${df} is INVALID: ${e.message}`);
      }
    }
  } catch (err) {
    console.error("DIAGNOSTICS FAILED:", err.message);
  }
}

test();
