import { db } from "../config/firebase.js";
import { auth } from "./auth.js";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const startChatBtn = document.getElementById("startChatBtn");
const messageList = document.getElementById("messageList");

startChatBtn.addEventListener("click", async () => {
  if (!auth.currentUser) {
    alert("You must be signed in to start a chat.");
    return;
  }

  try {
    const docRef = await addDoc(collection(db, "conversations"), {
      participants: [auth.currentUser.uid],
      createdAt: serverTimestamp(),
      lastMessage: "Started a new conversation!",
    });

    console.log("✅ Conversation created with ID:", docRef.id);
    messageList.innerHTML = `<p>Conversation created! ID: ${docRef.id}</p>`;
  } catch (error) {
    console.error("❌ Error creating conversation:", error);
    alert("Failed to start chat.");
  }
});
