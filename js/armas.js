'use strict';
// Armas de la mazmorra (etapa 36, solo HTML; ver PORTAR_A_UNITY.md). Para que atacar sea más fácil, en la primera sala de
// algunos niveles generados hay un estrado de ofrenda con un arma, que dura toda la incursión (se pierde al salir a la selva):
//   X-2 de cada piso: una de cuerpo a cuerpo, al azar (macana, mazo, lanza corta, cuchillo de obsidiana, hacha de piedra).
//   X-4 de cada piso: una a distancia, al azar (átlatl, jabalina, honda). Con un enemigo lejos y ninguno cerca, Atacar
//   dispara solo hacia él y gasta munición. Sin botón nuevo: en el celular sigue siendo el botón de Atacar.
//   X-1 de los pisos 2 y 3: el escudo rectangular (al defender, para casi todo lo que llega de frente; frena un poco).
// Cofre de recompensas: al vencer a todos los enemigos de un nivel (1-1, 2-5 tras el jaguar y los generados) aparece uno junto
// al jugador, con botín al azar (objetos, ecos, experiencia y a veces un arma o munición). Las ofrendas de Unity (1-1, 2-5,
// 3-5) también pueden traer un arma. Nunca el escudo en un cofre: ese sale solo en su estrado, para la defensa.
// Armero de la aldea (licencia del juego: no hay constancia de armeros olmecas): eliges un arma de las 8 y sales con ella a
// cada incursión.
// Etapa 37: dos ranuras libres (cualquier clase; el escudo cuenta y protege desde cualquiera de las dos). Cambiar arma (R o el
// botón de las flechas) elige la de la mano, que es la que golpea, dispara y hace su especial (la estrella). Una tercera
// sustituye a la de la mano; la misma recarga su munición o sus usos. Calidad por piso (CALIDAD): ★ floja, ★★★ fuerte.
// Armas de la cultura olmeca (no de los mexicas: el macuahuitl es posterior). La macana (garrote de madera en forma de remo
// con puntas) sale en monumentos de San Lorenzo y Chalcatzingo; el átlatl, en monumentos olmecas en manos de guerreros; de
// la honda quedan piedras de honda en sitios olmecas (Hassig: arma olmeca desde al menos el 900 a. C.); el escudo
// rectangular, hacia el 400 a. C. Lista y mecánicas dadas por el usuario (README, etapa 36).
const ARMAS = {
  macana:   { clase: 'cerca', nombre: 'Macana olmeca', corto: 'Macana', dano: 1.6, alcance: 1.1, radio: 0.95, espera: 1 },
  mazo:     { clase: 'cerca', nombre: 'Mazo de madera', corto: 'Mazo', dano: 1.9, alcance: 1, radio: 1, espera: 1.4, desgaste: 1, aturde: 0.6 },
  lanza:    { clase: 'cerca', nombre: 'Lanza corta', corto: 'Lanza', dano: 1.3, alcance: 1.7, radio: 0.6, espera: 0.85 },
  cuchillo: { clase: 'cerca', nombre: 'Cuchillo de obsidiana', corto: 'Cuchillo', dano: 1.1, alcance: 0.8, radio: 0.7, espera: 0.6, critico: 0.25, usos: 40 },
  hacha:    { clase: 'cerca', nombre: 'Hacha de piedra pulida', corto: 'Hacha', dano: 1.4, alcance: 1, radio: 0.85, espera: 1.1, rompe: true },
  atlatl:   { clase: 'lejos', nombre: 'Átlatl', corto: 'Átlatl', municion: 15, dano: 1.2, vel: 13, alcance: 9, espera: 0.45 },
  jabalina: { clase: 'lejos', nombre: 'Jabalina', corto: 'Jabalina', municion: 6, dano: 2.2, vel: 11, alcance: 7, espera: 0.7, atraviesa: 2 },
  honda:    { clase: 'lejos', nombre: 'Honda', corto: 'Honda', municion: 30, dano: 0.8, vel: 15, alcance: 11, espera: 0.35 },
  escudo:   { clase: 'escudo', nombre: 'Escudo rectangular', corto: 'Escudo', defensa: 0.15, lento: 0.85 },
  // Etapa 45: armas mayas del Clásico (cultura: 'maya'; solo en el armero de Lakamha', js/aldea_maya.js). D: lanzas largas
  // de punta de pedernal, hachas de mano y cuchillos de pedernal, átlatl y escudos flexibles de tela o piel en los murales de
  // Bonampak y los dinteles de Yaxchilán; la cerbatana, en vasijas del Clásico con cazadores (y en el Popol Vuh). I: sus
  // valores de juego y el pedernal más duro que la obsidiana (no se rompe).
  lanza_maya:    { cultura: 'maya', clase: 'cerca', nombre: 'Lanza de pedernal', corto: 'Lanza', dano: 1.4, alcance: 1.9, radio: 0.6, espera: 0.9 },
  hacha_maya:    { cultura: 'maya', clase: 'cerca', nombre: 'Hacha de pedernal', corto: 'Hacha', dano: 1.7, alcance: 1, radio: 0.9, espera: 1.25, desgaste: 1, aturde: 0.5 },
  cuchillo_maya: { cultura: 'maya', clase: 'cerca', nombre: 'Cuchillo de pedernal', corto: 'Cuchillo', dano: 1, alcance: 0.8, radio: 0.7, espera: 0.6, critico: 0.2 },
  atlatl_maya:   { cultura: 'maya', clase: 'lejos', nombre: 'Átlatl maya', corto: 'Átlatl', municion: 18, dano: 1.1, vel: 13, alcance: 9, espera: 0.45 },
  cerbatana:     { cultura: 'maya', clase: 'lejos', nombre: 'Cerbatana', corto: 'Cerbatana', municion: 35, dano: 0.6, vel: 17, alcance: 11, espera: 0.3 },
  escudo_maya:   { cultura: 'maya', clase: 'escudo', nombre: 'Escudo flexible', corto: 'Escudo', defensa: 0.3, lento: 1 },
};
const CULTURA_ARMAS = { olmeca: (A) => !A.cultura, maya: (A) => A.cultura === 'maya' };
const armasDe = (cultura) => Object.keys(ARMAS).filter((k) => CULTURA_ARMAS[cultura](ARMAS[k]));
const TIRO = { cerca: 2.2, radio: 0.3 }; // a distancia: nadie a menos de 2,2 m (si no, golpe normal) y radio del proyectil
const SANGRADO = { seg: 2, cada: 0.5, parte: 0.15 }; // crítico del cuchillo: 4 tics de un 15 % del golpe
// Qué clase de arma da cada nivel (X-n) y desde qué piso.
const NIVEL_ARMA = { 1: { clase: 'escudo', desde: 2 }, 2: { clase: 'cerca', desde: 1 }, 4: { clase: 'lejos', desde: 1 } };
// Ranuras: [{ id, nv (calidad 1-3), mun, usos }], hasta RANURAS; `incursion.mano` es el índice de la de la mano.
const RANURAS = 2;
const CALIDAD = { 1: 0.6, 2: 1, 3: 1.35 }; // ★ piso 1 y armero · ★★ piso 2 · ★★★ piso 3 (multiplica el daño)
const ranuras = () => (juego.flags['incursion.ranuras'] ||= []);
const enMano = () => ranuras()[juego.flags['incursion.mano'] || 0] || null;
const armaDe = (clase) => { const r = enMano(); return r && ARMAS[r.id].clase === clase ? r.id : null; }; // id del arma en la mano si es de esa clase
const datosDe = (clase) => ARMAS[armaDe(clase)] || null;
const municion = () => enMano()?.mun || 0;
const escudoLlevado = () => { const r = ranuras().find((x) => ARMAS[x.id].clase === 'escudo'); return r ? ARMAS[r.id] : null; };
const tieneEscudo = () => !!escudoLlevado();
const estrellas = (nv) => '★'.repeat(nv || 1);
const nombreArma = (r) => `${ARMAS[r.id].nombre} ${estrellas(r.nv)}`;
const nuevaRanura = (id, nv) => ({ id, nv, mun: ARMAS[id].municion ? ARMAS[id].municion + (maestria().municion || 0) : 0, usos: ARMAS[id].usos || 0 });

