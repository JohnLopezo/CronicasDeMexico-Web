'use strict';
// Mundo: arma una región desde su JSON de Unity (suelo, agua, objetos y colisiones) y la dibuja.

// Huella (x, y del flujo) de los obstáculos; el primer prefijo que coincide gana. Copia de PixelArtSceneBuilder.Obstacles.
const OBSTACULOS = [
  ['Casa_Bajareque_03', 1.5, 1.5], ['Casa_Bajareque', 2.4, 1.8], ['Altar_Trono', 2.1, 1.4], ['Estela_Grande', 0.9, 0.35],
  ['Estela_Lisa', 0.55, 0.25], ['Cerca_Basalto_Y', 0.35, 1.1], ['Cerca_Basalto', 1.1, 0.35], ['Palma_Corozo', 0.3, 0.3],
  ['Roca_Basalto', 0.45, 0.45], ['Escombros_Basalto', 0.6, 0.6], ['Fogon', 0.6, 0.6], ['Ceiba', 0.6, 0.6], ['Vasijas', 0.5, 0.5],
  ['Tronco_Caido_01', 0.9, 0.5], ['Tronco_Caido_02', 0.45, 0.45], ['Entrada_Estructura', 3.8, 2.9], ['Cestos', 0.5, 0.5],
  ['Lena', 0.6, 0.55], ['Cerca_Varas_02', 0.25, 1.1], ['Cerca_Varas', 1.1, 0.25], ['Poste_Manta', 1.0, 0.25],
  ['Roca_Musgo', 0.75, 0.75], ['Tronco_Grueso', 1.3, 0.5], ['Muro_Basalto_Y', 0.3, 1], ['Muro_Basalto', 1, 0.3],
  ['Santuario_Memoria', 1.3, 0.9], ['Estrado_Ofrenda', 1.8, 1.6], ['Santuario_Vida', 0.8, 0.8],
];
// Obstáculos de varias piezas: centro respecto al objeto y huella. La escalera solo bloquea en el pórtico.
// La enramada solo bloquea en los postes y los enseres: bajo el techo se camina.
const POSTES = [[-0.9, -0.6], [-0.9, 0.6], [0.9, -0.6], [0.9, 0.6]].map(([x, y]) => [x, y, 0.15, 0.15]);
const COMPUESTOS = { Escalera_Subida_01: [[0, 0.65, 2, 0.5]], Enramada_01: [...POSTES, [-0.39, 0.36, 0.45, 0.3], [0.45, 0.38, 0.45, 0.35]] };
// Capas que se ordenan por la profundidad de otro punto (DepthAnchors) y techos bajo los que se pasa (Roofs).
const ANCLAS = { Enramada_Poste: [0.9, -0.6] };
const TECHOS = { Enramada_Techo: [1.3, 1] };
const caja = (x, y, w, h) => [x - w / 2, y - h / 2, x + w / 2, y + h / 2];
const PASO = 0.35; // altura que se sube sin rampa (step offset del CharacterController)
// Orden de dibujo: distancia a la cámara a lo largo de su mirada (más alto = más cerca). Mayor se dibuja antes.
const profundidad = (y, z) => y * 0.7454 - z * 0.6667;

let mundo = null;

function construirMundo(id) {
  const d = REGIONES[id], cajas = [];
  // Alturas: cada celda de un nivel es un bloque de 1 m cuya cara de arriba está en z + 1.
  const alturas = new Map();
  for (const n of d.niveles || []) for (const c of n.celdas) {
    const k = c.x + ',' + c.y;
    alturas.set(k, Math.max(alturas.get(k) || 0, n.z + 1));
  }
  for (const c of d.vacio || []) cajas.push(caja(c.x, c.y, 1, 1));
  for (const o of d.objetos) {
    if (o.z > 0.01) continue; // plantas sobre el montículo
    const partes = COMPUESTOS[o.sprite];
    if (partes) { for (const [ox, oy, w, h] of partes) cajas.push(caja(o.x + ox, o.y + oy, w, h)); continue; }
    const ob = OBSTACULOS.find(([p]) => o.sprite.startsWith(p));
    if (ob) cajas.push(caja(o.x, o.y, ob[1], ob[2]));
  }
  const agua = d.agua || [];
  if (!d.agua_vadeable) for (const c of (d.agua_bloqueo?.length ? d.agua_bloqueo : agua)) cajas.push(caja(c.x, c.y, 1, 1));
  const [x0, x1, y0, y1] = d.limites;
  return {
    id, d, cajas, agua, alturas, rampas: d.rampas || [], muelles: d.muelles || [],
    vadeable: new Set(d.agua_vadeable ? agua.map((c) => c.x + ',' + c.y) : []),
    inundacion: new Set((d.inundacion || []).map((c) => c.x + ',' + c.y)),
    lim: [x0 - 0.5, x1 + 0.5, y0 - 0.5, y1 + 0.5],
    objetos: d.objetos.map((o) => {
      const pre = (t) => Object.keys(t).find((p) => o.sprite.startsWith(p));
      const ancla = ANCLAS[pre(ANCLAS)], techo = TECHOS[pre(TECHOS)];
      return { ...o, orden: profundidad(o.y + (ancla ? ancla[1] : 0), o.z), techo, dibujar() { dibujar(this.sprite, this.x, this.y, this.z); } };
    }),
    fondo: id === 'selva' || id === 'ciudad' ? '#13241a' : '#0b0a09',
  };
}

