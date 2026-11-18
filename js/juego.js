'use strict';
// Juego: estado, misiones, contenido de cada región, diálogos, guardado, HUD y bucle principal.

const juego = { region: null, jugador: null, enemigos: [], otros: [], interactuables: [], portales: [], disparos: [], marcas: [],
  efectos: [], flags: {}, misiones: {}, ordenMisiones: [], dialogo: null, pausa: false, viajando: false, activo: false, jefe: null,
  pausaGolpe: 0, lento: 0, t: 0, prog: null, rompibles: [], alAparecer: [], menuAbierto: false, esperaTierra: 0, defensaExtra: null };
const bandera = (k) => !!juego.flags[k];
const poner = (k) => { if (juego.flags[k]) return; juego.flags[k] = true; revisarCodice(k); }; // una bandera puede revelar una página del Códice

// ---------- Misiones (como QuestService: pasos en orden, cada uno avanza con un aviso «verbo:id») ----------
function empezarMision(id) {
  if (!MISIONES[id] || juego.misiones[id]) return;
  juego.misiones[id] = { paso: 0, cuenta: 0, hecha: false };
  juego.ordenMisiones.push(id);
  poner(`mision.${id}.activa`);
  toast(`Nueva misión: ${MISIONES[id].titulo}`);
  if (!MISIONES[id].pasos.length) completarMision(id);
}
function completarMision(id) {
  const m = juego.misiones[id];
  m.hecha = true; m.paso = MISIONES[id].pasos.length; m.cuenta = 0;
  delete juego.flags[`mision.${id}.activa`];
  poner(`mision.${id}.completada`);
  MISIONES[id].banderas.forEach(poner);
  if (PAQUETES[`REC_mision_${id}`]) entregar(`REC_mision_${id}`, `mision.${id}`);
  toast(`Misión completada: ${MISIONES[id].titulo}`); sonar('nivel');
}
function avisar(aviso) {
  revisarCodice(aviso);
  for (const id of [...juego.ordenMisiones]) {
    const m = juego.misiones[id];
    if (m.hecha || MISIONES[id].pasos[m.paso].aviso !== aviso) continue;
    if (++m.cuenta < MISIONES[id].pasos[m.paso].veces) continue;
    m.cuenta = 0;
    if (++m.paso >= MISIONES[id].pasos.length) completarMision(id);
  }
}
// El objetivo que se muestra es el de la última misión activa.
function objetivo() {
  for (const id of [...juego.ordenMisiones].reverse()) {
    const m = juego.misiones[id];
    if (m.hecha) continue;
    const p = MISIONES[id].pasos[m.paso];
    return `${MISIONES[id].titulo}: ${p.texto}${p.veces > 1 ? ` (${m.cuenta}/${p.veces})` : ''}`;
  }
  return '';
}

// ---------- Guardado (localStorage; JSON con versión y migración, como SaveService) ----------
const CLAVE = 'cronicas.web.partida', VERSION = 3;
function leerPartida() {
  try {
    const p = JSON.parse(localStorage.getItem(CLAVE));
    const q = p && p.version === 1 ? migrarV1(p) : p;
    // v2 → v3: como en Unity, nivel 1, sin objetos y con la energía llena.
    const r = q && (q.version === 2 || q.version === VERSION) ? { ...q, version: VERSION, prog: q.prog || nuevoProgreso() } : null;
    if (r && !r.prog.guardian) r.prog.guardian = GUARDIAN_INICIAL; // antes de la etapa 5 todos eran Yaret
    return r;
  } catch { return null; }
}
// La etapa 1 empezaba en la selva y solo guardaba banderas: se dan por hechas las misiones de la ciudad.
function migrarV1(p) {
  const f = { ...p.flags, 'olm.juramento': true, 'olm.despertar_completo': true, 'olm.anciana_conto': true, 'olm.entrada_descubierta': true, 'olm.guerrero_en_selva': true };
  const misiones = { MP_OLM_01: { hecha: true }, MP_OLM_02: { hecha: true } };
  const frag = [1, 2, 3].filter((i) => f[`olm.selva.fragmento_${i}`]).length;
  misiones.MP_OLM_03 = f['mision.MP_OLM_03.completada'] ? { hecha: true } : { paso: 1, cuenta: frag, hecha: false };
  if (f['mision.MP_OLM_03.completada']) misiones.MP_OLM_04 = { paso: f['olm.jaguar_piedra_vencido'] ? 3 : 0, cuenta: 0, hecha: false };
  for (const [id, m] of Object.entries(misiones)) {
    if (m.hecha) { m.paso = MISIONES[id].pasos.length; m.cuenta = 0; f[`mision.${id}.completada`] = true; MISIONES[id].banderas.forEach((b) => { f[b] = true; }); }
    else f[`mision.${id}.activa`] = true;
  }
  return { ...p, version: 2, flags: f, misiones, ordenMisiones: Object.keys(misiones) };
}
function guardar() {
  if (juego.prueba) return false; // la partida de prueba (?nivel=) no pisa la guardada
  const p = { version: VERSION, region: juego.region, vida: juego.jugador.vida, flags: juego.flags, misiones: juego.misiones,
    ordenMisiones: juego.ordenMisiones, prog: juego.prog, fecha: new Date().toISOString() };
  try { localStorage.setItem(CLAVE, JSON.stringify(p)); return true; } catch { return false; }
}

