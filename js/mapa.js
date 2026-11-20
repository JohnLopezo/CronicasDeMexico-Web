'use strict';
// Mapa de la región (etapa 47, solo HTML; ver PORTAR_A_UNITY.md §34). Minimapa arriba a la derecha, centrado en el jugador:
// suelo, agua y muros de la región; tú (punto blanco con tu dirección), enemigos (rojo), habitantes (claro), salidas
// (amarillo), santuario de Memoria (verde) y el objetivo de la misión (anillo dorado que parpadea; si está en otra región,
// en la salida que lleva hacia allá). Al tocarlo se agranda con la región entera. Se oculta en Opciones (Mapa).

const MAPA = { cada: 150, vista: 30, colores: { vacio: '#0d0b08', suelo: '#8f8063', muro: '#4a4032', agua: '#2f6f9a' } };
const lienzoMapa = $('minimapa'), cm = lienzoMapa.getContext('2d');
// Fondo de la región, un píxel por metro, hecho una vez por región: agua, lo que bloquea y el suelo.
function fondoMapa() {
  if (mundo.mapa) return mundo.mapa;
  const [x0, x1, y0, y1] = mundo.d.limites, c = document.createElement('canvas'), g = c.getContext('2d'), C = MAPA.colores;
  c.width = x1 - x0 + 1; c.height = y1 - y0 + 1;
  const agua = new Set(mundo.agua.map((a) => a.x + ',' + a.y)), vacio = new Set((mundo.d.vacio || []).map((a) => a.x + ',' + a.y));
  for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) {
    const k = x + ',' + y;
    g.fillStyle = agua.has(k) ? C.agua : vacio.has(k) ? C.vacio : bloqueado(x, y, 0.3) ? C.muro : C.suelo;
    g.fillRect(x - x0, y1 - y, 1, 1);
  }
  return (mundo.mapa = c);
}
// Por qué regiones se pasa para llegar a otra (de las que tienen mapa de misión): la siguiente desde cada una.
const RUTA = { ciudad: { palenque: 'palenque', aldea_maya: 'palenque', teotihuacan: 'palenque', barrio_teo: 'palenque' }, palenque: { ciudad: 'ciudad', aldea_maya: 'aldea_maya', teotihuacan: 'teotihuacan', barrio_teo: 'teotihuacan' },
  aldea_maya: { palenque: 'palenque', ciudad: 'palenque', teotihuacan: 'palenque', barrio_teo: 'palenque' }, teotihuacan: { palenque: 'palenque', ciudad: 'palenque', aldea_maya: 'palenque', barrio_teo: 'barrio_teo' },
  barrio_teo: { teotihuacan: 'teotihuacan', palenque: 'teotihuacan', ciudad: 'teotihuacan', aldea_maya: 'teotihuacan' } }; // etapas 53-54
