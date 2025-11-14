// mostrarOriginal.js (responsive for mobiles — strong override CSS)
import { db } from '../firebaseConfig.js';
import { collection, addDoc } from 'firebase/firestore';

const RAW_URL = "https://raw.githubusercontent.com/akabab/superhero-api/master/api/all.json";

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

// Inyecta CSS de override responsive (usa !important para forzar colapso en móviles)
function ensureStrongResponsiveCSS() {
  if (document.getElementById('mostrarOriginal-strong-responsive')) return;
  const css = `
  /* ===== Strong responsive overrides for mostrarOriginal ===== */
  .reg-wrap { max-width: 980px !important; margin: 18px auto !important; padding: 12px !important; box-sizing: border-box; }

  /* Main layout: two columns on desktop, stacked on mobile */
  .hero-main-card {
    display: grid !important;
    grid-template-columns: 1fr 360px !important;
    gap: 12px !important;
    align-items: start !important;
    padding: 12px !important;
    box-sizing: border-box !important;
  }

  /* Ensure inputs/selects fill available width */
  .hero-left .reg-input,
  .hero-left select,
  .reg-input {
    width: 100% !important;
    box-sizing: border-box !important;
  }

  /* Buttons layout */
  .hero-right .reg-actions {
    display: flex !important;
    flex-direction: column !important;
    gap: 10px !important;
  }
  .hero-right .reg-actions .btn {
    width: 100% !important;
  }

  /* Preview area */
  .reg-preview {
    white-space: pre-wrap !important;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", "Courier New", monospace !important;
    max-height: 360px !important;
    overflow: auto !important;
  }

  /* Modal list responsiveness */
  .reg-card .modal-list { display:grid; grid-template-columns: repeat(auto-fill,minmax(160px,1fr)); gap:10px; }

  /* ===== MOBILE: force single column and move preview below form ===== */
  @media (max-width: 880px) {
    .hero-main-card {
      grid-template-columns: 1fr !important;
    }
    .hero-top-card {
      display: flex !important;
      flex-direction: column !important;
      gap: 8px !important;
      align-items: flex-start !important;
    }

    /* Make preview appear after the left column */
    .hero-left { order: 1 !important; }
    .hero-right { order: 2 !important; width: 100% !important; max-width: 100% !important; }

    /* Increase touch targets */
    .btn { padding: 14px 16px !important; font-size: 16px !important; border-radius: 12px !important; }

    /* Ensure select/input heights are comfortable */
    .reg-input { padding: 12px !important; border-radius: 10px !important; font-size: 15px !important; }

    /* Reduce preview height a bit on small screens */
    .reg-preview { max-height: 240px !important; }
  }

  /* Extra small phones */
  @media (max-width: 420px) {
    .reg-wrap { margin: 10px !important; padding: 10px !important; }
    .reg-logo { width: 44px !important; height: 44px !important; }
    .reg-title { font-size: 18px !important; }
    .reg-sub { font-size: 13px !important; }
    .reg-input { font-size: 15px !important; padding: 12px !important; }
  }
  `;
  const style = document.createElement('style');
  style.id = 'mostrarOriginal-strong-responsive';
  style.textContent = css;
  document.head.appendChild(style);
}

function createEl(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  Object.entries(props).forEach(([k, v]) => {
    if (k === "class") el.className = v;
    else if (k === "html") el.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2).toLowerCase(), v);
    else el.setAttribute(k, v);
  });
  children.flat().forEach(c => {
    if (c == null) return;
    if (typeof c === "string") el.appendChild(document.createTextNode(c));
    else el.appendChild(c);
  });
  return el;
}