// Altura del suelo en (x, y): niveles del montículo, rampas (2 m que suben 1 m hacia +y) y tablero de los muelles.
function alturaEn(x, y) {
  let h = mundo.alturas.get(Math.round(x) + ',' + Math.round(y)) || 0;
  for (const r of mundo.rampas) if (Math.abs(x - r.x) <= 0.5 && y >= r.y - 1 && y <= r.y + 1) h = Math.max(h, r.z + (y - (r.y - 1)) / 2);
  for (const m of mundo.muelles) if (x >= m.x0 && x <= m.x1 && Math.abs(y - m.y) <= m.ancho / 2) h = Math.max(h, m.z);
  return h;
}
// Se mide desde el suelo y no desde la altura del salto: saltar no sube terrazas ni salta atajos de la mazmorra.
const puedePisar = (a, x, y) => alturaEn(x, y) - Math.min(a.z || 0, a.suelo ?? a.z ?? 0) <= PASO;

// shortcut: recorre todas las cajas (≈600 por región); si una región grande va lenta, pasar a una rejilla por celdas.
// Las cajas se reparten en una rejilla de celdas de 2 m: cada consulta mira solo las de alrededor, no las ~600.
// Se rehace sola cuando cambia la lista (se añade una ofrenda, se rompe el basalto, se abre la losa…).
const CELDA = 2;
function rejilla() {
  const g = mundo.rejilla;
  if (g && g.de === mundo.cajas && g.n === mundo.cajas.length) return g.celdas;
  const celdas = new Map();
  for (const c of mundo.cajas)
    for (let i = Math.floor(c[0] / CELDA); i <= Math.floor(c[2] / CELDA); i++)
      for (let k = Math.floor(c[1] / CELDA); k <= Math.floor(c[3] / CELDA); k++) {
        const clave = i * 4096 + k;
        if (!celdas.has(clave)) celdas.set(clave, []);
        celdas.get(clave).push(c);
      }
  mundo.rejilla = { de: mundo.cajas, n: mundo.cajas.length, celdas };
  return celdas;
}
function bloqueado(x, y, r) {
  const l = mundo.lim;
  if (x - r < l[0] || x + r > l[1] || y - r < l[2] || y + r > l[3]) return true;
  const celdas = rejilla();
  for (let i = Math.floor((x - r) / CELDA); i <= Math.floor((x + r) / CELDA); i++)
    for (let k = Math.floor((y - r) / CELDA); k <= Math.floor((y + r) / CELDA); k++)
      for (const c of celdas.get(i * 4096 + k) || []) if (x + r > c[0] && x - r < c[2] && y + r > c[1] && y - r < c[3]) return true;
  return false;
}
// Movimiento por ejes: si un eje choca, se desliza por el otro. Un escalón de más de PASO bloquea; bajar, no.
// Quien tiene gravedad (el jugador) cae al bajar de un nivel; los demás se pegan al suelo.
function mover(a, dx, dy, r = 0.25) {
  if (dx && !bloqueado(a.x + dx, a.y, r) && puedePisar(a, a.x + dx, a.y)) a.x += dx;
  if (dy && !bloqueado(a.x, a.y + dy, r) && puedePisar(a, a.x, a.y + dy)) a.y += dy;
  a.suelo = alturaEn(a.x, a.y);
  if (!a.gravedad || (a.suelo >= (a.z || 0) && !(a.vz > 0))) { a.z = a.suelo; a.vz = 0; } // vz > 0: despegando de un salto
}
const enAgua = (x, y) => { const k = Math.round(x) + ',' + Math.round(y); return mundo.vadeable.has(k) || (juego.inundado && mundo.inundacion.has(k)); };

function nombresDeRegion() {
  const d = mundo.d;
  return [...d.suelo, ...d.objetos].map((o) => o.sprite).concat([1, 2, 3, 4].map((i) => `Tile_Agua_Anim_0${i}`), d.fuentes || []);
}

function dibujarSuelo(t) {
  ctx.fillStyle = mundo.fondo;
  ctx.fillRect(0, 0, vista.w, vista.h);
  for (const c of mundo.d.suelo) dibujarEn(c.sprite, c.derecha * PPU, -c.arriba * PPU); // centro del trozo en el plano de la cámara
  if (mundo.d.losas) dibujarLosas(); // niveles generados (js/niveles.js)
  const cuadro = `Tile_Agua_Anim_0${1 + (Math.floor(t * 4) % 4)}`;
  for (const c of mundo.agua) dibujar(cuadro, c.x, c.y);
  // El agua que sube en la fase 2 del Guardián, más turbia (FloodTint).
  if (juego.inundado) for (const c of mundo.d.inundacion || []) dibujar(cuadro, c.x, c.y, 0.02, { filtro: 'brightness(.6) saturate(.6)' });
}

// Autocomprobación: el vacío bloquea y el suelo no.
(() => {
  const antes = mundo;
  mundo = construirMundo('p1');
  const v = REGIONES.p1.vacio[0], p = REGIONES.p1.puntos.llegada_arriba;
  console.assert(bloqueado(v.x, v.y, 0.2), 'Mundo: el vacío bloquea');
  console.assert(!bloqueado(p.x, p.y, 0.25), 'Mundo: la llegada del piso 1 está libre');
  mundo = antes;
})();

// Autocomprobación de alturas en la ciudad: la rampa sube 1 m en 2 m y el montículo tiene tres niveles.
(() => {
  const antes = mundo;
  mundo = construirMundo('ciudad');
  const r = REGIONES.ciudad.rampas[0];
  console.assert(Math.abs(alturaEn(r.x, r.y) - (r.z + 0.5)) < 1e-6, 'Ciudad: la rampa está a media altura en su centro');
  console.assert(alturaEn(0, 17) === 3 && alturaEn(0, 20) === 2, 'Ciudad: la cima del montículo está a 3 m');
  console.assert(!puedePisar({ z: 0 }, 3, 10) && puedePisar({ z: 1 }, 3, 10), 'Ciudad: el borde del montículo no se sube sin rampa');
  mundo = antes;
})();
