document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM fully loaded");

  const signInButton = document.getElementById("google-signin");
  const logoutButton = document.getElementById("logout");

  if (!signInButton) {
    console.error("❌ google-signin button not found");
    return;
  }

  // Sign in
  signInButton.addEventListener("click", () => {
    console.log("🔘 Sign-in button clicked");
    signInWithPopup(auth, provider)
      .then(result => {
        console.log("✅ Signed in as:", result.user.displayName, result.user.email);
        signInButton.style.display = "none";
        logoutButton.style.display = "block";
      })
      .catch(error => console.error("❌ Sign-in error:", error.message));
  });

  // Log out
  logoutButton.addEventListener("click", () => {
    console.log("🔘 Logout clicked");
    signOut(auth)
      .then(() => {
        console.log("✅ Signed out");
        signInButton.style.display = "block";
        logoutButton.style.display = "none";
      })
      .catch(error => console.error("❌ Sign-out error:", error.message));
  });

  // Track auth state
  onAuthStateChanged(auth, user => {
    console.log("👀 Auth state changed:", user ? user.email : "No user");
    if (user) {
      signInButton.style.display = "none";
      logoutButton.style.display = "block";
    } else {
      signInButton.style.display = "block";
      logoutButton.style.display = "none";
    }
  });
});