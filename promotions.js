const express = require("express");
const router = express.Router();
const { readPromotions, isPromotionCurrentlyActive } = require("./promotions.store");

module.exports = () => {
  router.get("/active", async (req, res) => {
    try {
      const promotions = await readPromotions();
      const active = promotions.filter(isPromotionCurrentlyActive);
      res.json({ success: true, data: active });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
};
