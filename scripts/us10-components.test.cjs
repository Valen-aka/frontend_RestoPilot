const {test}=require('node:test'),assert=require('node:assert/strict'),esbuild=require('esbuild');
require('@angular/compiler');
const {signal,createEnvironmentInjector,runInInjectionContext}=require('@angular/core');
const {ActivatedRoute,Router,NavigationStart,convertToParamMap}=require('@angular/router');
const {BehaviorSubject,Subject}=require('rxjs');
const slugs=['cliente-inicio','cliente-carta','cliente-carta-categoria','cliente-carta-vacia','cliente-plato','cliente-plato-agotado','cliente-plato-bowl'];
const contents=slugs.map(s=>`export * from './src/app/pages/cliente/${s}/${s}';`).join('\n')+`
export {CartaStore} from './src/app/pages/cliente/carta-ui/carta-store';
export {CartaSelection} from './src/app/pages/cliente/carta-ui/carta-selection';`;
const code=esbuild.buildSync({stdin:{contents,resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'cjs',packages:'external',write:false});
const mod={exports:{}};new Function('module','exports','require',code.outputFiles[0].text)(mod,mod.exports,require);
const {CartaStore,CartaSelection,...pages}=mod.exports;
function setup(name='ClienteCartaPage',query={restauranteId:'7'}) {
 const params=new BehaviorSubject(convertToParamMap(query)),events=new Subject(),calls=[],loads=[],adds=[];
 const dish={id:31,restauranteId:7,disponible:true,imagenUrl:'https://example.test/dish.png'};
 const store={state:signal('ready'),restaurants:signal([{id:7},{id:8}]),restaurant:signal({id:7}),
 categories:signal([{id:2}]),categoryId:signal(2),visibleDishes:signal([dish]),detail:signal(dish),
 load:c=>loads.push(c),cancel:()=>calls.push('cancel')};
 const selection={cancel:()=>calls.push('selection-cancel'),add:(...args)=>adds.push(args)};
 const router={events,navigate:(...args)=>{calls.push(args);return Promise.resolve(true);}};
 const injector=createEnvironmentInjector([{provide:ActivatedRoute,useValue:{queryParamMap:params}},
 {provide:Router,useValue:router},{provide:CartaStore,useValue:store},{provide:CartaSelection,useValue:selection}],null);
 const page=runInInjectionContext(injector,()=>new pages[name]());page.ngOnInit();
 return {page,store,selection,router,injector,params,events,calls,loads,adds,dish};
}
test('los siete controladores leen la ruta y distinguen lista y detalle',()=>{
 for(const name of Object.keys(pages)) {const f=setup(name,{restauranteId:'7',platoId:'31'});try{
 assert.equal(f.loads.length,1);assert.equal(f.loads[0].detail,name.startsWith('ClientePlato'));
 }finally{f.injector.destroy();}}
});
test('cambio de parámetros invalida selección, reinicia cantidad y no consulta tras destruir',()=>{
 const f=setup();f.page.quantity.setValue(4);f.params.next(convertToParamMap({restauranteId:'8'}));
 assert.equal(f.loads.at(-1).restauranteId,8);assert.equal(f.page.quantity.value,1);
 assert(f.calls.includes('selection-cancel'));f.injector.destroy();const n=f.loads.length;
 f.params.next(convertToParamMap({restauranteId:'9'}));f.page.retry();assert.equal(f.loads.length,n);
});
test('navegación saliente cancela consulta incluso antes de destruir pantalla',()=>{
 const f=setup();try{f.events.next(new NavigationStart(1,'/cliente/pedidos'));
 assert(f.calls.includes('cancel'));assert(f.calls.includes('selection-cancel'));}finally{f.injector.destroy();}
});
test('categoría, detalle y restaurante conservan solo IDs correspondientes',()=>{
 const f=setup();try{
 f.page.chooseCategory(99);assert.equal(f.calls.length,1);
 f.page.chooseCategory(2);assert.deepEqual(f.calls.at(-1),[['/cliente/carta'],{queryParams:{restauranteId:7,categoriaId:2}}]);
 f.page.openDish(31);assert.deepEqual(f.calls.at(-1),[['/cliente/plato'],{queryParams:{restauranteId:7,platoId:31,categoriaId:2}}]);
 f.page.chooseRestaurant(8);assert.deepEqual(f.calls.at(-1),[['/cliente/carta'],{queryParams:{restauranteId:8}}]);
 }finally{f.injector.destroy();}
});
test('cantidad inválida no llega al adaptador; lista añade una unidad',()=>{
 const f=setup('ClientePlatoPage',{restauranteId:'7',platoId:'31'});try{
 for(const q of [0,-1,1.5,NaN,Infinity,2147483648]){f.page.quantity.setValue(q);f.page.addDish(31);}
 assert.equal(f.adds.length,0);f.page.quantity.setValue(3);f.page.addDish(31);assert.equal(f.adds[0][2],3);
 }finally{f.injector.destroy();}
 const g=setup();try{g.page.addDish(31);assert.equal(g.adds[0][2],1);g.page.addDish(999);assert.equal(g.adds.length,1);}finally{g.injector.destroy();}
});
test('bowl no ofrece compra y vuelve a la ruta existente de recomendaciones',()=>{
 const f=setup('ClientePlatoBowlPage',{restauranteId:'7',platoId:'31'});try{
 f.page.addDish(31);assert.equal(f.adds.length,0);f.page.backToRecommendation();
 assert.deepEqual(f.calls.at(-1),[['/cliente/asistente'],{queryParams:{vista:'cliente-ia-recomendaciones',restauranteId:7}}]);
 }finally{f.injector.destroy();}
});
test('sin datos de sesión vigente no se añade ni se abre un plato anterior',()=>{
 const f=setup();try{f.store.state.set('session');f.page.addDish(31);f.page.openDish(31);f.page.chooseRestaurant(7);
 assert.equal(f.adds.length,0);assert.equal(f.calls.length,1);}finally{f.injector.destroy();}
});
test('imagen fallida no recibe un sustituto y se reinicia al cambiar contexto',()=>{
 const f=setup();try{assert.equal(f.page.imageFor(f.dish),f.dish.imagenUrl);f.page.imageFailed(f.dish.imagenUrl);
 assert.equal(f.page.imageFor(f.dish),null);f.params.next(convertToParamMap({restauranteId:'8'}));
 assert.equal(f.page.imageFor(f.dish),f.dish.imagenUrl);}finally{f.injector.destroy();}
});
test('navegación rechazada conserva un error y permite recuperar el contexto',async()=>{
 const f=setup();try{f.router.navigate=()=>Promise.resolve(false);f.page.backToMenu();await Promise.resolve();
 assert(f.page.navigationError());assert.equal(f.loads.length,2);}finally{f.injector.destroy();}
});
