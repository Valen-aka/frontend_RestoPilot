const fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
// Revisión básica de renderizado; no acredita operaciones, permisos ni aceptación.
const root=path.resolve(__dirname,'..'),app=process.env.RP_QA_URL||'http://127.0.0.1:4319',mock=process.env.RP_MOCK_URL||'http://localhost:4320',out=path.resolve(process.env.RP_QA_OUTPUT||'artifacts/qa-implementadas');
for(const url of [app,mock])if(!['localhost','127.0.0.1'].includes(new URL(url).hostname))throw Error('Solo entornos locales de prueba');fs.mkdirSync(out,{recursive:true});
const frames=JSON.parse(fs.readFileSync(path.join(root,'src/app/screen-manifest.json'),'utf8')).filter(x=>x.contenidoImplementado);
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}),results=[];
try{for(const width of [390,1440])for(const role of ['client','operation']){
 const context=await browser.newContext({viewport:{width,height:1000}}),page=await context.newPage();let errors=[];page.on('pageerror',e=>errors.push(e.message));
 await context.route('http://localhost:8081/api/**',r=>r.continue({url:mock+new URL(r.request().url()).pathname+new URL(r.request().url()).search}));
 await page.goto(app+'/cliente/carrito');await page.locator('rp-carrito-view').waitFor();
 await page.evaluate(async role=>{const c=ng.getComponent(document.querySelector('rp-carrito-view'));window.__qaRouter=c.router;await new Promise((resolve,reject)=>c.auth.login({correo:role==='client'?'cliente@example.test':'admin@example.test',password:'solo-prueba'}).subscribe({next:resolve,error:reject}));},role);
 const selected=frames.filter(f=>role==='client'?!f.url.startsWith('/operacion')&&!f.url.startsWith('/dueno'):f.url.startsWith('/operacion')||f.url.startsWith('/dueno'));
 for(const frame of selected){errors=[];let item={slug:frame.slug,url:frame.url,width,owner:frame.owner};
  try{const url=new URL(frame.url,'http://localhost');if(url.pathname.includes('/reserva')&&url.pathname!=='/cliente/reservas'&&url.pathname!=='/operacion/reservas'){url.searchParams.set('reservaId',frame.slug.includes('expirada')?802:800);url.searchParams.set('id',frame.slug.includes('expirada')?802:800);}if(url.pathname.includes('/pedido')||url.pathname==='/cliente/pago')url.searchParams.set('pedidoId','800');
   await page.evaluate(url=>window.__qaRouter.navigateByUrl(url),url.pathname+url.search);
   await page.waitForFunction(()=>{const h=document.querySelector('rp-screen-host');return !!h?.firstElementChild;},{},{timeout:10000});
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   const state=await page.evaluate(()=>({text:document.querySelector('rp-screen-host')?.textContent?.trim()||'',overflow:document.documentElement.scrollWidth>innerWidth+1}));
   item={...item,rendered:state.text.length>5,overflow:state.overflow,errors:[...errors]};
   item.passed=item.rendered&&!item.overflow&&!item.errors.length;
   if(!item.passed)await page.screenshot({path:path.join(out,frame.slug+'-'+width+'.png'),fullPage:true,animations:'disabled'});
  }catch(e){item={...item,passed:false,error:e.message.slice(0,350)};}
  results.push(item);console.log((item.passed?'OK ':'REVISAR ')+frame.slug+' '+width);
 }
 await context.close();
}
fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify({routes:frames.length,cases:results.length,passed:results.filter(x=>x.passed).length,issues:results.filter(x=>!x.passed).map(x=>({slug:x.slug,width:x.width,overflow:x.overflow,errors:x.errors,error:x.error}))}));
process.exitCode=results.some(x=>!x.passed)?1:0;
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
