# Portar a Unity lo hecho en la versión HTML

Lo que la versión HTML tiene y Unity no, con sus valores, dónde está aquí y dónde iría allá. Lo demás de la versión HTML es
un port de Unity y ya existe allí.

**Antes de tocar Unity** (su `CLAUDE.md`): proponer el plan por etapas y esperar autorización; nada de commits ni push sin
aprobación; leer la última entrada de `Docs/Bitacora.md` y añadir una al terminar. Con la recarga de dominio desactivada,
todo estático nuevo se limpia con `[RuntimeInitializeOnLoadMethod(SubsystemRegistration)]`. Las clases y líneas citadas
son del repositorio a fecha 2026-11-13: comprobarlas antes de cambiarlas.

**Ya en Unity** (rama `feature/port-html` del repositorio de Unity; las 25 secciones se agruparon en etapas U1-U9, ver su
`Docs/Bitacora.md`): **U1 = §1 y §2** (2026-11-18). Diferencias con este documento: el salto va a 5,8 m/s y no a 6
(en Unity la física continua daría 0,9 m), y para no subir terrazas en el aire hizo falta más que el `stepOffset`: una
esfera bajo el destino del paso y la altura de despegue medida con un rayo (ver el `CLAUDE.md` de Unity).

**Orden recomendado** (cada paso se apoya en el anterior):

1. Esquiva saltando de los enemigos (gancho en `Health`).
2. Salto del jugador.
3. Brinco de los enemigos que persiguen.
4. Salto del Guardián.
5. Figuras de los jefes.
6. Sonido, vibración y opciones.
7. Niveles de la mazmorra y salas generadas.
8. Animales de Veracruz y Tabasco (nauyaca real, pecarí de collar, tapir, ocelote, mono aullador, armadillo y pejelagarto).
9. Movimiento por código de los enemigos de un solo cuadro.
10. Dificultad de los jefes.
11. Dificultad de los enemigos comunes.

---

## 1. Esquiva saltando de los enemigos

**Qué hace.** Cuando un golpe del jugador va a alcanzar a un enemigo, a veces el enemigo lo esquiva de un salto: sale
«Esquiva», no recibe daño y no hay pausa de impacto.

| | A pie (espíritus, serpiente, mono, cocodrilo, jaguar, Guardián) | Voladores (guacamaya, avispa, murciélago) |
|---|---|---|
| Probabilidad | 25 % | 35 % |
| Espera entre esquivas | 3 s | 3 s |
| Invulnerable | 0,4 s | 0,5 s |
| Movimiento | salto de 5 m/s hacia arriba (0,6 m) y empujón hacia atrás de 6 m/s | sube a `hoverHeight × 2,5`, como su defensa `vueloAlto` |

**Cuándo no esquivan:** en la espera de 3 s, en el aire, aturdidos, con la Ruptura rota o mientras avisan o hacen un ataque.
Los jefes solo esquivan mientras acechan: el jaguar en `State.Stalk` y el Guardián sin corrutina de ataque (`busy == false`).
Solo esquivan los golpes del jugador: el ataque, el especial y el golpe de Tierra.

**En HTML:** `esquivarSaltando` (`js/actores.js`, constantes `ESQUIVA_SALTO`) y `esquivarVolando` (`js/fauna.js`,
`ESQUIVA_VUELO`); `herirEnemigo` las consulta antes de aplicar el daño y devuelve `false` si el golpe no entra.

**En Unity:**
- `Combat/Health.TryDamage` ya tiene `Intercept` (lo usa el bloqueo). Una opción es un segundo gancho del mismo estilo, por
  ejemplo `Func<Vector3, bool> Dodge`, que se mire después de la invulnerabilidad y devuelva `false` sin daño. El
  componente `EnemyJumpDodge` lo rellena y decide con las reglas de arriba.
- La pausa de impacto **no necesita cambios**: `PlayerAttack.Attack()` solo la pide si `Strike()` dañó a alguien, y `Strike`
  cuenta solo los `TryDamage` que devuelven `true`.
- Saber que el golpe es del jugador: `TryDamage` recibe la posición de origen, no el atacante. Basta con añadir un parámetro
  opcional o una sobrecarga que use solo `PlayerAttack`, `PlayerSpecial` y el golpe de Tierra.
- Estados: `WildEnemy.State` (`Windup`, `Strike`, `Special` = atacando), `BreakGauge.IsBroken`, `IStaggerable` (aturdido).
- Voladores: `WildEnemy` ya tiene la defensa `vueloAlto` tras recibir un golpe; la esquiva reutiliza esa altura. En HTML la
  altura se suaviza con `alto += (meta − alto) × min(1, dt × 14)`, que también vale para esa defensa.
- El texto «Esquiva» sale por `Core/Feedback/DamageNumbers` (habrá que añadir un tipo de número o un texto).

**Pruebas (PlayMode):** con `Random` controlado, que un golpe esquivado no quite vida, no pida `TimeDilation` y ponga la
espera; que no esquive en la espera, roto, aturdido, atacando ni, en el caso del jefe, fuera de `Stalk`.

## 2. Salto del jugador

**Qué hace.** Salta con una tecla o un botón táctil. Sube 0,83 m y pasa unos 0,7 s en el aire.

- Velocidad inicial de 6 m/s con la gravedad de −20 (`PlayerMovement.gravity` ya es −20).
- Solo desde el suelo, sin defender ni esquivar. No hay doble salto.
- **En el aire no se suben terrazas ni escalones de más de 0,35 m** (el `step offset`): así no se saltan rampas ni atajos.
- En el aire **no se activan los pinchos ni las placas de presión** (más de 0,3 m sobre el suelo).
- En el aire se dibuja con el cuadro de correr: no hay sprite de salto.

**En HTML:** `actualizarJugador` (`js/actores.js`, `SALTO`, `enElAire`), `puedePisar` (`js/mundo.js`), `pisa`
(`js/trampas.js`); tecla `K` en `TECLAS` (`js/motor.js`) y botón `#bSaltar` (`index.html`).

**En Unity:**
- **Entrada:** una acción nueva en `Settings/Input/InputSystem_Actions.inputactions`. Ojo: `Dodge` **es la antigua `Jump`**
  y `PlayerMovement` la busca por nombre en el mapa, así que el nombre nuevo no debe confundirse con ella (por ejemplo, `Hop`).
  Teclado `K` y un botón de mando libre (`buttonSouth` es Esquivar).
- **Botón táctil:** en `Editor/SceneGeneration/TouchControlsSetup.cs`, con la ruta de mando de la acción, y regenerar con
  **Crónicas → Crear controles táctiles en Boot**. En HTML está encima de Usar.
