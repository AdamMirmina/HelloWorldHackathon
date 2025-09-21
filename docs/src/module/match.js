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

const db = getFirestore(app);
const auth = getAuth(app);
let currentUser = null;

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (!user) {
    console.warn("⚠️ User not logged in - buddy form submissions disabled");
  }
});

// ✅ Add new class input dynamically
document.getElementById("add-class").addEventListener("click", () => {
  const container = document.getElementById("classes-container");
  const div = document.createElement("div");
  div.classList.add("class-input");
  div.style.marginBottom = "8px";
  div.innerHTML = `
    <input type="text" class="subject" placeholder="Class (e.g., CS180)" style="width:100%; margin-bottom:4px;">
    <input type="text" class="teacher" placeholder="Teacher (optional)" style="width:100%; margin-bottom:4px;">
    <input type="text" class="block" placeholder="Block/Period (optional)" style="width:100%;">
  `;
  container.appendChild(div);
});

// ✅ Handle form submission
document
  .getElementById("submit-preferences")
  .addEventListener("click", async () => {
    if (!currentUser) {
      alert("You must be logged in to save preferences!");
      return;
    }

    const name = document.getElementById("name").value.trim();
    const school = document.getElementById("school").value.trim();
    const studyStyle = document.getElementById("studyStyle").value;
    const timePreference = document.getElementById("timePreference").value;

    const classInputs = document.querySelectorAll(".class-input");
    const classes = Array.from(classInputs)
      .map((div) => ({
        subject: div.querySelector(".subject").value.trim(),
        teacher: div.querySelector(".teacher").value.trim(),
        block: div.querySelector(".block").value.trim(),
      }))
      .filter((c) => c.subject !== "");

    if (!name || !school || classes.length === 0) {
      alert("Please fill out your name, school, and at least one class.");
      return;
    }

    try {
      // ✅ Save user preferences, merge so we don't overwrite profile fields
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
          public: existingSnap.exists() ? existingSnap.data().public : false,
          description: existingSnap.exists()
            ? existingSnap.data().description || ""
            : "",
        },
        { merge: true }
      );

      console.log("✅ Preferences saved for", name);

      // Fetch all users from the same school
      const q = query(collection(db, "users"), where("school", "==", school));
      const snapshot = await getDocs(q);
      const allUsers = snapshot.docs.map((doc) => doc.data());

      // Filter public users and class matches
      const matches = allUsers.filter(
        (u) =>
          u.uid !== currentUser.uid &&
          u.public === true &&
          u.classes.some((cls) =>
            classes.some((c) => c.subject === cls.subject)
          )
      );

      // Rank matches by score
      const rankedMatches = matches.map((u) => {
        let score = 0;
        const matchingClasses = u.classes.filter((cls) =>
          classes.some((c) => c.subject === cls.subject)
        );
        score += matchingClasses.length * 3; // prioritize multiple shared classes
        if (u.studyStyle && u.studyStyle === studyStyle) score += 1;
        if (u.timePreference && u.timePreference === timePreference) score += 1;

        return { ...u, score, matchingClasses };
      });

      rankedMatches.sort((a, b) => b.score - a.score);

      // Display results
      const resultDiv = document.getElementById("match-result");
      resultDiv.innerHTML = "";

      if (rankedMatches.length > 0) {
        rankedMatches.forEach((match) => {
          const matchDiv = document.createElement("div");
          matchDiv.style.marginBottom = "10px";
          matchDiv.innerHTML = `
          🎉 You matched with 
          <span style="color:#ffd966; cursor:pointer; text-decoration:underline;"
            onclick="window.location.href='profile.html?uid=${match.uid}'">
            ${match.name}
          </span>!
          <br>
          <small>Shared classes: ${match.matchingClasses
            .map((c) => c.subject)
            .join(", ")}</small>
          <br>
          <small style="opacity:0.7;">Match score: ${match.score}</small>
        `;
          resultDiv.appendChild(matchDiv);
        });
      } else {
        resultDiv.textContent = "No matches found yet. Try again later!";
      }
    } catch (error) {
      console.error("❌ Firestore error:", error);
      alert(
        "Failed to save preferences or fetch matches. Check console for details."
      );
    }
  });
