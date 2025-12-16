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

export const FIREBASE_CONFIG_PROD = {
  apiKey: "AIzaSyCxPzE5UxbsBQAxVbeCPny4gV15w8mKCWo",
  authDomain: "recorder-pro-50451.firebaseapp.com",
  projectId: "recorder-pro-50451",
  storageBucket: "fbg-res",
  messagingSenderId: "802233935605",
  appId: "1:802233935605:web:d660fc0c55a54101ce07bc",
};

// 初始化 Firebase（测试环境 - 默认实例）
const app = initializeApp(FIREBASE_CONFIG);
export const storage = getStorage(app);

// 初始化 Firebase（正式环境 - 指定名称避免冲突）
const appProd = initializeApp(FIREBASE_CONFIG_PROD, 'production');
export const storageProd = getStorage(appProd);


export const APP_TIME = 1763547010;
