// mostrarLogin.js (tema consistente con registro.css — versión con link a registro)
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig.js'; // Ajusta el path si es diferente
import mostrarRegistro from './registro.js'; // <-- link hacia el formulario de registro
// NOTA: onAuthStateChanged en main.js se encargará de mostrar Home/Registro.

function ensureCss(href, id) {
  if (id && document.getElementById(id)) return;
  const existing = Array.from(document.head.querySelectorAll('link[rel="stylesheet"]'))
    .some(l => l.getAttribute('href') === href);
  if (existing) return;
  const link = document.createElement('link');
  if (id) link.id = id;
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

export default function mostrarLogin() {
  ensureCss('/src/registro.css', 'registro-css');

  const app = document.getElementById('app');
  app.innerHTML = ''; // limpiar

  // Contenedor principal
  const wrapper = document.createElement('div');
  wrapper.className = 'reg-wrap';
  wrapper.style = 'margin-top:8px;';

  const card = document.createElement('div');
  card.className = 'reg-card';
  card.style = 'align-items:center;';

  // Left: branding + formulario
  const left = document.createElement('div');
  left.className = 'reg-left';

  const brand = document.createElement('div');
  brand.className = 'reg-brand';
  const logo = document.createElement('div');
  logo.className = 'reg-logo';
  logo.textContent = 'SH';
  const titleBox = document.createElement('div');
  const title = document.createElement('h3');
  title.className = 'reg-title';
  title.textContent = 'Iniciar sesión';
  const sub = document.createElement('p');
  sub.className = 'reg-sub';
  sub.textContent = 'Accede y empieza a crear tus héroes.';

  titleBox.appendChild(title);
  titleBox.appendChild(sub);
  brand.appendChild(logo);
  brand.appendChild(titleBox);
  left.appendChild(brand);

  // form (vertical)
  const formGrid = document.createElement('div');
  formGrid.className = 'reg-form';
  // For login we want a single column visually
  formGrid.style = 'grid-template-columns: 1fr; gap:12px; margin-top:8px;';

  function makeField(id, labelText, type = 'text', placeholder = '') {
    const wrapper = document.createElement('div');
    wrapper.className = 'reg-field';
    const label = document.createElement('label');
    label.className = 'reg-label';
    label.setAttribute('for', id);
    label.innerText = labelText;
    const input = document.createElement('input');
    input.className = 'reg-input';
    input.id = id;
    input.type = type;
    input.placeholder = placeholder || labelText;
    wrapper.appendChild(label);
    wrapper.appendChild(input);
    return wrapper;
  }

  const fCorreo = makeField('correo', 'Correo electrónico', 'email', 'tucorreo@ejemplo.com');
  const fContrasena = makeField('contrasena', 'Contraseña', 'password', '*******');

  formGrid.appendChild(fCorreo);
  formGrid.appendChild(fContrasena);

  // mostrar/ocultar contraseña
  const pwdToggleRow = document.createElement('div');
  pwdToggleRow.style = 'display:flex;align-items:center;gap:8px;margin-top:6px';
  const chkShow = document.createElement('input');
  chkShow.type = 'checkbox';
  chkShow.id = 'showPwd';
  const lblShow = document.createElement('label');
  lblShow.setAttribute('for', 'showPwd');
  lblShow.style = 'font-size:13px;color:var(--muted);';
  lblShow.innerText = 'Mostrar contraseña';
  pwdToggleRow.appendChild(chkShow);
  pwdToggleRow.appendChild(lblShow);

  formGrid.appendChild(pwdToggleRow);

  left.appendChild(formGrid);

  // Right: preview + acciones
  const right = document.createElement('div');
  right.className = 'reg-right';

  const preview = document.createElement('div');
  preview.className = 'reg-preview';
  preview.id = 'loginPreview';
  preview.innerText = 'Introduce tus credenciales para iniciar sesión.';

  const actions = document.createElement('div');
  actions.className = 'reg-actions';

  const btnLogin = document.createElement('button');
  btnLogin.className = 'btn btn-primary';
  btnLogin.id = 'btnLogin';
  btnLogin.type = 'button';
  btnLogin.innerText = 'Ingresar';

  const btnCancel = document.createElement('button');
  btnCancel.className = 'btn btn-ghost';
  btnCancel.id = 'btnCancel';
  btnCancel.type = 'button';
  btnCancel.innerText = 'Limpiar';

  actions.appendChild(btnLogin);
  actions.appendChild(btnCancel);

  right.appendChild(preview);
  right.appendChild(actions);

  // LINK: "¿No tienes cuenta? Regístrate"
  const registerHint = document.createElement('div');
  registerHint.className = 'small-muted';
  registerHint.style = 'margin-top:10px;';
  registerHint.innerHTML = `¿No tienes cuenta? <a href="#" id="linkToRegister" style="color:var(--accent);font-weight:700;text-decoration:none;">Regístrate</a>`;
  right.appendChild(registerHint);

  // montaje
  card.appendChild(left);
  card.appendChild(right);
  wrapper.appendChild(card);
  app.appendChild(wrapper);

  // elementos importantes
  const correoEl = document.getElementById('correo');
  const pwdEl = document.getElementById('contrasena');

  // función para mostrar mensajes en el preview (mejor que alerts para UX)
  function showPreviewMessage(text, isError = false) {
    preview.innerText = text;
    preview.style.color = isError ? 'var(--danger)' : 'var(--muted)';
  }

  // actualizar preview al escribir
  function updatePreview() {
    const correo = (correoEl.value || '').trim();
    if (!correo && !(pwdEl.value || '').trim()) {
      showPreviewMessage('Introduce tus credenciales para iniciar sesión.');
      return;
    }
    const lines = [];
    if (correo) lines.push(`Correo: ${correo}`);
    if (pwdEl.value) lines.push('Contraseña: ••••••••');
    showPreviewMessage(lines.join('\n'), false);
  }

  correoEl.addEventListener('input', updatePreview);
  pwdEl.addEventListener('input', updatePreview);

  // toggle pwd
  chkShow.addEventListener('change', () => {
    pwdEl.type = chkShow.checked ? 'text' : 'password';
  });

  // limpiar campos
  document.getElementById('btnCancel').addEventListener('click', () => {
    correoEl.value = '';
    pwdEl.value = '';
    updatePreview();
    correoEl.focus();
  });

  // submit (botón + enter)
  async function handleLogin() {
    const correo = (correoEl.value || '').trim();
    const contrasena = pwdEl.value || '';

    // validaciones básicas
    if (!correo) { showPreviewMessage('Ingresa tu correo.', true); correoEl.focus(); return; }
    if (!contrasena) { showPreviewMessage('Ingresa tu contraseña.', true); pwdEl.focus(); return; }

    // UX: desactivar botón mientras se procesa
    btnLogin.disabled = true;
    btnLogin.textContent = 'Ingresando...';
    showPreviewMessage('Validando credenciales...');

    try {
      await signInWithEmailAndPassword(auth, correo, contrasena);
      // éxito: onAuthStateChanged en main.js autenticará la vista.
      showPreviewMessage('Inicio de sesión exitoso. Redireccionando...');
      // hacemos un reload para que onAuthStateChanged haga su trabajo (opcional)
      setTimeout(() => {
        window.location.reload();
      }, 400);
    } catch (err) {
      console.error('Login error:', err);
      // Mensaje amigable; si firebase devuelve código lo mostramos
      const msg = (err && err.message) ? err.message : String(err);
      showPreviewMessage('Error al iniciar sesión: ' + msg, true);
    } finally {
      btnLogin.disabled = false;
      btnLogin.textContent = 'Ingresar';
    }
  }

  btnLogin.addEventListener('click', handleLogin);

  // permitir submit con Enter cuando el foco está en inputs
  [correoEl, pwdEl].forEach(el => {
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleLogin();
      }
    });
  });

  // link to register: limpia y abre mostrarRegistro, y prefill correo si escrito
  const linkToRegister = document.getElementById('linkToRegister');
  if (linkToRegister) {
    linkToRegister.addEventListener('click', (e) => {
      e.preventDefault();
      const currentEmail = (correoEl.value || '').trim();

      // limpiar campos actuales
      correoEl.value = '';
      pwdEl.value = '';
      updatePreview();

      // show registration form
      mostrarRegistro();

      // si el usuario ya había escrito un correo, prefill en el registro (esperamos microtask para que DOM exista)
      if (currentEmail) {
        setTimeout(() => {
          const regEmail = document.getElementById('correo');
          if (regEmail) {
            regEmail.value = currentEmail;
            // trigger input event to update preview there
            const ev = new Event('input', { bubbles: true });
            regEmail.dispatchEvent(ev);
            // focus en el siguiente campo (contraseña) para facilitar flujo
            const regPwd = document.getElementById('contrasena');
            if (regPwd) regPwd.focus();
          }
        }, 0);
      }
    });
  }

  // foco inicial
  correoEl.focus();

  // init preview
  updatePreview();
}
