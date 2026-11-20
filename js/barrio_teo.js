'use strict';
// El barrio de Teotihuacan (etapa 54, solo HTML; ver PORTAR_A_UNITY.md §41). Al este de la plaza de la Pirámide del Sol: un
// patio de estuco entre conjuntos de departamentos, con un altar al centro, un taller de obsidiana y un fogón. Siete
// habitantes con el arte de Unity vestido con la ropa de su cultura (herramientas/vestir.mjs, etapa 56), y gente de otras con la
// suya: un viajero zapoteco del barrio oaxaqueño y la mercadera maya. Misión MP_TEO_02 «Los caminos olvidados»: preguntar
// por las rutas a tres personas de culturas distintas y volver con el comerciante.
// Fidelidad (D documentado, I interpretación, F ficción):
//   D: la gente vivía en conjuntos de departamentos de muros de piedra y estuco, con patios y altares al centro; había
//      barrios de gente de fuera: Tlailotlacan, de zapotecos de Oaxaca (con tumbas y urnas zapotecas), y el «Barrio de los
//      Comerciantes», con cerámica maya y de la costa del Golfo; talleres de obsidiana (la verde, de la Sierra de las
//      Navajas); la cerámica «anaranjado delgado», de Puebla, se llevaba a toda Mesoamérica; en figurillas y murales:
//      tocados anchos con plumas, orejeras, el quechquemitl de las mujeres, la tilma anudada y el mecapal para cargar.
//   I: la ropa: los cortes de los habitantes olmecas de Unity con los colores del altiplano (rojo y ocre) o zapotecos
//      (añil y grana), el tocado ancho y el del viajero zapoteco (sale de las urnas), y el orden del barrio.
//   F: las personas, sus palabras y los caminos que la Sombra borra de la memoria.

// ---------- Conjunto de departamentos, altar del patio y taller ----------
// Conjunto: talud de tezontle, muro de estuco con un tablero rojo arriba, la puerta y el techo plano. Base en la fila 106.
function pintarConjunto(v) {
  const c = document.createElement('canvas'), g = c.getContext('2d'), P = PALETA[5], rnd = azar(540 + v); c.width = 176; c.height = 110;
  for (let y = 0; y < 16; y++) px(g, y % 5 ? elige(rnd, P.tezontle) : P.tezontle[2], 4 + Math.round(y / 3), 106 - y, 168 - Math.round(y / 1.5), 1); // talud
  px(g, P.junta, 9, 34, 158, 57); px(g, v % 2 ? P.piedra[0] : P.piedra[3], 10, 35, 156, 56);
  for (let i = 0; i < 14; i++) px(g, P.oscuro, 12 + Math.floor(rnd() * 150), 50 + Math.floor(rnd() * 38), 1 + Math.floor(rnd() * 3), 1); // grietas del estuco
  px(g, P.claro, 8, 28, 160, 2); px(g, P.rojo[1], 8, 30, 160, 12); px(g, P.rojo[2], 12, 33, 152, 6); // tablero rojo
  for (let x = 16; x < 160; x += 18) px(g, P.amarillo, x, 35, 6, 2); // motivos pintados en el tablero
  px(g, P.oscuro, 6, 24, 164, 4); px(g, P.tezontle[2], 6, 22, 164, 2); // techo plano (el borde del terrado)
  px(g, '#221a12', 78, 58, 20, 33); px(g, P.junta, 76, 56, 24, 2);
  registrarLienzo(`Conjunto_Teo_0${v}`, c, 4 / 110);
}
// Altar del patio: pequeño, en talud-tablero, con el tablero rojo. Base en la fila 38.
function pintarAltarPatio() {
  const c = document.createElement('canvas'), g = c.getContext('2d'), P = PALETA[5]; c.width = 48; c.height = 40;
  px(g, P.junta, 3, 12, 42, 27); px(g, P.tezontle[1], 4, 26, 40, 12); px(g, P.claro, 6, 13, 36, 2); px(g, P.rojo[1], 6, 15, 36, 10); px(g, P.rojo[2], 9, 17, 30, 6);
  px(g, P.piedra[0], 8, 9, 32, 4); px(g, P.claro, 8, 9, 32, 1);
  registrarLienzo('Altar_Patio_Teo', c, 2 / 40);
}
// Taller de obsidiana: un petate con núcleos y navajas negras y verdes. Base en la fila 22.
function pintarTaller() {
  const c = document.createElement('canvas'), g = c.getContext('2d'), rnd = azar(541); c.width = 56; c.height = 24;
  px(g, '#8a6a3e', 2, 8, 52, 14); for (let x = 2; x < 54; x += 3) px(g, '#a8854e', x, 8, 1, 14);
  for (let i = 0; i < 18; i++) px(g, rnd() < 0.5 ? '#1f2a26' : '#2f5a46', 5 + Math.floor(rnd() * 46), 9 + Math.floor(rnd() * 11), 2 + Math.floor(rnd() * 3), 1);
  for (const x of [12, 30, 44]) { bola(g, '#1a2420', x, 13, 3, 2); px(g, '#4f7a66', x - 1, 12, 1, 1); } // núcleos
  registrarLienzo('Taller_Obsidiana', c, 2 / 24);
}
[1, 2].forEach(pintarConjunto); pintarAltarPatio(); pintarTaller();
OBSTACULOS.push(['Conjunto_Teo', 3.3, 1.2], ['Altar_Patio_Teo', 0.8, 0.5], ['Taller_Obsidiana', 0.9, 0.3]);

