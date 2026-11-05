const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),esbuild=require('esbuild');
require('@angular/compiler');
const {signal,createEnvironmentInjector,runInInjectionContext,ɵChangeDetectionScheduler,ɵEffectScheduler}=require('@angular/core');
const {Subject,of}=require('rxjs');const {HttpClient,HttpErrorResponse}=require('@angular/common/http');
const code=esbuild.buildSync({stdin:{contents:"export {ReservaAtencionStore} from './src/app/pages/operacion/reserva-atencion-ui/reserva-atencion-store';export {API_SESSION} from './src/app/core/auth/api-session';export {ReservaService} from './src/app/core/services/reserva.service';export {readReserva,parseReservaId} from './src/app/core/models/reserva-api.model';export {reservationVersion} from './src/app/pages/operacion/reserva-atencion-ui/reserva-atencion.model';",resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'cjs',packages:'external',write:false});
const scope={module:{exports:{}},exports:{},require};vm.runInNewContext(code.outputFiles[0].text,scope);
const {ReservaAtencionStore,API_SESSION,ReservaService,readReserva,parseReservaId,reservationVersion}=scope.module.exports;
const reservation=(overrides={})=>({id:800,mesaId:19,mesaNumero:4,restauranteId:7,restauranteNombre:'Local prueba',clienteId:51,clienteNombre:'Cliente prueba',
 fecha:'2026-11-03',horaInicio:'10:00:00',horaFin:'11:00:00',numeroComensales:2,estado:'CONFIRMADA',notas:null,creadoEn:'2026-11-01T10:00:00',motivoRechazo:null,
 llegadaRegistradaEn:null,completadaEn:null,expiradaEn:null,fechaHoraServidor:'2026-11-03T10:05:00',puedeRegistrarLlegada:true,puedeCompletar:false,...overrides});
const arrived=()=>reservation({llegadaRegistradaEn:'2026-11-03T10:05:00',puedeRegistrarLlegada:false,puedeCompletar:true});
const completed=()=>({...arrived(),estado:'COMPLETADA',completadaEn:'2026-11-03T10:06:00',fechaHoraServidor:'2026-11-03T10:06:00',puedeCompletar:false});
function setup(initial={subject:'70',role:'ADMINISTRADOR',restauranteId:7,accessToken:'test',expiresAt:Number.MAX_SAFE_INTEGER}){
 const session=signal(initial),requests=[],nodes=new Set();const request=(kind,id)=>{const result=new Subject();requests.push({kind,id,result});return result;};
 const injector=createEnvironmentInjector([{provide:API_SESSION,useValue:session},{provide:ReservaService,useValue:{obtener:id=>request('get',id),registrarLlegada:id=>request('arrival',id),completar:id=>request('complete',id)}},
  {provide:ɵChangeDetectionScheduler,useValue:{notify(){}}},{provide:ɵEffectScheduler,useValue:{add:n=>nodes.add(n),schedule:n=>nodes.add(n),remove:n=>nodes.delete(n)}}],null);
 const store=runInInjectionContext(injector,()=>new ReservaAtencionStore()),flush=()=>{for(const n of nodes)if(n.dirty)n.run();};flush();
 const answer=(i,value)=>{requests[i].result.next(value);requests[i].result.complete();};
 const load=(value=reservation())=>{store.load(value.id);answer(requests.length-1,value);};
 const command=(action='arrival')=>({id:store.selectedId(),action,expectedVersion:reservationVersion(store.selected())});
 return {store,session,requests,injector,flush,answer,load,command};
}
test('ID explícito inválido no se sustituye por una muestra',()=>{
 for(const value of [undefined,null,'0','-1','1e2',' 800 ','800x',0,NaN])assert.equal(parseReservaId(value),undefined);
 assert.equal(parseReservaId('800'),800);const f=setup();try{f.store.load(undefined);assert.equal(f.requests.length,0);assert.equal(f.store.selected(),undefined);}finally{f.injector.destroy();}
});
test('contrato admite horas sin segundos y conserva fechas locales, rechaza incoherencia',()=>{
 assert.equal(readReserva(reservation({horaInicio:'10:00'}),800).horaInicio,'10:00');
 for(const value of [reservation({id:801}),reservation({fecha:'2026-02-30'}),reservation({puedeCompletar:true}),reservation({estado:'COMPLETADA'}),reservation({llegadaRegistradaEn:'mal'}),reservation({horaFin:'09:00'})])assert.throws(()=>readReserva(value,800));
});
test('indicadores ausentes permiten lectura pero bloquean acciones sin inventar reloj',()=>{
 const f=setup();try{f.load(reservation({fechaHoraServidor:undefined,puedeRegistrarLlegada:undefined,puedeCompletar:undefined}));assert(f.store.selected());assert.equal(f.store.now(),undefined);assert(f.store.actionProblem('arrival'));}finally{f.injector.destroy();}
});
test('los controles usan indicadores del servidor y no el reloj del navegador',()=>{
 const f=setup();const now=Date.now;try{f.load();Date.now=()=>now()+86400000*90;assert.equal(f.store.actionProblem('arrival'),'');
  f.load(arrived());assert.equal(f.store.actionProblem('complete'),'');f.load({...arrived(),puedeCompletar:false});assert(f.store.actionProblem('complete'));
 }finally{Date.now=now;f.injector.destroy();}
});
test('llegada no es optimista, no se duplica y conserva CONFIRMADA y fecha del servidor',async()=>{
 const f=setup();try{f.load();const cmd=f.command(),pending=f.store.apply(cmd);assert.equal(f.store.selected().arrivedAt,undefined);assert(f.store.busy());
  assert.equal((await f.store.apply(cmd)).ok,false);assert.equal(f.requests.length,2);f.answer(1,arrived());assert((await pending).ok);assert.equal(f.store.selected().status,'Confirmada');
  assert.equal(f.store.selected().arrivedAt,'2026-11-03T10:05:00-05:00');assert.equal(f.store.actionProblem('arrival'),'La llegada ya está registrada.');
 }finally{f.injector.destroy();}
});
test('completar conserva la llegada y deja fecha y estado terminales',async()=>{
 const f=setup();try{f.load(arrived());const promise=f.store.apply(f.command('complete'));f.answer(1,completed());assert((await promise).ok);
  assert.equal(f.store.selected().status,'Completada');assert.equal(f.store.selected().arrivedAt,'2026-11-03T10:05:00-05:00');assert.equal(f.store.selected().completedAt,'2026-11-03T10:06:00-05:00');
  assert.equal((await f.store.apply(f.command('complete'))).ok,false);assert.equal(f.requests.length,2);
 }finally{f.injector.destroy();}
});
for(const status of [400,409])test('rechazo '+status+' reconsulta, admite expiración autoritativa y no repite PATCH',async()=>{
 const f=setup();try{f.load();const promise=f.store.apply(f.command());f.requests[1].result.error(new HttpErrorResponse({status}));assert.equal(f.requests[2].kind,'get');
  f.answer(2,reservation({estado:'EXPIRADA',expiradaEn:'2026-11-03T10:15:00',fechaHoraServidor:'2026-11-03T10:15:00',puedeRegistrarLlegada:false}));
  assert.equal((await promise).ok,false);assert.equal(f.store.selected().status,'Expirada');assert.equal(f.requests.filter(r=>r.kind==='arrival').length,1);assert.equal(f.store.verificationId(),null);
 }finally{f.injector.destroy();}
});
test('respuesta perdida y GET fallido requieren verificación explícita del mismo ID',async()=>{
 const f=setup();try{f.load();const promise=f.store.apply(f.command());f.requests[1].result.error(new HttpErrorResponse({status:0}));f.requests[2].result.error(new HttpErrorResponse({status:500}));
  assert.equal((await promise).ok,false);assert.equal(f.store.verificationId(),800);f.store.refresh();assert.equal(f.requests[3].id,800);assert.equal(f.requests[3].kind,'get');
  f.answer(3,arrived());assert.equal(f.store.verificationId(),null);assert.equal(f.requests.filter(r=>r.kind==='arrival').length,1);assert(f.store.feedback().text.includes('con llegada registrada'));
 }finally{f.injector.destroy();}
});
test('fecha de llegada alterada en confirmación de completar se verifica, no anuncia éxito',async()=>{
 const f=setup();try{f.load(arrived());const promise=f.store.apply(f.command('complete'));f.answer(1,{...completed(),llegadaRegistradaEn:'2026-11-03T10:04:00'});
  assert.equal(f.requests[2].kind,'get');f.answer(2,completed());assert.equal((await promise).ok,false);assert.equal(f.store.feedback().kind,'error');
 }finally{f.injector.destroy();}
});
for(const status of [401,403,404])test('rechazo '+status+' limpia fechas y datos protegidos',async()=>{
 const f=setup();try{f.load();const promise=f.store.apply(f.command());f.requests[1].result.error(new HttpErrorResponse({status}));assert.equal((await promise).ok,false);assert.equal(f.store.selected(),undefined);assert.equal(f.store.current(),null);}finally{f.injector.destroy();}
});
test('otro restaurante, rol CLIENTE y sesión ausente no reciben muestras ni permisos',()=>{
 const f=setup();try{f.load(reservation({restauranteId:8}));assert.equal(f.store.current(),null);assert.equal(f.store.queryState(),'error');}finally{f.injector.destroy();}
 for(const s of [null,{subject:'51',role:'CLIENTE',accessToken:'test',expiresAt:Number.MAX_SAFE_INTEGER}]){const f=setup(s);try{f.store.load(800);assert.equal(f.requests.length,0);assert.equal(f.store.current(),null);}finally{f.injector.destroy();}}
});
test('logout cancela operación pendiente y una selección nueva ignora respuestas anteriores',async()=>{
 const f=setup();try{f.load();const pending=f.store.apply(f.command());f.session.set(null);f.flush();assert.equal((await pending).ok,false);assert.equal(f.requests[1].result.observed,false);assert.equal(f.store.busy(),false);
 }finally{f.injector.destroy();}
 const g=setup();try{g.store.load(800);g.store.load(801);g.answer(1,reservation({id:801}));g.requests[0].result.next(reservation());assert.equal(g.store.selected().id,801);}finally{g.injector.destroy();}
});
test('error de refresco conserva fechas con lectura anterior y bloquea mutaciones',async()=>{
 const f=setup();try{f.load(arrived());f.store.refresh();f.requests[1].result.error(new HttpErrorResponse({status:500}));assert.equal(f.store.queryState(),'stale');assert(f.store.selected().arrivedAt);
  assert.equal((await f.store.apply(f.command('complete'))).ok,false);assert.equal(f.requests.length,2);
 }finally{f.injector.destroy();}
});
test('servicio usa GET y dos PATCH específicos, cuerpo nulo y estado HTTP 200',()=>{
 const requests=[],injector=createEnvironmentInjector([{provide:HttpClient,useValue:{get(url,options){requests.push({url,options});return of(reservation());},patch(url,body,options){requests.push({url,body,options});return of({status:200,body:url.endsWith('/llegada')?arrived():completed()});}}}],null);
 try{const api=runInInjectionContext(injector,()=>new ReservaService());api.obtener(800).subscribe();api.registrarLlegada(800).subscribe();api.completar(800).subscribe();
  assert(requests[0].url.endsWith('/api/reservas/800'));assert(requests[1].url.endsWith('/reservas/800/llegada'));assert(requests[2].url.endsWith('/reservas/800/completar'));assert.equal(requests[1].body,null);assert.equal(requests[2].body,null);
 }finally{injector.destroy();}
});
