const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),esbuild=require('esbuild');require('@angular/compiler');
const {of,throwError,firstValueFrom}=require('rxjs');
const {HttpClient,HttpErrorResponse}=require('@angular/common/http');
const {createEnvironmentInjector,runInInjectionContext}=require('@angular/core');
const {DOCUMENT}=require('@angular/common');
const built=esbuild.buildSync({stdin:{contents:"export {confirmationReturn,confirmationRedirect,EmailConfirmationReturn} from './src/app/core/services/email-confirmation-return.service';export {supabaseAuth,EmailConfirmationRequired} from './src/app/core/services/supabase-auth.transport';export {AuthService} from './src/app/core/services/auth.service';export {accessProblem} from './src/app/pages/auth/access-problem';",resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'cjs',packages:'external',write:false});
const scope={module:{exports:{}},exports:{},require,URL,URLSearchParams,TextDecoder,Uint8Array,atob,setTimeout,clearTimeout};vm.runInNewContext(built.outputFiles[0].text,scope);
const {confirmationReturn,confirmationRedirect,EmailConfirmationReturn,supabaseAuth,EmailConfirmationRequired,AuthService,accessProblem}=scope.module.exports;
const config={url:'https://project.example',publishableKey:'public-fixture'},uid='11111111-1111-4111-8111-111111111111',account={correo:'cliente@example.test',password:'Fixture9!prueba',nombreCompleto:'Cliente QA'};
test('retorno elimina tokens sin aceptarlos como sesion ni confiar en destinos externos',()=>{
 const result=confirmationReturn('https://app.example/#access_token=privado&refresh_token=privado&type=signup&redirect_to=https://evil.test');
 assert.equal(result,'/auth/login?registro=confirmacion-recibida');assert(!result.includes('privado'));assert(!result.includes('evil'));
 assert.equal(confirmationReturn('https://app.example/#error=access_denied&error_code=otp_expired&error_description=privado'),'/auth/login?motivo=enlace-confirmacion-invalido');
 assert.equal(confirmationReturn('https://app.example/cliente#contenido'),null);assert.equal(confirmationReturn('invalido'),null);
});
test('limpieza ocurre antes de navegar y no conserva hash en history.state',()=>{
 let changed;const injector=createEnvironmentInjector([{provide:DOCUMENT,useValue:{defaultView:{location:{href:'https://app.example/#access_token=privado'},history:{replaceState:(state,title,url)=>changed={state,title,url}}}}}],null);
 try{runInInjectionContext(injector,()=>new EmailConfirmationReturn());assert.equal(changed.state,null);assert.equal(changed.url,'/auth/login?registro=confirmacion-recibida');}finally{injector.destroy();}
});
test('redireccion publica se deriva del origen y fija la ruta de acceso',()=>{
 assert.equal(confirmationRedirect('http://localhost:4367'), 'http://localhost:4367/auth/login');assert.equal(confirmationRedirect('https://app.example'), 'https://app.example/auth/login');
 for(const value of [undefined,'javascript:alert(1)','http://externo.example','//evil.test'])assert.equal(confirmationRedirect(value),undefined);
});
test('alta pendiente de cliente y dueno no consulta perfil ni fabrica sesion',async()=>{
 for(const path of ['/auth/register','/auth/register-owner']){const calls=[],http={post(url,body){calls.push({url,body});return of({user:{id:uid,email:account.correo}});}};
 await assert.rejects(firstValueFrom(supabaseAuth(http,config,path,account,'https://app.example/auth/login')),e=>e instanceof EmailConfirmationRequired);
 assert.equal(calls.length,1);assert.equal(new URL(calls[0].url).searchParams.get('redirect_to'),'https://app.example/auth/login');assert(!calls[0].url.includes('password'));assert(!('rol' in calls[0].body));}
});
test('respuestas incompletas o de otro correo no se presentan como confirmacion pendiente',async()=>{
 for(const response of [{},null,{user:{id:'incorrecto'}},{user:{id:uid,email:'otra@example.test'}}])await assert.rejects(firstValueFrom(supabaseAuth({post:()=>of(response)},config,'/auth/register',account)),e=>!(e instanceof EmailConfirmationRequired));
});
test('signup REST pendiente devuelve usuario en raiz, no requiere envoltorio del SDK',async()=>{
 const http={post:()=>of({id:uid,email:account.correo,identities:[{identity_id:uid}]})};
 for(const path of ['/auth/register','/auth/register-owner'])await assert.rejects(firstValueFrom(supabaseAuth(http,config,path,account)),e=>e instanceof EmailConfirmationRequired);
});
test('duplicado explicito conserva409; respuesta opaca no afirma cuenta creada',async()=>{
 const failure=new HttpErrorResponse({status:422,error:{code:'user_already_exists'}});
 await assert.rejects(firstValueFrom(supabaseAuth({post:()=>throwError(()=>failure)},config,'/auth/register',account)),e=>e.status===409);
 await assert.rejects(firstValueFrom(supabaseAuth({post:()=>of({user:{id:uid,email:account.correo,identities:[]}})},config,'/auth/register',account)),e=>e instanceof EmailConfirmationRequired);
});
test('reenviar confirmacion envia solo correo y tipo; no crea ni sustituye sesion',async()=>{
 const calls=[],injector=createEnvironmentInjector([{provide:HttpClient,useValue:{post:(url,body,options)=>{calls.push({url,body,options});return of({status:200});}}},{provide:DOCUMENT,useValue:{defaultView:{location:{origin:'http://localhost:4367'}}}}],null);
 try{const auth=runInInjectionContext(injector,()=>new AuthService());await firstValueFrom(auth.resendConfirmation(' CLIENTE@example.test '));assert.equal(auth.session(),null);assert.equal(calls.length,1);assert(calls[0].url.includes('/auth/v1/resend?redirect_to='));assert.deepEqual(Object.keys(calls[0].body).sort(),['email','type']);assert.equal(calls[0].body.email,'cliente@example.test');assert(!('Authorization' in calls[0].options.headers));await assert.rejects(firstValueFrom(auth.resendConfirmation('sin-correo')));assert.equal(calls.length,1);}finally{injector.destroy();}
});
test('errores de correo y confirmacion no se confunden con credenciales invalidas',()=>{
 assert(accessProblem(new HttpErrorResponse({status:403,error:{code:'email_address_not_authorized'}})).includes('servicio de correo'));
 assert(accessProblem(new HttpErrorResponse({status:400,error:{code:'email_not_confirmed'}}),true).includes('Confirma tu correo'));
});
