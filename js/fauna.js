'use strict';
// Fauna hostil y vasijas rompibles. La fauna es WildEnemy.cs guiado por EnemyData (datos/recompensas.js → FAUNA):
// reposo → persecución (con su forma de moverse) → aviso → golpe → recuperación, y reacciona a los golpes con su defensa.

// aguante (solo HTML, README etapa 24): un golpe la tambalea como mucho una vez cada 2,5 s.
const FA = { aguante: 2.5, llegar: 0.2, vuelta: 0.6, acel: 14, empuje: 4, aturdido: 0.25, linea: 9, saltoAtras: 7, saltoDist: 1.2, apartarse: 6,
  reaparecerDist: 1.8, alfaFase: 0.3, vueloAlto: 2.5, zigzag: 35, zigzagFrec: 4, erratico: 50, erraticoCada: 0.45, coraza: 0.3,
  emboscada: 0.5, disparo: 7, abanico: 20, segundoZarpazo: 0.3 }; // constantes de WildEnemy
// Enums de EnemyData, en su orden.
const MOVIMIENTO = ['perseguir', 'zigzag', 'distancia', 'emboscada', 'erratico'];
const FORMA = ['circulo', 'linea', 'proyectil'];
const DEFENSA_FAUNA = ['ninguna', 'guardia', 'coraza', 'fase', 'saltoAtras', 'vueloAlto', 'apartarse'];
const ESPECIAL_FAUNA = ['ninguna', 'escupitajo', 'coletazo', 'dobleZarpazo', 'abanico', 'chillido'];

const girar = (x, y, grados) => { const a = (grados * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a); return [x * c - y * s, x * s + y * c]; };

function nuevaFauna(especie, x, y, reaparece) {
  const d = FAUNA[especie];
  return { tipo: 'fauna', especie, d, x, y, z: 0, alto: d.flies ? d.hoverHeight : 0, gravedad: !d.flies, vz: 0, casa: { x, y }, vida: vidaComun(d.maxHealth), max: vidaComun(d.maxHealth), r: d.bodyRadius,
    nombre: d.nombre, ruptura: { escudo: d.shieldPoints, seg: d.breakSeconds, debil: d.debil, nombre: d.nombre },
    mov: MOVIMIENTO[d.movement], forma: FORMA[d.attackShape], defensa: DEFENSA_FAUNA[d.defense], especial: ESPECIAL_FAUNA[d.special],
    estado: 'reposo', t: 0, vx: 0, vy: 0, fx: 0, fy: -1, ax: 0, ay: 1, kx: 0, ky: 0, aturdido: 0, invul: 0, factor: 1, destello: 0, muriendo: 0,
    cdAtaque: 0, cdDefensa: 0, cdEspecial: 0, vueloAlto: 0, erraticoT: 0, erraticoA: 0, persigue: false, zarpazos: 0, acerto: false, reaparece: reaparece ? d.respawnDelay : 0,
    alHerir: reaccionFauna, alMorir: morirFauna, esquivar: d.flies ? esquivarVolando : esquivarSaltando, cdEsquiva: 0, actualizar: actualizarFauna, dibujar: dibujarFauna };
}

const quitarAvisos = (e) => { juego.marcas = juego.marcas.filter((m) => m.dueno !== e); };
function cancelarAtaque(e) {
  if (e.estado === 'especial') e.cdEspecial = e.d.specialCooldown * 0.5;
  if (['aviso', 'golpe', 'especial'].includes(e.estado)) { quitarAvisos(e); e.estado = 'persigue'; e.cdAtaque = e.d.attackCooldown * 0.5; }
}
// Centro del círculo de ataque, delante del animal (CircleCenter).
const centro = (e, tam) => ({ x: e.x + e.ax * tam * 0.8, y: e.y + e.ay * tam * 0.8 });

