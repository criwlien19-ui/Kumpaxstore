# Kumpax Store — Intégration Odoo
## Architecture & Guide de Déploiement

---

## Architecture globale

```
┌─────────────────────────────────────────────────────────────────┐
│                     NAVIGATEUR CLIENT                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │           KumpaxStore.html  (React + Tailwind)          │   │
│  │                                                          │   │
│  │  ┌──────────────┐   ┌─────────────────────────────┐    │   │
│  │  │  API Layer   │   │  État Local (Cart, Wishlist) │    │   │
│  │  │  api.getX()  │   │  useReducer / useContext     │    │   │
│  │  └──────┬───────┘   └─────────────────────────────┘    │   │
│  └─────────┼────────────────────────────────────────────────┘  │
└────────────┼────────────────────────────────────────────────────┘
             │ HTTP/REST
             ▼
┌─────────────────────────────────────────────────────────────────┐
│              SERVEUR BRIDGE  (Node.js / Express)                │
│   kumpax-odoo/server/index.js  :3001                            │
│                                                                  │
│  ┌──────────────────┐   ┌──────────────────────────────────┐   │
│  │  /api/products   │   │  /api/orders                     │   │
│  │  GET  /          │   │  POST /         → crée commande  │   │
│  │  GET  /categories│   │  GET  /         → liste          │   │
│  │  GET  /:id       │   │  PATCH /:id/status               │   │
│  └────────┬─────────┘   └──────────────┬───────────────────┘   │
│           │                            │                        │
│  ┌────────▼────────────────────────────▼───────────────────┐   │
│  │              OdooClient (JSON-RPC 2.0)                   │   │
│  │    authenticate() → searchRead() → create() → write()   │   │
│  └─────────────────────────────┬───────────────────────────┘   │
└────────────────────────────────┼────────────────────────────────┘
                                 │ JSON-RPC over HTTPS
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    INSTANCE ODOO                                 │
│                                                                  │
│  product.template  ←→  Catalogue produits                       │
│  product.category  ←→  Catégories (Smartphones, Vêtements…)    │
│  res.partner       ←→  Clients (créés auto à la commande)       │
│  sale.order        ←→  Commandes de vente                       │
│  sale.order.line   ←→  Lignes de commande (articles)            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Installation en 3 étapes

### Étape 1 — Serveur Node.js

```bash
cd kumpax-odoo
npm install
cp .env.example .env
```

Éditer `.env` :
```env
ODOO_URL=https://votre-instance.odoo.com
ODOO_DB=votre_base
ODOO_USER=admin@votreentreprise.sn
ODOO_PASS=votre_mot_de_passe
PORT=3001
```

```bash
npm run dev   # développement (avec hot reload)
npm start     # production
```

Tester la connexion :
```bash
curl http://localhost:3001/api/health
# Réponse attendue : {"status":"ok","odoo":"connected","uid":2}
```

---

### Étape 2 — Configuration Odoo

#### Catégories produits requises
Dans Odoo → Inventaire → Configuration → Catégories de produits, créez :
- `Smartphones`
- `Vêtements`
- `Électroménager`
- `TV & Audio`
- `Beauté`
- `Alimentation`

#### Champs produits utilisés
| Champ Odoo             | Usage Kumpax          |
|------------------------|-----------------------|
| `name`                 | Nom du produit        |
| `list_price`           | Prix de vente (FCFA)  |
| `compare_list_price`   | Prix barré            |
| `categ_id`             | Catégorie             |
| `qty_available`        | Stock disponible      |
| `description_sale`     | Description           |
| `description_picking`  | Specs (séparées par `|`) |
| `image_1920`           | Photo produit         |

#### Format specs dans `description_picking` :
```
RAM: 8GB | CPU: Snapdragon 8 Gen 3 | Écran: 6.8" | S Pen: inclus
```

---

### Étape 3 — Activer Odoo dans le frontend

Avant le chargement du HTML, définissez ces variables :

```html
<script>
  window.KUMPAX_API_URL  = "https://api.kumpax.sn"; // URL de votre serveur bridge
  window.KUMPAX_USE_ODOO = true;                     // Active le mode Odoo
</script>
```

Sans ces variables, le site fonctionne en **mode démo** avec les données mock.

---

## Flux d'une commande (de bout en bout)

```
1. Client remplit le formulaire de livraison  (Checkout Step 1)
2. Client choisit Wave / Cash                 (Checkout Step 2)
3. Client confirme                            (Checkout Step 3)
   └─ POST /api/orders  {delivery, items, payMethod}
      └─ findOrCreatePartner()  → res.partner dans Odoo
      └─ create sale.order      → brouillon
      └─ createOrderLines()     → sale.order.line × n articles
      └─ action_confirm()       → commande confirmée
      └─ retourne {orderName: "S00042"}
4. Frontend affiche "Réf Odoo : S00042" ✓
5. L'équipe voit la commande dans Odoo CRM en temps réel
```

---

## Déploiement production

### Option A — VPS / Serveur dédié
```bash
# PM2 pour process management
npm install -g pm2
pm2 start server/index.js --name kumpax-api
pm2 save && pm2 startup
```

Nginx reverse proxy :
```nginx
server {
    listen 443 ssl;
    server_name api.kumpax.sn;

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Option B — Odoo.sh / Hébergement Odoo cloud
Si votre Odoo est sur odoo.sh, l'URL est `https://votre-projet.odoo.com`.
Le JSON-RPC est activé par défaut. Aucune configuration serveur supplémentaire.

### Option C — Render / Railway (gratuit)
```bash
# Pousser sur GitHub puis connecter à Render.com
# Build command : npm install
# Start command : node server/index.js
# Variables d'environnement : à configurer dans le dashboard
```

---

## Modules Odoo requis

| Module          | Obligatoire | Usage                          |
|-----------------|-------------|--------------------------------|
| `sale`          | ✅          | Commandes de vente             |
| `stock`         | ✅          | Gestion des stocks             |
| `website`       | ✅ recommandé| `is_published`, ratings        |
| `crm`           | Optionnel   | Tags sur les commandes         |
| `sms`           | Optionnel   | Notifications SMS client       |

---

## Sécurité

| Risque                         | Solution appliquée                              |
|--------------------------------|-------------------------------------------------|
| Exposition credentials Odoo    | Variables `.env`, jamais dans le code           |
| CORS non contrôlé              | `FRONTEND_URL` dans `.env`                      |
| Session Odoo expirée           | Ré-authentification automatique dans `OdooClient` |
| Injection via API              | Validation `delivery` et `items` côté serveur  |
| Accès admin non protégé        | **À implémenter** : JWT + middleware auth        |

---

## Prochaines étapes recommandées

1. **Authentification admin** — JWT sur `/api/orders` (routes sensibles)
2. **Webhook Odoo → Frontend** — notifications livraison en temps réel
3. **Intégration Wave** — SDK Wave Commerce pour paiement mobile
4. **Cache Redis** — mettre en cache les produits (TTL 5 min)
5. **Images Cloudinary** — décharger les images base64 Odoo vers CDN

---

*Développé pour Kumpax Store — Architecture by Claude Sonnet 4.6*
#   K u m p a x s t o r e  
 