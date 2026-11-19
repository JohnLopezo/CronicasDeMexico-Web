'use strict';
// La aldea de Lakamha' (etapa 44, solo HTML; ver PORTAR_A_UNITY.md §31). Al este de la plaza del templo de Palenque: casas
// de bajareque con techo de palma sobre plataformas, milpa, telar de cintura, fogón de tres piedras y el río al sur. Seis
// habitantes pintados por código (no hay fichas mayas en Unity) y la misión MP_MAY_02 «Los registros perdidos»: tres hojas del
// libro de corteza del escriba, una junto al río y dos en la plaza, guardadas por seres de la Sombra.
// Fidelidad (D documentado, I interpretación, F ficción):
//   D: casas mayas de bajareque y techo de guano (palma) sobre plataformas bajas, como las de hoy en la región; la milpa
//      de maíz, frijol y calabaza; el telar de cintura; el fogón de tres piedras; el comercio de cacao y sal; los escribas
//      (aj tz'ihb) pintaban con pincel y a veces llevaban pinceles en el tocado (vasijas del Clásico); libros de papel de
//      corteza (huun) en el Clásico, conocidos por imágenes y restos (no se conserva ninguno legible).
//   I: el peinado y la ropa de cada habitante (taparrabo, huipil, enredo, capa), simplificados; el orden de la aldea.
//   F: las personas, sus palabras, las hojas que se vuelan y los seres que las guardan.
// Reutiliza de Unity objetos de casa sin rasgos de cultura (fogón de piedras, cestos, vasijas, estera, canoa).

