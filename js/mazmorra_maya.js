'use strict';
// La mazmorra maya, «el camino del agua» (etapas 48-50, solo HTML; ver PORTAR_A_UNITY.md §35-37). Se entra por la boca del
// acueducto, en la plaza del templo de Palenque, cuando el escriba recuerda el camino (may.camino_agua). Tres pisos de cuatro
// niveles generados (js/niveles.js, m1_1…): piso 1, los canales del Otolum, con el cocodrilo de pantano en el 1-4; piso 2 (etapa
// 49), las cámaras de estuco, con el murciélago de la muerte en el 2-4; piso 3 (etapa 50), el observatorio, con el Guardián de
// los Ciclos en el 3-4.
// Fidelidad: D, Palenque canalizó el Otolum bajo la ciudad con un acueducto de bóveda en saledizo; el cocodrilo de pantano
// (Crocodylus moreletii) vive en los ríos y pantanos de Chiapas, Tabasco y la península. F: que bajo el palacio haya
// cámaras viejas donde se esconde la Sombra, y el cocodrilo gigante que las guarda.
// Piso 2. D: el murciélago (sotz') es un «way» (compañero del alma) pintado en vasijas del Clásico, y un glifo emblema (Copán);
// en el Popol Vuh, la Casa de los Murciélagos del Xibalbá, donde Camazotz le corta la cabeza a Hunahpú. I: llamarlo «murciélago
// de la muerte» y ponerlo en Palenque. F: el murciélago gigante y que viva en las cámaras.
// Piso 3. D: la torre del palacio de Palenque y sus ventanas en T (ik', viento); Chaak, el dios maya de la lluvia, con su hacha
// de relámpago; la cuenta de los días (260) y la cuenta larga. I: que la torre fuera un observatorio. F: el Guardián de los
// Ciclos, Chaak de piedra que guarda la cuenta del agua (la figura del «Señor de la Lluvia» de Unity).

// ---------- La boca del acueducto (en Palenque) ----------
const BOCA = { sprite: { x: 7, y: 6.9 }, usar: { x: 7, y: 5.6 }, llegada: { x: 7, y: 4.6 } };
function pintarBoca() {
  const c = document.createElement('canvas'), g = c.getContext('2d'), P = PALETA[11], rnd = azar(480); c.width = 96; c.height = 96;
  px(g, P.junta, 3, 19, 90, 74);
  for (let y = 82, fila = 0; y >= 20; y -= 10, fila++) for (let x = 4 - (fila % 2 ? 8 : 0); x < 92; x += 16) {
    const a = Math.max(x, 4), b = Math.min(x + 15, 92); px(g, elige(rnd, PALETA[4].piedra), a, y + 1, b - a, 9); px(g, PALETA[4].claro, a, y + 1, b - a, 1);
  }
  for (let k = 0; k < 6; k++) { const w = Math.max(8, 38 - k * 6); px(g, P.boveda, 48 - w / 2, 92 - (k + 1) * 9, w, 9); } // vano en saledizo
  px(g, P.agua, 30, 86, 36, 6); for (let x = 32; x < 64; x += 6) px(g, P.brillo, x, 87, 3, 1); // el agua que sale
  for (let i = 0; i < 20; i++) px(g, elige(rnd, P.musgo), 4 + Math.floor(rnd() * 88), 20 + Math.floor(rnd() * 8), 2, 2);
  registrarLienzo('Boca_Acueducto', c, 4 / 96);
}
pintarBoca();
REGIONES.palenque.objetos.push({ sprite: 'Boca_Acueducto', ...BOCA.sprite, z: 0 });
Object.assign(REGIONES.palenque.puntos, { desde_mazmorra: BOCA.llegada });

