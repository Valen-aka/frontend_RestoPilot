import {existsSync,readFileSync,readdirSync} from 'node:fs';
const frames=JSON.parse(readFileSync('src/app/screen-manifest.json','utf8'));
if(frames.length!==120||new Set(frames.map(f=>f.slug)).size!==120)throw Error('Faltan pantallas o hay identificadores repetidos');
for(const f of frames){for(const p of f.files)if(!existsSync(p))throw Error('Falta '+p);if(typeof f.contenidoImplementado!=='boolean')throw Error('Estado visual inválido: '+f.slug);}
const dialogs=readdirSync('src/app/dialogs',{withFileTypes:true}).filter(d=>d.isDirectory());
if(dialogs.length!==8)throw Error('Se requieren los ocho modales de la estructura');
for(const d of dialogs)for(const ext of ['ts','html','css'])if(!existsSync('src/app/dialogs/'+d.name+'/'+d.name+'-dialog.'+ext))throw Error('Falta archivo del modal '+d.name);
console.log('120 pantallas y 8 modales verificados; '+frames.filter(f=>f.contenidoImplementado).length+' vistas implementadas visualmente. Integración pendiente.');
