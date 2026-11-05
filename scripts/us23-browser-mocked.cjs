// Pruebas DOM con HTTP SIMULADO: no acreditan integración con Spring Boot.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const base=process.env.US23_FRONTEND||'http://127.0.0.1:4200';
let checks=0;const check=(v,m)=>{assert(v,m);checks++;};
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const errors=[];
 async function fixture(role='ADMINISTRADOR'){
  const context=await browser.newContext({viewport:{width:390,height:1004}}),page=await context.newPage();
  const state={items:[{id:1,restauranteId:7,nombre:'Entradas',descripcion:'Inicial',creadoEn:'2026-11-04T12:00:00',actualizadoEn:null}],listStatus:200,writeStatus:200,reads:0,writes:0,delay:false,pending:[]};
  page.on('pageerror',e=>errors.push(e.message));
  await context.route('http://localhost:8081/api/**',async route=>{
   const req=route.request(),url=new URL(req.url());
   const respond=async(status,body)=>{await route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)}).catch(()=>{});};
   if(url.pathname==='/api/auth/login'){
    const token='test.'+Buffer.from(JSON.stringify({userId:1,sub:'test@example.test',rol:role,restauranteId:7,exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')+'.test';
    return respond(200,{id:1,nombreCompleto:'Fixture DOM',correo:'test@example.test',rol:role,restauranteId:7,token});
   }
   if(url.pathname==='/api/restaurantes/7')return respond(200,{id:7,nombre:'Fixture DOM',activo:true,abierto:true,tieneAtencionFisica:true,aceptaDelivery:true});
   if(req.method()==='GET'){
    state.reads++;if(state.delay){state.pending.push(()=>respond(state.listStatus,state.items));return;}
    return respond(state.listStatus,state.listStatus===200?state.items:{mensaje:'Error simulado'});
   }
   state.writes++;
   if(state.delay){state.pending.push(()=>respond(200,{...state.items[0],...req.postDataJSON()}));return;}
   return respond(state.writeStatus,state.writeStatus===200?{...state.items[0],...req.postDataJSON()}:{mensaje:'Error simulado'});
  });
  const spa=async url=>{await page.evaluate(url=>{history.pushState(null,'',url);dispatchEvent(new PopStateEvent('popstate'));},url);};
  await page.goto(base+'/auth/login?returnUrl=/operacion/categorias');await page.getByLabel('Correo electrónico').fill('test@example.test');await page.getByLabel('Contraseña',{exact:true}).fill('Prueba123!');await page.getByRole('button',{name:'Entrar a RestoPilot'}).click();
  if(role==='CLIENTE')await spa('/operacion/categorias');
  return {page,context,state,spa};
 }
 try{
  const f=await fixture();const {page,state}=f;
  await page.getByRole('link',{name:'Editar Entradas',exact:true}).waitFor();
  state.listStatus=500;await f.spa('/operacion/categorias?revision=1');await page.getByRole('alert').filter({hasText:'No pudimos consultar'}).waitFor();check(await page.locator('table').count()===0,'Error no se presenta como vacío');
  state.listStatus=200;state.items=[];await page.getByRole('button',{name:'Reintentar',exact:true}).click();await page.getByText('Todavía no hay categorías.',{exact:false}).waitFor();check(true,'Vacío recuperable');
  state.items=[{id:1,restauranteId:7,nombre:'Entradas',descripcion:'Inicial'}];state.delay=true;
  await page.getByRole('link',{name:'＋ Nueva categoría'}).click();await page.getByText('Cargando categorías…').waitFor();check(true,'Carga visible');
  state.delay=false;await f.spa('/operacion/categorias');await page.getByRole('link',{name:'Editar Entradas',exact:true}).waitFor();
  for(const respond of state.pending.splice(0))await respond();check(await page.getByRole('heading',{name:'Una carta bien organizada'}).count()===1,'Consulta tardía no restaura formulario abandonado');
  await page.getByRole('button',{name:'Eliminar Entradas',exact:true}).click();await page.getByRole('dialog').waitFor();await page.keyboard.press('Escape');await page.getByRole('dialog').waitFor({state:'hidden'});
  check(await page.getByRole('button',{name:'Eliminar Entradas',exact:true}).evaluate(e=>document.activeElement===e),'Foco vuelve al disparador al cancelar');
  await page.getByRole('link',{name:'Editar Entradas',exact:true}).click();await page.getByLabel('Nombre',{exact:true}).fill('Modificada');
  state.delay=true;const before=state.writes;await page.getByRole('button',{name:'Guardar categoría →'}).click();await page.getByRole('button',{name:'Guardando…'}).waitFor();
  check(await page.getByRole('button',{name:'Guardando…'}).isDisabled(),'Botón deshabilitado durante envío');
  await page.locator('form').evaluate(form=>{form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));});check(state.writes===before+1,'Doble submit DOM no duplica petición');
  state.delay=false;await page.getByRole('link',{name:'Cancelar',exact:true}).click();await page.getByRole('heading',{name:'Una carta bien organizada'}).waitFor();for(const respond of state.pending.splice(0))await respond();
  check(!page.url().includes('editar'),'Respuesta tardía no navega tras cancelar');
  await page.getByRole('link',{name:'Editar Entradas',exact:true}).click();await page.getByLabel('Nombre',{exact:true}).fill('Sin confirmación');state.writeStatus=500;
  await page.getByRole('button',{name:'Guardar categoría →'}).click();await page.getByRole('button',{name:'Consultar listado',exact:true}).waitFor();
  check(await page.getByRole('button',{name:'Guardar categoría →'}).isDisabled(),'Respuesta incierta bloquea repetición');
  await page.getByRole('button',{name:'Consultar listado',exact:true}).click();await page.getByRole('heading',{name:'Una carta bien organizada'}).waitFor();check(true,'Recuperación muestra listado visible');
  state.listStatus=401;await f.spa('/operacion/categorias?revision=2');await page.getByRole('heading',{name:'Acceso restringido'}).waitFor();check(await page.locator('table').count()===0,'401 elimina datos y sesión');await f.context.close();
  const denied=await fixture('CLIENTE');await denied.page.getByRole('heading',{name:'Acceso restringido'}).waitFor();check(denied.state.reads===0&&denied.state.writes===0,'Cliente no consulta ni modifica en UI de gestión');await denied.context.close();
  check(errors.length===0,'Sin errores JS: '+errors.join(';'));
  console.log('US23 DOM con HTTP SIMULADO: '+checks+' verificaciones correctas.');
 }catch(error){console.error(error.message);process.exitCode=1;}finally{await browser.close();}
})();
