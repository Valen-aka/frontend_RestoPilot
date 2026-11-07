const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const app=process.env.RP_APP_URL||'http://127.0.0.1:4363',out=path.resolve('artifacts/us18-api');fs.mkdirSync(out,{recursive:true});
const order=()=>({id:900,restauranteId:7,restauranteNombre:'Restaurante de prueba',clienteId:51,clienteNombre:'Cliente de prueba',estado:'PENDIENTE',tipoEntrega:'RECOGER',mesaId:null,direccionEntrega:null,total:28,fechaCreacion:'2026-11-06T12:00:00',limiteCancelacion:null,detalles:[{id:1,platoId:31,nombrePlatoSnapshot:'Plato de prueba',cantidad:1,precioUnitario:28,subtotal:28,notas:null}]});
const initialPayment=()=>({mensaje:'Detalle',id:2900,pedidoId:900,monto:28,estado:'PENDIENTE',metodo:null,codigoReferencia:null,fechaPago:null,creadoEn:'2026-11-06T12:00:00'});
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.RP_BROWSER_EXECUTABLE||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'}),results=[];
 async function run(name,fn,width=1440){
  const context=await browser.newContext({viewport:{width,height:1000}}),p=await context.newPage(),s={mode:'ok',writes:[],queries:[],payment:initialPayment()},errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  await context.route('**/api/**',async route=>{
   const req=route.request(),url=new URL(req.url()).pathname,method=req.method(),send=(body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
   if(url.endsWith('/auth/login')){const correo=req.postDataJSON().correo,claims={sub:correo,userId:70,rol:'DUENO',restauranteId:7,exp:Math.floor(Date.now()/1000)+3600};return send({mensaje:'Acceso',id:70,nombreCompleto:'Dueño de prueba',correo,rol:'DUENO',restauranteId:7,token:'e30.'+Buffer.from(JSON.stringify(claims)).toString('base64url')+'.fixture'});}
   if(method==='GET')s.queries.push(url);
   if(method==='GET'&&url==='/api/pedidos/900')return send(order());
   if(method==='GET'&&url.endsWith('/pagos'))return s.mode==='forbidden'?send({},403):send(s.payment);
   if(method==='POST'&&url==='/api/pedidos/900/pagos'){
    const body=req.postDataJSON();s.writes.push(body);
    if(s.mode==='lost')return route.abort('failed');
    if(s.mode==='conflict'){s.payment={...initialPayment(),metodo:'EFECTIVO',estado:'PAGADO',fechaPago:'2026-11-06T14:00:00'};return send({mensaje:'Confirmado'},409);}
    if(s.mode==='invalid')return send({mensaje:'El monto debe coincidir con el total del pedido.'},400);
    if(s.mode==='slow')await new Promise(r=>setTimeout(r,500));
    s.payment={...initialPayment(),...body,fechaPago:body.estado==='PAGADO'?'2026-11-06T14:00:00':null};return send(s.payment,201);
   }
   return send({mensaje:'No encontrado'},404);
  });
  try{
   await p.goto(app+'/auth/login?returnUrl=%2Foperacion%2Fpagos');
   await p.getByRole('textbox',{name:'Correo electrónico',exact:true}).fill('dueno@example.test');await p.getByLabel('Contraseña',{exact:true}).fill('Clave9!prueba');await p.getByRole('button',{name:'Entrar a RestoPilot',exact:true}).click();await p.waitForURL(u=>u.pathname==='/operacion/pagos');
   await fn(p,s);assert.deepEqual(errors,[]);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
   results.push({name,passed:true});console.log('OK '+name);
  }catch(e){await p.screenshot({path:path.join(out,'failure.png'),fullPage:true});throw e;}finally{await context.close();}
 }
 const search=async(p,id='900')=>{await p.getByRole('textbox',{name:'Número de pedido',exact:true}).fill(id);await p.getByRole('button',{name:'Consultar pedido',exact:true}).click();};
 const form=async p=>{await search(p);await p.getByRole('link',{name:'Revisar registro de pago',exact:true}).click();await p.getByRole('heading',{name:'Registrar pago recibido',exact:true}).waitFor();};
 const cash=async p=>{await p.getByRole('combobox',{name:'Método de pago',exact:true}).click();await p.getByRole('option',{name:'Efectivo',exact:true}).click();};
 try{
  await run('búsqueda inválida no realiza consultas y pedido inexistente informa404',async(p,s)=>{await search(p,'0');assert.equal(s.queries.length,0);await search(p,'999');await p.getByText('No se encontró el pedido o su registro de pago.',{exact:true}).waitFor();});
  await run('consulta muestra identificador y pago reales sin1042',async(p,s)=>{await search(p);await p.getByRole('heading',{name:'Pedido #900',exact:true}).waitFor();assert(s.queries.includes('/api/pedidos/900/pagos'));assert.equal(await p.getByText('Pedido #1042',{exact:true}).count(),0);await p.getByText('Sin fecha de confirmación',{exact:true}).waitFor();});
  await run('pago efectivo confirmado usaPOST201 y muestra detalle del servidor',async(p,s)=>{await form(p);await cash(p);await p.getByRole('button',{name:'Confirmar pago recibido',exact:true}).click();await p.getByRole('heading',{name:'Detalle del pago',exact:true}).waitFor();await p.getByText('Pedido: PENDIENTE · Pago: Pagado',{exact:true}).waitFor();assert.equal(s.writes.length,1);assert.deepEqual(Object.keys(s.writes[0]).sort(),['codigoReferencia','estado','metodo','monto']);assert.equal(s.writes[0].metodo,'EFECTIVO');});
  await run('CA12 pago pendiente electrónico no exige referencia ni fecha',async(p,s)=>{await form(p);await p.getByRole('combobox',{name:'Estado del pago',exact:true}).click();await p.getByRole('option',{name:'Pendiente',exact:true}).click();await p.getByRole('button',{name:'Guardar pago pendiente',exact:true}).click();await p.getByRole('heading',{name:'Detalle del pago',exact:true}).waitFor();assert.equal(s.writes[0].estado,'PENDIENTE');assert.equal(s.writes[0].codigoReferencia,null);await p.getByText('Sin fecha de confirmación',{exact:true}).waitFor();});
  await run('importe incorrecto y referencia ausente bloqueanPOST',async(p,s)=>{await form(p);await p.getByRole('button',{name:'Confirmar pago recibido',exact:true}).click();assert.equal(s.writes.length,0);await p.getByRole('textbox',{name:'Código de referencia',exact:true}).fill('REF-1');await p.getByRole('spinbutton',{name:'Monto (S/)',exact:true}).fill('27');await p.getByRole('button',{name:'Confirmar pago recibido',exact:true}).click();assert.equal(s.writes.length,0);});
  await run('respuesta perdida bloquea repetición hasta consultar el estado',async(p,s)=>{await form(p);await cash(p);s.mode='lost';await p.getByRole('button',{name:'Confirmar pago recibido',exact:true}).click();await p.getByRole('button',{name:'Comprobar estado del pago',exact:true}).waitFor();assert(await p.getByRole('button',{name:'Confirmar pago recibido',exact:true}).isDisabled());s.mode='ok';await p.getByRole('button',{name:'Comprobar estado del pago',exact:true}).click();await p.getByRole('heading',{name:'Pedido #900',exact:true}).waitFor();assert.equal(s.writes.length,1);});
  await run('doble submit y variante durantePOST no duplican registro',async(p,s)=>{await form(p);await cash(p);s.mode='slow';await p.locator('form.payment-form').evaluate(form=>{form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));});await p.getByRole('heading',{name:'Detalle del pago',exact:true}).waitFor();assert.equal(s.writes.length,1);});
  await run('conflicto409 se recupera consultando el pago ya confirmado',async(p,s)=>{await form(p);await cash(p);s.mode='conflict';await p.getByRole('button',{name:'Confirmar pago recibido',exact:true}).click();await p.getByText('El pedido ya tiene un pago confirmado. Consulta su estado actualizado.',{exact:true}).waitFor();await p.getByRole('button',{name:'Actualizar consulta',exact:true}).click();await p.getByText('El pago confirmado es inamovible.',{exact:true}).waitFor();assert.equal(s.writes.length,1);});
  await run('permiso403 no muestra datos de pago ajenos',async(p,s)=>{s.mode='forbidden';await search(p);await p.getByText('No tienes permiso para gestionar este pedido.',{exact:true}).waitFor();assert.equal(await p.getByRole('heading',{name:'Pedido #900',exact:true}).count(),0);});
  for(const width of [390,768,1440])await run('registro responsive '+width,async p=>{await form(p);await p.getByRole('combobox',{name:'Estado del pago',exact:true}).waitFor();await p.screenshot({path:path.join(out,'registro-'+width+'.png'),fullPage:true,animations:'disabled'});},width);
  fs.writeFileSync(path.join(out,'resultado.json'),JSON.stringify({date:new Date().toISOString(),type:'controlled-HTTP-browser',results},null,2));console.log('TOTAL '+results.length+' correctas');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
