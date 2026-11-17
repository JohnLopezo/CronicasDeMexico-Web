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
};

// Partículas con velocidad propia; ang = dirección principal (rad, en el suelo) o null para todas partes.
function chispas(x, y, z, color, ang = null, n = EF.chispas.n, vel = EF.chispas.vel) {
  const ps = [];
  for (let i = 0; i < n; i++) {
    const a = ang == null ? Math.random() * 2 * Math.PI : ang + (Math.random() - 0.5) * 1.6, v = vel * (0.5 + Math.random() * 0.7);
    ps.push({ vx: Math.cos(a) * v, vy: Math.sin(a) * v, vz: 1.5 + Math.random() * 2.5 });
  }
  juego.efectos.push({ tipo: 'chispas', x, y, z, color, ps, t: EF.chispas.vida, dur: EF.chispas.vida });
}
const polvo = (x, y, r = 0.25) => juego.efectos.push({ tipo: 'polvo', x: x + (Math.random() - 0.5) * 0.2, y: y + (Math.random() - 0.5) * 0.2, r, t: EF.polvo.vida });
// Estrella de impacto en quien recibe el golpe, con tres zarpazos cruzados en la dirección del golpe.
const impacto = (x, y, z, ang, color = '#ff6a5a') => juego.efectos.push({ tipo: 'impacto', x, y, z, ang, color, t: EF.impacto });
const alerta = (e) => { if (!(e.alertaT > juego.t)) { e.alertaT = juego.t + EF.alerta; juego.efectos.push({ tipo: 'alerta', e, t: EF.alerta }); } };

// Cada cuadro, tras mover a los enemigos: polvo al correr por el suelo y estela al ir muy rápido.
function rastroEnemigos(dt) {
  if (dt <= 0) return;
  for (const e of juego.enemigos) {
    const p = e.prev || (e.prev = { x: e.x, y: e.y, t: 0, polvo: 0 }), d = Math.hypot(e.x - p.x, e.y - p.y);
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
    const k = f.dur - f.t;
    ctx.fillStyle = f.color; ctx.globalAlpha = Math.min(1, f.t / f.dur * 2);
    for (const p of f.ps) {
      const [sx, sy] = pantalla(f.x + p.vx * k, f.y + p.vy * k * 0.5, f.z + Math.max(0, p.vz * k - EF.chispas.gravedad * k * k / 2));
      ctx.fillRect(Math.round(sx - vista.cx) - 1, Math.round(sy - vista.cy) - 1, 2, 2);
    }
    ctx.globalAlpha = 1;
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
  g.efectos = antes; g.enemigos = enemigos;
})();
