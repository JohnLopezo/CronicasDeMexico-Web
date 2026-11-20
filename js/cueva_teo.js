'use strict';
// La mazmorra teotihuacana, «la cueva bajo el Sol» (etapa 55, solo HTML; ver PORTAR_A_UNITY.md §42). Se entra por la boca de
// la cueva, al pie de la escalinata de la Pirámide del Sol, cuando el comerciante del barrio recuerda que todos los caminos
// empiezan ahí (teo.camino_cueva). Niveles generados t1_1…t1_4 (js/niveles.js, claves 21-23): piso 1, la cueva de roca
// volcánica, con la cascabel de la cueva en el 1-4. Los pisos 2 y 3 y el altar de los dioses (PROPUESTA_DIOSES.md), después.
// Fidelidad: D, bajo la Pirámide del Sol hay un túnel de unos 100 m que lleva a cámaras al fondo, bajo el centro de la
// pirámide; la cueva es anterior o contemporánea a la pirámide y en ella se hallaron restos de ofrendas y de fuego; la
// serpiente de cascabel vive en el altiplano. I: que la cueva sea volcánica en todo su recorrido y que tenga varios niveles.
// F: la Sombra en la cueva y la cascabel gigante que la guarda.

// ---------- La boca de la cueva (en Teotihuacan) ----------
const BOCA_CUEVA = { sprite: { x: 10, y: 5.8 }, usar: { x: 10, y: 5 }, llegada: { x: 10, y: 4.1 } };
// Una abertura en la roca al pie de la escalinata: marco de bloques de tezontle y, dentro, oscuridad con hollín. Base en 54 de 56.
function pintarBocaCueva() {
  const c = document.createElement('canvas'), g = c.getContext('2d'), P = PALETA[21], rnd = azar(550); c.width = 72; c.height = 56;
  for (let i = 0; i < 26; i++) { const a = Math.PI * (i / 25), x = 36 - Math.cos(a) * 30, y = 52 - Math.sin(a) * 40; bola(g, P.junta, x, y, 6, 5); bola(g, elige(rnd, PALETA[5].tezontle), x, y, 5, 4); }
  for (let y = 14; y < 54; y++) { const w = Math.round(44 * Math.sqrt(Math.max(0, 1 - ((54 - y) / 40) ** 2))); px(g, y < 22 ? P.hollin : '#070505', 36 - (w >> 1), y, w, 1); }
  for (let i = 0; i < 6; i++) px(g, P.copal, 22 + Math.floor(rnd() * 28), 50 + Math.floor(rnd() * 3), 2, 1); // ofrendas en la entrada
  registrarLienzo('Boca_Cueva', c, 2 / 56);
}
pintarBocaCueva();
REGIONES.teotihuacan.objetos.push({ sprite: 'Boca_Cueva', ...BOCA_CUEVA.sprite, z: 0 });
Object.assign(REGIONES.teotihuacan.puntos, { desde_mazmorra: BOCA_CUEVA.llegada });

