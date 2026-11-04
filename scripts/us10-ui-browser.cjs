const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const app=process.env.RP_QA_URL||'http://127.0.0.1:4310';
if(!['localhost','127.0.0.1'].includes(new URL(app).hostname))throw Error('Solo navegador de prueba local.');
const output=path.resolve(process.env.RP_QA_OUTPUT||path.join(os.tmpdir(),'restopilot-us10-qa'));
fs.mkdirSync(output,{recursive:true});
// Fixtures explícitos del harness, nunca importados por la aplicación.
const restaurant={id:7,nombre:'La Mesa Verde',direccion:'Lima',activo:true,abierto:true,tieneAtencionFisica:true,aceptaDelivery:true,horaApertura:null,horaCierre:null};
const categories=[{id:2,restauranteId:7,nombre:'Platos de fondo',descripcion:'Nuestros clásicos, a tu mesa.'},{id:3,restauranteId:7,nombre:'Bebidas',descripcion:null}];
const dishes=[['Lomo saltado',38,'Wok, tradición y el punto perfecto.','lomo'],['Ají de gallina',28,'La receta de casa, con un toque nuestro.','aji'],['Bowl de la huerta',26,'Vegetales de estación y quinua.','bowl'],['Arroz con mariscos',36,'Arroz al wok con mariscos seleccionados.','lomo']].map(([nombre,precio,descripcion,img],i)=>({id:31+i,restauranteId:7,categoriaId:2,categoriaNombre:'Cocina peruana',nombre,precio,descripcion,ingredientes:'Lomo, tomate, cebolla, papas, arroz y sillao.',alergenos:'Soya y gluten.',complejidad:null,tiempoPreparacionMinutos:[15,10,5,15][i],disponible:true,imagenUrl:app+'/__qa/'+img+'.svg',creadoEn:'2026-11-04T10:00:00',actualizadoEn:null}));
const variants=[['cliente-inicio','/cliente?restauranteId=7'],['cliente-carta','/cliente/carta?restauranteId=7'],['cliente-carta-categoria','/cliente/carta?restauranteId=7&categoriaId=2&vista=cliente-carta-categoria'],['cliente-carta-vacia','/cliente/carta?restauranteId=7&categoriaId=3&vista=cliente-carta-vacia'],['cliente-plato','/cliente/plato?restauranteId=7&platoId=31'],['cliente-plato-agotado','/cliente/plato?restauranteId=7&platoId=32&vista=cliente-plato-agotado'],['cliente-plato-bowl','/cliente/plato?restauranteId=7&platoId=33&vista=cliente-plato-bowl']];
const results=[];
async function fits(page){assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'Desbordamiento horizontal');}
async function navigate(page,url){await page.evaluate(url=>ng.getComponent(document.querySelector('rp-carta-view')).page().router.navigateByUrl(url),url);}
async function login(page){await page.evaluate(()=>new Promise((resolve,reject)=>ng.getComponent(document.querySelector('rp-carta-view')).auth.login({correo:'cliente@example.test',password:'solo-pruebas'}).subscribe({next:()=>resolve(),error:()=>reject(Error('login de prueba falló'))})));}
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.platform==='win32'?{executablePath:process.env.BROWSER_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe'}:{})});
 async function run(name,fn,width=1440,url=variants[1][1]){
  const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage(),errors=[],calls=[];
  const mode={delay:0,status:200,empty:false,brokenImage:false,long:false,closed:false,soldOut:false,noRestaurants:false,missing:false,expiry:3600,subject:9};
  page.setDefaultTimeout(10000);
  page.on('pageerror',e=>errors.push(e.message));
  await page.route(app+'/__qa/**',route=>new URL(route.request().url()).pathname.endsWith('missing.png')?route.fulfill({status:404,body:''}):route.fulfill({contentType:'image/svg+xml',path:path.join(__dirname,'fixtures/us10',new URL(route.request().url()).pathname.split('/').pop())}));
  await page.route('**/api/**',async route=>{
   const request=route.request(),p=new URL(request.url()).pathname;calls.push({path:p,method:request.method()});
   if(p==='/api/auth/login'){
    const claims={userId:mode.subject,sub:'cliente@example.test',rol:'CLIENTE',exp:Math.floor(Date.now()/1000)+mode.expiry};
    return route.fulfill({json:{id:mode.subject,nombreCompleto:'Cliente de prueba',correo:claims.sub,rol:'CLIENTE',token:'test.'+Buffer.from(JSON.stringify(claims)).toString('base64url')+'.test'}});
   }
   assert(request.headers().authorization?.startsWith('Bearer '),'Falta interceptor de sesión');
   if(mode.delay)await new Promise(r=>setTimeout(r,mode.delay));
   if(mode.status!==200)return route.fulfill({status:mode.status,json:{mensaje:'Error simulado'}}).catch(()=>{});
   const list=dishes.map(d=>({...d,disponible:!(mode.soldOut&&d.id===32),nombre:mode.long?d.nombre+' con una descripción de nombre extremadamente extensa '.repeat(5):d.nombre,imagenUrl:mode.brokenImage?app+'/__qa/missing.png':d.imagenUrl}));
   let data;
   if(p==='/api/restaurantes')data=mode.noRestaurants?[]:[restaurant];
   else if(p==='/api/restaurantes/7')data={...restaurant,abierto:!mode.closed};
   else if(p==='/api/categorias/restaurante/7')data=categories;
   else if(p==='/api/platos/restaurante/7')data=mode.empty?[]:list;
   else if(/^\/api\/platos\/\d+$/.test(p)){data=list.find(d=>d.id===Number(p.split('/').pop()));if(mode.missing&&data)data={...data,ingredientes:null,alergenos:null,tiempoPreparacionMinutos:null,descripcion:null,imagenUrl:null};else if(data?.id===33)data={...data,descripcion:'Una opción de nuestra carta para disfrutar los vegetales de estación.',ingredientes:'Quinua, verduras de estación, palta, aceite de oliva y sésamo.',alergenos:'Sésamo.'};else if(data?.id===31)data={...data,descripcion:'Lomo salteado al wok, tomate, cebolla y papas, acompañado de arroz.'};}
   else if(p==='/api/mesas/restaurante/7')data=[];
   else throw Error('Endpoint inesperado en US10: '+p);
   return route.fulfill({json:data}).catch(()=>{});
  });
  try{
   await page.goto(app+url);await page.locator('rp-carta-view').waitFor();
   await fn(page,mode,calls);await fits(page);assert.deepEqual(errors,[]);results.push({name,passed:true});console.log('PASS '+name);
  }catch(error){await page.screenshot({path:path.join(output,'failure.png'),fullPage:true});throw Error(name+': '+error.message,{cause:error});}
  finally{await context.close();}
 }
 try{
  for(const width of [1440,390])for(const [slug,url]of variants)await run(slug+' '+width,async(page,mode)=>{
   mode.soldOut=slug==='cliente-plato-agotado';await login(page);await page.locator('.state-card mat-spinner').waitFor({state:'hidden'});
   await page.evaluate(()=>document.fonts.ready);await fits(page);
   if(slug.includes('vacia')){assert.equal(await page.locator('.dish-card').count(),0);await page.getByRole('heading',{name:'Estamos preparando esta categoría'}).waitFor();}
   else if(slug.includes('bowl')){assert.equal(await page.getByLabel('Cantidad',{exact:true}).count(),0);await page.getByRole('button',{name:'Volver a la recomendación',exact:true}).waitFor();}
   else if(slug.includes('agotado'))assert(await page.getByRole('button',{name:'No disponible',exact:true}).isDisabled());
   else if(slug==='cliente-plato')await page.getByLabel('Cantidad',{exact:true}).waitFor();
   else assert.equal(await page.locator('.dish-card').count(),4);
   const imgs=await page.locator('rp-carta-view img').evaluateAll(es=>es.map(e=>({src:e.getAttribute('src'),loaded:e.complete&&e.naturalWidth>0,width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height})));
   assert(imgs.every(i=>i.loaded&&i.width>0&&i.height>0));
   if(slug==='cliente-inicio'){const hero=imgs.find(i=>i.src.includes('inicio'));assert.equal(hero.width,width===390?210:340);assert.equal(hero.height,width===390?178.5:289);}
   await page.screenshot({path:path.join(output,slug+'-'+width+'.png'),fullPage:true});
   fs.writeFileSync(path.join(output,slug+'-'+width+'-geometry.json'),JSON.stringify(imgs,null,2));
  },width,url);
  await run('selección de restaurante y categorías reales',async(page)=>{
   await login(page);await page.getByRole('combobox',{name:'Restaurante',exact:true}).click();await page.getByRole('option',{name:'La Mesa Verde',exact:true}).click();await page.getByRole('button',{name:'Consultar carta',exact:true}).click();await page.locator('.dish-card').first().waitFor();
   assert.equal(new URL(page.url()).searchParams.get('restauranteId'),'7');await page.getByRole('button',{name:'Bebidas',exact:true}).click();await page.getByRole('heading',{name:'Estamos preparando esta categoría'}).waitFor();await page.getByRole('button',{name:'Ver toda la carta',exact:true}).click();await page.locator('.dish-card').first().waitFor();assert.equal(await page.locator('.dish-card').count(),4);
  },390,'/cliente');
  await run('detalle, validación, doble clic y continuidad US11',async(page,mode,calls)=>{
   await login(page);await page.getByRole('link',{name:'Ver detalle de Lomo saltado',exact:true}).click();await page.getByLabel('Cantidad',{exact:true}).fill('0');assert(await page.getByRole('button',{name:/Añadir al pedido/}).isDisabled());await page.getByLabel('Cantidad',{exact:true}).fill('2');mode.delay=200;
   await page.getByRole('button',{name:/Añadir al pedido/}).evaluate(b=>{b.click();b.click();});await page.locator('rp-carrito-table').waitFor();assert.match(await page.locator('.selection-total').innerText(),/76.00/);assert.equal(calls.filter(c=>c.path==='/api/mesas/restaurante/7').length,1);assert.equal(calls.filter(c=>c.method==='POST'&&!c.path.endsWith('/login')).length,0);
  });
  await run('más de tarjeta prepara una unidad',async page=>{await login(page);await page.getByRole('button',{name:'Añadir Lomo saltado al pedido',exact:true}).click();await page.locator('rp-carrito-table').waitFor();assert.match(await page.locator('.selection-total').innerText(),/38.00/);},390);
  await run('salir durante selección HTTP no navega tarde al carrito',async(page,mode)=>{
   await login(page);await page.locator('.dish-card').first().waitFor();mode.delay=700;await page.getByRole('button',{name:'Añadir Lomo saltado al pedido',exact:true}).click();await page.getByRole('navigation',{name:'Navegación del cliente'}).getByRole('link',{name:'Inicio',exact:true}).click();await page.waitForTimeout(1000);assert.equal(new URL(page.url()).pathname,'/cliente');assert.equal(await page.locator('rp-carrito-table').count(),0);
  });
  await run('logout retira catálogo y descarta HTTP pendiente',async(page,mode)=>{
   await login(page);await page.locator('.dish-card').first().waitFor();mode.delay=600;await page.getByRole('button',{name:'Platos de fondo',exact:true}).click();await page.getByRole('button',{name:'Cerrar sesión',exact:true}).click();await page.getByRole('heading',{name:'Inicia sesión para consultar la carta'}).waitFor();await page.waitForTimeout(800);assert.equal(await page.locator('.dish-card').count(),0);
  },390);
  for(const status of [401,403,404,500])await run('error HTTP '+status+' no equivale a vacío',async(page,mode)=>{mode.status=status;await login(page);await page.getByRole(status===401?'heading':'alert').filter({hasText:status===401?'Inicia sesión':status===403?'permiso':status===404?'No se encontró':'No pudimos'}).waitFor();assert.equal(await page.locator('.empty').count(),0);assert.equal(await page.locator('.dish-card').count(),0);});
  await run('error de red, reintento y carga accesible',async(page,mode)=>{mode.status=500;await login(page);await page.getByRole('button',{name:'Reintentar',exact:true}).waitFor();mode.status=200;mode.delay=300;await page.getByRole('button',{name:'Reintentar',exact:true}).click();await page.getByRole('status').filter({hasText:'Cargando'}).waitFor();await page.locator('.dish-card').first().waitFor();});
  await run('URL vista vacía no fuerza vacío ni agotado',async page=>{await login(page);await page.locator('.dish-card').first().waitFor();assert.equal(await page.locator('.empty').count(),0);await navigate(page,'/cliente/plato?restauranteId=7&platoId=31&vista=cliente-plato-agotado');await page.getByLabel('Cantidad',{exact:true}).waitFor();},390,'/cliente/carta?restauranteId=7&vista=cliente-carta-vacia');
  await run('bowl vuelve conservando restaurante sin comprar',async page=>{await login(page);await page.getByRole('button',{name:'Volver a la recomendación',exact:true}).click();assert.equal(new URL(page.url()).searchParams.get('restauranteId'),'7');assert.equal(new URL(page.url()).searchParams.get('vista'),'cliente-ia-recomendaciones');},390,variants[6][1]);
  for(const width of [320,768,1024])await run('texto largo y teclado '+width,async(page,mode)=>{mode.long=true;await login(page);await page.locator('.dish-card').first().waitFor();await page.keyboard.press('Tab');assert(await page.evaluate(()=>document.activeElement!==document.body));await fits(page);},width);
  await run('restaurante cerrado impide compra',async(page,mode)=>{mode.closed=true;await login(page);await page.locator('.dish-card').first().waitFor();assert(await page.getByRole('button',{name:'Añadir Lomo saltado al pedido',exact:true}).isDisabled());});
  await run('sesión vencida retira platos y acciones',async(page,mode)=>{
   mode.expiry=2;await login(page);await page.locator('.dish-card').first().waitFor();await page.getByRole('heading',{name:'Inicia sesión para consultar la carta'}).waitFor();assert.equal(await page.locator('.dish-card').count(),0);
  });
  await run('cambio de identidad oculta datos y reconsulta',async(page,mode)=>{
   await login(page);await page.locator('.dish-card').first().waitFor();mode.subject=10;mode.delay=500;await login(page);assert.equal(await page.locator('.dish-card').count(),0);await page.locator('.dish-card').first().waitFor();assert.equal(await page.evaluate(()=>ng.getComponent(document.querySelector('rp-carta-view')).auth.session().subject),'10');
  });
  await run('consulta de categoría obsoleta no reaparece',async(page,mode)=>{
   await login(page);await page.locator('.dish-card').first().waitFor();mode.delay=800;await page.getByRole('button',{name:'Bebidas',exact:true}).click();await page.getByRole('status').filter({hasText:'Cargando'}).waitFor();mode.delay=0;await navigate(page,'/cliente/carta?restauranteId=7&categoriaId=2');await page.locator('.dish-card').first().waitFor();await page.waitForTimeout(1000);assert.equal(await page.locator('.dish-card').count(),4);assert.equal(await page.locator('.empty').count(),0);
  });
  await run('imagen fallida no usa sustituto ficticio',async(page,mode)=>{mode.brokenImage=true;await login(page);await page.locator('.dish-card').first().waitFor();await page.waitForFunction(()=>document.querySelectorAll('.dish-image .no-image').length===4);assert.equal(await page.locator('.dish-image img').count(),0);});
  await run('campos ausentes no generan garantías alimentarias',async(page,mode)=>{mode.missing=true;await login(page);await page.locator('.detail-card').waitFor();assert.equal(await page.locator('.detail-card dd').allTextContents().then(a=>a.join('|')),'No informados.|No informados.|No informada.');await page.getByText('Imagen no disponible',{exact:true}).waitFor();},390,variants[6][1]);
  await run('sin restaurantes es vacío independiente del catálogo',async(page,mode)=>{mode.noRestaurants=true;await login(page);await page.getByRole('heading',{name:'No hay restaurantes disponibles'}).waitFor();assert.equal(await page.locator('.dish-card').count(),0);},390,'/cliente');
  await run('IDs inválidos no consultan API de catálogo',async(page,mode,calls)=>{await login(page);await page.getByRole('alert').filter({hasText:'identificadores válidos'}).waitFor();assert.equal(calls.filter(c=>c.path!=='/api/auth/login').length,0);},1440,'/cliente/plato?restauranteId=7&platoId=0');
  await run('teclado abre detalle, foco visible y reflujo a 720px',async page=>{
   await login(page);const link=page.getByRole('link',{name:'Ver detalle de Lomo saltado',exact:true});await link.focus();assert.equal(await link.evaluate(e=>getComputedStyle(e).outlineStyle),'solid');await page.keyboard.press('Enter');await page.getByLabel('Cantidad',{exact:true}).waitFor();await fits(page);
  },720);
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({simulation:true,results},null,2));console.log(results.length+' recorridos DOM/HTTP simulados correctos. Evidencia: '+output);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
