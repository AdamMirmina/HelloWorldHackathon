// docs/src/module/nav.js
// -------------------------------------------------------------
// NavBar module: renders the top nav and the "About" pill.
// Works both on GitHub Pages and Live Server without breaking paths.
// -------------------------------------------------------------

// Firebase deps (same as before)
import { auth } from "./auth.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { db } from "../config/firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

/**
 * Resolve a base prefix that works in both environments.
 * - GitHub Pages: site is served from "/HelloWorldHackathon"
 * - Live Server (repo root): you typically hit "/docs/index.html" → use "/docs"
 * - Live Server (serving /docs as root via settings): then BASE = ""
 */
function resolveBasePrefix() {
  const REPO = "HelloWorldHackathon";
  const { hostname, pathname } = window.location;
  const isLocal = hostname === "127.0.0.1" || hostname === "localhost";

  if (!isLocal) {
    // GitHub Pages
    return `/${REPO}`;
  }

  // Local dev:
  // If URL contains "/docs/", LS is serving repo root → prefix with "/docs"
  // Otherwise LS might be serving /docs as root → no prefix
  return pathname.includes("/docs/") ? "/docs" : "";
}

/**
 * Build canonical URLs from the computed BASE.
 */
function buildUrls(BASE) {
  return {
    home:     `${BASE}/index.html`,
    signin:   `${BASE}/signin.html`,
    profile:  `${BASE}/profile.html`,
    settings: `${BASE}/settings.html`,
    messages: `${BASE}/src/messages.html`, // lives under /src
    about:    `${BASE}/about.html`,
  };
}

/**
 * Inject once-per-page styles for the floating "About" pill.
 */
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

/**
 * NavBar class
 * - Renders icon buttons (Home, Messages, Settings, Profile)
 * - Handles auth-protected routes
 * - Adds the "About" floating pill on the index page only
 */
export class NavBar {
  /**
   * @param {Object} options
   * @param {"index"|"settings"|"profile"|"other"} options.currentPage  Used to hide some buttons & show About pill
   */
  constructor({ currentPage = "other" } = {}) {
    this.currentPage = currentPage;
    this.BASE = resolveBasePrefix();
    this.URLS = buildUrls(this.BASE);
  }

  /**
   * Helper: navigate respecting the computed BASE.
   * @param {string} url Absolute (already prefixed) URL from this.URLS
   */
  go(url) {
    window.location.href = url;
  }

  /**
   * Helper: auth-gated navigation.
   * If not logged in → send to signin with redirect back to target.
   */
  goProtected(targetUrl) {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.go(targetUrl);
      } else {
        const signinWithRedirect = `${this.URLS.signin}?redirect=${encodeURIComponent(targetUrl)}`;
        this.go(signinWithRedirect);
      }
    });
  }

  /**
   * Messages: requires auth AND a public profile.
   * If private, we alert and send to profile page with from=messages.
   */
  async goMessagesGuarded() {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        const toSignin = `${this.URLS.signin}?redirect=${encodeURIComponent(this.URLS.messages)}`;
        this.go(toSignin);
        return;
      }
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        const isPublic = snap.exists() && !!snap.data().public;
        if (isPublic) {
          this.go(this.URLS.messages);
        } else {
          alert("Your profile must be Public to use Messages.");
          const toProfile = `${this.URLS.profile}?from=messages`;
          this.go(toProfile);
        }
      } catch (e) {
        console.error(e);
        alert("Couldn't verify profile visibility. Try again.");
      }
    });
  }

  /**
   * Build a single icon button with a lucide icon and click handler.
   */
  makeIconButton({ icon, title, onClick }) {
    const btn = document.createElement("span");
    btn.classList.add("nav-icon");
    btn.innerHTML = `<i data-lucide="${icon}"></i>`;
    btn.title = title;
    btn.onclick = onClick;
    return btn;
  }

  /**
   * Render the bar at the top of <body>, and optionally the About pill.
   */
  render() {
    // Container
    const topNav = document.createElement("div");
    topNav.classList.add("top-nav");

    // Icons container
    const navIcons = document.createElement("div");
    navIcons.classList.add("nav-icons");

    // Home
    const homeBtn = this.makeIconButton({
      icon: "home",
      title: "Home",
      onClick: () => this.go(this.URLS.home),
    });
    navIcons.appendChild(homeBtn);

    // Messages (guarded)
    const msgBtn = this.makeIconButton({
      icon: "message-circle",
      title: "Messages",
      onClick: () => this.goMessagesGuarded(),
    });
    navIcons.appendChild(msgBtn);

    // Settings (hide when already there)
    if (this.currentPage !== "settings") {
      const settingsBtn = this.makeIconButton({
        icon: "settings",
        title: "Settings",
        onClick: () => this.goProtected(this.URLS.settings),
      });
      navIcons.appendChild(settingsBtn);
    }

    // Profile (hide when already there)
    if (this.currentPage !== "profile") {
      const profileBtn = this.makeIconButton({
        icon: "user",
        title: "Profile",
        onClick: () => this.goProtected(this.URLS.profile),
      });
      navIcons.appendChild(profileBtn);
    }

    // Mount nav
    topNav.appendChild(navIcons);
    document.body.prepend(topNav);

    // About pill only on the main (index) screen
    if (this.currentPage === "index") {
      injectAboutStylesOnce();
      if (!document.querySelector(".about-tag")) {
        const about = document.createElement("a");
        about.className = "about-tag";
        about.href = this.URLS.about;
        about.setAttribute("aria-label", "About this project");
        about.textContent = "About";
        document.body.appendChild(about);
      }
    }

    // Render lucide icons if available
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }
}

/**
 * Backward-compatible helper so you don't have to change callers.
 * Usage (unchanged):
 *   import { renderNavBar } from "./src/module/nav.js";
 *   renderNavBar("index");
 */
export function renderNavBar(currentPage) {
  new NavBar({ currentPage }).render();
}
