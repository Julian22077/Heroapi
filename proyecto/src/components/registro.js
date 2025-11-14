// mostrarRegistro.js (tema consistente con registro.css)
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig.js'; // Ajusta el path si es necesario
import mostrarLogin from './login.js';

// carga registro.css si no existe (ajusta la ruta si es necesario)
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

export default function mostrarRegistro() {
  ensureCss('/src/registro.css', 'registro-css');

  const app = document.getElementById('app');
  app.innerHTML = `<h2 style="text-align:center;margin-top:28px;color:var(--muted)">Formulario de registro</h2>`;

  // wrapper principal (usa clases del tema)
  const wrapper = document.createElement('div');
  wrapper.className = 'reg-wrap';
  wrapper.style = 'margin-top:8px;';

  const card = document.createElement('div');
  card.className = 'reg-card';

  // left (form)
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
  title.textContent = 'Registro — Superheroes';
  const sub = document.createElement('p');
  sub.className = 'reg-sub';
  sub.textContent = 'Crea tu cuenta para guardar tus héroes personalizados en la base de datos.';
  titleBox.appendChild(title);
  titleBox.appendChild(sub);
  brand.appendChild(logo);
  brand.appendChild(titleBox);
  left.appendChild(brand);

  const formGrid = document.createElement('div');
  formGrid.className = 'reg-form';

  // helper to create field
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

  const fNombre = makeField('nombre', 'Nombre', 'text', 'Tu nombre completo');
  const fCorreo = makeField('correo', 'Correo electrónico', 'email', 'tucorreo@ejemplo.com');
  const fContrasena = makeField('contrasena', 'Contraseña', 'password', 'mínimo 6 caracteres');
  const fFecha = makeField('fecha', 'Fecha de nacimiento (YYYY-MM-DD)', 'text', '1990-01-01');
  const fTelefono = makeField('telefono', 'Teléfono', 'tel', '+57 300 0000000');

  formGrid.appendChild(fNombre);
  formGrid.appendChild(fCorreo);
  formGrid.appendChild(fContrasena);
  formGrid.appendChild(fFecha);
  formGrid.appendChild(fTelefono);

  left.appendChild(formGrid);

  // right (preview + acciones)
  const right = document.createElement('div');
  right.className = 'reg-right';

  const preview = document.createElement('div');
  preview.className = 'reg-preview';
  preview.id = 'regPreview';
  preview.innerText = 'Resumen de registro aparecerá aquí.';

  const actions = document.createElement('div');
  actions.className = 'reg-actions';

  const btnRegistro = document.createElement('button');
  btnRegistro.className = 'btn btn-primary';
  btnRegistro.id = 'btnRegistro';
  btnRegistro.type = 'button';
  btnRegistro.innerText = 'Registrarme';

  const btnCancelar = document.createElement('button');
  btnCancelar.className = 'btn btn-ghost';
  btnCancelar.id = 'btnCancelar';
  btnCancelar.type = 'button';
  btnCancelar.innerText = 'Cancelar';

  actions.appendChild(btnRegistro);
  actions.appendChild(btnCancelar);

  const footNote = document.createElement('div');
  footNote.className = 'small-muted';
  footNote.innerHTML = 'Al registrarte aceptas los <strong>términos</strong> y la <strong>política de privacidad</strong>.';

  // LINK: "¿Ya tienes cuenta? Inicia sesión"
  const loginHint = document.createElement('div');
  loginHint.className = 'small-muted';
  loginHint.style = 'margin-top:10px;';
  loginHint.innerHTML = `¿Ya tienes cuenta? <a href="#" id="linkToLogin" style="color:var(--accent);font-weight:700;text-decoration:none;">Inicia sesión</a>`;

  right.appendChild(preview);
  right.appendChild(actions);
  right.appendChild(footNote);
  right.appendChild(loginHint);

  card.appendChild(left);
  card.appendChild(right);
  wrapper.appendChild(card);

  // limpiar app y añadir wrapper
  app.innerHTML = '';
  app.appendChild(wrapper);

  // helpers y lógica UI
  function setPreviewText(text) {
    preview.innerText = text;
  }

  function readFields() {
    return {
      nombre: (document.getElementById('nombre')?.value || '').trim(),
      correo: (document.getElementById('correo')?.value || '').trim(),
      contrasena: (document.getElementById('contrasena')?.value || ''),
      fecha: (document.getElementById('fecha')?.value || '').trim(),
      telefono: (document.getElementById('telefono')?.value || '').trim()
    };
  }

  function updatePreview() {
    const { nombre, correo, fecha, telefono } = readFields();
    const lines = [];
    if (nombre) lines.push(`Nombre: ${nombre}`);
    if (correo) lines.push(`Correo: ${correo}`);
    if (fecha) lines.push(`Fecha de nacimiento: ${fecha}`);
    if (telefono) lines.push(`Teléfono: ${telefono}`);
    setPreviewText(lines.length ? lines.join('\n') : 'Resumen de registro aparecerá aquí.');
  }

  // attach input listeners
  ['nombre', 'correo', 'contrasena', 'fecha', 'telefono'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updatePreview);
  });

  // cancelar: limpiar campos
  document.getElementById('btnCancelar').addEventListener('click', () => {
    ['nombre', 'correo', 'contrasena', 'fecha', 'telefono'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    setPreviewText('Formulario reiniciado.');
  });

  // handler registro
  document.getElementById('btnRegistro').addEventListener('click', async () => {
    const { nombre, correo, contrasena, fecha, telefono } = readFields();

    // validaciones básicas
    if (!nombre) { alert('Ingresa tu nombre.'); return; }
    if (!correo) { alert('Ingresa tu correo.'); return; }
    if (!contrasena || contrasena.length < 6) { alert('La contraseña debe tener al menos 6 caracteres.'); return; }

    // UX: desactivar botón mientras registra
    btnRegistro.disabled = true;
    btnRegistro.textContent = 'Registrando...';

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, correo, contrasena);
      const user = userCredential.user;

      // guardar perfil en Firestore (colección: usuarios)
      await setDoc(doc(db, 'usuarios', user.uid), {
        uid: user.uid,
        nombre,
        correo,
        fecha,
        telefono,
        ganados: 0,
        perdidos: 0,
        createdAt: new Date().toISOString()
      });

      alert('Usuario registrado correctamente');
      mostrarLogin();
    } catch (error) {
      console.error('Error registro:', error);
      // Mensaje amigable (si firebase da mensajes con 'auth/' los dejamos tal cual)
      const msg = error?.message || String(error) || 'Error al registrarse';
      alert('Error al registrarse: ' + msg);
    } finally {
      btnRegistro.disabled = false;
      btnRegistro.textContent = 'Registrarme';
    }
  });

  // link "Inicia sesión" -> mostrarLogin
  const linkToLogin = document.getElementById('linkToLogin');
  if (linkToLogin) {
    linkToLogin.addEventListener('click', (e) => {
      e.preventDefault();
      // limpiar campos antes de ir al login
      ['nombre', 'correo', 'contrasena', 'fecha', 'telefono'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      mostrarLogin();
    });
  }

  // foco inicial
  const firstInput = document.getElementById('nombre');
  if (firstInput) firstInput.focus();

  // init preview
  updatePreview();
}