- **Movimiento:** en `PlayerMovement`, al pulsarlo con `controller.isGrounded`, poner `verticalSpeed = 6`.
  `PlanarMovement.ApplyGravity` ya hace el resto.
- **No subir terrazas:** en Unity las terrazas son colliders reales. El `CharacterController` en el aire **sí** se posa
  encima si el borde está por debajo de 0,83 m + `stepOffset`. Hay que comprobarlo en las escenas generadas
  (`OlmecaCityGenerator`, `OlmecaDungeonGenerator`): si alguna terraza es más baja, subir su collider o limitar la altura.
- **Trampas:** `Dungeon/SpikeTrap` y `Dungeon/PressurePlate` usan triggers. En el aire hay que ignorar al jugador, por
  ejemplo si `!controller.isGrounded` y está más de 0,3 m por encima de la trampa.
- **Animación:** `DirectionalSpriteAnimator` con el set de correr mientras no esté en el suelo.

**Pruebas:** altura máxima entre 0,8 y 0,9 m; no salta en el aire, defendiendo ni esquivando; no sube a una terraza de
1 m; sobre un pincho arriba, en el aire no hay daño y al caer sí.

## 3. Brinco de los enemigos que persiguen

**Qué hace.** Mientras persiguen al jugador, los que van a pie brincan hacia él de vez en cuando.

- Cada 2,5 a 5 s (al azar), si está a entre 1,5 y 5 m: 5 m/s hacia arriba (0,6 m) y un empujón de 8 m/s hacia el jugador
  (lo acerca casi 1 m).
- Lo hacen el espíritu corrompido (`EnemyChaser`) y la fauna que no vuela (`WildEnemy` con `flies == false`). El jaguar,
  el eco, los voladores y los jefes, no.
- La sombra se queda en el suelo.

**En HTML:** `saltoEnemigo` y `SALTO_ENEMIGO` (`js/actores.js`); lo llaman `actualizarEspiritu` y `actualizarFauna`.

**En Unity:** en `EnemyChaser` y `WildEnemy`, con su propia velocidad vertical y la gravedad de −20. Solo en `Chase` (la
fauna) o persiguiendo (el espíritu), y sin aturdir. La sombra de URP sigue al sprite: si debe quedarse en el suelo, hace
falta una sombra aparte.

## 4. Salto del Guardián

**Qué hace.** Un ataque nuevo a distancia: se agacha, marca un círculo donde está el jugador, salta y cae ahí.

- **Cuándo:** en `ChooseAttack`, en lugar de la última línea (`Phase >= 2 && n % 2 == 0 ? Shards : Charge`):
  `if (Phase >= 2 && n % 2 == 0) return Shards; return n % 4 == 1 ? Leap : Charge;`. Sale en el primer ataque lejano y
  luego cada cuatro.
- **Aviso:** `TelegraphMarker` en círculo de 1,8 m sobre el jugador, durante `baseWindup × 1,6` (en la fase 3, × 0,75, como
  los demás ataques).
- **Vuelo:** en los últimos 0,5 s del aviso, de su sitio al destino, a `sin(p·π) × 2 m` de alto.
- **Al caer:** `heavyDamage` (20) con empuje de 1,6 a quien siga dentro del círculo, sacudida de 0,3, y queda expuesto 0,9 s.
- **Destino:** si el punto está dentro de una columna, el último punto libre del camino (en HTML se recorre en pasos del 10 %).
- **Pose:** agachado al avisar (`slamPose`) y de embestida en el aire (`chargePose`).
- **Cambio de fase:** si cambia de fase en pleno salto, el salto se cancela y vuelve al suelo.

**En HTML:** `ataqueGuardian(g, 'salto')`, `destinoSalto`, `avanzarSalto` y `SALTO_GUARDIAN` (`js/guardian.js`); se prueba
la elección con el `console.assert` del final.

**En Unity:** `GuardianAttack.Leap` en el enum de `Enemies/StoneGuardian.cs`, su corrutina en `AttackRoutine` y el cambio
en `ChooseAttack`. Con `ForceAttack(GuardianAttack.Leap)` se prueba suelto. Las pruebas de `ChooseAttack` que haya en
EditMode tendrán que incluir el nuevo orden.

## 5. Figuras de los jefes

**Qué hace.** Los dos jefes del arco olmeca usan figuras de la lámina «Jefes de Mazmorra» que Unity ya recortó
(`Art/Environment/Olmeca/Sprites/Jefes`, con `Tools/ArtPipeline/recortar_jefes.py`). En Unity solo las usan los ecos de
`Arena_Pruebas_Jefes`.

| Jefe | Figura | Pose del jefe → cuadro (`Jefe_<Clave>_<Cuadro>1_03`) | Escala |
|---|---|---|---|
| Guardián de la Piedra Viva | Chac Mool (`GuardianOfrenda`) | dormido → Reposo en gris · erguido → Reposo · paso y golpe → Avance · embestida → Ataque · rugido → Especial · liberado → Desplome | 1,5 |
| Espíritu del Jaguar | Xolotl (`PerroFuego`) | reposo → Reposo · caminar y aviso → Avance · zarpazo y salto → Ataque · rugido → Especial · liberado → Desplome | 1,5 |

- Solo hay vista de lado (`_03`), volteada según la dirección.
- **En HTML:** `FIGURA_CHACMOOL` y `dibujarGuardian` (`js/guardian.js`), y `FIGURA_XOLOTL` y `dibujarJaguar`
  (`js/actores.js`).
- **En Unity:** asignar a `StoneGuardian` (`seatedPose`, `standPose`, `chargePose`, `slamPose`, `roarPose`) y a `StoneJaguar` sets
  hechos con esos cuadros. `Editor/SceneGeneration/BossCharacterAssets.cs` ya arma los sets de los jefes de prueba, así que
  se pueden reutilizar. Después, regenerar los pisos 2 y 3 (`OlmecaDungeonGenerator`).
- **Decisión del autor pendiente:** el Chac Mool es tolteca y maya, y Xolotl, mexica. En Unity son ecos ficticios de la arena de
  pruebas (`Docs/Enemigos/Jefes_Prueba.md`) y el `CLAUDE.md` pide no mezclar culturas con lo olmeca. Antes de portarlo,
  decidir si se acepta como licencia y anotarlo en `Docs/Historia_Mundo.md`.

## 6. Sonido, vibración y opciones

Unity no tiene audio ni vibración. La versión HTML sintetiza todo con Web Audio (`js/sonido.js`), así que no hay archivos
de sonido que copiar; sirve como lista de qué suena y cuándo:

