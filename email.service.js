const nodemailer = require("nodemailer");

/**
 * Service pour envoyer des notifications par e-mail
 */
class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 465,
      secure: true, // true pour le port 465, false pour les autres ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    this.adminEmail = process.env.NOTIFICATION_EMAIL || process.env.SMTP_USER || "criwlien19@gmail.com";
  }

  /**
   * Envoie une notification lorsqu'une commande est créée
   */
  async sendOrderNotification(orderData, orderIdName) {
    try {
      const { delivery, items, payMethod, deliveryMode, payProvider, note } = orderData;
      const totalAmount = items.reduce((acc, item) => acc + (item.price * item.qty), 0);

      const deliveryModeLabel = deliveryMode === "relay" ? "Point Relais" : "Livraison à domicile";
      const payLabel = payMethod === "cod" ? "À la livraison (Espèces)" : `Mobile Money (${payProvider || "non précisé"})`;

      const itemsHtml = items.map(i => 
        `<tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${i.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${i.qty}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${i.price} FCFA</td>
        </tr>`
      ).join('');

      const mailOptions = {
        from: `"Kumpax Store" <${process.env.SMTP_USER}>`,
        to: this.adminEmail,
        subject: `🎉 Nouvelle Commande sur Kumpax Store : ${orderIdName}`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1E40AF;">Nouvelle commande reçue !</h2>
            <p>Une nouvelle commande a été passée sur votre boutique (Réf: <strong>${orderIdName}</strong>).</p>
            
            <h3 style="border-bottom: 2px solid #FBBF24; padding-bottom: 5px;">🛍️ Détails de la Commande</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background-color: #f1f5f9;">
                  <th style="padding: 8px; text-align: left;">Produit</th>
                  <th style="padding: 8px; text-align: center;">Qté</th>
                  <th style="padding: 8px; text-align: right;">Prix Unitaire</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding: 8px; text-align: right; font-weight: bold;">Total estimé :</td>
                  <td style="padding: 8px; text-align: right; font-weight: bold; color: #059669;">${totalAmount} FCFA</td>
                </tr>
              </tfoot>
            </table>

            <h3 style="border-bottom: 2px solid #FBBF24; padding-bottom: 5px;">👤 Informations Client</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Nom :</strong> ${delivery.prenom}</li>
              <li><strong>Téléphone :</strong> +221 ${delivery.telephone}</li>
              <li><strong>Adresse :</strong> ${delivery.adresse}</li>
            </ul>

            <h3 style="border-bottom: 2px solid #FBBF24; padding-bottom: 5px;">🚚 Livraison et Paiement</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Mode de livraison :</strong> ${deliveryModeLabel}</li>
              <li><strong>Méthode de paiement :</strong> ${payLabel}</li>
              ${note ? `<li><strong>Note du client :</strong> <i>"${note}"</i></li>` : ''}
            </ul>

            <p style="margin-top: 30px; font-size: 12px; color: #64748b; text-align: center;">
              Cet e-mail est généré automatiquement par votre boutique Kumpax Store. Connectez-vous à l'administration ou à Odoo pour traiter cette commande.
            </p>
          </div>
        `,
      };

      // Si SMTP_USER n'est pas défini (ex: environnement dev local sans variable), on ne plante pas mais on avertit
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn("⚠️ [EmailService] SMTP non configuré dans .env (SMTP_USER/SMTP_PASS). Le mail n'a pas été envoyé.");
        return { success: false, error: "SMTP credentials missing" };
      }

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`[EmailService] Notification envoyée : ${info.messageId}`);
      return { success: true, messageId: info.messageId };

    } catch (error) {
      console.error("[EmailService] Erreur lors de l'envoi de l'e-mail :", error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
