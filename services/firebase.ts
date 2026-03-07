import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAlfhj9cDg7hivzpcvzpyKtlxydsSA-4kE",
  authDomain: "ctos-beta.firebaseapp.com",
  projectId: "ctos-beta",
  storageBucket: "ctos-beta.firebasestorage.app",
  messagingSenderId: "1086095562593",
  appId: "1:1086095562593:web:224d25efd570f3bcef1720"
};

const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export const database = getDatabase(app);
