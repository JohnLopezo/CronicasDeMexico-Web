'use strict';
// Capítulo II, «Las ciudades de piedra y agua» (etapa 43, solo HTML; ver PORTAR_A_UNITY.md §30). Al dejar el Fragmento de la
// Primera Memoria en el altar-trono (MP_OLM_06) se cierra el capítulo olmeca y se abre un portal en la plaza que lleva a
// Lakamha' (Palenque, Chiapas, periodo Clásico). Esta primera región: claro de llegada con santuario de Memoria, sendero de
// selva, el río Otolum con un puente y una plaza de caliza al pie de un templo escalonado con un tablero de glifos. Suelo,
// templo y tablero se pintan por código (piso 4 en ESTILO y PALETA). La aldea, la mazmorra y el jefe del agua, en etapas
// siguientes.
// Fidelidad (D documentado, I interpretación, F ficción del juego):
//   D: Lakamha' («lugar de las grandes aguas») es el nombre antiguo de Palenque en sus inscripciones; el río Otolum cruza la
//      ciudad y se canalizó con un acueducto de bóveda en saledizo; el Templo de las Inscripciones (siglo VII) se alza sobre
//      una pirámide de nueve cuerpos, con cinco vanos y uno de los textos jeroglíficos mayas más largos; los edificios
//      se cubrían de estuco pintado (sobre todo de rojo); los números mayas se escriben con barras y puntos; la ceiba es
//      árbol sagrado maya; en la selva de Palenque viven monos aulladores, ocelotes, serpientes y guacamayas.
//   I: la plaza, el puente y el templo son una composición inspirada en el sitio, no su plano; el tablero suelto en la plaza.
//   F: el portal, la voz de la memoria y los glifos borrados por la Sombra.

// ---------- La región ----------
// Celdas de suelo por tipo (x0, x1, y0, y1 incluidos; x al este, y hacia el fondo) y el río, de norte a sur.
const PALENQUE = {
  suelo: [[-17, -10, -3, 3, 'tierra'], [-9, -2, -1, 1, 'tierra'], [-1, 1, -1, 1, 'puente'], [2, 5, -1, 1, 'caliza'], [6, 19, -6, 6, 'caliza'], [20, 23, -1, 1, 'tierra']], // etapa 44: sendero a la aldea
  rio: [-1, 1, -10, 10],
  limites: [-20, 26, -10, 10],
  templo: { x: 12.5, y: 7.6 }, tablero: { x: 12.5, y: 4.6 },
  puntos: {
    llegada: { x: -14, y: 0 }, memoria: { x: -15.5, y: 2.3 }, memoria_llegada: { x: -15.5, y: 1.2 }, portal: { x: -16.2, y: -1.8 }, desde_aldea: { x: 21.3, y: 0 }, a_aldea: { x: 23.2, y: 0 },
  },
  // Fauna de la selva de Palenque (lejos de la llegada): [tipo, x, y].
  // Etapa 46: fauna de Chiapas (js/animales.js): mono araña en grupo, tucán, jaguar en la plaza y tapir junto al río.
  fauna: [['Serpiente', -6, 0], ['tucan', -9, 0.5], ['mono_arana', 4, 0], ['tapir', 9, -4], ['aullador', 14, -4], ['jaguar_selva', 14, 2], ['tucan', 17, -1]],
};
function regionPalenque() {
  const P = PALENQUE, tipo = new Map(), rnd = azar(hash('palenque'));
  for (const [x0, x1, y0, y1, t] of P.suelo) for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) tipo.set(x + ',' + y, t);
  const es = (x, y) => tipo.has(x + ',' + y), [lx0, lx1, ly0, ly1] = P.limites, [rx0, rx1, ry0, ry1] = P.rio;
  const losas = [...tipo].map(([k, t]) => { const [x, y] = k.split(',').map(Number); return { x, y, tipo: t, arriba: es(x, y + 1) ? 0 : LOSA.matas, abajo: es(x, y - 1) ? 0 : LOSA.cara }; });
  const agua = [], vacio = [];
  for (let x = rx0; x <= rx1; x++) for (let y = ry0; y <= ry1; y++) if (!es(x, y)) agua.push({ x, y });
  for (let x = lx0; x <= lx1; x++) for (let y = ly0; y <= ly1; y++) if (!es(x, y)) vacio.push({ x, y });
  // El templo detrás de la plaza, el tablero en ella, el santuario en el claro y la selva alrededor (lejos del suelo y del río).
  const objetos = [{ sprite: 'Templo_Palenque', ...P.templo, z: 0 }, { sprite: 'Tablero_Glifos', ...P.tablero, z: 0 }, { sprite: 'Santuario_Memoria_01', ...P.puntos.memoria, z: 0 }];
  const cerca = (a, b) => { for (let u = -2; u <= 2; u++) for (let v = -2; v <= 3; v++) if (es(a + u, b + v) || (a + u >= rx0 && a + u <= rx1)) return true; return false; };
  const bajoTemplo = (a, b) => Math.abs(a - P.templo.x) < 5 && b > 5;
  for (let a = lx0 - 4; a <= lx1 + 4; a++) for (let b = ly0 - 4; b <= ly1 + 4; b++)
    if (rnd() < 0.16 && !cerca(a, b) && !bajoTemplo(a, b)) objetos.push({ sprite: elige(rnd, ESTILO[4].deco), x: a + rnd() - 0.5, y: b + rnd() - 0.5, z: 0 });
  // Autocomprobación: del claro de llegada se llega a pie al tablero (el puente une las dos orillas).
  const visto = new Set(['-14,0']), cola = [[-14, 0]];
  while (cola.length) { const [x, y] = cola.pop(); for (const [u, v] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = x + u + ',' + (y + v); if (es(x + u, y + v) && !visto.has(k)) { visto.add(k); cola.push([x + u, y + v]); } } }
  console.assert(visto.has('12,3') && visto.size === tipo.size, 'Palenque: todo el suelo se recorre desde la llegada');
  return { nota: 'Pintada por código (js/palenque.js)', suelo: [], agua, objetos, niveles: [], rampas: [], muelles: [], limites: P.limites,
    puntos: { ...P.puntos }, vacio, losas, piso: 4, aguaDebajo: true };
}