// Dónde está cada aviso de misión que no se encuentra por su habitante: [región, o una función que da el punto en la región].
const AVISO_EN = {
  'hablar:escriba': 'aldea_maya', 'examinar:tablero_palenque': 'palenque', 'examinar:mural_teo': 'teotihuacan', 'hablar:comerciante_teo': 'barrio_teo', 'hablar:ruta': 'barrio_teo', 'hablar:anciana': 'ciudad', 'examinar:altar_trono': 'ciudad',
  'llegar:mazmorra_maya': 'palenque', 'vencer:cocodrilo_pantano': 'palenque', 'llegar:camaras_estuco': 'palenque', 'vencer:murcielago_estuco': 'palenque', 'llegar:observatorio': 'palenque', 'vencer:guardian_ciclos': 'palenque', // etapa 48: la boca del acueducto
  'examinar:hoja_libro': () => juego.interactuables.filter((i) => i.texto === 'Recoger la hoja')[0] || juego.enemigos.find((e) => e.tipo === 'espiritu' && e.vida > 0),
};
function objetivoEnMapa() {
  const id = [...juego.ordenMisiones].reverse().find((k) => !juego.misiones[k].hecha);
  if (!id) return null;
  const aviso = MISIONES[id].pasos[juego.misiones[id].paso]?.aviso || '', [verbo, quien] = aviso.split(':'), j = juego.jugador;
  if (verbo === 'hablar') { const n = juego.otros.find((o) => o.id === quien); if (n) return n; }
  const aqui = juego.interactuables.find((i) => [].concat(i.aviso || []).includes(aviso)); // lo que lleva ese aviso (la boca del acueducto…)
  if (aqui) return aqui;
  // En la mazmorra: el jefe despierto o, si no, la bajada del nivel.
  if (esGenerado(juego.region)) return juego.jefe?.vida > 0 ? juego.jefe : juego.portales.find((t) => t.punto === 'llegada_arriba') || null;
  if (aviso === 'examinar:tablero_palenque' && juego.region === 'palenque') return { x: PALENQUE.tablero.x, y: PALENQUE.tablero.y - 0.7 };
  if (aviso === 'examinar:altar_trono' && juego.region === 'ciudad') return mundo.objetos.filter((o) => o.sprite.startsWith('Altar_Trono')).sort((a, b) => dist(a, j) - dist(b, j))[0];
  const en = AVISO_EN[aviso];
  if (typeof en === 'function') return en() || null;
  const via = en && en !== juego.region && RUTA[juego.region]?.[en];
  if (!via) return null;
  return [...juego.portales, ...juego.interactuables].find((t) => t.a === via) || null; // la salida hacia allá
}
let mapaGrande = false;
function dibujarMapa() {
  const ver = juego.activo && juego.jugador && mundo && opciones.mapa && !juego.viajando && !juego.menuAbierto; // bajo un menú o una capa, no
  lienzoMapa.classList.toggle('oculto', !ver);
  lienzoMapa.classList.toggle('grande', mapaGrande);
  if (!ver) return;
  const W = (lienzoMapa.width = Math.round(lienzoMapa.clientWidth * 2)), H = (lienzoMapa.height = Math.round(lienzoMapa.clientHeight * 2));
  const f = fondoMapa(), [x0, , , y1] = mundo.d.limites, j = juego.jugador;
  // Escala: el minimapa muestra unos 30 m alrededor; el grande, toda la región.
  const s = mapaGrande ? Math.min(W / f.width, H / f.height) : W / MAPA.vista;
  const cx = mapaGrande ? (f.width / 2 + x0 - 0.5) : j.x, cy = mapaGrande ? (y1 + 0.5 - f.height / 2) : j.y;
  const P = (x, y) => [W / 2 + (x - cx) * s, H / 2 - (y - cy) * s];
  cm.imageSmoothingEnabled = false; cm.fillStyle = MAPA.colores.vacio; cm.fillRect(0, 0, W, H);
  const [ox, oy] = P(x0 - 0.5, y1 + 0.5); cm.drawImage(f, ox, oy, f.width * s, f.height * s);
  const punto = (x, y, r, col) => { const [a, b] = P(x, y); cm.fillStyle = col; cm.beginPath(); cm.arc(a, b, r, 0, 7); cm.fill(); };
  const k = mapaGrande ? 1.4 : 1;
  for (const t of juego.portales) punto(t.x, t.y, 4 * k, '#e6c84a');
  for (const i of juego.interactuables) {
    if (i.a) punto(i.x, i.y, 4 * k, '#e6c84a'); // portal de luz
    if (i.texto === 'Recordar (guardar)') punto(i.x, i.y, 4 * k, '#7fe0b0');
  }
  for (const o of juego.otros) if (o.tipo === 'npc') punto(o.x, o.y, 2.6 * k, '#e8e0cc');
  for (const e of juego.enemigos) if (e.vida > 0 && e.tipo !== 'vasija' && e.golpeable !== false) punto(e.x, e.y, (e.jefe ? 4 : 2.6) * k, '#e0503a');
  const obj = objetivoEnMapa();
  if (obj) { const [a, b] = P(obj.x, obj.y), r = (6 + 2 * Math.sin(performance.now() / 180)) * k; cm.strokeStyle = '#ffd34a'; cm.lineWidth = 2.5; cm.beginPath(); cm.arc(a, b, r, 0, 7); cm.stroke(); }
  // Tú: punto blanco con una flecha hacia donde miras.
  const [a, b] = P(j.x, j.y), l = Math.hypot(j.fx, j.fy) || 1;
  cm.strokeStyle = '#fff'; cm.lineWidth = 2; cm.beginPath(); cm.moveTo(a, b); cm.lineTo(a + (j.fx / l) * 9 * k, b - (j.fy / l) * 9 * k); cm.stroke();
  punto(j.x, j.y, 3.5 * k, '#fff');
}
setInterval(dibujarMapa, MAPA.cada);
lienzoMapa.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); mapaGrande = !mapaGrande; dibujarMapa(); });

// Autocomprobación: el fondo del mapa de Palenque tiene suelo, agua y vacío.
(() => {
  const antes = mundo; mundo = construirMundo('palenque');
  const g = fondoMapa().getContext('2d'), [x0, , , y1] = mundo.d.limites, en = (x, y) => [...g.getImageData(x - x0, y1 - y, 1, 1).data.slice(0, 3)].map((v) => v.toString(16).padStart(2, '0')).join('');
  console.assert(en(12, 0) === MAPA.colores.suelo.slice(1) && en(0, 5) === MAPA.colores.agua.slice(1) && en(-19, 9) === MAPA.colores.vacio.slice(1), 'Mapa: suelo, agua y vacío de Palenque');
  mundo = antes;
})();
