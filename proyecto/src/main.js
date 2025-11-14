import mostrarRegistro from './components/registro.js';
import mostrarLogin from './components/login.js';
import mostrarOriginal from './components/original.js';
import mostrarHome from './components/home.js';
import mostrarLogout from './components/logout.js';
import { auth } from './firebaseConfig.js';
import { onAuthStateChanged } from 'firebase/auth';
onAuthStateChanged(auth, (user) => {
if (user) {
document.getElementById("menu").innerHTML = `
<nav>
<button id="menuHome">Home</button>
<button id="menuOriginal">Original</button>
<button id="menuLogout">Logout</button>
</nav>
`;
document.getElementById("menuHome").addEventListener("click",
mostrarHome);
document.getElementById("menuOriginal").addEventListener("click",
mostrarOriginal);
document.getElementById("menuLogout").addEventListener("click",
mostrarLogout);
mostrarHome()
} else{

 menu.style.display = "none";
menu.innerHTML = "";

mostrarLogin();
}
})
