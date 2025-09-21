import { auth } from "./auth.js";

function renderNavBar(currentPage) {
  const topNav = document.createElement("div");
  topNav.classList.add("top-nav");

  const navIcons = document.createElement("div");
  navIcons.classList.add("nav-icons");

  // --- Back arrow (not on home page) ---
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

  // --- Helper for redirecting to signin ---
  const goToSignIn = (target) => {
    window.location.href = `./signin.html?redirect=${encodeURIComponent(target)}`;
  };

  // --- Messages ---
  const msgBtn = document.createElement("span");
  msgBtn.classList.add("nav-icon");
  msgBtn.innerHTML = `<i data-lucide="message-circle"></i>`;
  msgBtn.title = "Messages";
  msgBtn.onclick = () => {
    const target = "./src/messages.html"; // messages still in src
    if (!auth.currentUser) goToSignIn(target);
    else window.location.href = target;
  };
  navIcons.appendChild(msgBtn);

  // --- Settings ---
  if (currentPage !== "settings") {
    const settingsBtn = document.createElement("span");
    settingsBtn.classList.add("nav-icon");
    settingsBtn.innerHTML = `<i data-lucide="settings"></i>`;
    settingsBtn.title = "Settings";
    settingsBtn.onclick = () => {
      const target = "./settings.html"; // ✅ now points to docs/settings.html
      if (!auth.currentUser) goToSignIn(target);
      else window.location.href = target;
    };
    navIcons.appendChild(settingsBtn);
  }

  // --- Profile ---
  if (currentPage !== "profile") {
    const profileBtn = document.createElement("span");
    profileBtn.classList.add("nav-icon");
    profileBtn.innerHTML = `<i data-lucide="user"></i>`;
    profileBtn.title = "Profile";
    profileBtn.onclick = () => {
      const target = "./profile.html"; // ✅ now points to docs/profile.html
      if (!auth.currentUser) goToSignIn(target);
      else window.location.href = target;
    };
    navIcons.appendChild(profileBtn);
  }

  topNav.appendChild(navIcons);
  document.body.prepend(topNav);

  // Activate Lucide icons after injecting them
  if (window.lucide) lucide.createIcons();
}

export { renderNavBar };
