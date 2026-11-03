
const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),esbuild=require('esbuild');
require('@angular/compiler');
const {signal,createEnvironmentInjector,runInInjectionContext}=require('@angular/core');
const {Router}=require('@angular/router');
const {HttpRequest,HttpErrorResponse}=require('@angular/common/http');
const {of,throwError}=require('rxjs');
const code=esbuild.buildSync({stdin:{contents:
  "export {API_SESSION} from './src/app/core/auth/api-session'; export {AuthService} from './src/app/core/services/auth.service'; export {clienteGuard} from './src/app/core/guards/cliente.guard'; export {apiAuthInterceptor} from './src/app/core/interceptors/api-auth.interceptor';",
  resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'cjs',packages:'external',write:false});
const sandbox={module:{exports:{}},exports:{},require,console};vm.runInNewContext(code.outputFiles[0].text,sandbox);
const {API_SESSION,AuthService,clienteGuard,apiAuthInterceptor}=sandbox.module.exports;
function setup(initial){const session=signal(initial),auth={session,logout(){session.set(null);}},injector=createEnvironmentInjector([
  {provide:API_SESSION,useValue:session},{provide:AuthService,useValue:auth},
  {provide:Router,useValue:{createUrlTree:(commands,extras)=>({commands,extras})}}
],null);return {session,auth,injector};}
const client=()=>({subject:'51',role:'CLIENTE',accessToken:'token-sintetico',expiresAt:Date.now()+60000});
test('guard acepta solo cliente vigente y devuelve retorno interno para login cuando corresponde',()=>{
  for(const value of [null,{...client(),role:'DUENO'},{...client(),expiresAt:0}]){
    const f=setup(value);try{const result=runInInjectionContext(f.injector,()=>clienteGuard({}, {url:'/cliente/carrito'}));
      assert.equal(result.commands[0],'/auth/login');assert.equal(result.extras.queryParams.returnUrl,'/cliente/carrito');}finally{f.injector.destroy();}
  }
  const f=setup(client());try{assert.equal(runInInjectionContext(f.injector,()=>clienteGuard({}, {url:'/cliente/carrito'})),true);}finally{f.injector.destroy();}
});
test('interceptor adjunta Bearer únicamente a apiUrl, excluyendo login y destinos parecidos/externos',()=>{
  const f=setup(client());try{
    for(const url of ['http://localhost:8081/api/pedidos','http://localhost:8081/api/platos?restauranteId=7']){
      let captured;runInInjectionContext(f.injector,()=>apiAuthInterceptor(new HttpRequest('GET',url),r=>{captured=r;return of({});})).subscribe();
      assert.equal(captured.headers.get('Authorization'),'Bearer token-sintetico');
    }
    for(const url of ['https://example.test/api/pedidos','http://localhost:8081/api-otro/pedidos','http://localhost:8081/api/auth/login']){
      let captured;runInInjectionContext(f.injector,()=>apiAuthInterceptor(new HttpRequest('GET',url),r=>{captured=r;return of({});})).subscribe();
      assert.equal(captured.headers.has('Authorization'),false);
    }
    f.session.set({...client(),expiresAt:0});let captured;
    runInInjectionContext(f.injector,()=>apiAuthInterceptor(new HttpRequest('GET','http://localhost:8081/api/pedidos'),r=>{captured=r;return of({});})).subscribe();
    assert.equal(captured.headers.has('Authorization'),false);
  }finally{f.injector.destroy();}
});
test('401 del token actual limpia sesión; un 403 o 401 anterior no borra otra sesión',()=>{
  const f=setup(client());try{
    for(const status of [403,401]){
      f.session.set(client());let failed=false;
      runInInjectionContext(f.injector,()=>apiAuthInterceptor(new HttpRequest('GET','http://localhost:8081/api/pedidos'),()=>throwError(()=>new HttpErrorResponse({status}))))
        .subscribe({error:()=>failed=true});assert(failed);assert.equal(f.session()===null,status===401);
    }
    f.session.set(client());
    runInInjectionContext(f.injector,()=>apiAuthInterceptor(new HttpRequest('GET','http://localhost:8081/api/pedidos'),()=>{
      f.session.set({...client(),accessToken:'otro-token-sintetico'});return throwError(()=>new HttpErrorResponse({status:401}));
    })).subscribe({error:()=>{}});
    assert.equal(f.session().accessToken,'otro-token-sintetico');
  }finally{f.injector.destroy();}
});
