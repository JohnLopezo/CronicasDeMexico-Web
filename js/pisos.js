'use strict';
// Diseño propio de los pisos 2 y 3 de la mazmorra, pintado por código (etapa 35, solo HTML; ver PORTAR_A_UNITY.md):
//   piso 2, «cámaras inundadas»: lajas verdosas irregulares con musgo en las juntas y charcos; muros de piedras de río
//   apiladas, con musgo arriba y la marca del agua abajo.
//   piso 3, «templo olmeca»: baldosas de barro rojizo talladas (algunas con la cruz olmeca, otras rajadas); muros de
//   sillares con un friso de grecas.
// El piso 1 sigue con el arte de Unity. `pintarLosa` pinta una celda en el lienzo del suelo (js/niveles.js, dibujarLosas) y
// `pintarMuro` devuelve el lienzo de un muro con el mismo tamaño y ancla que Muro_Basalto (64 × 112, base en y = 94).

const PALETA = {
  2: { junta: '#16231f', piedra: ['#4a5a52', '#536358', '#45544e', '#5b6a5e'], claro: '#6f7f72', oscuro: '#36433d',
    musgo: ['#3f6b31', '#56853a', '#6f9c45'], charco: '#173f45', brillo: '#5fa3a0', cara: '#26332f', gota: '#18221f' },
  3: { junta: '#3b1f17', piedra: ['#8a4e36', '#94573b', '#7f4631', '#9a5e40'], claro: '#b57a55', oscuro: '#5a2f22',
    talla: '#4a2419', cara: '#6a3626', friso: '#a86a48' },
  // Etapa 43, Palenque (js/palenque.js): caliza clara con juntas, tierra de la selva y estuco con restos de rojo.
  4: { junta: '#8a8169', piedra: ['#d6ccb2', '#cfc4a8', '#c9bea2', '#dcd3bb'], claro: '#ece5d2', oscuro: '#a99e84', cara: '#9c917a',
    tierra: ['#5a4630', '#634d33', '#54412c'], hojas: ['#7a6a3a', '#8c5a2e', '#4f6b30'], pasto: ['#4f7d34', '#679a3f', '#3e6a2c'],
    raiz: '#3a2a1b', estuco: '#a4483a', boveda: '#2c2a24' },
};
const px = (g, c, x, y, w = 1, h = 1) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
const elige = (rnd, a) => a[Math.floor(rnd() * a.length)];
// Elipse llena píxel a píxel (sin suavizado, para que siga pareciendo pixel art).
const bola = (g, c, cx, cy, rx, ry) => {
  g.fillStyle = c;
  for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++) if ((x * x) / (rx * rx) + (y * y) / (ry * ry) <= 1) g.fillRect(Math.round(cx + x), Math.round(cy + y), 1, 1);
};
// Greca escalonada (xicalcoliuhqui simplificado) de `w` px de ancho y 6 de alto.
const greca = (g, c, x0, y, w) => { for (let x = x0; x < x0 + w; x += 8) { px(g, c, x, y + 4, 4, 2); px(g, c, x + 2, y + 2, 2, 2); px(g, c, x + 2, y, 6, 2); px(g, c, x + 6, y + 2, 2, 4); } };

