// docs/src/module/profile.js
import { auth } from "./auth.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { db } from "../config/firebase.js";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

/* ------------------ Helpers ------------------ */
const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const viewedUid = params.get("uid"); // if present, we're viewing someone else

function isOwnProfile(user) {
  return !viewedUid || viewedUid === user?.uid;
}
function setText(el, text) { if (el) el.textContent = text ?? ""; }
function show(el) { if (el) el.style.display = ""; }
function hide(el) { if (el) el.style.display = "none"; }
function setList(listEl, items) {
  if (!listEl) return;
  listEl.innerHTML = "";
  (items || []).forEach((txt) => {
    const li = document.createElement("li");
    li.textContent = txt;
    listEl.appendChild(li);
  });
}

/* ------------------ DOM refs ------------------ */
const titleEl = document.getElementById("profileTitle");
const visibilityPanel = $("visibilityPanel");
const publicToggle = $("publicProfileToggle");
const userEmailEl = $("userEmail");
const userNameEl = $("userName");
const userSchoolEl = $("userSchool");
const messagePrompt = $("messagePrompt");
const makePublicBtn = $("makePublicBtn");

const prefStyle = $("prefStyle");
const prefTime = $("prefTime");
const prefClasses = $("prefClasses");

const openMessages = $("openMessages");
const openSettings = $("openSettings");
const signOutBtn = $("signOutBtn");

/* ------------------ Mode A: viewing someone else ------------------ */
async function loadOtherProfile(currentUser) {
  // Fetch target user
  const userRef = doc(db, "users", viewedUid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    setText(titleEl, "User Profile");
    setText(userNameEl, "(user not found)");
    setText(userSchoolEl, "");
    setText(userEmailEl, "");
    hide(openSettings);
    hide(signOutBtn);
    hide(visibilityPanel);
    if (openMessages) {
      openMessages.disabled = true;
      openMessages.title = "User not found";
    }
    return;
  }

  const data = snap.data();

  // Title shows user's name big
  const displayName = data.name || "User Profile";
  setText(titleEl, displayName);
  setText(userNameEl, displayName);
  setText(userSchoolEl, data.school || "(no school)");

  // Preferences
  setText(prefStyle, data.studyStyle || "(not set)");
  setText(prefTime, data.timePreference || "(not set)");
  setList(prefClasses, (data.classes || []).map((c) => c.subject).filter(Boolean));

  // Email privacy (optional emailPublic flag)
  const showEmail = data.emailPublic === true || viewedUid === currentUser?.uid;
  setText(userEmailEl, showEmail ? (data.email || "(no email)") : "(hidden)");

  // Hide self-only controls
  hide(openSettings);
  hide(signOutBtn);
  hide(visibilityPanel);
  hide(messagePrompt);

  // Message button behavior (respect public & allowDMs)
  if (data.public === false) {
    if (openMessages) {
      openMessages.disabled = true;
      openMessages.title = "This user's profile is private.";
    }
  } else if (data.allowDMs === false) {
    if (openMessages) {
      openMessages.disabled = true;
      openMessages.title = "This user does not accept DMs.";
    }
  } else {
    openMessages?.addEventListener("click", () => {
      window.location.href = "./src/messages.html?with=" + encodeURIComponent(viewedUid);
    });
  }
}

/* ------------------ Mode B: viewing your own profile ------------------ */
async function loadOwnProfile(user) {
  setText(titleEl, "Your Profile");
  show(openSettings);
  show(openMessages);
  show(signOutBtn);
  show(visibilityPanel);

  setText(userEmailEl, user.email);

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    const data = snap.data();
    setText(userNameEl, data.name || "(not set)");
    setText(userSchoolEl, data.school || "(not set)");
    if (publicToggle) publicToggle.checked = !!data.public;

    // Preferences
    setText(prefStyle, data.studyStyle || "(not set)");
    setText(prefTime, data.timePreference || "(not set)");
    setList(prefClasses, (data.classes || []).map((c) => c.subject).filter(Boolean));
  } else {
    // Create starter profile doc
    await setDoc(userRef, { public: false });
    if (publicToggle) publicToggle.checked = false;
  }

  // Toggle public
  publicToggle?.addEventListener("change", async () => {
    await updateDoc(userRef, { public: publicToggle.checked });
  });

  // Messages / Settings
  openMessages?.addEventListener("click", async () => {
    if (!publicToggle?.checked) {
      if (messagePrompt) messagePrompt.style.display = "block";
    } else {
      window.location.href = "./src/messages.html";
    }
  });

  openSettings?.addEventListener("click", () => {
    window.location.href = "./settings.html";
  });

  makePublicBtn?.addEventListener("click", async () => {
    await updateDoc(userRef, { public: true });
    if (publicToggle) publicToggle.checked = true;
    if (messagePrompt) messagePrompt.style.display = "none";
    window.location.href = "./src/messages.html";
  });

  // Sign out
  signOutBtn?.addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.href = "./index.html";
    } catch (e) {
      alert("Sign out failed: " + e.message);
    }
  });
}

/* ------------------ Entry ------------------ */
onAuthStateChanged(auth, async (user) => {
  // If it's your own profile and not logged in → redirect
  if (!user && isOwnProfile(user)) {
    window.location.href =
      "./signin.html?redirect=" + encodeURIComponent("./profile.html");
    return;
  }

  try {
    if (isOwnProfile(user)) {
      await loadOwnProfile(user);
    } else {
      await loadOtherProfile(user);
    }
    if (window.lucide) window.lucide.createIcons();
  } catch (e) {
    console.error("profile init failed:", e);
    alert("Failed to load profile. Try again.");
  }
});
