// Dibuja por código, en pixel art, los animales de Veracruz y Tabasco (solo de la versión HTML; ver PORTAR_A_UNITY.md).
// Escribe arte/Animales/<Animal>_<Animacion>_<n>.png (cuadros sueltos, mirando al este, 48 px por metro como el resto) y
// datos/animales.js con sus pivotes, cuadros y velocidades. Uso: node herramientas/animales.mjs [hoja_de_revision.png]
//
// Una serpiente es una columna de puntos (x, y en el suelo, z arriba, en metros) con un radio en cada punto. Cada punto se
// pinta como un disco sombreado como un tubo: luz de arriba a la izquierda, rampa de color por tramos con trama de Bayer,
// manchas según la distancia a lo largo del cuerpo y el lado del tubo, contorno oscuro por fuera y línea de separación
// donde una vuelta del cuerpo tapa a otra. Las poses son funciones del tiempo, así que cada animación sale de su curva.
import { mkdirSync, writeFileSync } from 'node:fs'; import { dirname, join } from 'node:path'; import { fileURLToPath } from 'node:url';
import { escribir } from './png.mjs';

const aqui = dirname(dirname(fileURLToPath(import.meta.url)));
// La proyección del juego (js/motor.js), multiplicada por la escala de cada animal al pintarlo (ver ANIMALES): así un animal
// más pequeño se dibuja con menos píxeles, nítido, en vez de encogerse en pantalla.
const BASE = { PPU: 48, PX_Y: 32, PX_Z: 48 * Math.cos(41.81031 * Math.PI / 180) };
let PPU = BASE.PPU, PX_Y = BASE.PX_Y, PX_Z = BASE.PX_Z;
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const ramp = (...hs) => hs.map(hex);
const suave = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]].map((f) => f.map((v) => (v + 0.5) / 16 - 0.5));
const LUZ = (() => { const l = [-0.45, -0.75, 0.55], m = Math.hypot(...l); return l.map((v) => v / m); })();

// ---------- Nauyaca real (Bothrops asper) ----------
// Pardo oliva con triángulos oscuros de borde crema que se juntan en el lomo en forma de X, vientre amarillento, cabeza
// de lanza más oscura arriba y franja clara detrás del ojo. Lengua negra.
const NAUYACA = {
  largo: 3.0, radio: 0.155, cabeza: 0.38, periodo: 0.19,
  cuerpo: ramp('#2e2418', '#4a3c28', '#665538', '#81704b', '#9d8b60', '#b7a679'),
  mancha: ramp('#1f170f', '#2d2216', '#3b2d1d', '#4a3a26'),
  borde: ramp('#8f8463', '#b3a77e', '#d0c49a', '#e4d9b2'),
  vientre: ramp('#7a6a3a', '#a8934f', '#cdb76a', '#e3d08a'),
  cabezaTono: ramp('#2a2016', '#3f3222', '#57462f', '#6f5c3e', '#8a7550'),
  contorno: hex('#140d08'), separa: hex('#22170e'), ojo: hex('#0d0805'), brillo: hex('#f4ead0'),
  franja: hex('#e2d6aa'), boca: hex('#b65a5c'), bocaOscura: hex('#6e2a30'), colmillo: hex('#f6f1e2'), lengua: hex('#1a0f0f'),
};

// Columna: integra el rumbo th(u) a lo largo del cuerpo (u de 0, la cola, a 1, el cuello).
function columna(A, th, zf, n = 70) {
  const ds = A.largo / n, pts = []; let x = 0, y = 0;
  for (let i = 0; i <= n; i++) {
    const u = i / n, a = th(u);
    if (i) { x += Math.cos(a) * ds; y += Math.sin(a) * ds; }
    const r = A.radio * (0.2 + 0.8 * suave(0, 0.32, u)) * (1 - 0.28 * suave(0.78, 1, u));
    pts.push({ x, y, z: zf(u), r, u, t: u * A.largo });
  }
  return pts;
}
// Gira la pose para que la cabeza mire al este y la centra en el punto de apoyo (centro de la parte en el suelo).
function encarar(pts, base = (p) => p.u < 0.6) {
  const a = pts.at(-1), b = pts.at(-4), giro = -Math.atan2(a.y - b.y, a.x - b.x), c = Math.cos(giro), s = Math.sin(giro);
  for (const p of pts) { const x = p.x * c - p.y * s, y = p.x * s + p.y * c; p.x = x; p.y = y; }
  const bs = pts.filter(base), mx = bs.reduce((t, p) => t + p.x, 0) / bs.length, my = bs.reduce((t, p) => t + p.y, 0) / bs.length;
  for (const p of pts) { p.x -= mx; p.y -= my; }
  return pts;
}
// Cabeza: discos desde el cuello hasta el hocico en la dirección del último tramo (con su inclinación), en forma de lanza.
function cabeza(A, pts, inclina = 0) {
  const a = pts.at(-1), b = pts.at(-3), dx = a.x - b.x, dy = a.y - b.y, l = Math.hypot(dx, dy) || 1, rn = a.r;
  const d = [dx / l, dy / l], cabezas = [], n = 14;
  for (let i = 1; i <= n; i++) {
    // Lanza: se ensancha mucho detrás de los ojos (las glándulas del veneno) y se afila hacia el hocico.
    const h = i / n, perfil = h < 0.4 ? 1 + 0.95 * Math.sin((h / 0.4) * Math.PI / 2) : 1.95 * (1 - 0.7 * Math.pow((h - 0.4) / 0.6, 1.1));
    const s = h * A.cabeza;
    cabezas.push({ x: a.x + d[0] * s * Math.cos(inclina), y: a.y + d[1] * s * Math.cos(inclina), z: a.z + s * Math.sin(inclina), r: rn * perfil * 0.92, h });
  }
  return { cabezas, dir: d };
}

// ---------- Pintar ----------
function lienzo(w, h) { return { w, h, col: new Array(w * h).fill(null), orden: new Int32Array(w * h).fill(-1), parte: new Uint8Array(w * h) }; }
const enPantalla = (L, p) => [L.ox + p.x * PPU, L.oy - (p.y * PX_Y + p.z * PX_Z)];
function tono(r, luz, x, y) { const k = Math.round(Math.max(0, Math.min(1, luz)) * (r.length - 1) + BAYER[y & 3][x & 3] * 0.9); return r[Math.max(0, Math.min(r.length - 1, k))]; }

function pintarSerpiente(A, L, pose) {
  const { pts, cab } = pose, todos = [];
  pts.forEach((p, i) => todos.push({ ...p, tipo: 'cuerpo', i }));
  cab.cabezas.forEach((p, i) => todos.push({ ...p, tipo: 'cabeza', i: pts.length + i }));
  // Tangente en pantalla de cada disco, para el lado del tubo y la trama.
  const ps = todos.map((p) => enPantalla(L, p));
  todos.forEach((p, i) => { const a = ps[Math.max(0, i - 1)], b = ps[Math.min(ps.length - 1, i + 1)], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; p.tx = (b[0] - a[0]) / l; p.ty = (b[1] - a[1]) / l; });
  // De lo más lejano a lo más cercano (profundidad del juego: y·0,7454 − z·0,6667).
  const orden = todos.map((p, i) => i).sort((a, b) => (todos[b].y * 0.7454 - todos[b].z * 0.6667) - (todos[a].y * 0.7454 - todos[a].z * 0.6667) || a - b);
  for (const k of orden) {
    const p = todos[k], [cx, cy] = ps[k], rp = Math.max(1.2, p.r * PPU * (p.tipo === 'cabeza' ? 0.8 : 1));
    // Normal hacia abajo de la pantalla, perpendicular al cuerpo: el lado del vientre.
    let nx = -p.ty, ny = p.tx; if (ny < 0) { nx = -nx; ny = -ny; }
    for (let y = Math.floor(cy - rp); y <= Math.ceil(cy + rp); y++) for (let x = Math.floor(cx - rp); x <= Math.ceil(cx + rp); x++) {
      if (x < 0 || y < 0 || x >= L.w || y >= L.h) continue;
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy, q = (dx * dx + dy * dy) / (rp * rp);
      if (q > 1) continue;
      const fx = dx / rp, fy = dy / rp, fz = Math.sqrt(Math.max(0, 1 - fx * fx - fy * fy));
      const luz = 0.18 + 0.82 * Math.max(0, fx * LUZ[0] + fy * LUZ[1] + fz * LUZ[2]);
      const abajo = fx * nx + fy * ny; // −1 lomo … +1 vientre
      let c;
      if (p.tipo === 'cabeza') c = abajo > 0.5 ? tono(A.borde, luz, x, y) : tono(A.cabezaTono, luz, x, y); // labios claros
      else if (abajo > 0.58 && p.u > 0.12) c = tono(A.vientre, luz * 1.1, x, y);
      else {
        // Triángulos oscuros que se juntan en el lomo (X): anchos arriba, estrechos hacia el flanco; borde crema.
        const f = ((p.t / A.periodo) % 1 + 1) % 1, lado = Math.abs(abajo + 0.3), ancho = 0.4 - 0.34 * lado, dist = Math.abs(f - 0.5);
        if (dist < ancho) c = tono(A.mancha, luz, x, y);
        else if (dist < ancho + 0.07 && lado < 0.9) c = tono(A.borde, luz * 0.9, x, y);
        else c = tono(A.cuerpo, luz, x, y);
      }
      const j = y * L.w + x; L.col[j] = c; L.orden[j] = p.i; L.parte[j] = p.tipo === 'cabeza' ? 2 : 1;
    }
  }
  // Rasgos de la cabeza: ojo con brillo, franja clara detrás del ojo y, con la boca abierta, mandíbulas y colmillos.
  const cabs = cab.cabezas, P = (h) => { const i = Math.min(cabs.length - 1, Math.round(h * (cabs.length - 1))); return { p: cabs[i], s: enPantalla(L, cabs[i]) }; };
  const ojo = P(0.62), atras = P(0.12), hocico = P(1);
  const arriba = [-(ojo.s[1] - atras.s[1]), ojo.s[0] - atras.s[0]], la = Math.hypot(...arriba) || 1; arriba[0] /= la; arriba[1] /= la;
  if (arriba[1] > 0) { arriba[0] = -arriba[0]; arriba[1] = -arriba[1]; }
  const pon = (x, y, c) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < L.w && y < L.h) { L.col[y * L.w + x] = c; L.parte[y * L.w + x] = L.parte[y * L.w + x] || 3; } };
  const linea = (a, b, c, paso = 0.5) => { const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / paso); for (let i = 0; i <= n; i++) pon(a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n, c); };
  const ro = ojo.p.r * PPU * 0.8, ex = ojo.s[0] + arriba[0] * ro * 0.3, ey = ojo.s[1] + arriba[1] * ro * 0.3;
  linea([ex - 0.5, ey + ro * 0.42], [atras.s[0] - arriba[0] * ro * 0.1, atras.s[1] + ro * 0.62], A.franja); // franja postocular
  pon(ex, ey, A.ojo); pon(ex + 1, ey, A.ojo); pon(ex, ey + 1, A.ojo); pon(ex + 1, ey + 1, A.ojo); pon(ex, ey, A.brillo);
  if (pose.boca > 0.05) {
    // Boca abierta: la mandíbula de abajo gira desde la bisagra (detrás del ojo); entre las dos, la boca rosada, oscura al
    // fondo, y los colmillos colgando de la de arriba.
    const H = [ex - ro * 0.6, ey + ro * 0.55], U = [hocico.s[0] + cab.dir[0] * 1.5, hocico.s[1] + ro * 0.35];
    const lu = Math.hypot(U[0] - H[0], U[1] - H[1]), au = Math.atan2(U[1] - H[1], U[0] - H[0]), ang = au + pose.boca * 0.95;
    const D = [H[0] + Math.cos(ang) * lu * 0.92, H[1] + Math.sin(ang) * lu * 0.92];
    for (let k = 0; k <= 24; k++) { const t = k / 24, Q = [U[0] + (D[0] - U[0]) * t, U[1] + (D[1] - U[1]) * t]; linea(H, Q, A.boca, 0.5); }
    for (let k = 0; k <= 12; k++) { const t = k / 12, Q = [U[0] + (D[0] - U[0]) * t, U[1] + (D[1] - U[1]) * t]; linea(H, [H[0] + (Q[0] - H[0]) * 0.35, H[1] + (Q[1] - H[1]) * 0.35], A.bocaOscura, 0.5); }
    const fang = (t, l) => { const B = [H[0] + (U[0] - H[0]) * t, H[1] + (U[1] - H[1]) * t]; linea(B, [B[0] + Math.cos(ang) * 0 + 0.5, B[1] + l], A.colmillo, 0.4); };
    if (pose.boca > 0.3) { fang(0.88, 1 + 3 * pose.boca); fang(0.74, 1 + 2 * pose.boca); }
    // Mandíbula de abajo: dos píxeles de grueso, clara por dentro y con contorno.
    linea([H[0], H[1] + 1], [D[0], D[1] + 1], A.contorno, 0.4); linea(H, D, A.borde[1], 0.4);
  }
  // Contorno: fuera de la silueta y donde una vuelta del cuerpo tapa a otra no vecina.
  const fuera = [], separa = [];
  for (let y = 0; y < L.h; y++) for (let x = 0; x < L.w; x++) {
    const j = y * L.w + x;
    if (!L.col[j]) { if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => { const X = x + a, Y = y + b; return X >= 0 && Y >= 0 && X < L.w && Y < L.h && L.col[Y * L.w + X] && L.parte[Y * L.w + X] !== 3; })) fuera.push(j); continue; }
    const o = L.orden[j];
    if (o >= 0 && [[1, 0], [0, 1], [-1, 0], [0, -1]].some(([a, b]) => { const X = x + a, Y = y + b; if (X < 0 || Y < 0 || X >= L.w || Y >= L.h) return false; const p = L.orden[Y * L.w + X]; return p >= 0 && Math.abs(p - o) > 9 && L.parte[Y * L.w + X] === 1 && p < o === false; })) separa.push(j);
  }
  for (const j of fuera) L.col[j] = A.contorno;
  for (const j of separa) L.col[j] = A.separa;
  // Lengua bífida (fuera del contorno).
  if (pose.lengua > 0.05 && pose.boca < 0.2) {
    const t0 = [hocico.s[0] + cab.dir[0] * 2, hocico.s[1] + 1], largo = 3 + 4 * pose.lengua, t1 = [t0[0] + largo, t0[1] + 0.5 * pose.lengua];
    linea(t0, t1, A.lengua); linea(t1, [t1[0] + 2, t1[1] - 1.5], A.lengua); linea(t1, [t1[0] + 2, t1[1] + 1.5], A.lengua);
  }
}