function actualizarFauna(e, dt) {
  const j = juego.jugador, d = e.d;
  for (const k of ['cdAtaque', 'cdDefensa', 'vueloAlto', 'cdEspecial', 'destello', 'invul', 'cdEsquiva', 'aguante']) e[k] = (e[k] || 0) - dt;
  // Coraza frontal: el cocodrilo recibe menos de frente.
  if (e.defensa === 'coraza') { const l = dist(e, j) || 1; e.factor = ((j.x - e.x) * e.fx + (j.y - e.y) * e.fy) / l > FA.coraza ? d.defenseFactor : 1; }
  // Salto atrás (mono): si lo tienes encima, se aparta de un brinco.
  if (e.defensa === 'saltoAtras' && e.cdDefensa <= 0 && ['reposo', 'persigue', 'recupera'].includes(e.estado) && dist(e, j) <= FA.saltoDist) {
    const l = dist(e, j) || 1;
    e.vx = ((e.x - j.x) / l) * FA.saltoAtras; e.vy = ((e.y - j.y) / l) * FA.saltoAtras;
    e.aturdido = FA.aturdido; e.invul = FA.aturdido; e.cdDefensa = d.defenseCooldown; e.pose = 'Defensa'; e.poseT = 0.25;
  }
  let qx = 0, qy = 0;
  if (e.aturdido > 0) { e.aturdido -= dt; if (e.estado === 'guardia' || e.estado === 'fase') estadoFauna(e, dt); }
  else [qx, qy] = estadoFauna(e, dt);

  if (e.estado === 'golpe' && e.forma === 'linea') { e.vx = e.ax * FA.linea; e.vy = e.ay * FA.linea; }
  else { const a = FA.acel * dt; e.vx += clamp(qx - e.vx, -a, a); e.vy += clamp(qy - e.vy, -a, a); }
  if (Math.hypot(qx, qy) > 0.01) { const l = Math.hypot(qx, qy); e.fx = qx / l; e.fy = qy / l; }
  e.movido = Math.hypot(e.vx, e.vy) > 0.2;
  mover(e, (e.vx + e.kx) * dt, (e.vy + e.ky) * dt, e.r); e.kx *= 0.85; e.ky *= 0.85;
  if (!d.flies) saltoEnemigo(e, e.estado === 'persigue' && e.aturdido <= 0, dt);
  if (d.flies) { const meta = d.hoverHeight * (e.vueloAlto > 0 ? FA.vueloAlto : 1) + Math.sin(juego.t * 6) * 0.06; e.alto += (meta - e.alto) * Math.min(1, dt * 14); }
  e.poseT = Math.max(0, (e.poseT || 0) - dt);
}

function estadoFauna(e, dt) {
  const j = juego.jugador, d = e.d;
  e.t -= dt;
  if (e.estado === 'aviso') { if (e.t <= 0) golpeFauna(e); return [0, 0]; }
  if (e.estado === 'golpe') {
    if (!e.acerto && dist(e, j) <= d.attackSize) e.acerto = herirDesdeFauna(e, d.attackDamage);
    if (e.t <= 0) acabarGolpe(e);
    return [0, 0];
  }
  if (e.estado === 'recupera') { if (e.t <= 0) e.estado = 'persigue'; return [0, 0]; }
  if (e.estado === 'guardia') { if (e.t <= 0) { e.factor = 1; e.estado = 'persigue'; } return [0, 0]; }
  if (e.estado === 'fase') { if (e.t <= 0) reaparecer(e); return [0, 0]; }
  if (e.estado === 'especial') { if (e.t <= 0) ejecutarEspecial(e); return [0, 0]; }
  // Reposo o persecución: elige rumbo.
  const vel = d.moveSpeed * (d.flies || !enAgua(e.x, e.y) ? 1 : 0.55);
  if (j.vida > 0) {
    const dx = j.x - e.x, dy = j.y - e.y, l = Math.hypot(dx, dy), deteccion = e.mov === 'emboscada' ? d.detectionRadius * FA.emboscada : d.detectionRadius;
    e.persigue = l <= (e.persigue ? d.loseRadius : deteccion);
    if (e.persigue && l > 0.001) {
      const ux = dx / l, uy = dy / l;
      e.estado = 'persigue';
      if (e.cdEspecial <= 0 && cabeEspecial(e, l)) { empezarEspecial(e, ux, uy); return [0, 0]; }
      if (e.cdAtaque <= 0 && l <= d.attackRange && !muyCerca(e, l)) { empezarAviso(e, ux, uy); return [0, 0]; }
      const [sx, sy] = rumbo(e, ux, uy, l, dt);
      return [sx * vel, sy * vel];
    }
  } else e.persigue = false;
  e.estado = 'reposo';
  const hx = e.casa.x - e.x, hy = e.casa.y - e.y, hl = Math.hypot(hx, hy);
  return hl > FA.llegar ? [(hx / hl) * vel * FA.vuelta, (hy / hl) * vel * FA.vuelta] : [0, 0];
}
const muyCerca = (e, l) => e.mov === 'distancia' && l < e.d.preferredDistance - 1; // quien ataca de lejos primero se aparta
function rumbo(e, ux, uy, l, dt) {
  const d = e.d;
  if (e.mov === 'zigzag') return girar(ux, uy, Math.sin(juego.t * FA.zigzagFrec) * FA.zigzag);
  if (e.mov === 'erratico') { if ((e.erraticoT -= dt) <= 0) { e.erraticoT = FA.erraticoCada; e.erraticoA = (Math.random() * 2 - 1) * FA.erratico; } return girar(ux, uy, e.erraticoA); }
  if (e.mov === 'distancia') return l > d.preferredDistance + 0.5 ? [ux, uy] : l < d.preferredDistance - 1 ? [-ux, -uy] : [0, 0];
  return l > d.attackRange * 0.8 ? [ux, uy] : [0, 0];
}