// ---------- Misión y textos ----------
// shortcut: como las otras misiones del capítulo III, aquí y no en datos/ (pasar a QuestData al portar).
MISIONES.MP_TEO_03 = { titulo: 'La cueva bajo el Sol', banderas: [], pasos: [
  { aviso: 'llegar:cueva_teo', veces: 1, texto: 'Entra en la cueva, al pie de la escalinata de la Pirámide del Sol' },
  { aviso: 'vencer:cascabel_cueva', veces: 1, texto: 'Baja por la cueva y vence a lo que la vigila' },
  { aviso: 'llegar:teo_piso2', veces: 1, texto: 'Sigue bajando hacia el túnel de los espejos' },
  { aviso: 'vencer:jaguar_reticulado', veces: 1, texto: 'Cruza el túnel y vence a lo que lo vigila' },
  { aviso: 'llegar:teo_piso3', veces: 1, texto: 'Baja hasta la cámara de las cuatro flores' },
  { aviso: 'examinar:altar_dioses', veces: 1, texto: 'Llega al fondo de la cueva y examina el altar' },
] };
DIALOGOS.comerciante_teo.find((r) => r.requiere.includes('teo.ruta_mercadera_teo')).mision = 'MP_TEO_03'; // al recordar los caminos, te manda a la cueva
LLEGAR.t1_1 = 'llegar:cueva_teo'; LLEGAR.t2_1 = 'llegar:teo_piso2'; LLEGAR.t3_1 = 'llegar:teo_piso3';
for (const id of SECUENCIA_TEO) AMBIENTES[id] = { f: 170, vol: 0.3, dron: 38, gotas: 0.12 }; // cueva seca: viento hondo, casi sin gotas
const TXT_CUEVA = {
  boca: 'Al pie de la escalinata se abre una grieta en la roca. Sale un aire frío que huele a humo viejo. No sabrías a dónde lleva.',
  entrar: 'El comerciante tenía razón: aquí empiezan los caminos. La cueva baja bajo la pirámide, a oscuras; en el suelo hay copal y cenizas de fuegos de hace mucho.',
  cascabel: 'La cascabel suelta un último cascabeleo y se deshace en humo violeta. Detrás, el túnel sigue bajando, y de lo hondo llega un brillo, como de estrellas.',
  jaguar: 'El jaguar se tiende en el suelo y la red de su piel se apaga. Ya no es más que pintura, como en los muros de la ciudad. Más abajo, el aire huele a copal recién quemado.',
  altar: ['Al fondo, la cueva se abre en cuatro cámaras, como los pétalos de una flor. En el centro hay un altar de piedra con un brasero apagado.',
    'En las paredes se ven, borrosas, cuatro figuras: un anciano con un brasero sobre la cabeza, una serpiente de plumas, un rostro con anteojeras y colmillos, y una figura con un gran tocado. Todas tienen grietas violetas.',
    'El altar está frío. Sientes que aquí despiertan memorias muy antiguas, pero no todas a la vez: cada una tiene su momento del día. Por ahora, el camino de salida está abierto.'],
};
// Desde poblarTeotihuacan (js/teotihuacan.js): la boca se examina siempre; con el camino de la cueva, se entra.
function bocaCueva(I) {
  if (bandera('teo.camino_cueva')) empezarMision('MP_TEO_03'); // también para partidas que ya lo sabían
  I.push({ ...BOCA_CUEVA.usar, r: 1.3, texto: 'Boca de la cueva', aviso: ['llegar:cueva_teo', 'vencer:cascabel_cueva', 'llegar:teo_piso2', 'vencer:jaguar_reticulado', 'llegar:teo_piso3', 'examinar:altar_dioses'], usar() {
    if (!bandera('teo.camino_cueva')) return mensaje(TXT_CUEVA.boca);
    mensaje(TXT_CUEVA.entrar, () => entrarMazmorraMaya('t1_1')); // la misma incursión nueva que la mazmorra maya (js/mazmorra_maya.js)
  } });
}

// ---------- Sub-jefe del 1-4: la cascabel de la cueva ----------
// La serpiente de la lámina de Unity (FAUNA.Serpiente: mordida en círculo y escupitajo que frena) al ×2,2, con más vida, más
// alcance y golpes más duros. Débil al Agua (la Corriente), al Viento y a la Luz.
const CASCABEL_CUEVA = { tinte: 'sepia(.8) hue-rotate(-15deg) saturate(.9) brightness(.85)', vida: 520, // parda, como la cascabel del altiplano (la de Unity es verde)
  escala: 2.2, nombre: 'Cascabel de la cueva', premio: { xp: 260, objetos: [{ id: 'semilla_preparada', n: 2 }, { id: 'jade', n: 1 }] },
  datos: { attackDamage: 16, bodyRadius: 0.6, attackRange: 1.9, attackSize: 1.4, specialRange: 6, specialRadius: 0.8, specialDamage: 10, detectionRadius: 10, loseRadius: 40, moveSpeed: 2.2, attackCooldown: 1.6 } };
function cascabelCueva(x, y) {
  const C = CASCABEL_CUEVA, e = nuevaFauna('Serpiente', x, y, false);
  e.d = { ...e.d, ...C.datos };
  Object.assign(e, { vida: C.vida, max: C.vida, r: C.datos.bodyRadius, escala: C.escala, nombre: C.nombre, jefe: true, tinte: C.tinte, ruptura: { escudo: 6, seg: 3, debil: ['Agua', 'Viento', 'Luz'], nombre: C.nombre } });
  const morir = e.alMorir;
  e.alMorir = (f) => {
    morir?.(f); poner(SUBJEFE.t1_4); juego.jefe = null;
    entregar(C.premio, 'jefe.cascabel_cueva');
    mensaje(TXT_CUEVA.cascabel, () => avisar('vencer:cascabel_cueva'));
  };
  juego.jefe = e;
  return e;
}

