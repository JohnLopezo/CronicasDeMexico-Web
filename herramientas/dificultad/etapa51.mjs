// Etapa 51: la habilidad de agua y el cierre del capítulo II. El Guardián de los Ciclos concede la Corriente (y el fragmento y
// MP_MAY_04); la corriente hiere y empuja al de delante y no al de atrás, la Tierra no rompe el lodo y el agua sí (ofrenda), el
// escriba manda al tablero y el tablero cierra el capítulo. Uso:
// node herramientas/dificultad/prueba.mjs "file:///…/index.html" <salida> herramientas/dificultad/etapa51.mjs
export default async ({ ev, espera, foto, log }) => {
  const kd = (k) => ev(`dispatchEvent(new KeyboardEvent('keydown',{key:'${k}'}))`), ku = (k) => ev(`dispatchEvent(new KeyboardEvent('keyup',{key:'${k}'}))`);
  const cerrar = async () => { for (let i = 0; i < 80 && await ev('!!juego.dialogo'); i++) { await kd('Enter'); await ku('Enter'); await espera(30); } };
  const ok = (c, t) => log(`${c ? 'BIEN' : 'MAL '} ${t}`);
  await ev(`localStorage.clear(); document.getElementById('nueva').click()`); await espera(400);
  await ev(`document.querySelector('[data-elegir=jaguar]').click()`); await espera(1800); await cerrar();
  await ev(`poner('olm.guardian_liberado'); poner('may.camino_agua'); empezarMision('MP_MAY_03'); juego.misiones.MP_MAY_03.paso = 5; juego.prog.nivel = 12; aplicarEstadisticas(true); cargarRegion('m3_4', 'llegada_arriba', estadisticas().vida)`); await espera(1800); await cerrar();
  ok(await ev(`$('bAgua').classList.contains('oculto')`), 'sin la bendición no hay botón de agua');
  await ev(`(() => { const g = juego.enemigos.find((e) => e.tipo === 'guardian'); juego.jugador.x = g.x - 4; juego.jugador.y = g.y; })()`); await espera(1500);
  for (let k = 0; k < 40 && await ev(`juego.enemigos.some((e) => e.tipo === 'guardian' && e.estado !== 'liberado')`); k++) { await ev(`(() => { const g = juego.enemigos.find((e) => e.tipo === 'guardian'); g.invul = 0; herirEnemigo(g, 999, juego.jugador); })()`); await espera(150); }
  await espera(600); await cerrar(); await espera(300);
  ok(await ev(`bandera('may.bendicion_agua') && tiene('fragmento_segunda_memoria') === 1 && juego.misiones.MP_MAY_03.hecha && juego.misiones.MP_MAY_04?.paso === 0`), `el Guardián da la Corriente, el fragmento y la misión: ${await ev('objetivo()')}`);
  ok(await ev(`!$('bAgua').classList.contains('oculto')`), 'aparece el botón de agua');

  // En Palenque: la corriente contra dos espíritus, uno delante y otro detrás.
  await ev(`cargarRegion('palenque', 'desde_mazmorra', estadisticas().vida)`); await espera(1800); await cerrar();
  await ev(`juego.enemigos = juego.enemigos.filter((e) => e.tipo === 'vasija'); juego.jugador.x = 9; juego.jugador.y = 0; juego.jugador.fx = 1; juego.jugador.fy = 0;
    const a = nuevoEspiritu(11.5, 0), b = nuevoEspiritu(7, 0); for (const e of [a, b]) e.cdEsquiva = 99; juego.enemigos.push(a, b); window.__ab = [a, b]; juego.prog.energia = 100; juego.jugador.vida = 40`);
  await kd('v'); await ku('v'); await espera(120);
  ok(await ev(`__ab[0].vida < __ab[0].max && __ab[1].vida === __ab[1].max && juego.prog.energia < 75 && juego.jugador.vida > 40`), `la corriente hiere al de delante (${await ev('__ab[0].vida')}/${await ev('__ab[0].max')}), no al de atrás, gasta energía y cura`);
  await espera(150); await foto('51_corriente');
  ok(await ev(`juego.esperaAgua > 0`), 'luego hay que esperar');
  await ev(`juego.enemigos = juego.enemigos.filter((e) => !__ab.includes(e))`);

  // El lodo: la Tierra no lo rompe; la corriente, sí, y aparece la ofrenda.
  await ev(`juego.prog.principal = 'tierra'; juego.esperaTierra = 0; juego.esperaAgua = 0; juego.prog.energia = 100; juego.jugador.x = LODO_PALENQUE.x - 1.5; juego.jugador.y = LODO_PALENQUE.y; juego.jugador.fx = 1; juego.jugador.fy = 0`); await espera(300);
  await foto('51_lodo');
  await ev(`golpeDeTierra()`); await espera(200);
  ok(await ev(`!bandera('roto.may_lodo')`), 'el golpe de tierra no rompe el lodo');
  await ev(`juego.prog.energia = 100; corrienteDeAgua()`); await espera(400);
  ok(await ev(`bandera('roto.may_lodo') && juego.interactuables.some((i) => i.texto === 'Abrir la ofrenda' && i.activo())`), 'la corriente deshace el lodo y aparece la ofrenda');
  await ev(`juego.interactuables.find((i) => i.texto === 'Abrir la ofrenda').usar()`); await cerrar();
  ok(await ev(`bandera('ofrenda.may_lodo')`), 'la ofrenda se abre');
  ok(await ev(`objetivoEnMapa()?.a === 'aldea_maya'`), 'el mapa marca la salida a la aldea (el escriba)');

  // El escriba y el tablero.
  await ev(`cargarRegion('aldea_maya', 'llegada', juego.jugador.vida)`); await espera(1800); await cerrar();
  await ev(`conversar(juego.otros.find((o) => o.id === 'escriba'))`); await espera(200);
  ok(await ev(`juego.dialogo?.lineas.some((l) => l.includes('tablero'))`), 'el escriba manda al tablero'); await cerrar();
  ok(await ev(`juego.misiones.MP_MAY_04.paso === 1`), `objetivo: ${await ev('objetivo()')}`);
  await ev(`cargarRegion('palenque', 'llegada', juego.jugador.vida)`); await espera(1800); await cerrar();
  await ev(`juego.interactuables.find((i) => i.texto === 'Examinar' && Math.abs(i.x - PALENQUE.tablero.x) < 0.1).usar()`); await espera(200);
  ok(await ev(`juego.dialogo?.lineas[0].includes('fragmento')`), 'el tablero recibe el fragmento'); await cerrar(); await espera(300);
  ok(await ev(`juego.misiones.MP_MAY_04.hecha && bandera('may.registros_recuperados') && bandera('registro.cultura.maya') && $('capaMenu').textContent.includes('Fin del capítulo II')`), 'fin del capítulo II');
  await foto('51_fin');
  await ev(`$('capaMenu').querySelector('[data-cerrar]').click()`); await espera(200);
  await ev(`abrirMenu()`); await espera(200); await ev(`[...document.querySelectorAll('#capaMenu [data-pestana]')].find((b) => b.dataset.pestana === 'bendiciones')?.click()`); await espera(200);
  ok(await ev(`$('capaMenu').textContent.includes('Bendición del Agua')`), 'la Bendición del Agua sale en la bolsa');
};
