'use strict';
// El ciclo de día y noche y los dioses del altar de la cueva (etapa 58, solo HTML; ver PORTAR_A_UNITY.md §45 y
// PROPUESTA_DIOSES.md). Un día de juego dura 24 minutos de juego (6 por momento: amanecer, día, atardecer y noche); la hora
// se guarda con la partida (bandera ciclo.t, en segundos). Fuera, la luz cambia con el momento; el HUD lo muestra siempre.
// En el altar del 3-4 de la cueva despierta el dios del momento: la memoria del dios corrompida por la Sombra, que al
// vencerla se libera. Sus habilidades (fuego, luz y viento) llegan en la etapa siguiente.
// Fidelidad (D documentado, I interpretación, F ficción):
//   D: en Teotihuacan están el dios viejo del fuego (Huehueteotl, anciano con un brasero sobre la cabeza), el dios de la
//      tormenta (anteojeras y colmillos, con el rayo; «Tláloc» es su nombre náhuatl, posterior) y la serpiente emplumada
//      (su templo, con cabezas esculpidas).
//   I: el momento del día de cada dios; el fuego de noche (el fuego del hogar), la tormenta de día, la serpiente al amanecer
//      (su relación con el viento es mexica, posterior); las figuras de Unity que les sirven de cuerpo.
//   F: que despierten en un altar de la cueva, que la Sombra los haya confundido y la pelea.
// La Gran Diosa (atardecer, propuesta) no tiene figura adecuada en Unity: al atardecer el altar duerme.

// ---------- El ciclo ----------
const CICLO = { dia: 24 * 60, inicio: 6 * 60, momentos: [['amanecer', 'Amanecer', '☀'], ['dia', 'Día', '☀'], ['atardecer', 'Atardecer', '☀'], ['noche', 'Noche', '☾']],
  // Velo de luz sobre el mundo, fuera (las regiones de superficie): rgba por momento.
  velo: { amanecer: 'rgba(255,170,110,.12)', dia: null, atardecer: 'rgba(255,110,50,.18)', noche: 'rgba(16,24,70,.42)' },
  fuera: ['ciudad', 'selva', 'palenque', 'aldea_maya', 'teotihuacan', 'barrio_teo'] };
const horaCiclo = () => juego.flags['ciclo.t'] ?? CICLO.inicio;
const momentoActual = () => CICLO.momentos[Math.floor(horaCiclo() / (CICLO.dia / 4)) % 4][0];
// Desde actualizar (js/juego.js): avanza la hora (sin contar diálogos) y avisa al cambiar de momento.
function avanzarCiclo(dt) {
  const antes = momentoActual();
  if (!juego.dialogo && !juego.prueba) juego.flags['ciclo.t'] = (horaCiclo() + dt) % CICLO.dia;
  const m = momentoActual();
  if (m !== antes) toast(`${CICLO.momentos.find((k) => k[0] === m)[1]}: cambia la luz`, 3);
  const [, nombre, signo] = CICLO.momentos.find((k) => k[0] === m), el = $('hora');
  if (el && el.dataset.m !== m) { el.dataset.m = m; el.textContent = `${signo} ${nombre}`; }
}
// Desde dibujarTodo (js/juego.js), al final: el velo del momento, solo fuera.
function dibujarCiclo() {
  const v = CICLO.velo[momentoActual()];
  if (!v || !CICLO.fuera.includes(juego.region)) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = v; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore();
}