- **Efectos** (`SONIDOS`): `tajo`, `golpe`, `remate`, `esquiva`, `perfecta`, `bloqueo`, `escudo`, `herido`, `caida`,
  `muerte`, `disparo`, `aviso`, `impacto`, `rugido`, `ruptura`, `tierra`, `especial`, `rompe`, `vasija`, `premio`, `nivel`,
  `cura`, `dialogo`, `clic`, `portal`, `no`. Cada `sonar('…')` del código marca dónde suena.
- **Ambiente** (`AMBIENTES`): ruido filtrado por región. Ciudad y selva llevan pájaros; los pisos de la mazmorra, un dron
  grave, y el piso 2, gotas.
- **Vibración:** 40 ms al recibir daño y 10 ms al pulsar un botón táctil.
- **Opciones** (`cronicas.web.opciones`): volumen de efectos (0,8) y de ambiente (0,5), sacudida y vibración.
  En Unity, `ComfortSettings` ya tiene la sacudida; habría que añadir los volúmenes y la vibración, y mostrarlos en
  `ComfortOptionsView`.

## 7. Niveles de la mazmorra y salas generadas

**Qué hace.** Cada piso tiene cinco niveles, del X-1 al X-5. El 1-1, el 2-5 y el 3-5 son los pisos 1, 2 y 3 de Unity; los
demás se generan. El 1-5 es la arena de un sub-jefe. Los detalles están en el README (etapa 14) y en `js/niveles.js`.

**Valores** (revisados en la etapa 22 del README):
- salas de 7 a 10 × 5 a 7 m, pasillos de 2 a 4 m de largo y 3 de ancho, y una arena de 13 × 9;
- de 2 a 4 salas: `2 + min(2, (nivel + piso) / 3)`;
- enemigos por **presupuesto de amenaza** (`COSTE` por tipo y `PRESUPUESTO` por piso y nivel, en `js/niveles.js`), repartido
  entre las salas; ninguno en la primera sala del X-1, y 2 puntos antes de la nauyaca;
- pinchos en los pasillos si `nivel + piso ≥ 3`, el 70 % de las veces;
- santuario de Vida (`LifeShrine`, la mitad, una vez por incursión) en la primera sala del X-3;
- al limpiar un nivel: 15 × piso + 10 × nivel de experiencia y, en el X-2 y el X-4, una semilla medicinal preparada;
- la nauyaca da dos semillas preparadas.

**En Unity.** No hay escenas para los niveles generados y el flujo de Blender no sirve en tiempo de ejecución. Hay dos caminos:
- **En tiempo de ejecución** (recomendado, como aquí): una escena `Olmeca_Mazmorra_Generada`, con un generador que reciba
  piso, nivel y semilla, coloque losas como sprites o un `Tilemap` y los muros de basalto como prefabs, y deje un
  `SpawnPoint` y dos `ScenePortal`. `SceneTravel` necesitaría llevar el nivel destino además de la escena. Las losas
  pueden recortarse una vez en el editor del suelo de cada piso, como hace aquí `losasDe`: interiores, borde de atrás y
  borde de delante, sin agua ni sombras de objetos.
- **Pregeneradas:** `OlmecaDungeonGenerator` produce 12 escenas más con una semilla fija. Es más fácil, pero no cambian
  entre incursiones.

**Banderas:** `incursion.semilla`, `incursion.limpio.<nivel>` (las borra `IncursionReset`, que ya borra `incursion.*`) y
`olm.subjefe_1_vencido`. Los portales del piso 1 de Unity (bajada), del 2 (subida y bajada) y del 3 (subida) cambian de destino.

**Decisión pendiente:** `Docs/Mazmorras/Olmeca.md` plantea 3 pisos con un propósito cada uno y mini-jefes «cada dos o
tres pisos». Esto lo cambia a 15 niveles con un sub-jefe en el 1-5: habría que actualizar ese documento.

## 8. Animales de Veracruz y Tabasco: la nauyaca real

**Arte.** Los 33 cuadros de `arte/Animales/Nauyaca_<Animación>_<n>.png` se importan tal cual: 48 px/m, mirando al este y con el
pivote de `datos/animales.js` (punto de apoyo del rollo). Con `DirectionalSpriteAnimator` serían sets de una sola vista
(`_03`) con varios cuadros, a los fps de `datos/animales.js`. Si cambia la figura, se regenera con
`node herramientas/animales.mjs` y se vuelven a copiar.

**Comportamiento** (`js/animales.js`, constantes `NAUYACA`): un `MonoBehaviour` como `StoneJaguar`, con estados
`Dormant` (reposo), `Stalk` (acecho), `Windup` (aviso), `Strike` (golpe) y `Recover` (expuesta).
- La mordida usa `TelegraphMarker` en franja, de 2,9 × 0,9 m y 0,8 s, o de 1,8 × 0,8 m y 0,45 s si estás a menos de 1,7 m.
- Al morder quita 14 y aplica el veneno (`ISlowable`, 55 % durante 2,5 s).
- Con la mitad de la vida, los avisos se reducen a × 0,75 y muerde dos veces.
- Vida 140, `BreakGauge` de 4 con debilidad a Tierra y Luz, barra de jefe por `EVT_Jefe_Nombre` y `EVT_Jefe_Vida`.
- Al vencerla: la bandera `olm.subjefe_1_vencido` y se abre la bajada.

**Tamaño:** todos los animales están ya a la escala del Guardián jugable (1,12 m), a 48 px/m: en Unity no necesitan escala de
raíz. Ver la tabla de proporciones del README.

### El pecarí de collar

**Arte:** 38 cuadros, `arte/Animales/Pecari_<Animación>_<n>.png`, con el mismo formato que la nauyaca.

**Comportamiento** (`js/animales.js`, constantes `PECARI`): un componente con estados `Root` (hozar), `Warn` (eriza la cresta;
avisa a la manada), `Circle` (ronda entre 2,2 y 3,6 m), `ChargeWindup` (`TelegraphMarker` en franja de 4 × 0,8 m, 0,55 s),
`Charge` (6,5 m/s, 4 m, quita 9 al tocar; si la `CharacterController` no avanza, aturdido 0,8 s) y `Bite` (quita 6
a menos de 1,3 m).
- La manada: al avisar o recibir un golpe, los de su tipo en reposo a menos de 6 m pasan a `Warn`.
- Vida 26, `BreakGauge` de 2, débil a la Luz, y la esquiva saltando del paso 1.
- Sale en grupos de tres en las salas generadas de los pisos 1 y 2.

### El tapir

**Arte:** 38 cuadros, `arte/Animales/Tapir_<Animación>_<n>.png`, en un lienzo de 111 × 77 px.

**Comportamiento** (`js/animales.js`, constantes `TAPIR`):
- estados `Calm`, `Warn` (silba), `Stalk` (al paso, 1,5 m/s), `ChargeWindup` (franja de 4,5 × 1,4 m, 0,8 s), `Charge`
  (6 m/s, quita 14, empuje 2,4; contra un muro, aturdido 1,2 s), `Stomp` (círculo de 2,1 m delante, aviso de 0,75 s, quita 10)
  y `Exposed` (1 s);