// ---------- La región ----------
const BARRIO_TEO = {
  suelo: [[-17, -12, -1, 1, 'tierra'], [-11, 14, -6, 6, 'estuco']],
  limites: [-20, 17, -9, 10],
  objetos: [['Conjunto_Teo_01', -8, 7.4], ['Conjunto_Teo_02', -1, 7.4], ['Conjunto_Teo_01', 6, 7.4], ['Conjunto_Teo_02', 12.6, 7.4],
    ['Altar_Patio_Teo', 2, 1], ['Taller_Obsidiana', -6.5, -3.6], ['Fogon_Piedras_01', 8, -1], ['Vasijas_01', 10, -2.6], ['Vasijas_02', 5.6, -4.6],
    ['Cestos_01', 4, -3], ['Cestos_02', 12.5, 4.6], ['Lena_01', 9.6, 0.6]],
  puntos: { llegada: { x: -15, y: 0 }, portal: { x: -17, y: 0 }, cocina: { x: 8, y: -1.9 }, comercio: { x: 5, y: -2.4 } },
  // id, arte y ruta (x, y)
  habitantes: [['comerciante_teo', 'TeoComerciante', [[-3, 4.6], [0, 4.6]]], ['tallador_teo', 'TeoTallador', [[-6, -2.6]]], ['alfarera_teo', 'TeoAlfarera', [[9.5, -1.4]]],
    ['zapoteco', 'ZapotecoViajero', [[11, 3.4], [12.6, 3.4]]], ['mercadera_teo', 'MayaMercadera', [[4, -1.6], [6, -1.6]]],
    ['nina_teo', 'TeoNina', [[-1, -4.6], [1, -4.6]]], ['nino_teo', 'TeoNino', [[1, -3.6], [-1, -3.6]]]],
};
function regionBarrioTeo() {
  const B = BARRIO_TEO, tipo = new Map(), rnd = azar(hash('barrio_teo'));
  for (const [x0, x1, y0, y1, t] of B.suelo) for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) tipo.set(x + ',' + y, t);
  const es = (x, y) => tipo.has(x + ',' + y), [lx0, lx1, ly0, ly1] = B.limites;
  const losas = [...tipo].map(([k, t]) => { const [x, y] = k.split(',').map(Number); return { x, y, tipo: t, arriba: es(x, y + 1) ? 0 : LOSA.matas, abajo: es(x, y - 1) ? 0 : LOSA.cara }; });
  const vacio = [];
  for (let x = lx0; x <= lx1; x++) for (let y = ly0; y <= ly1; y++) if (!es(x, y)) vacio.push({ x, y });
  const objetos = B.objetos.map(([sprite, x, y]) => ({ sprite, x, y, z: 0 }));
  const cerca = (a, b) => { for (let u = -2; u <= 2; u++) for (let v = -2; v <= 3; v++) if (es(a + u, b + v)) return true; return false; };
  for (let a = lx0 - 4; a <= lx1 + 4; a++) for (let b = ly0 - 4; b <= ly1 + 4; b++)
    if (rnd() < 0.14 && !cerca(a, b) && !(b > 6 && b < 10)) objetos.push({ sprite: elige(rnd, ESTILO[5].deco), x: a + rnd() - 0.5, y: b + rnd() - 0.5, z: 0 });
  return { nota: 'Pintada por código (js/barrio_teo.js)', suelo: [], agua: [], objetos, niveles: [], rampas: [], muelles: [], limites: B.limites,
    puntos: { ...B.puntos }, vacio, losas, piso: 5 };
}
REGIONES.barrio_teo = regionBarrioTeo();
// Camino de la plaza de la Pirámide del Sol al barrio (este de la plaza).
TEOTIHUACAN.suelo.push([16, 19, 1, 3, 'tierra']);
Object.assign(TEOTIHUACAN.puntos, { desde_barrio: { x: 17.5, y: 2 }, a_barrio: { x: 19.2, y: 2 } });
REGIONES.teotihuacan = regionTeotihuacan();

