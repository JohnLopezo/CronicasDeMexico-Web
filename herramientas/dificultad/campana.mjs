// Campaña simulada de la mazmorra, del 1-1 al 3-5, sin atajos de nivel: el bot (perfil celular) limpia cada nivel, toma el
// arma del estrado y abre el cofre, pelea con los jefes y baja por el portal de verdad. La experiencia, la vida (entre
// niveles no se cura) y los objetos van de un nivel al siguiente. Uso:
// node herramientas/dificultad/prueba.mjs "file:///…/index.html" <salida> herramientas/dificultad/campana.mjs
// Variables: HAB (0.5), CAD (0.3), REAC (0.3), ARMERO (id del arma del armero, vacío = ninguna).
import fs from 'node:fs';
export default async ({ ev, espera, log }) => {
  const kd = (k) => ev(`dispatchEvent(new KeyboardEvent('keydown',{key:'${k}'}))`), ku = (k) => ev(`dispatchEvent(new KeyboardEvent('keyup',{key:'${k}'}))`);
  const cerrar = async () => { for (let i = 0; i < 60 && await ev('!!juego.dialogo'); i++) { await kd('Enter'); await ku('Enter'); await espera(25); } };
  await ev(`localStorage.clear(); document.getElementById('nueva').click()`); await espera(400);
  await ev(`document.querySelector('[data-elegir=jaguar]').click()`); await espera(1800); await cerrar();
  await ev(fs.readFileSync(new URL('./bot_grupo.js', import.meta.url), 'utf8'));
  await ev(fs.readFileSync(new URL('./bot_jefe.js', import.meta.url), 'utf8'));
  const HAB = process.env.HAB || 0.5, CAD = process.env.CAD || 0.3, REAC = process.env.REAC || 0.3;
  await ev(`poner('mision.MP_OLM_03.completada'); poner('mision.MP_OLM_03.activa'); poner('olm.sello_abierto');
    ${process.env.ARMERO ? `juego.flags['armero.eleccion']='${process.env.ARMERO}'; darArmaDelArmero();` : ''}`);
  await ev(`cargarRegion('p1','llegada_arriba',juego.jugador.vida)`); await espera(1300); await cerrar();
  const JEFE = { n1_5: 'nauyaca', p2: 'jaguar', p3: 'guardian' };
  log('nivel | nv del jugador | vida al llegar → al salir | caídas | segundos | armas al salir | qué pasó');
  for (let paso = 0; paso < 16; paso++) {
    const id = await ev('juego.region');
    const r = JSON.parse(await ev(`(()=>{ const j = juego.jugador, notas = [], llega = j.vida + '/' + j.max; let caidas = 0, seg = 0;
      const revivir = () => { if (j.vida <= 0) { caidas++; j.vida = j.max; j.muerto = 0; } };
      // Arma del estrado: se toma.
      for (const it of juego.interactuables.slice()) if (/^Tomar /.test(it.texto)) { it.usar(); notas.push(it.texto.replace('Tomar ', '')); }
      // Grupos comunes.
      for (const g of GRUPOS()) {
        const c = { x: g.reduce((a, e) => a + e.x, 0) / g.length, y: g.reduce((a, e) => a + e.y, 0) / g.length };
        let p = null; for (const [dx, dy] of [[-3,0],[3,0],[0,-3],[0,3],[-2,-2],[2,2],[-2,2],[2,-2]]) if (!bloqueado(c.x + dx, c.y + dy, 0.3)) { p = { x: c.x + dx, y: c.y + dy }; break; }
        if (!p) { notas.push('grupo sin sitio libre al lado'); continue; }
        j.x = p.x; j.y = p.y; j.inv = 0; juego.marcas = []; juego.disparos = [];
        for (const e of g) if (e.alerta === false) e.alerta = true;
        const res = GRUPO(g, { habilidad: ${HAB}, cadencia: ${CAD}, reaccion: ${REAC}, maxSeg: 90, especial: true, dispara: true }); seg += res.seg;
        if (!res.limpio && j.vida > 0) notas.push('grupo sin limpiar en 90 s');
        revivir();
      }
      // Jefe.
      const tipo = ${JSON.stringify(JEFE)}[juego.region], jefe = tipo && juego.enemigos.find((e) => e.tipo === tipo && e.vida > 0);
      if (jefe) {
        // Como una persona: antes del jefe, el santuario de Vida si lo hay y queda encendido.
        const santuario = juego.interactuables.find((i) => i.texto === 'Santuario de Vida');
        if (santuario) { const antes = j.vida; santuario.usar(); if (j.vida > antes) notas.push('santuario +' + (j.vida - antes)); }
        // Hasta 3 intentos: al caer se vuelve con la vida llena (en el juego, desde la aldea).
        for (let intento = 1; intento <= 3 && jefe.vida > 0 && jefe.estado !== 'liberado'; intento++) {
          const p = prog(), nv = p.nivel, xp = p.xp; juego.marcas = []; juego.disparos = [];
          j.x = jefe.x - 3.5; j.y = jefe.y; if (bloqueado(j.x, j.y, 0.3)) j.x = jefe.x + 3.5;
          const vi = j.vida / j.max, f = PELEA(jefe, { nivel: nv, vida: vi, habilidad: ${HAB}, semillas: p.bolsa.semilla_preparada || 0, cadencia: ${CAD}, reaccion: ${REAC}, especial: true });
          p.nivel = nv; p.xp = Math.max(p.xp, xp); aplicarEstadisticas();
          notas.push(tipo + ' intento ' + intento + ' (llega con ' + Math.round(100 * vi) + ' %): ' + (f.gana ? 'vencido en ' + f.seg + ' s' : 'NO (le queda ' + Math.round(jefe.vida) + ')')); seg += f.seg;
          revivir();
        }
      }
      // Los que GRUPOS() no vio (bajo el agua o bajo tierra en ese momento): uno a uno, esperando a que salgan.
      const vivosAhora = () => juego.enemigos.filter((e) => e.vida > 0 && e.tipo !== 'vasija' && !e.jefe);
      for (const e of vivosAhora()) {
        notas.push('rezagado: ' + (e.especie || e.tipo) + (e.golpeable === false ? ' (no golpeable)' : ''));
        j.x = e.x - 2.5; j.y = e.y; if (bloqueado(j.x, j.y, 0.3)) j.x = e.x + 2.5; if (e.alerta === false) e.alerta = true;
        seg += GRUPO([e], { habilidad: ${HAB}, cadencia: ${CAD}, reaccion: ${REAC}, maxSeg: 60, especial: true, dispara: true }).seg; revivir();
      }
      const quedan = vivosAhora().map((e) => (e.especie || e.tipo) + '@' + e.x.toFixed(1) + ',' + e.y.toFixed(1) + (e.golpeable === false ? ' no golpeable' : ''));
      if (quedan.length) notas.push('QUEDAN: ' + quedan.join(' '));
      // Cofre de recompensas: se abre si salió.
      for (const it of juego.interactuables.slice()) if (it.texto === 'Abrir el cofre') { it.usar(); notas.push('cofre'); }
      return JSON.stringify({ nv: prog().nivel, llega, sale: j.vida + '/' + j.max, caidas, seg: Math.round(seg), armas: textoArmas() || '—', notas }); })()`));
    await cerrar();
    // Bajada: el portal hacia el siguiente nivel; el jugador se pone encima y el juego viaja solo.
    const bajada = await ev(`(()=>{ const t = juego.portales.find((t) => t.punto === 'llegada_arriba'); if (!t) return 'sin bajada';
      if (t.abierto && !t.abierto()) return 'bajada cerrada'; const j = juego.jugador; j.x = t.x; j.y = t.y; t.armado = true; return t.a; })()`);
    log(`${id} | ${r.nv} | ${r.llega} → ${r.sale} | ${r.caidas} | ${r.seg} | ${r.armas} | ${r.notas.join('; ')}${bajada.startsWith('sin') || bajada.startsWith('bajada') ? ' | ' + bajada : ''}`);
    if (id === 'p3') { log('final: ' + await ev(`JSON.stringify({ guardianLiberado: bandera('olm.guardian_liberado'), ofrendaFinal: juego.interactuables.some((i) => /ofrenda/i.test(i.texto)), objetivo: objetivo() })`)); break; }
    if (bajada.startsWith('sin') || bajada.startsWith('bajada')) break;
    for (let i = 0; i < 40 && await ev(`juego.region`) === id; i++) await espera(100);
    await espera(400); await cerrar();
    if (await ev('juego.region') === id) { log(`${id}: el portal hacia ${bajada} no llevó a ningún sitio`); break; }
  }
};
