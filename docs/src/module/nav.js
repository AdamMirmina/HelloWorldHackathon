// docs/src/module/nav.js
import { auth } from "./auth.js";
import {
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { db } from "../config/firebase.js";
import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

/**
 * Compute a repo-aware base so links work from BOTH:
 * - GitHub Pages:   /HelloWorldHackathon/...
 * - Local dev (serve docs): /
 */
const REPO = "HelloWorldHackathon";
const BASE = window.location.pathname.includes(`/${REPO}/`) ? `/${REPO}` : "";

// Canonical routes
const URLS = {
  home:     `${BASE}/index.html`,
  signin:   `${BASE}/signin.html`,
  profile:  `${BASE}/profile.html`,
  settings: `${BASE}/settings.html`,
  messages: `${BASE}/src/messages.html`, // messages stays under /src/
};

function renderNavBar(currentPage) {
  const topNav = document.createElement("div");
  topNav.classList.add("top-nav");

  const navIcons = document.createElement("div");
  navIcons.classList.add("nav-icons");

  // Back (hide on home)
  if (currentPage !== "index") {
    const backBtn = document.createElement("span");
    backBtn.classList.add("nav-icon");
    backBtn.innerHTML = `<i data-lucide="arrow-left"></i>`;
    backBtn.title = "Back";
    backBtn.onclick = () => window.history.back();
    navIcons.appendChild(backBtn);
  }

  // Home
  const homeBtn = document.createElement("span");
  homeBtn.classList.add("nav-icon");
  homeBtn.innerHTML = `<i data-lucide="home"></i>`;
  homeBtn.title = "Home";
  homeBtn.onclick = () => (window.location.href = URLS.home);
  navIcons.appendChild(homeBtn);

  // Helper: protected navigation (auth required)
  function goProtected(targetUrl) {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        window.location.href = targetUrl;
      } else {
        window.location.href = `${URLS.signin}?redirect=${encodeURIComponent(targetUrl)}`;
      }
    });
  }

  // Helper: Messages requires BOTH auth + public profile
  function goMessagesGuarded() {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = `${URLS.signin}?redirect=${encodeURIComponent(URLS.messages)}`;
        return;
      }
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        const isPublic = snap.exists() && !!snap.data().public;
        if (isPublic) {
          window.location.href = URLS.messages;
        } else {
          alert("Your profile must be Public to use Messages.");
          // Nudge them to Profile where they can toggle Public & get prompted
          window.location.href = `${URLS.profile}?from=messages`;
        }
      } catch (e) {
        console.error(e);
        alert("Couldn't verify profile visibility. Try again.");
      }
    });
  }

  // Messages (always visible)
  const msgBtn = document.createElement("span");
  msgBtn.classList.add("nav-icon");
  msgBtn.innerHTML = `<i data-lucide="message-circle"></i>`;
  msgBtn.title = "Messages";
  msgBtn.onclick = goMessagesGuarded;
  navIcons.appendChild(msgBtn);

  // Settings (hide on settings page)
  if (currentPage !== "settings") {
    const settingsBtn = document.createElement("span");
    settingsBtn.classList.add("nav-icon");
    settingsBtn.innerHTML = `<i data-lucide="settings"></i>`;
    settingsBtn.title = "Settings";
    settingsBtn.onclick = () => goProtected(URLS.settings);
    navIcons.appendChild(settingsBtn);
  }

  // Profile (hide on profile page per earlier request)
  if (currentPage !== "profile") {
    const profileBtn = document.createElement("span");
    profileBtn.classList.add("nav-icon");
    profileBtn.innerHTML = `<i data-lucide="user"></i>`;
    profileBtn.title = "Profile";
    profileBtn.onclick = () => goProtected(URLS.profile);
    navIcons.appendChild(profileBtn);
  }

  topNav.appendChild(navIcons);
  document.body.prepend(topNav);

  if (window.lucide) lucide.createIcons();
}

export { renderNavBar };
