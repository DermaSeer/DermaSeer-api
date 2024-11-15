import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBzGLfvmS424qdmFWk-5dyT1V493xY_22Y",
  authDomain: "dermaseer-auth.firebaseapp.com",
  projectId: "dermaseer-auth",
  storageBucket: "dermaseer-auth.appspot.com",
  messagingSenderId: "773749053838",
  appId: "1:773749053838:web:cfcd8395815d7fecda2cdf",
  measurementId: "G-QJWPSV81ZW",
};

const app = initializeApp(firebaseConfig);
const authFirebase = getAuth(app);

export { authFirebase };