// ---------- Diálogos por ramas (DialogueData): la primera rama con todas sus banderas y ninguna prohibida ----------
function conversar(n, dialogo = n.id) {
  const r = (DIALOGOS[dialogo] || []).find((r) => r.requiere.every(bandera) && !r.prohibe.some(bandera));
  if (!r) return;
  n.hablando = true;
  hablar(n.quien, r.lineas, () => {
    n.hablando = false;
    r.alTerminar.forEach(poner);
    if (r.mision) empezarMision(r.mision);
    avisar(`hablar:${n.id}`);
  });
}

// ---------- Textos de Unity que no están en los assets ----------
const TXT = {
  jaguar: 'La luz del espíritu deja de temblar. Las grietas violetas se apagan y el jaguar se sienta, quieto, a tu lado. Por un ' +
    'instante recuerdas a quienes lo llamaban para cuidar el agua y la casa: vino a vigilar, no a odiar. Al fondo, los ' +
    'escombros que tapaban la escalera se desmoronan.',
  sello: 'Una estela de basalto, puesta como losa, tapa un pórtico en el muro. De su base salen grietas violetas, como ' +
    'raíces. Del otro lado algo respira despacio, y es la piedra misma. Empujas: la losa cede, rechinando, y se hunde en el suelo.',
  guardian: 'La Piedra Viva se detiene. Las grietas violetas se cierran como heridas que sanan, el disco de su pecho se ' +
    'vuelve verde y la figura se sienta, despacio, como si recordara cómo hacerlo. Te habla sin voz: «Guardaba la ' +
    'primera memoria de esta tierra. La sombra me hizo ver en ti a quien venía a robarla.» Por un instante ves la ' +
    'plaza llena de gente y el río cargando basalto. Luego, silencio.',
  reflejo: 'Recuerdas, a pedazos: una voz, una luz, piedras que se derrumban y la sensación de caer.\nTe asomas al agua. Quieres ' +
    'hablar y la voz no te sale. En el reflejo te mira un rostro que no es el tuyo, con el atuendo de un animal que sientes respirar contigo.',
  altar: 'Un altar-trono de basalto. En La Venta, de nichos como este sale la figura de un gobernante sentado (Altar 4). Este nicho está vacío.',
  altarMemoria: 'En el nicho del altar-trono brilla el Fragmento de la Primera Memoria. Al tocarlo, por un instante, toda la plaza recuerda lo que fue.',
  estela: 'Una estela de basalto. Si tuvo relieves, la lluvia y el tiempo los borraron.',
  estelaPartida: 'Una estela partida. Su parte superior yace en el suelo, cubierta de musgo.',
  estelaDespues: 'Una estela de basalto. Desde que el artesano lo dijo, no puedes dejar de notarlo: la piedra no está gastada como las ' +
    'rocas del camino. Está lisa, como si las marcas nunca hubieran existido.',
};

// ---------- La ciudad (OlmecaCityGenerator) ----------
// Habitantes: id, arte y puntos de su ruta (x, y del flujo).
const HABITANTES = [
  ['artesano_jade', 'Comerciante', [[13.5, 2.8], [14.6, 2.8]]], ['anciana', 'Curandera', [[12.4, 14.2], [13.6, 14.2]]],
  ['guerrero_joven', 'Guerrero', [[12.0, 8.5], [12.0, 10.0]]], ['comerciante', 'Comerciante', [[19.0, -3.2], [19.0, -1.8]]],
  ['curandera', 'Curandera', [[14.0, 8.0], [14.0, 9.4]]], ['anciano', 'Anciano', [[5.5, 0.5], [5.5, 2.0]]],
  ['sacerdote', 'Sacerdote', [[-5.2, 5.2], [-3.8, 5.2]]], ['agricultor', 'Agricultor', [[15.0, -11.0], [16.4, -11.0]]],
  ['pescador', 'Pescador', [[19.2, -6.5], [19.2, -8.0]]], ['mensajero', 'Mensajero', [[3.5, -3.0], [8.5, -3.0]]],
  ['comerciante_mujer', 'ComercianteMujer', [[14.5, -3.2], [14.5, -4.6]]],
  ['guardia', 'Guardia', [[-18.0, 3.0], [-18.0, 6.0]]], ['guardia', 'Guardia', [[-15.0, 6.0], [-15.0, 3.0]]], ['guardia', 'Guardia', [[-6.0, 1.0], [-6.0, 3.0]]],
  ['nino_1', 'Nino1', [[13.5, 6.5], [14.5, 6.5]]], ['nina_1', 'Nina1', [[15.0, 5.5], [15.0, 4.2]]], ['nino_2', 'Nino2', [[15.5, 0.6], [15.5, -0.5]]],
  ['nina_2', 'Nina2', [[12.5, 12.5], [13.6, 12.5]]], ['nino_3', 'Nino3', [[13.3, 11.2], [14.6, 11.2]]], ['nina_3', 'Nina3', [[15.0, 17.0], [16.2, 17.0]]],
  ['nino_4', 'Nino4', [[13.0, -8.0], [14.0, -8.0]]], ['nina_4', 'Nina4', [[13.5, -10.0], [13.5, -11.2]]], ['nino_5', 'Nino5', [[12.0, -12.0], [13.2, -12.0]]],
];
// Tras «Rastros en la selva», dos espíritus corrompidos marchan hacia la aldea y los guardias la defienden.
const INCURSORES = [[[-19.0, 1.5], [-8.0, 3.5]], [[-21.2, 1.1], [-10.2, 3.1]]];
const CIUDAD = { inicio: { x: 17.4, y: 22.8 }, reflejo: { x: 19.3, y: 22.6 }, figura: { x: 18.6, y: 23.6 } };
Object.assign(REGIONES.ciudad.puntos, { inicio: CIUDAD.inicio, desde_selva: REGIONES.ciudad.puntos.llegada_selva });

