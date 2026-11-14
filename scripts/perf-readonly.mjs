import {writeFileSync} from 'node:fs';

const api = process.env.RP_PERF_API ?? 'http://localhost:8081';
const auth = process.env.RP_PERF_AUTH ?? 'https://unvxosrwqmcwrtxplrsf.supabase.co';
const key = process.env.RP_PERF_PUBLISHABLE_KEY;
const users = JSON.parse(process.env.RP_PERF_USERS_JSON ?? '[]');
const stage = Number(process.env.RP_PERF_VUS ?? 1);
const rounds = Number(process.env.RP_PERF_ROUNDS ?? 4);
const output = process.env.RP_PERF_OUTPUT;
const reportDate = process.env.RP_PERF_REPORT_DATE ?? '2026-11-07';
if (!/^http:\/\/(localhost|127\.0\.0\.1):8081$/.test(api) || !key || !output ||
    !Array.isArray(users) || users.length < 3 || !Number.isInteger(stage) || stage < 1 || stage > 10 ||
    !Number.isInteger(rounds) || rounds < 1 || rounds > 10 || !/^\d{4}-\d{2}-\d{2}$/.test(reportDate))
    throw new Error('Configuración de prueba inválida.');

const samples = [];
const failures = [];
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function timed(role, route, token) {
  const start = performance.now();
  let status = 0;
  try {
    const response = await fetch(api + route, {headers: {Authorization: `Bearer ${token}`}, signal: AbortSignal.timeout(20000)});
    status = response.status;
    await response.arrayBuffer();
  } catch { failures.push({role, route, kind: 'network'}); }
  const elapsedMs = Math.round(performance.now() - start);
  samples.push({role, route: route.split('?')[0], status, elapsedMs});
  if (status !== 200 && status !== 0) failures.push({role, route, kind: `http_${status}`});
}
async function login(user) {
  const response = await fetch(auth + '/auth/v1/token?grant_type=password', {
    method: 'POST', headers: {apikey: key, 'Content-Type': 'application/json'},
    body: JSON.stringify({email: user.email, password: user.password}), signal: AbortSignal.timeout(20000)
  });
  if (!response.ok) throw new Error(`No se pudo preparar cuenta ${user.role}: HTTP ${response.status}`);
  const body = await response.json();
  if (typeof body.access_token !== 'string') throw new Error('Supabase no entregó token.');
  const profileResponse = await fetch(api + '/api/auth/me', {headers: {Authorization: `Bearer ${body.access_token}`}});
  if (!profileResponse.ok) throw new Error(`Spring rechazó perfil ${user.role}: HTTP ${profileResponse.status}`);
  const profile = await profileResponse.json();
  if (profile.rol !== user.role) throw new Error('El rol verificado no coincide.');
  return {...user, token: body.access_token, restaurantId: profile.restauranteId};
}
const ready = await Promise.all(users.map(login));
const scenario = async (user) => {
  const token = user.token, rid = user.restaurantId;
  await timed(user.role, '/api/auth/me', token);
  if (user.role === 'CLIENTE') {
    await timed(user.role, '/api/restaurantes', token);
    await Promise.all([
      timed(user.role, '/api/platos/restaurante/1', token),
      timed(user.role, '/api/categorias/restaurante/1', token)
    ]);
    await pause(300);
    await Promise.all([
      timed(user.role, '/api/pedidos/me?page=0&size=10', token),
      timed(user.role, '/api/reservas/me', token),
      timed(user.role, '/api/notificaciones/me?page=0&size=10', token)
    ]);
  } else {
    await Promise.all([
      timed(user.role, `/api/restaurantes/${rid}`, token),
      timed(user.role, `/api/reportes/operativos?fechaInicio=${reportDate}&fechaFin=${reportDate}&tipo=CONSOLIDADO`, token),
      timed(user.role, '/api/notificaciones/me?page=0&size=10', token)
    ]);
    await pause(300);
    await Promise.all([
      timed(user.role, '/api/pedidos/pendientes?page=0&size=10', token),
      timed(user.role, '/api/reservas', token)
    ]);
  }
};
const begun = performance.now();
await Promise.all(Array.from({length: stage}, async (_, i) => {
  const user = ready[i % ready.length];
  for (let round = 0; round < rounds; round++) { await scenario(user); await pause(350); }
}));
const report = {stage, rounds, elapsedMs: Math.round(performance.now() - begun), samples, failures};
writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
const percentile = (values, p) => values.slice().sort((a, b) => a - b)[Math.ceil(values.length * p) - 1];
const groups = Map.groupBy(samples, sample => `${sample.role} ${sample.route}`);
for (const [name, rows] of groups) {
  const durations = rows.map(row => row.elapsedMs);
  console.log(`${name} n=${rows.length} p50=${percentile(durations, .5)} p95=${percentile(durations, .95)} errors=${rows.filter(row => row.status !== 200).length}`);
}
console.log(`stage=${stage} rounds=${rounds} requests=${samples.length} failures=${failures.length} elapsed_ms=${report.elapsedMs}`);