// ---------- Ataque normal ----------
function empezarAviso(e, ux, uy, enjambre = true) {
  const d = e.d;
  if (enjambre && d.swarm) for (const o of juego.enemigos) { // los de su clase que estén cerca y libres atacan a la vez
    if (o === e || o.especie !== e.especie || o.vida <= 0 || !['reposo', 'persigue'].includes(o.estado) || o.cdAtaque > 0 || dist(o, e) > d.swarmRadius) continue;
    const j = juego.jugador, l = dist(o, j) || 1;
    o.persigue = true; empezarAviso(o, (j.x - o.x) / l, (j.y - o.y) / l, false);
  }
  e.estado = 'aviso'; e.ax = e.fx = ux; e.ay = e.fy = uy; e.t = d.attackWindup;
  if (e.forma === 'circulo') { const c = centro(e, d.attackSize); marca('circulo', c.x, c.y, d.attackSize, d.attackWindup, null, { dueno: e }); }
  if (e.forma === 'linea') marca('franja', e.x, e.y, d.attackSize, d.attackWindup, null, { dx: ux, dy: uy, largo: d.attackReach + d.attackSize * 0.5, dueno: e });
}
function herirDesdeFauna(e, golpe) {
  if (!herirJugador(golpe, e)) return false;
  if (e.d.attackDrains) e.vida = Math.min(e.max, e.vida + golpe); // el murciélago se cura con lo que muerde
  return true;
}
function golpeFauna(e) {
  const j = juego.jugador, d = e.d;
  quitarAvisos(e);
  e.estado = 'golpe'; e.acerto = false;
  if (e.forma === 'circulo') { const c = centro(e, d.attackSize); if (dist(j, c) <= d.attackSize) herirDesdeFauna(e, d.attackDamage); acabarGolpe(e); }
  else if (e.forma === 'linea') e.t = d.attackReach / FA.linea;
  else { const l = dist(e, j) || 1; lanzar(e, (j.x - e.x) / l, (j.y - e.y) / l, d.attackDamage, d.attackReach, false); acabarGolpe(e); }
}
function acabarGolpe(e) { e.vx = e.vy = 0; e.estado = 'recupera'; e.t = e.d.attackRecover; e.cdAtaque = e.d.attackCooldown; }
function lanzar(e, ux, uy, golpe, vel, frena) {
  const d = e.d, v = Math.max(0.1, vel), alcance = Math.max(d.attackRange, d.specialRange) + 2;
  juego.disparos.push({ x: e.x, y: e.y, vx: ux * v, vy: uy * v, t: alcance / v, golpe, color: frena ? '#9fd46a' : '#b8956a', z: 0.5 + e.alto,
    alAcertar: frena ? () => frenarJugador(d) : null });
  sonar('disparo');
}
// El freno dura slowSeconds (SlowTarget → ISlowable del jugador).
function frenarJugador(d) { const j = juego.jugador; j.freno = d.slowSeconds; j.frenoF = d.slowFactor; }

