import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAWJHc00YMHB_nRQBFrq5zJS_HII-KSiYM",
  authDomain: "permisosdb-792aa.firebaseapp.com",
  projectId: "permisosdb-792aa",
  storageBucket: "permisosdb-792aa.appspot.com",
  messagingSenderId: "659852085301",
  appId: "1:659852085301:web:c27ccee60259c73604097c",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log('Firebase inicializado correctamente', app);

export { auth, db };
