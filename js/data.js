/* ═══════════════════════════════════════════════
   KUMPAX STORE — Données & Constantes
   ═══════════════════════════════════════════════ */

// ── Couleurs & Gradients ──
const BLUE = "#1E40AF";
const DARK_BLUE = "#0F4C81";
const grad = `linear-gradient(135deg,${BLUE},${DARK_BLUE})`;
const PLACEHOLDER = "https://images.unsplash.com/photo-1560343776-97e7d202ff0e?w=400&q=80";

// ── Modes de livraison ──
const DELIVERY_MODES = [
  { id: "home",  label: "Livraison à domicile", icon: "🏠", desc: "Reçu en 24–48h à votre adresse" },
  { id: "relay", label: "Point Relais",          icon: "📦", desc: "Retrait dans le point le plus proche" },
];

// ── Points Relais ──
const RELAY_POINTS = [
  { id: "rp1", label: "Kumpax Dakar-Plateau — Rue Félix Faure" },
  { id: "rp2", label: "Kumpax Almadies — Centre Commercial" },
  { id: "rp3", label: "Kumpax Thiès — Marché Central" },
  { id: "rp4", label: "Kumpax Mbour — Grand Mbour" },
  { id: "rp5", label: "Kumpax Saint-Louis — Sor" },
];

// ── Providers Paiement Mobile ──
const PAYMENT_PROVIDERS = [
  { id: "wave",         label: "Wave",         color: "#1BA8FF", bg: "#E8F6FF", emoji: "🌊" },
  { id: "orange_money", label: "Orange Money", color: "#FF6600", bg: "#FFF0E6", emoji: "🟠" },
  { id: "yas",          label: "Yas",          color: "#7C3AED", bg: "#F3EEFF", emoji: "💜" },
];

// ── Catégories avec sous-catégories ──
const CATS = [
  { id: 1, name: "Smartphones",    icon: "📱", bg: "#EFF6FF", accent: "#1E40AF", count: 24,
    subcategories: ["iPhone", "Samsung", "Xiaomi", "Tablettes"] },
  { id: 2, name: "Vêtements",      icon: "👕", bg: "#F0FDF4", accent: "#166534", count: 56,
    subcategories: ["Boubous", "Robes Wax", "Djellabas", "Accessoires"] },
  { id: 3, name: "Électroménager", icon: "🏠", bg: "#FFF7ED", accent: "#9A3412", count: 18,
    subcategories: ["Réfrigérateurs", "Machines à laver", "Climatiseurs", "Cuisinières"] },
  { id: 4, name: "TV & Audio",     icon: "📺", bg: "#FDF4FF", accent: "#7E22CE", count: 12,
    subcategories: ["Téléviseurs", "Écouteurs", "Enceintes", "Home Cinéma"] },
  { id: 5, name: "Beauté",         icon: "💄", bg: "#FFF1F2", accent: "#BE123C", count: 34,
    subcategories: ["Soins Visage", "Parfums", "Maquillage", "Soins Cheveux"] },
  { id: 6, name: "Alimentation",   icon: "🛒", bg: "#F0FDFA", accent: "#0F766E", count: 67,
    subcategories: ["Épicerie", "Boissons", "Bio & Santé", "Import"] },
];

