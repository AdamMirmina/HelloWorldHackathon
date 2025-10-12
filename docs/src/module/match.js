// docs/src/module/match.js
import { app } from "../config/firebase.js";
import {
  getFirestore,
  collection,
  setDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

/* ------------------ Env base (fixes 404 on Live Server) ------------------ */
// GitHub Pages serves at /HelloWorldHackathon; Live Server often serves /docs
function resolveBasePrefix() {
  const REPO = "HelloWorldHackathon";
  const { hostname, pathname } = window.location;
  const isLocal = hostname === "127.0.0.1" || hostname === "localhost";
  if (!isLocal) return `/${REPO}`;               // GitHub Pages
  return pathname.includes("/docs/") ? "/docs" : ""; // Live Server
}
const BASE = resolveBasePrefix();

/* ------------------ Firebase ------------------ */
const db = getFirestore(app);
const auth = getAuth(app);
let currentUser = null;

onAuthStateChanged(auth, (user) => {
  currentUser = user || null;
  if (!user) console.warn("⚠️ User not logged in - buddy form submissions disabled");
});

/* ------------------ Safe DOM helpers ------------------ */
const $ = (id) => document.getElementById(id);

/* ------------------ Add new class input dynamically ------------------ */
const addClassBtn = $("add-class");
if (addClassBtn) {
  addClassBtn.addEventListener("click", () => {
    const container = $("classes-container");
    if (!container) return;
    const div = document.createElement("div");
    div.classList.add("class-input");
    div.style.marginBottom = "8px";

    const subject = document.createElement("input");
    subject.type = "text";
    subject.className = "subject";
    subject.placeholder = "Class (e.g., CS180)";
    subject.style.width = "100%";
    subject.style.marginBottom = "4px";

    const teacher = document.createElement("input");
    teacher.type = "text";
    teacher.className = "teacher";
    teacher.placeholder = "Teacher (optional)";
    teacher.style.width = "100%";
    teacher.style.marginBottom = "4px";

    const block = document.createElement("input");
    block.type = "text";
    block.className = "block";
    block.placeholder = "Block/Period (optional)";
    block.style.width = "100%";

    div.append(subject, teacher, block);
    container.appendChild(div);
  });
}

/* ------------------ Handle form submission ------------------ */
const submitBtn = $("submit-preferences");
if (submitBtn) {
  submitBtn.addEventListener("click", async () => {
    if (!currentUser) {
      alert("You must be logged in to save preferences!");
      return;
    }

    const name = ($("name")?.value || "").trim();
    const school = ($("school")?.value || "").trim();
    const studyStyle = $("studyStyle")?.value || "";
    const timePreference = $("timePreference")?.value || "";

    const classInputs = document.querySelectorAll(".class-input");
    const classes = Array.from(classInputs)
      .map((div) => ({
        subject: div.querySelector(".subject")?.value.trim() || "",
        teacher: div.querySelector(".teacher")?.value.trim() || "",
        block:   div.querySelector(".block")?.value.trim()   || "",
      }))
      .filter((c) => c.subject !== "");

    if (!name || !school || classes.length === 0) {
      alert("Please fill out your name, school, and at least one class.");
      return;
    }

    try {
      // Save/merge user preferences without clobbering existing profile fields
      const userRef = doc(db, "users", currentUser.uid);
      const existingSnap = await getDoc(userRef);

      await setDoc(
        userRef,
        {
          uid: currentUser.uid,
          name,
          school,
          classes,
          studyStyle,
          timePreference,
          public: existingSnap.exists() ? !!existingSnap.data().public : false,
          description: existingSnap.exists() ? (existingSnap.data().description || "") : "",
        },
        { merge: true }
      );

      // Query users from the same school
      const q = query(collection(db, "users"), where("school", "==", school));
      const snapshot = await getDocs(q);
      const allUsers = snapshot.docs.map((d) => d.data());

      // Filter public users with at least one shared class
      const matches = allUsers.filter(
        (u) =>
          u.uid !== currentUser.uid &&
          u.public === true &&
          Array.isArray(u.classes) &&
          u.classes.some((cls) => classes.some((c) => c.subject === cls.subject))
      );

      // Rank by shared classes + matching preferences
      const rankedMatches = matches.map((u) => {
        const matchingClasses = (u.classes || []).filter((cls) =>
          classes.some((c) => c.subject === cls.subject)
        );
        let score = matchingClasses.length * 3;
        if (u.studyStyle && u.studyStyle === studyStyle) score += 1;
        if (u.timePreference && u.timePreference === timePreference) score += 1;
        return { ...u, score, matchingClasses };
      });

      rankedMatches.sort((a, b) => b.score - a.score);

      // Display results safely (no innerHTML injection; no inline onclick)
      const resultDiv = $("match-result");
      if (!resultDiv) return;
      resultDiv.innerHTML = "";

      if (rankedMatches.length > 0) {
        rankedMatches.forEach((m) => {
          const wrapper = document.createElement("div");
          wrapper.style.marginBottom = "10px";

          // "You matched with "
          const prefix = document.createTextNode("🎉 You matched with ");

          // Clickable name
          const link = document.createElement("span");
          link.style.color = "#ffd966";
          link.style.cursor = "pointer";
          link.style.textDecoration = "underline";
          link.textContent = m.name || "(no name)";
          link.addEventListener("click", () => {
            const url = `${BASE}/profile.html?uid=${encodeURIComponent(m.uid)}`;
            window.location.href = url;   // <-- FIX: correct base prefix
          });

          const excl = document.createTextNode("!");

          // Shared classes
          const br1 = document.createElement("br");
          const shared = document.createElement("small");
          const classList = (m.matchingClasses || []).map((c) => c.subject).join(", ");
          shared.textContent = `Shared classes: ${classList}`;

          // Score
          const br2 = document.createElement("br");
          const score = document.createElement("small");
          score.style.opacity = "0.7";
          score.textContent = `Match score: ${m.score}`;

          wrapper.append(prefix, link, excl, br1, shared, br2, score);
          resultDiv.appendChild(wrapper);
        });
      } else {
        resultDiv.textContent = "No matches found yet. Try again later!";
      }
    } catch (error) {
      console.error("❌ Firestore error:", error);
      alert("Failed to save preferences or fetch matches. Check console for details.");
    }
  });
}
