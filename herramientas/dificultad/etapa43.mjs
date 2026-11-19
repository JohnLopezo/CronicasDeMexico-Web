// Etapa 43: del altar-trono a Palenque. Cierre del capítulo I, portal, llegada, misión, tablero, derrota y vuelta. Uso:
// node herramientas/dificultad/prueba.mjs "file:///…/index.html" <salida> herramientas/dificultad/etapa43.mjs
export default async ({ ev, espera, foto, log }) => {
  const kd = (k) => ev(`dispatchEvent(new KeyboardEvent('keydown',{key:'${k}'}))`), ku = (k) => ev(`dispatchEvent(new KeyboardEvent('keyup',{key:'${k}'}))`);
  const cerrar = async () => { for (let i = 0; i < 60 && await ev('!!juego.dialogo'); i++) { await kd('Enter'); await ku('Enter'); await espera(30); } };
  const usar = (texto, cerca) => ev(`(()=>{ const j = juego.jugador, I = juego.interactuables.filter((i) => i.texto === '${texto}' && (!i.activo || i.activo()));
    const i = I.sort((a, b) => Math.hypot(a.x - ${cerca?.x ?? 'j.x'}, a.y - ${cerca?.y ?? 'j.y'}) - Math.hypot(b.x - ${cerca?.x ?? 'j.x'}, b.y - ${cerca?.y ?? 'j.y'}))[0];
    if (!i) return false; i.usar(); return true; })()`);
  const ok = (c, t) => log(`${c ? 'BIEN' : 'MAL '} ${t}`);
  await ev(`localStorage.clear(); document.getElementById('nueva').click()`); await espera(400);
  await ev(`document.querySelector('[data-elegir=jaguar]').click()`); await espera(1800); await cerrar();

  // Final del capítulo olmeca: Guardián liberado, misión del fragmento con la anciana ya escuchada.
  await ev(`poner('olm.guardian_liberado'); poner('olm.anciana_recordo'); empezarMision('MP_OLM_06'); avisar('hablar:anciana'); cargarRegion('ciudad', 'desde_maya', 50)`); await espera(1500); await cerrar();
  ok(!(await usar('Seguir la memoria')), 'antes del altar no hay portal');
  ok(await usar('Examinar', { x: 5.2, y: 7.1 }), 'examina el altar-trono'); await cerrar(); await espera(300); await cerrar();
  ok(await ev(`bandera('olm.memoria_restaurada') && bandera('may.portal_abierto')`), 'misión cumplida y portal abierto');
  await espera(400); await foto('43_portal_aldea');
  ok(await usar('Seguir la memoria'), 'el portal se usa'); await espera(300); await foto('43_capitulo');
  ok(await ev(`!!document.querySelector('[data-elegir=ir]')`), 'tarjeta del capítulo II');
  await ev(`document.querySelector('[data-elegir=ir]').click()`); await espera(2200);
  ok(await ev(`juego.region === 'palenque'`), 'llega a Palenque'); await foto('43_llegada'); await cerrar(); await espera(300);
  ok(await ev(`!!juego.misiones.MP_MAY_01 && objetivo().startsWith("Lakamha'")`), `misión: ${await ev('objetivo()')}`);

  // Recorrido: puente y plaza (capturas), tablero.
  for (const [n, x, y] of [['43_puente', 0, 0], ['43_plaza', 12.5, 1], ['43_templo', 12.5, 3.6]]) { await ev(`juego.jugador.x = ${x}; juego.jugador.y = ${y}; juego.enemigos.forEach((e) => { e.vida = 0; })`); await espera(700); await foto(n); }
  ok(await usar('Examinar'), 'examina el tablero'); await cerrar();
  ok(await ev(`bandera('may.tablero_visto') || juego.misiones.MP_MAY_01.paso === 1`), `tras el tablero: ${await ev('objetivo()')}`);

  // Guardar en el santuario, caer y volver a la aldea por el portal.
  await ev(`juego.jugador.x = -15.5; juego.jugador.y = 1.2`); await espera(200);
  ok(await usar('Recordar (guardar)'), 'santuario de Memoria'); await cerrar(); await ev(`cerrarMenu()`);
  ok(await ev(`JSON.parse(localStorage.getItem(CLAVE)).region === 'palenque'`), 'la partida se guarda en Palenque');
  await ev(`juego.jugador.x = 0; juego.jugador.y = 0; juego.jugador.vida = 0`); await espera(2500);
  ok(await ev(`juego.region === 'palenque' && Math.hypot(juego.jugador.x + 15.5, juego.jugador.y - 1.2) < 0.5`), 'al caer, al santuario de Palenque');
  ok(await usar('Volver al asentamiento'), 'portal de vuelta'); await cerrar(); await espera(2000);
  ok(await ev(`juego.region === 'ciudad'`), 'vuelve a la aldea'); await foto('43_vuelta');
};
