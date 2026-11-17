'use strict';
// Actores: jugador, enemigos, jefe, habitantes y objetos que se recogen. Valores de Unity (escala ×10).

const PERFIL = { nombre: 'Yaret', vida: 50, ataque: 10, defensa: 0 }; // GUA de Yaret a nivel 1 (Sistema_Progresion.md)
const ATAQUE = { alcance: 0.8, radio: 0.7, espera: 0.35, combo: 3, ventana: 0.5, remate: 1.5, recuperacion: 0.45, impulso: 5,
  pausa: 0.05, asistencia: 3, angulo: 60 }; // PlayerAttack.cs
const MOV = { vel: 4, acel: 40, esqVel: 10, esqDur: 0.18, esqInv: 0.3, esqEspera: 0.6, cargas: 2, perfecta: 0.2,
  lentoEscala: 0.35, lentoDur: 0.45, lentoEspera: 1.5 }; // PlayerMovement.cs
const DEFENSA = { factor: 0.5, perfecta: 0.2, rearme: 0.6, aturdido: 1.2, pausa: 0.1, busqueda: 0.8 }; // PlayerDefense.cs
// Vida de los enemigos comunes ×1,5 (solo HTML, README etapa 24): con el daño del jugador, la mayoría moría antes de su
// primer ataque. Los jefes no la usan (el jaguar reescribe la suya).
const VIDA_COMUN = 1.5, vidaComun = (v) => Math.round(v * VIDA_COMUN);
const ENEMIGO = {
  espiritu: { vida: 30, contacto: 10, vel: 2.4, r: 0.35 },
  eco: { vida: 30, disparo: 10, r: 0.35 }, // vida: 20 en Unity; aquí, para que llegue a disparar (README, etapa 24)
  jaguar: { vida: 420, zarpazo: 20, salto: 20, rugido: 10, r: 0.6, nombre: 'Espíritu del Jaguar' }, // vida: 160 en Unity (ver README, etapa 23)
};
const dano = (golpe, defensa) => Math.max(1, golpe - defensa); // Health.cs

// ---------- Ruptura (BreakGauge.cs, Docs/Sistemas/Ruptura.md) ----------
// Escudo, segundos roto y debilidades de cada enemigo: los de BreakGauge.Ensure en el Awake de cada uno.
const RUPTURA = { factor: 1.5, panel: 4,
  espiritu: { escudo: 3, seg: 2.5, debil: ['Luz', 'Agua'], nombre: 'Espíritu corrompido' },
  eco: { escudo: 3, seg: 2.5, debil: ['Luz', 'Agua'], nombre: 'Eco borrado' },
  jaguar: { escudo: 5, seg: 3, debil: ['Luz', 'Tierra'] },
  guardian: { escudo: 6, seg: 3, debil: ['Agua', 'Viento'] } };
const rupturaDe = (e) => e.ruptura || RUPTURA[e.tipo]; // la fauna trae la suya de EnemyData
// Solo EnemyChaser (espíritus) y WildEnemy (fauna) son IStaggerable. La fauna, además, suelta su ataque.
function aturdir(e, seg) {
  if (e.tipo !== 'espiritu' && e.tipo !== 'fauna') return;
  if (e.tipo === 'fauna') cancelarAtaque(e);
  e.aturdido = Math.max(e.aturdido || 0, seg);
}
const afinidadJugador = () => guardianActual().afinidad; // golpe, combo y especial llevan la del Guardián
const escudoDe = (e) => (e.escudo ??= rupturaDe(e)?.escudo ?? 0);
// Quita puntos del escudo (golpe débil o bloqueo perfecto). Sin escudo queda roto: más daño y, si no es jefe, aturdido.
function desgastar(e, puntos) {
  const R = rupturaDe(e);
  if (!R || e.roto > 0 || e.vida <= 0) return false;
  e.escudo = Math.max(0, escudoDe(e) - puntos);
  if (!e.escudo) {
    e.roto = R.seg;
    aturdir(e, R.seg);
    juego.pausaGolpe = 0.12; vista.temblor = 0.2; sonar('ruptura');
    numero(e.x, e.y + 0.1, '¡RUPTURA!', '#ffd660');
  }
  mostrarRuptura(e);
  return true;
}
// RegisterPlayerHit: con una afinidad débil quita un punto; si no, solo muestra el escudo.
function golpeConAfinidad(e, afinidad) { if (!(afinidad && rupturaDe(e)?.debil.includes(afinidad) && desgastar(e, 1))) mostrarRuptura(e); }
function mostrarRuptura(e) { if (rupturaDe(e) && e.vida > 0) juego.ruptura = { e, t: RUPTURA.panel }; else if (juego.ruptura?.e === e) juego.ruptura = null; }
// Al acabar el tiempo roto, el escudo vuelve entero.
function recuperarRuptura(e, dt) { if (e.roto > 0 && (e.roto -= dt) <= 0) { e.roto = 0; e.escudo = rupturaDe(e).escudo; } }

// Contraataque de los jefes (solo HTML; README, etapa 23): si reciben 6 golpes en 2,5 s, se sacuden con un círculo avisado
// alrededor (0,4 s) que quita 8 y empuja. Así no se les gana quedándose pegado. Cada 4 s como mucho.
const CONTRA = { golpes: 6, ventana: 2.5, aviso: 0.4, radio: 2.2, dano: 8, empuje: 2.2, espera: 4 };
function contraataque(e) {
  const t = juego.t;
  e.golpesRecientes = (e.golpesRecientes || []).filter((g) => t - g < CONTRA.ventana); e.golpesRecientes.push(t);
  if (e.golpesRecientes.length < CONTRA.golpes || t < (e.contraHasta || 0)) return;
  e.golpesRecientes = []; e.contraHasta = t + CONTRA.espera;
  marca('circulo', e.x, e.y, CONTRA.radio, CONTRA.aviso, (m) => {
    if (e.vida <= 0) return;
    vista.temblor = Math.max(vista.temblor, 0.18); sonar('rugido');
    if (enMarca(m, juego.jugador)) herirJugador(CONTRA.dano, e, CONTRA.empuje);
  }, { dueno: e });
}

function numero(x, y, txt, color) { juego.efectos.push({ tipo: 'num', x, y, t: 0.8, txt, color, dx: (Math.random() - 0.5) * 0.6 }); }

// ---------- Jugador ----------
function nuevoJugador(x, y, vida) {
  return { tipo: 'jugador', x, y, vx: 0, vy: 0, fx: 1, fy: 0, vida, max: estadisticas().vida, inv: 0, espera: 0, combo: 0, ventana: 0,
    golpe: 0, esq: 0, esqT: 9, cargas: MOV.cargas, recarga: 0, perfectaEspera: 0, herido: 0, muerto: 0, mov: false, paso: 0, gravedad: true, vz: 0,
    actualizar: actualizarJugador, dibujar: dibujarJugador };
}

