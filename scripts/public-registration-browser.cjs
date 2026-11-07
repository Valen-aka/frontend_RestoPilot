const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const app=process.env.RP_APP_URL||'http://127.0.0.1:4367',out=path.resolve('artifacts/public-registration');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'}),results=[];
 async function run(name,fn,width=1440){
  const context=await browser.newContext({viewport:{width,height:1000}}),p=await context.newPage(),s={mode:'pending',signup:[],resends:[],confirmed:false,owner:false},errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  await context.route('**/*.supabase.co/**',async route=>{
   const req=route.request(),url=new URL(req.url()),send=(body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
   const uid='11111111-1111-4111-8111-111111111111';
   if(url.pathname.endsWith('/signup')){
    const body=req.postDataJSON();s.signup.push({body,redirect:url.searchParams.get('redirect_to')});s.owner=!!body.data?.register_owner;
    if(s.mode==='duplicate')return send({code:'user_already_exists'},422);
    if(s.mode==='malformed')return send({});
    if(s.mode==='smtp')return send({code:'email_address_not_authorized'},403);
    return send({id:uid,email:body.email,identities:s.mode==='opaque'?[]:[{identity_id:uid}]});
   }
   if(url.pathname.endsWith('/resend')){s.resends.push(req.postDataJSON());await new Promise(resolve=>setTimeout(resolve,250));return send({});}
   if(url.pathname.endsWith('/token')){
    if(!s.confirmed)return send({code:'email_not_confirmed'},400);
    const email=req.postDataJSON().email,claims={sub:uid,email,iss:url.origin+'/auth/v1',aud:'authenticated',role:'authenticated',exp:Math.floor(Date.now()/1000)+3600};
    return send({user:{id:uid,email},access_token:'e30.'+Buffer.from(JSON.stringify(claims)).toString('base64url')+'.fixture'});
   }
   if(url.pathname.endsWith('/rpc/rp_api')){
    const body=req.postDataJSON();if(body.p_path==='/session')return send({status:200,body:{id:51,authUserId:uid,nombreCompleto:'Cuenta de prueba',correo:'correo@example.test',rol:s.owner?'DUENO':'CLIENTE',restauranteId:s.owner?7:null}});
    return send({status:503,body:{mensaje:'Consulta fuera del escenario'}});
   }
   return send({},200);
  });
  const account=async(owner=false)=>{await p.goto(app+(owner?'/auth/registro-dueno':'/auth/registro'));await p.getByRole('textbox',{name:'Nombre completo',exact:true}).fill('Cuenta de prueba');await p.getByRole('textbox',{name:'Correo electrónico',exact:true}).fill('correo@example.test');await p.getByLabel('Contraseña',{exact:true}).fill('Fixture9!prueba');};
  const signIn=async()=>{await p.getByRole('textbox',{name:'Correo electrónico',exact:true}).fill('correo@example.test');await p.getByLabel('Contraseña',{exact:true}).fill('Fixture9!prueba');await p.getByRole('button',{name:'Entrar a RestoPilot',exact:true}).click();};
  try{await fn(p,s,{account,signIn});assert.deepEqual(errors,[]);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);assert.deepEqual(await p.evaluate(()=>({local:Object.keys(localStorage),session:Object.keys(sessionStorage)})),{local:[],session:[]});results.push({name,passed:true});console.log('OK '+name);}
  catch(e){console.error(name,p.url().split('#')[0]);await p.screenshot({path:path.join(out,'failure.png'),fullPage:true});throw e;}
  finally{await context.close();}
 }
 try{
  await run('registro cliente pendiente, reenvio y acceso solo despues de confirmar',async(p,s,{account,signIn})=>{await account();await p.getByRole('button',{name:'Crear cuenta',exact:true}).click();await p.waitForURL(u=>u.pathname==='/auth/login'&&u.searchParams.get('registro')==='confirmar-correo');assert.equal(s.signup.length,1);assert.equal(s.signup[0].redirect,app+'/auth/login');await signIn();await p.getByText('Confirma tu correo antes de iniciar sesión.',{exact:true}).waitFor();await p.getByRole('button',{name:'Reenviar confirmación',exact:true}).click();await p.getByText('Si existe un registro pendiente para ese correo, recibirás un enlace de confirmación. Revisa también spam.',{exact:true}).waitFor();assert.equal(s.resends.length,1);assert(await p.getByRole('button',{name:'Reenviar confirmación',exact:true}).isDisabled());s.confirmed=true;await signIn();await p.waitForURL(u=>u.pathname==='/cliente');});
  await run('dueno registra cuenta y restaurante una vez y entra tras confirmar',async(p,s,{account,signIn})=>{await account(true);await p.getByRole('button',{name:'Continuar',exact:true}).click();await p.waitForURL(u=>u.pathname==='/auth/restaurante');assert.equal(s.signup.length,0);for(const [label,value]of [['Nombre del restaurante','Local QA'],['Dirección','Dirección QA'],['Teléfono','000000000'],['Hora de apertura','09:00'],['Hora de cierre','21:00']])await p.getByLabel(label,{exact:true}).fill(value);await p.getByRole('button',{name:'Crear restaurante',exact:true}).click();await p.waitForURL(u=>u.pathname==='/auth/login');assert.equal(s.signup.length,1);assert.equal(s.signup[0].body.data.register_owner,true);assert(!('rol' in s.signup[0].body.data));assert(!('restauranteId' in s.signup[0].body.data));s.confirmed=true;await signIn();await p.waitForURL(u=>u.pathname==='/dueno');});
  await run('duplicado explicito permite corregir correo sin anunciar exito',async(p,s,{account})=>{s.mode='duplicate';await account();await p.getByRole('button',{name:'Crear cuenta',exact:true}).click();await p.getByText('El correo ya está registrado o existe un conflicto con estos datos.',{exact:true}).waitFor();assert.equal(new URL(p.url()).pathname,'/auth/registro');assert(await p.getByRole('textbox',{name:'Correo electrónico',exact:true}).isEnabled());});
  await run('duplicado opaco no anuncia cuenta creada ni inicia sesion',async(p,s,{account})=>{s.mode='opaque';await account();await p.getByRole('button',{name:'Crear cuenta',exact:true}).click();await p.waitForURL(u=>u.pathname==='/auth/login');await p.getByText('Revisa tu correo para confirmar la cuenta y después inicia sesión. Si ya tenías una cuenta, usa tu contraseña actual.',{exact:true}).waitFor();});
  await run('respuesta incompleta no se confunde con confirmacion pendiente',async(p,s,{account})=>{s.mode='malformed';await account();await p.getByRole('button',{name:'Crear cuenta',exact:true}).click();await p.getByText('No pudimos confirmar el registro. Es posible que se haya creado; intenta iniciar sesión antes de volver a enviarlo.',{exact:true}).waitFor();assert.equal(new URL(p.url()).pathname,'/auth/registro');assert(await p.getByRole('button',{name:'Crear cuenta',exact:true}).isDisabled());});
  await run('rechazo del proveedor de correo se explica sin exito falso',async(p,s,{account})=>{s.mode='smtp';await account();await p.getByRole('button',{name:'Crear cuenta',exact:true}).click();await p.getByText('El servicio de correo no permite enviar la confirmación a esta dirección. Contacta con el responsable del restaurante.',{exact:true}).waitFor();assert.equal(new URL(p.url()).pathname,'/auth/registro');});
  await run('retorno limpia tokens y pide verificar mediante login',async(p)=>{await p.goto(app+'/#access_token=fixture-private&refresh_token=fixture-private&type=signup');await p.waitForURL(u=>u.pathname==='/auth/login');assert(!p.url().includes('fixture-private'));await p.getByText('Volviste desde el enlace de correo. Inicia sesión para verificar que tu cuenta está confirmada.',{exact:true}).waitFor();});
  await run('enlace vencido permite solicitar otro mensaje',async(p)=>{await p.goto(app+'/#error=access_denied&error_code=otp_expired&error_description=fixture-private');await p.waitForURL(u=>u.pathname==='/auth/login');assert(!p.url().includes('fixture-private'));await p.getByText('El enlace de confirmación no es válido o ha vencido. Puedes solicitar otro mensaje con tu correo.',{exact:true}).waitFor();await p.getByRole('button',{name:'Reenviar confirmación',exact:true}).waitFor();});
  for(const width of [320,390,768,1440])await run('registro responsive '+width,async(p,s,{account})=>{await account();await p.screenshot({path:path.join(out,'registro-'+width+'.png'),fullPage:true});},width);
  fs.writeFileSync(path.join(out,'resultado.json'),JSON.stringify({date:new Date().toISOString(),type:'controlled-http-browser',results},null,2));console.log('TOTAL '+results.length+' correctas');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
