import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDFMqjuofJu8605wxAp2dklA-tTUtUCNaU",
  authDomain: "eventhub-d4844.firebaseapp.com",
  projectId: "eventhub-d4844",
  storageBucket: "eventhub-d4844.firebasestorage.app",
  messagingSenderId: "918042553130",
  appId: "1:918042553130:web:d2a873318080627818cc53",
  measurementId: "G-WD9H9Y40EH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Analytics
export const analytics = getAnalytics(app);

export default app;
