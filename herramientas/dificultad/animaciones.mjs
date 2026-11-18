// Hojas de animación de los enemigos, para revisar cómo se mueven: cada enemigo aparece a 3,5 m del jugador en una sala
// vacía y el juego avanza a mano (5 pasos de 1/60 s por fotograma, ~0,08 s); se copian 36 recortes alrededor del enemigo:
// se acerca, avisa, ataca; en el 24 recibe un golpe y en el 30 muere. Una hoja PNG por enemigo en <salida>/hoja_<id>.png.
// Uso: node herramientas/dificultad/prueba.mjs "file:///…/index.html" <salida> herramientas/dificultad/animaciones.mjs
// ENEMIGOS='["pecari","Mono"]' para elegir; por defecto, todos los comunes.
import fs from 'node:fs';
import { join } from 'node:path';
export default async ({ ev, espera, log }) => {
  const kd = (k) => ev(`dispatchEvent(new KeyboardEvent('keydown',{key:'${k}'}))`), ku = (k) => ev(`dispatchEvent(new KeyboardEvent('keyup',{key:'${k}'}))`);
  const cerrar = async () => { for (let i = 0; i < 40 && await ev('!!juego.dialogo'); i++) { await kd('Enter'); await ku('Enter'); await espera(30); } };
  const salida = process.argv[3];
  await ev(`localStorage.clear(); document.getElementById('nueva').click()`); await espera(400);
  await ev(`document.querySelector('[data-elegir=jaguar]').click()`); await espera(1800); await cerrar();
  await ev(`poner('mision.MP_OLM_03.completada'); poner('olm.sello_abierto')`);
  await ev(`cargarRegion('n2_2','llegada_arriba',juego.jugador.vida)`); await espera(1400); await cerrar();
  const LISTA = JSON.parse(process.env.ENEMIGOS || '["espiritu","Serpiente","Cocodrilo","Mono","Avispa","Guacamaya","Murcielago","pecari","tapir","ocelote","aullador","armadillo"]');
  for (const id of LISTA) {
    const png = await ev(`(async ()=>{
      // Sala más grande del nivel, sin enemigos, trampas ni objetos sueltos.
      const s = REGIONES[juego.region].puntos.salas.reduce((a, b) => (b.x1 - b.x0) * (b.y1 - b.y0) > (a.x1 - a.x0) * (a.y1 - a.y0) ? b : a);
      juego.enemigos = []; juego.marcas = []; juego.disparos = []; juego.dardos = []; juego.efectos = [];
      const j = juego.jugador; j.x = s.cx - 2; j.y = s.cy; j.vida = j.max; j.fx = 1; j.fy = 0;
      const mk = { espiritu: () => nuevoEspiritu(s.cx + 1.5, s.cy), pecari: () => nuevoPecari(s.cx + 1.5, s.cy), tapir: () => nuevoTapir(s.cx + 1.5, s.cy),
        ocelote: () => nuevoOcelote(s.cx + 1.5, s.cy), aullador: () => nuevoAullador(s.cx + 1.5, s.cy), armadillo: () => nuevoArmadillo(s.cx + 1.5, s.cy) }['${id}']
        || (() => nuevaFauna('${id}', s.cx + 1.5, s.cy, false));
      const e = mk(); juego.enemigos.push(e); if (e.alerta === false) e.alerta = true;
      juego.pausa = true;
      const k = vista.k, W = 120, H = 100, COLS = 12, FILAS = 3;
      const hoja = document.createElement('canvas'); hoja.width = W * COLS * 2; hoja.height = H * FILAS * 2;
      const g = hoja.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#222'; g.fillRect(0, 0, hoja.width, hoja.height);
      g.font = '20px sans-serif';
      for (let f = 0; f < COLS * FILAS; f++) {
        for (let p = 0; p < 5; p++) { j.inv = 9; j.vida = j.max; actualizar(1 / 60); }
        if (f === 24) herirEnemigo(e, 1, j);
        if (f === 30) herirEnemigo(e, 99999, j);
        dibujarTodo();
        const [px, py] = pantalla(e.x, e.y, (e.z || 0) + 0.5), cx = (px - vista.cx) * k, cy = (py - vista.cy) * k;
        g.drawImage(lienzo, cx - W * k / 2, cy - H * k * 0.65, W * k, H * k, (f % COLS) * W * 2, Math.floor(f / COLS) * H * 2, W * 2, H * 2);
        g.fillStyle = '#ff0'; g.fillText(f + ' ' + (e.estado || e.pose || ''), (f % COLS) * W * 2 + 4, Math.floor(f / COLS) * H * 2 + 20);
      }
      juego.pausa = false;
      return hoja.toDataURL('image/png').split(',')[1]; })()`);
    if (typeof png !== 'string' || png.length < 100) { log(id + ': sin hoja ' + String(png).slice(0, 200)); continue; }
    fs.writeFileSync(join(salida, `hoja_${id}.png`), Buffer.from(png, 'base64'));
    log(id + ': hoja lista');
  }
};
