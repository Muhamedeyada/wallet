# Wallet App — Full Project Explainer

> Explained simply, like you're 10 years old. Then the deep technical stuff follows.

---

## The Big Picture (Like You're 10)

Imagine you have a **piggy bank**. Every time your mom gives you money, you put a note in it that says "Got $5 from mom." Every time you spend money on candy, you put a note that says "Spent $2 on candy." At the end of the day, the piggy bank counts all your notes and tells you: **you have $3 left.**

This app is that piggy bank — but on your phone. You can:
- Log money you **received** (income)
- Log money you **spent** (expense)
- See your **balance** anytime
- Delete old notes if you made a mistake

There are two parts to this app:
- **The Phone App (mobile)** — what you see and tap on your screen
- **The Brain (backend)** — a computer on the internet that stores all your notes safely

---

## How the Two Parts Talk

```
Your Phone App  ──── internet ────▶  Backend Server
      │                                    │
   (React Native)                  (Express + PostgreSQL)
      │                                    │
   Shows you                       Saves/reads your
   your data                       transactions in a database
```

When you open the app, your phone asks the server: *"Hey, give me all my transactions."*
The server looks in the database and replies: *"Here they are!"*

---

## Part 1: The Backend (The Brain)

The backend lives at `D:\Projects\wallet\backend\src\`.

### File Map

```
backend/src/
├── server.js              ← The front door of the building
├── config/
│   ├── db.js              ← The filing cabinet (database connection)
│   ├── upstash.js         ← The bouncer (rate limiter setup)
│   └── cron.js            ← The alarm clock (keep-alive job)
├── middleware/
│   └── rateLimiter.js     ← The bouncer's logic
├── routes/
│   └── transactionsRoute.js  ← The menu of things you can ask for
└── controllers/
    └── transactionsController.js  ← The chef who actually makes the food
```

---

### `server.js` — The Front Door

Think of this as the main entrance to a restaurant. When someone walks in, they are greeted, the staff is prepared, and the kitchen is open.

```
App Starts
    │
    ├── Connect to database (db.js)
    ├── Turn on rate limiter (bouncer is ready)
    ├── Start cron job (alarm clock ticking)
    └── Listen on port 5001 for requests
```

Every request that comes in goes through:
1. **CORS check** — "Are you allowed to enter this restaurant?" (prevents random websites from calling the API)
2. **Rate limiter** — "Have you been here too many times today?" (stops spammers)
3. **Route handler** — "What do you want to order?"

**Key line:** `app.use("/api/transactions", transactionRouter)` — all transaction requests go to the transaction menu.

---

### `config/db.js` — The Filing Cabinet

This file connects to **Neon** (a PostgreSQL database in the cloud) and creates the `transactions` table if it doesn't exist yet.

**The table looks like this:**

| Column | Type | What it stores |
|---|---|---|
| `id` | Number (auto) | Unique ID for each row |
| `user_id` | Text | Clerk user ID (who owns this transaction) |
| `title` | Text | Name of the transaction ("Grocery shopping") |
| `amount` | Decimal | Positive = income, Negative = expense |
| `category` | Text | "Food & Drinks", "Bills", etc. |
| `created_at` | Date | When it was added (defaults to today) |

**Child-friendly:** The database is like a giant spreadsheet saved in the cloud. Each row is one transaction. The `user_id` column is like putting your name on your row so nobody else can see your private data.

**Why `amount` is negative for expenses:** Instead of storing a "type" column, the app just uses math. If you spent $10, the amount is `-10`. If you earned $50, the amount is `+50`. Then the balance is just: add them all up.

---

### `config/upstash.js` — The Bouncer's Rulebook

This sets up **rate limiting** using Upstash Redis (a fast in-memory store).

**The rule:** Each user can make a maximum of **100 requests per 60 seconds**.

**Why this matters:** Without this, someone could write a script that sends 10,000 requests per second and crash the server. The bouncer counts how many times each person has knocked on the door and says "Slow down!" if they knock too fast.

**Algorithm used:** Sliding Window — a moving time window that counts recent requests. More accurate than a fixed window because it doesn't reset all at once.

---

### `config/cron.js` — The Alarm Clock

The backend is deployed on **Render's free tier**. Free tier servers go to sleep after 15 minutes of inactivity (to save money).

This cron job runs every **14 minutes** and pings the server's own health endpoint (`GET /api/health`), keeping it awake.

**Child-friendly:** Imagine you fall asleep if nobody talks to you for 15 minutes. Your friend sets a timer to say "Hey!" every 14 minutes so you stay awake. That's what this file does.

---

### `middleware/rateLimiter.js` — The Bouncer's Logic

```
Request comes in
    │
    ▼