// Un interactuable que sigue a quien se mueve.
// Con habitante, puede tener acción de senda (js/senda.js).
const siguiendo = (a, r, texto, usar, activo, habitante) => ({ get x() { return a.x; }, get y() { return a.y; }, r, texto, usar, activo, habitante });

function poblarCiudad(P, E, O, I, T) {
  empezarMision('MP_OLM_01'); // StartQuestOnLoad
  for (const [id, arte, ruta] of HABITANTES) {
    if (id === 'guerrero_joven' && bandera('olm.guerrero_en_selva')) continue; // se adelantó a la entrada de la selva
    const n = nuevoHabitante(id, arte, ruta.map(([x, y]) => ({ x, y })));
    n.defensor = id === 'guardia';
    O.push(n);
    I.push(siguiendo(n, 1.4, 'Hablar', () => conversar(n), null, n));
  }
  // La figura espiritual flota sobre el agua más cercana a su sitio de Unity, frente a la orilla del despertar.
  const c = mundo.agua.reduce((a, b) => (Math.hypot(b.x - CIUDAD.figura.x, b.y - CIUDAD.figura.y) < Math.hypot(a.x - CIUDAD.figura.x, a.y - CIUDAD.figura.y) ? b : a));
  const m = juego.misiones.MP_OLM_01;
  const f = nuevaFigura(c.x, c.y, bandera('olm.juramento') ? 'eco' : m && (m.hecha || m.paso >= 1) ? 'presente' : 'oculta');
  O.push(f);
  I.push(siguiendo(f, 2.4, 'Escuchar', () => conversar(f), () => f.estado === 'presente' || f.estado === 'eco'));
  I.push({ ...CIUDAD.reflejo, r: 1.3, texto: 'Mirar el agua', usar: () => mensaje(TXT.reflejo, () => { avisar('examinar:reflejo'); aparecerFigura(f); }),
    activo: () => f.estado === 'oculta' || f.estado === 'eco' }); // mientras la figura está, se habla con ella
  // Altares y estelas (AddMonumentInscription).
  for (const o of mundo.objetos) {
    const altar = o.sprite.startsWith('Altar_Trono'), partida = o.sprite === 'Estela_Grande_03', estela = !partida && o.sprite.startsWith('Estela');
    if (!altar && !partida && !estela) continue;
    I.push({ x: o.x, y: o.y - 0.7, r: 1.2, texto: 'Examinar', usar() {
      const txt = altar ? (bandera('olm.anciana_recordo') ? TXT.altarMemoria : TXT.altar)
        : partida ? TXT.estelaPartida : bandera('mision.MP_OLM_02.completada') ? TXT.estelaDespues : TXT.estela;
      mensaje(txt, () => avisar(altar ? 'examinar:altar_trono' : 'examinar:estela'));
    } });
  }
  if (bandera('mision.MP_OLM_03.completada')) {
    for (const [[x, y], [mx, my]] of INCURSORES) { const e = nuevoEspiritu(x, y); e.casa = { x: mx, y: my }; E.push(e); }
  }
  for (const [x, y, texto, est] of [[14.0, 1.7, 'Fabricar', 'artesano'], [19.0, -4.3, 'Comerciar', 'comerciante'], [14.0, 6.9, 'Cocinar', 'cocina']])
    I.push({ x, y, r: 0.9, texto, usar: () => abrirMenu(est, est) });
  T.push({ ...P.salida_selva, a: 'selva', punto: 'llegada' });
}

// ---------- Piso 3: la antesala, la losa y la arena del Guardián (OlmecaDungeonGenerator) ----------
function poblarPiso3(P, E, O, I, T, santuarioMemoria) {
  empezarMision('MP_OLM_05'); // StartQuestOnLoad en la arena
  santuarioMemoria();
  // Dos espíritus jaguar en la antesala, entre la llegada y el santuario (BuildFauna).
  const a = P.llegada_arriba, s = P.memoria_llegada, entre = (k) => ({ x: a.x + (s.x - a.x) * k, y: a.y + (s.y - a.y) * k });
  for (const k of [0.35, 0.7]) { const p = entre(k); E.push(nuevoEspiritu(p.x, p.y)); }
  // La losa: una estela que tapa el pórtico, con un bloqueo a lo ancho del pasillo. Al empujarla se hunde.
  const losa = mundo.objetos.find((o) => o.sprite === 'Estela_Grande_01' && Math.hypot(o.x - P.sello.x, o.y - P.sello.y) < 0.5);
  const bloqueos = [caja(P.sello.x, P.sello.y, 3.2, 0.5), ...mundo.cajas.filter((c) => Math.abs((c[0] + c[2]) / 2 - losa.x) < 0.01 && Math.abs((c[1] + c[3]) / 2 - losa.y) < 0.01)];
  const abrir = () => { mundo.cajas = mundo.cajas.filter((c) => !bloqueos.includes(c)); mundo.objetos.splice(mundo.objetos.indexOf(losa), 1); };
  if (bandera('olm.sello_abierto')) abrir();
  else {
    mundo.cajas.push(bloqueos[0]);
    const it = { x: P.sello.x, y: P.sello.y - 0.7, r: 1.6, texto: 'Empujar la losa', usar() {
      mensaje(TXT.sello, () => { poner('olm.sello_abierto'); abrir(); I.splice(I.indexOf(it), 1); vista.temblor = 0.3; avisar('examinar:sello_guardian'); });
    } };
    I.push(it);
  }
  // El Guardián espera sentado en el centro de la arena; liberado, se queda sentado con el disco de jade.
  const g = nuevoGuardian(P.guardian.x, P.guardian.y, (g) => {
    poner('olm.guardian_liberado'); juego.jefe = null; juego.inundado = false;
    juego.marcas = juego.marcas.filter((m) => m.dueno !== g); juego.disparos = [];
    Object.assign(g, { vida: 1, muriendo: 0, estado: 'liberado', golpeable: false, embiste: 0, z: 0, x: P.guardian.x, y: P.guardian.y }); // se sienta en el centro de la arena
    mensaje(TXT.guardian, () => { avisar('vencer:guardian_piedra_viva'); entregar('REC_jefe_guardian', 'jefe.olmeca'); empezarMision('MP_OLM_06'); });
  });
  if (bandera('olm.guardian_liberado')) Object.assign(g, { estado: 'liberado', golpeable: false, vida: 1 });
  E.push(g);
  // Ofrendas: la oculta tras el basalto agrietado y la final, que aparece al liberar al Guardián y cierra la mazmorra.
  basaltoAgrietado('olm_p3', P.agrietado);
  ofrenda('p3_oculta', P.ofrenda_oculta, false);
  ofrenda('p3_final', P.ofrenda_final, false, 'olm.guardian_liberado', cerrarMazmorra);
  T.push({ ...P.subida, a: anterior('p3'), punto: 'llegada_abajo' });
}