// ---------- Misión ----------
// shortcut: como las otras misiones mayas, aquí y no en datos/ (pasar a QuestData al portar).
MISIONES.MP_MAY_03 = { titulo: 'El camino del agua', banderas: [], pasos: [
  { aviso: 'llegar:mazmorra_maya', veces: 1, texto: 'Entra por la boca del acueducto, en la plaza del templo' },
  { aviso: 'vencer:cocodrilo_pantano', veces: 1, texto: 'Baja por los canales y vence a lo que vigila el agua' },
  { aviso: 'llegar:camaras_estuco', veces: 1, texto: 'Sigue bajando hacia las cámaras de estuco' },
  { aviso: 'vencer:murcielago_estuco', veces: 1, texto: 'Cruza las cámaras y vence a lo que vive en la oscuridad' },
  { aviso: 'llegar:observatorio', veces: 1, texto: 'Sube hacia el observatorio, en lo alto de la torre' },
  { aviso: 'vencer:guardian_ciclos', veces: 1, texto: 'Vence al Guardián de los Ciclos' },
] };
const ramaHojas = DIALOGOS.escriba.find((r) => r.requiere.includes('may.hojas_completas'));
ramaHojas.mision = 'MP_MAY_03'; // al devolverle las hojas, el escriba te manda al camino del agua
LLEGAR.m1_1 = 'llegar:mazmorra_maya'; LLEGAR.m2_1 = 'llegar:camaras_estuco'; LLEGAR.m3_1 = 'llegar:observatorio';
for (const id of SECUENCIA_MAYA) AMBIENTES[id] = { f: 240, vol: 0.32, dron: 46, gotas: 0.45 }; // agua que gotea bajo tierra
const TXT_MAZMORRA_MAYA = {
  boca: 'Un canal de piedra se mete bajo la plaza: por él baja el río, a oscuras. No sabrías por dónde seguir.',
  entrar: 'El escriba tenía razón: el agua corre por canales de piedra bajo el palacio. Hace frío, y el eco de tus pasos tarda en volver.',
  cocodrilo: 'El cocodrilo se hunde en el agua negra y no vuelve a salir. Más abajo, la corriente suena más fuerte: baja hacia unas cámaras de estuco rojo.',
  murcielago: 'El murciélago se estrella contra un tablero de glifos y se deshace en polvo. Detrás, una escalera sube: por ella entra el viento.',
  guardian: 'El Guardián de los Ciclos se arrodilla y baja el hacha. La lluvia que traía se calma. En su pecho, los glifos de la cuenta larga siguen girando, más despacio: la Sombra ya no los empuja. Una escalera baja de la torre, hacia la plaza de Palenque.',
};
// Desde poblarPalenque (js/palenque.js): la boca se examina siempre; con el camino del agua, se entra.
function bocaAcueducto(I) {
  if (bandera('may.camino_agua')) empezarMision('MP_MAY_03'); // también para partidas que ya lo sabían
  I.push({ ...BOCA.usar, r: 1.3, texto: 'Boca del acueducto', aviso: ['llegar:mazmorra_maya', 'vencer:cocodrilo_pantano', 'llegar:camaras_estuco', 'vencer:murcielago_estuco', 'llegar:observatorio', 'vencer:guardian_ciclos'], usar() {
    if (!bandera('may.camino_agua')) return mensaje(TXT_MAZMORRA_MAYA.boca);
    mensaje(TXT_MAZMORRA_MAYA.entrar, entrarMazmorraMaya);
  } });
}
// Empieza una incursión (como IncursionReset al pasar por la selva olmeca): sala nueva, sin armas de la anterior, con la del
// tallador de pedernal (o la lanza que presta).
function entrarMazmorraMaya() {
  for (const k of Object.keys(juego.flags)) if (k.startsWith('incursion.')) delete juego.flags[k];
  const id = ARMAS[juego.flags['armero_maya.eleccion']] ? juego.flags['armero_maya.eleccion'] : 'lanza_maya';
  juego.flags['incursion.ranuras'] = [nuevaRanura(id, 1)]; juego.flags['incursion.mano'] = 0;
  cargarRegion('m1_1', 'llegada_arriba', juego.jugador.vida);
}

// ---------- Sub-jefe del 1-4: el cocodrilo de pantano ----------
// El cocodrilo de la lámina de Unity (FAUNA.Cocodrilo: embestida en franja y coletazo en círculo) al ×1,9, con más vida, más
// alcance y golpes más duros. Débil a la Tierra.
const COCODRILO_PANTANO = { vida: 480, escala: 1.9, nombre: 'Cocodrilo de pantano', premio: { xp: 220, objetos: [{ id: 'semilla_preparada', n: 2 }, { id: 'jade', n: 1 }] },
  datos: { attackDamage: 18, bodyRadius: 0.75, attackRange: 3.6, attackReach: 3.2, attackSize: 1.5, specialRange: 2.4, specialRadius: 2.8, specialDamage: 14, detectionRadius: 10, loseRadius: 40, moveSpeed: 1.9, attackCooldown: 1.8 } };
function cocodriloPantano(x, y) {
  const C = COCODRILO_PANTANO, e = nuevaFauna('Cocodrilo', x, y, false);
  e.d = { ...e.d, ...C.datos };
  Object.assign(e, { vida: C.vida, max: C.vida, r: C.datos.bodyRadius, escala: C.escala, nombre: C.nombre, jefe: true, ruptura: { escudo: 6, seg: 3, debil: ['Tierra'], nombre: C.nombre } });
  const morir = e.alMorir;
  e.alMorir = (f) => {
    morir(f); poner(SUBJEFE.m1_4); juego.jefe = null;
    entregar(C.premio, 'jefe.cocodrilo_pantano');
    mensaje(TXT_MAZMORRA_MAYA.cocodrilo, () => avisar('vencer:cocodrilo_pantano'));
  };
  juego.jefe = e;
  return e;
}

