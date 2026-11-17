'use strict';
// Efectos de golpe y ataque (etapa 26, solo HTML; ver PORTAR_A_UNITY.md): chispas, estrella de impacto, zarpazo, «!» de
// aviso, polvo y estela de los que van rápido. Al estilo de los juegos de acción de vista cenital (sin copiar arte de nadie):
// el golpe se lee por la forma y el color, no por el número.
const EF = {
  chispas: { n: 7, vel: 3.2, vida: 0.32, gravedad: 9 },
  impacto: 0.22, // estrella del golpe que recibe el jugador
  alerta: 0.55, // «!» sobre el enemigo que avisa
  pausaHerido: 0.05, // pausa de impacto al recibir daño (la del acierto del jugador ya existía)
  estela: { vel: 5.5, cada: 0.035, n: 4, salto: 2 }, // m/s mínimos, s entre copias, copias, m por cuadro que son teletransporte
  polvo: { cada: 0.09, vida: 0.4 },
  // Etapa 27: onda de los jefes y pesados al aterrizar (altura mínima del salto, m), número que bota.
  onda: { alto: 0.3, vida: 0.45, radio: 2.2, temblor: 0.2 },
  numero: { bote: 0.6, rebote: 0.15, grande: 11, normal: 8 },
};
// Restos al morir según el animal: colores, cuántos, gravedad y si planean (plumas) o caen (escamas, pelo, piedra).
const PELO = { colores: ['#8a5a32', '#c48a4a', '#5a3a22'], n: 12, grav: 7 };
const ESCAMA = { colores: ['#4f7a3a', '#9ab858', '#2f4a24'], n: 12, grav: 10, tam: 2 };
const RESTOS = {
  Guacamaya: { colores: ['#e03a2a', '#2a6ad8', '#f0c830'], n: 10, grav: 1.5, flota: true, tam: 3 },
  Murcielago: { colores: ['#3a2a3a', '#5a4a5a'], n: 8, grav: 2, flota: true, tam: 3 },
  Avispa: { colores: ['#f0c830', '#1a1a1a', '#e8f0ff'], n: 9, grav: 6 },
  Serpiente: ESCAMA, Cocodrilo: ESCAMA, nauyaca: ESCAMA, pejelagarto: { ...ESCAMA, colores: ['#6a7a5a', '#c8c0a0', '#3a4a3a'] },
  Mono: PELO, aullador: { ...PELO, colores: ['#3a2418', '#6a4028', '#1a120c'] }, pecari: { ...PELO, colores: ['#4a4038', '#8a8070', '#2a2420'] },
  tapir: { ...PELO, colores: ['#3a3a40', '#6a6a70'], n: 16 }, ocelote: { ...PELO, colores: ['#d8a050', '#2a1a10', '#f0e0c0'] },
  jaguar: { ...PELO, colores: ['#e0a030', '#2a1a10', '#ffe0a0'], n: 20 },
  armadillo: { colores: ['#8a8070', '#b8ae9a', '#5a5248'], n: 12, grav: 12, tam: 3 },
  guardian: { colores: ['#7a7a70', '#a8a898', '#4a4a44', '#7fe0b0'], n: 24, grav: 12, tam: 4 },
};
const restosDe = (e) => RESTOS[e.especie] || RESTOS[e.tipo] || { colores: ['#c9a8ff'], n: 14, grav: EF.chispas.gravedad }; // espíritus y ecos
function restos(e) {
  const R = restosDe(e), z = (e.z || 0) + (e.alto || 0) + 0.5;
  chispas(e.x, e.y, z, R.colores, null, R.n, 2.4, R);
  polvo(e.x, e.y, 0.5);
}

// Partículas con velocidad propia; ang = dirección principal (rad, en el suelo) o null para todas partes.
// color: uno o una lista (cada partícula elige); o: { grav, tam, flota } (las que flotan caen meciéndose y duran el triple).
function chispas(x, y, z, color, ang = null, n = EF.chispas.n, vel = EF.chispas.vel, o = {}) {
  const ps = [];
  for (let i = 0; i < n; i++) {
    const a = ang == null ? Math.random() * 2 * Math.PI : ang + (Math.random() - 0.5) * 1.6, v = vel * (0.5 + Math.random() * 0.7);
    ps.push({ vx: Math.cos(a) * v, vy: Math.sin(a) * v, vz: 1.5 + Math.random() * 2.5, color: Array.isArray(color) ? color[Math.floor(Math.random() * color.length)] : color, fase: Math.random() * 6 });
  }
  const dur = EF.chispas.vida * (o.flota ? 3 : o.grav ? 1.6 : 1); // los restos duran más que las chispas
  juego.efectos.push({ tipo: 'chispas', x, y, z, ps, t: dur, dur, grav: o.grav ?? EF.chispas.gravedad, tam: o.tam || 2, flota: !!o.flota });
}
const polvo = (x, y, r = 0.25) => juego.efectos.push({ tipo: 'polvo', x: x + (Math.random() - 0.5) * 0.2, y: y + (Math.random() - 0.5) * 0.2, r, t: EF.polvo.vida });
// Estrella de impacto en quien recibe el golpe, con tres zarpazos cruzados en la dirección del golpe.
const impacto = (x, y, z, ang, color = '#ff6a5a') => juego.efectos.push({ tipo: 'impacto', x, y, z, ang, color, t: EF.impacto });
const alerta = (e) => { if (!(e.alertaT > juego.t)) { e.alertaT = juego.t + EF.alerta; juego.efectos.push({ tipo: 'alerta', e, t: EF.alerta }); } };

