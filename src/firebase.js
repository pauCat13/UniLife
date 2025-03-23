import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "*",
    authDomain: "*",
    projectId: "*",
    storageBucket: "*",
    messagingSenderId: "*",
    appId: "*"
  };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
export { db, auth, onAuthStateChanged };