// ---------- Sub-jefe del 2-4: el murciélago de la muerte ----------
// El murciélago vampiro de Unity al ×2,8: vuela alto y errático, chupa vida al morder (attackDrains) y chilla (su especial,
// que frena). Débil a la Luz y al Viento.
const MURCIELAGO_ESTUCO = { vida: 520, escala: 2.8, nombre: 'Murciélago de la muerte', premio: { xp: 280, objetos: [{ id: 'semilla_preparada', n: 2 }, { id: 'jade', n: 1 }] },
  datos: { attackDamage: 14, bodyRadius: 0.6, hoverHeight: 1.5, attackRange: 1.8, attackSize: 1.3, specialRange: 3, specialRadius: 3.2, specialDamage: 6, specialCooldown: 5, detectionRadius: 10, loseRadius: 40, moveSpeed: 3, attackCooldown: 1.3 } };
function murcielagoEstuco(x, y) {
  const C = MURCIELAGO_ESTUCO, e = nuevaFauna('Murcielago', x, y, false);
  e.d = { ...e.d, ...C.datos };
  Object.assign(e, { vida: C.vida, max: C.vida, r: C.datos.bodyRadius, alto: C.datos.hoverHeight, escala: C.escala, nombre: C.nombre, jefe: true, ruptura: { escudo: 6, seg: 3, debil: ['Luz', 'Viento'], nombre: C.nombre } });
  const morir = e.alMorir;
  e.alMorir = (f) => {
    morir(f); poner(SUBJEFE.m2_4); juego.jefe = null;
    entregar(C.premio, 'jefe.murcielago_estuco');
    mensaje(TXT_MAZMORRA_MAYA.murcielago, () => avisar('vencer:murcielago_estuco'));
  };
  juego.jefe = e;
  return e;
}

// Fondo del piso 3 (ESTILO[13]): el cielo de noche (384 px, más que el mosaico de 192, así js/niveles.js lo recorta tal cual).
(() => {
  const c = document.createElement('canvas'), g = c.getContext('2d'), P = PALETA[13], rnd = azar(1313); c.width = c.height = 384;
  px(g, P.cielo, 0, 0, 384, 384);
  for (let i = 0; i < 160; i++) { const v = rnd(); px(g, v < 0.7 ? '#5a6390' : v < 0.93 ? '#a9b0d0' : P.estrella, Math.floor(rnd() * 384), Math.floor(rnd() * 384), v > 0.97 ? 2 : 1, v > 0.97 ? 2 : 1); }
  registrarLienzo('Cielo_Noche', c, 0.5);
})();

// ---------- Jefe del 3-4: el Guardián de los Ciclos ----------
// El Guardián de la Piedra Viva (js/guardian.js: sus tres fases, ataques y, en la fase 2, el agua que sube) con la figura del
// Señor de la Lluvia de Unity y más vida: se llega con armas ★★★ y más nivel. Vencido, se queda arrodillado (como el olmeco).
const GUARDIAN_CICLOS = { vida: 1500, figura: 'SenorLluvia', nombre: 'Guardián de los Ciclos', premio: { xp: 500, objetos: [{ id: 'semilla_preparada', n: 3 }, { id: 'jade', n: 2 }] } };
function guardianCiclos(x, y) {
  const C = GUARDIAN_CICLOS, g = nuevoGuardian(x, y, (g) => {
    poner(SUBJEFE.m3_4); juego.jefe = null; juego.inundado = false;
    juego.marcas = juego.marcas.filter((m) => m.dueno !== g); juego.disparos = [];
    Object.assign(g, { vida: 1, muriendo: 0, estado: 'liberado', golpeable: false, embiste: 0, z: 0 });
    entregar(C.premio, 'jefe.guardian_ciclos');
    mensaje(TXT_MAZMORRA_MAYA.guardian, () => avisar('vencer:guardian_ciclos'));
  });
  Object.assign(g, { vida: C.vida, max: C.vida, nombre: C.nombre, figura: C.figura, ruptura: { escudo: 6, seg: 3, debil: ['Viento', 'Tierra'], nombre: C.nombre } }); // el viento aparta las nubes de Chaak
  if (bandera(SUBJEFE.m3_4)) Object.assign(g, { estado: 'liberado', golpeable: false, vida: 1 });
  return g;
}

// Autocomprobación: la boca y la llegada desde la mazmorra están en la plaza; los niveles mayas tienen su ambiente.
(() => {
  const antes = mundo; mundo = construirMundo('palenque');
  console.assert(!bloqueado(BOCA.usar.x, BOCA.usar.y, 0.25) && !bloqueado(BOCA.llegada.x, BOCA.llegada.y, 0.25), 'Mazmorra maya: la boca del acueducto en un sitio libre');
  mundo = antes;
  console.assert(SECUENCIA_MAYA.every((id) => AMBIENTES[id] && esGenerado(id) && esMaya(id)), 'Mazmorra maya: niveles');
})();