// Maestría: cuánto rinde cada clase de arma según el Guardián (multiplica su daño), por lo que dice de él GUARDIANES:
// los de combate cercano pegan más de cerca; los de distancia y precisión, de lejos (con más alcance y munición).
const MAESTRIA = {
  jaguar:   { cerca: 1.25, lejos: 0.85, por: 'combate cercano' },         // Balam
  lobo:     { cerca: 1.15, lejos: 0.9, por: 'combate sostenido' },        // Naira
  xolo:     { cerca: 1.1, lejos: 0.95, por: 'protección' },               // Ocel
  ajolote:  { cerca: 1.05, lejos: 1, por: 'resistencia' },                // Xali
  mariposa: { cerca: 0.85, lejos: 1.15, por: 'evasión' },                 // Ameyali
  quetzal:  { cerca: 0.85, lejos: 1.25, alcance: 1, por: 'distancia' },   // Yaret
  aguila:   { cerca: 0.8, lejos: 1.35, alcance: 2, municion: 5, por: 'precisión' }, // Itzel
};
const maestria = () => MAESTRIA[guardianActual().id] || { cerca: 1, lejos: 1 };
const danoArma = (id, nv) => (ARMAS[id].dano ?? 1) * (CALIDAD[nv] ?? 1) * (maestria()[ARMAS[id].clase] ?? 1);
const alcanceTiro = (A) => A.alcance + (maestria().alcance || 0);
// «Balam domina las armas de cerca (combate cercano): daño ×2,0» o «A Itzel le cuestan…».
function textoMaestria(id, nv) {
  const A = ARMAS[id], m = maestria()[A.clase], g = guardianActual(), x = danoArma(id, nv).toFixed(1).replace('.', ','), cual = A.clase === 'cerca' ? 'las armas de cerca' : 'las armas a distancia';
  return m > 1 ? `${g.nombre} domina ${cual} (${maestria().por}): daño ×${x}` : m < 1 ? `A ${g.nombre} le cuestan ${cual}: daño ×${x}` : `Daño ×${x}`;
}
const QUE_HACE = {
  macana: 'golpes más fuertes y más largos', mazo: 'lento, rompe guardias y aturde con el remate', lanza: 'llega lejos y es rápida',
  cuchillo: 'muy rápido, críticos que sangran; se rompe tras 40 golpes', hacha: 'también rompe el basalto agrietado',
  atlatl: 'dardos con enemigos lejos', jabalina: 'pocas, mucho daño, atraviesan', honda: 'muchas piedras, de muy lejos',
  escudo: 'al defender, para casi todo de frente; vas algo más lento',
  lanza_maya: 'la de más alcance, rápida', hacha_maya: 'pesada, gasta guardias y aturde con el remate',
  cuchillo_maya: 'muy rápido, críticos que sangran; el pedernal no se rompe', atlatl_maya: 'dardos con enemigos lejos',
  cerbatana: 'muchos dardos flojos, de muy lejos', escudo_maya: 'al defender, para buena parte de lo de frente; no te frena',
};

// El arma que da un nivel generado: la clase según NIVEL_ARMA y el arma al azar con la semilla de la incursión.
function armaDelNivel(id) {
  const piso = +id[1], n = NIVEL_ARMA[+id[3]];
  if (!n || piso < n.desde) return null;
  const ids = armasDe('olmeca').filter((k) => ARMAS[k].clase === n.clase), rnd = azar(hash(`${id}:arma:${semillaIncursion()}`));
  return ids[Math.floor(rnd() * ids.length)];
}