// ---------- Poses de la nauyaca (u: 0 cola … 1 cuello; f: fase de 0 a 1 de la animación) ----------
const ENROSCA = 0.6; // parte del cuerpo en el rollo
function poseRollo(A, f, { cuello = 0.32, alto = 0.34, extiende = 0, boca = 0, lengua = 0, respira = 0.03, baja = 0 } = {}) {
  const Rc = (A.largo * ENROSCA) / (2 * Math.PI * 1.05), w = (u) => (u - ENROSCA) / (1 - ENROSCA);
  const th = (u) => u < ENROSCA ? (u * A.largo) / Rc
    : (ENROSCA * A.largo) / Rc + (1 - extiende) * (cuello * 4.2 * Math.sin(2 * Math.PI * w(u)) * (1 - 0.5 * w(u)) + 0.9 * Math.sin(Math.PI * w(u)) * cuello) + extiende * 0.0;
  const z = (u) => (u < ENROSCA ? 0 : alto * suave(0, 0.75, w(u)) * (1 - baja)) + 0.02;
  const pts = columna(A, th, z);
  // Respiración: el rollo se hincha un poco.
  for (const p of pts) p.r *= 1 + respira * Math.sin(2 * Math.PI * f) * (p.u < ENROSCA ? 1 : 0.4);
  encarar(pts, (p) => p.u < ENROSCA);
  // Con extiende, el cuello se estira hacia delante desde el rollo.
  if (extiende > 0) { const i0 = pts.findIndex((p) => p.u >= ENROSCA), a = pts[i0]; pts.slice(i0).forEach((p, k, s) => { const t = k / (s.length - 1); p.x = a.x + (p.x - a.x) * (1 - extiende) + extiende * t * A.largo * (1 - ENROSCA) * 1.05; p.y = a.y + (p.y - a.y) * (1 - extiende) * 0.6; }); }
  const cab = cabeza(A, pts, -0.25 * extiende + 0.05);
  return { pts, cab, boca, lengua };
}
function poseReptar(A, f) {
  const th = (u) => 0.62 * Math.sin(2 * Math.PI * (u * A.largo / 1.05 - f)) * (0.35 + 0.65 * (1 - suave(0.75, 1, u)));
  const pts = columna(A, th, (u) => 0.02 + 0.07 * suave(0.85, 1, u));
  encarar(pts, () => true);
  return { pts, cab: cabeza(A, pts, 0.05), boca: 0, lengua: f > 0.55 && f < 0.75 ? 1 : 0 };
}
function poseMuerte(A, f) {
  // Se afloja de rollo a curva suelta y al final se voltea un poco (enseña el vientre).
  const k = suave(0, 0.7, f), Rc = (A.largo * ENROSCA) / (2 * Math.PI * 1.05);
  const th = (u) => (1 - k) * (u < ENROSCA ? (u * A.largo) / Rc : (ENROSCA * A.largo) / Rc) + k * 0.9 * Math.sin(u * 3.2);
  const pts = columna(A, th, (u) => 0.02 + (1 - k) * 0.25 * suave(0.6, 1, u));
  encarar(pts, () => true);
  return { pts, cab: cabeza(A, pts, -0.1 * k), boca: 0.35 * suave(0.3, 0.6, f) * (1 - suave(0.8, 1, f)), lengua: 0 };
}
const ANIMACIONES_NAUYACA = {
  Reposo: { cuadros: 8, fps: 8, pose: (A, f) => poseRollo(A, f, { lengua: f > 0.4 && f < 0.7 ? Math.sin((f - 0.4) / 0.3 * Math.PI) : 0, cuello: 0.32 + 0.02 * Math.sin(2 * Math.PI * f) }) },
  Reptar: { cuadros: 8, fps: 12, pose: poseReptar },
  Aviso: { cuadros: 4, fps: 10, pose: (A, f) => poseRollo(A, 0, { cuello: 0.32 + 0.18 * f, alto: 0.34 + 0.12 * f, boca: 0.35 * f }) },
  Golpe: { cuadros: 5, fps: 16, pose: (A, f) => { const e = f < 0.6 ? suave(0, 0.6, f) : 1 - 0.6 * suave(0.6, 1, f); return poseRollo(A, 0, { extiende: e, alto: 0.4 - 0.25 * e, boca: 0.4 + 0.6 * Math.min(1, e * 1.3) }); } },
  Dano: { cuadros: 2, fps: 10, pose: (A, f) => poseRollo(A, 0, { cuello: 0.48, alto: 0.25, boca: 0.55, respira: 0.08 }) },
  Muerte: { cuadros: 6, fps: 8, pose: poseMuerte },
};

// ---------- Cuadrúpedos ----------
// Cuerpo, cuello y cabeza son cadenas de discos como la serpiente; cada pata, dos tramos (muslo y caña) cuya rodilla sale
// de una IK de dos huesos en el plano x-z, con la articulación hacia delante en las de delante y hacia atrás en las de atrás.
// Las patas del lado lejano se pintan detrás del cuerpo y más oscuras. Grupos: 0 cuerpo y cabeza, 1-4 patas.
const hash3 = (a, b, c) => { let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
function cadena(desde, hasta, n, r0, r1, extra) {
  const out = [];
  for (let i = 0; i <= n; i++) { const t = i / n; out.push({ x: desde.x + (hasta.x - desde.x) * t, y: desde.y + (hasta.y - desde.y) * t, z: desde.z + (hasta.z - desde.z) * t, r: r0 + (r1 - r0) * t, t, ...extra }); }
  return out;
}
// IK de dos huesos en el plano x-z: rodilla con la articulación hacia +x (delante) o −x (atrás).
function rodilla(H, F, l1, l2, haciaDelante) {
  const dx = F.x - H.x, dz = F.z - H.z, d = Math.min(Math.hypot(dx, dz), l1 + l2 - 1e-3), a = Math.atan2(dz, dx);
  const b = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))));
  const k1 = { x: H.x + Math.cos(a + b) * l1, z: H.z + Math.sin(a + b) * l1 }, k2 = { x: H.x + Math.cos(a - b) * l1, z: H.z + Math.sin(a - b) * l1 };
  return ((k1.x > k2.x) === haciaDelante ? k1 : k2);
}
// Etapa 39: zancada y alzada al andar subidas (~35-60 %): el paso apenas se leía a tamaño de juego.
// Paso de una pata con fase p (0-1): en el aire durante "vuelo" de la vuelta (adelanta), en el suelo el resto (atrasa).
function pisada(p, zancada, alzada, vuelo = 0.4) {
  p = ((p % 1) + 1) % 1;
  if (p < vuelo) { const s = p / vuelo; return { dx: zancada * (s - 0.5), dz: alzada * Math.sin(Math.PI * s) }; }
  const s = (p - vuelo) / (1 - vuelo); return { dx: zancada * (0.5 - s), dz: 0 };
}

function pintarCuadrupedo(A, L, pose) {
  const discos = [];
  pose.cuerpo.forEach((p) => discos.push({ ...p, grupo: 0, parte: 'cuerpo' }));
  pose.cabeza.forEach((p) => discos.push({ ...p, grupo: pose.grupoCabeza ?? 0, parte: 'cabeza' }));
  pose.patas.forEach((pata, k) => pata.forEach((p) => discos.push({ ...p, grupo: 1 + k, parte: 'pata', lejos: pata.lejos })));
  (pose.extra || []).forEach((p) => discos.push({ ...p, grupo: p.grupo ?? 0 })); // trompa, cola, aletas…
  // Vuelco (muerte): gira todo alrededor del eje x por el centro del cuerpo.
  if (pose.vuelco) { const c = Math.cos(pose.vuelco), s = Math.sin(pose.vuelco), z0 = 0.05; for (const p of discos) { const y = p.y, z = p.z - z0; p.y = y * c - z * s; p.z = Math.max(0.02, z0 + y * s + z * c); } }
  const ps = discos.map((p) => enPantalla(L, p));
  discos.forEach((p, i) => { const prof = p.y * 0.7454 - p.z * 0.6667; p.prof = prof; p.i = i; });
  const orden = discos.map((p, i) => i).sort((a, b) => discos[b].prof - discos[a].prof || a - b);
  const prof = new Float32Array(L.w * L.h).fill(1e9), grupo = new Int8Array(L.w * L.h).fill(-1);
  for (const k of orden) {
    const p = discos[k], [cx, cy] = ps[k], rp = Math.max(0.9, p.r * PPU);
    for (let y = Math.floor(cy - rp); y <= Math.ceil(cy + rp); y++) for (let x = Math.floor(cx - rp); x <= Math.ceil(cx + rp); x++) {
      if (x < 0 || y < 0 || x >= L.w || y >= L.h) continue;
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
      if (dx * dx + dy * dy > rp * rp) continue;
      const fx = dx / rp, fy = dy / rp, fz = Math.sqrt(Math.max(0, 1 - fx * fx - fy * fy));
      let luz = 0.16 + 0.84 * Math.max(0, fx * LUZ[0] + fy * LUZ[1] + fz * LUZ[2]);
      if (p.lejos) luz *= 0.62;
      const j = y * L.w + x;
      L.col[j] = A.color(p, { fx, fy, luz, x, y, rp, h: hash3(p.i >> 1, Math.round(fx * 3), Math.round(fy * 3)) });
      prof[j] = p.prof; grupo[j] = p.grupo; L.parte[j] = 1;
    }
  }
  // Rasgos encima de la piel (cresta, ojo, oreja, colmillos): los pone cada animal.
  A.rasgos?.(L, pose, (p) => enPantalla(L, p));
  // Contorno por fuera y línea donde una parte tapa a otra que está detrás (pata delante del cuerpo, etc.).
  const fuera = [], separa = [];
  for (let y = 0; y < L.h; y++) for (let x = 0; x < L.w; x++) {
    const j = y * L.w + x, vec = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([a, b]) => x + a >= 0 && y + b >= 0 && x + a < L.w && y + b < L.h).map(([a, b]) => (y + b) * L.w + x + a);
    if (!L.col[j]) { if (vec.some((q) => L.col[q] && L.parte[q] !== 3)) fuera.push(j); continue; }
    if (grupo[j] >= 0 && vec.some((q) => grupo[q] >= 0 && grupo[q] !== grupo[j] && prof[q] > prof[j] + 0.04)) separa.push(j);
  }
  for (const j of fuera) L.col[j] = A.contorno;
  for (const j of separa) L.col[j] = A.separa;
}

