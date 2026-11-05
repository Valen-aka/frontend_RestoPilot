const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),esbuild=require('esbuild');
require('@angular/compiler');
const {signal,createEnvironmentInjector,runInInjectionContext}=require('@angular/core');
const {HttpErrorResponse}=require('@angular/common/http');const {Subject}=require('rxjs');
const out=esbuild.buildSync({stdin:{contents:
 "export {API_SESSION} from './src/app/core/auth/api-session'; export {PedidoService} from './src/app/core/services/pedido.service'; export {PagoService} from './src/app/core/services/pago.service'; export {PedidoConsultaStore} from './src/app/pages/cliente/pedido-ui/pedido-consulta-store';",
 resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'cjs',packages:'external',write:false});
const scope={module:{exports:{}},exports:{},require};vm.runInNewContext(out.outputFiles[0].text,scope);
const {API_SESSION,PedidoService,PagoService,PedidoConsultaStore}=scope.module.exports;
const order=(estado='PENDIENTE',id=900)=>({id,clienteId:51,clienteNombre:'Prueba',restauranteId:7,restauranteNombre:'Prueba',mesaId:null,
 estado,tipoEntrega:'LLEVAR',direccionEntrega:null,total:28,fechaCreacion:'2026-11-02T14:00:00',limiteCancelacion:null,
 detalles:[{id:1000,platoId:31,nombrePlatoSnapshot:'Histórico',cantidad:2,precioUnitario:14,subtotal:28,notas:null}]});
function setup(){const session=signal({subject:'51',role:'CLIENTE',accessToken:'token-sintetico',expiresAt:Date.now()+60000}),queries=[],payments=[];
 const injector=createEnvironmentInjector([{provide:API_SESSION,useValue:session},
 {provide:PedidoService,useValue:{obtener(id){const result=new Subject();queries.push({id,result});return result;}}},
 {provide:PagoService,useValue:{consultar(id){const result=new Subject();payments.push({id,result});return result;}}}],null);
 const store=runInInjectionContext(injector,()=>new PedidoConsultaStore());
 const answer=(index,value)=>{queries[index].result.next(value);queries[index].result.complete();};
 return {store,session,queries,payments,injector,answer};}
test('refresco consulta el mismo ID una sola vez y conserva el snapshot hasta recibir respuesta',()=>{
 const f=setup();try{f.store.load(900,'order');f.store.refresh();assert.equal(f.queries.length,1);f.answer(0,order());
  const before=f.store.order();f.store.refresh();f.store.refresh();assert.equal(f.queries.length,2);assert.equal(f.queries[1].id,900);
  assert.equal(f.store.order(),before);assert(f.store.refreshing());f.answer(1,order('EN_PREPARACION'));
  assert.equal(f.store.order().estado,'EN_PREPARACION');assert.equal(f.store.order().total,before.total);
  assert.deepEqual(f.store.order().detalles,before.detalles);assert.equal(f.store.refreshing(),false);assert.equal(f.payments.length,0);
 }finally{f.injector.destroy();}});
test('red, servidor y respuesta incompatible conservan el último estado con aviso; reintento lo recupera',()=>{
 for(const error of [new HttpErrorResponse({status:0}),new HttpErrorResponse({status:500}),new Error('Contrato incompatible')]){
 const f=setup();try{f.store.load(900,'order');f.answer(0,order('EN_PREPARACION'));f.store.refresh();f.queries[1].result.error(error);
  assert.equal(f.store.queryState(),'ready');assert.equal(f.store.order().estado,'EN_PREPARACION');assert(f.store.stale());assert(f.store.refreshIssue());
  f.store.refresh();f.answer(2,order('LISTO'));assert.equal(f.store.order().estado,'LISTO');assert.equal(f.store.stale(),false);assert.equal(f.store.refreshIssue(),'');
 }finally{f.injector.destroy();}}});
test('401, 403 y 404 invalidan la consulta en lugar de conservar datos sensibles',()=>{
 for(const [status,state]of [[401,'unauthenticated'],[403,'forbidden'],[404,'not-found']]){
  const f=setup();try{f.store.load(900,'order');f.answer(0,order());f.store.refresh();f.queries[1].result.error(new HttpErrorResponse({status}));
   assert.equal(f.store.order(),null);assert.equal(f.store.payment(),null);assert.equal(f.store.queryState(),state);assert.equal(f.store.stale(),false);
  }finally{f.injector.destroy();}
 }});
test('respuesta de otra cuenta no reemplaza el pedido propio ni mantiene su información',()=>{
 const f=setup();try{f.store.load(900,'order');f.answer(0,order());f.store.refresh();f.answer(1,{...order('LISTO'),clienteId:52});
  assert.equal(f.store.order(),null);assert.equal(f.store.queryState(),'not-found');assert.equal(f.store.refreshing(),false);
 }finally{f.injector.destroy();}});
test('selección nueva y cierre de sesión descartan las respuestas de una actualización anterior',()=>{
 const f=setup();try{f.store.load(900,'order');f.answer(0,order());f.store.refresh();const old=f.queries[1].result;
  f.store.load(901,'order');f.answer(2,order('ENTREGADO',901));old.next(order('LISTO'));
  assert.equal(f.store.order().id,901);assert.equal(f.store.order().estado,'ENTREGADO');
  f.store.refresh();f.session.set(null);f.answer(3,order('ENTREGADO',901));assert.equal(f.store.order(),null);assert.equal(f.store.queryState(),'unauthenticated');
 }finally{f.injector.destroy();}});
test('estados finales no avanzan solos ni alteran el desglose o el pago',()=>{
 for(const status of ['ENTREGADO','CANCELADO']){const f=setup();try{f.store.load(900,'order');f.answer(0,order(status));f.store.refresh();f.answer(1,order(status));
  assert.equal(f.store.order().estado,status);assert.equal(f.store.order().total,28);assert.equal(f.store.order().detalles[0].precioUnitario,14);assert.equal(f.payments.length,0);
 }finally{f.injector.destroy();}}});
test('actualizar seguimiento no interfiere con la consulta independiente de pago',()=>{
 const f=setup();try{f.store.load(900,'payment');f.answer(0,order());f.store.refresh();assert.equal(f.queries.length,1);assert.equal(f.payments.length,1);
 }finally{f.injector.destroy();}});