// Cada cuadro, tras mover a los enemigos: polvo al correr por el suelo y estela al ir muy rápido.
function rastroEnemigos(dt) {
  if (dt <= 0) return;
  for (const e of juego.enemigos) {
    const p = e.prev || (e.prev = { x: e.x, y: e.y, t: 0, polvo: 0, cima: 0 }), d = Math.hypot(e.x - p.x, e.y - p.y);
    // Aterrizaje: los jefes y pesados hacen una onda que sacude; los demás, una nubecilla.
    const sobre = (e.z || 0) - (e.suelo ?? 0);
    if (sobre > 0.02) p.cima = Math.max(p.cima, sobre);
    else if (p.cima > 0) { if (p.cima > EF.onda.alto && !(e.alto > 0) && e.vida > 0) aterrizaje(e); p.cima = 0; }
    const v = d > EF.estela.salto ? 0 : d / dt; p.x = e.x; p.y = e.y; // un salto de varios metros es aparecer, no correr
    e.estela = e.estela || [];
    if (v > EF.estela.vel && e.vida > 0 && !e.oculto) {
      if ((p.t -= dt) <= 0) { p.t = EF.estela.cada; e.estela.unshift({ x: e.x, y: e.y, z: e.z || 0, vive: 0.18 }); e.estela.length = Math.min(e.estela.length, EF.estela.n); }
    }
    for (const s of e.estela) s.vive -= dt;
    e.estela = e.estela.filter((s) => s.vive > 0);
    if (v > 3 && !e.oculto && (e.z || 0) <= (e.suelo ?? 0) + 0.05 && !(e.alto > 0) && (p.polvo -= dt) <= 0) { p.polvo = EF.polvo.cada * (6 / v); polvo(e.x, e.y); }
  }
}

function aterrizaje(e) {
  if (e.jefe || e.pesado) {
    juego.efectos.push({ tipo: 'onda', x: e.x, y: e.y, t: EF.onda.vida });
    for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4; polvo(e.x + Math.cos(a) * 0.6, e.y + Math.sin(a) * 0.6, 0.35); }
    vista.temblor = Math.max(vista.temblor, EF.onda.temblor); sonar('impacto');
  } else for (let i = 0; i < 3; i++) polvo(e.x + (i - 1) * 0.25, e.y, 0.2);
}

// Número de daño: sale grande, bota una vez, rebota un poco y sube despacio mientras se apaga (dura 0,8 s).
function dibujarNumero(f) {
  const k = 0.8 - f.t, N = EF.numero, u = k / 0.3, v = (k - 0.3) / 0.2;
  const h = k < 0.3 ? N.bote * 4 * u * (1 - u) : k < 0.5 ? N.rebote * 4 * v * (1 - v) : (k - 0.5) * 0.6;
  const tam = Math.round(N.grande - (N.grande - N.normal) * Math.min(1, k / 0.12));
  texto(f.txt, f.x + (f.dx || 0) * Math.min(1, k / 0.5), f.y, 1.6 + h, f.color, Math.min(1, f.t * 2), tam);
}

// Estela: el mismo dibujo del enemigo en posiciones pasadas, translúcido y azulado. movimiento() no avanza mientras tanto.
function dibujarEstela(e) {
  if (!e.estela?.length) return;
  const { x, y, z } = e;
  juego.dibujandoEstela = true;
  for (const s of e.estela) {
    e.x = s.x; e.y = s.y; e.z = s.z;
    ctx.save(); ctx.globalAlpha = 0.35 * (s.vive / 0.18); ctx.filter = 'brightness(1.6) saturate(.3)';
    try { e.dibujar(e); } finally { ctx.restore(); }
  }
  e.x = x; e.y = y; e.z = z; juego.dibujandoEstela = false;
}

