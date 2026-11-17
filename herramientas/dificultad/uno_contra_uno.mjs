import fs from 'node:fs';
export default async ({ ev, espera, log }) => {
  const kd = (k) => ev(`dispatchEvent(new KeyboardEvent('keydown',{key:'${k}'}))`), ku = (k) => ev(`dispatchEvent(new KeyboardEvent('keyup',{key:'${k}'}))`);
  const cerrar = async () => { for (let i = 0; i < 30 && await ev('!!juego.dialogo'); i++) { await kd('Enter'); await ku('Enter'); await espera(30); } };
  await ev(`localStorage.clear(); document.getElementById('nueva').click()`); await espera(400);
  await ev(`document.querySelector('[data-elegir=jaguar]').click()`); await espera(1800); await cerrar();
  await ev(fs.readFileSync(new URL('./bot_grupo.js', import.meta.url), 'utf8'));
  // 1) Uno contra uno, en una sala grande del 1-3, a nivel 2 y con la vida llena; 10 peleas por tipo, jugador regular.
  await ev(`cargarRegion('n1_3','llegada_arriba',juego.jugador.vida)`); await espera(1300); await cerrar();
  const tipos = ['espiritu', 'eco', 'Serpiente', 'Cocodrilo', 'Mono', 'Avispa', 'Guacamaya', 'Murcielago', 'pecari', 'tapir', 'ocelote', 'aullador', 'armadillo'];
  log('UNO CONTRA UNO (nv 2, 54 de vida, regular): tipo | vida | coste | xp | seg. | daño recibido | % vida | daño por punto de coste');
  for (const t of tipos) {
    const r = JSON.parse(await ev(`(()=>{ const s=REGIONES[juego.region].puntos.salas.reduce((a,b)=>(b.x1-b.x0)*(b.y1-b.y0)>(a.x1-a.x0)*(a.y1-a.y0)?b:a); const res=[];
      for (let i=0;i<10;i++){ juego.enemigos=[]; juego.marcas=[]; juego.disparos=[]; prog().nivel=2; aplicarEstadisticas(true); const j=juego.jugador; j.max=estadisticas().vida; j.vida=j.max; j.x=s.cx-2.5; j.y=s.cy; j.inv=0; j.esqT=9;
        const mk = { espiritu:()=>nuevoEspiritu(s.cx+1,s.cy), eco:()=>nuevoEco([{x:s.cx+1.5,y:s.cy},{x:s.cx+2.5,y:s.cy+1.5},{x:s.cx+2.5,y:s.cy-1.5}],0), pecari:()=>nuevoPecari(s.cx+1,s.cy), tapir:()=>nuevoTapir(s.cx+1.5,s.cy), ocelote:()=>nuevoOcelote(s.cx+1.5,s.cy), aullador:()=>nuevoAullador(s.cx+2,s.cy), armadillo:()=>nuevoArmadillo(s.cx+1,s.cy) }['${t}'] || (()=>nuevaFauna('${t}', s.cx+1, s.cy, false));
        const e=mk(); juego.enemigos.push(e); if (e.alerta===false) e.alerta=true;
        res.push(GRUPO([e],{habilidad:0.65, maxSeg:60})); }
      const m=(k)=>res.reduce((a,x)=>a+x[k],0)/res.length; return JSON.stringify({ seg:m('seg'), dano:m('dano'), limpio:res.filter(x=>x.limpio).length, vida: (window.__v=juego.enemigos[0]?.max||0) });})()`));
    const vida = await ev(`(${JSON.stringify(t)} in {espiritu:1}) ? ENEMIGO.espiritu.vida : ${JSON.stringify(t)}==='eco' ? ENEMIGO.eco.vida : (FAUNA[${JSON.stringify(t)}]?.maxHealth ?? ({pecari:PECARI,tapir:TAPIR,ocelote:OCELOTE,aullador:AULLADOR,armadillo:ARMADILLO})[${JSON.stringify(t)}].vida)`);
    const coste = await ev(`COSTE[${JSON.stringify(t)}] ?? '-'`), xp = await ev(`(BOTIN[${JSON.stringify(t)}] ? TABLAS[BOTIN[${JSON.stringify(t)}]].xp : TABLAS[BOTIN.fauna].xp)`);
    const porCoste = coste === '-' ? '-' : (r.dano / (t === 'pecari' ? coste / 3 : t === 'aullador' ? coste / 2 : coste)).toFixed(1);
    log(`${t.padEnd(10)} | ${vida} | ${coste}${t === 'pecari' ? ' (÷3)' : t === 'aullador' ? ' (÷2)' : ''} | ${xp} | ${r.seg.toFixed(1)} | ${r.dano.toFixed(1)} | ${Math.round(r.dano / 54 * 100)} % | ${porCoste} | gana ${r.limpio}/10`);
  }
};
