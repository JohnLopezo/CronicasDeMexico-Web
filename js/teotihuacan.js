'use strict';
// Capítulo III, «Las ciudades y los pueblos del altiplano» (etapa 53, solo HTML; ver PORTAR_A_UNITY.md §40). Al cerrar el
// capítulo II (tablero de Palenque, MP_MAY_04) se abre un portal en la plaza de Palenque que lleva a Teotihuacan (Cuenca de
// México, periodo Clásico). Esta primera región: claro de llegada con santuario de Memoria, sendero de tierra seca, la Calzada
// de los Muertos de sur a norte, la plaza al pie de la Pirámide del Sol con un mural, y la Pirámide de la Luna al fondo de la
// calzada. Suelo, pirámides, mural, magueyes y nopales se pintan por código (piso 5 en ESTILO y PALETA). Plan del capítulo
// (decidido con el usuario): un dios por cultura, cada uno da una habilidad (Fuego aquí, Huehueteotl; Luz, Cocijo en Monte
// Albán; Viento, la Serpiente Emplumada en Xochicalco), el jefe es la memoria del dios corrompida que se libera, y la
// habilidad activa cambia según el día o la hora (por definir).
// Fidelidad (D documentado, I interpretación, F ficción del juego):
//   D: «Teotihuacan» («donde se hacen los dioses») es el nombre náhuatl que le dieron los mexicas siglos después; el suyo
//      no se conoce. La Calzada de los Muertos corre de sur a norte y acaba en la Pirámide de la Luna; la Pirámide del Sol
//      se alza al este de la calzada; la arquitectura usa el talud-tablero; los edificios se cubrían de estuco pintado,
//      sobre todo de rojo; los murales (Tepantitla, Tetitla) pintan figuras de perfil con volutas de la palabra; el maguey
//      y el nopal son plantas del altiplano; en la zona viven serpientes de cascabel y armadillos.
//   I: la composición (calzada, plaza y pirámides juntas y a escala de juego), el número de cuerpos y el mural suelto.
//   F: el portal, la voz de la memoria y la pintura borrada por la Sombra.

// ---------- La región ----------
// Celdas de suelo por tipo (x0, x1, y0, y1 incluidos; x al este, y hacia el fondo, que aquí es el norte).
const TEOTIHUACAN = {
  suelo: [[-17, -10, -3, 3, 'tierra'], [-9, -1, -1, 1, 'tierra'], [0, 4, -8, 14, 'estuco'], [5, 15, 0, 5, 'estuco']],
  limites: [-20, 20, -11, 17],
  sol: { x: 10, y: 7.3 }, luna: { x: 2, y: 16.3 }, mural: { x: 7.5, y: 4.4 },
  puntos: { llegada: { x: -14, y: 0 }, memoria: { x: -15.5, y: 2.3 }, memoria_llegada: { x: -15.5, y: 1.2 }, portal: { x: -16.2, y: -1.8 } },
  fauna: [['Serpiente', -6, 0], ['armadillo', 12, 2], ['espiritu', 2, 8], ['espiritu', 3, 11]], // [tipo, x, y], lejos de la llegada
};
// Piso 5: tierra ocre del altiplano, estuco claro, tezontle y rojo teotihuacano.
PALETA[5] = { junta: '#7d6a55', piedra: ['#d9d0bf', '#d2c8b5', '#cdc2ae', '#e0d8c8'], claro: '#efe9dc', oscuro: '#a89a84', cara: '#8e7c66',
  tierra: ['#a07a4c', '#ab8655', '#946f44'], pasto: ['#a39a55', '#b8ac62', '#8a8448'], rojo: ['#9c3a2a', '#a8442f', '#8e3324'],
  tezontle: ['#6e4a3e', '#7a5446', '#634238'], verde: '#4f7a5a', azul: '#3f6f8a', amarillo: '#d0a548', maguey: ['#6f8f6a', '#5d7d5b', '#82a07a'], nopal: ['#5f8a3e', '#6f9a48'] };