// ---------- Contenido de cada región ----------
function poblar(id) {
  const P = REGIONES[id].puntos, E = juego.enemigos, O = juego.otros, I = juego.interactuables, T = juego.portales;
  const santuarioMemoria = () => I.push({ x: P.memoria_llegada.x, y: P.memoria_llegada.y, r: 1.4, texto: 'Recordar (guardar)', usar() {
    prog().energia = estadisticas().energia;
    // Al cerrar el mensaje se abre el Museo de la Memoria (MemoryShrine.End).
    guardar() ? mensaje('El santuario de Memoria guarda lo que has vivido. Si caes en la mazmorra, volverás aquí.', () => abrirMenu('museo', 'museo')) : mensaje('No se pudo guardar en este navegador.');
  } });
  if (id === 'ciudad') poblarCiudad(P, E, O, I, T);
  if (id === 'selva') {
    for (const k of Object.keys(juego.flags)) if (k.startsWith('incursion.')) delete juego.flags[k]; // IncursionReset
    // Los espíritus y sus fragmentos salen con «Rastros en la selva».
    if (bandera('mision.MP_OLM_03.activa') || bandera('mision.MP_OLM_03.completada')) P.claros.forEach((c, i) => {
      const n = i + 1, f = P.fragmentos[i];
      const soltarFragmento = () => {
        const frag = nuevoFragmento(f.x, f.y); O.push(frag);
        const it = { x: f.x, y: f.y, r: 1.2, texto: 'Recoger el fragmento', usar() {
          poner(`olm.selva.fragmento_${n}`); O.splice(O.indexOf(frag), 1); I.splice(I.indexOf(it), 1);
          entregar({ xp: 20, objetos: [{ id: 'fragmento_menor', n: 1 }] }, `fragmento.selva_${n}`);
          avisar('examinar:fragmento_menor');
        } };
        I.push(it);
      };
      if (!bandera(`olm.selva.espiritu_${n}`)) E.push(nuevoEspiritu(c.x, c.y, () => { poner(`olm.selva.espiritu_${n}`); avisar('vencer:espiritu_corrompido'); soltarFragmento(); }));
      else if (!bandera(`olm.selva.fragmento_${n}`)) soltarFragmento();
    });
    if (bandera('olm.guerrero_en_selva')) {
      const g = nuevoHabitante('guerrero_joven', 'Guerrero', [P.guerrero]); O.push(g);
      I.push(siguiendo(g, 1.5, 'Hablar', () => conversar(g, 'guerrero_joven_entrada'), null, g));
    }
    T.push({ ...P.mazmorra, a: 'p1', punto: 'llegada_arriba', abierto: () => bandera('mision.MP_OLM_03.completada'),
      cerrado: 'Raíces y piedras tapan la abertura entre las columnas. Aquí no hay nada que hacer todavía.' });
    T.push({ ...P.salida, a: 'ciudad', punto: 'desde_selva' });
  }
  if (id === 'p1') {
    ofrenda('p1_comun', P.ofrenda_comun, true);
    ofrenda('p1_especial', P.ofrenda_especial, false);
    basaltoAgrietado('olm_p1', P.agrietado);
    ofrenda('p1_oculta', P.ofrenda_oculta, false);
    santuarioMemoria();
    for (const p of P.enemigos) E.push(nuevoEspiritu(p.x, p.y));
    T.push({ ...P.subida, a: 'selva', punto: 'desde_mazmorra' });
    T.push({ ...P.bajada, a: siguiente('p1'), punto: 'llegada_arriba' }); // al 1-2 (js/niveles.js)
  }
  if (id === 'p2') {
    ofrenda('p2_especial', P.ofrenda_especial, false);
    basaltoAgrietado('olm_p2', P.agrietado);
    ofrenda('p2_oculta', P.ofrenda_oculta, false);
    ofrenda('p2_guardian', P.ofrenda_guardian, false, 'olm.jaguar_piedra_vencido');
    for (const p of P.enemigos) E.push(nuevoEspiritu(p.x, p.y));
    for (let i = 0; i < 2; i++) E.push(nuevoEco(P.ecos, i * 3));
    const vida = mundo.objetos.find((o) => o.sprite.startsWith('Santuario_Vida'));
    if (bandera('incursion.vida_p2') && vida) vida.sprite = 'Santuario_Vida_02';
    I.push({ x: P.vida.x, y: P.vida.y, r: 1.4, texto: 'Santuario de Vida', usar() {
      if (bandera('incursion.vida_p2')) return mensaje('El santuario está apagado. Volverá a encenderse cuando salgas a la selva.');
      const j = juego.jugador, cura = Math.min(j.max - j.vida, Math.round(j.max / 2)); // LifeShrine: la mitad de la vida, una vez por incursión
      j.vida += cura; poner('incursion.vida_p2'); if (vida) vida.sprite = 'Santuario_Vida_02';
      numero(j.x, j.y, `+${cura}`, '#7fe0b0'); sonar('cura'); mensaje('El agua del santuario te devuelve fuerzas.');
    } });
    if (!bandera('olm.jaguar_piedra_vencido')) {
      E.push(nuevoJaguar(P.jaguar.x, P.jaguar.y, (e) => {
        poner('olm.jaguar_piedra_vencido'); juego.jefe = null;
        Object.assign(e, { vida: 1, muriendo: 0, estado: 'liberado', golpeable: false, z: 0 });
        mensaje(TXT.jaguar, () => avisar('vencer:jaguar_piedra'));
      }));
    }
    T.push({ ...P.subida, a: anterior('p2'), punto: 'llegada_abajo' });
    T.push({ ...P.bajada, a: siguiente('p2'), punto: 'llegada_arriba', abierto: () => bandera('olm.jaguar_piedra_vencido'),
      cerrado: 'Unos escombros tapan la escalera. Algo en esta sala los sostiene.' });
  }
  if (id === 'p3') poblarPiso3(P, E, O, I, T, santuarioMemoria);
  if (esGenerado(id)) poblarNivel(id, P, E, I, T);
  poblarTrampas(id); // antes que la fauna, para que no aparezca dentro de un brasero
  poblarFauna(id, P);
}
const LLEGAR = { selva: 'llegar:selva', p1: 'llegar:mazmorra_piso1', p2: 'llegar:mazmorra_piso2', p3: 'llegar:mazmorra_piso3' };

