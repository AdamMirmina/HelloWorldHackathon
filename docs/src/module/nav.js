import { auth } from "./auth.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

function renderNavBar(currentPage) {
  const topNav = document.createElement("div");
  topNav.classList.add("top-nav");

  const navIcons = document.createElement("div");
  navIcons.classList.add("nav-icons");

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
  homeBtn.onclick = () => (window.location.href = "./index.html");
  navIcons.appendChild(homeBtn);

  // --- Helper for secure navigation ---
  function handleProtectedRoute(target) {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        window.location.href = target;
      } else {
        window.location.href = `./signin.html?redirect=${encodeURIComponent(target)}`;
      }
    });
  }

  // --- Messages ---
  const msgBtn = document.createElement("span");
  msgBtn.classList.add("nav-icon");
  msgBtn.innerHTML = `<i data-lucide="message-circle"></i>`;
  msgBtn.title = "Messages";
  msgBtn.onclick = () => handleProtectedRoute("./src/messages.html");
  navIcons.appendChild(msgBtn);

  // --- Settings ---
  if (currentPage !== "settings") {
    const settingsBtn = document.createElement("span");
    settingsBtn.classList.add("nav-icon");
    settingsBtn.innerHTML = `<i data-lucide="settings"></i>`;
    settingsBtn.title = "Settings";
    settingsBtn.onclick = () => handleProtectedRoute("./settings.html");
    navIcons.appendChild(settingsBtn);
  }

  // --- Profile ---
  if (currentPage !== "profile") {
    const profileBtn = document.createElement("span");
    profileBtn.classList.add("nav-icon");
    profileBtn.innerHTML = `<i data-lucide="user"></i>`;
    profileBtn.title = "Profile";
    profileBtn.onclick = () => handleProtectedRoute("./profile.html");
    navIcons.appendChild(profileBtn);
  }

  topNav.appendChild(navIcons);
  document.body.prepend(topNav);

  if (window.lucide) lucide.createIcons();
}

export { renderNavBar };
