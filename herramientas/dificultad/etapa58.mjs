// Etapa 58: el ciclo de día y noche y los dioses del altar de la cueva. La hora avanza y se guarda, el HUD la muestra, la
// luz de fuera cambia; en el 3-4 despierta el dios del momento (noche: fuego; día: tormenta; amanecer: serpiente), se
// libera y cierra MP_TEO_03; liberado, queda en paz; al atardecer el altar duerme. Uso:
// node herramientas/dificultad/prueba.mjs "file:///…/index.html" <salida> herramientas/dificultad/etapa58.mjs
export default async ({ ev, espera, foto, log }) => {
  const kd = (k) => ev(`dispatchEvent(new KeyboardEvent('keydown',{key:'${k}'}))`), ku = (k) => ev(`dispatchEvent(new KeyboardEvent('keyup',{key:'${k}'}))`);
  const cerrar = async () => { for (let i = 0; i < 80 && await ev('!!juego.dialogo'); i++) { await kd('Enter'); await ku('Enter'); await espera(30); } };
  const limpiar = async () => { for (let k = 0; k < 40 && await ev(`vivos().length > 0`); k++) { await ev(`vivos().forEach((e) => { e.cdEsquiva = 9; e.golpeable = true; e.oculto = false; e.invul = 0; herirEnemigo(e, 999, juego.jugador); })`); await espera(150); await cerrar(); } await espera(600); await cerrar(); };
  const hora = (t) => ev(`juego.flags['ciclo.t'] = ${t}`);
  const altar = async () => { await ev(`(()=>{ const i = juego.interactuables.find((i) => i.texto === 'Examinar el altar'); juego.jugador.x = i.x; juego.jugador.y = i.y - 0.5; i.usar(); })()`); await cerrar(); await espera(300); };
  const ok = (c, t) => log(`${c ? 'BIEN' : 'MAL '} ${t}`);
  await ev(`localStorage.clear(); document.getElementById('nueva').click()`); await espera(400);
  await ev(`document.querySelector('[data-elegir=jaguar]').click()`); await espera(1800); await cerrar();

  // El ciclo: empieza de día, avanza, cambia de momento con aviso y se guarda.
  ok(await ev(`momentoActual() === 'dia' && $('hora').textContent.includes('Día')`), `empieza de día (${await ev("$('hora').textContent")})`);
  await hora(719.5); await espera(1200);
  ok(await ev(`momentoActual() === 'atardecer' && $('hora').textContent.includes('Atardecer') && $('toast').textContent.includes('Atardecer')`), 'pasa al atardecer, con aviso');
  await ev(`cargarRegion('teotihuacan', 'llegada', 50)`); await espera(1500); await cerrar();
  await hora(1200); await espera(800); await foto('58_noche');
  await hora(500); await espera(500); await foto('58_dia');
  await ev(`juego.flags['ciclo.t'] = 1300; guardar()`);
  ok(await ev(`JSON.parse(localStorage.getItem(CLAVE)).flags['ciclo.t'] >= 1300`), 'la hora se guarda con la partida');

  // El altar de noche: el Dios Viejo del Fuego.
  await ev(`poner('teo.camino_cueva'); empezarMision('MP_TEO_03'); for (const a of ['llegar:cueva_teo', 'vencer:cascabel_cueva', 'llegar:teo_piso2', 'vencer:jaguar_reticulado', 'llegar:teo_piso3']) avisar(a);
    juego.prog.nivel = 12; aplicarEstadisticas(true); entrarMazmorraMaya('t3_4')`); await espera(1800); await cerrar();
  await limpiar(); await hora(1300);
  ok(await ev(`juego.misiones.MP_TEO_03.paso === 5 && !juego.portales.find((t) => t.a === 'teotihuacan').abierto()`), `en el 3-4, la salida cerrada: ${await ev('objetivo()')}`);
  await altar();
  ok(await ev(`juego.enemigos.some((e) => e.nombre === 'Dios Viejo del Fuego' && e.figura === 'GuardianOfrenda' && e.vida > 1000)`), 'de noche despierta el Dios Viejo del Fuego');
  await ev(`(()=>{ const g = juego.enemigos.find((e) => e.nombre === 'Dios Viejo del Fuego'); juego.jugador.x = g.x - 3; juego.jugador.y = g.y; })()`); await espera(1500); await foto('58_fuego');
  ok(await ev(`juego.jefe?.nombre === 'Dios Viejo del Fuego' && !$('jefe').classList.contains('oculto')`), 'con su barra de jefe');
  await limpiar(); await cerrar();
  ok(await ev(`bandera('teo.dios_fuego') && bandera('teo.bendicion_fuego') && !!juego.misiones.MP_TEO_03.hecha`), 'liberado: cierra MP_TEO_03 y deja la bendición del fuego');
  ok(await ev(`juego.portales.find((t) => t.a === 'teotihuacan').abierto()`), 'la salida se abre');
  await altar();
  ok(await ev(`!juego.enemigos.some((e) => e.vida > 1 && e.jefe)`), 'ya liberado, el altar queda en paz');

  // Otra incursión, de día: el Dios de la Tormenta; al amanecer, la Serpiente Emplumada; al atardecer, el altar duerme.
  for (const [t, nombre, figura] of [[500, 'Dios de la Tormenta', 'SenorLluvia'], [100, 'Serpiente Emplumada', 'SerpienteEmplumada']]) {
    await ev(`entrarMazmorraMaya('t3_4')`); await espera(1800); await cerrar(); await limpiar(); await hora(t);
    await altar();
    ok(await ev(`juego.enemigos.some((e) => e.nombre === '${nombre}' && e.figura === '${figura}')`), `a su hora despierta ${nombre}`);
    await ev(`(()=>{ const g = juego.enemigos.find((e) => e.nombre === '${nombre}'); juego.jugador.x = g.x - 3; juego.jugador.y = g.y; })()`); await espera(1500); await foto(`58_${figura}`);
  }
  await ev(`entrarMazmorraMaya('t3_4')`); await espera(1800); await cerrar(); await limpiar(); await hora(800);
  await altar();
  ok(await ev(`!juego.enemigos.some((e) => e.jefe && e.vida > 1) && juego.portales.find((t) => t.a === 'teotihuacan').abierto()`), 'al atardecer el altar duerme y la salida se abre');
};
