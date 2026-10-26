import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDm4pafYz5POVPNsDLbuf0V9wHwspcbLE",
  authDomain: "thika-premium.firebaseapp.com",
  projectId: "thika-premium",
  storageBucket: "thika-premium.firebasestorage.app",
  messagingSenderId: "581087903148",
  appId: "1:581087903148:web:aea7c14a03294052358e09"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);