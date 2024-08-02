// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCofd_pCBvV-KLK8OjWg7DZTsz7OcjJ_uE",
  authDomain: "kippyweb-fb19a.firebaseapp.com",
  projectId: "kippyweb-fb19a",
  storageBucket: "kippyweb-fb19a.appspot.com",
  messagingSenderId: "932580945270",
  appId: "1:932580945270:web:697eb45a61ec814f295e57",
  measurementId: "G-2VCJRE970C"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);

export { auth, storage, db };
