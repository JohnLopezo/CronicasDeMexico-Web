'use strict';
// Animales de Veracruz y Tabasco (solo en la versión HTML; ver PORTAR_A_UNITY.md). Las figuras y sus animaciones las dibuja
// herramientas/animales.mjs y las registra datos/animales.js.

// Cuadro de una animación a los t segundos: en bucle o, con sostener, quieto en el último.
function cuadroAnimal(animal, anim, t, sostener = false) {
  const a = ANIMALES[animal][anim], k = Math.floor(t * a.fps);
  return `${animal}_${anim}_${1 + (sostener ? Math.min(a.cuadros - 1, k) : k % a.cuadros)}`;
}

// ---------- Nauyaca real (Bothrops asper): sub-jefe del 1-5 ----------
// Acecha reptando y, a distancia de golpe, se enrosca y lanza la mordida en línea recta (franja avisada). Desde cerca
// muerde más rápido. Su veneno entumece: frena al jugador. Con la mitad de la vida avisa menos y muerde dos veces.
// Tras morder queda expuesta. Débil a la Tierra y a la Luz.
const NAUYACA = { vida: 380, r: 0.5, vel: 1.9, alcance: 2.9, corto: 1.7, despierta: 6.5, espera: [1.1, 1.8],
  largo: { aviso: 0.8, franja: 2.9, ancho: 0.9 }, rapido: { aviso: 0.45, franja: 1.8, ancho: 0.8 }, golpe: 0.32, expuesta: 0.9,
  dano: 14, veneno: { slowSeconds: 2.5, slowFactor: 0.55 }, embestida: 0.7, nombre: 'Nauyaca Real' };
function nuevaNauyaca(x, y, alMorir) {
  return { tipo: 'nauyaca', jefe: true, nombre: NAUYACA.nombre, x, y, z: 0, vida: NAUYACA.vida, max: NAUYACA.vida, r: NAUYACA.r,
    fx: 1, fy: 0, kx: 0, ky: 0, estado: 'reposo', t: 0, anim: 'Reposo', ta: 0, destello: 0, muriendo: 0, cdEsquiva: 0,
    ruptura: { escudo: 4, seg: 3, debil: ['Tierra', 'Luz'], nombre: NAUYACA.nombre },
    alHerir(e) { if (e.estado === 'acecho' || e.estado === 'recupera') { e.dano = 0.2; } },
    alMorir(e) { e.muriendo = 1.4; e.anim = 'Muerte'; e.ta = 0; quitarAvisosDe(e); alMorir?.(e); },
    actualizar: actualizarNauyaca, dibujar: dibujarNauyaca };
}
const quitarAvisosDe = (e) => { juego.marcas = juego.marcas.filter((m) => m.dueno !== e); };
function ponerAnim(e, anim) { if (e.anim !== anim) { e.anim = anim; e.ta = 0; } }

function actualizarNauyaca(e, dt) {
  const j = juego.jugador, N = NAUYACA, d = dist(e, j);
  e.destello = Math.max(0, e.destello - dt); e.dano = Math.max(0, (e.dano || 0) - dt); e.ta += dt; e.t -= dt;
  mover(e, e.kx * dt, e.ky * dt, 0.5); e.kx *= 0.85; e.ky *= 0.85;
  const furia = e.vida <= e.max / 2;
  if (e.estado === 'reposo') {
    ponerAnim(e, 'Reposo');
    if (d < N.despierta && j.vida > 0) { e.estado = 'acecho'; e.t = 0.8; juego.jefe = e; sonar('aviso'); }
    return;
  }
  if (j.vida <= 0) { ponerAnim(e, 'Reposo'); return; }
  if (e.estado === 'acecho') {
    const l = d || 1;
    e.fx = (j.x - e.x) / l; e.fy = (j.y - e.y) / l;
    const lejos = d > N.alcance - 0.3;
    if (lejos) mover(e, e.fx * N.vel * dt, e.fy * N.vel * dt, 0.5);
    ponerAnim(e, e.dano > 0 ? 'Dano' : lejos ? 'Reptar' : 'Reposo');
    if (e.t <= 0 && d <= N.alcance) morder(e, d <= N.corto ? N.rapido : N.largo, furia);
    return;
  }
  if (e.estado === 'aviso') { ponerAnim(e, 'Aviso'); if (e.t <= 0) { e.estado = 'golpe'; e.t = N.golpe; ponerAnim(e, 'Golpe'); sonar('tajo'); e.kx += e.ax * N.embestida * 8; e.ky += e.ay * N.embestida * 8; } return; }
  if (e.estado === 'golpe') {
    if (e.t <= 0) {
      if (e.otra) { e.otra = false; morder(e, NAUYACA.rapido, false, true); return; } // en furia, la segunda mordida
      e.estado = 'recupera'; e.t = N.expuesta; ponerAnim(e, 'Reposo');
    }
    return;
  }
  if (e.estado === 'recupera') { ponerAnim(e, e.dano > 0 ? 'Dano' : 'Reposo'); if (e.t <= 0) { e.estado = 'acecho'; e.t = N.espera[0] + Math.random() * (N.espera[1] - N.espera[0]); } }
}
// Se enrosca mirando al jugador y avisa la franja de la mordida; al acabar el aviso, muerde a quien siga dentro.
function morder(e, G, furia, segunda = false) {
  const j = juego.jugador, l = dist(e, j) || 1, aviso = G.aviso * (furia || segunda ? 0.75 : 1);
  e.ax = (j.x - e.x) / l; e.ay = (j.y - e.y) / l; e.fx = e.ax; e.fy = e.ay;
  e.estado = 'aviso'; e.t = aviso; e.otra = furia && !segunda;
  marca('franja', e.x, e.y, G.ancho, aviso + NAUYACA.golpe * 0.5, (m) => {
    if (e.vida > 0 && enMarca(m, j) && herirJugador(NAUYACA.dano, e, 1)) { frenarJugador(NAUYACA.veneno); toast('El veneno de la nauyaca te entumece'); }
  }, { dx: e.ax, dy: e.ay, largo: G.franja, dueno: e });
}

function dibujarNauyaca(e) {
  const muerta = e.vida <= 0;
  const n = muerta ? cuadroAnimal('Nauyaca', 'Muerte', 1.4 - e.muriendo, true) : cuadroAnimal('Nauyaca', e.anim, e.ta, e.anim === 'Aviso' || e.anim === 'Golpe');
  // Sombra alargada: bajo el rollo y bajo el cuello.
  elipse(e.x, e.y, 0.43, '#0005'); elipse(e.x + (e.fx < 0 ? -0.6 : 0.6), e.y, 0.3, '#0004');
  const filtro = e.destello > 0 ? 'brightness(2.4)' : e.roto > 0 ? ROTO_FILTRO : null;
  dibujar(n, e.x, e.y, e.z || 0, { espejo: e.fx < 0, filtro, alfa: muerta ? Math.min(1, e.muriendo / 0.5) : null });
}

// ---------- Pecarí de collar (Dicotyles tajacu): enemigo común en manada ----------
// Hoza tranquilo hasta que te ve; entonces eriza la cresta y castañetea los dientes (aviso), y avisa a los de su manada.
// Ronda al trote y embiste en línea recta (franja avisada); si choca con un muro queda aturdido. De cerca, muerde.
const PECARI = { vida: 26, r: 0.27, vel: 2.6, ve: 6.5, ve_largo: 4, ve_aviso: 0.55, dano: 9, mordida: 6, alerta: 5, manada: 6,
  distancia: [2.2, 3.6], espera: [1.2, 2.2], aturdido: 0.8, nombre: 'Pecarí de collar' };
