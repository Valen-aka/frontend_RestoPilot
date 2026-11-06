import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {duplicateRoutes,routeGroups} from './route-audit.mjs';
test('detecta rutas hermanas duplicadas aunque una incluya guards',()=>{const errors=duplicateRoutes("const routes=[{path:'mesas'},{path:'mesas',canActivate:[auth]}];");assert.equal(errors.length,1);assert.match(errors[0],/mesas/);});
test('permite el mismo path en niveles distintos sin confundir padre e hijo',()=>{assert.deepEqual(duplicateRoutes("const routes=[{path:'',children:[{path:''},{path:'mesas'}]},{path:'mesas'}];"),[]);});
test('todos los archivos de rutas conservan definiciones únicas por nivel',()=>{function check(dir){for(const e of readdirSync(dir,{withFileTypes:true})){const file=dir+'/'+e.name;if(e.isDirectory())check(file);else if(file.endsWith('.routes.ts'))assert.deepEqual(duplicateRoutes(readFileSync(file,'utf8'),file),[]);}}check('src/app/routes');});
test('operación conserva guards de acceso y salida para mesas, atención y agenda',()=>{
 const groups=routeGroups(readFileSync('src/app/routes/operacion/operacion.routes.ts','utf8')),routes=groups.find(g=>g.some(r=>r.path==='mesas'));
 for(const [paths,leave]of [[['mesas','mesas/lista','mesa/nueva','mesa/editar','mesa/desactivar'],'mesasPendingGuard'],[['atencion','atencion/confirmar'],'atencionPendingGuard'],[['reservas','reserva/editar','reserva/cancelar'],'agendaPendingGuard']])for(const path of paths){const matches=routes.filter(r=>r.path===path);assert.equal(matches.length,1,path);assert(matches[0].canActivate.includes('operacionCocinaGuard'),path+' acceso');assert(matches[0].canDeactivate.includes(leave),path+' salida');}
 for(const path of ['reportes','reportes/pagos'])assert(routes.find(r=>r.path===path).canActivate.includes('operacionCocinaGuard'));
});
