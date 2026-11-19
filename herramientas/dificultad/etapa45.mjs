// Etapa 45: armas mayas en el armero de Lakamha'. Menú, préstamo y compra, especial, escudo flexible y que no se mezclen
// con la mazmorra olmeca. Uso: node herramientas/dificultad/prueba.mjs "file:///…/index.html" <salida> herramientas/dificultad/etapa45.mjs
export default async ({ ev, espera, foto, log }) => {
  const kd = (k) => ev(`dispatchEvent(new KeyboardEvent('keydown',{key:'${k}'}))`), ku = (k) => ev(`dispatchEvent(new KeyboardEvent('keyup',{key:'${k}'}))`);
  const cerrar = async () => { for (let i = 0; i < 60 && await ev('!!juego.dialogo'); i++) { await kd('Enter'); await ku('Enter'); await espera(30); } };
  const ok = (c, t) => log(`${c ? 'BIEN' : 'MAL '} ${t}`);
  await ev(`localStorage.clear(); document.getElementById('nueva').click()`); await espera(400);
  await ev(`document.querySelector('[data-elegir=jaguar]').click()`); await espera(1800); await cerrar();
  await ev(`poner('olm.guardian_liberado'); cargarRegion('aldea_maya', 'llegada', 50)`); await espera(1500); await cerrar();

  ok(await ev(`ARMAS_COFRE.every((k) => !ARMAS[k].cultura) && !armasDe('olmeca').some((k) => ARMAS[k].cultura)`), 'la mazmorra olmeca no da armas mayas');
  ok(await ev(`!!juego.otros.find((o) => o.id === 'armero_maya') && juego.interactuables.some((i) => i.texto === 'Armero')`), 'el tallador de pedernal está en la aldea');
  await ev(`juego.jugador.x = 9.6; juego.jugador.y = 1.6; abrirMenu('armero_maya', 'armero_maya')`); await espera(400); await foto('45_armero');
  const m = JSON.parse(await ev(`JSON.stringify({ filas: document.querySelectorAll('[data-armero]').length, elegir: [...document.querySelectorAll('[data-armero]')].filter((b) => b.textContent === 'Elegir').map((b) => b.dataset.armero), olmeca: !!document.querySelector('[data-armero=macana]') })`));
  ok(m.filas === 6 && !m.olmeca && m.elegir.join() === 'lanza_maya', `menú: 6 armas mayas, solo la lanza prestada (${m.elegir})`);

  // Préstamo y compra.
  await ev(`cerrarMenu(); elegirArmero('lanza_maya')`);
  ok(await ev(`enMano()?.id === 'lanza_maya'`), 'te llevas la lanza de pedernal');
  await ev(`elegirArmero('cerbatana')`);
  ok(await ev(`!ranuras().some((r) => r.id === 'cerbatana')`), 'sin cacao no se compra la cerbatana');
  await ev(`darObjeto('ecos', 20); darObjeto('fibras', 3); darObjeto('cacao', 1); elegirArmero('cerbatana')`);
  ok(await ev(`ranuras().some((r) => r.id === 'cerbatana') && tiene('ecos') === 0 && tiene('cacao') === 0 && (juego.flags['armero_maya.compradas'] || []).includes('cerbatana')`), 'comprada la cerbatana (se cobra)');
  ok(await ev(`!(juego.flags['armero.compradas'] || []).includes('cerbatana')`), 'el armero olmeco no la cuenta');

  // Especial de la lanza: estocada larga a 3 m.
  const r = JSON.parse(await ev(`(()=>{ juego.flags['incursion.mano'] = ranuras().findIndex((x) => x.id === 'lanza_maya'); const j = juego.jugador; j.fx = 1; j.fy = 0;
    const e = nuevoEspiritu(j.x + 3, j.y); juego.enemigos.push(e); e.cdEsquiva = 99; const antes = e.vida; prog().energia = 100; juego.esperaEspecial = 0; j.espera = 0;
    habilidadEspecial(j); return JSON.stringify({ antes, despues: e.vida }); })()`));
  ok(r.despues < r.antes, `estocada larga a 3 m: ${r.antes} → ${r.despues}`);

  // Escudo flexible: protege menos que el rígido y no frena.
  const d = JSON.parse(await ev(`(()=>{ tomarArma('escudo_maya', 1); const j = juego.jugador; j.fx = 1; j.fy = 0;
    return JSON.stringify({ f: factorDefensa(j, { x: j.x + 1, y: j.y }), lento: lentoEscudo(), rigido: ARMAS.escudo.defensa }); })()`));
  ok(d.f === 0.3 && d.lento === 1 && d.rigido < d.f, `escudo flexible: deja pasar ${d.f} (el rígido ${d.rigido}), velocidad ×${d.lento}`);
  await ev(`abrirMenu('armero_maya', 'armero_maya')`); await espera(300); await foto('45_armero_despues');
};
