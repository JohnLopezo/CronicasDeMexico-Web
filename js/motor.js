'use strict';
// Motor: proyección, dibujo de sprites, cámara y entrada (teclado, ratón y táctil).

// ---------- Proyección (la misma cámara que IsometricProjection.cs: 41,81° de inclinación, 48 px por metro) ----------
// Coordenadas del flujo de Blender: x a la derecha, y hacia el fondo, z hacia arriba.
const PPU = 48, PX_Y = 32, PX_Z = 48 * Math.cos(41.81031 * Math.PI / 180);
const pantalla = (x, y, z = 0) => [x * PPU, -(y * PX_Y + z * PX_Z)];
const $ = (id) => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// ---------- Imágenes ----------
const imagenes = {};
function imagen(nombre) {
  let im = imagenes[nombre];
  if (!im && SPRITES[nombre]) { im = imagenes[nombre] = new Image(); im.src = SPRITES[nombre][0]; }
  return im;
}
const precargar = (nombres) => Promise.all([...new Set(nombres)].map((n) => {
  const im = imagen(n);
  return !im || im.complete ? null : new Promise((ok) => { im.addEventListener('load', ok); im.addEventListener('error', ok); });
}));
// El primer nombre que exista: así un cuadro sin su dirección cae en la vista de lado (_03).
const elegir = (...nombres) => nombres.find((n) => SPRITES[n]) || nombres[nombres.length - 1];

// ---------- Lienzo y cámara ----------
const lienzo = $('lienzo'), ctx = lienzo.getContext('2d');
const vista = { k: 2, w: 0, h: 0, cx: 0, cy: 0, temblor: 0 };
function ajustar() {
  const dpr = Math.min(3, devicePixelRatio || 1);
  lienzo.width = Math.round(innerWidth * dpr); lienzo.height = Math.round(innerHeight * dpr);
  // Escala entera, como IsometricProjection.IntegerScale; por el lado corto, para que en vertical no se acerque de más.
  vista.k = Math.max(1, Math.floor(Math.min(lienzo.width, lienzo.height) / 360));
  vista.w = lienzo.width / vista.k; vista.h = lienzo.height / vista.k;
}
addEventListener('resize', ajustar);
ajustar();

function camara(x, y, dt) {
  const [sx, sy] = pantalla(x, y, 0.6);
  vista.temblor = Math.max(0, vista.temblor - dt);
  const t = opciones.sacudida ? vista.temblor * 40 : 0;
  vista.cx = Math.round(sx - vista.w / 2 + (Math.random() - 0.5) * t);
  vista.cy = Math.round(sy - vista.h / 2 + (Math.random() - 0.5) * t);
  ctx.setTransform(vista.k, 0, 0, vista.k, 0, 0);
  ctx.imageSmoothingEnabled = false;
}

// Escala de dibujo de algunos objetos de Unity que salen pequeños junto al Guardián (README, «Proporciones»): ×2 exacto,
// para que los píxeles sigan nítidos. La cabeza colosal (las de La Venta miden 1,5-3,4 m) y la canoa.
const ESCALA_SPRITE = { Cabeza_Piedra_01: 2, Canoa_01: 2 };
// Dibuja un sprite con su pivote en el punto de pantalla (sx, sy), en píxeles del mundo.
function dibujarEn(nombre, sx, sy, o = {}) {
  const s = SPRITES[nombre], im = imagen(nombre);
  if (!s || !im || !im.naturalWidth) return;
  const f = (PPU / s[3]) * (o.escala || 1) * (ESCALA_SPRITE[nombre] || 1), w = im.naturalWidth * f, h = im.naturalHeight * f;
  const px = Math.round(sx - vista.cx), py = Math.round(sy - vista.cy);
  if (px + w < 0 || px - w > vista.w || py - h > vista.h + 8 || py + h < -8) return;
  const mueve = o.sx != null || o.sy != null || o.giro || o.dx || o.dy; // js/movimiento.js
  if (!o.espejo && o.alfa == null && !o.filtro && !mueve) { ctx.drawImage(im, px - Math.round(s[1] * w), py - Math.round((1 - s[2]) * h), w, h); return; }
  ctx.save();
  if (o.alfa != null) ctx.globalAlpha = o.alfa;
  if (o.filtro) ctx.filter = o.filtro;
  ctx.translate(px + Math.round((o.espejo ? -1 : 1) * (o.dx || 0)), py + Math.round(o.dy || 0));
  // Inclinación alrededor del pie; giro > 0 = echado atrás (en el canvas, girar en positivo inclina hacia delante al que mira a la derecha).
  if (o.giro) ctx.rotate(o.espejo ? o.giro : -o.giro);
  if (o.espejo || mueve) ctx.scale((o.espejo ? -1 : 1) * (o.sx ?? 1), o.sy ?? 1);
  ctx.drawImage(im, -Math.round(s[1] * w), -Math.round((1 - s[2]) * h), w, h);
  ctx.restore();
}
const dibujar = (nombre, x, y, z = 0, o) => { const [sx, sy] = pantalla(x, y, z); dibujarEn(nombre, sx, sy, o); };

