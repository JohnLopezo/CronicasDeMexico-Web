'use strict';
// Guardián de la Piedra Viva: jefe del piso 3, con tres fases (StoneGuardian.cs, valores de la escala ×10).

const GUARDIAN = { vida: 1100, r: 0.9, despierta: 6, vel: 1.6, espera: 1, aviso: 0.6, fuerte: 20, ligero: 10, embVel: 11, embLargo: 8,
  aturdido: 1.6, fragVel: 6, nombre: 'Guardián de la Piedra Viva' };

function nuevoGuardian(x, y, alMorir) {
  return { tipo: 'guardian', jefe: true, nombre: GUARDIAN.nombre, x, y, z: 0, vida: GUARDIAN.vida, max: GUARDIAN.vida, r: GUARDIAN.r,
    fx: 0, fy: -1, fase: 1, estado: 'dormido', pose: 'Sentado', cola: [], tc: 0, t: 0, hechos: 0, invul: 0, destello: 0, muriendo: 0,
    embiste: 0, paso: 0, kx: 0, ky: 0, vz: 0, gravedad: true, cdEsquiva: 0, esquivar: esquivarSaltando, alMorir, alHerir: cambioDeFase, actualizar: actualizarGuardian, dibujar: dibujarGuardian };
}
const escalaAviso = (g) => (g.fase >= 3 ? 0.75 : 1);
function mirarAlJugador(g) { const j = juego.jugador, d = dist(g, j) || 1; g.fx = (j.x - g.x) / d; g.fy = (j.y - g.y) / d; }
// Un ataque es una lista de pasos: cada uno hace algo y luego espera. Al acabar la lista, vuelve a acechar.
function atacar(g, pasos) { g.estado = 'ataca'; g.cola = pasos; g.tc = 0; }

function eligeAtaque(g, d) { // ChooseAttack
  const n = g.hechos + 1;
  if (g.fase >= 3 && n % 4 === 0) return 'furia';
  if (g.fase >= 2 && n % 3 === 0) return (n / 3) % 2 === 0 ? 'fragmentos' : 'ondas';
  if (n % 5 === 0) return 'rugido';
  if (d < 3) return n % 2 === 0 ? 'golpe' : 'zarpazo';
  if (g.fase >= 2 && n % 2 === 0) return 'fragmentos';
  return n % 4 === 1 ? 'salto' : 'embestida'; // el salto es solo de la versión HTML
}