// El estrado: objeto que se dibuja encima y se toma con Usar (o Atacar junto a él).
function ponerArma(id, punto) {
  const clave = `incursion.arma_${id}`, tipo = armaDelNivel(id);
  if (punto && tipo && !bandera(clave)) armaEnSuelo(tipo, +id[1] || 1, punto, clave, true);
}
// Un arma que se toma con Usar: sobre su estrado (estrado = true) o en el suelo (la de un cofre u ofrenda con las manos llenas).
function armaEnSuelo(tipo, nv, punto, clave, estrado) {
  const A = ARMAS[tipo], o = { tipo: 'arma', arma: tipo, estrado, x: punto.x, y: punto.y, z: 0, t: 0, actualizar(a, dt) { a.t += dt; }, dibujar: dibujarArmaSuelta };
  juego.otros.push(o);
  const it = { x: punto.x, y: punto.y - (estrado ? 0.6 : 0), r: estrado ? 1.4 : 1, texto: `Tomar ${A.nombre.toLowerCase()} ${estrellas(nv)}`, usar() {
    if (bandera(clave)) return;
    poner(clave); juego.otros = juego.otros.filter((x) => x !== o); juego.interactuables = juego.interactuables.filter((x) => x !== it);
    sonar('premio'); tomarArma(tipo, nv);
  } };
  juego.interactuables.push(it);
}
// Arma de un cofre o una ofrenda (etapa 38): con una ranura libre, o si es la misma que llevas, se toma; con las manos llenas
// queda en el suelo junto a <cerca> para que elijas, en vez de cambiarte sola la de la mano. Devuelve el texto del aviso.
// shortcut: el arma del suelo no se guarda; si sales del nivel sin tomarla se pierde. Guardarla en juego.flags si molesta.
let armasSueltas = 0;
function ofrecerArma(tipo, nv, cerca) {
  const R = ranuras();
  if (R.length < RANURAS || R.some((r) => r.id === tipo)) { tomarArma(tipo, nv); return ` y ${ARMAS[tipo].nombre.toLowerCase()} ${estrellas(nv)}`; }
  const p = [[1.1, 0], [-1.1, 0], [0, -1.1], [0.8, -0.8], [-0.8, -0.8]].map(([dx, dy]) => ({ x: cerca.x + dx, y: cerca.y + dy })).find((q) => !bloqueado(q.x, q.y, 0.3)) || { x: cerca.x, y: cerca.y - 0.8 };
  armaEnSuelo(tipo, nv, p, `incursion.suelta_${++armasSueltas}`, false);
  toast(`${nombreArma({ id: tipo, nv })} en el suelo: llevas las manos llenas. Tómala con Usar para cambiarla por la de la mano.`, 5);
  return ` y ${ARMAS[tipo].nombre.toLowerCase()} ${estrellas(nv)} (queda en el suelo)`;
}
// Llevar un arma (del estrado, un cofre o el armero): la misma recarga (y sube de calidad si la nueva es mejor); si no, ocupa la
// ranura libre o sustituye a la de la mano. Queda en la mano y lo avisa.
function tomarArma(tipo, nv = 1) {
  const A = ARMAS[tipo], R = ranuras();
  let r = R.find((x) => x.id === tipo), cambio = '';
  if (r) { r.nv = Math.max(r.nv, nv); if (A.municion) r.mun += nuevaRanura(tipo, nv).mun; if (A.usos) r.usos = A.usos; }
  else if (R.length < RANURAS) R.push((r = nuevaRanura(tipo, nv)));
  else { const m = juego.flags['incursion.mano'] || 0; cambio = ` (dejas ${nombreArma(R[m]).toLowerCase()})`; R[m] = r = nuevaRanura(tipo, nv); }
  juego.flags['incursion.mano'] = R.indexOf(r);
  toast(`${nombreArma(r)}${cambio}: ${QUE_HACE[tipo]}. Especial: ${ESPECIAL_ARMA[tipo].nombre.toLowerCase()}.${A.clase === 'escudo' ? '' : ' ' + textoMaestria(tipo, r.nv)}`, 6);
}
// Cambiar arma (R o el botón): la otra ranura pasa a la mano.
function cambiarArma() {
  const R = ranuras();
  if (R.length < 2) return toast(R.length ? 'Solo llevas un arma' : 'No llevas armas', 2);
  juego.flags['incursion.mano'] = 1 - (juego.flags['incursion.mano'] || 0);
  sonar('clic'); toast(`En la mano: ${nombreArma(enMano())}`, 2);
}
// Arma al azar para un cofre (de cerca o a distancia, nunca el escudo), con la semilla de la incursión y el id del cofre.
const ARMAS_COFRE = armasDe('olmeca').filter((k) => ARMAS[k].clase !== 'escudo'); // la mazmorra olmeca: solo armas olmecas
const COFRE = { arma: 0.35, municion: 0.3, ofrenda: 0.5 }; // cofre de recompensas: 35 % arma, 30 % munición; ofrenda de Unity: 50 % arma
// Botín del cofre de recompensas, por piso: [objeto, peso, mínimo, máximo] (ids de OBJETOS); se sacan dos tiradas.
const BOTIN_COFRE = {
  1: [['semillas', 3, 1, 2], ['semilla_preparada', 2, 1, 1], ['fibras', 3, 1, 3], ['arcilla', 2, 1, 2], ['maiz', 2, 1, 2], ['cacao', 1, 1, 1], ['ecos', 3, 4, 10]],
  2: [['semillas', 2, 1, 2], ['semilla_preparada', 3, 1, 1], ['fibras', 2, 1, 3], ['jade', 2, 1, 1], ['cacao', 2, 1, 1], ['pescado', 2, 1, 2], ['esencia_energia', 1, 1, 1], ['ecos', 3, 6, 14]],
  3: [['semilla_preparada', 3, 1, 2], ['jade', 2, 1, 2], ['obsidiana', 2, 1, 2], ['basalto', 2, 1, 2], ['esencia_energia', 2, 1, 1], ['cacao', 1, 1, 2], ['ecos', 3, 8, 18]],
};
function armaDeCofre(id, prob) {
  const rnd = azar(hash(`${id}:cofre:${semillaIncursion()}`));
  return rnd() < prob ? ARMAS_COFRE[Math.floor(rnd() * ARMAS_COFRE.length)] : null;
}
// Cofre de recompensas: aparece junto al jugador al limpiar el nivel (una vez por incursión). No es sólido, para no encerrar a
// nadie. Sprite de ofrenda de Unity (Ofrenda_01 cerrado, Ofrenda_02 abierto) con un brillo para que se vea.
function aparecerCofre(id) {
  const clave = `incursion.cofre_${id}`, j = juego.jugador;
  if (bandera(`${clave}.salio`)) return;
  poner(`${clave}.salio`);
  const p = [1, -1].map((k) => ({ x: j.x + j.fx * k * 1.1, y: j.y + j.fy * k * 1.1 })).find((q) => !bloqueado(q.x, q.y, 0.35)) || { x: j.x + 0.6, y: j.y };
  const obj = { x: p.x, y: p.y, z: 0, t: 0, actualizar(o, dt) { o.t += dt; }, dibujar(o) {
    if (!bandera(clave)) { const [sx, sy] = pantalla(o.x, o.y, 0.3); ctx.fillStyle = `rgba(255,220,140,${0.18 + 0.08 * Math.sin(o.t * 4)})`; ctx.beginPath(); ctx.arc(Math.round(sx - vista.cx), Math.round(sy - vista.cy), 22, 0, 7); ctx.fill(); }
    dibujar(bandera(clave) ? 'Ofrenda_02' : 'Ofrenda_01', o.x, o.y);
  } };
  juego.otros.push(obj); sonar('premio'); toast('Aparece un cofre de recompensas', 3);
  juego.interactuables.push({ x: p.x, y: p.y, r: 1.1, texto: 'Abrir el cofre', usar() {
    if (bandera(clave)) return mensaje('El cofre ya está vacío.');
    poner(clave); sonar('premio');
    const piso = +(id.match(/\d/) || [1])[0], rnd = azar(hash(`${id}:premio:${semillaIncursion()}`)), objetos = [];
    for (let k = 0; k < 2; k++) { // dos tiradas de la tabla del piso
      const T = BOTIN_COFRE[piso] || BOTIN_COFRE[1], total = T.reduce((t, x) => t + x[1], 0);
      let q = rnd() * total; const [o, , a, b] = T.find((x) => (q -= x[1]) < 0) || T[0];
      objetos.push({ id: o, n: a + Math.floor(rnd() * (b - a + 1)) });
    }
    entregar({ xp: 10 * piso, objetos }, `premio.${id}.${semillaIncursion()}`);
    const t = rnd(), L = ranuras().find((r) => ARMAS[r.id].clase === 'lejos');
    if (t < COFRE.arma) ofrecerArma(ARMAS_COFRE[Math.floor(rnd() * ARMAS_COFRE.length)], piso, p);
    else if (t < COFRE.arma + COFRE.municion && L) { const n = Math.ceil(ARMAS[L.id].municion / 2); L.mun += n; toast(`+${n} de munición para ${ARMAS[L.id].nombre.toLowerCase()}`, 4); }
  } });
}
// Se llama cada cuadro (revisarNivel, js/niveles.js): en el 1-1 y en el 2-5 (tras el jaguar), al no quedar enemigos.
function revisarCofreUnity(id) {
  if ((id === 'p1' || (id === 'p2' && bandera('olm.jaguar_piedra_vencido'))) && !vivos().length) aparecerCofre(id);
}

