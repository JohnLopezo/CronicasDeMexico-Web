// Etapa 53: de Palenque a Teotihuacan. Cierre del capítulo II, portal, llegada, misión, mural, derrota y vuelta. Uso:
// node herramientas/dificultad/prueba.mjs "file:///…/index.html" <salida> herramientas/dificultad/etapa53.mjs
export default async ({ ev, espera, foto, log }) => {
  const kd = (k) => ev(`dispatchEvent(new KeyboardEvent('keydown',{key:'${k}'}))`), ku = (k) => ev(`dispatchEvent(new KeyboardEvent('keyup',{key:'${k}'}))`);
  const cerrar = async () => { for (let i = 0; i < 60 && await ev('!!juego.dialogo'); i++) { await kd('Enter'); await ku('Enter'); await espera(30); } };
  const usar = (texto, cerca) => ev(`(()=>{ const j = juego.jugador, I = juego.interactuables.filter((i) => i.texto === ${JSON.stringify(texto)} && (!i.activo || i.activo()));
    const i = I.sort((a, b) => Math.hypot(a.x - ${cerca?.x ?? 'j.x'}, a.y - ${cerca?.y ?? 'j.y'}) - Math.hypot(b.x - ${cerca?.x ?? 'j.x'}, b.y - ${cerca?.y ?? 'j.y'}))[0];
    if (!i) return false; i.usar(); return true; })()`);
  const ok = (c, t) => log(`${c ? 'BIEN' : 'MAL '} ${t}`);
  await ev(`localStorage.clear(); document.getElementById('nueva').click()`); await espera(400);
  await ev(`document.querySelector('[data-elegir=jaguar]').click()`); await espera(1800); await cerrar();

  // Final del capítulo maya: MP_MAY_04 en su último paso (examinar el tablero de Palenque).
  await ev(`empezarMision('MP_MAY_04'); avisar('hablar:escriba'); cargarRegion('palenque', 'llegada', 50)`); await espera(1500); await cerrar();
  ok(!(await usar('Seguir la memoria')), 'antes del cierre no hay portal a Teotihuacan');
  await ev(`juego.jugador.x = 12.5; juego.jugador.y = 3.8`); await espera(200);
  ok(await usar('Examinar', { x: 12.5, y: 3.9 }), 'examina el tablero'); await cerrar(); await espera(300);
  ok(await ev(`!!document.querySelector('#capa-capitulo, .capa') && document.body.innerText.includes('altiplano te llama')`), 'fin del capítulo II anuncia el portal');
  await ev(`document.querySelector('[data-cerrar]')?.click()`); await espera(300);
  await ev(`juego.jugador.x = 16.5; juego.jugador.y = 2.3; juego.enemigos.forEach((e) => { e.vida = 0; })`); await espera(500); await foto('53_portal_palenque');
  ok(await usar('Seguir la memoria'), 'el portal se usa'); await espera(300); await foto('53_capitulo');
  ok(await ev(`document.body.innerText.includes('Capítulo III') && !!document.querySelector('[data-elegir=ir]')`), 'tarjeta del capítulo III');
  await ev(`document.querySelector('[data-elegir=ir]').click()`); await espera(2200);
  ok(await ev(`juego.region === 'teotihuacan'`), 'llega a Teotihuacan'); await foto('53_llegada'); await cerrar(); await espera(300);
  ok(await ev(`!!juego.misiones.MP_TEO_01 && objetivo().startsWith('La ciudad de los dioses')`), `misión: ${await ev('objetivo()')}`);
  ok(await ev(`(()=>{ const o = objetivoEnMapa(); return !!o && Math.abs(o.x - 7.5) < 0.1; })()`), 'el minimapa señala el mural');

  // Recorrido (capturas) y el mural.
  for (const [n, x, y] of [['53_sendero', -5, 0], ['53_calzada', 2, 3], ['53_sol', 10, 2], ['53_luna', 2, 12]]) { await ev(`juego.jugador.x = ${x}; juego.jugador.y = ${y}; juego.enemigos.forEach((e) => { e.vida = 0; })`); await espera(700); await foto(n); }
  await ev(`juego.jugador.x = 7.5; juego.jugador.y = 3.4`); await espera(200);
  ok(await usar('Examinar'), 'examina el mural'); await cerrar();
  ok(await ev(`bandera('teo.mural_visto') && juego.misiones.MP_TEO_01.paso === 1`), `tras el mural: ${await ev('objetivo()')}`);

  // Guardar en el santuario, caer, despertar ahí y volver a Palenque.
  await ev(`juego.jugador.x = -15.5; juego.jugador.y = 1.2`); await espera(200);
  ok(await usar('Recordar (guardar)'), 'santuario de Memoria'); await cerrar(); await ev(`cerrarMenu()`);
  ok(await ev(`JSON.parse(localStorage.getItem(CLAVE)).region === 'teotihuacan'`), 'la partida se guarda en Teotihuacan');
  await ev(`juego.jugador.x = 0; juego.jugador.y = 0; juego.jugador.vida = 0`); await espera(2500);
  ok(await ev(`juego.region === 'teotihuacan' && Math.hypot(juego.jugador.x + 15.5, juego.jugador.y - 1.2) < 0.5`), 'al caer, al santuario de Teotihuacan');
  ok(await usar("Volver a Lakamha'"), 'portal de vuelta'); await cerrar(); await espera(2000);
  ok(await ev(`juego.region === 'palenque' && juego.interactuables.some((i) => i.a === 'teotihuacan')`), 'vuelve a Palenque y el portal sigue'); await foto('53_vuelta');
};
