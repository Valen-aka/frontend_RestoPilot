const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),esbuild=require('esbuild');
require('@angular/compiler');
const {signal,createEnvironmentInjector,runInInjectionContext,ɵChangeDetectionScheduler,ɵEffectScheduler}=require('@angular/core');
const {Subject,of}=require('rxjs');const {HttpErrorResponse,HttpClient}=require('@angular/common/http');
const code=esbuild.buildSync({stdin:{contents:"export {CategoriasStore,categoriaValida} from './src/app/pages/operacion/categorias-ui/categorias-store';export {API_SESSION} from './src/app/core/auth/api-session';export {CatalogoService} from './src/app/core/services/catalogo.service';",resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'cjs',packages:'external',write:false});
const scope={module:{exports:{}},exports:{},require};vm.runInNewContext(code.outputFiles[0].text,scope);
const {CategoriasStore,categoriaValida,API_SESSION,CatalogoService}=scope.module.exports;
const cat=(id=1,r=7)=>({id,restauranteId:r,nombre:'Entradas',descripcion:null,creadoEn:'2026-11-04T12:00:00',actualizadoEn:null});
const datos={nombre:'Postres',descripcion:'Fríos'};
function setup(){
 const session=signal({subject:'70',role:'ADMINISTRADOR',restauranteId:7,accessToken:'test',expiresAt:Date.now()+60000}),requests=[],nodes=new Set();
 const request=(kind,args)=>{const result=new Subject();requests.push({kind,args,result});return result;};
 const injector=createEnvironmentInjector([{provide:API_SESSION,useValue:session},{provide:CatalogoService,useValue:{
 categorias:(...a)=>request('list',a),crearCategoria:(...a)=>request('create',a),actualizarCategoria:(...a)=>request('update',a),eliminarCategoria:(...a)=>request('delete',a)}},
 {provide:ɵChangeDetectionScheduler,useValue:{notify(){}}},{provide:ɵEffectScheduler,useValue:{add:n=>nodes.add(n),schedule:n=>nodes.add(n),remove:n=>nodes.delete(n)}}],null);
 const store=runInInjectionContext(injector,()=>new CategoriasStore()),flush=()=>{for(const n of nodes)if(n.dirty)n.run();};flush();
 const answer=(i,value)=>{requests[i].result.next(value);requests[i].result.complete();};
 return {store,session,requests,answer,flush,injector};
}
function loaded(id=null){const f=setup();f.store.load(id);f.answer(0,[cat()]);return f;}
test('validación de nombre obligatorio, espacios y límite de columna',()=>{
 for(const nombre of ['', '   ','x'.repeat(101)])assert.equal(categoriaValida({...datos,nombre}),false);
 assert.equal(categoriaValida({...datos,nombre:'x'.repeat(100)}),true);
});
test('listado diferencia vacío, carga y fallo; selección por ID real',()=>{
 const f=setup();try{f.store.load();assert.equal(f.store.state(),'loading');f.answer(0,[]);assert.equal(f.store.state(),'ready');assert.equal(f.store.entries().length,0);
 f.store.load(1);f.answer(1,[cat()]);assert.equal(f.store.selected().id,1);
 f.store.load(2);f.answer(2,[cat()]);assert.equal(f.store.state(),'error');assert.equal(f.store.selected(),undefined);
 f.store.load(0);assert.equal(f.requests.length,3);
 }finally{f.injector.destroy();}
});
test('crea solo tras confirmación y bloquea doble envío',async()=>{
 const f=loaded();try{const p=f.store.create(datos);assert.equal(f.store.busy(),true);assert.equal(f.store.entries().length,1);
 assert.equal(await f.store.create(datos),false);assert.equal(f.requests.length,2);assert.equal(f.requests[1].args[0],7);
 f.answer(1,{...cat(2),...datos});assert.equal(await p,true);assert.equal(f.store.entries().length,2);assert.equal(f.store.busy(),false);
 }finally{f.injector.destroy();}
});
test('edita la categoría seleccionada y conserva estado ante error 400',async()=>{
 const f=loaded(1);try{const p=f.store.update(datos);assert.equal(f.requests[1].args[0],1);f.requests[1].result.error(new HttpErrorResponse({status:400}));
 assert.equal(await p,false);assert.equal(f.store.selected().nombre,'Entradas');
 const ok=f.store.update(datos);f.answer(2,{...cat(),...datos});assert.equal(await ok,true);assert.equal(f.store.selected().nombre,'Postres');
 }finally{f.injector.destroy();}
});
test('eliminación requiere confirmación; 409 conserva categoría; 204 la retira',async()=>{
 const f=loaded(1);try{assert.equal(await f.store.remove(false),false);assert.equal(f.requests.length,1);
 const p=f.store.remove(true);f.requests[1].result.error(new HttpErrorResponse({status:409}));assert.equal(await p,false);assert.equal(f.store.entries().length,1);
 const ok=f.store.remove(true);f.answer(2,undefined);assert.equal(await ok,true);assert.equal(f.store.entries().length,0);
 }finally{f.injector.destroy();}
});
for(const operation of ['create','update','remove'])test(operation+': cambio de sesión cancela envío sin éxito tardío',async()=>{
 const f=loaded(1);try{const p=operation==='remove'?f.store.remove(true):f.store[operation](datos);
 f.session.set({...f.session(),subject:'71',accessToken:'otro',restauranteId:8});assert.equal(f.store.entries().length,0);f.flush();
 assert.equal(await p,false);assert.equal(f.requests[1].result.observed,false);f.answer(1,cat());assert.equal(f.store.notice(),'');
 }finally{f.injector.destroy();}
});
test('salida de pantalla cancela consulta y mutación',async()=>{
 const f=setup();f.store.load();f.injector.destroy();assert.equal(f.requests[0].result.observed,false);f.answer(0,[cat()]);assert.equal(f.store.entries().length,0);
 const g=loaded();const p=g.store.create(datos);g.injector.destroy();assert.equal(await p,false);assert.equal(g.requests[1].result.observed,false);
});
test('una consulta obsoleta no reemplaza otra selección',()=>{
 const f=setup();try{f.store.load(1);f.store.load(2);assert.equal(f.requests[0].result.observed,false);f.answer(1,[cat(2)]);f.answer(0,[cat(1)]);assert.equal(f.store.selected().id,2);
 }finally{f.injector.destroy();}
});
for(const status of [401,403,404])test('respuesta '+status+' borra datos y exige nueva consulta',async()=>{
 const f=loaded(1);try{const p=f.store.update(datos);f.requests[1].result.error(new HttpErrorResponse({status}));assert.equal(await p,false);assert.equal(f.store.entries().length,0);assert.equal(f.store.state(),'error');
 }finally{f.injector.destroy();}
});
for(const status of [0,500])test('respuesta incierta '+status+' no permite reenviar hasta consultar',async()=>{
 const f=loaded();try{const p=f.store.create(datos);f.requests[1].result.error(new HttpErrorResponse({status}));assert.equal(await p,false);
 assert.equal(f.store.uncertain(),true);assert.equal(await f.store.create(datos),false);assert.equal(f.requests.length,2);
 f.store.load();f.answer(2,[cat(),{...cat(2),...datos}]);assert.equal(f.store.uncertain(),false);assert.equal(f.store.entries().length,2);
 }finally{f.injector.destroy();}
});
test('sesión expirada, cliente y usuario sin restaurante no consultan ni mutan',async()=>{
 const f=setup();try{for(const changes of [{expiresAt:Date.now()-1},{role:'CLIENTE'},{restauranteId:null}]){
 f.session.set({subject:'1',role:'ADMINISTRADOR',accessToken:'x',restauranteId:7,expiresAt:Date.now()+60000,...changes});f.flush();f.store.load();assert.equal(await f.store.create(datos),false);
 }assert.equal(f.requests.length,0);}finally{f.injector.destroy();}
});
test('servicio usa contratos reales, rechaza otro restaurante, ID incorrecto y borrado sin 204',()=>{
 let response=cat(),capture;const http={get:(...a)=>{capture=a;return of(response);},post:(...a)=>{capture=a;return of(response);},put:(...a)=>{capture=a;return of(response);},delete:(...a)=>{capture=a;return of(response);}};
 const injector=createEnvironmentInjector([{provide:HttpClient,useValue:http}],null);
 const read=obs=>{let value,error;obs.subscribe({next:v=>value=v,error:e=>error=e});return {value,error};};
 try{const api=runInInjectionContext(injector,()=>new CatalogoService());response=[cat()];assert.equal(read(api.categorias(7)).value.length,1);assert(capture[0].endsWith('/categorias/restaurante/7'));
 response=[cat(1,8)];assert(read(api.categorias(7)).error);response=[cat(),cat()];assert(read(api.categorias(7)).error);
 response=cat();assert.equal(read(api.crearCategoria(7,datos)).value.id,1);assert.equal(capture[1].restauranteId,7);
 response=cat(2);assert(read(api.actualizarCategoria(1,7,datos)).error);assert(capture[0].endsWith('/categorias/1'));assert.equal(capture[1].restauranteId,undefined);
 response={status:200};assert(read(api.eliminarCategoria(1)).error);response={status:204};assert.equal(read(api.eliminarCategoria(1)).error,undefined);
 }finally{injector.destroy();}
});
