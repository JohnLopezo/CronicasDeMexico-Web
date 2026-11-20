// Viste a los habitantes de Unity con la ropa de otra cultura (etapa 56, solo HTML; ver PORTAR_A_UNITY.md §43). Toma los
// cuadros de arte/Npc/Npc_<Base>_<Pose>_<Dir>.png, cambia los tonos de la tela olmeca (turquesa y rojo) por los de la cultura
// conservando luz y sombra (la piel, el pelo y el contorno no se tocan), añade el tocado si lo lleva, y escribe
// arte/NpcCulturas/Npc_<Arte>_<Pose>_<Dir>.png y datos/vestidos.js ({ Arte: Base }). El juego registra esos cuadros con los
// pivotes de su base (js/aldea_maya.js). Uso: node herramientas/vestir.mjs [hoja_de_revision.png]
import { mkdirSync, readdirSync } from 'node:fs'; import { writeFileSync } from 'node:fs'; import { dirname, join } from 'node:path'; import { fileURLToPath } from 'node:url';
import { leer, escribir } from './png.mjs';

const aqui = dirname(dirname(fileURLToPath(import.meta.url)));
// Tonos de cada cultura: [matiz, saturación] para lo que en Unity es turquesa y para lo que es rojo (null: se queda).
// I: los colores de cada cultura son una interpretación (tintes documentados: añil, grana cochinilla, ocres); ver cabeceras.
const TRAJES = {
  maya: { turquesa: [214, 0.5], rojo: [44, 0.72] }, // azul maya (añil con paligorskita) y amarillo
  teo: { turquesa: [8, 0.55], rojo: [40, 0.62] }, // el rojo teotihuacano y ocre
  zapoteca: { turquesa: [262, 0.32], rojo: null }, // añil oscuro y la grana cochinilla de Oaxaca
};
// Arte (el nombre que usa el juego) → base de Unity, cultura y tocado.
const VESTIDOS = {
  MayaEscriba: ['Mensajero', 'maya', 'pincel'], MayaTejedora: ['Curandera', 'maya'], MayaMercadera: ['ComercianteMujer', 'maya'],
  MayaPescador: ['Pescador', 'maya'], MayaCazador: ['Guerrero', 'maya'], MayaArmero: ['Comerciante', 'maya'], MayaNina: ['Nina2', 'maya'], MayaNino: ['Nino2', 'maya'],
  TeoComerciante: ['Comerciante', 'teo', 'ancho'], TeoTallador: ['Mensajero', 'teo'], TeoAlfarera: ['Curandera', 'teo'],
  ZapotecoViajero: ['Anciano', 'zapoteca', 'zapoteco'], TeoNina: ['Nina3', 'teo'], TeoNino: ['Nino3', 'teo'],
};

// ---------- Color ----------
function aHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255; const M = Math.max(r, g, b), m = Math.min(r, g, b), l = (M + m) / 2, d = M - m;
  if (!d) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1)), h = M === r ? ((g - b) / d + 6) % 6 : M === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}
function aRgb(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [r, g, b].map((v) => Math.round((v + m) * 255));
}
// La tela olmeca: turquesa (matiz 150-205) y rojo intenso (matiz ≤ 8 o ≥ 340, saturado). La piel (matiz 15-35) no entra.
const clase = (h, s, l) => (h >= 150 && h <= 205 && s > 0.18 && l > 0.12 ? 'turquesa' : (h <= 8 || h >= 340) && s > 0.45 && l > 0.18 && l < 0.75 ? 'rojo' : null);
function vestir(im, traje) {
  const px = Buffer.from(im.px);
  for (let i = 0; i < px.length; i += 4) {
    if (!px[i + 3]) continue;
    const [h, s, l] = aHsl(px[i], px[i + 1], px[i + 2]), k = clase(h, s, l), t = k && TRAJES[traje][k];
    if (!t) continue;
    [px[i], px[i + 1], px[i + 2]] = aRgb(t[0], Math.min(1, t[1] * (0.6 + s * 0.6)), l);
  }
  return { w: im.w, h: im.h, px };
}

