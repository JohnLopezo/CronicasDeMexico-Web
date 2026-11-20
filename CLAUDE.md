# Crónicas de México: versión HTML (ficha rápida)

Port por etapas del RPG de Unity (`C:\Users\Usuario\Documents\CronicasDeMexico`) a HTML + JavaScript sin dependencias.
El detalle de cada etapa está en `README.md` (largo): **lee solo la sección que necesites** (`grep -n "^## " README.md`).

## Estado (actualizar al cerrar cada etapa; es lo único que hay que leer para retomar)

El detalle de cada etapa está en su sección `## Etapa N` del README (no repetirlo aquí: este bloque debe quedar corto).

- **Hecho hasta la etapa 57 (2026-11-20, sin subir):** capítulo I olmeco (aldea, selva, mazmorra 1-1…3-5, Guardián de la
  Piedra Viva, Bendición de la Tierra) y **capítulo II maya completo**: Palenque (`js/palenque.js`), aldea de Lakamha'
  (`js/aldea_maya.js`), armas mayas, fauna de Chiapas, minimapa (`js/mapa.js`), mazmorra maya de 3 pisos × 4 (`m1_*`-`m3_*`,
  claves 11-13, `js/mazmorra_maya.js`) con cocodrilo, murciélago y Guardián de los Ciclos, y la Corriente de agua con el cierre
  del capítulo (`js/agua.js`, misión `MP_MAY_04`). Etapa 52: 2 s sin daño al despertar. **Capítulo III empezado** (etapa 53): portal en la plaza de Palenque y Teotihuacan (`js/teotihuacan.js`: calzada, pirámides del Sol y la Luna, mural, misión `MP_TEO_01`) y el barrio (etapa 54, `js/barrio_teo.js`: ropa de cada cultura, zapoteco y mercadera maya, `MP_TEO_02`) y el piso 1 de la mazmorra, la cueva bajo la Pirámide del Sol (etapa 55, `js/cueva_teo.js`, niveles `t1_*`, cascabel de la cueva, `MP_TEO_03`). Etapa 56: los habitantes mayas y teotihuacanos usan el arte de Unity con la ropa de su cultura (`herramientas/vestir.mjs`). Etapa 57: la cueva completa (pisos 2 y 3, jaguar reticulado en el 2-4 y el altar de los dioses, aún dormido, en el 3-4).
- **Plan de dioses (usuario, propuesta en `PROPUESTA_DIOSES.md`, aún no en la biblia de Unity):** el jefe final de cada mazmorra es
  un dios de esa cultura (su memoria corrompida, que se libera); cada cultura tiene 3-4 y aparece uno según el momento de un
  ciclo de día y noche del juego; cada dios da su versión de un elemento. **Siguiente:** los dioses en el altar del 3-4 (`altarDioses`, `js/cueva_teo.js`)
  con el ciclo de día y noche; también armas de obsidiana (hoy la cueva da armas mayas) y fauna del altiplano.
- **Pendiente:** probar en el celular las etapas 39-52 (botón Agua junto a Esquivar); medir la Corriente con el bot.
- **Paso a Unity:** rama `feature/port-html` del repo de Unity, etapa U1 hecha (`0fae1d4`); seguir por la última entrada de
  `Docs/Bitacora.md` de Unity. Todo lo solo-HTML está en `PORTAR_A_UNITY.md` (§1-44).
- **Ideas abiertas:** sigilo del cuchillo y madera con el hacha (no existen); más animación de enemigos. **Deudas:** `/ponytail-debt`.

## Flujo de una etapa (para gastar pocos tokens)

1. Retomar: este archivo ya basta. `git log --oneline -5` para confirmar. **No leer el README entero.**
2. Si la etapa toca un sistema ya hecho: `grep -n "^## " README.md` y leer solo esa sección con `sed -n A,Bp`.
   Del código, `grep -n` a la función y leer solo ese tramo.
3. Implementar en modo **ponytail** (cambio mínimo y completo; atajos con comentario `shortcut:`).
4. Probar con `herramientas/dificultad/prueba.mjs` y un guion; revisar el cambio con `/ponytail-review`
   (o `/code-review` si es grande).
