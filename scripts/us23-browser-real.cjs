// Browser -> Angular -> Spring Boot/JWT/JPA/H2. No respuestas HTTP simuladas.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),out=path.join(root,'docs/evidencias/us23');fs.mkdirSync(out,{recursive:true});
const base=process.env.US23_FRONTEND||'http://127.0.0.1:4200',api=process.env.US23_API;
if(!api||!process.env.US23_EMAIL||!process.env.US23_PASSWORD)throw Error('Ejecutar mediante el test H2 Us23HttpIntegrationTest.');
let checks=0;const check=(v,message)=>{assert(v,message);checks++;};
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const errors=[];const calls=[];
 const context=await browser.newContext({viewport:{width:1440,height:900}});
 // Solo cambia el puerto del servidor: route.continue conserva HTTP real y JWT.
 await context.route('http://localhost:8081/api/**',route=>route.continue({url:api+new URL(route.request().url()).pathname+new URL(route.request().url()).search}));
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(r.url().includes('/api/categorias'))calls.push({method:r.method(),url:new URL(r.url()).pathname});});
 const waitList=async()=>{await page.getByRole('heading',{name:'Una carta bien organizada'}).waitFor();await page.locator('table tbody tr').first().waitFor();};
 const login=async(returnUrl='/operacion/categorias')=>{
  await page.goto(base+'/auth/login?returnUrl='+encodeURIComponent(returnUrl));
  await page.getByLabel('Correo electrónico').fill(process.env.US23_EMAIL);await page.getByLabel('Contraseña',{exact:true}).fill(process.env.US23_PASSWORD);
  await page.getByRole('button',{name:'Entrar a RestoPilot'}).click();
 };
 const screenshot=async name=>{await page.evaluate(async()=>{await document.fonts.ready;await Promise.all(document.getAnimations().filter(a=>a.playState==='running').map(a=>a.finished.catch(()=>{})));});await page.screenshot({path:path.join(out,name+'.png'),fullPage:true});};
 const noOverflow=async()=>{const geometry=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,items:[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1&&getComputedStyle(e).position==='absolute').map(e=>({tag:e.tagName,cls:e.className,x:e.getBoundingClientRect().x,w:e.getBoundingClientRect().width}))}));check(geometry.scroll<=geometry.width,'Sin overflow horizontal: '+JSON.stringify(geometry));};
 try{
  await login();await waitList();check(await page.locator('table tbody tr').count()===3,'Lista real con tres categorías');
  check(await page.locator('.live .logo img').evaluate(img=>img.complete&&img.naturalWidth>0&&Math.round(img.getBoundingClientRect().width)===48&&Math.round(img.getBoundingClientRect().height)===48),'Asset local cargado y geometría 48x48');
  for(const width of [1440,390]){
   await page.setViewportSize({width,height:width===1440?900:1004});const suffix=width===1440?'desktop':'mobile';
   await screenshot('listado-'+suffix);await noOverflow();
   await page.getByRole('link',{name:'＋ Nueva categoría'}).click();await page.getByLabel('Nombre',{exact:true}).waitFor();await screenshot('nueva-'+suffix);
   let before=calls.filter(r=>r.method==='POST').length;
   await page.getByRole('button',{name:'Guardar categoría →'}).click();await page.getByText('Ingresa un nombre para la categoría.').waitFor();check(calls.filter(r=>r.method==='POST').length===before,'Vacío no envía POST');
   await page.getByLabel('Nombre',{exact:true}).fill('   ');await page.getByRole('button',{name:'Guardar categoría →'}).click();check(calls.filter(r=>r.method==='POST').length===before,'Espacios no envían POST');
   await page.getByLabel('Nombre',{exact:true}).fill('x'.repeat(101));await page.getByRole('button',{name:'Guardar categoría →'}).click();await page.getByText('El nombre admite hasta 100 caracteres.').waitFor();
   await page.getByRole('link',{name:'Cancelar',exact:true}).click();await waitList();
   await page.getByRole('link',{name:'Editar Platos de fondo',exact:true}).click();await page.getByLabel('Nombre',{exact:true}).waitFor();
   check(await page.getByLabel('Nombre',{exact:true}).inputValue()==='Platos de fondo','Carga de edición real');await screenshot('editar-'+suffix);await noOverflow();
   await page.getByRole('link',{name:'Cancelar',exact:true}).click();await waitList();
   await page.getByRole('button',{name:'Eliminar Platos de fondo',exact:true}).click();await page.getByRole('dialog').waitFor();await screenshot('modal-'+suffix);
   const beforeDelete=calls.filter(r=>r.method==='DELETE').length;
   await page.keyboard.press('Escape');await page.getByRole('dialog').waitFor({state:'hidden'});check(calls.filter(r=>r.method==='DELETE').length===beforeDelete,'Escape cancela sin DELETE');
   await waitList();
   // URL canónica de eliminación dentro de la misma sesión, como navegación del historial.
   await page.evaluate(id=>{history.pushState(null,'','/operacion/categoria/eliminar?categoriaId='+id);dispatchEvent(new PopStateEvent('popstate'));},process.env.US23_CATEGORY_ID);
   await page.getByRole('heading',{name:'Eliminar categoría',exact:true}).waitFor();await page.getByRole('heading',{name:'¿Eliminar Platos de fondo?'}).waitFor();
   await screenshot('eliminar-'+suffix);await noOverflow();
   await page.getByRole('button',{name:'Eliminar categoría',exact:true}).click();await page.getByRole('alert').filter({hasText:'datos asociados'}).waitFor();check(true,'409 conserva categoría y comunica restricción');
   await page.getByRole('button',{name:'Volver',exact:true}).click();await waitList();
  }
  await page.setViewportSize({width:1440,height:900});
  await page.getByRole('link',{name:'＋ Nueva categoría'}).click();await page.getByLabel('Nombre',{exact:true}).fill('US23 temporal');await page.getByLabel('Descripción (opcional)').fill('Creada desde Angular');
  await page.getByRole('button',{name:'Guardar categoría →'}).click();await waitList();await page.getByRole('link',{name:'Editar US23 temporal',exact:true}).waitFor();check(true,'Creación real refleja lista');
  await page.getByRole('link',{name:'Editar US23 temporal',exact:true}).click();await page.getByLabel('Nombre',{exact:true}).fill('US23 editada');await page.getByLabel('Descripción (opcional)').fill('');
  await page.getByRole('button',{name:'Guardar categoría →'}).click();await waitList();await page.getByRole('link',{name:'Editar US23 editada',exact:true}).waitFor();check(true,'Edición persiste y vuelve a lista');
  await page.getByRole('button',{name:'Eliminar US23 editada',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Eliminar categoría',exact:true}).click();await page.getByRole('dialog').waitFor({state:'hidden'});await waitList();
  check(await page.locator('table tbody tr').count()===3,'Eliminación confirmada quita solo categoría temporal');
  for(const width of [320,768,1024]){await page.setViewportSize({width,height:900});await noOverflow();}
  await page.setViewportSize({width:1440,height:900});
  await page.getByRole('button',{name:'Cerrar sesión →'}).click();await page.getByRole('button',{name:'Entrar a RestoPilot'}).waitFor();
  await page.goto(base+'/operacion/categorias');await page.getByRole('heading',{name:'Acceso restringido'}).waitFor();check(await page.locator('table').count()===0,'Sin sesión no muestra datos anteriores');
  check(errors.length===0,'Sin errores JavaScript: '+errors.join('; '));
  fs.writeFileSync(path.join(out,'resultado.json'),JSON.stringify({environment:'Angular + Spring Boot + JWT + JPA/H2 aislado (no PostgreSQL)',checks,categoriasHttpRequests:calls.length,viewports:[1440,390,320,768,1024],screenshots:10,errors},null,2)+'\n');
  console.log('US23 navegador real: '+checks+' verificaciones correctas, 10 capturas. Sin respuestas simuladas.');
 }catch(error){await page.screenshot({path:path.join(out,'fallo.png'),fullPage:true}).catch(()=>{});console.error(error.message);process.exitCode=1;}
 finally{await browser.close();}
})();