function nuevoPecari(x, y) {
  return { tipo: 'pecari', nombre: PECARI.nombre, x, y, z: 0, vz: 0, gravedad: true, vida: vidaComun(PECARI.vida), max: vidaComun(PECARI.vida), r: PECARI.r,
    fx: 1, fy: 0, kx: 0, ky: 0, estado: 'reposo', t: 0, anim: 'Reposo', ta: Math.random(), destello: 0, muriendo: 0, cdEsquiva: 0, invul: 0,
    ruptura: { escudo: 2, seg: 2.5, debil: ['Luz'], nombre: PECARI.nombre }, esquivar: esquivarSaltando,
    alHerir(e) { e.dano = 0.2; alertarManada(e); if (e.estado === 'reposo') { e.estado = 'acecho'; e.t = 0.6; } },
    alMorir(e) { e.muriendo = 0.9; quitarAvisosDe(e); },
    actualizar: actualizarPecari, dibujar: dibujarPecari };
}
function alertarManada(e) {
  for (const o of juego.enemigos) if (o.tipo === 'pecari' && o !== e && o.vida > 0 && o.estado === 'reposo' && dist(o, e) < PECARI.manada) { o.estado = 'aviso'; o.t = 0.4 + Math.random() * 0.4; }
}
function actualizarPecari(e, dt) {
  const j = juego.jugador, P = PECARI, d = dist(e, j), l = d || 1;
  for (const k of ['destello', 'dano', 'invul', 'cdEsquiva', 'aturdido']) e[k] = Math.max(0, (e[k] || 0) - dt);
  e.ta += dt; e.t -= dt;
  mover(e, e.kx * dt, e.ky * dt, e.r); e.kx *= 0.85; e.ky *= 0.85;
  if (e.z > (e.suelo ?? 0) || e.vz > 0) { e.vz -= 20 * dt; e.z = Math.max(e.suelo ?? 0, e.z + e.vz * dt); } // el brinco de la esquiva
  if (e.aturdido > 0) { ponerAnim(e, 'Dano'); return; }
  if (e.estado === 'reposo') {
    ponerAnim(e, 'Reposo');
    if (d < P.alerta && j.vida > 0) { e.estado = 'aviso'; e.t = 0.7; alertarManada(e); }
    return;
  }
  if (e.estado === 'aviso') { // eriza la cresta y castañetea
    e.fx = (j.x - e.x) / l; e.fy = (j.y - e.y) / l; ponerAnim(e, 'Aviso');
    if (e.ta < dt) sonar('aviso');
    if (e.t <= 0) { e.estado = 'acecho'; e.t = 0.3 + Math.random() * 0.8; }
    return;
  }
  if (j.vida <= 0) { e.estado = 'reposo'; return; }
  if (e.estado === 'acecho') {
    e.fx = (j.x - e.x) / l; e.fy = (j.y - e.y) / l;
    // Ronda a media distancia: se acerca si está lejos, se aparta si está encima, y si no gira alrededor.
    const [a, b] = P.distancia, sentido = (e.x * 7 + e.y * 3) % 2 < 1 ? 1 : -1;
    let vx = 0, vy = 0;
    if (d > b) { vx = e.fx; vy = e.fy; } else if (d < a - 0.8) { vx = -e.fx; vy = -e.fy; } else { vx = -e.fy * sentido * 0.6; vy = e.fx * sentido * 0.6; }
    if (vx || vy) mover(e, vx * P.vel * dt, vy * P.vel * dt, e.r);
    ponerAnim(e, e.dano > 0 ? 'Dano' : vx || vy ? 'Trote' : 'Reposo');
    if (e.t <= 0) {
      if (d < 1.3) { e.estado = 'mordida'; e.t = 0.42; ponerAnim(e, 'Ataque'); e.mordio = false; }
      else if (d < P.ve_largo + 1) embestir(e);
      else e.t = 0.3;
    }
    return;
  }
  if (e.estado === 'avisaCarga') { ponerAnim(e, 'Aviso'); if (e.t <= 0) { e.estado = 'carga'; e.recorrido = 0; e.acerto = false; sonar('esquiva'); } return; }
  if (e.estado === 'carga') {
    ponerAnim(e, 'Carga');
    const paso = P.ve * dt, x0 = e.x, y0 = e.y;
    mover(e, e.ax * paso, e.ay * paso, e.r); e.recorrido += paso;
    if (!e.acerto && dist(e, j) < e.r + 0.45) e.acerto = herirJugador(P.dano, e, 1.2);
    if (Math.hypot(e.x - x0, e.y - y0) < paso * 0.4) { e.aturdido = P.aturdido; vista.temblor = Math.max(vista.temblor, 0.08); sonar('impacto'); fin(e); } // contra un muro
    else if (e.recorrido >= P.ve_largo) fin(e);
    return;
  }
  if (e.estado === 'mordida') {
    if (!e.mordio && e.t < 0.22) { e.mordio = true; if (dist({ x: e.x + e.fx * 0.6, y: e.y + e.fy * 0.6 }, j) < 0.75) herirJugador(P.mordida, e, 0.6); sonar('tajo'); }
    if (e.t <= 0) fin(e);
  }
}
function fin(e) { e.estado = 'acecho'; e.t = PECARI.espera[0] + Math.random() * (PECARI.espera[1] - PECARI.espera[0]); quitarAvisosDe(e); }
function embestir(e) {
  const j = juego.jugador, l = dist(e, j) || 1;
  e.ax = (j.x - e.x) / l; e.ay = (j.y - e.y) / l; e.fx = e.ax; e.fy = e.ay;
  e.estado = 'avisaCarga'; e.t = PECARI.ve_aviso;
  marca('franja', e.x, e.y, 0.8, PECARI.ve_aviso, null, { dx: e.ax, dy: e.ay, largo: PECARI.ve_largo, dueno: e });
}
function dibujarPecari(e) {
  const muerto = e.vida <= 0;
  if (muerto && e.muriendo <= 0) return;
  const n = muerto ? cuadroAnimal('Pecari', 'Muerte', 0.9 - e.muriendo, true) : cuadroAnimal('Pecari', e.anim, e.ta, e.anim === 'Ataque');
  elipse(e.x, e.y, 0.31, '#0006', null, e.suelo ?? 0);
  const filtro = e.destello > 0 ? 'brightness(2.4)' : e.roto > 0 ? ROTO_FILTRO : null;
  dibujar(n, e.x, e.y, e.z || 0, { espejo: e.fx < 0, filtro, alfa: muerto ? Math.min(1, e.muriendo / 0.4) : null });
  if (!muerto && e.vida < e.max) barraMini(e, 0.8);
}

// ---------- Tapir centroamericano (Tapirus bairdii): enemigo élite pesado ----------
// Tranquilo hasta que lo molestas: entonces silba con la trompa en alto. Es pesado: tus golpes no lo empujan y su cuerpo
// te aparta. Embiste en línea (franja ancha) y, si estás cerca, se encabrita y cae con un pisotón en círculo.
const TAPIR = { vida: 90, r: 0.55, vel: 1.5, alerta: 5, carga: { vel: 6, largo: 4.5, ancho: 1.4, aviso: 0.8, dano: 14, empuje: 2.4 },
  pisoton: { radio: 2.1, aviso: 0.75, dano: 10, empuje: 2, cerca: 2.3 }, expuesto: 1.0, espera: [1.4, 2.4], aturdido: 1.2,
  nombre: 'Tapir' };
