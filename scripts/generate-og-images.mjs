import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const outputDir = path.join(projectRoot, "public", "og");
const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "tellounder-og-"));

const asset = (relativePath, mimeType) => {
  const absolutePath = path.join(projectRoot, relativePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`No existe el asset requerido: ${absolutePath}`);
  }

  return `data:${mimeType};base64,${fs.readFileSync(absolutePath).toString("base64")}`;
};

const wordmark = asset("portadaTellounder.PNG", "image/png");
const leather = asset("TEXTURA-CUERO.webp", "image/webp");
const grille = asset("TEXTURA-REJILLA-AMPLIFICADOR.webp", "image/webp");

const logos = {
  avvivo: asset("src/assets/project-labels/avvivo.png", "image/png"),
  aye: asset("src/assets/project-labels/aye.webp", "image/webp"),
  rise: asset("src/assets/project-labels/rise.png", "image/png"),
  hembra: asset("src/assets/project-labels/hembra.png", "image/png"),
  anto: asset("src/assets/project-labels/anto.png", "image/png"),
  metalmente: asset("src/assets/project-labels/metalmente.svg", "image/svg+xml"),
  cielofinal: asset("src/assets/project-labels/cielofinal.svg", "image/svg+xml"),
};

const cards = [
  {
    filename: "tellounder.png",
    eyebrow: "LEONARDO EMMANUEL TELLO / TELLOUNDER",
    title: "IDEAS CON VOLUMEN.<br><em>SISTEMAS QUE FUNCIONAN.</em>",
    titleClass: "title-compact",
    description: "Desarrollo productos digitales, experiencias y sistemas completos para empresas.",
    tags: ["PRODUCTO", "UX", "SISTEMAS", "IA APLICADA"],
    accent: "#ff164f",
    accentRgb: "255,22,79",
    labelBackground: "#111111",
    centerKind: "wordmark",
    kicker: "PORTFOLIO / CONSULTORÍA DIGITAL",
    url: "tellounder108.web.app",
  },
  {
    filename: "servicios.png",
    eyebrow: "SERVICIOS / PRODUCTO DIGITAL END-TO-END",
    title: "DESARROLLO.<br><em>UX. SISTEMAS.</em>",
    description: "Arquitectura, frontend, backend, datos, cloud y consultoría para productos digitales complejos.",
    tags: ["CORPORATIVO", "APIS", "AUTOMATIZACIÓN", "CLOUD"],
    accent: "#ff164f",
    accentRgb: "255,22,79",
    labelBackground: "#f5f2ec",
    centerKind: "type",
    centerTop: "FULL",
    centerBottom: "STACK",
    centerInk: "#090909",
    kicker: "ESTRATEGIA + DISEÑO + IMPLEMENTACIÓN",
    url: "tellounder108.web.app/servicios",
  },
  {
    filename: "ia-rag.png",
    eyebrow: "IA APLICADA / CONOCIMIENTO PRIVADO",
    title: "BOTS RAG<br><em>CON CONTEXTO.</em>",
    description: "Asistentes verificables, automatización e interfaces conversacionales para equipos y empresas.",
    tags: ["RAG", "IA", "DATOS", "GOBERNANZA"],
    accent: "#ff7a00",
    accentRgb: "255,122,0",
    labelBackground: "#ff7a00",
    centerKind: "type",
    centerTop: "RAG",
    centerBottom: "01",
    centerInk: "#090909",
    kicker: "RECUPERACIÓN + EVIDENCIA + CONTROL",
    url: "tellounder108.web.app/servicios/ia-rag",
  },
  {
    filename: "avvivo.png",
    eyebrow: "CASE FILE 01 / SISTEMA PRINCIPAL",
    title: "AVVIVO<br><em>SISTEMA DIGITAL.</em>",
    description: "Actividad, actores, reglas y evidencia reunidos en un producto operativo.",
    tags: ["PRODUCTO", "UX", "BACKEND", "DATOS"],
    accent: "#d9aa36",
    accentRgb: "217,170,54",
    labelBackground: "#d9aa36",
    logo: logos.avvivo,
    logoClass: "logo-avvivo",
    badge: "GOLD",
    kicker: "DISEÑO Y DESARROLLO END-TO-END",
    url: "tellounder108.web.app/proyectos/avvivo",
  },
  {
    filename: "catalogo-aye.png",
    eyebrow: "CASE FILE 02 / COMERCIO Y AUTOMATIZACIÓN",
    title: "CATÁLOGO<br><em>AYE.</em>",
    description: "Una fuente externa convertida en catálogo administrable, compartible y listo para vender.",
    tags: ["CATÁLOGO", "PWA", "SEO", "ADMIN"],
    accent: "#ff9717",
    accentRgb: "255,151,23",
    labelBackground: "#ffffff",
    logo: logos.aye,
    logoClass: "logo-aye",
    kicker: "IMPORTACIÓN + EXPERIENCIA COMERCIAL",
    url: "tellounder108.web.app/proyectos/catalogo-aye",
  },
  {
    filename: "rise-difusion.png",
    eyebrow: "CASE FILE 03 / PLATAFORMA CULTURAL",
    title: "RISE<br><em>DIFUSIÓN.</em>",
    description: "Servicios musicales, obra administrable e identidad pública dentro de una experiencia coherente.",
    tags: ["IDENTIDAD", "COPY", "ADMIN", "SEO"],
    accent: "#8a5cff",
    accentRgb: "138,92,255",
    labelBackground: "#050505",
    logo: logos.rise,
    logoClass: "logo-rise",
    kicker: "PRODUCTO + CONTENIDO + PUBLICACIÓN",
    url: "tellounder108.web.app/proyectos/rise-difusion",
  },
  {
    filename: "hembra.png",
    eyebrow: "CASE FILE 04 / COMERCIO BOTÁNICO",
    title: "HEMBRA<br><em>COMERCIO DIGITAL.</em>",
    description: "Marca, catálogo, universos visuales y operación reunidos en una tienda administrable.",
    tags: ["MARCA", "CATÁLOGO", "MEDIA", "QA"],
    accent: "#e285a8",
    accentRgb: "226,133,168",
    labelBackground: "#f5f0e6",
    logo: logos.hembra,
    logoClass: "logo-hembra",
    kicker: "IDENTIDAD + CATÁLOGO + ADMINISTRACIÓN",
    url: "tellounder108.web.app/proyectos/hembra",
  },
  {
    filename: "anto-grispo.png",
    eyebrow: "CASE FILE 05 / PORTFOLIO FOTOGRÁFICO",
    title: "ANTO GRISPO<br><em>FOTOGRAFÍA.</em>",
    description: "Archivo recuperado y convertido en un portfolio narrativo, accesible y autoadministrable.",
    tags: ["RECUPERACIÓN", "IDENTIDAD", "PORTFOLIO", "ADMIN"],
    accent: "#51d5bf",
    accentRgb: "81,213,191",
    labelBackground: "#050505",
    logo: logos.anto,
    logoClass: "logo-anto",
    kicker: "NARRATIVA + ACCESIBILIDAD + PUBLICACIÓN",
    url: "tellounder108.web.app/proyectos/anto-grispo",
  },
];

