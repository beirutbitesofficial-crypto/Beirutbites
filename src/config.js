// Site configuration. See README.md.
export const WHATSAPP_NUMBER = "46790499644";
export const REWARD_TARGET = 500; // points needed for a free dish
export const TIMEZONE = "Europe/Stockholm";

// true  = customers must log in before sending an order
// false = guests can order too (logged-in customers still collect points)
export const REQUIRE_LOGIN_FOR_CHECKOUT = true;

// Accounts that may open the admin panel.
// Keep this list in sync with isAdmin() in firestore.rules.
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