- **pesado:** en Unity, sin el retroceso que aplica `PlayerAttack` y con un collider sólido que aparte al jugador;
- vida 90, `BreakGauge` de 5, débil a la Tierra; sin esquiva;
- uno en la sala más grande de las generadas del 2-3, del 2-4 y del piso 3, con un 85 % de probabilidad.

### El ocelote

**Arte:** 42 cuadros, `arte/Animales/Ocelote_<Animación>_<n>.png`, en un lienzo de 74 × 56 px.

**Comportamiento** (`js/animales.js`, constantes `OCELOTE`):
- estados `Idle`, `Warn` (bufa), `Stalk` (agazapado, 1,3 m/s, a unos 3,2 m), `PounceWindup` (`TelegraphMarker` en círculo
  de 0,95 m sobre el jugador, 0,5 s), `Pounce` (arco de 0,42 s, 0,8 m de alto y 4,2 m como mucho; quita 11),
  `Swipe` (dos zarpazos de 0,28 s que quitan 6) y `Retreat` (4,6 m/s durante 0,8 s, de espaldas);
- vida 40, `BreakGauge` de 3, débil a la Luz, y esquiva saltando con un 40 % en vez de un 25 % (un campo por enemigo);
- sale en las salas generadas de los pisos 2 y 3.

### El mono aullador

**Arte:** 46 cuadros, `arte/Animales/Aullador_<Animación>_<n>.png`, en un lienzo de 62 × 56 px.

**Comportamiento** (`js/animales.js`, constantes `AULLADOR`):
- estados `Idle`, `Sit` (a 3,8-6 m), `Throw` (0,42 s; suelta un `Projectile` en línea a 6,5 m/s que quita 6),
  `HowlWindup` (`TelegraphMarker` en anillo de 4 m, 0,8 s), `Howl` (quita 4 y frena al 30 % durante 1,6 s por `ISlowable`)
  y `Flee` (a 3,4 m/s, hacia un punto libre a su distancia, si te acercas a menos de 2,6 m);
- en pareja: el aullido se coordina para que no aúllen a la vez (una comprobación entre los de su tipo, o un servicio de tropa);
- vida 30, `BreakGauge` de 2, débil a la Tierra, y la esquiva saltando;
- sale en las salas generadas de los pisos 1 y 3.

### El armadillo

**Arte:** 47 cuadros, `arte/Animales/Armadillo_<Animación>_<n>.png`, en un lienzo de 49 × 37 px.

**Comportamiento** (`js/animales.js`, constantes `ARMADILLO`):
- estados `Idle`, `Warn` (se yergue), `Circle` (entre 1,8 y 3,2 m), `Dig` (0,55 s), `Underground` (sin collider golpeable,
  avanza a 4,2 m/s; al final, `TelegraphMarker` en círculo de 0,95 m durante 0,55 s donde esté el jugador, y sale: quita 9),
  `Exposed` (0,9 s), `Startle` (salto vertical de 0,9 m en 0,5 s, invulnerable, si el jugador está a menos de 1,1 m; espera de
  3 s) y `Curled` (el 45 % de las veces que le pegan, durante 1,3 s, con `DamageFactor` 0,25 salvo la afinidad Tierra);
- bajo tierra debe seguir contando como enemigo vivo del nivel aunque no se le pueda golpear;
- vida 34, `BreakGauge` de 3, débil a la Tierra;
- sale en las salas generadas de los pisos 1 y 2.

### El pejelagarto

**Arte:** 41 cuadros, `arte/Animales/Pejelagarto_<Animación>_<n>.png`, en un lienzo de 76 × 48 px: Nada ×8, Respira ×6,
Aviso ×4, Embiste ×5, Mordida ×4, Varado ×6, Daño ×2 y Muerte ×6. En el agua el juego recorta el sprite en la línea del agua
y dibuja debajo su silueta oscura; sumergido, solo la silueta (en Unity: `SpriteMask` o un material con corte por altura).

**Comportamiento** (`js/animales.js`, constantes `PEJE`):
- vive en una **charca** de agua vadeable (5 × 3 m sin esquinas) que el generador abre en el centro de una sala sin tapir,
  mejor una de en medio; nunca sale del agua salvo saltando;
- estados `Swim` (sumergido, sin collider golpeable, a 1,7 m/s hacia la orilla más cercana al jugador si está a menos de
  7 m), `Breathe` (cada 5-7,5 s sube 1,5 s a tragar aire, golpeable), `LeapWindup` (`TelegraphMarker` en franja de
  0,8 m durante 0,6 s, si el jugador está a 3,4 m; la franja sigue al jugador y se fija 0,25 s antes del salto, y llega 1,2 m
  más allá de él, hasta 3,4 m), `Leap` (0,42 s en arco de 0,55 m; quita 12),
  `Stranded` (si cae en tierra: 1,6 s coleteando, golpeable), `Crawl` (vuelve a 1,8 m/s a la celda de agua más cercana y se zambulle sin asomarse),
  `SideBite` (si el jugador está en el agua a menos de 1,6 m: círculo de 0,85 m durante 0,38 s; quita 8) y `Dive` (0,55 s
  golpeable); espera de 1,3-2,1 s entre ataques;
- aguante: en el agua (`Breathe`, `SideBite`, `Dive`), al segundo golpe de cada asomada se sumerge al momento;
  en tierra (`Stranded`, `Crawl`), al segundo golpe brinca de vuelta a la celda de agua más cercana (0,42 s, invulnerable);
- sumergido debe seguir contando como enemigo vivo del nivel, como el armadillo bajo tierra;
- vida 44 (×1,5 de los comunes), `BreakGauge` de 3, débil a la Luz, coste 4 en el presupuesto;
- sale en las salas generadas del piso 2 (del 2-1 al 2-4), uno como mucho por nivel: en unos 4 de cada 10 niveles.

**Contenido cultural:** la nauyaca real, el pecarí de collar, el tapir, el ocelote, el mono aullador, el armadillo y el
pejelagarto son animales reales de la región olmeca. Los datos son documentados: el aspecto
de los dos, el veneno de la nauyaca; la manada, la cresta erizada y el castañeteo del pecarí; el silbido y la
embestida del tapir acosado; el acecho y el salto del ocelote; el aullido de la
tropa de aulladores (el aturdimiento es ficticio); el armadillo que excava, se sobresalta con un salto y
no se hace bola (el ataque desde debajo de la tierra es ficticio); y el pejelagarto, que respira aire en la superficie y
ataca de lado (el salto fuera del agua contra el jugador es ficticio). El papel de la nauyaca como
guardiana de la sala es ficticio.

