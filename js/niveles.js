'use strict';
// Niveles de la mazmorra (solo en la versión HTML; ver PORTAR_A_UNITY.md). Cada piso tiene cinco niveles, del X-1 al X-5:
//   piso 1: 1-1 es el piso 1 de Unity (El Umbral), del 1-2 al 1-4 se generan y el 1-5 es la arena de un sub-jefe;
//   piso 2: del 2-1 al 2-4 se generan y el 2-5 es el piso 2 de Unity, con la arena del jaguar;
//   piso 3: del 3-1 al 3-4 se generan y el 3-5 es el piso 3 de Unity, con el Guardián (el jefe final, por ahora).
// Las salas generadas se arman al azar con una semilla por incursión: dentro de una incursión, volver a un nivel da la
// misma sala. Al salir a la selva cambia la semilla. La bajada de un nivel se abre al vencer a todos sus enemigos.

const NIVELES = [['p1', 'n1_2', 'n1_3', 'n1_4', 'n1_5'], ['n2_1', 'n2_2', 'n2_3', 'n2_4', 'p2'], ['n3_1', 'n3_2', 'n3_3', 'n3_4', 'p3']];
const SECUENCIA = NIVELES.flat();
// Etapa 48: la mazmorra maya («el camino del agua», bajo Palenque): 3 pisos de 4 niveles, m1_1…m3_4, todos generados; el X-4
// es la arena de un jefe. Por ahora, el piso 1 (los canales del Otolum). Sus pisos usan las claves 11-13 en ESTILO, PALETA,
// POBLACION, PRESUPUESTO y VIDA_NIVEL, para no chocar con los olmecas (1-3).
const NIVELES_MAYA = [['m1_1', 'm1_2', 'm1_3', 'm1_4'], ['m2_1', 'm2_2', 'm2_3', 'm2_4'], ['m3_1', 'm3_2', 'm3_3', 'm3_4']];
const SECUENCIA_MAYA = NIVELES_MAYA.flat();
const esGenerado = (id) => /^[nm]\d_\d$/.test(id);
const esMaya = (id) => /^m\d_\d$/.test(id || '');
const pisoDe = (id) => (esMaya(id) ? 10 : 0) + +id[1];
const secuenciaDe = (id) => (esMaya(id) ? SECUENCIA_MAYA : SECUENCIA);
const nombreNivel = (id) => { const S = secuenciaDe(id), i = S.indexOf(id), k = esMaya(id) ? 4 : 5; return i < 0 ? '' : `${Math.floor(i / k) + 1}-${(i % k) + 1}`; };
const anterior = (id) => (id === 'm1_1' ? 'palenque' : secuenciaDe(id)[secuenciaDe(id).indexOf(id) - 1]);
const siguiente = (id) => secuenciaDe(id)[secuenciaDe(id).indexOf(id) + 1];
const SUBJEFE = { n1_5: 'olm.subjefe_1_vencido', m1_4: 'may.subjefe_1_vencido', m2_4: 'may.subjefe_2_vencido', m3_4: 'may.guardian_ciclos_vencido' }; // la bajada no se abre hasta vencerlo

// Enemigos de las salas generadas, por piso: [tipo, peso]. 'espiritu' es el espíritu corrompido; los demás, fauna.
const POBLACION = {
  1: [['espiritu', 3], ['Murcielago', 2], ['Serpiente', 2], ['pecari', 3], ['aullador', 2], ['armadillo', 2]],
  2: [['espiritu', 2], ['Cocodrilo', 2], ['Avispa', 2], ['Serpiente', 1], ['pecari', 2], ['ocelote', 1], ['armadillo', 2], ['pejelagarto', 2]],
  3: [['espiritu', 3], ['Mono', 2], ['Guacamaya', 1], ['Cocodrilo', 1], ['ocelote', 2], ['aullador', 2]],
  // Maya, piso 1 (canales): lo que vive en el agua y en la oscuridad, y los espíritus de la Sombra.
  11: [['espiritu', 3], ['Murcielago', 2], ['Serpiente', 2], ['Cocodrilo', 2], ['pejelagarto', 2], ['armadillo', 1]],
  // Maya, piso 2 (cámaras de estuco): seco y cerrado; murciélagos, avispas y monos que entran por las grietas, el ocelote.
  12: [['espiritu', 4], ['Murcielago', 3], ['Avispa', 2], ['Serpiente', 1], ['Mono', 2], ['ocelote', 2]],
  // Maya, piso 3 (observatorio): a cielo abierto, lo que vuela y trepa, y más espíritus cerca del Guardián.
  13: [['espiritu', 4], ['Guacamaya', 2], ['Avispa', 2], ['Mono', 2], ['ocelote', 2], ['aullador', 1]],
};
const SALA = { ancho: [7, 10], alto: [5, 7], pasillo: [2, 4], arena: [13, 9] };
// Dificultad (revisada el 2026-11-13; ver README, etapa 22): cada nivel tiene un presupuesto de amenaza que se reparte entre
// sus salas, y cada tipo cuesta según lo peligroso que es (una manada de pecaríes cuesta como un tapir). Presupuesto por piso
// y nivel (X-1 a X-4; el 1-1 es el piso 1 de Unity). En el X-3 hay un santuario de Vida.
const COSTE = { Serpiente: 2, Murcielago: 2, Avispa: 2, Guacamaya: 2, armadillo: 2, espiritu: 3, Cocodrilo: 3, Mono: 3, ocelote: 4, aullador: 4, pejelagarto: 4, pecari: 6, tapir: 6 };
const PRESUPUESTO = { 1: [0, 11, 13, 15], 2: [16, 18, 20, 22], 3: [19, 21, 23, 26], 11: [18, 21, 23], 12: [22, 24, 26], 13: [25, 27, 29] }; // maya: se llega tras el Guardián olmeco // pisos 2 y 3 subidos en la etapa 32 (curva creciente)
const LIBRE_LLEGADA = 4; // m sin enemigos alrededor de la llegada (etapa 38)
// Nivel con santuario de Vida en cada piso: el X-3, a mitad de piso. Al 2-1 se llega con las semillas de la nauyaca y al 3-1,
// con el santuario del 2-5.
const VIDA_NIVEL = { 1: 3, 2: 3, 3: 3, 11: 3, 12: 3, 13: 3 };