// ---------- Habitantes pintados por código ----------
// Cuadros de 48 × 64 como las fichas de Unity (pies en la fila 62): Reposo1 y Caminar1-4 en 05 (de frente), 01 (de espaldas)
// y 03 (de lado, mirando a la derecha; el juego lo voltea). `nino`: se pinta igual y se reduce a ×0,72.
const MAYAS = {
  MayaEscriba: { piel: '#a06a44', pelo: '#1d1712', peinado: 'mono', torso: 'capa', capa: '#e8e0cc', bajo: 'ex', ropa: '#efe7d2', borde: '#a4483a', tocado: 'pincel', lleva: 'concha' },
  MayaTejedora: { piel: '#93603e', pelo: '#9a9690', peinado: 'trenzas', cinta: '#3d6fa8', torso: 'huipil', ropa: '#f1ead8', borde: '#b23a3a', bajo: 'falda', falda: '#2f4f7a' },
  MayaMercadera: { piel: '#a8714a', pelo: '#211a14', peinado: 'trenzas', cinta: '#d1a232', torso: 'huipil', ropa: '#d9b25a', borde: '#7a3b2a', bajo: 'falda', falda: '#6b4a2e', lleva: 'canasta' },
  MayaPescador: { piel: '#7f5134', pelo: '#191410', peinado: 'mono', torso: 'desnudo', bajo: 'ex', ropa: '#d8cfb6', borde: '#4b6b7a', lleva: 'red' },
  MayaCazador: { piel: '#8f5c3a', pelo: '#1a1410', peinado: 'mono', torso: 'capa', capa: '#9a7448', bajo: 'ex', ropa: '#d8cfb6', borde: '#5a7a3a', tocado: 'plumas', lleva: 'lanza' },
  MayaArmero: { piel: '#8a5636', pelo: '#1a1410', peinado: 'mono', torso: 'capa', capa: '#7a5f42', bajo: 'ex', ropa: '#d8cfb6', borde: '#a4483a', lleva: 'lanza' }, // etapa 45
  MayaNina: { piel: '#a8714a', pelo: '#211a14', peinado: 'trenzas', cinta: '#c0503a', torso: 'huipil', ropa: '#f3eddc', borde: '#4f7d34', bajo: 'falda', falda: '#8a5a3a', nino: true },
  MayaNino: { piel: '#9a6642', pelo: '#1b1511', peinado: 'corto', torso: 'desnudo', bajo: 'ex', ropa: '#efe7d2', borde: '#3d6fa8', nino: true },
};
function pintarMaya(s, dir, fase) {
  const c = document.createElement('canvas'), g = c.getContext('2d', { willReadFrequently: true }); c.width = 48; c.height = 64;
  const lado = dir === '03', espalda = dir === '01', paso = fase ? [0, 1, 0, -1][fase % 4] : 0, bote = fase && fase % 2 === 0 ? -1 : 0;
  const R = (col, x, y, w, h) => px(g, col, x, y + bote, w, h), oscuro = '#3a2a1c', h = s.torso === 'huipil';
  // Piernas y sandalias: de frente se alza un pie y luego el otro; de lado se cruzan.
  const piernas = lado ? [[20 + paso * 2, 0], [24 - paso * 2, 0]] : [[16, paso > 0 ? 2 : 0], [26, paso < 0 ? 2 : 0]];
  for (const [x, alza] of piernas) { px(g, s.piel, x, 44, lado ? 5 : 6, 17 - alza); px(g, oscuro, x, 60 - alza, lado ? 6 : 6, 2); }
  // Prenda de abajo: enredo hasta el tobillo o taparrabo (ex) con su paño delante.
  if (s.bajo === 'falda') { R(s.falda, lado ? 17 : 14, 40, lado ? 14 : 20, 18); R(s.borde, lado ? 17 : 14, 56, lado ? 14 : 20, 2); }
  else { R(s.ropa, lado ? 18 : 15, 40, lado ? 13 : 18, 5); R(s.borde, lado ? 18 : 15, 41, lado ? 13 : 18, 1); if (!espalda) R(s.ropa, lado ? 26 : 21, 45, lado ? 4 : 6, 7); }
  // Torso: huipil (banda bordada y escote) o desnudo, con capa corta.
  const [tx, tw] = lado ? [18, 12] : [15, 18];
  if (h) { R(s.ropa, tx - 2, 26, tw + 4, 18); R(s.borde, tx - 2, 29, tw + 4, 3); R(s.borde, tx - 2, 42, tw + 4, 1); if (!lado && !espalda) R(s.borde, 21, 26, 6, 2); }
  else { R(s.piel, tx, 26, tw, 15); if (s.torso === 'capa') { R(s.capa, tx - 2, 26, tw + 4, 8); R(s.borde || oscuro, tx - 2, 33, tw + 4, 1); } }
  // Brazos (se balancean al andar; con huipil solo asoman los antebrazos).
  const brazo = (x, dy) => R(s.piel, x, (h ? 37 : 27) + dy, 4, h ? 6 : 15);
  if (lado) brazo(22 + paso * 2, 0); else { brazo(h ? 9 : 11, paso); brazo(h ? 35 : 33, -paso); }
  // Cabeza y pelo; de lado, la frente alargada hacia atrás (I: la modificación craneal, muy representada en el Clásico).
  const hx = lado ? 19 : 18;
  R(s.piel, hx, 14, lado ? 11 : 12, 12);
  if (lado) { R(s.piel, 30, 19, 1, 3); R(oscuro, 27, 19, 2, 1); R(s.pelo, 19, 13, 5, 11); R(s.pelo, 19, 12, 9, 2); }
  else if (!espalda) { R(oscuro, 20, 19, 2, 1); R(oscuro, 26, 19, 2, 1); R('#7a4a30', 23, 23, 2, 1); R(s.pelo, 18, 12, 12, 3); }
  else R(s.pelo, 18, 12, 12, 13);
  if (s.peinado === 'mono') R(s.pelo, lado ? 20 : 21, 6, 6, 7); // el pelo atado en lo alto
  if (s.peinado === 'trenzas') { R(s.pelo, lado ? 18 : 16, 13, 2, 16); if (!lado) R(s.pelo, 30, 13, 2, 16); R(s.cinta, lado ? 19 : 18, 13, lado ? 8 : 12, 2); if (espalda) R(s.cinta, 23, 22, 2, 6); }
  if (s.peinado === 'corto') R(s.pelo, hx, 12, lado ? 11 : 12, 4);
  if (s.tocado) R(s.borde || '#a4483a', hx, 15, lado ? 11 : 12, 2);
  if (s.tocado === 'pincel') for (let k = 0; k < 8; k++) R(k < 2 ? oscuro : '#c9a35a', 28 + Math.floor(k / 3), 14 - k, 1, 1); // pincel en el tocado
  if (s.tocado === 'plumas') { R('#3f8a4a', 24, 3, 2, 10); R('#2f6e8a', 20, 5, 2, 8); }
  // Lo que lleva cada uno.
  if (s.lleva === 'concha') R('#f2efe6', lado ? 25 : 36, 42, 4, 3);
  if (s.lleva === 'canasta') { R('#8a6438', lado ? 26 : 35, 36, 9, 8); for (let y = 37; y < 44; y += 2) R('#6b4a2a', lado ? 26 : 35, y, 9, 1); }
  if (s.lleva === 'red') for (let y = 32; y < 48; y += 2) for (let x = 0; x < 8; x += 2) R('#cdbf98', (lado ? 13 : 6) + x + (y % 4 ? 1 : 0), y, 1, 1);
  if (s.lleva === 'lanza') { R('#7a5a36', lado ? 32 : 40, 6, 2, 56); R('#4a4a52', lado ? 31 : 39, 1, 4, 6); }
  // Contorno oscuro de 1 px alrededor de la figura, como en las fichas.
  const im = g.getImageData(0, 0, 48, 64), a = im.data, borde = [];
  for (let y = 0; y < 64; y++) for (let x = 0; x < 48; x++) {
    if (a[(y * 48 + x) * 4 + 3]) continue;
    if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([u, v]) => x + u >= 0 && x + u < 48 && y + v >= 0 && y + v < 64 && a[((y + v) * 48 + x + u) * 4 + 3] > 0)) borde.push([x, y]);
  }
  for (const [x, y] of borde) px(g, '#1a120c', x, y);
  if (!s.nino) return c;
  const k = document.createElement('canvas'), q = k.getContext('2d'); k.width = 48; k.height = 64; q.imageSmoothingEnabled = false;
  q.drawImage(c, 0, 0, 48, 64, Math.round(24 - 24 * 0.72), Math.round(62 - 62 * 0.72), Math.round(48 * 0.72), Math.round(64 * 0.72));
  return k;
}
for (const [arte, s] of Object.entries(MAYAS)) for (const dir of ['01', '03', '05']) {
  registrarLienzo(`Npc_${arte}_Reposo1_${dir}`, pintarMaya(s, dir, 0), 2 / 64);
  for (let f = 1; f <= 4; f++) registrarLienzo(`Npc_${arte}_Caminar${f}_${dir}`, pintarMaya(s, dir, f), 2 / 64);
}

