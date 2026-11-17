// Jugador automático contra un grupo: siempre va a por el enemigo vivo más cercano. Mismo bucle a mano que bot.js.
// window.GRUPO(enemigos, { habilidad, maxSeg, orilla }) → { limpio, seg, dano, golpes, vida }  (no toca nivel ni vida del jugador)
window.GRUPO = function (grupo, o) {
  const j = juego.jugador;
  juego.pausa = true;
  const dt = 1 / 60, decididas = new Map(); let t = 0, dano = 0, golpes = 0, antes = j.vida, rnd = Math.random;
  const vivos = () => grupo.filter((e) => e.vida > 0 && juego.enemigos.includes(e));
  while (t < (o.maxSeg || 120) && j.vida > 0 && vivos().length) {
    const vs = vivos(), b = vs.reduce((a, e) => (dist(e, j) < dist(a, j) ? e : a), vs[0]), alcance = 1.0 + (b.r || 0.4);
    let huye = null;
    for (const m of juego.marcas) { if (!enMarca(m, j)) continue; if (!decididas.has(m)) decididas.set(m, rnd() < o.habilidad); if (decididas.get(m) && m.t < 0.45) { huye = m; break; } }
    for (const s of juego.disparos) { const d = Math.hypot(s.x - j.x, s.y - j.y), hacia = ((j.x - s.x) * s.vx + (j.y - s.y) * s.vy) > 0; if (d < 1.6 && hacia) { if (!decididas.has(s)) decididas.set(s, rnd() < o.habilidad); if (decididas.get(s)) { huye = { forma: 'proyectil', s }; break; } } }
    // Contacto sin aviso (espíritu, cocodrilo, carga…): se aparta del que se le echa encima con la misma probabilidad.
    if (!huye) for (const e of vs) if (dist(e, j) < (e.r || 0.4) + 0.6 && (e.estado === 'golpe' || e.estado === 'carga' || e.ataca > 0)) { if (!decididas.has(e.estado + e.t.toFixed?.(1))) decididas.set(e.estado + e.t.toFixed?.(1), rnd() < o.habilidad * 0.6); if (decididas.get(e.estado + e.t.toFixed?.(1))) huye = { forma: 'circulo', x: e.x, y: e.y, t: 0.1 }; }
    let vx = 0, vy = 0;
    if (huye) {
      let ex, ey;
      if (huye.forma === 'franja') { const px = -huye.dy, py = huye.dx, lado = Math.sign((j.x - huye.x) * px + (j.y - huye.y) * py) || 1; ex = px * lado; ey = py * lado; }
      else if (huye.forma === 'proyectil') { const l = Math.hypot(huye.s.vx, huye.s.vy) || 1; ex = -huye.s.vy / l; ey = huye.s.vx / l; }
      else if (huye.forma === 'anillo') { const d = Math.hypot(j.x - huye.x, j.y - huye.y) || 1, dentro = d < huye.r * 0.75; ex = ((j.x - huye.x) / d) * (dentro ? -1 : 1); ey = ((j.y - huye.y) / d) * (dentro ? -1 : 1); }
      else { const d = Math.hypot(j.x - huye.x, j.y - huye.y) || 1; ex = (j.x - huye.x) / d; ey = (j.y - huye.y) / d; }
      vx = ex; vy = ey;
      if (j.cargas > 0 && j.esq <= 0 && (huye.t ?? 0.2) < 0.3) { entrada.tx = vx; entrada.ty = -vy; entrada.cuadroPrevio = performance.now() - 1; pedir('esquivar'); }
    } else {
      const d = dist(b, j), aviso = juego.marcas.find((m) => enMarca(m, j));
      if (aviso && aviso.forma !== 'anillo') { const dd = Math.hypot(j.x - aviso.x, j.y - aviso.y) || 1; vx = (j.x - aviso.x) / dd; vy = (j.y - aviso.y) / dd; }
      else if (d > alcance) { vx = (b.x - j.x) / d; vy = (b.y - j.y) / d; if (o.orilla && enAgua(j.x + vx * 0.35, j.y + vy * 0.35)) { vx = vy = 0; } } // o.orilla: no se mete al agua (etapa 25)
      else if (b.golpeable !== false && (b.z || 0) + (b.alto || 0) < 1.4) { j.fx = (b.x - j.x) / d; j.fy = (b.y - j.y) / d; entrada.cuadroPrevio = performance.now() - 1; pedir('atacar'); }
      else if (b.golpeable === false) { vx = (j.x - b.x) / (d || 1) * 0.3; vy = (j.y - b.y) / (d || 1) * 0.3; } // bajo tierra: espera
      if (j.vida < j.max * 0.35 && tiene('semilla_preparada') > 0) usarObjeto('semilla_preparada');
    }
    entrada.tx = vx; entrada.ty = -vy;
    let escala = 1;
    if (juego.pausaGolpe > 0) { juego.pausaGolpe -= dt; escala = 0.05; } else if (juego.lento > 0) { juego.lento -= dt; escala = MOV.lentoEscala; }
    actualizar(dt * escala);
    if (juego.dialogo) juego.dialogo = null;
    for (const t2 of juego.portales) t2.armado = false; // que el bot no cruce portales
    if (j.vida < antes) { dano += antes - j.vida; golpes++; }
    antes = j.vida; t += dt;
  }
  entrada.tx = entrada.ty = 0; juego.pausa = false;
  return { limpio: !vivos().length, seg: +t.toFixed(1), dano, golpes, vida: j.vida };
};
// Grupos de un mapa: enemigos a menos de 4,5 m de otro del grupo (las vasijas y los jefes, fuera).
window.GRUPOS = function () {
  const es = juego.enemigos.filter((e) => e.vida > 0 && e.tipo !== 'vasija' && !e.jefe && e.golpeable !== false), grupos = [];
  for (const e of es) { const g = grupos.find((g) => g.some((o) => dist(o, e) < 4.5)); g ? g.push(e) : grupos.push([e]); }
  return grupos;
};