function ataqueGuardian(g, cual) {
  const j = juego.jugador, w = GUARDIAN.aviso * escalaAviso(g), F = GUARDIAN.fuerte, L = GUARDIAN.ligero;
  const aviso = (forma, x, y, r, dur, dano, empuje) =>
    marca(forma, x, y, r, dur, (m) => { if (enMarca(m, juego.jugador)) herirJugador(dano, g, empuje); }, { dueno: g });
  if (cual === 'zarpazo') {
    mirarAlJugador(g); g.pose = 'Golpe';
    return [{ hacer: () => aviso('circulo', g.x + g.fx * 1.6, g.y + g.fy * 1.6, 1.6, w, F), espera: w + 0.5 }];
  }
  if (cual === 'golpe') { // golpe de tierra a su alrededor
    g.pose = 'Golpe';
    return [{ hacer: () => aviso('circulo', g.x, g.y, 3.5, w * 1.7, F), espera: w * 1.7 }, { hacer: () => { vista.temblor = 0.2; }, espera: 0.7 }];
  }
  if (cual === 'embestida') {
    mirarAlJugador(g); g.pose = 'Embestida';
    return [{ hacer: () => marca('franja', g.x, g.y, 1.6, w * 1.5, null, { dx: g.fx, dy: g.fy, largo: GUARDIAN.embLargo, dueno: g }), espera: w * 1.5 },
      { hacer: () => { g.embiste = GUARDIAN.embLargo; g.acerto = false; } }];
  }
  if (cual === 'ondas') { // primero el anillo cercano y luego el lejano: hay que salir de uno sin entrar en el otro
    g.pose = 'Rugido';
    return [{ hacer: () => aviso('anillo', g.x, g.y, 3.5, w * 1.3, L), espera: w * 1.3 },
      { hacer: () => aviso('anillo', g.x, g.y, 7, w * 1.3 * 0.85, L), espera: w * 1.3 * 0.85 + 0.5 }];
  }
  if (cual === 'fragmentos') { // cinco en abanico de 60° hacia el jugador
    mirarAlJugador(g); g.pose = 'Rugido';
    return [{ espera: w * 1.2 }, { hacer: () => {
      const a0 = Math.atan2(g.fy, g.fx); sonar('disparo');
      for (let i = 0; i < 5; i++) {
        const a = a0 + ((-30 + 15 * i) * Math.PI) / 180;
        juego.disparos.push({ x: g.x + Math.cos(a) * 0.8, y: g.y + Math.sin(a) * 0.8, vx: Math.cos(a) * GUARDIAN.fragVel,
          vy: Math.sin(a) * GUARDIAN.fragVel, t: 3, golpe: L, color: '#bdb69e', z: 1 });
      }
    }, espera: 0.6 }];
  }
  if (cual === 'salto') { // se agacha, salta y cae donde estabas al avisar: un círculo amplio que hay que abandonar
    mirarAlJugador(g); g.pose = 'Golpe';
    const dur = w * SALTO_GUARDIAN.aviso, hacia = destinoSalto(g, j.x, j.y);
    return [{ hacer: () => { aviso('circulo', hacia.x, hacia.y, SALTO_GUARDIAN.radio, dur, F, 1.6); g.salto = { desde: { x: g.x, y: g.y }, hacia, t: 0, dur }; }, espera: dur },
      { hacer: () => { vista.temblor = 0.3; sonar('impacto'); g.pose = 'Golpe'; }, espera: 0.9 }]; // al caer queda expuesto
  }
  if (cual === 'rugido') { // empuja
    g.pose = 'Rugido';
    return [{ hacer: () => aviso('circulo', g.x, g.y, 3, w * 1.5, L, 2.4), espera: w * 1.5 + 0.5 }];
  }
  // Furia de la Primera Piedra: dos tandas de tres zonas, una sobre el jugador y dos alrededor, para que esquivar a ciegas no baste.
  g.pose = 'Rugido';
  const tanda = (dur) => () => {
    for (let i = 0; i < 3; i++) {
      const a = Math.random() * Math.PI * 2, r = i ? 1.8 + Math.random() * 1.4 : 0;
      aviso('circulo', j.x + Math.cos(a) * r, j.y + Math.sin(a) * r, 1.3, dur, F);
    }
  };
  const w1 = GUARDIAN.aviso * 1.7, w2 = w1 * 0.85;
  return [{ hacer: tanda(w1), espera: w1 }, { hacer: tanda(w2), espera: w2 + 0.6 }];
}

// Salto (solo HTML): el aviso dura 1,6 veces el normal y vuela en sus últimos 0,5 s, hasta 2 m de alto.
const SALTO_GUARDIAN = { aviso: 1.6, vuelo: 0.5, alto: 2, radio: 1.8 };
// Si donde estabas hay una columna, cae en el último punto libre del camino.
function destinoSalto(g, x, y) {
  for (let k = 1; k >= 0; k -= 0.1) { const px = g.x + (x - g.x) * k, py = g.y + (y - g.y) * k; if (!bloqueado(px, py, g.r)) return { x: px, y: py }; }
  return { x: g.x, y: g.y };
}
function avanzarSalto(g, dt) {
  const s = g.salto; s.t += dt;
  const p = clamp((s.t - (s.dur - SALTO_GUARDIAN.vuelo)) / SALTO_GUARDIAN.vuelo, 0, 1);
  if (p > 0) { g.pose = 'Embestida'; g.x = s.desde.x + (s.hacia.x - s.desde.x) * p; g.y = s.desde.y + (s.hacia.y - s.desde.y) * p; }
  g.z = (g.suelo ?? 0) + Math.sin(p * Math.PI) * SALTO_GUARDIAN.alto;
  if (p >= 1) { g.z = g.suelo ?? 0; g.vz = 0; g.salto = null; }
}

