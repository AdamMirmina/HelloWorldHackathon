import { app } from './firebase.js';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

console.log("✅ auth.js loaded successfully");

// Sign in with Google
document.getElementById("google-signin").addEventListener("click", () => {
  signInWithPopup(auth, provider)
    .then(result => {
      console.log("✅ Signed in as:", result.user.displayName, result.user.email);
      document.getElementById("google-signin").style.display = "none";
      document.getElementById("logout").style.display = "block";
    })
    .catch(error => console.error("❌ Sign-in error:", error.message));
});

// Log out
document.getElementById("logout").addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      console.log("✅ Signed out");
      document.getElementById("google-signin").style.display = "block";
      document.getElementById("logout").style.display = "none";
    })
    .catch(error => console.error("❌ Sign-out error:", error.message));
});

// Detect login state on page load
onAuthStateChanged(auth, user => {
  if (user) {
    console.log("🔑 Logged in as:", user.email);
    document.getElementById("google-signin").style.display = "none";
    document.getElementById("logout").style.display = "block";
  } else {
    console.log("No user signed in");
    document.getElementById("google-signin").style.display = "block";
    document.getElementById("logout").style.display = "none";
  }
});