## 9. Movimiento por código de los enemigos de un solo cuadro

**Qué hace.** Les da vida a los sprites de una sola imagen por pose (`js/movimiento.js`, tablas `ESTILOS`) estirando,
aplastando, inclinando y desplazando el sprite alrededor de su pie según la pose: respirar, botar al andar (o, si es la
serpiente, ondular), aletear, anticipar el ataque, la estocada, la sacudida del golpe, el aplastamiento al aterrizar, la media
vuelta y el vuelco de la muerte. Los valores de cada estilo están en la tabla.

**En Unity.** Un componente `ProceduralMotion` en el hijo `Sprite` de cada enemigo, que lea el estado (`WildEnemy.State`,
`StoneJaguar`, `StoneGuardian`) y escriba `localScale` y `localRotation` (giro en z, alrededor del pivote del pie) y un
desplazamiento local:
- `DirectionalSpriteAnimator` ya voltea con la escala X: la media vuelta tiene que multiplicar sobre ese signo, no sustituirlo;
- el billboard (`SpriteBillboard`) gira el sprite hacia la cámara, así que la inclinación va en un hijo intermedio;
- con `ComfortSettings` se podría bajar la intensidad para quien lo prefiera.

## 10. Dificultad de los jefes

Valores revisados con un jugador automático (README, etapa 23):
- **Vida:** nauyaca 380; jaguar 540 desde la etapa 33 (en Unity, `StoneJaguar`, 160); Guardián 1100 desde la etapa 37, por las armas (antes 700; en Unity, `StoneGuardian`, 400). Las fases del
  Guardián siguen al 60 % y al 25 %.
- **Contraataque:** si un jefe recibe 6 golpes en 2,5 s, `TelegraphMarker` en círculo de 2,2 m alrededor durante 0,4 s; quita 8
  con empuje 2,2; espera de 4 s. En Unity puede contarse en `Health` (un evento por golpe del jugador) y lanzarse desde cada jefe.
- **Jaguar:** acecho de 0,7-1,1 s entre ataques y zarpazo encadenado tras el salto si el jugador queda a menos de 2,4 m.

## 11. Dificultad de los enemigos comunes

Valores revisados con el jugador automático (README, etapa 24):
- **Aguante:** en `WildEnemy`, el golpe que interrumpe el ataque y aturde debería hacerlo como mucho una vez cada 2,5 s
  (el bloqueo perfecto, por `IStaggerable`, siempre).
- **Espíritu corrompido** (`EnemyChaser` de las incursiones): su golpe de contacto pasa a ser una mordida avisada, un
  `TelegraphMarker` en círculo de 0,75 m delante, 0,4 s de aviso, 10 de daño y 1 s de espera.
- **Eco borrado** (`ErasedEcho`): vida 30 y primer disparo a los 0,6 s.
- **Vida ×1,5** de los enemigos comunes (las vidas de `EnemyData` y las de los animales nuevos). Los jefes, no.

## No portar

- **Aviso de girar el celular y escala por el lado corto:** solo hacen falta en el navegador. Unity ya fija el horizontal
  (`ProjectSettings`: sin retrato).
- **Rejilla de colisión** (`js/mundo.js`): es la optimización de la versión HTML; Unity usa su física.

## 12. Efectos de golpe y ataque (etapa 26, `js/efectos.js`)

Valores en `EF`. En Unity: un `HitFeedback` con `ParticleSystem` para chispas (7 al golpear, 14 al morir; 0,32 s; gravedad 9),
un sprite de estrella + 3 trazos (`LineRenderer`) de 0,22 s en el jugador al recibir daño, una pausa `TimeDilation` de 0,05 s, un
icono «!» sobre la cabeza al empezar `TelegraphMarker`/aviso (0,55 s), polvo al correr > 3 m/s y un `TrailRenderer` o copias del
sprite (4, cada 0,035 s, 0,18 s de vida) a > 5,5 m/s. La estocada de `Ataque`: curva de escala que sale en 0,07 s, se pasa un 20 % y
se asienta con exp(-12 t).

## 13. Onda al aterrizar, números que botan y restos (etapa 27, `js/efectos.js`)

- Onda: al tocar suelo tras caer > 0,3 m, jefes y `pesado`: anillo 0,45 s hasta 2,2 m, 8 polvos, temblor 0,2 s (en Unity, en el
  `OnLanded` del controlador del enemigo; un `ParticleSystem` con forma de anillo).
- Número de daño: escala 11/8 → 1 en 0,12 s, bote parabólico de 0,6 m en 0,3 s, rebote de 0,15 en 0,2 s, deriva lateral ±0,3 m
  (en Unity, en el prefab del número flotante con una `AnimationCurve`).
- Restos por especie (`RESTOS`: colores, cantidad, gravedad, tamaño, si planean): un campo `deathDebris` en `EnemyDefinition`.

## 14. Cuadros de ataque por partes (etapa 28, `js/cuadros.js`)

En Unity, lo más limpio es partir el sprite de ataque de cada fauna en hijos (cabeza, mandíbulas, torso, aguijón, alas) con los
rectángulos y pivotes de `PARTES` (píxeles del PNG de 64 px de alto, mirando a la derecha) y animar su rotación y posición en el
`Animator`: aviso = valor `aviso` con ease-out según el progreso del windup; golpe = `golpe` × curva 0 → 1,25 en 0,06 s → 0,55
con exp(-10 t); alas con seno a `hz`. Alternativa: pedir al artista 3 cuadros (preparación, golpe, seguimiento) con esas poses.

## 15. Partes para el vuelo, el espíritu y los jefes (etapa 29, `js/cuadros.js`)

Igual que el apartado 14, con los rectángulos de `PARTES` para `Enemigo_{Avispa,Guacamaya,Murcielago}_Volar` (alas con seno),
`Enemigo_EspirituJaguar_Ataque` (sin quitar el cuadro de debajo), `Jefe_PerroFuego_Ataque` (cabeza; llamas con seno de 2,5 Hz) y
`Jefe_GuardianOfrenda_Ataque` (puños: arriba en el aviso de la embestida, golpe al lanzarse). En Unity los PNG de jefe son de 128 px.

## 16. Botones táctiles en arco con iconos (etapa 30, `index.html`)

En el Canvas táctil de Unity: Atacar grande en la esquina inferior derecha; arco interior (r ≈ 104 px de referencia) con
Esquivar, Saltar y Defender; arco exterior (r ≈ 176 px) con Fijar, Tierra, Especial y Usar; Bolsa junto a Pausa. Iconos en lugar
de texto (los trazos están en `index.html`), Usar con icono «seguir» en diálogos y la espera de Tierra como número encima.