// ---------- Sprites pintados: el templo y el tablero ----------
function registrarLienzo(nombre, c, pivoteY) {
  SPRITES[nombre] = ['', 0.5, pivoteY, PPU];
  imagenes[nombre] = Object.assign(c, { naturalWidth: c.width, naturalHeight: c.height, complete: true });
}
// Templo escalonado: pirámide de nueve cuerpos con escalinata al centro y, arriba, el templo de cinco vanos con techo en
// mansarda y restos de estuco rojo (D, Templo de las Inscripciones; I, sus proporciones). Base en la fila 316 de 330.
function pintarTemplo() {
  const c = document.createElement('canvas'), g = c.getContext('2d'), P = PALETA[4], rnd = azar(43);
  c.width = 416; c.height = 330;
  const base = 316, cx = 208;
  for (let i = 0; i < 9; i++) { // cuerpos de abajo arriba: cara oscura, borde claro y musgo en algunos
    const w = 400 - i * 28, y = base - (i + 1) * 17;
    px(g, P.junta, cx - w / 2 - 1, y - 1, w + 2, 19);
    px(g, elige(rnd, P.piedra), cx - w / 2, y + 3, w, 14); px(g, P.claro, cx - w / 2, y, w, 3); px(g, P.oscuro, cx - w / 2, y + 15, w, 2);
    for (let k = 0; k < 14; k++) px(g, rnd() < 0.6 ? P.oscuro : elige(rnd, P.pasto), cx - w / 2 + Math.floor(rnd() * w), y + 4 + Math.floor(rnd() * 10), 2 + Math.floor(rnd() * 3), 1);
    if (rnd() < 0.5) px(g, P.estuco, cx - w / 2 + 4 + Math.floor(rnd() * (w - 40)), y + 6, 14 + Math.floor(rnd() * 20), 2); // restos de rojo
  }
  const top = base - 9 * 17;
  // Escalinata: peldaños claros y oscuros alternos, con alfardas a los lados.
  px(g, P.junta, cx - 33, top, 66, base - top);
  for (let y = top; y < base; y += 4) { px(g, P.claro, cx - 30, y, 60, 2); px(g, P.oscuro, cx - 30, y + 2, 60, 2); }
  px(g, P.piedra[2], cx - 33, top, 3, base - top); px(g, P.piedra[2], cx + 30, top, 3, base - top);
  // Templo: plataforma, muro con cinco vanos y pilares, friso, mansarda y crestería calada.
  const tw = 150, ty = top - 44;
  px(g, P.junta, cx - tw / 2 - 1, ty - 1, tw + 2, 46); px(g, P.piedra[3], cx - tw / 2, ty, tw, 44);
  for (let k = 0; k < 5; k++) { const vx = cx - tw / 2 + 9 + k * 28; px(g, P.boveda, vx, ty + 12, 20, 32); px(g, P.boveda, vx + 3, ty + 9, 14, 3); px(g, P.estuco, vx - 5, ty + 14, 2, 28); }
  px(g, P.estuco, cx + tw / 2 - 6, ty + 14, 2, 28);
  px(g, P.oscuro, cx - tw / 2 - 4, ty - 6, tw + 8, 6); // cornisa
  for (let y = 0; y < 28; y++) { const w = tw + 4 - y * 2.2; px(g, y % 7 === 0 ? P.oscuro : P.piedra[y % 2], Math.round(cx - w / 2), ty - 6 - y, Math.round(w), 1); } // mansarda
  const cy = ty - 34;
  px(g, P.junta, cx - 34, cy - 30, 68, 30);
  for (let y = cy - 28; y < cy; y += 8) for (let x = cx - 32; x < cx + 32; x += 10) px(g, P.piedra[1], x, y, 7, 5); // crestería calada
  for (let i = 0; i < 40; i++) px(g, elige(rnd, P.pasto), cx - tw / 2 + Math.floor(rnd() * tw), ty - 34 + Math.floor(rnd() * 30), 2, 2); // plantas en el techo
  registrarLienzo('Templo_Palenque', c, (c.height - base) / c.height);
}
// Tablero de caliza: dos columnas de bloques de glifos; los de la izquierda con caras de perfil y números de barras y puntos
// (D), los de la derecha lisos, con grietas violetas (F: la Sombra). Base en la fila 70 de 74.
function pintarTablero() {
  const c = document.createElement('canvas'), g = c.getContext('2d'), P = PALETA[4], rnd = azar(431);
  c.width = 48; c.height = 74;
  px(g, P.junta, 5, 4, 38, 66); px(g, P.piedra[0], 6, 5, 36, 64); px(g, P.claro, 6, 5, 36, 2); px(g, P.oscuro, 6, 66, 36, 3);
  for (let fila = 0; fila < 4; fila++) for (const col of [0, 1]) {
    const x = 9 + col * 16, y = 10 + fila * 14;
    px(g, P.oscuro, x, y, 13, 12); px(g, P.piedra[3], x + 1, y + 1, 11, 10);
    if (col === 0) {
      if (fila % 2) { px(g, P.junta, x + 2, y + 7, 9, 2); for (let k = 0; k < 3; k++) px(g, P.junta, x + 3 + k * 3, y + 3, 2, 2); } // barra y puntos
      else { bola(g, P.junta, x + 6, y + 5, 3, 3); px(g, P.piedra[3], x + 7, y + 4, 2, 2); px(g, P.junta, x + 2, y + 9, 8, 1); } // cabeza de perfil
    } else if (fila === 0) px(g, P.junta, x + 3, y + 3, 7, 6);
    else { let gx = x + 2 + rnd() * 8, gy = y + 1; while (gy < y + 11) { px(g, '#8a4fc0', Math.round(gx), Math.round(gy)); gx += (rnd() - 0.5) * 3; gy += 1; } }
  }
  px(g, P.estuco, 6, 5, 2, 64);
  registrarLienzo('Tablero_Glifos', c, 4 / c.height);
}
pintarTemplo(); pintarTablero();
OBSTACULOS.push(['Tablero_Glifos', 0.8, 0.3], ['Templo_Palenque', 8, 3]);
REGIONES.palenque = regionPalenque();
Object.assign(REGIONES.ciudad.puntos, { portal_maya: { x: 0, y: 6.2 }, desde_maya: { x: 0, y: 5 } }); // en la plaza, entre los dos altares-trono