// ---------- Armero de la aldea ----------
const ARMERO = { x: 17.5, y: 1.5 };
// Icono de un arma para el menú: su dibujo (DIBUJO) en un lienzo pequeño.
const iconos = {};
function iconoArma(id) {
  if (iconos[id]) return iconos[id];
  // Etapa 38: al doble (como sobre el estrado) y sobre un disco claro, que en el menú oscuro casi no se veían.
  const c = document.createElement('canvas'), g = c.getContext('2d'); c.width = c.height = 64;
  g.fillStyle = 'rgba(232,212,154,.22)'; g.beginPath(); g.arc(32, 32, 31, 0, 7); g.fill();
  for (const [col, a, b, w, h] of DIBUJO[id]) { g.fillStyle = col; g.fillRect(32 + a * 1.8, 32 + b * 1.8, w * 1.8, h * 1.8); }
  return (iconos[id] = c.toDataURL());
}
function poblarArmero(O, I) {
  const n = nuevoHabitante('armero', 'Guerrero', [ARMERO]); O.push(n);
  I.push(siguiendo(n, 1.4, 'Armero', () => abrirMenu('armero', 'armero'), null, n));
}
// Etapa 42: el armero cobra. Cada arma se compra una vez (ecos y materiales de la bolsa, que se guardan en la partida) y
// después se elige gratis; la macana la presta sin cobrar, para no salir con las manos vacías. [id de OBJETOS, cantidad].
const PRECIO_ARMERO = {
  macana: [],
  mazo: [['ecos', 15], ['fibras', 4]],
  honda: [['ecos', 15], ['fibras', 5]],
  lanza: [['ecos', 20], ['fibras', 4], ['obsidiana', 1]],
  cuchillo: [['ecos', 20], ['obsidiana', 2]],
  hacha: [['ecos', 25], ['basalto', 3], ['fibras', 2]],
  atlatl: [['ecos', 25], ['fibras', 4], ['jade', 1]],
  jabalina: [['ecos', 30], ['obsidiana', 2], ['fibras', 3]],
  // Armero de Lakamha' (etapa 45): presta la lanza de pedernal; con cacao, el bien de cambio maya.
  lanza_maya: [], cuchillo_maya: [['ecos', 20], ['obsidiana', 1]], hacha_maya: [['ecos', 25], ['fibras', 3], ['obsidiana', 1]],
  atlatl_maya: [['ecos', 25], ['fibras', 4], ['jade', 1]], cerbatana: [['ecos', 20], ['fibras', 3], ['cacao', 1]], escudo_maya: [['ecos', 30], ['fibras', 5], ['cacao', 2]],
};
// Cada armero guarda lo suyo: el de la aldea olmeca en armero.*, el de Lakamha' en armero_maya.*.
const claveArmero = (id) => (ARMAS[id].cultura === 'maya' ? 'armero_maya' : 'armero');
const comprada = (id) => { const c = claveArmero(id); return !PRECIO_ARMERO[id].length || juego.flags[`${c}.eleccion`] === id || (juego.flags[`${c}.compradas`] || []).includes(id); }; // la ya elegida (partidas de antes) cuenta como tuya
const alcanza = (id) => PRECIO_ARMERO[id].every(([o, n]) => tiene(o) >= n);
// Pestaña del armero (pintarMenu en js/recompensas.js).
function menuArmero(cultura = 'olmeca') {
  const maya = cultura === 'maya', elegida = juego.flags[maya ? 'armero_maya.eleccion' : 'armero.eleccion'];
  const intro = maya ? "<p>El tallador de pedernal de Lakamha' hace armas sencillas (★): cada una se compra una vez y luego te la llevas cuando quieras. La lanza te la presta. Llevas dos: Cambiar arma elige la de la mano, y la estrella hace su especial.</p>"
    : `<p>El armero de la aldea forja armas sencillas (★) para la selva y la mazmorra: cada una se compra una vez y luego sales con la que elijas en cada incursión. La macana te la presta. En la mazmorra hay mejores (★★ en el piso 2, ★★★ en el 3). Llevas dos: Cambiar arma elige la de la mano, y la estrella hace su especial.</p>`;
  return `<p class="resumen">Ecos ${tiene('ecos')}</p>${intro}` +
    (maya ? armasDe('maya') : ARMAS_COFRE).map((id) => { const A = ARMAS[id], tuya = comprada(id);
      const precio = tuya ? '' : `<small>Precio: ${PRECIO_ARMERO[id].map(([o, n]) => `${nombreObjeto(o)} ${tiene(o)}/${n}`).join(' · ')}</small>`;
      const boton = tuya ? `<button data-armero="${id}" ${elegida === id ? 'disabled' : ''}>${elegida === id ? 'Elegida' : 'Elegir'}</button>` : `<button data-armero="${id}" ${alcanza(id) ? '' : 'disabled'}>Comprar</button>`;
      return `<div class="fila arma"><img src="${iconoArma(id)}" alt=""><div><b>${A.nombre} ★</b><small>${{ cerca: 'Cuerpo a cuerpo', lejos: 'A distancia', escudo: 'Escudo' }[A.clase]}</small><div>${QUE_HACE[id]}. Especial: ${ESPECIAL_ARMA[id].nombre.toLowerCase()}.</div><small>${A.clase === 'escudo' ? '' : textoMaestria(id, 1)}</small>${precio}</div>${boton}</div>`;
    }).join('');
}
function elegirArmero(id) {
  if (!comprada(id)) { // comprar: se cobra y queda tuya para siempre
    if (!alcanza(id)) { sonar('no'); return avisoRecompensa('No te alcanza'); }
    PRECIO_ARMERO[id].forEach(([o, n]) => quitarObjeto(o, n));
    const c = claveArmero(id); juego.flags[`${c}.compradas`] = [...(juego.flags[`${c}.compradas`] || []), id];
    sonar('premio');
  }
  if (claveArmero(id) === 'armero_maya') { juego.flags['armero_maya.eleccion'] = id; return tomarArma(id, 1); } // te la llevas ya (aún no hay incursión maya)
  const antes = juego.flags['armero.eleccion'], R = ranuras(), k = R.findIndex((r) => r.id === antes);
  if (k >= 0 && antes !== id) { R.splice(k, 1); juego.flags['incursion.mano'] = 0; } // solo una del armero
  juego.flags['armero.eleccion'] = id; tomarArma(id, 1);
}
// Al empezar la incursión (al entrar a la selva, tras IncursionReset): se sale con la del armero, de calidad ★.
function darArmaDelArmero() {
  const id = juego.flags['armero.eleccion'];
  if (!ARMAS[id]) return;
  juego.flags['incursion.ranuras'] = [nuevaRanura(id, 1)]; juego.flags['incursion.mano'] = 0;
}
// Ofrenda de Unity: además de su premio, a veces un arma (el texto que se añade al mensaje de la ofrenda, o '').
function armaEnOfrenda(id) {
  const tipo = id !== 'p3_final' && armaDeCofre(`ofrenda_${id}`, COFRE.ofrenda);
  if (!tipo) return '';
  return ofrecerArma(tipo, +(id.match(/\d/) || [1])[0], juego.jugador);
}

