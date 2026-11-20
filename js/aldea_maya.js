'use strict';
// La aldea de Lakamha' (etapa 44, solo HTML; ver PORTAR_A_UNITY.md §31). Al este de la plaza del templo de Palenque: casas
// de bajareque con techo de palma sobre plataformas, milpa, telar de cintura, fogón de tres piedras y el río al sur. Ocho
// habitantes (el arte de Unity con ropa maya, herramientas/vestir.mjs) y la misión MP_MAY_02 «Los registros perdidos»: tres hojas del
// libro de corteza del escriba, una junto al río y dos en la plaza, guardadas por seres de la Sombra.
// Fidelidad (D documentado, I interpretación, F ficción):
//   D: casas mayas de bajareque y techo de guano (palma) sobre plataformas bajas, como las de hoy en la región; la milpa
//      de maíz, frijol y calabaza; el telar de cintura; el fogón de tres piedras; el comercio de cacao y sal; los escribas
//      (aj tz'ihb) pintaban con pincel y a veces llevaban pinceles en el tocado (vasijas del Clásico); libros de papel de
//      corteza (huun) en el Clásico, conocidos por imágenes y restos (no se conserva ninguno legible).
//   I: la ropa: los cortes de los habitantes olmecas de Unity con los colores mayas (azul y amarillo); el orden de la aldea.
//   F: las personas, sus palabras, las hojas que se vuelan y los seres que las guardan.
// Reutiliza de Unity objetos de casa sin rasgos de cultura (fogón de piedras, cestos, vasijas, estera, canoa).

// ---------- Habitantes: el arte de Unity con la ropa de cada cultura (etapa 56) ----------
// herramientas/vestir.mjs recolorea los cuadros de los habitantes olmecas de Unity (turquesa y rojo → los tonos de la cultura)
// y les pone su tocado; aquí se registran con los pivotes de su base. VESTIDOS (datos/vestidos.js): arte → base de Unity.
for (const [arte, base] of Object.entries(VESTIDOS))
  for (const k of Object.keys(SPRITES)) if (k.startsWith(`Npc_${base}_`)) { const n = k.replace(`Npc_${base}_`, `Npc_${arte}_`); SPRITES[n] = [`arte/NpcCulturas/${n}.png`, ...SPRITES[k].slice(1)]; }

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
const rama = (requiere, lineas, extra = {}) => ({ requiere, prohibe: extra.prohibe || [], lineas, alTerminar: extra.alTerminar || [], mision: extra.mision || null, aviso: extra.aviso || null }); // aviso: además de «hablar:id» (etapa 54)
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
  console.assert(ALDEA_MAYA.habitantes.every(([, a]) => ['01', '03', '05'].every((d) => SPRITES[`Npc_${a}_Reposo1_${d}`])), 'Aldea maya: cuadros de los habitantes');
})();