// ---------- Aspecto de cada piso (etapa 35, solo HTML) ----------
// En vez del negro, el vacío lleva una textura oscura del piso, y alrededor de las salas generadas crecen plantas y rocas
// propias: piso 1, selva con musgo; piso 2, agua negra con tule; piso 3, basalto roto de la ciudad olmeca.
// Fondo: color de base, una textura en mosaico (de una imagen grande, un trozo de 192 px; de una pequeña, lo que tiene
// pintado) y sprites sueltos repartidos; todo oscurecido con `luz`. `pintado`: suelo y muros con el diseño del piso
// (js/pisos.js) en sus cinco niveles, también los de Unity (2-5 y 3-5).
const ESTILO = {
  1: { color: '#0c160e', textura: 'Suelo_Selva_00', luz: 'brightness(.32) saturate(.8)', deco: ['Helecho_01', 'Helecho_02', 'Roca_Musgo_01', 'Roca_Musgo_02', 'Roca_Musgo_03', 'Matorral_Selva_01', 'Pasto_Alto_01'] },
  2: { pintado: true, color: '#071a1d', textura: 'Tile_Agua_Anim_01', sueltos: ['Nenufar_01', 'Nenufar_01', 'Tule_01'], luz: 'brightness(.42) saturate(.8)', deco: ['Tule_01', 'Nenufar_01', 'Roca_Musgo_02', 'Planta_Hoja_Ancha_01', 'Planta_Hoja_Ancha_02'] },
  3: { pintado: true, color: '#3a2f36', sueltos: ['Roca_Basalto_01', 'Roca_Basalto_02', 'Roca_Basalto_03', 'Escombros_Basalto_01', 'Escombros_Basalto_02', 'Escombros_Basalto_03'], luz: 'brightness(.55) saturate(.7)', deco: ['Roca_Basalto_01', 'Roca_Basalto_02', 'Roca_Basalto_03', 'Escombros_Basalto_01', 'Escombros_Basalto_02', 'Basalto_Agrietado_01'] },
};
// Etapa 43: Palenque (js/palenque.js), fuera de la mazmorra: selva más clara y suelo pintado.
ESTILO[4] = { pintado: true, color: '#14301a', textura: 'Suelo_Selva_00', sueltos: ['Helecho_01', 'Helecho_02', 'Flor_Selva_01'], luz: 'brightness(.6) saturate(.9)',
  deco: ['Ceiba_01', 'Palma_Corozo_01', 'Palma_Corozo_02', 'Helecho_01', 'Helecho_02', 'Matorral_Selva_01', 'Matorral_Selva_02', 'Flor_Selva_02', 'Pasto_Alto_02'] };
