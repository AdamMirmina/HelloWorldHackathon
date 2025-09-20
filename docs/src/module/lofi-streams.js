import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCsMfvkBzA8od6UG7UFTArSz-k-OaUI--E",
  authDomain: "study-companion-3ad6d.firebaseapp.com",
  projectId: "study-companion-3ad6d",
  storageBucket: "study-companion-3ad6d.appspot.com", // ✅ FIXED: must end with .appspot.com
  messagingSenderId: "168898473493",
  appId: "1:168898473493:web:e8c4957d18911e9ad9e81c",
  measurementId: "G-XMNHN6GL4M",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Reference to your Firestore document
const docRef = doc(db, "lofi-streams", "stream1");
const docSnap = await getDoc(docRef);

if (docSnap.exists()) {
  const videoId = docSnap.data(); // check the exact field name in Firestore
  console.log("Fetched videoId:", videoId);

  // Update iframe src
  const iframe = document.getElementById("youtube-video");
  iframe.src = `https://www.youtube.com/embed/${videoId}`;
} else {
  // docSnap.data() will be undefined in this case
  console.log("No such document!");
}
