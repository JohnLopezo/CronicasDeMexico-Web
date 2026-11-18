// Jugador automático contra un jefe, con el bucle del juego avanzado a mano (1/60 s por paso, sin dibujar).
// window.PELEA(jefe, { nivel, vida, habilidad, semillas, maxSeg, cadencia, reaccion })  cadencia y reaccion: como en bot_grupo.js → { gana, seg, danoRecibido, golpes, vidaFinal, fase }
window.PELEA = function (jefe, o) {
  const j = juego.jugador;
  prog().nivel = o.nivel; prog().xp = 0; aplicarEstadisticas(true);
  j.max = estadisticas().vida; j.vida = Math.round(o.vida * j.max); j.inv = 0;
  prog().bolsa.semilla_preparada = o.semillas || 0; if (o.semillas && !prog().orden.includes('semilla_preparada')) prog().orden.push('semilla_preparada');
  juego.pausa = true; // el bucle real no actualiza; lo hacemos aquí
  const dt = 1 / 60, decididas = new Map(), visto = new Map(); let toque = 0, t = 0, danoRecibido = 0, golpes = 0, vidaAntes = j.vida, rnd = window.RND_BOT || Math.random;
  const vivo = () => jefe.vida > 0 && !['liberado'].includes(jefe.estado);
  const alcance = 1.0 + (jefe.r || 0.5);
  while (t < (o.maxSeg || 180) && j.vida > 0 && vivo()) {
    // --- Decidir ---
    let huye = null;
    for (const m of juego.marcas) {
      if (!enMarca(m, j)) continue;
      if (!decididas.has(m)) { decididas.set(m, rnd() < o.habilidad); visto.set(m, t); }
      if (decididas.get(m) && m.t < 0.45 && t - visto.get(m) >= (o.reaccion || 0)) { huye = m; break; }
    }
    for (const s of juego.disparos) {
      const d = Math.hypot(s.x - j.x, s.y - j.y), hacia = ((j.x - s.x) * s.vx + (j.y - s.y) * s.vy) > 0;
      if (d < 1.6 && hacia) { if (!decididas.has(s)) decididas.set(s, rnd() < o.habilidad); if (decididas.get(s)) { huye = { forma: 'proyectil', s }; break; } }
    }
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
      const d = dist(jefe, j);
      // Sale despacio de los avisos que aún no estallan; si no, se acerca y ataca.
      const aviso = juego.marcas.find((m) => enMarca(m, j));
      if (aviso && aviso.forma !== 'anillo') { const dd = Math.hypot(j.x - aviso.x, j.y - aviso.y) || 1; vx = (j.x - aviso.x) / dd; vy = (j.y - aviso.y) / dd; }
      // o.especial: usa el especial del arma a menos de 2,2 m del jefe (etapa 37)
      else if (o.especial && especialDe() && !(juego.esperaEspecial > 0) && prog().energia >= ESPECIAL.coste && d < 2.2 && j.espera <= 0 && jefe.golpeable !== false && (jefe.z || 0) < 0.6) { j.fx = (jefe.x - j.x) / d; j.fy = (jefe.y - j.y) / d; entrada.cuadroPrevio = performance.now() - 1; pedir('especial'); }
      else if (d > alcance) { vx = (jefe.x - j.x) / d; vy = (jefe.y - j.y) / d; }
      else if (jefe.golpeable !== false && (jefe.z || 0) < 0.6 && t >= toque) { toque = t + (o.cadencia || 0); j.fx = (jefe.x - j.x) / d; j.fy = (jefe.y - j.y) / d; entrada.cuadroPrevio = performance.now() - 1; pedir('atacar'); }
      if (j.vida < j.max * 0.35 && tiene('semilla_preparada') > 0 && !juego.dialogo) usarObjeto('semilla_preparada');
    }
    entrada.tx = vx; entrada.ty = -vy;
    // --- Avanzar un paso, como bucle() ---
    let escala = 1;
    if (juego.pausaGolpe > 0) { juego.pausaGolpe -= dt; escala = 0.05; } else if (juego.lento > 0) { juego.lento -= dt; escala = MOV.lentoEscala; }
    juego.esperaEspecial = Math.max(0, (juego.esperaEspecial || 0) - dt);
    actualizar(dt * escala);
    if (juego.dialogo) juego.dialogo = null; // mensajes de fase o de victoria: no esperar
    if (j.vida < vidaAntes) { danoRecibido += vidaAntes - j.vida; golpes++; }
    vidaAntes = j.vida; t += dt;
  }
  entrada.tx = entrada.ty = 0; juego.pausa = false;
  return { gana: !vivo(), seg: Math.round(t), danoRecibido, golpes, vidaFinal: j.vida, vidaMax: j.max, fase: jefe.fase || null, vidaJefe: Math.max(0, Math.round(jefe.vida)) };
};
