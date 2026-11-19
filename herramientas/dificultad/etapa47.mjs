// Etapa 47: mapa de la región. Minimapa visible, objetivo en otra región (marca la salida) y en esta (el habitante), mapa
// grande al tocar, la opción que lo oculta y que funciona en la aldea olmeca y en un nivel de la mazmorra. Uso:
// node herramientas/dificultad/prueba.mjs "file:///…/index.html" <salida> herramientas/dificultad/etapa47.mjs
export default async ({ ev, espera, foto, log }) => {
  const kd = (k) => ev(`dispatchEvent(new KeyboardEvent('keydown',{key:'${k}'}))`), ku = (k) => ev(`dispatchEvent(new KeyboardEvent('keyup',{key:'${k}'}))`);
  const cerrar = async () => { for (let i = 0; i < 60 && await ev('!!juego.dialogo'); i++) { await kd('Enter'); await ku('Enter'); await espera(30); } };
  const ok = (c, t) => log(`${c ? 'BIEN' : 'MAL '} ${t}`);
  await ev(`localStorage.clear(); document.getElementById('nueva').click()`); await espera(400);
  await ev(`document.querySelector('[data-elegir=jaguar]').click()`); await espera(1800); await cerrar();
  ok(await ev(`!$('minimapa').classList.contains('oculto') && $('minimapa').clientWidth > 100`), 'minimapa visible en la aldea olmeca');

  // Palenque con MP_MAY_01 en «busca al escriba»: el objetivo es la salida a la aldea maya.
  await ev(`poner('olm.guardian_liberado'); empezarMision('MP_MAY_01'); avisar('examinar:tablero_palenque'); cargarRegion('palenque', 'llegada', 50)`); await espera(1800); await cerrar();
  await ev(`juego.enemigos.forEach((e) => { e.vida = 0; e.muriendo = 0; })`); // que no peleen durante la prueba
  ok(await ev(`(() => { const o = objetivoEnMapa(); return !!o && o.a === 'aldea_maya'; })()`), 'en Palenque, el objetivo marca la salida a la aldea');
  await ev(`juego.jugador.x = 15; juego.jugador.y = 0`); await espera(400); await foto('47_minimapa');
  await ev(`$('minimapa').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))`); await espera(300);
  ok(await ev(`$('minimapa').classList.contains('grande')`), 'al tocarlo se agranda'); await foto('47_grande');
  await ev(`$('minimapa').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))`); await espera(200);
  ok(await ev(`!$('minimapa').classList.contains('grande')`), 'al tocarlo otra vez vuelve a la esquina');

  // En la aldea maya, el objetivo es el escriba.
  await ev(`cargarRegion('aldea_maya', 'llegada', 50)`); await espera(1800); await cerrar();
  ok(await ev(`objetivoEnMapa()?.id === 'escriba'`), 'en la aldea, el objetivo es el escriba'); await foto('47_aldea');
  // Desde la aldea olmeca, sin misión maya con lugar: sin errores.
  await ev(`opciones.mapa = false`); await espera(300);
  ok(await ev(`$('minimapa').classList.contains('oculto')`), 'la opción Mapa lo oculta');
  await ev(`opciones.mapa = true; cargarRegion('n1_2', 'llegada_arriba', 50)`); await espera(1800); await cerrar(); await foto('47_mazmorra');
  ok(await ev(`!$('minimapa').classList.contains('oculto') && !!mundo.mapa`), 'funciona en un nivel generado de la mazmorra');
};
