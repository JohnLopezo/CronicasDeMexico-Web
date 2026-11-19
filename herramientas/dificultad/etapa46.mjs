// Etapa 46: fauna de Chiapas en Palenque (jaguar, mono araña, tucán, tapir). Cada uno aparece, se acerca o ataca, recibe
// daño y muere; el ocelote y el aullador siguen igual. Capturas de cada uno. Uso:
// node herramientas/dificultad/prueba.mjs "file:///…/index.html" <salida> herramientas/dificultad/etapa46.mjs
export default async ({ ev, espera, foto, log }) => {
  const kd = (k) => ev(`dispatchEvent(new KeyboardEvent('keydown',{key:'${k}'}))`), ku = (k) => ev(`dispatchEvent(new KeyboardEvent('keyup',{key:'${k}'}))`);
  const cerrar = async () => { for (let i = 0; i < 60 && await ev('!!juego.dialogo'); i++) { await kd('Enter'); await ku('Enter'); await espera(30); } };
  const ok = (c, t) => log(`${c ? 'BIEN' : 'MAL '} ${t}`);
  await ev(`localStorage.clear(); document.getElementById('nueva').click()`); await espera(400);
  await ev(`document.querySelector('[data-elegir=jaguar]').click()`); await espera(1800); await cerrar();
  await ev(`poner('olm.guardian_liberado'); cargarRegion('palenque', 'llegada', 50)`); await espera(1800); await cerrar();
  const cuenta = JSON.parse(await ev(`JSON.stringify(juego.enemigos.reduce((t, e) => (t[e.tipo] = (t[e.tipo] || 0) + 1, t), {}))`));
  ok(cuenta.jaguar_selva === 1 && cuenta.mono_arana === 3 && cuenta.tucan === 2 && cuenta.tapir === 1 && cuenta.aullador === 2, `en Palenque: ${JSON.stringify(cuenta)}`);

  // Uno a uno: los demás fuera; el jugador invulnerable mira qué hace cada uno en 4 s.
  for (const tipo of ['jaguar_selva', 'mono_arana', 'tucan', 'tapir', 'aullador']) {
    const r = JSON.parse(await ev(`(()=>{ const j = juego.jugador; j.x = 12; j.y = -1; j.vida = j.max = 9999;
      juego.enemigos.forEach((e) => { e.vida = 0; e.muriendo = 0; }); juego.marcas = []; juego.disparos = [];
      const nuevo = { jaguar_selva: nuevoJaguarSelva, mono_arana: nuevoMonoArana, tucan: nuevoTucan, tapir: nuevoTapir, aullador: nuevoAullador }['${tipo}'];
      const e = nuevo(15.5, -1); juego.enemigos.push(e); window._e = e; window._vida0 = j.vida; window._marcas = 0; window._disparos = 0;
      return JSON.stringify({ vida: e.vida }); })()`));
    for (let k = 0; k < 16; k++) { await espera(250); await ev(`window._marcas += juego.marcas.length ? 1 : 0; window._disparos += juego.disparos.length ? 1 : 0`); if (k === 8) await foto(`46_${tipo}`); }
    const a = JSON.parse(await ev(`JSON.stringify({ estado: _e.estado, hirio: juego.jugador.vida < _vida0, marcas: _marcas, disparos: _disparos, z: +(_e.z || 0).toFixed(2) })`));
    ok(a.hirio || a.marcas || a.disparos, `${tipo}: ataca (avisos ${a.marcas}, proyectiles ${a.disparos}, hirió ${a.hirio}, estado ${a.estado}, altura ${a.z})`);
    for (let k = 0; k < 20 && await ev(`_e.vida > 0`); k++) { await ev(`_e.cdEsquiva = 9; herirEnemigo(_e, 30, juego.jugador)`); await espera(120); }
    ok(await ev(`_e.vida <= 0`), `${tipo}: muere`);
  }
  ok(await ev(`nuevoMonoArana(0, 0).aulla === Infinity && Number.isFinite(nuevoAullador(0, 0).aulla)`), 'el mono araña no aúlla; el aullador sí');
  ok(await ev(`nuevoOcelote(0, 0).D === OCELOTE && nuevoOcelote(0, 0).tipo === 'ocelote'`), 'el ocelote sigue igual');
};