// ---------- Casas, milpa y telar ----------
// Casa: plataforma de piedra, muros de bajareque encalados con la puerta al frente y techo alto de palma. Base en la fila 116.
function pintarCasa(v) {
  const c = document.createElement('canvas'), g = c.getContext('2d'), P = PALETA[4], rnd = azar(440 + v); c.width = 128; c.height = 120;
  px(g, P.junta, 4, 103, 120, 14); for (let x = 5; x < 123; x += 12) px(g, elige(rnd, P.piedra), x, 104, 11, 12); px(g, P.claro, 4, 103, 120, 1);
  px(g, '#3a2a1c', 17, 65, 94, 39); px(g, v % 2 ? '#d9c9a6' : '#c9a77a', 18, 66, 92, 38);
  for (let i = 0; i < 18; i++) px(g, '#a88a62', 20 + Math.floor(rnd() * 88), 68 + Math.floor(rnd() * 34), 1 + Math.floor(rnd() * 3), 1); // grietas del barro
  px(g, '#221a12', 55, 76, 18, 28); px(g, '#3a2a1c', 54, 75, 20, 1);
  for (let y = 16; y < 72; y++) { // techo de palma: más ancho abajo (alero), hebras de tres tonos
    const w = Math.round(30 + (y - 16) * 1.7), x0 = 64 - w / 2;
    for (let x = 0; x < w; x++) px(g, ['#b08a4a', '#9c7a3e', '#c49a55'][(x + (y >> 1) + Math.floor(rnd() * 2)) % 3], x0 + x, y);
  }
  px(g, '#6b5228', 48, 14, 32, 3); for (let x = 18; x < 112; x += 3) px(g, '#7c5f2e', x - 1, 71, 1, 3 + Math.floor(rnd() * 3)); // cumbrera y fleco
  registrarLienzo(`Casa_Maya_0${v}`, c, 4 / 120);
}
// Milpa: cuatro hileras de maíz con jilote y espiga, y hojas de calabaza abajo. Base en la fila 94.
function pintarMilpa() {
  const c = document.createElement('canvas'), g = c.getContext('2d'), rnd = azar(441); c.width = 192; c.height = 96;
  for (let fila = 0; fila < 4; fila++) for (let k = 0; k < 9; k++) {
    const x = 8 + k * 21 + (fila % 2) * 10 + Math.floor(rnd() * 4), base = 58 + fila * 11, alto = 40 + Math.floor(rnd() * 14);
    px(g, '#4f7d34', x, base - alto, 2, alto);
    for (let h = 0; h < 4; h++) { const y = base - 8 - h * 9; for (let i = 0; i < 6; i++) px(g, '#679a3f', x + (h % 2 ? 2 + i : -1 - i), y + Math.floor(i / 2), 1, 1); }
    px(g, '#d8b84a', x - 1, base - alto - 4, 4, 4); if (rnd() < 0.6) px(g, '#e6d68a', x + 2, base - alto / 2, 2, 5); // espiga y elote
  }
  for (let i = 0; i < 10; i++) bola(g, '#3e6a2c', 10 + rnd() * 172, 84 + rnd() * 8, 5, 3); // calabaza
  registrarLienzo('Milpa_Maya', c, 2 / 96);
}
// Telar de cintura: un poste (tronco) del que sale la tela tensa hacia quien teje, con franjas de color. Base en la fila 70.
function pintarTelar() {
  const c = document.createElement('canvas'), g = c.getContext('2d'); c.width = 64; c.height = 72;
  px(g, '#5a4026', 6, 6, 7, 64); px(g, '#7a5a36', 7, 6, 2, 64); px(g, '#4f7d34', 3, 4, 12, 4);
  for (let i = 0; i < 34; i++) { const x = 13 + i, y = 22 + Math.round(i * 1.1); px(g, ['#f1ead8', '#b23a3a', '#f1ead8', '#3d6fa8', '#d1a232'][Math.floor(i / 4) % 5], x, y, 1, 9); }
  px(g, '#7a5a36', 45, 58, 3, 12);
  registrarLienzo('Telar_Cintura', c, 2 / 72);
}
// Hoja del libro de corteza: papel claro con columnas de glifos rojos y negros.
function pintarHoja() {
  const c = document.createElement('canvas'), g = c.getContext('2d'); c.width = 20; c.height = 24;
  px(g, '#8a7a5a', 2, 2, 16, 20); px(g, '#efe6cc', 3, 3, 14, 18);
  for (let y = 5; y < 20; y += 4) { px(g, '#a4483a', 5, y, 4, 2); px(g, '#2a241c', 11, y, 4, 2); }
  registrarLienzo('Hoja_Libro', c, 0.5);
}
[1, 2].forEach(pintarCasa); pintarMilpa(); pintarTelar(); pintarHoja();
OBSTACULOS.push(['Casa_Maya', 2.4, 1.2], ['Milpa_Maya', 3.9, 1.5], ['Telar_Cintura', 0.4, 0.4]);