// Elipse sobre el suelo (círculo de r metros visto por la cámara).
function elipse(x, y, r, relleno, borde, z = 0) {
  const [sx, sy] = pantalla(x, y, z);
  ctx.beginPath(); ctx.ellipse(sx - vista.cx, sy - vista.cy, r * PPU, r * PX_Y, 0, 0, Math.PI * 2);
  if (relleno) { ctx.fillStyle = relleno; ctx.fill(); }
  if (borde) { ctx.strokeStyle = borde; ctx.lineWidth = 1; ctx.stroke(); }
}
function texto(txt, x, y, z, color, alfa = 1) {
  const [sx, sy] = pantalla(x, y, z);
  ctx.globalAlpha = alfa; ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center';
  ctx.fillStyle = '#000'; ctx.fillText(txt, Math.round(sx - vista.cx) + 1, Math.round(sy - vista.cy) + 1);
  ctx.fillStyle = color; ctx.fillText(txt, Math.round(sx - vista.cx), Math.round(sy - vista.cy));
  ctx.globalAlpha = 1;
}

// ---------- Entrada ----------
// Las pulsaciones se guardan 0,15 s (inputBuffer de PlayerAttack y dodgeBuffer de PlayerMovement).
const entrada = { teclas: new Set(), tx: 0, ty: 0, atacarSostenido: false, defensaRaton: false, defensaTactil: false, usarTactil: false, pedidos: {}, alPulsar: null };
const defensaPulsada = () => entrada.teclas.has('q') || entrada.defensaRaton || entrada.defensaTactil;
const pedir = (acc) => { entrada.pedidos[acc] = performance.now(); entrada.alPulsar?.(acc); };
// Una pulsación posterior al cuadro anterior siempre vale: un tirón (crear el audio con el primer toque tarda ~150 ms) no la hace caducar.
function consumir(acc, ventana = 150) {
  const t = entrada.pedidos[acc];
  if (t && (t >= (entrada.cuadroPrevio ?? Infinity) || performance.now() - t <= ventana)) { delete entrada.pedidos[acc]; return true; }
  return false;
}
// Eje de movimiento en el mundo: arriba en pantalla es +y (hacia el fondo).
function ejes() {
  const k = entrada.teclas;
  let x = (k.has('d') || k.has('arrowright') ? 1 : 0) - (k.has('a') || k.has('arrowleft') ? 1 : 0);
  let y = (k.has('w') || k.has('arrowup') ? 1 : 0) - (k.has('s') || k.has('arrowdown') ? 1 : 0);
  if (!x && !y) { x = entrada.tx; y = -entrada.ty; } // joystick analógico: menos inclinación, menos velocidad
  const l = Math.hypot(x, y);
  return l > 1 ? [x / l, y / l] : [x, y];
}
const TECLAS = { tab: 'fijar', j: 'atacar', k: 'saltar', ' ': 'esquivar', e: 'usar', enter: 'usar', escape: 'pausa', c: 'tierra', i: 'bolsa', 1: 'rapido', f: 'especial' };
addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if ([' ', 'tab', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k) && !e.target.closest?.('.capa:not(.oculto)')) e.preventDefault(); // en los menús, Tab recorre los botones
  if (!entrada.teclas.has(k) && TECLAS[k]) pedir(TECLAS[k]);
  entrada.teclas.add(k);
});
addEventListener('keyup', (e) => entrada.teclas.delete(e.key.toLowerCase()));
addEventListener('blur', () => { entrada.teclas.clear(); entrada.defensaRaton = false; });
// El clic con ratón ataca; tocar la pantalla no (igual que en el juego desde el S24+).
lienzo.addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse' && e.button === 0) pedir('atacar'); if (e.pointerType === 'mouse' && e.button === 2) entrada.defensaRaton = true; });
addEventListener('pointerup', (e) => { if (e.button === 2) entrada.defensaRaton = false; });
lienzo.addEventListener('contextmenu', (e) => e.preventDefault()); // el clic derecho defiende

