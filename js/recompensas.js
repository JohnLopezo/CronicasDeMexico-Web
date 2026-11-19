'use strict';
// Recompensas (M5): progresión, bolsa, entregas únicas, botín, ofrendas, Bendiciones, servicios y menú.
// Los datos salen de Unity (datos/recompensas.js); las reglas, de Docs/Sistemas/Sistema_Recompensas.md.

const NIVEL_ZONA = { ciudad: 1, selva: 1, p1: 2, p2: 3, p3: 4 };
const BOTIN = { espiritu: 'BOT_espiritu_corrompido', eco: 'BOT_eco_borrado', jaguar: 'BOT_jaguar_piedra', fauna: 'BOT_fauna', vasija: 'BOT_vasija', pecari: 'BOT_fauna', ocelote: 'BOT_fauna', aullador: 'BOT_fauna', armadillo: 'BOT_fauna', tapir: 'BOT_espiritu_corrompido', nauyaca: 'BOT_jaguar_piedra' };
const CATEGORIA = ['Material', 'Consumible', 'Reliquia', 'Coleccionable', 'Narrativo', 'Moneda'];
const RAREZA = ['Común', 'Poco común', 'Raro', 'Épico', 'Legendario'];
const COLOR_RAREZA = ['#e9e2d2', '#7fd18a', '#6fb3ff', '#c08cff', '#f0b440'];
const RANURAS_RELIQUIA = 2;
const TIERRA = { radio: 2.5, multiplicador: 2 }; // BEN_tierra: 2 × ataque en 2,5 m

// El Guardián elegido (Progression.Profile). Las partidas anteriores a la elección eran de Yaret.
const GUARDIAN_INICIAL = 'quetzal';
const guardianDe = (id) => GUARDIANES.find((g) => g.id === id) || GUARDIANES.find((g) => g.id === GUARDIAN_INICIAL);
const guardianActual = (p = prog()) => guardianDe(p.guardian);
function nuevoProgreso(guardian = GUARDIAN_INICIAL) {
  return { guardian, nivel: 1, xp: 0, energia: guardianDe(guardian).base.maxEnergy, bolsa: {}, orden: [], reliquias: [], principal: null, secundaria: null,
    entregadas: {}, derrotas: {} };
}
const prog = () => juego.prog;

// ---------- Estadísticas: perfil del nivel + reliquias equipadas + Bendiciones (Progression.Stats) ----------
function estadisticas(p = prog()) {
  const g = guardianActual(p), b = g.base, c = g.crece, n = p.nivel - 1;
  const s = { vida: Math.floor(b.maxHealth + c.x * n), ataque: Math.floor(b.attack + c.y * n), defensa: Math.floor(b.defense + c.z * n),
    energia: Math.floor(b.maxEnergy + c.w * n) };
  const sumar = (bono) => { s.vida += bono.maxHealth || 0; s.ataque += bono.attack || 0; s.defensa += bono.defense || 0; s.energia += bono.maxEnergy || 0; };
  for (const id of p.reliquias) { const o = OBJETOS[id]; if (o && (!o.soloGuardian || o.soloGuardian === g.id)) sumar(o.bono); }
  for (const id of [p.principal, p.secundaria]) if (id) sumar(BENDICIONES[id].bono);
  if (juego.defensaExtra?.t > 0) s.defensa += juego.defensaExtra.n;
  return s;
}
const xpParaSubir = (nivel) => Math.round(PROGRESION.base * Math.pow(nivel, PROGRESION.exponente));
// Al cambiar las estadísticas, la vida máxima sube (y la actual con ella) o baja; la energía nunca queda por encima del máximo.
function aplicarEstadisticas(sinCurar = false) {
  const s = estadisticas(), j = juego.jugador;
  if (j) { const dif = s.vida - j.max; j.max = s.vida; if (dif > 0 && !sinCurar) j.vida += dif; j.vida = Math.min(j.vida, j.max); }
  prog().energia = Math.min(prog().energia, s.energia);
}

