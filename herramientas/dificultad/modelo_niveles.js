(() => {
  // Modelo analítico de los niveles generados (DIFICULTAD.md). Perfil de cada tipo: vida, daño por segundo que intenta, qué
  // parte es evitable (avisada), esquiva propia y experiencia. Con VIDA_COMUN y la mordida avisada del espíritu (etapa 24).
  const V = (v) => (typeof vidaComun === 'function' ? vidaComun(v) : v);
  const F = (n) => FAUNA[n];
  const dpsFauna = (d) => d.attackDamage / (d.attackCooldown + d.attackWindup + d.attackRecover * 0.5);
  const T = {
    espiritu: { vida: V(ENEMIGO.espiritu.vida), dps: ENEMIGO.espiritu.contacto / 1.4, evitable: 0.65, esquiva: 0.25, xp: 15 },
    pecari: { vida: V(PECARI.vida), dps: PECARI.dano / 2.6, evitable: 0.65, esquiva: 0.25, xp: 8 },
    tapir: { vida: V(TAPIR.vida), dps: 12 / 3.2, evitable: 0.65, esquiva: 0, xp: 15 },
    ocelote: { vida: V(OCELOTE.vida), dps: (OCELOTE.salto.dano + 2 * OCELOTE.zarpazo.dano * 0.6) / 3.4, evitable: 0.6, esquiva: 0.4, xp: 8 },
    aullador: { vida: V(AULLADOR.vida), dps: AULLADOR.fruto.dano / 2.4 + AULLADOR.aullido.dano / 6.5, evitable: 0.65, esquiva: 0.25, xp: 8 },
    armadillo: { vida: V(ARMADILLO.vida), dps: ARMADILLO.excava.dano / 4.2, evitable: 0.7, esquiva: 0, xp: 8 },
  };
  for (const n of ['Serpiente', 'Cocodrilo', 'Mono', 'Avispa', 'Guacamaya', 'Murcielago']) T[n] = { vida: V(F(n).maxHealth), dps: dpsFauna(F(n)), evitable: 0.65, esquiva: n === 'Guacamaya' || n === 'Avispa' || n === 'Murcielago' ? 0.35 : 0.25, xp: 8 };
  const grupo = { pecari: 3, aullador: 2 };
  // Jugador: vida y ataque por nivel (Balam); dps efectivo = ataque × 1,2 golpes/s (moverse, esquivar, combos a medias).
  const g = GUARDIANES.find((x) => x.id === 'jaguar'), vidaN = (n) => Math.floor(g.base.maxHealth + g.crece.x * (n - 1)), atqN = (n) => Math.floor(g.base.attack + g.crece.y * (n - 1));
  let nivel = 2, xp = 0; // llega al 1-2 tras la aldea, la selva y el 1-1 (nivel 2 aprox.)
  const subir = (c) => { xp += c; while (xp >= xpParaSubir(nivel)) { xp -= xpParaSubir(nivel); nivel++; } };
  const filas = [];
  juego.flags['incursion.semilla'] = window.SEMILLA;
  let vidaAcum = null;
  for (const id of SECUENCIA.filter(esGenerado)) {
    const d = generarNivel(id), salas = d.puntos.salas;
    // Reparto de enemigos por sala (expandiendo manadas), más el tapir y el sub-jefe.
    const porSala = salas.map(() => []);
    for (const e of d.enemigos) { const i = salas.findIndex((s) => e.x >= s.x0 - 0.5 && e.x <= s.x1 + 0.5); for (let k = 0; k < (grupo[e.tipo] || 1); k++) porSala[Math.max(0, i)].push(e.tipo); }
    if (id === 'n1_5') porSala.at(-1).push('nauyaca');
    T.nauyaca = { vida: NAUYACA.vida, dps: NAUYACA.dano / 2.6 * 1.3, evitable: 0.65, esquiva: 0, xp: 150 };
    const dpsJ = atqN(nivel) * 1.2;
    let dano = 0, vidaTotal = 0, n = 0, segundos = 0, xpNivel = 0;
    for (const sala of porSala) {
      // Mata primero a los más débiles; cada enemigo sigue atacando mientras vive.
      const es = sala.map((t) => T[t]).sort((a, b) => a.vida - b.vida); let t = 0;
      for (const e of es) { const tMatar = e.vida / (dpsJ * (1 - e.esquiva * 0.5)); t += tMatar; dano += e.dps * (1 - e.evitable) * t; vidaTotal += e.vida; n++; xpNivel += e.xp; }
      segundos += t;
    }
    xpNivel += (typeof PRESUPUESTO !== 'undefined' ? 15 * +id[1] + 10 * +id[3] : 10 * +id[1] + 5 * +id[3]);
    const vmax = vidaN(nivel); if (vidaAcum == null) vidaAcum = vmax;
    // Santuarios de Vida: el del X-3 (si existe) a mitad del nivel, y el del 2-5 antes del 3-1.
    if (d.puntos.vida) vidaAcum = Math.min(vmax, vidaAcum + vmax / 2) - dano; else vidaAcum -= dano; // el santuario está en la primera sala
    if (id === 'n3_1') vidaAcum = Math.min(vmax, vidaAcum + vmax / 2); // santuario del 2-5 (antes de este nivel)
    let cae = 0; while (vidaAcum < 0) { cae++; vidaAcum += vmax; }
    if (typeof PRESUPUESTO !== 'undefined' && +id[3] % 2 === 0) vidaAcum = Math.min(vmax, vidaAcum + 20); // la semilla del nivel limpio
    if (typeof PRESUPUESTO !== 'undefined' && id === 'n1_5') vidaAcum = Math.min(vmax, vidaAcum + 40); // dos semillas de la nauyaca
    filas.push({ id, nivel: nombreNivel(id), enemigos: n, vidaEnemigos: vidaTotal, seg: Math.round(segundos), dano: Math.round(dano), vidaJugador: vmax, pct: Math.round((100 * dano) / vmax), resto: Math.round(vidaAcum), cae, nivelJ: nivel, tipos: porSala.flat().reduce((m, t) => ((m[t] = (m[t] || 0) + 1), m), {}) });
    subir(xpNivel);
    if (id === 'n1_4') subir(0); // (el 1-5 tiene la nauyaca, incluida arriba)
    if (id === 'n2_4') { subir(150 + 30 * 2); } // jaguar y ecos del 2-5
  }
  return filas;
})()
