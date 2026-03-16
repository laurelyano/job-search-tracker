import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Replace this with your Firebase project config from Step 2 of the setup guide
const firebaseConfig = {
  apiKey: "AIzaSyApXXRku14dCQ2tW1QCAB2NZ8Pbhi0aR94",
  authDomain: "job-search-tracker-bc0c9.firebaseapp.com",
  projectId: "job-search-tracker-bc0c9",
  storageBucket: "job-search-tracker-bc0c9.firebasestorage.app",
  messagingSenderId: "152779282852",
  appId: "1:152779282852:web:d0a1898fbaa91942224931",
  measurementId: "G-3SSMYF4P7N"
};

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const provider = new GoogleAuthProvider()
export const db = getFirestore(app)