cards.push(
  {
    filename: "metalmente-arte.png",
    eyebrow: "CASE FILE 06 / CATÁLOGO EDITORIAL",
    title: "METALMENTE<br><em>ARTE.</em>",
    description: "El archivo de un taller, convertido en una experiencia de obra, proceso y materia.",
    tags: ["UX", "REACT", "CANVAS", "ADMIN"],
    accent: "#d5b176", accentRgb: "213,177,118", labelBackground: "#202923",
    logo: logos.metalmente, logoClass: "logo-metalmente",
    kicker: "IDENTIDAD + CATÁLOGO + PUBLICACIÓN",
    url: "tellounder108.web.app/proyectos/metalmente-arte",
  },
  {
    filename: "cielo-final.png",
    eyebrow: "CASE FILE 07 / ARCHIVO CULTURAL",
    title: "CIELOFINAL<br><em>MEMORIA DIGITAL.</em>",
    titleClass: "title-compact",
    description: "Música, historia y fuentes reunidas en un archivo con vinilo interactivo y Spotify.",
    tags: ["ARCHIVO", "REACT", "SPOTIFY", "SEO"],
    accent: "#8eafe0", accentRgb: "142,175,224", labelBackground: "#ffffff",
    logo: logos.cielofinal, logoClass: "logo-cielofinal",
    kicker: "PRESERVACIÓN + INTERACCIÓN + CONTENIDO",
    url: "tellounder108.web.app/proyectos/cielo-final",
  },
);

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const renderCenter = (card) => {
  if (card.centerKind === "wordmark") {
    return `<img class="label-wordmark" src="${wordmark}" alt="">`;
  }

  if (card.centerKind === "type") {
    return `<div class="label-type" style="color:${card.centerInk}"><strong>${escapeHtml(card.centerTop)}</strong><span>${escapeHtml(card.centerBottom)}</span></div>`;
  }

  return `<img class="project-logo ${escapeHtml(card.logoClass)}" src="${card.logo}" alt="">`;
};