// ---------- Misión y textos ----------
// shortcut: la misión vive aquí y no en datos/narrativa.js (lo genera sincronizar.mjs desde Unity); pasarla a un QuestData al portar.
MISIONES.MP_MAY_01 = { titulo: "Lakamha'", banderas: ['may.tablero_visto'], pasos: [
  { aviso: 'examinar:tablero_palenque', veces: 1, texto: 'Cruza el río Otolum y examina el tablero de la plaza del templo' },
  { aviso: 'hablar:gente_lakamha', veces: 1, texto: "Busca a la gente de Lakamha' (próximamente)" },
] };
const TXT_MAYA = {
  cierre: ['El fragmento encaja en el nicho del altar-trono. Por un instante las estelas de la plaza recuerdan sus relieves; luego vuelven a quedar lisas.',
    'Ahora lo entiendes: las piedras no pierden sus marcas con el tiempo. Alguien está borrando sus recuerdos, a propósito.',
    'Del fragmento brota una luz verde que se abre en la plaza como el agua de un estanque. Huele a río y a lluvia de otra tierra: la memoria de otro pueblo te llama.'],
  capitulo: '<h1>Capítulo II</h1><p class="nota">Las ciudades de piedra y agua</p><p>Termina el despertar olmeca. La luz del fragmento te lleva hacia el sur, a una ciudad de piedra blanca entre la selva y los ríos.</p>',
  llegada: ['La luz se apaga a tu alrededor. La selva es otra: más alta y más húmeda, y entre los árboles se oye correr un río.',
    "Una voz sin voz, como la del Guardián: «Lakamha', el lugar de las grandes aguas. Aquí también se están borrando los nombres.»"],
  tablero: 'Un tablero de caliza cubierto de glifos tallados en bloques, en dos columnas. A la izquierda aún se ven caras de perfil y números de barras y puntos: alguien contó aquí fechas y nombres. A la derecha la piedra está lisa y tibia, con las mismas grietas violetas de la ciudad bajo la selva. La Sombra llegó antes que tú.',
  portal: 'La luz del fragmento sigue abierta, como agua quieta. Del otro lado se adivina la plaza del asentamiento olmeca.',
};

