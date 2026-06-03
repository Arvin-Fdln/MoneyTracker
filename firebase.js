// firebase.js
// ─────────────────────────────────────────────────────────────
// SETUP INSTRUCTIONS:
// 1. Go to https://console.firebase.google.com
// 2. Create a new project (e.g., "MoneyTracker")
// 3. Add a Web App to your project
// 4. Copy your config values below
// 5. In Firebase Console → Build → Authentication → Sign-in method → Enable "Email/Password"
// 6. In Firebase Console → Build → Firestore Database → Create database (start in test mode)
// ─────────────────────────────────────────────────────────────

import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// TODO: Replace with YOUR Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyBymt2JSoPTEXhSlTfWNs7w5w2ESO80NQE",
  authDomain: "moneytracker-d76d9.firebaseapp.com",
  projectId: "moneytracker-d76d9",
  storageBucket: "moneytracker-d76d9.firebasestorage.app",
  messagingSenderId: "963827661450",
  appId: "1:963827661450:web:9bbce407daea0ae383cb73"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
