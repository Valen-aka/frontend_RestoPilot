# Diagnóstico de rendimiento

Los resultados de `2026-11-14-inicial/lecturas.csv` son una exploración de lecturas individuales. Los archivos `carga-*-con-datos.json` y `2026-11-14-integrado/comparacion-*.csv` contienen una prueba corta de carga con 1, 5 y 10 usuarios virtuales. Se midieron desde Windows local contra Spring en `localhost:8081`, Supabase Auth y PostgreSQL del proyecto de pruebas. No se guardaron tokens, contraseñas ni respuestas de usuarios.

Para comparar una optimización, repetir las mismas rutas, rol, volumen de datos y entorno; registrar al menos p50, p95, errores y concurrencia. Ejecutar pruebas de carga con escrituras únicamente en un entorno aislado.

`scripts/perf-readonly.mjs` exige `RP_PERF_PUBLISHABLE_KEY`, `RP_PERF_USERS_JSON` (cuentas de prueba, con rol/correo/contraseña), `RP_PERF_VUS`, `RP_PERF_ROUNDS` y `RP_PERF_OUTPUT`. Las credenciales se pasan como variables de proceso, nunca se guardan en el repositorio. El script solo acepta la API local en `localhost:8081`, autentica las cuentas una vez y reutiliza sus tokens durante las rondas. Repartir 10 VU entre tres cuentas no equivale a diez identidades distintas.

Ejemplo de invocación después de configurar esas variables de forma privada:

```powershell
node scripts/perf-readonly.mjs
node scripts/perf-compare.mjs docs/performance/2026-11-14-inicial/carga-10vu-con-datos.json docs/performance/2026-11-14-integrado/carga-10vu.json docs/performance/2026-11-14-integrado/comparacion-10vu.csv
```

El p95 de 12 a 16 muestras por endpoint es orientativo. No es una prueba de resistencia de jornada completa ni una garantía de capacidad. Los resultados de cada rama aislada (`pedidos`, `reservas`, `catalogo`, `reportes`) ayudan a atribuir cambios; la comparación integrada mide el efecto conjunto.