// Etapa 48: piso 1 maya, los canales del Otolum (js/pisos.js): caliza húmeda sobre agua oscura.
ESTILO[11] = { pintado: true, color: '#0b1618', textura: 'Tile_Agua_Anim_01', sueltos: [], luz: 'brightness(.34) saturate(.7)', deco: ['Roca_Musgo_01', 'Roca_Musgo_02', 'Helecho_02'] };
// Etapa 49: piso 2 maya, las cámaras de estuco (js/pisos.js): estuco pintado de rojo, a oscuras, con escombros.
ESTILO[12] = { pintado: true, color: '#1a0f0c', sueltos: ['Escombros_Basalto_01', 'Escombros_Basalto_02'], luz: 'brightness(.3) saturate(.6) sepia(.4)', deco: ['Escombros_Basalto_01', 'Escombros_Basalto_02', 'Roca_Basalto_02'] };
// Etapa 50: piso 3 maya, el observatorio (js/pisos.js): la azotea de la torre, bajo el cielo de noche (Cielo_Noche, js/pisos.js).
ESTILO[13] = { pintado: true, color: '#0a0f26', textura: 'Cielo_Noche', luz: 'brightness(1)', deco: [] };
// El muro de basalto de un piso con diseño propio: «Muro_Basalto_01@2» (mismo nombre de base, así choca igual), pintado
// una vez por js/pisos.js. En el piso 1 queda el de Unity.
function muroDe(nombre, piso) {
  if (!ESTILO[piso]?.pintado) return nombre;
  const v = `${nombre}@${piso}`;
  if (!SPRITES[v]) { SPRITES[v] = SPRITES[nombre]; imagenes[v] = pintarMuro(piso, nombre.includes('_Y_'), +nombre.slice(-2)); }
  return v;
}
const patrones = {};
function patronFondo() {
  const id = mundo.id, piso = mundo.d.piso || (/^p[123]$/.test(id) || esGenerado(id) ? +id[1] : 0), e = ESTILO[piso];
  if (!e) return null;
  if (!patrones[piso]) {
    const ims = [e.textura, ...(e.sueltos || [])].filter(Boolean).map(imagen);
    if (!ims.every((im) => im?.naturalWidth)) return null; // aún cargando: queda el color de siempre
    const T = 192, c = document.createElement('canvas'), g = c.getContext('2d'), rnd = azar(piso);
    c.width = c.height = T; g.fillStyle = e.color; g.fillRect(0, 0, T, T); g.filter = e.luz; // el color va tal cual
    if (e.textura) {
      const im = ims[0];
      if (im.naturalWidth > T) g.drawImage(im, (im.naturalWidth - T) >> 1, (im.naturalHeight - T) >> 1, T, T, 0, 0, T, T);
      else { // lo pintado de una losa pequeña (el agua trae margen transparente), en mosaico
        const m = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
        m.canvas.width = im.naturalWidth; m.canvas.height = im.naturalHeight; m.drawImage(im, 0, 0);
        const a = m.getImageData(0, 0, im.naturalWidth, im.naturalHeight).data, xs = [], ys = [];
        for (let i = 3; i < a.length; i += 4) if (a[i] > 200) { xs.push((i >> 2) % im.naturalWidth); ys.push(Math.floor((i >> 2) / im.naturalWidth)); }
        const [u0, v0, w, h] = [Math.min(...xs) + 1, Math.min(...ys) + 1, Math.max(...xs) - Math.min(...xs) - 2, Math.max(...ys) - Math.min(...ys) - 2];
        for (let y = 0; y < T; y += h) for (let x = 0; x < T; x += w) g.drawImage(im, u0, v0, w, h, x, y, w, h);
      }
    }
    // Sueltos: cada uno se pinta también desplazado un mosaico, para que no se corte en la junta.
    for (let i = 0; i < (piso === 3 ? 22 : 9) && e.sueltos?.length; i++) {
      const im = imagen(e.sueltos[Math.floor(rnd() * e.sueltos.length)]), x = rnd() * T, y = rnd() * T;
      for (const ox of [-T, 0, T]) for (const oy of [-T, 0, T]) g.drawImage(im, x + ox - im.naturalWidth / 2, y + oy - im.naturalHeight / 2);
    }
    patrones[piso] = ctx.createPattern(c, 'repeat');
  }
  patrones[piso].setTransform(new DOMMatrix([1, 0, 0, 1, -vista.cx, -vista.cy])); // la textura se mueve con el mundo
  return patrones[piso];
}

// ---------- Azar con semilla ----------
function azar(semilla) { // mulberry32
  let a = semilla >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const hash = (s) => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
function semillaIncursion() {
  if (!juego.flags['incursion.semilla']) juego.flags['incursion.semilla'] = 1 + Math.floor(Math.random() * 1e9);
  return juego.flags['incursion.semilla'];
}

// ---------- Losas: trozos de 1 m del suelo prerenderizado de cada piso de Unity ----------
// Cada celda del suelo es un rectángulo de 48 × 32 px. Las del borde de atrás llevan encima sus matas (10 px) y las del
// borde de delante, debajo su cara de piedra (14 px).
const LOSA = { matas: 10, cara: 14 };
// Los pisos de Unity 2 y 3 (2-5 y 3-5): sus muros con el diseño del piso y su suelo en losas pintadas (como los generados)
// en vez de las imágenes de Unity. Son planos (sin terrazas), así que basta con las celdas pisables.
for (const p of [2, 3]) {
  const r = REGIONES[`p${p}`], [x0, x1, y0, y1] = r.limites;
  for (const o of r.objetos) if (o.sprite.startsWith('Muro_Basalto')) o.sprite = muroDe(o.sprite, p);
  const fuera = new Set([...r.vacio, ...(r.agua || [])].map((c) => c.x + ',' + c.y)), es = (x, y) => x >= x0 && x <= x1 && y >= y0 && y <= y1 && !fuera.has(x + ',' + y);
  r.losas = [];
  for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) if (es(x, y)) r.losas.push({ x, y, arriba: es(x, y + 1) ? 0 : LOSA.matas, abajo: es(x, y - 1) ? 0 : LOSA.cara });
  r.piso = p;
}
const losasDePiso = {};
function losasDe(piso) {
  if (losasDePiso[piso]) return losasDePiso[piso];
  const r = REGIONES[`p${piso}`], vacio = new Set(r.vacio.map((c) => c.x + ',' + c.y)), [x0, x1, y0, y1] = r.limites;
  // El agua se dibuja aparte y en la imagen de suelo es transparente: no sirve de losa.
  const agua = new Set((r.agua || []).map((c) => c.x + ',' + c.y));
  const suelo = (x, y) => x >= x0 && x <= x1 && y >= y0 && y <= y1 && !vacio.has(x + ',' + y) && !agua.has(x + ',' + y);
  // Bajo los objetos (escombros, estelas, santuarios) el suelo lleva su sombra pintada: se descartan las celdas a menos de 2 m.
  const cosas = r.objetos.filter((o) => !o.sprite.startsWith('Muro')), ocupado = { has: (k) => { const [a, b] = k.split(',').map(Number); return cosas.some((o) => Math.abs(o.x - a) < 2 && Math.abs(o.y - b) < 2); } };
  const P = { interior: [], norte: [], sur: [] };
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    if (!suelo(x, y) || !suelo(x - 1, y) || !suelo(x + 1, y)) continue;
    const n = suelo(x, y + 1), s = suelo(x, y - 1);
    if (n && s && suelo(x - 1, y + 1) && suelo(x + 1, y - 1) && !ocupado.has(x + ',' + y)) P.interior.push({ x, y });
    else if (!n && s && !ocupado.has(x + ',' + y)) P.norte.push({ x, y });
    else if (n && !s && !ocupado.has(x + ',' + y)) P.sur.push({ x, y });
  }
  return (losasDePiso[piso] = { r, ...P });
}
// Dónde está la celda (x, y) de un piso de Unity dentro de su imagen de suelo: [sprite, u, v] o null.
function recorteDe(r, x, y, arriba, abajo) {
  for (const c of r.suelo) {
    const s = SPRITES[c.sprite], im = imagen(c.sprite);
    if (!s || !im?.naturalWidth) continue;
    const w = im.naturalWidth, h = im.naturalHeight, izq = c.derecha * PPU - s[1] * w, sup = -c.arriba * PPU - (1 - s[2]) * h;
    const u = Math.round((x - 0.5) * PPU - izq), v = Math.round(-(y + 0.5) * PX_Y - sup);
    if (u >= 0 && v - arriba >= 0 && u + PPU <= w && v + PX_Y + abajo <= h) return [im, u, v];
  }
  return null;
}