// 6 m/s con gravedad de −20: sube 0,9 m y dura 0,6 s.
const SALTO = { vel: 6 };
const enElAire = (a) => (a.z || 0) - (a.suelo ?? 0) > 0.3;

function actualizarJugador(j, dt) {
  for (const k of ['inv', 'espera', 'ventana', 'golpe', 'herido', 'perfectaEspera', 'especial', 'destello', 'freno']) j[k] = Math.max(0, (j[k] || 0) - dt);
  j.esqT += dt; j.t = (j.t || 0) + dt; j.victoria = Math.max(0, (j.victoria || 0) - dt);
  if (j.muerto > 0) { j.muerto = Math.max(0, j.muerto - dt); j.defiende = false; return; }
  if (j.recarga > 0 && (j.recarga -= dt) <= 0) j.cargas = MOV.cargas;

  const [mx, my] = juego.dialogo ? [0, 0] : ejes();
  const l = Math.hypot(mx, my);
  if (l > 0.1 && j.golpe <= 0) { j.fx = mx / l; j.fy = my / l; }

  // Esquiva: dos seguidas y después la espera.
  if (j.esq <= 0 && j.cargas > 0 && consumir('esquivar')) {
    j.cargas--; sonar('esquiva'); j.recarga = MOV.esqEspera; j.esq = MOV.esqDur; j.esqT = 0;
    if (l > 0.1) { j.fx = mx / l; j.fy = my / l; }
    j.vx = j.fx * MOV.esqVel; j.vy = j.fy * MOV.esqVel;
  }
  // Salto (solo en la versión HTML; Unity no tiene): desde el suelo, sin defender ni esquivar.
  const enSuelo = (j.z || 0) <= (j.suelo ?? 0) + 0.01;
  if (consumir('saltar') && enSuelo && !juego.dialogo && j.esq <= 0 && !defensaPulsada()) { j.vz = SALTO.vel; sonar('esquiva'); }
  // Defensa: quieto, sin atacar y a mitad de daño. Al empezar abre la ventana del bloqueo perfecto, que tarda en rearmarse.
  const defiende = defensaPulsada() && !juego.dialogo && j.esq <= 0 && j.vida > 0;
  if (defiende && !j.defiende) { if (j.t >= (j.rearme || 0)) j.perfectaHasta = j.t + DEFENSA.perfecta; j.rearme = j.t + DEFENSA.rearme; }
  j.defiende = defiende;
  if (j.esq > 0) {
    j.esq -= dt;
  } else if (j.defiende) {
    j.vx = j.vy = 0;
  } else {
    const lento = (enAgua(j.x, j.y) ? 0.55 : 1) * (j.freno > 0 ? j.frenoF : 1); // el escupitajo y el chillido frenan
    const tx = j.golpe > 0 ? 0 : mx * MOV.vel * lento, ty = j.golpe > 0 ? 0 : my * MOV.vel * lento, a = MOV.acel * dt;
    j.vx += clamp(tx - j.vx, -a, a); j.vy += clamp(ty - j.vy, -a, a);
  }
  if (j.golpe > 0 && j.esq <= 0) { const imp = ATAQUE.impulso * (j.combo === ATAQUE.combo ? 1.5 : 1); j.vx = j.fx * imp; j.vy = j.fy * imp; }
  mover(j, j.vx * dt, j.vy * dt);
  if (j.z > j.suelo || j.vz > 0) { j.vz -= 20 * dt; j.z = Math.max(j.suelo, j.z + j.vz * dt); } // gravedad del CharacterController (−20)
  // Los habitantes son sólidos: el jugador no los atraviesa (ellos siguen su ruta sin esquivar, como NpcPatrol).
  for (const n of juego.otros) {
    if (n.tipo !== 'npc') continue;
    const dx = j.x - n.x, dy = j.y - n.y, d = Math.hypot(dx, dy), min = 0.25 + 0.28;
    if (d < min && d > 0.001) mover(j, (dx / d) * (min - d), (dy / d) * (min - d));
  }
  j.mov = l > 0.1 && j.esq <= 0 && j.golpe <= 0 && !j.defiende;
  if (j.mov) j.paso += dt * Math.hypot(j.vx, j.vy) / MOV.vel;

  if (j.defiende) return;
  if (!juego.dialogo && j.espera <= 0 && j.esq <= 0 && consumir('especial')) habilidadEspecial(j);
  if (!juego.dialogo && j.espera <= 0 && j.esq <= 0 && (consumir('atacar') || entrada.atacarSostenido)) golpear(j);
}

function golpear(j) {
  j.combo = j.ventana > 0 ? (j.combo % ATAQUE.combo) + 1 : 1;
  const remate = j.combo === ATAQUE.combo;
  j.espera = remate ? ATAQUE.recuperacion : ATAQUE.espera; j.ventana = j.espera + ATAQUE.ventana; j.golpe = 0.12;
  // Apuntado asistido: gira hacia el enemigo más cercano dentro del cono.
  const cos = Math.cos(ATAQUE.angulo * Math.PI / 180);
  const obj = juego.enemigos.filter((e) => e.vida > 0 && e.golpeable !== false).map((e) => [e, dist(e, j)])
    .filter(([e, d]) => d < ATAQUE.asistencia && ((e.x - j.x) * j.fx + (e.y - j.y) * j.fy) / (d || 1) >= cos)
    .sort((a, b) => a[1] - b[1])[0];
  const fijo = fijadoValido() ? [juego.fijado, dist(juego.fijado, j)] : obj; // con un objetivo fijado se apunta siempre a él
  if (fijo) { const d = fijo[1] || 1; j.fx = (fijo[0].x - j.x) / d; j.fy = (fijo[0].y - j.y) / d; }
  const cx = j.x + j.fx * ATAQUE.alcance, cy = j.y + j.fy * ATAQUE.alcance;
  let acierto = false;
  for (const e of juego.enemigos) {
    if (e.vida <= 0 || e.golpeable === false) continue;
    if (Math.hypot(e.x - cx, e.y - cy) < ATAQUE.radio + e.r) { if (herirEnemigo(e, Math.round(estadisticas().ataque * (remate ? ATAQUE.remate : 1)), j, afinidadJugador()) !== false) acierto = true; }
  }
  juego.efectos.push({ tipo: 'tajo', x: cx, y: cy, t: 0.12, remate });
  sonar('tajo');
  if (acierto) { if (remate) sonar('remate'); juego.pausaGolpe = ATAQUE.pausa * (remate ? 1.6 : 1); vista.temblor = remate ? 0.12 : 0.06; }
}

