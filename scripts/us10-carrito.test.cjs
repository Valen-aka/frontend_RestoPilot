const {test}=require('node:test'),assert=require('node:assert/strict'),esbuild=require('esbuild');
require('@angular/compiler');
const {signal,createEnvironmentInjector,runInInjectionContext,ɵChangeDetectionScheduler,ɵEffectScheduler}=require('@angular/core');
const {Router,NavigationStart}=require('@angular/router');
const {HttpClient,HttpResponse,HttpErrorResponse}=require('@angular/common/http');
const {of,throwError,Subject}=require('rxjs');
const out=esbuild.buildSync({stdin:{contents:`
export {API_SESSION} from './src/app/core/auth/api-session';
export {CatalogoService} from './src/app/core/services/catalogo.service';
export {PedidoService} from './src/app/core/services/pedido.service';
export {PagoService} from './src/app/core/services/pago.service';
export {CarritoStore} from './src/app/pages/cliente/carrito-ui/carrito-store';
export {CartaSelection} from './src/app/pages/cliente/carta-ui/carta-selection';
export {PedidoConsultaStore} from './src/app/pages/cliente/pedido-ui/pedido-consulta-store';`,resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'cjs',packages:'external',write:false});
const m={exports:{}};new Function('module','exports','require',out.outputFiles[0].text)(m,m.exports,require);
const {API_SESSION,CatalogoService,PedidoService,PagoService,CarritoStore,CartaSelection,PedidoConsultaStore}=m.exports;
const restaurant=(id=7)=>({id,nombre:'Local de prueba',activo:true,abierto:true,tieneAtencionFisica:true,aceptaDelivery:true});
const dish=(id=31,patch={})=>({id,restauranteId:7,categoriaId:2,categoriaNombre:'Fondos',nombre:'Plato',precio:14,disponible:true,...patch});
const order=()=>({id:900,clienteId:51,clienteNombre:'Cliente',restauranteId:7,restauranteNombre:'Local de prueba',mesaId:null,
 estado:'PENDIENTE',tipoEntrega:'LLEVAR',direccionEntrega:null,total:28,fechaCreacion:'2026-11-03T14:00:00',limiteCancelacion:null,
 detalles:[{id:1000,platoId:31,nombrePlatoSnapshot:'Plato confirmado',cantidad:2,precioUnitario:14,subtotal:28,notas:null}]});
function setup(){
 const session=signal({subject:'51',role:'CLIENTE',accessToken:'synthetic',expiresAt:Date.now()+60000}),nodes=new Set(),requests=[],navigation=[];
 let fail=false,slow=null,available=true,saved=order();
 const events=new Subject();let current=null;
 const router={url:'/cliente/carta?restauranteId=7',events,currentNavigation:()=>current,navigate:commands=>{navigation.push(commands);return Promise.resolve(true);}};
 const http={get(url){requests.push({method:'GET',url});
   if(url.endsWith('/restaurantes/7'))return slow||of(restaurant());
   if(url.endsWith('/platos/restaurante/7'))return fail?throwError(()=>new HttpErrorResponse({status:500})):of([dish(31,{disponible:available}),dish(32)]);
   if(url.endsWith('/mesas/restaurante/7'))return of([]);
   if(url.endsWith('/pedidos/900/pagos'))return of({id:2900,pedidoId:900,monto:28,metodo:null,estado:'PENDIENTE',codigoReferencia:null,fechaPago:null,creadoEn:'2026-11-03T14:00:00'});
   if(url.endsWith('/pedidos/900'))return of(saved);
   if(url.endsWith('/pedidos/me'))return of({mensaje:'Consulta',pedidos:[saved],totalElementos:1,totalPaginas:1});
   throw Error('Ruta inesperada: '+url);
 },post(url,body){requests.push({method:'POST',url,body});return of(new HttpResponse({status:201,body:saved}));}};
 const injector=createEnvironmentInjector([{provide:API_SESSION,useValue:session},{provide:HttpClient,useValue:http},
 {provide:Router,useValue:router},
 {provide:ɵChangeDetectionScheduler,useValue:{notify(){}}},{provide:ɵEffectScheduler,useValue:{add:n=>nodes.add(n),schedule:n=>nodes.add(n),remove:n=>nodes.delete(n)}},
 {provide:CatalogoService,useFactory:()=>new CatalogoService()},{provide:PedidoService,useFactory:()=>new PedidoService()},
 {provide:PagoService,useFactory:()=>new PagoService()},{provide:CarritoStore,useFactory:()=>new CarritoStore()}],null);
 const cart=injector.get(CarritoStore),view=createEnvironmentInjector([],injector);let destroyed=false;
 const destroyView=()=>{if(!destroyed){destroyed=true;view.destroy();}};injector.onDestroy(destroyView);
 const selection=runInInjectionContext(view,()=>new CartaSelection());
 const flush=()=>{for(const n of nodes)if(n.dirty)n.run();};flush();
 return {session,cart,selection,injector,requests,navigation,flush,router,events,destroyView,
 leave:(url)=>{current={};events.next(new NavigationStart(1,url));router.url=url;current=null;},
 beginNavigation:()=>{current={};events.next(new NavigationStart(2,'/cliente/pedidos'));},fail:()=>fail=true,unavailable:()=>available=false,
 slow:()=>slow=new Subject(),setOrder:value=>saved=value};
}
test('conexión real de stores: selección consulta catálogo y navega sin registrar un pedido',()=>{const f=setup();try{
 f.selection.add(restaurant(),dish(),2);assert.equal(f.cart.lines()[0].quantity,2);assert.equal(f.cart.lines()[0].unitCents,1400);
 assert.equal(f.navigation[0][0],'/cliente/carrito');assert.equal(f.requests.filter(r=>r.method==='POST').length,0);
 assert.equal(f.requests.length,3);
 }finally{f.injector.destroy();}});
test('acumula cantidades, conserva otros platos/notas y no duplica IDs',()=>{const f=setup();try{
 f.selection.add(restaurant(),dish(),1);f.selection.add(restaurant(),dish(32),1);f.selection.add(restaurant(),dish(),2);
 assert.equal(f.cart.lines().length,2);assert.equal(f.cart.lines().find(l=>l.id===31).quantity,3);
 }finally{f.injector.destroy();}});
test('agotado, cerrado, otra cuenta y cantidades inválidas no preparan selección',()=>{const f=setup();try{
 for(const q of [0,-1,1.5,NaN,Infinity,2147483648])f.selection.add(restaurant(),dish(),q);
 f.selection.add(restaurant(),dish(31,{disponible:false}),1);f.selection.add({...restaurant(),abierto:false},dish(),1);
 f.selection.add(restaurant(),dish(31,{restauranteId:8}),1);
 f.session.set({...f.session(),role:'DUENO'});f.flush();f.selection.add(restaurant(),dish(),1);
 assert.equal(f.requests.length,0);assert.equal(f.navigation.length,0);
 }finally{f.injector.destroy();}});
test('no reemplaza carrito de otro restaurante ni desborda cantidades',()=>{const f=setup();try{
 f.selection.add(restaurant(),dish(),1);const before=f.cart.draft();f.selection.add(restaurant(8),dish(31,{restauranteId:8}),1);
 assert.equal(f.cart.draft(),before);assert.match(f.selection.error(),/otro restaurante/);
 f.cart.setQuantity(0,2147483647);f.selection.add(restaurant(),dish(),1);assert.equal(f.cart.lines()[0].quantity,2147483647);
 }finally{f.injector.destroy();}});
test('error o disponibilidad cambiada conserva borrador anterior y no anuncia éxito',()=>{
 for(const mode of ['fail','unavailable']){const f=setup();try{
 f.selection.add(restaurant(),dish(),1);const before=f.cart.draft();f[mode]();f.selection.add(restaurant(),dish(),1);
 assert.equal(f.cart.draft(),before);assert.equal(f.navigation.length,1);assert(f.selection.error());assert.equal(f.selection.preparing(),false);
 }finally{f.injector.destroy();}}
});
test('doble envío y cambio de sesión durante consulta no alteran el nuevo recorrido',()=>{const f=setup();try{
 const slow=f.slow();f.selection.add(restaurant(),dish(),1);f.selection.add(restaurant(),dish(),1);assert.equal(f.requests.length,3);
 f.session.set(null);f.flush();slow.next(restaurant());slow.complete();assert.equal(f.cart.draft(),null);assert.equal(f.navigation.length,0);
 assert.equal(f.selection.preparing(),false);
 }finally{f.injector.destroy();}});
test('US10 → US11 → US12 → US13 con servicios reales y transporte HTTP simulado',()=>{const f=setup();try{
 f.selection.add(restaurant(),dish(),2);f.cart.submit('LLEVAR',null,'');
 assert.equal(f.cart.created().id,900);assert.equal(f.cart.created().total,28);assert.equal(f.cart.draft(),null);
 const post=f.requests.find(r=>r.method==='POST');assert.equal(post.body.detalles[0].cantidad,2);assert(!('total' in post.body));
 const pedidos=f.injector.get(PedidoService);let history;pedidos.propios(0,10).subscribe(v=>history=v);assert.equal(history.pedidos[0].id,900);
 const consulta=runInInjectionContext(f.injector,()=>new PedidoConsultaStore());consulta.load(900,'payment');
 assert.equal(consulta.order().id,900);assert.equal(consulta.payment().estado,'PENDIENTE');
 consulta.load(900,'order');f.setOrder({...order(),estado:'LISTO'});consulta.refresh();assert.equal(consulta.order().estado,'LISTO');assert.equal(consulta.order().total,28);
 assert.equal(f.requests.filter(r=>r.method==='POST').length,1);
 }finally{f.injector.destroy();}});

test('salir de carta cancela preparación y respuesta tardía no navega ni reemplaza el carrito',()=>{const f=setup();try{
 f.selection.add(restaurant(),dish(),1);const before=f.cart.draft();f.navigation.length=0;
 const slow=f.slow();f.selection.add(restaurant(),dish(),2);assert.equal(slow.observed,true);
 f.leave('/cliente/pedidos');assert.equal(slow.observed,false);assert.equal(f.selection.preparing(),false);
 slow.next(restaurant());slow.complete();assert.equal(f.navigation.length,0);assert.equal(f.cart.draft(),before);
 }finally{f.injector.destroy();}});
test('cambio de query cancela incluso si después se vuelve a la URL original',()=>{const f=setup();try{
 const slow=f.slow();f.selection.add(restaurant(),dish(),1);
 f.leave('/cliente/carta?restauranteId=8');f.leave('/cliente/carta?restauranteId=7');
 slow.next(restaurant());slow.complete();assert.equal(f.cart.draft(),null);assert.equal(f.navigation.length,0);
 }finally{f.injector.destroy();}});
test('destruir solo la vista cancela sin destruir ni vaciar el carrito compartido',()=>{const f=setup();try{
 f.selection.add(restaurant(),dish(),1);const before=f.cart.draft();f.navigation.length=0;
 const slow=f.slow();f.selection.add(restaurant(),dish(),1);f.destroyView();
 assert.equal(slow.observed,false);slow.next(restaurant());slow.complete();
 f.selection.add(restaurant(),dish(),1);assert.equal(f.navigation.length,0);assert.equal(f.cart.draft(),before);
 }finally{f.injector.destroy();}});
test('no inicia preparación durante navegación pendiente',()=>{const f=setup();try{
 f.beginNavigation();f.selection.add(restaurant(),dish(),1);assert.equal(f.requests.length,0);
 }finally{f.injector.destroy();}});
test('cancelación explícita permite nueva selección y descarta la respuesta anterior',()=>{const f=setup();try{
 const old=f.slow();f.selection.add(restaurant(),dish(),1);f.selection.cancel();
 const fresh=f.slow();f.selection.add(restaurant(),dish(),2);old.next(restaurant());old.complete();assert.equal(f.cart.draft(),null);
 fresh.next(restaurant());fresh.complete();assert.equal(f.cart.lines()[0].quantity,2);assert.equal(f.navigation.length,1);
 }finally{f.injector.destroy();}});
test('token cambiado o expirado antes de ejecutar efectos no modifica el borrador',()=>{
 for(const patch of [{accessToken:'new-token'},{subject:'52'},{expiresAt:Date.now()-1}]){const f=setup();try{
 const slow=f.slow();f.selection.add(restaurant(),dish(),1);f.session.set({...f.session(),...patch});
 slow.next(restaurant());slow.complete();assert.equal(f.cart.draft(),null);assert.equal(f.navigation.length,0);
 f.flush();assert.equal(f.selection.preparing(),false);
 }finally{f.injector.destroy();}}
});
test('doble envío pendiente produce una sola consulta y una sola navegación',()=>{const f=setup();try{
 const slow=f.slow();f.selection.add(restaurant(),dish(),1);f.selection.add(restaurant(),dish(),1);
 assert.equal(f.requests.length,3);slow.next(restaurant());slow.complete();assert.equal(f.navigation.length,1);assert.equal(f.cart.lines()[0].quantity,1);
 }finally{f.injector.destroy();}});
