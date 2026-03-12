// server/routes/products.js
const express = require("express");
const router  = express.Router();

module.exports = (productService) => {
  // GET /api/products?category=&search=&limit=&offset=
  router.get("/", async (req, res) => {
    try {
      const { category, search, limit = 100, offset = 0 } = req.query;
      const products = await productService.list({ category, search, limit: +limit, offset: +offset });
      res.json({ success: true, data: products, count: products.length });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET /api/products/categories
  router.get("/categories", async (req, res) => {
    try {
      const cats = await productService.listCategories();
      res.json({ success: true, data: cats });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET /api/products/:id
  router.get("/:id", async (req, res) => {
    try {
      const product = await productService.getById(req.params.id);
      if (!product) return res.status(404).json({ success: false, error: "Produit non trouvé" });
      res.json({ success: true, data: product });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
};