// ---------- Cuerpo a cuerpo: lo llama golpear() (js/actores.js) ----------
// Daño de un golpe con el arma de cerca: el cuchillo puede hacer crítico (×2) y abrir sangrado.
function danoGolpe(A, id, e, base) {
  let cant = Math.round(base * (A ? danoArma(id, enMano().nv) : 1));
  if (A?.critico && Math.random() < A.critico) { cant *= 2; numero(e.x, e.y + 0.3, '¡Crítico!', '#ff6a5a'); e.sangra = { t: SANGRADO.seg, tic: SANGRADO.cada, cant: Math.max(1, Math.round(cant * SANGRADO.parte)) }; }
  return cant;
}
// Tras un golpe que entra: el mazo desgasta la guardia (escudo de rombos) y aturde con el remate.
function trasGolpe(A, e, remate) {
  if (!A || e.vida <= 0) return;
  if (A.desgaste) desgastar(e, A.desgaste);
  if (A.aturde && remate) aturdir(e, A.aturde);
}
// Tras cada golpe (entre o no): el cuchillo se gasta y el hacha rompe el basalto agrietado que tenga delante.
function trasBlandir(A, cx, cy) {
  if (!A) return;
  const r = enMano();
  if (A.usos && r && --r.usos <= 0) {
    ranuras().splice(ranuras().indexOf(r), 1); juego.flags['incursion.mano'] = 0; sonar('rompe'); toast(`El ${A.nombre.toLowerCase()} se rompe: la obsidiana es frágil`, 3);
  }
  if (A.rompe) for (const r of juego.rompibles) if (!bandera(r.bandera) && Math.hypot(r.x - cx, r.y - cy) < 1.6) r.romper();
}