// ---------- Viaje entre regiones ----------
async function cargarRegion(id, punto, vida) {
  juego.viajando = true; sonar('portal');
  $('fundido').style.opacity = 1;
  await new Promise((ok) => setTimeout(ok, 260));
  if (esGenerado(id)) REGIONES[id] = generarNivel(id); // js/niveles.js
  mundo = construirMundo(id);
  Object.assign(juego, { region: id, enemigos: [], otros: [], interactuables: [], portales: [], disparos: [], marcas: [], efectos: [], jefe: null, dialogo: null, inundado: false, ruptura: null, fijado: null, inclina: { x: 0, y: 0 } });
  const p = REGIONES[id].puntos[punto];
  juego.jugador = nuevoJugador(p.x, p.y, vida);
  juego.jugador.z = alturaEn(p.x, p.y);
  Object.assign(juego, { rompibles: [], alAparecer: [] });
  mostrarDialogo();
  poblar(id);
  ambiente(id);
  if (LLEGAR[id]) avisar(LLEGAR[id]);
  if (nombreNivel(id)) toast(`Nivel ${nombreNivel(id)}`);
  juego.enemigos.forEach((e, i) => { e.clave = `${id}:${e.tipo}:${i}`; }); // para no dar lo mismo cada vez que reaparece
  if (/^p\d$/.test(id)) entregar(`REC_descubrir_piso${id[1]}`, `descubrir.mazmorra_piso${id[1]}`);
  for (const t of juego.portales) t.armado = false; // no se activa hasta salir de él (se aparece cerca)
  const pre = [`Guerrero_${guardianActual().nombre}_`, 'Enemigo_', 'Vasija_Rompible_', 'Trampa_Pinchos_', 'Placa_Presion_', 'Brasero_Piedra_', 'Cristal_Memoria_', 'Estera_Tejida_', 'Cabeza_Piedra_', id === 'ciudad' ? 'Npc_' : 'Npc_Guerrero_', ...(id === 'p3' ? ['Guardian_Piedra_'] : []), 'Jefe_', ...(id === 'n1_5' ? ['Nauyaca_'] : []), ...(esGenerado(id) ? ['Pecari_', 'Tapir_', 'Ocelote_', 'Aullador_', 'Armadillo_'] : [])];
  await precargar([...nombresDeRegion(), ...Object.keys(SPRITES).filter((n) => pre.some((p) => n.startsWith(p))), 'Fragmento_Memoria_01', 'Santuario_Vida_02', 'Ofrenda_01', 'Ofrenda_02', 'Ofrenda_03', 'Ofrenda_04', 'Basalto_Agrietado_01']);
  $('fundido').style.opacity = 0;
  juego.viajando = false;
}

// ---------- Diálogo y avisos ----------
function hablar(quien, lineas, alFin) { sonar('dialogo'); juego.dialogo = { quien, lineas, i: 0, letras: 0, alFin }; mostrarDialogo(); }
const mensaje = (txt, alFin) => hablar('', [txt], alFin);
function mostrarDialogo() { $('dialogo').classList.toggle('oculto', !juego.dialogo); }
function avanzarDialogo() {
  const d = juego.dialogo, linea = d.lineas[d.i];
  if (d.letras < linea.length) { d.letras = linea.length; return; } // primero completa la línea
  if (++d.i < d.lineas.length) { d.letras = 0; return; }
  juego.dialogo = null; mostrarDialogo(); delete entrada.pedidos.atacar; d.alFin?.();
}
$('dialogo').addEventListener('pointerdown', (e) => { e.preventDefault(); if (juego.dialogo) avanzarDialogo(); });
let toastT = 0;
function toast(txt, seg = 2.6) { $('toast').textContent = txt; $('toast').classList.remove('oculto'); toastT = seg; }