5. Cerrar: sección `## Etapa N` arriba del README, `PORTAR_A_UNITY.md` si aplica, y **reescribir «Estado»** aquí.
6. Commit/push solo cuando el usuario lo pida (un commit por etapa: `git log` sirve de índice).
7. Plugin o skill nuevo: escanearlo antes con `skillspector` (MCP `scan_skill`).

## Reglas

- Responder siempre en **español**.
- **Prioridad (usuario, 2026-11-20): terminar primero el juego en la versión web.** Los cambios de diseño (como
  `PROPUESTA_DIOSES.md`) se aplican aquí; la biblia de Unity y el paso a Unity se actualizan después, cuando el usuario lo pida.
- El proyecto de Unity **solo se lee**, nunca se modifica (`sincronizar.mjs` copia de él arte y datos).
- Todo lo que solo existe aquí se anota en `PORTAR_A_UNITY.md` (valores y clases de Unity destino).
- Cada etapa nueva: sección `## Etapa N (fecha)` al principio del README, con qué hace, valores y pruebas.
- Git propio, rama `main`, remoto `github.com/JohnLopezo/CronicasDeMexico-Web`. Commit y push solo cuando el usuario lo pida.

## Mapa del código

| Archivo | Qué |
|---|---|
| `index.html` | Página, HUD, menús, táctil; orden de carga de los scripts |
| `js/motor.js` | Proyección (48 px/m en x, 32 en y, 35,78 en z), `dibujar`, `elipse`, entrada |
| `js/mundo.js` | Regiones desde JSON: suelo, agua (`enAgua`), colisiones (`bloqueado`, `mover`), alturas |
| `js/actores.js` | Jugador, `herirEnemigo`, `herirJugador`, `marca`/`enMarca` (avisos), espíritus, jaguar |
| `js/animales.js` | Animales dibujados por código: nauyaca, pecarí, tapir, ocelote, aullador, armadillo, pejelagarto |
| `js/fauna.js` · `js/guardian.js` · `js/trampas.js` | Fauna de la lámina · Guardián · trampas |
| `js/efectos.js` | Jugosidad: `chispas`, `impacto`, `alerta`, `polvo`, estela y aterrizaje (`rastroEnemigos`), `dibujarNumero`, `RESTOS`; valores en `EF` |
| `js/cuadros.js` | Cuadros por partes: `PARTES` por sprite (rect, pivote, aviso/golpe/aleteo, `sinHueco`), `conPartes`, `cuadroAtaque` |
| `js/niveles.js` | Niveles 1-1…3-5, `generarNivel`, `POBLACION`/`COSTE`/`PRESUPUESTO`, `ESTILO` por piso, enlace de prueba `?nivel=` |
| `js/armas.js` | Armas de la mazmorra: `ARMAS`, `NIVEL_ARMA`, estrado (`ponerArma`), dardos del disparo (`lanzarDardo`), golpe (`danoGolpe`, `trasGolpe`, `trasBlandir`), escudo (`factorDefensa`), `MAESTRIA`, cofre de recompensas (`aparecerCofre`), armero (`menuArmero`) |
| `js/palenque.js` | Capítulo II: portal de la aldea, región de Palenque (`PALENQUE`, `regionPalenque`), templo y tablero pintados, misión `MP_MAY_01` |
| `js/aldea_maya.js` | Aldea maya: habitantes pintados (`MAYAS`, `pintarMaya`), casas, milpa y telar, `ALDEA_MAYA`, diálogos y misión `MP_MAY_02` (hojas: `HOJAS`, `poblarHojas`) |
| `js/mapa.js` | Minimapa: `fondoMapa`, `objetivoEnMapa` (`RUTA`, `AVISO_EN`), `dibujarMapa` cada 150 ms |
| `js/mazmorra_maya.js` | Mazmorra maya: boca del acueducto (`BOCA`, `bocaAcueducto`, `entrarMazmorraMaya`), misión `MP_MAY_03`, sub-jefes `cocodriloPantano` y `murcielagoEstuco`, jefe `guardianCiclos` |
| `js/teotihuacan.js` | Capítulo III: portal en Palenque (`portalPalenque`), región `TEOTIHUACAN` (piso 5, `losaTeo`), pirámides, mural, maguey y nopal pintados, misión `MP_TEO_01` |
| `js/barrio_teo.js` | Barrio de Teotihuacan: habitantes (`GENTE_TEO`, con `pintarMaya`), conjuntos, altar y taller pintados, `BARRIO_TEO`, misión `MP_TEO_02` |
| `js/cueva_teo.js` | Mazmorra teotihuacana: boca de la cueva (`BOCA_CUEVA`, `bocaCueva`), misión `MP_TEO_03`, sub-jefe `cascabelCueva`; niveles `t1_*` en `js/niveles.js` (`esTeo`, `salidaDe`) |
| `js/agua.js` | Bendición del Agua (`corrienteDeAgua`, `CORRIENTE`), lodo seco (`lodoSeco`), cierre del capítulo II (`MP_MAY_04`, `cierreCapituloII`) |
| `js/pisos.js` | Suelo (`pintarLosa`) y muros (`pintarMuro`) de los pisos 2 y 3 pintados por código; colores en `PALETA` |
| `js/juego.js` | Banderas, misiones, `cargarRegion`, guardado, bucle `actualizar` |
| `js/musica.js` | Música prehispánica: instrumentos, `MUSICA` (patrones por modo), `modoMusica`, secuenciador |
| `js/recompensas.js` · `js/sonido.js` · `js/senda.js` · `js/movimiento.js` | Progresión · sonido · senda · movimiento de sprites |
| `herramientas/animales.mjs` | Pinta los animales (`arte/Animales`, `datos/animales.js`) |
| `herramientas/vestir.mjs` | Viste a los habitantes de Unity con la ropa de otra cultura (`arte/NpcCulturas`, `datos/vestidos.js`) |
| `datos/*.js` | Generados: no editar a mano |

