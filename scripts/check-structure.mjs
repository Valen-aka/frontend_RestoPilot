import {existsSync,readFileSync} from 'node:fs';
const frames=JSON.parse(readFileSync('src/app/screen-manifest.json','utf8'));
if(frames.length!==120||new Set(frames.map(f=>f.slug)).size!==120)throw Error('Faltan pantallas');
for(const f of frames){for(const p of f.files)if(!existsSync(p))throw Error('Falta '+p);if(f.contenidoImplementado!==false)throw Error('Debe ser solo estructura');}
console.log('120 carpetas de pantalla y 8 modales preparados. Contenido y lógica pendientes.');
