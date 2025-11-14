// mostrarHome.js (tema consistente con registro.css)
import { db } from '../firebaseConfig.js';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const REMOTE_ALL = "https://raw.githubusercontent.com/akabab/superhero-api/master/api/all.json";

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

export default async function mostrarHome() {
  // intentar cargar el CSS del registro para mantener la misma estética
  ensureCss('/src/registro.css', 'registro-css');

  const appContainer = document.getElementById("app");
  appContainer.innerHTML = `<h2 style="text-align:center;margin-top:28px">Cargando héroes creados...</h2>`;

  try {
    // 1) Traer héroes desde Firestore (intenta varias colecciones por compatibilidad)
    const heroCollectionsToTry = ["heroes", "proyectos"];
    let heroes = [];

    for (const collName of heroCollectionsToTry) {
      try {
        const snap = await getDocs(collection(db, collName));
        if (!snap.empty) {
          const docs = snap.docs.map(d => ({ _docId: d.id, __collection: collName, ...d.data() }));
          const docsFiltered = collName === "proyectos"
            ? docs.filter(x => x.powerstats || x.biography || x.name)
            : docs;
          heroes = heroes.concat(docsFiltered);
        }
      } catch (errColl) {
        console.warn(`No se pudo leer colección ${collName}:`, errColl);
      }
    }

    // 2) Render principal (usando clases del tema)
    appContainer.innerHTML = ""; // limpiar

    const wrapper = document.createElement("div");
    wrapper.className = "reg-wrap";

    // header card
    const headerCard = document.createElement("div");
    headerCard.className = "reg-card";
    headerCard.style = "align-items:center;display:flex;justify-content:space-between;gap:12px;";

    const brand = document.createElement("div");
    brand.style = "display:flex;align-items:center;gap:12px";
    const logo = document.createElement("div");
    logo.className = "reg-logo";
    logo.textContent = "SH";
    const titleBox = document.createElement("div");
    const h = document.createElement("h3");
    h.className = "reg-title";
    h.textContent = "Héroes creados";
    const subtitle = document.createElement("div");
    subtitle.className = "reg-sub";
    subtitle.textContent = "Tus héroes personalizados guardados en la base de datos";
    titleBox.appendChild(h);
    titleBox.appendChild(subtitle);
    brand.appendChild(logo);
    brand.appendChild(titleBox);
    headerCard.appendChild(brand);

    const headerActions = document.createElement("div");
    headerActions.style = "display:flex;gap:8px;align-items:center";

    const btnTemplates = document.createElement("button");
    btnTemplates.className = "btn btn-primary";
    btnTemplates.style = "padding:8px 12px";
    btnTemplates.textContent = "Plantillas oficiales";
    headerActions.appendChild(btnTemplates);

    headerCard.appendChild(headerActions);
    wrapper.appendChild(headerCard);

    // heroes section card
    const card = document.createElement("div");
    card.className = "reg-card";
    card.style = "flex-direction:column;gap:14px;padding:14px";

    const heroesSection = document.createElement("section");
    heroesSection.style = "width:100%";
    card.appendChild(heroesSection);
    wrapper.appendChild(card);

    appContainer.appendChild(wrapper);

    function renderHeroes(list) {
      heroesSection.innerHTML = "";
      if (!list || list.length === 0) {
        const p = document.createElement("p");
        p.textContent = "No hay héroes creados todavía.";
        p.style = "color:var(--muted)";
        heroesSection.appendChild(p);
        return;
      }

      const grid = document.createElement("div");
      grid.style = "display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px";

      list.forEach(hObj => {
        const imgSrc =
          hObj.imageUrl ||
          (hObj.images && (hObj.images.md || hObj.images.sm || hObj.images.lg || hObj.images.xs)) ||
          hObj.icono ||
          "https://via.placeholder.com/160x160?text=No+image";

        // tarjeta de héroe
        const cardHero = document.createElement("article");
        cardHero.style = "padding:12px;border-radius:8px;background:linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.02));border:1px solid rgba(255,255,255,0.03);display:flex;gap:10px;align-items:flex-start;";

        const left = document.createElement("div");
        left.style = "width:88px;flex:0 0 88px";
        const img = document.createElement("img");
        img.src = imgSrc;
        img.alt = hObj.name || "(sin nombre)";
        img.style = "width:88px;height:88px;object-fit:cover;border-radius:6px";
        left.appendChild(img);

        const right = document.createElement("div");
        right.style = "flex:1;display:flex;flex-direction:column";

        const title = document.createElement("h4");
        title.style = "margin:0 0 6px 0;font-size:16px";
        title.textContent = hObj.name || "(sin nombre)";

        const sub = document.createElement("div");
        sub.style = "font-size:13px;color:var(--muted);margin-bottom:6px";
        sub.textContent = `${hObj.biography?.publisher || hObj.publisher || ""}${hObj.biography?.alignment ? " • " + hObj.biography.alignment : ""}`;

        const statsDiv = document.createElement("div");
        statsDiv.style = "display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px";
        const stats = hObj.powerstats || {};
        Object.entries(stats).forEach(([k, v]) => {
          const s = document.createElement("span");
          s.style = "font-size:12px;background:rgba(255,255,255,0.03);padding:4px 6px;border-radius:6px;color:var(--muted)";
          s.textContent = `${k}: ${v}`;
          statsDiv.appendChild(s);
        });

        const bio = document.createElement("div");
        bio.style = "font-size:13px;color:var(--muted)";
        const place = hObj.biography?.placeOfBirth || "";
        const first = hObj.biography?.firstAppearance || "";
        bio.innerHTML = `<strong style="color:var(--gold)">Full name:</strong> ${hObj.biography?.fullName || ""}${place ? `<br/><strong style="color:var(--gold)">Place:</strong> ${place}` : ""}${first ? `<br/><strong style="color:var(--gold)">First:</strong> ${first}` : ""}`;

        // botones
        const btnRow = document.createElement("div");
        btnRow.style = "display:flex;gap:8px;margin-top:8px";

        // eliminar (botón rojo)
        const btnDelete = document.createElement("button");
        btnDelete.className = "btn btn-ghost";
        btnDelete.textContent = "Eliminar";
        // override estilo para que destaque en rojo sin depender del css
        btnDelete.style = "background:#e53e3e;color:#fff;padding:8px 10px;border-radius:8px;border:0;cursor:pointer";

        btnDelete.onclick = async () => {
          const ok = confirm(`Eliminar héroe "${hObj.name}" de la colección ${hObj.__collection || 'heroes'}?`);
          if (!ok) return;
          const collName = hObj.__collection || "heroes";
          const docId = hObj._docId;
          if (!docId) {
            alert("No se encontró el id del documento en Firestore. No se puede eliminar.");
            return;
          }
          try {
            await deleteDoc(doc(db, collName, docId));
            heroes = heroes.filter(x => !(x._docId === docId && (x.__collection || collName) === collName));
            renderHeroes(heroes);
            alert("Héroe eliminado correctamente.");
          } catch (err) {
            console.error("Error eliminando héroe:", err);
            alert("Ocurrió un error al eliminar. Revisa la consola.");
          }
        };

        btnRow.appendChild(btnDelete);

        right.appendChild(title);
        right.appendChild(sub);
        right.appendChild(statsDiv);
        right.appendChild(bio);
        right.appendChild(btnRow);

        cardHero.appendChild(left);
        cardHero.appendChild(right);
        grid.appendChild(cardHero);
      });

      heroesSection.appendChild(grid);
    }

    // render inicial
    renderHeroes(heroes);

    // 3) Handler: mostrar plantillas oficiales (lectura únicamente)
    btnTemplates.addEventListener("click", async () => {
      btnTemplates.disabled = true;
      btnTemplates.textContent = "Cargando plantillas...";
      try {
        const r = await fetch(REMOTE_ALL);
        const remoteList = await r.json();

        // modal usando estilos básicos pero aplicado a clases del tema
        const modal = document.createElement("div");
        modal.style = "position:fixed;inset:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;padding:20px;z-index:9999";

        const box = document.createElement("div");
        box.className = "reg-card";
        box.style = "width:90%;max-width:1000px;max-height:80%;overflow:auto;padding:14px;";

        const title = document.createElement("h3");
        title.textContent = "Plantillas oficiales — Superhero-API";
        title.style = "margin-top:0";
        box.appendChild(title);

        const list = document.createElement("div");
        list.style = "display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px";

        remoteList.slice(0, 120).forEach(p => {
          const it = document.createElement("div");
          it.style = "padding:8px;border-radius:6px;background:rgba(255,255,255,0.02);display:flex;flex-direction:column;gap:6px;align-items:center;text-align:center";
          const img = document.createElement("img");
          img.src = p.images?.sm || p.images?.md || "";
          img.alt = p.name;
          img.style = "width:100%;height:100px;object-fit:cover;border-radius:6px";
          const name = document.createElement("strong");
          name.textContent = p.name;
          name.style = "font-size:14px";
          const pub = document.createElement("div");
          pub.style = "font-size:12px;color:var(--muted)";
          pub.textContent = p.biography?.publisher || "";
          it.appendChild(img);
          it.appendChild(name);
          it.appendChild(pub);
          list.appendChild(it);
        });

        box.appendChild(list);

        const closeRow = document.createElement("div");
        closeRow.style = "display:flex;justify-content:flex-end;margin-top:10px";
        const btnClose = document.createElement("button");
        btnClose.className = "btn btn-ghost";
        btnClose.textContent = "Cerrar";
        btnClose.style = "background:#e53e3e;color:#fff;padding:8px 12px;border-radius:8px;border:0;cursor:pointer";
        btnClose.onclick = () => {
          document.body.removeChild(modal);
          btnTemplates.disabled = false;
          btnTemplates.textContent = "Plantillas oficiales";
        };
        closeRow.appendChild(btnClose);
        box.appendChild(closeRow);

        modal.appendChild(box);
        document.body.appendChild(modal);
      } catch (e) {
        console.error("Error al cargar plantillas:", e);
        alert("No se pudieron cargar las plantillas oficiales.");
        btnTemplates.disabled = false;
        btnTemplates.textContent = "Plantillas oficiales";
      }
    });

  } catch (error) {
    console.error("Error al cargar los héroes:", error);
    appContainer.innerHTML = "<p>Error al cargar los héroes 😢</p>";
  }
}