// Fases por vida: 2 al 60 % y 3 al 25 %. Al cambiar, ruge invulnerable 1,2 s y en la fase 2 sube el agua del borde.
function cambioDeFase(g) {
  const f = g.vida / g.max, fase = f <= 0.25 ? 3 : f <= 0.6 ? 2 : 1;
  if (fase <= g.fase || g.vida <= 0) return;
  g.fase = fase; g.embiste = 0; if (g.salto) { g.salto = null; g.z = g.suelo ?? 0; }
  juego.marcas = juego.marcas.filter((m) => m.dueno !== g);
  g.invul = 1.2; g.pose = 'Rugido'; vista.temblor = 0.3; sonar('rugido');
  if (fase >= 2) juego.inundado = true;
  if (g.estado === 'dormido') juego.jefe = g;
  atacar(g, [{ espera: 1.2 }]);
}

function actualizarGuardian(g, dt) {
  const j = juego.jugador, d = dist(g, j);
  g.destello = Math.max(0, g.destello - dt); g.invul = Math.max(0, g.invul - dt); g.cdEsquiva = Math.max(0, g.cdEsquiva - dt);
  if (g.estado === 'liberado') return;
  if (g.estado === 'dormido') {
    if (d < GUARDIAN.despierta && j.vida > 0) { g.estado = 'acecho'; g.t = GUARDIAN.espera; g.pose = 'Erguido'; juego.jefe = g; sonar('rugido'); }
    return;
  }
  if (g.embiste > 0) { // la embestida mueve al Guardián; si choca con una columna o el borde, queda aturdido
    const paso = Math.min(g.embiste, GUARDIAN.embVel * dt), x0 = g.x, y0 = g.y;
    mover(g, g.fx * paso, g.fy * paso, g.r);
    g.embiste -= paso;
    if (!g.acerto && dist(g, j) < g.r + 0.6) g.acerto = herirJugador(GUARDIAN.fuerte, g, 1.5);
    if (Math.hypot(g.x - x0, g.y - y0) < paso * 0.5) { g.embiste = 0; g.pose = 'Sentado'; vista.temblor = 0.25; sonar('impacto'); atacar(g, [{ espera: GUARDIAN.aturdido }]); }
    else if (g.embiste <= 0) atacar(g, [{ espera: 0.6 }]);
    return;
  }
  if (g.estado === 'ataca') {
    if (g.salto) avanzarSalto(g, dt);
    g.tc -= dt;
    while (g.tc <= 0 && g.cola.length) {
      const p = g.cola.shift();
      p.hacer?.();
      g.tc += p.espera || 0;
      if (g.embiste > 0) return;
    }
    if (g.tc <= 0 && !g.cola.length) { g.estado = 'acecho'; g.hechos++; g.t = GUARDIAN.espera * (g.fase >= 3 ? 0.7 : 1); g.pose = 'Erguido'; }
    return;
  }
  if (j.vida <= 0) return;
  // En el aire de una esquiva (acechando): cae y retrocede; el siguiente ataque espera a que aterrice.
  if (g.z > (g.suelo ?? 0) || g.vz > 0) {
    g.vz -= 20 * dt; g.z = Math.max(g.suelo ?? 0, g.z + g.vz * dt);
    mover(g, g.kx * dt, g.ky * dt, g.r); g.kx *= 0.85; g.ky *= 0.85; g.t = Math.max(g.t, 0.3);
    return;
  }
  mirarAlJugador(g);
  g.mov = d > 2.2;
  if (g.mov) { const v = GUARDIAN.vel * (enAgua(g.x, g.y) ? 0.55 : 1) * dt; mover(g, g.fx * v, g.fy * v, g.r); g.paso += dt; }
  if ((g.t -= dt) <= 0) atacar(g, ataqueGuardian(g, eligeAtaque(g, d)));
}

