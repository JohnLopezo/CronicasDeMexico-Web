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
// Se lleva una de cada clase: tomar otra de la misma clase la cambia; la misma recarga su munición o sus usos.
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
};
const TIRO = { cerca: 2.2, radio: 0.3 }; // a distancia: nadie a menos de 2,2 m (si no, golpe normal) y radio del proyectil
const SANGRADO = { seg: 2, cada: 0.5, parte: 0.15 }; // crítico del cuchillo: 4 tics de un 15 % del golpe
// Qué clase de arma da cada nivel (X-n) y desde qué piso.
const NIVEL_ARMA = { 1: { clase: 'escudo', desde: 2 }, 2: { clase: 'cerca', desde: 1 }, 4: { clase: 'lejos', desde: 1 } };
const armaDe = (clase) => juego.flags[`incursion.${clase}`] || null; // id del arma llevada de esa clase
const datosDe = (clase) => ARMAS[armaDe(clase)] || null;
const municion = () => juego.flags['incursion.municion'] || 0;
const tieneEscudo = () => !!armaDe('escudo');

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
const danoArma = (id) => ARMAS[id].dano * (maestria()[ARMAS[id].clase] ?? 1);
const alcanceTiro = (A) => A.alcance + (maestria().alcance || 0);
// «Balam domina las armas de cerca (combate cercano): daño ×2,0» o «A Itzel le cuestan…».
function textoMaestria(id) {
  const A = ARMAS[id], m = maestria()[A.clase], g = guardianActual(), x = danoArma(id).toFixed(1).replace('.', ','), cual = A.clase === 'cerca' ? 'las armas de cerca' : 'las armas a distancia';
  return m > 1 ? `${g.nombre} domina ${cual} (${maestria().por}): daño ×${x}` : m < 1 ? `A ${g.nombre} le cuestan ${cual}: daño ×${x}` : `Daño ×${x}`;
}
const QUE_HACE = {
  macana: 'golpes más fuertes y más largos', mazo: 'lento, rompe guardias y aturde con el remate', lanza: 'llega lejos y es rápida',
  cuchillo: 'muy rápido, críticos que sangran; se rompe tras 40 golpes', hacha: 'también rompe el basalto agrietado',
  atlatl: 'dardos con enemigos lejos', jabalina: 'pocas, mucho daño, atraviesan', honda: 'muchas piedras, de muy lejos',
  escudo: 'al defender, para casi todo de frente; vas algo más lento',
};

// El arma que da un nivel generado: la clase según NIVEL_ARMA y el arma al azar con la semilla de la incursión.
function armaDelNivel(id) {
  const piso = +id[1], n = NIVEL_ARMA[+id[3]];
  if (!n || piso < n.desde) return null;
  const ids = Object.keys(ARMAS).filter((k) => ARMAS[k].clase === n.clase), rnd = azar(hash(`${id}:arma:${semillaIncursion()}`));
  return ids[Math.floor(rnd() * ids.length)];
}