## 17. Atacar contextual y menos botones (etapa 31)

En táctil, el botón de ataque cambia de icono y de acción: Usar si `PlayerInteractor` tiene un objetivo y no hay enemigo a menos
de 3 m (mantener = acción de senda), Seguir en un diálogo. Sin botones de Usar ni de Fijar en táctil. Estilo: círculo oscuro
con borde y sombra, icono relleno con brillo del color de su función (ver `index.html`, `.tbtn`). En diálogo, ocultar el resto.

## 18. Dificultad para el celular (etapa 32)

- Mordida avisada del espíritu corrompido: aviso de **0,55 s** (antes 0,4).
- Presupuesto de amenaza de los niveles generados: piso 2 = 16, 18, 20, 22; piso 3 = 19, 21, 23, 26 (X-1 a X-4).

## 19. Vida del Espíritu del Jaguar (etapa 33)

Vida **540** (420 desde la etapa 23; 160 en Unity), para que dure más que la nauyaca con un jugador de celular.

## 20. Música prehispánica (etapa 34, `js/musica.js`)

Unity aún no tiene audio. Opciones: grabar dos bucles desde el navegador (explorar y pelear, en re y en la) e importarlos como
`AudioClip`, o rehacer el secuenciador con `OnAudioFilterRead`. Lógica a portar: un `MusicDirector` que pasa a pelea con un
aviso o proyectil activo, un jefe despierto o un enemigo a menos de 5 m (y se queda 4 s), cambia solo al empezar un compás y
suena el caracol al entrar en pelea; volumen propio en Opciones y al 40 % en pausa.

## 21. HUD compacto (etapa 35)

En el Canvas del HUD: panel arriba a la izquierda con el icono `ICO_marca_<guardián>` en un círculo, su nivel en una etiqueta,
barras de vida y energía con el texto «actual/máx» dentro, la experiencia como barra fina y las cargas de esquiva como rombos.
Latido de la barra de vida al 30 % o menos. Nivel de la mazmorra y enemigos que quedan en una ficha arriba al centro; la misión
en una línea con elipsis; los avisos bajo esa ficha.

## 22. Mazmorra: salas que serpentean y aspecto por piso (etapa 35)

`OlmecaDungeonGenerator` (o el generador de los niveles X-1…X-4): salas que salen de la anterior al este o, desde la tercera,
al norte/sur (60 %) con pasillo vertical de 3, sin solaparse (margen 2); esquinas rotas al 50 %. Fondo de cámara por piso en
lugar del negro (selva oscura / agua negra con nenúfares / basalto morado `#3a2f36`), decorado de vacío (helechos y rocas con
musgo; tule y nenúfar; rocas y escombros de basalto) y diseño propio de suelo y muros en los pisos 2 y 3 (lajas con musgo y charcos + muro de piedras de río; baldosas de
barro con cruz olmeca + sillares con greca): en Unity, un juego de tiles y de prefabs de muro por piso (referencia:
`js/pisos.js`, colores en `PALETA`).

## 23. Armas olmecas de la mazmorra (etapa 36)

Estrado (`Estrado_Ofrenda_01` + pickup) en la primera sala: X-2 un arma de cerca al azar (macana, mazo, lanza corta, cuchillo de
obsidiana, hacha), X-4 una a distancia (átlatl, jabalina, honda), X-1 de los pisos 2 y 3 el escudo rectangular. Duran la
incursión (`IncursionReset`), una por clase. De cerca: multiplicadores en `PlayerAttack` (daño, alcance, radio, espera); mazo
con desgaste de guardia y aturdir en el remate; cuchillo con crítico, sangrado y 40 usos; hacha que rompe `BreakableBasalt`.
A distancia: proyectil del jugador con autoapuntado (ninguno a < 2,2 m para no robar el golpe), munición, jabalina que atraviesa
2. Escudo: en `PlayerDefense`, factor 0,15 de frente y velocidad ×0,85. Maestría por Guardián (`MAESTRIA`: multiplica el daño
por clase; Itzel y Yaret con más alcance): un campo por clase en el GuardianData. Cofre de recompensas al limpiar un nivel (1-1, 2-5 tras el jaguar, generados): botín al azar por piso (`BOTIN_COFRE`), 35 % arma y
30 % munición; el 50 % de las `RewardChest` de Unity añaden un arma; el escudo nunca sale en cofres. Armero en la aldea:
NPC con menú de las 8 armas; la elegida se guarda y se da al empezar cada incursión. Valores en `ARMAS` y `COFRE` (`js/armas.js`).

## 24. Al caer, a la aldea; fuera, sin monstruos hasta completar la mazmorra (etapa 36)

`DefeatReturn`: en vez del santuario de la mazmorra, siempre a la escena de la aldea, punto de inicio, con la vida llena.
**Etapa 41:** en el piso 3, si en esta incursión ya se entró al 3-5, al santuario de Memoria del 3-5 (sin reiniciar la
incursión); y en esa antesala no aparece el espíritu que queda a menos de 4 m del punto donde despiertas.
Fauna de la selva y espíritus incursores de la aldea: solo con `olm.guardian_liberado`; los espíritus de MP_OLM_03 se quedan.

## 25. Dos armas, calidad por piso y especial de cada arma (etapa 37)

Inventario de incursión con 2 ranuras de `WeaponData` (cualquier clase) más el índice de la mano, y una acción nueva
`SwitchWeapon` (tecla R, botón táctil). `PlayerAttack`, el disparo y `PlayerSpecial` usan la de la mano; `PlayerDefense` mira
el escudo en cualquiera de las dos. Calidad (1-3) por instancia: ×0,6 / ×1 / ×1,35 según el piso (armero: 1). `PlayerSpecial`
deja de ser solo de Balam: cada `WeaponData` lleva su especial (área delante con radio y alcance, franja o abanico de
proyectiles; aturdir, sangrado, romper basalto), con el mismo coste (25) y la misma espera (5 s). Valores en `ESPECIAL_ARMA` y
`CALIDAD` (`js/armas.js`).

## 26. Arreglos de la simulación (etapa 38)

- **Llegada libre:** al generar un nivel (`DungeonLevelGenerator` o equivalente), ningún enemigo a menos de 4 m del punto de
  llegada (`LIBRE_LLEGADA`); la charca del pejelagarto, solo en una sala de en medio.
- **Arma de cofre u ofrenda** (`RewardChest`): con una ranura libre o la misma arma, se toma; con las manos llenas, pickup en
  el suelo junto al cofre en vez de cambiar la de la mano.
- **Arma a distancia sin munición:** se quita del inventario y la otra pasa a la mano.
- **Santuario de Vida en la antesala del 3-5** (`LifeShrine` en `Olmeca_Mazmorra_P3`, junto al de Memoria): en la campaña
  simulada se llegaba al Guardián con el 37 % de la vida.
