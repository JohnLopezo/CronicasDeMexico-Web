# Propuesta: los dioses como jefes finales, según la hora del día

Estado: **propuesta del autor (2026-11-20), pendiente de pasar a la biblia** (`Docs/Historia_Mundo.md` y
`Docs/Historia/Capitulos.md` del proyecto de Unity). Cuando se revise, se copia allí con los cambios de la sección 5.

## 1. La idea

- El **jefe final de cada mazmorra es un dios** de la cultura de esa región. Es la **memoria del dios corrompida por la
  Sombra**: no es malvado y, al vencerlo, se libera y te ayuda (como pide la biblia §10.3).
- Cada cultura tiene **varios dioses** (de 3 a 4), pero en cada visita aparece **uno solo** en el altar del último piso.
- **Cuál aparece depende del momento del día** en un **ciclo de día y noche dentro del juego**: amanecer, día, atardecer y noche.
- Liberar a un dios da **su habilidad**, que el jugador conserva, y su ficha en el Códice o el Museo. Para conseguir todas las
  habilidades de una cultura hay que volver a la mazmorra a otra hora.

## 2. Reglas

1. **Ciclo:** un día de juego completo dura 24 minutos de juego (6 por momento, valor de partida, a ajustar). Se ve en el
   cielo, la luz y el HUD (un sol o una luna).
2. **Elección del dios:** cuenta el momento en que entras en el altar del último piso. Una vez empezada, la pelea no cambia
   aunque pase el tiempo.
3. **Ya liberado:** si a esa hora toca un dios que ya liberaste, aparece en paz. Puedes hablar con él o esperar al siguiente
   momento; la mazmorra cuenta como superada.
4. **Historia:** la misión del capítulo se cierra con el **primer** dios liberado (fragmento de memoria y portal). Los demás
   son opcionales y dan habilidades, Bendiciones y fichas.
5. **Habilidades:** cada dios da **su versión** de un elemento. Dos dioses de fuego de culturas distintas no dan la misma
   habilidad. Así no se acaban los elementos en el capítulo III.
6. **Cada dios tiene sus propios ataques y fases**, sacados de sus atributos documentados.

## 3. Ejemplo: Teotihuacan

| Momento | Dios | Fidelidad | Habilidad (propuesta) |
|---|---|---|---|
| Noche | Dios Viejo del Fuego (Huehueteotl) | D: braseros sobre su cabeza, muy documentados en Teotihuacan | Fuego: brasero que arde y quema |
| Día | Dios de la Tormenta | D: el dios de la lluvia y el rayo con anteojeras y colmillos; I: el nombre «Tláloc» es náhuatl posterior | Luz: el rayo que revela y aturde |
| Amanecer | Serpiente Emplumada | D: tiene su propio templo con cabezas esculpidas; I: su relación con el viento (Ehécatl) es posterior, mexica | Viento: impulso y corte de aire |
| Atardecer | Gran Diosa | I: los arqueólogos todavía discuten su identidad (murales de Tetitla y Tepantitla) | Oscuridad: lo oculto, camuflaje |

D: documentado · I: interpretación · F: ficción del juego. El juego lo muestra en la ficha de cada dios.

## 4. Preguntas abiertas

- **Capítulos I y II:** sus jefes (el Guardián de la Piedra Viva y el Guardián de los Ciclos) son guardianes ficticios, no
  dioses. ¿Se quedan así, o se añaden dioses olmecas y mayas? Para los olmecas la evidencia es escasa: la biblia §10.2
  aconseja guardianes ficticios.
- Los dioses de **Monte Albán, Xochicalco** y los capítulos IV y V (hay que investigarlos uno por uno, biblia §10.1).
- La **duración del ciclo** y si algo más cambia con la hora: enemigos, gente del pueblo, música.
- Cómo **elegir la habilidad activa** cuando se tienen varias (botón de cambio, rueda).
- ¿La **Bendición** (elegir 1 de 3) la da cada dios o solo el primero de cada cultura?

## 5. Cambios propuestos a la biblia (Unity)

- **Historia_Mundo §7 (mazmorras y grandes guardianes):** añadir que el último piso de cada mazmorra de una cultura con dioses
  documentados tiene un altar donde aparece uno de sus dioses según el momento del día, y las reglas de la sección 2.
- **Historia_Mundo §10:** añadir §10.4, «Varios dioses por cultura»: cada uno se investiga y se marca (D/I/F); aparecer como jefe
  no lo convierte en enemigo, porque es su memoria corrompida.
- **Historia_Mundo §5:** las habilidades elementales vienen de los dioses y cada dios tiene su versión del elemento.
- **Capitulos.md (tabla general):** la columna «Habilidad del jefe» pasa a «Dioses y habilidades», y se añade una fila de
  ejemplo con Teotihuacan.
- **GDD §11:** la habilidad fija por arco pasa a ser una por dios liberado.
