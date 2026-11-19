# Crónicas de México: versión HTML (ficha rápida)

Port por etapas del RPG de Unity (`C:\Users\Usuario\Documents\CronicasDeMexico`) a HTML + JavaScript sin dependencias.
El detalle de cada etapa está en `README.md` (largo): **lee solo la sección que necesites** (`grep -n "^## " README.md`).

## Estado (actualizar al cerrar cada etapa; es lo único que hay que leer para retomar)

- **Etapa 50 (2026-11-19):** mazmorra maya, piso 3 (el observatorio, `m3_1`…`m3_4`, clave 13; cielo de noche `Cielo_Noche`) y
  el **Guardián de los Ciclos** en el 3-4 (`guardianCiclos`: el Guardián olmeco con la figura `Jefe_SenorLluvia`, 1500 de vida). Al
  vencerlo se cumple `MP_MAY_03` y la escalera del 3-4 sale a Palenque. Prueba: `etapa50.mjs`. **Siguiente, etapa 51:** habilidad
  de agua y cierre del capítulo II (contárselo al escriba; nueva misión tras `may.guardian_ciclos_vencido`). Pendiente: medir con
  el bot los tres jefes mayas; probar 39-50 en el celular.

- **Etapa 49 (2026-11-19):** mazmorra maya, piso 2 (las cámaras de estuco, `m2_1`…`m2_4`, clave 12): suelo y muros pintados
  (`losaEstuco`, `muroEstuco`), sub-jefe murciélago de la muerte en el 2-4 (`murcielagoEstuco`), misión `MP_MAY_03` ampliada.
  Prueba: `etapa49.mjs`. **Siguiente, etapa 50:** piso 3 «observatorio» (`m3_*`, clave 13) y el Guardián de los Ciclos; abrir la
  bajada del 2-4 (el texto de `cerrado` en `poblarNivel`). Luego 51: habilidad de agua y cierre del capítulo II.

- **Etapa 48 (2026-11-19):** mazmorra maya, piso 1 (los canales del Otolum, `m1_1`…`m1_4`): entrada por la boca del acueducto
  en la plaza de Palenque (`may.camino_agua`), incursión nueva, generador por cultura (`esMaya`, `pisoDe`, claves 11-13), suelo y
  muros pintados (`losaCanal`, `muroCanal`), sub-jefe cocodrilo de pantano en el 1-4 y misión `MP_MAY_03`. Prueba: `etapa48.mjs`.
  **Plan acordado:** 3 pisos de 4; siguiente, etapa 49: piso 2 «cámaras de estuco» (`m2_*`, claves 12) con su mini-jefe; 50: piso 3
  «observatorio» y el Guardián de los Ciclos; 51: habilidad de agua y cierre del capítulo II.

- **Etapa 47 (2026-11-19):** mapa de la región (`js/mapa.js`): minimapa arriba a la derecha con suelo, agua, enemigos,
  habitantes, salidas, santuario y el objetivo de la misión (en otra región, la salida hacia allá); al tocarlo, grande;
  Opciones → Mapa lo oculta. Prueba: `etapa47.mjs`. **Siguiente:** la mazmorra maya (`may.camino_agua`, 10-12 pisos y el
  jefe del agua, Historia_Mundo §6, cap. II). Pendiente: probar 39-47 en el celular.

- **Etapa 46 (2026-11-19):** fauna de Chiapas en Palenque: jaguar (el ocelote en grande, `JAGUAR_SELVA`), mono araña
  (aullador sin aullido que lanza ramas, `ARANA`), tucán pico canoa (vuela y se lanza en picada, `TUCAN`) y el tapir. Ocelote y
  aullador leen sus datos de `e.D`. Prueba: `etapa46.mjs`. **Siguiente:** 47 mapa de la región; luego la mazmorra maya.

- **Etapa 45 (2026-11-19):** armas mayas del Clásico (`cultura: 'maya'` en `ARMAS`): lanza, hacha y cuchillo de pedernal,
  átlatl, cerbatana y escudo flexible, solo en el armero de Lakamha' (tallador de pedernal; `armero_maya.*`); la mazmorra
  olmeca sigue con las olmecas (`armasDe`). Prueba: `etapa45.mjs`. **Siguiente:** 46 fauna de Chiapas, 47 mapa, mazmorra maya.