entrada.alPulsar = (acc) => {
  if (acc === 'pausa' && opcionesAbiertas()) return cerrarOpciones();
  if (!juego.activo) return;
  if (acc === 'pausa') return alternarPausa();
  if (juego.pausa || juego.viajando) return;
  if (juego.menuAbierto) { if (acc === 'bolsa') cerrarMenu(); return; }
  if (acc === 'bolsa' && !juego.dialogo) return abrirMenu();
  if (acc === 'tierra') return golpeDeTierra();
  if (acc === 'fijar') return alternarFijar();
  if (acc === 'especial') return; // la recoge el jugador con consumir()
  if (acc === 'rapido') return usoRapido();
  if (juego.dialogo && (acc === 'usar' || acc === 'atacar')) { delete entrada.pedidos[acc]; avanzarDialogo(); return; }
  if (acc === 'usar') { delete entrada.pedidos.usar; pulsarUsar(cercano()); }
};
function cercano() {
  const j = juego.jugador;
  return juego.interactuables.filter((i) => dist(i, j) < i.r && (!i.activo || i.activo())).sort((a, b) => dist(a, j) - dist(b, j))[0];
}

// ---------- Pausa y menús ----------
const esTactil = () => document.body.classList.contains('es-tactil');
function alternarPausa() {
  juego.pausa = !juego.pausa;
  $('pausa').classList.toggle('oculto', !juego.pausa);
  $('pausaAyuda').textContent = esTactil() ? 'Joystick: mover · Espada: atacar (junto a algo, la mano: usar; mantener: acción de senda) · Escudo (mantener): defender · Flechas: esquivar · Flecha arriba: saltar · Montaña: tierra · Estrella: especial · Bolsa' : 'WASD o flechas: mover · J o clic: atacar · Q o clic derecho (mantener): defender · Espacio: esquivar · K: saltar · E: usar · Tab: fijar objetivo · C: tierra · F: especial (Balam) · 1: uso rápido · I: bolsa · Esc: pausa';
  if (juego.pausa) $('reanudar').focus();
}
document.addEventListener('visibilitychange', () => { if (document.hidden && juego.activo && !juego.pausa) alternarPausa(); });
// Al poner el celular en vertical sale el aviso de girarlo y el juego se pausa.
matchMedia('(orientation: portrait)').addEventListener('change', (m) => { if (m.matches && esTactil() && juego.activo && !juego.pausa) alternarPausa(); });
$('reanudar').onclick = alternarPausa;
$('salir').onclick = () => { juego.activo = false; juego.pausa = false; $('pausa').classList.add('oculto'); mostrarInicio(); };

const UI_JUEGO = ['hud', 'stick', 'bAtacar', 'bEsquivar', 'bPausa', 'bBolsa', 'bDefender', 'bSaltar'];
function mostrarInicio() {
  for (const id of UI_JUEGO.concat('jefe', 'aviso', 'dialogo', 'toast', 'ruptura')) $(id).classList.add('oculto');
  $('continuar').classList.toggle('oculto', !leerPartida());
  $('inicio').classList.remove('oculto'); ambiente(null);
  ($('continuar').classList.contains('oculto') ? $('nueva') : $('continuar')).focus();
}
async function empezar(partida) {
  $('inicio').classList.add('oculto');
  juego.prueba = false;
  juego.flags = partida ? { ...partida.flags } : {};
  juego.misiones = partida ? structuredClone(partida.misiones) : {};
  juego.ordenMisiones = partida ? [...partida.ordenMisiones] : [];
  juego.prog = partida ? structuredClone(partida.prog) : nuevoProgreso(await elegirGuardian());
  ponerCodiceAlCargar();
  for (const id of UI_JUEGO) $(id).classList.remove('oculto');
  juego.activo = true;
  await cargarRegion(partida ? partida.region : 'ciudad', partida ? 'memoria_llegada' : 'inicio', partida ? partida.vida : estadisticas().vida);
  if (!partida) toast(esTactil() ? 'Joystick para moverte · Espada: atacar o usar · Flechas: esquivar' : 'WASD: mover · J: atacar · Espacio: esquivar · K: saltar · E: usar', 5);
}
$('nueva').onclick = () => { if (!leerPartida() || confirm('¿Empezar de nuevo? Se borrará la partida guardada.')) { try { localStorage.removeItem(CLAVE); } catch { /* sin almacenamiento */ } empezar(null); } };
$('continuar').onclick = () => empezar(leerPartida());

