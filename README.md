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
| `js/actores.js` | Jugador, espíritus, ecos, Espíritu del Jaguar, habitantes, guardias, figura espiritual y fragmentos |
| `js/juego.js` | Banderas, misiones, diálogos por ramas, contenido de cada región, guardado, HUD y bucle |
| `sincronizar.mjs` | Copia arte y mapas desde Unity |
| `servir-en-red.mjs` | Servidor para el celular. Solo entrega `index.html`, `js/`, `datos/` y `arte/` |

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