ESTILO[5] = { pintado: true, color: '#6b5236', sueltos: ['Pasto_Alto_01', 'Roca_Basalto_02'], luz: 'brightness(.7) saturate(.7)', deco: ['Maguey_01', 'Maguey_01', 'Nopal_01', 'Pasto_Alto_01', 'Roca_Basalto_01'] };
function regionTeotihuacan() {
  const T = TEOTIHUACAN, tipo = new Map(), rnd = azar(hash('teotihuacan'));
  for (const [x0, x1, y0, y1, t] of T.suelo) for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) tipo.set(x + ',' + y, t);
  const es = (x, y) => tipo.has(x + ',' + y), [lx0, lx1, ly0, ly1] = T.limites;
  const losas = [...tipo].map(([k, t]) => { const [x, y] = k.split(',').map(Number); return { x, y, tipo: t, arriba: es(x, y + 1) ? 0 : LOSA.matas, abajo: es(x, y - 1) ? 0 : LOSA.cara }; });
  const vacio = [];
  for (let x = lx0; x <= lx1; x++) for (let y = ly0; y <= ly1; y++) if (!es(x, y)) vacio.push({ x, y });
  const objetos = [{ sprite: 'Piramide_Sol', ...T.sol, z: 0 }, { sprite: 'Piramide_Luna', ...T.luna, z: 0 }, { sprite: 'Mural_Teo', ...T.mural, z: 0 }, { sprite: 'Santuario_Memoria_01', ...T.puntos.memoria, z: 0 }];
  const cerca = (a, b) => { for (let u = -2; u <= 2; u++) for (let v = -2; v <= 3; v++) if (es(a + u, b + v)) return true; return false; };
  const bajo = (a, b) => (Math.abs(a - T.sol.x) < 6 && b > 5 && b < 11) || (Math.abs(a - T.luna.x) < 5 && b > 14);
  for (let a = lx0 - 4; a <= lx1 + 4; a++) for (let b = ly0 - 4; b <= ly1 + 4; b++)
    if (rnd() < 0.13 && !cerca(a, b) && !bajo(a, b)) objetos.push({ sprite: elige(rnd, ESTILO[5].deco), x: a + rnd() - 0.5, y: b + rnd() - 0.5, z: 0 });
  // Autocomprobación: todo el suelo se recorre a pie desde el claro de llegada.
  const visto = new Set(['-14,0']), cola = [[-14, 0]];
  while (cola.length) { const [x, y] = cola.pop(); for (const [u, v] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = x + u + ',' + (y + v); if (es(x + u, y + v) && !visto.has(k)) { visto.add(k); cola.push([x + u, y + v]); } } }
  console.assert(visto.size === tipo.size, 'Teotihuacan: todo el suelo se recorre desde la llegada');
  return { nota: 'Pintada por código (js/teotihuacan.js)', suelo: [], agua: [], objetos, niveles: [], rampas: [], muelles: [], limites: T.limites,
    puntos: { ...T.puntos }, vacio, losas, piso: 5 };
}

// Piso 5 (desde pintarLosa, js/pisos.js): 'tierra' (tierra ocre con pasto seco y talud de tierra) o 'estuco' (piso de estuco
// claro con grietas; detrás, un bordillo rojo; delante, la cara en talud-tablero: talud de tezontle y tablero rojo enmarcado).
function losaTeo(g, P, rnd, ox, oy, l) {
  if (l.tipo === 'tierra') {
    px(g, P.tierra[0], ox, oy, PPU, PX_Y);
    for (let i = 0; i < 24; i++) px(g, elige(rnd, P.tierra), ox + Math.floor(rnd() * PPU), oy + Math.floor(rnd() * PX_Y), 3 + Math.floor(rnd() * 5), 2);
    for (let i = 0; i < 10; i++) px(g, elige(rnd, P.pasto), ox + Math.floor(rnd() * PPU), oy + Math.floor(rnd() * PX_Y), 1, 2);
    if (rnd() < 0.3) bola(g, P.tezontle[0], ox + 8 + rnd() * 32, oy + 6 + rnd() * 20, 2, 1); // piedra suelta
    if (l.arriba) for (let x = 0; x < PPU; x++) { const h = 2 + Math.floor(rnd() * 6); px(g, P.pasto[2], ox + x, oy - h, 1, h + 1); px(g, elige(rnd, P.pasto), ox + x, oy - h, 1, 1); }
    if (l.abajo) { px(g, P.tierra[2], ox, oy + PX_Y, PPU, LOSA.cara); for (let i = 0; i < 6; i++) px(g, P.tezontle[1], ox + Math.floor(rnd() * PPU), oy + PX_Y + 2 + Math.floor(rnd() * 9), 3, 2); }
    return;
  }
  px(g, elige(rnd, P.piedra), ox + 1, oy + 1, PPU - 2, PX_Y - 2); px(g, P.claro, ox + 1, oy + 1, PPU - 2, 1);
  for (let i = 0; i < 8; i++) px(g, rnd() < 0.5 ? P.claro : P.oscuro, ox + 2 + Math.floor(rnd() * (PPU - 4)), oy + 2 + Math.floor(rnd() * (PX_Y - 4)));
  if (rnd() < 0.3) { let x = ox + 6 + rnd() * 36, y = oy + 3; while (y < oy + PX_Y - 3) { px(g, P.oscuro, Math.round(x), Math.round(y)); x += (rnd() - 0.5) * 3; y++; } } // grieta del estuco
  if (l.arriba) { px(g, P.tezontle[2], ox, oy - LOSA.matas, PPU, LOSA.matas); px(g, P.rojo[0], ox, oy - LOSA.matas, PPU, 4); }
  if (l.abajo) {
    px(g, P.tezontle[0], ox, oy + PX_Y, PPU, 5); for (let i = 0; i < 5; i++) px(g, P.tezontle[1], ox + Math.floor(rnd() * PPU), oy + PX_Y + 1 + Math.floor(rnd() * 3), 3, 1); // talud
    px(g, P.claro, ox, oy + PX_Y + 5, PPU, 1); px(g, P.rojo[1], ox, oy + PX_Y + 6, PPU, LOSA.cara - 6); px(g, P.rojo[2], ox + 3, oy + PX_Y + 8, PPU - 6, LOSA.cara - 10); // tablero
  }
}