// ---------- Bucle ----------
function actualizar(dt) {
  const j = juego.jugador;
  juego.t += dt;
  j.actualizar(j, dt);
  for (const o of juego.otros) o.actualizar(o, dt);
  if (!juego.dialogo) for (const e of juego.enemigos) if (e.vida > 0) e.actualizar(e, dt);
  rastroEnemigos(dt); // polvo y estela (js/efectos.js)
  revisarNivel();
  for (const e of juego.enemigos) {
    if (e.vida > 0) recuperarRuptura(e, dt);
    else if (e.muriendo > 0) e.muriendo -= dt;
    else if (e.reaparece > 0 && (e.reaparece -= dt) <= 0) revivirFauna(e);
  }
  juego.enemigos = juego.enemigos.filter((e) => e.vida > 0 || e.muriendo > 0 || e.estado === 'liberado' || e.reaparece > 0);
  if (juego.jefe && juego.jefe.vida <= 0) juego.jefe = null;
  if (juego.fijado && !fijadoValido()) juego.fijado = null; // vencido o a más de 12 m

  for (const s of juego.disparos) {
    s.x += s.vx * dt; s.y += s.vy * dt; s.t -= dt;
    if (Math.hypot(s.x - j.x, s.y - j.y) < 0.45 && herirJugador(s.golpe, s)) { s.t = 0; s.alAcertar?.(); }
  }
  juego.disparos = juego.disparos.filter((s) => s.t > 0);
  actualizarTrampas(dt);
  for (const m of juego.marcas) if ((m.t -= dt) <= 0) { sonar('impacto'); m.alFin?.(m); }
  juego.marcas = juego.marcas.filter((m) => m.t > 0);
  for (const f of juego.efectos) f.t -= dt;
  juego.efectos = juego.efectos.filter((f) => f.t > 0);

  // Portales: se cruzan al pisarlos, tras haber salido de ellos una vez.
  for (const t of juego.portales) {
    const dentro = dist(t, j) < 0.6;
    if (!dentro) { t.armado = true; t.avisado = false; continue; }
    if (!t.armado || juego.dialogo) continue;
    if (t.a && (!t.abierto || t.abierto())) { cargarRegion(t.a, t.punto, j.vida); return; }
    if (!t.avisado) { t.avisado = true; mensaje(t.cerrado); }
  }

  // Derrota: en la mazmorra, con punto de control, se vuelve al santuario (DefeatReturn); si no, se reaparece en el sitio.
  if (j.vida <= 0 && j.muerto <= 0) {
    const p = leerPartida();
    if (juego.region !== 'selva' && p && !juego.prueba) { juego.flags = { ...p.flags, ...juego.flags }; poner('incursion.caido'); cargarRegion(p.region, 'memoria_llegada', estadisticas().vida); }
    else { j.vida = j.max; j.inv = 2; toast('Te levantas de nuevo.'); }
  }
}

function dibujarTodo() {
  const j = juego.jugador;
  // Con un objetivo fijado el encuadre se inclina hacia él, con tope y suavizado (IsometricCameraFollow).
  const f = fijadoValido() ? juego.fijado : null, q = juego.inclina;
  let ix = f ? (f.x - j.x) * FIJAR.inclina : 0, iy = f ? (f.y - j.y) * FIJAR.inclina : 0;
  const il = Math.hypot(ix, iy); if (il > FIJAR.maxInclina) { ix *= FIJAR.maxInclina / il; iy *= FIJAR.maxInclina / il; }
  q.x += (ix - q.x) * 0.08; q.y += (iy - q.y) * 0.08;
  camara(j.x + q.x, j.y + q.y, 1 / 60);
  dibujarSuelo(juego.t);
  for (const t of juego.portales) {
    const abierto = t.a && (!t.abierto || t.abierto());
    elipse(t.x, t.y, 0.6 + Math.sin(juego.t * 3) * 0.05, abierto ? 'rgba(224,162,58,.22)' : 'rgba(120,120,120,.15)', abierto ? '#e0a23a88' : '#8886');
  }
  for (const m of juego.marcas) {
    const p = 1 - m.t / m.dur;
    if (m.forma === 'anillo') anillo(m.x, m.y, m.r, `rgba(155,107,214,${0.15 + 0.3 * p})`);
    else if (m.forma === 'franja') franja(m, `rgba(212,80,62,${0.15 + 0.3 * p})`);
    else { elipse(m.x, m.y, m.r, 'rgba(212,80,62,.18)', '#ff8a7a'); elipse(m.x, m.y, m.r * p, 'rgba(212,80,62,.35)'); }
  }
  dibujarSueloTrampas();
  // Todo lo que tiene altura se ordena por profundidad: lo más lejano a la cámara, antes.
  // Los techos de las enramadas se adelantan con el jugador debajo (RoofOverhead).
  for (const o of mundo.objetos) if (o.techo) o.ordenAhora = Math.abs(j.x - o.x) < o.techo[0] && Math.abs(j.y - o.y) < o.techo[1] ? -Infinity : o.orden;
  const clave = (o) => o.ordenAhora ?? o.orden ?? profundidad(o.y, o.z || 0);
  const capa = mundo.objetos.concat(juego.otros, juego.enemigos, [j]).sort((a, b) => clave(b) - clave(a));
  for (const o of capa) { if (o.estela) dibujarEstela(o); o.dibujar(o); }
  dibujarMira();
  dibujarAnilloSenda();
  for (const s of juego.disparos) elipse(s.x, s.y, s.color ? 0.18 : 0.14, s.color || '#c9a8ff', '#fff', s.z || 0.9);
  for (const f of juego.efectos) {
    if (f.tipo === 'tierra') elipse(f.x, f.y, TIERRA.radio * (1.2 - f.t), `rgba(224,162,58,${f.t * 1.5})`, '#e0a23a');
    if (f.tipo === 'num') dibujarNumero(f); // js/efectos.js
    if (f.tipo === 'tajo') elipse(f.x, f.y, ATAQUE.radio * (f.remate ? 1.15 : 1), `rgba(255,240,200,${f.t * 3})`, null, 0.5);
    if (f.tipo === 'destello') elipse(f.x, f.y, 0.8 * (1 - f.t / 0.3), null, '#c9a8ff');
    dibujarEfecto(f); // los de js/efectos.js
  }
}