// ---------- Pecarí de collar (Dicotyles tajacu) ----------
// Pelo áspero gris pardo jaspeado, collar claro que baja del lomo al cuello, hocico de cerdo con disco, orejas cortas,
// patas finas con pezuñas. Asustado o enfadado eriza la cresta del lomo y castañetea los dientes.
const PECARI = {
  pelo: ramp('#211c17', '#352e27', '#4b4237', '#635849', '#7c705d', '#968a74'),
  jaspe: ramp('#8a806c', '#a69c86', '#c0b7a0'), collar: ramp('#7b7466', '#9d9584', '#bdb5a2', '#d6cfbb'),
  hocico: ramp('#2a1d1b', '#43302c', '#5e4740', '#7a6158'), pezuna: ramp('#120e0c', '#231c18', '#3a302a'),
  contorno: hex('#0e0b09'), separa: hex('#17120f'), ojo: hex('#0a0705'), brillo: hex('#e8dcc4'), colmillo: hex('#efe8d6'),
  cerda: hex('#15110e'), puntaCerda: hex('#8e8574'), orejaDentro: hex('#4d3934'),
  color(p, q) {
    if (p.parte === 'pata') return p.t > 0.86 ? tono(this.pezuna, q.luz, q.x, q.y) : tono(this.pelo, q.luz * 0.92, q.x, q.y);
    if (p.parte === 'cabeza' && p.t > 0.86) return tono(this.hocico, q.luz, q.x, q.y); // el disco del hocico
    // Collar: banda clara que baja en diagonal desde el lomo, por delante de los hombros, hasta la garganta.
    if (p.parte === 'cuerpo' && Math.abs(p.u - 0.8 - q.fy * 0.09) < 0.075 && q.fy > -0.9) return tono(this.collar, q.luz * 1.05, q.x, q.y);
    const grano = hash3(q.x, q.y, 11);
    if (p.parte === 'cuerpo' && q.fy < -0.62) return tono(this.pelo, q.luz * 0.55, q.x, q.y); // crin oscura del lomo
    if (grano > 0.88) return tono(this.jaspe, q.luz, q.x, q.y); // pelos claros sueltos (jaspeado)
    if (grano < 0.1) return tono(this.pelo, q.luz * 0.7, q.x, q.y);
    return tono(this.pelo, q.luz * (p.parte === 'cabeza' ? 0.88 : 1), q.x, q.y);
  },
  rasgos(L, pose, P) {
    const pon = (x, y, c) => { x = Math.round(x); y = Math.round(y); if (c && x >= 0 && y >= 0 && x < L.w && y < L.h) { L.col[y * L.w + x] = c; L.parte[y * L.w + x] = 3; } };
    if (pose.vuelco > 0.6) return;
    // Cresta: cerdas del cuello a la grupa, más altas en la cruz; erizadas apuntan arriba, en reposo se tumban hacia atrás.
    pose.cuerpo.forEach((p, i) => {
      if (p.u < 0.1) return;
      const [x, y] = P(p), base = (0.8 + pose.eriza * 4) * Math.sin(Math.PI * Math.min(1, (p.u - 0.08) / 0.88)), inc = 1 - pose.eriza * 0.8;
      for (const [o, k] of [[-1.3, 0.7], [0, 1], [1.3, 0.8]]) {
        const alto = base * k * (0.8 + 0.4 * hash3(i, o * 10, 3));
        for (let s = 0; s <= alto; s += 0.5) pon(x + o - inc * s * 0.9, y - p.r * PPU + 0.6 - s, s > alto - 0.8 && pose.eriza > 0.3 ? this.puntaCerda : this.cerda);
      }
    });
    const c = pose.cabeza, ojo = P(c[Math.round(c.length * 0.42)]), base = P(c[2]), nuca = [base[0], base[1] - c[2].r * PPU + 2];
    // Oreja corta y redondeada detrás del ojo.
    for (let s = 0; s < 4; s++) { pon(nuca[0] + 1 - s * 0.4, nuca[1] - 2 - s, this.contorno); pon(nuca[0] + 2 - s * 0.4, nuca[1] - 2 - s, s < 3 ? this.orejaDentro : this.contorno); pon(nuca[0] + 3 - s * 0.4, nuca[1] - 2 - s, s < 2 ? this.contorno : null); }
    pon(ojo[0], ojo[1] - 1, this.ojo); pon(ojo[0] + 1, ojo[1] - 1, this.ojo); pon(ojo[0] + 1, ojo[1] - 2, this.brillo);
    // Boca y colmillos al castañetear o morder.
    if (pose.boca > 0.1) { const h = P(c[c.length - 2]); pon(h[0] - 2, h[1] + 2, this.contorno); pon(h[0] - 3, h[1] + 2 + pose.boca * 2, this.colmillo); pon(h[0] - 1, h[1] + 3 + pose.boca * 2, this.contorno); }
  },
};
const PATAS = [ // cadera/hombro (x, y), fase del trote y del galope, de delante
  { x: 0.24, y: -0.085, trote: 0, galope: 0.5, delante: true }, { x: 0.24, y: 0.085, trote: 0.5, galope: 0.6, delante: true },
  { x: -0.3, y: -0.085, trote: 0.5, galope: 0, delante: false }, { x: -0.3, y: 0.085, trote: 0, galope: 0.1, delante: false },
];
// Pose del pecarí: f fase; marcha 'quieto' | 'trote' | 'galope'; cabeza baja (hozar) o alta; eriza la cresta 0-1.
function posePecari(f, { marcha = 'quieto', baja = 0, alza = 0, eriza = 0, boca = 0, sacude = 0, atras = 0, vuelco = 0, respira = 0.02 } = {}) {
  const galope = marcha === 'galope', trote = marcha === 'trote';
  const bote = galope ? 0.035 * Math.sin(2 * Math.PI * f) : trote ? 0.018 * Math.abs(Math.sin(2 * Math.PI * f)) : respira * 0.5 * Math.sin(2 * Math.PI * f);
  const cabeceo = galope ? 0.08 * Math.sin(2 * Math.PI * f + 1) : 0, zc = 0.4 + bote - atras * 0.04;
  // Cuerpo de la grupa (u = 0) a la cruz (u = 1): barril con la grupa alta y el pecho hondo.
  const cuerpo = [];
  for (let i = 0; i <= 12; i++) {
    const u = i / 12, x = -0.42 + 0.76 * u - atras * 0.05;
    const r = 0.085 + 0.05 * u + 0.04 * Math.sin(Math.PI * Math.min(1, u * 1.05));
    cuerpo.push({ x, y: 0, z: zc + 0.03 * Math.sin(Math.PI * u) + cabeceo * (u - 0.5) * 0.4, r: r * (1 + respira * Math.sin(2 * Math.PI * f)), u });
  }
  // Cuello y cabeza: de la cruz al hocico; baja para hozar y se alza al avisar; sacude de lado a lado.
  const cruz = cuerpo.at(-1), ang = -0.35 - baja * 0.75 + alza * 0.55 + cabeceo + sacude * 0.12 * Math.sin(2 * Math.PI * f * 2);
  const hocico = { x: cruz.x + 0.34 * Math.cos(ang), y: 0, z: cruz.z + 0.0 + 0.34 * Math.sin(ang) };
  const cabeza = cadena({ x: cruz.x + 0.03, y: 0, z: cruz.z + 0.02 }, hocico, 10, 0.125, 0.045).map((p) => ({ ...p, r: p.t > 0.88 ? 0.05 : p.r }));
  // Patas.
  const patas = PATAS.map((P) => {
    const H = { x: P.x + (P.delante ? 0 : -atras * 0.05), z: zc - 0.03 };
    const fase = f + (galope ? P.galope : P.trote), paso = marcha === 'quieto' ? { dx: 0, dz: 0 } : pisada(fase, galope ? 0.36 : 0.3, galope ? 0.1 : 0.11, galope ? 0.45 : 0.4);
    const F = { x: H.x + paso.dx + (P.delante ? 0.02 : -0.02), z: Math.max(0.02, paso.dz + 0.02) }, K = rodilla(H, F, 0.2, 0.19, P.delante);
    const pata = [...cadena({ ...H, y: P.y }, { ...K, y: P.y }, 4, 0.05, 0.032), ...cadena({ ...K, y: P.y }, { ...F, y: P.y }, 5, 0.028, 0.022).slice(1)];
    pata.forEach((p, i, a) => { p.t = i / (a.length - 1); });
    pata.lejos = P.y > 0;
    return pata;
  });
  return { cuerpo, cabeza, patas, eriza, boca, vuelco };
}
const ANIMACIONES_PECARI = {
  Reposo: { cuadros: 8, fps: 8, pose: (A, f) => posePecari(f, { baja: 0.7 + 0.25 * Math.sin(2 * Math.PI * f * 2) }) }, // hoza
  Trote: { cuadros: 8, fps: 12, pose: (A, f) => posePecari(f, { marcha: 'trote', baja: 0.15 }) },
  Carga: { cuadros: 6, fps: 16, pose: (A, f) => posePecari(f, { marcha: 'galope', baja: 0.45, eriza: 1 }) },
  Aviso: { cuadros: 4, fps: 12, pose: (A, f) => posePecari(f, { alza: 0.3, eriza: Math.min(1, 0.4 + f), boca: f % 0.5 < 0.25 ? 1 : 0, sacude: 1 }) },
  Ataque: { cuadros: 4, fps: 14, pose: (A, f) => posePecari(0, { alza: 0.9 * Math.sin(Math.PI * f), baja: f < 0.3 ? 0.4 : 0, eriza: 1, boca: f > 0.2 && f < 0.8 ? 1 : 0 }) },
  Dano: { cuadros: 2, fps: 10, pose: (A, f) => posePecari(0, { atras: 1, alza: 0.4, eriza: 0.6 }) },
  Muerte: { cuadros: 6, fps: 8, pose: (A, f) => posePecari(0, { vuelco: -1.4 * suave(0, 0.75, f), baja: 0.4 * f }) }, // cae de lado, con las patas hacia atrás
};

