import {duplicateRoutes} from './route-audit.mjs';
import {existsSync,readFileSync,readdirSync} from 'node:fs';
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

const expectedDialogs = [
  'cliente-reserva-cancelar', 'op-categoria-eliminar', 'op-mesa-desactivar',
  'op-pedido-cancelar', 'op-plato-disponibilidad', 'op-plato-eliminar',
  'op-reserva-cancelar', 'op-reservas-modulo-confirmar',
];
const dialogFolders = readdirSync('src/app/dialogs', {withFileTypes: true})
  .filter(entry => entry.isDirectory()).map(entry => entry.name);
if (dialogFolders.length !== expectedDialogs.length) {
  throw Error('Deben conservarse las ocho carpetas de modales');
}
for (const dialog of expectedDialogs) {
  for (const extension of ['ts', 'html', 'css']) {
    const path = `src/app/dialogs/${dialog}/${dialog}-dialog.${extension}`;
    if (!existsSync(path)) throw Error('Falta ' + path);
  }
}


function verifyRoutes(directory){for(const entry of readdirSync(directory,{withFileTypes:true})){const file=directory+'/'+entry.name;if(entry.isDirectory())verifyRoutes(file);else if(entry.name.endsWith('.routes.ts')){const errors=duplicateRoutes(readFileSync(file,'utf8'),file);if(errors.length)throw new Error(errors.join('\n'));}}}
verifyRoutes('src/app/routes');
console.log('Rutas hijas comprobadas: sin definiciones duplicadas dentro del mismo nivel.');
