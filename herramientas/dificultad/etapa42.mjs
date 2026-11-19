// Etapa 42: la energía se recarga sola, la especial daña y el armero cobra. Uso:
// node herramientas/dificultad/prueba.mjs "file:///…/index.html?nivel=n1_2" <salida> herramientas/dificultad/etapa42.mjs
export default async ({ ev, espera, log }) => {
  const kd = (k) => ev(`dispatchEvent(new KeyboardEvent('keydown',{key:'${k}'}))`), ku = (k) => ev(`dispatchEvent(new KeyboardEvent('keyup',{key:'${k}'}))`);
  const cerrar = async () => { for (let i = 0; i < 40 && await ev('!!juego.dialogo'); i++) { await kd('Enter'); await ku('Enter'); await espera(30); } };
  await ev(`localStorage.clear(); document.getElementById('nueva').click()`); await espera(400);
  await ev(`document.querySelector('[data-elegir=jaguar]').click()`); await espera(1800); await cerrar();
  const ok = (c, t) => log(`${c ? 'BIEN' : 'MAL '} ${t}`);

  // Recarga: de 0 a ~8 en 2 s (4/s), sin pasar del tope.
  await ev(`prog().energia = 0`); await espera(2000);
  const e2 = await ev(`prog().energia`); ok(e2 > 5 && e2 < 11, `energía tras 2 s desde 0: ${e2.toFixed(1)}`);
  await ev(`prog().energia = estadisticas().energia - 1`); await espera(1000);
  ok(await ev(`prog().energia === estadisticas().energia`), 'no pasa del tope');

  // Especial: con la macana, un enemigo pegado delante pierde vida.
  const r = JSON.parse(await ev(`(()=>{ tomarArma('macana', 1); const j = juego.jugador, e = juego.enemigos.find((x) => x.vida > 0 && x.golpeable !== false);
    if (!e) return JSON.stringify({ sin: true });
    e.x = j.x + j.fx * 0.8; e.y = j.y + j.fy * 0.8; const antes = e.vida; prog().energia = 100; juego.esperaEspecial = 0; j.espera = 0; j.esq = 0;
    habilidadEspecial(j); return JSON.stringify({ antes, despues: e.vida, energia: prog().energia }); })()`));
  ok(!r.sin && r.despues < r.antes, `especial (remolino): vida del enemigo ${r.antes} → ${r.despues}, energía ${r.energia}`);

  // Armero: sin con qué pagar, no; con 15 ecos y 4 fibras, el mazo queda comprado y se cobra; luego se elige gratis.
  const a = JSON.parse(await ev(`(()=>{ const p = prog(); p.bolsa = {}; p.orden = [];
    elegirArmero('mazo'); const sin = !!(juego.flags['armero.compradas'] || []).includes('mazo');
    darObjeto('ecos', 20); darObjeto('fibras', 4); elegirArmero('mazo');
    const con = (juego.flags['armero.compradas'] || []).includes('mazo'), ecos = tiene('ecos'), fibras = tiene('fibras');
    elegirArmero('macana'); elegirArmero('mazo');
    return JSON.stringify({ sin, con, ecos, fibras, eleccion: juego.flags['armero.eleccion'], ecos2: tiene('ecos'), html: menuArmero().includes('Comprar') }); })()`));
  ok(!a.sin, 'sin ecos no se compra');
  ok(a.con && a.ecos === 5 && a.fibras === 0, `comprado: quedan ${a.ecos} ecos y ${a.fibras} fibras`);
  ok(a.eleccion === 'mazo' && a.ecos2 === 5, 'volver a elegirlo no cobra');
  ok(a.html, 'el menú muestra «Comprar» en las que faltan');
};
