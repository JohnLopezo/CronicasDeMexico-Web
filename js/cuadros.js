'use strict';
// Cuadros por partes (etapas 28-29, solo HTML; ver PORTAR_A_UNITY.md). El arte de Unity tiene un solo cuadro por pose: aquí se
// recorta una parte de ese cuadro (cabeza, mandíbula, torso, aguijón, alas, puños) y se mueve sobre su pivote, sin tocar el arte.
// Así el ataque tiene preparación, golpe y seguimiento, y las alas aletean de verdad.
//
// Clave = nombre del sprite sin «1_03». Cada parte: r = [x0, y0, x1, y1] en píxeles del PNG (mira a la derecha), p = pivote
// [x, y], y por fase dx, dy (px) y rot (rad; > 0 = horario = hacia delante y abajo para quien mira a la derecha). aviso se aplica
// según el progreso del aviso; golpe, con una curva que sale en 0,06 s, se pasa y se asienta; aleteo = { hz, rot } oscila siempre.
const PARTES = {
  Enemigo_Serpiente_Ataque: [{ r: [16, 29, 46, 49], p: [28, 49], aviso: { dx: -4, dy: -2, rot: -0.22 }, golpe: { dx: 9, dy: 3, rot: 0.32 } }],
  Enemigo_Cocodrilo_Ataque: [
    { r: [42, 30, 63, 45], p: [43, 45], aviso: { rot: -0.22 }, golpe: { rot: 0.2 } }, // mandíbula de arriba: abre y cierra de golpe
    { r: [42, 46, 63, 62], p: [43, 46], aviso: { rot: 0.12 }, golpe: { rot: -0.1 } }, // la de abajo
  ],
  Enemigo_Mono_Ataque: [
    { r: [24, 26, 50, 47], p: [31, 47], aviso: { dx: -2, rot: -0.3 }, golpe: { dx: 3, dy: 1, rot: 0.3 } }, // torso y brazos
    { r: [12, 26, 24, 47], p: [23, 46], aviso: { rot: 0.25 }, golpe: { rot: -0.3 } }, // la cola, al revés
  ],
  Enemigo_Avispa_Ataque: [
    { r: [6, 49, 25, 62], p: [25, 50], aviso: { rot: -0.55 }, golpe: { dx: 3, rot: -0.9 } }, // abdomen con el aguijón
    { r: [29, 36, 47, 44], p: [33, 44], aleteo: { hz: 14, rot: 0.25 } },
  ],
  Enemigo_Guacamaya_Ataque: [
    { r: [5, 37, 19, 55], p: [19, 47], aviso: { rot: 0.35 }, golpe: { rot: -0.45 }, aleteo: { hz: 5, rot: 0.18 } }, // ala trasera
    { r: [43, 37, 56, 51], p: [43, 47], aviso: { rot: -0.35 }, golpe: { rot: 0.45 }, aleteo: { hz: 5, rot: -0.18 } }, // delantera
  ],
  Enemigo_Murcielago_Ataque: [
    { r: [7, 40, 20, 56], p: [20, 49], aviso: { rot: 0.3 }, golpe: { rot: -0.5 }, aleteo: { hz: 6, rot: 0.25 } },
    { r: [30, 40, 47, 56], p: [30, 49], aviso: { rot: -0.3 }, golpe: { rot: 0.5 }, aleteo: { hz: 6, rot: -0.25 } },
  ],
  // Vuelo (etapa 29): solo aleteo, a su ritmo (el de js/movimiento.js sigue ensanchando el cuerpo a la vez).
  Enemigo_Avispa_Volar: [{ r: [2, 34, 22, 45], p: [22, 44], aleteo: { hz: 16, rot: 0.35 } }],
  Enemigo_Guacamaya_Volar: [
    { r: [5, 34, 26, 53], p: [26, 47], aleteo: { hz: 3.2, rot: 0.3 } },
    { r: [44, 36, 60, 53], p: [44, 46], aleteo: { hz: 3.2, rot: -0.3 } },
  ],
  Enemigo_Murcielago_Volar: [
    { r: [2, 40, 24, 58], p: [24, 50], aleteo: { hz: 4.6, rot: 0.35 } },
    { r: [36, 40, 54, 57], p: [36, 49], aleteo: { hz: 4.6, rot: -0.35 } },
  ],
  // Espíritu jaguar: cabeza y zarpa delanteras.
  Enemigo_EspirituJaguar_Ataque: [{ r: [30, 26, 50, 46], p: [33, 46], golpe: { dx: 3, dy: 1, rot: 0.22 }, sinHueco: true }], // macizo: el cuadro queda debajo
  // Xolotl (PerroFuego, 82 × 128): la cabeza muerde y las llamas de la cola se mecen.
  Jefe_PerroFuego_Ataque: [
    { r: [38, 71, 75, 101], p: [44, 101], aviso: { dx: -3, dy: -2, rot: -0.2 }, golpe: { dx: 6, dy: 2, rot: 0.25 } },
    { r: [3, 71, 33, 101], p: [31, 100], aleteo: { hz: 2.5, rot: 0.1 } },
  ],
  // Chac Mool (GuardianOfrenda, 132 × 128): los dos puños se alzan y golpean el suelo en la embestida.
  Jefe_GuardianOfrenda_Ataque: [
    { r: [13, 95, 47, 127], p: [41, 100], aviso: { dy: -3, rot: 0.3 }, golpe: { dy: 3, rot: -0.12 } },
    { r: [71, 91, 121, 127], p: [77, 96], aviso: { dy: -3, rot: -0.3 }, golpe: { dy: 3, rot: 0.12 } },
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
  for (const q of partes) if (!q.sinHueco) { const [x0, y0, x1, y1] = q.r; g.clearRect(x0, y0, x1 - x0, y1 - y0); } // se quitan y se ponen movidas
  for (const q of partes) {
    const [x0, y0, x1, y1] = q.r, [px, py] = q.p, m = moverParte(q, fase, juego.t + (e.mv?.fase || 0) * 10);
    g.save(); g.translate(Math.round(px + m.dx), Math.round(py + m.dy)); g.rotate(m.rot);
    g.drawImage(im, x0, y0, x1 - x0, y1 - y0, x0 - px, y0 - py, x1 - x0, y1 - y0);
    g.restore();
  }
  return c;
}

// El lienzo del cuadro por partes, o null si el cuadro no tiene partes. Sin fase, el golpe cuenta desde que empezó este cuadro.
function conPartes(e, nombre, fase = null) {
  const partes = PARTES[nombre.replace(/1_0\d$/, '')];
  if (!partes) return null;
  if (nombre !== e.partesNombre) { e.partesNombre = nombre; e.partesDesde = juego.t; }
  return lienzoPartes(e, nombre, partes, fase || { golpe: juego.t - e.partesDesde });
}

// Fauna de la lámina: el aviso y el golpe salen de su estado.
function cuadroAtaque(e, nombre) {
  if (e.estado !== e.cuadroEstado) { e.cuadroEstado = e.estado; e.cuadroDesde = juego.t; }
  const fase = e.estado === 'aviso' ? { aviso: 1 - Math.max(0, e.t) / (e.d.attackWindup || 0.6) }
    : e.estado === 'golpe' || e.estado === 'especial' ? { golpe: juego.t - e.cuadroDesde } : {};
  return conPartes(e, nombre, fase);
}

// Autocomprobación de la curva, las fases y que cada parte cabe en su PNG.
console.assert(Math.abs(curvaGolpe(CUADROS.sale) - CUADROS.pasa) < 1e-9 && Math.abs(curvaGolpe(5) - CUADROS.queda) < 1e-3, '[assert] curva del golpe');
console.assert(moverParte(PARTES.Enemigo_Serpiente_Ataque[0], { aviso: 1 }, 0).rot === PARTES.Enemigo_Serpiente_Ataque[0].aviso.rot, '[assert] fases de las partes');
for (const [k, ps] of Object.entries(PARTES)) {
  const s = SPRITES[k + '1_03'];
  console.assert(s, `[assert] PARTES: falta el sprite ${k}`);
  for (const q of ps) console.assert(q.r[0] < q.r[2] && q.r[1] < q.r[3], `[assert] PARTES ${k}: rectángulo al revés`);
}