// ---------- A distancia ----------
// Si hay un enemigo a tiro (o el fijado) y ninguno pegado, dispara y devuelve true; si no, golpe normal.
function lanzarDardo(j) {
  const id = armaDe('lejos'), A = ARMAS[id];
  if (!A || municion() <= 0) return false;
  const vivos = juego.enemigos.filter((e) => e.vida > 0 && e.golpeable !== false), cerca = vivos.some((e) => dist(e, j) < TIRO.cerca);
  const obj = fijadoValido() ? juego.fijado : vivos.filter((e) => dist(e, j) <= alcanceTiro(A)).sort((a, b) => dist(a, j) - dist(b, j))[0];
  if (!obj || cerca || dist(obj, j) < TIRO.cerca) return false;
  const d = dist(obj, j) || 1, ux = (obj.x - j.x) / d, uy = (obj.y - j.y) / d;
  j.fx = ux; j.fy = uy; j.espera = A.espera; j.golpe = 0.1;
  const r = enMano(); r.mun--;
  soltarDardo(j, id, ux, uy, Math.round(estadisticas().ataque * danoArma(id, r.nv)), A.atraviesa || 1);
  sonar('disparo');
  // Sin munición (etapa 38) no sirve de nada: se deja y la otra pasa a la mano, así la ranura queda libre para otra arma.
  if (!municion()) {
    const R = ranuras(); R.splice(R.indexOf(r), 1); juego.flags['incursion.mano'] = 0;
    toast(`Sin ${id === 'honda' ? 'piedras: dejas la honda' : id === 'jabalina' ? 'jabalinas' : 'dardos: dejas el átlatl'}${R.length ? `. En la mano: ${nombreArma(R[0])}` : ''}`, 3);
  }
  return true;
}
const soltarDardo = (j, id, ux, uy, dano, quedan) => juego.dardos.push({ id, x: j.x + ux * 0.4, y: j.y + uy * 0.4, ux, uy, t: alcanceTiro(ARMAS[id]) / ARMAS[id].vel, quedan, tocados: [], dano });

// ---------- Especial de cada arma (etapa 37): la estrella (F) hace el del arma en la mano, con cualquier Guardián ----------
// Golpe: zona de radio `radio` con centro a `alcance` delante (con `largo`, una franja desde el jugador hasta esa distancia).
// Tiro: `tiro` proyectiles en abanico (`abre` grados entre ellos) hacia el fijado o el más cercano a tiro; no gasta munición.
// Daño = ataque × mult × calidad × maestría (coste y espera en ESPECIAL, js/actores.js).
const ESPECIAL_ARMA = {
  macana:   { nombre: 'Remolino', alcance: 0, radio: 1.7, mult: 2.2 },
  mazo:     { nombre: 'Golpe al suelo', alcance: 0.6, radio: 1.8, mult: 2, aturde: 1 },
  lanza:    { nombre: 'Estocada', largo: 3, radio: 0.6, mult: 2.5 },
  cuchillo: { nombre: 'Tajo certero', alcance: 1, radio: 1, mult: 2.5, sangra: true },
  hacha:    { nombre: 'Tajo pesado', alcance: 1.2, radio: 1.2, mult: 3, rompe: true },
  escudo:   { nombre: 'Embestida', alcance: 1, radio: 1.3, mult: 1, aturde: 1.2 },
  atlatl:   { nombre: 'Tres dardos', tiro: 3, abre: 16, mult: 1.5 },
  jabalina: { nombre: 'Jabalina imparable', tiro: 1, mult: 3, atraviesa: 99 },
  honda:    { nombre: 'Lluvia de piedras', tiro: 5, abre: 12, mult: 1 },
  lanza_maya:    { nombre: 'Estocada larga', largo: 3.6, radio: 0.6, mult: 2.4 },
  hacha_maya:    { nombre: 'Tajo de pedernal', alcance: 1.1, radio: 1.3, mult: 2.6, aturde: 0.6 },
  cuchillo_maya: { nombre: 'Corte doble', alcance: 0.9, radio: 1, mult: 2.2, sangra: true },
  atlatl_maya:   { nombre: 'Andanada', tiro: 3, abre: 14, mult: 1.4 },
  cerbatana:     { nombre: 'Ráfaga', tiro: 4, abre: 6, mult: 0.9 },
  escudo_maya:   { nombre: 'Empujón', alcance: 1, radio: 1.4, mult: 0.8, aturde: 1 },
};
function especialArma(j) {
  const r = enMano(), A = ARMAS[r.id], E = ESPECIAL_ARMA[r.id];
  const dano = Math.round(estadisticas().ataque * E.mult * (CALIDAD[r.nv] ?? 1) * (maestria()[A.clase] ?? 1));
  const vivos = juego.enemigos.filter((e) => e.vida > 0 && e.golpeable !== false);
  if (E.tiro) {
    const obj = fijadoValido() ? juego.fijado : vivos.filter((e) => dist(e, j) <= alcanceTiro(A)).sort((a, b) => dist(a, j) - dist(b, j))[0];
    if (obj) { const d = dist(obj, j) || 1; j.fx = (obj.x - j.x) / d; j.fy = (obj.y - j.y) / d; }
    for (let k = 0; k < E.tiro; k++) { const [ux, uy] = girar(j.fx, j.fy, (k - (E.tiro - 1) / 2) * (E.abre || 0)); soltarDardo(j, r.id, ux, uy, dano, E.atraviesa || A.atraviesa || 1); }
    return sonar('disparo');
  }
  const cx = j.x + j.fx * (E.largo ? E.largo / 2 : E.alcance), cy = j.y + j.fy * (E.largo ? E.largo / 2 : E.alcance);
  juego.efectos.push({ tipo: 'tajo', x: cx, y: cy, t: 0.2, remate: true });
  for (const e of vivos) {
    const t = Math.max(0, Math.min(E.largo || 0, (e.x - j.x) * j.fx + (e.y - j.y) * j.fy)); // franja: punto más cercano del segmento
    const l = E.largo ? Math.hypot(e.x - j.x - j.fx * t, e.y - j.y - j.fy * t) : Math.hypot(e.x - cx, e.y - cy);
    if (l >= E.radio + e.r || herirEnemigo(e, dano, j, afinidadJugador()) === false || e.vida <= 0) continue;
    if (E.aturde) aturdir(e, E.aturde);
    if (E.sangra) e.sangra = { t: SANGRADO.seg, tic: SANGRADO.cada, cant: Math.max(1, Math.round(dano * SANGRADO.parte)) };
  }
  if (E.rompe) trasBlandir({ rompe: true }, cx, cy); // el mismo rompe-basalto del golpe
}

