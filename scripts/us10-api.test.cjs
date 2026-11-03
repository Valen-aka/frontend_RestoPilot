const {test}=require('node:test'), assert=require('node:assert/strict'),vm=require('node:vm'),esbuild=require('esbuild');
require('@angular/compiler');
const {createEnvironmentInjector,runInInjectionContext}=require('@angular/core');
const {HttpErrorResponse,HttpClient}=require('@angular/common/http');
const {of,throwError,Subject}=require('rxjs');
const code=esbuild.buildSync({stdin:{contents:`
export * from './src/app/pages/cliente/carta-ui/carta.model';
export * from './src/app/core/models/catalogo-query.model';
export {CartaStore} from './src/app/pages/cliente/carta-ui/carta-store';
export {CatalogoService} from './src/app/core/services/catalogo.service';`,resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'cjs',packages:'external',write:false});
const sandbox={module:{exports:{}},exports:{},require,console,URL,Object,Error,Set,Number};new Function('module','exports','require',code.outputFiles[0].text)(sandbox.module,sandbox.exports,require);
const {readId,cartaContext,dishImage,readCartaPlato,readCategorias,CartaStore,CatalogoService}=sandbox.module.exports;
const restaurant=id=>({id,nombre:'Restaurante de prueba',activo:true,abierto:true,tieneAtencionFisica:true,aceptaDelivery:true});
const dish=(patch={})=>({id:31,restauranteId:7,categoriaId:2,categoriaNombre:'Fondos',nombre:'Plato de prueba',precio:14,disponible:true,
 descripcion:null,ingredientes:null,alergenos:null,complejidad:null,imagenUrl:null,tiempoPreparacionMinutos:null,...patch});
const category=(patch={})=>({id:2,restauranteId:7,nombre:'Fondos',descripcion:null,...patch});
const context=(patch={})=>({restauranteId:7,categoriaId:null,platoId:null,detail:false,invalid:false,...patch});
function setup(overrides={}){const calls=[];const api={restaurantes:()=>of([restaurant(7)]),restaurante:id=>{calls.push(id);return of(restaurant(id));},
 categorias:()=>of([category(),category({id:3,nombre:'Sin platos'})]),platos:()=>of([dish()]),plato:id=>of(dish({id})),...overrides};
 const injector=createEnvironmentInjector([{provide:CatalogoService,useValue:api}],null);
 return {calls,api,injector,store:runInInjectionContext(injector,()=>new CartaStore())};}
test('URL: rechaza IDs repetidos, negativos, decimales, coerciones y enlaces incompletos',()=>{
 for(const v of [[],['1','2'],['0'],['01'],['-2'],['1.5'],['1e2'],['9007199254740992']]) assert.equal(readId(v),null);
 assert.equal(readId(['7']),7);
 assert.equal(cartaContext(new URLSearchParams('restauranteId=7&platoId=31'),true).invalid,false);
 for(const q of ['platoId=31','restauranteId=7&platoId=31&platoId=32','restauranteId=x']) assert.equal(cartaContext(new URLSearchParams(q),true).invalid,true);
});
test('contrato: conserva datos reales y rechaza platos ajenos o campos incompatibles',()=>{
 const p=dish();assert.equal(readCartaPlato(p,7,31),p);
 for(const patch of [{id:32},{restauranteId:8},{precio:Infinity},{precio:-1},{disponible:'true'},{categoriaId:0},{alergenos:[]},{tiempoPreparacionMinutos:-1}])assert.throws(()=>readCartaPlato(dish(patch),7,31));
});
test('categorías vacías son válidas; duplicados y otros restaurantes son errores',()=>{
 assert.equal(readCategorias([],7).length,0);assert.equal(readCategorias([category()],7)[0].id,2);
 for(const value of [[category(),category()],[category({restauranteId:8})],{categorias:[]},null])assert.throws(()=>readCategorias(value,7));
});
test('imágenes: no acepta protocolos ejecutables ni suplanta imágenes ausentes',()=>{
 for(const url of [null,'','javascript:alert(1)','data:image/svg+xml,x','//otro.test/a'])assert.equal(dishImage(url),null);
 assert.equal(dishImage('/assets/logo.png'),'/assets/logo.png');assert.equal(dishImage('https://example.test/plato.jpg'),'https://example.test/plato.jpg');
});
test('sin sesión o parámetros inválidos no consulta ni muestra datos',()=>{
 const f=setup();try{f.store.load(context(),false);assert.equal(f.store.state(),'session');assert.equal(f.calls.length,0);
 f.store.load(context({invalid:true}),true);assert.equal(f.store.state(),'error');assert.equal(f.calls.length,0);}finally{f.injector.destroy();}
});
test('lista restaurantes sin elegir uno por defecto',()=>{const f=setup();try{f.store.load(context({restauranteId:null}),true);
 assert.equal(f.store.state(),'ready');assert.equal(f.store.restaurants().length,1);assert.equal(f.store.restaurant(),null);}finally{f.injector.destroy();}});
test('filtra categorías reales, incluso categorías sin platos',()=>{const f=setup();try{
 f.store.load(context({categoriaId:2}),true);assert.equal(f.store.visibleDishes().length,1);
 f.store.load(context({categoriaId:3}),true);assert.equal(f.store.state(),'ready');assert.equal(f.store.visibleDishes().length,0);
 f.store.load(context({categoriaId:9}),true);assert.equal(f.store.state(),'error');assert.equal(f.store.dishes().length,0);
 }finally{f.injector.destroy();}});
test('detalle usa ID solicitado y conserva agotado y campos no informados',()=>{const f=setup({plato:id=>of(dish({id,disponible:false}))});try{
 f.store.load(context({detail:true,platoId:31}),true);assert.equal(f.store.detail().id,31);assert.equal(f.store.detail().disponible,false);assert.equal(f.store.detail().alergenos,null);
 }finally{f.injector.destroy();}});
test('red, 401, 403, 404 y respuesta malformada no se muestran como vacío exitoso',()=>{
 for(const status of [0,401,403,404,500]){const f=setup({platos:()=>throwError(()=>new HttpErrorResponse({status}))});try{
 f.store.load(context(),true);assert.equal(f.store.state(),'error');assert.equal(f.store.dishes().length,0);assert(f.store.error());}finally{f.injector.destroy();}}
 const f=setup({platos:()=>of([dish({precio:NaN})])});try{f.store.load(context(),true);assert.equal(f.store.state(),'error');}finally{f.injector.destroy();}
});
test('cambio de restaurante cancela consulta anterior y descarta resultados tardíos',()=>{
 const slow=new Subject(),f=setup({restaurante:id=>id===7?slow:of(restaurant(id)),categorias:id=>of([category({restauranteId:id})]),platos:id=>of([dish({restauranteId:id})])});try{
 f.store.load(context(),true);assert.equal(f.store.state(),'loading');f.store.load(context({restauranteId:8}),true);
 slow.next(restaurant(7));slow.complete();assert.equal(f.store.restaurant().id,8);assert.equal(f.store.dishes()[0].restauranteId,8);
 f.store.load(context(),false);assert.equal(f.store.restaurant(),null);assert.equal(f.store.dishes().length,0);
 }finally{f.injector.destroy();}
});
test('HTTP: categorías y detalle usan rutas reales y rechazan pertenencia incompatible',()=>{
 const calls=[],http={get(url){calls.push(url);return of(url.includes('/categorias/')?[category()]:dish());}};
 const injector=createEnvironmentInjector([{provide:HttpClient,useValue:http}],null);
 try{const api=runInInjectionContext(injector,()=>new CatalogoService());let errors=0;
 api.categorias(7).subscribe(v=>assert.equal(v.length,1));api.plato(31,7).subscribe(v=>assert.equal(v.id,31));
 api.plato(31,8).subscribe({error:()=>errors++});assert.equal(errors,1);
 assert(calls[0].endsWith('/api/categorias/restaurante/7'));assert(calls[1].endsWith('/api/platos/31'));
 }finally{injector.destroy();}
});
