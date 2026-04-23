import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error: any) {
    if (error.code === 'auth/unauthorized-domain') {
      console.error("Firebase Login Error: Unauthorized Domain.");
      alert(`AUTH ERROR: Please add this domain (${window.location.hostname}) to your Firebase Console > Authentication > Settings > Authorized Domains.`);
    } else {
      console.error("Login failed:", error);
    }
    throw error;
  }
};

export const logout = () => signOut(auth);
