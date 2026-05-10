<h1 align="center">Wallet — Mobile Expense Tracker</h1>

<p align="center">
  Full-stack mobile app to track income & expenses, built with React Native, Express, PostgreSQL, and Clerk auth.
</p>

![Demo App](/mobile/assets/images/screenshot-for-readme.png)

---

## Features

- **Authentication** — email/password signup with 6-digit email verification (Clerk)
- **Home Dashboard** — live balance, income, and expense totals
- **Add Transactions** — log income or expense with category, amount, and title
- **Delete Transactions** — remove any entry, balance updates instantly
- **Pull to Refresh** — swipe down on the home screen to reload data
- **Rate Limited API** — 100 requests / 60 seconds per client via Upstash Redis
- **Coffee Theme** — warm brown/cream color palette (4 themes available)

---

## Stack

| Layer | Technology |
|---|---|
| Mobile | React Native 0.79 + Expo 53 |
| Navigation | Expo Router (file-based) |
| Auth | Clerk for Expo |
| Backend | Express.js 4 |
| Database | Neon (serverless PostgreSQL) |
| Rate Limiting | Upstash Redis |
| Hosting | Render (backend) |

---

## Project Structure

```
wallet/
├── backend/
│   └── src/
│       ├── server.js                    ← Express entry point
│       ├── config/
│       │   ├── db.js                    ← Neon PostgreSQL connection + schema
│       │   ├── upstash.js               ← Redis rate limiter setup
│       │   └── cron.js                  ← Keep-alive ping (every 14 min)
│       ├── middleware/
│       │   └── rateLimiter.js           ← 100 req/60s sliding window
│       ├── routes/
│       │   └── transactionsRoute.js     ← API route definitions
│       └── controllers/
│           └── transactionsController.js ← DB queries & business logic
│
└── mobile/
    ├── app/
    │   ├── _layout.jsx                  ← Root layout (ClerkProvider)
    │   ├── (auth)/                      ← Unauthenticated screens
    │   │   ├── sign-in.jsx
    │   │   └── sign-up.jsx
    │   └── (root)/                      ← Protected screens
    │       ├── index.jsx                ← Home (balance + transaction list)
    │       └── create.jsx               ← Add transaction form
    ├── components/                      ← BalanceCard, TransactionItem, etc.
    ├── hooks/
    │   └── useTransactions.js           ← Data fetching + delete logic
    └── constants/
        ├── colors.js                    ← Theme definitions
        └── api.js                       ← Base API URL
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/transactions/:userId` | All transactions for a user |
| `POST` | `/api/transactions` | Create a transaction |
| `DELETE` | `/api/transactions/:id` | Delete a transaction |
| `GET` | `/api/transactions/summary/:userId` | Balance, income, expenses totals |

---

## Setup

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Accounts on [Clerk](https://clerk.dev), [Neon](https://neon.tech), [Upstash](https://upstash.com)

### Backend

Create `backend/.env`:

```bash
PORT=5001
NODE_ENV=development
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
DATABASE_URL=postgresql://...neon.tech/...
REDIS_URL=https://...upstash.io
API_URL=https://your-render-url.onrender.com
```

```bash
cd backend
npm install
npm run dev
```

### Mobile

Create `mobile/.env`:

```bash
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

Switch the API URL in `mobile/constants/api.js` for local dev:

```javascript
export const API_URL = "http://localhost:5001/api"; // local
// export const API_URL = "https://wallet-api-cxqp.onrender.com/api"; // production
```

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with the **Expo Go** app on your phone.

---

## How It Works

For a detailed breakdown of every file, the full data flow, and child-friendly explanations of each concept, see [EXPLAINER.md](./EXPLAINER.md).

---

## Database Schema

```sql
CREATE TABLE IF NOT EXISTS transactions (
  id         SERIAL PRIMARY KEY,
  user_id    VARCHAR(255) NOT NULL,
  title      VARCHAR(255) NOT NULL,
  amount     DECIMAL(10, 2) NOT NULL,  -- positive=income, negative=expense
  category   VARCHAR(255) NOT NULL,
  created_at DATE DEFAULT CURRENT_DATE
);
```
