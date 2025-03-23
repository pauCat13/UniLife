import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyCGMTHpE3n3N9BtC0zWRZMdNFuXxyChd2I",
    authDomain: "cs353-7ba44.firebaseapp.com",
    projectId: "cs353-7ba44",
    storageBucket: "cs353-7ba44.appspot.com",
    messagingSenderId: "281603911420",
    appId: "1:281603911420:web:19c3271bb29a3d392e3179"
  };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
export { db, auth, onAuthStateChanged };