function nuevoTapir(x, y) {
  return { tipo: 'tapir', nombre: TAPIR.nombre, pesado: true, x, y, z: 0, vida: vidaComun(TAPIR.vida), max: vidaComun(TAPIR.vida), r: TAPIR.r,
    fx: 1, fy: 0, kx: 0, ky: 0, estado: 'reposo', t: 0, anim: 'Reposo', ta: Math.random(), destello: 0, muriendo: 0,
    ruptura: { escudo: 5, seg: 3, debil: ['Tierra'], nombre: TAPIR.nombre },
    alHerir(e) { if (e.estado === 'reposo') { e.estado = 'aviso'; e.t = 0.8; } else if (e.estado === 'acecho') e.dano = 0.2; },
    alMorir(e) { e.muriendo = 1.2; quitarAvisosDe(e); },
    actualizar: actualizarTapir, dibujar: dibujarTapir };
}
function actualizarTapir(e, dt) {
  const j = juego.jugador, T = TAPIR, d = dist(e, j), l = d || 1;
  for (const k of ['destello', 'dano', 'aturdido']) e[k] = Math.max(0, (e[k] || 0) - dt);
  e.ta += dt; e.t -= dt;
  // Cuerpo sólido: aparta al jugador (como los habitantes), salvo mientras esquiva.
  const min = e.r + 0.25;
  if (d < min && d > 0.001 && j.esq <= 0) mover(j, ((j.x - e.x) / d) * (min - d), ((j.y - e.y) / d) * (min - d));
  if (e.aturdido > 0) { ponerAnim(e, 'Dano'); return; }
  if (e.estado === 'reposo') { ponerAnim(e, 'Reposo'); if (d < T.alerta && j.vida > 0) { e.estado = 'aviso'; e.t = 0.8; } return; }
  if (e.estado === 'aviso') { e.fx = (j.x - e.x) / l; e.fy = (j.y - e.y) / l; ponerAnim(e, 'Aviso'); if (e.ta < dt) sonar('aviso'); if (e.t <= 0) { e.estado = 'acecho'; e.t = 0.6; } return; }
  if (j.vida <= 0) { ponerAnim(e, 'Reposo'); return; }
  if (e.estado === 'acecho') {
    e.fx = (j.x - e.x) / l; e.fy = (j.y - e.y) / l;
    const anda = d > T.pisoton.cerca - 0.4;
    if (anda) mover(e, e.fx * T.vel * dt, e.fy * T.vel * dt, e.r);
    ponerAnim(e, e.dano > 0 ? 'Dano' : anda ? 'Paso' : 'Reposo');
    if (e.t <= 0) d < T.pisoton.cerca ? pisotear(e) : d < T.carga.largo + 1 ? cargarTapir(e) : (e.t = 0.3);
    return;
  }
  if (e.estado === 'avisaCarga') { ponerAnim(e, 'Aviso'); if (e.t <= 0) { e.estado = 'carga'; e.recorrido = 0; e.acerto = false; sonar('rugido'); } return; }
  if (e.estado === 'carga') {
    ponerAnim(e, 'Carga');
    const paso = T.carga.vel * dt, x0 = e.x, y0 = e.y;
    mover(e, e.ax * paso, e.ay * paso, e.r); e.recorrido += paso;
    if (!e.acerto && dist(e, j) < e.r + 0.4) e.acerto = herirJugador(T.carga.dano, e, T.carga.empuje);
    if (Math.hypot(e.x - x0, e.y - y0) < paso * 0.4) { e.aturdido = T.aturdido; vista.temblor = Math.max(vista.temblor, 0.2); sonar('impacto'); finTapir(e); }
    else if (e.recorrido >= T.carga.largo) finTapir(e, T.expuesto);
    return;
  }
  if (e.estado === 'pisoton') { ponerAnim(e, 'Pisoton'); if (e.t <= 0) finTapir(e, T.expuesto); return; }
  if (e.estado === 'expuesto') { ponerAnim(e, e.dano > 0 ? 'Dano' : 'Reposo'); if (e.t <= 0) finTapir(e); }
}
function finTapir(e, expuesto = 0) {
  quitarAvisosDe(e);
  if (expuesto) { e.estado = 'expuesto'; e.t = expuesto; return; }
  e.estado = 'acecho'; e.t = TAPIR.espera[0] + Math.random() * (TAPIR.espera[1] - TAPIR.espera[0]);
}
function cargarTapir(e) {
  const j = juego.jugador, l = dist(e, j) || 1, C = TAPIR.carga;
  e.ax = (j.x - e.x) / l; e.ay = (j.y - e.y) / l; e.fx = e.ax; e.fy = e.ay; e.estado = 'avisaCarga'; e.t = C.aviso;
  marca('franja', e.x, e.y, C.ancho, C.aviso, null, { dx: e.ax, dy: e.ay, largo: C.largo, dueno: e });
}
// Se encabrita (la animación sube la delantera en su primera mitad) y cae: el círculo se resuelve al caer.
function pisotear(e) {
  const P = TAPIR.pisoton, cx = e.x + e.fx * 0.9, cy = e.y + e.fy * 0.9;
  e.estado = 'pisoton'; e.t = P.aviso + 0.35; ponerAnim(e, 'Pisoton');
  marca('circulo', cx, cy, P.radio, P.aviso, (m) => { if (enMarca(m, juego.jugador)) herirJugador(P.dano, { x: cx, y: cy }, P.empuje); vista.temblor = Math.max(vista.temblor, 0.25); sonar('impacto'); }, { dueno: e });
}
function dibujarTapir(e) {
  const muerto = e.vida <= 0;
  if (muerto && e.muriendo <= 0) return;
  // El pisotón: 6 cuadros a lo largo del aviso y la caída.
  const n = muerto ? cuadroAnimal('Tapir', 'Muerte', 1.2 - e.muriendo, true)
    : e.anim === 'Pisoton' ? `Tapir_Pisoton_${1 + Math.min(5, Math.floor((e.ta / (TAPIR.pisoton.aviso + 0.2)) * 6))}` : cuadroAnimal('Tapir', e.anim, e.ta);
  elipse(e.x, e.y, 0.62, '#0006', null, e.suelo ?? 0);
  const filtro = e.destello > 0 ? 'brightness(2.2)' : e.roto > 0 ? ROTO_FILTRO : null;
  dibujar(n, e.x, e.y, e.z || 0, { espejo: e.fx < 0, filtro, alfa: muerto ? Math.min(1, e.muriendo / 0.5) : null });
  if (!muerto && e.vida < e.max) barraMini(e, 1.4);
}

// ---------- Ocelote (Leopardus pardalis): enemigo ágil ----------
// Te acecha agazapado a media distancia; bufa (aviso) y se abalanza sobre donde estabas en un arco (círculo avisado). Si
// cae cerca de ti, encadena dos zarpazos rápidos y luego se retira a la carrera para volver a acechar. Esquiva a menudo.
const OCELOTE = { vida: 40, r: 0.31, acecho: 1.3, carrera: 4.6, alerta: 6, distancia: 3.2, esquiva: 0.4,
  salto: { aviso: 0.5, vuelo: 0.42, alto: 0.8, radio: 0.95, dano: 11, maximo: 4.2 }, zarpazo: { dano: 6, radio: 0.7, dur: 0.28 },
  retirada: 0.8, espera: [0.9, 1.6], nombre: 'Ocelote' };