// ---------- Generador de salas ----------
function generarNivel(id) {
  const piso = pisoDe(id), n = +id[3], rnd = azar(hash(id + ':' + semillaIncursion()));
  const entre = ([a, b]) => a + Math.floor(rnd() * (b - a + 1));
  const arena = !!SUBJEFE[id], nSalas = arena ? 2 : 2 + Math.min(2, Math.floor((n + piso) / 3));
  // Salas que serpentean hacia el este: cada una sale de la anterior por el este o, desde la tercera, hacia el norte o el
  // sur, por un pasillo de 3 de ancho. Nunca vuelven al oeste, así la bajada (al este de la última) queda libre.
  const salas = [], celdas = new Set(), pon = (x, y) => celdas.add(x + ',' + y);
  const rect = ([x0, x1, y0, y1]) => { for (let a = x0; a <= x1; a++) for (let b = y0; b <= y1; b++) pon(a, b); };
  const choca = (s) => salas.some((o) => s.x0 <= o.x1 + 2 && s.x1 >= o.x0 - 2 && s.y0 <= o.y1 + 2 && s.y1 >= o.y0 - 2);
  for (let i = 0; i < nSalas; i++) {
    const grande = arena && i === nSalas - 1, w = grande ? SALA.arena[0] : entre(SALA.ancho), h = grande ? SALA.arena[1] : entre(SALA.alto);
    let s = { x0: 0, x1: w - 1, y0: -Math.floor(h / 2), y1: h - 1 - Math.floor(h / 2) };
    if (i) {
      const p = salas[i - 1], largo = entre(SALA.pasillo), px = Math.round((p.x0 + p.x1) / 2), py = Math.round((p.y0 + p.y1) / 2);
      const yc = py + Math.round((rnd() - 0.5) * 2), ye = yc - Math.floor(h / 2), xv = px - entre([3, w - 4]); // el pasillo, dentro de las dos
      const este = { x0: p.x1 + largo + 1, x1: p.x1 + largo + w, y0: ye, y1: ye + h - 1, paso: [p.x1 + 1, p.x1 + largo, py - 1, py + 1] };
      const norte = { x0: xv, x1: xv + w - 1, y0: p.y1 + largo + 1, y1: p.y1 + largo + h, paso: [px - 1, px + 1, p.y1 + 1, p.y1 + largo], norte: true };
      const sur = { x0: xv, x1: xv + w - 1, y0: p.y0 - largo - h, y1: p.y0 - largo - 1, paso: [px - 1, px + 1, p.y0 - largo, p.y0 - 1] };
      // La primera sala sale al este (su muro de atrás lleva la escalera); la arena, también.
      const giro = i > 1 && !grande && rnd() < 0.6 ? [rnd() < 0.5 ? norte : sur].filter((c) => !choca(c)) : [];
      s = giro[0] || este;
      rect(s.paso);
    }
    salas.push(s); rect([s.x0, s.x1, s.y0, s.y1]);
  }
  // Esquinas rotas: se quita la celda de la esquina de una sala si no da a un pasillo.
  for (const s of salas) for (const [a, b, u, v] of [[s.x0, s.y0, -1, -1], [s.x1, s.y0, 1, -1], [s.x0, s.y1, -1, 1], [s.x1, s.y1, 1, 1]])
    if (rnd() < 0.5 && !celdas.has(a + u + ',' + b) && !celdas.has(a + ',' + (b + v))) celdas.delete(a + ',' + b);
  // Centrar en el origen.
  const xs = [...celdas].map((k) => +k.split(',')[0]), ys = [...celdas].map((k) => +k.split(',')[1]);
  const dx = -Math.round((Math.min(...xs) + Math.max(...xs)) / 2), dy = -Math.round((Math.min(...ys) + Math.max(...ys)) / 2);
  const suelo = new Set([...celdas].map((k) => { const [a, b] = k.split(',').map(Number); return a + dx + ',' + (b + dy); }));
  for (const s of salas) {
    s.x0 += dx; s.x1 += dx; s.y0 += dy; s.y1 += dy; s.cx = Math.round((s.x0 + s.x1) / 2); s.cy = Math.round((s.y0 + s.y1) / 2);
    if (s.paso) s.medio = [Math.round((s.paso[0] + s.paso[1]) / 2) + dx, Math.round((s.paso[2] + s.paso[3]) / 2) + dy]; // centro del pasillo que llega
  }
  const es = (a, b) => suelo.has(a + ',' + b);
  const lim = [Math.min(...xs) + dx - 2, Math.max(...xs) + dx + 2, Math.min(...ys) + dy - 2, Math.max(...ys) + dy + 2];
  const vacio = [];
  for (let a = lim[0]; a <= lim[1]; a++) for (let b = lim[2]; b <= lim[3]; b++) if (!es(a, b)) vacio.push({ x: a, y: b });

  // Puntos: la escalera de subida en el muro de atrás de la primera sala; la bajada, al este de la última.
  const s0 = salas[0], sf = salas[salas.length - 1];
  const subida = { x: s0.x0 + 2.5, y: s0.y1 - 0.4 }, bajada = { x: sf.x1 - 0.5, y: sf.cy };
  const puntos = { subida, llegada_arriba: { x: subida.x, y: subida.y - 1.4 }, bajada, llegada_abajo: { x: bajada.x - 1.5, y: bajada.y }, salas };

  // Muros de basalto en el borde de atrás y en el del oeste (los de delante y del este taparían a los personajes).
  const objetos = [{ sprite: 'Escalera_Subida_01', x: subida.x, y: subida.y, z: 0 }];
  const variante = () => `0${1 + Math.floor(rnd() * 3)}`;
  for (const k of suelo) {
    const [a, b] = k.split(',').map(Number);
    if (!es(a, b + 1) && (Math.abs(a - subida.x) > 1.1 || Math.abs(b + 0.5 - subida.y) > 1.5)) objetos.push({ sprite: muroDe(`Muro_Basalto_${variante()}`, piso), x: a, y: b + 0.5, z: 0 });
    if (!es(a - 1, b)) objetos.push({ sprite: muroDe(`Muro_Basalto_Y_${variante()}`, piso), x: a - 0.5, y: b, z: 0 });
  }

  // Trampas y adornos: braseros y cristales junto al muro de atrás de cada sala; pinchos en los pasillos desde el nivel 2.
  const T = { pinchos: [], placas: [], pinchosPlaca: [], braseros: [], cristales: [], esteras: [], cabezas: [] };
  salas.forEach((s, i) => {
    if (s.x1 - s.x0 >= 6) { T.braseros.push([s.x0 + 1, s.y1 - 0.2]); T.braseros.push([s.x1 - 1, s.y1 - 0.2]); }
    const sig = salas[i + 1];
    if (i % 2 === 1 && !(arena && i === salas.length - 1) && !sig?.norte) T.cristales.push([s.cx, s.y1 - 0.3]); // no en la boca de un pasillo al norte
    if (rnd() < 0.5 && !esMaya(id)) T.esteras.push([s.cx + (rnd() < 0.5 ? -2 : 2), s.cy - 1]);
    if (sig && n + piso >= 3 && rnd() < 0.7) T.pinchos.push(sig.medio);
  });
  const vasijas = salas.slice(0, arena ? 1 : salas.length).flatMap((s) => (rnd() < 0.6 ? [[s.x0 + 1, s.y0 + 0.6]] : []));

  // Enemigos por presupuesto: se reparte entre las salas (la primera del X-1 queda vacía, la arena es del sub-jefe) y cada
  // sala se llena con tipos de su piso que quepan en lo que le queda.
  // Etapa 38: nadie a menos de LIBRE_LLEGADA de la llegada (antes, en el 50-80 % de los niveles había un enemigo a menos de
  // 2 m, a veces encima del jugador). Se sortea hasta 12 veces y, si la sala es pequeña, se queda el sitio más lejano.
  const llega = puntos.llegada_arriba, aLlegada = (p) => Math.hypot(p.x - llega.x, p.y - llega.y);
  const sitio = (s) => {
    let mejor = null;
    for (let k = 0; k < 12 && !(mejor && aLlegada(mejor) >= LIBRE_LLEGADA); k++) {
      const p = { x: s.x0 + 1.5 + rnd() * (s.x1 - s.x0 - 3), y: s.y0 + 1 + rnd() * (s.y1 - s.y0 - 2) };
      if (!mejor || aLlegada(p) > aLlegada(mejor)) mejor = p;
    }
    return mejor;
  };
  let pob = POBLACION[piso]; const enemigos = [];
  const conSitio = salas.filter((s, i) => !(arena && i === salas.length - 1) && !(i === 0 && n === 1));
  let presupuesto = arena ? 2 : PRESUPUESTO[piso][n - 1]; // antes de la nauyaca, casi nada
  // Un tapir (élite pesado) en la sala más grande, desde el 2-3 y en el piso 3, si cabe en el presupuesto.
  if (!arena && (piso === 3 || (piso === 2 && n >= 3)) && presupuesto >= 12 && rnd() < 0.85) {
    const grandes = conSitio.slice().sort((a, b) => (b.x1 - b.x0) * (b.y1 - b.y0) - (a.x1 - a.x0) * (a.y1 - a.y0));
    const s = grandes.find((g) => aLlegada({ x: g.cx + 0.5, y: g.cy }) >= LIBRE_LLEGADA) || grandes[0];
    if (s) { enemigos.push({ tipo: 'tapir', x: s.cx + 0.5, y: s.cy, sala: s }); presupuesto -= COSTE.tapir; }
  }
  // Se eligen los grupos con el presupuesto de todo el nivel (así caben las manadas) y se reparten: cada uno a la sala que
  // menos carga lleva para su tamaño, las grandes antes.
  const elegidos = [];
  while (presupuesto >= 2) {
    const caben = pob.filter(([t]) => COSTE[t] <= presupuesto), total = caben.reduce((t, [, p]) => t + p, 0);
    if (!total) break;
    let r = rnd() * total, t = caben[0][0];
    for (const [k, p] of caben) if ((r -= p) < 0) { t = k; break; }
    elegidos.push(t); presupuesto -= COSTE[t];
    if (t === 'pejelagarto') pob = pob.filter(([k]) => k !== t); // una sola charca por nivel
  }
  const area = (s) => (s.x1 - s.x0) * (s.y1 - s.y0), carga = new Map(conSitio.map((s) => [s, enemigos.filter((e) => e.sala === s).reduce((t, e) => t + COSTE[e.tipo], 0)]));
  // El pejelagarto, en el centro de una sala sin tapir (mejor una de en medio, lejos de las escaleras y del santuario):
  // allí se abre su charca, de 5 × 3 m sin las esquinas, en agua que se vadea como la del piso 2 de Unity.
  const agua = [];
  if (elegidos.includes('pejelagarto')) {
    // Solo en una sala de en medio (etapa 38): en la primera o la última la charca podía tapar una escalera; si no hay
    // ninguna libre, este nivel va sin pejelagarto.
    const s = conSitio.find((r) => r !== s0 && r !== sf && !enemigos.some((e) => e.sala === r));
    if (s) {
      for (let a = -2; a <= 2; a++) for (let b = -1; b <= 1; b++) if (Math.abs(a) < 2 || !b) agua.push({ x: s.cx + a, y: s.cy + b });
      enemigos.push({ tipo: 'pejelagarto', x: s.cx, y: s.cy, sala: s }); carga.set(s, carga.get(s) + COSTE.pejelagarto);
    }
    elegidos.splice(elegidos.indexOf('pejelagarto'), 1);
  }
  for (const t of elegidos.sort((a, b) => COSTE[b] - COSTE[a])) {
    // La sala que menos carga lleva; si en ella no cabe lejos de la llegada (la primera, si es pequeña), la siguiente.
    let s = null, p = null;
    for (const r of conSitio.slice().sort((a, b) => carga.get(a) / area(a) - carga.get(b) / area(b))) {
      const q = sitio(r);
      if (!p || aLlegada(q) > aLlegada(p)) { s = r; p = q; }
      if (aLlegada(q) >= LIBRE_LLEGADA) break;
    }
    if (!s) break;
    enemigos.push({ tipo: t, ...p }); carga.set(s, carga.get(s) + COSTE[t]);
  }
  for (const e of enemigos) delete e.sala;

  // Losas: cada celda toma una al azar del suelo de su piso, según su borde.
  const fuente = REGIONES[`p${piso}`] ? losasDe(piso) : null, losas = []; // los pisos mayas no tienen piso de Unity: solo se pintan
  for (const k of suelo) {
    const [a, b] = k.split(',').map(Number), norte = !es(a, b + 1), sur = !es(a, b - 1);
    const pool = fuente ? (norte ? fuente.norte : sur ? fuente.sur : fuente.interior) : [null], src = pool[Math.floor(rnd() * pool.length)];
    losas.push({ x: a, y: b, src, arriba: norte ? LOSA.matas : 0, abajo: sur ? LOSA.cara : 0 });
  }
  // Santuario de Vida (LifeShrine) en la primera sala del X-3: cura la mitad de la vida, una vez por incursión.
  if (n === VIDA_NIVEL[piso]) { const v = { x: s0.x1 - 2, y: s0.y1 - 0.6 }; objetos.push({ sprite: 'Santuario_Vida_01', x: v.x, y: v.y, z: 0 }); puntos.vida = { x: v.x, y: v.y - 0.9 }; }
  if (arena) puntos.subjefe = { x: sf.cx + 2, y: sf.cy };
  if (NIVEL_ARMA[n] && !arena) puntos.arma = { x: s0.x1 - 2.5, y: s0.y1 - 1.2 }; // estrado del arma (js/armas.js)
  // Decorado del piso en el vacío, lejos del suelo (más lejos por delante, para que no tape a nadie).
  const deco = ESTILO[piso].deco, cerca = (a, b) => { for (let u = -2; u <= 2; u++) for (let v = -2; v <= 3; v++) if (es(a + u, b + v)) return true; return false; };
  for (let a = lim[0] - 4; a <= lim[1] + 4; a++) for (let b = lim[2] - 4; b <= lim[3] + 4; b++)
    if (deco.length && rnd() < 0.12 && !cerca(a, b)) objetos.push({ sprite: deco[Math.floor(rnd() * deco.length)], x: a + rnd() - 0.5, y: b + rnd() - 0.5, z: 0 });
  TRAMPAS[id] = T; VASIJAS[id] = vasijas;
  return { nota: `Generado (${id}, semilla ${semillaIncursion()})`, generado: true, suelo: [], agua, agua_vadeable: true, objetos, niveles: [], rampas: [], muelles: [],
    limites: lim, puntos, vacio, losas, enemigos, fuentes: fuente ? fuente.r.suelo.map((c) => c.sprite) : [], piso };
}

