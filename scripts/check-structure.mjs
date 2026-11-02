import {existsSync,readFileSync} from 'node:fs';
const frames=JSON.parse(readFileSync('src/app/screen-manifest.json','utf8'));
if(frames.length!==120||new Set(frames.map(f=>f.slug)).size!==120)throw Error('Faltan pantallas o hay identificadores repetidos');
const implemented=[];
for(const f of frames){
  if(typeof f.contenidoImplementado!=='boolean')throw Error('Estado de implementación inválido: '+f.slug);
  for(const p of f.files)if(!existsSync(p))throw Error('Falta '+p);
  if(f.contenidoImplementado){
    const html=f.files.find(p=>p.endsWith('.html'));
    const content=html?readFileSync(html,'utf8').replace(/<!--[\s\S]*?-->/g,'').trim():'';
    if(!content)throw Error('Pantalla marcada como implementada sin plantilla: '+f.slug);
    if(!f.status||/^(pendiente|to do)$/i.test(f.status.trim()))throw Error('Estado no refleja la implementación: '+f.slug);
    implemented.push(f.slug);
  }
}
console.log('120 escenarios conservados. '+implemented.length+' interfaces declaradas; '+(120-implemented.length)+' pendientes. Este chequeo estructural no valida integración ni aceptación.');