// ---------- Tapir centroamericano (Tapirus bairdii) ----------
// Grande y pesado: cuerpo en pera con la grupa alta, pelo corto pardo oscuro, mejillas y garganta crema, trompa corta y
// móvil, orejas redondas con borde blanco, cola corta y patas gruesas con dedos de uña clara.
const TAPIR = {
  pelo: ramp('#1a1512', '#29211c', '#3a2f28', '#4c3f35', '#605044', '#776353'),
  crema: ramp('#4f473c', '#6f6556', '#8f8572', '#ada28c', '#c4b9a2'),
  trompa: ramp('#1c1614', '#2e2420', '#41342e', '#56463e'), una: ramp('#2a2420', '#4a413a', '#8a7f70'),
  contorno: hex('#0c0907'), separa: hex('#15100d'), ojo: hex('#080504'), brillo: hex('#e6dcc6'), bordeOreja: hex('#ddd6c6'),
  orejaDentro: hex('#3a2c26'),
  color(p, q) {
    const grano = hash3(q.x, q.y, 5);
    if (p.parte === 'pata') return p.t > 0.88 ? tono(this.una, q.luz, q.x, q.y) : tono(this.pelo, q.luz * 0.9, q.x, q.y);
    if (p.parte === 'trompa') return tono(this.trompa, q.luz, q.x, q.y);
    if (p.parte === 'cola') return tono(this.pelo, q.luz * 0.8, q.x, q.y);
    // Mejillas y garganta crema: la mitad de abajo de la cabeza y el cuello.
    if (p.parte === 'cabeza' && q.fy > 0.15 - p.t * 0.2) return tono(this.crema, q.luz * 1.05, q.x, q.y);
    if (p.parte === 'cuerpo' && p.u > 0.88 && q.fy > 0.35) return tono(this.crema, q.luz * 0.85, q.x, q.y);
    const brillo = p.parte === 'cuerpo' && q.fy < -0.35 && q.fx < 0.2 ? 1.12 : 1; // lustre del pelo corto en el lomo
    return tono(this.pelo, q.luz * brillo * (grano > 0.92 ? 1.18 : grano < 0.06 ? 0.8 : 1), q.x, q.y);
  },
  rasgos(L, pose, P) {
    const pon = (x, y, c) => { x = Math.round(x); y = Math.round(y); if (c && x >= 0 && y >= 0 && x < L.w && y < L.h) { L.col[y * L.w + x] = c; L.parte[y * L.w + x] = 3; } };
    if (pose.caido > 0.85) return;
    const c = pose.cabeza, ojo = P(c[Math.round(c.length * 0.5)]), base = P(c[1]), ro = c[1].r * PPU;
    // Oreja redonda y erguida (se mueve un poco), con borde blanco.
    // Óvalo de 7 × 10 px que asoma por encima de la nuca, un poco echado atrás; el borde blanco y el interior oscuro.
    const ox = base[0] - 2 + pose.oreja, oy = base[1] - ro + 2;
    for (let dy = -10; dy <= 0; dy++) for (let dx = -4; dx <= 4; dx++) {
      const e = (dx * dx) / 11 + ((dy + 5) * (dy + 5)) / 26;
      if (e > 1) continue;
      pon(ox + dx - (dy + 5) * 0.3, oy + dy, e > 0.6 ? this.bordeOreja : e > 0.45 ? this.contorno : this.orejaDentro);
    }
    pon(ojo[0], ojo[1] - 2, this.ojo); pon(ojo[0] + 1, ojo[1] - 2, this.ojo); pon(ojo[0], ojo[1] - 3, this.brillo);
  },
};
const PATAS_TAPIR = [
  { x: 0.5, y: -0.16, paso: 0.25, delante: true }, { x: 0.5, y: 0.16, paso: 0.75, delante: true },
  { x: -0.58, y: -0.16, paso: 0, delante: false }, { x: -0.58, y: 0.16, paso: 0.5, delante: false },
];
// Pose del tapir. marcha 'quieto' | 'paso' | 'carga'; encabrita (0-1) alza la delantera sobre las caderas; caido (0-1) se
// desploma (dobla las patas y apoya el vientre); trompa: ángulo extra de la trompa; alza: cabeza arriba.
function poseTapir(f, { marcha = 'quieto', encabrita = 0, caido = 0, trompa = 0, alza = 0, baja = 0, respira = 0.015, oreja = 0 } = {}) {
  const carga = marcha === 'carga', anda = marcha !== 'quieto';
  const bote = carga ? 0.04 * Math.abs(Math.sin(2 * Math.PI * f)) : anda ? 0.02 * Math.sin(4 * Math.PI * f) : respira * Math.sin(2 * Math.PI * f) * 0.6;
  const zc = 0.72 + bote - caido * 0.42;
  const cuerpo = [];
  for (let i = 0; i <= 14; i++) {
    const u = i / 14, x = -0.78 + 1.42 * u;
    // Pera: la grupa más alta y gruesa que los hombros.
    const r = 0.27 + 0.1 * Math.sin(Math.PI * Math.min(1, u * 1.15)) - 0.07 * u;
    cuerpo.push({ x, y: 0, z: zc + 0.06 * (1 - u) + 0.04 * Math.sin(Math.PI * u), r: r * (1 + respira * Math.sin(2 * Math.PI * f)), u });
  }
  const cruz = cuerpo.at(-1), ang = -0.62 + alza * 0.6 - baja * 0.5 + (carga ? -0.15 : 0) + 0.04 * Math.sin(2 * Math.PI * f);
  const fin = { x: cruz.x + 0.5 * Math.cos(ang), y: 0, z: cruz.z + 0.08 + 0.5 * Math.sin(ang) };
  const cabeza = cadena({ x: cruz.x - 0.02, y: 0, z: cruz.z + 0.1 }, fin, 11, 0.21, 0.085).map((p) => ({ ...p, parte: 'cabeza', r: p.r * (1 + 0.12 * Math.sin(Math.PI * p.t)) }));
  // Trompa: corta, cae hacia abajo y se mueve (oliendo).
  const at = ang - 0.55 + trompa + 0.12 * Math.sin(2 * Math.PI * f * 2);
  const punta = { x: fin.x + 0.2 * Math.cos(at), y: 0, z: fin.z + 0.2 * Math.sin(at) };
  const extra = [...cadena(fin, punta, 5, 0.075, 0.05, { parte: 'trompa' }),
    ...cadena({ x: cuerpo[0].x - 0.02, y: 0, z: cuerpo[0].z + 0.08 }, { x: cuerpo[0].x - 0.13, y: 0, z: cuerpo[0].z - 0.04 }, 3, 0.05, 0.03, { parte: 'cola' })];
  const patas = PATAS_TAPIR.map((P) => {
    const H = { x: P.x, z: zc - 0.08 }, ph = f + P.paso;
    const paso = !anda ? { dx: 0, dz: 0 } : pisada(carga ? f + (P.delante ? 0.5 : 0) + (P.y > 0 ? 0.1 : 0) : ph, carga ? 0.55 : 0.46, carga ? 0.16 : 0.14, carga ? 0.42 : 0.3);
    let F = { x: H.x + paso.dx + (P.delante ? 0.03 : -0.03), z: Math.max(0.03, paso.dz + 0.03) };
    if (caido > 0) F = { x: H.x + (P.delante ? 0.22 : -0.22) * caido, z: 0.03 }; // se le doblan
    const K = rodilla(H, F, 0.33, 0.315, P.delante);
    const pata = [...cadena({ ...H, y: P.y }, { ...K, y: P.y }, 5, 0.11, 0.08), ...cadena({ ...K, y: P.y }, { ...F, y: P.y }, 5, 0.075, 0.07).slice(1)];
    pata.forEach((p, i, a) => { p.t = i / (a.length - 1); });
    pata.lejos = P.y > 0; pata.delante = P.delante;
    return pata;
  });
  // Encabritarse: gira la delantera (cuerpo, cabeza, trompa y patas de delante) sobre las caderas; las manos cuelgan.
  if (encabrita > 0) {
    const a = encabrita * 0.42, cx = PATAS_TAPIR[2].x, cz = zc - 0.08, c = Math.cos(a), s = Math.sin(a);
    const gira = (p) => { const dx = p.x - cx, dz = p.z - cz; p.x = cx + dx * c - dz * s; p.z = cz + dx * s + dz * c; };
    [...cuerpo, ...cabeza, ...extra].forEach(gira);
    for (const pata of patas) if (pata.delante) {
      const H0 = { x: pata[0].x, z: pata[0].z }; gira(H0);
      const F = { x: H0.x + 0.18, z: H0.z - 0.5 }, K = rodilla(H0, F, 0.33, 0.315, true);
      const nueva = [...cadena({ ...H0, y: pata[0].y }, { ...K, y: pata[0].y }, 5, 0.11, 0.08), ...cadena({ ...K, y: pata[0].y }, { ...F, y: pata[0].y }, 5, 0.075, 0.07).slice(1)];
      nueva.forEach((p, i, arr) => { p.t = i / (arr.length - 1); });
      pata.splice(0, pata.length, ...nueva);
    }
  }
  return { cuerpo, cabeza, patas, extra, caido, oreja, eriza: 0, boca: 0, vuelco: 0 };
}
const ANIMACIONES_TAPIR = {
  Reposo: { cuadros: 8, fps: 7, pose: (A, f) => poseTapir(f, { baja: 0.25, oreja: f > 0.6 && f < 0.75 ? -1 : 0 }) },
  Paso: { cuadros: 8, fps: 9, pose: (A, f) => poseTapir(f, { marcha: 'paso' }) },
  Carga: { cuadros: 6, fps: 13, pose: (A, f) => poseTapir(f, { marcha: 'carga', baja: 0.35, trompa: -0.25 }) },
  Aviso: { cuadros: 4, fps: 10, pose: (A, f) => poseTapir(f, { alza: 0.7, trompa: 0.9 * Math.sin(Math.PI * f), oreja: 1 }) }, // silba con la trompa en alto
  Pisoton: { cuadros: 6, fps: 12, pose: (A, f) => poseTapir(0, { encabrita: f < 0.55 ? suave(0, 0.55, f) : 1 - suave(0.55, 0.75, f), alza: 0.6, trompa: 0.6 }) },
  Dano: { cuadros: 2, fps: 10, pose: (A, f) => poseTapir(0, { alza: 0.4, trompa: 0.5, encabrita: 0.12 }) },
  Muerte: { cuadros: 6, fps: 7, pose: (A, f) => poseTapir(0, { caido: suave(0, 0.8, f), baja: 0.9 * f, trompa: -0.3 * f }) },
};