// ---------- Los dioses del altar ----------
// Cada uno usa el jefe guardián (js/guardian.js) con una figura de Unity; vida algo mayor que el Guardián de los Ciclos.
const DIOSES = {
  noche: { id: 'fuego', nombre: 'Dios Viejo del Fuego', figura: 'GuardianOfrenda', tinte: 'sepia(1) saturate(3.5) hue-rotate(-35deg) brightness(.9)', elemento: 'Fuego', debil: ['Agua', 'Viento'],
    despierta: ['Allá arriba es de noche. El brasero del altar se enciende solo, con un fuego violeta.',
      'De las brasas se levanta un anciano de piedra, encorvado, con el brasero sobre la cabeza. No te mira a ti: mira la Sombra que le arde dentro.'],
    libre: ['El fuego del brasero vuelve a ser naranja. El anciano se sienta despacio, como quien vuelve a casa.',
      '«Soy el fuego del centro de la casa, el que nunca se apaga. La Sombra me hizo arder contra los míos. Llévate un poco de mí.»'] },
  dia: { id: 'tormenta', nombre: 'Dios de la Tormenta', figura: 'SenorLluvia', tinte: 'grayscale(.6) brightness(1.1) sepia(.2) hue-rotate(170deg)', elemento: 'Luz', debil: ['Tierra', 'Agua'],
    despierta: ['Allá arriba es de día. El altar retumba y la cámara se llena de nubes violetas.',
      'Entre ellas aparece una figura con anteojeras y colmillos, con un rayo en la mano. Truena, y no es lluvia lo que cae: es olvido.'],
    libre: ['Las nubes se aclaran y el trueno se aleja. La figura baja el rayo.',
      '«Soy la lluvia que hace crecer el maíz y el rayo que parte la noche. Que mi luz te enseñe lo que la Sombra esconde.»'] },
  amanecer: { id: 'serpiente', nombre: 'Serpiente Emplumada', figura: 'SerpienteEmplumada', tinte: null, elemento: 'Viento', debil: ['Tierra', 'Luz'],
    despierta: ['Allá arriba amanece. Un viento frío recorre las cuatro cámaras y apaga el copal.',
      'Del altar sale una serpiente cubierta de plumas verdes, con la cabeza erizada como las del templo. Sus plumas tienen grietas violetas.'],
    libre: ['El viento se calma. La serpiente se enrosca alrededor del altar y sus plumas vuelven a ser verdes.',
      '«Soy el soplo que barre el camino antes de la lluvia. La Sombra me hizo cerrar los caminos. Ábrelos tú.»'] },
};
const TXT_ALTAR = {
  atardecer: ['Allá arriba atardece. El altar está tibio y, en el muro, la figura del gran tocado parece mirarte, pero no despierta.',
    'Las otras figuras duermen. Quizá a otra hora del día respondan.'],
  paz: (d) => [`${d.nombre} descansa junto al altar, en paz. Te reconoce y te deja pasar.`],
};
// El altar (desde poblarNivel del 3-4, js/niveles.js): despierta el dios del momento; liberado, se queda en paz.
function altarDioses(p, I) {
  I.push({ x: p.x, y: p.y - 0.4, r: 1.5, texto: 'Examinar el altar', aviso: ['examinar:altar_dioses', 'vencer:dios_teo'], usar() {
    if (juego.jefe?.vida > 0) return;
    const d = DIOSES[momentoActual()];
    if (!d) return hablar('', [...TXT_CUEVA.altar, ...TXT_ALTAR.atardecer], () => { poner(SUBJEFE.t3_4); avisar('examinar:altar_dioses'); });
    if (bandera(`teo.dios_${d.id}`)) return mensaje(TXT_ALTAR.paz(d)[0], () => poner(SUBJEFE.t3_4));
    hablar('', bandera('teo.altar_visto') ? d.despierta : [...TXT_CUEVA.altar, ...d.despierta], () => { avisar('examinar:altar_dioses'); juego.enemigos.push(nuevoDios(d, p)); });
  } });
}
function nuevoDios(d, p) {
  const sitio = [[3.5, 0], [-3.5, 0], [0, -3], [0, 3]].map(([u, v]) => ({ x: p.x + u, y: p.y + v })).find((q) => !bloqueado(q.x, q.y, 0.9)) || { x: p.x + 3.5, y: p.y };
  const g = nuevoGuardian(sitio.x, sitio.y, (g) => {
    poner(`teo.dios_${d.id}`); poner(`teo.bendicion_${d.elemento.toLowerCase()}`); poner(SUBJEFE.t3_4);
    juego.jefe = null; juego.inundado = false; juego.marcas = juego.marcas.filter((m) => m.dueno !== g); juego.disparos = [];
    Object.assign(g, { vida: 1, muriendo: 0, estado: 'liberado', golpeable: false, embiste: 0, z: 0 });
    entregar({ xp: 600, objetos: [{ id: 'semilla_preparada', n: 3 }, { id: 'jade', n: 2 }] }, `jefe.dios_${d.id}`);
    hablar('', d.libre, () => { avisar('vencer:dios_teo'); toast(`${d.nombre} te ofrece su ${d.elemento.toLowerCase()} (la habilidad, en la próxima etapa)`, 5); });
  });
  Object.assign(g, { vida: 1700, max: 1700, nombre: d.nombre, figura: d.figura, tinte: d.tinte, ruptura: { escudo: 7, seg: 3, debil: d.debil, nombre: d.nombre } });
  return g;
}
// El último paso de MP_TEO_03: liberar al dios (antes era solo examinar el altar).
MISIONES.MP_TEO_03.pasos[5] = { aviso: 'vencer:dios_teo', veces: 1, texto: 'Despierta al dios del altar y libéralo (cada uno responde a su hora)' };

// Autocomprobación: el día se reparte en cuatro momentos; cada dios tiene figura de Unity y textos.
(() => {
  const antes = juego.flags; juego.flags = {};
  const vistos = [0, 400, 760, 1100, 1439].map((t) => { juego.flags['ciclo.t'] = t; return momentoActual(); });
  console.assert(vistos.join() === 'amanecer,dia,atardecer,noche,noche' && (delete juego.flags['ciclo.t'], momentoActual() === 'dia'), 'Ciclo: momentos del día');
  juego.flags = antes;
  console.assert(Object.values(DIOSES).every((d) => SPRITES[`Jefe_${d.figura}_Reposo1_03`] && d.despierta.length && d.libre.length), 'Ciclo: los dioses tienen figura y textos');
})();