// ---------- El portal ----------
// Un óvalo de luz verde que respira (F). `a`: a dónde lleva; en la aldea pregunta antes de cambiar de capítulo.
function portalMemoria(O, I, p, texto, usar, a) { // a: región a la que lleva (el mapa marca la salida, js/mapa.js)
  O.push({ x: p.x, y: p.y, z: 0, t: 0, orden: profundidad(p.y, 0), actualizar(o, dt) { o.t += dt; }, dibujar(o) {
    const [sx, sy] = pantalla(o.x, o.y, 0.9), x = Math.round(sx - vista.cx), y = Math.round(sy - vista.cy), k = Math.sin(o.t * 2.5);
    for (const [r, a] of [[40, 0.16], [30, 0.28], [20, 0.45], [11, 0.7]]) { ctx.fillStyle = `rgba(120,230,160,${a + 0.06 * k})`; ctx.beginPath(); ctx.ellipse(x, y, r * 0.62, r + 2 * k, 0, 0, 7); ctx.fill(); }
    ctx.fillStyle = 'rgba(240,255,240,.9)'; ctx.fillRect(x - 1, y - 12, 2, 24);
    for (let i = 0; i < 4; i++) { const a = o.t * 1.5 + i * 1.57; ctx.fillRect(Math.round(x + Math.cos(a) * 16), Math.round(y + Math.sin(a) * 26), 2, 2); } // chispas que giran
  } });
  I.push({ x: p.x, y: p.y, r: 1.3, texto, usar, a });
}
// Tras completar MP_OLM_06 (examinar el altar-trono): cierre del capítulo I y apertura del portal, una sola vez.
function cierreCapituloI() {
  if (!bandera('olm.memoria_restaurada') || bandera('may.portal_abierto')) return;
  hablar('', TXT_MAYA.cierre, () => { poner('may.portal_abierto'); portalAldea(juego.otros, juego.interactuables); vista.temblor = 0.3; sonar('portal'); toast('Se abrió un portal en la plaza', 4); });
}
const portalAldea = (O, I) => portalMemoria(O, I, REGIONES.ciudad.puntos.portal_maya, 'Seguir la memoria', () =>
  abrirCapa('capitulo', `${TXT_MAYA.capitulo}<div class="botones"><button data-elegir="ir">Seguir la memoria</button><button data-cerrar>Todavía no</button></div>`, () => {
    cerrarMenu();
    cargarRegion('palenque', 'llegada', juego.jugador.vida).then(() => {
      if (!juego.misiones.MP_MAY_01) hablar('', TXT_MAYA.llegada, () => empezarMision('MP_MAY_01'));
      toast("Lakamha' (Palenque)", 3);
    });
  }), 'palenque');