// Habilidad especial (PlayerSpecial): F, 25 de energía, 5 s de espera y 2,5 × ataque enfrente. De momento, solo Balam.
const ESPECIAL = { jaguar: { coste: 25, espera: 5, multiplicador: 2.5, alcance: 1.2, radio: 1.1 } };
const especialDe = () => ESPECIAL[guardianActual().id];
function habilidadEspecial(j) {
  const h = especialDe(), p = prog();
  if (!h) return;
  if ((juego.esperaEspecial || 0) > 0) return avisoRecompensa(`Especial: espera ${juego.esperaEspecial.toFixed(1)} s`);
  if (p.energia < h.coste) return avisoRecompensa('Sin energía');
  p.energia -= h.coste; juego.esperaEspecial = h.espera; j.especial = 0.35; j.espera = 0.35;
  const cx = j.x + j.fx * h.alcance, cy = j.y + j.fy * h.alcance;
  juego.efectos.push({ tipo: 'tajo', x: cx, y: cy, t: 0.2, remate: true });
  vista.temblor = 0.15; sonar('especial');
  for (const e of juego.enemigos) if (e.vida > 0 && e.golpeable !== false && Math.hypot(e.x - cx, e.y - cy) < h.radio + e.r) herirEnemigo(e, Math.round(estadisticas().ataque * h.multiplicador), j, afinidadJugador());
}

function herirJugador(golpe, desde, empuje = 0.8) {
  const j = juego.jugador;
  if (j.muerto > 0 || j.vida <= 0) return false;
  if (j.esqT < MOV.esqInv) {
    if (j.esqT < MOV.perfecta && j.perfectaEspera <= 0) { juego.lento = MOV.lentoDur; j.perfectaEspera = MOV.lentoEspera; numero(j.x, j.y, '¡Perfecta!', '#7fe0b0'); sonar('perfecta'); }
    return false;
  }
  if (j.inv > 0) return false;
  if (j.defiende && j.t <= (j.perfectaHasta || 0)) {
    const quien = juego.enemigos.find((e) => e === desde || (e.vida > 0 && Math.hypot(e.x - desde.x, e.y - desde.y) < DEFENSA.busqueda));
    if (quien) aturdir(quien, DEFENSA.aturdido); // los jefes, no
    if (quien) desgastar(quien, 1); // también a los jefes
    juego.pausaGolpe = DEFENSA.pausa; vista.temblor = 0.15; j.destello = 0.15;
    numero(j.x, j.y, '¡Bloqueo!', '#9fd4ff'); sonar('bloqueo');
    return false;
  }
  const d = Math.ceil(dano(golpe, estadisticas().defensa) * (j.defiende ? DEFENSA.factor : 1));
  j.vida = Math.max(0, j.vida - d); j.inv = 1; j.herido = 0.25; vista.temblor = 0.15;
  const l = dist(j, desde) || 1, ang = Math.atan2(-(j.y - desde.y), j.x - desde.x); // en pantalla la y crece hacia abajo
  impacto(j.x, j.y, 0.7, ang); chispas(j.x, j.y, 0.7, '#ff8a7a', Math.atan2(j.y - desde.y, j.x - desde.x)); juego.pausaGolpe = Math.max(juego.pausaGolpe, EF.pausaHerido);
  mover(j, ((j.x - desde.x) / l) * empuje, ((j.y - desde.y) / l) * empuje);
  numero(j.x, j.y, `-${d}`, '#ff8a7a');
  sonar(j.defiende ? 'escudo' : 'herido'); vibrar(40);
  if (j.vida <= 0) { j.muerto = 1.6; sonar('caida'); }
  return true;
}

function herirEnemigo(e, cant, desde, afinidad) {
  // Devuelve false si el golpe no entra: así golpear no hace la pausa de impacto.
  if (e.invul > 0) return false; // el Guardián mientras cambia de fase
  if (desde === juego.jugador && e.esquivar?.(e)) return false; // fauna voladora: a veces esquiva subiendo
  if (e.factor != null && e.factor !== 1 && !(e.coraza && afinidad === 'Tierra')) cant = Math.max(1, Math.round(cant * e.factor)); // guardia y coraza de la fauna (la Tierra atraviesa la del armadillo)
  if (e.roto > 0) cant = Math.round(cant * RUPTURA.factor); // Health.Vulnerability
  e.vida -= cant; e.destello = 0.12;
  if (e.vida > 0) e.alHerir?.(e);
  if (e.jefe && e.vida > 0 && desde === juego.jugador) contraataque(e);
  numero(e.x, e.y, `${cant}`, '#fff2c4'); sonar('golpe');
  chispas(e.x, e.y, (e.z || 0) + (e.alto || 0) + 0.5, e.roto > 0 ? '#ffd23a' : '#fff6d8', Math.atan2(e.y - desde.y, e.x - desde.x)); // js/efectos.js
  if (!e.jefe && !e.pesado) { const l = dist(e, desde) || 1; e.kx = ((e.x - desde.x) / l) * 6; e.ky = ((e.y - desde.y) / l) * 6; } // el tapir no retrocede
  if (e.vida <= 0) { e.vida = 0; e.muriendo = 0.6; sonar('muerte'); restos(e); /* js/efectos.js: plumas, escamas, pelo o piedra */ recompensaEnemigo(e); e.alMorir?.(e); }
  if (desde === juego.jugador) e.vida > 0 ? golpeConAfinidad(e, afinidad) : mostrarRuptura(e); // primero el daño, como TryDamage
}

function dibujarJugador(j) {
  const b = `Guerrero_${guardianActual().nombre}_`;
  const dir = direccion3(j.fx, j.fy);
  const cuadros = [7, 6, 5, 4, 3, 2, 1].find((k) => SPRITES[`${b}Muerte${k}_03`]) || 1; // Naira, Ameyali y Ocel tienen 3
  let n;
  if (j.muerto > 0 || j.vida <= 0) n = `${b}Muerte${clamp(Math.ceil(((1.6 - j.muerto) / 1.6) * cuadros), 1, cuadros)}_03`;
  else if (j.especial > 0) n = elegir(`${b}Especial1_03`, `${b}Ataque1_03`);
  else if (j.victoria > 0 && SPRITES[`${b}Victoria1_03`]) n = `${b}Victoria1_03`;
  else if (j.defiende && SPRITES[`${b}Defensa1_03`]) n = `${b}Defensa1_03`;
  else if (j.herido > 0) n = `${b}Dano1_03`;
  else if (j.espera > 0.15 && j.esq <= 0) n = elegir(`${b}${j.combo === 2 ? 'Ataque2' : 'Ataque1'}_03`, `${b}Ataque1_03`);
  else if (j.esq > 0 || enElAire(j)) n = `${b}Correr2_03`;
  else if (j.mov) n = elegir(`${b}Caminar${1 + (Math.floor(j.paso * 8) % 4)}_${dir}`, `${b}Caminar1_03`);
  else n = elegir(`${b}Reposo1_${dir}`, `${b}Reposo1_03`);
  elipse(j.x, j.y, 0.3, '#0006', null, j.suelo ?? j.z ?? 0);
  const parpadeo = j.inv > 0 && Math.floor(j.inv * 14) % 2 === 0;
  dibujar(n, j.x, j.y, j.z || 0, { espejo: j.fx < 0, alfa: j.esq > 0 ? 0.6 : parpadeo ? 0.4 : null, filtro: j.destello > 0 ? 'brightness(2)' : null });
  if (j.defiende) elipse(j.x, j.y, 0.55, j.t <= (j.perfectaHasta || 0) ? 'rgba(159,212,255,.28)' : 'rgba(159,212,255,.12)', '#9fd4ff', j.z || 0);
}

