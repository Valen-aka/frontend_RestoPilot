const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const app=process.env.RP_QA_URL||'http://127.0.0.1:4319',mock=process.env.RP_MOCK_URL||'http://localhost:4320';
for(const url of [app,mock])if(!['localhost','127.0.0.1'].includes(new URL(url).hostname))throw Error('Solo pruebas locales');
const output=path.resolve(process.env.RP_QA_OUTPUT||'artifacts/us26-api');fs.mkdirSync(output,{recursive:true});
async function control(mode='success',reset=false){const r=await fetch(mock+'/api/__test',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode,reset})});assert(r.ok);}
async function calls(){return (await(await fetch(mock+'/api/__test')).json()).calls;}
async function go(page,url){return page.evaluate(url=>ng.getComponent(document.querySelector('rp-reserva-expirada-view')||document.querySelector('rp-reserva-atencion-view')||document.querySelector('rp-carrito-view')).router.navigateByUrl(url),url);}
async function login(page,context='client',destination){await page.goto(app+'/cliente/carrito');await page.locator('rp-carrito-view').waitFor();
 await page.evaluate(correo=>new Promise((resolve,reject)=>ng.getComponent(document.querySelector('rp-carrito-view')).auth.login({correo,password:'solo-prueba'}).subscribe({next:()=>resolve(),error:()=>reject(Error('Falló login sintético'))})),context==='client'?'cliente@example.test':'admin@example.test');
 await go(page,destination||(context==='client'?'/cliente/reservas':'/operacion/reservas'));
}
const detail=(context,id)=>context==='client'?'/cliente/reserva?vista=cliente-reserva-expirada&reservaId='+id:'/operacion/reserva?vista=op-reserva-expirada&reservaId='+id;
async function ready(page,id){await page.getByRole('heading',{name:'Reserva #'+id,exact:true}).waitFor();await page.getByRole('button',{name:'Actualizar reservas',exact:true}).waitFor();}
async function fits(page){assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'Desbordamiento horizontal');}
const refresh=page=>page.getByRole('button',{name:'Actualizar reservas',exact:true}).click();
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe'}),results=[];
 async function run(name,fn,width=1440){if(process.env.RP_QA_FILTER&&!name.includes(process.env.RP_QA_FILTER))return;
  await control('success',true);const context=await browser.newContext({viewport:{width,height:1000}});
  // El harness nunca envía credenciales sintéticas ni consultas al backend real.
  await context.route('http://localhost:8081/api/**',route=>route.continue({url:route.request().url().replace('http://localhost:8081',mock)}));
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>{errors.push(e.message);console.error(e.message);});
  try{await fn(page);await fits(page);assert.deepEqual(errors,[]);results.push({name,passed:true});console.log('OK '+name);}
  catch(e){console.error('URL: '+page.url());await page.screenshot({path:path.join(output,'failure.png'),fullPage:true,animations:'disabled'});throw e;}finally{await context.close();}
 }
 try{
  for(const context of ['client','operation'])for(const width of [320,390,768,1440])await run('historial, detalle y mesa libre '+context+' '+width,async page=>{
   await login(page,context);await page.getByRole('heading',{name:'Historial de reservas',exact:true}).waitFor();assert.equal(await page.locator('table tbody tr').count(),4);
   await page.getByRole('link',{name:'Ver reserva 802',exact:true}).click();await ready(page,802);assert.equal(new URL(page.url()).searchParams.get('reservaId'),'802');
   assert.equal(await page.locator('.reservation-card .status').innerText(),'Expirada');assert((await page.locator('.reservation-card').innerText()).includes('10:15'));
   assert((await page.locator('.reservation-card').innerText()).includes('motivo específico no está disponible'));await page.getByRole('button',{name:'Consultar disponibilidad',exact:true}).click();await page.getByText('Mesa disponible para este horario.',{exact:true}).waitFor();
   await fits(page);await page.screenshot({path:path.join(output,'expirada-'+context+'-'+width+'.png'),fullPage:true,animations:'disabled'});
   await page.getByRole('link',{name:context==='client'?'Volver a mis reservas':'Ver reservas',exact:true}).click();await page.getByRole('heading',{name:'Historial de reservas',exact:true}).waitFor();
   await page.waitForFunction(()=>document.activeElement?.id==='expiry-row-802');
   assert((await calls()).every(r=>r.method==='GET'&&r.authorized));
  },width);
  await run('filtros conservan datos reales y selección sin muestras',async page=>{
   await login(page,'client');await page.getByRole('heading',{name:'Historial de reservas',exact:true}).waitFor();
   await page.getByRole('option',{name:'Expirada',exact:true}).click();assert.equal(await page.locator('table tbody tr').count(),1);
   await page.getByRole('link',{name:'Ver reserva 802',exact:true}).click();await ready(page,802);
   await go(page,'/cliente/reserva?vista=cliente-reserva-expirada&id=802');await ready(page,802);
   assert.equal(await page.locator('.reservation-card .status').innerText(),'Expirada');
   await go(page,'/cliente/reserva?vista=cliente-reserva-completada&reservaId=803');await ready(page,803);
   assert.equal(await page.locator('.reservation-card .status').innerText(),'Completada');
   assert.equal(await page.getByRole('button',{name:'Consultar disponibilidad',exact:true}).count(),0);
   const before=(await calls()).length;
   await go(page,'/cliente/reserva?vista=cliente-reserva-expirada&reservaId=abc&id=802');
   await page.getByText('Selecciona una reserva válida para consultarla.',{exact:true}).waitFor();
   assert.equal((await calls()).length,before);assert.equal(await page.locator('.reservation-card').count(),0);
  });
  await run('disponibilidad ocupada o consulta fallida no inventa mesa libre',async page=>{
   await login(page,'client',detail('client',802));await ready(page,802);await control('availability-error');await page.getByRole('button',{name:'Consultar disponibilidad',exact:true}).click();await page.getByText('No pudimos verificar la disponibilidad de esta mesa. Puedes volver a consultarla.',{exact:true}).waitFor();assert.equal(await page.locator('.reservation-card .status').innerText(),'Expirada');
   await control('availability-empty');await page.getByRole('button',{name:'Consultar disponibilidad',exact:true}).click();await page.getByText('No pudimos verificar la disponibilidad de esta mesa. Puedes volver a consultarla.',{exact:true}).waitFor();
   await control('availability-busy');await page.getByRole('button',{name:'Consultar disponibilidad',exact:true}).click();await page.getByText('La mesa tiene otra ocupación para este horario.',{exact:true}).waitFor();
  });
  await run('actualización reconsulta disponibilidad previamente solicitada',async page=>{
   await login(page,'client',detail('client',802));await ready(page,802);await page.getByRole('button',{name:'Consultar disponibilidad',exact:true}).click();await page.getByText('Mesa disponible para este horario.',{exact:true}).waitFor();
   await control('availability-busy');await refresh(page);await page.getByText('La mesa tiene otra ocupación para este horario.',{exact:true}).waitFor();
  });
  await run('confirmada solo cambia a Expirada cuando vuelve a responder la API',async page=>{
   await login(page,'client',detail('client',800));await ready(page,800);assert.equal(await page.locator('.reservation-card .status').innerText(),'Confirmada');assert.equal(await page.getByRole('button',{name:'Consultar disponibilidad',exact:true}).count(),0);
   await control('expire-next');await refresh(page);await page.locator('.reservation-card .status').filter({hasText:'Expirada'}).waitFor();await page.getByRole('button',{name:'Consultar disponibilidad',exact:true}).click();await page.getByText('Mesa disponible para este horario.',{exact:true}).waitFor();assert((await calls()).every(r=>r.method==='GET'));
  });
  await run('error de refresco conserva lectura anterior y recuperar no muta',async page=>{
   await login(page,'client');await page.getByRole('heading',{name:'Historial de reservas',exact:true}).waitFor();await control('500');await refresh(page);await page.getByText('No se pudo actualizar.',{exact:true}).waitFor();assert.equal(await page.locator('table tbody tr').count(),4);
   await control();await page.getByRole('button',{name:'Volver a consultar',exact:true}).click();await page.getByText('No se pudo actualizar.',{exact:true}).waitFor({state:'detached'});assert((await calls()).every(r=>r.method==='GET'));
  });
  for(const context of ['client','operation'])await run('fila ajena elimina la consulta '+context,async page=>{
   await control('foreign-list');await login(page,context);await page.getByRole('heading',{name:'No pudimos completar la consulta',exact:true}).waitFor();assert.equal(await page.locator('table').count(),0);
  });
  await run('fecha ausente no se calcula y conserva la ficha',async page=>{
   await control('missing-date');await login(page,'client',detail('client',802));await ready(page,802);await page.getByText('La fecha de vencimiento no está disponible en esta consulta.',{exact:true}).waitFor();assert.equal(await page.locator('.reservation-card .status').innerText(),'Expirada');
  },390);
  await run('historial vacío, ID inválido y completada directa',async page=>{
   await control('empty');await login(page);await page.getByRole('heading',{name:'No hay reservas',exact:true}).waitFor();await control();
   await go(page,detail('client','abc'));await page.getByText('Selecciona una reserva válida para consultarla.',{exact:true}).waitFor();assert.equal((await calls()).length,1);
   await go(page,detail('client',803));await ready(page,803);assert.equal(await page.locator('.reservation-card .status').innerText(),'Completada');assert.equal(await page.getByRole('button',{name:'Consultar disponibilidad',exact:true}).count(),0);
  });
  await run('recorrido US25 hacia historial conserva Completada e identidad',async page=>{
   await login(page,'operation','/operacion/reserva/llegada?reservaId=800');await page.getByRole('heading',{name:'Reserva #800',exact:true}).waitFor();
   await page.getByRole('button',{name:'Registrar llegada de la reserva #800',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Registrar llegada',exact:true}).click();await page.getByRole('heading',{name:'Disfrutando del servicio',exact:true}).waitFor();
   await page.getByRole('button',{name:'Completar atención de la reserva #800',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Completar atención',exact:true}).click();await page.getByRole('heading',{name:'Una experiencia completada',exact:true}).waitFor();const arrived=await page.locator('.arrival-date').innerText();
   await page.getByRole('link',{name:'Volver a la agenda',exact:true}).click();await page.getByRole('heading',{name:'Historial de reservas',exact:true}).waitFor();await page.getByRole('link',{name:'Ver reserva 800',exact:true}).click();await ready(page,800);
   assert.equal(await page.locator('.reservation-card .status').innerText(),'Completada');assert((await page.locator('.reservation-card').innerText()).includes(arrived));assert.equal((await calls()).filter(r=>r.method==='PATCH').length,2);
  },390);
  await run('sin sesión guarda retorno y perfil incorrecto no consulta',async page=>{
   await page.goto(app+detail('client',802));await page.waitForURL(/\/auth\/login/);assert(new URL(page.url()).searchParams.get('returnUrl').includes('reservaId=802'));
   await login(page,'client','/operacion/reservas');await page.getByText('Acceso restringido. Inicia sesión con el perfil correspondiente a esta consulta.',{exact:true}).waitFor();assert.equal((await calls()).length,0);
  });
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(results,null,2));console.log(results.length+' recorridos HTTP US26 correctos.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
