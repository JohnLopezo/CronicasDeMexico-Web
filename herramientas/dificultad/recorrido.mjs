// Recorrido de revisión: carga cada mapa, busca errores de diseño y mide el coste por cuadro. Uso:
// node herramientas/dificultad/prueba.mjs "file:///…/index.html" <salida> herramientas/dificultad/recorrido.mjs
// Por mapa: si el jugador aparece dentro de un muro; qué portales, enemigos e interactuables no se alcanzan andando desde
// donde aparece (búsqueda por casillas de 0,25 m con bloqueado y puedePisar, sin saltar); ms por cuadro de actualizar y
// dibujarTodo; y una foto. Al final, fotos de los menús y de la vista táctil.
export default async ({ ev, foto, espera, log }) => {
  const kd = (k) => ev(`dispatchEvent(new KeyboardEvent('keydown',{key:'${k}'}))`), ku = (k) => ev(`dispatchEvent(new KeyboardEvent('keyup',{key:'${k}'}))`);
  const cerrar = async () => { for (let i = 0; i < 40 && await ev('!!juego.dialogo'); i++) { await kd('Enter'); await ku('Enter'); await espera(30); } };
  await foto('00_inicio');
  await ev(`localStorage.clear(); document.getElementById('nueva').click()`); await espera(400);
  await foto('01_elegir');
  await ev(`document.querySelector('[data-elegir=jaguar]').click()`); await espera(1800); await cerrar();
  // Estado de media partida: misión de los claros hecha y sello abierto (mazmorra accesible, jefes sin vencer).
  await ev(`poner('mision.MP_OLM_03.completada'); poner('olm.sello_abierto'); document.body.classList.add('es-tactil')`);
  const MAPAS = JSON.parse(process.env.MAPAS || JSON.stringify([['ciudad', 'inicio'], ['selva', 'llegada'],
    ...NIVELES().map((id) => [id, 'llegada_arriba'])]));
  function NIVELES() { return ['p1', 'n1_2', 'n1_3', 'n1_4', 'n1_5', 'n2_1', 'n2_2', 'n2_3', 'n2_4', 'p2', 'n3_1', 'n3_2', 'n3_3', 'n3_4', 'p3']; }
  log('mapa | aparece en muro | enemigos (inalcanzables) | interactuables (inalcanzables) | portales (inalcanzables) | ms por cuadro (actualizar + dibujar) | casillas andables');
  for (const [id, punto] of MAPAS) {
    await ev(`cargarRegion('${id}','${punto}',juego.jugador.vida)`); await espera(1300); await cerrar();
    const r = JSON.parse(await ev(`(()=>{
      const j = juego.jugador, P = 0.25, R = 0.25, key = (x, y) => Math.round(x / P) + ',' + Math.round(y / P);
      const dentroMuro = bloqueado(j.x, j.y, 0.2);
      // Búsqueda por casillas desde el jugador, con las mismas reglas que mover() (sin saltar).
      const vistos = new Map(), cola = [[j.x, j.y]]; vistos.set(key(j.x, j.y), [j.x, j.y]);
      while (cola.length && vistos.size < 60000) {
        const [x, y] = cola.shift(), a = { z: alturaEn(x, y), suelo: alturaEn(x, y) };
        for (const [dx, dy] of [[P,0],[-P,0],[0,P],[0,-P]]) {
          const nx = x + dx, ny = y + dy, k = key(nx, ny);
          if (vistos.has(k) || bloqueado(nx, ny, R) || !puedePisar(a, nx, ny)) continue;
          vistos.set(k, [nx, ny]); cola.push([nx, ny]);
        }
      }
      const celdas = [...vistos.values()];
      const alcanza = (x, y, d) => celdas.some(([cx, cy]) => Math.hypot(cx - x, cy - y) <= d);
      const nombre = (o) => o.especie || o.tipo || o.texto || o.a || '?';
      const lejos = (lista, d) => lista.filter((o) => !alcanza(o.x, o.y, d(o))).map((o) => nombre(o) + '@' + o.x.toFixed(1) + ',' + o.y.toFixed(1));
      const enemigos = juego.enemigos.filter((e) => e.vida > 0 && e.tipo !== 'vasija');
      const res = { dentroMuro, celdas: celdas.length,
        enemigos: enemigos.length, enemigosLejos: lejos(enemigos.filter((e) => !e.d?.flies && !e.vuela), (e) => (e.r || 0.4) + 1.3),
        enemigosEnMuro: enemigos.filter((e) => bloqueado(e.x, e.y, 0.1)).map((e) => nombre(e) + '@' + e.x.toFixed(1) + ',' + e.y.toFixed(1)),
        inter: juego.interactuables.length, interLejos: lejos(juego.interactuables, (i) => i.r || 1.2),
        portales: juego.portales.length, portalesLejos: lejos(juego.portales, () => 0.6) };
      // Coste por cuadro: 120 cuadros de actualizar(1/60) y dibujarTodo(), en pausa para que el bucle real no se cruce.
      juego.pausa = true; const v = j.vida; j.inv = 99;
      const t0 = performance.now(); for (let i = 0; i < 120; i++) actualizar(1 / 60); const t1 = performance.now();
      for (let i = 0; i < 120; i++) dibujarTodo(); const t2 = performance.now();
      j.vida = v; j.inv = 0; juego.pausa = false;
      res.msAct = (t1 - t0) / 120; res.msDib = (t2 - t1) / 120;
      return JSON.stringify(res); })()`));
    await foto(`mapa_${id}`);
    const lista = (a) => a.length ? ' ' + a.slice(0, 6).join(' ') + (a.length > 6 ? ' …' : '') : '';
    log(`${id} | ${r.dentroMuro ? 'SÍ' : 'no'} | ${r.enemigos} (${r.enemigosLejos.length}${lista(r.enemigosLejos)}${r.enemigosEnMuro.length ? '; en muro:' + lista(r.enemigosEnMuro) : ''}) | ${r.inter} (${r.interLejos.length}${lista(r.interLejos)}) | ${r.portales} (${r.portalesLejos.length}${lista(r.portalesLejos)}) | ${r.msAct.toFixed(2)} + ${r.msDib.toFixed(2)} | ${r.celdas}`);
  }
  // Menús y pantallas.
  await ev(`cargarRegion('ciudad','inicio',juego.jugador.vida)`); await espera(1300); await cerrar();
  await foto('menu_hud_tactil');
  await ev(`abrirMenu()`); await espera(300); await foto('menu_bolsa'); await ev(`cerrarMenu()`);
  await ev(`abrirMenu('armero','armero')`); await espera(300); await foto('menu_armero'); await ev(`cerrarMenu()`);
  await ev(`alternarPausa()`); await espera(300); await foto('menu_pausa'); await ev(`alternarPausa()`);
};
