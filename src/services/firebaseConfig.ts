import { initializeApp } from "firebase/app"
import {  setPersistence, browserLocalPersistence, getAuth } from 'firebase/auth';

import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBsF-15bEYrtjYJNNuvaqdhSvnfEzesjcA",
  authDomain: "educagame-e0d46.firebaseapp.com",
  projectId: "educagame-e0d46",
  storageBucket: "educagame-e0d46.appspot.com",
  messagingSenderId: "350984709613",
  appId: "1:350984709613:web:37ea54054aab1563a973e4",
}

const app = initializeApp(firebaseConfig);


const auth = getAuth(app);

setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('Persistência configurada com sucesso');
  })
  .catch((error) => {
    console.error('Erro ao configurar persistência:', error);
  });

// Initialize Database (if you need it)
const database = getDatabase(app);

export { auth, database };