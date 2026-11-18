# Crónicas de México: versión HTML (ficha rápida)

Port por etapas del RPG de Unity (`C:\Users\Usuario\Documents\CronicasDeMexico`) a HTML + JavaScript sin dependencias.
El detalle de cada etapa está en `README.md` (largo): **lee solo la sección que necesites** (`grep -n "^## " README.md`).

## Estado (actualizar al cerrar cada etapa; es lo único que hay que leer para retomar)

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
- **Ideas abiertas que se le ofrecieron:** que el armero cobre ecos; que caer en los pisos 1-2 lleve a la aldea y en el 3 al
  santuario; teñir los objetos de Unity del piso 3; sigilo del cuchillo y recolectar madera con el hacha (no existen esas
  mecánicas). Armas siempre de la cultura olmeca (el usuario lo pidió; ver README etapa 36).
- **Etapas anteriores:** 34 música prehispánica (`js/musica.js`); 32-33 dificultad con perfil celular (`mapas.mjs`,
  `jefes.mjs`); 30-31 controles táctiles tipo Soul Knight; 26-29 efectos de golpe y animación por partes.
- **Siguiente propuesta:** que el usuario confirme en el celular; pasar a Unity según `PORTAR_A_UNITY.md` (secciones 21-24 nuevas).
- **Deseo pendiente del usuario:** mejor animación para los enemigos actuales; más animales de Veracruz/Tabasco.
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
