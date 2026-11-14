import {readFileSync, writeFileSync} from 'node:fs';

const [beforePath, afterPath, output] = process.argv.slice(2);
if (!beforePath || !afterPath || !output) throw new Error('Uso: node perf-compare.mjs antes.json despues.json salida.csv');
const before = JSON.parse(readFileSync(beforePath, 'utf8'));
const after = JSON.parse(readFileSync(afterPath, 'utf8'));
if (before.stage !== after.stage || before.rounds !== after.rounds)
  throw new Error('Las cargas comparadas deben tener el mismo número de usuarios y rondas.');
const group = data => Map.groupBy(data.samples, row => `${row.role}|${row.route}`);
const percentile = (rows, q) => {
  const values = rows.map(row => row.elapsedMs).sort((a, b) => a - b);
  return values[Math.ceil(values.length * q) - 1];
};
const oldGroups = group(before), newGroups = group(after);
const rows = ['rol,endpoint,n_inicial,n_final,p50_inicial_ms,p50_final_ms,p95_inicial_ms,p95_final_ms,cambio_p95_pct,errores_inicial,errores_final'];
for (const [name, oldRows] of [...oldGroups].sort(([a], [b]) => a.localeCompare(b))) {
  const newRows = newGroups.get(name);
  if (!newRows || oldRows.length !== newRows.length) throw new Error(`Muestras incompatibles en ${name}`);
  const [role, route] = name.split('|');
  const p95Before = percentile(oldRows, .95), p95After = percentile(newRows, .95);
  rows.push([role, route, oldRows.length, newRows.length, percentile(oldRows, .5), percentile(newRows, .5),
    p95Before, p95After, Math.round(1000 * (p95After / p95Before - 1)) / 10,
    oldRows.filter(row => row.status !== 200).length, newRows.filter(row => row.status !== 200).length].join(','));
}
writeFileSync(output, rows.join('\n') + '\n');
console.log(`comparados=${rows.length - 1} stage=${before.stage} errores=${before.failures.length}->${after.failures.length} duracion_ms=${before.elapsedMs}->${after.elapsedMs}`);