// ---------- Fijar objetivo (PlayerAttack.ToggleLockOn): Tab o el botón Fijar ----------
const FIJAR = { alcance: 8, suelta: 12, inclina: 0.35, maxInclina: 2.5 };
const fijadoValido = () => { const e = juego.fijado; return !!e && e.vida > 0 && e.golpeable !== false && juego.enemigos.includes(e) && dist(e, juego.jugador) <= FIJAR.suelta; };
function alternarFijar() {
  if (juego.fijado) { juego.fijado = null; return; }
  const j = juego.jugador;
  let mejor = null, puntos = Infinity;
  for (const e of juego.enemigos) {
    if (e.vida <= 0 || e.max <= 1 || e.golpeable === false) continue; // las vasijas no merecen fijarse
    const d = dist(e, j);
    if (d > FIJAR.alcance) continue;
    const p = d * (2 - (d > 0.01 ? ((e.x - j.x) * j.fx + (e.y - j.y) * j.fy) / d : 1)); // cerca y delante pesa más
    if (p < puntos) { puntos = p; mejor = e; }
  }
  juego.fijado = mejor;
  if (mejor) { mostrarRuptura(mejor); sonar('clic'); } else sonar('no');
}
// La mira: un rombo dorado sobre el fijado y un anillo a sus pies.
function dibujarMira() {
  if (!fijadoValido()) return;
  const e = juego.fijado, t = juego.t;
  elipse(e.x, e.y, (e.r || 0.4) + 0.25 + Math.sin(t * 6) * 0.04, null, '#ffd660', e.z || 0);
  const [sx, sy] = pantalla(e.x, e.y, (e.z || 0) + (e.alto || 0) + (e.jefe ? (e.tipo === 'guardian' ? 3.4 : 2.2) : 1.5));
  const px = Math.round(sx - vista.cx), py = Math.round(sy - vista.cy + Math.sin(t * 5) * 1.5);
  ctx.fillStyle = '#ffd660'; ctx.strokeStyle = '#000'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + 4, py - 5); ctx.lineTo(px, py - 10); ctx.lineTo(px - 4, py - 5); ctx.closePath(); ctx.fill(); ctx.stroke();
}

// ---------- Enemigos comunes ----------
// Salto de los enemigos que van a pie (solo en la versión HTML): persiguiendo, de vez en cuando brincan hacia el jugador.
// 5 m/s con −20: sube 0,6 m y dura 0,5 s; el empujón los acerca casi 1 m. Los jefes no saltan.
const SALTO_ENEMIGO = { vel: 5, empuje: 8, min: 1.5, max: 5, espera: [2.5, 5] };
const esperaSalto = () => SALTO_ENEMIGO.espera[0] + Math.random() * (SALTO_ENEMIGO.espera[1] - SALTO_ENEMIGO.espera[0]);
function saltoEnemigo(e, persigue, dt) {
  const S = SALTO_ENEMIGO, j = juego.jugador, suelo = e.suelo ?? 0;
  e.gravedad = true; e.z = e.z || 0;
  if (e.z > suelo || e.vz > 0) { e.vz -= 20 * dt; e.z = Math.max(suelo, e.z + e.vz * dt); }
  e.cdSalto = (e.cdSalto ?? esperaSalto()) - dt;
  const d = dist(e, j);
  if (!persigue || e.jefe || e.vida <= 0 || j.vida <= 0 || e.z > suelo + 0.01 || e.cdSalto > 0 || d < S.min || d > S.max) return;
  e.vz = S.vel; e.kx += ((j.x - e.x) / d) * S.empuje; e.ky += ((j.y - e.y) / d) * S.empuje; e.cdSalto = esperaSalto();
}

// Esquiva saltando de los que van a pie (solo en la versión HTML): si un golpe del jugador los va a alcanzar, un 25 % de las
// veces brincan hacia atrás y no reciben daño. 3 s de espera; en el aire, aturdidos, rotos o atacando, no pueden.
// Los jefes (jaguar y Guardián), solo mientras acechan.
const ESQUIVA_SALTO = { prob: 0.25, espera: 3, seg: 0.4, atras: 6 };
function esquivarSaltando(e) {
  const S = ESQUIVA_SALTO, j = juego.jugador;
  if ((e.jefe && e.estado !== 'acecho') || e.roto > 0 || e.cdEsquiva > 0 || e.aturdido > 0 || ['aviso', 'golpe', 'especial'].includes(e.estado) || (e.z || 0) > (e.suelo ?? 0) + 0.01 || Math.random() >= (e.probEsquiva ?? S.prob)) return false; // el ocelote, más
  const l = dist(e, j) || 1;
  e.cdEsquiva = S.espera; e.invul = S.seg; e.vz = SALTO_ENEMIGO.vel; e.kx = ((e.x - j.x) / l) * S.atras; e.ky = ((e.y - j.y) / l) * S.atras;
  numero(e.x, e.y, 'Esquiva', '#9fd4ff'); sonar('esquiva');
  return true;
}

