'use strict';
// Etapa 51 (solo HTML; ver PORTAR_A_UNITY.md §38): la habilidad de agua y el cierre del capítulo II.
// Al vencer al Guardián de los Ciclos (js/mazmorra_maya.js), te concede la Corriente (tecla V o botón Agua): un chorro que hiere
// y empuja a lo que tienes delante, te cura un poco y ablanda el lodo seco que tapa pasos y ofrendas (la Tierra no lo rompe).
// Luego la misión MP_MAY_04: contárselo al escriba y poner el Fragmento de la Segunda Memoria en el tablero de la plaza.
// Fidelidad (Historia_Mundo, cap. II): D, el tablero de glifos y los escribas de Palenque; F, la habilidad, el fragmento y el
// lodo que tapa la ofrenda. Las habilidades de agua posibles (§5.1): corriente que desplaza enemigos y recuperación limitada.

const CORRIENTE = { coste: 30, espera: 5, largo: 5, ancho: 1.2, multiplicador: 1.5, empuje: 9, cura: 6 };
const tieneAgua = () => bandera('may.bendicion_agua');
// shortcut: la Bendición del Agua vive aquí y no en datos/ (pasarla a BlessingData al portar); no ocupa ranura.
BENDICIONES.agua = { nombre: 'Bendición del Agua', desc: 'El Guardián de los Ciclos te presta la corriente del Otolum.', ranura: 2, bono: { maxHealth: 0, attack: 0, defense: 0, maxEnergy: 0 },
  coste: CORRIENTE.coste, espera: CORRIENTE.espera, combate: `Corriente (tecla V o botón Agua): chorro de ${CORRIENTE.largo} m que hiere (1,5 × ataque), empuja y te cura ${CORRIENTE.cura}.`,
  exploracion: 'Ablanda el lodo seco: abre pasos y ofrendas tapadas.', cultura: 'maya' };

function corrienteDeAgua() {
  const j = juego.jugador, p = prog(), C = CORRIENTE;
  if (!tieneAgua() || j.vida <= 0 || juego.dialogo) return;
  if ((juego.esperaAgua || 0) > 0) { sonar('no'); return avisoRecompensa(`Agua: espera ${juego.esperaAgua.toFixed(1)} s`); }
  if (p.energia < C.coste) { sonar('no'); return avisoRecompensa('Sin energía'); }
  p.energia -= C.coste; juego.esperaAgua = C.espera;
  const l = Math.hypot(j.fx, j.fy) || 1, dx = j.fx / l, dy = j.fy / l;
  // ¿Está en el chorro? Delante del jugador, a lo largo de la franja y a menos de medio ancho de su eje.
  const enChorro = (a, r = 0) => { const u = (a.x - j.x) * dx + (a.y - j.y) * dy, v = Math.abs((a.y - j.y) * dx - (a.x - j.x) * dy); return u > -0.3 && u < C.largo + r && v < C.ancho / 2 + r; };
  juego.efectos.push({ tipo: 'agua', x: j.x, y: j.y, dx, dy, t: 0.45 });
  vista.temblor = 0.1; sonar('especial');
  for (const e of juego.enemigos) if (e.vida > 0 && e.golpeable !== false && enChorro(e, e.r)) {
    herirEnemigo(e, Math.round(estadisticas().ataque * C.multiplicador), j, 'Agua');
    if (!e.jefe && !e.pesado) { e.kx = dx * C.empuje; e.ky = dy * C.empuje; } // la corriente se los lleva
  }
  j.vida = Math.min(j.max, j.vida + C.cura); numero(j.x, j.y, `+${C.cura}`, '#9fd4ff');
  for (const r of juego.rompibles) if (r.agua && !bandera(r.bandera) && enChorro(r, 1)) r.romper();
}
function dibujarCorriente(f) {
  const k = 1 - f.t / 0.45; // de 0 a 1: el chorro avanza y se deshace
  for (let s = 0.6; s <= CORRIENTE.largo * Math.min(1, k * 1.6); s += 0.45)
    elipse(f.x + f.dx * s, f.y + f.dy * s, 0.28 + 0.1 * Math.sin(s * 3 + k * 9), `rgba(110,180,235,${0.55 * (1 - k) + 0.15})`, '#cfeaff', 0.25);
}

