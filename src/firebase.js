import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDm4pafYz5P0VPNsdLBufOV9wH4wspcbLE",
  authDomain: "thika-premium.firebaseapp.com",
  projectId: "thika-premium",
  storageBucket: "thika-premium.firebasestorage.app",
  messagingSenderId: "581087903148",
  appId: "1:581087903148:web:aea7c14a03294052358e09"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
