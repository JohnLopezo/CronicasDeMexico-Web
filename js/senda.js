'use strict';
// Acciones de senda (Docs/Sistemas/Acciones_Senda.md): junto a un habitante con algo para tu Guardián, mantener Usar
// 0,5 s lanza su verbo (Indagar, Persuadir o Escuchar); tocar habla como siempre (PlayerInteractor, DialogueInteractable).

const SENDA_SEG = 0.5, SENDA_ANILLO = 0.1; // HoldSeconds y HoldRingDelay
const claveSenda = (r) => `senda.${r.npc}.${r.verbo.toLowerCase()}`;
// La respuesta del habitante al verbo del Guardián en juego, si existe y aún no se hizo (una vez por partida).
function sendaDe(n) {
  const verbo = guardianActual().senda, r = SENDA.find((s) => s.npc === n.id && s.verbo === verbo && s.lineas.length);
  return r && !bandera(claveSenda(r)) ? r : null;
}
const usarPulsado = () => entrada.teclas.has('e') || entrada.teclas.has('enter') || entrada.usarTactil;
let sostener = null; // { it, t }: Usar pulsado junto a un habitante con acción de senda

// Solo se espera a soltar si el habitante tiene una acción disponible; con lo demás, Usar responde al pulsar.
function pulsarUsar(it) {
  if (it?.habitante && sendaDe(it.habitante)) { sostener = { it, t: 0 }; return; }
  it?.usar();
}
// Con tiempo real (unscaledTime): la cámara lenta no alarga la pulsación.
function actualizarSenda(dtReal) {
  if (!sostener) return;
  if (juego.dialogo || cercano() !== sostener.it) { sostener = null; return; }
  sostener.t += dtReal;
  if (sostener.t >= SENDA_SEG) { const n = sostener.it.habitante; sostener = null; accionSenda(n); }
  else if (!usarPulsado()) { const it = sostener.it; sostener = null; it.usar(); }
}
// Sus líneas y, al terminarlas, la recompensa. Alejarse a medias no cuenta.
function accionSenda(n) {
  const r = sendaDe(n);
  if (!r) return;
  n.hablando = true;
  hablar(n.quien, r.lineas, () => {
    n.hablando = false;
    poner(claveSenda(r));
    entregar({ xp: r.xp, objetos: r.objetos, banderas: r.banderas }, claveSenda(r));
  });
}
// Anillo que se llena sobre el jugador mientras se mantiene pulsado (HoldRing).
function dibujarAnilloSenda() {
  if (!sostener || sostener.t < SENDA_ANILLO) return;
  const j = juego.jugador, p = Math.min(1, (sostener.t - SENDA_ANILLO) / (SENDA_SEG - SENDA_ANILLO));
  const [sx, sy] = pantalla(j.x, j.y, (j.z || 0) + 2.1), x = Math.round(sx - vista.cx), y = Math.round(sy - vista.cy);
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#0009'; ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = '#ffd660'; ctx.beginPath(); ctx.arc(x, y, 6, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2); ctx.stroke();
}
// Texto del aviso: «Hablar · mantén: Indagar».
const avisoSenda = (it) => { const r = it?.habitante && sendaDe(it.habitante); return r ? (esTactil() ? `  ·  mantén: ${r.verbo}` : `  ·  mantén E: ${r.verbo}`) : ''; };