// ---------- Lodo seco (como el basalto agrietado, js/recompensas.js) ----------
function pintarLodo() {
  const c = document.createElement('canvas'), g = c.getContext('2d'), rnd = azar(5151); c.width = 72; c.height = 56;
  bola(g, '#3e2c1c', 36, 38, 33, 16); bola(g, '#6b5034', 36, 34, 30, 14); bola(g, '#7d6040', 32, 30, 20, 9);
  for (let i = 0; i < 9; i++) { let x = 10 + Math.floor(rnd() * 52), y = 26 + Math.floor(rnd() * 12); for (let k = 0; k < 7; k++) { px(g, '#3a2818', x, y); x += Math.floor(rnd() * 3) - 1; y += rnd() < 0.5 ? 1 : 0; } } // grietas de lo seco
  for (let i = 0; i < 6; i++) px(g, '#4f6b30', 8 + Math.floor(rnd() * 56), 22 + Math.floor(rnd() * 6), 1, 3 + Math.floor(rnd() * 3)); // hierbas
  registrarLienzo('Lodo_Seco', c, 12 / 56);
}
pintarLodo();
const TXT_LODO = 'Lodo seco, duro como la piedra, tapa un nicho al pie del muro. Asoma el borde de una vasija. Haría falta agua que lo ablandara.';
function lodoSeco(id, punto) {
  const bandera_ = `roto.${id}`;
  if (bandera(bandera_)) return;
  const obj = { x: punto.x, y: punto.y, z: 0, orden: profundidad(punto.y, 0), dibujar() { dibujar('Lodo_Seco', punto.x, punto.y); } };
  const bloqueo = caja(punto.x, punto.y, 0.7, 0.6);
  mundo.objetos.push(obj); mundo.cajas.push(bloqueo);
  const it = { x: punto.x, y: punto.y, r: 1.6, texto: 'Examinar', usar: () => mensaje(tieneAgua() ? TXT_LODO + '\n\n(Usa la corriente: tecla V o botón Agua.)' : TXT_LODO) };
  juego.interactuables.push(it);
  juego.rompibles.push({ x: punto.x, y: punto.y, bandera: bandera_, agua: true, romper() {
    poner(bandera_); mundo.objetos.splice(mundo.objetos.indexOf(obj), 1); mundo.cajas = mundo.cajas.filter((c) => c !== bloqueo);
    juego.interactuables.splice(juego.interactuables.indexOf(it), 1);
    juego.efectos.push({ tipo: 'destello', x: punto.x, y: punto.y, t: 0.3 }); sonar('rompe');
    avisoRecompensa('El agua deshace el lodo');
  } });
}
// La ofrenda tapada de la plaza de Palenque (esquina sureste): aparece al deshacer el lodo.
const LODO_PALENQUE = { x: 18, y: -5 };
PAQUETES.REC_ofrenda_may_lodo = { xp: 60, objetos: [{ id: 'jade', n: 2 }, { id: 'cacao', n: 2 }], banderas: [], bendicion: null, extra: null };
function lodoPalenque() { // desde poblarPalenque (js/palenque.js)
  lodoSeco('may_lodo', LODO_PALENQUE);
  ofrenda('may_lodo', LODO_PALENQUE, true, 'roto.may_lodo');
}

// ---------- Cierre del capítulo II ----------
OBJETOS.fragmento_segunda_memoria = { ...OBJETOS.fragmento_primera_memoria, nombre: 'Fragmento de la Segunda Memoria',
  desc: 'Lo que el Guardián de los Ciclos guardaba: la cuenta de los días de Lakamha\', que la Sombra quería borrar.', uso: 'Llévalo al tablero de la plaza (MP_MAY_04).' };
