const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),esbuild=require('esbuild');
require('@angular/compiler');
const {signal,createEnvironmentInjector,runInInjectionContext,ɵChangeDetectionScheduler,ɵEffectScheduler}=require('@angular/core');
const {Subject,of}=require('rxjs');const {HttpClient,HttpErrorResponse}=require('@angular/common/http');
const code=esbuild.buildSync({stdin:{contents:"export {ReservaExpiradaStore} from './src/app/pages/reserva-expirada-ui/reserva-expirada-store';export {API_SESSION} from './src/app/core/auth/api-session';export {ReservaService} from './src/app/core/services/reserva.service';export {readReservaList,readReservaDisponibilidad} from './src/app/core/models/reserva-query.model';export {expirationReason,expirationDate} from './src/app/pages/reserva-expirada-ui/reserva-expirada.model';",resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'cjs',packages:'external',write:false});
const scope={module:{exports:{}},exports:{},require};vm.runInNewContext(code.outputFiles[0].text,scope);
const {ReservaExpiradaStore,API_SESSION,ReservaService,readReservaList,readReservaDisponibilidad,expirationReason,expirationDate}=scope.module.exports;
const reservation=(overrides={})=>({id:800,mesaId:19,mesaNumero:4,restauranteId:7,restauranteNombre:'Local prueba',clienteId:51,clienteNombre:'Cliente prueba',fecha:'2026-11-03',horaInicio:'10:00:00',horaFin:'11:00:00',numeroComensales:2,estado:'EXPIRADA',notas:null,creadoEn:'2026-11-01T10:00:00',motivoRechazo:null,llegadaRegistradaEn:null,completadaEn:null,expiradaEn:'2026-11-03T10:16:00',fechaHoraServidor:'2026-11-03T10:16:00',puedeRegistrarLlegada:false,puedeCompletar:false,...overrides});
const list=reservas=>({mensaje:'Consulta de prueba',reservas});
const availability=(mesas=[{mesaId:19,numero:4,capacidad:4,disponible:true}])=>({mensaje:'Consulta de prueba',mesas});
function setup(context='client',initial){
 const session=signal(initial===undefined?{subject:context==='client'?'51':'70',role:context==='client'?'CLIENTE':'ADMINISTRADOR',restauranteId:context==='client'?null:7,accessToken:'test',expiresAt:Number.MAX_SAFE_INTEGER}:initial),requests=[],nodes=new Set();
 const request=(kind,data={})=>{const result=new Subject();requests.push({kind,...data,result});return result;};
 const injector=createEnvironmentInjector([{provide:API_SESSION,useValue:session},{provide:ReservaService,useValue:{propias:()=>request('own'),restaurante:()=>request('restaurant'),obtener:id=>request('get',{id}),disponibilidad:r=>request('availability',{reservation:r})}},
 {provide:ɵChangeDetectionScheduler,useValue:{notify(){}}},{provide:ɵEffectScheduler,useValue:{add:n=>nodes.add(n),schedule:n=>nodes.add(n),remove:n=>nodes.delete(n)}}],null);
 const store=runInInjectionContext(injector,()=>new ReservaExpiradaStore()),flush=()=>{for(const n of nodes)if(n.dirty)n.run();};flush();
 const answer=(i,value)=>{requests[i].result.next(value);requests[i].result.complete();};return {store,session,requests,injector,flush,answer};
}
test('listas conservan formato mensaje/reservas y orden, sin asumir Page ni filtrar otros estados',()=>{
 const values=[reservation({id:801,estado:'CONFIRMADA',expiradaEn:null}),reservation()];
 assert.deepEqual(Array.from(readReservaList(list(values)).reservas,r=>r.id),[801,800]);
 for(const input of [{content:values},list([reservation(),reservation()]),{reservas:values},list([reservation({horaFin:'08:00'})])])assert.throws(()=>readReservaList(input));
});
test('disponibilidad valida booleanos e IDs, sin convertir ausencias o duplicados en libre',()=>{
 for(const value of [{mesas:[]},availability([{mesaId:19,numero:4,capacidad:4,disponible:'true'}]),availability([{mesaId:19,numero:4,capacidad:4,disponible:true},{mesaId:19,numero:4,capacidad:4,disponible:false}])])assert.throws(()=>readReservaDisponibilidad(value));
 assert.equal(readReservaDisponibilidad(availability([])).mesas.length,0);
});
test('cliente y operación usan sus endpoints y conservan Completada de US25',()=>{
 for(const context of ['client','operation']){const f=setup(context);try{
  f.store.load(context,'history');assert.equal(f.requests[0].kind,context==='client'?'own':'restaurant');
  f.answer(0,list([reservation({estado:'COMPLETADA',llegadaRegistradaEn:'2026-11-03T09:58:00',completadaEn:'2026-11-03T10:01:00',expiradaEn:null})]));
  assert.equal(f.store.rows()[0].status,'Completada');f.store.load(context,'detail',800);assert.equal(f.requests[1].id,800);
 }finally{f.injector.destroy();}}
});
test('fila de otro cliente o restaurante rechaza la consulta completa sin filtrar para aparentar éxito',()=>{
 for(const context of ['client','operation']){const f=setup(context);try{f.store.load(context,'history');f.answer(0,list([reservation(),reservation({id:801,...(context==='client'?{clienteId:52}:{restauranteId:8})})]));assert.equal(f.store.rows().length,0);assert.equal(f.store.queryState(),'error');}finally{f.injector.destroy();}}
});
test('IDs ausentes no abren fixtures y un detalle se consulta fuera del historial cargado',()=>{
 const f=setup();try{f.store.load('client','detail',undefined);assert.equal(f.requests.length,0);assert.equal(f.store.selected(),undefined);
  f.store.load('client','detail',987);f.answer(0,reservation({id:987}));assert.equal(f.store.selected().id,987);
 }finally{f.injector.destroy();}
});
test('no deduce causa ni fecha y el paso del reloj no expira una confirmada',()=>{
 const f=setup();try{f.store.load('client','detail',800);f.answer(0,reservation({expiradaEn:null}));assert.equal(expirationDate(f.store.selected()),'No disponible');assert(expirationReason(f.store.selected()).includes('motivo específico no está disponible'));
  f.store.load('client','detail',801);f.answer(1,reservation({id:801,estado:'CONFIRMADA',expiradaEn:null}));assert.equal(f.store.selected().status,'Confirmada');f.store.consultAvailability();assert.equal(f.requests.length,2);
 }finally{f.injector.destroy();}
});
test('disponibilidad libre solo procede de la respuesta de esa mesa',()=>{
 const f=setup();try{f.store.load('client','detail',800);f.answer(0,reservation());assert.equal(f.store.available(),null);
  f.store.consultAvailability();assert.equal(f.requests[1].reservation.mesaId,19);assert.equal(f.store.available(),null);f.answer(1,availability());assert.equal(f.store.available(),true);
  f.store.consultAvailability();f.answer(2,availability([{mesaId:19,numero:4,capacidad:4,disponible:false}]));assert.equal(f.store.available(),false);
 }finally{f.injector.destroy();}
});
test('mesa ausente o error de disponibilidad conserva reserva y deja lectura sin verificar',()=>{
 const f=setup();try{f.store.load('client','detail',800);f.answer(0,reservation());f.store.consultAvailability();f.answer(1,availability([]));assert.equal(f.store.availabilityState(),'error');assert.equal(f.store.available(),null);assert.equal(f.store.selected().status,'Expirada');
  f.store.consultAvailability();f.requests[2].result.error(new HttpErrorResponse({status:500}));assert.equal(f.store.available(),null);assert.equal(f.store.queryState(),'ready');
 }finally{f.injector.destroy();}
});
test('actualizar invalida disponibilidad anterior y reconsulta tras confirmar expiración',()=>{
 const f=setup();try{f.store.load('client','detail',800);f.answer(0,reservation());f.store.consultAvailability();f.answer(1,availability());
  f.store.refresh();assert.equal(f.store.available(),null);f.answer(2,reservation());assert.equal(f.requests[3].kind,'availability');f.answer(3,availability());assert.equal(f.store.available(),true);
 }finally{f.injector.destroy();}
});
test('consulta fallida conserva lectura identificada como anterior, recuperar no escribe estados',()=>{
 const f=setup();try{f.store.load('client','history');f.answer(0,list([reservation()]));f.store.refresh();f.requests[1].result.error(new HttpErrorResponse({status:500}));assert.equal(f.store.queryState(),'stale');assert.equal(f.store.rows()[0].status,'Expirada');f.store.refresh();f.answer(2,list([]));assert.equal(f.store.rows().length,0);assert.equal(f.store.queryState(),'ready');}finally{f.injector.destroy();}
});
for(const status of [400,401,403,404])test('rechazo de lectura '+status+' limpia datos',()=>{
 const f=setup();try{f.store.load('client','detail',800);f.answer(0,reservation());f.store.refresh();f.requests[1].result.error(new HttpErrorResponse({status}));assert.equal(f.store.selected(),undefined);assert.equal(f.store.queryState(),'error');}finally{f.injector.destroy();}
});
test('logout y cambio de selección cancelan respuestas antiguas y disponibilidad',()=>{
 const f=setup();try{f.store.load('client','detail',800);f.answer(0,reservation());f.store.consultAvailability();f.store.load('client','detail',801);assert.equal(f.requests[1].result.observed,false);f.answer(2,reservation({id:801}));f.requests[1].result.next(availability());assert.equal(f.store.available(),null);
  f.store.refresh();f.session.set(null);assert.equal(f.store.selected(),undefined);f.flush();assert.equal(f.requests[3].result.observed,false);assert.equal(f.store.rows().length,0);
 }finally{f.injector.destroy();}
});
test('roles incompatibles no realizan consultas en el contexto protegido',()=>{
 const f=setup('client');try{f.store.load('operation','history');assert.equal(f.requests.length,0);assert.equal(f.store.queryState(),'error');}finally{f.injector.destroy();}
 const g=setup('operation');try{g.store.load('client','history');assert.equal(g.requests.length,0);}finally{g.injector.destroy();}
});
test('servicio usa solo GET, formato propio y parámetros del registro real sin Page',()=>{
 const calls=[],injector=createEnvironmentInjector([{provide:HttpClient,useValue:{get(url,options){calls.push({url,options});return of(url.endsWith('/disponibilidad')?availability():list([reservation()]));}}}],null);
 try{const api=runInInjectionContext(injector,()=>new ReservaService());api.propias().subscribe();api.restaurante().subscribe();api.disponibilidad(reservation()).subscribe();
  assert(calls[0].url.endsWith('/api/reservas/me'));assert(calls[1].url.endsWith('/api/reservas'));assert(calls[2].url.endsWith('/api/reservas/disponibilidad'));
  const p=calls[2].options.params;assert.equal(p.get('restauranteId'),'7');assert.equal(p.get('fecha'),'2026-11-03');assert.equal(p.get('horaInicio'),'10:00:00');assert.equal(p.get('numeroComensales'),'2');assert.equal(p.has('page'),false);
 }finally{injector.destroy();}
});
