// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCsMfvkBzA8od6UG7UFTArSz-k-OaUI--E",
  authDomain: "study-companion-3ad6d.firebaseapp.com",
  projectId: "study-companion-3ad6d",
  storageBucket: "study-companion-3ad6d.firebasestorage.app",
  messagingSenderId: "168898473493",
  appId: "1:168898473493:web:e8c4957d18911e9ad9e81c",
  measurementId: "G-XMNHN6GL4M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); // TODO: disable analytics?