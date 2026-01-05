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

// Force disable Firebase for this environment to prevent initialization errors
const ENABLE_FIREBASE = false;

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (ENABLE_FIREBASE) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
  } catch (error) {
    console.warn("Firebase initialization failed:", error);
  }
}

export { app, auth, db, googleProvider };
export default app;