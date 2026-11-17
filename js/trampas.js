'use strict';
// Trampas y adornos de la mazmorra: pinchos (SpikeTrap), placas de presión (PressurePlate), braseros y cristales animados
// (SpriteFrameCycler), esteras y cabezas de piedra. Sitios de OlmecaDungeonGenerator.Props (x, y del flujo).
// Las cercas de estacas (StakeFence) existen en Unity, pero ningún piso las coloca.

const TRAMPAS = {
  p1: { pinchos: [[-6, 0], [2, 0]], placas: [[13, 0]], pinchosPlaca: [[13, 1], [13, -1]],
    braseros: [[-13, -2], [-2, 2], [6, -2], [-3, -2], [0.8, 8.6], [6.2, 8.6]], cristales: [[-10, -2], [6, 1], [1.6, 8.1], [5.4, 8.1]],
    esteras: [[15, -2], [15, 2], [1.4, 9.8], [5.6, 9.8]], cabezas: [] },
  p2: { pinchos: [[-5, 1], [6, 1], [-8, 1]], placas: [], pinchosPlaca: [], braseros: [[-13, 1], [0, 4], [10, -1]],
    cristales: [[3, 1], [14, 1], [-10, -1]], esteras: [[8, 1], [-13, -1]], cabezas: [[10, -3]] },
  p3: { pinchos: [[-3, 0], [-6, 0]], placas: [], pinchosPlaca: [], braseros: [[7, 3], [0, -2]], cristales: [[4, -2], [4, 2]], esteras: [], cabezas: [] },
};
const PINCHOS = { periodo: 3.5, aviso: 0.7, arriba: 1.1, dano: 8, mitad: 0.45, desfase: 1.2 }; // SpikeTrap: trigger de 0,9 × 0,9
const PLACA = { soltar: 0.4, mitad: 0.35 }; // PressurePlate: trigger de 0,7 × 0,7

function poblarTrampas(id) {
  Object.assign(juego, { trampas: [], placas: [], sueloTrampas: [] });
  const T = TRAMPAS[id];
  if (!T) return;
  const pinchos = ([x, y], periodico, desfase) =>
    ({ x, y, periodico, estado: 'abajo', t: periodico ? PINCHOS.periodo - PINCHOS.aviso - PINCHOS.arriba + desfase : 0 });
  juego.trampas = T.pinchos.map((p, i) => pinchos(p, true, i * PINCHOS.desfase));
  const dePlaca = T.pinchosPlaca.map((p) => pinchos(p, false, 0));
  juego.trampas.push(...dePlaca);
  juego.placas = T.placas.map(([x, y]) => ({ x, y, pisada: false, ultima: -9, pinchos: dePlaca }));
  juego.sueloTrampas = T.esteras.map(([x, y], i) => ({ x, y, sprite: `Estera_Tejida_0${(i % 2) + 1}` }));
  // De pie, con su caja: braseros (3 cuadros a 6 por segundo), cristales (2 a 1,5) y cabezas de piedra.
  const pieza = ([x, y], base, cuadros, fps, lado) => {
    mundo.objetos.push({ x, y, z: alturaEn(x, y), orden: profundidad(y, 0), dibujar(o) {
      dibujar(cuadros > 1 ? `${base}_0${1 + (Math.floor(juego.t * fps) % cuadros)}` : base, o.x, o.y, o.z);
    } });
    mundo.cajas.push(caja(x, y, lado, lado));
  };
  T.braseros.forEach((p) => pieza(p, 'Brasero_Piedra', 3, 6, 0.4));
  T.cristales.forEach((p) => pieza(p, 'Cristal_Memoria', 2, 1.5, 0.4));
  T.cabezas.forEach((p) => pieza(p, 'Cabeza_Piedra_01', 1, 0, 1)); // dibujada al doble (ESCALA_SPRITE): su caja también
}

function avisarPinchos(k) { k.estado = 'aviso'; k.t = PINCHOS.aviso; }
// Caja del trigger más el radio del jugador. Saltando se pasa por encima.
const pisa = (o, mitad) => { const j = juego.jugador; return !enElAire(j) && Math.abs(j.x - o.x) < mitad + 0.25 && Math.abs(j.y - o.y) < mitad + 0.25; };
function actualizarTrampas(dt) {
  if (!juego.trampas?.length) return;
  for (const p of juego.placas) {
    if (pisa(p, PLACA.mitad)) {
      p.ultima = juego.t;
      if (!p.pisada) { p.pisada = true; sonar('clic'); p.pinchos.forEach((k) => k.estado === 'abajo' && avisarPinchos(k)); }
    } else if (p.pisada && juego.t - p.ultima > PLACA.soltar) p.pisada = false;
  }
  for (const k of juego.trampas) {
    k.t -= dt;
    if (k.estado === 'abajo') { if (k.periodico && k.t <= 0) avisarPinchos(k); }
    else if (k.estado === 'aviso') {
      if (k.t <= 0) { k.estado = 'arriba'; k.t = PINCHOS.arriba; if (dist(k, juego.jugador) < 6) sonar('tajo'); }
    } else if (k.t <= 0) { k.estado = 'abajo'; k.t = k.periodico ? PINCHOS.periodo - PINCHOS.aviso - PINCHOS.arriba : 0; }
    else if (pisa(k, PINCHOS.mitad)) herirJugador(PINCHOS.dano, k); // la invulnerabilidad de 1 s evita el daño cada cuadro
  }
}
// Piezas planas: encima del suelo y debajo de los personajes. El aviso parpadea en color y en brillo.
function dibujarSueloTrampas() {
  for (const e of juego.sueloTrampas || []) dibujar(e.sprite, e.x, e.y);
  for (const p of juego.placas || []) dibujar(p.pisada ? 'Placa_Presion_02' : 'Placa_Presion_01', p.x, p.y);
  for (const k of juego.trampas || []) {
    const parpadeo = k.estado === 'aviso' && Math.floor(juego.t * 12) % 2 === 0;
    dibujar(k.estado === 'arriba' ? 'Trampa_Pinchos_02' : 'Trampa_Pinchos_01', k.x, k.y, 0, { filtro: parpadeo ? 'sepia(1) saturate(4) brightness(1.3)' : null });
  }
}