Check Upstash Redis: has this IP made too many requests?
    │
    ├── YES → return 429 "Too Many Requests"
    └── NO  → call next() → let the request continue
```

---

### `routes/transactionsRoute.js` — The Menu

This is the list of things the API can do. Like a restaurant menu.

| HTTP Method | URL Pattern | What it does |
|---|---|---|
| `GET` | `/api/transactions/:userId` | Get all transactions for a user |
| `POST` | `/api/transactions/` | Create a new transaction |
| `DELETE` | `/api/transactions/:id` | Delete a transaction by ID |
| `GET` | `/api/transactions/summary/:userId` | Get balance, income, expenses totals |

Each menu item points to a **controller function** (the chef who prepares the dish).

---

### `controllers/transactionsController.js` — The Chef

This is where the real logic lives. Four functions:

---

#### `getTransactionsByUserId`

```
Phone asks: "Give me all transactions for user abc123"
    │
    ▼
SQL: SELECT * FROM transactions WHERE user_id = 'abc123' ORDER BY created_at DESC
    │
    ▼
Returns: JSON array of all transactions, newest first
```

---

#### `createTransaction`

```
Phone sends: { user_id, title, amount, category }
    │
    ▼
Validate: Are all fields present? Is amount a number?
    │
    ├── Missing fields → return 400 "Bad Request"
    └── Valid → INSERT INTO transactions ... RETURNING *
                    │
                    ▼
               Returns the new transaction with its auto-generated ID
```

**Key detail:** The mobile app sends a signed amount (already negative for expenses). The controller trusts this value.

---

#### `deleteTransaction`

```
Phone asks: "Delete transaction with id 42"
    │
    ▼
Validate: Is "42" a valid integer? (prevents SQL injection via isNaN check)
    │
    ├── Invalid → return 400
    └── Valid → DELETE FROM transactions WHERE id = 42 RETURNING *
                    │
                    ├── Nothing deleted → 404 "Not Found"
                    └── Deleted → 200 with deleted transaction data
```

---

#### `getSummaryByUserId`

```
Phone asks: "What's the total balance for user abc123?"
    │
    ▼
SQL runs 3 aggregations in one query:
    ├── SUM(amount)                          → balance (all transactions)
    ├── SUM(amount) WHERE amount > 0         → income (positive only)
    └── SUM(ABS(amount)) WHERE amount < 0   → expenses (negative, made positive)
    │
    ▼
Returns: { balance: 150.00, income: 200.00, expenses: 50.00 }
```

**Why COALESCE?** If a user has zero transactions, `SUM()` returns `NULL`. `COALESCE(SUM(...), 0)` converts that `NULL` to `0` so the app doesn't crash.

---

## Part 2: The Mobile App (What You See)

The mobile app lives at `D:\Projects\wallet\mobile\app\`.

### Navigation Map (How Screens Connect)

```
App Opens
    │
    ▼
_layout.jsx (Root)
├── ClerkProvider wraps everything
│
├── (auth)/   ← unauthenticated users land here
│   ├── sign-in.jsx
│   └── sign-up.jsx  (+ email verification step)
│
└── (root)/   ← authenticated users land here
    ├── index.jsx   (Home Screen)
    └── create.jsx  (Add Transaction Screen)
```

**Redirect Logic:**
- If you're signed in and try to open `/sign-in`, you're sent to `/` (home)
- If you're NOT signed in and try to open `/`, you're sent to `/sign-in`

This is handled in the `_layout.jsx` files using Clerk's `useAuth()` hook.

---

### Authentication with Clerk

Clerk is a third-party service that handles login/signup so the app doesn't have to store passwords.

**Sign In flow:**
```
User types email + password
    │
    ▼
Clerk.signIn.create({ identifier, password })
    │
    ├── Success → setActive({ session }) → navigate to home
    └── Failure → show error message
```

**Sign Up flow:**
```
User types email + password
    │
    ▼
Clerk.signUp.create({ emailAddress, password })
    │
    ▼
Clerk sends 6-digit code to email
    │
    ▼
User types code → signUp.attemptEmailAddressVerification({ code })
    │
    ├── Success → setActive({ session }) → navigate to home
    └── Failure → show error message
```

---

### `useTransactions.js` — The Data Manager Hook

This custom React hook is the heart of data management in the app.

```javascript
const {
  transactions,  // array of all transactions
  summary,       // { balance, income, expenses }
  isLoading,     // true while fetching
  loadData,      // call this to refresh everything
  deleteTransaction  // call this with an ID to delete
} = useTransactions(userId);
```

**How loadData works:**
```
loadData() called
    │
    ▼
Promise.all([fetchTransactions(), fetchSummary()])
    │         ← both API calls run at the SAME TIME (parallel)
    ▼
