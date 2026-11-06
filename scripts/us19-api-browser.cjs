const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const app=process.env.RP_QA_URL||'http://127.0.0.1:4315',mock=process.env.RP_MOCK_URL||'http://localhost:4316';
for(const url of [app,mock])if(!['localhost','127.0.0.1'].includes(new URL(url).hostname))throw Error('Solo pruebas locales');
const output=path.resolve(process.env.RP_QA_OUTPUT||'artifacts/us19-api');fs.mkdirSync(output,{recursive:true});
async function control(mode='success',reset=false){const r=await fetch(mock+'/api/__test',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode,reset})});assert(r.ok);}
async function calls(){return (await(await fetch(mock+'/api/__test')).json()).calls;}
async function writes(){return (await calls()).filter(r=>r.method==='PATCH');}
async function go(page,url){return page.evaluate(url=>ng.getComponent(document.querySelector('rp-cocina-view')||document.querySelector('rp-carrito-view,rp-acceso')).router.navigateByUrl(url),url);}
async function login(page){await page.goto(app+'/cliente/carrito');await page.locator('rp-carrito-view,rp-acceso').waitFor();
 await page.evaluate(()=>new Promise((resolve,reject)=>ng.getComponent(document.querySelector('rp-carrito-view,rp-acceso')).auth.login({correo:'admin@example.test',password:'solo-prueba'}).subscribe({next:()=>resolve(),error:()=>reject(Error('Falló acceso sintético'))})));
 await go(page,'/operacion/pedido?pedidoId=901');await page.getByRole('heading',{name:'Pedido #901',exact:true}).waitFor();
}
const button=(page,label,id=901)=>page.getByRole('button',{name:label+' del pedido #'+id,exact:true});
async function confirm(page,label,id=901){await button(page,label,id).click();await page.getByRole('dialog').getByRole('button',{name:label,exact:true}).click();}
async function fits(page){assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'Desbordamiento horizontal');}
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe'}),results=[];
 async function run(name,fn,width=1440){if(process.env.RP_QA_FILTER&&!name.includes(process.env.RP_QA_FILTER))return;await control('success',true);const context=await browser.newContext({viewport:{width,height:1000}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>{errors.push(e.message);console.error('ERROR NAVEGADOR: '+e.message);});try{await fn(page);await fits(page);assert.deepEqual(errors,[]);results.push({name,passed:true});console.log('OK '+name);}
  catch(e){console.error('URL de prueba: '+page.url());console.error('Errores: '+errors.join(' | '));await page.screenshot({path:path.join(output,'failure.png'),fullPage:true,animations:'disabled'});throw e;}finally{await context.close();}}
 try{
  for(const width of [320,390,768,1440])await run('preparación, listo, entrega y consulta final '+width,async page=>{
   await login(page);const before=await page.locator('.selection-card').innerText();
   await button(page,'Iniciar preparación').click();await page.getByRole('dialog').waitFor();await fits(page);
   await page.screenshot({path:path.join(output,'confirmacion-'+width+'.png'),fullPage:true,animations:'disabled'});
   await page.getByRole('dialog').getByRole('button',{name:'Iniciar preparación',exact:true}).click();
   await page.getByRole('heading',{name:'Preparación del pedido #901',exact:true}).waitFor();
   await confirm(page,'Marcar listo');await page.getByRole('heading',{name:'Pedido listo para entregar',exact:true}).waitFor();
   await confirm(page,'Registrar entrega');await page.getByRole('heading',{name:'Entrega del pedido',exact:true}).waitFor();
   assert.equal(await page.locator('.selection-card .status').innerText(),'Entregado');assert.equal(await page.locator('rp-pedido-action button').count(),0);
   assert((await page.locator('.selection-card').innerText()).includes('S/ 28.00'));assert(before.includes('Plato histórico'));
   const patches=await writes();assert.equal(patches.length,3);assert.deepEqual(patches.map(p=>new URLSearchParams(p.query).get('nuevoEstado')),['EN_PREPARACION','LISTO','ENTREGADO']);
   await go(page,'/operacion/pedidos');await page.getByRole('heading',{name:'Cola del restaurante',exact:true}).waitFor();
   assert.equal(await page.locator('td[data-order-id="901"]').count(),0);await page.getByRole('link',{name:'Consultar pedido seleccionado',exact:true}).click();
   await page.getByRole('heading',{name:'Entrega del pedido',exact:true}).waitFor();
   await page.screenshot({path:path.join(output,'entregado-'+width+'.png'),fullPage:true,animations:'disabled'});
  },width);
  await run('cancelar devuelve foco y no envía cambios',async page=>{
   await login(page);await button(page,'Iniciar preparación').focus();await page.keyboard.press('Enter');
   await page.getByRole('dialog').getByRole('button',{name:'Volver sin cambios',exact:true}).click();await page.getByRole('dialog').waitFor({state:'detached'});
   await page.waitForFunction(()=>document.activeElement?.getAttribute('aria-label')==='Iniciar preparación del pedido #901');assert.equal((await writes()).length,0);
   assert.equal(await page.locator('.selection-card .status').innerText(),'Pendiente');
  },390);
  await run('doble clic y salida durante envío no duplican ni abandonan acción',async page=>{
   await login(page);await control('slow');await button(page,'Iniciar preparación').click();
   await page.getByRole('dialog').getByRole('button',{name:'Iniciar preparación',exact:true}).dblclick();
   assert.equal(await go(page,'/operacion/cocina'),false);
   await page.getByRole('heading',{name:'Preparación del pedido #901',exact:true}).waitFor();assert.equal((await writes()).length,1);
  });
  for(const mode of ['reject400','reject409'])await run('rechazo y estado concurrente '+mode,async page=>{
   await login(page);await control(mode);await confirm(page,'Iniciar preparación');
   await page.locator('#kitchen-action-feedback').filter({hasText:'Estado consultado:'}).waitFor();
   assert.equal(await page.locator('.selection-card .status').innerText(),mode==='reject400'?'Listo':'En preparación');
   assert.equal((await writes()).length,1);assert.equal(new URL(page.url()).pathname,'/operacion/pedido');
  });
  for(const mode of ['lost','bad-contract'])await run('respuesta incierta consulta antes de otro avance '+mode,async page=>{
   await login(page);await control(mode);await confirm(page,'Iniciar preparación');
   await page.locator('#kitchen-action-feedback').filter({hasText:'Estado consultado: En preparación'}).waitFor();
   assert.equal((await writes()).length,1);assert.equal(await page.locator('.selection-card .status').innerText(),'En preparación');
   assert.equal(new URL(page.url()).pathname,'/operacion/pedido');
  });
  await run('respuesta y consulta perdidas bloquean hasta verificar explícitamente',async page=>{
   await login(page);await control('lost-unavailable');await confirm(page,'Iniciar preparación');
   await page.locator('#kitchen-action-feedback').filter({hasText:'La consulta también falló'}).waitFor();
   assert(await button(page,'Iniciar preparación').isDisabled());await control();await page.getByRole('button',{name:'Verificar estado',exact:true}).click();
   await page.locator('#kitchen-action-feedback').filter({hasText:'Estado consultado: En preparación'}).waitFor();assert.equal((await writes()).length,1);
   assert.equal(await button(page,'Marcar listo').isEnabled(),true);
  },390);
  await run('éxito con fallo de refresco no repite cambio',async page=>{
   await login(page);await control('queue-fail');await confirm(page,'Iniciar preparación');
   await page.getByRole('heading',{name:'Preparación del pedido #901',exact:true}).waitFor();
   await page.getByText('El estado del pedido ya fue consultado, pero no se pudo actualizar la cola. Puedes volver a consultarla sin repetir el cambio.',{exact:true}).waitFor();
   assert((await page.locator('#kitchen-action-feedback').innerText()).includes('confirmado'));assert.equal((await writes()).length,1);
   await control();await page.getByRole('link',{name:'Consultar cola',exact:true}).click();await page.getByRole('heading',{name:'Cola del restaurante',exact:true}).waitFor();assert.equal((await writes()).length,1);
  });
  for(const mode of ['patch403','patch404'])await run('rechazo de acceso no conserva pedido '+mode,async page=>{
   await login(page);await control(mode);await confirm(page,'Iniciar preparación');
   await page.getByRole('heading',{name:'No pudimos mostrar la cola',exact:true}).waitFor();assert.equal(await page.locator('.selection-card').count(),0);assert.equal((await writes()).length,1);
  });
  await run('acción en tablero conserva selección Listo fuera de cola',async page=>{
   await login(page);await go(page,'/operacion/cocina');await page.locator('rp-cocina-card mat-card[data-order-id="900"]').waitFor();
   await confirm(page,'Marcar listo',900);await page.getByRole('heading',{name:'Pedido listo para entregar',exact:true}).waitFor();await go(page,'/operacion/cocina');await page.getByRole('link',{name:'Consultar pedido seleccionado',exact:true}).waitFor();
   assert.equal(await page.locator('rp-cocina-card mat-card[data-order-id="900"]').count(),0);
   await page.getByRole('link',{name:'Consultar pedido seleccionado',exact:true}).click();await page.getByRole('heading',{name:'Pedido listo para entregar',exact:true}).waitFor();await page.waitForFunction(()=>{const button=document.querySelector('button[aria-label="Registrar entrega del pedido #900"]');return button&&!button.disabled;});assert.equal(await button(page,'Registrar entrega',900).isEnabled(),true);
  });
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(results,null,2));console.log(results.length+' recorridos HTTP de US19 correctos.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
