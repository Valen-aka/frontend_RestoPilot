const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const app=process.env.RP_QA_URL||'http://127.0.0.1:4317',mock=process.env.RP_MOCK_URL||'http://localhost:4318';
for(const url of [app,mock])if(!['localhost','127.0.0.1'].includes(new URL(url).hostname))throw Error('Solo pruebas locales');
const output=path.resolve(process.env.RP_QA_OUTPUT||'artifacts/us25-api');fs.mkdirSync(output,{recursive:true});
async function control(mode='success',reset=false){const r=await fetch(mock+'/api/__test',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode,reset})});assert(r.ok);}
async function calls(){return (await(await fetch(mock+'/api/__test')).json()).calls;}
async function writes(){return (await calls()).filter(r=>r.method==='PATCH');}
async function go(page,url){return page.evaluate(url=>ng.getComponent(document.querySelector('rp-reserva-atencion-view')||document.querySelector('rp-carrito-view')).router.navigateByUrl(url),url);}
async function login(page,correo='admin@example.test',url='/operacion/reserva/llegada?reservaId=800'){
 await page.goto(app+'/cliente/carrito');await page.locator('rp-carrito-view').waitFor();
 await page.evaluate(correo=>new Promise((resolve,reject)=>ng.getComponent(document.querySelector('rp-carrito-view')).auth.login({correo,password:'solo-prueba'}).subscribe({next:()=>resolve(),error:()=>reject(Error('Falló acceso sintético'))})),correo);
 await go(page,url);
}
async function ready(page,id=800){await page.getByRole('heading',{name:'Reserva #'+id,exact:true}).waitFor();await page.getByRole('button',{name:'Actualizar reserva',exact:true}).waitFor();}
const action=(page,label,id=800)=>page.getByRole('button',{name:label+' de la reserva #'+id,exact:true});
async function confirm(page,label,id=800){await action(page,label,id).click();await page.getByRole('dialog').getByRole('button',{name:label,exact:true}).click();}
async function fits(page){assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'Desbordamiento horizontal');}
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe'}),results=[];
 async function run(name,fn,width=1440){if(process.env.RP_QA_FILTER&&!name.includes(process.env.RP_QA_FILTER))return;
  await control('success',true);const context=await browser.newContext({viewport:{width,height:1000}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>{errors.push(e.message);console.error('ERROR NAVEGADOR: '+e.message);});
  try{await fn(page);await fits(page);assert.deepEqual(errors,[]);results.push({name,passed:true});console.log('OK '+name);}
  catch(e){console.error('URL: '+page.url());await page.screenshot({path:path.join(output,'failure.png'),fullPage:true,animations:'disabled'});throw e;}finally{await context.close();}
 }
 try{
  for(const width of [320,390,768,1440])await run('llegada, finalización y fechas '+width,async page=>{
   await login(page);await ready(page);await action(page,'Registrar llegada').click();await page.getByRole('dialog').waitFor();
   await fits(page);await page.screenshot({path:path.join(output,'llegada-dialogo-'+width+'.png'),fullPage:true,animations:'disabled'});
   await page.getByRole('dialog').getByRole('button',{name:'Registrar llegada',exact:true}).click();await page.getByRole('heading',{name:'Disfrutando del servicio',exact:true}).waitFor();
   assert.equal(await page.locator('.reservation-card .status').innerText(),'Confirmada');const arrival=await page.locator('.arrival-date').innerText();assert(arrival.includes('10:05'));
   await confirm(page,'Completar atención');await page.getByRole('heading',{name:'Una experiencia completada',exact:true}).waitFor();
   assert.equal(await page.locator('.arrival-date').innerText(),arrival);assert(await page.locator('.completion-date').isVisible());assert.equal(await page.locator('.attendance-action').count(),0);
   assert.equal(new URL(page.url()).searchParams.get('reservaId'),'800');assert.equal(new URL(page.url()).searchParams.get('vista'),'op-reserva-completada');
   await page.getByRole('button',{name:'Actualizar reserva',exact:true}).click();await ready(page);assert.equal(await page.locator('.reservation-card .status').innerText(),'Completada');
   const changed=await writes();assert.deepEqual(changed.map(r=>r.path),['/reservas/800/llegada','/reservas/800/completar']);assert(changed.every(r=>r.authorized));
   await page.screenshot({path:path.join(output,'completada-'+width+'.png'),fullPage:true,animations:'disabled'});
  },width);
  await run('cancelar devuelve foco y no registra llegada',async page=>{
   await login(page);await ready(page);await action(page,'Registrar llegada').focus();await page.keyboard.press('Enter');
   await page.getByRole('dialog').getByRole('button',{name:'Volver sin cambios',exact:true}).click();await page.getByRole('dialog').waitFor({state:'detached'});
   await page.waitForFunction(()=>document.activeElement?.getAttribute('aria-label')==='Registrar llegada de la reserva #800');assert.equal((await writes()).length,0);
  },390);
  await run('doble clic y navegación durante envío no duplican operación',async page=>{
   await login(page);await ready(page);await control('slow');await action(page,'Registrar llegada').click();await page.getByRole('dialog').getByRole('button',{name:'Registrar llegada',exact:true}).dblclick();
   assert.equal(await go(page,'/operacion/reservas'),false);await page.getByRole('heading',{name:'Disfrutando del servicio',exact:true}).waitFor();assert.equal((await writes()).length,1);
  });
  await run('finalización anticipada deshabilitada hasta actualizar reloj del servidor',async page=>{
   await control('early');await login(page);await ready(page);await confirm(page,'Registrar llegada');await page.getByRole('heading',{name:'Disfrutando del servicio',exact:true}).waitFor();
   assert(await action(page,'Completar atención').isDisabled());assert.equal((await writes()).length,1);
   await control();await page.getByRole('button',{name:'Actualizar reserva',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.attendance-action')?.disabled===false);
   await confirm(page,'Completar atención');await page.getByRole('heading',{name:'Una experiencia completada',exact:true}).waitFor();assert.equal((await writes()).length,2);
  });
  for(const mode of ['reject400','reject409','expired'])await run('rechazo y consulta autoritativa '+mode,async page=>{
   await login(page);await ready(page);await control(mode);await confirm(page,'Registrar llegada');await page.locator('#attendance-feedback').filter({hasText:'Situación consultada:'}).waitFor();
   assert.equal((await writes()).length,1);assert.equal(await page.locator('.reservation-card .status').innerText(),mode==='expired'?'Expirada':'Confirmada');
   if(mode!=='expired')assert(await page.locator('.arrival-date').isVisible());assert.equal(new URL(page.url()).pathname,'/operacion/reserva/llegada');
  });
  for(const mode of ['lost','bad-contract'])await run('respuesta incierta se consulta sin repetir '+mode,async page=>{
   await login(page);await ready(page);await control(mode);await confirm(page,'Registrar llegada');await page.locator('#attendance-feedback').filter({hasText:'con llegada registrada'}).waitFor();
   assert.equal((await writes()).length,1);await page.getByRole('link',{name:'Consultar situación actual',exact:true}).click();await page.getByRole('heading',{name:'Disfrutando del servicio',exact:true}).waitFor();
  });
  await run('respuesta y consulta perdidas bloquean hasta verificar',async page=>{
   await login(page);await ready(page);await control('lost-unavailable');await confirm(page,'Registrar llegada');await page.locator('#attendance-feedback').filter({hasText:'La consulta también falló'}).waitFor();
   assert(await action(page,'Registrar llegada').isDisabled());await control();await page.getByRole('button',{name:'Verificar situación',exact:true}).click();
   await page.locator('#attendance-feedback').filter({hasText:'con llegada registrada'}).waitFor();assert.equal((await writes()).length,1);
  },390);
  await run('refresco posterior fallido conserva la llegada confirmada',async page=>{
   await login(page);await ready(page);await control('refresh-fail');await confirm(page,'Registrar llegada');await page.getByText('Se conserva la lectura anterior; las acciones están bloqueadas hasta actualizarla.',{exact:true}).waitFor();
   assert(await page.locator('.arrival-date').isVisible());assert.equal((await writes()).length,1);await control();await page.getByRole('button',{name:'Volver a consultar',exact:true}).click();await page.locator('.warning strong').filter({hasText:'No se pudo actualizar'}).waitFor({state:'detached'});
  });
  for(const mode of ['patch403','patch404','read400','foreign'])await run('acceso denegado o recurso no disponible '+mode,async page=>{
   await login(page);await ready(page);await control(mode);
   if(mode.startsWith('patch'))await confirm(page,'Registrar llegada');else await page.getByRole('button',{name:'Actualizar reserva',exact:true}).click();
   await page.getByRole('heading',{name:'No pudimos mostrar la reserva',exact:true}).waitFor();assert.equal(await page.locator('.reservation-card').count(),0);
  });
  await run('sin metadatos se muestran datos pero no se inventan permisos',async page=>{
   await control('missing');await login(page);await ready(page);assert(await action(page,'Registrar llegada').isDisabled());assert.equal(await page.locator('.clock').count(),0);assert.equal((await writes()).length,0);
  },390);
  await run('ID inválido y reserva completada directa no disparan mutaciones',async page=>{
   await login(page);await ready(page);await go(page,'/operacion/reserva/llegada?reservaId=abc');await page.getByText('Selecciona una reserva válida para consultarla.',{exact:true}).waitFor();
   const callsBefore=(await calls()).length;assert.equal(callsBefore,1);
   await go(page,'/operacion/reserva?vista=op-reserva-completada&reservaId=803');await page.getByRole('heading',{name:'Una experiencia completada',exact:true}).waitFor();assert.equal(await page.locator('.attendance-action').count(),0);assert.equal((await writes()).length,0);
  });
  for(const correo of ['cliente@example.test','sinlocal@example.test'])await run('sin permisos no consulta '+correo,async page=>{
   await login(page,correo);await page.getByText('Acceso restringido. Necesitas una sesión de dueño o administrador con restaurante asignado.',{exact:true}).waitFor();assert.equal((await calls()).length,0);
  });
  await run('retorno al login y detalle ajeno a US25 conserva su ruta',async page=>{
   await page.goto(app+'/operacion/reserva/llegada?reservaId=800');await page.waitForURL(/\/auth\/login/);assert(new URL(page.url()).searchParams.get('returnUrl').includes('reservaId=800'));
   await page.goto(app+'/operacion/reserva');await page.waitForURL(url=>url.pathname==='/operacion/reserva');assert.equal((await calls()).length,0);
  });
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(results,null,2));console.log(results.length+' recorridos HTTP US25 correctos.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