const ESPIRITU_MORDIDA = { aviso: 0.4, radio: 0.75, espera: 1.0 };
function nuevoEspiritu(x, y, alMorir) {
  return { tipo: 'espiritu', x, y, casa: { x, y }, vida: vidaComun(ENEMIGO.espiritu.vida), max: vidaComun(ENEMIGO.espiritu.vida), r: ENEMIGO.espiritu.r,
    fx: -1, kx: 0, ky: 0, cdGolpe: 0, alerta: false, destello: 0, muriendo: 0, t: Math.random() * 3, alMorir,
    esquivar: esquivarSaltando, cdEsquiva: 0, invul: 0, gravedad: true, vz: 0, actualizar: actualizarEspiritu, dibujar: dibujarEspiritu };
}
function actualizarEspiritu(e, dt) {
  const j = juego.jugador, d = dist(e, j);
  e.t += dt; e.destello = Math.max(0, e.destello - dt); e.cdGolpe = Math.max(0, e.cdGolpe - dt);
  e.invul = Math.max(0, e.invul - dt); e.cdEsquiva = Math.max(0, e.cdEsquiva - dt);
  mover(e, e.kx * dt, e.ky * dt, 0.3); e.kx *= 0.85; e.ky *= 0.85;
  saltoEnemigo(e, e.alerta && !(e.aturdido > 0) && e.cdGolpe <= 0, dt);
  if (e.aturdido > 0) { e.aturdido -= dt; e.mov = false; return; }
  if (d < 6) e.alerta = true;
  if (d > 12) e.alerta = false;
  const meta = e.alerta && j.vida > 0 ? j : { x: e.casa.x + Math.cos(e.t * 0.6) * 1.5, y: e.casa.y + Math.sin(e.t * 0.9) };
  const dm = dist(e, meta);
  e.mov = dm > 0.4 && e.cdGolpe <= 0;
  if (e.mov) {
    const v = (e.alerta ? ENEMIGO.espiritu.vel : 1) * (enAgua(e.x, e.y) ? 0.55 : 1) * dt;
    e.fx = meta.x - e.x;
    mover(e, ((meta.x - e.x) / dm) * v, ((meta.y - e.y) / dm) * v, 0.3);
  }
  // Mordida avisada (solo HTML, README etapa 24): a menos de 1,1 m se para, marca un círculo pequeño delante 0,4 s y se lanza.
  // Antes golpeaba al tocarte, sin aviso: era el enemigo más dañino por su coste.
  if (e.prep > 0) {
    e.prep -= dt; e.mov = false;
    if (e.prep <= 0) { const l = dist(e, j) || 1; e.ataca = 0.3; e.kx += ((j.x - e.x) / l) * 5; e.ky += ((j.y - e.y) / l) * 5; }
  } else if (d < 1.1 && e.cdGolpe <= 0 && j.vida > 0) {
    const l = d || 1, cx = e.x + ((j.x - e.x) / l) * 0.6, cy = e.y + ((j.y - e.y) / l) * 0.6;
    e.prep = ESPIRITU_MORDIDA.aviso; e.cdGolpe = ESPIRITU_MORDIDA.aviso + ESPIRITU_MORDIDA.espera; e.fx = j.x - e.x;
    marca('circulo', cx, cy, ESPIRITU_MORDIDA.radio, ESPIRITU_MORDIDA.aviso, (m) => { if (e.vida > 0 && !(e.aturdido > 0) && enMarca(m, j)) herirJugador(ENEMIGO.espiritu.contacto, e); }, { dueno: e });
  }
  e.ataca = Math.max(0, (e.ataca || 0) - dt);
}
function dibujarEspiritu(e) {
  const b = 'Enemigo_EspirituJaguar_';
  const pose = e.vida <= 0 ? 'Muerte' : e.destello > 0 || e.aturdido > 0 ? 'Dano' : e.ataca > 0 ? 'Ataque' : e.mov ? (e.alerta ? 'Correr' : 'Caminar') : 'Reposo';
  elipse(e.x, e.y, 0.35, '#0006', null, e.suelo ?? e.z ?? 0); // la sombra se queda en el suelo al saltar
  const mov = e.vida <= 0 ? ['Muerte', 1 - e.muriendo / 0.6] : e.prep > 0 ? ['Aviso', 1 - e.prep / ESPIRITU_MORDIDA.aviso] : e.ataca > 0 ? ['Ataque'] : e.mov ? [e.alerta ? 'Correr' : 'Caminar'] : ['Flotar'];
  dibujar(`${b}${pose}1_03`, e.x, e.y, e.z || 0, { espejo: e.fx < 0, alfa: e.vida <= 0 ? e.muriendo / 0.6 : null, lienzo: conPartes(e, `${b}${pose}1_03`), // js/cuadros.js
    filtro: e.destello > 0 ? 'brightness(3)' : e.roto > 0 ? ROTO_FILTRO : null, escala: e.escala, ...movimiento(e, 'espiritu', ...mov) });
  if (e.vida > 0 && e.vida < e.max && !e.jefe) barraMini(e, 1.5);
}
const ROTO_FILTRO = 'sepia(1) saturate(3) brightness(1.25)'; // roto: dorado (en Unity está pendiente)
function barraMini(e, z) {
  const [sx, sy] = pantalla(e.x, e.y, z);
  const px = Math.round(sx - vista.cx) - 10, py = Math.round(sy - vista.cy);
  ctx.fillStyle = '#000'; ctx.fillRect(px, py, 20, 3);
  ctx.fillStyle = '#d4503e'; ctx.fillRect(px, py, Math.round((20 * e.vida) / e.max), 3);
}

// El eco avisa con una línea 0,6 s, dispara y salta a otro de los puntos de su sala.
function nuevoEco(puntos, i) {
  const p = puntos[i % puntos.length];
  return { tipo: 'eco', x: p.x, y: p.y, puntos, vida: vidaComun(ENEMIGO.eco.vida), max: vidaComun(ENEMIGO.eco.vida), r: ENEMIGO.eco.r, kx: 0, ky: 0,
    estado: 'espera', t: 0.6 + i * 0.6, destello: 0, muriendo: 0, alerta: false, actualizar: actualizarEco, dibujar: dibujarEco };
}
function actualizarEco(e, dt) {
  const j = juego.jugador;
  e.destello = Math.max(0, e.destello - dt);
  mover(e, e.kx * dt, e.ky * dt, 0.3); e.kx *= 0.8; e.ky *= 0.8;
  if (dist(e, j) < 9) e.alerta = true;
  if (!e.alerta || j.vida <= 0) return;
  if ((e.t -= dt) > 0) return;
  if (e.estado === 'espera') { e.estado = 'aviso'; e.t = 0.6; e.tx = j.x; e.ty = j.y; }
  else if (e.estado === 'aviso') {
    const l = Math.hypot(e.tx - e.x, e.ty - e.y) || 1;
    juego.disparos.push({ x: e.x, y: e.y, vx: ((e.tx - e.x) / l) * 7, vy: ((e.ty - e.y) / l) * 7, t: 2.5, golpe: ENEMIGO.eco.disparo }); sonar('disparo');
    e.estado = 'salto'; e.t = 0.7;
  } else {
    const otros = e.puntos.filter((p) => Math.hypot(p.x - e.x, p.y - e.y) > 1);
    const p = otros[Math.floor(Math.random() * otros.length)] || e;
    juego.efectos.push({ tipo: 'destello', x: e.x, y: e.y, t: 0.3 });
    e.x = p.x; e.y = p.y; e.estado = 'espera'; e.t = 1.6;
  }
}
// shortcut: el eco no tiene arte en la lámina; se dibuja como un rombo violeta hasta que exista su sprite.
function dibujarEco(e) {
  const a = e.vida <= 0 ? e.muriendo / 0.6 : 1;
  if (e.estado === 'aviso' && e.vida > 0) {
    const [ax, ay] = pantalla(e.x, e.y, 0.9), [bx, by] = pantalla(e.x + (e.tx - e.x) * 3, e.y + (e.ty - e.y) * 3, 0.9);
    ctx.strokeStyle = `rgba(155,107,214,${0.3 + 0.6 * (1 - e.t / 0.6)})`; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(ax - vista.cx, ay - vista.cy); ctx.lineTo(bx - vista.cx, by - vista.cy); ctx.stroke();
  }
  elipse(e.x, e.y, 0.3, '#0005');
  const [sx, sy] = pantalla(e.x, e.y, 0.9 + Math.sin(performance.now() / 300) * 0.08);
  const px = Math.round(sx - vista.cx), py = Math.round(sy - vista.cy);
  ctx.globalAlpha = a;
  ctx.fillStyle = e.destello > 0 ? '#fff' : e.roto > 0 ? '#c9a040' : '#6a4f8f'; ctx.strokeStyle = '#c9a8ff'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(px, py - 12); ctx.lineTo(px + 8, py); ctx.lineTo(px, py + 12); ctx.lineTo(px - 8, py); ctx.closePath();
  ctx.fill(); ctx.stroke(); ctx.globalAlpha = 1;
  if (e.vida > 0 && e.vida < e.max) barraMini(e, 1.6);
}

