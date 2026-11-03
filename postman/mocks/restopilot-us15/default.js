// Solo simulación local con datos sintéticos. El backend real valida firma y permisos.
const http=require('node:http');
const order=(id=900,estado='PENDIENTE')=>({id,estado,restauranteId:7,restauranteNombre:'Local de prueba US15',clienteId:51,clienteNombre:'Cliente de prueba',mesaId:null,
 tipoEntrega:'LLEVAR',direccionEntrega:null,total:28,fechaCreacion:'2026-11-02T14:00:00',limiteCancelacion:null,
 complejidadMaxima:'ALTA',tiempoPreparacionMaximoMinutos:30,
 detalles:[{id:1000,platoId:31,nombrePlatoSnapshot:'Plato histórico',cantidad:2,precioUnitario:14,subtotal:28,notas:'Sin sal'}]});
const seed=()=>[901,900,...Array.from({length:23},(_,i)=>902+i)].map((id,i)=>order(id,i%2?'EN_PREPARACION':'PENDIENTE'));
http.createServer(async(req,res)=>{
 let body=req.body;if(body===undefined)body=await new Promise(resolve=>{let raw='';req.on('data',c=>raw+=c);req.on('end',()=>{try{resolve(JSON.parse(raw||'{}'));}catch{resolve({});}});});
 const url=new URL(req.url,'http://localhost');const p=url.pathname;
 res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');res.setHeader('Access-Control-Allow-Headers','content-type,authorization');
 const send=(status,b)=>{res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(b));};
 if(req.method==='OPTIONS'){res.writeHead(204);return res.end();}
 if(p==='/__test'){
  if(req.method==='POST'){if(body.reset){await pm.state.set('us15-orders',seed());await pm.state.set('us15-calls',[]);}await pm.state.set('us15-mode',body.mode||'success');}
  return send(200,{calls:await pm.state.get('us15-calls')||[],mode:await pm.state.get('us15-mode')||'success'});
 }
 if(p==='/auth/login'&&req.method==='POST'){
  const role=body.correo==='cliente@example.test'?'CLIENTE':body.correo==='dueno@example.test'?'DUENO':'ADMINISTRADOR';
  const rid=role==='CLIENTE'||body.correo==='sinlocal@example.test'?null:7;
  const claims={userId:70,sub:body.correo,rol:role,exp:Math.floor(Date.now()/1000)+3600};if(rid)claims.restauranteId=rid;
  const enc=x=>Buffer.from(JSON.stringify(x)).toString('base64url');
  return send(200,{mensaje:'Acceso de prueba',id:70,nombreCompleto:'Cuenta prueba',correo:body.correo,rol:role,restauranteId:rid,
   token:enc({alg:'HS256',typ:'JWT'})+'.'+enc(claims)+'.firma-sintetica'});
 }
 if(p.startsWith('/pedidos')){
  const calls=await pm.state.get('us15-calls')||[];calls.push({method:req.method,path:p,query:url.search,authorized:!!req.headers.authorization});await pm.state.set('us15-calls',calls);
  if(!req.headers.authorization)return send(403,{mensaje:'Acceso restringido'});
  if(req.method!=='GET')return send(501,{mensaje:'Mutación fuera del alcance de esta simulación'});
  const mode=String(await pm.state.get('us15-mode')||'success');
  if(['500','403','404','401'].includes(mode))return send(Number(mode),{mensaje:'Error controlado de prueba'});
  if(mode==='slow')await new Promise(resolve=>setTimeout(resolve,600));
  const orders=await pm.state.get('us15-orders')||seed();
  if(p==='/pedidos/pendientes'){
   const page=Number(url.searchParams.get('page')),size=Number(url.searchParams.get('size'));
   const source=mode==='empty'?[]:orders;
   const content=source.slice(page*size,(page+1)*size).map(o=>mode==='foreign'?{...o,restauranteId:8}:mode==='missing'?{...o,complejidadMaxima:null,tiempoPreparacionMaximoMinutos:null}:o);
   return send(200,{content,totalElements:source.length,totalPages:Math.ceil(source.length/size),number:page,size});
  }
  const id=Number(p.split('/').pop());const found=id===990?order(990,'LISTO'):orders.find(o=>o.id===id);
  return found?send(200,mode==='foreign'?{...found,restauranteId:8}:found):send(404,{mensaje:'Pedido no encontrado'});
 }
 // Estas consultas proceden solo de la pantalla usada como entrada al servicio auth en el harness.
 if(p==='/restaurantes')return send(200,[]);
 return send(501,{mensaje:'Ruta no cubierta por esta simulación US15'});
}).listen(process.env.PORT||4503);
