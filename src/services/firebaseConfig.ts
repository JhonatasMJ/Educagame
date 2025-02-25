import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyBsF-15bEYrtjYJNNuvaqdhSvnfEzesjcA",
  authDomain: "educagame-e0d46.firebaseapp.com",
  projectId: "educagame-e0d46",
  storageBucket: "educagame-e0d46.appspot.com",
  messagingSenderId: "350984709613",
  appId: "1:350984709613:web:37ea54054aab1563a973e4",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


export { auth, GoogleAuthProvider};