// ---------- Ocelote (Leopardus pardalis) ----------
// Felino mediano: leonado con rosetas negras alargadas en cadena (centro más oscuro), vientre blanco, dos rayas negras en
// la mejilla, patas moteadas, cola anillada, orejas redondeadas negras por detrás con mancha blanca, ojos ámbar.
// Las rosetas se calculan sobre el cuerpo (a lo largo de la columna y a lo alto del tubo), no sobre la pantalla: así no
// bailan de un cuadro a otro.
const OCELOTE = {
  pelo: ramp('#3a2714', '#59391c', '#7b5428', '#9b6f36', '#b98a48', '#d2a760'),
  centro: ramp('#43301a', '#634526', '#835c32'), negro: ramp('#0f0905', '#1f150c', '#2f2214'),
  blanco: ramp('#8b8473', '#b4ab97', '#d6cfbc', '#ebe5d6'), nariz: hex('#b46e68'),
  contorno: hex('#0d0905'), separa: hex('#1a120a'), ojo: hex('#d0a13c'), pupila: hex('#0b0704'), brillo: hex('#f6edd4'),
  orejaNegra: hex('#120c07'), orejaBlanca: hex('#e9e2d0'), boca: hex('#7a2f2f'), colmillo: hex('#f3eee0'),
  roseta(s, v, k) { // celda en (s, v); devuelve 'anillo' | 'centro' | null
    const fila = Math.floor(v), ss = s + (fila & 1) * 0.5, col = Math.floor(ss);
    const jx = (hash3(col, fila, k) - 0.5) * 0.3, jy = (hash3(col, fila, k + 1) - 0.5) * 0.3;
    const dx = (ss - col - 0.5 - jx) * 0.75, dy = v - fila - 0.5 - jy, d = Math.hypot(dx, dy), abierta = hash3(col, fila, k + 2) < 0.35;
    if (d < 0.4 && d > 0.24 && !(abierta && dx > 0.1)) return 'anillo';
    return d <= 0.24 ? 'centro' : null;
  },
  color(p, q) {
    const g = hash3(q.x, q.y, 9);
    if (p.parte === 'pata') {
      return hash3(Math.round(p.t * 7), Math.round(q.fx * 1.5), p.grupo) > 0.72 ? tono(this.negro, q.luz, q.x, q.y) : tono(this.pelo, q.luz * 0.95, q.x, q.y);
    }
    if (p.parte === 'cola') return (Math.floor(p.t * 7) % 2 && p.t > 0.25) || p.t > 0.92 ? tono(this.negro, q.luz, q.x, q.y) : tono(this.pelo, q.luz, q.x, q.y);
    if (p.parte === 'cabeza') {
      if (p.t > 0.93 && q.fy > -0.2) return this.nariz;
      if (q.fy > 0.42) return tono(this.blanco, q.luz, q.x, q.y); // hocico y barbilla blancos
      if (p.t > 0.35 && p.t < 0.85 && (Math.abs(q.fy - 0.12) < 0.09 || Math.abs(q.fy - 0.32) < 0.07)) return tono(this.negro, q.luz, q.x, q.y); // rayas de la mejilla
      if (q.fy < -0.3 && g > 0.82) return tono(this.negro, q.luz, q.x, q.y); // motas de la frente
      return tono(this.pelo, q.luz, q.x, q.y);
    }
    // Cuerpo: vientre blanco con motas; flancos con rosetas en cadena; lomo con dos rayas.
    const u = p.u + (q.fx * q.rp) / 34;
    if (q.fy > 0.55) return hash3(Math.round(u * 14), Math.round(q.fy * 3), 4) > 0.8 ? tono(this.negro, q.luz, q.x, q.y) : tono(this.blanco, q.luz, q.x, q.y);
    if (q.fy < -0.62 && Math.abs(((u * 9) % 1) - 0.5) < 0.32) return tono(this.negro, q.luz, q.x, q.y);
    const r = this.roseta(u * 6, (q.fy + 0.62) * 1.75, 21);
    if (r === 'anillo') return tono(this.negro, q.luz, q.x, q.y);
    if (r === 'centro') return tono(this.centro, q.luz, q.x, q.y);
    return tono(this.pelo, q.luz * (g > 0.93 ? 1.1 : 1), q.x, q.y);
  },
  rasgos(L, pose, P) {
    const pon = (x, y, c) => { x = Math.round(x); y = Math.round(y); if (c && x >= 0 && y >= 0 && x < L.w && y < L.h) { L.col[y * L.w + x] = c; L.parte[y * L.w + x] = 3; } };
    if (pose.caido > 0.85) return;
    const c = pose.cabeza, ojo = P(c[Math.round(c.length * 0.55)]), base = P(c[2]), ro = c[2].r * PPU;
    // Oreja redondeada; si las aplana (aviso), se tumba hacia atrás.
    const ox = base[0] - 1, oy = base[1] - ro + 1, plana = pose.orejas || 0;
    for (let s = 0; s < 5; s++) for (let w = -1; w <= 1; w++) {
      const x = ox + w - s * (0.35 + plana * 0.9), y = oy - s * (1 - plana * 0.65);
      pon(x, y, s === 4 || Math.abs(w) === 1 ? this.contorno : s === 2 && w === 0 ? this.orejaBlanca : this.orejaNegra);
    }
    // Ojo ámbar con pupila y brillo.
    pon(ojo[0], ojo[1] - 1, this.ojo); pon(ojo[0] + 1, ojo[1] - 1, this.ojo); pon(ojo[0] + 1, ojo[1] - 1, this.pupila); pon(ojo[0], ojo[1] - 2, this.brillo);
    if (pose.boca > 0.1) { const h = P(c[c.length - 2]); for (let k = 0; k <= 2 * pose.boca + 1; k++) pon(h[0] - 1 - k * 0.6, h[1] + 2 + k * 0.4, this.boca); pon(h[0] - 1, h[1] + 2, this.colmillo); pon(h[0] - 2, h[1] + 3 + pose.boca, this.colmillo); }
  },
};
const PATAS_OCELOTE = [
  { x: 0.24, y: -0.065, paso: 0.25, galope: 0.5, delante: true }, { x: 0.24, y: 0.065, paso: 0.75, galope: 0.62, delante: true },
  { x: -0.3, y: -0.065, paso: 0, galope: 0, delante: false }, { x: -0.3, y: 0.065, paso: 0.5, galope: 0.12, delante: false },
];
// Pose del ocelote. marcha 'quieto' | 'paso' | 'galope'; agacha (0-1) baja el cuerpo; salta (0-1) estira el cuerpo con las
// manos delante y los pies atrás (el arco del salto lo pone el juego); zarpa (0-1) alza y lanza la mano de delante.
function poseOcelote(f, { marcha = 'quieto', agacha = 0, salta = 0, zarpa = 0, caido = 0, alza = 0, boca = 0, orejas = 0, cola = 0, respira = 0.02 } = {}) {
  const galope = marcha === 'galope', anda = marcha !== 'quieto';
  const flexion = galope ? 0.07 * Math.sin(2 * Math.PI * f) : 0; // la columna se encoge y se estira al galope
  const zc = 0.37 - agacha * 0.13 - caido * 0.26 + (galope ? 0.02 * Math.abs(Math.sin(2 * Math.PI * f)) : 0) + respira * 0.3 * Math.sin(2 * Math.PI * f);
  const largo = 0.66 + salta * 0.14 + flexion;
  const cuerpo = [];
  for (let i = 0; i <= 12; i++) {
    const u = i / 12, x = -0.36 + largo * u;
    cuerpo.push({ x, y: 0, z: zc + 0.02 * Math.sin(Math.PI * u) * (1 - salta) + salta * 0.05 * (u - 0.5), r: (0.095 + 0.035 * Math.sin(Math.PI * u) + 0.02 * u) * (1 + respira * Math.sin(2 * Math.PI * f)), u });
  }
  const cruz = cuerpo.at(-1), ang = 0.12 - agacha * 0.35 + alza * 0.4 - salta * 0.1 + 0.05 * Math.sin(2 * Math.PI * f);
  const hocico = { x: cruz.x + 0.2 * Math.cos(ang), y: 0, z: cruz.z + 0.08 + 0.2 * Math.sin(ang) };
  const cabeza = cadena({ x: cruz.x + 0.02, y: 0, z: cruz.z + 0.06 }, hocico, 9, 0.1, 0.05).map((p) => ({ ...p, parte: 'cabeza', r: p.r * (1 + 0.45 * Math.sin(Math.PI * Math.min(1, p.t * 1.25))) }));
  // Cola larga y anillada: baja desde la grupa y sube en la punta; se mece.
  const extra = []; let tx = cuerpo[0].x, tz = cuerpo[0].z + 0.03, ta = Math.PI + 1.25 - salta * 0.9 + cola;
  for (let i = 0; i <= 10; i++) {
    const t = i / 10; extra.push({ x: tx, y: 0.01, z: Math.max(0.03, tz), r: 0.036 - 0.012 * t, t, parte: 'cola' });
    ta += (-0.26 + 0.12 * Math.sin(2 * Math.PI * f + t * 3)) * (1 - salta * 0.6);
    tx += Math.cos(ta) * 0.045; tz += Math.sin(ta) * 0.045;
  }
  const patas = PATAS_OCELOTE.map((P) => {
    const H = { x: P.x + (P.delante ? largo - 0.66 : 0), z: zc - 0.03 };
    let F;
    if (salta > 0) F = P.delante ? { x: H.x + 0.12 + 0.2 * salta, z: H.z - 0.3 + 0.12 * salta } : { x: H.x - 0.1 - 0.22 * salta, z: H.z - 0.31 + 0.1 * salta };
    else {
      const paso = !anda ? { dx: 0, dz: 0 } : pisada(f + (galope ? P.galope : P.paso), galope ? 0.4 : 0.3, galope ? 0.12 : 0.1, galope ? 0.45 : 0.32);
      F = { x: H.x + paso.dx, z: Math.max(0.02, paso.dz + 0.02) };
      if (caido > 0) F = { x: H.x + (P.delante ? 0.22 : -0.2) * caido, z: 0.02 };
      if (zarpa > 0 && P.delante && P.y < 0) F = { x: H.x + 0.12 + 0.2 * zarpa, z: H.z - 0.05 + 0.1 * Math.sin(Math.PI * zarpa) };
    }
    const K = rodilla(H, F, 0.18, 0.18, P.delante);
    const pata = [...cadena({ ...H, y: P.y }, { ...K, y: P.y }, 4, 0.045, 0.03), ...cadena({ ...K, y: P.y }, { ...F, y: P.y }, 4, 0.027, 0.03).slice(1)];
    pata.forEach((p, i, a) => { p.t = i / (a.length - 1); });
    pata.lejos = P.y > 0;
    return pata;
  });
  return { cuerpo, cabeza, patas, extra, caido, boca, orejas, eriza: 0, vuelco: 0 };
}
const ANIMACIONES_OCELOTE = {
  Reposo: { cuadros: 8, fps: 7, pose: (A, f) => poseOcelote(f, { alza: 0.15, cola: 0.1 * Math.sin(2 * Math.PI * f) }) },
  Acecho: { cuadros: 8, fps: 8, pose: (A, f) => poseOcelote(f, { marcha: 'paso', agacha: 0.8, cola: -0.2 }) }, // agazapado
  Correr: { cuadros: 6, fps: 14, pose: (A, f) => poseOcelote(f, { marcha: 'galope', agacha: 0.2 }) },
  Aviso: { cuadros: 4, fps: 10, pose: (A, f) => poseOcelote(f * 2, { agacha: 0.95, boca: 1, orejas: 1, cola: 0.25 * Math.sin(4 * Math.PI * f) }) }, // bufa y menea la grupa
  Salto: { cuadros: 5, fps: 12, pose: (A, f) => poseOcelote(0, { salta: Math.sin(Math.PI * Math.min(1, f * 1.15)), boca: 0.6, orejas: 0.4 }) },
  Zarpazo: { cuadros: 4, fps: 14, pose: (A, f) => poseOcelote(0, { agacha: 0.3, zarpa: Math.sin(Math.PI * f), boca: 1, orejas: 0.6 }) },
  Dano: { cuadros: 2, fps: 10, pose: (A, f) => poseOcelote(0, { agacha: 0.5, orejas: 1, boca: 0.8 }) },
  Muerte: { cuadros: 6, fps: 8, pose: (A, f) => poseOcelote(0, { caido: suave(0, 0.8, f), agacha: 0.3 * f }) },
};