// Pinta las losas en un lienzo aparte la primera vez (cuando ya cargaron las imágenes de suelo) y luego solo lo copia.
function dibujarLosas() {
  const d = mundo.d;
  if (!d.lienzo) {
    const pinta = ESTILO[d.piso].pintado, r = pinta ? null : losasDe(d.piso).r, [x0, x1, y0, y1] = d.limites; // pinta: js/pisos.js
    if (!pinta && !r.suelo.every((c) => imagen(c.sprite)?.naturalWidth)) return; // aún cargando
    // Las celdas de origen que caen en la junta de dos imágenes de suelo no caben enteras en ninguna: se cambian por otra válida.
    if (!pinta) for (const [i, l] of d.losas.entries()) {
      if (recorteDe(r, l.src.x, l.src.y, l.arriba, l.abajo)) continue;
      const P = losasDe(d.piso), pool = (l.arriba ? P.norte : l.abajo ? P.sur : P.interior).filter((s) => recorteDe(r, s.x, s.y, l.arriba, l.abajo));
      l.src = pool[i % pool.length];
    }
    const c = document.createElement('canvas');
    c.width = (x1 - x0 + 1) * PPU; c.height = (y1 - y0 + 1) * PX_Y + LOSA.matas + LOSA.cara;
    const g = c.getContext('2d');
    // De atrás hacia delante: la cara de piedra de una fila queda encima de lo que haya debajo.
    for (const l of [...d.losas].sort((p, q) => q.y - p.y)) {
      if (pinta) { pintarLosa(g, d.piso, (l.x - 0.5 - x0) * PPU, (y1 - l.y) * PX_Y + LOSA.matas, l); continue; }
      const [im, u, v] = recorteDe(r, l.src.x, l.src.y, l.arriba, l.abajo);
      g.drawImage(im, u, v - l.arriba, PPU, PX_Y + l.arriba + l.abajo, (l.x - 0.5 - x0) * PPU, (y1 - l.y) * PX_Y + LOSA.matas - l.arriba, PPU, PX_Y + l.arriba + l.abajo);
    }
    d.lienzo = c; d.lienzoEn = [(x0 - 0.5) * PPU, -(y1 + 0.5) * PX_Y - LOSA.matas];
  }
  ctx.drawImage(d.lienzo, Math.round(d.lienzoEn[0] - vista.cx), Math.round(d.lienzoEn[1] - vista.cy));
}