// ---------- Contenido (desde poblar, js/juego.js) ----------
function poblarPalenque(P, E, O, I, T, santuarioMemoria) {
  santuarioMemoria();
  portalMemoria(O, I, P.portal, 'Volver al asentamiento', () => mensaje(TXT_MAYA.portal, () => cargarRegion('ciudad', 'desde_maya', juego.jugador.vida)), 'ciudad');
  const t = PALENQUE.tablero;
  I.push({ x: t.x, y: t.y - 0.7, r: 1.2, texto: 'Examinar', usar: () => mensaje(TXT_MAYA.tablero, () => avisar('examinar:tablero_palenque')) });
  T.push({ ...P.a_aldea, a: 'aldea_maya', punto: 'llegada' }); // la aldea (js/aldea_maya.js)
  poblarHojas('palenque', E, O, I);
  for (const [tipo, x, y] of PALENQUE.fauna)
    E.push(...({ ocelote: () => [nuevoOcelote(x, y)], aullador: () => [nuevoAullador(x, y), nuevoAullador(x + 1.2, y - 0.8)], tapir: () => [nuevoTapir(x, y)], jaguar_selva: () => [nuevoJaguarSelva(x, y)],
      mono_arana: () => [nuevoMonoArana(x, y), nuevoMonoArana(x + 1.1, y + 0.8), nuevoMonoArana(x + 1.2, y - 0.8)], tucan: () => [nuevoTucan(x, y)] }[tipo] || (() => [nuevaFauna(tipo, x, y, false)]))());
}

// Autocomprobación: los puntos de llegada, del portal y del tablero están libres.
(() => {
  const antes = mundo;
  mundo = construirMundo('palenque');
  for (const [n, p] of Object.entries({ ...PALENQUE.puntos, tablero: { x: PALENQUE.tablero.x, y: PALENQUE.tablero.y - 0.7 } })) if (n !== 'memoria' && n !== 'a_aldea') console.assert(!bloqueado(p.x, p.y, 0.25), `Palenque: ${n} libre`);
  console.assert(PALENQUE.fauna.every(([, x, y]) => !bloqueado(x, y, 0.3) && Math.hypot(x - PALENQUE.puntos.llegada.x, y - PALENQUE.puntos.llegada.y) >= LIBRE_LLEGADA), 'Palenque: fauna en suelo y lejos de la llegada');
  mundo = construirMundo('ciudad');
  for (const q of [REGIONES.ciudad.puntos.portal_maya, REGIONES.ciudad.puntos.desde_maya]) console.assert(!bloqueado(q.x, q.y, 0.25), 'Aldea: el portal maya está en un sitio libre');
  mundo = antes;
})();