// ---------- Experiencia (Progression.AddExperience) ----------
function darXp(cantidad, nivelZona = 0, clave = null) {
  const p = prog(), C = PROGRESION;
  if (cantidad <= 0) return 0;
  let m = 1;
  if (nivelZona > 0 && p.nivel > nivelZona) m *= Math.max(C.suelo, 1 - C.penalizacion * (p.nivel - nivelZona));
  if (clave) { const veces = p.derrotas[clave] || 0; p.derrotas[clave] = veces + 1; const r = Math.pow(C.repeticion, veces); m *= r < C.corte ? 0 : r; }
  const dada = Math.round(cantidad * m);
  if (dada <= 0) return 0;
  p.xp += dada;
  let subio = false;
  while (p.nivel < C.nivelMax && p.xp >= xpParaSubir(p.nivel)) { p.xp -= xpParaSubir(p.nivel); p.nivel++; subio = true; }
  if (p.nivel >= C.nivelMax) p.xp = 0;
  avisoRecompensa(`+${dada} de experiencia`);
  if (subio) { aplicarEstadisticas(); sonar('nivel'); avisoRecompensa(`¡Nivel ${p.nivel}!`, '#f0b440'); }
  return dada;
}

// ---------- Bolsa (Inventory) ----------
const tiene = (id) => prog().bolsa[id] || 0;
function darObjeto(id, n) {
  const o = OBJETOS[id], p = prog();
  if (!o || n <= 0) return 0;
  const entra = Math.min(n, o.tope - tiene(id)); // lo que no cabe se descarta
  if (entra <= 0) return 0;
  if (!p.bolsa[id]) p.orden.push(id);
  p.bolsa[id] = tiene(id) + entra;
  return entra;
}
function quitarObjeto(id, n) {
  const p = prog();
  if (tiene(id) < n) return false;
  p.bolsa[id] -= n;
  if (!p.bolsa[id]) { delete p.bolsa[id]; p.orden = p.orden.filter((x) => x !== id); p.reliquias = p.reliquias.filter((x) => x !== id); }
  return true;
}
const nombreObjeto = (id) => OBJETOS[id]?.nombre || id;
// La «Marca de su Guardián» de la ofrenda oculta del piso 2 es la del Guardián en juego.
const marcaPropia = (id) => (id.startsWith('marca_') ? `marca_${guardianActual().id}` : id);

// ---------- Entregas (RewardService.Grant): una sola vez por clave ----------
function tirarTabla(nombre) {
  const t = TABLAS[nombre], sale = t.seguro.map((s) => ({ ...s }));
  for (const c of t.azar) if (Math.random() < c.p) sale.push({ id: c.id, n: c.min + Math.floor(Math.random() * (c.max - c.min + 1)) });
  return { xp: t.xp, objetos: sale };
}
function entregar(paquete, clave, nivelZona = 0, claveRepeticion = null) {
  const p = prog();
  if (clave && p.entregadas[clave]) return null;
  if (clave) p.entregadas[clave] = true;
  const k = typeof paquete === 'string' ? PAQUETES[paquete] : paquete;
  const extra = k.extra ? tirarTabla(k.extra) : { xp: 0, objetos: [] };
  const lineas = [];
  const xp = darXp((k.xp || 0) + extra.xp, nivelZona, claveRepeticion);
  if (xp) lineas.push(`${xp} de experiencia`);
  const juntos = {}; // lo fijo y lo de la tabla, sumado por objeto
  for (const { id, n } of [...(k.objetos || []), ...extra.objetos]) juntos[marcaPropia(id)] = (juntos[marcaPropia(id)] || 0) + n;
  for (const [id, n] of Object.entries(juntos)) {
    const dado = darObjeto(id, n);
    if (dado) { lineas.push(`${nombreObjeto(id)} ×${dado}`); avisoRecompensa(`${nombreObjeto(id)} ×${dado}`, COLOR_RAREZA[OBJETOS[id].rareza]); }
  }
  for (const b of k.banderas || []) poner(b);
  if (k.bendicion) {
    const b = BENDICIONES[k.bendicion];
    if (b.ranura === 0) p.principal = k.bendicion; else p.secundaria = k.bendicion;
    aplicarEstadisticas();
    lineas.push(b.nombre); avisoRecompensa(`Bendición: ${b.nombre}`, '#7fe0b0');
  }
  if (lineas.length) sonar('premio');
  return lineas;
}
function recompensaEnemigo(e) {
  if (BOTIN[e.tipo]) entregar({ extra: BOTIN[e.tipo] }, null, NIVEL_ZONA[juego.region] || 0, e.clave);
}

