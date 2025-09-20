import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, docs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";



const firebaseConfig = {
  apiKey: "AIzaSyCsMfvkBzA8od6UG7UFTArSz-k-OaUI--E",
  authDomain: "study-companion-3ad6d.firebaseapp.com",
  projectId: "study-companion-3ad6d",
  storageBucket: "study-companion-3ad6d.appspot.com", // ✅ FIXED: should be .appspot.com
  messagingSenderId: "168898473493",
  appId: "1:168898473493:web:e8c4957d18911e9ad9e81c",
  measurementId: "G-XMNHN6GL4M"
};

// Your Firebase config
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 3. Function to load video
async function loadVideo() {
  try {
    // Get the document (replace 'vid1' with your doc ID)
    const docRef = db.collection("lofi-streams").doc("stream1");
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      const videoId = docSnap.data().videoId;
      const videoContainer = document.getElementById("video-container");

      // Embed YouTube video
      videoContainer.innerHTML = `
                <iframe width="560" height="315" 
                        src="https://www.youtube.com/embed/${videoId}" 
                        frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                </iframe>
            `;
    } else {
      console.log("No such document!");
    }
  } catch (error) {
    console.error("Error getting document:", error);
  }
}

// 4. Load video on page load
window.onload = loadVideo;
