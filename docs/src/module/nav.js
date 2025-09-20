import { auth } from "./auth.js";

function renderNavBar(currentPage) {
  const topNav = document.createElement("div");
  topNav.classList.add("top-nav");

  const navIcons = document.createElement("div");
  navIcons.classList.add("nav-icons");

  // Back arrow (not on home page)
  if (currentPage !== "index") {
    const backBtn = document.createElement("span");
    backBtn.classList.add("nav-icon");
    backBtn.innerHTML = `<i data-lucide="arrow-left"></i>`;
    backBtn.title = "Back";
    backBtn.onclick = () => window.history.back();
    navIcons.appendChild(backBtn);
  }

  // Home icon (always visible)
  const homeBtn = document.createElement("span");
  homeBtn.classList.add("nav-icon");
  homeBtn.innerHTML = `<i data-lucide="home"></i>`;
  homeBtn.title = "Home";
  homeBtn.onclick = () => (window.location.href = "../index.html");
  navIcons.appendChild(homeBtn);

  // Helper: redirect to sign-in with redirect param
  const goToSignIn = (target) => {
    window.location.href = `../signin.html?redirect=${encodeURIComponent(target)}`;
  };

  // Messages icon
  const msgBtn = document.createElement("span");
  msgBtn.classList.add("nav-icon");
  msgBtn.innerHTML = `<i data-lucide="message-circle"></i>`;
  msgBtn.title = "Messages";
  msgBtn.onclick = () => {
    if (!auth.currentUser) goToSignIn("src/messages.html");
    else window.location.href = "messages.html";
  };
  navIcons.appendChild(msgBtn);

  // Settings icon (hidden if already on settings page)
  if (currentPage !== "settings") {
    const settingsBtn = document.createElement("span");
    settingsBtn.classList.add("nav-icon");
    settingsBtn.innerHTML = `<i data-lucide="settings"></i>`;
    settingsBtn.title = "Settings";
    settingsBtn.onclick = () => {
      if (!auth.currentUser) goToSignIn("src/settings.html");
      else window.location.href = "settings.html";
    };
    navIcons.appendChild(settingsBtn);
  }

  // Profile icon (hidden if already on profile page)
  if (currentPage !== "profile") {
    const profileBtn = document.createElement("span");
    profileBtn.classList.add("nav-icon");
    profileBtn.innerHTML = `<i data-lucide="user"></i>`;
    profileBtn.title = "Profile";
    profileBtn.onclick = () => {
      if (!auth.currentUser) goToSignIn("src/profile.html");
      else window.location.href = "profile.html";
    };
    navIcons.appendChild(profileBtn);
  }

  topNav.appendChild(navIcons);
  document.body.prepend(topNav);

  // Activate Lucide icons after injecting them
  if (window.lucide) {
    lucide.createIcons();
  }
}

export { renderNavBar };
