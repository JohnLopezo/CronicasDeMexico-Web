# Crónicas de México: versión HTML

La versión del juego en HTML y JavaScript normal, sin frameworks ni dependencias, para ir haciéndola crecer por etapas.
Usa **el mismo arte y los mismos mapas** que el proyecto de Unity (`C:\Users\Usuario\Documents\CronicasDeMexico`) y sus
mismos números (escala ×10).

- Esta carpeta está **fuera del repositorio de Unity** y tiene su propio repositorio de Git (rama `main`).
- El proyecto de Unity no se modifica: de él solo se **leen** el arte y los mapas.

## Cómo abrirlo

- **En la PC:** doble clic en `index.html`. No necesita servidor ni internet.
- **En el celular:** `node servir-en-red.mjs` en esta carpeta y abrir en Chrome del celular la dirección que imprime,
  por ejemplo `http://192.168.10.29:8080/`.
  - Si no carga, acepta el aviso del Firewall de Windows para Node.js en redes privadas.
  - Juega en horizontal.
  - Ciérralo con `Ctrl + C`.
- **Para probar un nivel sin jugar hasta él:** añade `?nivel=n2_2` (o cualquier `nX_Y` generado) a la dirección. «Nueva
  partida» pasa a «Probar nivel 2-2»: empiezas allí a nivel 3 con 2 semillas; en el piso 2, con charca y pejelagarto. No se
  guarda nada y al caer te levantas en el sitio (`js/niveles.js`, al final).
- **Si cambia el arte o un mapa en Unity:** `node sincronizar.mjs`.
  - Copia los PNG a `arte/`.
  - Genera `datos/sprites.js` (ruta, pivote y píxeles por metro de cada sprite, leídos de sus `.meta`).
  - Genera `datos/regiones.js` (los JSON de `Data/World/Olmeca`).
  - Genera `datos/recompensas.js`: objetos (`OBJ_`), tablas de botín (`BOT_`), paquetes (`REC_`), Bendiciones (`BEN_`), recetas (`RCT_`), ofertas (`OFE_`), `ConfigProgresion` y los siete Guardianes (`GUA_`, en el orden de `CatalogoGuardianes`). También copia los iconos de `Art/UI/Iconos`.
  - Añade a `datos/recompensas.js` la fauna (`Data/Enemies/ED_*`), el Museo (`CatalogoMuseo` → `CUL_`), el Códice (`CatalogoCodice`) y las acciones de senda (`AccionesSenda`).
  - Genera `datos/narrativa.js`: diálogos (`DLG_`), misiones (`MIS_`) y nombres (`NPC_`) de `Data/Narrative/Olmeca`. Lo que edites en el Inspector de Unity llega aquí al sincronizar.
  - Avisa si un mapa usa un sprite que falta.

## Archivos

| Archivo | Qué hace |
|---|---|
| `index.html` | Página, estilos, HUD, menús y controles táctiles |
| `js/motor.js` | Proyección de la cámara, dibujo de sprites y entrada (teclado, ratón y táctil) |
| `js/mundo.js` | Arma cada región desde su JSON: suelo, agua, objetos, colisiones, alturas (montículo, rampas y muelle) y orden de dibujo |
| `js/recompensas.js` | Progresión, bolsa, entregas únicas, botín, ofrendas, basalto agrietado, golpe de tierra, nota, elección de Bendición, servicios y menú |
| `js/guardian.js` | Guardián de la Piedra Viva: fases, ataques y avisos |
| `js/fauna.js` | Fauna hostil (`WildEnemy`) y vasijas rompibles |
| `js/trampas.js` | Pinchos, placas de presión, braseros, cristales, esteras y cabezas de piedra |
| `js/efectos.js` | Chispas, estrella de impacto, «!» de aviso, polvo y estela de los enemigos rápidos |
| `js/cuadros.js` | Cuadros de ataque por partes de la fauna de la lámina (`PARTES`) |
| `js/movimiento.js` | Movimiento por código (respirar, botar, aletear, anticipar, estocada…) de los enemigos de un solo cuadro |
| `js/animales.js` | Animales de Veracruz y Tabasco: nauyaca real, pecarí de collar, tapir, ocelote, mono aullador, armadillo y pejelagarto |
| `herramientas/animales.mjs` | Dibuja por código los animales y sus animaciones (`arte/Animales`, `datos/animales.js`) |
| `js/niveles.js` | Niveles de la mazmorra (1-1 a 3-5) y salas generadas |
| `PORTAR_A_UNITY.md` | Qué falta en Unity de lo hecho aquí, con valores y clases |
| `js/senda.js` | Acciones de senda: mantener Usar junto a un habitante |
| `js/sonido.js` | Efectos y ambiente sintetizados, y la pantalla de Opciones |
| `js/musica.js` | Música prehispánica sintetizada: explorar y pelear (etapa 34) |
| `js/actores.js` | Jugador, espíritus, ecos, Espíritu del Jaguar, habitantes, guardias, figura espiritual y fragmentos |
| `js/juego.js` | Banderas, misiones, diálogos por ramas, contenido de cada región, guardado, HUD y bucle |
| `sincronizar.mjs` | Copia arte y mapas desde Unity |
| `servir-en-red.mjs` | Servidor para el celular. Solo entrega `index.html`, `js/`, `datos/` y `arte/` |

## Etapa 54 (2026-11-20): el barrio de Teotihuacan y la ropa de cada cultura (`js/barrio_teo.js`)

Lo pidió el usuario: la gente de los barrios, con **ropa distinta según la cultura**.

- **El barrio:** al este de la plaza de la Pirámide del Sol, por un camino de tierra. Es un patio de estuco entre conjuntos
  de departamentos (talud de tezontle, muro encalado, tablero rojo pintado y techo plano), con un altar en talud-tablero al
  centro, un taller de obsidiana (petate con núcleos y navajas negras y verdes), fogón, vasijas y cestos.
- **Ropa del altiplano** (`pintarMaya` de `js/aldea_maya.js`, ampliado): tilma anudada al hombro, quechquemitl (la capa
  triangular de las mujeres), tocado ancho de plumas, orejeras, peinado de dos mechones, y lo que carga cada uno (fardo con
  mecapal, núcleo de obsidiana, vasija anaranjada, bastón). Las prendas mayas no cambian.
- **Siete habitantes:** el comerciante (tilma, tocado ancho y fardo), el tallador de obsidiana, la alfarera (quechquemitl),
  una niña y un niño teotihuacanos; y gente de otras culturas con su propia ropa: el **viajero zapoteco** del barrio
  oaxaqueño (capa azul, tocado alto con máscara, como el de las urnas) y la **mercadera maya** (huipil y enredo de Lakamha').
- **Misiones:** hablar con el comerciante cumple **MP_TEO_01** y empieza **MP_TEO_02 «Los caminos olvidados»**: preguntar por su
  camino al tallador (el norte de la obsidiana), al zapoteco (el sur, Oaxaca) y a la mercadera (el cacao), y volver con el
  comerciante. Al final recuerda la **cueva bajo la Pirámide del Sol** (`teo.camino_cueva`), la entrada a la mazmorra.
- `rama` admite `aviso` (`conversar` lo emite además de `hablar:id`): así varias personas cuentan para el mismo paso, una vez cada una.
- Cocinar (fogón de la alfarera) y Comerciar (mercadera). Al caer en el barrio, al santuario de Teotihuacan.
- **Fidelidad** (cabecera de `js/barrio_teo.js`): D, los conjuntos de departamentos con patio y altar, el barrio zapoteco de
  Tlailotlacan y el «Barrio de los Comerciantes», los talleres de obsidiana verde, la cerámica anaranjado delgado, y en
  figurillas y murales los tocados anchos, orejeras, quechquemitl, tilma y mecapal; I, colores y cortes, la ropa de diario
  del zapoteco y los peinados; F, las personas y sus palabras.

Prueba: `herramientas/dificultad/etapa54.mjs` (12 comprobaciones: salida y minimapa, llegada, siete habitantes, las dos
misiones, sin contar dos veces al mismo informante, servicios y caída) y la hoja `54_habitantes.png`. Las etapas 53, 44 y 43
siguen enteras; sin `[assert]`.

## Etapa 53 (2026-11-20): de Palenque a Teotihuacan, inicio del capítulo III (`js/teotihuacan.js`)

Capítulo III de `Docs/Historia_Mundo.md` §6 de Unity, **«Las ciudades y los pueblos del altiplano»**. El usuario eligió
**Teotihuacan** para empezar y este plan para el capítulo: **un dios por cultura**, cada uno da una habilidad (Fuego:
Huehueteotl, Teotihuacan; Luz: Cocijo, Monte Albán; Viento: la Serpiente Emplumada, Xochicalco); el jefe es la memoria del
dios corrompida por la Sombra, que se libera al vencerla, y **la habilidad activa cambia según el día o la hora** (por definir).

- **Cierre del capítulo II → portal:** al cerrar MP_MAY_04 en el tablero, la pantalla de fin ya no dice «próximamente»: se
  abre un portal en la plaza de Palenque (16,5; 3,5), que sale siempre que esté `may.registros_recuperados` (también en
  partidas viejas). Tarjeta «Capítulo III · Las ciudades y los pueblos del altiplano».
- **Teotihuacan:** región pintada por código (piso 5 en `ESTILO` y `PALETA`, `losaTeo`). Claro de llegada con santuario de
  Memoria y portal de vuelta a Lakamha', sendero de tierra ocre, la **Calzada de los Muertos** de sur a norte (estuco claro
  agrietado, bordillo rojo y caras en talud-tablero), la plaza al pie de la **Pirámide del Sol** (5 cuerpos en talud) con un
  **mural** (figura de perfil con volutas de la palabra; la mitad, borrada) y la **Pirámide de la Luna** al final de la
  calzada. Magueyes y nopales pintados. Fauna: serpiente, armadillo y dos espíritus en la calzada.
- **Misión MP_TEO_01 «La ciudad de los dioses»:** examinar el mural (el minimapa lo señala, también desde Palenque y la
  aldea); el paso siguiente, «Busca a la gente de los barrios (próximamente)», espera a la próxima etapa.
- Al caer en Teotihuacan despiertas en su santuario; ahí también se guarda.
- **Fidelidad** (cabecera de `js/teotihuacan.js`): D, el nombre náhuatl posterior (el original no se conoce), la calzada
  sur-norte que acaba en la Luna, el Sol al este, el talud-tablero, el estuco rojo, los murales con volutas de la palabra,
  maguey, nopal y la fauna; I, la composición y la escala; F, el portal, la voz y el mural borrado.

Prueba: `herramientas/dificultad/etapa53.mjs` (15 comprobaciones: sin portal antes del cierre, fin del capítulo II,
tarjeta, llegada, misión, minimapa, mural, guardado, caída al santuario de Teotihuacan y vuelta a Palenque), con capturas.
`etapa43.mjs` sigue entera; sin `[assert]`.

## Etapa 52 (2026-11-20): pulido (respiro al despertar y jefes mayas medidos)

- **Al caer, 2 s sin recibir daño** (`despertar` en `actualizar`, `js/juego.js`): el tucán de la plaza de Palenque se lanzaba
  sobre el jugador ~1 s después de despertar junto al santuario (−8 de vida y un empujón). Era el fallo de `etapa43.mjs`
  «al caer, al santuario de Palenque»; ahora pasa entera. Vale para los tres despertares (Palenque, piso 3, aldea).
- **`jefes.mjs`** busca al jefe por `jefe: true` (el cocodrilo y el murciélago son `tipo: 'fauna'`) y borra las banderas mayas
  entre peleas. Uso: `JEFES='[["fauna","m1_4",5,0.7],["fauna","m2_4",6,0.7],["guardian","m3_4",7,0.7]]' N=4`.
- **Medición** (arma inicial, llega al 70 %, 4 peleas por fila; los niveles 5-7 son una suposición del avance):

| Jefe | habilidad 0,65 | habilidad 0,85 |
|---|---|---|
| Cocodrilo de pantano (1-4, nv 5) | gana 4/4 · 16 s · −12 | gana 4/4 · 16 s · −3 |
| Murciélago de la muerte (2-4, nv 6) | gana 4/4 · 20 s · −28 | gana 4/4 · 21 s · −9 |
| Guardián de los Ciclos (3-4, nv 7) | gana 2/4 · 38 s · −44 | gana 3/4 · 40 s · −28 |

  Como en el capítulo I: sub-jefes cómodos y el Guardián, la pelea dura. No se cambió ningún valor. La Corriente no se midió.

## Etapa 51 (2026-11-19): la habilidad de agua y el cierre del capítulo II (`js/agua.js`)

Lo que pide la biblia (Historia_Mundo, cap. II, Recompensa): el guardián liberado concede una habilidad de agua que supera
obstáculos y abre rutas; el fragmento muestra que la Sombra afecta tierras lejanas.

- **Bendición del Agua: la Corriente** (tecla **V**, botón táctil **Agua** con una gota, a la izquierda de Esquivar). La concede
  el Guardián de los Ciclos al liberarse (`may.bendicion_agua`), sin quitar la de la Tierra (no ocupa ranura). Chorro de 5 m
  hacia donde miras (1,2 m de ancho): 1,5 × ataque con afinidad Agua, empuja a los que no son jefes, te cura 6. Cuesta 30 de
  energía y espera 5 s (`CORRIENTE`). Sale en la pestaña Bendiciones y en el Museo.
- **Lodo seco** (`lodoSeco`, como el basalto agrietado): solo lo deshace la corriente (el golpe de tierra ya no rompe lo que es
  `agua: true`). En la plaza de Palenque (esquina sureste, `LODO_PALENQUE`) tapa una ofrenda: 60 de experiencia, 2 jades y 2
  cacaos (`REC_ofrenda_may_lodo`).
- **Cierre del capítulo II, misión MP_MAY_04 «Lo que guardaba el agua»** (empieza al vencer al Guardián, que también da el
  **Fragmento de la Segunda Memoria**): contárselo al escriba, que te manda al tablero de la plaza; al poner allí el fragmento,
  la columna lisa recupera sus glifos y la luz muestra ciudades del altiplano que también se borran (`cierreCapituloII`).
  Banderas `may.registros_recuperados` (la tejedora ya tenía su línea) y `registro.cultura.maya` (entrada «La memoria maya» en
  el Museo, con el Guardián). Pantalla «Fin del capítulo II» con el capítulo III «próximamente».
- El minimapa se oculta mientras hay un menú o una capa abierta (antes tapaba la pantalla del capítulo).

Prueba: `herramientas/dificultad/etapa51.mjs` (14 comprobaciones: botón oculto sin la bendición, premio del Guardián, la corriente
hiere al de delante y no al de atrás, gasta y cura, espera, la tierra no rompe el lodo y el agua sí, ofrenda, mapa, escriba,
tablero, fin del capítulo y la bendición en la bolsa). `etapa50.mjs`, `etapa47.mjs`, `etapa44.mjs` y `recorrido.mjs` bien.
**Ya fallaba antes de esta etapa** (comprobado sin los cambios): `etapa43.mjs`, «al caer, al santuario de Palenque» (el jugador
no queda a menos de 0,5 m del santuario tras 2,5 s); sin investigar.

## Etapa 50 (2026-11-19): mazmorra maya, piso 3 «el observatorio» y el Guardián de los Ciclos (`js/mazmorra_maya.js`, `js/niveles.js`, `js/pisos.js`)

- **La bajada del 2-4 se abre:** tras el murciélago se sube al 3-1 (`m3_1`…`m3_4`, clave 13), y la misión **MP_MAY_03** avanza
  («sube hacia el observatorio», «vence al Guardián de los Ciclos»). Al vencerlo, la misión queda **cumplida**.