// ---------- Sprites pintados ----------
// Pirámide escalonada de cuerpos en talud (sin tablero, como la del Sol), con escalinata al frente, piedra de tezontle con
// restos de estuco y, arriba, una plataforma lisa (el templo de lo alto no se conserva: I).
function pintarPiramide(nombre, cuerpos, ancho, altoCuerpo, semilla) {
  const c = document.createElement('canvas'), g = c.getContext('2d'), P = PALETA[5], rnd = azar(semilla);
  c.width = ancho + 16; c.height = cuerpos * altoCuerpo + 30;
  const base = c.height - 14, cx = c.width / 2, paso = (ancho - ancho * 0.36) / cuerpos;
  for (let i = 0; i < cuerpos; i++) {
    const w0 = ancho - i * paso, w1 = w0 - paso * 0.6, y0 = base - i * altoCuerpo;
    for (let y = 0; y < altoCuerpo; y++) { // talud: se estrecha hacia arriba
      const w = Math.round(w0 - (w0 - w1) * (y / altoCuerpo));
      px(g, y === altoCuerpo - 1 ? P.claro : y % 5 === 0 ? P.tezontle[2] : elige(rnd, P.tezontle), Math.round(cx - w / 2), y0 - y, w, 1);
    }
    for (let k = 0; k < 10; k++) px(g, elige(rnd, [P.piedra[0], P.rojo[0], P.oscuro]), Math.round(cx - w0 / 2 + rnd() * w0 * 0.9), y0 - 2 - Math.floor(rnd() * (altoCuerpo - 4)), 3 + Math.floor(rnd() * 6), 1);
    const w2 = w1 - paso * 0.4; px(g, P.cara, Math.round(cx - w1 / 2), y0 - altoCuerpo, Math.round(w1), 1); // la terraza entre cuerpos
    if (i === cuerpos - 1) { px(g, P.piedra[1], Math.round(cx - w2 / 2), y0 - altoCuerpo - 4, Math.round(w2), 4); px(g, P.claro, Math.round(cx - w2 / 2), y0 - altoCuerpo - 4, Math.round(w2), 1); }
  }
  const top = base - cuerpos * altoCuerpo; // escalinata
  px(g, P.junta, cx - 18, top, 36, base - top);
  for (let y = top; y < base; y += 3) { px(g, P.piedra[0], cx - 16, y, 32, 2); px(g, P.oscuro, cx - 16, y + 2, 32, 1); }
  registrarLienzo(nombre, c, (c.height - base) / c.height);
}
// Mural: talud de tezontle y tablero de fondo rojo con una figura de perfil con tocado de plumas y volutas de la palabra
// (D, Tepantitla/Tetitla); la mitad derecha, lisa y con grietas violetas (F: la Sombra). Base en la fila 66 de 70.
function pintarMural() {
  const c = document.createElement('canvas'), g = c.getContext('2d'), P = PALETA[5], rnd = azar(53);
  c.width = 72; c.height = 70;
  px(g, P.junta, 3, 6, 66, 61); px(g, P.tezontle[0], 4, 50, 64, 16); for (let i = 0; i < 12; i++) px(g, P.tezontle[1], 4 + Math.floor(rnd() * 60), 51 + Math.floor(rnd() * 14), 3, 1);
  px(g, P.claro, 4, 7, 64, 42); px(g, P.rojo[1], 7, 10, 58, 36); px(g, P.rojo[2], 7, 10, 58, 1);
  // Figura de perfil: cuerpo, cabeza, tocado de plumas verdes, bolsa de copal, y tres volutas azules que salen de la boca.
  px(g, P.amarillo, 15, 26, 8, 16); px(g, P.verde, 15, 32, 8, 3); bola(g, P.amarillo, 19, 22, 3, 3); px(g, P.junta, 21, 21, 1, 1);
  for (let k = 0; k < 4; k++) px(g, P.verde, 13 + k * 3, 13 - (k % 2) * 2, 2, 7);
  px(g, P.piedra[0], 12, 36, 3, 5);
  for (let k = 0; k < 3; k++) { const x = 24 + k * 4, y = 21 - k * 3; px(g, P.azul, x, y, 4, 1); px(g, P.azul, x + 3, y - 2, 1, 2); px(g, P.azul, x + 1, y - 2, 2, 1); }
  for (let k = 0; k < 6; k++) bola(g, k % 2 ? P.amarillo : P.verde, 12 + k * 4, 44, 1, 1); // flores al pie
  // La mitad borrada: rojo desvaído y grietas.
  px(g, '#b8786a', 38, 10, 27, 36);
  for (let n = 0; n < 3; n++) { let x = 42 + n * 8 + rnd() * 3, y = 11; while (y < 45) { px(g, '#8a4fc0', Math.round(x), y); x += (rnd() - 0.5) * 3; y++; } }
  registrarLienzo('Mural_Teo', c, 4 / c.height);
}
// Maguey (roseta de pencas gruesas con espinas) y nopal (pencas ovaladas con tunas), de 40 × 40.
function pintarPlantas() {
  const P = PALETA[5];
  let c = document.createElement('canvas'), g = c.getContext('2d'); c.width = c.height = 40;
  for (const [dx, h, col] of [[-14, 14, 1], [14, 14, 1], [-9, 22, 0], [9, 22, 0], [-4, 28, 2], [4, 28, 2], [0, 32, 0]])
    for (let y = 0; y < h; y++) { const w = Math.max(1, Math.round(4 * (1 - y / h))), x = 20 + Math.round(dx * (y / h)) - (w >> 1); px(g, P.maguey[col], x, 37 - y, w, 1); if (y === h - 1) px(g, P.junta, x, 36 - y, 1, 1); }
  registrarLienzo('Maguey_01', c, 3 / 40);
  c = document.createElement('canvas'); g = c.getContext('2d'); c.width = c.height = 40;
  for (const [x, y, rx, ry] of [[20, 30, 6, 8], [13, 18, 5, 7], [27, 16, 5, 7], [20, 8, 4, 6]]) { bola(g, P.nopal[1], x, y, rx, ry); bola(g, P.nopal[0], x + 1, y + 1, rx - 2, ry - 2); }
  for (const [x, y] of [[13, 10], [27, 8], [20, 1]]) px(g, P.rojo[0], x - 1, y, 3, 3); // tunas
  registrarLienzo('Nopal_01', c, 1 / 40);
}
pintarPiramide('Piramide_Sol', 5, 470, 28, 531); pintarPiramide('Piramide_Luna', 4, 330, 26, 532); pintarMural(); pintarPlantas();
OBSTACULOS.push(['Piramide_Sol', 9.4, 3], ['Piramide_Luna', 6.6, 2.4], ['Mural_Teo', 1.3, 0.3]);
REGIONES.teotihuacan = regionTeotihuacan();
// En la plaza de Palenque, al pie del templo; REGIONES.palenque ya copió sus puntos (js/palenque.js), así que van en los dos.
for (const p of [PALENQUE.puntos, REGIONES.palenque.puntos]) Object.assign(p, { portal_teo: { x: 16.5, y: 3.5 }, desde_teo: { x: 16.5, y: 2.3 } });