// ---------- Habilidad especial ----------
function cabeEspecial(e, l) {
  if (e.especial === 'ninguna' || l > e.d.specialRange) return false;
  if (e.especial === 'escupitajo') return l > e.d.attackRange; // desde lejos; pegado muerde
  if (e.especial === 'abanico') return !muyCerca(e, l);
  return true;
}
function avisoEspecial(e, seg) {
  const d = e.d;
  if (e.especial === 'coletazo' || e.especial === 'chillido') marca('circulo', e.x, e.y, d.specialRadius, seg, null, { dueno: e });
  if (e.especial === 'dobleZarpazo') { const c = centro(e, d.specialRadius); marca('circulo', c.x, c.y, d.specialRadius, seg, null, { dueno: e }); }
}
function empezarEspecial(e, ux, uy) {
  e.estado = 'especial'; e.ax = e.fx = ux; e.ay = e.fy = uy; e.t = e.d.specialWindup;
  e.zarpazos = e.especial === 'dobleZarpazo' ? 2 : 1;
  avisoEspecial(e, e.d.specialWindup);
}
function ejecutarEspecial(e) {
  const j = juego.jugador, d = e.d, l = dist(e, j) || 1, ux = (j.x - e.x) / l, uy = (j.y - e.y) / l;
  quitarAvisos(e);
  if (e.especial === 'escupitajo') lanzar(e, ux, uy, d.specialDamage, FA.disparo, true);
  if (e.especial === 'abanico') for (const a of [-FA.abanico, 0, FA.abanico]) { const [x, y] = girar(ux, uy, a); lanzar(e, x, y, d.specialDamage, Math.max(FA.disparo, d.attackReach), false); }
  if (e.especial === 'coletazo' && l <= d.specialRadius) herirJugador(d.specialDamage, e);
  if (e.especial === 'chillido' && l <= d.specialRadius && herirJugador(d.specialDamage, e)) frenarJugador(d);
  if (e.especial === 'dobleZarpazo') {
    if (dist(j, centro(e, d.specialRadius)) <= d.specialRadius) herirJugador(d.specialDamage, e);
    if (--e.zarpazos > 0) { e.ax = e.fx = ux; e.ay = e.fy = uy; e.t = FA.segundoZarpazo; avisoEspecial(e, FA.segundoZarpazo); return; } // segundo, hacia donde estés
  }
  e.estado = 'recupera'; e.t = d.attackRecover; e.cdEspecial = d.specialCooldown;
}

// ---------- Defensa al recibir un golpe (OnDamaged + React) ----------
// Esquiva de las voladoras (solo en la versión HTML): si un golpe del jugador las va a alcanzar, a veces suben de un brinco
// antes y no reciben daño. Probabilidad 35 %, con 3 s de espera entre esquivas; aturdidas o atacando, no pueden.
const ESQUIVA_VUELO = { prob: 0.35, espera: 3, seg: 0.5 };
function esquivarVolando(e) {
  if (e.cdEsquiva > 0 || e.aturdido > 0 || ['golpe', 'especial'].includes(e.estado) || Math.random() >= ESQUIVA_VUELO.prob) return false;
  e.cdEsquiva = ESQUIVA_VUELO.espera; e.vueloAlto = Math.max(e.vueloAlto, ESQUIVA_VUELO.seg); e.invul = ESQUIVA_VUELO.seg;
  numero(e.x, e.y, 'Esquiva', '#9fd4ff'); sonar('esquiva');
  return true;
}

