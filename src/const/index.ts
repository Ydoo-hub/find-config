import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCxPzE5UxbsBQAxVbeCPny4gV15w8mKCWo",
  authDomain: "recorder-pro-50451.firebaseapp.com",
  projectId: "recorder-pro-50451",
  storageBucket: "fbg-res-test",
  messagingSenderId: "802233935605",
  appId: "1:802233935605:web:d660fc0c55a54101ce07bc",
};

// 初始化 Firebase
const app = initializeApp(FIREBASE_CONFIG);
export const storage = getStorage(app);

