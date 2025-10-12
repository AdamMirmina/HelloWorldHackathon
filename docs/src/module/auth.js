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

/** Ensure we set some persistence (local → session → memory) before any action */
const persistenceReady = (async () => {
  try {
    await setPersistence(auth, browserLocalPersistence);      // survive reloads
  } catch {
    try {
      await setPersistence(auth, browserSessionPersistence);  // survive tab
    } catch {
      await setPersistence(auth, inMemoryPersistence);        // last resort
      console.warn("Using in-memory auth (private mode or storage blocked).");
    }
  }
})();

/* ------------------ Export ------------------ */
export { auth };

/* ------------------ Demo chat storage helpers ------------------ */
/** Wipes any demo chat caches regardless of user (used on logout or auth null). */
function clearDemoChatStorage() {
  try {
    const PREFIX = "sc_demo_threads_";
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX)) localStorage.removeItem(k);
    }
  } catch (e) {
    console.warn("Couldn't clear demo chat storage", e);
  }
}

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
function getPasswordOrWarn() {
  const pwd = (passInput?.value ?? "");
  if (/^\s|\s$/.test(pwd)) {
    alert("Password cannot start or end with a space.");
    const err = new Error("password-has-edge-space");
    err.code = "password-has-edge-space";
    throw err;
  }
  if (pwd.length < 6) {
    alert("Password must be at least 6 characters.");
    const err = new Error("password-too-short");
    err.code = "password-too-short";
    throw err;
  }
  return pwd;
}
function showAuthError(err, context) {
  const code = err?.code || "";
  const map = {
    "auth/invalid-credential": "Email or password is incorrect.",
    "auth/wrong-password": "Email or password is incorrect.",
    "auth/user-not-found": "No account with that email.",
    "auth/email-already-in-use": "That email is already registered.",
    "auth/invalid-email": "That email address looks invalid.",
    "auth/too-many-requests": "Too many attempts. Try again later.",
    "password-has-edge-space": "Password has spaces at the edges.",
    "password-too-short": "Password must be at least 6 characters.",
  };
  const msg = map[code] || `Unexpected error during ${context}.`;
  alert(`❌ ${msg}`);
  console.error(`[${context}]`, code, err);
}

/* ------------------ Sign Up ------------------ */
if (signupBtn) {
  signupBtn.addEventListener("click", async (e) => {
    e.preventDefault?.();
    try {
      await persistenceReady;
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
      await persistenceReady;
      const email = normEmail(emailInput?.value);
      const password = getPasswordOrWarn();
      await signInWithEmailAndPassword(auth, email, password);
      alert("✅ Logged in successfully!");
      const u = new URL(window.location.href);
      const to = u.searchParams.get("redirect");
      if (to) window.location.href = to;
    } catch (err) {
      showAuthError(err, "log-in");
    }
  });
}

/* ------------------ Enter-key support (calls login if present) ------------------ */
function triggerOnEnter(ev, handler) {
  if (ev.key === "Enter") handler?.(ev);
}
if (emailInput && loginBtn) {
  const tryLogin = (ev) => loginBtn.click();
  emailInput.addEventListener("keydown", (ev) => triggerOnEnter(ev, tryLogin));
}
if (passInput && loginBtn) {
  const tryLogin = (ev) => loginBtn.click();
  passInput.addEventListener("keydown", (ev) => triggerOnEnter(ev, tryLogin));
}

/* ------------------ Password Reset (optional) ------------------ */
const resetBtn = $("reset");
if (resetBtn) {
  resetBtn.addEventListener("click", async () => {
    try {
      await persistenceReady;
      const email = normEmail(emailInput?.value);
      if (!email) return alert("Enter your email first, then click Reset.");
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
      clearDemoChatStorage();          // wipe demo chat immediately on logout
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
      // also wipe if auth becomes null for any reason (token expiry, etc.)
      clearDemoChatStorage();
      currentUserDisplay.textContent = "";
      if (logoutBtn) logoutBtn.style.display = "none";
    }
  }
});