- **Enemigo dentro de un muro al aparecer:** moverlo al hueco libre más cercano (en Unity, un `Physics.CheckCapsule` al
  aparecer, o revisar los puntos de los espíritus del piso 3 en el generador).

## 27. Animación de los animales pintados (etapa 39)

Cuando se porten los animales (§8), su `DirectionalSpriteAnimator` necesita también la capa de movimiento por código (§9): bote
al paso, inclinación al correr, anticipación en el aviso, estirón en el ataque y encogerse al recibir un golpe, con los valores
de `ESTILOS` (Pecari, Tapir, Ocelote, Aullador, Armadillo, Nauyaca, Pejelagarto) en `js/movimiento.js`. Los cuadros de andar se
repintaron con más zancada (`herramientas/animales.mjs`): copiar los PNG nuevos de `arte/Animales`.

## 28. Andar de frente y de espaldas de los guerreros (etapa 40)

Los cuadros `DSS_Guerrero_*` de andar hacia el sur y el norte (los mismos PNG que aquí, de `recortar_guerreros.py`) no mueven
los pies: el cuerpo se ladea («como pingüino»). Lo ideal es redibujar esas fichas en `Docs/Guerreros`. Mientras, el truco de
aquí: en `DirectionalSpriteAnimator`, para N y S usar el cuadro de reposo y alzar 2 px la parte baja (17 % del alto) de un
lado del pivote y luego del otro, con 1 px de bote en cada apoyo (`pasoFrontal`, `PASO_FRONTAL` en `js/actores.js`).

## 29. Recarga de energía y armero que cobra (etapa 42)

- **Recarga:** en Unity la energía tampoco se recupera sola. En `PlayerStats` (o donde se gaste en `PlayerSpecial`), sumar
  4 por segundo en `Update` hasta `maxEnergy` (`ENERGIA_REGEN` en `js/actores.js`).
- **Armero:** precios de `PRECIO_ARMERO` (`js/armas.js`; ver la tabla del README, etapa 42) como coste en la ficha de cada
  arma del armero; lo comprado se guarda en el save (`armero.compradas`); la macana, gratis.

## 30. Capítulo II: portal y primera región maya, Palenque (etapa 43)

- **Cierre del capítulo I:** al completar `MP_OLM_06` (aviso `examinar:altar_trono`), un diálogo de cierre y un
  `ScenePortal` que aparece en la plaza de `Olmeca_Ciudad` con `ActiveWhenFlags` (`may.portal_abierto`), entre los dos
  altares-trono (x 0, y 6,2 del flujo). Antes de viajar, una tarjeta de capítulo en el HUD (título y dos botones).
- **Escena nueva `Maya_Palenque`:** sin arte de Unity aún. Trazado en `PALENQUE` (`js/palenque.js`): suelo por tipos (tierra,
  caliza, puente), río Otolum de 3 m (agua que bloquea, bajo el puente), templo escalonado tras la plaza, tablero de glifos
  (`InscriptionInteractable`, aviso `examinar:tablero_palenque`), `MemoryShrine` en la llegada (y `DefeatReturn` a él) y
  fauna (`WildEnemy`: 2 serpientes y una guacamaya; ocelote y aulladores cuando se porten, §8). El arte pintado por código
  sirve de referencia para pedirlo a Blender.
- **Misión `MP_MAY_01`** (QuestData nuevo, al catálogo): pasos `examinar:tablero_palenque` y `hablar:gente_lakamha`.
- Ojo cultural: nada olmeca en la escena maya, y separar D, I y F como en la cabecera de `js/palenque.js`.

## 31. La aldea maya de Lakamha' (etapa 44)

- **Escena `Maya_Aldea`**, unida a `Maya_Palenque` por un `ScenePortal` al este de la plaza. Trazado en `ALDEA_MAYA`
  (`js/aldea_maya.js`): patio de tierra, río al sur, cinco casas, milpa, telar, fogón (estación Cocina) y comercio.
- **NPC:** siete `NpcData` con `NpcPatrol` (rutas en `ALDEA_MAYA.habitantes`). Hacen falta fichas mayas en `Docs/NPC`; los
  cuadros pintados por código (`pintarMaya`) son la referencia de ropa y colores.
- **Diálogos** (`DialogueData` con ramas por banderas) y **misión `MP_MAY_02`** (pasos `examinar:hoja_libro` ×3 y
  `hablar:escriba`; bandera `may.registros_recuperados`). El paso 2 de `MP_MAY_01` pasa a `hablar:escriba`. Las hojas 2
  y 3, en la plaza de Palenque, las suelta un `EnemyChaser` (espíritu) con `ReportOnDefeat`.

## 32. Armas mayas y armero de Lakamha' (etapa 45)

- Seis `WeaponData` nuevos con un campo de cultura (`ARMAS`, `cultura: 'maya'`, en `js/armas.js`; valores, especiales y precios en
  la tabla del README, etapa 45). La generación de estrados y cofres filtra por la cultura de la mazmorra.
- Armero maya: `NpcData` «Tallador de pedernal» en `Maya_Aldea` con su catálogo (`PRECIO_ARMERO`) y compras guardadas aparte
  (`armero_maya.compradas`).
- La defensa del escudo sale del escudo que se lleve (`escudoLlevado`), no de un único escudo.

## 33. Fauna de Chiapas (etapa 46)

- Tres `EnemyData` nuevos para `Maya_Palenque`: jaguar (comportamiento del ocelote con los valores de `JAGUAR_SELVA`),
  mono araña (del aullador sin aullido, `ARANA`) y tucán pico canoa (`TUCAN`: vuela a 1 m, franja avisada y picada). Sprites:
  los PNG de `arte/Animales/Jaguar_*`, `MonoArana_*` y `Tucan_*` (de `herramientas/animales.mjs`), o fichas nuevas.
- Lo que el ocelote y el aullador tengan en Unity (§8) debe leer sus valores de datos para reutilizarse así.

## 34. Mapa de la región (etapa 47)

- Minimapa en el HUD (UI Toolkit): una textura por escena, un píxel por metro, hecha desde el suelo, el agua y los
  colisionadores (como `fondoMapa`, `js/mapa.js`); marcadores para jugador, enemigos, NPC, `ScenePortal` y `MemoryShrine`.
- Objetivo: cada paso de `QuestData` puede llevar un objetivo en el mapa (NPC, objeto o escena); si está en otra escena, se
  marca el portal hacia ella (`RUTA`). Pulsar el minimapa lo agranda; una opción de `ComfortSettings` lo oculta.

## 35. Mazmorra maya, piso 1 (etapa 48)