// Celda (ox, oy) = esquina de arriba a la izquierda de su cara de suelo (48 × 32). l.arriba: borde de atrás (10 px encima);
// l.abajo: borde de delante (14 px de cara de piedra debajo).
function pintarLosa(g, piso, ox, oy, l) {
  const P = PALETA[piso], rnd = azar(((l.x * 73856093) ^ (l.y * 19349663)) >>> 0);
  px(g, P.junta, ox, oy, PPU, PX_Y);
  if (piso === 4) return losaPalenque(g, P, rnd, ox, oy, l);
  if (piso === 2) {
    // Dos o cuatro lajas: un corte vertical y un corte horizontal a cada lado, a alturas distintas.
    const cx = 14 + Math.floor(rnd() * 20), cy = [8 + Math.floor(rnd() * 16), 8 + Math.floor(rnd() * 16)];
    const lajas = [[0, 0, cx, cy[0]], [0, cy[0], cx, PX_Y - cy[0]], [cx, 0, PPU - cx, cy[1]], [cx, cy[1], PPU - cx, PX_Y - cy[1]]];
    for (const [x, y, w, h] of lajas) {
      if (w < 4 || h < 4) continue;
      px(g, elige(rnd, P.piedra), ox + x + 1, oy + y + 1, w - 2, h - 2);
      px(g, P.claro, ox + x + 2, oy + y + 1, w - 4, 1); px(g, P.oscuro, ox + x + 2, oy + y + h - 2, w - 4, 1);
      for (const [a, b] of [[1, 1], [w - 2, 1], [1, h - 2], [w - 2, h - 2]]) px(g, P.junta, ox + x + a, oy + y + b); // esquinas romas
      for (let i = 0; i < 5; i++) px(g, rnd() < 0.5 ? P.claro : P.oscuro, ox + x + 2 + Math.floor(rnd() * (w - 4)), oy + y + 2 + Math.floor(rnd() * (h - 4)));
    }
    for (let i = 0; i < 10; i++) { const v = rnd() < 0.5; px(g, elige(rnd, P.musgo), ox + (v ? cx - 1 + Math.floor(rnd() * 2) : Math.floor(rnd() * PPU)), oy + (v ? Math.floor(rnd() * PX_Y) : cy[rnd() < 0.5 ? 0 : 1] - 1 + Math.floor(rnd() * 2)), 1 + Math.floor(rnd() * 2), 1); }
    if (rnd() < 0.1) { const a = ox + 12 + rnd() * 24, b = oy + 10 + rnd() * 12; bola(g, P.charco, a, b, 7 + Math.floor(rnd() * 4), 3 + Math.floor(rnd() * 2)); px(g, P.brillo, Math.round(a - 3), Math.round(b - 1), 4, 1); }
    if (l.arriba) for (let x = 0; x < PPU; x++) { const h = 3 + Math.floor(rnd() * 7); px(g, P.musgo[0], ox + x, oy - h, 1, h); px(g, elige(rnd, P.musgo.slice(1)), ox + x, oy - h, 1, 1 + Math.floor(rnd() * 2)); }
    if (l.abajo) {
      px(g, P.cara, ox, oy + PX_Y, PPU, LOSA.cara); px(g, P.claro, ox, oy + PX_Y, PPU, 1); px(g, P.gota, ox, oy + PX_Y + LOSA.cara - 2, PPU, 2);
      for (let i = 0; i < 4; i++) px(g, P.gota, ox + Math.floor(rnd() * PPU), oy + PX_Y + 2, 1, 3 + Math.floor(rnd() * 9));
      for (let i = 0; i < 3; i++) px(g, elige(rnd, P.musgo), ox + Math.floor(rnd() * PPU), oy + PX_Y + 1, 2, 1);
    }
  } else {
    // Una baldosa por celda, biselada: clara arriba y a la izquierda, oscura abajo y a la derecha.
    px(g, elige(rnd, P.piedra), ox + 1, oy + 1, PPU - 2, PX_Y - 2);
    px(g, P.claro, ox + 1, oy + 1, PPU - 2, 1); px(g, P.claro, ox + 1, oy + 1, 1, PX_Y - 2);
    px(g, P.oscuro, ox + 1, oy + PX_Y - 2, PPU - 2, 1); px(g, P.oscuro, ox + PPU - 2, oy + 1, 1, PX_Y - 2);
    for (let i = 0; i < 8; i++) px(g, rnd() < 0.5 ? P.claro : P.oscuro, ox + 3 + Math.floor(rnd() * (PPU - 6)), oy + 3 + Math.floor(rnd() * (PX_Y - 6)));
    const t = rnd();
    if (t < 0.1) { // cruz olmeca: un cuadro tallado con su aspa dentro
      const a = ox + 15, b = oy + 9;
      px(g, P.talla, a, b, 18, 1); px(g, P.talla, a, b + 13, 18, 1); px(g, P.talla, a, b, 1, 14); px(g, P.talla, a + 17, b, 1, 14);
      for (let i = 0; i < 12; i++) { px(g, P.talla, a + 3 + i, b + 1 + i); px(g, P.talla, a + 14 - i, b + 1 + i); }
      px(g, P.claro, a + 1, b + 14, 18, 1);
    } else if (t < 0.2) { // rajada
      let x = ox + 6 + rnd() * 36, y = oy + 3;
      while (y < oy + PX_Y - 3) { px(g, P.talla, Math.round(x), Math.round(y)); x += (rnd() - 0.5) * 2.5; y += 1; }
    }
    if (l.arriba) { px(g, P.oscuro, ox, oy - LOSA.matas, PPU, LOSA.matas); px(g, P.friso, ox, oy - LOSA.matas, PPU, 2); for (let x = 2; x < PPU; x += 6) px(g, P.friso, ox + x, oy - 6, 3, 3); }
    if (l.abajo) { px(g, P.cara, ox, oy + PX_Y, PPU, LOSA.cara); px(g, P.friso, ox, oy + PX_Y, PPU, 1); greca(g, P.talla, ox, oy + PX_Y + 4, PPU); px(g, P.junta, ox, oy + PX_Y + LOSA.cara - 2, PPU, 2); }
  }
}

