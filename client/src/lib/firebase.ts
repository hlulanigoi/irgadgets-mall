import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyC03AdNuGES89P2hfOgYpzKC-m5ebs0HOI",
  authDomain: "designspark-a0254.firebaseapp.com",
  databaseURL: "https://designspark-a0254-default-rtdb.firebaseio.com",
  projectId: "designspark-a0254",
  storageBucket: "designspark-a0254.firebasestorage.app",
  messagingSenderId: "287587233919",
  appId: "1:287587233919:web:fc967656e76d19251b8f4a",
  measurementId: "G-MYBSEPYZ3D"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// For development, you can use the auth emulator
// if (window.location.hostname === 'localhost') {
//   connectAuthEmulator(auth, 'http://localhost:9099');
// }
