# Crónicas de México: versión HTML (ficha rápida)

Port por etapas del RPG de Unity (`C:\Users\Usuario\Documents\CronicasDeMexico`) a HTML + JavaScript sin dependencias.
El detalle de cada etapa está en `README.md` (largo): **lee solo la sección que necesites** (`grep -n "^## " README.md`).

## Estado (actualizar al cerrar cada etapa; es lo único que hay que leer para retomar)

- **Última etapa:** 30 (2026-11-17), botones táctiles en dos arcos alrededor de Atacar y con iconos SVG (`index.html`). Probado
  en celular: los controles responden bien. 26-29: efectos de golpe y animación por partes (`js/efectos.js`, `js/cuadros.js`).
- **Animación:** el plan de animación está cubierto. Quedan opcionales: partes para `Caminar`/`Correr` (patas) y para el
  rugido (`Especial`) de Xolotl.
- **Siguiente propuesta:** que el usuario confirme en el celular el nuevo acomodo; ajustar dificultad (esquivas); luego música (estilo lo decide el
  autor); pasar a Unity según `PORTAR_A_UNITY.md`.
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
| `js/niveles.js` | Niveles 1-1…3-5, `generarNivel`, `POBLACION`/`COSTE`/`PRESUPUESTO`, enlace de prueba `?nivel=` |
| `js/juego.js` | Banderas, misiones, `cargarRegion`, guardado, bucle `actualizar` |
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
  Las autocomprobaciones (`console.assert`) salen en la consola: sin líneas `[assert]` = todo bien.

## Trampas conocidas

- No hay Python: ediciones exactas con Edit o un script de node pequeño.
- En Bash, nunca `cat > archivo` sin heredoc (se cuelga); a los scripts de node, `</dev/null`. Los heredoc largos pueden
  fallar: mejor Edit.
- `uv` y `skillspector` están en `C:\Users\Usuario\.local\bin` (en Bash: `export PATH="/c/Users/Usuario/.local/bin:$PATH"`).
