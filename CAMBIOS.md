# Cambios y validación

## Funcionalidad 1 — Umbral

- Cambios realizados: el botón Umbral ahora abre un modal para el equipo que tocaste, con el límite actual cargado. Si ponés algo que no es un número, o algo que no es mayor a 0 y hasta 150, no se guarda y te muestra un mensaje en rojo. Si está bien, se guarda en SQLite (`saveMaxTemp` en `localDb.ts`), se recargan los equipos y listo, se ve el límite nuevo en la tarjeta, en el contador de alarmas y en el panel HTML. En el panel agregué el límite al lado de la temperatura para que se note el cambio, y la barra se pone naranja solo si el equipo está en alarma (prendido y con temperatura >= límite). El modal es `src/components/LimitModal.tsx` y la lógica está en el viewmodel.
- Verificación: lo probé en el emulador. Puse `abc`, `0`, `151` y `200` y en todos me tiró el mensaje y no cambió nada. Le puse 20.5 a A-003 (que estaba en 24.3) y pasó a ALARMA, el contador marcó 1 y en el panel la barra se puso naranja con el 20.5. Apagué A-003 y quedó DETENIDO sin alarma. Cerré la app, la abrí de nuevo y el límite seguía guardado.

## Funcionalidad 2 — Historial

- Cambios realizados: el botón Historial abre un modal con las lecturas de ese equipo (fecha y hora, temperatura y origen). Las saca de la tabla `readings` de SQLite, solo las de ese equipo, de la más nueva a la más vieja y como mucho 10 (`getHistory` en `localDb.ts`). Si no hay ninguna muestra un mensaje que lo dice. El modal es `src/components/HistoryModal.tsx`.
- Verificación: en el emulador. A-003 sin lecturas mostraba el mensaje de vacío. Después de Simular ciclo aparecieron lecturas con origen "simulación" y después de Sincronizar API A-003 tuvo su lectura con origen "API ambiental". Simulé más de 10 veces y mostraba solo las últimas 10 con la más nueva arriba. Reinicié la app y el historial seguía ahí.

## Refactorización A

- Problema: el buscador armaba la consulta SQL pegando lo que escribía el usuario adentro del texto de la consulta. Eso es SQL injection, si escribís `' OR 1=1 --` te trae todo o te puede romper la consulta. Archivo afectado: `src/data/localDb.ts` (`findEquipment`).
- Solución: lo cambié a una consulta con parámetros (`LIKE ?`), así lo que escribe el usuario va aparte y nunca se toma como SQL. Lo hice porque es un problema de seguridad y porque las otras consultas del archivo ya usaban parámetros, esta era la única que no.
- Evidencia: buscar `P-1` sigue mostrando solo la bomba P-101 y con el buscador vacío salen los 3 equipos como antes. Con `' OR 1=1 --` antes salían los 3 equipos y ahora sale "No se encontraron equipos". También pasa `npm run typecheck`.

## Refactorización B

- Problema: la regla de alarma (equipo prendido y temperatura >= límite) estaba copiada en tres lugares y no era igual en todos. La tarjeta y el contador sí miraban si el equipo estaba prendido pero el panel HTML no, entonces un equipo apagado y caliente salía naranja en el panel aunque no estaba en alarma. Archivos afectados: `src/views/PlantScreen.tsx` y `src/components/OverviewWeb.tsx`.
- Solución: hice una sola función `isAlarm` en `src/domain/rules.ts` y la usan la tarjeta, el contador y el panel. El panel ahora recibe si está en alarma ya calculado. Así la regla está en un solo lugar y si cambia se cambia una vez sola, y todas las partes muestran lo mismo.
- Evidencia: con A-003 en alarma la tarjeta, el contador y el panel coinciden, y al apagarlo deja de estar en alarma en los tres. Lo demás sigue funcionando igual que antes y pasa `npm run typecheck`.

## Otros arreglos que hicieron falta

- `npm run typecheck` ya fallaba antes de tocar nada porque el `StatusBar` tenía `backgroundColor` y la versión de React Native del proyecto ya no lo acepta. Lo saqué y ahora pasa sin errores.
- Con `react-native 0.88.0` la app no abría en Expo Go, tiraba un error de que no encontraba el módulo de SQLite. Corrí `npx expo install --fix`, que dejó `react-native` en 0.88.1 y `react-native-safe-area-context` en 5.11, que son las versiones que pide Expo 58. Con eso abrió bien.

## Uso de IA (opcional)

- Herramienta utilizada: Claude Code.
- Qué acepté, revisé o corregí: revisé el código y probé todo en el emulador. Lo de las versiones salió de probar la app y ver que no abría.