// ---------- Contenido de un nivel generado ----------
// Cuenta también a los ocultos (el armadillo bajo tierra), que no se pueden golpear pero siguen ahí.
const vivos = () => juego.enemigos.filter((e) => e.vida > 0 && e.tipo !== 'vasija' && (e.golpeable !== false || e.oculto));
function poblarNivel(id, P, E, I, T) {
  const d = REGIONES[id], limpio = bandera(`incursion.limpio.${id}`);
  // El pecarí va en manada (tres) y el aullador en pareja: uno del reparto trae a los demás alrededor (si caben en el suelo).
  const pareja = (e) => [[0, 0], [1.2, -0.8]].map(([dx, dy]) => ({ x: e.x + dx, y: e.y + dy })).filter((p, i) => !i || !bloqueado(p.x, p.y, 0.4)).map((p) => nuevoAullador(p.x, p.y));
  const manada = (e) => [[0, 0], [0.9, 0.6], [-0.7, -0.7]].map(([dx, dy]) => ({ x: e.x + dx, y: e.y + dy })).filter((p, i) => !i || !bloqueado(p.x, p.y, 0.4)).map((p) => nuevoPecari(p.x, p.y));
  if (!limpio) for (const e of d.enemigos) E.push(...(e.tipo === 'espiritu' ? [nuevoEspiritu(e.x, e.y)] : e.tipo === 'pecari' ? manada(e) : e.tipo === 'tapir' ? [nuevoTapir(e.x, e.y)] : e.tipo === 'ocelote' ? [nuevoOcelote(e.x, e.y)] : e.tipo === 'aullador' ? pareja(e) : e.tipo === 'armadillo' ? [nuevoArmadillo(e.x, e.y)] : e.tipo === 'pejelagarto' ? [nuevoPejelagarto(e.x, e.y)] : [nuevaFauna(e.tipo, e.x, e.y, false)]));
  if (id === 'm1_4' && !bandera(SUBJEFE.m1_4)) E.push(cocodriloPantano(P.subjefe.x, P.subjefe.y)); // js/mazmorra_maya.js
  if (id === 'm2_4' && !bandera(SUBJEFE.m2_4)) E.push(murcielagoEstuco(P.subjefe.x, P.subjefe.y));
  if (id === 'm3_4') E.push(guardianCiclos(P.subjefe.x, P.subjefe.y)); // vencido, se queda sentado (js/mazmorra_maya.js)
  if (id === 'n1_5' && !bandera('olm.subjefe_1_vencido')) E.push(nuevaNauyaca(P.subjefe.x, P.subjefe.y, () => {
    poner('olm.subjefe_1_vencido'); juego.jefe = null;
    entregar({ objetos: [{ id: 'semilla_preparada', n: 2 }] }, 'jefe.nauyaca'); // para llegar al piso 2 con algo de vida
    mensaje('La nauyaca real se desliza entre las losas rotas y desaparece. La bajada al segundo piso queda libre.');
  })); // js/animales.js
  if (P.vida) santuarioVida(`incursion.vida_${id}`, P.vida, mundo.objetos.find((o) => o.sprite.startsWith('Santuario_Vida'))); // js/juego.js
  ponerArma(id, P.arma); // js/armas.js
  T.push({ ...P.subida, a: anterior(id), punto: id === 'm1_1' ? 'desde_mazmorra' : 'llegada_abajo' });
  // La bajada del último nivel maya (3-4) sale a Palenque, junto a la boca del acueducto.
  T.push({ ...P.bajada, a: siguiente(id) || 'palenque', punto: siguiente(id) ? 'llegada_arriba' : 'desde_mazmorra', abierto: () => bandera(`incursion.limpio.${id}`) && (!SUBJEFE[id] || bandera(SUBJEFE[id])),
    cerrado: () => SUBJEFE[id] ? 'Algo grande vigila esta sala. La bajada no se abrirá mientras siga en pie.' : 'Una reja de piedra tapa la bajada. Aún quedan enemigos en el nivel.' });
}
// Al vencer al último enemigo de un nivel generado se abre su bajada, con un premio pequeño.
function revisarNivel() {
  const id = juego.region;
  revisarCofreUnity(id); // 1-1 y 2-5 (js/armas.js)
  if (!esGenerado(id) || bandera(`incursion.limpio.${id}`) || vivos().length) return;
  poner(`incursion.limpio.${id}`);
  aparecerCofre(id); // cofre de recompensas (js/armas.js)
  const piso = esMaya(id) ? 3 + +id[1] : +id[1], n = +id[3]; // maya: más experiencia (se llega tras el capítulo olmeca)
  sonar('premio'); toast(`Nivel ${nombreNivel(id)} superado: la bajada está abierta`);
  // Experiencia (más que antes: el jugador sube algo más en la mazmorra) y, en los niveles lejos de un santuario (X-2 y X-4),
  // una semilla medicinal preparada (cura 20, tecla 1): entre dos santuarios hay tres niveles.
  entregar({ xp: 15 * piso + 10 * n, objetos: n % 2 === 0 ? [{ id: 'semilla_preparada', n: 1 }] : [] }, `nivel.${id}.${semillaIncursion()}`);
}