// ---------- Misión, nombres y diálogos ----------
// shortcut: como MP_MAY_02, vive aquí y no en datos/ (generados desde Unity); pasar a QuestData, NpcData y DialogueData al portar.
MISIONES.MP_TEO_01.pasos[1] = { aviso: 'hablar:comerciante_teo', veces: 1, texto: 'Busca a la gente del barrio, al este de la plaza de la Pirámide del Sol' };
MISIONES.MP_TEO_02 = { titulo: 'Los caminos olvidados', banderas: ['teo.caminos_recordados'], pasos: [
  { aviso: 'hablar:ruta', veces: 3, texto: 'Pregunta por los caminos al tallador de obsidiana, al viajero zapoteco y a la mercadera maya' },
  { aviso: 'hablar:comerciante_teo', veces: 1, texto: 'Cuéntale al comerciante lo que recuerdan' },
] };
Object.assign(NPCS, { comerciante_teo: 'Comerciante', tallador_teo: 'Tallador de obsidiana', alfarera_teo: 'Alfarera', zapoteco: 'Viajero zapoteco', mercadera_teo: 'Mercadera maya', nina_teo: 'Niña', nino_teo: 'Niño' });
// Cada informante cuenta su camino una vez, con la misión activa (aviso común «hablar:ruta»).
const ruta = (id, lineas) => rama(['mision.MP_TEO_02.activa'], lineas, { prohibe: [`teo.ruta_${id}`], alTerminar: [`teo.ruta_${id}`], aviso: 'hablar:ruta' });
Object.assign(DIALOGOS, {
  comerciante_teo: [
    rama(['mision.MP_TEO_02.completada'], ['Bajo la Pirámide del Sol hay una cueva vieja, más vieja que la ciudad. Los caminos empiezan ahí, dicen los abuelos.',
      'Ahora sale humo frío de su boca. Si la Sombra se esconde en algún sitio, es ahí abajo.']),
    rama(['teo.ruta_tallador_teo', 'teo.ruta_zapoteco', 'teo.ruta_mercadera_teo'], ['El norte de la obsidiana, el sur de los zapotecos, el sureste del cacao... ¡Ahora lo recuerdo todo!',
      'Los caminos no se perdieron: alguien nos los quitó de la cabeza. Y todos empiezan en el mismo sitio.'], { alTerminar: ['teo.camino_cueva'] }),
    rama(['mision.MP_TEO_02.activa'], ['Pregunta a los que vienen de lejos: el tallador sabe el camino del norte, el viajero zapoteco el del sur y la mercadera el del cacao.']),
    rama(['mision.MP_TEO_01.activa'], ['¿Vienes de la calzada? Entonces viste el mural sin voz. Aquí nos pasa lo mismo, pero con los caminos.',
      'Llevo toda la vida cargando con el mecapal de un pueblo a otro. Ayer salí al camino del sur... y no supe por dónde seguir.',
      'Aquí vive gente de muchas tierras. Si cada uno recuerda su camino, quizá entre todos los volvamos a unir.'], { mision: 'MP_TEO_02' }),
    rama([], ['La obsidiana sale de aquí hacia todas partes; el cacao, las plumas y las conchas llegan de muy lejos. Así vive la ciudad.']),
  ],
  tallador_teo: [
    ruta('tallador_teo', ['El camino del norte sube a la sierra, donde la obsidiana es verde como el agua del lago. Lo hice cien veces.',
      'Lo recuerdo porque la piedra lo recuerda: mira esta navaja, tiene el color de aquella tierra.']),
    rama([], ['Se golpea el núcleo con un percutor de asta y la navaja salta entera, fina como una hoja. No hay filo mejor.']),
  ],
  zapoteco: [
    ruta('zapoteco', ['Mi familia vino del sur hace muchas generaciones, de los valles de Oaxaca, de la gran ciudad en lo alto del cerro.',
      'Aquí enterramos a los nuestros a nuestra manera, con sus urnas. El camino del sur lo guardo en las canciones de mi abuela.',
      'Algún día volveré allá. Dicen que también allá se están olvidando los nombres.']),
    rama([], ['En mi barrio hablamos nuestra lengua y en el mercado, la de aquí. Somos de dos tierras a la vez.']),
  ],
  mercadera_teo: [
    ruta('mercadera_teo', ['Vengo de las tierras bajas, por el camino del cacao: selvas, ríos y luego la sierra. Muchos días de camino.',
      'Traigo cacao y plumas, y me llevo obsidiana verde y vasijas anaranjadas. A Lakamha\' le gustan mucho.']),
    rama([], ['Aquí me miran la ropa y el peinado: «la de las tierras bajas». Y yo les miro los tocados, tan anchos.']),
  ],
  alfarera_teo: [rama([], ['Las vasijas anaranjadas, tan delgadas, vienen de otra tierra; yo hago las de diario. Siéntate junto al fogón si tienes hambre.'])],
  nina_teo: [rama([], ['Mi abuela dice que la montaña grande la hicieron los dioses. ¡Pero yo vi a la gente cargando las piedras, en un sueño!'])],
  nino_teo: [rama([], ['Cuando sea grande voy a ser comerciante y voy a llegar hasta el mar.'])],
});

