# AssetAgent AI - Monorepo

The **AssetAgent AI** is a production-grade autonomous marketplace for renting idle physical assets across India. 

## ⚙️ Monorepo Architecture
- **`/frontend`**: Pure UI tier powered by Next.js 14, Tailwind CSS, Framer Motion, and Zustand (Proxy rewrite mapped to PORT 5000).
- **`/backend`**: Express + Node.js + TS Server linking to Prisma repositories controllers.
- **`/database`**: Database schema declarations and seed scripts.
- **`/docker`**: Setup specifications for container compilation.

---

## 🏃 Local Setup & Run Triggers

### 1. Database Setup
Ensure SQLite is initialized:
```bash
cd backend
npm run db:push
npm run db:seed
```

### 2. Run Backend
```bash
cd backend
npm run dev
# Starts on port 5000
```

### 3. Run Frontend
```bash
cd frontend
npm run dev
# Starts on port 3000
```

---

## 🐳 Docker Setup
Launch both services and databases:
```bash
docker-compose up --build
```
- Frontend client: http://localhost:3000
- Backend endpoints: http://localhost:5000/api