// Autocomprobación: en cualquier nivel generado se puede ir andando de la llegada a la bajada, y los enemigos están en el suelo.
(() => {
  const antes = { mundo, flags: juego.flags };
  juego.flags = { 'incursion.semilla': 12345 };
  for (const id of [...SECUENCIA, ...SECUENCIA_MAYA].filter(esGenerado)) {
    const d = generarNivel(id), suelo = new Set(d.losas.map((l) => l.x + ',' + l.y));
    const de = (p) => Math.round(p.x) + ',' + Math.round(p.y), visto = new Set([de(d.puntos.llegada_arriba)]), cola = [...visto];
    while (cola.length) { const [a, b] = cola.pop().split(',').map(Number); for (const [u, v] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = a + u + ',' + (b + v); if (suelo.has(k) && !visto.has(k)) { visto.add(k); cola.push(k); } } }
    console.assert(visto.has(de(d.puntos.bajada)), `Niveles: ${id} se recorre de la llegada a la bajada`);
    console.assert(d.enemigos.every((e) => suelo.has(de(e))), `Niveles: los enemigos de ${id} están en el suelo`);
    const charca = new Set(d.agua.map(de)), peces = d.enemigos.filter((e) => e.tipo === 'pejelagarto');
    console.assert(d.agua.every((c) => suelo.has(de(c))) && peces.length <= 1 && peces.every((e) => charca.has(de(e))) && (peces.length > 0) === (d.agua.length > 0), `Niveles: la charca de ${id} y su pejelagarto`);
    console.assert(![d.puntos.llegada_arriba, d.puntos.bajada, d.puntos.llegada_abajo, d.puntos.vida].some((p) => p && charca.has(de(p))), `Niveles: la charca de ${id} no tapa las escaleras ni el santuario`);
  }
  console.assert(nombreNivel('p1') === '1-1' && nombreNivel('n1_5') === '1-5' && nombreNivel('p2') === '2-5' && nombreNivel('p3') === '3-5', 'Niveles: nombres');
  console.assert(nombreNivel('m1_4') === '1-4' && anterior('m1_1') === 'palenque' && siguiente('m1_3') === 'm1_4' && siguiente('m1_4') === 'm2_1' && nombreNivel('m2_3') === '2-3' && siguiente('m2_4') === 'm3_1' && !siguiente('m3_4') && pisoDe('m3_1') === 13 && pisoDe('m2_2') === 12 && pisoDe('m1_2') === 11 && pisoDe('n2_1') === 2, 'Niveles mayas: nombres y orden');
  Object.assign(juego, { flags: antes.flags }); mundo = antes.mundo;
})();