// ---------- Mono aullador de manto (Alouatta palliata mexicana) ----------
// Negro, con un manto de pelo largo pardo dorado en los flancos; cara desnuda oscura con barba, ojos pequeños, cola prensil
// larga. Se sienta erguido, anda a cuatro patas, aúlla con la cabeza en alto y la boca muy abierta, y lanza frutos.
// Esqueleto de primate: el torso (pelvis → pecho) gira de erguido (sentado) a horizontal (a cuatro patas); brazos y
// piernas de dos tramos con IK; cabeza redonda; cola por discos.
const MONO = {
  negro: ramp('#0b0908', '#171310', '#241e19', '#322a23', '#43382e', '#56493c'),
  manto: ramp('#4a3319', '#6c4d26', '#8f6b36', '#b08a4a', '#cba862'), cara: ramp('#2f2420', '#45362f', '#5d4a40', '#6f5a4e'),
  contorno: hex('#070505'), separa: hex('#3a3029'), ojo: hex('#5a3a1c'), brillo: hex('#e9dcc2'), boca: hex('#6a2626'), diente: hex('#efe8d8'),
  fruto: ramp('#5e3a0e', '#9a6418', '#d0912a', '#f0bb4a'),
  color(p, q) {
    const g = hash3(q.x, q.y, 13);
    if (p.parte === 'fruto') return tono(this.fruto, q.luz, q.x, q.y);
    if (p.parte === 'pata' && !p.lejos) return tono(this.negro, Math.min(1, q.luz * 1.35 + 0.08), q.x, q.y); // brazo y pierna de este lado, que se lean sobre el cuerpo
    if (p.parte === 'cabeza') {
      if (p.t > 0.55 && q.fy > -0.35) return tono(this.cara, q.luz, q.x, q.y); // cara desnuda
      if (p.t > 0.4 && q.fy > 0.45) return tono(this.negro, q.luz * 0.8, q.x, q.y); // barba
      return tono(this.negro, q.luz, q.x, q.y);
    }
    if (p.parte === 'cuerpo') {
      // Manto: pelo largo en los flancos, con mechones verticales.
      if (q.fy > -0.2 && q.fy < 0.9 && p.u > 0.12 && p.u < 0.92) { const mecha = hash3(Math.round(q.x / 1.6), 0, 17); if (mecha > 0.2) return tono(this.manto, q.luz * (mecha > 0.7 ? 1.15 : 0.9), q.x, q.y); }
    }
    return tono(this.negro, q.luz * (g > 0.9 ? 1.25 : 1), q.x, q.y);
  },
  rasgos(L, pose, P) {
    const pon = (x, y, c) => { x = Math.round(x); y = Math.round(y); if (c && x >= 0 && y >= 0 && x < L.w && y < L.h) { L.col[y * L.w + x] = c; L.parte[y * L.w + x] = 3; } };
    if (pose.caido > 0.85) return;
    const c = pose.cabeza, cara = P(c[Math.round(c.length * 0.72)]), r = c[Math.round(c.length * 0.72)].r * PPU;
    const ux = Math.cos(pose.mira), uy = -Math.sin(pose.mira); // hacia dónde mira la cara, en pantalla
    pon(cara[0] + ux * r * 0.3, cara[1] + uy * r * 0.3 - 1, this.ojo); pon(cara[0] + ux * r * 0.3, cara[1] + uy * r * 0.3 - 2, this.brillo);
    if (pose.boca > 0.1) { // boca redonda del aullido
      const bx = cara[0] + ux * r * 0.55, by = cara[1] + uy * r * 0.55 + 1.5, R = 0.8 + pose.boca * 1.6;
      for (let dy = -R; dy <= R; dy += 0.5) for (let dx = -R * 0.8; dx <= R * 0.8; dx += 0.5) if (dx * dx / (R * R * 0.64) + dy * dy / (R * R) <= 1) pon(bx + dx, by + dy, this.boca);
      pon(bx, by - R, this.diente); pon(bx - 1, by - R, this.diente);
    }
  },
};
// Pose del mono. modo 'sentado' | 'anda' | 'corre'; aulla (0-1) alza la cabeza y abre la boca; lanza (−1 atrás … 1
// delante) mueve el brazo de lanzar; caido (0-1) se desploma de lado.
function poseMono(f, { modo = 'sentado', aulla = 0, lanza = null, caido = 0, encoge = 0, respira = 0.03 } = {}) {
  const anda = modo !== 'sentado', corre = modo === 'corre';
  const bote = anda ? (corre ? 0.035 : 0.02) * Math.abs(Math.sin(2 * Math.PI * f)) : respira * 0.2 * Math.sin(2 * Math.PI * f);
  // Torso: de la pelvis al pecho, con su inclinación (π/2 erguido, ~0,15 a cuatro patas).
  const incl = anda ? 0.18 + (corre ? 0.05 * Math.sin(2 * Math.PI * f) : 0) : 1.25 - encoge * 0.3 - caido * 1.1, largoT = 0.36;
  const pelvis = anda ? { x: -0.2, z: 0.3 + bote } : { x: -0.04, z: 0.14 - caido * 0.06 };
  const pecho = { x: pelvis.x + largoT * Math.cos(incl), z: pelvis.z + largoT * Math.sin(incl) };
  const cuerpo = cadena({ ...pelvis, y: 0 }, { ...pecho, y: 0 }, 9, 0.12, 0.13).map((p, i, a) => ({ ...p, u: i / (a.length - 1), r: p.r * (1 + 0.15 * Math.sin(Math.PI * p.t)) * (1 + respira * Math.sin(2 * Math.PI * f)) }));
  // Cabeza: delante y arriba del pecho; al aullar se alza.
  const mira = anda ? -0.1 : 0.15 + aulla * 0.75;
  const nuca = { x: pecho.x + 0.07 * Math.cos(incl) + 0.03, z: pecho.z + 0.1 };
  const cara = { x: nuca.x + 0.14 * Math.cos(mira), z: nuca.z + 0.14 * Math.sin(mira) };
  const cabeza = cadena({ ...nuca, y: 0 }, { ...cara, y: 0 }, 7, 0.075, 0.06).map((p) => ({ ...p, parte: 'cabeza', r: p.r * (1 + 0.35 * Math.sin(Math.PI * p.t)) }));
  // Cola prensil: sale de la pelvis hacia atrás y se enrosca en la punta.
  const extra = []; let tx = pelvis.x - 0.06, tz = pelvis.z + 0.03, ta = anda ? Math.PI - 0.7 : Math.PI - 0.95;
  for (let i = 0; i <= 13; i++) {
    const t = i / 13; extra.push({ x: tx, y: 0.03, z: Math.max(0.03, tz), r: 0.035 - 0.013 * t, t, parte: 'cola' });
    ta += (anda ? 0.13 : 0.19) + (t > 0.8 ? 0.3 : 0) + 0.05 * Math.sin(2 * Math.PI * f + t * 4);
    tx += Math.cos(ta) * 0.05; tz += Math.sin(ta) * 0.05;
  }
  // Extremidades: [raíz, pie o mano, longitudes, rodilla hacia delante?, lado y].
  const miembro = (R, F, l1, l2, delante, y, r0, r1) => {
    const K = rodilla(R, F, l1, l2, delante);
    const m = [...cadena({ ...R, y }, { ...K, y }, 4, r0, r1), ...cadena({ ...K, y }, { ...F, y }, 4, r1 * 0.9, r1 * 0.85).slice(1)];
    m.forEach((p, i, a) => { p.t = i / (a.length - 1); }); m.lejos = y > 0; return m;
  };
  const patas = [];
  for (const y of [-0.15, 0.1]) {
    const lado = y < 0 ? 0 : 0.5;
    // Piernas.
    const cad = { x: pelvis.x, z: pelvis.z - 0.02 };
    let pie;
    if (anda) { const s = pisada(f + lado, corre ? 0.34 : 0.3, corre ? 0.1 : 0.1, corre ? 0.45 : 0.35); pie = { x: cad.x + s.dx, z: Math.max(0.02, s.dz + 0.02) }; }
    else pie = { x: cad.x + 0.2 + caido * 0.05, z: 0.02 };
    patas.push(miembro(cad, pie, 0.19, 0.18, anda ? false : true, y, 0.05, 0.036));
    // Brazos (largos): a cuatro patas apoyan; sentado descansan delante, salvo el de lanzar.
    const hombro = { x: pecho.x - 0.02, z: pecho.z - 0.03 };
    let mano;
    if (anda) { const s = pisada(f + lado + 0.5, corre ? 0.34 : 0.3, corre ? 0.1 : 0.1, corre ? 0.45 : 0.35); mano = { x: hombro.x + s.dx + 0.04, z: Math.max(0.02, s.dz + 0.02) }; }
    else if (lanza !== null && y < 0) { const a = 1.9 - lanza * 1.55; mano = { x: hombro.x + 0.3 * Math.cos(a), z: hombro.z + 0.3 * Math.sin(a) }; }
    else mano = { x: hombro.x + 0.2, z: Math.max(0.02, hombro.z - 0.32 + aulla * 0.12) };
    const brazo = miembro(hombro, mano, 0.21, 0.2, !anda, y - 0.03 * Math.sign(y), 0.038, 0.028);
    patas.push(brazo);
    if (lanza !== null && y < 0 && lanza < 0.6) extra.push({ ...mano, y: y - 0.02, r: 0.05, parte: 'fruto' }); // el fruto, hasta soltarlo
  }
  return { cuerpo, cabeza, patas, extra, caido, boca: aulla, mira, eriza: 0, vuelco: caido > 0 ? -1.2 * caido : 0, grupoCabeza: 7 };
}
const ANIMACIONES_MONO = {
  Reposo: { cuadros: 8, fps: 6, pose: (A, f) => poseMono(f, {}) },
  Anda: { cuadros: 8, fps: 10, pose: (A, f) => poseMono(f, { modo: 'anda' }) },
  Corre: { cuadros: 6, fps: 14, pose: (A, f) => poseMono(f, { modo: 'corre' }) },
  Aviso: { cuadros: 4, fps: 8, pose: (A, f) => poseMono(f, { encoge: f, aulla: 0.2 * f }) }, // toma aire
  Aullido: { cuadros: 6, fps: 10, pose: (A, f) => poseMono(f, { aulla: 0.75 + 0.25 * Math.sin(2 * Math.PI * f * 2) }) },
  Lanza: { cuadros: 5, fps: 12, pose: (A, f) => poseMono(0, { lanza: -1 + 2.2 * suave(0, 0.85, f) }) },
  Dano: { cuadros: 2, fps: 10, pose: (A, f) => poseMono(0, { encoge: 1, aulla: 0.4 }) },
  Muerte: { cuadros: 6, fps: 8, pose: (A, f) => poseMono(0, { caido: suave(0, 0.8, f) }) },
};

