
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const app=process.env.RP_QA_URL||'http://127.0.0.1:4311',mock=process.env.RP_MOCK_URL||'http://localhost:4312';
const output=path.resolve(process.env.RP_QA_OUTPUT||'artifacts/us13-api');fs.mkdirSync(output,{recursive:true});
for(const url of [app,mock])if(!['localhost','127.0.0.1'].includes(new URL(url).hostname))throw Error('Solo pruebas locales.');
async function control(options={}){const r=await fetch(mock+'/api/__test',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({reset:false,seed:false,...options})});assert(r.ok);}
async function state(){return(await fetch(mock+'/api/__test')).json();}
async function fits(page){assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'Desbordamiento horizontal');}
async function loginCurrent(page){await page.evaluate(()=>new Promise((resolve,reject)=>{
 const c=ng.getComponent(document.querySelector('rp-carrito-view,rp-acceso')||document.querySelector('rp-pedido-selection-view'));
 c.auth.login({correo:'cliente@example.test',password:'solo-pruebas'}).subscribe({next:()=>resolve(),error:()=>reject(Error('Falló login de prueba'))});
}));}
async function go(page,url){await page.evaluate(url=>ng.getComponent(document.querySelector('rp-carrito-view,rp-acceso')||document.querySelector('rp-pedido-selection-view')||document.querySelector('rp-cliente-pedidos')).router.navigateByUrl(url),url);}
async function detail(page,id=900){await go(page,'/cliente/pedido?pedidoId='+id);await page.getByRole('heading',{name:'Pedido #'+id,exact:true}).waitFor();}
const button=page=>page.getByRole('button',{name:'Actualizar seguimiento',exact:true});
async function refresh(page){const id=new URL(page.url()).searchParams.get('pedidoId');const response=page.waitForResponse(r=>new URL(r.url()).pathname==='/api/pedidos/'+id&&r.request().method()==='GET');await button(page).click();await response;await page.getByRole('button',{name:'Actualizar seguimiento',exact:true,disabled:false}).waitFor();await page.getByText('Consulta de seguimiento actualizada.',{exact:true}).waitFor();}
async function snapshot(page){return {table:await page.locator('table').innerText(),total:await page.locator('.selection-total').innerText(),info:await page.locator('.order-information').innerText()};}
const labels={PENDIENTE:'Pendiente',EN_PREPARACION:'En preparación',LISTO:'Listo',ENTREGADO:'Entregado',CANCELADO:'Cancelado'};
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.platform==='win32'?{executablePath:process.env.BROWSER_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe'}:{})});
 const results=[];
 async function run(name,fn,width=1440){const context=await browser.newContext({viewport:{width,height:1000}}),page=await context.newPage(),errors=[],writes=[];
  page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{if(/\/api\/pedidos(?:\/|\?|$)/.test(request.url())&&request.method()!=='GET')writes.push(request.method());});
  await page.route('http://localhost:8081/api/**',route=>route.continue({url:route.request().url().replace('http://localhost:8081',mock)}));
  try{await control({reset:true,seed:true});await page.goto(app+'/cliente/carrito');await page.locator('rp-carrito-view,rp-acceso').waitFor();await loginCurrent(page);
   await fn(page);await fits(page);assert.deepEqual(errors,[]);assert.deepEqual(writes,[],'Seguimiento no debe crear ni cambiar pedidos');results.push({name,passed:true});console.log('PASS '+name);
  }catch(error){await page.screenshot({path:path.join(output,'failure.png'),fullPage:true});throw new Error(name+': '+error.message,{cause:error});}
  finally{await context.close();}
 }
 try{
  for(const width of [320,390,768,1280,1440])await run('preparación a entrega conserva pedido y progreso '+width,async page=>{
   await detail(page);const original=await snapshot(page);assert.equal(await page.locator('.current-status').innerText(),'Pendiente');
   for(const [estado,index]of [['EN_PREPARACION',1],['LISTO',2],['ENTREGADO',3]]){
    await control({tracking:{id:900,estado}});await refresh(page);assert.equal(await page.locator('.current-status').innerText(),labels[estado]);
    assert.equal(await page.locator('.progress li').count(),4);assert.equal(await page.locator('.progress li.reached').count(),index+1);
    assert.equal(await page.locator('.progress li[aria-current="step"]').count(),1);assert.deepEqual(await snapshot(page),original);
    assert.equal(new URL(page.url()).searchParams.get('pedidoId'),'900');await fits(page);
    if(estado==='LISTO'&&[390,1440].includes(width))await page.screenshot({path:path.join(output,'listo-'+width+'.png'),fullPage:true});
   }
   await refresh(page);assert.equal(await page.locator('.current-status').innerText(),'Entregado');
   await button(page).focus();const keyboardResponse=page.waitForResponse(r=>r.url().endsWith('/pedidos/900')&&r.status()===200);await button(page).press('Enter');await keyboardResponse;await page.getByRole('button',{name:'Actualizar seguimiento',exact:true,disabled:false}).waitFor();
   assert(await button(page).evaluate(element=>element===document.activeElement));
   assert.equal(await page.getByRole('link',{name:'Consultar notificaciones',exact:true}).getAttribute('href'),'/cliente/notificaciones');
  },width);
  for(const width of [390,1440])await run('cancelado conserva desglose sin progreso exitoso '+width,async page=>{
   await detail(page);const original=await snapshot(page);await control({tracking:{id:900,estado:'CANCELADO'}});await refresh(page);
   assert.equal(await page.locator('.current-status').innerText(),'Cancelado');assert.equal(await page.locator('.progress').count(),0);
   assert.deepEqual(await snapshot(page),original);await refresh(page);assert.equal(await page.locator('.current-status').innerText(),'Cancelado');
   await page.screenshot({path:path.join(output,'cancelado-'+width+'.png'),fullPage:true});
  },width);
  for(const mode of ['order-error','order-malformed','network'])await run('fallo de actualización informa estado anterior y permite recuperar '+mode,async page=>{
   await detail(page);const original=await snapshot(page);await control({tracking:{id:900,estado:'LISTO'},readMode:mode==='network'?'success':mode});
   if(mode==='network')await page.route('http://localhost:8081/api/pedidos/900',route=>route.abort('failed'));
   await button(page).click();await page.locator('.tracking-error').waitFor();assert.equal(await page.locator('.current-status').innerText(),'Pendiente');
   assert.match(await page.locator('.status-summary').innerText(),/Último estado confirmado/);assert.deepEqual(await snapshot(page),original);
   assert.equal(await page.locator('.progress li.reached').count(),1);assert.equal(await button(page).isDisabled(),false);
   if(mode==='network')await page.unroute('http://localhost:8081/api/pedidos/900');
   await control();await refresh(page);assert.equal(await page.locator('.current-status').innerText(),'Listo');assert.equal(await page.locator('.tracking-error').count(),0);
  },320);
  for(const mode of ['order-unauthorized','order-forbidden','removed','foreign-body'])await run('pérdida de acceso elimina la información '+mode,async page=>{
   await detail(page);await control(mode==='removed'?{removeId:900}:{readMode:mode});await button(page).click();
   const title=mode==='order-unauthorized'?'Inicia sesión para consultar tus pedidos':mode==='order-forbidden'?'Acceso restringido':'No se encontró el pedido';
   await page.getByRole('heading',{name:title,exact:true,level:1}).waitFor();assert.equal(await page.locator('table,.tracking-card,.order-information').count(),0);
   assert.doesNotMatch(await page.locator('main').innerText(),/Plato histórico|Pedido #900/);
  });
  await run('error inicial no anuncia progreso confirmado',async page=>{
   await control({readMode:'order-error'});await go(page,'/cliente/pedido?pedidoId=900');await page.getByRole('button',{name:'Reintentar consulta',exact:true}).waitFor();
   assert.equal(await page.locator('rp-pedido-progress').count(),0);assert.equal(await button(page).count(),0);
   await control({tracking:{id:900,estado:'LISTO'}});await page.getByRole('button',{name:'Reintentar consulta',exact:true}).click();await page.getByRole('heading',{name:'Tu pedido está listo',exact:true}).waitFor();
  });
  await run('doble clic hace una consulta y espera sin adelantar estado',async page=>{
   await detail(page);await control({tracking:{id:900,estado:'LISTO'},readMode:'order-slow'});const before=(await state()).queries.length;
   await button(page).evaluate(b=>{b.click();b.click();});assert(await button(page).isDisabled());assert.equal(await page.locator('.current-status').innerText(),'Pendiente');
   await page.getByText('Consulta de seguimiento actualizada.',{exact:true}).waitFor();assert.equal((await state()).queries.length-before,1);assert.equal(await page.locator('.current-status').innerText(),'Listo');
  });
  await run('respuesta de refresco anterior no reemplaza el pedido seleccionado después',async page=>{
   await detail(page);await control({tracking:{id:900,estado:'LISTO'},readMode:'order-slow'});await button(page).click();await detail(page,901);await page.waitForTimeout(1100);
   assert.equal(await page.locator('.current-status').innerText(),'Entregado');assert.equal(new URL(page.url()).searchParams.get('pedidoId'),'901');assert.match(await page.locator('.tracking-heading').innerText(),/#901/);
  });
  await run('salir durante una actualización impide restaurar datos de la sesión anterior',async page=>{
   await detail(page);await control({tracking:{id:900,estado:'LISTO'},readMode:'order-slow'});await button(page).click();
   await page.evaluate(()=>ng.getComponent(document.querySelector('rp-pedido-selection-view')).auth.logout());
   await page.getByRole('heading',{name:'Necesitas una sesión de cliente',exact:true}).waitFor();await page.waitForTimeout(1100);assert.equal(await page.locator('table').count(),0);
   await loginCurrent(page);await page.getByRole('heading',{name:'Tu pedido está listo',exact:true}).waitFor();
  });
  await run('estado cancelado no fabrica pago o reembolso y se conserva al volver',async page=>{
   await detail(page);await control({tracking:{id:900,estado:'CANCELADO'}});await refresh(page);
   await page.getByRole('link',{name:'Ver registro de pago',exact:true}).click();await page.getByRole('heading',{name:'Tu pago está pendiente',exact:true}).waitFor();
   assert.equal(new URL(page.url()).searchParams.get('pedidoId'),'900');await page.getByRole('link',{name:'Volver al pedido',exact:true}).click();await page.getByRole('heading',{name:'Pedido cancelado',exact:true}).waitFor();
  });
  await run('variantes de URL no fuerzan un estado distinto del que devuelve la API',async page=>{
   for(const vista of ['cliente-pedido-listo','cliente-pedido-entregado','cliente-pedido-cancelado']){
    await go(page,'/cliente/pedido?pedidoId=900&vista='+vista);await page.getByRole('heading',{name:'Pedido #900',exact:true}).waitFor();assert.equal(await page.locator('.current-status').innerText(),'Pendiente');
   }
  });
  await run('volver al listado vuelve a consultar el estado de la misma página',async page=>{
   await go(page,'/cliente/pedidos');await page.getByRole('link',{name:'Ver pedido 906',exact:true}).waitFor();await page.getByRole('button',{name:'Página siguiente',exact:true}).click();
   await page.getByRole('link',{name:'Ver pedido 900',exact:true}).click();await page.getByRole('heading',{name:'Pedido #900',exact:true}).waitFor();
   await control({tracking:{id:900,estado:'LISTO'}});await refresh(page);await page.getByRole('link',{name:'← Volver a mis pedidos',exact:true}).click();
   await page.getByRole('link',{name:'Ver pedido 900',exact:true}).waitFor();assert.match(await page.locator('tbody tr').filter({hasText:'#900'}).innerText(),/Listo/);
  });
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(results,null,2));console.log(results.length+' recorridos US13 correctos.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
