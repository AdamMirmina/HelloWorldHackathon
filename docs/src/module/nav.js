// docs/src/module/nav.js
import { auth } from "./auth.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { db } from "../config/firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

/**
 * Works on both:
 *  - GitHub Pages: /HelloWorldHackathon/...
 *  - Local dev (serving /docs): /
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
  about:    `${BASE}/about.html`,
};

// Inject once-per-page styles for the About pill
function injectAboutStylesOnce() {
  if (document.getElementById("about-pill-styles")) return;
  const style = document.createElement("style");
  style.id = "about-pill-styles";
  style.textContent = `
    .about-tag {
      position: fixed;
      left: 16px;
      bottom: 16px;
      z-index: 2500;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 9999px;
      font-size: 0.9rem;
      color: rgba(255,255,255,0.92);
      text-decoration: none;
      background: rgba(0,0,0,0.45);
      border: 1px solid rgba(255,255,255,0.2);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      transition: background 0.2s ease, transform 0.08s ease, border-color 0.2s ease;
    }
    .about-tag:hover {
      background: rgba(0,0,0,0.60);
      border-color: rgba(255,255,255,0.35);
      transform: translateY(-1px);
    }
  `;
  document.head.appendChild(style);
}

function renderNavBar(currentPage) {
  const topNav = document.createElement("div");
  topNav.classList.add("top-nav");

  const navIcons = document.createElement("div");
  navIcons.classList.add("nav-icons");

  // ── No back button ──

  // Home
  const homeBtn = document.createElement("span");
  homeBtn.classList.add("nav-icon");
  homeBtn.innerHTML = `<i data-lucide="home"></i>`;
  homeBtn.title = "Home";
  homeBtn.onclick = () => (window.location.href = URLS.home);
  navIcons.appendChild(homeBtn);

  // Helper: auth required
  function goProtected(targetUrl) {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        window.location.href = targetUrl;
      } else {
        window.location.href = `${URLS.signin}?redirect=${encodeURIComponent(targetUrl)}`;
      }
    });
  }

  // Messages requires auth + public profile
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
          window.location.href = `${URLS.profile}?from=messages`;
        }
      } catch (e) {
        console.error(e);
        alert("Couldn't verify profile visibility. Try again.");
      }
    });
  }

  // Messages
  const msgBtn = document.createElement("span");
  msgBtn.classList.add("nav-icon");
  msgBtn.innerHTML = `<i data-lucide="message-circle"></i>`;
  msgBtn.title = "Messages";
  msgBtn.onclick = goMessagesGuarded;
  navIcons.appendChild(msgBtn);

  // Settings (hide when already there)
  if (currentPage !== "settings") {
    const settingsBtn = document.createElement("span");
    settingsBtn.classList.add("nav-icon");
    settingsBtn.innerHTML = `<i data-lucide="settings"></i>`;
    settingsBtn.title = "Settings";
    settingsBtn.onclick = () => goProtected(URLS.settings);
    navIcons.appendChild(settingsBtn);
  }

  // Profile (hide when already there)
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

  // Add the About pill (once per page)
  injectAboutStylesOnce();
  if (!document.querySelector(".about-tag")) {
    const about = document.createElement("a");
    about.className = "about-tag";
    about.href = URLS.about;
    about.setAttribute("aria-label", "About this project");
    about.textContent = "About";
    document.body.appendChild(about);
  }

  if (window.lucide) lucide.createIcons();
}

export { renderNavBar };