// Piso 4 (Palenque): l.tipo 'tierra' (claro y sendero: tierra con hojarasca, pasto en el borde de atrás y talud con raíces
// delante), 'caliza' (calzada y plaza: dos losas por celda, bordillo de estuco con rojo detrás y sillares delante) o
// 'puente' (como la caliza, con una bóveda oscura en la cara: el agua pasa por debajo).
function losaPalenque(g, P, rnd, ox, oy, l) {
  if (l.tipo === 'tierra') {
    px(g, P.tierra[0], ox, oy, PPU, PX_Y);
    for (let i = 0; i < 26; i++) px(g, elige(rnd, P.tierra), ox + Math.floor(rnd() * PPU), oy + Math.floor(rnd() * PX_Y), 3 + Math.floor(rnd() * 5), 2);
    for (let i = 0; i < 22; i++) px(g, rnd() < 0.7 ? elige(rnd, P.hojas) : P.raiz, ox + Math.floor(rnd() * PPU), oy + Math.floor(rnd() * PX_Y), 1 + Math.floor(rnd() * 2), 1);
    if (rnd() < 0.3) bola(g, P.oscuro, ox + 8 + rnd() * 32, oy + 6 + rnd() * 20, 2, 1); // piedra suelta
    if (l.arriba) for (let x = 0; x < PPU; x++) { const h = 3 + Math.floor(rnd() * 8); px(g, P.pasto[2], ox + x, oy - h, 1, h + 1); px(g, elige(rnd, P.pasto), ox + x, oy - h, 1, 1 + Math.floor(rnd() * 2)); }
    if (l.abajo) { px(g, P.raiz, ox, oy + PX_Y, PPU, LOSA.cara); for (let i = 0; i < 6; i++) px(g, elige(rnd, P.tierra), ox + Math.floor(rnd() * PPU), oy + PX_Y + 1 + Math.floor(rnd() * 10), 3, 2); px(g, P.pasto[2], ox, oy + PX_Y, PPU, 1); }
    return;
  }
  const cx = 18 + Math.floor(rnd() * 12);
  for (const [x, w] of [[0, cx], [cx, PPU - cx]]) {
    px(g, elige(rnd, P.piedra), ox + x + 1, oy + 1, w - 2, PX_Y - 2);
    px(g, P.claro, ox + x + 1, oy + 1, w - 2, 1); px(g, P.oscuro, ox + x + 1, oy + PX_Y - 2, w - 2, 1);
    for (let i = 0; i < 6; i++) px(g, rnd() < 0.5 ? P.claro : P.oscuro, ox + x + 2 + Math.floor(rnd() * (w - 4)), oy + 2 + Math.floor(rnd() * (PX_Y - 4)));
  }
  if (rnd() < 0.25) for (let i = 0; i < 4; i++) px(g, elige(rnd, P.pasto), ox + cx - 1, oy + 2 + Math.floor(rnd() * (PX_Y - 4)), 2, 2); // hierba en la junta
  if (l.arriba) { px(g, P.oscuro, ox, oy - LOSA.matas, PPU, LOSA.matas); px(g, P.piedra[0], ox, oy - LOSA.matas, PPU, 3); px(g, P.estuco, ox, oy - 4, PPU, 2); }
  if (l.abajo) {
    px(g, P.cara, ox, oy + PX_Y, PPU, LOSA.cara); px(g, P.claro, ox, oy + PX_Y, PPU, 1);
    if (l.tipo === 'puente') { px(g, P.boveda, ox + 12, oy + PX_Y + 4, 24, 10); px(g, P.boveda, ox + 16, oy + PX_Y + 2, 16, 2); } // bóveda maya (en saledizo)
    else for (let x = (l.x % 2) * 12; x < PPU; x += 24) px(g, P.junta, ox + x, oy + PX_Y + 1, 1, LOSA.cara - 1);
    px(g, P.junta, ox, oy + PX_Y + 7, PPU, 1);
  }
}

