// Each iteration starts a fresh browser. A failure stops the run; no retry hides it.
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const count = Number(process.env.CHAT_PANEL_RUNS || 5);
if (!Number.isInteger(count) || count < 1 || count > 20) throw new Error('CHAT_PANEL_RUNS debe estar entre 1 y 20.');
const output = path.resolve('artifacts/chat-panel-repeated', new Date().toISOString().replace(/[:.]/g, '-'));
fs.mkdirSync(output, { recursive: true });
const runs = [];
for (let index = 1; index <= count; index++) {
  const cpuRate = index % 2 === 0 ? 4 : 1;
  const directory = path.join(output, `run-${index}`);
  console.log(`Ejecución ${index}/${count}, CPU x${cpuRate}`);
  const result = spawnSync(process.execPath, ['scripts/chat-panel.test.cjs'], {
    stdio: 'inherit', timeout: 180000,
    env: { ...process.env, CHAT_PANEL_OUTPUT: directory, CHAT_PANEL_CPU_RATE: String(cpuRate) },
  });
  runs.push({ index, cpuRate, passed: result.status === 0, error: result.error?.message, directory });
  fs.writeFileSync(path.join(output, 'summary.json'), JSON.stringify({ runs }, null, 2));
  if (result.status !== 0) { process.exitCode = 1; break; }
}
console.log(`Evidencia: ${output}`);
