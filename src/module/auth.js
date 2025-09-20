// ✅ Import Firebase app config from correct folder (config/firebase.js)
import { app } from '../config/firebase.js';

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

console.log("✅ auth.js loaded successfully");

// Initialize Firebase Auth
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Wait until DOM is fully loaded before attaching event listeners
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM fully loaded - setting up auth event listeners");

  const signInButton = document.getElementById("google-signin");
  const logoutButton = document.getElementById("logout");

  if (!signInButton) {
    console.error("❌ google-signin button not found in DOM");
    return;
  }

  // Sign in with Google
  signInButton.addEventListener("click", () => {
    console.log("🔘 Sign-in button clicked");
    signInWithPopup(auth, provider)
      .then(result => {
        console.log("✅ Signed in as:", result.user.displayName, result.user.email);
        signInButton.style.display = "none";
        logoutButton.style.display = "block";
      })
      .catch(error => {
        console.error("❌ Sign-in error:", error.code, error.message);
        alert(`Sign-in failed: ${error.message}`); // Visible feedback for users
      });
  });

  // Log out
  logoutButton.addEventListener("click", () => {
    console.log("🔘 Logout button clicked");
    signOut(auth)
      .then(() => {
        console.log("✅ Signed out");
        signInButton.style.display = "block";
        logoutButton.style.display = "none";
      })
      .catch(error => console.error("❌ Sign-out error:", error.message));
  });

  // Detect login state changes
  onAuthStateChanged(auth, user => {
    console.log("👀 Auth state changed:", user ? user.email : "No user signed in");
    if (user) {
      signInButton.style.display = "none";
      logoutButton.style.display = "block";
    } else {
      signInButton.style.display = "block";
      logoutButton.style.display = "none";
    }
  });
});