const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const app=process.env.RP_QA_URL||'http://127.0.0.1:4311';
const mock=process.env.RP_MOCK_URL||'http://localhost:4312';
const output=path.resolve(process.env.RP_QA_OUTPUT||'artifacts/us11-api');
for(const url of [app,mock])if(!['localhost','127.0.0.1'].includes(new URL(url).hostname))throw Error('Solo entornos locales de prueba.');
fs.mkdirSync(output,{recursive:true});
const results=[];
async function control(mode='success',reset=true){const r=await fetch(mock+'/api/__test',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode,reset})});assert(r.ok);}
async function state(){return (await fetch(mock+'/api/__test')).json();}
async function fits(page){assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'Desbordamiento horizontal');}
async function login(page){
 await page.goto(app+'/cliente/carrito');await page.locator('rp-carrito-view').waitFor();
 // Solo harness de desarrollo: llama al servicio real mediante el componente de US11.
 // No modifica la pantalla de acceso asignada a otra tarea ni introduce un acceso de prueba en producción.
 await page.evaluate(()=>new Promise((resolve,reject)=>{
   const c=ng.getComponent(document.querySelector('rp-carrito-view'));
   c.auth.login({correo:'cliente@example.test',password:'solo-pruebas'}).subscribe({next:()=>resolve(),error:()=>reject(new Error('Falló el login de prueba'))});
 }));
}
async function prepare(page,modality='LLEVAR'){
 await login(page);
 await page.evaluate(()=>new Promise((resolve,reject)=>{
   const c=ng.getComponent(document.querySelector('rp-carrito-view'));
   c.store.prepareSelection(7,[{platoId:31,cantidad:2,notas:null}]).subscribe({next:()=>resolve(),error:()=>reject(new Error('Falló la selección HTTP'))});
 }));
 await page.getByLabel('Cantidad de Plato de prueba',{exact:true}).waitFor();
 assert.match(await page.locator('.selection-total').innerText(),/25.00/);
 await page.getByRole('button',{name:'Elegir cómo disfrutarlo',exact:true}).click();
 const label={LLEVAR:'Para llevar',SALON:'En salón',DELIVERY:'Delivery',RECOGER:'Recoger'}[modality];
 if(modality!=='SALON')await page.getByRole('radio',{name:label,exact:true}).click();
 if(modality==='SALON'){
   await page.getByRole('combobox',{name:'Mesa',exact:true}).click();
   await page.getByRole('option',{name:'Mesa 4 · 4 personas',exact:true}).click();
 }
 if(modality==='DELIVERY')await page.getByLabel('Dirección de entrega',{exact:true}).fill('  Avenida 123  ');
}
(async()=>{
 const launch={headless:true};
 if(process.platform==='win32')launch.executablePath=process.env.BROWSER_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe';
 const browser=await chromium.launch(launch);
 async function run(name,fn,width=1440){
   const context=await browser.newContext({viewport:{width,height:1000}}),page=await context.newPage();
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   // La URL de producción no cambia: solo el tráfico de este navegador de prueba se dirige a la simulación local.
   await page.route('http://localhost:8081/api/**',route=>route.continue({url:route.request().url().replace('http://localhost:8081',mock)}));
   try{await control();await fn(page);await fits(page);assert.deepEqual(errors,[]);results.push({name,passed:true});console.log('PASS '+name);}
   catch(error){await page.screenshot({path:path.join(output,'failure.png'),fullPage:true});throw new Error(name+': '+error.message,{cause:error});}
   finally{await context.close();}
 }
 try{
   for(const modality of ['SALON','LLEVAR','RECOGER','DELIVERY'])await run('registro '+modality,async page=>{
     await prepare(page,modality);await fits(page);
     await page.getByRole('button',{name:'Confirmar pedido',exact:true}).click();
     await page.getByRole('heading',{name:'Pedido #900',exact:true}).waitFor();
     assert.match(await page.locator('.center-card').innerText(),/28.00/);
     const s=await state();assert.equal(s.calls.length,1);assert.equal(s.orders.length,1);
     assert.equal(s.calls[0].mesaId,modality==='SALON'?19:null);
     assert.equal(s.calls[0].direccionEntrega,modality==='DELIVERY'?'Avenida 123':null);
     assert.equal('total'in s.calls[0],false);assert.equal('clienteId'in s.calls[0],false);
     assert(new URL(page.url()).searchParams.get('pedidoId')==='900');
     await page.screenshot({path:path.join(output,'confirmacion-'+modality+'.png'),fullPage:true});
   },modality==='DELIVERY'?390:1440);
   await run('doble clic produce un solo POST',async page=>{
     await prepare(page);await control('slow');
     await page.getByRole('button',{name:'Confirmar pedido',exact:true}).evaluate(b=>{b.click();b.click();});
     await page.getByRole('heading',{name:'Pedido #900',exact:true}).waitFor();assert.equal((await state()).calls.length,1);
   });
   await run('rechazo conserva borrador y permite corregir sin éxito ficticio',async page=>{
     await prepare(page);await control('reject');await page.getByRole('button',{name:'Confirmar pedido',exact:true}).click();
     await page.getByRole('alert').filter({hasText:'El plato se encuentra agotado.'}).waitFor();
     assert.equal((await state()).orders.length,0);assert.equal(await page.getByRole('heading',{name:'Pedido #900',exact:true}).count(),0);
     assert.match(await page.locator('.selection-total').innerText(),/25.00/);
     await control('success',false);await page.getByRole('button',{name:'Confirmar pedido',exact:true}).click();
     await page.getByRole('heading',{name:'Pedido #900',exact:true}).waitFor();assert.equal((await state()).calls.length,2);
   },390);
   for(const mode of ['malformed','html500'])await run('resultado incierto '+mode+' bloquea repetición',async page=>{
     await prepare(page);await control(mode);await page.getByRole('button',{name:'Confirmar pedido',exact:true}).click();
     await page.getByRole('alert').filter({hasText:'No pudimos confirmar el resultado.'}).waitFor();
     assert(await page.getByRole('button',{name:'Confirmar pedido',exact:true}).isDisabled());
     assert.equal(await page.getByRole('heading',{name:'Pedido #900',exact:true}).count(),0);assert.equal((await state()).calls.length,1);
   });
   await run('401 retira la sesión y el borrador',async page=>{
     await prepare(page);await control('unauthorized');await page.getByRole('button',{name:'Confirmar pedido',exact:true}).click();
     await page.getByRole('link',{name:'Ir al inicio de sesión',exact:true}).waitFor();
     assert.equal(await page.locator('rp-carrito-table').count(),0);
   });
   await run('logout y recarga retiran la sesión, sin credenciales persistidas',async page=>{
     await prepare(page);
     assert.deepEqual(await page.evaluate(()=>({local:Object.keys(localStorage),session:Object.keys(sessionStorage)})),{local:[],session:[]});
     await page.evaluate(()=>ng.getComponent(document.querySelector('rp-carrito-view')).auth.logout());
     await page.getByRole('link',{name:'Ir al inicio de sesión',exact:true}).waitFor();
     assert.equal(await page.locator('rp-carrito-table').count(),0);
     await login(page);await page.reload();await page.getByRole('link',{name:'Ir al inicio de sesión',exact:true}).waitFor();
   },390);
   fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(results,null,2));console.log(results.length+' recorridos HTTP simulados correctos.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
