// Etapa 49: la mazmorra maya, piso 2 (cámaras de estuco). Del 1-4 al 2-1, suelo pintado del piso 12, estrado maya en el 2-2,
// santuario en el 2-3, el murciélago de la muerte en el 2-4, la misión y el aviso del piso 3. Uso:
// node herramientas/dificultad/prueba.mjs "file:///…/index.html" <salida> herramientas/dificultad/etapa49.mjs
export default async ({ ev, espera, foto, log }) => {
  const kd = (k) => ev(`dispatchEvent(new KeyboardEvent('keydown',{key:'${k}'}))`), ku = (k) => ev(`dispatchEvent(new KeyboardEvent('keyup',{key:'${k}'}))`);
  const cerrar = async () => { for (let i = 0; i < 80 && await ev('!!juego.dialogo'); i++) { await kd('Enter'); await ku('Enter'); await espera(30); } };
  const limpiar = async () => { for (let k = 0; k < 30 && await ev(`vivos().length > 0`); k++) { await ev(`vivos().forEach((e) => { e.cdEsquiva = 9; e.golpeable = true; e.oculto = false; herirEnemigo(e, 999, juego.jugador); })`); await espera(150); } await espera(600); await cerrar(); };
  const bajar = async () => { const p = JSON.parse(await ev(`JSON.stringify(juego.portales.find((t) => t.punto === 'llegada_arriba'))`)); await ev(`juego.jugador.x = ${p.x - 1.5}; juego.jugador.y = ${p.y}`); await espera(250); await ev(`juego.jugador.x = ${p.x}; juego.jugador.y = ${p.y}`); await espera(1800); await cerrar(); };
  const ok = (c, t) => log(`${c ? 'BIEN' : 'MAL '} ${t}`);
  await ev(`localStorage.clear(); document.getElementById('nueva').click()`); await espera(400);
  await ev(`document.querySelector('[data-elegir=jaguar]').click()`); await espera(1800); await cerrar();
  await ev(`poner('olm.guardian_liberado'); poner('may.camino_agua'); juego.prog.nivel = 8; aplicarEstadisticas(true); cargarRegion('palenque', 'desde_mazmorra', estadisticas().vida)`); await espera(1800); await cerrar();
  await ev(`juego.interactuables.find((i) => i.texto === 'Boca del acueducto').usar()`); await cerrar(); await espera(1800); await cerrar();
  for (const id of ['m1_1', 'm1_2', 'm1_3', 'm1_4']) { await limpiar(); await bajar(); }
  ok(await ev(`juego.region === 'm2_1' && juego.misiones.MP_MAY_03.paso === 3`), `2-1, cámaras de estuco: ${await ev('objetivo()')}`);
  ok(await ev(`mundo.d.piso === 12 && $('zona').textContent.includes('2-1')`), `piso 12 y marcador: ${await ev(`$('zona').textContent`)}`);
  await espera(600); await foto('49_m2_1');
  for (const id of ['m2_1', 'm2_2', 'm2_3']) {
    const info = JSON.parse(await ev(`JSON.stringify({ tipos: [...new Set(juego.enemigos.map((e) => e.especie || e.tipo))], arma: juego.otros.find((o) => o.tipo === 'arma')?.arma || null, vida: !!REGIONES['${id}'].puntos.vida })`));
    log(`[prueba] ${id}: ${JSON.stringify(info)}`);
    if (id === 'm2_2') ok(info.arma && (await ev(`ARMAS['${info.arma}']?.cultura === 'maya'`)), `estrado del 2-2 con arma maya (${info.arma})`);
    if (id === 'm2_3') ok(info.vida, 'santuario de Vida en el 2-3');
    await limpiar(); await bajar();
  }
  ok(await ev(`juego.region === 'm2_4' && juego.jefe?.nombre === 'Murciélago de la muerte' && !$('jefe').classList.contains('oculto')`), 'el 2-4: el murciélago de la muerte, con su barra');
  await ev(`juego.jugador.x = juego.jefe.x - 3; juego.jugador.y = juego.jefe.y`); await espera(1200); await foto('49_murcielago');
  ok(await ev(`objetivoEnMapa() === juego.jefe`), 'el mapa marca al jefe');
  await limpiar(); await cerrar();
  ok(await ev(`bandera('may.subjefe_2_vencido') && juego.misiones.MP_MAY_03.paso === 4`), `murciélago vencido: ${await ev('objetivo()')}`);
  const p = JSON.parse(await ev(`JSON.stringify(juego.portales.find((t) => t.punto === 'llegada_arriba'))`));
  await ev(`juego.jugador.x = ${p.x - 1.5}; juego.jugador.y = ${p.y}`); await espera(250); await ev(`juego.jugador.x = ${p.x}; juego.jugador.y = ${p.y}`); await espera(400);
  ok(await ev(`juego.region === 'm2_4' && !!juego.dialogo && juego.dialogo.lineas[0].includes('próxima etapa')`), 'la bajada del 2-4 avisa que el piso 3 viene después'); await cerrar();
  await ev(`juego.jugador.vida = 0`); await espera(2600); await cerrar();
  ok(await ev(`juego.region === 'palenque'`), 'al caer, a Palenque');
};