const activarTactil = () => document.body.classList.add('es-tactil');
if (matchMedia('(pointer: coarse)').matches) activarTactil();
addEventListener('touchstart', activarTactil, { once: true, passive: true });

const stick = $('stick'), perilla = $('perilla');
let stickId = null;
function moverStick(e) {
  const r = stick.getBoundingClientRect(), R = r.width / 2;
  let dx = e.clientX - (r.left + R), dy = e.clientY - (r.top + R);
  const l = Math.hypot(dx, dy);
  if (l > R) { dx = (dx / l) * R; dy = (dy / l) * R; }
  perilla.style.transform = `translate(${dx}px, ${dy}px)`;
  const zona = Math.min(1, l / R) < 0.15; // zona muerta del 15 %
  entrada.tx = zona ? 0 : dx / R; entrada.ty = zona ? 0 : dy / R;
}
function soltarStick() { stickId = null; entrada.tx = entrada.ty = 0; perilla.style.transform = ''; }
stick.addEventListener('pointerdown', (e) => { e.preventDefault(); stickId = e.pointerId; stick.setPointerCapture(e.pointerId); moverStick(e); });
stick.addEventListener('pointermove', (e) => { if (e.pointerId === stickId) moverStick(e); });
stick.addEventListener('pointerup', soltarStick);
stick.addEventListener('pointercancel', soltarStick);
for (const b of document.querySelectorAll('.tbtn')) {
  const acc = b.dataset.acc;
  const soltar = () => { if (acc !== 'fijar') b.classList.remove('sostenido'); if (acc === 'atacar') entrada.atacarSostenido = false; if (acc === 'defender') entrada.defensaTactil = false; if (acc === 'usar') entrada.usarTactil = false; };
  b.addEventListener('pointerdown', (e) => {
    e.preventDefault(); b.setPointerCapture(e.pointerId); b.classList.add('sostenido');
    if (acc === 'atacar') entrada.atacarSostenido = true;
    if (acc === 'defender') entrada.defensaTactil = true;
    if (acc === 'usar') entrada.usarTactil = true; // mantener Usar: acción de senda
    pedir(acc); vibrar(10);
  });
  b.addEventListener('pointerup', soltar);
  b.addEventListener('pointercancel', soltar);
}
$('bPausa').onclick = () => pedir('pausa');

// Autocomprobación de la proyección (consola del navegador).
console.assert(pantalla(1, 0)[0] === 48 && pantalla(0, 1)[1] === -32, 'Proyección: 48 px por metro en x, 32 en y');
console.assert(Math.abs(PX_Z - 35.78) < 0.01, 'Proyección: 35,78 px por metro de altura');

// Anillo sobre el suelo: de la mitad del radio hacia fuera (TelegraphMarker.RingInnerRatio). El centro queda a salvo.
function anillo(x, y, r, relleno) {
  const [sx, sy] = pantalla(x, y), cx = sx - vista.cx, cy = sy - vista.cy;
  ctx.beginPath();
  ctx.ellipse(cx, cy, r * PPU, r * PX_Y, 0, 0, Math.PI * 2);
  ctx.ellipse(cx, cy, r * 0.5 * PPU, r * 0.5 * PX_Y, 0, 0, Math.PI * 2);
  ctx.fillStyle = relleno; ctx.fill('evenodd');
  ctx.strokeStyle = '#c9a8ff'; ctx.lineWidth = 1; ctx.stroke();
}
// Franja sobre el suelo desde (m.x, m.y) en la dirección (m.dx, m.dy), de m.largo de largo y m.r de ancho.
function franja(m, relleno) {
  const nx = -m.dy * m.r / 2, ny = m.dx * m.r / 2, fx = m.dx * m.largo, fy = m.dy * m.largo;
  const pts = [[m.x + nx, m.y + ny], [m.x + fx + nx, m.y + fy + ny], [m.x + fx - nx, m.y + fy - ny], [m.x - nx, m.y - ny]].map(([x, y]) => pantalla(x, y));
  ctx.beginPath();
  pts.forEach(([sx, sy], i) => (i ? ctx.lineTo : ctx.moveTo).call(ctx, sx - vista.cx, sy - vista.cy));
  ctx.closePath(); ctx.fillStyle = relleno; ctx.fill(); ctx.strokeStyle = '#ff8a7a'; ctx.lineWidth = 1; ctx.stroke();
}
