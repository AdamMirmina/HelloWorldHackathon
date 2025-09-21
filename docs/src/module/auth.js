// docs/src/module/auth.js

import { app } from "../config/firebase.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// ✅ Initialize Firebase Auth
const auth = getAuth(app);

// ✅ Export so other modules (like nav.js) can import it
export { auth };

// --- DOM Elements ---
const signupBtn = document.getElementById("signup");
const loginBtn = document.getElementById("login");
const logoutBtn = document.getElementById("logout");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const currentUserDisplay = document.getElementById("current-user");

// --- Sign Up ---
if (signupBtn) {
  signupBtn.addEventListener("click", async () => {
    try {
      await createUserWithEmailAndPassword(
        auth,
        emailInput.value,
        passwordInput.value
      );
      alert("✅ Account created! You are now signed in.");
    } catch (error) {
      alert("❌ Sign-up failed: " + error.message);
      console.error(error);
    }
  });
}

// --- Log In ---
if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    console.log("here!");
    try {
      const status = await validatePassword(getAuth(), passwordFromUser);
      if (!status.isValid) {
        alert("Invalid Password!");
      } else {
        await signInWithEmailAndPassword(
          auth,
          emailInput.value,
          passwordInput.value
        );
        alert("✅ Logged in successfully!");
      }
    } catch (error) {
      alert("❌ Login failed: " + error.message);
      console.error(error);
    }
  });
}

// --- Log Out ---
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      alert("👋 Logged out successfully.");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  });
}

// --- Update UI on Auth State Change ---
onAuthStateChanged(auth, (user) => {
  if (user && currentUserDisplay) {
    currentUserDisplay.textContent = `Logged in as: ${user.email}`;
    logoutBtn.style.display = "inline-block";
  } else if (currentUserDisplay) {
    currentUserDisplay.textContent = "";
    if (logoutBtn) logoutBtn.style.display = "none";
  }
});