// El estrado: objeto que se dibuja encima y se toma con Usar (o Atacar junto a él).
function ponerArma(id, punto) {
  const clave = `incursion.arma_${id}`, tipo = armaDelNivel(id);
  if (!punto || !tipo || bandera(clave)) return;
  const A = ARMAS[tipo], o = { tipo: 'arma', arma: tipo, x: punto.x, y: punto.y, z: 0, t: 0, actualizar(a, dt) { a.t += dt; }, dibujar: dibujarArmaSuelta };
  juego.otros.push(o);
  const it = { x: punto.x, y: punto.y - 0.6, r: 1.4, texto: `Tomar ${A.nombre.toLowerCase()}`, usar() {
    if (bandera(clave)) return;
    poner(clave); juego.otros = juego.otros.filter((x) => x !== o); juego.interactuables = juego.interactuables.filter((x) => x !== it);
    sonar('premio'); tomarArma(tipo);
  } };
  juego.interactuables.push(it);
}
// Llevar un arma (del estrado o de un cofre): cambia la de su clase o recarga la misma, y lo avisa.
function tomarArma(tipo) {
  const A = ARMAS[tipo], antes = armaDe(A.clase);
  juego.flags[`incursion.${A.clase}`] = tipo;
  if (A.municion) juego.flags['incursion.municion'] = (antes === tipo ? municion() : 0) + A.municion + (maestria().municion || 0);
  if (A.usos) juego.flags['incursion.usos'] = A.usos;
  const cambio = antes && antes !== tipo ? ` (dejas ${ARMAS[antes].nombre.toLowerCase()})` : '';
  toast(`${A.nombre}${cambio}: ${QUE_HACE[tipo]}.${A.clase === 'escudo' ? '' : ' ' + textoMaestria(tipo)}`, 6);
}
// Arma al azar para un cofre (de cerca o a distancia, nunca el escudo), con la semilla de la incursión y el id del cofre.
const ARMAS_COFRE = Object.keys(ARMAS).filter((k) => ARMAS[k].clase !== 'escudo');
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
    const t = rnd(), L = datosDe('lejos');
    if (t < COFRE.arma) tomarArma(ARMAS_COFRE[Math.floor(rnd() * ARMAS_COFRE.length)]);
    else if (t < COFRE.arma + COFRE.municion && L) { const n = Math.ceil(L.municion / 2); juego.flags['incursion.municion'] = municion() + n; toast(`+${n} de munición para ${L.nombre.toLowerCase()}`, 4); }
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
  const c = document.createElement('canvas'), g = c.getContext('2d'); c.width = c.height = 40;
  for (const [col, a, b, w, h] of DIBUJO[id]) { g.fillStyle = col; g.fillRect(20 + a * 1.2, 20 + b * 1.2, w * 1.2, h * 1.2); }
  return (iconos[id] = c.toDataURL());
}
function poblarArmero(O, I) {
  const n = nuevoHabitante('armero', 'Guerrero', [ARMERO]); O.push(n);
  I.push(siguiendo(n, 1.4, 'Armero', () => abrirMenu('armero', 'armero'), null, n));
}
// Pestaña del armero (pintarMenu en js/recompensas.js).
function menuArmero() {
  const elegida = juego.flags['armero.eleccion'];
  return '<p>El armero de la aldea te presta un arma para la selva y la mazmorra: sales con ella en cada incursión y en la mazmorra puedes cambiarla por otra de su clase. Elige una.</p>' +
    ARMAS_COFRE.map((id) => { const A = ARMAS[id];
      return `<div class="fila"><img src="${iconoArma(id)}" alt=""><div><b>${A.nombre}</b><small>${A.clase === 'cerca' ? 'Cuerpo a cuerpo' : 'A distancia'}</small><div>${QUE_HACE[id]}.</div><small>${textoMaestria(id)}</small></div><button data-armero="${id}" ${elegida === id ? 'disabled' : ''}>${elegida === id ? 'Elegida' : 'Elegir'}</button></div>`;
    }).join('');
}
function elegirArmero(id) {
  const antes = juego.flags['armero.eleccion'];
  if (antes && ARMAS[antes].clase !== ARMAS[id].clase) juego.flags[`incursion.${ARMAS[antes].clase}`] = null; // solo una del armero
  juego.flags['armero.eleccion'] = id; tomarArma(id);
}
// Al empezar la incursión (al entrar a la selva, tras IncursionReset): se sale con la del armero.
function darArmaDelArmero() {
  const id = juego.flags['armero.eleccion'];
  if (!ARMAS[id]) return;
  juego.flags[`incursion.${ARMAS[id].clase}`] = id;
  if (ARMAS[id].municion) juego.flags['incursion.municion'] = ARMAS[id].municion + (maestria().municion || 0);
  if (ARMAS[id].usos) juego.flags['incursion.usos'] = ARMAS[id].usos;
}
// Ofrenda de Unity: además de su premio, a veces un arma (el texto que se añade al mensaje de la ofrenda, o '').
function armaEnOfrenda(id) {
  const tipo = id !== 'p3_final' && armaDeCofre(`ofrenda_${id}`, COFRE.ofrenda);
  if (!tipo) return '';
  tomarArma(tipo);
  return ` y ${ARMAS[tipo].nombre.toLowerCase()}`;
}

