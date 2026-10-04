# Automatik Gebrauchtwagen — automatikgebrauchtwagen.com

## Structure (monorepo unifié pour Vercel)
```
automatik/
├── api/              ← Serverless functions (backend)
│   ├── auth/         ← login, register, me
│   ├── cars/         ← index, [id], categories
│   ├── cart/         ← index, count, [carId]
│   ├── orders/       ← index, my, [id], track/[orderNumber]
│   ├── simulation/   ← index
│   ├── admin/        ← stats, clients
│   └── user/         ← profile, password
├── lib/              ← Shared: prisma.js, middleware.js, helpers.js
├── prisma/           ← schema.prisma, seed.js
├── src/              ← React frontend
│   ├── components/   ← Navbar, CarCard, Toast, Chatbot, UI, AdminSidebar
│   ├── pages/        ← Home, Catalog, CarDetails, Cart, Track...
│   │   └── admin/    ← AdminDashboard, AdminOrders...
│   ├── store/        ← Zustand (auth, cart, toast, lang)
│   ├── services/     ← api.js (axios)
│   └── utils/        ← helpers.js, i18n.js
├── vercel.json       ← Routes + CORS headers
├── package.json      ← Unified dependencies
└── .env.example    ← Copier en .env et remplir
```

## Déploiement sur Vercel

### 1. Neon (base de données PostgreSQL)
1. [neon.tech](https://neon.tech) → Create project
2. Connection Details → copier les 2 chaînes de connexion :
   - **Pooled connection** → `DATABASE_URL` (avec `?pgbouncer=true`)
   - **Direct connection** → `DIRECT_URL`
3. Créer le schéma : depuis ta machine avec `.env` configuré :
   ```bash
   npx prisma db push
   ```

### 1b. Cloudinary (stockage des images / preuves de paiement)
1. [cloudinary.com](https://cloudinary.com) → Dashboard
2. Copier `Cloud name`, `API Key`, `API Secret` dans `.env`

### 2. GitHub
```bash
git init && git add . && git commit -m "🚀 Automatik Gebrauchtwagen"
git remote add origin https://github.com/VOTRE_USER/automatik-gebrauchtwagen.git
git push -u origin main
```

### 3. Vercel
1. [vercel.com](https://vercel.com) → Import GitHub repo
2. **Root Directory : laisser vide** (à la racine)
3. Framework: **Vite**
4. Environment Variables → ajouter :

| Variable | Valeur |
|---|---|
| `DATABASE_URL` | `postgresql://USER:PWD@ep-xxx-pooler...neon.tech/neondb?sslmode=require&pgbouncer=true` |
| `DIRECT_URL` | `postgresql://USER:PWD@ep-xxx...neon.tech/neondb?sslmode=require` |
| `JWT_SECRET` | (chaîne aléatoire 64+ caractères) |

5. Deploy → ✅ https://automatikgebrauchtwagen.com

### 4. Seeder (une seule fois)
Depuis votre machine avec `.env` configuré :
npm run seed
```

## Comptes demo
- Admin : autoKompetenz@gmail.com / password
- Client : client@automatikgebrauchtwagen.com / password