function nuevoOcelote(x, y) {
  return { tipo: 'ocelote', nombre: OCELOTE.nombre, x, y, z: 0, vz: 0, gravedad: true, vida: vidaComun(OCELOTE.vida), max: vidaComun(OCELOTE.vida), r: OCELOTE.r,
    fx: 1, fy: 0, kx: 0, ky: 0, estado: 'reposo', t: 0, anim: 'Reposo', ta: Math.random(), destello: 0, muriendo: 0, cdEsquiva: 0, invul: 0,
    probEsquiva: OCELOTE.esquiva, esquivar: esquivarSaltando, ruptura: { escudo: 3, seg: 2.5, debil: ['Luz'], nombre: OCELOTE.nombre },
    alHerir(e) { e.dano = 0.2; if (e.estado === 'reposo') { e.estado = 'aviso'; e.t = 0.4; } },
    alMorir(e) { e.muriendo = 0.9; quitarAvisosDe(e); },
    actualizar: actualizarOcelote, dibujar: dibujarOcelote };
}
function actualizarOcelote(e, dt) {
  const j = juego.jugador, O = OCELOTE, d = dist(e, j), l = d || 1;
  for (const k of ['destello', 'dano', 'invul', 'cdEsquiva', 'aturdido']) e[k] = Math.max(0, (e[k] || 0) - dt);
  e.ta += dt; e.t -= dt;
  mover(e, e.kx * dt, e.ky * dt, e.r); e.kx *= 0.85; e.ky *= 0.85;
  if (e.estado !== 'salto' && (e.z > (e.suelo ?? 0) || e.vz > 0)) { e.vz -= 20 * dt; e.z = Math.max(e.suelo ?? 0, e.z + e.vz * dt); } // brinco de la esquiva
  if (e.aturdido > 0) { ponerAnim(e, 'Dano'); return; }
  const mira = () => { e.fx = (j.x - e.x) / l; e.fy = (j.y - e.y) / l; };
  if (e.estado === 'reposo') { ponerAnim(e, 'Reposo'); if (d < O.alerta && j.vida > 0) { e.estado = 'aviso'; e.t = 0.5; } return; }
  if (j.vida <= 0) { ponerAnim(e, 'Reposo'); return; }
  if (e.estado === 'aviso') { mira(); ponerAnim(e, 'Aviso'); if (e.ta < dt) sonar('aviso'); if (e.t <= 0) { e.estado = 'acecho'; e.t = 0.6; } return; }
  if (e.estado === 'acecho') {
    mira();
    // Agazapado: se acerca hasta su distancia y la mantiene rodeándote despacio.
    const giro = (e.x * 5 + e.y) % 2 < 1 ? 1 : -1;
    const vx = d > O.distancia + 0.4 ? e.fx : d < O.distancia - 0.8 ? -e.fx : -e.fy * giro * 0.7, vy = d > O.distancia + 0.4 ? e.fy : d < O.distancia - 0.8 ? -e.fy : e.fx * giro * 0.7;
    mover(e, vx * O.acecho * dt, vy * O.acecho * dt, e.r);
    ponerAnim(e, e.dano > 0 ? 'Dano' : 'Acecho');
    if (e.t <= 0 && d < O.salto.maximo + 0.5) abalanzarse(e);
    return;
  }
  if (e.estado === 'avisaSalto') { ponerAnim(e, 'Aviso'); if (e.t <= 0) { e.estado = 'salto'; e.t = O.salto.vuelo; e.desde = { x: e.x, y: e.y }; ponerAnim(e, 'Salto'); sonar('esquiva'); } return; }
  if (e.estado === 'salto') {
    const p = 1 - Math.max(0, e.t) / O.salto.vuelo, nx = e.desde.x + (e.hacia.x - e.desde.x) * p, ny = e.desde.y + (e.hacia.y - e.desde.y) * p;
    if (!bloqueado(nx, ny, e.r)) { e.x = nx; e.y = ny; }
    e.z = (e.suelo ?? 0) + Math.sin(Math.PI * p) * O.salto.alto;
    if (e.t <= 0) { e.z = e.suelo ?? 0; e.vz = 0; if (dist(e, j) < 1.4) { e.estado = 'zarpazo'; e.golpes = 2; e.t = O.zarpazo.dur; ponerAnim(e, 'Zarpazo'); zarpazo(e); } else retirarse(e); }
    return;
  }
  if (e.estado === 'zarpazo') {
    if (e.t <= 0) { if (--e.golpes > 0) { e.t = O.zarpazo.dur; e.ta = 0; mira(); zarpazo(e); } else retirarse(e); }
    return;
  }
  if (e.estado === 'retirada') {
    mover(e, -e.fx * O.carrera * dt, -e.fy * O.carrera * dt, e.r); ponerAnim(e, 'Correr');
    if (e.t <= 0) { mira(); e.estado = 'acecho'; e.t = O.espera[0] + Math.random() * (O.espera[1] - O.espera[0]); }
  }
}
// Bufa agazapado y marca donde estás; luego salta allí en arco (como mucho 4,2 m).
function abalanzarse(e) {
  const j = juego.jugador, S = OCELOTE.salto, l = dist(e, j) || 1, k = Math.min(1, S.maximo / l);
  e.fx = (j.x - e.x) / l; e.fy = (j.y - e.y) / l;
  e.hacia = { x: e.x + (j.x - e.x) * k, y: e.y + (j.y - e.y) * k }; e.estado = 'avisaSalto'; e.t = S.aviso;
  marca('circulo', e.hacia.x, e.hacia.y, S.radio, S.aviso + S.vuelo, (m) => { if (e.vida > 0 && enMarca(m, j)) herirJugador(S.dano, e, 1.1); }, { dueno: e });
}
function zarpazo(e) {
  const Z = OCELOTE.zarpazo, cx = e.x + e.fx * 0.7, cy = e.y + e.fy * 0.7;
  sonar('tajo');
  if (dist({ x: cx, y: cy }, juego.jugador) < Z.radio + 0.25) herirJugador(Z.dano, e, 0.5);
  juego.efectos.push({ tipo: 'tajo', x: cx, y: cy, t: 0.12, remate: false });
}
function retirarse(e) {
  const j = juego.jugador, l = dist(e, j) || 1;
  e.fx = (j.x - e.x) / l; e.fy = (j.y - e.y) / l; e.estado = 'retirada'; e.t = OCELOTE.retirada;
}
function dibujarOcelote(e) {
  const muerto = e.vida <= 0;
  if (muerto && e.muriendo <= 0) return;
  // Al retirarse corre hacia atrás: mira hacia donde corre.
  const espejo = e.estado === 'retirada' ? e.fx > 0 : e.fx < 0;
  const n = muerto ? cuadroAnimal('Ocelote', 'Muerte', 0.9 - e.muriendo, true)
    : e.anim === 'Salto' ? `Ocelote_Salto_${1 + Math.min(4, Math.floor((1 - Math.max(0, e.t) / OCELOTE.salto.vuelo) * 5))}` : cuadroAnimal('Ocelote', e.anim, e.ta, e.anim === 'Zarpazo');
  elipse(e.x, e.y, 0.32, '#0006', null, e.suelo ?? 0);
  const filtro = e.destello > 0 ? 'brightness(2.4)' : e.roto > 0 ? ROTO_FILTRO : null;
  dibujar(n, e.x, e.y, e.z || 0, { espejo, filtro, alfa: muerto ? Math.min(1, e.muriendo / 0.4) : null });
  if (!muerto && e.vida < e.max) barraMini(e, 0.85 + (e.z || 0));
}

