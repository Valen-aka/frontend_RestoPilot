const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const app=process.env.RP_QA_URL||'http://127.0.0.1:4313',mock=process.env.RP_MOCK_URL||'http://localhost:4314';
for(const url of [app,mock])if(!['localhost','127.0.0.1'].includes(new URL(url).hostname))throw Error('Solo pruebas locales');
const output=path.resolve(process.env.RP_QA_OUTPUT||'artifacts/us15-api');fs.mkdirSync(output,{recursive:true});
async function control(mode='success',reset=false){const r=await fetch(mock+'/api/__test',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode,reset})});assert(r.ok);}
async function calls(){return (await(await fetch(mock+'/api/__test')).json()).calls;}
async function go(page,url){await page.evaluate(url=>{
 const host=document.querySelector('rp-cocina-view')||document.querySelector('rp-carrito-view');
 return ng.getComponent(host).router.navigateByUrl(url);
},url);}
async function login(page,correo='admin@example.test'){
 await page.goto(app+'/cliente/carrito');await page.locator('rp-carrito-view').waitFor();
 await page.evaluate(correo=>new Promise((resolve,reject)=>ng.getComponent(document.querySelector('rp-carrito-view')).auth.login({correo,password:'solo-prueba'}).subscribe({next:()=>resolve(),error:()=>reject(Error('Login de prueba falló'))})),correo);
 await go(page,'/operacion/pedidos');
}
async function ready(page){await page.getByRole('heading',{name:'Cola del restaurante',exact:true}).waitFor();await page.getByRole('button',{name:'Actualizar cola',exact:true}).waitFor();}
async function refresh(page){await page.getByRole('button',{name:'Actualizar cola',exact:true}).click();}
async function ids(page){return page.locator('td[data-order-id]').evaluateAll(nodes=>nodes.map(n=>Number(n.dataset.orderId)));}
async function fits(page){assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'Desbordamiento horizontal');}
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe'}),results=[];
 async function run(name,fn,width=1440){await control('success',true);const context=await browser.newContext({viewport:{width,height:1000}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));try{await fn(page);await fits(page);assert.deepEqual(errors,[]);results.push({name,passed:true});console.log('OK '+name);}
  catch(e){await page.screenshot({path:path.join(output,'failure.png'),fullPage:true});throw e;}finally{await context.close();}}
 try{
  for(const width of [320,390,768,1440])await run('cola, tablero y detalle '+width,async page=>{
   await login(page);await ready(page);assert.deepEqual((await ids(page)).slice(0,2),[901,900]);assert.equal((await ids(page)).length,20);
   await page.getByRole('link',{name:'Ver tablero de cocina',exact:true}).click();await page.locator('rp-cocina-card').first().waitFor();
   assert.equal((await calls()).some(r=>r.method==='PATCH'),false);assert((await page.locator('.max-time').first().innerText()).includes('30 min'));
   await fits(page);await page.screenshot({path:path.join(output,'tablero-'+width+'.png'),fullPage:true});
   await page.getByRole('link',{name:'Consultar pedido #900',exact:true}).click();await page.getByRole('heading',{name:'Pedido #900',exact:true}).waitFor();
   assert(new URL(page.url()).searchParams.get('pedidoId')==='900');assert((await page.locator('.selection-card').innerText()).includes('Plato histórico'));
   assert.equal(await page.getByText('Pagado',{exact:true}).count(),0);assert.equal((await calls()).some(r=>r.method==='PATCH'),false);
   await fits(page);await page.getByRole('link',{name:'Volver al tablero',exact:true}).click();await page.locator('rp-cocina-card').first().waitFor();
   const requests=await calls();assert(requests.length>0&&requests.every(r=>r.method==='GET'&&r.authorized));
  },width);
  await run('paginación y retorno conservan página y tamaño',async page=>{
   await login(page);await ready(page);await go(page,'/operacion/pedidos?page=1&size=10');
   await page.waitForFunction(()=>document.querySelectorAll('td[data-order-id]').length===10&&document.querySelector('td[data-order-id]')?.textContent.trim()==='#910');
   await page.getByRole('link',{name:'Consultar pedido #910',exact:true}).click();await page.getByRole('heading',{name:'Pedido #910',exact:true}).waitFor();
   await page.getByRole('link',{name:'Volver a la cola',exact:true}).click();await ready(page);assert.equal(new URL(page.url()).searchParams.get('size'),'10');assert.equal((await ids(page))[0],910);
   await page.getByRole('button',{name:'Siguiente página',exact:true}).click();await page.waitForFunction(()=>document.querySelectorAll('td[data-order-id]').length===5);
   assert.equal(new URL(page.url()).searchParams.get('page'),'2');
  });
  await run('error de refresco conserva datos y reintento recupera',async page=>{
   await login(page);await ready(page);const before=await ids(page);await control('500');await refresh(page);
   await page.getByText('Se conserva la lectura anterior. Sus datos no están confirmados como actuales.',{exact:true}).waitFor();assert.deepEqual(await ids(page),before);
   await control();await page.getByRole('button',{name:'Volver a consultar',exact:true}).click();await page.locator('.stale-warning').waitFor({state:'detached'});
  });
  for(const mode of ['403','foreign'])await run('acceso restringido '+mode,async page=>{
   await login(page);await ready(page);await control(mode);await refresh(page);await page.getByText('No tienes acceso a los pedidos de este restaurante.',{exact:true}).waitFor();assert.equal((await ids(page)).length,0);
  });
  await run('vacío real y metadatos ausentes sin valores inventados',async page=>{
   await login(page);await ready(page);await control('missing');await go(page,'/operacion/cocina');await page.locator('rp-cocina-card').first().waitFor();
   assert.equal(await page.locator('.max-time').first().innerText(),'Tiempo máximo de plato: No informado');
   await control('empty');await refresh(page);await page.getByRole('heading',{name:'No hay pedidos para preparar',exact:true}).waitFor();
  },390);
  await run('detalle directo LISTO fuera de la cola e ID inválido',async page=>{
   await login(page);await ready(page);await go(page,'/operacion/pedido?pedidoId=990');await page.getByRole('heading',{name:'Pedido #990',exact:true}).waitFor();
   assert.equal(await page.locator('.selection-card .status').innerText(),'Listo');await Promise.all([page.waitForResponse(r=>r.url().endsWith('/pedidos/990')&&r.request().method()==='GET'),page.getByRole('button',{name:'Actualizar pedido',exact:true}).click()]);await page.getByRole('button',{name:'Actualizar pedido',exact:true}).waitFor();
   const before=(await calls()).length;await go(page,'/operacion/pedido?pedidoId=abc');await page.getByText('Selecciona un pedido válido para consultarlo.',{exact:true}).waitFor();assert.equal((await calls()).length,before);
  });
  for(const correo of ['cliente@example.test','sinlocal@example.test'])await run('sin permiso no consulta '+correo,async page=>{
   await login(page,correo);await page.getByText('Acceso restringido. Necesitas una sesión de dueño o administrador con restaurante asignado.',{exact:true}).waitFor();assert.equal((await calls()).length,0);
  });
  await run('sin sesión guarda retorno y logout limpia datos',async page=>{
   await page.goto(app+'/operacion/pedido?pedidoId=900');await page.waitForURL(/\/auth\/login/);assert(new URL(page.url()).searchParams.get('returnUrl').includes('pedidoId=900'));
   await login(page);await ready(page);await page.getByRole('button',{name:'Cerrar sesión',exact:true}).click();await page.waitForURL(/\/auth\/login/);assert.equal(await page.locator('td[data-order-id]').count(),0);
  });
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(results,null,2));console.log(results.length+' recorridos de US15 correctos.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
