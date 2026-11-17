import fs from 'node:fs';
export default async ({ ev, espera, log }) => {
  const kd = (k) => ev(`dispatchEvent(new KeyboardEvent('keydown',{key:'${k}'}))`), ku = (k) => ev(`dispatchEvent(new KeyboardEvent('keyup',{key:'${k}'}))`);
  const cerrar = async () => { for (let i = 0; i < 30 && await ev('!!juego.dialogo'); i++) { await kd('Enter'); await ku('Enter'); await espera(30); } };
  await ev(`localStorage.clear(); document.getElementById('nueva').click()`); await espera(400);
  await ev(`document.querySelector('[data-elegir=jaguar]').click()`); await espera(1800); await cerrar();
  await ev(fs.readFileSync(new URL('./bot_jefe.js', import.meta.url), 'utf8'));
  const JEFES = JSON.parse(process.env.JEFES || '[["nauyaca","n1_5",2,0.7],["jaguar","p2",3,1],["guardian","p3",4,0.7]]');
  const N = +(process.env.N || 6);
  for (const [tipo, region, nivel, vida] of JEFES) {
    for (const hab of JSON.parse(process.env.HABS || "[0.65, 0.85]")) {
      const r = [];
      for (let i = 0; i < N; i++) {
        await ev(`poner('olm.sello_abierto'); delete juego.flags['olm.jaguar_piedra_vencido']; delete juego.flags['olm.guardian_liberado']; delete juego.flags['olm.subjefe_1_vencido']`);
        await ev(`cargarRegion('${region}','llegada_arriba',juego.jugador.vida)`); await espera(1300); await cerrar();
        r.push(JSON.parse(await ev(`(()=>{ const b=juego.enemigos.find(e=>e.tipo==='${tipo}'); for (const e of juego.enemigos) if (e!==b) e.vida=0; juego.enemigos=[b]; juego.marcas=[]; juego.disparos=[];
          const j=juego.jugador; j.x=b.x-3.5; j.y=b.y; if (bloqueado(j.x,j.y,0.3)) { j.x=b.x+3.5; } return JSON.stringify(PELEA(b,{nivel:${nivel}, vida:${vida}, habilidad:${hab}, semillas:${process.env.SEMILLAS || 0}, cadencia:${process.env.CAD || 0}, reaccion:${process.env.REAC || 0}})); })()`)));
        await cerrar();
      }
      const gan = r.filter((x) => x.gana), m = (k, a = r) => a.length ? (a.reduce((s, x) => s + x[k], 0) / a.length).toFixed(0) : '-';
      log(`${tipo} (nv ${nivel}, llega con ${Math.round(vida * 100)} % · ${r[0].vidaMax} de vida) · habilidad ${hab}: gana ${gan.length}/${N} · ${m('seg', gan)} s · daño recibido ${m('danoRecibido')} (${m('golpes')} golpes) · al perder, jefe con ${m('vidaJefe', r.filter((x) => !x.gana))} de vida`);
    }
  }
};
