import fs from 'node:fs';
export default async ({ ev, espera, log }) => {
  const kd = (k) => ev(`dispatchEvent(new KeyboardEvent('keydown',{key:'${k}'}))`), ku = (k) => ev(`dispatchEvent(new KeyboardEvent('keyup',{key:'${k}'}))`);
  const cerrar = async () => { for (let i = 0; i < 30 && await ev('!!juego.dialogo'); i++) { await kd('Enter'); await ku('Enter'); await espera(30); } };
  await ev(`localStorage.clear(); document.getElementById('nueva').click()`); await espera(400);
  await ev(`document.querySelector('[data-elegir=jaguar]').click()`); await espera(1800); await cerrar();
  await ev(fs.readFileSync(new URL('./bot_grupo.js', import.meta.url), 'utf8'));
  const MAPAS = JSON.parse(process.env.MAPAS || '[["ciudad","inicio",1],["selva","llegada",1],["p1","llegada_arriba",1],["p2","llegada_arriba",3],["p3","llegada_arriba",4],["n1_2","llegada_arriba",2],["n2_2","llegada_arriba",3],["n3_2","llegada_arriba",4]]');
  const N = +(process.env.N || 5);
  log('mapa (nv) | grupos | enemigos | tipos | daño recibido (medio, máx) | % de su vida | segundos de combate | caídas');
  for (const [id, punto, nivel] of MAPAS) {
    const res = []; let desc = '';
    for (let i = 0; i < N; i++) {
      await ev(`poner('mision.MP_OLM_03.completada'); poner('mision.MP_OLM_03.activa'); poner('olm.jaguar_piedra_vencido'); poner('olm.sello_abierto'); delete juego.flags['incursion.semilla']; for (const k of Object.keys(juego.flags)) if (k.startsWith('incursion.limpio')) delete juego.flags[k];`);
      await ev(`cargarRegion('${id}','${punto}',juego.jugador.vida)`); await espera(1300); await cerrar();
      const r = JSON.parse(await ev(`(()=>{ prog().nivel=${nivel}; aplicarEstadisticas(true); const j=juego.jugador; j.max=estadisticas().vida; j.vida=j.max; prog().bolsa.semilla_preparada=0; juego.flags['incursion.ranuras']=${process.env.ARMAS||'[]'}.map((a)=>nuevaRanura(a, ${process.env.NV || (id.match(/\d/) || [1])[0]})); juego.flags['incursion.mano']=0; prog().energia=estadisticas().energia; // ARMAS='["macana"]': armas con la calidad del piso (o NV) y energía llena (etapa 37)
        const grupos=GRUPOS(); let dano=0, seg=0, caidas=0; const tipos={};
        for (const g of grupos) { for (const e of g) tipos[e.especie||e.tipo]=(tipos[e.especie||e.tipo]||0)+1;
          // al lado del grupo, por el lado libre
          const c={x:g.reduce((a,e)=>a+e.x,0)/g.length, y:g.reduce((a,e)=>a+e.y,0)/g.length}; let p=null;
          for (const [dx,dy] of [[-3,0],[3,0],[0,-3],[0,3],[-2,-2],[2,2],[-2,2],[2,-2]]) if (!bloqueado(c.x+dx,c.y+dy,0.3)) { p={x:c.x+dx,y:c.y+dy}; break; }
          if (!p) continue; j.x=p.x; j.y=p.y; j.inv=0; j.esqT=9; juego.marcas=[]; juego.disparos=[];
          for (const e of g) { if (e.alerta===false) e.alerta=true; }
          const v0=j.vida; const r=GRUPO(g,{habilidad:${process.env.HAB || 0.65},cadencia:${process.env.CAD || 0},reaccion:${process.env.REAC || 0},maxSeg:90,especial:${!!process.env.ESP},dispara:${!!process.env.DISP}}); seg+=r.seg; dano+=v0-Math.max(0,j.vida);
          if (j.vida<=0) { caidas++; j.vida=j.max; j.muerto=0; } }
        return JSON.stringify({grupos:grupos.length, enemigos:grupos.flat().length, tipos, dano, seg, caidas, max:j.max}); })()`));
      res.push(r); desc = JSON.stringify(r.tipos);
    }
    const m = (k) => (res.reduce((a, x) => a + x[k], 0) / res.length);
    log(`${id} (nv ${nivel}) | ${m('grupos').toFixed(0)} | ${m('enemigos').toFixed(0)} | ${desc} | ${m('dano').toFixed(0)} (${Math.max(...res.map((x) => x.dano))}) | ${Math.round(m('dano') / res[0].max * 100)} % | ${m('seg').toFixed(0)} | ${res.reduce((a, x) => a + x.caidas, 0)}/${N}`);
  }
};