// ---------- Armadillo de nueve bandas (Dasypus novemcinctus) ----------
// Coraza en cúpula: escudo de escamas delante (hombros) y detrás (grupa), nueve bandas móviles en medio; cabeza fina con
// escudo, hocico largo y orejas altas; cola larga anillada; piel rosácea con pocos pelos por debajo; uñas largas.
const ARMADILLO = {
  coraza: ramp('#3b3128', '#584a3c', '#766452', '#93806a', '#ae9b83', '#c7b59c'), banda: ramp('#1c1611', '#2b221a', '#3b2f24'),
  piel: ramp('#6b4f48', '#8c6c63', '#a98a7f', '#c3a69a'), una: ramp('#2a2420', '#4d443c', '#7a6f62'),
  contorno: hex('#0f0b08'), separa: hex('#1e1712'), ojo: hex('#0b0706'), brillo: hex('#efe4cc'), orejaDentro: hex('#7d5d55'),
  color(p, q) {
    if (p.parte === 'pata') return p.t > 0.86 ? tono(this.una, q.luz, q.x, q.y) : tono(this.piel, q.luz * 0.85, q.x, q.y);
    if (p.parte === 'cola') return Math.floor(p.t * 11) % 2 ? tono(this.banda, q.luz, q.x, q.y) : tono(this.coraza, q.luz * 0.95, q.x, q.y);
    if (p.parte === 'cabeza') {
      if (p.t > 0.92) return tono(this.piel, q.luz * 0.9, q.x, q.y); // punta del hocico
      if (q.fy > 0.35) return tono(this.piel, q.luz, q.x, q.y);
      return (hash3(Math.round(p.t * 9), Math.round(q.fx * 2), 3) > 0.55 ? tono(this.coraza, q.luz, q.x, q.y) : tono(this.coraza, q.luz * 0.85, q.x, q.y)); // escudo de la cabeza
    }
    // Cuerpo: por debajo, piel; arriba, la coraza con sus escudos y bandas.
    if (q.fy > 0.58) return tono(this.piel, q.luz, q.x, q.y);
    const u = p.u + (q.fx * q.rp) / 26;
    if (q.fy > 0.42) return tono(this.banda, q.luz, q.x, q.y); // borde inferior de la coraza
    // Bandas móviles: el animal tiene nueve, pero a 22 px de cuerpo no caben; se dibujan cinco de unos 2 px.
    if (u > 0.26 && u < 0.74) {
      const b = ((u - 0.26) / 0.48) * 5, f = b - Math.floor(b);
      return f < 0.38 ? tono(this.banda, q.luz, q.x, q.y) : tono(this.coraza, q.luz * (f > 0.7 ? 1.18 : 0.95), q.x, q.y); // cada placa, más clara en su borde
    }
    // Escudos: escamas en rombo (rejilla girada) con el centro claro y la junta oscura.
    const s = u * 22, v = (q.fy + 1) * 4, a = s + v, c = s - v, fa = a - Math.floor(a), fc = c - Math.floor(c);
    return Math.min(fa, 1 - fa, fc, 1 - fc) < 0.12 ? tono(this.banda, q.luz, q.x, q.y) : tono(this.coraza, q.luz, q.x, q.y);
  },
  rasgos(L, pose, P) {
    const pon = (x, y, c) => { x = Math.round(x); y = Math.round(y); if (c && x >= 0 && y >= 0 && x < L.w && y < L.h) { L.col[y * L.w + x] = c; L.parte[y * L.w + x] = 3; } };
    if (pose.vuelco < -0.6 || pose.encoge > 0.8 || pose.bajoTierra) return;
    const c = pose.cabeza, base = P(c[2]), ro = c[2].r * PPU, ojo = P(c[Math.round(c.length * 0.45)]);
    // Orejas altas y estrechas, un poco echadas atrás (dos: la lejana asoma detrás).
    for (const [dx, col] of [[1.5, this.separa], [0, null]]) for (let s = 0; s < 7; s++) for (let w = 0; w <= 1; w++) {
      const x = base[0] - 1 + dx - s * 0.45 + w, y = base[1] - ro + 1 - s;
      pon(x, y, s === 6 || w === 1 ? this.contorno : col || (s > 1 ? this.orejaDentro : this.piel[1]));
    }
    pon(ojo[0], ojo[1] - 1, this.ojo); pon(ojo[0] + 1, ojo[1] - 2, this.brillo);
  },
};
const PATAS_ARMADILLO = [
  { x: 0.13, y: -0.07, paso: 0.25, delante: true }, { x: 0.13, y: 0.07, paso: 0.75, delante: true },
  { x: -0.15, y: -0.07, paso: 0, delante: false }, { x: -0.15, y: 0.07, paso: 0.5, delante: false },
];
// Pose del armadillo. marcha 'quieto' | 'paso' | 'carrera'; erguido (0-1) se alza sobre las patas de atrás para olfatear;
// encoge (0-1) mete cabeza y patas bajo la coraza; excava (0-1) hunde el hocico y escarba con las manos; vuelco: patas arriba.
function poseArmadillo(f, { marcha = 'quieto', erguido = 0, encoge = 0, excava = 0, vuelco = 0, olfatea = 1, respira = 0.02 } = {}) {
  const anda = marcha !== 'quieto', corre = marcha === 'carrera';
  const zc = 0.17 - encoge * 0.1 + (anda ? 0.012 * Math.abs(Math.sin(2 * Math.PI * f * 2)) : 0);
  const cuerpo = [];
  for (let i = 0; i <= 12; i++) {
    const u = i / 12, x = -0.24 + 0.46 * u;
    cuerpo.push({ x, y: 0, z: zc + 0.03 * Math.sin(Math.PI * u), r: (0.1 + 0.035 * Math.sin(Math.PI * u)) * (1 + respira * Math.sin(2 * Math.PI * f)) * (1 + encoge * 0.1), u });
  }
  const cruz = cuerpo.at(-1), ang = -0.35 - excava * 0.7 + 0.08 * olfatea * Math.sin(2 * Math.PI * f * 2) - encoge * 0.9;
  const largoC = 0.2 * (1 - encoge * 0.6), hocico = { x: cruz.x + largoC * Math.cos(ang), y: 0, z: cruz.z + 0.01 + largoC * Math.sin(ang) };
  const cabeza = cadena({ x: cruz.x + 0.01, y: 0, z: cruz.z + 0.02 }, hocico, 8, 0.06, 0.022).map((p) => ({ ...p, parte: 'cabeza' }));
  // Cola larga, arrastrando un poco; encogido se pega a la coraza.
  const extra = []; let tx = cuerpo[0].x, tz = cuerpo[0].z - 0.02, ta = Math.PI + 0.35 - encoge * 1.2;
  for (let i = 0; i <= 9; i++) {
    const t = i / 9; extra.push({ x: tx, y: 0.005, z: Math.max(0.025, tz), r: 0.032 - 0.02 * t, t, parte: 'cola' });
    ta += -0.05 + 0.03 * Math.sin(2 * Math.PI * f + t * 3) + encoge * 0.12; tx += Math.cos(ta) * 0.04; tz += Math.sin(ta) * 0.04;
  }
  const patas = PATAS_ARMADILLO.map((P) => {
    const H = { x: P.x, z: zc - 0.04 };
    let F;
    if (encoge > 0) F = { x: H.x * (1 - 0.6 * encoge), z: Math.max(0.02, H.z - 0.1 * (1 - encoge) - 0.04) };
    else if (excava > 0 && P.delante) { const s = Math.sin(2 * Math.PI * f * 2 + (P.y > 0 ? Math.PI : 0)); F = { x: H.x + 0.08 + 0.05 * s, z: 0.02 + 0.03 * Math.max(0, s) }; }
    else { const s = !anda ? { dx: 0, dz: 0 } : pisada(f * (corre ? 2 : 1) + P.paso, corre ? 0.14 : 0.13, corre ? 0.05 : 0.055, 0.38); F = { x: H.x + s.dx, z: Math.max(0.02, s.dz + 0.02) }; }
    const K = rodilla(H, F, 0.075, 0.075, P.delante);
    const pata = [...cadena({ ...H, y: P.y }, { ...K, y: P.y }, 3, 0.04, 0.028), ...cadena({ ...K, y: P.y }, { ...F, y: P.y }, 3, 0.025, 0.022).slice(1)];
    pata.forEach((p, i, a) => { p.t = i / (a.length - 1); }); pata.lejos = P.y > 0; pata.delante = P.delante;
    return pata;
  });
  // Erguirse: gira cuerpo y cabeza sobre las caderas; las manos cuelgan.
  if (erguido > 0) {
    const a = erguido * 1.05, cx = PATAS_ARMADILLO[2].x, cz = zc - 0.04, co = Math.cos(a), si = Math.sin(a);
    const gira = (p) => { const dx = p.x - cx, dz = p.z - cz; p.x = cx + dx * co - dz * si; p.z = cz + dx * si + dz * co; };
    [...cuerpo, ...cabeza].forEach(gira); extra.forEach((p) => { p.z = Math.max(0.025, p.z - erguido * 0.05); });
    for (const pata of patas) if (pata.delante) { const H0 = { x: pata[0].x, z: pata[0].z }; gira(H0); pata.forEach((p, i, arr) => { const t = i / (arr.length - 1); p.x = H0.x + 0.05 * t; p.z = H0.z - 0.12 * t; }); }
  }
  return { cuerpo, cabeza, patas, extra, encoge, vuelco, caido: 0, eriza: 0, boca: 0 };
}
const ANIMACIONES_ARMADILLO = {
  Reposo: { cuadros: 8, fps: 8, pose: (A, f) => poseArmadillo(f, {}) }, // olfatea
  Paso: { cuadros: 8, fps: 14, pose: (A, f) => poseArmadillo(f, { marcha: 'paso' }) },
  Carrera: { cuadros: 6, fps: 16, pose: (A, f) => poseArmadillo(f, { marcha: 'carrera', olfatea: 0 }) },
  Aviso: { cuadros: 4, fps: 8, pose: (A, f) => poseArmadillo(f, { erguido: suave(0, 0.6, f) * 0.9 }) }, // se alza para olfatear
  Excava: { cuadros: 6, fps: 14, pose: (A, f) => poseArmadillo(f, { excava: 1, olfatea: 0 }) },
  Salto: { cuadros: 4, fps: 10, pose: (A, f) => poseArmadillo(0, { marcha: 'quieto', olfatea: 0, erguido: 0.15 * Math.sin(Math.PI * f) }) },
  Encoge: { cuadros: 3, fps: 12, pose: (A, f) => poseArmadillo(0, { encoge: suave(0, 0.67, f), olfatea: 0 }) },
  Dano: { cuadros: 2, fps: 10, pose: (A, f) => poseArmadillo(0, { encoge: 0.4 }) },
  Muerte: { cuadros: 6, fps: 8, pose: (A, f) => poseArmadillo(0, { vuelco: -2.6 * suave(0, 0.8, f), olfatea: 0 }) }, // queda panza arriba
};

