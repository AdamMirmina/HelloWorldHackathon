// docs/src/module/auth.js
import { app } from "../config/firebase.js";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  inMemoryPersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

/* ------------------ Auth Init + Persistence ------------------ */
const auth = getAuth(app);

// Try for durable sign-in; gracefully fall back if the browser blocks it
async function ensurePersistence() {
  try {
    await setPersistence(auth, browserLocalPersistence);      // survives reloads
  } catch {
    try {
      await setPersistence(auth, browserSessionPersistence);  // survives tab
    } catch {
      await setPersistence(auth, inMemoryPersistence);        // last resort
      console.warn("Using in-memory auth (private mode or storage blocked).");
    }
  }
}
ensurePersistence();

/* ------------------ Exports ------------------ */
export { auth };

/* ------------------ DOM ------------------ */
const $ = (id) => document.getElementById(id);
const signupBtn  = $("signup");
const loginBtn   = $("login");
const logoutBtn  = $("logout");
const emailInput = $("email");
const passInput  = $("password");
const currentUserDisplay = $("current-user");

/* ------------------ Helpers ------------------ */
function normEmail(raw) {
  return (raw || "").trim().toLowerCase();
}

// We *disallow* leading/trailing spaces to prevent “created with a space, can’t log in later”
function getPasswordOrWarn() {
  const pwd = (passInput?.value ?? "");
  if (/^\s|\s$/.test(pwd)) {
    alert("Your password has a space at the beginning or end. Please remove it.");
    throw new Error("password-has-edge-space");
  }
  if (pwd.length < 6) {
    alert("Password must be at least 6 characters.");
    throw new Error("password-too-short");
  }
  return pwd;
}

function showAuthError(err, context) {
  // Map common Firebase v11 errors to helpful messages
  const code = err?.code || "";
  const messages = {
    "auth/invalid-credential": "Email or password is incorrect.",
    "auth/wrong-password": "Email or password is incorrect.",
    "auth/user-not-found": "No account with that email.",
    "auth/too-many-requests": "Too many attempts. Try again in a minute or reset your password.",
    "auth/email-already-in-use": "That email is already registered. Try logging in instead.",
    "auth/invalid-email": "That email address looks invalid.",
    "password-has-edge-space": "Password has spaces at the edges.",
    "password-too-short": "Password must be at least 6 characters.",
  };
  const msg = messages[code] || `Unexpected error during ${context}.`;
  alert(`❌ ${msg}`);
  console.error(`[${context}]`, code, err);
}

/* ------------------ Sign Up ------------------ */
if (signupBtn) {
  signupBtn.addEventListener("click", async (e) => {
    e.preventDefault?.();
    try {
      const email = normEmail(emailInput?.value);
      const password = getPasswordOrWarn();
      await createUserWithEmailAndPassword(auth, email, password);
      alert("✅ Account created! You are now signed in.");
    } catch (err) {
      showAuthError(err, "sign-up");
    }
  });
}

/* ------------------ Log In ------------------ */
if (loginBtn) {
  loginBtn.addEventListener("click", async (e) => {
    e.preventDefault?.();
    try {
      const email = normEmail(emailInput?.value);
      const password = getPasswordOrWarn();
      await signInWithEmailAndPassword(auth, email, password);
      alert("✅ Logged in successfully!");
      // Optional redirect support: ?redirect=...
      const u = new URL(window.location.href);
      const to = u.searchParams.get("redirect");
      if (to) window.location.href = to;
    } catch (err) {
      showAuthError(err, "log-in");
    }
  });
}

/* ------------------ Password Reset (optional) ------------------ */
const resetBtn = $("reset"); // if you have a "Forgot password" button with id="reset"
if (resetBtn) {
  resetBtn.addEventListener("click", async () => {
    try {
      const email = normEmail(emailInput?.value);
      if (!email) {
        alert("Enter your email first, then click Reset.");
        return;
      }
      await sendPasswordResetEmail(auth, email);
      alert("📧 Password reset email sent.");
    } catch (err) {
      showAuthError(err, "password-reset");
    }
  });
}

/* ------------------ Log Out ------------------ */
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      alert("👋 Logged out successfully.");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  });
}

/* ------------------ Auth State UI ------------------ */
onAuthStateChanged(auth, (user) => {
  if (currentUserDisplay) {
    if (user) {
      currentUserDisplay.textContent = `Logged in as: ${user.email}`;
      if (logoutBtn) logoutBtn.style.display = "inline-block";
    } else {
      currentUserDisplay.textContent = "";
      if (logoutBtn) logoutBtn.style.display = "none";
    }
  }
});
