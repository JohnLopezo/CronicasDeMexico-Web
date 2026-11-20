// Etapa 57: la cueva, pisos 2 (el túnel de los espejos) y 3 (la cámara de las cuatro flores). Del 1-4 al 2-1, los ocho
// niveles, el jaguar reticulado en el 2-4, el altar de los dioses en el 3-4, la misión, la salida y la caída. Uso:
// node herramientas/dificultad/prueba.mjs "file:///…/index.html" <salida> herramientas/dificultad/etapa57.mjs
export default async ({ ev, espera, foto, log }) => {
  const kd = (k) => ev(`dispatchEvent(new KeyboardEvent('keydown',{key:'${k}'}))`), ku = (k) => ev(`dispatchEvent(new KeyboardEvent('keyup',{key:'${k}'}))`);
  const cerrar = async () => { for (let i = 0; i < 80 && await ev('!!juego.dialogo'); i++) { await kd('Enter'); await ku('Enter'); await espera(30); } };
  const limpiar = async () => { for (let k = 0; k < 30 && await ev(`vivos().length > 0`); k++) { await ev(`vivos().forEach((e) => { e.cdEsquiva = 9; e.golpeable = true; e.oculto = false; herirEnemigo(e, 999, juego.jugador); })`); await espera(150); } await espera(600); await cerrar(); };
  const pasar = async (punto) => { const p = JSON.parse(await ev(`JSON.stringify(juego.portales.find((t) => t.punto === '${punto}'))`)); await ev(`juego.jugador.x = ${p.x - 1.5}; juego.jugador.y = ${p.y}`); await espera(250); await ev(`juego.jugador.x = ${p.x}; juego.jugador.y = ${p.y}`); await espera(1800); await cerrar(); };
  const ok = (c, t) => log(`${c ? 'BIEN' : 'MAL '} ${t}`);
  await ev(`localStorage.clear(); document.getElementById('nueva').click()`); await espera(400);
  await ev(`document.querySelector('[data-elegir=jaguar]').click()`); await espera(1800); await cerrar();

  // MP_TEO_03 tras la cascabel; se entra por el 1-4 ya vencido y se baja al piso 2.
  await ev(`poner('teo.camino_cueva'); poner('teo.subjefe_1_vencido'); poner('incursion.limpio.t1_4'); empezarMision('MP_TEO_03'); avisar('llegar:cueva_teo'); avisar('vencer:cascabel_cueva');
    juego.prog.nivel = 10; aplicarEstadisticas(true); entrarMazmorraMaya('t1_4')`); await espera(1800); await cerrar();
  await ev(`for (const k of ['incursion.limpio.t1_4', 'teo.subjefe_1_vencido']) poner(k)`);
  await pasar('llegada_arriba');
  ok(await ev(`juego.region === 't2_1' && juego.misiones.MP_TEO_03.paso === 3`), `la bajada del 1-4 lleva al piso 2: ${await ev('objetivo()')}`);
  await espera(400); await foto('57_t2_1');
  for (const id of ['t2_1', 't2_2', 't2_3']) {
    log(`[prueba] ${id}: ${await ev(`JSON.stringify([...new Set(juego.enemigos.map((e) => e.especie || e.tipo))])`)}`);
    if (id === 't2_3') ok(await ev(`!!REGIONES.t2_3.puntos.vida`), 'santuario de Vida en el 2-3');
    await limpiar(); await pasar('llegada_arriba');
  }
  ok(await ev(`juego.region === 't2_4' && juego.jefe?.nombre === 'Jaguar reticulado' && juego.jefe.escala === 1.8 && !$('jefe').classList.contains('oculto')`), 'el 2-4: el jaguar reticulado, con su barra');
  await ev(`juego.jugador.x = juego.jefe.x - 3.5; juego.jugador.y = juego.jefe.y`); await espera(900); await foto('57_jaguar');
  await limpiar(); await cerrar();
  ok(await ev(`bandera('teo.subjefe_2_vencido') && juego.misiones.MP_TEO_03.paso === 4`), `jaguar vencido: ${await ev('objetivo()')}`);
  await pasar('llegada_arriba');
  ok(await ev(`juego.region === 't3_1' && juego.misiones.MP_TEO_03.paso === 5`), `piso 3: ${await ev('objetivo()')}`);
  await espera(400); await foto('57_t3_1');
  for (const id of ['t3_1', 't3_2', 't3_3']) { await limpiar(); await pasar('llegada_arriba'); }

  // El 3-4: la cámara del altar. La salida no se abre hasta examinarlo.
  ok(await ev(`juego.region === 't3_4' && mundo.objetos.some((o) => o.sprite === 'Altar_Dioses')`), 'el 3-4: la cámara con el altar de los dioses');
  ok(await ev(`(()=>{ const a = mundo.objetos.find((o) => o.sprite === 'Altar_Dioses'); return bloqueado(a.x, a.y, 0.2); })()`), 'el altar no se atraviesa');
  ok(await ev(`objetivoEnMapa()?.texto === 'Examinar el altar'`), 'el mapa marca el altar');
  await limpiar();
  ok(await ev(`!juego.portales.find((t) => t.a === 'teotihuacan' && t.punto === 'desde_mazmorra').abierto()`), 'sin examinar el altar, la salida sigue cerrada');
  await ev(`(()=>{ const i = juego.interactuables.find((i) => i.texto === 'Examinar el altar'); juego.jugador.x = i.x; juego.jugador.y = i.y - 0.6; })()`); await espera(700); await foto('57_altar');
  await ev(`juego.interactuables.find((i) => i.texto === 'Examinar el altar').usar()`); await cerrar();
  ok(await ev(`bandera('teo.altar_visto') && !!juego.misiones.MP_TEO_03.hecha`), 'el altar cierra MP_TEO_03');
  await pasar('desde_mazmorra');
  ok(await ev(`juego.region === 'teotihuacan'`), 'la salida del 3-4 vuelve a la plaza');
  // Caer en el piso 3: al santuario de Teotihuacan.
  await ev(`entrarMazmorraMaya('t3_2')`); await espera(1800); await cerrar();
  await ev(`juego.jugador.vida = 0`); await espera(2600); await cerrar();
  ok(await ev(`juego.region === 'teotihuacan' && Math.hypot(juego.jugador.x + 15.5, juego.jugador.y - 1.2) < 0.5`), 'al caer en el piso 3, al santuario de Teotihuacan');
};