// ---------- Avisos breves (máximo 3 a la vez, 2,6 s cada uno) ----------
function avisoRecompensa(txt, color = '#e9e2d2') {
  const caja = $('avisos'), d = document.createElement('div');
  d.textContent = txt; d.style.color = color;
  caja.append(d);
  while (caja.children.length > 3) caja.firstChild.remove();
  setTimeout(() => d.remove(), 2600);
}

// ---------- Consumibles (PlayerStats) y uso rápido ----------
function puedeUsar(id) {
  const e = OBJETOS[id].efecto, j = juego.jugador, s = estadisticas();
  return (e.heal > 0 && j.vida < j.max) || (e.energy > 0 && prog().energia < s.energia) || (e.defenseBonus > 0 && !(juego.defensaExtra?.t > 0));
}
function usarObjeto(id) {
  const o = OBJETOS[id], e = o.efecto, j = juego.jugador;
  if (o.cat !== 1 || !tiene(id) || !puedeUsar(id)) return false; // la vida no se regenera: solo sube con objetos y santuarios
  quitarObjeto(id, 1);
  if (e.heal > 0) { const c = Math.min(e.heal, j.max - j.vida); j.vida += c; numero(j.x, j.y, `+${c}`, '#7fe0b0'); }
  if (e.energy > 0) prog().energia = Math.min(estadisticas().energia, prog().energia + e.energy);
  if (e.defenseBonus > 0) juego.defensaExtra = { n: e.defenseBonus, t: e.duration };
  avisoRecompensa(`Usas: ${o.nombre}`); sonar('cura');
  return true;
}
// Tecla 1: primero cura si la vida está por debajo del 60 %; después, la energía.
function usoRapido() {
  const j = juego.jugador, consumibles = prog().orden.filter((id) => OBJETOS[id].cat === 1 && puedeUsar(id));
  const cura = consumibles.filter((id) => OBJETOS[id].efecto.heal > 0).sort((a, b) => OBJETOS[b].efecto.heal - OBJETOS[a].efecto.heal)[0];
  const energia = consumibles.find((id) => OBJETOS[id].efecto.energy > 0);
  const id = j.vida < j.max * 0.6 && cura ? cura : energia || cura;
  if (!id || !usarObjeto(id)) { avisoRecompensa('No hay nada que usar ahora'); sonar('no'); }
}

// ---------- Golpe de tierra (Bendición de la Tierra) ----------
function golpeDeTierra() {
  const j = juego.jugador, p = prog(), b = BENDICIONES[p.principal];
  if (!b || p.principal !== 'tierra' || j.vida <= 0 || juego.dialogo) return;
  if ((juego.esperaTierra || 0) > 0) { sonar('no'); return avisoRecompensa(`Tierra: espera ${juego.esperaTierra.toFixed(1)} s`); }
  if (p.energia < b.coste) { sonar('no'); return avisoRecompensa('Sin energía'); }
  p.energia -= b.coste; juego.esperaTierra = b.espera;
  juego.efectos.push({ tipo: 'tierra', x: j.x, y: j.y, t: 0.4 });
  vista.temblor = 0.2; sonar('tierra');
  for (const e of juego.enemigos) if (e.vida > 0 && e.golpeable !== false && dist(e, j) < TIERRA.radio + e.r) herirEnemigo(e, estadisticas().ataque * TIERRA.multiplicador, j, 'Tierra'); // la Tierra es siempre Tierra
  for (const r of juego.rompibles) if (!bandera(r.bandera) && dist(r, j) < TIERRA.radio + 1) r.romper();
}

