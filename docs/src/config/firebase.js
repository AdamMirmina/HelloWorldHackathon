// src/config/firebase.js

// ✅ Import Firebase App SDK from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";

// ✅ Your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyCsMfvkBzA8od6UG7UFTArSz-k-OaUI--E",
  authDomain: "study-companion-3ad6d.firebaseapp.com",
  projectId: "study-companion-3ad6d",
  storageBucket: "study-companion-3ad6d.appspot.com", // ✅ FIXED: must end with .appspot.com
  messagingSenderId: "168898473493",
  appId: "1:168898473493:web:e8c4957d18911e9ad9e81c",
  measurementId: "G-XMNHN6GL4M"
};

// ✅ Initialize Firebase and export the app so other files can use it
export const app = initializeApp(firebaseConfig);