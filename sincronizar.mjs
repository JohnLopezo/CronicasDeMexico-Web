// Copia el arte y los mapas del proyecto Unity a esta carpeta y genera datos/sprites.js y datos/regiones.js.
// Uso: node sincronizar.mjs            (después de cambiar arte o mapas en Unity, volver a ejecutarlo)
// Los datos se escriben como .js (no .json) para que el juego abra con doble clic, sin servidor.
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const unity = process.argv[2] || join(aqui, '..', 'CronicasDeMexico');
const arte = join(unity, 'Assets/_Project/Art');
const carpetas = ['Suelo', 'Objetos', 'Agua', 'Guerreros', 'Personajes', 'Enemigos', 'Npc', 'Jefes'].map((c) => join(arte, 'Environment/Olmeca/Sprites', c));
const mapas = join(unity, 'Assets/_Project/Data/World/Olmeca');
const narrativa = join(unity, 'Assets/_Project/Data/Narrative/Olmeca');
const REGIONES = { ciudad: 'Ciudad', selva: 'Selva', p1: 'Mazmorra_P1', p2: 'Mazmorra_P2', p3: 'Mazmorra_P3' };

if (!existsSync(mapas)) { console.error(`No encuentro el proyecto Unity en ${unity}. Pásalo como argumento.`); process.exit(1); }
mkdirSync(join(aqui, 'arte'), { recursive: true });
mkdirSync(join(aqui, 'datos'), { recursive: true });

const sprites = {};
for (const carpeta of carpetas) {
  for (const f of readdirSync(carpeta).filter((f) => f.endsWith('.png'))) {
    const meta = readFileSync(join(carpeta, f + '.meta'), 'utf8');
    const piv = meta.match(/spritePivot: \{x: ([\d.e-]+), y: ([\d.e-]+)\}/);
    const ppu = meta.match(/spritePixelsToUnits: ([\d.]+)/);
    const nombre = basename(f, '.png');
    if (sprites[nombre]) throw new Error(`Sprite repetido: ${nombre}`);
    // Las fichas de NPC están a 32 px por unidad, pero en Unity cada personaje lleva su raíz escalada a 32/48
    // (PixelArtSceneBuilder.CreateCharacter, PlaceholderPixelsPerUnit / IsometricProjection.PixelsPerUnit) para que sus
    // píxeles coincidan con los del escenario. Aquí no hay raíz: se registran a 48, que es lo que acaban midiendo allí.
    const npc = basename(carpeta) === 'Npc';
    sprites[nombre] = [`arte/${basename(carpeta)}/${f}`, piv ? +(+piv[1]).toFixed(4) : 0.5, piv ? +(+piv[2]).toFixed(4) : 0.5, npc ? 48 : ppu ? +ppu[1] : 48];
  }
  cpSync(carpeta, join(aqui, 'arte', basename(carpeta)), { recursive: true, filter: (s) => !s.endsWith('.meta') });
}
writeFileSync(join(aqui, 'datos/sprites.js'), `// Generado por sincronizar.mjs: [ruta, pivote x, pivote y, píxeles por metro]\nconst SPRITES = ${JSON.stringify(sprites)};\n`);

const regiones = {};
for (const [id, archivo] of Object.entries(REGIONES)) regiones[id] = JSON.parse(readFileSync(join(mapas, archivo + '.json'), 'utf8'));
writeFileSync(join(aqui, 'datos/regiones.js'), `// Generado por sincronizar.mjs desde Data/World/Olmeca/*.json\nconst REGIONES = ${JSON.stringify(regiones)};\n`);