// ---------- Ofrendas y basalto agrietado (RewardChest, BreakableBasalt) ----------
const TXT_GRIETA = 'Columnas de basalto caídas, partidas por grietas que brillan como brasas. Detrás se adivina un hueco. ' +
  'La piedra no cede a los golpes: haría falta que la tierra misma la empujara.';
function ofrenda(id, punto, vasija, requiere, alAbrir) {
  const bandera_ = `ofrenda.${id}`, visible = () => !requiere || bandera(requiere);
  const obj = { x: punto.x, y: punto.y, z: 0, orden: profundidad(punto.y, 0), dibujar() {
    if (visible()) dibujar(vasija ? (bandera(bandera_) ? 'Ofrenda_04' : 'Ofrenda_03') : bandera(bandera_) ? 'Ofrenda_02' : 'Ofrenda_01', punto.x, punto.y);
  } };
  mundo.objetos.push(obj);
  const bloqueo = caja(punto.x, punto.y, 0.55, 0.7);
  if (visible()) mundo.cajas.push(bloqueo); else juego.alAparecer.push(() => visible() && !mundo.cajas.includes(bloqueo) && mundo.cajas.push(bloqueo));
  juego.interactuables.push({ x: punto.x, y: punto.y - 0.2, r: 0.9, texto: 'Abrir la ofrenda', activo: visible, usar() {
    if (bandera(bandera_)) return mensaje('La ofrenda ya está vacía.');
    const lineas = entregar(id === 'p3_final' ? 'REC_ofrenda_final' : `REC_ofrenda_${id}`, bandera_) || [];
    const arma = armaEnOfrenda(id); // a veces un arma (js/armas.js)
    mensaje(`Abres la ofrenda. Encuentras: ${lineas.join(', ') || 'nada'}${arma}.`, () => { poner(bandera_); alAbrir?.(); });
  } });
}
function basaltoAgrietado(id, punto) {
  const bandera_ = `roto.${id}`;
  if (bandera(bandera_)) return;
  const obj = { x: punto.x, y: punto.y, z: 0, orden: profundidad(punto.y, 0), dibujar() { dibujar('Basalto_Agrietado_01', punto.x, punto.y); } };
  const bloqueo = caja(punto.x, punto.y, 1, 2);
  mundo.objetos.push(obj); mundo.cajas.push(bloqueo);
  const it = { x: punto.x, y: punto.y, r: 1.6, texto: 'Examinar', usar: () => mensaje(prog().principal === 'tierra' ? TXT_GRIETA + '\n\n(Usa el golpe de tierra.)' : armaDe('cerca') === 'hacha' ? TXT_GRIETA + '\n\n(Prueba con el hacha.)' : TXT_GRIETA) };
  juego.interactuables.push(it);
  juego.rompibles.push({ x: punto.x, y: punto.y, bandera: bandera_, romper() {
    poner(bandera_); mundo.objetos.splice(mundo.objetos.indexOf(obj), 1); mundo.cajas = mundo.cajas.filter((c) => c !== bloqueo);
    juego.interactuables.splice(juego.interactuables.indexOf(it), 1);
    juego.efectos.push({ tipo: 'destello', x: punto.x, y: punto.y, t: 0.3 }); vista.temblor = 0.3; sonar('rompe');
    avisoRecompensa('El basalto agrietado se rompe');
  } });
}