// Proyectiles del jugador y sangrado del cuchillo (cada cuadro, desde actualizar en js/juego.js).
function actualizarArmas(dt) {
  const j = juego.jugador;
  for (const s of juego.dardos) {
    const A = ARMAS[s.id];
    s.x += s.ux * A.vel * dt; s.y += s.uy * A.vel * dt; s.t -= dt;
    if (bloqueado(s.x, s.y, 0.05)) { s.t = 0; continue; } // muro o vacío
    const e = juego.enemigos.find((e) => e.vida > 0 && e.golpeable !== false && !s.tocados.includes(e) && Math.hypot(e.x - s.x, e.y - s.y) < TIRO.radio + e.r);
    if (e) { s.tocados.push(e); if (--s.quedan <= 0) s.t = 0; herirEnemigo(e, s.dano, j, afinidadJugador()); }
  }
  juego.dardos = juego.dardos.filter((s) => s.t > 0);
  for (const e of juego.enemigos) {
    const g = e.sangra;
    if (!g || e.vida <= 0) continue;
    g.t -= dt; g.tic -= dt;
    if (g.tic <= 0) { g.tic += SANGRADO.cada; herirEnemigo(e, g.cant, j); }
    if (g.t <= 0) e.sangra = null;
  }
}
// Defensa con el escudo: lo que llega de frente (delante del jugador) entra a un 15 %; de espaldas, como sin escudo.
function factorDefensa(j, desde) {
  const frente = (desde.x - j.x) * j.fx + (desde.y - j.y) * j.fy >= 0;
  const E = escudoLlevado();
  return E && frente ? E.defensa : DEFENSA.factor;
}
const lentoEscudo = () => escudoLlevado()?.lento ?? 1;
// Texto corto del HUD: «▸Mazo★★ · Honda★ 25» (▸ = la de la mano, si llevas dos; con munición o usos).
const textoArmas = () => ranuras().map((r) => `${r === enMano() && ranuras().length > 1 ? '▸' : ''}${ARMAS[r.id].corto}${estrellas(r.nv)}${ARMAS[r.id].municion ? ' ' + r.mun : ARMAS[r.id].usos ? ' ' + r.usos : ''}`).join(' · ');

