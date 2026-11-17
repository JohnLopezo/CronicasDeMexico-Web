'use strict';
// Música de fondo prehispánica (etapa 34, solo HTML; ver PORTAR_A_UNITY.md). Flauta de barro, huehuetl (tambor grave),
// teponaztli (tambor de lengüetas, dos tonos), sonaja y caracol, sintetizados con Web Audio como js/sonido.js. Escala
// pentatónica menor. Dos modos que cambian solos al empezar un compás: explorar (lento, la flauta con silencios) y pelear
// (tambores rápidos; el caracol anuncia la pelea). Afuera en re, en la mazmorra en la, más grave.

// Patrones de 16 semicorcheas por compás: 0 = nada, si no, la fuerza (teponaztli: 1 = tono grave, 2 = agudo).
const MUSICA = {
  explora: { bpm: 76, frase: [4, 8], flauta: 0.45,
    huehuetl: [1, 0, 0, 0, 0, 0, 0, 0, 0.5, 0, 0, 0, 0, 0, 0, 0],
    tepo: [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0],
    sonaja: [0, 0, 0, 0, 0, 0, 0.4, 0, 0, 0, 0, 0, 0, 0, 0.4, 0] },
  pelea: { bpm: 118, frase: [2, 4], flauta: 0.7,
    huehuetl: [1, 0, 0, 0.6, 0, 0, 1, 0, 1, 0, 0, 0.6, 0, 0, 1, 0],
    tepo: [1, 0, 2, 0, 1, 1, 2, 0, 1, 0, 2, 0, 2, 1, 2, 1],
    sonaja: [0.6, 0.3, 0.6, 0.3, 0.6, 0.3, 0.6, 0.3, 0.6, 0.3, 0.6, 0.3, 0.6, 0.3, 0.6, 0.3] },
};
const ESCALA = [0, 3, 5, 7, 10]; // pentatónica menor
const MUS = { vol: 0.5, pausa: 0.4, adelanto: 0.25, cerca: 5, pelea: 4 }; // volumen propio, en pausa, s de adelanto, m, s que dura la pelea tras el último indicio
const raizMusica = () => (/^[pn]\d/.test(juego.region || '') ? 220 : 293.66); // mazmorra: la3; afuera: re4
const freqGrado = (raiz, g) => raiz * 2 ** ((ESCALA[g % 5] + 12 * Math.floor(g / 5)) / 12);

// ---------- Instrumentos (t = tiempo absoluto de ac) ----------
const enT = (t) => Math.max(0, t - ac.currentTime);
function huehuetl(t, v) {
  tono(95, 0.45, { tipo: 'sine', hasta: 45, vol: 0.55 * v, retraso: enT(t), bus: mus.bus });
  ruido(0.05, { f: 300, vol: 0.12 * v, retraso: enT(t), bus: mus.bus });
}
function teponaztli(t, n, raiz) {
  const f = (raiz / 2) * (n === 2 ? 1.5 : 1); // dos lengüetas a una quinta
  tono(f, 0.14, { tipo: 'triangle', hasta: f * 0.97, vol: 0.3, retraso: enT(t), bus: mus.bus });
  tono(f * 2.7, 0.03, { tipo: 'sine', vol: 0.06, retraso: enT(t), bus: mus.bus }); // el golpe de madera
}
const sonaja = (t, v) => ruido(0.05, { filtro: 'highpass', f: 6000, vol: 0.14 * v, retraso: enT(t), bus: mus.bus });
// Flauta de barro: seno con un poco de armónico, ataque suave, vibrato que entra tarde y un soplo al empezar.
function flauta(t, f, dur) {
  const o = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain(), g2 = ac.createGain(), lfo = ac.createOscillator(), lg = ac.createGain();
  o.type = 'sine'; o.frequency.value = f; o2.type = 'triangle'; o2.frequency.value = f * 2; g2.gain.value = 0.08;
  lfo.frequency.value = 5.5; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f * 0.012, t + Math.min(0.3, dur));
  lfo.connect(lg); lg.connect(o.frequency); lg.connect(o2.frequency);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.16, t + 0.05);
  g.gain.setValueAtTime(0.16, t + Math.max(0.06, dur - 0.08)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); o2.connect(g2).connect(g); g.connect(mus.bus);
  for (const n of [o, o2, lfo]) { n.start(t); n.stop(t + dur + 0.02); }
  ruido(0.07, { filtro: 'bandpass', f: f * 2, vol: 0.04, retraso: enT(t), bus: mus.bus });
}
// Caracol: grave, áspero, entra despacio.
function caracol(t) {
  const o = ac.createOscillator(), fil = ac.createBiquadFilter(), g = ac.createGain();
  o.type = 'sawtooth'; o.frequency.setValueAtTime(110, t); o.frequency.linearRampToValueAtTime(104, t + 1.4);
  fil.type = 'lowpass'; fil.frequency.value = 650;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.22, t + 0.3); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.5);
  o.connect(fil).connect(g).connect(mus.bus); o.start(t); o.stop(t + 1.55);
}