// ---------- Espíritu del Jaguar (mini-jefe del piso 2; StoneJaguar.cs) ----------
function nuevoJaguar(x, y, alMorir) {
  const j = nuevoEspiritu(x, y, alMorir);
  return Object.assign(j, { tipo: 'jaguar', jefe: true, nombre: ENEMIGO.jaguar.nombre, vida: ENEMIGO.jaguar.vida, max: ENEMIGO.jaguar.vida,
    r: ENEMIGO.jaguar.r, escala: 2, estado: 'dormido', cuenta: 0, actualizar: actualizarJaguar, dibujar: dibujarJaguar });
}
// Avisos en el suelo (TelegraphMarker): círculo, anillo (desde la mitad del radio hacia fuera) y franja (o = {dx, dy, largo}; r es el ancho).
function marca(forma, x, y, r, dur, alFin, o = {}) { const m = { forma, x, y, r, t: dur, dur, alFin, ...o }; juego.marcas.push(m); sonar('aviso'); if (o.dueno) alerta(o.dueno); return m; }
function enMarca(m, a) {
  const d = Math.hypot(a.x - m.x, a.y - m.y);
  if (m.forma === 'anillo') return d <= m.r + 0.2 && d >= m.r * 0.5 - 0.2;
  if (m.forma === 'franja') {
    const t = (a.x - m.x) * m.dx + (a.y - m.y) * m.dy, p = Math.abs((a.x - m.x) * m.dy - (a.y - m.y) * m.dx);
    return t >= -0.3 && t <= m.largo + 0.3 && p <= m.r / 2 + 0.2;
  }
  return d < m.r + 0.2;
}

// Sprites de 3 direcciones (_01 de espaldas, _03 de lado, _05 de frente) y de 5 (_02 y _04 en diagonal). Hacia la
// izquierda se usa el espejo de la derecha, como DirectionQuantizer.
const direccion3 = (fx, fy) => (Math.abs(fx) >= Math.abs(fy) * 0.8 ? '03' : fy > 0 ? '01' : '05');
function direccion5(fx, fy) {
  const a = (Math.atan2(fy, Math.abs(fx)) * 180) / Math.PI;
  return a > 67.5 ? '01' : a > 22.5 ? '02' : a > -22.5 ? '03' : a > -67.5 ? '04' : '05';
}

