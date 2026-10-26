import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDm4pafYz5POVPNSdLBufOV9wH4wspcblE",
  authDomain: "thika-premium.firebaseapp.com",
  projectId: "thika-premium",
  storageBucket: "thika-premium.firebasestorage.app",
  messagingSenderId: "581087903148",
  appId: "1:581087903148:web:aea7c14a03294052358e09"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Cloud Firestore and Auth
export const db = getFirestore(app);
export const auth = getAuth(app);