const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const app=process.env.RP_QA_URL||'http://127.0.0.1:4310',api=process.env.RP_REAL_API;
if(!api||![app,api].every(u=>['localhost','127.0.0.1'].includes(new URL(u).hostname)))throw Error('Requiere servidores locales reales.');
const rid=process.env.RP_RESTAURANT_ID,emptyRid=process.env.RP_EMPTY_RESTAURANT_ID,pid=process.env.RP_DISH_ID,sold=process.env.RP_SOLD_OUT_ID,cid=process.env.RP_CATEGORY_ID,empty=process.env.RP_EMPTY_CATEGORY_ID;
const output=process.env.RP_REAL_OUTPUT||path.join(os.tmpdir(),'restopilot-us10-real');fs.mkdirSync(output,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe'}),results=[];
 try{
 for(const width of [1440,390]){
 const context=await browser.newContext({viewport:{width,height:1000}}),page=await context.newPage(),errors=[],requests=[];
 page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(e.message));
 // Solo redirección de puerto hacia Spring Boot real: no route.fulfill, mocks ni respuestas construidas.
 await page.route('http://localhost:8081/api/**',route=>{requests.push({method:route.request().method(),path:new URL(route.request().url()).pathname});return route.continue({url:route.request().url().replace('http://localhost:8081',api)});});
 async function go(url){await page.evaluate(url=>ng.getComponent(document.querySelector('rp-carta-view')).router.navigateByUrl(url),url);}
 async function fit(){assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);}
 await page.goto(app+'/cliente');await page.getByRole('link',{name:'Ir al inicio de sesión',exact:true}).click();
 await page.getByLabel('Correo electrónico',{exact:true}).fill(process.env.RP_TEST_EMAIL);await page.getByLabel('Contraseña',{exact:true}).fill('incorrecta');await page.getByRole('button',{name:'Entrar a RestoPilot',exact:true}).click();await page.getByRole('status').filter({hasText:'Correo o contraseña incorrectos.'}).waitFor();
 await page.getByLabel('Contraseña',{exact:true}).fill(process.env.RP_TEST_PASSWORD);const before=requests.filter(r=>r.path==='/api/auth/login').length;
 await page.getByRole('button',{name:'Entrar a RestoPilot',exact:true}).evaluate(b=>{b.click();b.click();});await page.getByRole('heading',{name:'Elige un restaurante',exact:true}).waitFor();assert.equal(requests.filter(r=>r.path==='/api/auth/login').length-before,1);
 await page.getByRole('combobox',{name:'Restaurante',exact:true}).click();await page.getByRole('option',{name:'US10 local A',exact:true}).click();await page.getByRole('button',{name:'Consultar carta',exact:true}).click();await page.locator('.dish-card').first().waitFor();assert.equal(await page.locator('.dish-card').count(),2);
 await fit();await page.screenshot({path:path.join(output,'carta-real-'+width+'.png'),fullPage:true});
 await page.getByRole('button',{name:'Sin platos',exact:true}).click();await page.getByRole('heading',{name:'Estamos preparando esta categoría',exact:true}).waitFor();await page.getByRole('button',{name:'Ver toda la carta',exact:true}).click();await page.locator('.dish-card').first().waitFor();
 await page.getByRole('link',{name:'Ver detalle de Plato US10',exact:true}).click();await page.getByRole('button',{name:'No disponible',exact:true}).waitFor();assert(await page.getByRole('button',{name:'No disponible',exact:true}).isDisabled());await page.getByRole('button',{name:'Descubrir otros platos',exact:true}).click();
 await page.getByRole('button',{name:'Principal',exact:true}).click();await page.getByRole('link',{name:'Ver detalle de Plato disponible HTTP US10',exact:true}).click();await page.getByLabel('Cantidad',{exact:true}).fill('0');assert(await page.getByRole('button',{name:/Añadir al pedido/}).isDisabled());await page.getByLabel('Cantidad',{exact:true}).fill('2');await fit();await page.screenshot({path:path.join(output,'detalle-real-'+width+'.png'),fullPage:true});
 await page.getByRole('button',{name:/Añadir al pedido/}).evaluate(b=>{b.click();b.click();});await page.locator('rp-carrito-table').waitFor();assert.match(await page.locator('.selection-total').innerText(),/39.00/);assert.equal(requests.filter(r=>r.method==='POST'&&r.path==='/api/pedidos').length,0);await page.screenshot({path:path.join(output,'carrito-real-'+width+'.png'),fullPage:true});
 await page.getByRole('link',{name:'La carta',exact:true}).click();await page.getByRole('heading',{name:'Elige un restaurante',exact:true}).waitFor();
 await go('/cliente/carta?restauranteId='+emptyRid);await page.getByRole('heading',{name:'Estamos preparando nuestra carta',exact:true}).waitFor();
 await go('/cliente/plato?restauranteId='+rid+'&platoId='+pid+'&vista=cliente-plato-bowl');await page.getByRole('button',{name:'Volver a la recomendación',exact:true}).waitFor();assert.equal(await page.getByLabel('Cantidad',{exact:true}).count(),0);await page.getByRole('button',{name:'Volver a la recomendación',exact:true}).click();assert.equal(new URL(page.url()).searchParams.get('restauranteId'),rid);
 await page.goBack();await page.locator('rp-carta-view').waitFor();await go('/cliente/plato?restauranteId='+rid+'&platoId=999999999');await page.getByRole('alert').filter({hasText:'No se encontró'}).waitFor();
 await go('/cliente/carta?restauranteId='+rid);await page.locator('.dish-card').first().waitFor();await page.getByRole('button',{name:'Cerrar sesión',exact:true}).click();await page.getByRole('heading',{name:'Inicia sesión para consultar la carta',exact:true}).waitFor();assert.equal(await page.locator('.dish-card').count(),0);
 assert.deepEqual(await page.evaluate(()=>({local:Object.keys(localStorage),session:Object.keys(sessionStorage)})),{local:[],session:[]});assert.deepEqual(errors,[]);await fit();results.push({width,passed:true,http:'Spring Boot + JWT + JPA reales; H2 aislado',requests});console.log('PASS E2E HTTP real H2 '+width);await context.close();
 }
 fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(results,null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