function dibujarEfecto(f) {
  if (f.tipo === 'chispas') {
    const k = f.dur - f.t, fr = f.flota ? Math.exp(-k * 3) : 1; // las plumas frenan y se mecen
    ctx.globalAlpha = Math.min(1, f.t / f.dur * 2);
    for (const p of f.ps) {
      const ex = f.flota ? Math.sin(k * 6 + p.fase) * 0.25 : 0, avance = f.flota ? (1 - fr) / 3 : k;
      const [sx, sy] = pantalla(f.x + p.vx * avance + ex, f.y + p.vy * avance * 0.5, f.z + Math.max(0, p.vz * avance - f.grav * k * k / 2));
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(sx - vista.cx) - 1, Math.round(sy - vista.cy) - 1, f.tam, f.flota ? Math.max(1, f.tam - 1) : f.tam);
    }
    ctx.globalAlpha = 1;
  } else if (f.tipo === 'onda') {
    const p = 1 - f.t / EF.onda.vida, r = EF.onda.radio * (0.2 + 0.8 * Math.sqrt(p));
    elipse(f.x, f.y, r, null, `rgba(255,240,200,${1 - p})`); elipse(f.x, f.y, r * 0.85, `rgba(200,180,140,${0.25 * (1 - p)})`);
  } else if (f.tipo === 'polvo') {
    const p = 1 - f.t / EF.polvo.vida;
    elipse(f.x, f.y, f.r * (0.6 + p), `rgba(200,180,140,${0.35 * (1 - p)})`, null, 0.05 + p * 0.3);
  } else if (f.tipo === 'impacto') {
    const p = 1 - f.t / EF.impacto, [sx, sy] = pantalla(f.x, f.y, f.z), cx = Math.round(sx - vista.cx), cy = Math.round(sy - vista.cy);
    ctx.save(); ctx.globalAlpha = 1 - p; ctx.translate(cx, cy);
    // Estrella de 8 puntas que se abre (el «¡pum!» de los juegos de bolsillo).
    const R = 6 + 10 * Math.sqrt(p), r = R * 0.38;
    ctx.beginPath();
    for (let i = 0; i < 16; i++) { const a = (i * Math.PI) / 8 + f.ang, l = i % 2 ? r : R; ctx.lineTo(Math.cos(a) * l, Math.sin(a) * l * 0.8); }
    ctx.closePath(); ctx.fillStyle = '#fff6d8'; ctx.fill(); ctx.strokeStyle = f.color; ctx.lineWidth = 1.5; ctx.stroke();
    // Tres zarpazos en la dirección del golpe, que se dibujan de un extremo a otro.
    ctx.rotate(f.ang); ctx.strokeStyle = f.color; ctx.lineWidth = 2; ctx.lineCap = 'round';
    const largo = 22 * Math.min(1, p * 3);
    for (const o of [-6, 0, 6]) { ctx.beginPath(); ctx.moveTo(-11, o - 4); ctx.quadraticCurveTo(0, o + 3, -11 + largo, o - 4); ctx.stroke(); }
    ctx.restore();
  } else if (f.tipo === 'alerta') {
    const e = f.e, p = 1 - f.t / EF.alerta, alto = e.jefe ? (e.tipo === 'guardian' ? 3.6 : 2.4) : 1.35 + (e.alto || 0);
    const [sx, sy] = pantalla(e.x, e.y, (e.z || 0) + alto), salto = p < 0.25 ? -6 * Math.sin((p / 0.25) * Math.PI) : 0;
    ctx.globalAlpha = Math.min(1, f.t * 6); ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
    const px = Math.round(sx - vista.cx), py = Math.round(sy - vista.cy + salto);
    ctx.fillStyle = '#000'; ctx.fillText('!', px + 1, py + 1); ctx.fillStyle = '#ffd23a'; ctx.fillText('!', px, py);
    ctx.globalAlpha = 1;
  }
}

// Autocomprobación: la chispa empieza en su punto y la estela ignora los teletransportes.
(() => {
  const g = typeof juego !== 'undefined' ? juego : null; if (!g) return;
  const antes = g.efectos, enemigos = g.enemigos;
  g.efectos = []; chispas(1, 2, 0, '#fff', 0, 3); console.assert(g.efectos[0].ps.length === 3 && g.efectos[0].x === 1, '[assert] chispas');
  const e = { x: 0, y: 0, vida: 1 }; g.enemigos = [e]; rastroEnemigos(1 / 60); e.x = 5; rastroEnemigos(1 / 60);
  console.assert(e.estela.length === 0, '[assert] estela: aparecer no deja estela');
  e.x = 5.2; rastroEnemigos(1 / 60); console.assert(e.estela.length === 1, '[assert] estela: 12 m/s deja estela');
  e.jefe = true; e.z = 1; rastroEnemigos(1 / 60); e.z = 0; g.efectos = []; rastroEnemigos(1 / 60);
  console.assert(g.efectos.some((f) => f.tipo === 'onda'), '[assert] onda al aterrizar un jefe');
  console.assert(restosDe({ tipo: 'fauna', especie: 'Guacamaya' }).flota && restosDe({ tipo: 'eco' }).colores[0] === '#c9a8ff', '[assert] restos');
  vista.temblor = 0;
  g.efectos = antes; g.enemigos = enemigos;
})();
