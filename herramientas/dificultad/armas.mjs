export default async ({ ev, espera, log }) => {
  const kd = (k) => ev(`dispatchEvent(new KeyboardEvent('keydown',{key:'${k}'}))`), ku = (k) => ev(`dispatchEvent(new KeyboardEvent('keyup',{key:'${k}'}))`);
  const cerrar = async () => { for (let i = 0; i < 30 && await ev('!!juego.dialogo'); i++) { await kd('Enter'); await ku('Enter'); await espera(30); } };
  await ev(`localStorage.clear(); document.getElementById('nueva').click()`); await espera(400);
  await ev(`document.querySelector('[data-elegir=jaguar]').click()`); await espera(1800); await cerrar();
  await ev(`cargarRegion('n1_3','llegada_arriba',juego.jugador.vida)`); await espera(1300); await cerrar();
  const r = await ev(`(()=>{ const out=[], j=juego.jugador, s=REGIONES[juego.region].puntos.salas[0];
    const reset=()=>{ juego.enemigos=[]; juego.dardos=[]; j.x=s.cx; j.y=s.cy; j.fx=1; j.fy=0; juego.esperaEspecial=0; prog().energia=100; j.espera=0; };
    juego.flags['incursion.ranuras']=[]; juego.flags['incursion.mano']=0;
    out.push('sin arma, especial: '+especialDe());
    tomarArma('macana',1); tomarArma('honda',3); out.push('HUD: '+textoArmas()+' | mano '+enMano().id);
    tomarArma('mazo',2); out.push('tercera: '+textoArmas());
    cambiarArma(); out.push('cambiar: '+textoArmas()+' | mano '+enMano().id);
    tomarArma('honda',1); out.push('misma honda ★: '+textoArmas());
    // daño por calidad: golpe normal con macana ★ y ★★★ contra espíritu
    const golpes={};
    for (const nv of [1,3]) { reset(); juego.flags['incursion.ranuras']=[nuevaRanura('macana',nv)]; juego.flags['incursion.mano']=0;
      const e=nuevoEspiritu(s.cx+0.9,s.cy); e.vida=e.max=999; e.probEsquiva=0; juego.enemigos.push(e); golpear(j); golpes[nv]=999-e.vida; out.push('macana nv'+nv+' golpe: '+golpes[nv]); }
    console.assert(golpes[1]>0 && golpes[3]>golpes[1], 'Prueba armas: la calidad ★★★ pega más que la ★');
    console.assert(textoArmas()==='Macana★★★', 'Prueba armas: HUD con un arma');
    // especiales
    for (const id of Object.keys(ARMAS)) { reset(); juego.flags['incursion.ranuras']=[nuevaRanura(id,2)]; juego.flags['incursion.mano']=0;
      const es=[[1,0],[-1,0],[2.5,0],[4,0.5]].map(([dx,dy])=>{const e=nuevoEspiritu(s.cx+dx,s.cy+dy); e.vida=e.max=999; e.probEsquiva=0; juego.enemigos.push(e); return e;});
      const en=prog().energia; habilidadEspecial(j);
      for (let k=0;k<60;k++) actualizarArmas(1/60);
      console.assert(es[0].vida<999 && en-prog().energia===25, 'Prueba armas: especial de '+id+' pega delante y cuesta 25');
      out.push(id+': '+es.map(e=>999-e.vida).join('/')+' energía -'+(en-prog().energia)+' mun '+enMano()?.mun+' aturdido '+es.map(e=>(e.aturdido||0)>0?1:0).join('')); }
    // Etapa 38: cofre u ofrenda con las manos llenas → al suelo; con una ranura libre → a la mano.
    reset(); juego.flags['incursion.ranuras']=[nuevaRanura('macana',1),nuevaRanura('mazo',2)]; juego.flags['incursion.mano']=1;
    ofrecerArma('honda',2,j);
    const suelo=juego.interactuables.find(i=>i.texto==='Tomar honda ★★');
    console.assert(ranuras().length===2 && enMano().id==='mazo' && suelo, 'Prueba armas: con las manos llenas, el arma del cofre queda en el suelo');
    suelo.usar();
    console.assert(textoArmas()==='Macana★ · ▸Honda★★ 30', 'Prueba armas: tomada del suelo, sustituye a la de la mano');
    out.push('cofre con las manos llenas: suelo y luego '+textoArmas());
    juego.flags['incursion.ranuras']=[nuevaRanura('macana',1)]; juego.flags['incursion.mano']=0; ofrecerArma('lanza',3,j);
    console.assert(textoArmas()==='Macana★ · ▸Lanza★★★', 'Prueba armas: con una ranura libre, el arma del cofre se toma');
    // Sin munición, el arma a distancia se suelta y la otra pasa a la mano.
    reset(); const r1=nuevaRanura('jabalina',2); r1.mun=1; juego.flags['incursion.ranuras']=[r1,nuevaRanura('macana',1)]; juego.flags['incursion.mano']=0;
    const lejos=nuevoEspiritu(s.cx+5,s.cy); lejos.vida=lejos.max=999; juego.enemigos.push(lejos);
    console.assert(lanzarDardo(j) && textoArmas()==='Macana★' && enMano().id==='macana', 'Prueba armas: sin munición se suelta el arma a distancia');
    out.push('última jabalina: '+textoArmas());
    return out.join('\\n'); })()`);
  log(r);
};
