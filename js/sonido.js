'use strict';
// Sonido y opciones. Unity aún no tiene audio (Assets/_Project/Audio está vacía), así que todo se sintetiza con Web Audio.

// ---------- Opciones (guardadas aparte de la partida) ----------
const OPC_CLAVE = 'cronicas.web.opciones';
const opciones = { efectos: 0.8, ambiente: 0.5, musica: 0.5, sacudida: true, vibracion: true, mapa: true };
try { Object.assign(opciones, JSON.parse(localStorage.getItem(OPC_CLAVE))); } catch { /* sin almacenamiento */ }
const guardarOpciones = () => { try { localStorage.setItem(OPC_CLAVE, JSON.stringify(opciones)); } catch { /* sin almacenamiento */ } };
const vibrar = (ms) => { if (opciones.vibracion && navigator.userActivation?.hasBeenActive !== false) navigator.vibrate?.(ms); }; // antes del primer toque, Chrome la bloquea y avisa

// ---------- Contexto de audio: el navegador solo lo deja arrancar tras un gesto ----------
let ac = null, busEf = null, busAmb = null, ruidoBuf = null, amb = null, regionAmb = null;
function audio() {
  if (!ac) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ac = new AC();
    busEf = ac.createGain(); busAmb = ac.createGain();
    busEf.connect(ac.destination); busAmb.connect(ac.destination);
    ruidoBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    const d = ruidoBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    volumenes();
    if (regionAmb) ambiente(regionAmb);
  }
  if (ac.state === 'suspended' && !document.hidden) ac.resume();
  return ac;
}
addEventListener('pointerdown', audio, { passive: true });
addEventListener('keydown', audio);
document.addEventListener('visibilitychange', () => { if (!ac) return; document.hidden ? ac.suspend() : ac.resume(); });
function volumenes() { if (busEf) { busEf.gain.value = opciones.efectos; busAmb.gain.value = opciones.ambiente; } }