// Enlace de prueba (solo HTML, para probar en el celular): index.html?nivel=n2_2 cambia «Nueva partida» por «Probar nivel
// 2-2»: empieza en ese nivel con el Guardián que elijas, a nivel 3 y con 2 semillas. En el piso 2 elige una semilla de
// incursión con charca (pejelagarto). No se guarda, y al caer te levantas en el sitio.
(() => {
  const id = new URLSearchParams(location.search).get('nivel');
  if (!esGenerado(id || '')) return;
  const b = $('nueva');
  b.textContent = `Probar nivel ${nombreNivel(id)}`;
  b.onclick = async () => {
    await empezar(null);
    juego.prueba = true;
    for (const f of ['mision.MP_OLM_03.completada', 'olm.jaguar_piedra_vencido', 'olm.sello_abierto', 'olm.subjefe_1_vencido']) poner(f);
    for (let s = 1; s <= 500; s++) { juego.flags['incursion.semilla'] = s; if (id[1] !== '2' || generarNivel(id).agua.length) break; }
    prog().nivel = 3; aplicarEstadisticas(true); prog().bolsa.semilla_preparada = 2;
    await cargarRegion(id, 'llegada_arriba', estadisticas().vida);
    toast(`Prueba del nivel ${nombreNivel(id)}: no se guarda`, 4);
  };
})();
