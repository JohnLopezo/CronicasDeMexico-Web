// Etapa 50: la mazmorra maya, piso 3 (el observatorio). Del 2-4 al 3-1, suelo del piso 13, estrado y santuario, el Guardián
// de los Ciclos en el 3-4 (despierta, barra, mapa, vencido arrodillado), la misión cumplida y la salida a Palenque. Uso:
// node herramientas/dificultad/prueba.mjs "file:///…/index.html" <salida> herramientas/dificultad/etapa50.mjs
export default async ({ ev, espera, foto, log }) => {
  const kd = (k) => ev(`dispatchEvent(new KeyboardEvent('keydown',{key:'${k}'}))`), ku = (k) => ev(`dispatchEvent(new KeyboardEvent('keyup',{key:'${k}'}))`);
  const cerrar = async () => { for (let i = 0; i < 80 && await ev('!!juego.dialogo'); i++) { await kd('Enter'); await ku('Enter'); await espera(30); } };
  const limpiar = async () => { for (let k = 0; k < 40 && await ev(`vivos().length > 0`); k++) { await ev(`vivos().forEach((e) => { e.cdEsquiva = 9; e.golpeable = true; e.oculto = false; e.invul = 0; herirEnemigo(e, 999, juego.jugador); })`); await espera(150); } await espera(600); await cerrar(); };
  const bajar = async () => { const p = JSON.parse(await ev(`JSON.stringify(juego.portales.at(-1))`)); await ev(`juego.jugador.x = ${p.x - 1.5}; juego.jugador.y = ${p.y}`); await espera(250); await ev(`juego.jugador.x = ${p.x}; juego.jugador.y = ${p.y}`); await espera(1800); await cerrar(); };
  const ok = (c, t) => log(`${c ? 'BIEN' : 'MAL '} ${t}`);
  await ev(`localStorage.clear(); document.getElementById('nueva').click()`); await espera(400);
  await ev(`document.querySelector('[data-elegir=jaguar]').click()`); await espera(1800); await cerrar();
  await ev(`poner('olm.guardian_liberado'); poner('may.camino_agua'); juego.prog.nivel = 10; aplicarEstadisticas(true); cargarRegion('palenque', 'desde_mazmorra', estadisticas().vida)`); await espera(1800); await cerrar();
  await ev(`juego.interactuables.find((i) => i.texto === 'Boca del acueducto').usar()`); await cerrar(); await espera(1800); await cerrar();
  for (let i = 0; i < 8; i++) { await limpiar(); await bajar(); }
  ok(await ev(`juego.region === 'm3_1' && juego.misiones.MP_MAY_03.paso === 5`), `3-1, el observatorio: ${await ev('objetivo()')}`);
  ok(await ev(`mundo.d.piso === 13 && $('zona').textContent.includes('3-1')`), `piso 13 y marcador: ${await ev(`$('zona').textContent`)}`);
  await espera(600); await foto('50_m3_1');
  for (const id of ['m3_1', 'm3_2', 'm3_3']) {
    const info = JSON.parse(await ev(`JSON.stringify({ tipos: [...new Set(juego.enemigos.map((e) => e.especie || e.tipo))], arma: juego.otros.find((o) => o.tipo === 'arma')?.arma || null, vida: !!REGIONES['${id}'].puntos.vida })`));
    log(`[prueba] ${id}: ${JSON.stringify(info)}`);
    if (id === 'm3_2') ok(info.arma && (await ev(`ARMAS['${info.arma}']?.cultura === 'maya'`)), `estrado del 3-2 con arma maya (${info.arma})`);
    if (id === 'm3_3') ok(info.vida, 'santuario de Vida en el 3-3');
    await limpiar(); await bajar();
  }
  ok(await ev(`juego.region === 'm3_4' && juego.enemigos.some((e) => e.nombre === 'Guardián de los Ciclos' && e.estado === 'dormido')`), 'el 3-4: el Guardián de los Ciclos espera dormido');
  await ev(`(() => { const g = juego.enemigos.find((e) => e.tipo === 'guardian'); juego.jugador.x = g.x - 4; juego.jugador.y = g.y; })()`); await espera(1500);
  ok(await ev(`juego.jefe?.nombre === 'Guardián de los Ciclos' && juego.jefe.max === 1500 && !$('jefe').classList.contains('oculto')`), 'despierta, con su barra y 1500 de vida');
  ok(await ev(`objetivoEnMapa() === juego.jefe`), 'el mapa marca al jefe');
  await foto('50_guardian');
  await limpiar(); await cerrar();
  ok(await ev(`bandera('may.guardian_ciclos_vencido') && juego.misiones.MP_MAY_03.hecha && juego.enemigos.find((e) => e.tipo === 'guardian').estado === 'liberado'`), 'vencido: arrodillado y la misión cumplida');
  await espera(300); await foto('50_vencido');
  await bajar();
  ok(await ev(`juego.region === 'palenque' && Math.hypot(juego.jugador.x - BOCA.llegada.x, juego.jugador.y - BOCA.llegada.y) < 1.5`), 'la escalera de la torre sale a la plaza de Palenque');
};