const renderHtml = (card) => `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=1200, initial-scale=1">
  <title>${escapeHtml(card.filename)}</title>
  <style>
    * { box-sizing: border-box; }
    html, body { width: 1200px; height: 630px; margin: 0; overflow: hidden; }
    body {
      --accent: ${card.accent};
      --accent-rgb: ${card.accentRgb};
      position: relative;
      color: #f7f3ed;
      background: #030303;
      font-family: Arial, Helvetica, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    body::before {
      content: "";
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(90deg, rgba(0,0,0,.15), rgba(0,0,0,.58)),
        url("${leather}");
      background-position: center;
      background-size: cover;
      opacity: .48;
    }
    body::after {
      content: "";
      position: absolute;
      right: -80px;
      bottom: -170px;
      width: 620px;
      height: 570px;
      background:
        radial-gradient(circle at 45% 43%, rgba(var(--accent-rgb), .20), transparent 34%),
        url("${grille}") center / cover no-repeat;
      opacity: .27;
      filter: saturate(.92) contrast(1.16);
    }
    .frame {
      position: absolute;
      inset: 24px;
      overflow: hidden;
      border: 1px solid rgba(255,255,255,.18);
      background: linear-gradient(116deg, rgba(0,0,0,.14), rgba(0,0,0,.34));
    }
    .frame::before {
      content: "";
      position: absolute;
      left: -20%;
      bottom: -2px;
      width: 86%;
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--accent) 30%, var(--accent) 72%, transparent);
      box-shadow: 0 0 23px rgba(var(--accent-rgb), .6);
    }
    .frame::after {
      content: "";
      position: absolute;
      top: 0;
      right: 0;
      width: 255px;
      height: 7px;
      background: var(--accent);
      box-shadow: 0 0 22px rgba(var(--accent-rgb), .46);
    }
    .brand {
      position: absolute;
      top: 38px;
      left: 48px;
      width: 252px;
      height: 70px;
      display: flex;
      align-items: center;
    }
    .brand img { width: 246px; height: auto; display: block; }
    .brand i {
      position: absolute;
      right: -5px;
      bottom: 16px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--accent);
      box-shadow: 0 0 14px rgba(var(--accent-rgb), .9);
    }
    .system {
      position: absolute;
      top: 47px;
      right: 48px;
      color: rgba(255,255,255,.58);
      font: 700 10px/1.4 "Courier New", monospace;
      letter-spacing: 1.9px;
      text-align: right;
      text-transform: uppercase;
    }
    .system strong { color: var(--accent); }
    .content {
      position: absolute;
      left: 52px;
      top: 145px;
      width: 704px;
    }
    .eyebrow {
      margin: 0 0 16px;
      color: var(--accent);
      font: 700 12px/1.2 "Courier New", monospace;
      letter-spacing: 2.3px;
    }
    h1 {
      max-width: 720px;
      margin: 0;
      color: #f6f2ec;
      font-family: "Arial Black", Arial, Helvetica, sans-serif;
      font-size: 65px;
      font-weight: 900;
      letter-spacing: -3.7px;
      line-height: .93;
      text-transform: uppercase;
    }
    h1 em {
      color: transparent;
      font-style: normal;
      -webkit-text-stroke: 1.7px rgba(246,242,236,.96);
      text-shadow: 4px 0 0 rgba(var(--accent-rgb), .20);
    }
    h1.title-compact {
      font-size: 56px;
      line-height: .91;
    }
    .description {
      max-width: 675px;
      min-height: 58px;
      margin: 21px 0 0;
      color: rgba(255,255,255,.84);
      font-size: 19px;
      font-weight: 400;
      letter-spacing: -.15px;
      line-height: 1.42;
    }
    .tags {
      display: flex;
      gap: 8px;
      margin-top: 22px;
    }
    .tag {
      min-width: 88px;
      padding: 9px 12px 8px;
      border: 1px solid rgba(255,255,255,.23);
      color: #fff;
      background: rgba(4,4,4,.55);
      font: 700 9px/1 "Courier New", monospace;
      letter-spacing: 1px;
      text-align: center;
    }
    .tag:first-child {
      border-color: var(--accent);
      background: rgba(var(--accent-rgb), .13);
    }
    .deck {
      position: absolute;
      top: 130px;
      right: 50px;
      width: 340px;
      height: 340px;
      border: 1px solid rgba(255,255,255,.17);
      background: rgba(2,2,2,.56);
      box-shadow: 0 26px 70px rgba(0,0,0,.56), inset 0 0 46px rgba(var(--accent-rgb), .06);
    }
    .record {
      position: absolute;
      left: 22px;
      top: 22px;
      width: 296px;
      height: 296px;
      border: 10px solid #202124;
      border-radius: 50%;
      background:
        radial-gradient(circle at center, transparent 0 20%, rgba(0,0,0,.42) 20.5% 21%, transparent 21.5% 27%, rgba(255,255,255,.05) 27.5% 28%, transparent 28.5% 35%, rgba(255,255,255,.055) 35.5% 36%, transparent 36.5% 43%, rgba(255,255,255,.05) 43.5% 44%, transparent 44.5% 50%),
        repeating-radial-gradient(circle, #151618 0 3px, #090a0b 4px 6px);
      box-shadow:
        0 0 0 2px rgba(255,255,255,.09),
        0 0 0 4px rgba(var(--accent-rgb), .36),
        0 0 32px rgba(var(--accent-rgb), .25),
        inset 0 0 52px #000;
    }
    .record::before {
      content: "";
      position: absolute;
      inset: 7px;
      border-radius: inherit;
      background: conic-gradient(from 224deg, transparent 0 11%, rgba(var(--accent-rgb), .26) 14%, transparent 18% 56%, rgba(255,255,255,.06) 60%, transparent 65% 100%);
      filter: blur(1px);
    }
    .record::after {
      content: "";
      position: absolute;
      left: 50%;
      top: 50%;
      width: 6px;
      height: 6px;
      transform: translate(-50%,-50%);
      border-radius: 50%;
      background: #f3f1ec;
      box-shadow: 0 0 8px rgba(0,0,0,.9);
    }
    .label {
      position: absolute;
      left: 50%;
      top: 50%;
      z-index: 2;
      width: 124px;
      height: 124px;
      transform: translate(-50%,-50%);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid rgba(255,255,255,.58);
      border-radius: 50%;
      background: ${card.labelBackground};
      box-shadow: 0 0 23px rgba(var(--accent-rgb), .45), inset 0 0 0 6px rgba(var(--accent-rgb), .12);
    }
    .label-wordmark { width: 106px; height: auto; display: block; }
    .label-type {
      display: grid;
      place-items: center;
      transform: rotate(-8deg);
      font-family: "Arial Black", Arial, sans-serif;
      line-height: .83;
      text-align: center;
    }
    .label-type strong { font-size: 31px; letter-spacing: -1.7px; }
    .label-type span { margin-top: 8px; font: 700 13px/1 "Courier New", monospace; letter-spacing: 3px; }
    .project-logo { position: relative; z-index: 1; display: block; object-fit: contain; }
    .logo-avvivo { width: 110px; height: 110px; mix-blend-mode: multiply; }
    .logo-aye { width: 119px; height: 119px; }
    .logo-rise { width: 107px; height: 72px; }
    .logo-hembra { width: 116px; height: 116px; }
    .logo-anto { width: 122px; height: 122px; transform: scale(1.5); }
    .logo-metalmente { width: 80px; height: 80px; }
    .logo-cielofinal { width: 98px; height: 98px; }
    .badge {
      position: absolute;
      z-index: 4;
      top: 20px;
      right: 20px;
      min-width: 74px;
      padding: 9px 12px 8px;
      border: 1px solid var(--accent);
      color: #090909;
      background: var(--accent);
      font: 900 11px/1 "Courier New", monospace;
      letter-spacing: 1.5px;
      text-align: center;
      box-shadow: 0 0 22px rgba(var(--accent-rgb), .36);
    }
    .catalog {
      position: absolute;
      right: 45px;
      bottom: 86px;
      width: 350px;
      display: flex;
      justify-content: space-between;
      color: rgba(255,255,255,.56);
      font: 700 9px/1.2 "Courier New", monospace;
      letter-spacing: 1.4px;
      text-transform: uppercase;
    }
    .catalog strong { color: var(--accent); }
    .footer {
      position: absolute;
      left: 52px;
      right: 48px;
      bottom: 36px;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      color: rgba(255,255,255,.51);
      font: 700 9px/1.2 "Courier New", monospace;
      letter-spacing: 1.25px;
      text-transform: uppercase;
    }
    .footer .kicker { color: rgba(255,255,255,.73); }
    .footer .url { color: #fff; }
    .footer .url::before { content: ""; display: inline-block; width: 7px; height: 7px; margin-right: 10px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 12px rgba(var(--accent-rgb), .85); }
  </style>
</head>
<body>
  <main class="frame">
    <div class="brand"><img src="${wordmark}" alt="Tellounder"><i></i></div>
    <div class="system"><strong>OPEN SIGNAL</strong><br>SHARE CARD / 1200 × 630</div>
    <section class="content">
      <p class="eyebrow">${escapeHtml(card.eyebrow)}</p>
      <h1 class="${card.titleClass || ""}">${card.title}</h1>
      <p class="description">${escapeHtml(card.description)}</p>
      <div class="tags">${card.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}</div>
    </section>
    <aside class="deck" aria-hidden="true">
      ${card.badge ? `<div class="badge">${escapeHtml(card.badge)}</div>` : ""}
      <div class="record"><div class="label">${renderCenter(card)}</div></div>
    </aside>
    <div class="catalog"><span>REC 33⅓ / TELLOUNDER</span><strong>MASTER 0${cards.indexOf(card) + 1}</strong></div>
    <footer class="footer"><span class="kicker">${escapeHtml(card.kicker)}</span><span class="url">${escapeHtml(card.url)}</span></footer>
  </main>
</body>
</html>`;