// ---------- Narrativa: diálogos (DLG_), misiones (MIS_) y habitantes (NPC_) ----------
// Lector mínimo del YAML de Unity: mapas y listas por sangría, cadenas entre comillas con \xNN y valores en varias líneas.
function leerYaml(texto) {
  const crudas = texto.split(/\r?\n/).slice(texto.split(/\r?\n/).findIndex((l) => l.startsWith('MonoBehaviour:')) + 1);
  const lineas = [];
  for (const l of crudas) {
    if (!l.trim()) continue;
    const ind = l.length - l.trimStart().length, t = l.trim(), ult = lineas[lineas.length - 1];
    const v = ult && ult.text.replace(/^(- )?[\w]+:\s?/, '');
    const abierta = ult && (v.startsWith('"') ? (v.match(/(?<!\\)"/g) || []).length % 2 === 1
      : v.startsWith("'") && (v.replace(/''/g, '').match(/'/g) || []).length % 2 === 1);
    const sigue = ult && ind > ult.ind && !/^(- |[\w]+:( |$))/.test(t);
    if (abierta || sigue) ult.text += (ult.text.endsWith('\\') ? '' : ' ') + t;
    else lineas.push({ ind, text: t });
  }
  const valor = (s) => {
    if (s.startsWith('"')) return s.slice(1, -1).replace(/\\x([0-9A-Fa-f]{2})|\\u([0-9A-Fa-f]{4})|\\(.)/g, (_, x, u, c) =>
      x ? String.fromCharCode(parseInt(x, 16)) : u ? String.fromCharCode(parseInt(u, 16)) : c === 'n' ? '\n' : c);
    if (s.startsWith("'")) return s.slice(1, -1).replace(/''/g, "'");
    if (s === '[]') return [];
    if (s.startsWith('{')) return Object.fromEntries(s.slice(1, -1).split(', ').map((p) => p.split(': ')));
    return s;
  };
  let i = 0;
  const mapa = (ind) => {
    const o = {};
    while (i < lineas.length && lineas[i].ind === ind && !lineas[i].text.startsWith('- ')) {
      const m = lineas[i++].text.match(/^([\w]+):\s?(.*)$/);
      if (!m) continue;
      const n = lineas[i];
      if (m[2] !== '') o[m[1]] = valor(m[2]);
      else o[m[1]] = n && (n.ind > ind || (n.ind === ind && n.text.startsWith('- '))) ? bloque(n.ind) : null;
    }
    return o;
  };
  const bloque = (ind) => {
    if (!lineas[i].text.startsWith('- ')) return mapa(ind);
    const lista = [];
    while (i < lineas.length && lineas[i].ind === ind && lineas[i].text.startsWith('- ')) {
      const resto = lineas[i].text.slice(2);
      if (/^[\w]+:( |$)/.test(resto)) { lineas[i] = { ind: ind + 2, text: resto }; lista.push(mapa(ind + 2)); }
      else { lista.push(valor(resto)); i++; }
    }
    return lista;
  };
  return mapa(lineas[0].ind);
}
const archivos = readdirSync(narrativa).filter((f) => f.endsWith('.asset'));
const guidAMision = {};
const MISIONES = {}, DIALOGOS = {}, NPCS = {};
for (const f of archivos.filter((f) => f.startsWith('MIS_'))) {
  const m = leerYaml(readFileSync(join(narrativa, f), 'utf8'));
  guidAMision[readFileSync(join(narrativa, f + '.meta'), 'utf8').match(/guid: (\w+)/)[1]] = m.id;
  MISIONES[m.id] = { titulo: m.title, pasos: (m.steps || []).map((p) => ({ aviso: p.eventKey, veces: +p.requiredCount, texto: p.description })), banderas: m.rewardFlags || [] };
}
for (const f of archivos.filter((f) => f.startsWith('NPC_'))) { const n = leerYaml(readFileSync(join(narrativa, f), 'utf8')); NPCS[n.id] = n.displayName; }
for (const f of archivos.filter((f) => f.startsWith('DLG_'))) {
  const d = leerYaml(readFileSync(join(narrativa, f), 'utf8'));
  DIALOGOS[basename(f, '.asset').slice(4)] = (d.branches || []).map((r) => ({
    requiere: r.requiredFlags || [], prohibe: r.forbiddenFlags || [], lineas: (r.lines || []).map((l) => l.text),
    alTerminar: r.flagsOnFinish || [], mision: guidAMision[r.questToStart?.guid] || null,
  }));
}
writeFileSync(join(aqui, 'datos/narrativa.js'), `// Generado por sincronizar.mjs desde Data/Narrative/Olmeca\nconst MISIONES = ${JSON.stringify(MISIONES)};\n` +
  `const DIALOGOS = ${JSON.stringify(DIALOGOS)};\nconst NPCS = ${JSON.stringify(NPCS)};\n`);
const sinTexto = Object.entries(DIALOGOS).filter(([, rs]) => rs.some((r) => r.lineas.some((l) => !l))).map(([k]) => k);
console.log(`${Object.keys(MISIONES).length} misiones, ${Object.keys(DIALOGOS).length} diálogos, ${Object.keys(NPCS).length} habitantes.${sinTexto.length ? ' LÍNEAS VACÍAS EN: ' + sinTexto : ''}`);

// ---------- Recompensas: objetos, tablas, paquetes, Bendiciones, recetas, ofertas y el perfil de Yaret ----------
const recompensas = join(unity, 'Assets/_Project/Data/Rewards/Olmeca');
const iconos = join(arte, 'UI/Iconos');
const guid = (ruta) => readFileSync(ruta + '.meta', 'utf8').match(/guid: (\w+)/)[1];
const guidAIcono = Object.fromEntries(readdirSync(iconos).filter((f) => f.endsWith('.png')).map((f) => [guid(join(iconos, f)), `arte/Iconos/${f}`]));
cpSync(iconos, join(aqui, 'arte/Iconos'), { recursive: true, filter: (s) => !s.endsWith('.meta') });
const assets = readdirSync(recompensas).filter((f) => f.endsWith('.asset')).map((f) => ({ f, nombre: basename(f, '.asset'), datos: leerYaml(readFileSync(join(recompensas, f), 'utf8')) }));
const guidAObjeto = Object.fromEntries(assets.filter((a) => a.f.startsWith('OBJ_')).map((a) => [guid(join(recompensas, a.f)), a.datos.id]));
const guidAAsset = Object.fromEntries(assets.map((a) => [guid(join(recompensas, a.f)), a.f.startsWith('BOT_') ? a.nombre : a.datos.id ?? a.nombre]));
const ref = (r) => (r && r.guid ? guidAAsset[r.guid] || null : null);
const num = (o) => Object.fromEntries(Object.entries(o || {}).map(([k, v]) => [k, +v]));
const pila = (l) => (l || []).map((p) => ({ id: guidAObjeto[p.item?.guid], n: +(p.count ?? 1) })).filter((p) => p.id);
const R = { OBJETOS: {}, TABLAS: {}, PAQUETES: {}, BENDICIONES: {}, RECETAS: {}, OFERTAS: {} };
for (const { f, nombre, datos: d } of assets) {
  if (f.startsWith('OBJ_')) R.OBJETOS[d.id] = { nombre: d.displayName, desc: d.description, uso: d.usage, cat: +d.category, rareza: +d.rarity,
    tope: +d.maxStack, valor: +d.value, vendible: d.sellable === '1', bono: num(d.bonus), efecto: num(d.effect), soloGuardian: d.guardianOnly || '',
    origen: +d.origin, notaOrigen: d.originNote || '', icono: guidAIcono[d.icon?.guid] || null };
  if (f.startsWith('BOT_')) R.TABLAS[nombre] = { xp: +d.experience, seguro: pila(d.guaranteed),
    azar: (d.chances || []).map((c) => ({ id: guidAObjeto[c.item?.guid], p: +c.chance, min: +c.min, max: +c.max })).filter((c) => c.id) };
  if (f.startsWith('REC_')) R.PAQUETES[nombre] = { xp: +d.experience, objetos: pila(d.items), banderas: d.flags || [], bendicion: ref(d.blessing), extra: ref(d.extra) };
  if (f.startsWith('BEN_')) R.BENDICIONES[d.id] = { nombre: d.displayName, desc: d.description, ranura: +d.slot, bono: num(d.bonus),
    coste: +d.energyCost, espera: +d.cooldown, combate: d.combatEffect, exploracion: d.explorationEffect, cultura: d.culture };
  if (f.startsWith('RCT_')) R.RECETAS[d.id] = { resultado: guidAObjeto[d.result?.guid], n: +d.resultCount, ingredientes: pila(d.ingredients),
    bandera: d.unlockFlag || '', estacion: d.station === '1' ? 'cocina' : 'artesano' };
  if (f.startsWith('OFE_')) R.OFERTAS[d.id] = { objeto: guidAObjeto[d.item?.guid], n: +d.itemCount, precio: guidAObjeto[d.price?.guid], coste: +d.priceCount, bandera: d.unlockFlag || '' };
}
const config = leerYaml(readFileSync(join(unity, 'Assets/_Project/Resources/Recompensas/ConfigProgresion.asset'), 'utf8'));
// Los siete Guardianes, en el orden del catálogo (Resources/Personajes/CatalogoGuardianes).
const personajes = join(unity, 'Assets/_Project/Data/Characters');
const guidAGua = Object.fromEntries(readdirSync(personajes).filter((f) => /^GUA_.*.asset$/.test(f)).map((f) => [guid(join(personajes, f)), f]));
const catalogo = leerYaml(readFileSync(join(unity, 'Assets/_Project/Resources/Personajes/CatalogoGuardianes.asset'), 'utf8'));
const listaCatalogo = Object.values(catalogo).find(Array.isArray);
R.GUARDIANES = listaCatalogo.map((r) => leerYaml(readFileSync(join(personajes, guidAGua[r.guid]), 'utf8'))).map((g) => ({
  id: g.id, nombre: g.displayName, titulo: g.title, desc: g.description, base: num(g.baseStats), crece: num(g.growthPerLevel),
  afinidad: ['Agua', 'Tierra', 'Fuego', 'Viento', 'Luz', 'Oscuridad'][+g.initialAffinity], especie: ['Endémica', 'Nativa', 'Emblemática'][+g.status],
  senda: ['Indagar', 'Persuadir', 'Escuchar'][+g.pathAction] }));
// Fauna (EnemyData de Data/Enemies, la que usa WildEnemy). Las debilidades son índices de Affinity.
const AFINIDADES = ['Agua', 'Tierra', 'Fuego', 'Viento', 'Luz', 'Oscuridad'];
const enemigos = join(unity, 'Assets/_Project/Data/Enemies');
// Unity escribe a veces una lista de enums como hexadecimal: 4 bytes por elemento, en little-endian.
const lista32 = (v) => (Array.isArray(v) ? v : typeof v === 'string' ? (v.match(/.{8}/g) || []).map((h) => parseInt(h.match(/../g).reverse().join(''), 16)) : []);
R.FAUNA = Object.fromEntries(readdirSync(enemigos).filter((f) => /^ED_.*\.asset$/.test(f)).map((f) => {
  const d = leerYaml(readFileSync(join(enemigos, f), 'utf8')), o = {};
  for (const [k, v] of Object.entries(d)) if (typeof v === 'string' && /^-?[\d.]+$/.test(v)) o[k] = +v;
  return [basename(f, '.asset').slice(3), { ...o, nombre: d.displayName, debil: lista32(d.weaknesses).map((i) => AFINIDADES[+i]) }];
}));
// Un asset con un carácter guardado en Latin-1 (no UTF-8) se lee como Latin-1 en vez de dejar «�».
const leerTexto = (ruta) => { const b = readFileSync(ruta), t = b.toString('utf8'); return t.includes('\uFFFD') ? b.toString('latin1') : t; };
const recursos = join(unity, 'Assets/_Project/Resources');
// Museo (CatalogoMuseo → CUL_): cada cultura con su bandera, su resumen y sus Guardianes liberados.
const guidACultura = Object.fromEntries(assets.filter((a) => a.f.startsWith('CUL_')).map((a) => [guid(join(recompensas, a.f)), a.f]));
R.MUSEO = (leerYaml(readFileSync(join(recursos, 'Recompensas/CatalogoMuseo.asset'), 'utf8')).cultures || []).map((r) => guidACultura[r.guid]).filter(Boolean)
  .map((f) => leerYaml(leerTexto(join(recompensas, f)))).map((c) => ({ titulo: c.title, bandera: c.discoveredFlag, resumen: c.summary,
    guardianes: (c.guardians || []).map((g) => ({ nombre: g.name, bandera: g.defeatedFlag, recuerdo: g.memory })) }));
// Códice (CatalogoCodice): páginas con disparador (aviso «verbo:id» o bandera) y origen.
R.CODICE = (leerYaml(leerTexto(join(recursos, 'Narrativa/CatalogoCodice.asset'))).pages || []).map((p) => ({ id: p.id, titulo: p.title, texto: p.text,
  pista: p.hint, disparador: p.trigger, origen: +p.origin }));
// Acciones de senda (Resources/Narrativa/AccionesSenda): respuesta de cada habitante a cada verbo, con su recompensa.
const VERBOS = ['Indagar', 'Persuadir', 'Escuchar'];
R.SENDA = (leerYaml(leerTexto(join(recursos, 'Narrativa/AccionesSenda.asset'))).responses || []).map((r) => ({ npc: r.npcId, verbo: VERBOS[+r.action],
  lineas: r.lines || [], objetos: (r.items || []).map((i) => ({ id: i.id, n: +(i.count ?? 1) })), xp: +r.experience || 0, banderas: r.flags || [] }));
R.PROGRESION = { nivelMax: +config.maxLevel, base: +config.baseExperience, exponente: +config.exponent, penalizacion: +config.overLevelPenalty,
  suelo: +config.overLevelFloor, repeticion: +config.repeatFactor, corte: +config.repeatCutoff };
writeFileSync(join(aqui, 'datos/recompensas.js'), '// Generado por sincronizar.mjs desde Data/Rewards/Olmeca, ConfigProgresion, los Guardianes (GUA_), Data/Enemies, el Museo y el Códice\n' +
  Object.entries(R).map(([k, v]) => `const ${k} = ${JSON.stringify(v)};`).join('\n') + '\n');
const rotas = [...Object.values(R.PAQUETES).flatMap((p) => [p.extra].filter((e) => e && !R.TABLAS[e])), ...Object.values(R.OBJETOS).filter((o) => !o.icono).map((o) => o.nombre)];
console.log(`${Object.keys(R.OBJETOS).length} objetos, ${Object.keys(R.TABLAS).length} tablas, ${Object.keys(R.PAQUETES).length} paquetes, ` +
  `${Object.keys(R.BENDICIONES).length} Bendiciones, ${Object.keys(R.RECETAS).length} recetas, ${Object.keys(R.OFERTAS).length} ofertas, ${R.GUARDIANES.length} Guardianes, ` +
  `${Object.keys(R.FAUNA).length} animales, ${R.MUSEO.length} culturas del Museo, ${R.CODICE.length} páginas del Códice, ${R.SENDA.length} acciones de senda.${rotas.length ? ' SIN RESOLVER: ' + rotas : ''}`);

const faltan = Object.values(regiones).flatMap((r) => [...r.suelo, ...r.objetos].map((o) => o.sprite)).filter((s) => !sprites[s]);
console.log(`${Object.keys(sprites).length} sprites, ${Object.keys(regiones).length} regiones.${faltan.length ? ' FALTAN: ' + [...new Set(faltan)].join(', ') : ''}`);