// ---------- Mono aullador de manto (Alouatta palliata mexicana): enemigo a distancia, en pareja ----------
// Se queda lejos y sentado; te lanza frutos en línea recta. Cada cierto tiempo toma aire y aúlla: un anillo que te aturde
// (frena mucho) y quita un poco. Si te acercas, huye a cuatro patas a otro sitio. Los de la tropa aúllan por turnos.
const AULLADOR = { vida: 30, r: 0.27, distancia: [3.8, 6], huye: 2.6, vel: 3.4, alerta: 7,
  fruto: { cada: [1.6, 2.4], aviso: 0.42, vel: 6.5, dano: 6 }, aullido: { cada: 6.5, aviso: 0.8, radio: 4, dano: 4, frena: { slowSeconds: 1.6, slowFactor: 0.3 } },
  nombre: 'Mono aullador' };
function nuevoAullador(x, y) {
  return { tipo: 'aullador', nombre: AULLADOR.nombre, x, y, z: 0, vz: 0, gravedad: true, vida: vidaComun(AULLADOR.vida), max: vidaComun(AULLADOR.vida), r: AULLADOR.r,
    fx: -1, fy: 0, kx: 0, ky: 0, estado: 'reposo', t: 0, anim: 'Reposo', ta: Math.random(), destello: 0, muriendo: 0, cdEsquiva: 0, invul: 0,
    aulla: AULLADOR.aullido.cada * (0.4 + Math.random() * 0.6), esquivar: esquivarSaltando,
    ruptura: { escudo: 2, seg: 2.5, debil: ['Tierra'], nombre: AULLADOR.nombre },
    alHerir(e) { e.dano = 0.2; if (e.estado === 'reposo') { e.estado = 'sentado'; e.t = 0.5; } },
    alMorir(e) { e.muriendo = 0.9; quitarAvisosDe(e); },
    actualizar: actualizarAullador, dibujar: dibujarAullador };
}
function actualizarAullador(e, dt) {
  const j = juego.jugador, A = AULLADOR, d = dist(e, j), l = d || 1;
  for (const k of ['destello', 'dano', 'invul', 'cdEsquiva', 'aturdido']) e[k] = Math.max(0, (e[k] || 0) - dt);
  e.ta += dt; e.t -= dt; e.aulla -= dt;
  mover(e, e.kx * dt, e.ky * dt, e.r); e.kx *= 0.85; e.ky *= 0.85;
  if (e.z > (e.suelo ?? 0) || e.vz > 0) { e.vz -= 20 * dt; e.z = Math.max(e.suelo ?? 0, e.z + e.vz * dt); }
  if (e.aturdido > 0) { ponerAnim(e, 'Dano'); return; }
  const mira = () => { e.fx = (j.x - e.x) / l; e.fy = (j.y - e.y) / l; };
  if (e.estado === 'reposo') { ponerAnim(e, 'Reposo'); if (d < A.alerta && j.vida > 0) { e.estado = 'sentado'; e.t = 0.8; } return; }
  if (j.vida <= 0) { ponerAnim(e, 'Reposo'); return; }
  if (e.estado === 'sentado') {
    mira(); ponerAnim(e, e.dano > 0 ? 'Dano' : 'Reposo');
    if (d < A.huye) return huirAullador(e);
    if (d > A.distancia[1] + 1) { e.estado = 'acerca'; return; }
    if (e.aulla <= 0 && d < A.aullido.radio + 1 && !juego.enemigos.some((o) => o !== e && o.tipo === 'aullador' && o.estado === 'avisaAullido')) {
      e.estado = 'avisaAullido'; e.t = A.aullido.aviso; ponerAnim(e, 'Aviso');
      marca('anillo', e.x, e.y, A.aullido.radio, A.aullido.aviso, (m) => {
        if (e.vida <= 0) return;
        sonar('rugido'); vista.temblor = Math.max(vista.temblor, 0.12);
        if (dist(e, j) <= A.aullido.radio + 0.2 && herirJugador(A.aullido.dano, e, 0.3)) { frenarJugador(A.aullido.frena); toast('El aullido te aturde'); }
      }, { dueno: e });
      return;
    }
    if (e.t <= 0) { e.estado = 'lanza'; e.t = A.fruto.aviso; e.solto = false; ponerAnim(e, 'Lanza'); }
    return;
  }
  if (e.estado === 'avisaAullido') { if (e.t <= 0) { e.estado = 'aullando'; e.t = 0.6; ponerAnim(e, 'Aullido'); e.aulla = A.aullido.cada; } return; }
  if (e.estado === 'aullando') { if (e.t <= 0) { e.estado = 'sentado'; e.t = 0.6; } return; }
  if (e.estado === 'lanza') {
    mira();
    if (!e.solto && e.t < A.fruto.aviso * 0.35) {
      e.solto = true; sonar('disparo');
      juego.disparos.push({ x: e.x + e.fx * 0.3, y: e.y + e.fy * 0.3, vx: e.fx * A.fruto.vel, vy: e.fy * A.fruto.vel, t: 2, golpe: A.fruto.dano, color: '#d9892c', z: 0.7 });
    }
    if (e.t <= 0) { e.estado = 'sentado'; e.t = A.fruto.cada[0] + Math.random() * (A.fruto.cada[1] - A.fruto.cada[0]); }
    return;
  }
  if (e.estado === 'huye' || e.estado === 'acerca') {
    // Corre a cuatro patas hacia su punto (lejos de ti, o a su distancia si estás lejos).
    const m = e.meta || { x: j.x + (e.x - j.x) / l * A.distancia[0], y: j.y + (e.y - j.y) / l * A.distancia[0] }, dm = dist(e, m) || 1;
    e.fx = (m.x - e.x) / dm; e.fy = (m.y - e.y) / dm;
    const x0 = e.x, y0 = e.y; mover(e, e.fx * A.vel * dt, e.fy * A.vel * dt, e.r);
    ponerAnim(e, 'Corre');
    const atascado = Math.hypot(e.x - x0, e.y - y0) < A.vel * dt * 0.3;
    if (dm < 0.4 || e.t <= 0 || atascado || (e.estado === 'acerca' && d < A.distancia[1])) { e.meta = null; e.estado = 'sentado'; e.t = 0.5; }
  }
}
// Huye a un punto a su distancia, del lado contrario al jugador (o de lado si atrás hay muro).
function huirAullador(e) {
  const j = juego.jugador, l = dist(e, j) || 1, ux = (e.x - j.x) / l, uy = (e.y - j.y) / l, D = AULLADOR.distancia[0] + 0.8;
  const opciones = [[ux, uy], [-uy, ux], [uy, -ux]].map(([a, b]) => ({ x: j.x + a * D, y: j.y + b * D })).filter((p) => !bloqueado(p.x, p.y, e.r));
  e.meta = opciones[0] || { x: e.x + ux * 2, y: e.y + uy * 2 }; e.estado = 'huye'; e.t = 1.6;
}
function dibujarAullador(e) {
  const muerto = e.vida <= 0;
  if (muerto && e.muriendo <= 0) return;
  const n = muerto ? cuadroAnimal('Aullador', 'Muerte', 0.9 - e.muriendo, true)
    : e.anim === 'Lanza' ? `Aullador_Lanza_${1 + Math.min(4, Math.floor((1 - Math.max(0, e.t) / AULLADOR.fruto.aviso) * 5))}`
    : cuadroAnimal('Aullador', e.anim, e.ta, e.anim === 'Aviso');
  elipse(e.x, e.y, 0.27, '#0006', null, e.suelo ?? 0);
  const filtro = e.destello > 0 ? 'brightness(2.6)' : e.roto > 0 ? ROTO_FILTRO : null;
  dibujar(n, e.x, e.y, e.z || 0, { espejo: e.fx < 0, filtro, alfa: muerto ? Math.min(1, e.muriendo / 0.4) : null });
  if (!muerto && e.vida < e.max) barraMini(e, 1.0);
}

