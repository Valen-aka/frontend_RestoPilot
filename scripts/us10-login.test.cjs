const {test}=require('node:test'),assert=require('node:assert/strict'),esbuild=require('esbuild');
require('@angular/compiler');
const {createEnvironmentInjector,runInInjectionContext,ElementRef}=require('@angular/core');
const {ActivatedRoute,Router,convertToParamMap}=require('@angular/router');
const {Subject}=require('rxjs');const {HttpErrorResponse}=require('@angular/common/http');
const code=esbuild.buildSync({stdin:{contents:"export {AccesoPage} from './src/app/pages/auth/acceso/acceso'; export {AuthService} from './src/app/core/services/auth.service';",resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'cjs',packages:'external',write:false});
const mod={exports:{}};new Function('module','exports','require',code.outputFiles[0].text)(mod,mod.exports,require);const {AccesoPage,AuthService}=mod.exports;
function setup(returnUrl='/cliente/carta?restauranteId=7'){
 const requests=[],navigations=[],response=new Subject();
 const injector=createEnvironmentInjector([{provide:AuthService,useValue:{login:r=>{requests.push(r);return response;}}},{provide:Router,useValue:{navigateByUrl:u=>{navigations.push(u);return Promise.resolve(true);}}},{provide:ActivatedRoute,useValue:{snapshot:{queryParamMap:convertToParamMap({returnUrl})}}},{provide:ElementRef,useValue:{nativeElement:{querySelectorAll:()=>[]}}}],null);
 const page=runInInjectionContext(injector,()=>new AccesoPage());page.form.setValue({correo:'cliente@example.test',password:'Prueba123!'});return {page,requests,navigations,response,injector};
}
test('login usa servicio existente y bloquea doble envío',()=>{const f=setup();try{f.page.submit();f.page.submit();assert.equal(f.requests.length,1);assert(f.page.pending());f.response.next({rol:'CLIENTE'});f.response.complete();assert.deepEqual(f.navigations,['/cliente/carta?restauranteId=7']);assert.equal(f.page.form.controls.password.value,'');assert(!f.page.pending());}finally{f.injector.destroy();}});
test('credenciales inválidas no navegan y permiten reintentar',()=>{const f=setup();try{f.page.submit();f.response.error(new HttpErrorResponse({status:401}));assert.match(f.page.notice(),/incorrectos/);assert.equal(f.navigations.length,0);assert(!f.page.pending());}finally{f.injector.destroy();}});
test('formulario inválido no consulta HTTP',()=>{const f=setup();try{f.page.form.controls.correo.setValue('');f.page.submit();assert.equal(f.requests.length,0);}finally{f.injector.destroy();}});
test('destruir acceso cancela respuesta y navegación tardía',()=>{const f=setup();f.page.submit();f.injector.destroy();assert.equal(f.response.observed,false);f.response.next({rol:'CLIENTE'});assert.equal(f.navigations.length,0);});
test('retorno rechaza URLs externas, otro rol y traversal',()=>{for(const url of ['https://evil.test','//evil.test','/operacion','/cliente/../dueno','/cliente/%2e%2e/dueno','/cliente(aux:dueno)','/cliente\\evil']){const f=setup(url);try{f.page.submit();f.response.next({rol:'CLIENTE'});assert.deepEqual(f.navigations,['/cliente'],url);}finally{f.injector.destroy();}}});
test('roles existentes conservan destino propio sin entrar en carta cliente',()=>{for(const [rol,url]of [['DUENO','/dueno'],['ADMINISTRADOR','/operacion']]){const f=setup('/cliente');try{f.page.submit();f.response.next({rol});assert.deepEqual(f.navigations,[url]);}finally{f.injector.destroy();}}});