// ---------- La región ----------
const ALDEA_MAYA = {
  suelo: [[-19, -13, -1, 1, 'tierra'], [-12, 14, -6, 8, 'tierra']],
  rio: [-19, 18, -9, -7],
  limites: [-22, 18, -10, 11],
  objetos: [['Casa_Maya_01', -10, 7.2], ['Casa_Maya_02', -4, 7.4], ['Casa_Maya_01', 3, 7.2], ['Casa_Maya_02', 9.5, 7.4], ['Casa_Maya_01', 12.6, 1.5],
    ['Milpa_Maya', 7.5, -3.5], ['Telar_Cintura', -8.6, 1.4], ['Fogon_Piedras_01', -2, 1], ['Cestos_01', 4.5, 2.2], ['Vasijas_01', -5.6, 5.3],
    ['Canoa_01', 4, -8], ['Cestos_02', 11.2, -5.6], ['Vasijas_02', 11.3, 0.4], ['Lena_01', -0.6, 2.4],
    // plantas sueltas por el patio (sin choque)
    ...[[-11, -4.6], [-6.5, -5.2], [-1, 5.6], [6, 4.8], [13.4, 6.3], [-11.4, 4.2], [0.5, -5.4], [13.6, -2.2]].map(([x, y], i) => [['Pasto_Alto_01', 'Flor_Selva_01', 'Pasto_Alto_02', 'Helecho_02'][i % 4], x, y])],
  puntos: { llegada: { x: -17, y: 0 }, portal: { x: -19, y: 0 }, cocina: { x: -2, y: 0.1 }, comercio: { x: 3.6, y: 1.7 }, armero: { x: 9.6, y: 2.4 }, hoja: { x: 13.5, y: -5.4 } },
  // id, arte y ruta (x, y)
  habitantes: [['escriba', 'MayaEscriba', [[-4.8, 5.3], [-3, 5.3]]], ['tejedora', 'MayaTejedora', [[-7.7, 1.1]]], ['mercadera', 'MayaMercadera', [[3, 0.6], [4.6, 0.6]]],
    ['pescador', 'MayaPescador', [[9.6, -5.3], [12.4, -5.3]]], ['cazador', 'MayaCazador', [[-10.5, -2.5], [-10.5, 0.5]]],
    ['armero_maya', 'MayaArmero', [[9.6, 3.2]]], ['nina_maya', 'MayaNina', [[-0.5, -3], [1.5, -3]]], ['nino_maya', 'MayaNino', [[1.5, -4.2], [-0.5, -4.2]]]],
};
function regionAldeaMaya() {
  const A = ALDEA_MAYA, tipo = new Map(), rnd = azar(hash('aldea_maya'));
  for (const [x0, x1, y0, y1, t] of A.suelo) for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) tipo.set(x + ',' + y, t);
  const es = (x, y) => tipo.has(x + ',' + y), [lx0, lx1, ly0, ly1] = A.limites, [rx0, rx1, ry0, ry1] = A.rio;
  const losas = [...tipo].map(([k, t]) => { const [x, y] = k.split(',').map(Number); return { x, y, tipo: t, arriba: es(x, y + 1) ? 0 : LOSA.matas, abajo: es(x, y - 1) ? 0 : LOSA.cara }; });
  const agua = [], vacio = [];
  for (let x = rx0; x <= rx1; x++) for (let y = ry0; y <= ry1; y++) agua.push({ x, y });
  for (let x = lx0; x <= lx1; x++) for (let y = ly0; y <= ly1; y++) if (!es(x, y)) vacio.push({ x, y });
  const objetos = A.objetos.map(([sprite, x, y]) => ({ sprite, x, y, z: 0 }));
  const cerca = (a, b) => { for (let u = -2; u <= 2; u++) for (let v = -2; v <= 3; v++) if (es(a + u, b + v) || (b + v >= ry0 && b + v <= ry1)) return true; return false; };
  for (let a = lx0 - 4; a <= lx1 + 4; a++) for (let b = ly0 - 4; b <= ly1 + 4; b++)
    if (rnd() < 0.18 && !cerca(a, b)) objetos.push({ sprite: elige(rnd, ESTILO[4].deco), x: a + rnd() - 0.5, y: b + rnd() - 0.5, z: 0 });
  return { nota: 'Pintada por código (js/aldea_maya.js)', suelo: [], agua, objetos, niveles: [], rampas: [], muelles: [], limites: A.limites,
    puntos: { ...A.puntos }, vacio, losas, piso: 4, aguaDebajo: true };
}
REGIONES.aldea_maya = regionAldeaMaya();