// ---------- Armadillo de nueve bandas (Dasypus novemcinctus): enemigo que excava ----------
// Olfatea; al verte se alza sobre las patas de atrás. Ronda cerca y, cada cierto tiempo, escarba, se mete bajo tierra
// (no se le puede golpear) y avanza por debajo hacia ti: un círculo de tierra removida avisa dónde va a salir, y al salir
// golpea. Si te le echas encima, se sobresalta y da un salto vertical (como el animal real). Al recibir golpes a veces se
// encoge bajo la coraza: mientras dura, los golpes casi no le hacen daño (salvo la Tierra, que lo saca).
const ARMADILLO = { vida: 34, r: 0.22, vel: 2.2, alerta: 5, distancia: [1.8, 3.2],
  excava: { cada: [2.4, 3.6], escarba: 0.55, bajo: [0.9, 1.3], vel: 4.2, aviso: 0.55, radio: 0.95, dano: 9 },
  salto: { cerca: 1.1, alto: 0.9, dur: 0.5, espera: 3, dano: 5 }, encoge: { prob: 0.45, dur: 1.3, factor: 0.25, espera: 3 },
  nombre: 'Armadillo' };
function nuevoArmadillo(x, y) {
  return { tipo: 'armadillo', nombre: ARMADILLO.nombre, x, y, z: 0, vida: vidaComun(ARMADILLO.vida), max: vidaComun(ARMADILLO.vida), r: ARMADILLO.r,
    fx: 1, fy: 0, kx: 0, ky: 0, estado: 'reposo', t: 0, anim: 'Reposo', ta: Math.random(), destello: 0, muriendo: 0, factor: 1, coraza: true,
    cdSalto: 0, cdEncoge: 0, invul: 0, ruptura: { escudo: 3, seg: 2.5, debil: ['Tierra'], nombre: ARMADILLO.nombre },
    alHerir(e) {
      e.dano = 0.2;
      if (e.estado === 'reposo') { e.estado = 'aviso'; e.t = 0.5; return; }
      if (['acecho', 'expuesto'].includes(e.estado) && e.cdEncoge <= 0 && Math.random() < ARMADILLO.encoge.prob) {
        e.estado = 'encogido'; e.t = ARMADILLO.encoge.dur; e.factor = ARMADILLO.encoge.factor; e.cdEncoge = ARMADILLO.encoge.espera; ponerAnim(e, 'Encoge');
      }
    },
    alMorir(e) { e.muriendo = 1; e.golpeable = true; e.oculto = false; e.factor = 1; quitarAvisosDe(e); },
    actualizar: actualizarArmadillo, dibujar: dibujarArmadillo };
}
function actualizarArmadillo(e, dt) {
  const j = juego.jugador, A = ARMADILLO, d = dist(e, j), l = d || 1;
  for (const k of ['destello', 'dano', 'cdSalto', 'cdEncoge', 'invul']) e[k] = Math.max(0, (e[k] || 0) - dt);
  e.ta += dt; e.t -= dt;
  if (e.estado !== 'bajo') { mover(e, e.kx * dt, e.ky * dt, e.r); e.kx *= 0.85; e.ky *= 0.85; }
  const mira = () => { e.fx = (j.x - e.x) / l; e.fy = (j.y - e.y) / l; };
  if (e.estado === 'reposo') { ponerAnim(e, 'Reposo'); if (d < A.alerta && j.vida > 0) { e.estado = 'aviso'; e.t = 0.6; } return; }
  if (j.vida <= 0) { ponerAnim(e, 'Reposo'); return; }
  if (e.estado === 'aviso') { mira(); ponerAnim(e, 'Aviso'); if (e.t <= 0) { e.estado = 'acecho'; e.t = 1; } return; }
  if (e.estado === 'encogido') { ponerAnim(e, 'Encoge'); if (e.t <= 0 || e.roto > 0) { e.factor = 1; e.estado = 'acecho'; e.t = 0.6; } return; }
  if (e.estado === 'acecho') {
    mira();
    // Sobresalto: si te le echas encima, salta en vertical (y te golpea si caes debajo).
    if (d < A.salto.cerca && e.cdSalto <= 0) { e.estado = 'salto'; e.t = A.salto.dur; e.cdSalto = A.salto.espera; ponerAnim(e, 'Salto'); sonar('esquiva'); e.invul = A.salto.dur; return; }
    const [a, b] = A.distancia, giro = (e.x * 3 + e.y * 7) % 2 < 1 ? 1 : -1;
    const vx = d > b ? e.fx : d < a ? -e.fx : -e.fy * giro, vy = d > b ? e.fy : d < a ? -e.fy : e.fx * giro;
    mover(e, vx * A.vel * dt, vy * A.vel * dt, e.r);
    ponerAnim(e, e.dano > 0 ? 'Dano' : 'Paso');
    if (e.t <= 0) { e.estado = 'escarba'; e.t = A.excava.escarba; ponerAnim(e, 'Excava'); }
    return;
  }
  if (e.estado === 'salto') {
    const p = 1 - Math.max(0, e.t) / A.salto.dur; e.z = (e.suelo ?? 0) + Math.sin(Math.PI * p) * A.salto.alto;
    if (e.t <= 0) { e.z = e.suelo ?? 0; if (dist(e, j) < e.r + 0.3) herirJugador(A.salto.dano, e, 1); finArmadillo(e, 0.5); }
    return;
  }
  if (e.estado === 'escarba') {
    if (Math.random() < dt * 30) juego.efectos.push({ tipo: 'destello', x: e.x + e.fx * 0.3, y: e.y + e.fy * 0.3, t: 0.2 });
    if (e.t <= 0) { e.estado = 'bajo'; e.t = A.excava.bajo[0] + Math.random() * (A.excava.bajo[1] - A.excava.bajo[0]); e.golpeable = false; e.oculto = true; e.avisado = false; sonar('tierra'); }
    return;
  }
  if (e.estado === 'bajo') {
    // Bajo tierra va hacia ti; al final del recorrido avisa dónde sale (donde estés entonces) y emerge.
    if (!e.avisado) {
      mover(e, e.fx * A.excava.vel * dt, e.fy * A.excava.vel * dt, e.r); mira();
      if (e.t <= A.excava.aviso) {
        e.avisado = true; e.sale = { x: j.x, y: j.y };
        marca('circulo', j.x, j.y, A.excava.radio, A.excava.aviso, (m) => {
          if (e.vida <= 0) return;
          if (!bloqueado(m.x, m.y, e.r)) { e.x = m.x; e.y = m.y; }
          e.golpeable = true; e.oculto = false; e.estado = 'expuesto'; e.t = 0.9; ponerAnim(e, 'Aviso'); vista.temblor = Math.max(vista.temblor, 0.1); sonar('impacto');
          if (enMarca(m, juego.jugador)) herirJugador(A.excava.dano, m, 1.4);
        }, { dueno: e });
      }
    }
    return;
  }
  if (e.estado === 'expuesto') { ponerAnim(e, e.dano > 0 ? 'Dano' : e.ta > 0.5 ? 'Reposo' : 'Aviso'); if (e.t <= 0) finArmadillo(e); }
}
function finArmadillo(e, t) { e.estado = 'acecho'; e.t = t ?? ARMADILLO.excava.cada[0] + Math.random() * (ARMADILLO.excava.cada[1] - ARMADILLO.excava.cada[0]); }
function dibujarArmadillo(e) {
  const muerto = e.vida <= 0;
  if (muerto && e.muriendo <= 0) return;
  if (e.estado === 'bajo' && !muerto) { // bajo tierra: solo un rastro de tierra removida que avanza
    for (let k = 0; k < 3; k++) elipse(e.x - e.fx * k * 0.35, e.y - e.fy * k * 0.35, 0.28 - k * 0.06, `rgba(92,70,48,${0.75 - k * 0.2})`, null, e.suelo ?? 0);
    return;
  }
  const n = muerto ? cuadroAnimal('Armadillo', 'Muerte', 1 - e.muriendo, true)
    : e.anim === 'Salto' ? `Armadillo_Salto_${1 + Math.min(3, Math.floor((1 - Math.max(0, e.t) / ARMADILLO.salto.dur) * 4))}`
    : cuadroAnimal('Armadillo', e.anim, e.ta, e.anim === 'Encoge' || e.anim === 'Aviso');
  elipse(e.x, e.y, 0.23, '#0006', null, e.suelo ?? 0);
  const filtro = e.destello > 0 ? 'brightness(2.4)' : e.roto > 0 ? ROTO_FILTRO : e.estado === 'encogido' ? 'brightness(1.15)' : null;
  dibujar(n, e.x, e.y, e.z || 0, { espejo: e.fx < 0, filtro, alfa: muerto ? Math.min(1, e.muriendo / 0.4) : null });
  if (!muerto && e.vida < e.max) barraMini(e, 0.65 + (e.z || 0));
}

