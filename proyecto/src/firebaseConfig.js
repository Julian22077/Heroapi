import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
apiKey: "AIzaSyAl_Zr2hua53awUk6GN368W7DWVsFcdnyU",
authDomain: "heroapi-4d6e1.firebaseapp.com",
projectId: "heroapi-4d6e1",
storageBucket: "heroapi-4d6e1.firebasestorage.app",
messagingSenderId: "328833590140",
appId: "1:328833590140:web:8d475f7d509bd71159baf9"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const db = getFirestore(app); // ✅ ¡Esto es necesario!
export { auth, db };