// ── Produits ──
const PRODS = [
  { id: 1,  subcat: "iPhone",            name: "iPhone 15 Pro Max",          cat: "Smartphones",     price: 895000, orig: 950000,  img: "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=400&q=80",  rating: 4.8, rev: 124, badge: "Populaire",     stock: 8,  desc: "Le dernier iPhone avec puce A17 Pro, appareil photo 48MP et écran Super Retina XDR de 6.7 pouces.",     specs: ["Puce A17 Pro", "Écran 6.7\"", "48MP Camera", "Titane"] },
  { id: 2,  subcat: "Samsung",           name: "Samsung Galaxy S24 Ultra",   cat: "Smartphones",     price: 820000, orig: 870000,  img: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&q=80",  rating: 4.7, rev: 98,  badge: "Nouveau",        stock: 5,  desc: "Galaxy S24 Ultra avec S Pen intégré, caméra 200MP et Galaxy AI pour une expérience Android ultime.",      specs: ["Snapdragon 8 Gen 3", "Écran 6.8\"", "200MP", "S Pen"] },
  { id: 3,  subcat: "Boubous",           name: "Boubou Grand Bazin Brodé",   cat: "Vêtements",       price: 85000,  orig: 95000,   img: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80",  rating: 4.9, rev: 203, badge: "Tendance 🇸🇳",   stock: 15, desc: "Boubou authentique en grand basin riche, broderie main artisanale. Disponible tailles S à XXXL.",         specs: ["100% Basin", "Broderie Main", "Teinture Nat.", "Fait au SN"] },
  { id: 4,  subcat: "Réfrigérateurs",    name: "Réfrigérateur Samsung 350L", cat: "Électroménager",  price: 345000, orig: 385000,  img: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400&q=80",  rating: 4.6, rev: 67,  badge: "Solde",          stock: 3,  desc: "Réfrigérateur double porte 350L avec technologie No Frost et classe énergétique A++.",                     specs: ["350 Litres", "No Frost", "Classe A++", "Garantie 2 ans"] },
  { id: 5,  subcat: "Xiaomi",            name: "Xiaomi Redmi Note 13 Pro",   cat: "Smartphones",     price: 245000, orig: 265000,  img: "https://images.unsplash.com/photo-1598327105854-23d5b6e14423?w=400&q=80",  rating: 4.5, rev: 189, badge: "Meilleur prix", stock: 20, desc: "Meilleur rapport qualité-prix. Écran AMOLED 120Hz, batterie 5000mAh et charge rapide 67W.",               specs: ["Helio G99", "6.67\" AMOLED", "200MP", "5000mAh"] },
  { id: 6,  subcat: "Téléviseurs",       name: 'Smart TV LG OLED 55"',       cat: "TV & Audio",      price: 680000, orig: 720000,  img: "https://images.unsplash.com/photo-1593359677879-a4bb92f4834c?w=400&q=80",  rating: 4.8, rev: 45,  badge: "Premium",        stock: 4,  desc: "Téléviseur OLED 55 pouces avec processeur α9 Gen6 AI, webOS 23 et Dolby Vision & Atmos.",                  specs: ["OLED 55\"", "4K 120Hz", "Dolby Vision", "webOS 23"] },
  { id: 7,  subcat: "Robes Wax",         name: "Robe Wax Ankara Moderne",    cat: "Vêtements",       price: 35000,  orig: 42000,   img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80",  rating: 4.7, rev: 312, badge: "Tendance 🇸🇳",   stock: 30, desc: "Robe élégante en tissu wax Ankara de qualité supérieure, coupe moderne. Design exclusif Kumpax.",          specs: ["100% Wax", "Coupe Moderne", "Lavable 30°", "Exclusif"] },
  { id: 8,  subcat: "Écouteurs",         name: "AirPods Pro 2ème Gén.",      cat: "TV & Audio",      price: 195000, orig: 215000,  img: "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400&q=80",  rating: 4.9, rev: 156, badge: "Populaire",     stock: 12, desc: "Écouteurs sans fil avec réduction de bruit active, audio spatial personnalisé. 30h d'autonomie.",           specs: ["ANC Adaptatif", "Audio Spatial", "IP54", "30h Auto."] },
  { id: 9,  subcat: "Machines à laver",  name: "Machine à laver Hisense 7kg", cat: "Électroménager", price: 265000, orig: 295000,  img: "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400&q=80",  rating: 4.4, rev: 89,  badge: "Solde",          stock: 7,  desc: "Machine à laver 7kg avec 15 programmes, technologie Inverter et classe A+++. Silencieuse et économique.",  specs: ["7kg", "15 Programmes", "Classe A+++", "Inverter"] },
  { id: 10, subcat: "Djellabas",         name: "Djellaba Homme Luxe",        cat: "Vêtements",       price: 55000,  orig: 65000,   img: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&q=80",  rating: 4.8, rev: 178, badge: "Nouveau",        stock: 18, desc: "Djellaba homme en tissu premium, broderies artisanales sur le col et les manches. Pour les cérémonies.",   specs: ["Tissu Premium", "Broderie", "M-XXXL", "Livraison Grat."] },
  { id: 11, subcat: "Climatiseurs",      name: "Climatiseur Midea 12000BTU", cat: "Électroménager",  price: 285000, orig: 310000,  img: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80",  rating: 4.5, rev: 94,  badge: "Essentiel",      stock: 6,  desc: "Climatiseur inverter 12000BTU, WiFi Control et mode ECO. Refroidissement rapide en 10 min.",                specs: ["12000 BTU", "Inverter A++", "WiFi", "Install. incluse"] },
  { id: 12, subcat: "Tablettes",         name: "Samsung Galaxy Tab S9",      cat: "Smartphones",     price: 425000, orig: 460000,  img: "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400&q=80",     rating: 4.7, rev: 72,  badge: "Nouveau",        stock: 9,  desc: "Tablette premium AMOLED 11\", S Pen inclus. Performances de laptop pour travail et divertissement.",        specs: ["SD 8 Gen 2", "11\" AMOLED", "S Pen", "256GB"] },
];

// ── Commandes initiales ──
const INIT_ORDERS = [
  { id: "#KMP-2401", customer: "Moussa Diallo",   items: 3, total: 345000, status: "Livré",      date: "2024-01-15", city: "Dakar" },
  { id: "#KMP-2402", customer: "Fatou Sow",       items: 1, total: 895000, status: "En attente", date: "2024-01-16", city: "Thiès" },
  { id: "#KMP-2403", customer: "Ibrahima Ndiaye", items: 2, total: 120000, status: "En transit", date: "2024-01-17", city: "Saint-Louis" },
  { id: "#KMP-2404", customer: "Aïssatou Fall",   items: 4, total: 285000, status: "En attente", date: "2024-01-17", city: "Ziguinchor" },
  { id: "#KMP-2405", customer: "Cheikh Mbaye",    items: 1, total: 680000, status: "Livré",      date: "2024-01-14", city: "Dakar" },
];

// ── Formatage prix ──
const fmt = p => p.toLocaleString("fr-FR") + " FCFA";