Patrón de un enemigo nuevo: constantes en mayúsculas, `nuevoX(x, y)` con `actualizar`/`dibujar`/`alHerir`/`alMorir`,
`vidaComun()` para los comunes, alta en `POBLACION` y `COSTE` y en `poblarNivel` (`js/niveles.js`).

## Comandos

- Abrir: doble clic en `index.html`. Celular: `node servir-en-red.mjs` (puerto 8080). Probar un nivel: `index.html?nivel=n2_2`.
- Animales: `node herramientas/animales.mjs [hoja.png]` (con hoja = cuadros ×3 para revisarlos).
- Habitantes de otras culturas: `node herramientas/vestir.mjs [hoja.png]` (el arte de Unity con otra ropa; `VESTIDOS` y `TRAJES` dentro).
- Arte o mapas cambiados en Unity: `node sincronizar.mjs`.
- Pruebas sin ventana (Chrome por DevTools): `node herramientas/dificultad/prueba.mjs "file:///…/index.html" <salida> <guion.mjs>`.
  Guiones de ejemplo en `herramientas/dificultad/`; bots `bot_grupo.js` (`GRUPO`, opción `orilla`) y `bot_jefe.js` (`PELEA`).
  Revisión general: `animaciones.mjs` (hojas de animación), `recorrido.mjs` (mapas), `entradas.mjs` (enemigos junto a la llegada), `campana.mjs` (campaña entera, ~8 min).
  Las autocomprobaciones (`console.assert`) salen en la consola: sin líneas `[assert]` = todo bien.

## Trampas conocidas

- No hay Python: ediciones exactas con Edit o un script de node pequeño.
- `prueba.mjs` usa el puerto fijo 9333: nunca dos pruebas a la vez (se pisan en el mismo Chrome).
- En Bash, nunca `cat > archivo` sin heredoc (se cuelga); a los scripts de node, `</dev/null`. Los heredoc largos pueden
  fallar: mejor Edit.
- `uv` y `skillspector` están en `C:\Users\Usuario\.local\bin` (en Bash: `export PATH="/c/Users/Usuario/.local/bin:$PATH"`).
