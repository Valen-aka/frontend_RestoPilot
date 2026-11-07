const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const app=process.env.RP_APP_URL||'http://127.0.0.1:4365',out=path.resolve('artifacts/us28-api');
fs.mkdirSync(out,{recursive:true});
const page=(content,number=0,size=5,totalElements=content.length)=>({content,number,size,totalElements,totalPages:Math.ceil(totalElements/size)});
const report={mensaje:'Sin actividad',platosMasVendidos:null,horariosMayorDemanda:null,volumenAtenciones:null,ocupacionMesasPorcentaje:null,estadoPagos:null,pedidosAtendidos:null,reservasCompletadas:null};
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.RP_BROWSER_EXECUTABLE?{executablePath:process.env.RP_BROWSER_EXECUTABLE}:{channel:'msedge'})});
 const results=[];
 async function run(name,fn,width=1440){
  const context=await browser.newContext({viewport:{width,height:950}}),p=await context.newPage(),errors=[],s={mode:'list',calls:[],user:51};
  p.on('pageerror',e=>errors.push(e.message));
  await context.route('**/api/**',async route=>{
   const request=route.request(),url=new URL(request.url()),send=(data,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});
   if(url.pathname.endsWith('/auth/login')){
    const body=request.postDataJSON(),rol=body.correo.startsWith('dueno')?'DUENO':'CLIENTE',id=rol==='CLIENTE'?51:70,restauranteId=rol==='CLIENTE'?null:7;
    s.user=id;
    const claims={sub:body.correo,userId:id,rol,restauranteId,exp:Math.floor(Date.now()/1000)+3600};
    return send({mensaje:'Acceso',id,nombreCompleto:'Cuenta de prueba',correo:body.correo,rol,restauranteId,token:'e30.'+Buffer.from(JSON.stringify(claims)).toString('base64url')+'.fixture'});
   }
   if(url.pathname.endsWith('/notificaciones/me')){
    const number=Number(url.searchParams.get('page')),size=Number(url.searchParams.get('size'));
    s.calls.push({number,size,sort:url.searchParams.get('sort'),hasIdentity:url.searchParams.has('usuarioId'),authorized:!!request.headers().authorization});
    if(s.mode==='network')return route.abort('failed');
    if(/^error\d+$/.test(s.mode))return send({mensaje:'Consulta rechazada'},Number(s.mode.slice(5)));
    if(s.mode==='empty')return send(page([],number,size));
    if(s.mode==='slow')await new Promise(resolve=>setTimeout(resolve,600));
    const total=6,start=number*size;
    const content=Array.from({length:Math.max(0,Math.min(size,total-start))},(_,index)=>({id:6-start-index,usuarioId:s.mode==='foreign'?52:s.user,mensaje:s.mode==='foreign'?'SECRETO OTRA CUENTA':`Aviso personal ${6-start-index}`,fechaCreacion:`2026-11-06T14:${String(30-start-index).padStart(2,'0')}:00`}));
    return send(page(content,number,size,total));
   }
   if(url.pathname.includes('/reportes/'))return send(report);
   if(url.pathname.includes('/restaurantes/'))return send({id:7,nombre:'Local de prueba',direccion:null,activo:true,abierto:true,tieneAtencionFisica:true,aceptaDelivery:true,horaApertura:'09:00',horaCierre:'21:00'});
   return send({mensaje:'Fuera del escenario'},501);
  });
  const login=async(owner=false,returnUrl=null)=>{
   await p.goto(app+'/auth/login'+(returnUrl?'?returnUrl='+encodeURIComponent(returnUrl):''));await p.getByRole('textbox',{name:'Correo electrónico',exact:true}).fill(owner?'dueno@example.test':'cliente@example.test');
   await p.getByLabel('Contraseña',{exact:true}).fill('Clave9!prueba');await p.getByRole('button',{name:'Entrar a RestoPilot',exact:true}).click();
   await p.waitForURL(u=>u.pathname===(returnUrl?returnUrl.split('?')[0]:owner?'/dueno':'/cliente'));
  };
  const inbox=async(owner=false,variant=false)=>{
   await login(owner,variant?'/cliente/notificaciones?vista=cliente-notificaciones-vacio':null);
   if(!variant)await p.getByRole('link',{name:'Notificaciones',exact:true}).first().click();
  };
  try{await fn(p,s,{login,inbox});assert.deepEqual(errors,[]);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);results.push({name,passed:true});console.log('OK '+name);}
  catch(error){await p.screenshot({path:path.join(out,'failure.png'),fullPage:true});throw error;}
  finally{await context.close();}
 }
 try{
  await run('sin sesión no consulta bandeja',async(p,s)=>{await p.goto(app+'/cliente/notificaciones');await p.waitForURL(u=>u.pathname==='/auth/login');assert.equal(s.calls.length,0);});
  await run('carga, paginación del servidor, identidad y navbar único',async(p,s,{inbox})=>{s.mode='slow';await inbox();await p.getByText('Consultando tus notificaciones…',{exact:true}).waitFor();await p.getByText('Aviso personal 6',{exact:true}).waitFor();assert.equal(await p.getByRole('navigation',{name:'Navegación de cliente',exact:true}).count(),1);await p.getByRole('button',{name:'Página siguiente',exact:true}).click();await p.getByText('Aviso personal 1',{exact:true}).waitFor();assert.equal(await p.getByText('Aviso personal 6',{exact:true}).count(),0);assert.equal(s.calls.at(-1).number,1);assert(s.calls.every(c=>c.authorized&&!c.hasIdentity&&c.sort==='id,desc'));});
  await run('bandeja vacía de operación consulta su cuenta',async(p,s,{inbox})=>{s.mode='empty';await inbox(true);await p.getByRole('heading',{name:'No tienes notificaciones',exact:true}).waitFor();assert.equal(s.calls.length,1);await p.getByRole('button',{name:'Actualizar',exact:true}).click();await p.getByRole('heading',{name:'No tienes notificaciones',exact:true}).waitFor();assert.equal(s.calls.length,2);});
  await run('variante vacia conserva consulta real y no fuerza el resultado',async(p,s,{inbox})=>{await inbox(false,true);await p.getByText('Aviso personal 6',{exact:true}).waitFor();assert.equal(s.calls.length,1);assert.equal(await p.getByRole('heading',{name:'No tienes notificaciones',exact:true}).count(),0);});
  for(const status of [403,404,500])await run('error HTTP '+status+' y recuperación',async(p,s,{inbox})=>{s.mode='error'+status;await inbox();await p.getByRole('button',{name:'Reintentar consulta',exact:true}).waitFor();s.mode='list';await p.getByRole('button',{name:'Reintentar consulta',exact:true}).click();await p.getByText('Aviso personal 6',{exact:true}).waitFor();});
  await run('401 termina sesión mediante interceptor',async(p,s,{inbox})=>{s.mode='error401';await inbox();await p.waitForURL(u=>u.pathname==='/auth/login');assert.equal(await p.getByText('Aviso personal 6',{exact:true}).count(),0);});
  await run('error de red conserva posibilidad de reintento',async(p,s,{inbox})=>{s.mode='network';await inbox();await p.getByText('No pudimos conectar con el servidor. Revisa tu conexión y vuelve a intentarlo.',{exact:true}).waitFor();s.mode='list';await p.getByRole('button',{name:'Reintentar consulta',exact:true}).click();await p.getByText('Aviso personal 6',{exact:true}).waitFor();});
  await run('rechaza respuesta con avisos de otra cuenta',async(p,s,{inbox})=>{s.mode='foreign';await inbox();await p.getByRole('heading',{name:'No pudimos mostrar tus notificaciones',exact:true}).waitFor();assert.equal(await p.getByText('SECRETO OTRA CUENTA',{exact:true}).count(),0);});
  for(const width of [320,390,768,1440])await run('notificaciones responsive '+width,async(p,s,{inbox})=>{await inbox();await p.getByText('Aviso personal 6',{exact:true}).waitFor();await p.screenshot({path:path.join(out,`notificaciones-${width}.png`),fullPage:true});},width);
  fs.writeFileSync(path.join(out,'resultado.json'),JSON.stringify({date:new Date().toISOString(),type:'controlled-http-browser',results},null,2));console.log('TOTAL '+results.length+' correctas');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