export default function mostrarOriginal() {
  // asegurar estilos base y responsive fuerte
  ensureCss('./registro.css', 'registro-css');
  ensureStrongResponsiveCSS();

  const contenedor = document.getElementById("app");
  contenedor.innerHTML = "";

  // wrapper
  const wrapper = createEl("div", { class: "reg-wrap" });

  // top: selector plantillas
  const topCard = createEl("div", { class: "reg-card hero-top-card" });
  const leftTop = createEl("div", { style: "display:flex;gap:12px;align-items:center" });
  const logo = createEl("div", { class: "reg-logo" }, "SH");
  const titleBox = createEl("div", {});
  const title = createEl("h3", { class: "reg-title" }, "Crear héroe (compacto)");
  const subtitle = createEl("div", { class: "reg-sub" }, "Rellena lo esencial y guarda en Firebase");
  titleBox.appendChild(title);
  titleBox.appendChild(subtitle);
  leftTop.appendChild(logo);
  leftTop.appendChild(titleBox);
  topCard.appendChild(leftTop);

  const selectWrap = createEl("div", { style: "display:flex;gap:8px;align-items:center" });
  const selLabel = createEl("label", {}, "Cargar plantilla:");
  const select = createEl("select", { class: "reg-input", name: "template_select" });
  select.appendChild(createEl("option", { value: "" }, "— Ninguna —"));
  selectWrap.appendChild(selLabel);
  selectWrap.appendChild(select);
  topCard.appendChild(selectWrap);

  wrapper.appendChild(topCard);

  // main card with form + preview (no inline grid styles)
  const mainCard = createEl("div", { class: "reg-card hero-main-card" });

  // left: form
  const left = createEl("div", { class: "reg-left hero-left" });

  function field(labelText, id, type = "text") {
    const wr = createEl("div", { class: "reg-field" });
    const lbl = createEl("label", { class: "reg-label", for: id }, labelText);
    const inp = createEl("input", { class: "reg-input", id, type, placeholder: labelText });
    wr.appendChild(lbl);
    wr.appendChild(inp);
    return { wr, inp };
  }

  const fName = field("Nombre (obligatorio)", "hero_name");
  const fFull = field("Nombre completo", "hero_fullName");
  const fPublisher = field("Publisher", "hero_publisher");
  const fImage = field("Imagen (URL)", "hero_imageUrl");
  const fAlignment = field("Alignment (good / bad / neutral)", "hero_alignment");
  const fGender = field("Gender", "hero_gender");
  const fPlace = field("Place of birth", "hero_placeOfBirth");
  const fFirst = field("First appearance", "hero_firstAppearance");

  left.appendChild(fName.wr);
  left.appendChild(fFull.wr);
  left.appendChild(fPublisher.wr);
  left.appendChild(fImage.wr);
  left.appendChild(fAlignment.wr);
  left.appendChild(fGender.wr);
  left.appendChild(fPlace.wr);
  left.appendChild(fFirst.wr);

  // stats fieldset
  const fs = createEl("fieldset", { style: "margin-top:8px;padding:8px;border-radius:6px;border:1px solid rgba(255,255,255,0.03)" });
  fs.appendChild(createEl("legend", {}, "Powerstats (esenciales)"));
  const stats = ["intelligence", "strength", "power", "combat"];
  stats.forEach(s => {
    const div = createEl("div", { style: "margin-top:8px" });
    const lbl = createEl("label", { class: "reg-label" }, `${s} (0-100)`);
    const inp = createEl("input", { class: "reg-input", id: `ps_${s}`, type: "number", min: "0", max: "100", placeholder: "50" });
    div.appendChild(lbl);
    div.appendChild(inp);
    fs.appendChild(div);
  });
  left.appendChild(fs);

  // right: preview + actions
  const right = createEl("div", { class: "reg-right hero-right" });
  const preview = createEl("div", { class: "reg-preview", id: "heroPreview" }, "Preview del héroe (JSON)");
  const actions = createEl("div", { class: "reg-actions" });
  const btnSave = createEl("button", { class: "btn btn-primary", id: "btnSaveHero", type: "button" }, "Guardar en Firebase");
  const btnClear = createEl("button", { class: "btn btn-ghost", id: "btnClearHero", type: "button" }, "Limpiar");
  actions.appendChild(btnSave);
  actions.appendChild(btnClear);
  right.appendChild(preview);
  right.appendChild(actions);

  mainCard.appendChild(left);
  mainCard.appendChild(right);
  wrapper.appendChild(mainCard);
  contenedor.appendChild(wrapper);

  // state
  let remoteHeroes = [];
  let currentHero = makeEmptyHero();

  function makeEmptyHero() {
    return {
      id: Date.now(),
      name: "",
      slug: "",
      powerstats: { intelligence: 50, strength: 50, power: 50, combat: 50 },
      appearance: { gender: "" },
      biography: { fullName: "", placeOfBirth: "", firstAppearance: "", publisher: "", alignment: "" },
      images: { md: "" },
      imageUrl: ""
    };
  }

  function slugify(s) {
    return String(s || "").toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");
  }

  function updateHeroFromForm() {
    currentHero.name = (document.getElementById("hero_name")?.value || "").trim();
    currentHero.slug = slugify(currentHero.name);
    currentHero.biography.fullName = (document.getElementById("hero_fullName")?.value || "").trim();
    currentHero.biography.publisher = (document.getElementById("hero_publisher")?.value || "").trim();
    currentHero.imageUrl = (document.getElementById("hero_imageUrl")?.value || "").trim();
    currentHero.images.md = currentHero.imageUrl || "";

    stats.forEach(s => {
      const v = Number(document.getElementById(`ps_${s}`)?.value);
      currentHero.powerstats[s] = Number.isFinite(v) ? v : 50;
    });

    currentHero.biography.alignment = (document.getElementById("hero_alignment")?.value || "").trim();
    currentHero.appearance.gender = (document.getElementById("hero_gender")?.value || "").trim();
    currentHero.biography.placeOfBirth = (document.getElementById("hero_placeOfBirth")?.value || "").trim();
    currentHero.biography.firstAppearance = (document.getElementById("hero_firstAppearance")?.value || "").trim();

    preview.textContent = JSON.stringify(currentHero, null, 2);
  }

  // attach listeners after elements exist
  const inputsIds = [
    "hero_name","hero_fullName","hero_publisher","hero_imageUrl",
    "hero_alignment","hero_gender","hero_placeOfBirth","hero_firstAppearance",
    ...stats.map(s => `ps_${s}`)
  ];
  inputsIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", updateHeroFromForm);
  });

  // fetch remote templates
  async function fetchRemote() {
    try {
      const r = await fetch(RAW_URL);
      remoteHeroes = await r.json();
      remoteHeroes.sort((a, b) => a.name.localeCompare(b.name));
      remoteHeroes.forEach(h => {
        const opt = createEl("option", { value: String(h.id) }, `${h.name} — ${h.biography?.publisher || ""}`);
        select.appendChild(opt);
      });
    } catch (e) {
      console.error("No se pudo cargar plantillas:", e);
    }
  }

  // select handler
  select.addEventListener("change", () => {
    const val = select.value;
    if (!val) {
      currentHero = makeEmptyHero();
      fillForm(currentHero);
      updateHeroFromForm();
      return;
    }
    const hero = remoteHeroes.find(h => String(h.id) === val);
    if (!hero) return;
    currentHero = {
      id: Date.now(),
      name: hero.name || "",
      slug: "",
      powerstats: {
        intelligence: Number(hero.powerstats?.intelligence) || 50,
        strength: Number(hero.powerstats?.strength) || 50,
        power: Number(hero.powerstats?.power) || 50,
        combat: Number(hero.powerstats?.combat) || 50
      },
      appearance: { gender: hero.appearance?.gender || "" },
      biography: {
        fullName: hero.biography?.fullName || "",
        publisher: hero.biography?.publisher || "",
        placeOfBirth: hero.biography?.placeOfBirth || "",
        firstAppearance: hero.biography?.firstAppearance || "",
        alignment: hero.biography?.alignment || ""
      },
      images: { md: hero.images?.md || hero.images?.sm || "" },
      imageUrl: hero.images?.md || hero.images?.sm || ""
    };
    fillForm(currentHero);
    updateHeroFromForm();
  });

  function fillForm(h) {
    document.getElementById("hero_name").value = h.name || "";
    document.getElementById("hero_fullName").value = h.biography?.fullName || "";
    document.getElementById("hero_publisher").value = h.biography?.publisher || "";
    document.getElementById("hero_imageUrl").value = h.imageUrl || h.images?.md || "";
    document.getElementById("hero_alignment").value = h.biography?.alignment || "";
    document.getElementById("hero_gender").value = h.appearance?.gender || "";
    document.getElementById("hero_placeOfBirth").value = h.biography?.placeOfBirth || "";
    document.getElementById("hero_firstAppearance").value = h.biography?.firstAppearance || "";

    stats.forEach(s => {
      document.getElementById(`ps_${s}`).value = (h.powerstats && Number(h.powerstats[s])) || 50;
    });
  }

  // save handler
  btnSave.addEventListener("click", async () => {
    updateHeroFromForm();
    if (!currentHero.name) {
      alert("El héroe debe tener un nombre.");
      return;
    }
    try {
      const docRef = await addDoc(collection(db, "heroes"), currentHero);
      alert("✅ Héroe guardado en Firebase! ID doc: " + docRef.id);
      currentHero = makeEmptyHero();
      fillForm(currentHero);
      updateHeroFromForm();
      select.value = "";
    } catch (err) {
      console.error("Error guardando héroe:", err);
      alert("❌ Error al guardar. Mira la consola.");
    }
  });

  // clear handler
  btnClear.addEventListener("click", (ev) => {
    ev.preventDefault();
    currentHero = makeEmptyHero();
    fillForm(currentHero);
    updateHeroFromForm();
    select.value = "";
  });

  // init
  (async () => {
    await fetchRemote();
    currentHero = makeEmptyHero();
    fillForm(currentHero);
    updateHeroFromForm();
  })();
}
