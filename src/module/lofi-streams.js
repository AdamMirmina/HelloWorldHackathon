import { getFirestore, collection, getDocs } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "src/config/firebase.js";

// Your Firebase config
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function loadStreams() {
  const querySnapshot = await getDocs(collection(db, "lofi-streams"));
  querySnapshot.forEach(doc => {
    const stream = doc.data();

    // Create a button for each stream
    const button = document.createElement("button");
    button.innerText = stream.label;
    button.onclick = () => changeVideo(stream.id);
    document.getElementById("buttons").appendChild(button);
  });
}

function changeVideo(videoId) {
  document.getElementById("player").src =
    `https://www.youtube.com/embed/${videoId}?autoplay=1`;
}

loadStreams();
