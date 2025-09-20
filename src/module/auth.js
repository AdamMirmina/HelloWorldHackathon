import { app } from './firebase.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } 
  from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Google Sign In
document.getElementById("google-signin").addEventListener("click", () => {
  signInWithPopup(auth, provider)
    .then(result => console.log("✅ Signed in as:", result.user.displayName))
    .catch(error => console.error("❌ Login error:", error.message));
});

// Logout
document.getElementById("logout").addEventListener("click", () => {
  signOut(auth).then(() => console.log("✅ Logged out"));
});

// Track auth state
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User is logged in:", user.email);
    document.getElementById("logout").style.display = "block";
  } else {
    console.log("No user signed in");
    document.getElementById("logout").style.display = "none";
  }
});