// ---------- Cierre de la mazmorra: nota, Bendición secundaria y resultados (DungeonCompletion) ----------
const SECRETOS = ['ofrenda.p1_especial', 'ofrenda.p2_especial', 'ofrenda.p3_oculta'];
const nota = (encontrados, total, cayo) => { const pts = encontrados + (cayo ? 0 : 1), t = total + 1; return pts >= t ? 'S' : pts >= t - 1 ? 'A' : pts >= 1 ? 'B' : 'C'; };
function cerrarMazmorra() {
  const j = juego.jugador;
  if (SPRITES[`Guerrero_${guardianActual().nombre}_Victoria1_03`] && !j.victoriaVista) { j.victoria = 1.5; j.victoriaVista = true; return setTimeout(cerrarMazmorra, 1500); }
  const encontrados = SECRETOS.filter(bandera).length, cayo = bandera('incursion.caido'), g = nota(encontrados, SECRETOS.length, cayo);
  entregar(`REC_nota_${g}`, 'nota.olmeca');
  if (g === 'S') poner('titulo.memoria_de_piedra');
  const resultados = () => abrirCapa('resultados', `<h1>La ciudad bajo la selva</h1><p class="nota">Nota ${g}</p>
    <p>Secretos: ${encontrados}/${SECRETOS.length} · ${cayo ? 'Caíste en la incursión' : 'Sin caer'}</p>
    ${g === 'S' ? '<p>Título: «Memoria de piedra»</p>' : ''}<div class="botones"><button data-cerrar>Continuar</button></div>`);
  if (prog().secundaria) return resultados();
  const opciones = Object.entries(BENDICIONES).filter(([, b]) => b.ranura === 1 && b.cultura === 'olmeca');
  abrirCapa('eleccion', `<h1>Elige una Bendición</h1><p>Una sola: la diferencia es de estilo, no de poder.</p><div class="cartas">${opciones.map(([id, b]) =>
    `<button class="carta" data-bendicion="${id}"><b>${b.nombre}</b><i>${b.desc}</i><span>${b.combate}</span></button>`).join('')}</div>`, (id) => {
    entregar({ bendicion: id }, `bendicion.${id}`);
    resultados();
  });
}

// ---------- Códice (CodexService): una página aparece con su aviso o su bandera; lo encontrado es la bandera codice.<id> ----------
const ORIGEN = ['Documentado', 'Interpretación', 'Ficción del juego'];
function revisarCodice(disparador, enSilencio = false) {
  for (const p of CODICE) {
    if (p.disparador !== disparador || juego.flags[`codice.${p.id}`]) continue;
    juego.flags[`codice.${p.id}`] = true;
    if (!enSilencio) { avisoRecompensa(`Nueva página del Códice: ${p.titulo}`, COLOR_RAREZA[2]); sonar('premio'); }
  }
}
// Al cargar una partida de antes del Códice, las páginas cuya bandera ya se cumplía aparecen sin aviso.
const ponerCodiceAlCargar = () => Object.keys(juego.flags).forEach((k) => revisarCodice(k, true));

// ---------- Vender (Economy.CanSell): ni la moneda, ni lo único o de la historia, ni lo equipado ----------
const puedeVender = (id) => { const o = OBJETOS[id]; return id !== 'ecos' && o?.vendible && o.cat !== 4 && !prog().reliquias.includes(id) && tiene(id) > 0 && o.valor > 0; };
function vender(id) { if (!puedeVender(id)) return; quitarObjeto(id, 1); darObjeto('ecos', OBJETOS[id].valor); avisoRecompensa(`+${OBJETOS[id].valor} ecos`); sonar('premio'); }

// ---------- Menú: bolsa, Bendiciones y servicios ----------
let pestana = 'bolsa', estacion = null;
function abrirCapa(id, html, alElegir) {
  juego.menuAbierto = true;
  const c = $('capaMenu');
  c.innerHTML = `<div class="caja ancha">${html}</div>`;
  c.classList.remove('oculto');
  c.onclick = (ev) => {
    const b = ev.target.closest('button'); if (!b) return;
    if (b.dataset.bendicion) return alElegir(b.dataset.bendicion);
    if (b.dataset.elegir) return alElegir(b.dataset.elegir);
    if (b.hasAttribute('data-cerrar')) cerrarMenu();
  };
  c.querySelector('button')?.focus({ preventScroll: true });
}
function cerrarMenu() { juego.menuAbierto = false; $('capaMenu').classList.add('oculto'); }
function abrirMenu(p = 'bolsa', est = null) { pestana = p; estacion = est; pintarMenu(); }
const fila = (id, extra) => { const o = OBJETOS[id];
  return `<div class="fila">${o.icono ? `<img src="${o.icono}" alt="">` : '<span class="ico"></span>'}<div><b style="color:${COLOR_RAREZA[o.rareza]}">${o.nombre}</b>
  <small>${CATEGORIA[o.cat]} · ${RAREZA[o.rareza]}</small><div>${o.desc || ''}</div><small>${o.uso || ''}</small></div>${extra}</div>`; };