- **Escenas:** `Maya_Mazmorra_P1` (o niveles generados como en la versión HTML: `m1_1`…`m1_4`) con el estilo «canales del
  Otolum» (caliza húmeda, canalillos de agua y bóvedas en saledizo; referencia en `losaCanal`/`muroCanal`, `js/pisos.js`).
- **Entrada:** `ScenePortal` en la plaza de `Maya_Palenque` con `ActiveWhenFlags` (`may.camino_agua`) e `IncursionReset` al
  cruzarlo; `DefeatReturn` al `MemoryShrine` de Palenque.
- **Generación por cultura:** `OlmecaDungeonGenerator` → un generador con datos por cultura (población, presupuesto, armas de
  estrado y cofre de esa cultura, calidad +1 en la maya).
- **Sub-jefe:** el cocodrilo de pantano, un `WildEnemy` con el `EnemyData` del cocodrilo a escala 1,9 y los valores de
  `COCODRILO_PANTANO` (`js/mazmorra_maya.js`), barra de jefe y `ReportOnDefeat` (`vencer:cocodrilo_pantano`). Misión `MP_MAY_03`.

## 36. Mazmorra maya, piso 2 (etapa 49)

- **Escenas:** `Maya_Mazmorra_P2` (o niveles generados `m2_1`…`m2_4`) con el estilo «cámaras de estuco» (estuco crema y rojo,
  tableros de glifos, bóveda en saledizo; referencia en `losaEstuco`/`muroEstuco`, `js/pisos.js`). Datos del piso en la clave 12
  de `POBLACION`, `PRESUPUESTO`, `VIDA_NIVEL` y `ESTILO` (`js/niveles.js`).
- **Sub-jefe:** el murciélago de la muerte, un `WildEnemy` con el `EnemyData` del murciélago a escala 2,8 y los valores de
  `MURCIELAGO_ESTUCO` (`js/mazmorra_maya.js`), barra de jefe y `ReportOnDefeat` (`vencer:murcielago_estuco`).
- **Misión:** `MP_MAY_03` suma los pasos `vencer:murcielago_estuco` y `llegar:observatorio`; `llegar:camaras_estuco` al entrar al 2-1.

## 37. Mazmorra maya, piso 3 y el Guardián de los Ciclos (etapa 50)

- **Escenas:** `Maya_Mazmorra_P3` (o niveles generados `m3_1`…`m3_4`) con el estilo «observatorio» (caliza, ventanas en T, cielo
  de noche de fondo; referencia en `losaObservatorio`/`muroObservatorio`, `js/pisos.js`). Datos del piso en la clave 13.
- **Jefe:** `StoneGuardian` reutilizado con otro `EnemyData`/animador: sprites `Jefe_SenorLluvia_*` (ya en Unity, Sprites/Jefes),
  1500 de vida, `BreakGauge` débil a Viento y Tierra, `ReportOnDefeat` (`vencer:guardian_ciclos`), bandera
  `may.guardian_ciclos_vencido`. Valores en `GUARDIAN_CICLOS` (`js/mazmorra_maya.js`).
- **Salida:** `ScenePortal` del 3-4 a `Maya_Palenque` (`desde_mazmorra`). Misión `MP_MAY_03` completa con `vencer:guardian_ciclos`.

## 38. Habilidad de agua y cierre del capítulo II (etapa 51)

- **Habilidad:** `PlayerWaterCurrent` (nuevo, junto a la de tierra de `BEN_tierra`): entrada V / botón Este secundario; franja de
  5 × 1,2 m delante, `Health.TakeDamage` con afinidad Agua (1,5 × ataque), empuje 9 a los no jefes, cura 6, coste 30, espera 5.
  Se activa con la bandera `may.bendicion_agua` (no ocupa ranura de Bendición). Valores en `CORRIENTE` (`js/agua.js`).
- **Obstáculo:** `BreakableMud` (como `BreakableBasalt`, pero solo lo rompe la corriente); uno en `Maya_Palenque` tapando un
  `RewardChest` (`REC_ofrenda_may_lodo`).
- **Historia:** `QuestData` `MP_MAY_04` (`hablar:escriba`, `examinar:tablero_palenque`), `ItemData` `fragmento_segunda_memoria`,
  entrada de Museo `registro.cultura.maya`, diálogos nuevos del escriba y la pantalla de fin de capítulo.

## 39. Respiro al despertar (etapa 52)

- Tras caer y despertar (santuario o aldea), 2 s de invulnerabilidad (`juego.jugador.inv = 2`, con el parpadeo de siempre).
  En Unity: al reaparecer, `Health` invulnerable 2 s (como el i-frame tras recibir daño).

## 40. Capítulo III: Teotihuacan (etapa 53)

- **Transición:** al terminar `MP_MAY_04`, `Portal` en `Maya_Palenque` (16,5; 3,5) con la tarjeta del capítulo III.
- **Escena nueva `Teo_Calzada`:** claro de llegada con `MemoryShrine`, sendero, Calzada de los Muertos (sur-norte), plaza
  con la Pirámide del Sol y un mural (`Interactable`, aviso `examinar:mural_teo`), Pirámide de la Luna al norte. Tile de
  estuco con cara en talud-tablero; props maguey y nopal. Coordenadas en `TEOTIHUACAN` (`js/teotihuacan.js`).
- **Historia:** `QuestData` `MP_TEO_01` (`examinar:mural_teo`, `hablar:gente_teo`); al caer en la escena, respawn en su santuario.
- **Plan del capítulo** (usuario): un dios por cultura (Huehueteotl/Fuego, Cocijo/Luz, Serpiente Emplumada/Viento) como jefe
  que se libera; la habilidad activa depende del día o la hora.

## 41. El barrio de Teotihuacan (etapa 54)

- **Escena `Teo_Barrio`** (salida al este de la plaza de `Teo_Calzada`): patio de estuco, conjuntos de departamentos, altar
  de patio, taller de obsidiana, fogón (`Station` Cocina) y comercio. Coordenadas en `BARRIO_TEO` (`js/barrio_teo.js`).
- **NPC** (`NpcData` + fichas nuevas; en HTML se pintan con `pintarMaya`): comerciante, tallador de obsidiana, alfarera,
  niña, niño, viajero zapoteco y mercadera maya (reutiliza la ficha maya). Prendas: tilma, quechquemitl, tocado ancho,
  orejeras, tocado zapoteco.
- **Historia:** `MP_TEO_01` paso 2 = `hablar:comerciante_teo`; `QuestData` `MP_TEO_02` (`hablar:ruta` ×3 y
  `hablar:comerciante_teo`; bandera `teo.camino_cueva`). En Unity, `DialogueData` necesita emitir un aviso extra por rama
  (como `rama(..., { aviso })`).