// ---------- Pejelagarto (Atractosteus tropicus): enemigo de la charca ----------
// Vive en una charca de las salas generadas del piso 2. Nada bajo el agua, donde no se le puede golpear (solo se ve su
// sombra), y se acerca a la orilla más cercana a ti. Si estás a su alcance, se arquea en la superficie (franja avisada) y
// se lanza fuera del agua con la boca abierta. Si cae en tierra queda varado, coleteando, y se arrastra de vuelta: es el
// momento de golpearlo. Si te metes en el agua cerca de él, muerde de lado, rápido. Respira aire: cada pocos segundos
// sube a tragarlo y se queda en la superficie, expuesto. Débil a la Luz.
const PEJE = { vida: 44, r: 0.3, nada: 1.7, alcance: 3.4, persigue: 7, aire: [5, 7.5], respira: 1.5,
  salto: { aviso: 0.6, fija: 0.25, pasa: 1.2, vuelo: 0.42, alto: 0.55, largo: 3.4, ancho: 0.8, dano: 12 },
  mordida: { cerca: 1.6, aviso: 0.38, radio: 0.85, dano: 8, dur: 0.3 }, varado: 1.6, arrastra: 1.8, sumerge: 0.55, espera: [1.3, 2.1], aguante: 2, aguanteTierra: 2,
  nombre: 'Pejelagarto' };