// ---------- Misión, nombres y diálogos ----------
// shortcut: como MP_MAY_01, vive aquí y no en datos/ (generados desde Unity); pasar a QuestData, NpcData y DialogueData al portar.
MISIONES.MP_MAY_01.pasos[1] = { aviso: 'hablar:escriba', veces: 1, texto: "Busca a la gente de Lakamha' en la aldea, al este de la plaza" };
MISIONES.MP_MAY_02 = { titulo: 'Los registros perdidos', banderas: ['may.registros_recuperados'], pasos: [
  { aviso: 'examinar:hoja_libro', veces: 3, texto: 'Recupera las hojas del libro del escriba (junto al río y en la plaza)' },
  { aviso: 'hablar:escriba', veces: 1, texto: 'Lleva las hojas al escriba' },
] };
Object.assign(NPCS, { escriba: 'Escriba', tejedora: 'Tejedora', mercadera: 'Mercadera', pescador: 'Pescador del Otolum', cazador: 'Joven cazador', armero_maya: 'Tallador de pedernal', nina_maya: 'Niña', nino_maya: 'Niño' });
const rama = (requiere, lineas, extra = {}) => ({ requiere, prohibe: extra.prohibe || [], lineas, alTerminar: extra.alTerminar || [], mision: extra.mision || null });
Object.assign(DIALOGOS, {
  escriba: [
    rama(['mision.MP_MAY_02.completada'], ['Con estas hojas vuelvo a leer el camino: bajo el palacio, el agua corre por canales de piedra hasta las cámaras viejas.',
      'Ahí empezó a borrarse todo. Si la Sombra tiene una guarida en Lakamha\', está donde el agua se oscurece.']),
    rama(['may.hojas_completas'], ['¡Las tres! Todavía tibias de la mano que las trajo.', 'Déjame leerlas despacio: aquí está el camino del agua que había olvidado.'],
      { alTerminar: ['may.camino_agua'] }),
    rama(['mision.MP_MAY_02.activa'], ['Una hoja cayó junto al río, por donde pesca el del Otolum. Las otras dos, en la plaza del templo, donde rondan esos seres sin rostro.']),
    rama(['mision.MP_MAY_01.activa'], ['¿Vienes de la plaza? Entonces viste el tablero. Lo tallamos para que los nombres duraran más que nosotros.',
      'Cada mañana hay un glifo menos. Y mi libro de corteza también se borra: escribo un día y al siguiente la hoja está en blanco.',
      'Cuando esa sombra cruzó la aldea, el viento se llevó tres hojas del libro. Si las encuentras, quizá recuerde lo que decían.'],
      { mision: 'MP_MAY_02' }),
    rama([], ['Se pinta con pincel, de arriba abajo, de dos en dos columnas. Así se lee también.']),
  ],
  tejedora: [
    rama(['may.registros_recuperados'], ['El escriba ya canta al leer. Hacía lunas que no lo oía.']),
    rama([], ['El telar se ata a la cintura y al tronco: es el cuerpo el que tensa los hilos.',
      'Antes sabía cada dibujo de memoria. Ahora se me olvidan a la mitad, como a todos aquí. Siéntate junto al fuego si tienes hambre.']),
  ],
  armero_maya: [rama([], ['El pedernal se trabaja a golpes, lasca a lasca, con piedra y con asta de venado.',
    'Te presto una lanza. Las demás te las hago si traes con qué pagar: ecos, fibras, y cacao para las buenas.'])],
  mercadera: [rama([], ['Cacao de las tierras bajas y sal de la costa. Aquí todo se cambia por algo.', 'Tú traes ecos, ¿no? Raro pago, pero lo acepto.'])],
  pescador: [rama([], ['El Otolum baja de la sierra. En la ciudad lo metimos entre piedras para que en las lluvias no se lleve la plaza.',
    'Ayer vi una hoja pintada flotando en el agua. La dejé en la orilla, junto a mis cestos.'])],
  cazador: [rama([], ['En la selva hay jaguares, y monos que gritan antes del amanecer. Desde que llegó la Sombra, hasta los monos atacan.'])],
  nina_maya: [rama([], ['¿Eres un espíritu? Mi abuela dice que los espíritus no tienen sombra... ¡pero tú sí!'])],
  nino_maya: [rama([], ['Cuando sea grande voy a pintar como el escriba. Ya sé hacer el punto y la barra: uno y cinco.'])],
});
// Las tres hojas: 1 en la aldea (orilla del río), 2 y 3 en la plaza de Palenque con un espíritu de la Sombra cada una.
const HOJAS = { 1: { region: 'aldea_maya', ...ALDEA_MAYA.puntos.hoja }, 2: { region: 'palenque', x: 8, y: -5, guardia: true }, 3: { region: 'palenque', x: 18, y: 4.5, guardia: true } };
function poblarHojas(id, E, O, I) {
  // Si la misión empieza aquí mismo (hablando con el escriba), las hojas aparecen sin tener que volver a entrar.
  if (!bandera('mision.MP_MAY_02.activa')) { let hecho = false; return juego.alAparecer.push(() => { if (!hecho && bandera('mision.MP_MAY_02.activa')) { hecho = true; poblarHojas(id, E, O, I); } }); }
  for (const [n, h] of Object.entries(HOJAS)) {
    if (h.region !== id || bandera(`may.hoja_${n}`)) continue;
    const soltar = () => {
      const o = { x: h.x, y: h.y, actualizar() {}, dibujar(f) { const t = performance.now() / 1000; elipse(f.x, f.y, 0.35 + Math.sin(t * 3) * 0.05, 'rgba(240,220,160,.3)'); dibujar('Hoja_Libro', f.x, f.y, 0.3 + Math.sin(t * 2) * 0.08); } };
      O.push(o);
      const it = { x: h.x, y: h.y, r: 1.2, texto: 'Recoger la hoja', usar() {
        poner(`may.hoja_${n}`); O.splice(O.indexOf(o), 1); I.splice(I.indexOf(it), 1);
        entregar({ xp: 25 }, `hoja.maya_${n}`); avisar('examinar:hoja_libro');
        if ([1, 2, 3].every((k) => bandera(`may.hoja_${k}`))) { poner('may.hojas_completas'); toast('Tienes las tres hojas: llévalas al escriba', 4); }
      } };
      I.push(it);
    };
    if (h.guardia && !bandera(`may.guardia_${n}`)) E.push(nuevoEspiritu(h.x, h.y, () => { poner(`may.guardia_${n}`); soltar(); }));
    else soltar();
  }
}

