'use strict';
// Movimiento por código para los enemigos de un solo cuadro por pose (los de la lámina de Unity, el espíritu jaguar y los
// jefes): sin tocar su arte, se estira, aplasta, inclina y desplaza el sprite alrededor de su pie según la pose y el estilo
// de cada animal. Solo de la versión HTML; ver PORTAR_A_UNITY.md (en Unity serían curvas sobre la escala y la rotación del
// hijo Sprite, como ya hace el temblor de la cámara).

// Estilo por animal: paso (pasos por segundo al andar), bote (altura del bote, px), bamboleo (rad), respira (fracción),
// aleteo (aletazos por segundo) y amplitud del aleteo, flota (bote del vuelo, px); repta: ondula en vez de botar.
const ESTILOS = {
  Serpiente: { repta: true, paso: 2.4, respira: 0.04 },
  Cocodrilo: { paso: 2.2, bote: 0.6, bamboleo: 0.06, respira: 0.025 },
  Mono: { paso: 3.6, bote: 2.2, bamboleo: 0.08, respira: 0.04 },
  Avispa: { aleteo: 16, amplitud: 0.05, flota: 1.6, respira: 0 },
  Guacamaya: { aleteo: 3.2, amplitud: 0.12, flota: 2.4, respira: 0 },
  Murcielago: { aleteo: 4.6, amplitud: 0.16, flota: 2.8, respira: 0 },
  espiritu: { paso: 3, bote: 1.2, bamboleo: 0.05, respira: 0.03, flota: 0.8 }, // espectral: además flota un poco
  jaguar: { paso: 2.4, bote: 1.4, bamboleo: 0.05, respira: 0.03 },
  guardian: { paso: 1.4, bote: 1.2, bamboleo: 0.04, respira: 0.02 },
};
const seno = (t) => Math.sin(2 * Math.PI * t);

// Devuelve { sx, sy, giro, dx, dy } para dibujarEn. pose: 'Reposo' | 'Caminar' | 'Correr' | 'Volar' | 'Aviso' | 'Ataque' |
// 'Defensa' | 'Dano' | 'Muerte'. progreso (0-1) de la pose cuando la tiene (aviso y muerte).
function movimiento(e, estilo, pose, progreso = 0) {
  const E = ESTILOS[estilo] || ESTILOS.espiritu, m = e.mv || (e.mv = { fase: Math.random(), t: juego.t, signo: Math.sign(e.fx) || 1, giroT: 0, z: e.z || 0, aterriza: 0, dano: 0 });
  const dt = Math.min(0.1, Math.max(0, juego.t - m.t)); m.t = juego.t;
  const t = juego.t + m.fase * 10, o = { sx: 1, sy: 1, giro: 0, dx: 0, dy: 0 };
  // Media vuelta: al cambiar de lado se estrecha y se abre en 0,14 s en vez de voltearse de golpe.
  const signo = Math.sign(e.fx) || m.signo;
  if (signo !== m.signo) { m.signo = signo; m.giroT = 0.14; }
  m.giroT = Math.max(0, m.giroT - dt);
  // Aterrizaje de un salto: se aplasta un momento.
  const z = e.z || 0, suelo = e.suelo ?? 0;
  if (m.z > suelo + 0.05 && z <= suelo + 0.01) m.aterriza = 0.16;
  m.z = z; m.aterriza = Math.max(0, m.aterriza - dt);
  // Golpe recibido: el destello marca el instante.
  if (e.destello > 0.08 && m.dano <= 0) m.dano = 0.22;
  m.dano = Math.max(0, m.dano - dt);

  if (pose === 'Muerte') { // se vuelca hacia atrás y se hunde
    const p = Math.min(1, progreso);
    o.giro = 1.2 * p * p; o.sy = 1 - 0.25 * p; o.sx = 1 + 0.08 * p; o.dy = 2 * p;
    return o;
  }
  // Respiración en reposo (y algo siempre).
  const r = (E.respira || 0) * seno(t * 0.7);
  o.sy += r; o.sx -= r * 0.6;
  if (pose === 'Volar') {
    // Aleteo: se ensancha y se encoge al ritmo de las alas, y flota; se inclina hacia donde va.
    const a = seno(t * E.aleteo);
    o.sx += a * E.amplitud; o.sy -= a * E.amplitud * 0.6; o.dy -= Math.abs(a) * 0.5 + seno(t * 0.6) * (E.flota || 0);
    o.giro += Math.max(-0.25, Math.min(0.25, (e.vx || 0) * 0.04)) * (e.fx < 0 ? -1 : 1);
  } else if (pose === 'Caminar' || pose === 'Correr') {
    const v = pose === 'Correr' ? 1.6 : 1, f = t * (E.paso || 2.5) * v;
    if (E.repta) { o.sx += 0.07 * seno(f); o.sy -= 0.05 * seno(f); o.giro += 0.04 * seno(f + 0.25); } // ondula
    else {
      const b = Math.abs(seno(f / 2));
      o.dy -= b * (E.bote || 1) * v; o.giro += (E.bamboleo || 0.05) * seno(f / 2) * (pose === 'Correr' ? 0.6 : 1);
      o.sy *= 1 - 0.05 * (1 - b) * v; o.sx *= 1 + 0.04 * (1 - b) * v; // se aplasta al pisar
      if (pose === 'Correr') o.giro -= 0.06; // inclinado hacia delante
    }
  } else if (pose === 'Aviso') { // anticipación: se encoge y se echa atrás, cada vez más, temblando al final
    const p = Math.min(1, progreso);
    o.sx *= 1 - 0.08 * p; o.sy *= 1 + 0.06 * p; o.giro += 0.14 * p; o.dx -= 2 * p;
    if (p > 0.7) o.dx += (Math.random() - 0.5) * 1.2;
  } else if (pose === 'Ataque') { // estocada: se estira hacia delante
    o.sx *= 1.16; o.sy *= 0.9; o.giro -= 0.1; o.dx += 3;
  } else if (pose === 'Defensa') { o.sx *= 1.06; o.sy *= 0.9; o.dy += 1; }
  else if (pose === 'Flotar') { o.dy -= seno(t * 0.5) * (E.flota || 1.5); } // el reposo de los que vuelan
  if (m.dano > 0) { const k = m.dano / 0.22; o.giro += 0.22 * k; o.sx *= 1 - 0.1 * k; o.sy *= 1 + 0.08 * k; o.dx += (Math.random() - 0.5) * 2 * k - 2 * k; }
  if (m.aterriza > 0) { const k = m.aterriza / 0.16; o.sy *= 1 - 0.18 * k; o.sx *= 1 + 0.14 * k; }
  if (m.giroT > 0) o.sx *= Math.max(0.15, Math.abs(Math.cos((Math.PI * m.giroT) / 0.14))); // 1 → 0,15 → 1
  return o;
}