function hud(dtReal) {
  const j = juego.jugador;
  $('vidaBar').style.width = `${(100 * j.vida) / j.max}%`;
  const p = prog(), s = estadisticas();
  const g = guardianActual(), ico = `arte/Iconos/ICO_marca_${g.id}.png`, img = $('retratoImg');
  if (img.dataset.ico !== ico) { img.dataset.ico = ico; img.src = ico; img.alt = g.nombre; }
  $('nvTxt').textContent = `Nv ${p.nivel}`;
  $('vidaTxt').textContent = `${j.vida}/${j.max}`;
  $('enerTxt').textContent = `${Math.floor(p.energia)}/${s.energia}`;
  $('panel').classList.toggle('baja', j.vida > 0 && j.vida <= j.max * 0.3);
  $('energiaBar').style.width = `${(100 * p.energia) / s.energia}%`;
  $('xpBar').style.width = `${(100 * p.xp) / xpParaSubir(p.nivel)}%`;
  $('bTierra').classList.toggle('oculto', p.principal !== 'tierra');
  $('bTierra').classList.toggle('apagado', juego.esperaTierra > 0 || p.energia < (BENDICIONES.tierra?.coste || 0));
  $('bEspecial').classList.toggle('oculto', !especialDe());
  $('bEspecial').classList.toggle('apagado', juego.esperaEspecial > 0 || p.energia < (especialDe()?.coste || 0));
  $('bTierra').dataset.espera = juego.esperaTierra > 0 ? juego.esperaTierra.toFixed(1) : '';
  const nivel = nombreNivel(juego.region), quedan = esGenerado(juego.region) ? vivos().length : 0;
  $('esqTxt').textContent = '◆'.repeat(j.cargas) + '◇'.repeat(MOV.cargas - j.cargas);
  $('zona').classList.toggle('oculto', !nivel);
  if (nivel) $('zona').textContent = `Nivel ${nivel}${quedan ? ` · quedan ${quedan}` : ''}`;
  $('objetivo').textContent = objetivo();
  $('jefe').classList.toggle('oculto', !juego.jefe);
  if (juego.jefe) { $("jefeNombre").textContent = juego.jefe.nombre + (juego.jefe.fase > 1 ? ` · fase ${juego.jefe.fase}` : ""); $('jefeBar').style.width = `${(100 * juego.jefe.vida) / juego.jefe.max}%`; }
  // Panel de Ruptura (BreakReadout): el último enemigo golpeado, 4 s sin golpearlo o hasta que cae.
  const r = juego.ruptura;
  if (r && (((r.t -= dtReal) <= 0 && r.e !== juego.fijado) || r.e.vida <= 0 || !juego.enemigos.includes(r.e))) juego.ruptura = null; // fijado, no caduca
  $('ruptura').classList.toggle('oculto', !juego.ruptura);
  if (juego.ruptura) {
    const e = r.e, R = rupturaDe(e), lleno = e.roto > 0 ? 0 : escudoDe(e);
    $('rNombre').textContent = e.nombre || R.nombre;
    $('rRombos').textContent = '◆'.repeat(lleno) + '◇'.repeat(R.escudo - lleno);
    $('rDebil').innerHTML = R.debil.map((a) => `<span class="af-${a.toLowerCase()}">${a}</span>`).join('');
    $('rRota').classList.toggle('oculto', !(e.roto > 0));
  }
  const c = !juego.dialogo && cercano();
  const senda = c ? avisoSenda(c) : '';
  $('aviso').classList.toggle('oculto', !c || (esTactil() && !senda)); // en táctil, solo si hay que avisar de la senda
  if (c) $('aviso').textContent = esTactil() ? `${c.texto}${senda}` : `E · ${c.texto}${senda}`;
  // Atacar es Usar junto a algo si no hay un enemigo a menos de 3 m, y Seguir en un diálogo (pedir() ya lo hace avanzar).
  const usar = !!c && !juego.enemigos.some((e) => e.vida > 0 && dist(e, juego.jugador) < 3), bA = $('bAtacar');
  bA.dataset.modo = usar ? 'usar' : ''; bA.classList.toggle('usar', usar); bA.classList.toggle('seguir', !!juego.dialogo); document.body.classList.toggle('en-dialogo', !!juego.dialogo);
  if (juego.dialogo) {
    const d = juego.dialogo, linea = d.lineas[d.i];
    d.letras = Math.min(linea.length, d.letras + dtReal * 60); // letra a letra, como MessageBox
    $('dQuien').textContent = d.quien; $('dQuien').classList.toggle('oculto', !d.quien);
    $('dTexto').textContent = linea.slice(0, Math.floor(d.letras));
  }
  if (toastT > 0 && (toastT -= dtReal) <= 0) $('toast').classList.add('oculto');
}

let ultimo = performance.now();
function bucle(ahora) {
  const dtReal = Math.min(0.05, (ahora - ultimo) / 1000); entrada.cuadroPrevio = ultimo; ultimo = ahora;
  if (juego.activo && juego.jugador && !juego.viajando) {
    if (!juego.pausa && !juego.menuAbierto) {
      juego.esperaTierra = Math.max(0, juego.esperaTierra - dtReal);
      juego.esperaEspecial = Math.max(0, (juego.esperaEspecial || 0) - dtReal);
      if (juego.defensaExtra && (juego.defensaExtra.t -= dtReal) <= 0) juego.defensaExtra = null;
      for (const f of juego.alAparecer) f();
      actualizarSenda(dtReal);
      // Toda ralentización pasa por aquí (TimeDilation): pausa al acertar a 0,05 y esquiva perfecta a 0,35; nunca 0.
      let escala = 1;
      if (juego.pausaGolpe > 0) { juego.pausaGolpe -= dtReal; escala = 0.05; }
      else if (juego.lento > 0) { juego.lento -= dtReal; escala = MOV.lentoEscala; }
      actualizar(dtReal * escala);
    }
    if (juego.jugador) { dibujarTodo(); hud(dtReal); }
  }
  requestAnimationFrame(bucle);
}
mostrarInicio();
requestAnimationFrame(bucle);
