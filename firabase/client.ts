import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBy4YmwP9i2Tdzxocegk61_Dckl_iALDUE",
  authDomain: "prepwise-c6be6.firebaseapp.com",
  projectId: "prepwise-c6be6",
  storageBucket: "prepwise-c6be6.firebasestorage.app",
  messagingSenderId: "572337072998",
  appId: "1:572337072998:web:2a90ecd3dfc9109a32f6a7",
  measurementId: "G-0PR6Y6KCDP",
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