MISIONES.MP_MAY_04 = { titulo: 'Lo que guardaba el agua', banderas: [], pasos: [
  { aviso: 'hablar:escriba', veces: 1, texto: 'Vuelve a la aldea y cuéntaselo al escriba' },
  { aviso: 'examinar:tablero_palenque', veces: 1, texto: 'Pon el fragmento en el tablero de la plaza' },
] };
MUSEO.push({ titulo: 'La memoria maya', bandera: 'registro.cultura.maya', resumen: "D: Lakamha' (Palenque, Chiapas) fue una ciudad maya del Clásico, con su palacio y su torre, el acueducto del Otolum y tableros de glifos que cuentan fechas y linajes. Los pueblos mayas siguen vivos hoy, con sus lenguas.",
  guardianes: [{ nombre: 'Guardián de los Ciclos', bandera: 'may.guardian_ciclos_vencido', recuerdo: 'F: guardaba la cuenta de los días en lo alto de la torre. La Sombra lo usó para detener los ciclos; liberado, te dio la corriente del agua.' }] });
DIALOGOS.escriba.unshift(
  rama(['may.registros_recuperados'], ['El tablero vuelve a hablar, y mi libro ya no se borra. Pero el fragmento mostró otras tierras, muy lejos, y también allí se apagan los nombres.']),
  rama(['mision.MP_MAY_04.activa'], ['¡Volviste de lo hondo! Tienes los ojos de quien ha visto el cielo desde la torre.',
    'Ese fragmento… en él giran los días, como en nuestros tableros. Llévalo a la plaza y ponlo en el tablero: quizá recuerde lo que la Sombra le borró.']),
);
const TXT_CIERRE_II = [
  'Pones el fragmento en el tablero. Los glifos de la columna lisa vuelven, uno a uno: fechas en barras y puntos, nombres de señores, el día en que se dedicó el templo.',
  'En la luz del fragmento ves otras ciudades, muy lejos de aquí: en el altiplano, entre montañas, sus piedras también se están quedando lisas.',
  'La Sombra no ataca un solo lugar. Está borrando la memoria de todos los pueblos a la vez.',
];
const FIN_CAPITULO_II = '<h1>Fin del capítulo II</h1><p class="nota">Las ciudades de piedra y agua</p><p>Lakamha\' recuerda sus nombres. Llevas contigo la corriente del agua y el Fragmento de la Segunda Memoria.</p><p>En la plaza se abrió un nuevo portal: la memoria del altiplano te llama.</p><div class="botones"><button data-cerrar>Continuar</button></div>';
// Desde el tablero de la plaza (js/palenque.js): si toca, cierra el capítulo y devuelve true.
function cierreCapituloII() {
  if (juego.misiones.MP_MAY_04?.paso !== 1 || juego.misiones.MP_MAY_04.hecha) return false;
  hablar('', TXT_CIERRE_II, () => {
    poner('may.registros_recuperados'); poner('registro.cultura.maya'); vista.temblor = 0.3; sonar('portal');
    portalPalenque(juego.otros, juego.interactuables); // etapa 53: a Teotihuacan (js/teotihuacan.js)
    avisar('examinar:tablero_palenque');
    abrirCapa('capitulo', FIN_CAPITULO_II);
  });
  return true;
}
// Lo que da el Guardián al liberarse (js/mazmorra_maya.js, guardianCiclos).
function premioGuardianCiclos() {
  poner('may.bendicion_agua');
  entregar({ objetos: [{ id: 'fragmento_segunda_memoria', n: 1 }] }, 'fragmento.segunda_memoria');
  empezarMision('MP_MAY_04');
  toast('Bendición del Agua: Corriente (tecla V o botón Agua)', 5);
}

// Autocomprobación: el lodo de Palenque, en un sitio libre de la plaza y con sitio delante para lanzarle la corriente.
(() => {
  const antes = mundo; mundo = construirMundo('palenque');
  console.assert(!bloqueado(LODO_PALENQUE.x, LODO_PALENQUE.y, 0.3) && !bloqueado(LODO_PALENQUE.x - 1.5, LODO_PALENQUE.y, 0.3), 'Agua: el lodo de Palenque en la plaza');
  mundo = antes;
})();