function actualizarJaguar(e, dt) {
  const j = juego.jugador, d = dist(e, j), J = ENEMIGO.jaguar;
  e.destello = Math.max(0, e.destello - dt); e.invul = Math.max(0, e.invul - dt); e.cdEsquiva = Math.max(0, e.cdEsquiva - dt);
  if (e.estado === 'liberado') return;
  if (e.estado === 'dormido') { if (d < 6.5) { e.estado = 'acecho'; e.t = 1.2; juego.jefe = e; sonar('rugido'); } return; }
  if (j.vida <= 0) return;
  e.t -= dt;
  if (e.estado === 'acecho') {
    // En el aire de una esquiva: cae y retrocede; el siguiente ataque espera a que aterrice.
    if (e.z > (e.suelo ?? 0) || e.vz > 0) {
      e.vz -= 20 * dt; e.z = Math.max(e.suelo ?? 0, e.z + e.vz * dt);
      mover(e, e.kx * dt, e.ky * dt, 0.5); e.kx *= 0.85; e.ky *= 0.85; e.t = Math.max(e.t, 0.3);
      return;
    }
    e.fx = j.x - e.x;
    e.mov = d > 1.6;
    if (e.mov) mover(e, ((j.x - e.x) / d) * 2 * dt, ((j.y - e.y) / d) * 2 * dt, 0.5);
    if (e.t > 0) return;
    e.cuenta++;
    const rugido = e.cuenta % (e.vida < e.max / 2 ? 2 : 3) === 0;
    if (rugido) {
      e.estado = 'rugido'; e.t = 0.8; sonar('rugido');
      marca('anillo', e.x, e.y, 3.2, 0.7, (m) => { if (enMarca(m, j)) herirJugador(J.rugido, e, 1.8); vista.temblor = 0.2; });
    } else if (d < 2.4) {
      e.estado = 'zarpazo'; e.t = 0.8;
      const l = d || 1, mx = e.x + ((j.x - e.x) / l) * 1.1, my = e.y + ((j.y - e.y) / l) * 1.1;
      marca('circulo', mx, my, 1.1, 0.55, (m) => { if (enMarca(m, j)) herirJugador(J.zarpazo, e); });
    } else {
      e.estado = 'salto'; e.t = 0.8 + 0.9; e.desde = { x: e.x, y: e.y }; e.hacia = { x: j.x, y: j.y };
      marca('circulo', j.x, j.y, 1.3, 0.8, (m) => { if (enMarca(m, j)) herirJugador(J.salto, e, 1.2); vista.temblor = 0.15; });
    }
    return;
  }
  if (e.estado === 'salto') {
    const p = clamp((1.7 - e.t - 0.45) / 0.35, 0, 1); // vuela en los últimos 0,35 s del aviso; después queda expuesto 0,9 s
    if (p > 0 && p <= 1) { const nx = e.desde.x + (e.hacia.x - e.desde.x) * p, ny = e.desde.y + (e.hacia.y - e.desde.y) * p; if (!bloqueado(nx, ny, 0.3)) { e.x = nx; e.y = ny; } e.z = Math.sin(p * Math.PI) * 1.2; }
    else e.z = 0;
  }
  if (e.t <= 0) {
    // Al caer del salto con el jugador cerca, encadena un zarpazo (README, etapa 23); si no, vuelve a acechar, menos que antes.
    const cerca = e.estado === 'salto' && dist(e, j) < 2.4 && j.vida > 0;
    e.z = 0;
    if (cerca) {
      e.estado = 'zarpazo'; e.t = 0.8;
      const l = dist(e, j) || 1, mx = e.x + ((j.x - e.x) / l) * 1.1, my = e.y + ((j.y - e.y) / l) * 1.1;
      marca('circulo', mx, my, 1.1, 0.55, (m) => { if (enMarca(m, j)) herirJugador(J.zarpazo, e); });
    } else { e.estado = 'acecho'; e.t = 0.7 + Math.random() * 0.4; }
  }
}
// Figura de Xolotl: Jefe_PerroFuego_* de Unity (Sprites/Jefes), solo de lado y a escala 1,5. Si faltara, el espíritu del jaguar a escala 2.
const FIGURA_XOLOTL = { Reposo: 'Reposo', Caminar: 'Avance', Defensa: 'Avance', Ataque: 'Ataque', Correr: 'Ataque' };
function dibujarJaguar(e) {
  const b = 'Enemigo_EspirituJaguar_';
  const pose = { dormido: 'Reposo', liberado: 'Reposo', acecho: e.mov ? 'Caminar' : 'Reposo', zarpazo: e.t < 0.3 ? 'Ataque' : 'Defensa',
    rugido: 'Defensa', salto: e.z > 0 ? 'Correr' : e.t > 0.9 ? 'Defensa' : 'Reposo' }[e.estado];
  elipse(e.x, e.y, 0.7, '#0006');
  const filtro = e.destello > 0 ? 'brightness(3)' : e.roto > 0 ? ROTO_FILTRO : e.estado === 'liberado' ? 'saturate(.4) brightness(1.2)' : null;
  const xolotl = `Jefe_PerroFuego_${e.estado === 'rugido' ? 'Especial' : e.estado === 'liberado' ? 'Desplome' : FIGURA_XOLOTL[pose]}1_03`; // ruge en llamas
  // Movimiento por código: aviso del zarpazo y del rugido, estocada, carrera en el salto.
  const mov = e.estado === 'zarpazo' ? (e.t > 0.3 ? ['Aviso', (0.8 - e.t) / 0.5] : ['Ataque']) : e.estado === 'rugido' ? ['Aviso', 1 - e.t / 0.8]
    : e.estado === 'salto' ? (e.z > 0 ? ['Correr'] : ['Aviso', Math.min(1, (1.7 - e.t) / 0.45)]) : e.estado === 'acecho' && e.mov ? ['Caminar'] : ['Reposo'];
  // Partes (js/cuadros.js): la cabeza avisa y muerde en el zarpazo; en el salto solo se mecen las llamas.
  const fase = e.estado === 'zarpazo' ? (e.t > 0.3 ? { aviso: (0.8 - e.t) / 0.5 } : { golpe: 0.3 - e.t }) : {};
  if (SPRITES[xolotl]) dibujar(xolotl, e.x, e.y, e.z || 0, { espejo: e.fx < 0, filtro, escala: 1.5, lienzo: conPartes(e, xolotl, fase), ...(e.estado === 'liberado' ? {} : movimiento(e, 'jaguar', ...mov)) });
  else dibujar(`${b}${pose}1_03`, e.x, e.y, e.z || 0, { espejo: e.fx < 0, escala: 2, filtro });
}

// ---------- Habitantes y objetos ----------
// Habitante: va y viene entre sus puntos a 1,5 m/s y espera 2 s en cada uno (NpcPatrol). Se para y te mira al hablar.
function nuevoHabitante(id, arte, puntos) {
  return { tipo: 'npc', id, quien: NPCS[id] || id, arte, x: puntos[0].x, y: puntos[0].y, z: 0, puntos, i: 1 % puntos.length,
    espera: 2, fx: 0, fy: -1, mov: false, paso: 0, hablando: false, defensor: false, cd: 0, golpe: 0,
    actualizar: actualizarHabitante, dibujar: dibujarHabitante };
}
function irHacia(a, m, vel, dt) {
  const d = dist(a, m) || 1, s = Math.min(d, vel * dt);
  a.fx = (m.x - a.x) / d; a.fy = (m.y - a.y) / d;
  mover(a, a.fx * s, a.fy * s, 0.2);
  a.paso += dt * vel / 1.5;
}
function actualizarHabitante(n, dt) {
  const j = juego.jugador;
  n.cd = Math.max(0, n.cd - dt); n.golpe = Math.max(0, n.golpe - dt); n.mov = false;
  if (n.hablando) { n.fx = j.x - n.x; n.fy = j.y - n.y; return; }
  // Guardia (NpcDefender): ve enemigos a 5 m, se acerca y golpea a 1,2 m por 10. No tiene vida.
  if (n.defensor) {
    const e = juego.enemigos.filter((e) => e.vida > 0 && !e.jefe && dist(e, n) < 5).sort((a, b) => dist(a, n) - dist(b, n))[0];
    if (e) {
      if (dist(e, n) > 1.2) { irHacia(n, e, 2.5, dt); n.mov = true; }
      else if (n.cd <= 0) { n.fx = e.x - n.x; herirEnemigo(e, 10, n); n.cd = 1; n.golpe = 0.3; }
      return;
    }
  }
  if (n.puntos.length < 2) return;
  const meta = n.puntos[n.i];
  if (dist(n, meta) < 0.08) { if ((n.espera -= dt) <= 0) { n.i = (n.i + 1) % n.puntos.length; n.espera = 2; } return; }
  irHacia(n, meta, 1.5, dt); n.mov = true;
}
function dibujarHabitante(n) {
  const b = `Npc_${n.arte}_`, dir = direccion3(n.fx, n.fy);
  const pose = n.golpe > 0 ? 'Ataque1' : n.mov ? `Caminar${1 + (Math.floor(n.paso * 8) % 4)}` : 'Reposo1';
  elipse(n.x, n.y, 0.28, '#0006', null, n.z);
  dibujar(elegir(`${b}${pose}_${dir}`, `${b}${pose}_03`, `${b}${pose}_01`, `${b}Caminar1_${dir}`, `${b}Reposo1_01`), n.x, n.y, n.z, { espejo: n.fx < 0 });
}