// Figura del Chac Mool: Jefe_GuardianOfrenda_* de Unity (Sprites/Jefes, de recortar_jefes.py), solo de lado, volteada según
// hacia dónde mira y a escala 1,5. Si faltara, se usa el Guardián de Unity.
const FIGURA_CHACMOOL = { Sentado: 'Reposo', Erguido: 'Reposo', Paso: 'Avance', Golpe: 'Avance', Embestida: 'Ataque', Rugido: 'Especial', Liberado: 'Desplome' };
const ESCALA_CHACMOOL = 1.5;
function dibujarGuardian(g) {
  elipse(g.x, g.y, 1.1, '#0007', null, g.suelo ?? g.z);
  const pose = g.estado === 'liberado' ? 'Liberado' : g.estado === 'acecho' && g.mov && Math.floor(g.paso * 3) % 2 ? 'Paso' : g.pose;
  const quieto = pose === 'Sentado' || pose === 'Liberado'; // solo tienen una vista
  const chac = `Jefe_${g.figura || 'GuardianOfrenda'}_${FIGURA_CHACMOOL[pose] || 'Reposo'}1_03`;
  const n = SPRITES[chac] ? chac : quieto ? `Guardian_Piedra_${pose}_01` : `Guardian_Piedra_${pose}_${direccion5(g.fx, g.fy)}`;
  // Dormido: apagado, como una estatua; al caminar se mece un poco.
  const filtro = g.destello > 0 ? 'brightness(2.2)' : g.roto > 0 ? ROTO_FILTRO : g.invul > 0 ? 'brightness(1.4) saturate(1.6)' : pose === 'Sentado' && SPRITES[chac] ? 'grayscale(0.7) brightness(0.8)' : null;
  const z = g.z + (pose === 'Paso' && SPRITES[chac] ? 0.08 : 0);
  // Movimiento por código: respira, camina con peso, se echa atrás al avisar y se lanza al embestir.
  const mov = g.estado === 'dormido' || g.estado === 'liberado' ? ['Reposo'] : g.embiste > 0 ? ['Correr'] : g.estado === 'ataca' ? (pose === 'Embestida' || pose === 'Golpe' ? ['Aviso', 0.8] : ['Aviso', 0.5])
    : g.mov ? ['Caminar'] : ['Reposo'];
  // Partes (js/cuadros.js): en la embestida los puños se alzan mientras avisa y golpean al lanzarse.
  g.embisteDesde = g.embiste > 0 ? g.embisteDesde || juego.t : 0;
  const fase = g.embiste > 0 ? { golpe: juego.t - g.embisteDesde } : g.estado === 'ataca' ? { aviso: 1 } : {};
  dibujar(n, g.x, g.y, z, { espejo: g.fx < 0 && !(quieto && !SPRITES[chac]), filtro, escala: SPRITES[chac] ? ESCALA_CHACMOOL : null, lienzo: conPartes(g, n, fase), ...(g.salto ? {} : movimiento(g, 'guardian', ...mov)) });
}

// Autocomprobación: el orden de ataques de StoneGuardian.ChooseAttack.
console.assert(eligeAtaque({ hechos: 4, fase: 1 }, 5) === 'rugido' && eligeAtaque({ hechos: 0, fase: 1 }, 2) === 'zarpazo'
  && eligeAtaque({ hechos: 2, fase: 2 }, 5) === 'ondas' && eligeAtaque({ hechos: 0, fase: 1 }, 5) === 'salto'
  && eligeAtaque({ hechos: 1, fase: 1 }, 5) === 'embestida' && eligeAtaque({ hechos: 3, fase: 3 }, 5) === 'furia', 'Guardián: orden de ataques');
