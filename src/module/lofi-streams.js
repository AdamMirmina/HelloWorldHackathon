import { getFirestore, collection, getDocs } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "src/config/firebase.js";

// Your Firebase config
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to change YouTube video
export function changeVideo(videoId) {
  document.getElementById("player").src =
    `https://www.youtube.com/embed/${videoId}?autoplay=1`;
}

// Function to load streams from Firestore
export async function loadStreams() {
  const querySnapshot = await getDocs(collection(db, "streams"));
  const buttonsDiv = document.getElementById("buttons");

  querySnapshot.forEach((doc, index) => {
    const stream = doc.data();

    const button = document.createElement("button");
    button.innerText = stream.label;
    button.onclick = () => changeVideo(stream.id);
    buttonsDiv.appendChild(button);

    if (index === 0) {
      changeVideo(stream.id); // Load first stream by default
    }
  });
}