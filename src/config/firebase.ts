import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDFMqjuofJu8605wxAp2dklA-tTUtUCNaU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "eventhub-d4844.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "eventhub-d4844",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "eventhub-d4844.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "918042553130",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:918042553130:web:d2a873318080627818cc53",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-WD9H9Y40EH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Analytics
export const analytics = getAnalytics(app);

export default app;
