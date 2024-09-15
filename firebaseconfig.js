import { getApp,getApps,initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';


const firebaseConfig = {
  apiKey: "AIzaSyAELRJlv_guKmlWoVlBDcce0fBk4s1HUSI",
  authDomain: "mantun-8a4d8.firebaseapp.com",
  projectId: "mantun-8a4d8",
  storageBucket: "mantun-8a4d8.appspot.com",
  messagingSenderId: "661031703873",
  appId: "1:661031703873:web:96f5db6fb5b7996e3abdc0",
  measurementId: "G-KSRPW1SRPL"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const storage = getStorage(app);


export{app,db,auth,storage};