// ---------- Tocados ----------
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const OSCURO = '#1a120c';
function rect(im, c, x, y, w, h) {
  const [r, g, b] = hex(c);
  for (let v = y; v < y + h; v++) for (let u = x; u < x + w; u++) if (u >= 0 && v >= 0 && u < im.w && v < im.h) { const i = (v * im.w + u) * 4; im.px[i] = r; im.px[i + 1] = g; im.px[i + 2] = b; im.px[i + 3] = 255; }
}
// Lo de arriba de la cabeza: la primera fila con 3 píxeles opacos y el centro de las 5 filas siguientes.
function coronilla(im) {
  for (let y = 0; y < im.h; y++) {
    const xs = []; for (let yy = y; yy < y + 5; yy++) for (let x = 0; x < im.w; x++) if (im.px[(yy * im.w + x) * 4 + 3] > 128) xs.push(x);
    let fila = 0; for (let x = 0; x < im.w; x++) if (im.px[(y * im.w + x) * 4 + 3] > 128) fila++;
    if (fila >= 3) return { x: Math.round(xs.reduce((a, b) => a + b, 0) / xs.length), y };
  }
  return { x: 24, y: 8 };
}
// Cada tocado se pinta con contorno oscuro (un rectángulo 1 px mayor detrás), como el arte de Unity.
const TOCADOS = {
  // Tocado ancho de plumas del altiplano (D: figurillas y murales de Teotihuacan): banda roja con borde ocre y plumas verdes.
  ancho(im, { x, y }, lado) { const w = lado ? 14 : 22, x0 = x - (w >> 1); y += 4; // asentado en el pelo
    rect(im, OSCURO, x0 - 1, y - 7, w + 2, 11); for (let k = 0; k < w; k += 3) rect(im, k % 2 ? '#3f8a4a' : '#2f6e3a', x0 + k, y - 6, 2, 5);
    rect(im, '#9c3a2a', x0, y - 1, w, 4); rect(im, '#d1a232', x0, y, w, 1); },
  // Tocado alto con máscara (I: el de las urnas zapotecas): bloque añil, máscara clara con ojos y penacho.
  zapoteco(im, { x, y }) { y += 5; rect(im, OSCURO, x - 6, y - 13, 12, 15); rect(im, '#3d4f8a', x - 5, y - 9, 10, 10); rect(im, '#d9d0bf', x - 3, y - 7, 6, 5);
    rect(im, OSCURO, x - 2, y - 6, 1, 1); rect(im, OSCURO, x + 1, y - 6, 1, 1); rect(im, '#2f6e8a', x - 5, y - 12, 10, 3); rect(im, '#d1a232', x - 5, y, 10, 1); },
  // Pincel atravesado en el tocado (D: escribas mayas en vasijas del Clásico).
  pincel(im, { x, y }) { for (let k = 0; k < 9; k++) rect(im, k < 2 ? OSCURO : '#c9a35a', x + 4 + Math.floor(k / 2), y + 2 - k, 1, 1); },
};

// ---------- Escribir ----------
const NPC = join(aqui, 'arte', 'Npc'), SALIDA = join(aqui, 'arte', 'NpcCulturas');
mkdirSync(SALIDA, { recursive: true });
const archivos = readdirSync(NPC), hoja = [];
for (const [arte, [base, traje, tocado]] of Object.entries(VESTIDOS)) {
  const cuadros = archivos.filter((f) => f.startsWith(`Npc_${base}_`) && /^Npc_[A-Za-z0-9]+_[A-Za-z]+\d_0\d\.png$/.test(f));
  if (!cuadros.length) throw new Error(`sin cuadros de ${base}`);
  for (const f of cuadros) {
    const im = vestir(leer(join(NPC, f)), traje), dir = f.slice(-6, -4);
    if (tocado && dir !== '01') TOCADOS[tocado](im, coronilla(im), dir === '03');
    else if (tocado === 'ancho' || tocado === 'zapoteco') TOCADOS[tocado](im, coronilla(im), false); // de espaldas también se ve
    escribir(join(SALIDA, f.replace(`Npc_${base}_`, `Npc_${arte}_`)), im);
    if (/Reposo1_0[135]/.test(f)) hoja.push([arte, dir, im]);
  }
}
writeFileSync(join(aqui, 'datos', 'vestidos.js'), `// Generado por herramientas/vestir.mjs: habitantes de Unity con la ropa de otra cultura (solo HTML).\n// VESTIDOS[arte] = base: los cuadros de arte/NpcCulturas/Npc_<arte>_* tienen los pivotes de Npc_<base>_*.\nconst VESTIDOS = ${JSON.stringify(Object.fromEntries(Object.entries(VESTIDOS).map(([a, [b]]) => [a, b])))};\n`);
console.log(`${Object.keys(VESTIDOS).length} habitantes vestidos`);

// Hoja de revisión (×3): cada habitante de frente, de lado y de espaldas.
if (process.argv[2]) {
  const artes = Object.keys(VESTIDOS), E = 3, W = 48 * E, H = 64 * E, cols = 7, filas = Math.ceil(artes.length / cols);
  const out = { w: cols * 3 * W, h: filas * H, px: Buffer.alloc(cols * 3 * W * filas * H * 4) };
  for (let i = 0; i < out.px.length; i += 4) { out.px[i] = 107; out.px[i + 1] = 94; out.px[i + 2] = 74; out.px[i + 3] = 255; }
  for (const [arte, dir, im] of hoja) {
    const i = artes.indexOf(arte), k = { '05': 0, '03': 1, '01': 2 }[dir], ox = ((i % cols) * 3 + k) * W, oy = Math.floor(i / cols) * H;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const s = (Math.floor(y / E) * im.w + Math.floor(x / E)) * 4; if (im.px[s + 3] > 128) im.px.copy(out.px, ((oy + y) * out.w + ox + x) * 4, s, s + 4); }
  }
  escribir(process.argv[2], out);
}