// ---------- Contenido (desde poblar, js/juego.js) ----------
function poblarAldeaMaya(P, E, O, I, T) {
  for (const [id, arte, ruta] of ALDEA_MAYA.habitantes) {
    const n = nuevoHabitante(id, arte, ruta.map(([x, y]) => ({ x, y })));
    O.push(n); I.push(siguiendo(n, 1.4, 'Hablar', () => conversar(n), null, n));
  }
  I.push({ ...P.cocina, r: 0.9, texto: 'Cocinar', usar: () => abrirMenu('cocina', 'cocina') });
  I.push({ ...P.comercio, r: 0.9, texto: 'Comerciar', usar: () => abrirMenu('comerciante', 'comerciante') });
  I.push({ ...P.armero, r: 1, texto: 'Armero', usar: () => abrirMenu('armero_maya', 'armero_maya') }); // js/armas.js, etapa 45
  T.push({ ...P.portal, a: 'palenque', punto: 'desde_aldea' });
  poblarHojas('aldea_maya', E, O, I);
}

// Autocomprobación: llegada, servicios, hojas y rutas de los habitantes en sitios libres; cada cuadro pintado existe.
(() => {
  const antes = mundo;
  mundo = construirMundo('aldea_maya');
  const libres = [...Object.values(ALDEA_MAYA.puntos).filter((p) => p !== ALDEA_MAYA.puntos.portal), ...ALDEA_MAYA.habitantes.flatMap(([, , r]) => r.map(([x, y]) => ({ x, y })))];
  console.assert(libres.every((p) => !bloqueado(p.x, p.y, 0.2)), 'Aldea maya: puntos y rutas libres');
  mundo = construirMundo('palenque');
  console.assert([HOJAS[2], HOJAS[3]].every((p) => !bloqueado(p.x, p.y, 0.3)), 'Palenque: hojas en la plaza');
  mundo = antes;
  console.assert(Object.keys(MAYAS).every((a) => ['01', '03', '05'].every((d) => SPRITES[`Npc_${a}_Caminar4_${d}`])), 'Aldea maya: cuadros de los habitantes');
})();
