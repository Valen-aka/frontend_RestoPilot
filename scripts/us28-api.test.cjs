const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),esbuild=require('esbuild');
require('@angular/compiler');
const {signal,createEnvironmentInjector,runInInjectionContext,ɵChangeDetectionScheduler,ɵEffectScheduler}=require('@angular/core');
const {HttpClient,HttpErrorResponse}=require('@angular/common/http');
const {Subject,of}=require('rxjs');
const bundle=esbuild.buildSync({stdin:{contents:"export {environment} from './src/environments/environment';export {supabaseTransportInterceptor} from './src/app/core/interceptors/supabase-transport.interceptor';export {API_SESSION} from './src/app/core/auth/api-session';export {NotificacionService} from './src/app/core/services/notificacion.service';export {readNotificacionesPage,readNotificacionesResponse} from './src/app/core/models/notificacion-api.model';export {NotificacionesStore} from './src/app/pages/notificaciones-ui/notificaciones-store';",resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'cjs',packages:'external',write:false});
const scope={module:{exports:{}},exports:{},require,URL,atob,TextDecoder,setTimeout,clearTimeout};
vm.runInNewContext(bundle.outputFiles[0].text,scope);
const {environment,supabaseTransportInterceptor,API_SESSION,NotificacionService,readNotificacionesPage,readNotificacionesResponse,NotificacionesStore}=scope.module.exports;
const row=(id=8,usuarioId=51,fechaCreacion='2026-11-06T14:30:00')=>({id,usuarioId,mensaje:'Pedido actualizado',fechaCreacion});
const page=(content=[],number=0,size=5,totalElements=content.length)=>({content,number,size,totalElements,totalPages:Math.ceil(totalElements/size)});
const session=(subject='51',role='CLIENTE')=>({subject,role,accessToken:'token-'+subject,expiresAt:Date.now()+60000,restauranteId:role==='CLIENTE'?null:7});
function setup(initial=session()){
 const s=signal(initial),requests=[],nodes=new Set();
 const injector=createEnvironmentInjector([{provide:API_SESSION,useValue:s},{provide:NotificacionService,useValue:{consultar(subject,index,size){const result=new Subject();requests.push({subject,index,size,result});return result;}}},{provide:ɵChangeDetectionScheduler,useValue:{notify(){}}},{provide:ɵEffectScheduler,useValue:{add:n=>nodes.add(n),schedule:n=>nodes.add(n),remove:n=>nodes.delete(n)}}],null);
 const store=runInInjectionContext(injector,()=>new NotificacionesStore());
 const flush=()=>{for(const n of nodes)if(n.dirty)n.run();};flush();
 return {store,s,requests,flush,close:()=>injector.destroy()};
}
test('página valida contrato, identidad, orden y conserva solo campos de presentación',()=>{
 const result=readNotificacionesPage(page([row(8,51,'2026-11-06T14:30:00.1'),row(7)]),'51',0,5);
 assert.equal(result.content.length,2);assert.equal(result.content[0].id,8);assert(!('usuarioId' in result.content[0]));assert(Object.isFrozen(result.content));
 assert.equal(readNotificacionesPage(page([]),'51',0,5).totalElements,0);
});
test('rechaza avisos ajenos, repetidos, fechas inválidas y orden ascendente',()=>{
 for(const records of [[row(8,52)],[row(),row()],[row(8,51,'2026-02-30T12:00:00')],[row(8,51,'2026-11-06T14:30:00Z')],[row(7),row(8,51,'2026-11-06T14:31:00')]])assert.throws(()=>readNotificacionesPage(page(records),'51',0,5));
});
test('rechaza paginación incoherente y mensajes incompletos',()=>{
 for(const p of [{...page([row()]),number:1},{...page([row()]),totalPages:8},{...page([row()]),size:20},page([{...row(),mensaje:''}]),page([{...row(),id:-1}])])assert.throws(()=>readNotificacionesPage(p,'51',0,5));
});
test('servicio pagina en servidor sin enviar identidad y agrega desempate por id',()=>{
 const calls=[],injector=createEnvironmentInjector([{provide:HttpClient,useValue:{get(url,options){calls.push({url,options});return of(page([row(8)],1,5,6));}}}],null);
 try{const service=runInInjectionContext(injector,()=>new NotificacionService());let response;service.consultar('51',1,5).subscribe(r=>response=r);assert.equal(response.number,1);assert(calls[0].url.endsWith('/notificaciones/me'));assert.equal(calls[0].options.params.toString(),'page=1&size=5&sort=id,desc');assert(!calls[0].url.includes('51'));}finally{injector.destroy();}
});
test('estado vacío proviene del servidor y permite actualizar',()=>{
 const f=setup();try{assert.equal(f.store.state(),'loading');f.requests[0].result.next(page([]));assert.equal(f.store.state(),'empty');f.store.load(0);assert.equal(f.requests.length,2);assert.equal(f.store.state(),'loading');}finally{f.close();}
});
test('paginador solicita la página seleccionada y borra datos mientras carga',()=>{
 const f=setup();try{f.requests[0].result.next(page([row()]));f.store.load(1,5);assert.equal(f.requests[1].index,1);assert.equal(f.store.messages().length,0);f.requests[1].result.next(page([row(7)],1,5,6));assert.equal(f.store.page(),1);assert.equal(f.store.total(),6);}finally{f.close();}
});
test('cada cambio de sesión limpia avisos, vuelve a primera página y descarta respuestas antiguas',()=>{
 const f=setup();try{f.requests[0].result.next(page([row()]));f.s.set(session('70','DUENO'));assert.equal(f.store.messages().length,0);assert.equal(f.store.total(),0);f.flush();assert.equal(f.store.messages().length,0);assert.equal(f.requests[1].subject,'70');f.requests[0].result.next(page([row()]));assert.equal(f.store.messages().length,0);f.requests[1].result.next(page([]));f.s.set(null);f.flush();assert.equal(f.store.state(),'unauthenticated');assert.equal(f.store.total(),0);}finally{f.close();}
});
test('sin sesión o vencida no consulta HTTP',()=>{
 for(const s of [null,{...session(),expiresAt:1}]){const f=setup(s);try{assert.equal(f.requests.length,0);assert.equal(f.store.state(),'unauthenticated');}finally{f.close();}}
});
test('distingue 401,403,404,red y error de contrato, con reintento',()=>{
 for(const [status,state]of [[401,'unauthenticated'],[403,'forbidden'],[404,'not-found'],[0,'error'],[500,'error']]){const f=setup();try{f.requests[0].result.error(new HttpErrorResponse({status}));assert.equal(f.store.state(),state);assert.equal(f.store.messages().length,0);f.store.load();assert.equal(f.requests.length,2);}finally{f.close();}}
 const f=setup();try{f.requests[0].result.error(new Error('contrato'));assert.equal(f.store.state(),'error');}finally{f.close();}
});
test('página que dejó de existir recupera primera página y no fabrica un vacío global',()=>{
 const f=setup();try{f.store.load(4,5);f.requests[1].result.next(page([],4,5,1));assert.equal(f.requests[2].index,0);assert.equal(f.store.state(),'loading');}finally{f.close();}
});
test('destruir el store cancela consultas y no actualiza la vista',()=>{
 const f=setup();f.close();f.requests[0].result.next(page([row()]));assert.equal(f.store.messages().length,0);assert.equal(f.requests[0].result.observers.length,0);
});

test('RPC Supabase lista personal se valida completa antes de paginar',()=>{
 const list=Array.from({length:6},(_,i)=>row(10-i));const result=readNotificacionesResponse(list,'51',1,5,true);assert.equal(result.content.length,1);assert.equal(result.content[0].id,5);assert.equal(result.totalElements,6);assert.equal(result.totalPages,2);
 assert.equal(readNotificacionesResponse([],'51',0,5,true).totalElements,0);
 assert.throws(()=>readNotificacionesResponse([...list.slice(0,5),row(5,99)],'51',0,5,true));
 assert.throws(()=>readNotificacionesResponse(list,'51',0,5,false));
});

test('servicio y transporte RPC normalizan lista Supabase sin cambiar identidad',()=>{
 const {HttpRequest,HttpHeaders,HttpResponse}=require('@angular/common/http');let rpc;
 const injector=createEnvironmentInjector([{provide:HttpClient,useValue:{get(url,options){return supabaseTransportInterceptor(new HttpRequest('GET',url,null,{params:options.params,headers:new HttpHeaders({Authorization:'Bearer fixture'})}),request=>{rpc=request;return of(new HttpResponse({status:200,body:{status:200,body:[row(8),row(7)]}}));}).pipe(require('rxjs').map(response=>response.body));}}}],null);
 try{const service=runInInjectionContext(injector,()=>new NotificacionService());let result;service.consultar('51',0,5).subscribe(value=>result=value);assert.equal(rpc.url,environment.supabase.url+'/rest/v1/rpc/rp_api');assert.equal(rpc.body.p_path,'/notificaciones/me');assert.equal(rpc.body.p_query.page,'0');assert.equal(result.totalElements,2);assert.equal(result.content[0].id,8);assert(!('usuarioId' in result.content[0]));}finally{injector.destroy();}
});
