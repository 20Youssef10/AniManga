import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBN3f1WzdEpGQbjqOmk_Icnvx_6ikgbmLg",
  authDomain: "animanga-net.firebaseapp.com",
  projectId: "animanga-net",
  storageBucket: "animanga-net.firebasestorage.app",
  messagingSenderId: "964348812760",
  appId: "1:964348812760:web:6526762bfa9c71fd4766ad",
  measurementId: "G-FBZ07H79ZW"
};

// Toggle this to force local mode for development/testing
const ENABLE_FIREBASE = true;

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let googleProvider: GoogleAuthProvider | null = null;

const initializeFirebase = () => {
  if (!ENABLE_FIREBASE) {
    console.log("Firebase disabled by flag. Using local mode.");
    return;
  }

  // Basic validation to prevent crashing on empty configs
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "YOUR_API_KEY") {
    console.warn("Invalid Firebase Configuration detected. Falling back to local mode.");
    return;
  }

  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    console.log("Firebase initialized successfully.");
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    console.warn("Falling back to local demo mode. Authentication and Sync will be disabled.");
    
    // Ensure all exports are null so consumers know to use fallback
    app = null;
    auth = null;
    db = null;
    googleProvider = null;
  }
};

initializeFirebase();

export { app, auth, db, googleProvider };
export default app;