// ---------- La figura espiritual del despertar ----------
// No tiene arte en la lámina (en Unity sigue siendo provisional). Aquí es una forma de luz sin rasgos que surge del río
// al asomarte, flota sobre el agua mientras habla y se deshace en motas tras el juramento; queda su eco en el agua.
const FIG_W = 40, FIG_H = 76; // unos 2 m de alto: algo más que el jugador
const lienzoFigura = Object.assign(document.createElement('canvas'), { width: FIG_W, height: FIG_H });
const FIGURA = { surgir: 1.6, disolver: 2.4 };
function nuevaFigura(x, y, estado) {
  return { tipo: 'figura', id: 'figura_espiritual', quien: NPCS.figura_espiritual, x, y, z: 0, estado, t: 0,
    actualizar: actualizarFigura, dibujar: dibujarFigura };
}
function actualizarFigura(f, dt) {
  f.t += dt;
  if (f.estado === 'surgiendo' && f.t >= FIGURA.surgir) { f.estado = 'presente'; f.t = 0; }
  if (f.estado === 'presente' && bandera('olm.juramento') && !juego.dialogo) { f.estado = 'disolviendo'; f.t = 0; }
  if (f.estado === 'disolviendo' && f.t >= FIGURA.disolver) { f.estado = 'eco'; f.t = 0; }
}
function aparecerFigura(f) { if (f.estado === 'oculta') { f.estado = 'surgiendo'; f.t = 0; } }

function pintarFigura(desharse, t) {
  const g = lienzoFigura.getContext('2d'), W = FIG_W, H = FIG_H, cx = W / 2, v = Math.sin(t * 1.3) * 2, b = Math.sin(t * 0.9) * 1.5;
  g.clearRect(0, 0, W, H);
  // Manto de luz que se abre hacia el agua y se desvanece en ella.
  const manto = g.createLinearGradient(0, 18, 0, H);
  manto.addColorStop(0, 'rgba(214,255,240,.9)'); manto.addColorStop(0.55, 'rgba(120,226,200,.65)'); manto.addColorStop(1, 'rgba(60,180,175,0)');
  g.fillStyle = manto;
  g.beginPath(); g.moveTo(cx - 6, 20); g.quadraticCurveTo(cx - 15, 50, cx - 14 + v, H); g.lineTo(cx + 14 + v, H);
  g.quadraticCurveTo(cx + 15, 50, cx + 6, 20); g.closePath(); g.fill();
  // Brazos abiertos, como quien recibe a alguien.
  g.strokeStyle = 'rgba(200,255,236,.8)'; g.lineWidth = 2.5; g.lineCap = 'round';
  g.beginPath(); g.moveTo(cx - 5, 23); g.quadraticCurveTo(cx - 12, 30, cx - 17, 36 + b); g.stroke();
  g.beginPath(); g.moveTo(cx + 5, 23); g.quadraticCurveTo(cx + 12, 30, cx + 17, 36 - b); g.stroke();
  // Cabeza sin rasgos y núcleo de luz.
  g.fillStyle = 'rgba(244,255,251,.97)'; g.beginPath(); g.arc(cx, 13, 5.5, 0, Math.PI * 2); g.fill();
  g.fillStyle = 'rgba(255,255,255,.95)'; g.fillRect(cx - 1, 21, 2, 24);
  g.fillStyle = 'rgba(255,255,255,.6)'; g.fillRect(cx - 2, 28, 4, 6);
  if (desharse > 0) { // se deshace de abajo arriba en huecos de píxel
    g.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 1400 * desharse; i++) {
      const s = Math.sin(i * 12.9898) * 43758.5453, px = Math.floor((s - Math.floor(s)) * W), py = Math.floor(H - ((i * 7.31) % H) * desharse * 1.4);
      g.fillRect(px, py, 2, 2);
    }
    g.globalCompositeOperation = 'source-over';
  }
}
function dibujarFigura(f) {
  if (f.estado === 'oculta') return;
  const t = performance.now() / 1000;
  const fuerza = { surgiendo: f.t / FIGURA.surgir, presente: 1, disolviendo: 1 - f.t / FIGURA.disolver, eco: 0 }[f.estado];
  // Ondas en el agua, siempre (también en el eco).
  for (let i = 0; i < 3; i++) {
    const r = ((t * 0.45 + i / 3) % 1) * 1.3;
    elipse(f.x, f.y, r, null, `rgba(190,250,230,${(1 - r / 1.3) * (0.25 + 0.4 * fuerza)})`);
  }
  const [sx, sy] = pantalla(f.x, f.y, 0.1 + Math.sin(t * 1.5) * 0.05);
  const px = Math.round(sx - vista.cx), py = Math.round(sy - vista.cy);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const halo = ctx.createRadialGradient(px, py - 30, 2, px, py - 30, 46);
  halo.addColorStop(0, `rgba(140,240,210,${0.35 * fuerza + 0.05})`); halo.addColorStop(1, 'rgba(140,240,210,0)');
  ctx.fillStyle = halo; ctx.fillRect(px - 48, py - 78, 96, 96);
  if (fuerza > 0) {
    const sube = f.estado === 'surgiendo' ? fuerza : 1;
    pintarFigura(f.estado === 'disolviendo' ? 1 - fuerza : 0, t);
    const alto = Math.round(FIG_H * sube);
    ctx.globalAlpha = 0.25 * fuerza; // reflejo en el agua, aplastado
    ctx.drawImage(lienzoFigura, 0, 0, FIG_W, alto, px - FIG_W / 2, py + 2, FIG_W, Math.round(alto * 0.5));
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    ctx.drawImage(lienzoFigura, 0, 0, FIG_W, alto, px - FIG_W / 2, py - alto, FIG_W, alto);
  }
  // Motas de luz que suben; al deshacerse son muchas más.
  ctx.globalCompositeOperation = 'lighter';
  const motas = f.estado === 'disolviendo' ? 40 : f.estado === 'eco' ? 4 : 10;
  for (let i = 0; i < motas; i++) {
    const s = (t * (0.25 + (i % 5) * 0.06) + i * 0.137) % 1;
    ctx.fillStyle = `rgba(210,255,235,${(1 - s) * 0.8})`;
    ctx.fillRect(Math.round(px + Math.sin(i * 2.4 + t) * (8 + (i % 4) * 3)), Math.round(py - 4 - s * 70), 1 + (i % 2), 1 + (i % 2));
  }
  ctx.restore();
}
function nuevoFragmento(x, y) {
  return { tipo: 'fragmento', x, y, actualizar() {}, dibujar(f) {
    const t = performance.now() / 1000;
    elipse(f.x, f.y, 0.35 + Math.sin(t * 3) * 0.05, 'rgba(160,230,200,.25)');
    dibujar('Fragmento_Memoria_01', f.x, f.y, 0.15 + Math.sin(t * 2) * 0.08);
  } };
}

// Autocomprobación de reglas de Unity.
console.assert(Math.ceil(ENEMIGO.espiritu.vida / GUARDIANES.find((g) => g.id === 'quetzal').base.attack) === 3, 'Un espíritu cae de 3 golpes de Yaret a nivel 1');
console.assert(dano(10, 4) === 6 && dano(1, 5) === 1, 'Daño = golpe − defensa, mínimo 1');