// Autocomprobación: la boca y la llegada desde la cueva, libres en la plaza; los niveles, generados y con su ambiente.
(() => {
  const antes = mundo; mundo = construirMundo('teotihuacan');
  console.assert(!bloqueado(BOCA_CUEVA.usar.x, BOCA_CUEVA.usar.y, 0.25) && !bloqueado(BOCA_CUEVA.llegada.x, BOCA_CUEVA.llegada.y, 0.25), 'Cueva: la boca está en la plaza');
  mundo = antes;
  console.assert(SECUENCIA_TEO.every((id) => AMBIENTES[id] && esGenerado(id) && esTeo(id) && pisoDe(id) === 20 + +id[1]) && anterior('t1_1') === 'teotihuacan' && siguiente('t1_4') === 't2_1' && siguiente('t2_4') === 't3_1' && !siguiente('t3_4') && nombreNivel('t3_4') === '3-4' && pisoDe('t3_2') === 23, 'Cueva: niveles');
})();

// ---------- Sub-jefe del 2-4: el jaguar reticulado (etapa 57) ----------
// El jaguar de la selva (js/animales.js) al ×1,8, con más vida, salto más largo y zarpazos más duros. D: los murales de
// Teotihuacan (Tetitla, Zacuala, Atetelco) pintan jaguares con una red sobre la piel. F: el jaguar vivo que sale de la pintura.
const JAGUAR_RETICULADO = { ...JAGUAR_SELVA, vida: 620, r: 0.75, carrera: 5.4, alerta: 10, distancia: 4.4, esquiva: 0.12,
  salto: { aviso: 0.7, vuelo: 0.52, alto: 1.1, radio: 1.7, dano: 22, maximo: 6.5 }, zarpazo: { dano: 14, radio: 1.3, dur: 0.34 },
  nombre: 'Jaguar reticulado', debil: ['Agua', 'Luz'], escudo: 7 };
function jaguarReticulado(x, y) {
  const e = nuevoOcelote(x, y, JAGUAR_RETICULADO), morir = e.alMorir;
  Object.assign(e, { vida: JAGUAR_RETICULADO.vida, max: JAGUAR_RETICULADO.vida, escala: 1.8, tinte: 'saturate(1.3) hue-rotate(-8deg)', jefe: true });
  e.alMorir = (f) => {
    morir(f); poner(SUBJEFE.t2_4); juego.jefe = null;
    entregar({ xp: 320, objetos: [{ id: 'semilla_preparada', n: 2 }, { id: 'jade', n: 1 }] }, 'jefe.jaguar_reticulado');
    mensaje(TXT_CUEVA.jaguar, () => avisar('vencer:jaguar_reticulado'));
  };
  juego.jefe = e;
  return e;
}

// ---------- El altar de los dioses, en el 3-4 (etapa 57; los dioses, en la etapa siguiente) ----------
// Altar de piedra con talud-tablero rojo, una flor de cuatro pétalos y un brasero apagado encima (D: braseros del dios viejo
// del fuego). Base en la fila 60 de 64.
function pintarAltarDioses() {
  const c = document.createElement('canvas'), g = c.getContext('2d'), P = PALETA[23]; c.width = 80; c.height = 64;
  px(g, P.junta, 6, 30, 68, 31); px(g, P.tezontle[0], 7, 46, 66, 14); px(g, P.estuco, 9, 31, 62, 2); px(g, P.piedra[1], 9, 33, 62, 12); px(g, P.piedra[3], 13, 35, 54, 8);
  const cx = 40, cy = 39; for (const [u, v] of [[0, -3], [5, 0], [0, 3], [-5, 0]]) bola(g, P.flor, cx + u, cy + v, 2, 2); bola(g, P.verde, cx, cy, 1, 1);
  px(g, P.junta, 27, 12, 26, 19); px(g, '#7a6a58', 28, 14, 24, 16); px(g, '#5a4c3e', 26, 12, 28, 3); px(g, '#2a2420', 30, 9, 20, 4); // el brasero
  registrarLienzo('Altar_Dioses', c, 4 / 64);
}
pintarAltarDioses();
OBSTACULOS.push(['Altar_Dioses', 1.4, 0.6]);
// El altar lo pone generarNivel (js/niveles.js) en el centro de la cámara; desde poblarNivel, su uso: al examinarlo se cierra MP_TEO_03 y se abre la salida.
function altarDioses(p, I) {
  I.push({ x: p.x, y: p.y - 0.4, r: 1.5, texto: 'Examinar el altar', aviso: 'examinar:altar_dioses', usar: () => hablar('', TXT_CUEVA.altar, () => {
    poner(SUBJEFE.t3_4); avisar('examinar:altar_dioses');
  }) });
}