// ---------- Pejelagarto (Atractosteus tropicus) ----------
// Pez de los ríos y pantanos de Tabasco: cuerpo largo y cilíndrico cubierto de escamas ganoideas en rombo, lomo pardo
// oliva con manchas oscuras, vientre crema, hocico largo y ancho como de lagarto con dientes, aletas dorsal y anal muy
// atrás, frente a frente, y cola redondeada. Respira aire: sube a la superficie a tragarlo. Ataca de lado, de golpe.
const PEJE = {
  cuerpo: ramp('#1b1f12', '#283020', '#38412a', '#4c5636', '#636d45', '#7d8656'),
  vientre: ramp('#7e7856', '#a19b75', '#c3be96', '#dcd8b4'), mancha: ramp('#11140b', '#1b2013', '#262c1b'),
  aleta: ramp('#2d2a1b', '#4a4430', '#6a614a', '#877d61'), contorno: hex('#0a0c06'), separa: hex('#141a0e'),
  iris: hex('#c9a248'), ojo: hex('#0a0805'), brillo: hex('#f1ead0'), diente: hex('#ece6d2'), boca: hex('#6e3430'),
  color(p, q) {
    const g = hash3(q.x, q.y, 13);
    if (p.parte === 'aleta') return hash3(Math.round(p.t * 5), p.k || 0, 8) > 0.7 ? tono(this.mancha, q.luz, q.x, q.y) : tono(this.aleta, q.luz, q.x, q.y);
    if (p.parte === 'mandibula') return tono(this.vientre, q.luz * 0.85, q.x, q.y);
    if (p.parte === 'cabeza') {
      if (q.fy > 0.3) return tono(this.vientre, q.luz * 0.9, q.x, q.y);
      return q.fy < -0.1 && g > 0.86 ? tono(this.mancha, q.luz, q.x, q.y) : tono(this.cuerpo, q.luz, q.x, q.y); // motas finas del hocico
    }
    // Cuerpo: vientre crema; flancos con manchas oscuras en hilera y escamas en rombo (rejilla girada, junta oscura).
    if (q.fy > 0.5) return tono(this.vientre, q.luz, q.x, q.y);
    const u = p.u + (q.fx * q.rp) / 36, v = (q.fy + 1) * 2.2, fila = Math.floor(v), col = Math.floor(u * 9 + (fila & 1) * 0.5);
    const cx = (col + 0.5 - (fila & 1) * 0.5) / 9, dm = Math.hypot((u - cx) * 9 * 0.8, v - fila - 0.5);
    if (q.fy > -0.75 && dm < 0.3 + 0.12 * hash3(col, fila, 4) && hash3(col, fila, 5) > 0.3) return tono(this.mancha, q.luz, q.x, q.y);
    const s = u * 30, w = (q.fy + 1) * 5, a = s + w, c = s - w, fa = a - Math.floor(a), fc = c - Math.floor(c);
    if (Math.min(fa, 1 - fa, fc, 1 - fc) < 0.1) return tono(this.cuerpo, q.luz * 0.72, q.x, q.y);
    return tono(this.cuerpo, q.luz * (q.fy < -0.55 ? 0.82 : 1), q.x, q.y); // el lomo, más oscuro
  },
  rasgos(L, pose, P) {
    const pon = (x, y, c) => { x = Math.round(x); y = Math.round(y); if (c && x >= 0 && y >= 0 && x < L.w && y < L.h) { L.col[y * L.w + x] = c; L.parte[y * L.w + x] = 3; } };
    if (Math.abs(pose.volcado) > 1.2 && pose.muerto) return;
    const c = pose.cabeza, ojo = P(c[Math.round(c.length * 0.18)]), op = P(c[0]), ro = c[0].r * PPU;
    // Opérculo: arco oscuro detrás del ojo.
    for (let s = -1; s <= 1; s++) pon(op[0] + 1 - Math.abs(s) * 0.5, op[1] + s * ro * 0.5, this.separa);
    pon(ojo[0], ojo[1] - 1, this.iris); pon(ojo[0] + 1, ojo[1] - 1, this.ojo); pon(ojo[0], ojo[1] - 2, this.brillo);
    // Boca abierta: dientes en el borde de las dos mandíbulas.
    if (pose.boca > 0.15) {
      const m = pose.mandibula;
      for (const k of [0.45, 0.6, 0.75, 0.9]) {
        const a = P(c[Math.round(k * (c.length - 1))]), b = P(m[Math.round(k * (m.length - 1))]);
        pon(a[0], a[1] + 1, this.diente); pon(b[0], b[1] - 1, this.diente);
      }
    }
  },
};
// Pose del pejelagarto. La columna integra el rumbo (th, de lado) y la inclinación (ph, arriba) de la cola (u = 0) al
// opérculo (u = 1). ondula: nado (onda que crece hacia la cola); curva: C de lado; ese: S de lado (antes de lanzarse);
// cabecea: alza la parte de delante; gira: tuerce la cabeza de lado (mordida); boca 0-1; vuelco: de lado / panza arriba.
function posePeje(f, { ondula = 0, curva = 0, ese = 0, cabecea = 0, gira = 0, boca = 0, vuelco = 0, alto = 0, aleteo = 1, muerto = false } = {}) {
  const LARGO = 0.84, n = 16, ds = LARGO / n, sp = [];
  let x = 0, y = 0, z = 0.095 + alto;
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const th = ondula * (0.2 + 0.8 * (1 - u)) * Math.sin(2 * Math.PI * (1.1 * u - f)) + curva * (u - 0.5) * 2 + ese * Math.sin(2 * Math.PI * u) + gira * suave(0.7, 1, u);
    const ph = cabecea * suave(0.45, 1, u);
    if (i) { x += Math.cos(ph) * Math.cos(th) * ds; y += Math.cos(ph) * Math.sin(th) * ds; z += Math.sin(ph) * ds; }
    sp.push({ x, y, z, th, ph, u, r: 0.032 + 0.058 * suave(0, 0.45, u) - 0.01 * suave(0.85, 1, u) });
  }
  // Centrar en la mitad del cuerpo.
  const { x: mx, y: my } = sp[Math.round(n * 0.55)]; for (const p of sp) { p.x -= mx; p.y -= my; }
  const cuerpo = sp.map((p) => ({ x: p.x, y: p.y, z: p.z, r: p.r, u: p.u, parte: 'cuerpo' }));
  // Cabeza: cráneo y hocico largo en la dirección del último tramo; la mandíbula de abajo gira desde la bisagra.
  const a = sp.at(-1), th = a.th + gira * 0.4, ph = a.ph + boca * 0.12, d = (ang) => ({ x: Math.cos(ang) * Math.cos(th), y: Math.cos(ang) * Math.sin(th), z: Math.sin(ang) });
  const D = d(ph), H = { x: a.x + D.x * 0.08, y: a.y + D.y * 0.08, z: a.z - 0.03 }, Dm = d(ph - boca * 0.75);
  const cabeza = cadena(a, { x: a.x + D.x * 0.36, y: a.y + D.y * 0.36, z: a.z + D.z * 0.36 }, 12, 0, 0, { parte: 'cabeza' }).map((p) => ({ ...p, r: p.t < 0.3 ? 0.078 - 0.11 * p.t : 0.045 - 0.026 * (p.t - 0.3) / 0.7 }));
  const mandibula = cadena(H, { x: H.x + Dm.x * 0.27, y: H.y + Dm.y * 0.27, z: Math.max(0.02, H.z + Dm.z * 0.27) }, 9, 0.034, 0.018, { parte: 'mandibula', grupo: 6 });
  // Aletas (grupo 5): dorsal y anal muy atrás, ventrales, pectorales que aletean y la caudal redondeada en abanico.
  const en = (u) => sp[Math.round(u * n)], aleta = (desde, hacia, r0, r1, k) => cadena(desde, hacia, 4, r0, r1, { parte: 'aleta', grupo: 5, k });
  const extra = [...mandibula], dorsal = en(0.2), ventral = en(0.55), pecho = en(0.94), cola = sp[0];
  extra.push(...aleta({ ...dorsal, z: dorsal.z + dorsal.r * 0.8 }, { x: dorsal.x - 0.1, y: dorsal.y, z: dorsal.z + dorsal.r + 0.07 }, 0.024, 0.014, 1));
  extra.push(...aleta({ ...dorsal, z: dorsal.z - dorsal.r * 0.8 }, { x: dorsal.x - 0.1, y: dorsal.y, z: Math.max(0.02, dorsal.z - dorsal.r - 0.06) }, 0.024, 0.014, 2));
  extra.push(...aleta({ ...ventral, z: ventral.z - ventral.r * 0.7 }, { x: ventral.x - 0.07, y: ventral.y, z: Math.max(0.02, ventral.z - ventral.r - 0.04) }, 0.02, 0.012, 3));
  const flap = 0.04 * aleteo * Math.sin(2 * Math.PI * f * 2);
  for (const lado of [-1, 1]) extra.push(...aleta({ x: pecho.x, y: pecho.y + lado * pecho.r * 0.6, z: pecho.z - pecho.r * 0.5 }, { x: pecho.x - 0.08, y: pecho.y + lado * (pecho.r + 0.03), z: Math.max(0.02, pecho.z - pecho.r - 0.03 + flap * lado) }, 0.02, 0.013, 4));
  const tc = cola.th + Math.PI;
  for (let k = -2; k <= 2; k++) { const ang = k * 0.24 + 0.08; extra.push(...aleta(cola, { x: cola.x + Math.cos(tc) * Math.cos(ang) * 0.17, y: cola.y + Math.sin(tc) * Math.cos(ang) * 0.17, z: cola.z + Math.sin(ang) * 0.17 }, 0.02, 0.03, 10 + k)); }
  // Vuelco aquí (como el del pintor, sobre el eje x) y no en el pintor: así el ojo y los dientes de rasgos() giran con él.
  if (vuelco) { const c = Math.cos(vuelco), s = Math.sin(vuelco), z0 = 0.05; for (const p of [...cuerpo, ...cabeza, ...extra]) { const yy = p.y, zz = p.z - z0; p.y = yy * c - zz * s; p.z = Math.max(0.02, z0 + yy * s + zz * c); } }
  return { cuerpo, cabeza, patas: [], extra, mandibula, boca, vuelco: 0, volcado: vuelco, muerto, caido: 0, eriza: 0 };
}
const ANIMACIONES_PEJE = {
  Nada: { cuadros: 8, fps: 10, pose: (A, f) => posePeje(f, { ondula: 0.2 }) },
  Respira: { cuadros: 6, fps: 8, pose: (A, f) => posePeje(f, { ondula: 0.05, cabecea: 0.55 * Math.sin(Math.PI * f), boca: Math.pow(Math.sin(Math.PI * Math.min(1, f * 1.4)), 2) * 0.8 }) }, // sube el hocico y traga aire
  Aviso: { cuadros: 4, fps: 10, pose: (A, f) => posePeje(f, { ese: 0.42 * suave(0, 0.75, f), boca: 0.25 * f, aleteo: 2 }) }, // se arquea en S
  Embiste: { cuadros: 5, fps: 14, pose: (A, f) => posePeje(f, { cabecea: 0.15 - 0.3 * f, boca: f < 0.6 ? suave(0, 0.5, f) : 1 - suave(0.6, 0.9, f), aleteo: 0 }) },
  Mordida: { cuadros: 4, fps: 14, pose: (A, f) => posePeje(f, { gira: -0.9 * Math.sin(Math.PI * f), curva: 0.2 * Math.sin(Math.PI * f), boca: f < 0.5 ? 1 : 1 - suave(0.5, 0.8, f) }) }, // golpe de lado
  Varado: { cuadros: 6, fps: 12, pose: (A, f) => posePeje(f, { vuelco: -1.3, curva: 0.7 * Math.sin(2 * Math.PI * f), alto: 0.06 * Math.abs(Math.sin(2 * Math.PI * f)), boca: 0.45 * Math.abs(Math.sin(2 * Math.PI * f + 1)), aleteo: 2 }) }, // coletea en tierra
  Dano: { cuadros: 2, fps: 10, pose: (A, f) => posePeje(f, { curva: 0.35, boca: 0.5 }) },
  Muerte: { cuadros: 6, fps: 8, pose: (A, f) => posePeje(0, { vuelco: -Math.PI * suave(0, 0.85, f), curva: 0.25 * (1 - f), boca: 0.3, aleteo: 0, muerto: f > 0.5 }) }, // queda panza arriba
};

// ---------- Salida ----------
const ANIMALES = [
  // escala: el Guardián jugable mide 1,12 m (unos 2/3 de una persona); los animales, modelados en metros reales, se reducen
  // a esa escala (algo menos los pequeños, para que se lean). La nauyaca, sub-jefe, se queda grande a propósito.
  { nombre: 'Nauyaca', A: NAUYACA, animaciones: ANIMACIONES_NAUYACA, w: 200, h: 112, ox: 76, oy: 78, escala: 0.85, pintar: pintarSerpiente },
  { nombre: 'Pecari', A: PECARI, animaciones: ANIMACIONES_PECARI, w: 80, h: 64, ox: 36, oy: 50, escala: 0.72, pintar: pintarCuadrupedo },
  { nombre: 'Tapir', A: TAPIR, animaciones: ANIMACIONES_TAPIR, w: 152, h: 104, ox: 70, oy: 84, escala: 0.7, pintar: pintarCuadrupedo },
  { nombre: 'Ocelote', A: OCELOTE, animaciones: ANIMACIONES_OCELOTE, w: 96, h: 72, ox: 48, oy: 58, escala: 0.72, pintar: pintarCuadrupedo },
  { nombre: 'Aullador', A: MONO, animaciones: ANIMACIONES_MONO, w: 80, h: 72, ox: 42, oy: 60, escala: 0.72, pintar: pintarCuadrupedo },
  { nombre: 'Armadillo', A: ARMADILLO, animaciones: ANIMACIONES_ARMADILLO, w: 72, h: 52, ox: 36, oy: 40, escala: 0.62, pintar: pintarCuadrupedo },
  { nombre: 'Pejelagarto', A: PEJE, animaciones: ANIMACIONES_PEJE, w: 100, h: 60, ox: 48, oy: 42, escala: 0.72, pintar: pintarCuadrupedo },
];
mkdirSync(join(aqui, 'arte/Animales'), { recursive: true });
const datos = {}, hoja = [];
for (const an0 of ANIMALES) {
  // Lienzo y pivote a la escala del animal (con un margen de 4 px), y la proyección a esa escala.
  const k = an0.escala || 1, an = { ...an0, w: Math.ceil(an0.w * k) + 4, h: Math.ceil(an0.h * k) + 4, ox: Math.round(an0.ox * k) + 2, oy: Math.round(an0.oy * k) + 2 };
  PPU = BASE.PPU * k; PX_Y = BASE.PX_Y * k; PX_Z = BASE.PX_Z * k;
  const fila = [];
  for (const [anim, def] of Object.entries(an.animaciones)) {
    for (let k = 0; k < def.cuadros; k++) {
      const L = lienzo(an.w, an.h); L.ox = an.ox; L.oy = an.oy;
      an.pintar(an.A, L, def.pose(an.A, def.cuadros > 1 ? k / def.cuadros : 0));
      const px = Buffer.alloc(an.w * an.h * 4);
      L.col.forEach((c, i) => { if (c) { px[i * 4] = c[0]; px[i * 4 + 1] = c[1]; px[i * 4 + 2] = c[2]; px[i * 4 + 3] = 255; } });
      const nombre = `${an.nombre}_${anim}_${k + 1}`;
      escribir(join(aqui, 'arte/Animales', nombre + '.png'), { w: an.w, h: an.h, px });
      fila.push({ w: an.w, h: an.h, px });
    }
    datos[an.nombre] = { ...(datos[an.nombre] || {}), [anim]: { cuadros: def.cuadros, fps: def.fps } };
  }
  datos[an.nombre].pivote = [an.ox / an.w, +(1 - an.oy / an.h).toFixed(4)];
  hoja.push({ an, fila });
}
writeFileSync(join(aqui, 'datos/animales.js'), `// Generado por herramientas/animales.mjs: animaciones de los animales dibujados por código (solo HTML).
// ANIMALES[animal][animación] = { cuadros, fps }; cada cuadro es arte/Animales/<animal>_<animación>_<n>.png.
const ANIMALES = ${JSON.stringify(datos)};
for (const [a, d] of Object.entries(ANIMALES)) for (const [anim, v] of Object.entries(d)) if (v.cuadros)
  for (let k = 1; k <= v.cuadros; k++) SPRITES[\`\${a}_\${anim}_\${k}\`] = [\`arte/Animales/\${a}_\${anim}_\${k}.png\`, d.pivote[0], d.pivote[1], 48];
`);
// Hojas de revisión (una por animal: <ruta>_<Animal>.png): todos los cuadros, ×3, sobre gris.
const ruta = process.argv[2];
if (ruta) for (const { an, fila } of hoja) {
  const E = 3, cw = an.w, ch = an.h, porFila = 8, filas = Array.from({ length: Math.ceil(fila.length / porFila) }, (_, i) => fila.slice(i * porFila, i * porFila + porFila));
  const W = porFila * cw * E, H = filas.length * ch * E, px = Buffer.alloc(W * H * 4);
  for (let i = 0; i < W * H; i++) px.set([88, 92, 84, 255], i * 4);
  filas.forEach((f, r) => f.forEach((im, c) => { for (let y = 0; y < ch * E; y++) for (let x = 0; x < cw * E; x++) { const q = ((y / E | 0) * cw + (x / E | 0)) * 4; if (im.px[q + 3]) px.set(im.px.subarray(q, q + 3), ((r * ch * E + y) * W + c * cw * E + x) * 4); } }));
  escribir(ruta.replace(/.png$/, '') + '_' + an.nombre + '.png', { w: W, h: H, px });
}
console.log(Object.entries(datos).map(([a, d]) => `${a}: ${Object.entries(d).filter(([, v]) => v.cuadros).map(([k, v]) => `${k} ×${v.cuadros}`).join(', ')}`).join('\n'));
