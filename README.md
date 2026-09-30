# Cross-Platform Vape Shop E-Commerce System

Ionic Vue frontend + Node.js/Express backend + PostgreSQL.

---

## Project Structure

```
E-CommerceVapeShop/
├── backend/
│   ├── server.js
│   ├── .env                  ← your DB password & JWT secret
│   ├── .env.example
│   ├── package.json
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── userModel.js
│   │   ├── productModel.js
│   │   └── orderModel.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   └── orderController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   └── orderRoutes.js
│   └── middleware/
│       └── authMiddleware.js
├── database/
│   ├── schema.sql
│   └── seed.sql
├── src/
│   ├── pages/
│   │   ├── Login.vue
│   │   ├── Register.vue
│   │   ├── Home.vue
│   │   ├── ProductDetails.vue
│   │   ├── Cart.vue
│   │   ├── Checkout.vue
│   │   └── Orders.vue
│   ├── components/
│   │   ├── ProductCard.vue
│   │   ├── Navbar.vue
│   │   └── CartItem.vue
│   ├── services/
│   │   └── api.js
│   ├── router/
│   │   └── index.js
│   ├── theme/
│   │   └── variables.css
│   ├── App.vue
│   └── main.js
├── index.html
├── package.json
├── vite.config.js
└── ionic.config.json
```

---

## 1. Database Setup (PostgreSQL)

### Create the database

Open **psql** or **pgAdmin**, then run:

```sql
CREATE DATABASE vape_shop;
```

### Run the schema

**Option A – psql (command line):**

```bash
psql -U postgres -d vape_shop -f database/schema.sql
psql -U postgres -d vape_shop -f database/seed.sql
```

**Option B – pgAdmin:**

1. Connect to PostgreSQL
2. Open Query Tool on database `vape_shop`
3. Paste and run contents of `database/schema.sql`
4. Paste and run contents of `database/seed.sql`

---

## 2. Backend Setup

```bash
cd backend
```

### Configure environment

Copy `.env.example` to `.env` (already created) and edit your password:

```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_actual_password
DB_NAME=vape_shop
JWT_SECRET=vape_shop_secret_key_12345
```

### Install & run

```bash
npm install
node server.js
```

You should see:

```
Connected to PostgreSQL database
Server running on http://localhost:3000
```

Test in browser: [http://localhost:3000](http://localhost:3000) → `{ "message": "Vape Shop API is running!" }`

---

## 3. Frontend Setup

Open a **new terminal** at the project root:

```bash
cd E-CommerceVapeShop
npm install
npm run dev
```

Or with Ionic CLI (if installed globally):

```bash
npm install -g @ionic/cli
ionic serve
```

App opens at: [http://localhost:8100](http://localhost:8100)

---

## 4. How Frontend Connects to Backend

In `src/services/api.js`:

```js
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});
```

JWT is stored in `localStorage` and attached automatically:

```js
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

Cart is also stored in `localStorage` (no backend needed until checkout).

### Example API calls

| Action        | Method | URL                         |
|---------------|--------|-----------------------------|
| Register      | POST   | `/api/auth/register`        |
| Login         | POST   | `/api/auth/login`           |
| All products  | GET    | `/api/products`             |
| One product   | GET    | `/api/products/:id`         |
| Create order  | POST   | `/api/orders` (JWT required)|
| User orders   | GET    | `/api/orders/user/:id` (JWT)|

**Register body:**

```json
{ "name": "Juan", "email": "juan@email.com", "password": "secret123" }
```

**Login body:**

```json
{ "email": "juan@email.com", "password": "secret123" }
```

**Create order body:**

```json
{
  "total": 998,
  "items": [
    { "product_id": 1, "quantity": 2, "price": 499 }
  ]
}
```

---

## 5. App Flow

1. **Register / Login** → JWT saved to `localStorage`
2. **Home** → fetch products from API
3. **Product Details** → add to cart (`localStorage`)
4. **Cart** → adjust quantities
5. **Checkout** → send order to backend (requires login)
6. **Orders** → view past orders for the logged-in user

---

## 6. Requirements

- Node.js 18+
- PostgreSQL 14+
- npm

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Error connecting to PostgreSQL` | Check `.env` password, ensure PostgreSQL is running, DB `vape_shop` exists |
| Frontend can't load products | Backend must be running on port 3000 |
| `401 Unauthorized` on orders | Log in again; token may be missing/expired |
| `Email already registered` | Use a different email or log in |

---

## 7. Mobile (Capacitor) + GitHub Actions

Native projects live in `android/` and `ios/`.

```bash
npm install
npm run build:mobile    # vite build + cap sync
```

**Local**
- Android Studio: `npm run cap:android`
- Xcode (macOS): `npm run cap:ios`

**API URL for devices**

Set `VITE_API_URL` (see `.env.example`), e.g. your deployed API:
`VITE_API_URL=https://your-api.example.com/api`

Android emulator can use `http://10.0.2.2:3000/api` to reach a host machine backend.

**CI**

- `.github/workflows/android.yml` → builds and uploads a **debug APK**
- `.github/workflows/ios.yml` → builds an **iOS Simulator** `.app` (no App Store signing)

Optional repo variable: `VITE_API_URL` (Settings → Variables).
