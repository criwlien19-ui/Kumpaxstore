require('dotenv').config();
const emailService = require('./email.service');

(async () => {
  console.log("Testing email with user:", process.env.SMTP_USER);
  const result = await emailService.sendOrderNotification({
    delivery: { prenom: "Test", telephone: "770000000", adresse: "Dakar" },
    items: [{ name: "Test Produit", qty: 1, price: 1000 }],
    payMethod: "cod",
    deliveryMode: "home",
    payProvider: null,
    note: "Test depuis le terminal"
  }, "TEST-001");
  console.log("Result:", result);
})();
