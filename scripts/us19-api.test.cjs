const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),esbuild=require('esbuild');
require('@angular/compiler');
const {signal,createEnvironmentInjector,runInInjectionContext,ɵChangeDetectionScheduler,ɵEffectScheduler}=require('@angular/core');
const {Subject,of}=require('rxjs');const {HttpErrorResponse,HttpClient}=require('@angular/common/http');
const code=esbuild.buildSync({stdin:{contents:"export {CocinaStore} from './src/app/pages/operacion/cocina-ui/cocina-store';export {API_SESSION} from './src/app/core/auth/api-session';export {PedidoService} from './src/app/core/services/pedido.service';",resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'cjs',packages:'external',write:false});
const scope={module:{exports:{}},exports:{},require};vm.runInNewContext(code.outputFiles[0].text,scope);
const {CocinaStore,API_SESSION,PedidoService}=scope.module.exports;
const order=(estado='PENDIENTE',id=900)=>({id,estado,restauranteId:7,restauranteNombre:'Prueba US19',clienteId:51,clienteNombre:'Cliente',mesaId:null,
 tipoEntrega:'LLEVAR',direccionEntrega:null,total:28,fechaCreacion:'2026-11-03T14:00:00',limiteCancelacion:null,
 detalles:[{id:1000,platoId:31,nombrePlatoSnapshot:'Histórico',cantidad:2,precioUnitario:14,subtotal:28,notas:null}]});
const page=content=>({content,number:0,size:20,totalElements:content.length,totalPages:content.length?1:0});
function setup(state='PENDIENTE'){
 const session=signal({subject:'70',role:'ADMINISTRADOR',restauranteId:7,accessToken:'test',expiresAt:Date.now()+60000}),requests=[],nodes=new Set();
 const request=(kind,data)=>{const result=new Subject();requests.push({kind,...data,result});return result;};
 const injector=createEnvironmentInjector([{provide:API_SESSION,useValue:session},{provide:PedidoService,useValue:{
  obtener:id=>request('get',{id}),pendientesCocina:(page,size)=>request('queue',{page,size}),cambiarEstado:(id,target)=>request('patch',{id,target})}},
 {provide:ɵChangeDetectionScheduler,useValue:{notify(){}}},{provide:ɵEffectScheduler,useValue:{add:n=>nodes.add(n),schedule:n=>nodes.add(n),remove:n=>nodes.delete(n)}}],null);
 const store=runInInjectionContext(injector,()=>new CocinaStore()),flush=()=>{for(const n of nodes)if(n.dirty)n.run();};flush();
 const answer=(i,value)=>{requests[i].result.next(value);requests[i].result.complete();};store.loadDetail(900);answer(0,order(state));
 return {store,session,requests,answer,flush,injector};
}
const start={id:900,expected:'Pendiente',target:'En preparación'};
test('PATCH real conserva estado anterior hasta confirmación y evita segundo envío',async()=>{
 const f=setup();try{const promise=f.store.applyTransition(start);assert.equal(f.requests[1].kind,'patch');assert.equal(f.requests[1].target,'EN_PREPARACION');
  assert.equal(f.store.currentDetail().status,'Pendiente');assert(f.store.actionBusy());
  assert.equal((await f.store.applyTransition(start)).ok,false);assert.equal(f.requests.length,2);assert(f.store.actionBusy());
  f.answer(1,order('EN_PREPARACION'));assert.equal(f.store.currentDetail().status,'En preparación');assert.equal(f.requests[2].kind,'queue');
  f.answer(2,page([order('EN_PREPARACION')]));assert.equal((await promise).ok,true);assert.equal(f.store.actionBusy(),false);
 }finally{f.injector.destroy();}
});
test('LISTO sale de cola pero se conserva selección para entrega y terminales no avanzan',async()=>{
 const f=setup('EN_PREPARACION');try{
  const ready=f.store.applyTransition({id:900,expected:'En preparación',target:'Listo'});f.answer(1,order('LISTO'));f.answer(2,page([]));assert((await ready).ok);
  f.store.loadQueue();f.answer(3,page([]));assert.equal(f.store.findOrder(900).status,'Listo');assert.equal(f.store.lastSelectedId(),900);
  f.store.loadDetail(900);f.answer(4,order('LISTO'));
  const delivery=f.store.applyTransition({id:900,expected:'Listo',target:'Entregado'});f.answer(5,order('ENTREGADO'));f.answer(6,page([]));assert((await delivery).ok);
  assert.equal(f.store.currentDetail().status,'Entregado');assert.equal(f.store.currentDetail().totalCents,2800);
  assert.equal((await f.store.applyTransition({id:900,expected:'Entregado',target:'Pendiente'})).ok,false);assert.equal(f.requests.length,7);
 }finally{f.injector.destroy();}
});
for(const status of [400,409])test('rechazo '+status+' exige consulta antes de otra acción',async()=>{
 const f=setup();try{const promise=f.store.applyTransition(start);f.requests[1].result.error(new HttpErrorResponse({status}));
  assert.equal(f.requests[2].kind,'get');assert.equal(f.store.verificationId(),900);assert.equal(f.store.canAct(900),false);
  f.answer(2,order('LISTO'));f.answer(3,page([]));assert.equal((await promise).ok,false);assert.equal(f.store.currentDetail().status,'Listo');assert.equal(f.store.verificationId(),null);
  assert.equal(f.requests.filter(r=>r.kind==='patch').length,1);assert(f.store.actionMessage().text.includes('Estado consultado: Listo'));
 }finally{f.injector.destroy();}
});
test('respuesta perdida verifica GET; si también falla bloquea hasta verificación explícita',async()=>{
 const f=setup();try{const promise=f.store.applyTransition(start);f.requests[1].result.error(new HttpErrorResponse({status:0}));
  f.requests[2].result.error(new HttpErrorResponse({status:500}));assert.equal((await promise).ok,false);assert.equal(f.store.verificationId(),900);assert.equal(f.store.canAct(900),false);
  f.store.refresh();assert.equal(f.requests[3].kind,'get');assert.equal(f.requests[3].id,900);f.answer(3,order('EN_PREPARACION'));f.answer(4,page([order('EN_PREPARACION')]));
  assert.equal(f.store.verificationId(),null);assert.equal(f.store.currentDetail().status,'En preparación');assert.equal(f.requests.filter(r=>r.kind==='patch').length,1);
 }finally{f.injector.destroy();}
});
test('éxito con fallo de cola conserva confirmación y no repite PATCH al recuperar',async()=>{
 const f=setup();try{const promise=f.store.applyTransition(start);f.answer(1,order('EN_PREPARACION'));f.requests[2].result.error(new HttpErrorResponse({status:500}));
  assert((await promise).ok);assert.equal(f.store.currentDetail().status,'En preparación');assert.equal(f.store.actionMessage().kind,'success');assert(f.store.queueIssue());
  f.store.loadQueue();f.answer(3,page([order('EN_PREPARACION')]));assert.equal(f.store.queueIssue(),'');assert.equal(f.requests.filter(r=>r.kind==='patch').length,1);
 }finally{f.injector.destroy();}
});
for(const status of [401,403,404])test('rechazo '+status+' elimina datos y no recupera mediante mutación',async()=>{
 const f=setup();try{const promise=f.store.applyTransition(start);f.requests[1].result.error(new HttpErrorResponse({status}));assert.equal((await promise).ok,false);
  assert.equal(f.store.currentDetail(),undefined);assert.equal(f.store.retainedOrder(),undefined);assert.equal(f.store.queryState(),'error');assert.equal(f.requests.length,2);
 }finally{f.injector.destroy();}
});
test('logout durante envío cancela espera y descarta respuesta de otra sesión',async()=>{
 const f=setup();try{const promise=f.store.applyTransition(start);f.session.set(null);f.flush();assert.equal((await promise).ok,false);assert.equal(f.requests[1].result.observed,false);
  f.requests[1].result.next(order('EN_PREPARACION'));assert.equal(f.store.currentDetail(),undefined);assert.equal(f.store.actionBusy(),false);
 }finally{f.injector.destroy();}
});
test('confirmación incompatible se verifica en vez de inventar éxito',async()=>{
 const f=setup();try{const promise=f.store.applyTransition(start);f.answer(1,order('LISTO'));assert.equal(f.requests[2].kind,'get');
  f.answer(2,order('EN_PREPARACION'));f.answer(3,page([order('EN_PREPARACION')]));assert.equal((await promise).ok,false);assert.equal(f.store.actionMessage().kind,'error');
 }finally{f.injector.destroy();}
});
test('servicio envía PATCH con query, sin cuerpo DTO, y valida identidad y estado',()=>{
 let capture;const injector=createEnvironmentInjector([{provide:HttpClient,useValue:{patch(url,body,options){capture={url,body,options};return of({status:200,body:order('EN_PREPARACION')});}}}],null);
 try{const service=runInInjectionContext(injector,()=>new PedidoService());let response;service.cambiarEstado(900,'EN_PREPARACION').subscribe(v=>response=v);
  assert(capture.url.endsWith('/restopilot-api/pedidos/900/estado'));assert.equal(capture.body,null);assert.equal(capture.options.params.get('nuevoEstado'),'EN_PREPARACION');assert.equal(response.estado,'EN_PREPARACION');
 }finally{injector.destroy();}
});
