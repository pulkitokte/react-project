// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDMS3i_TKSC2DJNxpE7fhh4WvpmRfS5FEU",
  authDomain: "clone-83da5.firebaseapp.com",
  projectId: "clone-83da5",
  storageBucket: "clone-83da5.appspot.com",
  messagingSenderId: "85094369407",
  appId: "1:85094369407:web:091bf1195d04a7075a174a",
  measurementId: "G-2YY6LSWER2",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