// ---------- Misión y textos ----------
// shortcut: la misión vive aquí y no en datos/narrativa.js (como MP_MAY_01); pasarla a un QuestData al portar.
MISIONES.MP_TEO_01 = { titulo: 'La ciudad de los dioses', banderas: ['teo.mural_visto'], pasos: [
  { aviso: 'examinar:mural_teo', veces: 1, texto: 'Recorre la Calzada de los Muertos y examina el mural de la plaza de la Pirámide del Sol' },
  { aviso: 'hablar:gente_teo', veces: 1, texto: 'Busca a la gente de los barrios de la ciudad (próximamente)' },
] };
const TXT_TEO = {
  capitulo: '<h1>Capítulo III</h1><p class="nota">Las ciudades y los pueblos del altiplano</p><p>La luz del fragmento te lleva al norte, a un valle alto y seco rodeado de montañas, donde hubo una de las ciudades más grandes del mundo.</p>',
  llegada: ['La luz se apaga. El aire es frío y seco, y huele a polvo y a humo de copal. A lo lejos se alza una montaña hecha a mano.',
    'La voz sin voz: «Los que vinieron siglos después la llamaron Teotihuacan, donde se hacen los dioses. Su propio nombre ya lo había olvidado el mundo antes de que llegara la Sombra.»'],
  mural: 'Un muro en talud-tablero pintado sobre estuco rojo. A la izquierda, una figura de perfil con tocado de plumas verdes camina sobre flores; de su boca salen volutas azules: está hablando, o cantando. A la derecha el rojo se ha desvaído y la pared está lisa, con grietas violetas. La Sombra le quitó la voz a la mitad del mural.',
  portal: 'La luz del fragmento sigue abierta. Del otro lado se oye correr el río Otolum, en Lakamha\'.',
  portalPalenque: 'La luz verde respira en la plaza. Del otro lado el aire es frío y seco: la memoria del altiplano te llama.',
};