// ---------- Contenido (desde poblar, js/juego.js) ----------
function poblarBarrioTeo(P, E, O, I, T) {
  for (const [id, arte, ruta] of BARRIO_TEO.habitantes) {
    const n = nuevoHabitante(id, arte, ruta.map(([x, y]) => ({ x, y })));
    O.push(n); I.push(siguiendo(n, 1.4, 'Hablar', () => conversar(n), null, n));
  }
  I.push({ ...P.cocina, r: 0.9, texto: 'Cocinar', usar: () => abrirMenu('cocina', 'cocina') });
  I.push({ ...P.comercio, r: 0.9, texto: 'Comerciar', usar: () => abrirMenu('comerciante', 'comerciante') });
  T.push({ ...P.portal, a: 'teotihuacan', punto: 'desde_barrio' });
}

// Autocomprobación: llegada, servicios y rutas libres; el camino desde la plaza; cada cuadro pintado existe.
(() => {
  const antes = mundo;
  mundo = construirMundo('barrio_teo');
  const libres = [BARRIO_TEO.puntos.llegada, BARRIO_TEO.puntos.cocina, BARRIO_TEO.puntos.comercio, ...BARRIO_TEO.habitantes.flatMap(([, , r]) => r.map(([x, y]) => ({ x, y })))];
  console.assert(libres.every((p) => !bloqueado(p.x, p.y, 0.2)), 'Barrio teotihuacano: puntos y rutas libres');
  mundo = construirMundo('teotihuacan');
  console.assert(!bloqueado(17.5, 2, 0.25) && !bloqueado(19.2, 2, 0.25), 'Teotihuacan: el camino al barrio está libre');
  mundo = antes;
  console.assert(BARRIO_TEO.habitantes.every(([, a]) => ['01', '03', '05'].every((d) => SPRITES[`Npc_${a}_Reposo1_${d}`])), 'Barrio teotihuacano: cuadros de los habitantes');
})();