Both resolve → update state → component re-renders
```

Running both calls in parallel (using `Promise.all`) is faster than running them one after the other.

---

### Home Screen (`index.jsx`)

The home screen is the main dashboard. Here's its render structure:

```
<ScrollView>
  ├── Header
  │   ├── Logo
  │   ├── Welcome message (uses email prefix as name)
  │   ├── "Add" button → navigate to /create
  │   └── SignOutButton
  │
  ├── BalanceCard
  │   ├── Total Balance (big number)
  │   ├── Income (green)
  │   └── Expenses (red)
  │
  └── FlatList of TransactionItems
      ├── Icon (based on category)
      ├── Title + Category
      ├── Amount (+green / -red)
      ├── Date
      └── Delete button (trash icon)
```

Pull-to-refresh is implemented with React Native's `RefreshControl` component:
```
User pulls down
    │
    ▼
onRefresh() called → setRefreshing(true) → loadData() → setRefreshing(false)
```

---

### Create Transaction Screen (`create.jsx`)

```
User fills out form:
    ├── Toggle: Expense / Income
    ├── Amount input (numeric, starts at "0")
    ├── Title input ("Coffee", "Salary", etc.)
    └── Category selector (7 options in a grid)

User presses Save
    │
    ▼
handleCreate():
    ├── Validate: title not empty, amount > 0, category selected
    └── Build payload:
        {
          user_id: userId,
          title: title,
          amount: isExpense ? -Math.abs(amount) : Math.abs(amount),
          category: selectedCategory
        }
        │
        ▼
    POST /api/transactions
        │
        ├── Success → Alert + navigate back to home
        └── Error   → Alert with error message
```

**The sign logic:** `isExpense ? -Math.abs(amount) : Math.abs(amount)` ensures:
- Expenses are always negative regardless of what the user typed
- Income is always positive

---

### Colors & Theming

All colors come from `constants/colors.js`. The active theme is **Coffee**:

| Token | Color | Use |
|---|---|---|
| `primary` | `#8B593E` brown | Buttons, active states |
| `background` | `#FFF8F3` cream | Screen backgrounds |
| `text` | `#4A3428` dark brown | Main text |
| `expense` | `#E74C3C` red | Expense amounts |
| `income` | `#2ECC71` green | Income amounts |
| `card` | `#FFFFFF` white | Card backgrounds |

Switching themes is as easy as changing one line in `colors.js`:
```javascript
const COLORS = THEMES.coffee; // ← change to .forest, .purple, or .ocean
```

---

## Full Request Lifecycle (End to End)

Here's what happens when you tap "Save" on a new expense:

```
1. User taps "Save" on create.jsx
2. handleCreate() validates input
3. fetch("https://wallet-api-cxqp.onrender.com/api/transactions", { method: "POST", body: {...} })
4. Request hits Render server
5. rateLimiter.js checks Upstash Redis → allowed
6. Express routes to transactionsController.createTransaction()
7. Controller validates fields
8. SQL: INSERT INTO transactions (user_id, title, amount, category) VALUES (...) RETURNING *
9. Neon PostgreSQL executes query, returns new row
10. Controller sends 201 response with new transaction JSON
11. Mobile app receives response
12. Alert: "Transaction added!"
13. router.back() → returns to home screen
14. useEffect on home triggers loadData()
15. Two parallel API calls: GET transactions + GET summary
16. State updates → FlatList re-renders with new transaction
17. BalanceCard re-renders with updated balance
```

---

## Technology Choices Explained

| Technology | Why it was chosen |
|---|---|
| **Neon PostgreSQL** | Free serverless Postgres — no server to manage, scales to zero |
| **Upstash Redis** | Serverless Redis — free tier, perfect for rate limiting |
| **Clerk** | Handles auth so we don't store passwords or manage JWTs ourselves |
| **Expo** | Build React Native apps without Xcode/Android Studio complexity |
| **Expo Router** | File-based routing (like Next.js) — screens map to file paths |
| **node-cron** | Keeps the Render free tier server awake |

---

## Environment Variables

### Backend (`/backend/.env`)
```
PORT=5001
NODE_ENV=development
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
DATABASE_URL=postgresql://...neon.tech/...
REDIS_URL=https://...upstash.io
API_URL=https://wallet-api-cxqp.onrender.com
```

### Mobile (`/mobile/.env`)
```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

---

## Running Locally

```bash
# Backend
cd backend
npm install
npm run dev        # starts on http://localhost:5001

# Mobile (in a new terminal)
cd mobile
npm install
npx expo start     # scan QR with Expo Go app
```

Switch the mobile API base URL in `mobile/constants/api.js`:
```javascript
// For local development:
export const API_URL = "http://localhost:5001/api";

// For production:
export const API_URL = "https://wallet-api-cxqp.onrender.com/api";
```