- **Etapa 44 (2026-11-19):** la aldea de Lakamha' (`js/aldea_maya.js`), al este de la plaza: casas, milpa, telar, siete
  habitantes pintados por código y la misión `MP_MAY_02` (tres hojas del escriba; las de la plaza las guardan espíritus).
  Prueba: `etapa44.mjs`. **Plan acordado:** 45 armas mayas en un armero de Lakamha', 46 fauna de Chiapas (mono araña,
  tucán, jaguar, tapir), 47 mapa de la región; después la mazmorra maya (`may.camino_agua`). Pendiente: verlo en el celular.

- **Etapa 43 (2026-11-19):** de la mazmorra a la época maya. Al dejar el fragmento en el altar-trono (MP_OLM_06) se cierra
  el capítulo I y se abre un portal en la plaza (`may.portal_abierto`) a **Lakamha' (Palenque)**, región pintada por código
  (`js/palenque.js`, piso 4): llegada con santuario, río Otolum con puente, plaza, templo escalonado y tablero de glifos;
  misión `MP_MAY_01`. Prueba: `etapa43.mjs`. **Siguiente:** la aldea maya (gente de Lakamha', paso 2 de MP_MAY_01), luego
  mazmorra (10-12 pisos) y jefe del agua (Historia_Mundo §6, cap. II). Pendiente: verlo en el celular.

- **Etapa 42 (2026-11-19):** la energía se recarga sola (4/s, `ENERGIA_REGEN` en `js/actores.js`): la estrella ya no se apaga
  tras 4 usos. El armero cobra: cada arma se compra una vez con ecos y materiales (`PRECIO_ARMERO`, `armero.compradas`);
  la macana es gratis. Prueba: `herramientas/dificultad/etapa42.mjs`. Campaña medida: 0 caídas, jefes algo más rápidos (README). Pendiente: verlo en el celular.

- **Etapa 41 (2026-11-18):** al caer en el piso 3, si en la incursión ya llegaste al 3-5, despiertas junto a su
  santuario de Memoria con armas y niveles intactos (`incursion.santuario_p3`, derrota en `actualizar`); si no, y en los pisos
  1-2, a la aldea. El espíritu pegado al santuario no aparece al despertar ahí. Pendiente: verlo en el celular.

- **Etapa 40 (2026-11-18):** el jugador ya no anda «como pingüino» de frente ni de espaldas: los cuadros de Unity
  `Caminar*_05/_01` de los guerreros no mueven los pies; ahora se usa el reposo y se alza un pie y luego el otro (`pasoFrontal`,
  `js/actores.js`). Pendiente: verlo en el celular.

- **Etapa 39 (2026-11-18, subida a GitHub):** mejor animación de los enemigos (README, etapa 39): los 7 animales pintados llevan la
  capa de movimiento por código (`movAnimal`, `POSE_ANIMAL`, `ESTILOS`) y más zancada al andar (40 cuadros repintados con
  `herramientas/animales.mjs`). Hojas de revisión: `herramientas/dificultad/animaciones.mjs`. Pendiente: verlo en el celular.

- **Etapa 38 (2026-11-18, subida a GitHub):** simulación completa del juego y 8 arreglos (README, etapa 38): enemigos a ≥ 4 m de la
  llegada (`LIBRE_LLEGADA`), armas de cofres u ofrendas al suelo con las manos llenas (`ofrecerArma`), santuario de Vida en la
  antesala del 3-5 (`santuarioVidaP3`), `desatascar` enemigos en muros, arma a distancia sin munición se suelta, sin aviso
  repetido del nivel, inicio sin «etapa 24», iconos del armero más grandes. Campaña simulada: 0 caídas del 1-1 al 3-5.
  Guiones nuevos: `recorrido.mjs`, `entradas.mjs`, `campana.mjs` (repetirlos tras cada cambio grande). Pendiente: que el
  usuario lo pruebe en el celular.

- **Paso a Unity en marcha (2026-11-18):** en el repositorio de Unity, rama `feature/port-html`, subida (commit `0fae1d4`). Hecha la etapa
  **U1** (§1 esquiva saltando de los enemigos y §2 salto del jugador); el plan U1-U9 y qué falta están en la última entrada
  de `Docs/Bitacora.md` de Unity, que es lo que hay que leer para seguir allí. Este repositorio solo cambió en
  `PORTAR_A_UNITY.md` (nota «Ya en Unity»).

- **Etapa 37 (2026-11-18, subida a GitHub: `8de39d6` y el ajuste del Guardián):** dos ranuras libres con Cambiar arma (R / `#bArma`), calidad ★-★★★ por piso
  (`CALIDAD`, ★ ×0,6 tras medir con el bot) y especial de cada arma con cualquier Guardián (`ESPECIAL_ARMA`; el de Balam se
  quitó). Dificultad medida (README, etapa 37): sin armas ~38 %, con la del armero ~30 %, con mejores ~20 %. Pendiente: que el
  usuario la pruebe en el celular (posición del botón `#bArma`). Jefes con armas medidos (README, etapa 37): con la del armero,
  casi como sin armas; con ★★★ el Guardián caía en 9 s, así que su vida pasó de 700 a **1100** (con ★★★: 17 s, gana 9/10; con la
  del armero: 6/10; sin armas: 2/10). Subido a GitHub.
- **Antes (2026-11-18):** etapas 35 y 36 **subidas a GitHub** (dos commits: «Etapa 35: … pisos 2 y 3» y
  «Etapa 36: armas olmecas…»). Etapa 35: HUD compacto, salas que serpentean, fondo por piso y suelo y muros de diseño propio en
  los pisos 2 («cámaras inundadas») y 3 («templo olmeca»), pintados por código (`js/pisos.js`, también 2-5 y 3-5). Etapa 36
  (`js/armas.js`): 9 armas olmecas en estrados (X-2 cerca, X-4 distancia, X-1 de pisos 2-3 escudo) con mecánicas propias,
  maestría por Guardián (`MAESTRIA`), cofre de recompensas al limpiar un nivel (`BOTIN_COFRE`), armas en ofrendas de Unity,
  armero en la aldea (17,5; 1,5), al caer siempre a la aldea, y fuera de la mazmorra sin monstruos hasta liberar al Guardián
  (`afueraConMonstruos`). `Ejemplo de controles/` (captura de referencia del usuario) no se sube.
- **Pendiente de probar en el celular:** diseño de pisos 2-3, armas, cofres, armero, caer a la aldea (31-34 ya los vio: bien
  y fluido). **Pendiente de medir con el bot:** dificultad con armas (hay armas casi siempre: armero + estrados + cofres).
- **Ideas abiertas que se le ofrecieron:** teñir los objetos de Unity del piso 3; sigilo del cuchillo y recolectar madera con el hacha (no existen esas
  mecánicas). Armas siempre de la cultura olmeca (el usuario lo pidió; ver README etapa 36).
- **Etapas anteriores:** 34 música prehispánica (`js/musica.js`); 32-33 dificultad con perfil celular (`mapas.mjs`,
  `jefes.mjs`); 30-31 controles táctiles tipo Soul Knight; 26-29 efectos de golpe y animación por partes.
- **Siguiente propuesta:** que el usuario confirme en el celular; pasar a Unity según `PORTAR_A_UNITY.md` (secciones 21-24 nuevas).
- **Deseo pendiente del usuario:** mejor animación para los enemigos actuales; más animales (de Chiapas ya: etapa 46).
- **Deudas:** `/ponytail-debt` lista los `shortcut:` del código.

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
| `js/pisos.js` | Suelo (`pintarLosa`) y muros (`pintarMuro`) de los pisos 2 y 3 pintados por código; colores en `PALETA` |
| `js/juego.js` | Banderas, misiones, `cargarRegion`, guardado, bucle `actualizar` |
| `js/musica.js` | Música prehispánica: instrumentos, `MUSICA` (patrones por modo), `modoMusica`, secuenciador |
| `js/recompensas.js` · `js/sonido.js` · `js/senda.js` · `js/movimiento.js` | Progresión · sonido · senda · movimiento de sprites |
| `herramientas/animales.mjs` | Pinta los animales (`arte/Animales`, `datos/animales.js`) |
| `datos/*.js` | Generados: no editar a mano |

Patrón de un enemigo nuevo: constantes en mayúsculas, `nuevoX(x, y)` con `actualizar`/`dibujar`/`alHerir`/`alMorir`,
`vidaComun()` para los comunes, alta en `POBLACION` y `COSTE` y en `poblarNivel` (`js/niveles.js`).

## Comandos

- Abrir: doble clic en `index.html`. Celular: `node servir-en-red.mjs` (puerto 8080). Probar un nivel: `index.html?nivel=n2_2`.
- Animales: `node herramientas/animales.mjs [hoja.png]` (con hoja = cuadros ×3 para revisarlos).
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
