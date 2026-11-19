// Etapa 48: la mazmorra maya, piso 1. Boca del acueducto, incursión nueva con el arma maya, los cuatro niveles (estrado
// maya, santuario en el 1-3), el cocodrilo de pantano en el 1-4, la misión, el mapa y la caída a Palenque. Uso:
// node herramientas/dificultad/prueba.mjs "file:///…/index.html" <salida> herramientas/dificultad/etapa48.mjs
export default async ({ ev, espera, foto, log }) => {
  const kd = (k) => ev(`dispatchEvent(new KeyboardEvent('keydown',{key:'${k}'}))`), ku = (k) => ev(`dispatchEvent(new KeyboardEvent('keyup',{key:'${k}'}))`);
  const cerrar = async () => { for (let i = 0; i < 80 && await ev('!!juego.dialogo'); i++) { await kd('Enter'); await ku('Enter'); await espera(30); } };
  const usar = (texto) => ev(`(()=>{ const i = juego.interactuables.find((i) => i.texto === '${texto}'); if (!i) return false; i.usar(); return true; })()`);
  const limpiar = async () => { for (let k = 0; k < 30 && await ev(`vivos().length > 0`); k++) { await ev(`vivos().forEach((e) => { e.cdEsquiva = 9; e.golpeable = true; e.oculto = false; herirEnemigo(e, 999, juego.jugador); })`); await espera(150); } await espera(600); await cerrar(); };
  const bajar = async () => { const p = JSON.parse(await ev(`JSON.stringify(juego.portales.find((t) => t.punto === 'llegada_arriba'))`)); await ev(`juego.jugador.x = ${p.x - 1.5}; juego.jugador.y = ${p.y}`); await espera(250); await ev(`juego.jugador.x = ${p.x}; juego.jugador.y = ${p.y}`); await espera(1800); await cerrar(); };
  const ok = (c, t) => log(`${c ? 'BIEN' : 'MAL '} ${t}`);
  await ev(`localStorage.clear(); document.getElementById('nueva').click()`); await espera(400);
  await ev(`document.querySelector('[data-elegir=jaguar]').click()`); await espera(1800); await cerrar();

  // Sin el camino del agua la boca solo se examina; con él, se entra.
  await ev(`poner('olm.guardian_liberado'); cargarRegion('palenque', 'desde_mazmorra', 50)`); await espera(1800); await cerrar();
  ok(await usar('Boca del acueducto'), 'la boca del acueducto está en la plaza'); await cerrar();
  ok(await ev(`juego.region === 'palenque'`), 'sin el camino del agua no se entra');
  await ev(`poner('may.camino_agua'); juego.prog.nivel = 6; aplicarEstadisticas(true); cargarRegion('palenque', 'desde_mazmorra', estadisticas().vida)`); await espera(1800); await cerrar();
  ok(await ev(`!!juego.misiones.MP_MAY_03 && objetivoEnMapa()?.texto === 'Boca del acueducto'`), 'misión El camino del agua; el mapa marca la boca');
  await foto('48_boca');
  await usar('Boca del acueducto'); await cerrar(); await espera(1800); await cerrar();
  ok(await ev(`juego.region === 'm1_1' && enMano()?.id === 'lanza_maya'`), 'entra al 1-1 maya con la lanza de pedernal');
  ok(await ev(`juego.misiones.MP_MAY_03.paso === 1`), `objetivo: ${await ev('objetivo()')}`);
  await espera(500); await foto('48_m1_1');
  ok(await ev(`objetivoEnMapa()?.punto === 'llegada_arriba'`), 'en el nivel, el mapa marca la bajada');

  for (const id of ['m1_1', 'm1_2', 'm1_3']) {
    const info = JSON.parse(await ev(`JSON.stringify({ tipos: [...new Set(juego.enemigos.map((e) => e.especie || e.tipo))], arma: juego.otros.find((o) => o.tipo === 'arma')?.arma || null, vida: !!REGIONES['${id}'].puntos.vida })`));
    log(`[prueba] ${id}: ${JSON.stringify(info)}`);
    if (id === 'm1_2') ok(info.arma && (await ev(`ARMAS['${info.arma}']?.cultura === 'maya'`)), `estrado del 1-2 con arma maya (${info.arma})`);
    if (id === 'm1_3') ok(info.vida, 'santuario de Vida en el 1-3');
    await limpiar(); await bajar();
  }
  ok(await ev(`juego.region === 'm1_4' && juego.jefe?.nombre === 'Cocodrilo de pantano' && !$('jefe').classList.contains('oculto')`), 'el 1-4: el cocodrilo de pantano, con su barra');
  await ev(`juego.jugador.x = juego.jefe.x - 3; juego.jugador.y = juego.jefe.y`); await espera(900); await foto('48_cocodrilo');
  ok(await ev(`objetivoEnMapa() === juego.jefe`), 'el mapa marca al jefe');
  await limpiar(); await cerrar();
  ok(await ev(`bandera('may.subjefe_1_vencido') && juego.misiones.MP_MAY_03.paso === 2`), `cocodrilo vencido: ${await ev('objetivo()')}`);
  const p = JSON.parse(await ev(`JSON.stringify(juego.portales.find((t) => t.punto === 'llegada_arriba'))`));
  await ev(`juego.jugador.x = ${p.x - 1.5}; juego.jugador.y = ${p.y}`); await espera(250); await ev(`juego.jugador.x = ${p.x}; juego.jugador.y = ${p.y}`); await espera(1800); await cerrar();
  ok(await ev(`juego.region === 'm2_1'`), 'la bajada del 1-4 lleva al piso 2 (etapa 49)');
  // Caer en la mazmorra maya: a Palenque, junto al santuario.
  await ev(`juego.jugador.vida = 0`); await espera(2600); await cerrar();
  ok(await ev(`juego.region === 'palenque'`), 'al caer, a Palenque');
};
