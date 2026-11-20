// Etapa 54: el barrio de Teotihuacan. Camino desde la plaza, habitantes, MP_TEO_01 → MP_TEO_02, caída y hoja de ropa. Uso:
// node herramientas/dificultad/prueba.mjs "file:///…/index.html" <salida> herramientas/dificultad/etapa54.mjs
export default async ({ ev, espera, foto, log }) => {
  const kd = (k) => ev(`dispatchEvent(new KeyboardEvent('keydown',{key:'${k}'}))`), ku = (k) => ev(`dispatchEvent(new KeyboardEvent('keyup',{key:'${k}'}))`);
  const cerrar = async () => { for (let i = 0; i < 60 && await ev('!!juego.dialogo'); i++) { await kd('Enter'); await ku('Enter'); await espera(30); } };
  const hablarCon = async (id) => { await ev(`conversar(juego.otros.find((o) => o.id === '${id}'))`); await cerrar(); await espera(100); };
  const ok = (c, t) => log(`${c ? 'BIEN' : 'MAL '} ${t}`);
  await ev(`localStorage.clear(); document.getElementById('nueva').click()`); await espera(400);
  await ev(`document.querySelector('[data-elegir=jaguar]').click()`); await espera(1800); await cerrar();

  // MP_TEO_01 en su segundo paso; de la plaza, por el camino del este, al barrio.
  await ev(`empezarMision('MP_TEO_01'); avisar('examinar:mural_teo'); cargarRegion('teotihuacan', 'desde_barrio', 50)`); await espera(1500); await cerrar();
  ok(await ev(`juego.portales.some((t) => t.a === 'barrio_teo')`), 'hay salida al barrio');
  ok(await ev(`(()=>{ const o = objetivoEnMapa(); return !!o && o.a === 'barrio_teo'; })()`), 'el minimapa señala la salida al barrio');
  await ev(`juego.jugador.x = 19.2; juego.jugador.y = 2`); await espera(2200);
  ok(await ev(`juego.region === 'barrio_teo'`), 'llega al barrio'); await foto('54_llegada');
  ok(await ev(`juego.otros.filter((o) => o.tipo === 'npc').length === 7`), 'siete habitantes');
  for (const [n, x, y] of [['54_patio', 2, 2], ['54_taller', -5, -2], ['54_fogon', 8, 0]]) { await ev(`juego.jugador.x = ${x}; juego.jugador.y = ${y}`); await espera(700); await foto(n); }

  // La misión: el comerciante, los tres caminos y vuelta al comerciante.
  await hablarCon('comerciante_teo');
  ok(await ev(`!!juego.misiones.MP_TEO_01.hecha && !!juego.misiones.MP_TEO_02`), `MP_TEO_01 cumplida: ${await ev('objetivo()')}`);
  await hablarCon('comerciante_teo');
  ok(await ev(`juego.misiones.MP_TEO_02.paso === 0`), 'hablar otra vez con el comerciante no adelanta la misión');
  for (const id of ['tallador_teo', 'zapoteco']) await hablarCon(id);
  await hablarCon('zapoteco');
  ok(await ev(`juego.misiones.MP_TEO_02.paso === 0 && juego.misiones.MP_TEO_02.cuenta === 2`), 'repetir con el zapoteco no cuenta dos veces');
  await hablarCon('mercadera_teo');
  ok(await ev(`juego.misiones.MP_TEO_02.paso === 1`), `tres caminos: ${await ev('objetivo()')}`);
  await hablarCon('comerciante_teo');
  ok(await ev(`!!juego.misiones.MP_TEO_02.hecha && bandera('teo.caminos_recordados') && bandera('teo.camino_cueva')`), 'MP_TEO_02 cumplida (la cueva bajo la Pirámide del Sol)');

  // Servicios y caída.
  ok(await ev(`['Cocinar', 'Comerciar'].every((t) => juego.interactuables.some((i) => i.texto === t))`), 'cocina y comercio');
  await ev(`juego.jugador.x = 0; juego.jugador.y = 0; juego.jugador.vida = 0`); await espera(2600);
  ok(await ev(`juego.region === 'teotihuacan' && Math.hypot(juego.jugador.x + 15.5, juego.jugador.y - 1.2) < 0.5`), 'al caer en el barrio, al santuario de Teotihuacan');

  // Hoja con la ropa de todos (×3): de frente, de lado y de espaldas, más un cuadro de andar.
  await ev(`(()=>{ const artes = [...Object.keys(GENTE_TEO), 'MayaMercadera', 'MayaEscriba'], c = document.createElement('canvas'), g = c.getContext('2d');
    c.width = artes.length * 4 * 48 * 3 / 2; c.height = 64 * 3 * 2; g.imageSmoothingEnabled = false; g.fillStyle = '#6b5236'; g.fillRect(0, 0, c.width, c.height);
    artes.forEach((a, i) => ['05', '03', '01'].concat(['05']).forEach((d, k) => { const im = imagenes[\`Npc_\${a}_\${k === 3 ? 'Caminar2' : 'Reposo1'}_\${d}\`];
      const col = i % (artes.length / 2), fila = Math.floor(i / (artes.length / 2)); g.drawImage(im, (col * 4 + k) * 144, fila * 192, 144, 192); }));
    Object.assign(c.style, { position: 'fixed', left: 0, top: 0, zIndex: 99, width: '100vw' }); document.body.appendChild(c); })()`);
  await espera(200); await foto('54_habitantes');
};
