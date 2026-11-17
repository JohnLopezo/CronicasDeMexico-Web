'use strict';
// Cuadros de ataque por partes (etapa 28, solo HTML; ver PORTAR_A_UNITY.md). La fauna de la lámina de Unity tiene un solo
// cuadro de ataque: aquí se recorta una parte de ese cuadro (cabeza, mandíbula, torso, aguijón, alas) y se mueve sobre su
// pivote durante el aviso y el golpe, sin tocar el arte. Así el ataque tiene preparación, golpe y seguimiento.
//
// Cada parte: r = [x0, y0, x1, y1] en píxeles del PNG (mira a la derecha), p = pivote [x, y], y por fase dx, dy (px) y rot
// (rad; > 0 = horario = hacia delante y abajo para quien mira a la derecha). aviso se aplica según el progreso del aviso;
// golpe, con una curva que sale en 0,06 s, se pasa y se asienta; aleteo = { hz, rot } oscila siempre en la pose de ataque.
const PARTES = {
  Serpiente: [{ r: [16, 29, 46, 49], p: [28, 49], aviso: { dx: -4, dy: -2, rot: -0.22 }, golpe: { dx: 9, dy: 3, rot: 0.32 } }],
  Cocodrilo: [
    { r: [42, 30, 63, 45], p: [43, 45], aviso: { rot: -0.22 }, golpe: { rot: 0.2 } }, // mandíbula de arriba: abre y cierra de golpe
    { r: [42, 46, 63, 62], p: [43, 46], aviso: { rot: 0.12 }, golpe: { rot: -0.1 } }, // la de abajo
  ],
  Mono: [
    { r: [24, 26, 50, 47], p: [31, 47], aviso: { dx: -2, rot: -0.3 }, golpe: { dx: 3, dy: 1, rot: 0.3 } }, // torso y brazos
    { r: [12, 26, 24, 47], p: [23, 46], aviso: { rot: 0.25 }, golpe: { rot: -0.3 } }, // la cola, al revés
  ],
  Avispa: [
    { r: [6, 49, 25, 62], p: [25, 50], aviso: { rot: -0.55 }, golpe: { dx: 3, rot: -0.9 } }, // abdomen con el aguijón
    { r: [29, 36, 47, 44], p: [33, 44], aleteo: { hz: 14, rot: 0.25 } },
  ],
  Guacamaya: [
    { r: [5, 37, 19, 55], p: [19, 47], aviso: { rot: 0.35 }, golpe: { rot: -0.45 }, aleteo: { hz: 5, rot: 0.18 } }, // ala trasera
    { r: [43, 37, 56, 51], p: [43, 47], aviso: { rot: -0.35 }, golpe: { rot: 0.45 }, aleteo: { hz: 5, rot: -0.18 } }, // delantera
  ],
  Murcielago: [
    { r: [7, 40, 20, 56], p: [20, 49], aviso: { rot: 0.3 }, golpe: { rot: -0.5 }, aleteo: { hz: 6, rot: 0.25 } },
    { r: [30, 40, 47, 56], p: [30, 49], aviso: { rot: -0.3 }, golpe: { rot: 0.5 }, aleteo: { hz: 6, rot: -0.25 } },
  ],
};
const CUADROS = { sale: 0.06, pasa: 1.25, queda: 0.55, asienta: 10, salida: 0.12 }; // curva del golpe y fundido al soltarlo

// Curva del golpe: 0 → 1,25 en 0,06 s y luego baja hacia 0,55 (el golpe queda «dado» mientras dura).
const curvaGolpe = (a) => a < CUADROS.sale ? (a / CUADROS.sale) * CUADROS.pasa
  : CUADROS.queda + (CUADROS.pasa - CUADROS.queda) * Math.exp(-(a - CUADROS.sale) * CUADROS.asienta);

// Transformación de una parte: fase = { aviso: 0-1 } o { golpe: segundos desde que empezó }.
function moverParte(q, fase, t) {
  const A = q.aviso || {}, G = q.golpe || {}, o = { dx: 0, dy: 0, rot: 0 };
  const ka = fase.aviso != null ? Math.sin((Math.min(1, fase.aviso) * Math.PI) / 2) : fase.golpe != null ? 1 - Math.min(1, fase.golpe / CUADROS.sale) : 0;
  const kg = fase.golpe != null ? curvaGolpe(fase.golpe) : 0;
  for (const k of ['dx', 'dy', 'rot']) o[k] = (A[k] || 0) * ka + (G[k] || 0) * kg;
  if (q.aleteo) o.rot += q.aleteo.rot * Math.sin(2 * Math.PI * q.aleteo.hz * t);
  if (fase.aviso > 0.75) o.dx += (Math.random() - 0.5) * 0.8; // tiembla al final del aviso, como el cuerpo
  return o;
}

// Pinta el cuadro con sus partes movidas en un lienzo propio del enemigo (mismo tamaño que el PNG, así el pivote no cambia).
function lienzoPartes(e, nombre, partes, fase) {
  const im = imagen(nombre); if (!im || !im.naturalWidth) return null;
  const c = e.lienzo || (e.lienzo = document.createElement('canvas'));
  if (c.width !== im.naturalWidth || c.height !== im.naturalHeight) { c.width = im.naturalWidth; c.height = im.naturalHeight; }
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  g.clearRect(0, 0, c.width, c.height); g.drawImage(im, 0, 0);
  for (const q of partes) { const [x0, y0, x1, y1] = q.r; g.clearRect(x0, y0, x1 - x0, y1 - y0); } // se quitan y se ponen movidas
  for (const q of partes) {
    const [x0, y0, x1, y1] = q.r, [px, py] = q.p, m = moverParte(q, fase, juego.t + (e.mv?.fase || 0) * 10);
    g.save(); g.translate(Math.round(px + m.dx), Math.round(py + m.dy)); g.rotate(m.rot);
    g.drawImage(im, x0, y0, x1 - x0, y1 - y0, x0 - px, y0 - py, x1 - x0, y1 - y0);
    g.restore();
  }
  return c;
}

// Para dibujarFauna: el lienzo del cuadro de ataque por partes, o null si esta especie o pose no lo tienen.
function cuadroAtaque(e, nombre) {
  const partes = PARTES[e.especie];
  if (!partes || !nombre.includes('_Ataque')) return null;
  if (e.estado !== e.cuadroEstado) { e.cuadroEstado = e.estado; e.cuadroDesde = juego.t; }
  const fase = e.estado === 'aviso' ? { aviso: 1 - Math.max(0, e.t) / (e.d.attackWindup || 0.6) }
    : e.estado === 'golpe' || e.estado === 'especial' ? { golpe: juego.t - e.cuadroDesde } : {};
  return lienzoPartes(e, nombre, partes, fase);
}

// Autocomprobación de la curva y de las fases.
console.assert(Math.abs(curvaGolpe(CUADROS.sale) - CUADROS.pasa) < 1e-9 && Math.abs(curvaGolpe(5) - CUADROS.queda) < 1e-3, '[assert] curva del golpe');
console.assert(moverParte(PARTES.Serpiente[0], { aviso: 1 }, 0).rot === PARTES.Serpiente[0].aviso.rot && moverParte(PARTES.Serpiente[0], {}, 0).dx === 0, '[assert] fases de las partes');
