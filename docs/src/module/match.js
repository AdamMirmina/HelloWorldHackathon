// docs/src/module/match.js
import { app } from '../config/firebase.js';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const db = getFirestore(app);
const auth = getAuth(app);

let currentUser = null; // store logged-in user info

onAuthStateChanged(auth, user => {
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
document.getElementById("submit-preferences").addEventListener("click", async () => {
  if (!currentUser) {
    alert("You must be logged in to save preferences!");
    return;
  }

  const name = document.getElementById("name").value.trim();
  const school = document.getElementById("school").value.trim();
  const studyStyle = document.getElementById("studyStyle").value;
  const timePreference = document.getElementById("timePreference").value;

  // Collect class info
  const classInputs = document.querySelectorAll(".class-input");
  const classes = Array.from(classInputs).map(div => ({
    subject: div.querySelector(".subject").value.trim(),
    teacher: div.querySelector(".teacher").value.trim(),
    block: div.querySelector(".block").value.trim()
  })).filter(c => c.subject !== ""); // remove empty classes

  if (!name || !school || classes.length === 0) {
    alert("Please fill out your name, school, and at least one class.");
    return;
  }

  try {
    // Save to Firestore with user ID
    await addDoc(collection(db, "users"), {
      uid: currentUser.uid,
      name,
      school,
      classes,
      studyStyle,
      timePreference,
      timestamp: Date.now()
    });

    console.log("✅ Preferences saved for", name);

    // Fetch all users from the same school
    const q = query(collection(db, "users"), where("school", "==", school));
    const snapshot = await getDocs(q);
    const allUsers = snapshot.docs.map(doc => doc.data());

    // Filter for class matches
    const matches = allUsers.filter(u =>
      u.uid !== currentUser.uid && // exclude self
      u.classes.some(cls => classes.some(c => c.subject === cls.subject))
    );

    const resultDiv = document.getElementById("match-result");
    if (matches.length > 0) {
      const randomMatch = matches[Math.floor(Math.random() * matches.length)];
      resultDiv.textContent = `🎉 You matched with ${randomMatch.name}! You both take ${randomMatch.classes[0].subject}.`;
    } else {
      resultDiv.textContent = "No matches found yet. Try again later!";
    }
  } catch (error) {
    console.error("❌ Firestore error:", error);
    alert("Failed to save preferences or fetch matches. Check console for details.");
  }
});