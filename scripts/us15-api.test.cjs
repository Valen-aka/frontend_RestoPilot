const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),esbuild=require('esbuild');
require('@angular/compiler');
const {signal,createEnvironmentInjector,runInInjectionContext,ɵChangeDetectionScheduler,ɵEffectScheduler}=require('@angular/core');
const {Subject,of}=require('rxjs');const {HttpErrorResponse,HttpClient}=require('@angular/common/http');
const out=esbuild.buildSync({stdin:{contents:
 "export {API_SESSION,activeOperationSession} from './src/app/core/auth/api-session';export {PedidoService} from './src/app/core/services/pedido.service';export {CocinaStore} from './src/app/pages/operacion/cocina-ui/cocina-store';export {readCocinaPage,readCocinaPedido} from './src/app/core/models/cocina-api.model';export {AuthService} from './src/app/core/services/auth.service';",
 resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'cjs',packages:'external',write:false});
const scope={module:{exports:{}},exports:{},require,atob,TextDecoder,setTimeout,clearTimeout};vm.runInNewContext(out.outputFiles[0].text,scope);
const {API_SESSION,PedidoService,CocinaStore,readCocinaPage,readCocinaPedido,activeOperationSession,AuthService}=scope.module.exports;
const order=(id=900,estado='PENDIENTE')=>({id,estado,restauranteId:7,restauranteNombre:'Local prueba',clienteId:51,clienteNombre:'Cliente prueba',mesaId:null,
 tipoEntrega:'LLEVAR',direccionEntrega:null,total:28,fechaCreacion:'2026-11-02T14:00:00',limiteCancelacion:null,
 detalles:[{id:1000,platoId:31,nombrePlatoSnapshot:'Nombre histórico',cantidad:2,precioUnitario:14,subtotal:28,notas:null}]});
const page=(content,number=0,size=20,totalElements=content.length)=>({content,number,size,totalElements,totalPages:Math.ceil(totalElements/size)});
const session=()=>({subject:'70',role:'ADMINISTRADOR',restauranteId:7,accessToken:'test',expiresAt:Date.now()+60000});
function setup(initial=session()){
 const s=signal(initial),requests=[],nodes=new Set();
 const scheduler={add:n=>nodes.add(n),schedule:n=>nodes.add(n),remove:n=>nodes.delete(n)};
 const injector=createEnvironmentInjector([{provide:API_SESSION,useValue:s},{provide:PedidoService,useValue:{
  pendientesCocina(page,size){const result=new Subject();requests.push({page,size,result});return result;},
  obtener(id){const result=new Subject();requests.push({id,result});return result;}}},
  {provide:ɵChangeDetectionScheduler,useValue:{notify(){}}},{provide:ɵEffectScheduler,useValue:scheduler}],null);
 const store=runInInjectionContext(injector,()=>new CocinaStore());
 const flush=()=>{for(const n of nodes)if(n.dirty)n.run();};
 flush();return {store,s,requests,flush,injector,answer:(i,v)=>{requests[i].result.next(v);requests[i].result.complete();}};
}
test('cola conserva el orden recibido y no acepta formato de pedidos propios, duplicados o estados terminales',()=>{
 const p=readCocinaPage(page([order(902),order(900)]),0,20);assert.deepEqual(Array.from(p.content,x=>x.id),[902,900]);
 for(const value of [page([order(),order()]),page([order(900,'LISTO')]),{pedidos:[order()],totalElementos:1,totalPaginas:1},page([order()],0,20,4)])
  assert.throws(()=>readCocinaPage(value,0,20));
});
test('metadatos ausentes no se convierten en complejidad, minutos ni pago ficticios',()=>{
 const f=setup();try{f.store.loadQueue();f.answer(0,page([order(902),order(900)]));
  assert.deepEqual(Array.from(f.store.displayed(),p=>p.id),[902,900]);const p=f.store.orders()[0];
  assert.equal(p.complexity,null);assert.equal(p.preparationMinutes,null);assert.equal(p.payment,null);assert.equal(p.lines[0].preparationMinutes,null);
  assert.equal(p.lines[0].subtotalCents,2800);
 }finally{f.injector.destroy();}
 assert.throws(()=>readCocinaPedido({...order(),tiempoPreparacionMaximoMinutos:-1},900));
 assert.equal(readCocinaPedido({...order(),tiempoPreparacionMaximoMinutos:0},900).tiempoPreparacionMaximoMinutos,0);
});
test('página final vacía se corrige consultando la última página válida',()=>{
 const f=setup();try{f.store.loadQueue(2,10);f.answer(0,page([],2,10,11));assert.equal(f.requests[1].page,1);
  f.answer(1,page([order()],1,10,11));assert.equal(f.store.page(),1);assert.equal(f.store.total(),11);
 }finally{f.injector.destroy();}
});
test('actualización fallida conserva lectura identificada como anterior y permite recuperarse',()=>{
 const f=setup();try{f.store.loadQueue();f.answer(0,page([order()]));f.store.refresh();f.store.refresh();assert.equal(f.requests.length,2);
  f.requests[1].result.error(new HttpErrorResponse({status:500}));assert.equal(f.store.queryState(),'stale');assert.equal(f.store.orders().length,1);
  f.store.refresh();f.answer(2,page([]));assert.equal(f.store.queryState(),'ready');assert.equal(f.store.orders().length,0);
 }finally{f.injector.destroy();}
});
test('403, 404 y respuestas de otro restaurante eliminan datos protegidos',()=>{
 for(const code of [401,403,404]){const f=setup();try{f.store.loadDetail(900);f.answer(0,order());f.store.refresh();
  f.requests[1].result.error(new HttpErrorResponse({status:code}));assert.equal(f.store.currentDetail(),undefined);assert.equal(f.store.queryState(),'error');
 }finally{f.injector.destroy();}}
 const f=setup();try{f.store.loadQueue();f.answer(0,page([{...order(),restauranteId:8}]));assert.equal(f.store.orders().length,0);assert.equal(f.store.queryState(),'error');}finally{f.injector.destroy();}
});
test('sesión nueva, selección nueva y logout descartan respuestas obsoletas sin reordenar',()=>{
 const f=setup();try{f.store.loadDetail(900);const old=f.requests[0].result;f.store.loadDetail(901);f.answer(1,order(901));old.next(order());
  assert.equal(f.store.currentDetail().id,901);f.store.refresh();f.s.set({...session(),subject:'71',restauranteId:8});
  assert.equal(f.store.currentDetail(),undefined);f.flush();assert.equal(f.requests[2].result.observed,false);
  f.s.set(null);f.flush();assert.equal(f.store.orders().length,0);
 }finally{f.injector.destroy();}
});
test('CLIENTE, local ausente y token vencido no generan consultas; DUENO es válido',()=>{
 for(const s of [{...session(),role:'CLIENTE'},{...session(),restauranteId:null},{...session(),expiresAt:0},null]){
  const f=setup(s);try{f.store.loadQueue();f.store.loadDetail(900);assert.equal(f.requests.length,0);assert.equal(f.store.hasSession(),false);}finally{f.injector.destroy();}
 }
 assert(activeOperationSession({...session(),role:'DUENO'}));
});
test('detalle LISTO se consulta fuera de cola y una transición local inválida no muta datos',async()=>{
 const f=setup();try{f.store.loadDetail(990);f.answer(0,order(990,'LISTO'));assert.equal(f.store.currentDetail().status,'Listo');
  assert.equal((await f.store.applyTransition({id:990,expected:'Listo',target:'Listo'})).ok,false);assert.equal(f.store.currentDetail().status,'Listo');
  f.store.loadDetail(undefined);assert.equal(f.requests.length,1);
 }finally{f.injector.destroy();}
});
test('servicio llama endpoint de cola con página y tamaño sin sort local ni mutaciones',()=>{
 let captured;const injector=createEnvironmentInjector([{provide:HttpClient,useValue:{get(url,options){captured={url,options};return of(page([order()],0,10));}}}],null);
 try{const service=runInInjectionContext(injector,()=>new PedidoService());service.pendientesCocina(0,10).subscribe();
  assert(captured.url.endsWith('/api/pedidos/pendientes'));assert.equal(captured.options.params.get('page'),'0');assert.equal(captured.options.params.get('size'),'10');assert.equal(captured.options.params.has('sort'),false);
 }finally{injector.destroy();}
});
test('login conserva restaurante validado y rechaza divergencia DTO/JWT sin crear otra sesión',()=>{
 const token=rid=>['test',Buffer.from(JSON.stringify({exp:Math.floor(Date.now()/1000)+60,userId:70,sub:'admin@example.test',rol:'ADMINISTRADOR',restauranteId:rid})).toString('base64url'),'test'].join('.');
 for(const rid of [7,8]){const injector=createEnvironmentInjector([{provide:HttpClient,useValue:{post(){return of({id:70,nombreCompleto:'Admin prueba',correo:'admin@example.test',rol:'ADMINISTRADOR',restauranteId:7,token:token(rid)});}}}],null);
  try{const auth=runInInjectionContext(injector,()=>new AuthService());let error;auth.login({correo:'admin@example.test',password:'solo-test'}).subscribe({error:e=>error=e});
   if(rid===7){assert.equal(auth.session().restauranteId,7);assert(activeOperationSession(auth.session()));}else{assert(error);assert.equal(auth.session(),null);}
  }finally{injector.destroy();}
 }
});