function reaccionFauna(e) {
  const j = juego.jugador, d = e.d;
  const l = dist(e, j) || 1, px = (e.x - j.x) / l, py = (e.y - j.y) / l;
  // Aguante: un golpe lo tambalea (le interrumpe el ataque, lo aturde y lo empuja) como mucho una vez cada 2,5 s; los demás
  // golpes dañan pero no lo paran. Antes cada golpe lo dejaba bloqueado y la fauna casi nunca llegaba a atacar.
  if (!(e.aguante > 0)) {
    e.aguante = FA.aguante; cancelarAtaque(e);
    e.vx = px * FA.empuje; e.vy = py * FA.empuje; e.kx = e.ky = 0;
    e.aturdido = Math.max(e.aturdido, FA.aturdido);
  }
  e.persigue = true; // al recibir un golpe se enfada aunque estés lejos
  if (e.estado === 'guardia' || e.estado === 'fase' || e.cdDefensa > 0) return;
  if (e.defensa === 'guardia') { e.estado = 'guardia'; e.t = d.defenseSeconds; e.factor = d.defenseFactor; }
  else if (e.defensa === 'fase') { e.estado = 'fase'; e.t = d.defenseSeconds; e.invul = d.defenseSeconds; }
  else if (e.defensa === 'vueloAlto') { e.vueloAlto = d.defenseSeconds; e.invul = d.defenseSeconds; }
  else if (e.defensa === 'apartarse') { const s = Math.random() < 0.5 ? FA.apartarse : -FA.apartarse; e.vx = -py * s; e.vy = px * s; e.invul = FA.aturdido; }
  else return;
  e.cdDefensa = d.defenseCooldown;
}
function reaparecer(e) { // tras desvanecerse, a un lado del jugador
  const j = juego.jugador, a = Math.random() * Math.PI * 2, x = j.x + Math.cos(a) * FA.reaparecerDist, y = j.y + Math.sin(a) * FA.reaparecerDist;
  e.estado = 'persigue';
  if (!bloqueado(x, y, e.r)) { e.x = x; e.y = y; }
}
function morirFauna(e) { cancelarAtaque(e); quitarAvisos(e); e.factor = 1; e.estado = 'muerto'; e.vx = e.vy = 0; }
// La fauna de la selva vuelve a su sitio con la vida llena (Respawn).
function revivirFauna(e) {
  Object.assign(e, { x: e.casa.x, y: e.casa.y, vida: e.max, estado: 'reposo', cdAtaque: 0, cdDefensa: 0, cdEspecial: 0, roto: 0, escudo: e.ruptura.escudo, aturdido: 0, persigue: false });
  e.reaparece = e.d.respawnDelay;
}

function dibujarFauna(e) {
  if (e.vida <= 0 && e.muriendo <= 0) return; // vencido, esperando a reaparecer
  const b = `Enemigo_${e.especie}_`, vuela = e.d.flies;
  const pose = e.vida <= 0 ? 'Muerte' : e.destello > 0 || e.aturdido > FA.aturdido ? 'Dano' : e.poseT > 0 ? e.pose
    : e.estado === 'guardia' ? 'Defensa' : e.estado === 'golpe' && e.forma === 'linea' ? 'Correr'
    : ['aviso', 'golpe', 'especial'].includes(e.estado) ? 'Ataque' : vuela ? 'Volar' : e.movido ? (e.persigue ? 'Correr' : 'Caminar') : 'Reposo';
  elipse(e.x, e.y, (e.r + 0.05) * (e.escala || 1), '#0006', null, e.suelo ?? e.z);
  const alfa = e.vida <= 0 ? e.muriendo / 0.6 : e.estado === 'fase' ? FA.alfaFase : null;
  // Movimiento por código (js/movimiento.js) sobre el cuadro único de cada pose.
  const mov = e.vida <= 0 ? ['Muerte', 1 - e.muriendo / 0.6] : e.estado === 'aviso' ? ['Aviso', 1 - Math.max(0, e.t) / (e.d.attackWindup || 0.6)]
    : e.estado === 'golpe' || e.estado === 'especial' ? ['Ataque'] : e.estado === 'guardia' ? ['Defensa'] : vuela ? ['Volar']
    : e.movido ? [e.persigue ? 'Correr' : 'Caminar'] : ['Reposo'];
  const nombre = elegir(`${b}${pose}1_03`, `${b}Reposo1_03`), o = { espejo: e.fx < 0, alfa, escala: e.escala,
    filtro: e.destello > 0 ? 'brightness(3)' : e.roto > 0 ? ROTO_FILTRO : null, ...movimiento(e, e.especie, ...mov) };
  // Ataque por partes (js/cuadros.js); al soltarlo, el cuadro de ataque se funde 0,12 s sobre el siguiente.
  if (e.cuadro?.includes('_Ataque') && nombre !== e.cuadro && !juego.dibujandoEstela) e.salida = { nombre: e.cuadro, t: juego.t };
  if (!juego.dibujandoEstela) e.cuadro = nombre;
  dibujar(nombre, e.x, e.y, e.z + e.alto, { ...o, lienzo: cuadroAtaque(e, nombre) });
  const fu = e.salida ? 1 - (juego.t - e.salida.t) / CUADROS.salida : 0;
  if (fu > 0 && e.vida > 0) dibujar(e.salida.nombre, e.x, e.y, e.z + e.alto, { ...o, alfa: fu * (alfa ?? 1) });
  if (e.vida > 0 && e.vida < e.max) barraMini(e, 1.2 + e.alto);
}