const desbloqueada = (bandera_) => !bandera_ || bandera(bandera_);
function pintarMenu() {
  const p = prog(), s = estadisticas();
  const tabs = [['bolsa', 'Bolsa'], ['bendiciones', 'Bendiciones'], ['guardian', 'Guardián'], ['codice', 'Códice'], ...(estacion ? [[estacion, { artesano: 'Fabricar', cocina: 'Cocinar', comerciante: 'Comerciar', museo: 'Museo de la Memoria', armero: 'Armero', armero_maya: 'Armero' }[estacion]]] : [])];
  const linea = (titulo, texto, color) => `<div class="fila"><span class="ico"></span><div><b${color ? ` style="color:${color}"` : ''}>${titulo}</b><div class="texto">${texto}</div></div></div>`;
  const seccion = (t) => `<p class="resumen">${t}</p>`;
  let cuerpo = '';
  if (pestana === 'bolsa') {
    cuerpo = `<p class="resumen">Ecos ${tiene('ecos')} · Nivel ${p.nivel} (${p.xp}/${xpParaSubir(p.nivel)}) · Vida ${juego.jugador.vida}/${s.vida} · Ataque ${s.ataque} · Defensa ${s.defensa} · Energía ${Math.floor(p.energia)}/${s.energia}</p>` +
      (p.orden.filter((id) => id !== 'ecos').map((id) => {
        const o = OBJETOS[id], eq = p.reliquias.includes(id);
        const btn = o.cat === 1 ? `<button data-usar="${id}" ${puedeUsar(id) ? '' : 'disabled'}>Usar</button>`
          : o.cat === 2 ? `<button data-equipar="${id}" ${!eq && p.reliquias.length >= RANURAS_RELIQUIA ? 'disabled' : ''}>${eq ? 'Quitar' : 'Equipar'}</button>` : '';
        return fila(id, `<span class="cuenta">×${tiene(id)}${eq ? ' · equipada' : ''}</span>${btn}`);
      }).join('') || '<p>La bolsa está vacía.</p>');
  } else if (pestana === 'bendiciones') {
    cuerpo = [['Principal', p.principal], ['Secundaria', p.secundaria]].map(([r, id]) => { const b = BENDICIONES[id];
      return `<div class="fila"><span class="ico"></span><div><b>${r}: ${b ? b.nombre : '—'}</b><div>${b ? b.desc : 'Aún no tienes ninguna.'}</div><small>${b ? [b.combate, b.exploracion].filter(Boolean).join(' · ') : ''}</small></div></div>`; }).join('');
  } else if (pestana === 'guardian') {
    cuerpo = '<p>Cambiar de Guardián no cura ni recupera energía.</p><div class="cartas">' + GUARDIANES.map((g) => cartaGuardian(g, p.nivel, g.id === p.guardian)).join('') + '</div>';
  } else if (pestana === 'codice') {
    const n = CODICE.filter((c) => bandera(`codice.${c.id}`)).length;
    cuerpo = `<p>Páginas encontradas: ${n} de ${CODICE.length}. Están escondidas por el mundo: explora, examina y busca tras la piedra.</p>` +
      CODICE.map((c) => (bandera(`codice.${c.id}`) ? linea(`${c.titulo} · ${ORIGEN[c.origen]}`, c.texto, COLOR_RAREZA[2]) : linea('???', c.pista))).join('');
  } else if (pestana === 'museo') {
    const objetos = (titulo, cat) => seccion(titulo) + (p.orden.filter((id) => OBJETOS[id].cat === cat).map((id) => { const o = OBJETOS[id];
      return linea(`${o.nombre}${tiene(id) > 1 ? ` ×${tiene(id)}` : ''} · ${ORIGEN[o.origen]}`, o.desc + (o.notaOrigen ? `<small>${o.notaOrigen}</small>` : ''), COLOR_RAREZA[o.rareza]); }).join('') || '<p>Nada todavía.</p>');
    const bendiciones = [[p.principal, 'principal'], [p.secundaria, 'secundaria']].filter(([id]) => id);
    cuerpo = '<p>El Museo de la Memoria guarda lo que has recuperado. (D = documentado, I = interpretación, F = ficción del juego.)</p>' + seccion('Culturas') +
      MUSEO.map((c) => !bandera(c.bandera) ? linea('???', 'Una memoria todavía por recuperar.') : linea(c.titulo, c.resumen) +
        c.guardianes.map((g) => (bandera(g.bandera) ? linea(`Guardián liberado: ${g.nombre}`, g.recuerdo, COLOR_RAREZA[4]) : linea(`Guardián: ${g.nombre}`, 'Aún corrompido.'))).join('')).join('') +
      objetos('Reliquias', 2) + seccion('Bendiciones') +
      (bendiciones.map(([id, r]) => linea(`${BENDICIONES[id].nombre} (${r})`, BENDICIONES[id].desc, COLOR_RAREZA[3])).join('') || '<p>Ninguna todavía.</p>') +
      objetos('Fragmentos de memoria y objetos de la historia', 4) + objetos('Coleccionables', 3);
  } else if (pestana === 'armero' || pestana === 'armero_maya') {
    cuerpo = menuArmero(pestana === 'armero_maya' ? 'maya' : 'olmeca'); // js/armas.js
  } else if (pestana === 'comerciante') {
    cuerpo = `<p class="resumen">Ecos ${tiene('ecos')}</p>` + Object.entries(OFERTAS).filter(([, o]) => desbloqueada(o.bandera)).map(([k, o]) =>
      fila(o.objeto, `<span class="cuenta">×${o.n} por ${o.coste} ${nombreObjeto(o.precio)}</span><button data-oferta="${k}" ${tiene(o.precio) >= o.coste && tiene(o.objeto) < OBJETOS[o.objeto].tope ? '' : 'disabled'}>Cambiar</button>`)).join('') +
      seccion('Vender (los objetos únicos y de la historia nunca se venden)') +
      (p.orden.filter(puedeVender).map((id) => fila(id, `<span class="cuenta">×${tiene(id)} · ${OBJETOS[id].valor} ecos</span><button data-vender="${id}">Vender uno</button>`)).join('') || '<p>No tienes nada que vender.</p>');
  } else {
    cuerpo = Object.entries(RECETAS).filter(([, r]) => r.estacion === pestana && desbloqueada(r.bandera)).map(([k, r]) => {
      const puede = r.ingredientes.every((i) => tiene(i.id) >= i.n) && tiene(r.resultado) < OBJETOS[r.resultado].tope;
      return fila(r.resultado, `<span class="cuenta">${r.ingredientes.map((i) => `${nombreObjeto(i.id)} ${tiene(i.id)}/${i.n}`).join(' · ')}</span><button data-receta="${k}" ${puede ? '' : 'disabled'}>${pestana === 'cocina' ? 'Cocinar' : 'Fabricar'}</button>`);
    }).join('') || '<p>Aún no conoces recetas aquí.</p>';
  }
  abrirCapa('menu', `<div class="pestanas">${tabs.map(([k, t]) => `<button data-pestana="${k}" class="${k === pestana ? 'activa' : ''}">${t}</button>`).join('')}<button data-cerrar>Cerrar</button></div><div class="lista">${cuerpo}</div>`);
  $('capaMenu').onclick = (ev) => {
    const b = ev.target.closest('button'); if (!b) return;
    const d = b.dataset;
    if (b.hasAttribute('data-cerrar')) return cerrarMenu();
    if (d.pestana) pestana = d.pestana;
    if (d.usar) usarObjeto(d.usar);
    if (d.elegir && d.elegir !== p.guardian) { p.guardian = d.elegir; aplicarEstadisticas(true); precargar(Object.keys(SPRITES).filter((n) => n.startsWith(`Guerrero_${guardianActual().nombre}_`))); avisoRecompensa(`Guardián: ${guardianActual().nombre}`); }
    if (d.equipar) { p.reliquias = p.reliquias.includes(d.equipar) ? p.reliquias.filter((x) => x !== d.equipar) : [...p.reliquias, d.equipar]; aplicarEstadisticas(); }
    if (d.receta) { const r = RECETAS[d.receta]; r.ingredientes.forEach((i) => quitarObjeto(i.id, i.n)); darObjeto(r.resultado, r.n); avisoRecompensa(`${nombreObjeto(r.resultado)} ×${r.n}`); }
    if (d.vender) vender(d.vender);
    if (d.armero) elegirArmero(d.armero);
    if (d.oferta) { const o = OFERTAS[d.oferta]; quitarObjeto(o.precio, o.coste); darObjeto(o.objeto, o.n); avisoRecompensa(`${nombreObjeto(o.objeto)} ×${o.n}`); }
    pintarMenu();
  };
}