// ---------- Dibujo ----------
// Proyectiles: dardo (asta clara y punta de obsidiana), jabalina (más larga y gruesa) y piedra de honda.
function dibujarDardos() {
  for (const s of juego.dardos) {
    const [a, b] = pantalla(s.x, s.y, 0.7), largo = s.id === 'jabalina' ? 1 : 0.55, [c, d] = pantalla(s.x - s.ux * largo, s.y - s.uy * largo, 0.7);
    const x = Math.round(a - vista.cx), y = Math.round(b - vista.cy);
    if (s.id === 'honda') { ctx.fillStyle = '#8a8478'; ctx.fillRect(x - 2, y - 2, 4, 4); ctx.fillStyle = '#c9c2b2'; ctx.fillRect(x - 2, y - 2, 2, 2); continue; }
    ctx.lineWidth = s.id === 'jabalina' ? 3 : 2; ctx.strokeStyle = s.id === 'jabalina' ? '#b98a52' : '#e8d49a';
    ctx.beginPath(); ctx.moveTo(c - vista.cx, d - vista.cy); ctx.lineTo(a - vista.cx, b - vista.cy); ctx.stroke();
    ctx.fillStyle = '#1c1820'; ctx.fillRect(x - 1, y - 1, s.id === 'jabalina' ? 4 : 3, s.id === 'jabalina' ? 4 : 3);
  }
}
// Cada arma en píxeles dobles (se ve de lejos), centrada en (0, 0): [color, x, y, ancho, alto].
const MADERA = '#8a5530', OSCURA = '#5e3a20', OBSIDIANA = '#1c1820', BRILLO = '#7a6f8c', PIEDRA = '#8a8478', JADE = '#3fa37a';
const DIBUJO = {
  macana: [[OSCURA, -1, -12, 3, 24], [MADERA, -1, -12, 1, 24], ['#3b2414', -1, 8, 3, 5], ...[-11, -8, -5, -2, 1, 4].flatMap((i) => [[OBSIDIANA, -4, i, 2, 2], [OBSIDIANA, 3, i, 2, 2], [BRILLO, -4, i, 1, 1], [BRILLO, 4, i, 1, 1]])],
  mazo: [[MADERA, -1, -2, 2, 15], [OSCURA, 0, -2, 1, 15], [OSCURA, -5, -11, 10, 9], [MADERA, -5, -11, 9, 8], ['#a8703f', -4, -10, 3, 2]],
  lanza: [[MADERA, 0, -10, 1, 24], [OSCURA, 1, -10, 1, 24], [PIEDRA, -1, -15, 3, 5], ['#c9c2b2', 0, -16, 1, 2], ['#d4503e', -1, -9, 3, 1]],
  cuchillo: [[OSCURA, -1, 3, 3, 6], [MADERA, -1, 3, 1, 6], [OBSIDIANA, -1, -9, 3, 12], [BRILLO, 0, -8, 1, 9], [OBSIDIANA, 0, -11, 1, 2]],
  hacha: [[MADERA, 0, -8, 2, 20], [OSCURA, 1, -8, 1, 20], [JADE, -6, -10, 7, 6], ['#6fcf9e', -6, -10, 3, 2], ['#2d7a59', -6, -5, 7, 1], ['#d4c08a', -1, -8, 4, 2]],
  atlatl: [[MADERA, -10, 2, 20, 2], [OSCURA, 8, 0, 2, 4], ['#3b2414', -12, 1, 3, 4], ['#e8d49a', -12, -3, 24, 1], [OBSIDIANA, 12, -4, 3, 3], ['#d4503e', -13, -5, 2, 2], [JADE, -13, -2, 2, 2]],
  jabalina: [['#b98a52', -13, -1, 26, 2], [OSCURA, -13, 0, 26, 1], [OBSIDIANA, 13, -2, 3, 4], ['#d4503e', -14, -3, 2, 2], ['#e0a23a', -14, 1, 2, 2]],
  honda: [['#c9a46a', -8, -10, 1, 12], ['#c9a46a', 7, -10, 1, 12], ['#a67c45', -7, 1, 14, 3], [PIEDRA, -3, -1, 6, 4], ['#c9c2b2', -2, -1, 2, 2]],
  // Etapa 45, mayas: el pedernal es claro y pardo, no negro como la obsidiana.
  lanza_maya: [[MADERA, 0, -8, 1, 26], [OSCURA, 1, -8, 1, 26], ['#b8a88a', -1, -16, 3, 8], ['#d8ccb0', 0, -17, 1, 3], ['#8a7a5c', 1, -12, 1, 3], ['#3d6fa8', -1, -7, 3, 1]],
  hacha_maya: [[MADERA, 0, -8, 2, 20], [OSCURA, 1, -8, 1, 20], ['#a8977a', -7, -10, 8, 7], ['#d0c3a4', -7, -10, 3, 2], ['#7d6e55', -7, -4, 8, 1], ['#a4483a', -1, -8, 4, 2]],
  cuchillo_maya: [[OSCURA, -1, 3, 3, 6], [MADERA, -1, 3, 1, 6], ['#b8a88a', -1, -9, 3, 12], ['#ddd2b6', 0, -8, 1, 9], ['#b8a88a', 0, -11, 1, 2]],
  atlatl_maya: [[MADERA, -10, 2, 20, 2], [OSCURA, 8, 0, 2, 4], ['#3b2414', -12, 1, 3, 4], ['#e8d49a', -12, -3, 24, 1], ['#b8a88a', 12, -4, 3, 3], ['#3d6fa8', -13, -5, 2, 2], ['#4f9a4a', -13, -2, 2, 2]],
  cerbatana: [['#9a7a46', -14, -1, 28, 3], ['#6e5530', -14, 1, 28, 1], ['#3a2a1c', 13, -1, 2, 3], ['#c9a35a', -15, -2, 2, 5]],
  escudo_maya: [['#6b4a2e', -8, -10, 16, 18], ['#d8c49a', -7, -9, 14, 16], ...[[-4, -6], [2, -5], [-2, 0], [3, 2], [-5, 3]].map(([a, b]) => ['#6b4a2e', a, b, 2, 2]), ...[-7, -4, -1, 2, 5].map((a) => ['#3f8a4a', a, 8, 2, 5])],
  escudo: [[OSCURA, -8, -12, 16, 24], [MADERA, -7, -11, 14, 22], ['#c9a46a', -7, -4, 14, 2], ['#c9a46a', -7, 4, 14, 2], ['#d4503e', -2, -9, 4, 4], [JADE, -2, 7, 4, 3]],
};
// El arma flota sobre el estrado (sprite de Unity Estrado_Ofrenda_01), con un brillo, y sube y baja.
function dibujarArmaSuelta(o) {
  if (o.estrado !== false) dibujar('Estrado_Ofrenda_01', o.x, o.y, 0);
  // Sobre el estrado flota a 1,4 m; en el suelo (la de un cofre o una ofrenda), más baja.
  const [sx, sy] = pantalla(o.x, o.y, (o.estrado !== false ? 1.4 : 0.5) + Math.sin(o.t * 2.5) * 0.08), x = Math.round(sx - vista.cx), y = Math.round(sy - vista.cy);
  ctx.fillStyle = 'rgba(255,220,140,.25)'; ctx.beginPath(); ctx.arc(x, y, 26 + Math.sin(o.t * 4) * 2, 0, 7); ctx.fill();
  for (const [c, a, b, w, h] of DIBUJO[o.arma]) { ctx.fillStyle = c; ctx.fillRect(x + a * 2, y + b * 2, w * 2, h * 2); }
}

// Autocomprobación: cada arma tiene clase, dibujo y texto; cada Guardián, maestría; los niveles con arma no son el X-3
// (santuario) y el tiro llega más lejos que cualquier golpe.
console.assert(Object.entries(ARMAS).every(([k, A]) => ['cerca', 'lejos', 'escudo'].includes(A.clase) && DIBUJO[k] && QUE_HACE[k]), 'Armas: datos completos');
console.assert(Object.values(BOTIN_COFRE).flat().every(([o]) => OBJETOS[o]), 'Armas: botín con objetos que existen');
console.assert(!ARMAS_COFRE.includes('escudo') && ARMAS_COFRE.length === 8, 'Armas: el escudo no sale en cofres');
console.assert(GUARDIANES.every((g) => MAESTRIA[g.id]), 'Armas: maestría de cada Guardián');
console.assert(armasDe('maya').length === 6 && armasDe('maya').every((k) => PRECIO_ARMERO[k]), 'Armas: armero maya');
console.assert(ARMAS_COFRE.every((k) => PRECIO_ARMERO[k]?.every(([o, n]) => OBJETOS[o] && n > 0)), 'Armas: precio del armero');
console.assert(Object.keys(ARMAS).every((k) => ESPECIAL_ARMA[k]?.nombre && ESPECIAL_ARMA[k].mult > 0 && (ESPECIAL_ARMA[k].tiro ? ARMAS[k].clase === 'lejos' : ARMAS[k].clase !== 'lejos')), 'Armas: especial de cada arma');
console.assert(CALIDAD[1] < CALIDAD[2] && CALIDAD[2] < CALIDAD[3], 'Armas: calidad sube con el piso');
console.assert(Object.keys(NIVEL_ARMA).every((n) => +n >= 1 && +n <= 4 && +n !== 3), 'Armas: niveles');
console.assert(Object.values(ARMAS).filter((A) => A.clase === 'lejos').every((L) => L.alcance > TIRO.cerca + Math.max(...Object.values(ARMAS).filter((A) => A.clase === 'cerca').map((A) => A.alcance))), 'Armas: alcances');