// ---------- ¿Explorar o pelear? Hay pelea con un aviso o un proyectil en el aire, un jefe despierto o un enemigo cerca. ----------
function modoMusica() {
  if (!juego.activo) return 'explora';
  const j = juego.jugador, jefe = juego.jefe;
  if (juego.marcas.length || juego.disparos.length || (jefe && jefe.vida > 0 && jefe.estado !== 'dormido')
    || juego.enemigos.some((e) => e.vida > 0 && e.tipo !== 'vasija' && e.golpeable !== false && dist(e, j) < MUS.cerca)) mus.peleaHasta = ac.currentTime + MUS.pelea;
  return ac.currentTime < mus.peleaHasta ? 'pelea' : 'explora';
}

// ---------- Secuenciador: cada 50 ms programa las semicorcheas de los próximos 0,25 s ----------
let mus = null; // { bus, modo, t, paso, compas, grado, sostiene, peleaHasta }
function pasoMusica(t) {
  if (mus.paso === 0) { // cambio de modo solo al empezar un compás
    const m = modoMusica();
    if (m !== mus.modo) { mus.modo = m; mus.compas = 0; if (m === 'pelea') caracol(t); }
  }
  const M = MUSICA[mus.modo], i = mus.paso, raiz = raizMusica();
  if (M.huehuetl[i]) huehuetl(t, M.huehuetl[i]);
  if (M.tepo[i]) teponaztli(t, M.tepo[i], raiz);
  if (M.sonaja[i]) sonaja(t, M.sonaja[i]);
  // Flauta: frases de frase[0] compases y silencio hasta frase[1]; paseo por la escala y cierre en la tónica.
  const [toca, ciclo] = M.frase, enFrase = mus.compas % ciclo < toca, ultima = mus.compas % ciclo === toca - 1 && i >= 12;
  if (mus.sostiene > 0) mus.sostiene--;
  else if (enFrase && i % 2 === 0 && Math.random() < M.flauta) {
    const salto = [-2, -1, -1, 1, 1, 2][Math.floor(Math.random() * 6)];
    mus.grado = ultima ? (mus.grado >= 3 ? 5 : 0) : Math.min(9, Math.max(0, mus.grado + salto));
    const largo = ultima ? 16 - i : 2 * (1 + Math.floor(Math.random() * 3)), seg = 60 / M.bpm / 4;
    flauta(t, freqGrado(raiz, mus.grado), largo * seg * 0.95);
    mus.sostiene = largo - 1;
  }
  if (++mus.paso === 16) { mus.paso = 0; mus.compas++; }
}
setInterval(() => {
  if (!ac || ac.state !== 'running') return;
  if (!mus) { mus = { bus: ac.createGain(), modo: 'explora', t: ac.currentTime + 0.1, paso: 0, compas: 0, grado: 0, sostiene: 0, peleaHasta: 0 }; mus.bus.gain.value = 0; mus.bus.connect(ac.destination); }
  mus.bus.gain.setTargetAtTime((opciones.musica ?? MUS.vol) * (juego.pausa ? MUS.pausa : 1), ac.currentTime, 0.3);
  if (mus.t < ac.currentTime) mus.t = ac.currentTime + 0.05; // tras una pestaña oculta, no recuperar las notas perdidas
  while (mus.t < ac.currentTime + MUS.adelanto) { pasoMusica(mus.t); mus.t += 60 / MUSICA[mus.modo].bpm / 4; }
}, 50);

// Autocomprobación: patrones de 16 pasos y escala bien armada.
for (const [k, M] of Object.entries(MUSICA)) for (const p of ['huehuetl', 'tepo', 'sonaja']) console.assert(M[p].length === 16, `[assert] música ${k}.${p}: 16 pasos`);
console.assert(Math.abs(freqGrado(220, 5) - 440) < 1e-9 && Math.abs(freqGrado(220, 3) - 220 * 2 ** (7 / 12)) < 1e-9, '[assert] música: escala');