// Un tono con envolvente rápida; «hasta» desliza la frecuencia.
function tono(f, dur, o = {}) {
  const t = ac.currentTime + (o.retraso || 0), osc = ac.createOscillator(), g = ac.createGain();
  osc.type = o.tipo || 'square';
  osc.frequency.setValueAtTime(f, t);
  if (o.hasta) osc.frequency.exponentialRampToValueAtTime(o.hasta, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(o.vol || 0.2, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(o.bus || busEf);
  osc.start(t); osc.stop(t + dur + 0.02);
}
// Ruido filtrado con envolvente.
function ruido(dur, o = {}) {
  const t = ac.currentTime + (o.retraso || 0), src = ac.createBufferSource(), fil = ac.createBiquadFilter(), g = ac.createGain();
  src.buffer = ruidoBuf;
  fil.type = o.filtro || 'lowpass';
  fil.frequency.setValueAtTime(o.f || 1200, t);
  if (o.hasta) fil.frequency.exponentialRampToValueAtTime(o.hasta, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(o.vol || 0.3, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(fil).connect(g).connect(o.bus || busEf);
  src.start(t, Math.random() * 1.5); src.stop(t + dur + 0.02);
}

const SONIDOS = {
  tajo: () => ruido(0.08, { filtro: 'bandpass', f: 3000, hasta: 800, vol: 0.2 }),
  golpe: () => { ruido(0.06, { f: 900, vol: 0.45 }); tono(160, 0.08, { tipo: 'triangle', hasta: 60, vol: 0.45 }); },
  remate: () => { ruido(0.1, { f: 700, vol: 0.6 }); tono(120, 0.15, { tipo: 'triangle', hasta: 40, vol: 0.6 }); },
  esquiva: () => ruido(0.15, { filtro: 'bandpass', f: 600, hasta: 2500, vol: 0.2 }),
  perfecta: () => { tono(880, 0.25, { tipo: 'sine', vol: 0.22 }); tono(1320, 0.35, { tipo: 'sine', vol: 0.18, retraso: 0.06 }); },
  bloqueo: () => { tono(1200, 0.12, { vol: 0.1, hasta: 900 }); ruido(0.05, { filtro: 'highpass', f: 4000, vol: 0.3 }); },
  escudo: () => { tono(600, 0.1, { tipo: 'triangle', vol: 0.25, hasta: 400 }); ruido(0.05, { f: 2000, vol: 0.2 }); },
  herido: () => { tono(300, 0.18, { tipo: 'sawtooth', hasta: 120, vol: 0.22 }); ruido(0.08, { f: 1500, vol: 0.3 }); },
  caida: () => tono(330, 0.9, { tipo: 'triangle', hasta: 80, vol: 0.3 }),
  muerte: () => { ruido(0.4, { filtro: 'bandpass', f: 1500, hasta: 200, vol: 0.3 }); tono(500, 0.4, { tipo: 'sine', hasta: 100, vol: 0.2 }); },
  disparo: () => tono(700, 0.15, { tipo: 'sine', hasta: 300, vol: 0.14 }),
  aviso: () => tono(220, 0.2, { tipo: 'sine', hasta: 330, vol: 0.07 }),
  impacto: () => { ruido(0.25, { f: 400, hasta: 80, vol: 0.5 }); tono(70, 0.25, { tipo: 'sine', hasta: 35, vol: 0.5 }); },
  rugido: () => { ruido(0.9, { filtro: 'bandpass', f: 300, hasta: 120, vol: 0.6 }); tono(90, 0.9, { tipo: 'sawtooth', hasta: 55, vol: 0.22 }); },
  ruptura: () => { ruido(0.7, { filtro: 'bandpass', f: 2500, hasta: 300, vol: 0.6 }); tono(180, 0.6, { tipo: 'square', hasta: 40, vol: 0.25 }); },
  tierra: () => { ruido(0.5, { f: 300, hasta: 60, vol: 0.7 }); tono(55, 0.5, { tipo: 'sine', hasta: 30, vol: 0.7 }); },
  especial: () => { ruido(0.3, { filtro: 'bandpass', f: 500, hasta: 200, vol: 0.5 }); tono(180, 0.3, { tipo: 'sawtooth', hasta: 60, vol: 0.28 }); },
  rompe: () => { ruido(0.6, { filtro: 'bandpass', f: 1200, hasta: 300, vol: 0.5 }); tono(55, 0.5, { tipo: 'sine', hasta: 30, vol: 0.6 }); },
  vasija: () => { ruido(0.25, { filtro: 'highpass', f: 2500, vol: 0.35 }); tono(900, 0.1, { tipo: 'triangle', hasta: 500, vol: 0.15 }); },
  premio: () => { tono(660, 0.12, { tipo: 'sine', vol: 0.14 }); tono(990, 0.2, { tipo: 'sine', vol: 0.12, retraso: 0.08 }); },
  nivel: () => [523, 659, 784, 1047].forEach((f, i) => tono(f, 0.25, { tipo: 'triangle', vol: 0.14, retraso: i * 0.08 })),
  cura: () => tono(440, 0.3, { tipo: 'sine', hasta: 880, vol: 0.14 }),
  dialogo: () => tono(520, 0.05, { vol: 0.04 }),
  clic: () => tono(800, 0.03, { vol: 0.035 }),
  portal: () => ruido(0.4, { filtro: 'bandpass', f: 400, hasta: 1600, vol: 0.2 }),
  no: () => tono(150, 0.12, { vol: 0.07 }),
};
// Varios sonidos iguales en el mismo instante (un tajo que alcanza a tres) suenan como uno.
const ultimoSonido = {};
function sonar(nombre) {
  if (!ac || ac.state !== 'running' || !opciones.efectos || !SONIDOS[nombre]) return;
  if (ac.currentTime - (ultimoSonido[nombre] ?? -1) < 0.03) return;
  ultimoSonido[nombre] = ac.currentTime;
  SONIDOS[nombre]();
}

// ---------- Ambiente por región: ruido filtrado que respira, dron en la mazmorra, pájaros y gotas ----------
const AMBIENTES = {
  ciudad: { f: 500, vol: 0.22, pajaros: 0.15 },
  selva: { f: 900, vol: 0.26, pajaros: 0.5 },
  palenque: { f: 1100, vol: 0.28, pajaros: 0.5 }, // etapa 43: selva con río
  aldea_maya: { f: 800, vol: 0.24, pajaros: 0.3 }, // etapa 44
  p1: { f: 180, vol: 0.3, dron: 55 },
  p2: { f: 250, vol: 0.3, dron: 49, gotas: 0.35 },
  p3: { f: 150, vol: 0.34, dron: 41 },
};
function ambiente(id) {
  regionAmb = id;
  if (!ac) return;
  if (amb) { const a = amb; a.g.gain.setTargetAtTime(0, ac.currentTime, 0.3); setTimeout(() => a.nodos.forEach((n) => n.stop()), 1500); amb = null; }
  const A = AMBIENTES[id];
  if (!A) return;
  const g = ac.createGain(), fil = ac.createBiquadFilter(), src = ac.createBufferSource(), lfo = ac.createOscillator(), lfoG = ac.createGain();
  g.gain.setValueAtTime(0, ac.currentTime); g.gain.setTargetAtTime(A.vol, ac.currentTime, 0.6);
  fil.type = 'lowpass'; fil.frequency.value = A.f;
  src.buffer = ruidoBuf; src.loop = true;
  lfo.frequency.value = 0.12; lfoG.gain.value = A.f * 0.35; // el filtro sube y baja despacio, como viento o agua
  lfo.connect(lfoG).connect(fil.frequency);
  src.connect(fil).connect(g).connect(busAmb);
  const nodos = [src, lfo];
  if (A.dron) for (const f of [A.dron, A.dron * 1.012]) {
    const o = ac.createOscillator(), og = ac.createGain();
    o.type = 'sine'; o.frequency.value = f; og.gain.value = 0.18;
    o.connect(og).connect(g); nodos.push(o);
  }
  nodos.forEach((n) => n.start());
  amb = { g, nodos, A };
}
setInterval(() => {
  if (!amb || ac.state !== 'running' || !opciones.ambiente) return;
  const A = amb.A, r = Math.random;
  if (A.pajaros && r() < A.pajaros * 0.25) {
    const f = 2000 + r() * 1500;
    tono(f, 0.08, { tipo: 'sine', hasta: f * 1.3, vol: 0.03, bus: busAmb });
    tono(f * 1.1, 0.06, { tipo: 'sine', hasta: f * 0.9, vol: 0.025, bus: busAmb, retraso: 0.11 });
  }
  if (A.gotas && r() < A.gotas * 0.25) tono(1200 + r() * 600, 0.05, { tipo: 'sine', hasta: 400, vol: 0.04, bus: busAmb });
}, 250);

// ---------- Pantalla de opciones (desde el inicio y desde la pausa) ----------
const OPC = { oEfectos: 'efectos', oAmbiente: 'ambiente', oMusica: 'musica', oSacudida: 'sacudida', oVibracion: 'vibracion', oMapa: 'mapa' };
function abrirOpciones() {
  for (const [id, k] of Object.entries(OPC)) { const el = $(id); if (el.type === 'checkbox') el.checked = opciones[k]; else el.value = opciones[k]; }
  $('opciones').classList.remove('oculto');
  $('oEfectos').focus();
}
const opcionesAbiertas = () => !$('opciones').classList.contains('oculto');
function cerrarOpciones() { $('opciones').classList.add('oculto'); (juego.pausa ? $('reanudar') : $('nueva')).focus(); }
for (const [id, k] of Object.entries(OPC)) {
  $(id).addEventListener('input', (e) => {
    opciones[k] = e.target.type === 'checkbox' ? e.target.checked : Number(e.target.value);
    guardarOpciones(); volumenes();
    if (k === 'efectos') sonar('premio');
  });
}
$('oCerrar').onclick = cerrarOpciones;
$('opcInicio').onclick = abrirOpciones;
$('opcPausa').onclick = abrirOpciones;
document.addEventListener('click', (e) => { if (e.target.closest('button:not(.tbtn)')) sonar('clic'); });