// ---------- Cuerpo a cuerpo: lo llama golpear() (js/actores.js) ----------
// Daño de un golpe con el arma de cerca: el cuchillo puede hacer crítico (×2) y abrir sangrado.
function danoGolpe(A, id, e, base) {
  let cant = Math.round(base * (A ? danoArma(id) : 1));
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
  if (A.usos && (juego.flags['incursion.usos'] = (juego.flags['incursion.usos'] || 0) - 1) <= 0) {
    juego.flags['incursion.cerca'] = null; sonar('rompe'); toast(`El ${A.nombre.toLowerCase()} se rompe: la obsidiana es frágil`, 3);
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
  juego.flags['incursion.municion'] = municion() - 1;
  juego.dardos.push({ id, x: j.x + ux * 0.4, y: j.y + uy * 0.4, ux, uy, t: alcanceTiro(A) / A.vel, quedan: A.atraviesa || 1, tocados: [] });
  sonar('disparo');
  if (!municion()) toast(`Sin munición para ${id === 'honda' ? 'la honda' : id === 'jabalina' ? 'las jabalinas' : 'el átlatl'}: espera al siguiente estrado`, 3);
  return true;
}
// Proyectiles del jugador y sangrado del cuchillo (cada cuadro, desde actualizar en js/juego.js).
function actualizarArmas(dt) {
  const j = juego.jugador;
  for (const s of juego.dardos) {
    const A = ARMAS[s.id];
    s.x += s.ux * A.vel * dt; s.y += s.uy * A.vel * dt; s.t -= dt;
    if (bloqueado(s.x, s.y, 0.05)) { s.t = 0; continue; } // muro o vacío
    const e = juego.enemigos.find((e) => e.vida > 0 && e.golpeable !== false && !s.tocados.includes(e) && Math.hypot(e.x - s.x, e.y - s.y) < TIRO.radio + e.r);
    if (e) { s.tocados.push(e); if (--s.quedan <= 0) s.t = 0; herirEnemigo(e, Math.round(estadisticas().ataque * danoArma(s.id)), j, afinidadJugador()); }
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
  return tieneEscudo() && frente ? ARMAS.escudo.defensa : DEFENSA.factor;
}
const lentoEscudo = () => (tieneEscudo() ? ARMAS.escudo.lento : 1);
// Texto corto del HUD: «Mazo · Honda 25 · Escudo».
const textoArmas = () => [armaDe('cerca') && `${ARMAS[armaDe('cerca')].corto}${ARMAS[armaDe('cerca')].usos ? ' ' + (juego.flags['incursion.usos'] || 0) : ''}`,
  armaDe('lejos') && `${ARMAS[armaDe('lejos')].corto} ${municion()}`, tieneEscudo() && 'Escudo'].filter(Boolean).join(' · ');

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
  escudo: [[OSCURA, -8, -12, 16, 24], [MADERA, -7, -11, 14, 22], ['#c9a46a', -7, -4, 14, 2], ['#c9a46a', -7, 4, 14, 2], ['#d4503e', -2, -9, 4, 4], [JADE, -2, 7, 4, 3]],
};
// El arma flota sobre el estrado (sprite de Unity Estrado_Ofrenda_01), con un brillo, y sube y baja.
function dibujarArmaSuelta(o) {
  dibujar('Estrado_Ofrenda_01', o.x, o.y, 0);
  const [sx, sy] = pantalla(o.x, o.y, 1.4 + Math.sin(o.t * 2.5) * 0.08), x = Math.round(sx - vista.cx), y = Math.round(sy - vista.cy);
  ctx.fillStyle = 'rgba(255,220,140,.25)'; ctx.beginPath(); ctx.arc(x, y, 26 + Math.sin(o.t * 4) * 2, 0, 7); ctx.fill();
  for (const [c, a, b, w, h] of DIBUJO[o.arma]) { ctx.fillStyle = c; ctx.fillRect(x + a * 2, y + b * 2, w * 2, h * 2); }
}

// Autocomprobación: cada arma tiene clase, dibujo y texto; cada Guardián, maestría; los niveles con arma no son el X-3
// (santuario) y el tiro llega más lejos que cualquier golpe.
console.assert(Object.entries(ARMAS).every(([k, A]) => ['cerca', 'lejos', 'escudo'].includes(A.clase) && DIBUJO[k] && QUE_HACE[k]), 'Armas: datos completos');
console.assert(Object.values(BOTIN_COFRE).flat().every(([o]) => OBJETOS[o]), 'Armas: botín con objetos que existen');
console.assert(!ARMAS_COFRE.includes('escudo') && ARMAS_COFRE.length === 8, 'Armas: el escudo no sale en cofres');
console.assert(GUARDIANES.every((g) => MAESTRIA[g.id]), 'Armas: maestría de cada Guardián');
console.assert(Object.keys(NIVEL_ARMA).every((n) => +n >= 1 && +n <= 4 && +n !== 3), 'Armas: niveles');
console.assert(Object.values(ARMAS).filter((A) => A.clase === 'lejos').every((L) => L.alcance > TIRO.cerca + Math.max(...Object.values(ARMAS).filter((A) => A.clase === 'cerca').map((A) => A.alcance))), 'Armas: alcances');