// Muro del borde de atrás (`y` = false: 48 px de ancho, de y ≈ 36 a 98) o del oeste (`y` = true: una columna, x 25-38, y 18-109).
function pintarMuro(piso, esY, variante) {
  const c = document.createElement('canvas'), g = c.getContext('2d'), P = PALETA[piso], rnd = azar(piso * 100 + variante + (esY ? 50 : 0));
  c.width = 64; c.height = 112;
  if (piso === 2) {
    // Piedras de río apiladas de abajo arriba; las de arriba con musgo.
    const [x0, x1, top] = esY ? [26, 37, 20] : [8, 55, 38 + Math.floor(rnd() * 5)], piedras = [];
    for (let y = esY ? 104 : 92, fila = 0; y > top; y -= esY ? 9 : 10, fila++)
      for (let x = x0 + (fila % 2 ? 4 : 0); x <= x1; x += esY ? 12 : 11 + Math.floor(rnd() * 4)) piedras.push([Math.min(x, x1 - 4), y, esY ? 6 : 6 + Math.floor(rnd() * 3), esY ? 5 : 5 + Math.floor(rnd() * 2)]);
    for (const [x, y, rx, ry] of piedras) bola(g, P.junta, x, y, rx + 1, ry + 1);
    for (const [x, y, rx, ry] of piedras) {
      bola(g, elige(rnd, P.piedra), x, y, rx, ry); bola(g, P.claro, x - 2, y - 2, 2, 1);
      if (y - ry < top + 12) for (let i = 0; i < 6; i++) px(g, elige(rnd, P.musgo), x - rx + Math.floor(rnd() * rx * 2), y - ry + Math.floor(rnd() * 3), 2, 1);
    }
    // La marca del agua: abajo, más oscuro y húmedo.
    g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(8,30,32,.45)'; g.fillRect(0, esY ? 96 : 86, 64, 26);
    g.fillStyle = 'rgba(95,163,160,.35)'; g.fillRect(0, esY ? 95 : 85, 64, 1);
  } else {
    // Sillares en hiladas de 11 px, a tizón; arriba, un friso con greca y una cornisa clara.
    const [x0, x1, y0, y1] = esY ? [26, 37, 20, 108] : [8, 55, 46, 97];
    px(g, P.junta, x0 - 1, y0 - 1, x1 - x0 + 3, y1 - y0 + 2);
    for (let y = y1 - 11, fila = 0; y >= y0; y -= 11, fila++)
      for (let x = x0 - (fila % 2 ? 8 : 0); x <= x1; x += 16) {
        const a = Math.max(x, x0), b = Math.min(x + 15, x1);
        px(g, elige(rnd, P.piedra), a, y + 1, b - a, 10); px(g, P.claro, a, y + 1, b - a, 1); px(g, P.oscuro, a, y + 10, b - a, 1); px(g, P.oscuro, b - 1, y + 1, 1, 10);
      }
    if (!esY) { px(g, P.oscuro, x0 - 1, 34, x1 - x0 + 3, 12); greca(g, P.friso, x0, 37, x1 - x0); px(g, P.friso, x0 - 1, 32, x1 - x0 + 3, 2); px(g, P.junta, x0 - 1, 45, x1 - x0 + 3, 1); }
    else for (let y = y0; y < y1; y += 22) px(g, P.friso, x0, y, x1 - x0 + 1, 2); // fajas en la pilastra
    px(g, P.junta, x0 - 1, y1 - 3, x1 - x0 + 3, 3); // zócalo
  }
  return Object.assign(c, { naturalWidth: c.width, naturalHeight: c.height, complete: true });
}