function nuevoPejelagarto(x, y) {
  const charca = mundo.agua.filter((c) => Math.hypot(c.x - x, c.y - y) < 4);
  return { tipo: 'pejelagarto', nombre: PEJE.nombre, x, y, z: 0, vida: vidaComun(PEJE.vida), max: vidaComun(PEJE.vida), r: PEJE.r,
    fx: 1, fy: 0, kx: 0, ky: 0, estado: 'nada', t: 1, aire: PEJE.aire[0] * Math.random(), anim: 'Nada', ta: Math.random(),
    destello: 0, muriendo: 0, invul: 0, golpeable: false, oculto: true, charca, meta: null,
    ruptura: { escudo: 3, seg: 2.5, debil: ['Luz'], nombre: PEJE.nombre },
    alHerir(e) {
      e.dano = 0.2;
      // En el agua aguanta pocos golpes: al segundo de cada asomada se sumerge de golpe (en tierra no puede huir).
      if (['respira', 'sumerge', 'mordida'].includes(e.estado) && ++e.golpes >= PEJE.aguante) {
        quitarAvisosDe(e); e.estado = 'nada'; e.golpeable = false; e.oculto = true; e.t = PEJE.espera[1]; e.meta = null;
        juego.efectos.push({ tipo: 'destello', x: e.x, y: e.y, t: 0.25 });
      }
      // En tierra aguanta dos golpes; al segundo da un coletazo desesperado y vuelve de un brinco al agua (sin que le alcancen).
      if (['varado', 'vuelve'].includes(e.estado) && ++e.golpesTierra >= PEJE.aguanteTierra) {
        const c = e.charca.reduce((a, b) => (dist(b, e) < dist(a, e) ? b : a));
        e.estado = 'salto'; e.huida = true; e.t = PEJE.salto.vuelo; e.invul = PEJE.salto.vuelo; e.desde = { x: e.x, y: e.y }; e.hacia = { x: c.x, y: c.y }; ponerAnim(e, 'Embiste'); sonar('esquiva');
      }
    },
    alMorir(e) { e.muriendo = 1.1; e.golpeable = true; e.oculto = false; quitarAvisosDe(e); },
    actualizar: actualizarPejelagarto, dibujar: dibujarPejelagarto };
}
const enTierra = (e) => !enAgua(e.x, e.y);
function asomar(e, estado, t, anim) { if (!e.golpeable) e.golpes = 0; e.estado = estado; e.t = t; e.golpeable = true; e.oculto = false; ponerAnim(e, anim); }
const sumergir = (e) => asomar(e, 'sumerge', PEJE.sumerge, 'Nada');
function actualizarPejelagarto(e, dt) {
  const j = juego.jugador, P = PEJE, d = dist(e, j), l = d || 1;
  for (const k of ['destello', 'dano', 'invul']) e[k] = Math.max(0, (e[k] || 0) - dt);
  e.ta += dt; e.t -= dt; e.aire -= dt;
  // El empujón de los golpes: en el agua no lo saca de ella; en tierra, como a cualquiera.
  const kx = e.kx * dt, ky = e.ky * dt; e.kx *= 0.85; e.ky *= 0.85;
  if (enTierra(e) || enAgua(e.x + kx, e.y + ky)) mover(e, kx, ky, e.r);
  if (e.estado === 'nada') {
    e.golpeable = false; e.oculto = true; ponerAnim(e, 'Nada');
    if (enTierra(e)) { e.estado = 'vuelve'; return; }
    // Nada hacia la orilla más cercana a ti (o, si estás lejos, a un sitio cualquiera de la charca).
    const cerca = d < P.persigue && j.vida > 0;
    if (cerca && Math.random() < dt * 2) e.meta = null; // vuelve a apuntar a donde estés
    if (!e.meta || dist(e, e.meta) < 0.3) e.meta = cerca ? e.charca.reduce((a, c) => (dist(c, j) < dist(a, j) ? c : a)) : e.charca[Math.floor(Math.random() * e.charca.length)];
    const m = e.meta, dm = dist(e, m);
    if (dm > 0.05) {
      e.fx = (m.x - e.x) / dm; e.fy = (m.y - e.y) / dm;
      const px = e.fx * Math.min(dm, P.nada * dt), py = e.fy * Math.min(dm, P.nada * dt);
      if (enAgua(e.x + px, e.y + py)) { e.x += px; e.y += py; } else e.meta = null;
    }
    if (j.vida <= 0) return;
    if (e.aire <= 0) { asomar(e, 'respira', P.respira, 'Respira'); e.aire = P.aire[0] + Math.random() * (P.aire[1] - P.aire[0]); juego.efectos.push({ tipo: 'destello', x: e.x, y: e.y, t: 0.2 }); return; }
    if (e.t > 0) return;
    if (d < P.mordida.cerca && enAgua(j.x, j.y)) morderDeLado(e);
    else if (d <= P.alcance) avisarSalto(e);
    return;
  }
  if (e.estado === 'respira' || e.estado === 'sumerge') {
    if (e.dano > 0) ponerAnim(e, 'Dano');
    if (e.t <= 0) { e.estado = 'nada'; e.t = P.espera[0] + Math.random() * (P.espera[1] - P.espera[0]); }
    return;
  }
  if (e.estado === 'aviso') {
    if (e.t > P.salto.fija) apuntarSalto(e, e.marcaSalto); // te sigue con la franja y la fija justo antes de saltar
    if (e.t <= 0) { e.estado = 'salto'; e.t = P.salto.vuelo; e.desde = { x: e.x, y: e.y }; ponerAnim(e, 'Embiste'); sonar('esquiva'); juego.efectos.push({ tipo: 'destello', x: e.x, y: e.y, t: 0.25 }); }
    return;
  }
  if (e.estado === 'salto') {
    const p = 1 - Math.max(0, e.t) / P.salto.vuelo, nx = e.desde.x + (e.hacia.x - e.desde.x) * p, ny = e.desde.y + (e.hacia.y - e.desde.y) * p;
    if (!bloqueado(nx, ny, e.r)) { e.x = nx; e.y = ny; }
    e.z = Math.sin(Math.PI * p) * P.salto.alto;
    if (e.t <= 0) {
      e.z = 0;
      if (enTierra(e)) { asomar(e, 'varado', P.varado, 'Varado'); e.golpesTierra = 0; sonar('impacto'); }
      else if (e.huida) { e.huida = false; e.estado = 'nada'; e.golpeable = false; e.oculto = true; e.t = P.espera[1]; juego.efectos.push({ tipo: 'destello', x: e.x, y: e.y, t: 0.25 }); }
      else { sumergir(e); juego.efectos.push({ tipo: 'destello', x: e.x, y: e.y, t: 0.25 }); }
    }
    return;
  }
  if (e.estado === 'mordida') { if (e.t <= 0) sumergir(e); return; }
  if (e.estado === 'varado') { // coletea en tierra: a merced del jugador
    e.z = 0.08 * Math.abs(Math.sin(e.ta * 11));
    if (e.t <= 0) { e.z = 0; e.estado = 'vuelve'; }
    return;
  }
  if (e.estado === 'vuelve') { // se arrastra a la celda de agua más cercana
    e.golpeable = true; e.oculto = false; ponerAnim(e, 'Varado');
    const c = e.charca.reduce((a, b) => (dist(b, e) < dist(a, e) ? b : a)), dc = dist(e, c) || 1, v = P.arrastra * dt;
    e.fx = (c.x - e.x) / dc; e.fy = (c.y - e.y) / dc;
    const x0 = e.x, y0 = e.y; mover(e, e.fx * v, e.fy * v, e.r);
    if (Math.hypot(e.x - x0, e.y - y0) < v * 0.2) { e.x += e.fx * v; e.y += e.fy * v; } // atascado contra algo: pasa igual
    if (!enTierra(e)) { e.estado = 'nada'; e.golpeable = false; e.oculto = true; e.t = P.espera[0]; juego.efectos.push({ tipo: 'destello', x: e.x, y: e.y, t: 0.25 }); } // se zambulle sin asomarse
  }
}
// Se arquea en la superficie y marca la franja del salto, que te sigue hasta 0,25 s antes de saltar y pasa 1,2 m más allá
// de ti (hasta 3,4 m): no basta con alejarse andando, hay que apartarse a tiempo. Al saltar, hiere a quien siga dentro.
function avisarSalto(e) {
  const j = juego.jugador, S = PEJE.salto;
  asomar(e, 'aviso', S.aviso, 'Aviso');
  e.marcaSalto = marca('franja', e.x, e.y, S.ancho, S.aviso + S.vuelo * 0.6, (m) => { if (e.vida > 0 && enMarca(m, j)) herirJugador(S.dano, e, 1.3); }, { dueno: e });
  apuntarSalto(e, e.marcaSalto);
}
function apuntarSalto(e, m) {
  const j = juego.jugador, S = PEJE.salto, l = dist(e, j) || 1, largo = Math.min(S.largo, l + S.pasa);
  e.fx = (j.x - e.x) / l; e.fy = (j.y - e.y) / l; e.hacia = { x: e.x + e.fx * largo, y: e.y + e.fy * largo };
  Object.assign(m, { dx: e.fx, dy: e.fy, largo });
}
// En el agua y de cerca: golpe de lado con la boca abierta, rápido (círculo pequeño delante).
function morderDeLado(e) {
  const j = juego.jugador, M = PEJE.mordida, l = dist(e, j) || 1;
  e.fx = (j.x - e.x) / l; e.fy = (j.y - e.y) / l;
  const cx = e.x + e.fx * 0.6, cy = e.y + e.fy * 0.6;
  asomar(e, 'mordida', M.aviso + M.dur, 'Aviso');
  marca('circulo', cx, cy, M.radio, M.aviso, (m) => {
    if (e.vida <= 0) return;
    ponerAnim(e, 'Mordida'); sonar('tajo');
    if (enMarca(m, j)) herirJugador(M.dano, e, 0.8);
  }, { dueno: e });
}
function dibujarPejelagarto(e) {
  const muerto = e.vida <= 0;
  if (muerto && e.muriendo <= 0) return;
  const n = muerto ? cuadroAnimal('Pejelagarto', 'Muerte', 1.1 - e.muriendo, true)
    : e.anim === 'Embiste' ? `Pejelagarto_Embiste_${1 + Math.min(4, Math.floor((1 - Math.max(0, e.t) / PEJE.salto.vuelo) * 5))}`
    : cuadroAnimal('Pejelagarto', e.anim, e.ta, ['Aviso', 'Respira', 'Mordida'].includes(e.anim));
  const espejo = e.fx < 0, filtro = e.destello > 0 ? 'brightness(2.4)' : e.roto > 0 ? ROTO_FILTRO : null, alfa = muerto ? Math.min(1, e.muriendo / 0.4) : null;
  if (e.oculto && !muerto) { // bajo el agua: solo su sombra y una estela
    dibujar(n, e.x, e.y, -0.12, { espejo, filtro: 'brightness(0)', alfa: 0.38 });
    if (Math.floor(e.ta * 3) % 2) elipse(e.x - e.fx * 0.5, e.y - e.fy * 0.5, 0.18, null, 'rgba(220,235,225,.35)');
    return;
  }
  if (enTierra(e) || e.z > 0.01) { elipse(e.x, e.y, 0.32, '#0006', null, e.suelo ?? 0); dibujar(n, e.x, e.y, e.z || 0, { espejo, filtro, alfa }); }
  else {
    // En la superficie: la parte de abajo, oscura bajo el agua; la de arriba, recortada en la línea del agua.
    const [, sy] = pantalla(e.x, e.y, 0);
    dibujar(n, e.x, e.y, -0.1, { espejo, filtro: 'brightness(0)', alfa: 0.3 });
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, vista.w, sy - vista.cy + 1); ctx.clip();
    dibujar(n, e.x, e.y, -0.1, { espejo, filtro, alfa });
    ctx.restore();
    elipse(e.x, e.y, 0.42 + 0.06 * Math.sin(e.ta * 6), null, 'rgba(220,235,225,.5)');
  }
  if (!muerto && e.vida < e.max) barraMini(e, 0.6 + (e.z || 0));
}
