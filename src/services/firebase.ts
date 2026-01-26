import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDO6IYGBaEz3zZ7clJgEBUtaJMmuzyzMw4",
    authDomain: "forge-2cfcc.firebaseapp.com",
    projectId: "forge-2cfcc",
    storageBucket: "forge-2cfcc.firebasestorage.app",
    messagingSenderId: "379254509723",
    appId: "1:379254509723:web:bf98ba80d145e0b097b63e",
    measurementId: "G-D5C3JLYHN3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, auth, db, storage };