// Autocomprobación de las reglas de Unity (consola del navegador).
(() => {
  const p = nuevoProgreso(), s1 = estadisticas(p);
  console.assert(s1.vida === 50 && s1.ataque === 10 && s1.defensa === 0 && s1.energia === 100, 'Yaret a nivel 1: 50/10/0/100');
  for (const g of GUARDIANES) { const s = estadisticas(nuevoProgreso(g.id)); console.assert(s.vida === g.base.maxHealth && s.ataque === g.base.attack && s.energia === g.base.maxEnergy, `${g.nombre} a nivel 1`); }
  const balam5 = estadisticas({ ...nuevoProgreso('jaguar'), nivel: 5 });
  console.assert(balam5.vida === 68 && balam5.ataque === 20 && balam5.defensa === 2 && balam5.energia === 92, 'Balam a nivel 5: floor(base + crecimiento × 4)');
  console.assert(xpParaSubir(1) === 100 && xpParaSubir(2) === 283, 'Experiencia: 100 × nivel^1,5');
  console.assert(nota(3, 3, false) === 'S' && nota(3, 3, true) === 'A' && nota(1, 3, true) === 'B' && nota(0, 3, true) === 'C', 'Nota C/B/A/S');
  p.secundaria = 'fuerza_tierra';
  console.assert(estadisticas(p).defensa === 4 && estadisticas(p).vida === 60, 'Fuerza de la Tierra: defensa +4, vida +10');
})();

