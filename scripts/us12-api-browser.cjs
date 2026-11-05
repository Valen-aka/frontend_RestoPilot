const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const app=process.env.RP_QA_URL||'http://127.0.0.1:4311',mock=process.env.RP_MOCK_URL||'http://localhost:4312';
const output=path.resolve(process.env.RP_QA_OUTPUT||'artifacts/us12-api');fs.mkdirSync(output,{recursive:true});
for(const url of [app,mock])if(!['localhost','127.0.0.1'].includes(new URL(url).hostname))throw Error('Solo pruebas locales.');
async function control(readMode='success',reset=true,seed=true){const r=await fetch(mock+'/api/__test',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({readMode,reset,seed})});assert(r.ok);}
async function state(){return(await fetch(mock+'/api/__test')).json();}
async function fits(page){assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'Desbordamiento horizontal');}
async function loginCurrent(page){await page.evaluate(()=>new Promise((resolve,reject)=>{
 const host=document.querySelector('rp-carrito-view')||document.querySelector('rp-pedido-selection-view')||document.querySelector('rp-cliente-pedidos');
 const c=ng.getComponent(host);c.auth.login({correo:'cliente@example.test',password:'solo-pruebas'}).subscribe({next:()=>resolve(),error:()=>reject(new Error('Falló login de prueba'))});
}));}
async function login(page){await page.goto(app+'/cliente/carrito');await page.locator('rp-carrito-view').waitFor();await loginCurrent(page);}
async function go(page,url){await page.evaluate(url=>{
 const host=document.querySelector('rp-carrito-view')||document.querySelector('rp-pedido-selection-view')||document.querySelector('rp-cliente-pedidos');
 return ng.getComponent(host).router.navigateByUrl(url);
},url);}
async function detail(page,id=900){await go(page,'/cliente/pedido?pedidoId='+id);await page.getByRole('heading',{name:'Pedido #'+id,exact:true}).waitFor();}
async function payment(page,id=900){await go(page,'/cliente/pago?pedidoId='+id);await page.locator('.payment-card h2').filter({hasText:'Pedido #'+id}).waitFor();}
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.platform==='win32'?{executablePath:process.env.BROWSER_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe'}:{})});
 const results=[];
 async function run(name,fn,width=1440){
  const context=await browser.newContext({viewport:{width,height:1000}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('http://localhost:8081/api/**',route=>route.continue({url:route.request().url().replace('http://localhost:8081',mock)}));
  try{await control();await login(page);await fn(page);await fits(page);assert.deepEqual(errors,[]);results.push({name,passed:true});console.log('PASS '+name);}
  catch(error){await page.screenshot({path:path.join(output,'failure.png'),fullPage:true});throw new Error(name+': '+error.message,{cause:error});}
  finally{await context.close();}
 }
 try{
  await run('US11 a detalle, pago y retorno conserva ID y total API',async page=>{
   await control('success',true,false);
   await page.evaluate(()=>new Promise((resolve,reject)=>ng.getComponent(document.querySelector('rp-carrito-view')).store.prepareSelection(7,[{platoId:31,cantidad:2,notas:null}]).subscribe({next:resolve,error:reject})));
   await page.getByRole('button',{name:'Elegir cómo disfrutarlo',exact:true}).click();await page.getByRole('radio',{name:'Para llevar',exact:true}).click();
   await page.getByRole('button',{name:'Confirmar pedido',exact:true}).click();await page.getByRole('heading',{name:'Pedido #900',exact:true}).waitFor();
   await page.getByRole('link',{name:'Ver detalle de mi pedido',exact:true}).click();await page.locator('.selection-total').waitFor();
   assert.match(await page.locator('.selection-total').innerText(),/28.00/);
   await page.getByRole('link',{name:'Ver registro de pago',exact:true}).click();await page.locator('.payment-amount').waitFor();
   assert.match(await page.locator('.payment-amount').innerText(),/28.00/);assert(new URL(page.url()).searchParams.get('pedidoId')==='900');
   await page.getByRole('link',{name:'Volver al pedido',exact:true}).click();await page.locator('.selection-total').waitFor();assert.match(await page.locator('.selection-total').innerText(),/28.00/);
  });
  await run('detalle conserva nombre y precio histórico sin consultar carta',async page=>{
   await detail(page);assert.match(await page.locator('table').innerText(),/Plato histórico/);assert.match(await page.locator('table').innerText(),/14.00/);
   assert.match(await page.locator('.order-information').innerText(),/Mesa asignada · ID 19/);
   assert((await state()).queries.every(q=>q.startsWith('/pedidos/')));
   await page.screenshot({path:path.join(output,'detalle-desktop.png'),fullPage:true});
  });
  await run('pago confirmado usa su propio importe, método, referencia y fecha',async page=>{
   await payment(page,901);await page.getByRole('heading',{name:'El registro de tu pago',exact:true}).waitFor();
   assert.match(await page.locator('.payment-amount').innerText(),/15.00/);assert.match(await page.locator('.payment-details').innerText(),/Tarjeta/);
   assert.match(await page.locator('.payment-details').innerText(),/REF-PRUEBA/);assert.match(await page.locator('.payment-details').innerText(),/02\/11\/2026 · 15:00/);
   await page.getByRole('link',{name:'Volver al pedido',exact:true}).click();await page.getByRole('heading',{name:'Pedido #901',exact:true}).waitFor();
   assert.match(await page.locator('.order-information').innerText(),/Calle de prueba 456/);
  },390);
  await run('pendiente sin método ni fecha inventados',async page=>{
   await payment(page);await page.getByRole('heading',{name:'Tu pago está pendiente',exact:true}).waitFor();assert.equal(await page.locator('.payment-details').count(),0);
   assert.match(await page.locator('.information').innerText(),/No se ha elegido un método/);await page.screenshot({path:path.join(output,'pago-pendiente-mobile.png'),fullPage:true});
  },390);
  await run('pendiente con método registrado conserva ese dato sin fecha de pago',async page=>{
   await payment(page,902);await page.getByRole('heading',{name:'Tu pago está pendiente',exact:true}).waitFor();
   assert.match(await page.locator('.payment-details').innerText(),/Efectivo/);assert.doesNotMatch(await page.locator('.payment-details').innerText(),/Registrado/);
  });
  await run('pago ausente revalida propiedad del pedido antes de informar ausencia',async page=>{
   await payment(page,903);await page.getByText('No existe un registro de pago para este pedido.',{exact:true}).waitFor();
   const q=(await state()).queries;assert.equal(q.filter(p=>p==='/pedidos/903').length,2);assert.equal(q.filter(p=>p==='/pedidos/903/pagos').length,1);
  });
  await run('pedido desaparecido durante consulta de pago no revela datos anteriores',async page=>{
   await control('disappear-after-payment');await go(page,'/cliente/pago?pedidoId=900');await page.getByRole('heading',{name:'No se encontró el pedido',exact:true,level:1}).waitFor();
   assert.equal(await page.locator('.payment-card,table').count(),0);assert.doesNotMatch(await page.locator('main').innerText(),/Plato histórico|Pedido #900/);
  });
  for(const id of [904,999])await run('pedido ajeno/inexistente '+id+' no revela información',async page=>{
   await go(page,'/cliente/pedido?pedidoId='+id);await page.getByRole('heading',{name:'No se encontró el pedido',exact:true,level:1}).waitFor();assert.equal(await page.locator('table,.order-information').count(),0);
  });
  for(const mode of ['order-forbidden','pay-forbidden'])await run('acceso restringido '+mode,async page=>{
   await control(mode);await go(page,(mode.startsWith('pay')?'/cliente/pago':'/cliente/pedido')+'?pedidoId=900');
   await page.getByRole('heading',{name:'Acceso restringido',exact:true}).waitFor();assert.equal(await page.locator('table,.payment-card').count(),0);
  });
  for(const mode of ['order-malformed','foreign-body'])await run('respuesta de pedido inválida '+mode,async page=>{
   await control(mode);await go(page,'/cliente/pedido?pedidoId=900');
   await page.getByRole('heading',{name:mode==='foreign-body'?'No se encontró el pedido':'No pudimos mostrar tu pedido',exact:true,level:1}).waitFor();
   assert.equal(await page.locator('table,.order-information').count(),0);
  });
  await run('error de detalle y reintento recuperable',async page=>{
   await control('order-error');await go(page,'/cliente/pedido?pedidoId=900');await page.getByRole('button',{name:'Reintentar consulta',exact:true}).waitFor();
   await control('success',false,false);await page.getByRole('button',{name:'Reintentar consulta',exact:true}).click();await page.getByRole('heading',{name:'Pedido #900',exact:true}).waitFor();
  });
  for(const mode of ['pay-error','pay-malformed','pay-wrong-order'])await run('error de pago no fabrica pendiente '+mode,async page=>{
   await control(mode);await payment(page);await page.getByRole('button',{name:'Reintentar consulta de pago',exact:true}).waitFor();
   assert.equal(await page.locator('.payment-amount,.payment-details,.status-badge').count(),0);
   await control('success',false,false);await page.getByRole('button',{name:'Reintentar consulta de pago',exact:true}).click();await page.getByRole('heading',{name:'Tu pago está pendiente',exact:true}).waitFor();
  });
  await run('ID faltante o inválido no consulta ni usa muestras',async page=>{
   for(const query of ['', '?pedidoId=abc','?pedidoId=0','?pedidoId=900&pedidoId=901']){
    await go(page,'/cliente/pedido'+query);await page.getByRole('heading',{name:'Selecciona un pedido',exact:true}).waitFor();assert.equal(await page.locator('table').count(),0);
   }
   assert.equal((await state()).queries.length,0);
  });
  await run('respuesta anterior no reemplaza la selección nueva',async page=>{
   await control('order-slow');const first=page.waitForRequest(r=>r.url().endsWith('/pedidos/900'));
   await go(page,'/cliente/pedido?pedidoId=900');await first;await detail(page,901);await page.waitForTimeout(1100);
   assert.match(await page.locator('main').innerText(),/Pedido #901/);assert.doesNotMatch(await page.locator('table').innerText(),/Plato histórico\t/);
  });
  await run('carga de pago no anuncia un estado antes de recibirlo',async page=>{
   await control('pay-slow');await payment(page,901);await page.getByText('Consultando el registro de pago…',{exact:true}).waitFor();
   assert.equal(await page.locator('.status-badge,.payment-amount').count(),0);await page.getByRole('heading',{name:'El registro de tu pago',exact:true}).waitFor();
  });
  await run('listado propio y paginación conservan ID al abrir detalle y pago',async page=>{
   await go(page,'/cliente/pedidos');await page.getByRole('link',{name:'Ver pedido 906',exact:true}).waitFor();assert.equal(await page.locator('tbody tr').count(),5);
   await page.getByRole('button',{name:'Página siguiente',exact:true}).click();await page.getByRole('link',{name:'Ver pedido 900',exact:true}).waitFor();assert.equal(await page.locator('tbody tr').count(),1);
   await page.getByRole('link',{name:'Ver pago del pedido 900',exact:true}).click();await page.getByRole('heading',{name:'Tu pago está pendiente',exact:true}).waitFor();
   assert.equal(new URL(page.url()).searchParams.get('pedidoId'),'900');
  },390);
  for(const mode of ['list-empty','list-error','list-foreign'])await run('listado maneja '+mode+' sin otras cuentas ni muestras',async page=>{
   await control(mode);await go(page,'/cliente/pedidos');await page.getByRole('heading',{name:mode==='list-empty'?'Todavía no tienes pedidos':'No pudimos mostrar tus pedidos',exact:true}).waitFor();assert.equal(await page.locator('table').count(),0);
  });
  await run('cierre de sesión retira detalle y una nueva consulta conserva ID de URL',async page=>{
   await detail(page);await page.evaluate(()=>ng.getComponent(document.querySelector('rp-pedido-selection-view')).auth.logout());
   await page.getByRole('heading',{name:'Necesitas una sesión de cliente',exact:true}).waitFor();assert.equal(await page.locator('table').count(),0);
   await loginCurrent(page);await page.getByRole('heading',{name:'Pedido #900',exact:true}).waitFor();await page.reload();
   await page.getByRole('heading',{name:'Necesitas una sesión de cliente',exact:true}).waitFor();await loginCurrent(page);await page.getByRole('heading',{name:'Pedido #900',exact:true}).waitFor();
  });
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(results,null,2));console.log(results.length+' recorridos US12 correctos.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
