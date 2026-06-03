# Money Tracker - Budget Keeper
### Personal Expenses Tracking System
**Language:** JavaScript (React Native + Expo)
**Database:** Firebase (Firestore + Authentication)

---

## Tools You Need to Install

1. **VS Code** → https://code.visualstudio.com (free, recommended)
2. **Node.js** → https://nodejs.org (download LTS version)
3. **Expo Go** on your phone → Already installed ✅

---

## Step-by-Step Setup

### Step 1: Set Up Firebase (do this first)

1. Go to https://console.firebase.google.com
2. Click **"Add Project"** → name it "MoneyTracker" → Continue
3. Disable Google Analytics (not needed) → Create project
4. Click **"</> Web"** icon to add a web app → name it "MoneyTracker" → Register app
5. **Copy** the `firebaseConfig` object shown — you'll need it in Step 3
6. In the left sidebar → **Build → Authentication** → Get started → Email/Password → Enable → Save
7. In the left sidebar → **Build → Firestore Database** → Create database → Start in **test mode** → Next → Enable

### Step 2: Install the Project

Open VS Code → Open Terminal (Ctrl + `)

```bash
# Navigate to the MoneyTracker folder
cd path/to/MoneyTracker

# Install all dependencies
npm install
```

### Step 3: Add Your Firebase Config

Open `firebase.js` and replace the placeholder values with your actual Firebase config:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",           // your actual key
  authDomain: "moneytracker-xxxx.firebaseapp.com",
  projectId: "moneytracker-xxxx",
  storageBucket: "moneytracker-xxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### Step 4: Run the App

```bash
npx expo start
```

A **QR code** will appear in the terminal.
Open **Expo Go** on your phone → Scan the QR code → App loads!

---

## App Features (following the flowchart)

| Screen | Function |
|--------|----------|
| Login | Existing users sign in with email/password |
| Register | New users create an account (auto-creates default categories) |
| Main Menu | Hub with balance overview + all 5 options |
| Add Income | Enter income amount, description, category, date → saved to Firebase |
| Add Expense | Enter expense amount, description, category, date → saved to Firebase |
| View Transactions | Display all transactions, filter by type, delete transactions |
| View Summary | Total income, total expenses, remaining balance, category breakdown |
| Manage Categories | Add / Edit / Delete custom categories |
| Logout | Signs out and saves all data to Firebase |

---

## Firebase Data Structure

```
users/
  {userId}/
    transactions/
      {transactionId}: { type, amount, description, category, date, createdAt }
    categories/
      {categoryId}: { name, icon, type, createdAt }
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `npm install` fails | Make sure Node.js is installed: `node -v` |
| Firebase error | Double-check your config values in firebase.js |
| App won't load on phone | Make sure phone and PC are on the same WiFi |
| "Permission denied" Firestore | Firestore must be in test mode (see Step 1) |

---

## VS Code Extensions (recommended)

- **ES7+ React/Redux/React-Native snippets** — shortcuts for React code
- **Prettier** — auto-formats your code
- **React Native Tools** — debugging support
