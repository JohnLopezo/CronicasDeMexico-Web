// Etapa 44: la aldea de Lakamha'. Llegar desde la plaza, hablar con el escriba, las tres hojas (una con su guardián) y
// entregarlas; capturas de la aldea y de los habitantes. Uso:
// node herramientas/dificultad/prueba.mjs "file:///…/index.html" <salida> herramientas/dificultad/etapa44.mjs
export default async ({ ev, espera, foto, log }) => {
  const kd = (k) => ev(`dispatchEvent(new KeyboardEvent('keydown',{key:'${k}'}))`), ku = (k) => ev(`dispatchEvent(new KeyboardEvent('keyup',{key:'${k}'}))`);
  const cerrar = async () => { for (let i = 0; i < 80 && await ev('!!juego.dialogo'); i++) { await kd('Enter'); await ku('Enter'); await espera(30); } };
  const usar = (texto) => ev(`(()=>{ const j = juego.jugador, i = juego.interactuables.filter((i) => i.texto === '${texto}' && (!i.activo || i.activo())).sort((a, b) => Math.hypot(a.x - j.x, a.y - j.y) - Math.hypot(b.x - j.x, b.y - j.y))[0];
    if (!i) return false; i.usar(); return true; })()`);
  const hablarCon = (id) => ev(`(()=>{ const n = juego.otros.find((o) => o.id === '${id}'); if (!n) return false; conversar(n); return true; })()`);
  const ir = (x, y) => ev(`juego.jugador.x = ${x}; juego.jugador.y = ${y}`);
  const ok = (c, t) => log(`${c ? 'BIEN' : 'MAL '} ${t}`);
  await ev(`localStorage.clear(); document.getElementById('nueva').click()`); await espera(400);
  await ev(`document.querySelector('[data-elegir=jaguar]').click()`); await espera(1800); await cerrar();

  // Tras el tablero de Palenque (MP_MAY_01 en el paso 2).
  await ev(`poner('olm.guardian_liberado'); empezarMision('MP_MAY_01'); avisar('examinar:tablero_palenque'); cargarRegion('palenque', 'desde_aldea', 50)`); await espera(1500); await cerrar();
  await ir(20.5, 0); await espera(300); await ir(23.2, 0); await espera(1800);
  ok(await ev(`juego.region === 'aldea_maya'`), 'el sendero de la plaza lleva a la aldea'); await cerrar();
  ok(await ev(`objetivo().includes('aldea')`), `objetivo: ${await ev('objetivo()')}`);
  await ir(-2, -1.5); await espera(900); await foto('44_aldea');
  await ir(-4, 3.8); await espera(500); await foto('44_escriba');

  // El escriba: completa MP_MAY_01 y empieza MP_MAY_02; la hoja del río aparece sin salir.
  ok(await hablarCon('escriba'), 'habla con el escriba'); await cerrar(); await espera(200);
  ok(await ev(`bandera('mision.MP_MAY_01.completada') && bandera('mision.MP_MAY_02.activa')`), 'MP_MAY_01 cumplida y MP_MAY_02 activa');
  await ir(13, -4.8); await espera(300);
  ok(await usar('Recoger la hoja'), 'hoja 1 junto al río'); await cerrar();
  for (const id of ['tejedora', 'mercadera', 'pescador', 'cazador', 'nina_maya', 'nino_maya']) { ok(await hablarCon(id), `habla: ${id}`); await cerrar(); }

  // La plaza: dos guardianes de la Sombra; al vencerlos sueltan las hojas.
  await ir(-18, 0); await espera(300); await ir(-19, 0); await espera(1800);
  ok(await ev(`juego.region === 'palenque'`), 'vuelve a la plaza');
  ok(await ev(`juego.enemigos.filter((e) => e.tipo === 'espiritu' && e.vida > 0).length === 2`), 'dos espíritus guardan las hojas');
  for (let k = 0; k < 20 && await ev(`juego.enemigos.some((e) => e.tipo === 'espiritu' && e.vida > 0)`); k++) { // pueden esquivar de un salto
    await ev(`juego.enemigos.filter((e) => e.tipo === 'espiritu' && e.vida > 0).forEach((e) => { e.cdEsquiva = 9; herirEnemigo(e, 9999, juego.jugador); })`); await espera(200);
  }
  await espera(1500);
  for (const [x, y] of [[8, -4.4], [18, 5.1]]) { await ir(x, y); await espera(200); ok(await usar('Recoger la hoja'), `hoja en (${x}, ${y})`); await cerrar(); }
  ok(await ev(`bandera('may.hojas_completas') && juego.misiones.MP_MAY_02.paso === 1`), `con las tres: ${await ev('objetivo()')}`);

  // Entregarlas.
  await ir(20.5, 0); await espera(300); await ir(23.2, 0); await espera(1800); await cerrar();
  ok(await hablarCon('escriba'), 'vuelve al escriba'); await cerrar(); await espera(200);
  ok(await ev(`bandera('mision.MP_MAY_02.completada') && bandera('may.camino_agua')`), 'MP_MAY_02 cumplida (camino del agua)');
  // Hoja de los habitantes: cada uno de frente, de lado y de espaldas, ×3.
  await ev(`(()=>{ const c = document.createElement('canvas'), g = c.getContext('2d'); c.width = 7 * 3 * 48 * 3; c.height = 64 * 3 * 2; g.imageSmoothingEnabled = false; g.fillStyle = '#4a3a2a'; g.fillRect(0, 0, c.width, c.height);
    Object.keys(MAYAS).forEach((a, i) => ['05', '03', '01'].forEach((d, k) => { g.drawImage(imagenes['Npc_' + a + '_Reposo1_' + d], (i * 3 + k) * 144, 0, 144, 192); g.drawImage(imagenes['Npc_' + a + '_Caminar2_' + d], (i * 3 + k) * 144, 192, 144, 192); }));
    document.body.innerHTML = ''; document.body.appendChild(c); c.style.cssText = 'position:fixed;left:0;top:0;width:844px'; juego.activo = false; })()`);
  await espera(300); await foto('44_habitantes');
};
