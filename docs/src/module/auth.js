// src/module/auth.js

// ✅ Import Firebase app from config
import { db } from "../config/firebase.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

console.log("✅ auth.js loaded successfully");

// Initialize Firebase Auth
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM fully loaded - setting up email/password auth");

  const emailField = document.getElementById("email");
  const passwordField = document.getElementById("password");
  const signupBtn = document.getElementById("signup");
  const loginBtn = document.getElementById("login");
  const logoutBtn = document.getElementById("logout");
  const currentUserDisplay = document.getElementById("current-user");

  // 🔑 Sign up new user
  signupBtn.addEventListener("click", () => {
    const email = emailField.value;
    const password = passwordField.value;

    createUserWithEmailAndPassword(auth, email, password)
      .then(userCredential => {
        console.log("✅ User signed up:", userCredential.user.email);
        alert("Account created successfully!");
      })
      .catch(error => {
        console.error("❌ Signup error:", error.message);
        alert(`Signup failed: ${error.message}`);
      });
  });

  // 🔑 Log in existing user
  loginBtn.addEventListener("click", () => {
    const email = emailField.value;
    const password = passwordField.value;

    signInWithEmailAndPassword(auth, email, password)
      .then(userCredential => {
        console.log("✅ User logged in:", userCredential.user.email);
      })
      .catch(error => {
        console.error("❌ Login error:", error.message);
        alert(`Login failed: ${error.message}`);
      });
  });

  // 🔑 Log out
  logoutBtn.addEventListener("click", () => {
    signOut(auth)
      .then(() => {
        console.log("✅ User signed out");
      })
      .catch(error => console.error("❌ Logout error:", error.message));
  });

  // 🔄 Detect login state changes
  onAuthStateChanged(auth, user => {
    if (user) {
      console.log("🔑 Logged in as:", user.email);
      logoutBtn.style.display = "block";
      currentUserDisplay.textContent = `Logged in as: ${user.email}`;
    } else {
      console.log("No user logged in");
      logoutBtn.style.display = "none";
      currentUserDisplay.textContent = "";
    }
  });
});