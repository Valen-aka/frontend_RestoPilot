import {existsSync, readFileSync, writeFileSync, unlinkSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

export function publicApiUrl(value) {
  if (!value) throw new Error('Configura RP_PUBLIC_API_URL con la URL pública HTTPS de la API Spring Boot terminada en /api.');
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) || !url.pathname.replace(/\/$/, '').endsWith('/api')) {
    throw new Error('RP_PUBLIC_API_URL debe ser HTTPS, terminar en /api y no contener credenciales, parámetros ni fragmentos.');
  }
  return url.href.replace(/\/$/, '');
}

function main() {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const apiUrl = publicApiUrl(process.env.RP_PUBLIC_API_URL);
  const target = resolve(root, 'src/environments/environment.publish.ts');
  const previous = existsSync(target) ? readFileSync(target) : null;
  try {
    writeFileSync(target, `// Public configuration generated only for the publication build.\nexport const environment = ${JSON.stringify({production: true, apiUrl})} as const;\n`);
    const result = spawnSync(process.execPath, [resolve(root, 'node_modules/@angular/cli/bin/ng.js'), 'build', '--configuration', 'publish'], {cwd: root, stdio: 'inherit'});
    if (result.error) throw result.error;
    process.exitCode = result.status ?? 1;
  } finally {
    if (previous) writeFileSync(target, previous); else if (existsSync(target)) unlinkSync(target);
  }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {main();} catch (error) {console.error(error.message); process.exitCode = 1;}
}