function cartaGuardian(g, nivel, actual) {
  const s = estadisticas({ ...nuevoProgreso(g.id), nivel }), retrato = SPRITES[`Guerrero_${g.nombre}_Reposo1_05`]?.[0];
  return `<button class="carta guardian${actual ? ' actual' : ''}" data-elegir="${g.id}">${retrato ? `<img src="${retrato}" alt="">` : ''}
    <b>${g.nombre}</b><small>${g.titulo}</small><i>${g.desc}</i>
    <span>Vida ${s.vida} · Ataque ${s.ataque} · Defensa ${s.defensa} · Energía ${s.energia}</span>
    <small>Afinidad: ${g.afinidad} · Especie ${g.especie.toLowerCase()} · Senda: ${g.senda}${actual ? ' · <b>elegido</b>' : ''}</small></button>`;
}
// Nueva partida: lo primero es elegir Guardián (StartMenuController).
function elegirGuardian() {
  return new Promise((listo) => abrirCapa('eleccion', `<h1>Elige a tu Guardián</h1><p>Cada uno está ligado al espíritu de su animal. Podrás cambiarlo después en el menú (Bolsa → Guardián).</p>
    <div class="cartas">${GUARDIANES.map((g) => cartaGuardian(g, 1, false)).join('')}</div>`, (id) => { cerrarMenu(); listo(id); }));
}
