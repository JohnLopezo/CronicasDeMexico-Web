// Cuánto espacio hay entre la llegada y el enemigo más cercano en los niveles generados, con muchas semillas. Uso:
// node herramientas/dificultad/prueba.mjs "file:///…/index.html" <salida> herramientas/dificultad/entradas.mjs
// Además: qué hay en los sitios que el recorrido marcó (enemigo en muro del 3-5, ofrendas inalcanzables).
export default async ({ ev, espera, log }) => {
  const kd = (k) => ev(`dispatchEvent(new KeyboardEvent('keydown',{key:'${k}'}))`), ku = (k) => ev(`dispatchEvent(new KeyboardEvent('keyup',{key:'${k}'}))`);
  const cerrar = async () => { for (let i = 0; i < 40 && await ev('!!juego.dialogo'); i++) { await kd('Enter'); await ku('Enter'); await espera(30); } };
  await ev(`localStorage.clear(); document.getElementById('nueva').click()`); await espera(400);
  await ev(`document.querySelector('[data-elegir=jaguar]').click()`); await espera(1800); await cerrar();
  const N = +(process.env.N || 30);
  log(`nivel | enemigo más cercano a la llegada (mín · mediana, en m, ${N} semillas) | semillas con alguno a < 3 m | a < 2 m`);
  for (const id of ['n1_2', 'n1_3', 'n1_4', 'n2_1', 'n2_2', 'n2_3', 'n2_4', 'n3_1', 'n3_2', 'n3_3', 'n3_4']) {
    const r = JSON.parse(await ev(`(()=>{ const d=[];
      for (let s=1; s<=${N}; s++) { juego.flags['incursion.semilla']=s*7919; const R=generarNivel('${id}'); REGIONES['${id}']=R; mundo=construirMundo('${id}');
        juego.enemigos=[]; juego.otros=[]; juego.interactuables=[]; juego.portales=[]; poblarNivel('${id}', R.puntos, juego.enemigos, juego.interactuables, juego.portales);
        const p=R.puntos.llegada_arriba; const m=Math.min(...juego.enemigos.filter(e=>e.vida>0&&e.tipo!=='vasija').map(e=>Math.hypot(e.x-p.x,e.y-p.y)));
        d.push(m); }
      d.sort((a,b)=>a-b); return JSON.stringify({ min:d[0], med:d[Math.floor(d.length/2)], c3:d.filter(x=>x<3).length, c2:d.filter(x=>x<2).length }); })()`));
    log(`${id} | ${r.min?.toFixed(1)} · ${r.med?.toFixed(1)} | ${r.c3}/${N} | ${r.c2}/${N}`);
  }
};
