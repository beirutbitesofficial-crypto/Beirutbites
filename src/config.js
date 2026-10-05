// Site configuration. See README.md.
export const WHATSAPP_NUMBER = "46790499644";
export const REWARD_TARGET = 500; // points needed for a free dish
export const TIMEZONE = "Europe/Stockholm";

// true  = customers must log in before sending an order
// false = guests can order too (logged-in customers still collect points)
export const REQUIRE_LOGIN_FOR_CHECKOUT = true;

// Admin panel login: a 4-digit PIN.
// Behind the scenes the PIN signs in to one Firebase account (ADMIN_LOGIN_EMAIL)
// whose password is ADMIN_PIN_PREFIX + PIN, e.g. PIN 1234 → password "bb-1234".
// Create that account once in Firebase Console (see README). Keep in sync with firestore.rules.
export const ADMIN_LOGIN_EMAIL = "admin@beirutbites.shop";
export const ADMIN_PIN_PREFIX = "bb-";
export const adminPassword = (pin) => `${ADMIN_PIN_PREFIX}${pin}`;

// Backup: these Google accounts (verified e-mail) are also treated as admins by the database rules.
export const ADMIN_EMAILS = ["beirut.bites.official@gmail.com"];

// Firebase web config (these keys are public by design; security comes from firestore.rules).
export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCwOIl0nScQQmnPThxuAEBEkEqr28kDHms",
  authDomain: "beirut-bites-fa6a0.firebaseapp.com",
  projectId: "beirut-bites-fa6a0",
  storageBucket: "beirut-bites-fa6a0.firebasestorage.app",
  messagingSenderId: "18087130501",
  appId: "1:18087130501:web:dc0b4886ee4131b6ed40ec"
};