const chromeCandidates = [
  process.env.CHROME_PATH,
  process.env.PROGRAMFILES && path.join(process.env.PROGRAMFILES, "Google", "Chrome", "Application", "chrome.exe"),
  process.env["PROGRAMFILES(X86)"] && path.join(process.env["PROGRAMFILES(X86)"], "Google", "Chrome", "Application", "chrome.exe"),
  process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, "Google", "Chrome", "Application", "chrome.exe"),
].filter(Boolean);

const chromePath = chromeCandidates.find((candidate) => fs.existsSync(candidate));
if (!chromePath) {
  throw new Error("No se encontró Google Chrome. Definí CHROME_PATH y volvé a ejecutar el script.");
}

const readPngDimensions = (filename) => {
  const data = fs.readFileSync(filename);
  const signature = "89504e470d0a1a0a";
  if (data.subarray(0, 8).toString("hex") !== signature || data.subarray(12, 16).toString("ascii") !== "IHDR") {
    throw new Error(`El archivo generado no es un PNG válido: ${filename}`);
  }
  return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
};

fs.mkdirSync(outputDir, { recursive: true });

try {
  for (const [index, card] of cards.entries()) {
    const only = process.argv.find((argument) => argument.startsWith("--only="))?.slice(7).split(",");
    if (only && !only.includes(card.filename)) continue;
    const htmlPath = path.join(temporaryRoot, `${String(index + 1).padStart(2, "0")}-${card.filename}.html`);
    const screenshotPath = path.join(outputDir, card.filename);
    const profilePath = path.join(temporaryRoot, `profile-${index + 1}`);

    fs.writeFileSync(htmlPath, renderHtml(card), "utf8");

    const result = spawnSync(
      chromePath,
      [
        "--headless=new",
        "--disable-gpu",
        "--disable-extensions",
        "--disable-background-networking",
        "--no-first-run",
        "--no-default-browser-check",
        "--hide-scrollbars",
        "--force-device-scale-factor=1",
        "--window-size=1200,630",
        "--run-all-compositor-stages-before-draw",
        "--virtual-time-budget=1200",
        `--user-data-dir=${profilePath}`,
        `--screenshot=${screenshotPath}`,
        pathToFileURL(htmlPath).href,
      ],
      { encoding: "utf8", windowsHide: true },
    );

    if (result.status !== 0 || !fs.existsSync(screenshotPath)) {
      throw new Error(`Chrome no pudo generar ${card.filename}: ${result.stderr || result.stdout || `exit ${result.status}`}`);
    }

    const dimensions = readPngDimensions(screenshotPath);
    if (dimensions.width !== 1200 || dimensions.height !== 630) {
      throw new Error(`${card.filename} mide ${dimensions.width}x${dimensions.height}; se esperaba 1200x630.`);
    }

    const kilobytes = Math.round(fs.statSync(screenshotPath).size / 1024);
    console.log(`OK  ${card.filename.padEnd(22)} ${dimensions.width}x${dimensions.height}  ${kilobytes} KB`);
  }
} finally {
  fs.rmSync(temporaryRoot, { recursive: true, force: true });
}

console.log(`\nPortadas OG generadas en ${outputDir}`);
