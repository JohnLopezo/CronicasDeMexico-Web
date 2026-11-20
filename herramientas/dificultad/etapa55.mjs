// Etapa 55: la cueva bajo la Pirámide del Sol (mazmorra teotihuacana, piso 1). Boca cerrada y abierta, misión, los cuatro
// niveles (estrado, santuario en el 1-3), la cascabel de la cueva en el 1-4, el mapa, la salida a la plaza y la caída. Uso:
// node herramientas/dificultad/prueba.mjs "file:///…/index.html" <salida> herramientas/dificultad/etapa55.mjs
export default async ({ ev, espera, foto, log }) => {
  const kd = (k) => ev(`dispatchEvent(new KeyboardEvent('keydown',{key:'${k}'}))`), ku = (k) => ev(`dispatchEvent(new KeyboardEvent('keyup',{key:'${k}'}))`);
  const cerrar = async () => { for (let i = 0; i < 80 && await ev('!!juego.dialogo'); i++) { await kd('Enter'); await ku('Enter'); await espera(30); } };
  const usar = (texto) => ev(`(()=>{ const i = juego.interactuables.find((i) => i.texto === '${texto}'); if (!i) return false; i.usar(); return true; })()`);
  const limpiar = async () => { for (let k = 0; k < 30 && await ev(`vivos().length > 0`); k++) { await ev(`vivos().forEach((e) => { e.cdEsquiva = 9; e.golpeable = true; e.oculto = false; herirEnemigo(e, 999, juego.jugador); })`); await espera(150); } await espera(600); await cerrar(); };
  const bajar = async () => { const p = JSON.parse(await ev(`JSON.stringify(juego.portales.find((t) => t.punto === 'llegada_arriba'))`)); await ev(`juego.jugador.x = ${p.x - 1.5}; juego.jugador.y = ${p.y}`); await espera(250); await ev(`juego.jugador.x = ${p.x}; juego.jugador.y = ${p.y}`); await espera(1800); await cerrar(); };
  const ok = (c, t) => log(`${c ? 'BIEN' : 'MAL '} ${t}`);
  await ev(`localStorage.clear(); document.getElementById('nueva').click()`); await espera(400);
  await ev(`document.querySelector('[data-elegir=jaguar]').click()`); await espera(1800); await cerrar();

  // Sin el camino de la cueva, la boca solo se examina; con él, se entra.
  await ev(`cargarRegion('teotihuacan', 'desde_mazmorra', 50)`); await espera(1800); await cerrar();
  ok(await usar('Boca de la cueva'), 'la boca de la cueva está en la plaza'); await cerrar();
  ok(await ev(`juego.region === 'teotihuacan'`), 'sin el camino de la cueva no se entra');
  await ev(`juego.jugador.y = 2.5`); await espera(500); await foto('55_boca');
  // El comerciante recuerda los caminos y manda a la cueva (MP_TEO_02 → MP_TEO_03).
  await ev(`for (const k of ['teo.ruta_tallador_teo', 'teo.ruta_zapoteco', 'teo.ruta_mercadera_teo']) poner(k); empezarMision('MP_TEO_02'); avisar('hablar:ruta'); avisar('hablar:ruta'); avisar('hablar:ruta'); cargarRegion('barrio_teo', 'llegada', 50)`); await espera(1800); await cerrar();
  await ev(`conversar(juego.otros.find((o) => o.id === 'comerciante_teo'))`); await cerrar();
  ok(await ev(`bandera('teo.camino_cueva') && !!juego.misiones.MP_TEO_03`), `el comerciante manda a la cueva: ${await ev('objetivo()')}`);
  await ev(`juego.prog.nivel = 8; aplicarEstadisticas(true); cargarRegion('teotihuacan', 'desde_mazmorra', estadisticas().vida)`); await espera(1800); await cerrar();
  ok(await ev(`objetivoEnMapa()?.texto === 'Boca de la cueva'`), 'el mapa marca la boca');
  await usar('Boca de la cueva'); await cerrar(); await espera(1800); await cerrar();
  ok(await ev(`juego.region === 't1_1' && $('zona').textContent.includes('1-1')`), `entra al 1-1 de la cueva (${await ev("$('zona').textContent")})`);
  ok(await ev(`juego.misiones.MP_TEO_03.paso === 1`), `objetivo: ${await ev('objetivo()')}`);
  await espera(500); await foto('55_t1_1');

  for (const id of ['t1_1', 't1_2', 't1_3']) {
    const info = JSON.parse(await ev(`JSON.stringify({ tipos: [...new Set(juego.enemigos.map((e) => e.especie || e.tipo))], arma: juego.otros.find((o) => o.tipo === 'arma')?.arma || null, vida: !!REGIONES['${id}'].puntos.vida })`));
    log(`[prueba] ${id}: ${JSON.stringify(info)}`);
    if (id === 't1_3') ok(info.vida, 'santuario de Vida en el 1-3');
    if (id === 't1_2') { await espera(300); await foto('55_t1_2'); }
    await limpiar(); await bajar();
  }
  ok(await ev(`juego.region === 't1_4' && juego.jefe?.nombre === 'Cascabel de la cueva' && !$('jefe').classList.contains('oculto')`), 'el 1-4: la cascabel de la cueva, con su barra');
  await ev(`juego.jugador.x = juego.jefe.x - 3; juego.jugador.y = juego.jefe.y`); await espera(900); await foto('55_cascabel');
  ok(await ev(`objetivoEnMapa() === juego.jefe`), 'el mapa marca al jefe');
  await limpiar(); await cerrar();
  ok(await ev(`bandera('teo.subjefe_1_vencido') && juego.misiones.MP_TEO_03.paso === 2`), `cascabel vencida: ${await ev('objetivo()')}`);
  const p = JSON.parse(await ev(`JSON.stringify(juego.portales.find((t) => t.a === 'teotihuacan' && t.abierto))`));
  await ev(`juego.jugador.x = ${p.x - 1.5}; juego.jugador.y = ${p.y}`); await espera(250); await ev(`juego.jugador.x = ${p.x}; juego.jugador.y = ${p.y}`); await espera(1800); await cerrar();
  ok(await ev(`juego.region === 'teotihuacan' && Math.hypot(juego.jugador.x - 10, juego.jugador.y - 4.1) < 0.6`), 'la salida del 1-4 vuelve a la plaza, junto a la boca');
  // Caer en la cueva: al santuario de Teotihuacan.
  await usar('Boca de la cueva'); await cerrar(); await espera(1800); await cerrar();
  await ev(`juego.jugador.vida = 0`); await espera(2600); await cerrar();
  ok(await ev(`juego.region === 'teotihuacan' && Math.hypot(juego.jugador.x + 15.5, juego.jugador.y - 1.2) < 0.5`), 'al caer en la cueva, al santuario de Teotihuacan');
};
