const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),esbuild=require('esbuild');
require('@angular/compiler');
const {signal,createEnvironmentInjector,runInInjectionContext,ɵChangeDetectionScheduler,ɵEffectScheduler}=require('@angular/core');
const {Subject,of}=require('rxjs'),{HttpClient,HttpErrorResponse}=require('@angular/common/http');
const out=esbuild.buildSync({stdin:{contents:"export {PagosStore,paymentId,paymentProblem} from './src/app/pages/operacion/pagos-ui/pagos-store';export {PagoService} from './src/app/core/services/pago.service';export {PedidoService} from './src/app/core/services/pedido.service';export {API_SESSION} from './src/app/core/auth/api-session';",resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'cjs',packages:'external',write:false});
const scope={module:{exports:{}},exports:{},require,TextEncoder,setTimeout,clearTimeout};vm.runInNewContext(out.outputFiles[0].text,scope);
const {PagosStore,paymentId,paymentProblem,PagoService,PedidoService,API_SESSION}=scope.module.exports;
const order=(id=900,restauranteId=7)=>({id,restauranteId,restauranteNombre:'Local',clienteId:51,clienteNombre:'Cliente',estado:'PENDIENTE',tipoEntrega:'RECOGER',mesaId:null,direccionEntrega:null,total:28,fechaCreacion:'2026-11-06T12:00:00',limiteCancelacion:null,detalles:[{id:1,platoId:31,nombrePlatoSnapshot:'Plato',cantidad:1,precioUnitario:28,subtotal:28,notas:null}]});
const payment=(id=900,extra={})=>({mensaje:'Detalle',id:2900,pedidoId:id,monto:28,metodo:null,estado:'PENDIENTE',codigoReferencia:null,fechaPago:null,creadoEn:'2026-11-06T12:00:00',...extra});
const session=()=>({subject:'70',role:'DUENO',restauranteId:7,accessToken:'test-owner',expiresAt:Date.now()+60000});
const request=(extra={})=>({monto:28,metodo:'EFECTIVO',codigoReferencia:null,estado:'PAGADO',...extra});
function setup(initial=session()){
 const s=signal(initial),requests=[],nodes=new Set(),scheduler={add:n=>nodes.add(n),schedule:n=>nodes.add(n),remove:n=>nodes.delete(n)};
 const operation=(kind,...args)=>{const result=new Subject();requests.push({kind,args,result});return result;};
 const injector=createEnvironmentInjector([{provide:API_SESSION,useValue:s},{provide:PedidoService,useValue:{obtener:id=>operation('order',id)}},{provide:PagoService,useValue:{consultar:(...a)=>operation('payment',...a),registrar:(...a)=>operation('write',...a)}},{provide:ɵChangeDetectionScheduler,useValue:{notify(){}}},{provide:ɵEffectScheduler,useValue:scheduler}],null);
 const store=runInInjectionContext(injector,()=>new PagosStore()),flush=()=>{for(const node of nodes)if(node.dirty)node.run();};flush();
 const answer=(i,value)=>{requests[i].result.next(value);requests[i].result.complete();};
 const ready=(id=900)=>{const index=requests.length;store.load(id);answer(index,order(id));answer(index+1,payment(id));};
 return {store,s,requests,answer,ready,flush,close:()=>injector.destroy()};
}
test('identificador explícito inválido no se convierte en pedido anterior ni de muestra',()=>{
 assert.equal(paymentId(null),null);assert.equal(paymentId('900'),900);
 for(const value of ['','0','01','+900','9e2','900.0','9007199254740992'])assert(Number.isNaN(paymentId(value)));
 const f=setup();try{f.store.load(NaN);assert.equal(f.requests.length,0);assert.equal(f.store.order(),null);assert.equal(f.store.state(),'error');}finally{f.close();}
});
test('consulta usa el pedido real y su total para consultar pago',()=>{
 const f=setup();try{f.ready();assert.deepEqual(Array.from(f.requests[1].args),[900,28]);assert.equal(f.store.order().id,900);assert.equal(f.store.payment().metodo,null);assert.equal(f.store.payment().fechaPago,null);}finally{f.close();}
});
test('cambio de pedido cancela consulta vieja y evita mostrar datos de otro local',()=>{
 const f=setup();try{f.store.load(900);const old=f.requests[0].result;f.store.load(901);old.next(order());assert.equal(f.store.order(),null);f.answer(1,order(901,8));f.answer(2,payment(901));assert.equal(f.store.state(),'error');assert.equal(f.store.order(),null);}finally{f.close();}
});
test('errores de sesión, permisos y ausencia no fabrican datos',()=>{
 for(const status of [401,403,404,500]){const f=setup();try{f.store.load(900);f.requests[0].result.error(new HttpErrorResponse({status}));assert.equal(f.store.state(),'error');assert.equal(f.store.order(),null);assert(f.store.problem());}finally{f.close();}}
 assert(paymentProblem(new HttpErrorResponse({status:403})).includes('permiso'));
 const f=setup(null);try{f.store.load(900);assert.equal(f.requests.length,0);}finally{f.close();}
});
test('doble envío y cambio de variante no duplican el registro pendiente',()=>{
 const f=setup();try{f.ready();f.store.submit(request(),()=>{});f.store.submit(request(),()=>{});assert.equal(f.requests.filter(r=>r.kind==='write').length,1);f.store.load(900);f.answer(3,order());f.answer(4,payment());f.store.submit(request(),()=>{});assert.equal(f.requests.filter(r=>r.kind==='write').length,1);let called=false;f.requests[2].result.next(payment(900,{estado:'PAGADO',metodo:'EFECTIVO',fechaPago:'2026-11-06T13:00:00'}));assert.equal(f.store.savingId(),null);assert.equal(f.store.payment().estado,'PAGADO');}finally{f.close();}
});
test('respuesta incierta exige consulta explícita antes de permitir otro envío',()=>{
 const f=setup();try{f.ready();f.store.submit(request(),()=>{});f.requests[2].result.error(new HttpErrorResponse({status:0}));assert(f.store.isUncertain(900));f.ready();assert(f.store.isUncertain(900));f.store.submit(request(),()=>{});assert.equal(f.requests.filter(r=>r.kind==='write').length,1);f.store.load(900,true);f.answer(5,order());f.answer(6,payment());assert(!f.store.isUncertain(900));f.store.submit(request(),()=>{});assert.equal(f.requests.filter(r=>r.kind==='write').length,2);}finally{f.close();}
});
test('cambio de cuenta oculta datos inmediatamente y descarta respuesta tardía',()=>{
 const f=setup();try{f.ready();let confirmed=false;f.store.submit(request(),()=>confirmed=true);f.s.set({...session(),accessToken:'other',subject:'71'});assert.equal(f.store.order(),null);f.requests[2].result.next(payment(900,{estado:'PAGADO',metodo:'EFECTIVO',fechaPago:'2026-11-06T13:00:00'}));assert(!confirmed);f.flush();assert.equal(f.store.payment(),null);}finally{f.close();}
});
test('datos inválidos, pedido cancelado y pago confirmado no se envían',()=>{
 const f=setup();try{f.ready();for(const r of [request({monto:1}),request({metodo:'OTRO'}),request({estado:'OTRO'}),request({metodo:'YAPE'}),request({codigoReferencia:'x'.repeat(101)})])f.store.submit(r,()=>{});assert.equal(f.requests.length,2);f.store.load(900);f.answer(2,{...order(),estado:'CANCELADO'});f.answer(3,payment());f.store.submit(request(),()=>{});assert.equal(f.requests.length,4);}finally{f.close();}
});
test('CA12 permite guardar pendiente electrónico sin referencia ni fecha',()=>{
 const f=setup();try{f.ready();let confirmed=false;f.store.submit(request({estado:'PENDIENTE',metodo:'PLIN'}),()=>confirmed=true);assert.equal(f.requests[2].args[1].estado,'PENDIENTE');f.requests[2].result.next(payment(900,{metodo:'PLIN'}));assert(confirmed);assert.equal(f.store.payment().fechaPago,null);}finally{f.close();}
});
test('servicio POST exige201, identidad, importe, estado, referencia y fecha compatibles',()=>{
 for(const [status,patch,valid] of [[201,{},true],[200,{},false],[201,{pedidoId:901},false],[201,{monto:29},false],[201,{estado:'PENDIENTE'},false],[201,{fechaPago:null},false],[201,{metodo:'YAPE'},false]]){
  const calls=[],injector=createEnvironmentInjector([{provide:HttpClient,useValue:{post:(url,body,options)=>{calls.push({url,body,options});return of({status,body:payment(900,{estado:'PAGADO',metodo:'EFECTIVO',fechaPago:'2026-11-06T13:00:00',...patch})});}}}],null);
  try{const service=runInInjectionContext(injector,()=>new PagoService());let accepted=false,rejected=false;service.registrar(900,{...request(),rol:'DUENO',restauranteId:99}).subscribe({next:()=>accepted=true,error:()=>rejected=true});assert.equal(accepted,valid);assert.equal(rejected,!valid);assert.deepEqual(Object.keys(calls[0].body).sort(),['codigoReferencia','estado','metodo','monto']);}finally{injector.destroy();}
 }
});