- **Piso 3, el observatorio** (`losaObservatorio`, `muroObservatorio`): la azotea de la torre del palacio. Losas grandes de caliza
  a la luz de la luna, a veces con un cartucho de día tallado; muros de sillares con cornisa y ventanas en T (ik', viento) que
  dejan ver la noche; el fondo es un cielo de noche con estrellas (`Cielo_Noche`, pintado en `js/mazmorra_maya.js`), sin
  decorado en el vacío (`deco: []` ahora se admite). Enemigos: espíritus, guacamayas, avispas, monos, ocelotes y aulladores
  (presupuesto 25-29). Santuario de Vida en el 3-3; armas mayas ★★★.
- **Jefe del 3-4: el Guardián de los Ciclos** (`guardianCiclos`): el Guardián de la Piedra Viva (`js/guardian.js`: tres fases,
  sus ataques y el agua que sube en la fase 2) con la figura del Señor de la Lluvia de Unity (Chaak; `g.figura` en
  `dibujarGuardian`), 1500 de vida y débil al Viento y a la Tierra. Espera dormido; al vencerlo se queda arrodillado. Da 500 de
  experiencia, 3 semillas y 2 jades.
- **Salida:** la bajada del 3-4 (el último nivel) es la escalera de la torre y sale a la plaza de Palenque, junto a la boca del
  acueducto. Ya no hay aviso de «próxima etapa» en la mazmorra maya.
- Fidelidad: D, la torre del palacio de Palenque y sus ventanas en T; Chaak, dios de la lluvia; los 20 signos de los días.
  I: la torre como observatorio. F: el Guardián de los Ciclos.

Prueba: `herramientas/dificultad/etapa50.mjs` (9 comprobaciones: del 2-4 al 3-1, misión, piso 13, estrado, santuario,
Guardián dormido, despierto con barra, mapa, vencido con la misión cumplida, salida a Palenque). `etapa49.mjs` ahora comprueba que
el 2-4 lleva al 3-1. `recorrido.mjs` sin `[assert]`. Sin medir con el bot la pelea del Guardián (ni las del cocodrilo y el murciélago).

## Etapa 49 (2026-11-19): mazmorra maya, piso 2 «las cámaras de estuco» (`js/mazmorra_maya.js`, `js/niveles.js`, `js/pisos.js`)

- **La bajada del 1-4 se abre:** tras el cocodrilo de pantano se baja al 2-1 (`m2_1`…`m2_4`, clave 12). Al llegar avanza la misión
  **MP_MAY_03**, que ahora sigue con «vence a lo que vive en la oscuridad» y «sube hacia el observatorio (próximamente)».
- **Piso 2, cámaras de estuco** (`losaEstuco`, `muroEstuco`): losas de estuco crema gastadas, con grietas, desconchones y fajas rojas;
  muros de estuco rojo con un tablero de glifos y la bóveda en saledizo; fondo oscuro con escombros. Seco: sin charca ni
  pejelagarto. Enemigos: espíritus, murciélagos, avispas, serpientes, monos y ocelotes (presupuesto 22-26). Santuario de Vida
  en el 2-3, estrados y cofres con armas mayas ★★★.
- **Sub-jefe del 2-4: el murciélago de la muerte** (`murcielagoEstuco`): el murciélago vampiro de Unity al ×2,8, con 520 de vida,
  mordida de 14 que le devuelve vida y chillido que frena; débil a la Luz y al Viento. Da 280 de experiencia, 2 semillas y jade.
  La bajada del 2-4 avisa que el piso 3 (el observatorio) viene en la etapa siguiente.
- Fidelidad: D, el murciélago (sotz') es un «way» de las vasijas del Clásico y la Casa de los Murciélagos del Popol Vuh;
  D, el estuco pintado de rojo de Palenque. I: los tableros de glifos en estas cámaras. F: el murciélago gigante.

Prueba: `herramientas/dificultad/etapa49.mjs` (11 comprobaciones: del 1-4 al 2-1, misión, piso 12, estrado, santuario,
murciélago con su barra, mapa, aviso del 2-4 y caída). `etapa48.mjs` ahora comprueba que la bajada del 1-4 lleva al 2-1.
`recorrido.mjs` sin `[assert]`. Sin medir con el bot la pelea del murciélago.

## Etapa 48 (2026-11-19): mazmorra maya, piso 1 «los canales del Otolum» (`js/mazmorra_maya.js`, `js/niveles.js`)

Plan acordado con el usuario: la mazmorra maya tiene **3 pisos de 4 niveles** (canales del Otolum, cámaras de estuco y
observatorio), con un sub-jefe o jefe en cada X-4. Esta etapa hace la entrada y el piso 1.

- **Entrada:** la boca del acueducto, en la plaza del templo de Palenque (junto al tablero). Sin el camino del agua solo se
  examina; tras devolverle las hojas al escriba (`may.camino_agua`, que ahora también empieza la misión **MP_MAY_03 «El camino
  del agua»**), se baja. Al bajar empieza una incursión nueva, como al pasar por la selva olmeca: se borran las banderas
  `incursion.*` y se sale con el arma del tallador de pedernal (o la lanza que presta).
- **Generador por cultura:** los niveles mayas son `m1_1`…`m1_4` (`NIVELES_MAYA`, `esMaya`, `pisoDe`, `secuenciaDe`). Sus pisos
  usan las claves 11-13 en `ESTILO`, `PALETA`, `POBLACION`, `PRESUPUESTO` y `VIDA_NIVEL`. Estrados y cofres dan armas mayas,
  una estrella más (★★ en el piso 1), y el botín del piso 3 olmeco; más experiencia por nivel. Sin la estera olmeca.
- **Piso 1, canales del Otolum** (`losaCanal`, `muroCanal` en `js/pisos.js`): losas de caliza húmeda con musgo y canalillos de
  agua, muros de sillares con la bóveda en saledizo y la marca del agua, fondo de agua oscura. Enemigos: espíritus,
  murciélagos, serpientes, cocodrilos, pejelagartos y armadillos (presupuesto 18-23). Santuario de Vida en el 1-3.
- **Sub-jefe del 1-4: el cocodrilo de pantano** (`cocodriloPantano`): el cocodrilo de Unity al ×1,9, con 480 de vida, mordida de
  18 y coletazo de 14 más anchos; débil a la Tierra. Da 220 de experiencia, 2 semillas y jade. La bajada del 1-4 avisa que el
  piso 2 viene en la etapa siguiente (`cerrado` de un portal puede ser una función).
- Al caer en la mazmorra maya, a Palenque, junto al santuario. El mapa marca la boca del acueducto y, dentro, la bajada de
  cada nivel o el jefe (también en la mazmorra olmeca).

Prueba: `herramientas/dificultad/etapa48.mjs` (15 comprobaciones: boca cerrada y abierta, misión, arma maya, los cuatro
niveles, estrado maya, santuario, cocodrilo con su barra, mapa, aviso del 1-4 y caída). `recorrido.mjs` sin `[assert]` (la
autocomprobación de niveles recorre también los mayas). Sin medir con el bot la pelea del cocodrilo.

## Etapa 47 (2026-11-19): mapa de la región (`js/mapa.js`)

- **Minimapa** arriba a la derecha, bajo la pausa y la bolsa (128 × 88), centrado en ti y con unos 30 m alrededor: suelo,
  agua y lo que bloquea (hecho una vez por región, un píxel por metro: `fondoMapa`), tú en blanco con una raya hacia donde
  miras, enemigos en rojo (los jefes, más grandes), habitantes en claro, salidas en amarillo y el santuario de Memoria en verde.
- **Objetivo:** anillo dorado que parpadea sobre lo que pide el paso de la misión activa (`objetivoEnMapa`): el habitante
  con quien hay que hablar, el tablero, el altar-trono o las hojas (o el espíritu que guarda una). Si está en otra región,
  en la salida hacia allá (`RUTA`, `AVISO_EN`; los portales de luz llevan su destino en `a`). Los pasos sin lugar conocido
  (los olmecas de la mazmorra, que es lineal) no marcan nada.
- **Al tocarlo** se agranda en el centro con la región entera; al tocarlo otra vez vuelve. **Opciones → Mapa** lo oculta.
- Se redibuja cada 150 ms (no en cada cuadro) para no gastar batería.

Prueba: `herramientas/dificultad/etapa47.mjs` (7 comprobaciones; capturas del minimapa, el mapa grande, la aldea maya y un
nivel de la mazmorra).

## Etapa 46 (2026-11-19): fauna de Chiapas en la selva de Palenque (`js/animales.js`, `herramientas/animales.mjs`)

Tres animales nuevos pintados por código (`node herramientas/animales.mjs`) y el tapir, que ya existía, en Palenque:

| Animal | Cómo se hizo | Cómo pelea |
|---|---|---|
| **Jaguar** (*Panthera onca*) | esqueleto y poses del ocelote a escala 1,05 (el ocelote, 0,72); rosetas grandes con punto dentro, pelo dorado | como el ocelote, pero élite: 95 de vida, salto de 5 m (17 de daño), zarpazos de 10; esquiva menos; débil al Agua |
| **Mono araña** (*Ateles geoffroyi*) | esqueleto del aullador; pardo rojizo, extremidades oscuras, cara clara | grupo de tres; no aúlla, lanza ramas (7) más a menudo y huye más rápido |
| **Tucán pico canoa** (*Ramphastos sulfuratus*) | nuevo: cuerpo, cabeza, pico verde con franja naranja y punta roja, y alas que aletean | vuela en círculo a 1 m; marca una franja y se lanza en picada (8) |
| Tapir (*Tapirus bairdii*) | el de la etapa 29 | embiste y pisotea, como en la mazmorra |

- El ocelote y el aullador ya no leen sus constantes directamente: cada uno lleva sus datos (`e.D`), así el jaguar
  (`JAGUAR_SELVA`) y el mono araña (`ARANA`) usan la misma lógica con sus valores. En la mazmorra todo sigue igual.
- Palenque: serpiente y tucán en el sendero, monos araña al cruzar el puente, tapir y aulladores en la plaza, el jaguar
  junto al templo y otro tucán.
- **Fidelidad:** D, las cuatro especies viven en la selva de Chiapas; los monos araña arrojan ramas a quien se acerca. I y F:
  que el jaguar y el tucán ataquen (los empuja la Sombra).

Prueba: `herramientas/dificultad/etapa46.mjs` (13 comprobaciones: cuántos hay, cada uno ataca, recibe daño y muere; el
ocelote y el aullador siguen igual). Hojas de revisión: `node herramientas/animales.mjs <ruta>/hoja.png`.

## Etapa 45 (2026-11-19): armas mayas en el armero de Lakamha' (`js/armas.js`)

Seis armas mayas del Clásico con `cultura: 'maya'` en `ARMAS`. Solo las vende el **tallador de pedernal**, habitante nuevo
de la aldea maya; la mazmorra olmeca (estrados, cofres y ofrendas) sigue dando solo armas olmecas (`armasDe`).

| Arma | Clase | Cómo juega | Especial | Precio |
|---|---|---|---|---|
| Lanza de pedernal | cerca | alcance 1,9, rápida | Estocada larga (3,6 m) | prestada |
| Hacha de pedernal | cerca | pesada, desgasta guardias y aturde con el remate | Tajo de pedernal (aturde) | 25 ecos, 3 fibras, 1 obsidiana |
| Cuchillo de pedernal | cerca | muy rápido, 20 % de críticos que sangran; no se rompe | Corte doble (sangra) | 20 ecos, 1 obsidiana |
| Átlatl maya | distancia | 18 dardos | Andanada (3) | 25 ecos, 4 fibras, 1 jade |
| Cerbatana | distancia | 35 dardos flojos, alcance 11 | Ráfaga (4) | 20 ecos, 3 fibras, 1 cacao |
| Escudo flexible | escudo | deja pasar el 30 % de frente (el rígido, el 15 %) y no frena | Empujón (aturde) | 30 ecos, 5 fibras, 2 cacaos |

- El armero maya guarda lo suyo en `armero_maya.*` y el arma se lleva en el momento (aún no hay incursión maya); el olmeco,
  como antes en `armero.*`, con la que sales a la selva.
- El escudo ya no es solo `escudo`: `escudoLlevado()` da la defensa y la velocidad del escudo que lleves.
- **Fidelidad:** D, lanzas de pedernal, hachas, cuchillos, átlatl y escudos flexibles en Bonampak y Yaxchilán; la cerbatana en
  vasijas del Clásico y en el Popol Vuh. I: sus valores y que el pedernal no se rompa. No se usan el arco ni el macuahuitl
  (sobre todo posclásicos).

Prueba: `herramientas/dificultad/etapa45.mjs` (9 comprobaciones). `etapa42.mjs` y `armas.mjs` siguen bien; en `armas.mjs` el
especial maya quita 36-42, como los olmecas (31-50).

## Etapa 44 (2026-11-19): la aldea de Lakamha' (`js/aldea_maya.js`)

Al este de la plaza del templo, por un sendero, la aldea maya: casas de bajareque con techo de palma sobre plataformas,
milpa, telar de cintura, fogón de tres piedras, cestos y vasijas, y el río al sur con una canoa. Todo pintado por código
salvo los enseres de casa de Unity, que no tienen rasgos de cultura.

- **Siete habitantes pintados por código** (no hay fichas mayas en Unity; lo eligió el usuario): escriba (pincel en el
  tocado y concha de tinta), tejedora anciana (huipil y enredo), mercadera de cacao y sal (canasta), pescador del Otolum (red),
  joven cazador (lanza y plumas), niña y niño. Cuadros de 48 × 64 como las fichas (`MAYAS`, `pintarMaya`): reposo y cuatro
  de andar, de frente, de lado y de espaldas, con contorno oscuro; los niños al ×0,72.
- **Misiones:** hablar con el escriba completa MP_MAY_01 y empieza **MP_MAY_02 «Los registros perdidos»**. Son tres hojas
  de su libro de corteza: una junto al río de la aldea y dos en la plaza de Palenque, cada una guardada por un espíritu de
  la Sombra. Al devolverlas, el escriba recuerda el camino del agua bajo el palacio (`may.camino_agua`), que lleva a la
  mazmorra maya (siguiente).
- Servicios: Cocinar (fogón) y Comerciar (mercadera), con las recetas y ofertas de siempre. Al caer en la aldea, al
  santuario de Palenque.
- **Fidelidad:** en la cabecera de `js/aldea_maya.js` (D: casas, milpa, telar, fogón, cacao y sal, escribas con pincel,
  libros de corteza; I: ropa y peinados simplificados y la frente alargada; F: las personas, sus palabras y las hojas).

Prueba: `herramientas/dificultad/etapa44.mjs` (18 comprobaciones; los espíritus pueden esquivar de un salto, así que el
guion repite el golpe) y hoja de los habitantes (`44_habitantes.png`). `etapa43.mjs` sigue bien.

## Etapa 43 (2026-11-19): de la mazmorra olmeca a la época maya, Palenque (`js/palenque.js`)

Lo pidió el usuario: al terminar la mazmorra, pasar a la época siguiente. Según `Docs/Historia_Mundo.md` §6 de Unity es el
**capítulo II, «Las ciudades de piedra y agua»** (maya; habilidad de agua). El usuario eligió **Palenque** como referencia y,
para esta etapa, el portal y una primera región.

- **Cierre del capítulo I:** al dejar el Fragmento de la Primera Memoria en el altar-trono (último paso de MP_OLM_06), tres
  líneas de cierre (las piedras no se borran solas: alguien borra los recuerdos) y se abre un **portal de luz** en la plaza,
  entre los dos altares (bandera `may.portal_abierto`). Una partida que ya había cumplido MP_OLM_06 lo abre al examinar
  de nuevo el altar.
- **Portal:** pregunta con la tarjeta «Capítulo II · Las ciudades de piedra y agua» (Seguir la memoria / Todavía no).
- **Lakamha' (Palenque):** región pintada por código (piso 4 de `ESTILO` y `PALETA`). Claro de llegada con santuario de
  Memoria y portal de vuelta, sendero de selva, el río Otolum con un puente de bóveda, calzada y plaza de caliza al pie de un
  templo de nueve cuerpos con escalinata, cinco vanos, mansarda y crestería, y un tablero de glifos medio borrado. Fauna:
  2 serpientes, ocelote, 2 aulladores y guacamaya. Misión nueva **MP_MAY_01 «Lakamha'»**: examinar el tablero; el paso
  siguiente, «Busca a la gente de Lakamha' (próximamente)», espera a la aldea maya.
- Al caer en Palenque despiertas en su santuario; ahí también se guarda y se continúa.
- **Fidelidad** (cabecera de `js/palenque.js`): D, el nombre Lakamha' («lugar de las grandes aguas»), el Otolum
  canalizado con bóveda en saledizo, el Templo de las Inscripciones (nueve cuerpos, cinco vanos, texto jeroglífico largo),
  estuco rojo, números de barras y puntos, la ceiba y la fauna; I, la composición de la plaza, el puente y el tablero suelto;
  F, el portal, la voz y los glifos borrados.

Prueba: `herramientas/dificultad/etapa43.mjs` (14 comprobaciones: sin portal antes del altar, misión y portal, tarjeta,
llegada, misión maya, tablero, guardado en Palenque, caída al santuario de Palenque y vuelta a la aldea), con capturas.
`recorrido.mjs` sin `[assert]` ni excepciones (el cambio en `patronFondo` y `dibujarLosas` no tocó la mazmorra).

## Etapa 42 (2026-11-19): la energía se recarga sola y el armero cobra (`js/actores.js`, `js/armas.js`)

Lo pidió el usuario tras probarlo en el celular: la estrella (especial del arma) se apagaba para siempre tras 4 usos, porque la
energía solo volvía en el santuario de Memoria o con objetos. Ahora se recarga sola a **4 por segundo** (`ENERGIA_REGEN`), hasta
el tope: otra especial (25) cada ~6 s, que es casi su espera de 5 s. También vale para el golpe de tierra. La especial sí daña:
con la macana, el remolino le quitó 26 de 39 a un enemigo pegado.

El armero ya no presta las 8 armas gratis: cada una se **compra una vez** con ecos y materiales de la bolsa (que se guardan en la
partida) y luego se elige sin pagar (`PRECIO_ARMERO`, bandera `armero.compradas`). La macana la sigue prestando, para no
salir sin nada. El arma que ya tenías elegida en una partida de antes cuenta como comprada.

| Arma | Precio |
|---|---|
| Macana | gratis |
| Mazo | 15 ecos, 4 fibras |
| Honda | 15 ecos, 5 fibras |
| Lanza | 20 ecos, 4 fibras, 1 obsidiana |
| Cuchillo | 20 ecos, 2 obsidianas |
| Hacha | 25 ecos, 3 basaltos, 2 fibras |
| Átlatl | 25 ecos, 4 fibras, 1 jade |
| Jabalina | 30 ecos, 2 obsidianas, 3 fibras |

Prueba: `herramientas/dificultad/etapa42.mjs` (con `?nivel=n1_2`): recarga 8,1 en 2 s sin pasar del tope, la especial daña, sin
ecos no se compra, al comprar se cobra justo y elegirla de nuevo no cobra. Todo bien y sin `[assert]`.

**Campaña con la recarga** (`campana.mjs`, perfil celular, Balam; entre paréntesis, la etapa 38): sin armero, 0 caídas del 1-1
al 3-5 (0); nauyaca vencida en 10 s (13), jaguar en 11 s (16), Guardián al primer intento en 39 s (38). Con la macana del
armero: 0 caídas; nauyaca 10 s, jaguar 13 s, Guardián 31 s. Los jefes caen algo antes, pero la vida al salir de cada nivel
(16-49 de 54-68) es como antes: la recarga ayuda sin romper la dificultad. No se cambia nada.

## Etapa 41 (2026-11-18): al caer en el piso 3, al santuario del 3-5 (`js/juego.js`)

Antes (etapa 36) se caía siempre a la aldea. Ahora, si caes en el piso 3 (3-1 a 3-5) y en esta incursión ya llegaste al 3-5
(bandera `incursion.santuario_p3`, que se pone al entrar allí y se borra al volver a pasar por la selva), despiertas junto a su
santuario de Memoria (`memoria_llegada`), con la vida llena y **sin perder las armas ni los niveles limpios**. El Guardián se
recarga con la vida llena. Si aún no llegaste al 3-5, o caes en los pisos 1-2, la selva o la aldea, vuelves a la aldea como
antes, así que caer nunca te adelanta niveles. El santuario de Memoria del 3-5 dice «Si caes, despertarás aquí».

De paso: el espíritu jaguar de la antesala que quedaba a 0,5 m del santuario no se pone si despiertas o cargas partida ahí
(solo los que quedan a ≥ `LIBRE_LLEGADA`, 4 m; antes te pegaba al aparecer). Al bajar por la escalera siguen los dos.

**Pruebas** (Chrome sin ventana, partida nueva con lanza ★★): caer en el 3-2 sin haber llegado al 3-5 → aldea; en el 2-3 → aldea;
en el 1-1 → aldea; tras pasar por el 3-5, caer en el 3-2 y en el propio 3-5 → santuario, 50/50, con la lanza y el enemigo más
cercano a ≥ 3,1 m.

## Etapa 40 (2026-11-18): el jugador ya no anda «como pingüino» de frente ni de espaldas (`js/actores.js`)

El usuario vio que al andar hacia abajo el guerrero parecía un pingüino. En los 4 cuadros `Caminar*_05` (y `_01`) de los siete
guerreros de Unity **los pies no se mueven y todo el cuerpo se ladea de un lado a otro**; de perfil (`_03`) sí dan pasos. Los
habitantes no tienen el problema: sus cuadros de frente sí mueven las piernas.

Arreglo (`pasoFrontal`, `PASO_FRONTAL`): andando de frente o de espaldas se usa el cuadro de **reposo** (sin ladeo) y, en un
ciclo de 4 tiempos al mismo ritmo de antes, se alza 2 px la parte baja (17 % del alto) de un lado del pie, luego apoyo con un
bote de 1 px hacia abajo, luego el otro lado y otro apoyo. El corte entre pies es el pivote del sprite. Los cuadros se hacen una
vez por guerrero y dirección (caché) y se pintan con `dibujar(..., { lienzo })`, como las partes de `js/cuadros.js`. El arte de
Unity no se toca.

**Pruebas:** hoja ×5 con los 4 tiempos nuevos junto a los 4 cuadros viejos (Balam y Xali, de frente y de espaldas): el cuerpo
queda centrado y alterna los pies; tira del jugador andando con S, W y D en el juego, sin excepciones. Pendiente: verlo en el
celular (si 2 px se queda corto, subir `PASO_FRONTAL.alza`).

## Etapa 39 (2026-11-18): mejor animación de los enemigos

Para revisarla, `herramientas/dificultad/animaciones.mjs` hace una **hoja de animación** por enemigo (36 recortes de ~0,08 s:
se acerca, avisa, ataca, recibe un golpe en el 24 y muere en el 30; `ENEMIGOS='["pecari"]'` para elegir). Lo que se vio:

- **Los siete animales pintados por código se deslizaban rígidos.** La capa de movimiento por código (`js/movimiento.js`) solo
  la usaban los sprites de Unity de un solo cuadro; los animales solo cambiaban de cuadro. Ahora también la llevan
  (`movAnimal` y `POSE_ANIMAL` en `js/animales.js`, un estilo por animal en `ESTILOS`): el cuerpo bota al paso y se mece, se
  inclina al correr, se agacha y se echa atrás en el aviso (con temblor al final), se estira en el ataque y se encoge al recibir
  un golpe; la media vuelta al girar se estrecha en vez de voltearse de golpe. Botes y balanceos más suaves que la fauna de
  Unity, porque sus cuadros ya mueven las patas. Al morir no se añade nada: la caída la hacen sus 6 cuadros.
- **El paso apenas se leía a tamaño de juego:** zancada y alzada al andar subidas en `herramientas/animales.mjs` (pecarí 0,22 →
  0,30 y 0,07 → 0,11; tapir 0,38 → 0,46 y 0,1 → 0,14; ocelote 0,22 → 0,30 y 0,06 → 0,10; aullador 0,22 → 0,30 y 0,06-0,07 →
  0,10; armadillo 0,10 → 0,13 y 0,035 → 0,055). Correr y galopar no cambian. Repintados los 40 cuadros de andar.
- La fauna de Unity, el espíritu y los jefes ya tenían movimiento y partes (etapas 26-29) y se ven bien; el reposo del cocodrilo
  es quieto, como el animal.

**Pruebas:** hojas antes y después revisadas en captura (el pecarí se mece al acechar y se echa atrás al avisar la carga; el
ocelote se agacha antes del salto); tira ampliada ×4 de los cuadros de andar; `recorrido.mjs` sin `[assert]` ni excepciones,
dibujo igual que antes (≤ 0,4 ms por cuadro en los niveles). Pendiente: verlo en el celular.

## Etapa 38 (2026-11-18): arreglos tras una simulación completa del juego

El usuario pidió que el juego se simulara solo para buscar fallos y mejoras. Tres guiones nuevos en `herramientas/dificultad/`:
`recorrido.mjs` (cada mapa: aparecer dentro de un muro; portales, enemigos e interactuables que no se alcanzan andando, por
búsqueda en casillas de 0,25 m; ms por cuadro; fotos y menús), `entradas.mjs` (distancia del enemigo más cercano a la llegada
en los niveles generados, 30 semillas) y `campana.mjs` (el bot juega del 1-1 al 3-5 sin atajos: limpia, toma estrados, abre
cofres, usa el santuario de Vida antes de cada jefe, pelea con los jefes y baja por los portales de verdad).

| # | Hallado | Arreglo |
|---|---|---|
| 1 | En todos los generados menos el X-1, un enemigo a < 2 m de la llegada en el 50-80 % de las partidas (a veces encima) | `LIBRE_LLEGADA` = 4 m (`js/niveles.js`): `sitio()` sortea hasta 12 veces y se queda el más lejano; si la sala no da, otra; el tapir, a una sala grande lejos de la llegada; la charca del pejelagarto, solo en una sala de en medio (antes podía tapar una escalera: `[assert]` del 2-3). Ahora el más cercano está a ≥ 3,4 m en 30/30 |
| 2 | Las armas de cofres y ofrendas se equipaban solas y, con las dos ranuras llenas, cambiaban la de la mano aunque fuera mejor | `ofrecerArma` (`js/armas.js`): con ranura libre o la misma arma, se toma; con las manos llenas queda en el suelo junto al cofre (`armaEnSuelo`, sin estrado) y se toma con Usar |
| 3 | En la campaña se llegaba al Guardián con el 37 % de la vida y perdía | Santuario de Vida nuevo en la antesala del 3-5, junto al de Memoria (`santuarioVidaP3`, (2,75; 2,25)); los tres santuarios usan ahora `santuarioVida` (`js/juego.js`) |
| 4 | Un espíritu del 3-5 dentro de un muro (punto de Unity sobre los muros de la etapa 35) | `desatascar` al cargar cada región: el enemigo en un muro pasa al hueco libre más cercano (hasta 3 m), con su casa |
| 5 | La jabalina sin munición seguía ocupando una ranura | Sin munición, el arma a distancia se deja y la otra pasa a la mano |
| 6 | El nombre del nivel salía dos veces al entrar | Fuera el aviso: ya lo dice el marcador `#zona` |
| 7 | La pantalla de inicio decía «etapa 24» | Solo «Arco I · La Venta» |
| 8 | Iconos del armero diminutos y oscuros | Al doble (64 px, ×1,8) sobre un disco claro; filas `.fila.arma` de 48 px |

**Comprobado y bien:** < 1,3 ms por cuadro en todos los mapas (la aldea, lo más pesado); nadie aparece en un muro; todos los
portales se alcanzan; las tres ofrendas inalcanzables son las secretas, tras el basalto agrietado.

**Campaña tras los arreglos** (perfil celular, Balam, sin armero): 0 caídas del 1-1 al 3-5; nauyaca al 53 % de la vida,
vencida en 13 s; jaguar con santuario al 95 %, 16 s; Guardián con el santuario nuevo al 85 % (antes, 37 %), vencido al
primer intento en 38 s. Pruebas: `armas.mjs` con dos casos nuevos (cofre con las manos llenas → suelo; última jabalina →
se suelta), `entradas.mjs` y `recorrido.mjs` sin `[assert]` ni excepciones.

## Etapa 37 (2026-11-18): dos armas a elegir, calidad por piso y especial de cada arma (`js/armas.js`)

Pedido del usuario tras probar la 36: que la habilidad especial afecte a los enemigos con un arma, que las armas se elijan,
llevar solo 2, y que haya armas de poco y de mucho daño según el nivel.

- **Dos ranuras libres** (`incursion.ranuras`, `RANURAS` = 2): cualquier clase; el escudo cuenta y protege desde las dos. La de
  la mano (`incursion.mano`) golpea, dispara y hace el especial. **Cambiar arma**: tecla R o el botón de flechas cruzadas
  (`#bArma`, solo con dos armas). Una tercera sustituye a la de la mano; la misma recarga y se queda con la mejor calidad.
  HUD: «▸Macana★ · Honda★★★ 30» (▸ = en la mano).
- **Calidad** (`CALIDAD`, multiplica el daño): ★ ×0,6 (piso 1 y armero; era ×0,75, bajado tras medir con el bot), ★★ ×1 (piso 2), ★★★ ×1,35 (piso 3). Estrados,
  cofres y ofrendas dan la de su piso.
- **Especial de cada arma** (`ESPECIAL_ARMA`; F o la estrella, 25 de energía y 5 s, con **cualquier Guardián**; sin arma, no
  hay): daño = ataque × mult × calidad × maestría. Los tiros del especial no gastan munición. El especial antiguo de Balam
  (×2,5 enfrente) desaparece: lo sustituye el del arma.

| Arma | Especial | Qué hace |
|---|---|---|
| Macana | Remolino | ×2,2 alrededor (radio 1,7) |
| Mazo | Golpe al suelo | ×2, radio 1,8, aturde 1 s |
| Lanza | Estocada | ×2,5 en una franja de 3 m |
| Cuchillo | Tajo certero | ×2,5 enfrente y sangrado |
| Hacha | Tajo pesado | ×3 enfrente (radio 1,2), rompe basalto |
| Escudo | Embestida | ×1 enfrente, aturde 1,2 s |
| Átlatl | Tres dardos | 3 × 1,5 en abanico (16°) |
| Jabalina | Jabalina imparable | ×3, atraviesa a todos |
| Honda | Lluvia de piedras | 5 × 1 en abanico (12°) |

Pruebas (Chrome sin ventana, Balam nv 1): sin arma, sin especial; macana ★ + honda ★★★ → «Macana★ · ▸Honda★★★ 30»; el mazo
como tercera sustituye a la honda; R pasa la macana a la mano; golpe con macana ★ 14 y ★★★ 32; los 9 especiales contra 4
espíritus (a 1 m delante, 1 m detrás, 2,5 m y 4 m): macana 33/33/0/0, mazo 30/30/30 y aturde, lanza 38 y 38 a 2,5 m,
cuchillo 44, hacha 45/45, átlatl 45, jabalina 31 a los tres de delante, honda 50, escudo 12 y aturde; −25 de energía y
munición intacta. Sin `[assert]` ni excepciones. Guion: `herramientas/dificultad/armas.mjs`.

**Dificultad con armas** (`mapas.mjs`, perfil celular `HAB=0.5 CAD=0.3 REAC=0.3`, 12 partidas por mapa; opciones nuevas:
`ARMAS='["macana"]'` da armas con la calidad del piso, o la de `NV`, y energía llena; `ESP=1` usa el especial; `DISP=1` dispara
desde lejos. Las tres, apagadas por defecto). Porcentaje medio de la vida perdida:

| Mapa (nv) | Sin armas | Macana (★ ×0,75) | + especial | Honda + especial | Macana + especial (★ ×0,6) | Solo la del armero ★ ×0,6 |
|---|---|---|---|---|---|---|
| 1-1 (1) | 35 % | 25 % | 28 % | 38 % | 32 % | 35 % |
| 1-3 (2) | 40 % | 17 % | 19 % | 41 % | 13 % | 28 % |
| 2-2 (3) | 27 % | 30 % | 16 % | 24 % | 29 % | 16 % |
| 2-4 (4) | 44 % | 19 % | 25 % | 29 % | 19 % | 24 % |
| 3-2 (4) | 39 % | 15 % | 15 % | 21 % | 9 % | 29 % |
| 3-4 (4) | 42 % | 20 % | 32 % | 56 % | 28 % | 48 % |

Con un arma de cerca el daño recibido bajaba casi a la mitad (de ~38 % a ~21 %); el especial apenas cambia (la energía solo
da para 2-3 por mapa); la honda sola ayuda poco (de cerca, golpe sin arma). Por eso, a petición del usuario, **★ pasó de ×0,75
a ×0,6**: con solo la del armero se queda en ~30 %, y las ★★/★★★ que se encuentran siguen ayudando. Ruido entre tandas: ±10 %.
Ojo: `prueba.mjs` usa el puerto fijo 9333, así que **no** se pueden correr dos tandas a la vez.

**Jefes con armas** (`jefes.mjs`, `HABS='[0.5]' CAD=0.3 REAC=0.3 SEMILLAS=1`, 10 peleas; `ARMAS`, `NV` y `ESP` como en
`mapas.mjs`; `bot_jefe.js` usa el especial a menos de 2,2 m). Gana · segundos · vida perdida:

| Jefe (nv, llega con) | Sin armas | Macana + especial, calidad del piso | Solo la del armero (★ ×0,6) + especial |
|---|---|---|---|
| Nauyaca (2, 70 %) | 10/10 · 14 s · 48 % | 10/10 · 10 s · 31 % (★) | 10/10 · 11 s · 33 % |
| Jaguar (3, 100 %) | 10/10 · 15 s · 56 % | 10/10 · 8 s · 25 % (★★) | 10/10 · 12 s · 39 % |
| Guardián (4, 70 %) | 10/10 · 28 s · 54 % | 10/10 · **9 s** · 22 % (★★★) | 9/10 · 23 s · 63 % |

Con la del armero los jefes quedan casi como sin armas; con la ★★★ el Guardián caía en un tercio del tiempo. Por eso, a
petición del usuario, **vida del Guardián de 700 a 1100** (`GUARDIAN.vida`, `js/guardian.js`). Con 1100:

| Guardián (4, 70 %) | Sin armas | Macana ★★★ + especial | Solo la del armero ★ + especial |
|---|---|---|---|
| Con 1100 de vida | gana 2/10 · 48 s · 98 % | 9/10 · **17 s** · 35 % | 6/10 · 37 s · 86 % |

En el piso 3 el estrado del 3-2 siempre da un arma de cerca ★★★, así que lo normal es llegar con ella. **Arreglo de la
herramienta:** desde la etapa 36, al caer el juego viaja a la aldea, y si el bot perdía, ese viaje llegaba en mitad de la pelea
siguiente (el jefe no estaba: `TypeError … 'x'`). `jefes.mjs` ahora devuelve la vida al perder, como `mapas.mjs`.

## Etapa 36 (2026-11-18): armas olmecas de la mazmorra (`js/armas.js`)

Para que atacar sea más fácil, en la primera sala de algunos niveles generados hay un **estrado de ofrenda**
(`Estrado_Ofrenda_01`) con un arma que flota y brilla, al azar con la semilla de la incursión; se toma con Usar (o Atacar junto
a él). Duran la incursión (se pierden al salir a la selva). Se lleva **una de cada clase**: otra de la misma clase cambia la
que llevas; la misma recarga su munición o sus usos.

| Dónde | Clase | Arma | Mecánica (× = daño sobre el ataque, antes de la maestría) |
|---|---|---|---|
| X-2 de cada piso | Cuerpo a cuerpo | **Macana olmeca** | ×1,6, alcance 1,1 m, radio 0,95 |
| | | **Mazo de madera** | ×1,9, lento (espera ×1,4); cada golpe quita un rombo de la guardia y el remate aturde 0,6 s |
| | | **Lanza corta** | ×1,3, alcance 1,7 m (radio 0,6), rápida (×0,85) |
| | | **Cuchillo de obsidiana** | ×1,1, muy rápido (×0,6); 25 % de crítico ×2 con sangrado (4 tics del 15 % en 2 s); se rompe tras 40 golpes |
| | | **Hacha de piedra pulida** | ×1,4 (espera ×1,1); también rompe el basalto agrietado que tenga delante (abre caminos) |
| X-4 de cada piso | A distancia | **Átlatl** | 15 dardos, ×1,2, 9 m, 13 m/s |
| | | **Jabalina** | 6, ×2,2, 7 m, atraviesa a 2 enemigos |
| | | **Honda** | 30 piedras, ×0,8, 11 m, 15 m/s, espera 0,35 s |
| X-1 de los pisos 2 y 3 | Defensa | **Escudo rectangular** | Al defender, lo que llega de frente entra al 15 % (sin escudo, 50 %; de espaldas, igual que sin él); siempre vas al 85 % de velocidad |

**Cofre de recompensas** (`aparecerCofre`, `BOTIN_COFRE`): al vencer a todos los enemigos de un nivel (el 1-1, el 2-5 tras el
jaguar y todos los generados) aparece un cofre junto al jugador (`Ofrenda_01` con un brillo; abierto, `Ofrenda_02`; no es
sólido), una vez por incursión. Botín al azar con la semilla de la incursión: 10 de experiencia por piso, dos tiradas de la
tabla del piso (semillas, fibras, arcilla, maíz, cacao, jade, pescado, obsidiana, basalto, esencia de energía, ecos) y además un
arma de las 8 (35 %) o munición para tu arma a distancia (30 %). Las ofrendas de Unity (1-1, 2-5, 3-5, menos la final) traen
además un arma el 50 % de las veces. **El escudo nunca sale en un cofre**: solo en su estrado, para la defensa.

**Armero de la aldea** (`poblarArmero`, `menuArmero`; licencia del juego, no hay constancia de armeros olmecas): un guerrero
en la plaza (17,5; 1,5); «Armero» abre la pestaña con las 8 armas (icono, clase, qué hace y la maestría de tu Guardián). La
elegida (`armero.eleccion`, se guarda) se lleva al momento y al empezar cada incursión (al entrar a la selva, con munición o
usos llenos); en la mazmorra se puede cambiar por otra de su clase. Una sola: elegir otra de otra clase quita la anterior.

Pruebas (Chrome sin ventana, partida nueva): «Armero» en la plaza, menú con 8 armas; elegir honda (30) y luego lanza (la honda
se quita); en la selva, tras reiniciar la incursión, se sale con la lanza; 1-1 con 5 enemigos vencidos → cofre a 1,1 m con
cacao ×1 y ecos ×6; 1-2 limpio → cofre; abierto otra vez, «vacío».

**Al caer, a la aldea** (`actualizar` en `js/juego.js`; antes, DefeatReturn al santuario de la mazmorra): caigas donde caigas,
despiertas en la aldea, en la orilla del despertar (`inicio`), con la vida llena y el aviso «Caíste. Despiertas en la aldea,
junto al agua». Lo ganado se queda; la incursión (armas, niveles limpios) se pierde al volver a pasar por la selva. En el
enlace de prueba (`?nivel=`) te levantas en el sitio. El santuario de Memoria ya no dice que volverás a él.

**Fuera de la mazmorra, sin monstruos hasta completarla** (`afueraConMonstruos` = `olm.guardian_liberado`): ni la fauna de la
selva (serpiente, guacamaya, mono, avispas) ni los dos espíritus que marchan hacia la aldea tras «Rastros en la selva».
Se quedan los espíritus de los claros de esa misión, que hacen falta para abrir la mazmorra. Al liberar al Guardián vuelven.
Pruebas: caer en el 1-1, el 1-2 (con mazo) y la selva lleva a la aldea (17,4; 22,8) con 50/50; selva y aldea sin fauna ni
incursores antes y con ellos después.

**A distancia sin botón nuevo:** con un enemigo a tiro (o el fijado) y ninguno a menos de 2,2 m, Atacar dispara solo hacia él;
si no, golpe normal. El HUD muestra junto a las esquivas lo que llevas («Mazo · Honda 25 · Escudo»; el cuchillo, con sus usos).

**Maestría por Guardián** (`MAESTRIA`): multiplica el daño de cada clase según quién la lleva, por lo que dice de cada uno
`GUARDIANES`. Al tomar el arma, el aviso lo dice («Balam domina las armas de cerca (combate cercano): daño ×2,0»).

| Guardián | Cerca | Distancia | Extra a distancia |
|---|---|---|---|
| Balam (jaguar, combate cercano) | ×1,25 | ×0,85 | |
| Naira (lobo, combate sostenido) | ×1,15 | ×0,9 | |
| Ocel (xolo, protección) | ×1,1 | ×0,95 | |
| Xali (ajolote, resistencia) | ×1,05 | ×1 | |
| Ameyali (mariposa, evasión) | ×0,85 | ×1,15 | |
| Yaret (quetzal, distancia) | ×0,85 | ×1,25 | alcance +1 m |
| Itzel (águila, precisión) | ×0,8 | ×1,35 | alcance +2 m, +5 de munición |

**Armas olmecas, no mexicas:** el macuahuitl (primera versión de esta etapa) es posterior, de los mexicas; se cambió por la
**macana**, garrote de madera en forma de remo con puntas que aparece en monumentos de San Lorenzo y Chalcatzingo. El átlatl
sale en monumentos olmecas en manos de guerreros y de la élite; de la honda se han hallado piedras de honda en sitios olmecas
(Ross Hassig la considera arma olmeca desde al menos el 900 a. C.); el escudo rectangular, hacia el 400 a. C. La lista de armas
y sus mecánicas las dio el usuario.

**Pruebas** (guion en Chrome sin ventana, Balam con ataque 16, contra espíritus quietos): macana 32, mazo 38 (guardia 3 → 2;
remate aturde 0,6 s), lanza 26 a 1,5 m, cuchillo 22 (espera 0,21 s; se rompe a los 40 golpes; sangrado de 3 × 4 = 12), hacha 28
y rompe un basalto delante; átlatl 16, jabalina 30 + 30 (atraviesa), honda 11; escudo 0,15 de frente y 0,5 de espaldas,
velocidad ×0,85. Reparto con 6 semillas: el 2-1 y el 3-1 dan escudo, los X-2 cuatro armas de cerca distintas y los X-4 las tres
a distancia. Foto de las nueve sobre sus estrados. Sin `[assert]` ni excepciones.

## Etapa 35 (2026-11-17): pantalla de juego más clara en el celular y mazmorra con forma y aspecto por piso

**Mapa de los niveles generados** (`generarNivel`, `js/niveles.js`): las salas ya no van en fila. Desde la tercera, cada
una sale de la anterior hacia el norte o el sur (60 %) por un pasillo vertical de 3 de ancho, si no choca con otra sala (2 m
de margen); si no, al este. Nunca vuelven al oeste: la bajada sigue al este de la última. La primera sala y la arena del 1-5
salen al este. Cada esquina de sala se rompe (pierde su celda) con un 50 % si no da a un pasillo. Los pinchos van en el centro
del pasillo (`sala.medio`); el cristal no se pone en la boca de un pasillo al norte. El hueco del muro de la escalera de
subida mira también la fila (antes solo la columna). Sigue la semilla por incursión: cambian al volver de la selva.

**Aspecto por piso** (`ESTILO`, `patronFondo`): en vez del negro, el vacío de la mazmorra (también 1-1, 2-5 y 3-5) lleva un
mosaico oscuro propio, y los niveles generados, plantas y rocas en el vacío (a 2 m del suelo, 3 m por delante). Los pisos 2 y 3 tienen
**diseño propio de suelo y muros**, pintado por código (`js/pisos.js`: `pintarLosa`, `pintarMuro`) en sus cinco niveles,
también en el 2-5 y el 3-5 (sus losas se sacan de las celdas pisables, son planos; sus muros pasan a «Muro_Basalto_01@2»,
mismo nombre de base para que choquen igual, `muroDe`):

| Piso | Fondo | Suelo | Muros |
|---|---|---|---|
| 1 | Selva tupida | El de Unity | Basalto de Unity |
| 2, cámaras inundadas | Agua negra con nenúfares y tule | Lajas verdosas irregulares, musgo en las juntas, charcos (10 %) | Piedras de río apiladas, musgo arriba, marca del agua abajo |
| 3, templo olmeca | Basalto roto sobre piedra morada | Baldosas de barro biseladas: cruz olmeca (10 %), rajadas (10 %); bordes con friso y greca | Sillares a tizón con friso de grecas y cornisa; pilastras con fajas |

Los objetos de Unity (escalera, estelas, placas, escombros) siguen con su arte.


Antes, arriba a la izquierda había tres barras sin números y una línea de texto larga («Balam · nv 1 · 50/50 · Esquivas ◆◆ ·
Nivel 1-3 · quedan 6») que en el celular se partía en dos. Ahora (`index.html`, `hud()` en `js/juego.js`):

- **Panel compacto** arriba a la izquierda, al estilo de los juegos de acción para celular: **retrato** con la marca del
  Guardián (`arte/Iconos/ICO_marca_<id>.png`) y una etiqueta con su nivel; **vida** (roja) y **energía** (azul) con el número
  dentro de la barra; la experiencia como línea dorada fina; las **esquivas** como rombos ◆◇ debajo.
- **Poca vida** (30 % o menos): la barra de vida late en rojo.
- **Ficha del nivel** arriba al centro («Nivel 1-3 · quedan 6»), solo en la mazmorra.
- **La misión** en una sola línea, con fondo suave y puntos suspensivos si no cabe.
- **Los avisos** («toast») salen bajo la ficha del nivel, más estrechos (38 % del ancho), para no tapar el panel.

**Pruebas:** capturas a 844 × 390 en la ciudad (sin ficha de nivel) y en el 1-3 con poca vida (la barra late); sin
`[assert]` ni excepciones. Mapa: plano de 18 niveles (6 × 3 semillas) y capturas del 1-3, 2-2, 2-5, 3-3 y 3-5, sin
`[assert]` (la autocomprobación de recorrido de `js/niveles.js` pasa). **Probado en el celular por el usuario: se ve bien y
va fluido.**

## Etapa 34 (2026-11-17): música prehispánica (`js/musica.js`)

Música de fondo hecha con código (Web Audio, sin archivos), en el estilo que eligió el autor: prehispánico.

- **Instrumentos sintetizados:** flauta de barro (seno con un armónico, ataque suave, vibrato que entra tarde y un soplo),
  huehuetl (tambor grave que cae de 95 a 45 Hz), teponaztli (tambor de madera de dos lengüetas, a una quinta), sonaja (ruido
  agudo) y caracol (grave y áspero, entra despacio).
- **Escala pentatónica menor**: afuera (ciudad, selva) en re; en la mazmorra en la, más grave.
- **Dos modos que cambian solos**, siempre al empezar un compás:
  - **Explorar:** 76 pulsos por minuto, tambores espaciados y la flauta en frases de 4 compases con 4 de silencio.
  - **Pelear:** 118 pulsos por minuto, teponaztli y sonaja seguidos y la flauta más presente; el **caracol** anuncia la pelea.
    Hay pelea con un aviso o un proyectil en el aire, un jefe despierto o un enemigo a menos de 5 m, y dura 4 s tras el último
    indicio (para no saltar de un modo a otro).
- La flauta improvisa: pasea por la escala a saltos cortos y cierra cada frase en la tónica.
- **Volumen propio** en Opciones («Música», 0,5 de inicio); en pausa baja al 40 %. Tras una pestaña oculta no recupera las
  notas perdidas.
- Secuenciador con adelanto: cada 50 ms programa las semicorcheas de los próximos 0,25 s (`MUSICA`, `MUS`).

**Pruebas:** en la selva sin enemigos suena en modo explorar (en re); con una serpiente a 2 m pasa a pelea con el caracol;
sin enemigos vuelve a explorar; en el 1-1 toca en la; en pausa el volumen baja de 0,5 a 0,2. Sin `[assert]` ni excepciones.
**Falta oírla en el celular** (la prueba sin ventana no escucha).

## Etapa 33 (2026-11-17): los jefes con el perfil del celular

`bot_jefe.js` admite ahora `cadencia` y `reaccion` como `bot_grupo.js`, y `jefes.mjs` toma `HABS` (lista de habilidades), `CAD` y
`REAC`. Perfil celular (`HABS='[0.5]' CAD=0.3 REAC=0.3`), con una semilla preparada y la vida con la que se llega a cada jefe; 10
peleas por jefe:

| Jefe | Celular, antes | Celular, después |
|---|---|---|
| Nauyaca (1-5, nv 2, llega al 70 %) | gana 10/10 · 14 s · pierde 44 % de su vida | igual |
| **Jaguar (2-5, nv 3, al 100 %)** | gana 10/10 · **11 s · 32 %, un solo golpe**: más fácil que la nauyaca | gana 10/10 · 16 s · 49 % |
| Guardián (3-5, nv 4, llega al 70 %) | gana 8/10 · 28 s · 44 de 63 | igual |

**Cambio:** vida del Espíritu del Jaguar de 420 a **540** (`ENEMIGO.jaguar`, `js/actores.js`), para que la curva de jefes suba.
Con el bot de antes (habilidad 0,65 / 0,85) gana 10/10 en 15-16 s perdiendo un 25-42 %. La nauyaca y el Guardián se quedan:
el Guardián ya pierde 2 de cada 10 llegando al 70 % y gana al segundo intento con la vida llena.

## Etapa 32 (2026-11-17): dificultad para jugar en el celular

**Revisión.** Los bots de las etapas 22-24 juegan mejor que una persona con el celular: pegan en cada cuadro y responden a un
aviso al instante. `bot_grupo.js` admite ahora `cadencia` (segundos entre toques de Atacar) y `reaccion` (segundos desde que
sale un aviso hasta poder responder); `mapas.mjs` los toma de `HAB`, `CAD` y `REAC`. Perfil «celular»: esquiva el 50 %,
toca cada 0,3 s y reacciona en 0,3 s. 12 partidas por mapa. `modelo_niveles.js` ya conoce al pejelagarto (fallaba desde la
etapa 25).

| Mapa (nivel del jugador) | Bot de antes | Celular, antes | Celular, después |
|---|---|---|---|
| Selva (1) | 22 % | 40 % | 38 % |
| 1-1, el tutorial (1) | 40 % | **40-49 %, el más difícil** | 33 % |
| 1-3 (2) | — | 25 % | 29 % |
| 2-2 / 2-4 (3 / 4) | 22 % / 25 % | 21-24 % / 35 % | 25 % / 46 % |
| 3-2 / 3-4 (4) | 8 % / 20 % | 15-20 % / 33 % | 42 % / 32 % |

Caídas: 1 de cada 12 partidas en los peores mapas, antes y después. La curva iba al revés: el tutorial era lo más duro y
el piso 3 lo más fácil, porque el jugador sube de nivel y los niveles no apretaban.

**Cambios:**
- **Aviso de la mordida del espíritu** de 0,4 a **0,55 s** (`ESPIRITU_MORDIDA`, `js/actores.js`): era el aviso más corto del
  juego (los demás, 0,55 s o más) y con el tiempo de reacción del celular casi no daba para esquivar.
- **Presupuesto de los niveles generados** (`PRESUPUESTO`, `js/niveles.js`): piso 2, de 14-20 a **16-22**; piso 3, de 16-23 a
  **19-26**. El piso 1 no cambia.

**Sin probar:** los jefes con el perfil «celular» (`bot_jefe.js` aún no tiene `cadencia` ni `reaccion`); con el bot de
antes, el Guardián gana 4-5 de 6 llegando al 70 % de la vida. Los números varían ±10 % entre tandas.

## Etapa 31 (2026-11-17): menos botones y más llamativos (análisis de controles tipo Soul Knight)

El usuario dejó una captura de los controles de Soul Knight (`Ejemplo de controles/`). Lo que hace que se jueguen fácil:
joystick a la izquierda, **un solo botón grande** que cambia según el contexto (atacar o interactuar), una habilidad de color
vivo y nada más; el apuntado es automático. Aplicado aquí (`index.html`, `js/motor.js`, `js/juego.js`):

- **De 9 botones a 4 fijos** (Atacar, Esquivar, Saltar, Defender) más los poderes solo si los tienes (Tierra, Especial).
- **Atacar es contextual:** junto a algo usable y sin enemigos a menos de 3 m, la espada pasa a una **mano dorada** y hace de
  Usar (mantenerla sigue lanzando la acción de senda); en un diálogo es **▸ Seguir**. El modo lo pone `hud()` en
  `data-modo` y `motor.js` lo lee al pulsar. Con un enemigo cerca siempre es espada.
- **Fuera Usar y Fijar** en táctil: el ataque ya apunta solo al más cercano; Fijar sigue en Tab.
- **Más llamativos:** fondo oscuro con relieve, borde y sombra, icono relleno y brillante con color por función (Atacar rojo,
  Esquivar verde, Saltar celeste, Defender azul, Tierra dorado, Especial morado). Al pulsar, se hunde y se ilumina de su color.
- En un diálogo se ocultan el joystick y los demás botones (solo queda ▸). Los avisos de arriba se corren para no quedar bajo
  la Bolsa.

**Pruebas:** a 844 × 390, junto al Santuario de Vida la mano lo usa y abre el diálogo, ▸ lo avanza; con una serpiente a 1,5 m
vuelve a ser espada y ataca; sin `[assert]` ni excepciones. **Falta probarlo en el celular.**

## Etapa 30 (2026-11-17): botones táctiles acomodados y con iconos

Primera prueba en un celular real: los controles responden, pero había muchos botones sueltos y con texto. Ahora (`index.html`):

- **Dos arcos alrededor de Atacar** (88 px, abajo a la derecha), al estilo de los juegos de acción para celular. Arco interior
  (r = 104 px, botones de 60 px): Esquivar, Saltar, Defender. Arco exterior (r = 176 px, 52 px): Fijar, Tierra, Especial, Usar.
- **Iconos SVG propios** en vez de texto (espada, doble flecha, flecha arriba, escudo, mira, montaña, estrella, mano, bolsa), con
  `aria-label`. Color por función: Atacar rojo, Defender azul, poderes (Tierra, Especial) dorado.
- Usar cambia a una flecha «seguir» en los diálogos (clase `seguir`); la espera de Tierra sale como número encima del icono
  (`data-espera`), sin borrarlo.
- La Bolsa pasa arriba, junto a la Pausa.

**Pruebas:** captura a 844 × 390 (celular en horizontal), con y sin diálogo; ningún botón se pisa; sin `[assert]` ni excepciones.

## Etapa 29 (2026-11-17): partes para el vuelo, el espíritu jaguar y los jefes (`js/cuadros.js`)

`PARTES` va ahora por cuadro (clave = nombre del sprite sin `1_03`) y `conPartes(e, nombre, fase)` sirve a cualquier enemigo:

- **Vuelo:** las alas de la avispa (16 Hz), la guacamaya (3,2 Hz) y el murciélago (4,6 Hz) aletean de verdad en `Volar`, al ritmo
  que ya tenía `movimiento`.
- **Espíritu jaguar:** cabeza y zarpa se lanzan en el mordisco. Como su cuerpo es macizo, la parte se pinta sobre el cuadro sin
  quitarlo (`sinHueco`): queda como un rastro luminoso en vez de un hueco.
- **Xolotl** (`Jefe_PerroFuego`): la cabeza se echa atrás en el aviso del zarpazo y muerde al soltarlo; las llamas de la cola se
  mecen siempre en ese cuadro.
- **Chac Mool** (`Jefe_GuardianOfrenda`): en la embestida, los dos puños se alzan mientras avisa y golpean el suelo al lanzarse.
- Autocomprobación: cada clave de `PARTES` tiene su sprite y sus rectángulos están bien orientados.

**Pruebas:** tira de 7 instantes por cuadro revisada en captura; pelea de 6 s con avispa, guacamaya, murciélago, jaguar y Guardián,
y el espíritu aparte (avisa y muerde): 62 FPS, sin `[assert]` ni excepciones. **Sin probar a mano ni en el celular.**

## Etapa 28 (2026-11-17): cuadros de ataque por partes para la fauna de la lámina (`js/cuadros.js`)

La fauna de Unity tiene **un solo cuadro de ataque**. Sin dibujar arte nuevo, `js/cuadros.js` recorta una parte de ese cuadro y la
mueve sobre su pivote: durante el **aviso** se prepara (con temblor al final) y en el **golpe** sale en 0,06 s, se pasa un 25 % y
se asienta. Al soltar el ataque, su cuadro se funde 0,12 s sobre el siguiente en vez de cambiar de golpe.

| Especie | Parte | Aviso | Golpe |
|---|---|---|---|
| Serpiente | cabeza y cuello | se echa atrás y arriba | se lanza hacia delante y abajo |
| Cocodrilo | mandíbulas | abre más | cierra de golpe |
| Mono | torso y brazos (y la cola, al revés) | se echa atrás | zarpazo hacia delante |
| Avispa | abdomen con aguijón (y alas a 14 Hz) | lo dobla bajo el cuerpo | pica |
| Guacamaya, murciélago | las dos alas (aletean) | las alzan | aletazo hacia abajo |

Los rectángulos y pivotes (`PARTES`) se midieron sobre los PNG con un mapa ASCII. Se pinta en un lienzo por enemigo del mismo
tamaño que el PNG (`dibujarEn` acepta `lienzo`), así el pivote del sprite no cambia y la estela, el espejo y el movimiento siguen igual.

**Pruebas:** tira de 7 instantes por especie revisada en captura (se quitó el avance de la mandíbula del cocodrilo y se redujo el
giro del mono porque abrían una raya); pelea real 4 s con las seis especies: 62 FPS, sin `[assert]` ni excepciones. Queda una costura
de un píxel en el cocodrilo y el mono durante ~0,05 s en el pico del golpe. **Sin probar a mano ni en el celular.**

## Etapa 27 (2026-11-17): onda al aterrizar, números que botan y restos por animal (`js/efectos.js`)

- **Onda al aterrizar:** un jefe o un enemigo pesado (tapir) que cae de más de 0,3 m (`EF.onda`) hace un anillo que se abre hasta
  2,2 m, 8 nubes de polvo alrededor, sacude la cámara 0,2 s y suena el impacto. Los demás levantan 3 nubecillas. Es solo visual: no
  hace daño (el daño sigue en las `marca` de cada ataque).
- **Números de daño:** salen a 11 px y bajan a 8 en 0,12 s, botan 0,6 m, rebotan 0,15 y suben despacio mientras se apagan; cada uno
  se aparta un poco hacia un lado para que no se tapen. También los avisos «¡Bloqueo!» y «¡Perfecta!». `texto()` acepta ahora el tamaño.
- **Restos al morir** según el animal (`RESTOS`): plumas rojas, azules y amarillas de la guacamaya y oscuras del murciélago, que
  frenan y caen meciéndose (duran el triple); escamas de la serpiente, el cocodrilo, la nauyaca y el pejelagarto; pelo de los
  mamíferos con su color (pecarí gris, ocelote dorado y negro, jaguar…); placas del armadillo; piedra y jade del Guardián. Los
  espíritus y ecos, chispas violetas como antes.

**Pruebas** (`prueba.mjs`): restos de guacamaya (10, flotan), cocodrilo (12), tapir (16) y espíritu (14) con sus colores; el
Guardián que cae de 1,5 m hace la onda; la altura del número 1,6 → 2,2 → 1,6 → 1,75 → 1,6 → sube; 61 FPS; autocomprobaciones de la
onda y los restos sin `[assert]`. **Sin probar a mano ni en el celular.**

## Etapa 26 (2026-11-17): efectos de golpe y ataque (`js/efectos.js`)

Para que los ataques se lean mejor, al estilo de los juegos de acción de vista cenital para celular y de los RPG de bolsillo (solo
técnicas del género; ningún arte ajeno). Afecta a **todos** los enemigos sin tocar su arte:

- **«!» de aviso** sobre el enemigo al empezar su aviso (pose `Aviso` de `movimiento`, o cualquier `marca` con `dueno`); da un brinco
  y dura 0,55 s, como mucho uno cada 0,55 s por enemigo.
- **Estocada con rebote:** la pose `Ataque` sale en 0,07 s, se pasa un 20 % y se asienta (antes era una pose fija). Polvo al lanzarla.
- **Golpe al jugador:** estrella de 8 puntas que se abre, tres zarpazos en la dirección del golpe, chispas rojas y una pausa de impacto
  de 0,05 s (`EF.pausaHerido`). No cambia el daño ni los tiempos de la dificultad.
- **Golpe del jugador:** chispas que salen en la dirección del golpe (doradas si el enemigo está roto). **Muerte:** 14 chispas
  violetas y una nube de polvo.
- **Polvo** al correr por el suelo a más de 3 m/s y **estela** (hasta 4 copias translúcidas) a más de 5,5 m/s: embestidas, saltos y
  retrocesos. Un salto de más de 2 m en un cuadro (aparecer, sumergirse) no deja estela.
- Valores en `EF`; autocomprobaciones al cargar (chispas y estela).

**Pruebas** (`prueba.mjs` con un guion de 5 s por enemigo, el jugador quieto): espíritu, tapir, ocelote, mono y cocodrilo muestran
«!», impacto, chispas y polvo; estela en ocelote, mono y cocodrilo; golpear da chispas y matar, el estallido; 62 FPS; sin `[assert]` ni
excepciones. **Sin probar a mano ni en el celular.**

## Etapa 25 (2026-11-17): el pejelagarto, enemigo de la charca

El séptimo animal: el pejelagarto (*Atractosteus tropicus*), el pez de los ríos y pantanos de Tabasco. Es una especie real.

- **Figura**, con el pintor de discos del cuadrúpedo (sin patas):
  - cuerpo largo y cilíndrico con **escamas en rombo** (las ganoideas), lomo pardo oliva más oscuro, manchas oscuras en
    hileras por los flancos y vientre crema;
  - hocico largo y ancho, con motas, ojo dorado, opérculo marcado y **dientes** al abrir la boca. La mandíbula de abajo gira
    desde su bisagra;
  - aletas dorsal y anal muy atrás, frente a frente, ventrales, pectorales que aletean y cola redondeada en abanico;
  - la columna integra el rumbo y la inclinación de cada tramo: así nada con una onda que crece hacia la cola, se arquea en S,
    alza el hocico o tuerce la cabeza de lado.
- **41 cuadros:** Nada ×8, Respira ×6 (sube el hocico y traga aire), Aviso ×4 (se arquea en S), Embiste ×5 (boca abierta que
  se cierra de golpe), Mordida ×4 (golpe de lado), Varado ×6 (de costado, coleteando), Daño ×2 y Muerte ×6 (panza arriba).
- **En el agua:** sumergido solo se ve su silueta oscura y una estela; en la superficie, la parte de arriba recortada en la
  línea del agua, la de abajo oscura y un anillo de onda.
- **Comportamiento** (`js/animales.js`, 44 de vida, Ruptura de 3, débil a la Luz):
  - **sumergido no se le puede golpear** (sigue contando para abrir la bajada). Nada hacia la orilla más cercana a ti;
  - **salto:** si estás a menos de 3,4 m, se arquea en la superficie 0,6 s y se lanza fuera del agua con la boca abierta; quita
    12. La franja (0,8 m de ancho) **te sigue** y se fija 0,25 s antes del salto, y llega 1,2 m más allá de ti (hasta 3,4 m):
    alejarse andando no basta, hay que apartarse o esquivar a tiempo;
  - si cae en tierra queda **varado** 1,6 s, coleteando, y luego se arrastra de vuelta al agua (y se zambulle sin asomarse):
    es cuando más se le pega. **Aguanta dos golpes en tierra**: al segundo da un coletazo y vuelve de un brinco al agua, sin
    que se le pueda golpear en el aire;
  - **mordida de lado:** si te metes en el agua a menos de 1,6 m, círculo de 0,85 m durante 0,38 s; quita 8;
  - **respira aire:** cada 5-7,5 s sube 1,5 s a la superficie, expuesto;
  - **aguante en el agua:** en cada asomada aguanta dos golpes; al segundo se sumerge de golpe.
  - Así, vencerlo lleva dos o tres saltos esquivados, no uno.
- **Dónde sale:** en las salas generadas del piso 2 (el de los pantanos de Unity), uno como mucho por nivel, con su **charca**
  de 5 × 3 m de agua que se vadea (frena como la del piso 2). La charca va en el centro de una sala sin tapir, mejor una de
  en medio, lejos de las escaleras y del santuario. Coste 4, como el ocelote: sale en unos 4 de cada 10 niveles del piso 2.
- **Pruebas** (Chrome sin ventana): la autocomprobación de niveles revisa que la charca esté en el suelo, que no tape
  escaleras ni santuario y que el pez esté dentro; recorre nada → aviso → salto (−12) → varado → vuelve; la mordida en el
  agua quita 8; al vencerlo se abre la bajada; sin errores en la consola.
- **Dificultad**, con el jugador automático de la etapa 24 (habilidad 0,65, nivel 3, 12 combates por enemigo):

  | Uno contra uno | Daño (% de la vida) | Segundos |
  |---|---|---|
  | Pejelagarto, primera versión | 4 % | 2,5: moría en su primera asomada |
  | Pejelagarto con aguante en el agua | 9 % | 3,7 |
  | **Pejelagarto final**, el jugador se mete al agua / espera en la orilla | **6 % / 2 %** | **4,6 / 5,4** |
  | Ocelote (mismo coste) | 9 % | 3,8 |
  | Cocodrilo / armadillo / espíritu | 3 % / 0 % / 2 % | 5,1 / 2,2 / 2,3 |

  **Salto y varado** (segunda pasada): el jugador automático `bot3.js` del registro de pruebas puede **esperar en la orilla**
  sin entrar al agua, así que el pez solo puede atacarle saltando. Se contaron saltos, aciertos, varados y en qué estado
  recibe cada golpe:
  - el salto se esquiva casi siempre: acierta unas 2 veces de cada 18. Con una franja fija y 0,85 s hasta el golpe bastaba con
    alejarse andando; por eso ahora la franja sigue al jugador. Con 0,45 s de aviso o una franja de 1 m no acertaba más;
  - en la primera versión moría en su **primer varado** (16 por golpe contra 54 de vida: 3-4 golpes, y caía junto al
    jugador), y al volver al agua se quedaba 0,55 s asomado junto a la orilla. Acortar el varado a 0,7 s no lo cambiaba: el
    arreglo fue el aguante de dos golpes en tierra con el brinco de vuelta, más vida (de 36 a 44) y zambullirse sin asomarse;
  - ahora cada combate pasa por 1-2 varados. Esperando en la orilla es poco peligroso (2 %): un salto bien avisado es
    justo, y quien lo esquiva lo castiga.
  - Probado bajar su coste a 3: el 2-4 subía al 45 % de la vida; se queda en 4.

  Niveles enteros del piso 2, 10 pasadas cada uno: con charca, 16-38 % (media 26,5 %); sin charca, 25-31 % (media 28 %).
  La charca no los hace más difíciles en promedio. Ninguna caída. **Sin probar a mano.**

## Etapa 24 (2026-11-13): dificultad de los enemigos de antes y de los mapas

**Revisión** con el jugador automático (`bot2.js` del registro de pruebas: va a por el enemigo más cercano del grupo y
reacciona a avisos, proyectiles y embestidas como el de la etapa 23), en dos pasadas:
- **Uno contra uno**, al nivel 2: casi todos morían **antes de su primer ataque** (1-5 s, 0-6 % de la vida). La causa: cada
  golpe del jugador cancelaba el ataque de la fauna y la aturdía 0,25 s, así que pegando seguido nunca llegaba a atacar; el
  cocodrilo, con 60 de vida, no acertó ni una vez. El **espíritu corrompido** era la excepción: golpeaba al tocarte, sin
  aviso, y era el más dañino por su coste (20 %). El **eco borrado** moría antes de disparar.
- **Mapa por mapa**, limpiando cada grupo de enemigos cercanos con el nivel esperado:

| Mapa | Antes | Después |
|---|---|---|
| Aldea (incursores) | 28 % | 3 % |
| Selva | 26 % | 24 % |
| **Piso 1, el tutorial** | **79 %, 1 caída de cada 5** | **23 %** |
| Piso 2 (sin el jaguar) | 41 % | 31 % |
| Piso 3 (antesala) | 14 % | 0 %, un respiro antes del Guardián |
| Niveles generados | 22-33 % | 15-33 % |

**Cambios:**
- **Aguante de la fauna** (`FA.aguante`, `js/fauna.js`): un golpe la tambalea (interrumpe, aturde y empuja) como mucho
  **una vez cada 2,5 s**; los demás golpes dañan pero no la paran. El bloqueo perfecto la sigue aturdiendo siempre.
- **El espíritu corrompido avisa** (`ESPIRITU_MORDIDA`): a menos de 1,1 m se para, marca un círculo de 0,75 m delante
  durante 0,4 s y se lanza; quita lo mismo (10) y espera 1 s.
- **Eco borrado:** vida de 20 a 30 y primer disparo antes (0,6 s), para que llegue a disparar.
- **Vida de los enemigos comunes ×1,5** (`VIDA_COMUN`, `js/actores.js`), para que lleguen a atacar 1-2 veces: espíritus,
  ecos, la fauna de la lámina y los animales nuevos. Los jefes, no.
- **Presupuestos de los niveles generados** un 25 % más altos (`PRESUPUESTO`): piso 1, de 11 a 15; piso 2, de 14 a 20; piso 3,
  de 16 a 23.

## Etapa 23 (2026-11-13): dificultad de los jefes

**Revisión con un jugador automático** (`bot.js` del registro de pruebas). El bot usa el código real del juego, avanzado a mano
de 1/60 en 1/60 s: se acerca y ataca, y cuando un aviso o un proyectil está a punto de alcanzarlo reacciona con una
probabilidad (0,65 un jugador regular, 0,85 uno bueno). Si reacciona, sale o esquiva; si no, recibe el golpe. Al bajar del
35 % de la vida se come una semilla. Se probó al nivel y con la vida con que se llega a cada jefe según el modelo de la
etapa 22, con la semilla del X-4 anterior.

| Jefe | Antes | Después (regular / bueno) |
|---|---|---|
| Nauyaca (1-5, nv 2) | cae en 6 s y apenas ataca | gana 8/8 y 8/8, pierde un 20-46 % de la vida |
| Jaguar (2-5, nv 3) | cae en 4 s sin llegar a saltar | gana 8/8 y 8/8, pierde un 34-40 % |
| Guardián (3-5, nv 4, llega al 70 %) | cae en 14-17 s | gana 5/8 y 8/8; regular, acaba casi sin vida |
| Guardián, segundo intento (al 100 %) | — | gana 8/8 y 8/8 |

El bot pega más seguido que una persona: las peleas reales durarán más o menos el doble (unos 25 s la nauyaca y el jaguar
y un minuto el Guardián).

**Cambios:**
- **Más vida:** nauyaca de 140 a 380, jaguar de 160 a 420 y Guardián de 400 a 700. En Unity siguen con 160 y 400.
- **Contraataque** de los tres jefes (`contraataque`, `CONTRA` en `js/actores.js`): si reciben 6 golpes en 2,5 s, se sacuden con
  un círculo avisado de 2,2 m (0,4 s) que quita 8 y empuja. Cada 4 s como mucho. Ya no se les gana quedándose pegado.
- **Jaguar más agresivo:** acecha 0,7-1,1 s entre ataques (antes 1-1,6) y, si cae del salto con el jugador cerca, encadena un zarpazo.

## Etapa 22 (2026-11-13): dificultad de los niveles generados

**Revisión.** Un modelo de daño esperado (`analisis.js` del registro de pruebas) estimó cuánto pierde un jugador correcto en
cada nivel. Supone que esquiva el 65 % de los ataques avisados y el 40 % de los de contacto, y que en cada sala mata a los
enemigos uno tras otro mientras los demás atacan. Se midió con 5 semillas y la vida y el ataque reales de Balam en cada nivel.

| | Antes | Después |
|---|---|---|
| Enemigos por nivel | 6-17 (manadas sin contar) | 2-7 |
| Daño esperado por nivel (% de la vida) | 61-155 % (hasta 273 %) | **28-42 %** (hasta 57 %) |
| 1-2, el primer nivel generado | 151 %: el más difícil del piso 1 | 30 %: el más fácil |
| Caídas encadenando el 1-2 al 3-4 | varias por nivel | 0,6 por partida, solo en las peores semillas |

**Cambios** (`js/niveles.js`):
- **Presupuesto de amenaza por nivel** en vez de enemigos por sala. Cada tipo cuesta según su peligro (`COSTE`):
  serpiente, murciélago, avispa, guacamaya y armadillo, 2; espíritu, cocodrilo y mono, 3; ocelote y pareja de aulladores, 4;
  manada de pecaríes y tapir, 6. Presupuestos (`PRESUPUESTO`): piso 1, de 10 a 12; piso 2, de 12 a 16; piso 3, de 13 a 18 (subidos en la etapa 24).
  Se eligen los grupos con el presupuesto de todo el nivel y se reparten por las salas, los grandes primero y donde menos carga
  hay. Antes de la nauyaca, casi nada.
- **Santuario de Vida en el X-3** (1-3, 2-3 y 3-3), en la primera sala. Cura la mitad, una vez por incursión
  (`incursion.vida_<nivel>`), como el del 2-5. Es una fuente de curación: la vida sigue sin regenerarse.
- **Semilla medicinal preparada** (cura 20, tecla 1) al limpiar el X-2 y el X-4, los niveles lejos de un santuario.
- **Dos semillas preparadas** al vencer a la nauyaca, para no llegar al piso 2 sin vida.
- **Más experiencia al limpiar un nivel**: 15 × piso + 10 × nivel (antes 10 × piso + 5 × nivel).

**Sin ajustar jugando:** el modelo es una estimación. La dificultad real depende de cómo se juega y está por probar a mano.
Para retocarla, basta con `PRESUPUESTO` y `COSTE`.

## Etapa 21 (2026-11-13): movimiento por código para los enemigos de antes (`js/movimiento.js`)

Los enemigos de la lámina de Unity (serpiente, cocodrilo, mono, avispa, guacamaya y murciélago), el espíritu jaguar y los dos
jefes tienen un solo cuadro por pose. Sin tocar su arte, `movimiento(e, estilo, pose, progreso)` estira, aplasta, inclina y
desplaza el sprite alrededor de su pie (`dibujarEn` acepta ahora `sx`, `sy`, `giro`, `dx` y `dy`):

- **Reposo:** respira (el alto sube y el ancho baja un 2-4 %). Los voladores y el espíritu flotan.
- **Andar y correr:** bota a cada paso (de 0,6 px el cocodrilo a 3,5 px el mono), se bambolea y se aplasta al pisar. Al correr
  va inclinado hacia delante. **La serpiente no bota: ondula.**
- **Volar:** aletea (se ensancha y se encoge al ritmo de las alas: 16 veces por segundo la avispa, 4,6 el murciélago con
  mucha amplitud, 3,2 la guacamaya) y flota; se inclina hacia donde va.
- **Aviso de ataque:** **anticipación**. Se encoge y se echa atrás cada vez más durante el aviso, y tiembla al final.
- **Ataque:** **estocada**. Se estira hacia delante.
- **Defensa:** se agacha y se ensancha.
- **Golpe recibido:** sacudida hacia atrás de 0,22 s.
- **Al aterrizar** de un salto o una esquiva: se aplasta 0,16 s.
- **Media vuelta:** al cambiar de lado se estrecha y se vuelve a abrir en 0,14 s, en vez de voltearse de golpe.
- **Muerte:** se vuelca hacia atrás y se hunde.
- **Estilos** (`ESTILOS`): cada animal tiene su ritmo de paso, bote, bamboleo, respiración y aleteo. El jaguar avisa el zarpazo
  y el rugido, y corre en el salto. El Guardián camina con peso y se echa atrás al avisar.

Los animales nuevos (etapas 15-20) no lo usan: ya tienen animaciones de varios cuadros.

## Etapa 20 (2026-11-13): el armadillo, enemigo que excava

El sexto animal: el armadillo de nueve bandas (*Dasypus novemcinctus*), el «toche» de Veracruz y Tabasco. Es una especie real.
**No se hace bola**: esta especie no puede enrollarse del todo (eso lo hace el armadillo de tres bandas, sudamericano). Por eso
sus ataques salen de lo que hace el animal de verdad: excava, se sobresalta con un salto vertical y se encoge bajo la coraza.

- **Figura**, con el esqueleto de cuadrúpedo:
  - coraza en cúpula con **escudos de escamas en rombo** delante y detrás y **bandas móviles** en medio. Son cinco y no nueve:
    a 22 px de cuerpo, nueve bandas no se ven;
  - cabeza fina con escudo, hocico largo, **orejas altas**, cola larga anillada, piel rosácea por debajo y uñas largas;
  - puede **erguirse** sobre las patas de atrás para olfatear y **encogerse** metiendo cabeza y patas bajo la coraza.
- **47 cuadros:** Reposo ×8 (olfatea), Paso ×8, Carrera ×6, Aviso ×4 (se yergue), Excava ×6 (hocico abajo y escarba), Salto ×4,
  Encoge ×3, Daño ×2 y Muerte ×6 (queda panza arriba).
- **Comportamiento** (`js/animales.js`, 34 de vida, Ruptura de 3, débil a la Tierra):
  - al verte se yergue y ronda entre 1,8 y 3,2 m;
  - **excava** cada 2,4-3,6 s: escarba 0,55 s y se mete bajo tierra, donde **no se le puede golpear** y solo se ve un rastro de
    tierra que avanza hacia ti. Un círculo de 0,95 m avisa 0,55 s dónde sale (donde estés) y al salir quita 9 y empuja;
  - **sobresalto:** si te le echas encima (a menos de 1,1 m) da un salto vertical de 0,9 m, invulnerable, y si cae sobre ti quita 5;
  - **coraza:** al recibir un golpe, el 45 % de las veces se encoge 1,3 s y los golpes solo le hacen el 25 %. **El golpe de
    Tierra la atraviesa**;
  - bajo tierra sigue contando para abrir la bajada del nivel.
- **Dónde sale:** en las salas generadas de los pisos 1 y 2.

## Etapa 19 (2026-11-13): el mono aullador, enemigo a distancia en pareja

El quinto animal: el mono aullador de manto (*Alouatta palliata mexicana*), de Veracruz y Tabasco. Es una especie real.

- **Esqueleto de primate** (con el mismo pintor de discos):
  - el torso va de la pelvis al pecho y gira de erguido (sentado) a horizontal (a cuatro patas);
  - brazos largos y piernas de dos tramos con IK;
  - cabeza redonda en su propio grupo, con contorno contra el cuerpo y cuello;
  - cola prensil en arco que se enrosca en la punta.
- **Figura:** pelo negro, **manto** de pelo largo pardo dorado en los flancos (en mechones), cara desnuda pardo oscura con
  barba y boca redonda al aullar. El brazo y la pierna de este lado van más claros, para que se lean sobre el cuerpo negro.
- **46 cuadros:** Reposo ×8 (sentado, respira y mece la cola), Anda ×8 y Corre ×6 (a cuatro patas), Aviso ×4 (toma aire),
  Aullido ×6 (cabeza en alto y boca abierta), Lanza ×5 (brazo atrás y adelante con el fruto en la mano), Daño ×2 y Muerte ×6.
- **Comportamiento** (`js/animales.js`, 30 de vida, Ruptura de 2, débil a la Tierra):
  - sale **en pareja**; se sienta a 3,8-6 m y **te lanza frutos** (6 de daño, en línea recta) cada 1,6-2,4 s;
  - **aullido** cada 6,5 s si estás a su alcance: toma aire 0,8 s (anillo avisado de 4 m) y aúlla. Quita 4 y te
    **aturde**: andas al 30 % durante 1,6 s. **Los de la pareja aúllan por turnos**, nunca a la vez;
  - si te acercas a menos de 2,6 m, **huye a cuatro patas** a otro punto a su distancia, del lado contrario o de lado si atrás
    hay muro;
  - esquiva saltando como los demás que van a pie (25 %).
- **Dónde sale:** en las salas generadas de los pisos 1 y 3.

## Etapa 18 (2026-11-13): el ocelote, enemigo ágil

El cuarto animal: el ocelote (*Leopardus pardalis*), de las selvas de Veracruz y Tabasco. Es una especie real.

- **Figura**, con el esqueleto de cuadrúpedo:
  - pelaje leonado, vientre y barbilla blancos, dos rayas negras en la mejilla y motas en la frente;
  - patas moteadas, cola larga anillada que cae y sube en la punta;
  - orejas negras con mancha blanca (se aplanan al bufar) y ojos ámbar con pupila;
  - **rosetas en cadena** (anillo negro, abierto a veces, y centro más oscuro). Se calculan sobre el cuerpo, a lo largo de la
    columna y a lo alto del tubo, y no sobre la pantalla: así no bailan de un cuadro a otro.
- **42 cuadros:** Reposo ×8 (mece la cola), Acecho ×8 (anda agazapado), Correr ×6 (galope con la columna que se encoge y se
  estira), Aviso ×4 (bufa con las orejas aplanadas y menea la grupa), Salto ×5 (se estira, manos delante y patas atrás),
  Zarpazo ×4, Daño ×2 y Muerte ×6.
- **Comportamiento** (`js/animales.js`, 40 de vida, Ruptura de 3, débil a la Luz):
  - te ve a 6 m, bufa y te acecha agazapado a unos 3,2 m, rodeándote despacio;
  - **se abalanza:** marca un círculo de 0,95 m donde estás (0,5 s) y salta en arco, hasta 0,8 m de alto y 4,2 m de lejos;
    quita 11 si sigues dentro;
  - si cae cerca, encadena **dos zarpazos** rápidos (6 cada uno) y luego se **retira a la carrera** para volver a acechar;
  - **esquiva el 40 %** de los golpes (los demás que van a pie, el 25 %).
- **Dónde sale:** en las salas generadas de los pisos 2 y 3.

## Etapa 17 (2026-11-13): el tapir, enemigo élite pesado

El tercer animal: el tapir centroamericano o danta (*Tapirus bairdii*), del sur de Veracruz y Tabasco. Es una especie real.

- **Figura**, con el esqueleto de cuadrúpedo del pecarí y dos piezas nuevas, la trompa y la cola:
  - mide unos 2 m de largo y sale en un lienzo de 152 × 104 px;
  - cuerpo en pera con la grupa alta y pelo corto pardo oscuro con lustre en el lomo;
  - mejillas y garganta crema, orejas ovaladas con borde blanco, trompa corta que se mueve olfateando;
  - patas gruesas casi rectas, con uñas claras;
  - **encabritarse**: gira la delantera sobre las caderas y deja colgar las manos.
- **38 cuadros:** Reposo ×8 (olfatea y mueve la oreja), Paso ×8 (paso lateral, las cuatro patas en secuencia), Carga ×6,
  Aviso ×4 (silba con la trompa en alto), Pisotón ×6 (se encabrita y cae), Daño ×2 y Muerte ×6 (se le doblan las patas).
- **Comportamiento** (`js/animales.js`, 90 de vida, Ruptura de 5, débil a la Tierra):
  - **pesado:** tus golpes no lo hacen retroceder y su cuerpo te aparta (salvo esquivando);
  - tranquilo hasta que te acercas a 5 m o lo golpeas; entonces silba y te sigue al paso;
  - **embestida:** franja de 4,5 × 1,4 m avisada 0,8 s, a 6 m/s; quita 14 y empuja fuerte. Contra un muro queda aturdido 1,2 s;
  - **pisotón** desde menos de 2,3 m: se encabrita y cae en un círculo de 2,1 m delante de él, que quita 10 y empuja;
  - tras cada ataque queda **expuesto 1 s**.
- **Dónde sale:** uno en la sala más grande de las generadas del 2-3, del 2-4 y del piso 3, casi siempre (85 %).

## Etapa 16 (2026-11-13): el pecarí de collar, enemigo en manada

El segundo animal de Veracruz y Tabasco: el pecarí de collar (*Dicotyles tajacu*). Es una especie real.

- **Esqueleto de cuadrúpedo** en `herramientas/animales.mjs` (`pintarCuadrupedo`):
  - cuerpo, cuello y cabeza son cadenas de discos sombreados, como la nauyaca;
  - cada pata tiene dos tramos con IK de dos huesos (la articulación hacia delante en las de delante y hacia atrás en las
    de atrás) y pisa según su marcha: trote por parejas en diagonal o galope rotatorio;
  - las patas del lado lejano van detrás del cuerpo y más oscuras, con una línea donde una parte tapa a otra;
  - servirá para el tapir, el ocelote, el mono aullador y el armadillo.
- **Figura:** pelo gris pardo jaspeado (grano fino por píxel), crin oscura en el lomo, collar claro en diagonal por delante
  de los hombros, cabeza en cuña con disco del hocico, oreja corta y pezuñas. Mide 1,1 m, el tamaño de la fauna de la lámina.
- **38 cuadros:** Reposo ×8 (hoza con el hocico), Trote ×8, Carga ×6 (galope con la cresta erizada), Aviso ×4 (eriza la
  cresta, sacude la cabeza y castañetea), Ataque ×4 (mordida hacia arriba), Daño ×2 y Muerte ×6 (cae de lado).
- **Comportamiento** (`js/animales.js`, 26 de vida, Ruptura de 2, débil a la Luz):
  - hoza hasta que te acercas a 5 m; entonces avisa y alerta a los de su manada a menos de 6 m. Herir a uno también los alerta;
  - ronda al trote entre 2,2 y 3,6 m;
  - **embestida:** franja de 4 m avisada 0,55 s, a 6,5 m/s; quita 9. Si choca con un muro queda aturdido 0,8 s;
  - **mordida** desde menos de 1,3 m, que quita 6;
  - esquiva saltando como los demás que van a pie (25 %).
- **Dónde sale:** en las salas generadas de los pisos 1 y 2, siempre en **manada de tres** (cuentan como tres enemigos).

## Etapa 15 (2026-11-13): la nauyaca real, sub-jefe del 1-5 (`js/animales.js`)

Es el primer animal de Veracruz y Tabasco. Es una especie real, la nauyaca (*Bothrops asper*), y no una figura mitológica.

- **Figura dibujada por código:** `herramientas/animales.mjs` la pinta en pixel art y escribe sus cuadros en
  `arte/Animales/` y sus datos en `datos/animales.js`. Se vuelve a generar con `node herramientas/animales.mjs`.
  - El cuerpo es una columna de discos sombreados como un tubo: luz de arriba a la izquierda, rampa de 4 a 6 tonos con trama
    de Bayer, contorno oscuro y una línea donde una vuelta del cuerpo tapa a otra.
  - El dibujo es pardo oliva, con triángulos oscuros de borde crema que forman X en el lomo y vientre amarillento. La
    cabeza es de lanza, ancha detrás de los ojos, con labios claros y franja clara tras el ojo. La lengua es negra.
  - La boca abierta tiene la mandíbula que gira desde la bisagra, el interior rosado y los colmillos.
  - Hay **33 cuadros**: Reposo ×8 (enroscada, respirando y sacando la lengua), Reptar ×8 (ondulación lateral), Aviso ×4 (se
    enrosca y alza la cabeza), Golpe ×5 (estira el cuello y abre la boca), Daño ×2 y Muerte ×6 (se afloja y se voltea,
    enseñando el vientre). Cada pose es una curva que depende del tiempo, no un dibujo distinto por cuadro.
- **Combate** (140 de vida, Ruptura de 4, débil a Tierra y Luz):
  - despierta a 6,5 m y se acerca reptando hasta quedar a distancia de mordida;
  - **mordida larga**: avisa una franja de 2,9 m durante 0,8 s y se lanza;
  - **mordida rápida**, desde menos de 1,7 m: franja de 1,8 m y 0,45 s de aviso;
  - la mordida quita 14 y su **veneno entumece**: el jugador anda al 55 % durante 2,5 s;
  - tras morder queda expuesta 0,9 s;
  - **con la mitad de la vida** avisa un 25 % menos y muerde dos veces seguidas.
- Al vencerla se marca `olm.subjefe_1_vencido` y se abre la bajada al 2-1. Sustituye al cocodrilo provisional.

## Etapa 14 (2026-11-13): la mazmorra por niveles (`js/niveles.js`)

Cada piso tiene cinco niveles, del X-1 al X-5. El número sale en el HUD («Nivel 2-3 · quedan 4») y en un aviso al llegar:

| Piso | X-1 | X-2 a X-4 | X-5 |
|---|---|---|---|
| 1 | El Umbral (piso 1 de Unity) | salas generadas | arena del sub-jefe, generada |
| 2 | sala generada | salas generadas | El Pantano y el jaguar (piso 2 de Unity) |
| 3 | sala generada | salas generadas | la antesala y el Guardián, el jefe final (piso 3 de Unity) |

- **Salas generadas:** de 2 a 4 salas en fila de oeste a este (más cuanto más hondo), unidas por pasillos de 3 de ancho.
  - El suelo son losas de 1 m recortadas del suelo prerenderizado de su piso de Unity: las del interior, las del borde de
    atrás con sus matas y las del borde de delante con su cara de piedra. Se evitan las celdas con agua o con sombras de objetos.
  - Los muros de basalto van en el borde de atrás y en el del oeste, como hace `OlmecaDungeonGenerator`.
  - Cada sala lleva braseros, a veces cristales y esteras, pinchos en los pasillos desde el nivel 1-3 y vasijas.
- **Enemigos por piso:** espíritus, murciélagos y serpientes en el 1; espíritus, cocodrilos, avispas y serpientes en el 2;
  espíritus, monos, guacamayas y cocodrilos en el 3. Hay hasta 3 por sala, y más cuanto más hondo.
- **La bajada** está al este de la última sala y se abre al vencer a todos los enemigos del nivel. Al abrirse da
  experiencia (10 × piso + 5 × nivel). La subida, en la escalera de la primera sala, vuelve al nivel anterior.
- **Semilla por incursión** (`incursion.semilla`): dentro de una incursión, volver a un nivel da la misma sala y, si estaba
  limpio (`incursion.limpio.<nivel>`), sin enemigos. Al salir a la selva todo eso se borra y las salas cambian.
- **Sub-jefe del 1-5:** su arena es una sala de 13 × 9. Es la nauyaca real (etapa 15). Al vencerla se marca
  `olm.subjefe_1_vencido` y se abre la bajada al 2-1.
- La autocomprobación de `niveles.js` genera todos los niveles y comprueba que se va de la llegada a la bajada y que los
  enemigos están en el suelo.

## Etapa 13 (2026-11-13): el Guardián salta y los jefes toman figuras de la lámina

1. **Salto del Guardián** (solo HTML). Es un ataque nuevo a distancia, que sale en el primer ataque lejano y luego cada cuatro (`eligeAtaque`):
   - se agacha y marca un círculo de 1,8 m donde estabas. El aviso dura 1,6 veces el normal (menos en la fase 3);
   - vuela en los últimos 0,5 s, hasta 2 m de alto, y cae con sacudida. Hace 20 de daño y empuja;
   - al caer queda expuesto 0,9 s. Si donde estabas hay una columna, cae en el último punto libre del camino;
   - un cambio de fase en pleno salto lo cancela.
2. **Figuras de la lámina «Jefes de Mazmorra»** para los dos jefes. Son las de Unity: `Sprites/Jefes`, que recorta
   `Tools/ArtPipeline/recortar_jefes.py` y `sincronizar.mjs` ahora también copia. Así el HTML y Unity usan el mismo arte:
   - **Guardián de la Piedra Viva → Chac Mool** (`Jefe_GuardianOfrenda_*`), a escala 1,5. Erguido usa Reposo; Paso y Golpe,
     Avance; Embestida, Ataque; Rugido, Especial; y Liberado, Desplome. Dormido usa Reposo en gris, como una estatua;
   - **Espíritu del Jaguar → Xolotl Infernal** (`Jefe_PerroFuego_*`), a escala 1,5: es el único cuadrúpedo de la lámina.
     Reposo usa Reposo; Caminar y avisar, Avance; zarpazo y salto, Ataque; rugido, Especial; y liberado, Desplome;
   - solo hay vista de lado, volteada según hacia dónde miran. Si faltara el arte, vuelven sus figuras anteriores;
   - **nota cultural:** el Chac Mool es tolteca y maya, y Xolotl, mexica; ninguno es olmeca. Usarlos en el arco olmeca es una
     licencia del autor que la historia (`Docs/Historia_Mundo.md`) no recoge. En Unity eran ecos ficticios de la arena de pruebas
     (`Docs/Enemigos/Jefes_Prueba.md`). Los nombres de los jefes no cambian.
3. Cómo pasar todo lo que solo existe en la versión HTML a Unity: `PORTAR_A_UNITY.md`.

## Etapa 12 (2026-11-13): salto y aviso de girar el celular

1. **Salto** con `K` o el botón táctil Saltar (encima de Usar). Solo existe en la versión HTML: Unity no tiene salto.
   - Sube 0,83 m y dura unos 0,7 s (6 m/s con la gravedad de −20). Solo desde el suelo, sin defender ni esquivar.
   - En el aire se pasa por encima de los pinchos y las placas de presión.
   - No sirve para subir terrazas ni escalones de más de 0,35 m. Así no se salta rampas ni atajos de la mazmorra.
   - Los enemigos que van a pie también saltan: los espíritus y la fauna que no vuela (serpiente, mono, cocodrilo) brincan
     hacia ti mientras te persiguen, cada 2,5 a 5 s, si estás a entre 1,5 y 5 m. El jaguar ya tenía su salto avisado; el eco,
     la fauna voladora y los jefes no saltan.
   - Las voladoras (guacamaya, avispas y murciélagos) esquivan saltando: cuando un golpe tuyo las va a alcanzar, un 35 % de
     las veces suben de un brinco (0,5 s, invulnerables) y sale «Esquiva». Después esperan 3 s; aturdidas o atacando, no pueden.
   - Los que van a pie (espíritus, serpiente, mono y cocodrilo) también esquivan saltando: un 25 % de las veces brincan
     hacia atrás antes del golpe (0,4 s invulnerables), con 3 s de espera. Con la Ruptura rota no pueden.
     Los jefes (jaguar y Guardián) también esquivan, pero solo mientras acechan: no avisando o haciendo un ataque, ni en el
     salto del jaguar, ni en la embestida o el rugido de cambio de fase del Guardián.
2. **Celular en vertical:** en táctil, sale una pantalla que pide girarlo y el juego se pausa. En PC no sale nunca.
3. En vertical, la escala se calcula por el lado corto, para que la cámara no se acerque de más.

## Etapa 11 (2026-11-13): acciones de senda y trampas

1. **Acciones de senda** (`Docs/Sistemas/Acciones_Senda.md`, datos de `AccionesSenda`):
   - junto a un habitante con algo para tu Guardián, el aviso dice «Hablar · mantén E: Persuadir» (en táctil, «mantén: …»);
   - **tocar** Usar habla como siempre; **mantener 0,5 s** (tecla o botón táctil) lanza el verbo del Guardián: Indagar
     (Itzel, Ocel), Persuadir (Balam, Naira) o Escuchar (Xali, Ameyali, Yaret);
   - un anillo dorado se llena sobre el jugador desde los 0,1 s (`HoldRing`);
   - sus líneas y, al terminarlas, su recompensa (objetos, experiencia, recetas u ofertas), **una vez por partida**
     (`senda.<npc>.<verbo>`). Alejarse a media pulsación no cuenta. Cambiar de Guardián permite probar otro verbo;
   - con los habitantes sin acción disponible, Usar responde al pulsar, como antes.
2. **Trampas y adornos de la mazmorra**, en los sitios de `OlmecaDungeonGenerator.Props`:
   - **pinchos** (`SpikeTrap`): suben cada 3,5 s, con 0,7 s de aviso parpadeante, se quedan 1,1 s arriba y hacen 8 de
     daño. Los vecinos van desfasados 1,2 s;
   - **placa de presión** (piso 1, `PressurePlate`): al pisarla sube sus dos pinchos y se suelta a los 0,4 s de salir;
   - **braseros** (3 cuadros a 6 por segundo) y **cristales de memoria** (2 a 1,5), sólidos y sin luces, como pide Bajo;
   - **esteras** en el suelo y una **cabeza de piedra** en el piso 2;
   - las **cercas de estacas** existen en Unity (`StakeFence`), pero ningún piso las coloca: no se han portado.

## Etapa 10 (2026-11-13): pulido

1. **Fijar objetivo** con `Tab` o el botón táctil Fijar, como `PlayerAttack.ToggleLockOn`:
   - fija al enemigo vivo a menos de 8 m que más convenga (cerca y delante pesa más); las vasijas no;
   - se suelta al volver a pulsar, al vencerlo o a más de 12 m;
   - los golpes apuntan siempre a él y el panel de Ruptura no caduca;
   - la cámara se inclina hacia él (0,35 de la distancia, con tope de 2,5 m), como `IsometricCameraFollow`;
   - se marca con un rombo dorado encima y un anillo a sus pies.
2. **Los habitantes son sólidos:** el jugador ya no los atraviesa. Ellos siguen su ruta sin esquivar, como `NpcPatrol`.
3. **Caída con gravedad** (−20, la del `CharacterController`) al bajar de un nivel del montículo: 1 m tarda unos 0,3 s.
4. **Rendimiento:** las colisiones usan una rejilla de celdas de 2 m en vez de recorrer las ~600 cajas. Da lo mismo que
   recorrerlas (comprobado en 100 000 puntos) y es unas 10 veces más rápido.
5. **Corrección:** el primer toque o la primera tecla crean el audio, y eso congela la página unos 150 ms. La pulsación
   caducaba antes del siguiente cuadro y se perdía (pasaba con la especial y el primer golpe). Ahora una pulsación hecha
   después del último cuadro siempre vale.

## Etapa 9 (2026-11-13): el resto de las recompensas

1. **Fauna hostil**, con `WildEnemy.cs` y los datos de cada `ED_` (vida, velocidad, ataques, defensas, escudo y debilidades):
   - selva: serpiente, guacamaya, mono y un nido de tres avispas. Reaparecen a los 20 s;
   - piso 1: dos murciélagos. Piso 2: dos cocodrilos. En la mazmorra no reaparecen;
   - formas de moverse: perseguir, zigzag, mantener la distancia, emboscada y errática;
   - ataques avisados: círculo, embestida en franja y proyectil;
   - especiales: escupitajo que frena, coletazo, doble zarpazo, piedras en abanico y chillido que frena;
   - defensas: guardia, coraza frontal (el cocodrilo recibe la mitad de frente), desvanecerse, salto atrás, vuelo alto y apartarse;
   - las avispas atacan en enjambre y el murciélago se cura con lo que muerde;
   - **botín** `BOT_fauna`, con menos experiencia al repetir, y su Ruptura.
2. **Vasijas rompibles** (`BreakablePot`) en los tres pisos, en los sitios de `OlmecaDungeonGenerator`: un golpe o la
   Tierra las rompen, dan `BOT_vasija` y vuelven al recargar el piso.
3. **Vender** en el puesto del comerciante, como `Economy.CanSell`: un objeto por su valor en ecos. Nunca la moneda, lo
   único, lo de la historia ni lo equipado.
4. **Museo de la Memoria:** se abre al cerrar el mensaje del santuario de Memoria (`MemoryShrine.End`). Muestra la
   cultura y sus Guardianes liberados, reliquias, Bendiciones, objetos de la historia y coleccionables, con su origen (D/I/F).
5. **Códice de la Memoria:** pestaña siempre presente en el menú. Sus 8 páginas aparecen con su aviso (`examinar:reflejo`,
   `llegar:mazmorra_piso1`…) o su bandera (`ofrenda.p1_especial`…), con el aviso «Nueva página del Códice». Se guardan como
   `codice.<id>`. Al cargar una partida antigua, las páginas cuya bandera ya se cumplía aparecen sin aviso.
6. **Aviso para Unity:** en `CUL_olmeca.asset` el nombre «Espíritu del Jaguar» tiene la «í» guardada en Latin-1, no en
   UTF-8. Al sincronizar se lee bien, pero conviene volver a escribirlo en el Inspector.

## Etapa 8 (2026-11-13): la Ruptura

Con `BreakGauge.cs` y `Docs/Sistemas/Ruptura.md`:

1. **Escudo y debilidades:** espíritu y eco 3 (Luz, Agua), Espíritu del Jaguar 5 (Luz, Tierra), Guardián 6 (Agua, Viento).
   La fauna trae los suyos de `EnemyData`.
2. **Quitan un punto:** cada golpe con la afinidad del Guardián en juego, si es una debilidad, y cada bloqueo perfecto
   (también a los jefes). El golpe de tierra es siempre Tierra.
3. **Roto** 2,5 s (3 los jefes): recibe ×1,5 de daño, y los espíritus y la fauna quedan aturdidos. Los jefes no.
   Al terminar, el escudo vuelve entero.
4. **Panel** sobre la barra del jefe (aquí la barra está abajo): nombre, rombos, debilidades en color y «¡RUPTURA!».
   Se oculta a los 4 s sin golpearlo o al caer.
5. **Brillo dorado** sobre el enemigo roto. En Unity está pendiente.

## Etapa 7 (2026-11-13): sonido y opciones

1. **Sonido sintetizado** con Web Audio, porque Unity aún no tiene audio (`Assets/_Project/Audio` está vacía): golpes,
   remate, esquiva, bloqueo, daño, muerte, disparos, avisos, rugidos, Ruptura, Tierra, premios, nivel, diálogo y menús.
   Varios sonidos iguales a la vez suenan como uno.
2. **Ambiente por región:** río y pájaros en la ciudad, selva con más pájaros y dron grave con gotas en la mazmorra.
3. **Opciones**, desde el inicio y desde la pausa: volumen de efectos y de ambiente, sacudida de pantalla y vibración.
   Se guardan aparte de la partida (`cronicas.web.opciones`). `Esc` cierra la pantalla.
4. El audio arranca con el primer toque o tecla, como exige el navegador, y se calla al cambiar de app.

## Etapa 6 (2026-11-12): la defensa

Con los valores de `PlayerDefense.cs`:

1. **Defender** manteniendo `Q`, el clic derecho o el botón táctil Defender:
   - te quedas quieto y sin atacar;
   - recibes la mitad del daño: `ceil(max(1, golpe − defensa) × 0,5)`, como `Health`;
   - no se defiende durante una esquiva: la esquiva tiene prioridad.
2. **Bloqueo perfecto:**
   - un golpe en los primeros 0,2 s de defensa se anula del todo, con pausa breve y sacudida;
   - **aturde 1,2 s** al espíritu que lo dio. Los espíritus son los únicos aturdibles, como `EnemyChaser` y `WildEnemy`;
   - los jefes y los proyectiles solo se anulan;
   - pulsar sin parar no sirve: la ventana tarda 0,6 s en rearmarse.
3. **Poses:**
   - solo Balam tiene pose de defensa, como en Unity;
   - en todos se dibuja un **escudo de luz** a los pies, más brillante durante la ventana perfecta. Esto no está en Unity: es para que se vea que estás defendiendo.
4. **Pose de victoria de Balam:** 1,5 s al abrir la ofrenda final, antes de la elección y los resultados (`DungeonCompletion`). Los demás pasan directo.

## Etapa 5 (2026-11-12): la elección de Guardián

1. **Nueva partida empieza eligiendo Guardián**, como `StartMenuController`, entre los siete de Unity:

   | Guardián | Animal | Afinidad | Vida | Ataque | Defensa | Energía |
   |---|---|---|---|---|---|---|
   | Balam | Jaguar | Tierra | 50 | 12 | 0 | 80 |
   | Xali | Ajolote | Agua | 65 | 8 | 1 | 80 |
   | Naira | Lobo mexicano | Viento | 60 | 11 | 0 | 70 |
   | Ameyali | Mariposa monarca | Luz | 45 | 9 | 0 | 120 |
   | Itzel | Águila real | Luz | 40 | 13 | 0 | 90 |
   | Yaret | Quetzal | Viento | 50 | 10 | 0 | 100 |
   | Ocel | Xoloitzcuintle | Oscuridad | 55 | 8 | 2 | 90 |

   Cada carta muestra el retrato de frente, el título, la descripción, los atributos, la afinidad, la especie y la acción de senda.
2. **Cada Guardián** juega con sus atributos y su crecimiento por nivel, y con sus sprites.
   - Naira y Ameyali usan su único ataque.
   - Naira, Ameyali y Ocel tienen su muerte provisional de 3 cuadros.
3. **Pestaña Guardián** en el menú (`I`): permite cambiar a mitad de partida. **No cura ni recupera energía**; solo baja la vida o la energía si el máximo nuevo es menor.
4. **Habilidad especial de Balam** (`F`, o el botón Especial): 25 de energía, 5 s de espera y 2,5 × ataque enfrente, con su pose del jaguar dorado. Como en Unity, solo la tiene Balam.
5. **La Marca de su Guardián** de la ofrenda oculta del piso 2 es la del Guardián en juego, y solo suma con él.
6. **Guardado:** el Guardián va en la partida. Las partidas anteriores quedan con Yaret, que era el único.

## Etapa 4 (2026-11-12): las recompensas

Con los datos de `Data/Rewards/Olmeca` y las reglas de `Docs/Sistemas/Sistema_Recompensas.md`:

1. **Progresión:**
   - Yaret empieza en nivel 1 con 50 de vida, 10 de ataque, 0 de defensa y 100 de energía, y sube con su crecimiento;
   - para subir del nivel N hacen falta 100 × N^1,5 de experiencia, hasta el nivel 20;
   - al subir, la vida máxima aumenta y la actual con ella.
2. **Menos experiencia al repetir:**
   - por estar por encima del nivel de la zona: selva 1, pisos 1 a 3 de 2 a 4;
   - por vencer al mismo enemigo otra vez: 15, 8, 4 y la cuarta vez 0.
3. **Botín de los enemigos** según sus tablas: espíritu, eco y Jaguar.
4. **Bolsa** (`I`, o el botón Bolsa en táctil):
   - topes por objeto y rareza por color;
   - consumibles con Usar, y uso rápido con la tecla `1`, que cura si estás por debajo del 60 %;
   - reliquias en 2 ranuras, que suman a las estadísticas;
   - la pestaña Bendiciones. El menú pausa el juego.
5. **Ofrendas** de los pisos, que solo se entregan una vez (`ofrenda.<id>`):
   - común (vasija), especiales, ocultas, la del Guardián (tras vencer al Jaguar) y la final;
   - lo fijo más su tabla, en un mensaje «Abres la ofrenda…».
6. **Basalto agrietado** en cada piso: tapa la ofrenda oculta y solo lo rompe el golpe de tierra.
7. **Bendición de la Tierra**, al liberar al Guardián (`REC_jefe_guardian`, con el Fragmento de la Primera Memoria y 400 de experiencia):
   - el **golpe de tierra** (`C`, o el botón Tierra) gasta 30 de energía, tiene 4 s de espera y hace 2 × ataque en 2,5 m;
   - la energía se recupera en el santuario de Memoria y con objetos.
8. **Otras experiencias:** descubrir cada piso, cada fragmento de la selva (más el fragmento menor) y las misiones con paquete (02, 03, 04 y 06).
9. **Cierre de la mazmorra:**
   - la ofrenda final calcula la **nota C/B/A/S** con los 3 secretos más «sin caer» (`incursion.caido`) y entrega su paquete;
   - después abre la **elección de Bendición secundaria** entre tres, y luego los **resultados**.
10. **Servicios de la ciudad:** Fabricar en el taller del artesano, Cocinar en el fogón de la curandera y Comerciar en el puesto, con las recetas y ofertas que tengas desbloqueadas.
11. **Guardado v3**, con todo el progreso. Las partidas anteriores pasan a nivel 1, sin objetos y con la energía llena, como en Unity.

## Etapa 3 (2026-11-12): el Guardián de la Piedra Viva

Con los valores de `StoneGuardian.cs` y `OlmecaDungeonGenerator.cs`:

1. **Piso 3:**
   - `MP_OLM_05` «La Piedra Viva» empieza al llegar;
   - dos espíritus jaguar en la antesala;
   - la **losa** tapa el pórtico hasta que la empujas, y entonces se hunde.
2. **El Guardián:**
   - espera sentado y despierta a 6 m;
   - tiene 400 de vida y barra de jefe con la fase;
   - acecha a 1,6 m/s y elige sus ataques en el mismo orden que `ChooseAttack`.
3. **Fase 1:**
   - zarpazo: círculo delante, 20 de daño;
   - golpe de tierra: círculo de 3,5 m, 20;
   - embestida: franja de 8 m, 20. Si choca con una columna o el borde, queda aturdido 1,6 s;
   - rugido: círculo de 3 m, 10, y te empuja.
4. **Fase 2 (60 %):**
   - ruge invulnerable 1,2 s;
   - **sube el agua del borde de la arena**, que frena;
   - ondas: dos anillos de 3,5 y 7 m, con el centro a salvo, 10 cada uno;
   - cinco fragmentos de piedra en abanico de 60°.
5. **Fase 3 (25 %):**
   - avisos un 25 % más cortos y menos espera entre ataques;
   - la **Furia de la Primera Piedra**: dos tandas de tres zonas, una sobre ti.
6. **Al vencerlo:**
   - se sienta liberado en el centro de la arena, con el disco de jade, y cuenta su recuerdo;
   - completa `MP_OLM_05` y no vuelve;
   - si caes contra él, vuelves al santuario y el combate se reinicia.
7. **`MP_OLM_06` «La primera memoria»** empieza al liberar al Guardián (desde la etapa 4, como en Unity). Se completa hablando con la anciana y dejándolo en el altar-trono de la plaza, que cambia de texto: **el arco olmeca se puede jugar de principio a fin.**
8. **Corrección:** las vistas `_01` son de espaldas y las `_05` de frente. En las etapas 1 y 2 estaban al revés en el jugador y los habitantes.

## Etapa 2 (2026-11-12): la ciudad

1. **Nueva partida empieza en `Olmeca_Ciudad`**, en la orilla noreste del río, como en Unity.
2. **Alturas:** el montículo de tres niveles se sube por sus rampas; sin rampa, un borde de más de 0,35 m no se sube. El muelle se camina y el agua bloquea.
3. **Orden de dibujo** por distancia a la cámara (cuenta la altura), postes de enramada con su ancla y **techos** que tapan al pasar debajo (`RoofOverhead`).
4. **23 habitantes** con su arte y su ruta de `OlmecaCityGenerator`. Hablan con sus **diálogos por ramas** de Unity, se paran y te miran.
5. **Misiones con pasos** (como `QuestService`): `MP_OLM_01` empieza sola, el artesano da `MP_OLM_02`, el guerrero da `MP_OLM_03` y se va a la selva, y el guerrero de la entrada da `MP_OLM_04`, que avanza al bajar y al vencer al Jaguar. El objetivo del HUD es el paso actual.
6. **Altares y estelas** se examinan; las estelas cambian de texto tras `MP_OLM_02`.
7. **Incursión:** tras `MP_OLM_03`, dos espíritus marchan hacia la aldea y los tres guardias la defienden (ven a 5 m y golpean a 1,2 m por 10).
8. **Sendero** ciudad ↔ selva.
9. **Guardado v2:** también guarda las misiones. Una partida de la etapa 1 se migra sola: se dan por hechas las misiones de la ciudad.

### La figura espiritual (cambiada)

En Unity sigue siendo un sprite provisional que está siempre en la orilla. Aquí:

- **No está al empezar.** Surge del río cuando te asomas al agua (paso 1 de `MP_OLM_01`).
- Es una **forma de luz sin rasgos**, con el manto abierto y los brazos de quien recibe a alguien. **Flota sobre el agua** con ondas, reflejo y motas de luz.
- Mientras está, se habla con ella (`Escuchar`) y el reflejo no se puede mirar.
- **Tras el juramento se deshace en motas** y queda su eco en el agua: ondas y un brillo leve, que repite su indicación al escucharlo.
- Está hecha por código (`pintarFigura` y `dibujarFigura` en `js/actores.js`, medidas en `FIG_W` y `FIG_H`). No hay arte suyo en la lámina. Si la defines, se cambia por sus sprites.

## Lo que trae la etapa 1 (2026-11-12)

1. **Menú de inicio:** Continuar (si hay partida) y Nueva partida (pide confirmar si borra una).
2. **Selva**, con la misión `MP_OLM_03` «Rastros en la selva» (desde la etapa 2, sus espíritus salen al empezar la misión en la ciudad):
   - tres espíritus corrompidos que no reaparecen;
   - cada uno deja un fragmento que se recoge;
   - el joven guerrero, con sus tres diálogos de Unity;
   - la entrada a la estructura, que se abre al completar la misión.
3. **Piso 1:** tres espíritus y el santuario de Memoria, que guarda la partida.
4. **Piso 2:**
   - agua baja que frena;
   - un espíritu y dos ecos que avisan, disparan y saltan de sitio;
   - el santuario de Vida, que cura la mitad una vez por incursión y se reenciende al volver a la selva;
   - el **Espíritu del Jaguar**, con barra de jefe, zarpazo, salto y rugido avisados en el suelo y su texto al
     liberarse. La bajada se abre al vencerlo.
5. **Piso 3:** santuario de Memoria y la losa sellada, que de momento solo se examina.
6. **Combate y movimiento**, con los valores de `PlayerAttack.cs` y `PlayerMovement.cs`:
   - combo de 3 con remate ×1,5, impulso, pausa al acertar, sacudida y apuntado asistido;
   - esquiva de 2 cargas, invulnerable 0,3 s;
   - esquiva perfecta con cámara lenta a 0,35.
7. **Derrota:**
   - en la mazmorra, con partida guardada, vuelves al santuario con la vida llena y la historia se conserva;
   - en otro caso te levantas en el sitio.
8. **Guardado** en el `localStorage` del navegador: región, vida y banderas, con versión. Cada navegador y cada
   dispositivo tiene su partida.

### Controles

| Acción | Teclado y ratón | Táctil |
|---|---|---|
| Mover | WASD o flechas | Joystick izquierdo |
| Atacar | `J` o clic | Atacar (mantener encadena) |
| Defender (mantener) | `Q` o clic derecho | Defender |
| Fijar objetivo | `Tab` | Fijar |
| Esquivar | Espacio | Esquivar |
| Saltar | `K` | Saltar |
| Usar, hablar, seguir el diálogo | `E` o Enter | Usar / Seguir, o tocar el cuadro de diálogo |
| Pausa | `Esc` | II (también al cambiar de app) |

## Cómo está hecho (para seguir evolucionándolo)

- **Proyección:** la misma de `IsometricProjection.cs`. En pantalla, 1 m en x son 48 px, 1 m de fondo (y) son 32 px y
  1 m de altura (z) son 35,78 px. El arte se escala por un entero (alto de referencia de 360 px), igual que en Unity.
- **Profundidad:** todo lo que tiene altura se ordena por y: lo del fondo se dibuja antes.
- **Colisiones:**
  - la huella de cada objeto es la tabla `OBSTACULOS`, copia de `PixelArtSceneBuilder.Obstacles`;
  - las celdas `vacio` bloquean;
  - el agua vadeable frena.
- **Banderas:** tienen los mismos ids que en Unity (`olm.selva.fragmento_1`, `mision.MP_OLM_03.completada`,
  `olm.jaguar_piedra_vencido`, `incursion.*`), para que el contenido nuevo se pueda copiar sin traducir.
- **Para añadir una región:**
  1. Añadirla a `REGIONES` en `sincronizar.mjs` y volver a ejecutarlo.
  2. Poner su contenido en `poblar()` de `js/juego.js`.
  3. Conectarla con un portal.

## Diferencias con Unity y atajos conocidos

- Solo de la versión HTML: el salto del jugador, los brincos y las esquivas de los enemigos, el salto del Guardián, las
  figuras de los jefes, el sonido y la vibración. Cómo pasarlos a Unity: `PORTAR_A_UNITY.md`.
- En el aire, el jugador se dibuja con el cuadro de correr, porque no hay sprite de salto.
- Los personajes solo usan las vistas de frente, de lado y de espaldas, porque los guerreros no tienen diagonales.
- Los habitantes no chocan entre ellos; con el jugador, sí.
- **Proporciones** (revisadas el 2026-11-13), en alto de la figura respecto al Guardián jugable (1,12 m):

  | Grupo | Proporción |
  |---|---|
  | Adultos de la aldea / niños | 0,93-0,98 / 0,72 |
  | Fauna de la lámina (serpiente, cocodrilo, mono, aves, murciélago, espíritu jaguar) | 0,4-0,63, 1-1,2 m de largo |
  | Tapir / nauyaca (sub-jefe) / ocelote / mono aullador / pecarí / armadillo | 0,76 / 0,69 / 0,41 / 0,44 / 0,37 / 0,24 |
  | Pejelagarto (de largo, nada casi tumbado) | 1 m de largo |
  | Jaguar (Xolotl) / Guardián (Chac Mool) | 1,47 / 2,17 |
  | Casa de bajareque / entrada de la estructura / escalera / muro | 2,3-2,5 / 2,8 / 2 / 1,2 |
  | Cabeza colosal / canoa (agrandadas) | 1,56 / 3 m de largo |

  Los animales de `herramientas/animales.mjs` se modelaron en metros reales y salían un 40-60 % más grandes. Ahora cada uno
  tiene su `escala` (0,62-0,85) y **se dibuja con menos píxeles** (nítido), no encogido en pantalla; sus radios y sombras
  bajaron igual. Casas, muros y estructuras de Blender, la fauna de la lámina y los jefes ya estaban bien.
  **Agrandados aquí** (`ESCALA_SPRITE` en `js/motor.js`, ×2 exacto para que los píxeles sigan nítidos): la cabeza colosal,
  que salía a 0,78 veces el jugador (las de La Venta miden 1,5-3,4 m) y ahora a 1,56, con su caja de choque al doble; y la
  canoa, de 1,5 a 3 m. El arte de Unity no cambia: allí se haría con la escala del objeto.
- **Estatura de los habitantes** (corregido el 2026-11-13): sus fichas están a 32 px por unidad y Unity escala su raíz a 32/48
  (`PixelArtSceneBuilder.CreateCharacter`). `sincronizar.mjs` los registra a 48 para que midan lo mismo que allí: adultos de
  1,00 a 1,10 m, niños de 0,81 a 0,83 m, y los guerreros jugables de 1,10 a 1,13 m. Antes salían un 50 % más grandes.
- Caen con gravedad el jugador, los jefes y los enemigos que van a pie; los voladores y los habitantes no.
- La fauna camina en línea recta, como en Unity. Los voladores no cruzan los muros.
- El **eco borrado** se dibuja como un rombo violeta: no tiene arte en la lámina.
- El **Espíritu del Jaguar** usa la figura de Xolotl (en Unity, el arte del espíritu jaguar al doble) y al liberarse no se
  queda sentado en la sala al volver.
- No están aún:
  - la música: solo hay efectos y ambiente;
  - las cercas de estacas (Unity no coloca ninguna).
- **Sin ajustar jugando:** la dificultad no se ha probado a mano.

## Siguientes etapas propuestas

Están en la sección «Estado» de `CLAUDE.md`, que se actualiza al cerrar cada etapa.

## Pruebas hechas

**Etapa 11:**

- con Balam junto al artesano, el aviso ofrece Persuadir; tocar habla y mantener 0,65 s da sus líneas y la receta del
  amuleto; después el aviso ya no la ofrece y tocar habla sin esperar;
- con Itzel, Indagar con el artesano da jade ×1 y 10 de experiencia; el botón táctil mantenido da las semillas ×3 de la
  curandera; alejarse a media pulsación no lanza nada ni marca la acción;
- piso 1: 4 pinchos, 1 placa, 4 esteras, braseros y cristales sólidos; ciclo de 3,5 s (0,7 de aviso, 1,1 arriba);
  arriba quitan 8; la placa sube sus dos pinchos y se suelta a los 0,4 s; pisos 2 y 3 con sus piezas; la ciudad sin ninguna;
- las pruebas de las etapas 2 a 10 siguen pasando; 60 FPS y sin errores.

**Etapas 7 a 10** (Chrome sin ventana a 844 × 390, por el protocolo de DevTools):

- opciones guardadas, `Esc` las cierra en el inicio y en la pausa (sigue en pausa), sin sacudida la cámara no tiembla;
- suenan golpe, tajo, remate, esquiva, daño, muerte y premio; el ambiente cambia al viajar y calla en el inicio;
- Ruptura: Xali rompe al espíritu en 3 golpes, después hace 12 (8 × 1,5) y a los 2,5 s el escudo vuelve; Balam no lo
  desgasta, el bloqueo perfecto sí; el Jaguar se rompe con Tierra sin quedar aturdido; Yaret rompe al Guardián;
- fauna: 6 animales en la selva, las avispas atacan a la vez, el mono lanza 3 piedras, la serpiente da botín y vuelve
  con la vida llena, el cocodrilo recibe 0,5 de frente y 1 por detrás, el mono se rompe con Tierra;
- vasija rota con `J` (su caja desaparece); vender jade da 12 ecos y el Fragmento no se ofrece;
- Museo al cerrar el santuario, Códice por aviso y por bandera, y páginas sin aviso al cargar una partida antigua;
- fijar con `Tab`, giro del golpe hacia el fijado, se suelta a 13 m y con otro `Tab`;
- choque con un habitante, caída de 1 m en 0,3 s y la rejilla igual a la búsqueda completa en las cinco regiones;
- las pruebas de las etapas 2 a 6 siguen pasando; 60 FPS y sin errores.
- **Sin probar:** cómo suena en un celular real, y la dificultad de la fauna jugando a mano.

**Etapa 6:**

- sin defender, 10 de daño; con bloqueo perfecto, 0, y el espíritu queda aturdido 1,2 s y no se mueve;
- con la defensa sostenida, 10 → 5 y 15 → 8;
- no te mueves ni atacas mientras defiendes;
- volver a pulsar a los 0,3 s ya no es perfecto, y a los 0,8 s sí;
- defienden el clic derecho y el estado del botón táctil;
- la pose de victoria dura 1,5 s y la elección espera a que acabe;
- 60 FPS y sin errores. Las pruebas de las etapas 2 a 5 siguen pasando.


**Etapa 5:**

- la elección muestra los siete y empieza con Balam: 50/12/0/80;
- el especial de Balam gasta 25 de energía, deja 5 s de espera y vence a un espíritu;
- caminar con los siete;
- la muerte de Naira;
- cambiar a Xali en el menú no cura (20/65);
- el Guardián se guarda y las partidas anteriores quedan con Yaret;
- la marca es la del Guardián en juego;
- autocomprobaciones: los siete a nivel 1 y Balam a nivel 5;
- 60 FPS y sin errores. Las pruebas de las etapas 2 a 4 siguen pasando.


**Etapa 4:**

- experiencia por repetición: 15, 8, 4, 0;
- botín en la bolsa;
- experiencia por descubrir el piso 1;
- ofrendas común y especial, una sola vez;
- el basalto no cae sin la Tierra y cae con ella: gasta 30 de energía y deja 4 s de espera;
- ofrenda oculta;
- equipar una reliquia, usar una semilla y el uso rápido con la tecla `1`;
- ofrenda final con nota B, elección de Memoria del Agua y resultados;
- Fabricar y Comerciar;
- guardar en v3 y migrar una partida v2;
- autocomprobaciones: Yaret 50/10/0/100, curva de experiencia, notas y Fuerza de la Tierra;
- 60 FPS y sin errores. Las pruebas de las etapas 2 y 3 siguen pasando.


**Etapa 3:**

- se probó desde el piso 3: la losa bloquea, se empuja y se abre;
- el Guardián despierta, ataca solo y hace daño;
- se forzó cada ataque y se revisó su aviso en captura: franja, golpe, anillos, fragmentos y Furia;
- fase 2 con el agua y fase 3;
- tres golpes reales del jugador le quitan 35;
- liberado, con `MP_OLM_05` completa;
- la ofrenda empieza `MP_OLM_06`, que se completa con la anciana y el altar-trono;
- 60 FPS y sin errores en la consola.
- **No se jugó a mano:** falta ajustar la dificultad jugando.

**Etapa 2**, con el mismo guion:

- partida nueva en la ciudad → mirar el agua → surge la figura → juramento → se deshace;
- artesano → anciana → guerrero, con `MP_OLM_01` y `MP_OLM_02` completas y `MP_OLM_03` empezada;
- subir el montículo por las rampas hasta 3 m, borde sin rampa bloqueado y muelle a 0,14 m;
- selva con espíritus, fragmentos y el guerrero, y `MP_OLM_04` empezada al hablar con él;
- incursión vencida por los guardias;
- migración de una partida v1;
- 60 FPS y sin errores en la consola.

**Etapa 1:**

Se probó en Chrome sin ventana a 844 × 390, con un guion por el protocolo de DevTools:

- el recorrido completo: selva → misión → piso 1 → guardar → piso 2 → Jaguar → piso 3 → derrota y vuelta al santuario;
- Continuar desde el menú;
- el joystick y la pausa táctil;
- que no haya desplazamiento horizontal;
- 60 FPS;
- sin errores en la consola, y con las autocomprobaciones (`console.assert`) cumplidas;
- que el servidor rechace las rutas fuera de su lista.

**Sin probar:** en un celular real, y jugarlo entero a mano para ajustar la dificultad.
