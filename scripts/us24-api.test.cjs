const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),esbuild=require('esbuild');require('@angular/compiler');
const {signal,createEnvironmentInjector,runInInjectionContext,ɵChangeDetectionScheduler,ɵEffectScheduler}=require('@angular/core');
const {Subject,of}=require('rxjs'),{HttpClient,HttpErrorResponse}=require('@angular/common/http');
const out=esbuild.buildSync({stdin:{contents:"export {API_SESSION} from './src/app/core/auth/api-session';export {PedidoService} from './src/app/core/services/pedido.service';export {PagoService} from './src/app/core/services/pago.service';export {CatalogoService} from './src/app/core/services/catalogo.service';export {PedidoManagementStore} from './src/app/pages/operacion/pedido-management-ui/pedido-management.store';export {confirmedAdjustment} from './src/app/pages/operacion/pedido-management-ui/pedido-management.model';",resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'cjs',packages:'external',write:false});
const scope={module:{exports:{}},exports:{},require,atob,TextDecoder,setTimeout,clearTimeout};vm.runInNewContext(out.outputFiles[0].text,scope);
const {API_SESSION,PedidoService,PagoService,CatalogoService,PedidoManagementStore,confirmedAdjustment}=scope.module.exports;
const session=()=>({subject:'70',role:'ADMINISTRADOR',restauranteId:7,accessToken:'fixture',expiresAt:Date.now()+60000});
const order=(id=900,quantity=1,estado='PENDIENTE')=>({id,estado,restauranteId:7,restauranteNombre:'Local',clienteId:51,clienteNombre:'Cliente',mesaId:null,tipoEntrega:'RECOGER',direccionEntrega:null,total:quantity*28,fechaCreacion:'2026-11-06T14:00:00',limiteCancelacion:null,detalles:[{id:10,platoId:31,nombrePlatoSnapshot:'Plato',cantidad:quantity,precioUnitario:28,subtotal:quantity*28,notas:null}]});
const request=(quantity=2)=>({restauranteId:7,tipoEntrega:'RECOGER',mesaId:null,direccionEntrega:null,detalles:[{platoId:31,cantidad:quantity,notas:null}]});
function setup(initial=session(),physical=true){
 const s=signal(initial),calls=[],catalogCalls=[],nodes=new Set();
 const enqueue=(kind,args)=>{const result=new Subject();calls.push({kind,args,result});return result;};
 const injector=createEnvironmentInjector([{provide:API_SESSION,useValue:s},{provide:PedidoService,useValue:{obtener:id=>enqueue('get',[id]),ajustar:(o,r)=>enqueue('put',[o,r]),cancelarAdministrativo:id=>enqueue('delete',[id])}},{provide:PagoService,useValue:{consultar:(id,total)=>of({id:8,pedidoId:id,monto:total,estado:'PENDIENTE',metodo:null,codigoReferencia:null,fechaPago:null,creadoEn:null})}},{provide:CatalogoService,useValue:{restaurante:()=>{catalogCalls.push('restaurant');return of({id:7,nombre:'Local',tieneAtencionFisica:physical,aceptaDelivery:true});},platos:()=>{catalogCalls.push('dishes');return of([{id:31,restauranteId:7,nombre:'Plato',precio:28,disponible:true}]);},mesasPropias:()=>{catalogCalls.push('tables');return of([]);}}},{provide:ɵChangeDetectionScheduler,useValue:{notify(){}}},{provide:ɵEffectScheduler,useValue:{add:n=>nodes.add(n),schedule:n=>nodes.add(n),remove:n=>nodes.delete(n)}}],null);
 const store=runInInjectionContext(injector,()=>new PedidoManagementStore());const flush=()=>{for(const node of nodes)if(node.dirty)node.run();};flush();
 return {store,s,calls,catalogCalls,flush,close:()=>injector.destroy(),answer:(i,value)=>{calls[i].result.next(value);calls[i].result.complete();}};
}
test('consulta requiere pedido positivo y sesion operativa; entidad ajena no se muestra',()=>{
 for(const initial of [null,{...session(),role:'CLIENTE'}]){const f=setup(initial);try{f.store.load(900);assert.equal(f.calls.length,0);}finally{f.close();}}
 const f=setup();try{f.store.load('mal');assert.equal(f.calls.length,0);f.store.load(900);f.answer(0,{...order(),restauranteId:8});assert.equal(f.store.order(),null);assert.equal(f.store.state(),'error');}finally{f.close();}
});
test('ajuste no muta lectura hasta confirmar y reconsulta total/pago; doble envio bloqueado',()=>{
 const f=setup();try{f.store.load(900);f.answer(0,order());assert.equal(f.store.state(),'ready',f.store.problem());assert.equal(f.store.canMutate(),true,JSON.stringify({order:f.store.order(),payment:f.store.payment(),key:f.store.sessionKey()}));f.store.save(request());f.store.save(request());assert.equal(f.calls.filter(c=>c.kind==='put').length,1);assert.equal(f.store.order().total,28);assert(f.store.busy());f.answer(1,order(900,2));assert.equal(f.calls[2].kind,'get');f.answer(2,order(900,2));assert.equal(f.store.order().total,56);assert.equal(f.store.payment().monto,56);assert(!f.store.busy());assert(!f.store.uncertain());}finally{f.close();}
});
test('rechazo de negocio no altera pedido; respuesta de lectura posterior fallida queda incierta',()=>{
 const f=setup();try{f.store.load(900);f.answer(0,order());f.store.save(request());f.calls[1].result.error(new HttpErrorResponse({status:400,error:{mensaje:'El pedido ya fue pagado'}}));assert.equal(f.store.order().total,28);assert(!f.store.uncertain());f.store.save(request());f.answer(2,order(900,2));f.calls[3].result.error(new HttpErrorResponse({status:403}));assert(f.store.uncertain());assert(!f.store.canMutate());}finally{f.close();}
});
test('incertidumbre se conserva al cambiar A-B-A y requiere consulta o revision manual',()=>{
 for(const status of [0,200,408]){const f=setup();try{f.store.load(900);f.answer(0,order());f.store.save(request());f.calls[1].result.error(new HttpErrorResponse({status}));assert(f.store.uncertain());f.store.load(901);f.answer(2,order(901));assert(!f.store.uncertain());f.store.load(900);f.answer(3,order());assert(f.store.uncertain());const before=f.calls.length;f.store.save(request());assert.equal(f.calls.length,before);f.store.verify();f.answer(4,order(900,2));assert(!f.store.uncertain());}finally{f.close();}}
});
test('cancelacion exige 204 del servicio y luego lee estado CANCELADO sin borrar el pago',()=>{
 const f=setup();try{f.store.load(900);f.answer(0,order());f.store.cancel();f.store.cancel();assert.equal(f.calls.filter(c=>c.kind==='delete').length,1);f.answer(1,undefined);f.answer(2,order(900,1,'CANCELADO'));assert.equal(f.store.order().estado,'CANCELADO');assert.equal(f.store.payment().pedidoId,900);assert(f.store.blocked());}finally{f.close();}
});
test('cambio de sesion oculta datos de inmediato y descarta respuestas tardias',()=>{
 const f=setup();try{f.store.load(900);f.answer(0,order());f.store.save(request());f.s.set({...session(),subject:'71',accessToken:'new-account'});assert.equal(f.store.order(),null);f.flush();f.calls[1].result.next(order(900,2));assert.equal(f.store.order(),null);assert(!f.store.busy());}finally{f.close();}
});
test('confirmacion de ajuste conserva identidad y exige contenido solicitado',()=>{
 assert.equal(confirmedAdjustment(order(900,2),order(),request()).total,56);
 for(const altered of [{...order(900,2),id:901},{...order(900,2),clienteId:52},order(900,3)])assert.throws(()=>confirmedAdjustment(altered,order(),request()));
});
test('servicio PUT envia campos del DTO sin precios y DELETE valida 204',()=>{
 const calls=[],injector=createEnvironmentInjector([{provide:HttpClient,useValue:{put:(url,body)=>{calls.push({url,body});return of({status:200,body:order(900,2)});},delete:()=>of({status:200})}}],null);
 try{const service=runInInjectionContext(injector,()=>new PedidoService());let saved;service.ajustar(order(),{...request(),total:1,rol:'DUENO',detalles:[{...request().detalles[0],precio:1}]}).subscribe(v=>saved=v);assert.equal(saved.total,56);assert.deepEqual(Object.keys(calls[0].body).sort(),['detalles','direccionEntrega','mesaId','restauranteId','tipoEntrega']);assert.deepEqual(Object.keys(calls[0].body.detalles[0]).sort(),['cantidad','notas','platoId']);let rejected=false;service.cancelarAdministrativo(900).subscribe({error:()=>rejected=true});assert(rejected);}finally{injector.destroy();}
});

test('cancelar solo consulta pedido y pago; edicion sin salon no depende de mesas',()=>{const f=setup(session(),false);try{f.store.load(900,false);f.answer(0,order());assert.equal(f.store.state(),'ready');assert.equal(f.catalogCalls.length,0);f.store.load(901,true);f.answer(1,order(901));assert.equal(f.store.state(),'ready');assert.deepEqual(f.catalogCalls,['restaurant','dishes']);}finally{f.close();}});