// ---------- Portales ----------
const portalPalenque = (O, I) => portalMemoria(O, I, PALENQUE.puntos.portal_teo, 'Seguir la memoria', () =>
  abrirCapa('capitulo', `${TXT_TEO.capitulo}<div class="botones"><button data-elegir="ir">Seguir la memoria</button><button data-cerrar>Todavía no</button></div>`, () => {
    cerrarMenu();
    cargarRegion('teotihuacan', 'llegada', juego.jugador.vida).then(() => {
      if (!juego.misiones.MP_TEO_01) hablar('', TXT_TEO.llegada, () => empezarMision('MP_TEO_01'));
      toast('Teotihuacan', 3);
    });
  }), 'teotihuacan');

// ---------- Contenido (desde poblar, js/juego.js) ----------
function poblarTeotihuacan(P, E, O, I, T, santuarioMemoria) {
  santuarioMemoria();
  portalMemoria(O, I, P.portal, 'Volver a Lakamha\'', () => mensaje(TXT_TEO.portal, () => cargarRegion('palenque', 'desde_teo', juego.jugador.vida)), 'palenque');
  const m = TEOTIHUACAN.mural;
  I.push({ x: m.x, y: m.y - 0.7, r: 1.2, texto: 'Examinar', aviso: 'examinar:mural_teo', usar: () => mensaje(TXT_TEO.mural, () => { poner('teo.mural_visto'); avisar('examinar:mural_teo'); }) });
  for (const [tipo, x, y] of TEOTIHUACAN.fauna)
    E.push({ armadillo: () => nuevoArmadillo(x, y), espiritu: () => nuevoEspiritu(x, y) }[tipo]?.() || nuevaFauna(tipo, x, y, false));
}

// Autocomprobación: llegada, portal y mural libres; fauna en suelo y lejos de la llegada; el portal de Palenque, libre.
(() => {
  const antes = mundo, T = TEOTIHUACAN;
  mundo = construirMundo('teotihuacan');
  for (const [n, p] of Object.entries({ ...T.puntos, mural: { x: T.mural.x, y: T.mural.y - 0.7 } })) if (n !== 'memoria') console.assert(!bloqueado(p.x, p.y, 0.25), `Teotihuacan: ${n} libre`);
  console.assert(T.fauna.every(([, x, y]) => !bloqueado(x, y, 0.3) && Math.hypot(x - T.puntos.llegada.x, y - T.puntos.llegada.y) >= LIBRE_LLEGADA), 'Teotihuacan: fauna en suelo y lejos de la llegada');
  mundo = construirMundo('palenque');
  for (const n of ['portal_teo', 'desde_teo']) console.assert(!bloqueado(PALENQUE.puntos[n].x, PALENQUE.puntos[n].y, 0.25), 'Palenque: ' + n + ' libre');
  mundo = antes;
})();
