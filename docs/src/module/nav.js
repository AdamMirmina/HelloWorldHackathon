// docs/src/module/nav.js
import { auth } from "./auth.js";

function renderNavBar(currentPage) {
  const topNav = document.createElement("div");
  topNav.classList.add("top-nav");

  const navIcons = document.createElement("div");
  navIcons.classList.add("nav-icons");

  // --- Determine base path ---
  // If we're in docs/src/, use "./"
  // If we're in docs/, use "src/"
  const inSrcFolder = window.location.pathname.includes("/src/");
  const basePath = inSrcFolder ? "./" : "./src/";

  // --- Back arrow ---
  if (currentPage !== "index") {
    const backBtn = document.createElement("span");
    backBtn.classList.add("nav-icon");
    backBtn.innerHTML = `<i data-lucide="arrow-left"></i>`;
    backBtn.title = "Back";
    backBtn.onclick = () => window.history.back();
    navIcons.appendChild(backBtn);
  }

  // --- Home icon ---
  const homeBtn = document.createElement("span");
  homeBtn.classList.add("nav-icon");
  homeBtn.innerHTML = `<i data-lucide="home"></i>`;
  homeBtn.title = "Home";
  homeBtn.onclick = () => (window.location.href = inSrcFolder ? "../index.html" : "./index.html");
  navIcons.appendChild(homeBtn);

  // Helper for redirecting to signin with redirect param
  const goToSignIn = (target) => {
    window.location.href = `${basePath}signin.html?redirect=${encodeURIComponent(target)}`;
  };

  // --- Messages ---
  const msgBtn = document.createElement("span");
  msgBtn.classList.add("nav-icon");
  msgBtn.innerHTML = `<i data-lucide="message-circle"></i>`;
  msgBtn.title = "Messages";
  msgBtn.onclick = () => {
    const target = `${basePath}messages.html`;
    if (!auth.currentUser) goToSignIn(`${basePath}messages.html`);
    else window.location.href = target;
  };
  navIcons.appendChild(msgBtn);

  // --- Settings (hidden if already on settings page) ---
  if (currentPage !== "settings") {
    const settingsBtn = document.createElement("span");
    settingsBtn.classList.add("nav-icon");
    settingsBtn.innerHTML = `<i data-lucide="settings"></i>`;
    settingsBtn.title = "Settings";
    settingsBtn.onclick = () => {
      const target = `${basePath}settings.html`;
      if (!auth.currentUser) goToSignIn(target);
      else window.location.href = target;
    };
    navIcons.appendChild(settingsBtn);
  }

  // --- Profile (hidden if already on profile page) ---
  if (currentPage !== "profile") {
    const profileBtn = document.createElement("span");
    profileBtn.classList.add("nav-icon");
    profileBtn.innerHTML = `<i data-lucide="user"></i>`;
    profileBtn.title = "Profile";
    profileBtn.onclick = () => {
      const target = `${basePath}profile.html`;
      if (!auth.currentUser) goToSignIn(target);
      else window.location.href = target;
    };
    navIcons.appendChild(profileBtn);
  }

  topNav.appendChild(navIcons);
  document.body.prepend(topNav);

  // Activate Lucide icons
  if (window.lucide) lucide.createIcons();
}

export { renderNavBar };