// Coloca un animal donde dice Unity; si ahí no hay suelo libre, en su punto de respaldo (EnemyCharacterAssets.Place).
function ponerFauna(especie, p, respaldo, reaparece) {
  const r = FAUNA[especie].bodyRadius, q = bloqueado(p.x, p.y, r) ? respaldo : p;
  juego.enemigos.push(nuevaFauna(especie, q.x, q.y, reaparece));
}
const entre = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
const mas = (a, dx, dy) => ({ x: a.x + dx, y: a.y + dy });
// Selva (OlmecaJungleGenerator.BuildFauna): reaparece. Pisos 1 y 2 (OlmecaDungeonGenerator.BuildFauna): no.
function poblarFauna(id, P) {
  if (id === 'selva' && P.claros?.length >= 3 && P.entrada && afueraConMonstruos()) { // hasta completar la mazmorra, no (js/juego.js)
    const [c1, c2, c3] = P.claros, nido = entre(c3, P.entrada, 0.5);
    ponerFauna('Serpiente', entre(c1, c2, 0.5), c2, true);
    ponerFauna('Guacamaya', entre(c1, c2, 0.75), c2, true);
    ponerFauna('Mono', entre(c2, c3, 0.5), c3, true);
    for (const [dx, dy] of [[-0.5, 0.4], [0.5, -0.3], [0, 0.6]]) ponerFauna('Avispa', mas(nido, dx, dy), nido, true);
  }
  if (id === 'p1' && P.enemigos?.length >= 3) {
    ponerFauna('Murcielago', mas(P.enemigos[1], -2, -1), P.enemigos[1], false);
    ponerFauna('Murcielago', mas(P.enemigos[2], -2, 1), P.enemigos[2], false);
  }
  if (id === 'p2' && P.enemigos?.length >= 1 && P.vida) {
    ponerFauna('Cocodrilo', entre(P.llegada_arriba, P.vida, 0.6), P.enemigos[0], false);
    ponerFauna('Cocodrilo', mas(P.enemigos[0], 2, -1.5), P.enemigos[0], false);
  }
  for (const [x, y] of VASIJAS[id] || []) juego.enemigos.push(nuevaVasija(x, y));
}

// ---------- Vasijas rompibles (BreakablePot): 1 de vida; el ataque y la Tierra las rompen; botín BOT_vasija ----------
// Sus sitios, de OlmecaDungeonGenerator.Props (x, y del flujo). Vuelven al recargar el piso.
const VASIJAS = { p1: [[10, -1], [17, -2], [0, 2], [10, -3]], p2: [[-1, -3], [10, 1], [-10, 1]], p3: [[2, -1], [6, 1], [7, -1]] };
function nuevaVasija(x, y) {
  const bloqueo = caja(x, y, 0.4, 0.4);
  mundo.cajas.push(bloqueo);
  return { tipo: 'vasija', x, y, z: alturaEn(x, y), vida: 1, max: 1, r: 0.25, kx: 0, ky: 0, muriendo: 0, destello: 0,
    actualizar() {}, alMorir(v) {
      v.estado = 'liberado'; v.golpeable = false; v.muriendo = 0; sonar('vasija');
      mundo.cajas = mundo.cajas.filter((c) => c !== bloqueo);
    },
    dibujar(v) { dibujar(v.vida > 0 ? 'Vasija_Rompible_01' : 'Vasija_Rompible_02', v.x, v.y, v.z); } };
}

// Autocomprobación: los datos de Unity llegaron con sus enums.
console.assert(FAUNA.Mono && FORMA[FAUNA.Mono.attackShape] === 'proyectil' && ESPECIAL_FAUNA[FAUNA.Mono.special] === 'abanico'
  && DEFENSA_FAUNA[FAUNA.Mono.defense] === 'saltoAtras', 'Fauna: el mono dispara, lanza en abanico y salta atrás');
