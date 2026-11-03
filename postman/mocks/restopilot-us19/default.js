// Solo simulación local con datos sintéticos. El backend real valida firma y permisos.
const http=require('node:http');
const order=(id=900,estado='PENDIENTE')=>({id,estado,restauranteId:7,restauranteNombre:'Local de prueba US19',clienteId:51,clienteNombre:'Cliente de prueba',mesaId:null,
 tipoEntrega:'LLEVAR',direccionEntrega:null,total:28,fechaCreacion:'2026-11-02T14:00:00',limiteCancelacion:null,
 complejidadMaxima:'ALTA',tiempoPreparacionMaximoMinutos:30,
 detalles:[{id:1000,platoId:31,nombrePlatoSnapshot:'Plato histórico',cantidad:2,precioUnitario:14,subtotal:28,notas:'Sin sal'}]});
const seed=()=>[...[901,900,...Array.from({length:23},(_,i)=>902+i)].map((id,i)=>order(id,i%2?'EN_PREPARACION':'PENDIENTE')),order(990,'LISTO')];
http.createServer(async(req,res)=>{
 let body=req.body;if(body===undefined)body=await new Promise(resolve=>{let raw='';req.on('data',c=>raw+=c);req.on('end',()=>{try{resolve(JSON.parse(raw||'{}'));}catch{resolve({});}});});
 const url=new URL(req.url,'http://localhost');const p=url.pathname;
 res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Methods','GET,POST,PATCH,OPTIONS');res.setHeader('Access-Control-Allow-Headers','content-type,authorization');
 const send=(status,b)=>{res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(b));};
 if(req.method==='OPTIONS'){res.writeHead(204);return res.end();}
 if(p==='/__test'){
  if(req.method==='POST'){if(body.reset){await pm.state.set('us19-orders',seed());await pm.state.set('us19-calls',[]);}await pm.state.set('us19-mode',body.mode||'success');}
  return send(200,{calls:await pm.state.get('us19-calls')||[],mode:await pm.state.get('us19-mode')||'success'});
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
  const calls=await pm.state.get('us19-calls')||[];calls.push({method:req.method,path:p,query:url.search,authorized:!!req.headers.authorization});await pm.state.set('us19-calls',calls);
  if(!req.headers.authorization)return send(403,{mensaje:'Acceso restringido'});

  const mode=String(await pm.state.get('us19-mode')||'success');
  if(req.method==='PATCH'){
   const orders=await pm.state.get('us19-orders')||seed(),id=Number(p.split('/')[2]),index=orders.findIndex(o=>o.id===id);
   if(mode==='patch403'||mode==='patch404')return send(mode==='patch403'?403:404,{mensaje:'Acceso rechazado'});
   if(index<0)return send(404,{mensaje:'Pedido no encontrado'});
   if(mode==='reject400'||mode==='reject409'){
    orders[index]={...orders[index],estado:mode==='reject400'?'LISTO':'EN_PREPARACION'};await pm.state.set('us19-orders',orders);
    return send(mode==='reject400'?400:409,{mensaje:'El estado cambió en otra sesión'});
   }
   const target=url.searchParams.get('nuevoEstado'),next={PENDIENTE:'EN_PREPARACION',EN_PREPARACION:'LISTO',LISTO:'ENTREGADO'};
   if(next[orders[index].estado]!==target)return send(400,{mensaje:'Transición inválida'});
   if(mode==='slow')await new Promise(resolve=>setTimeout(resolve,650));
   orders[index]={...orders[index],estado:target};await pm.state.set('us19-orders',orders);
   if(mode==='lost'||mode==='lost-unavailable')return send(500,{mensaje:'Respuesta perdida después de guardar'});
   if(mode==='bad-contract')return send(200,{...orders[index],id:999999});
   return send(200,orders[index]);
  }
  if(req.method!=='GET')return send(501,{mensaje:'Ruta no cubierta'});
  if(mode==='lost-unavailable')return send(500,{mensaje:'Consulta no disponible'});
  if(mode==='queue-fail'&&p==='/pedidos/pendientes')return send(500,{mensaje:'Cola no disponible'});
  if(['500','403','404','401'].includes(mode))return send(Number(mode),{mensaje:'Error controlado de prueba'});
  if(mode==='slow')await new Promise(resolve=>setTimeout(resolve,600));
  const orders=await pm.state.get('us19-orders')||seed();
  if(p==='/pedidos/pendientes'){
   const page=Number(url.searchParams.get('page')),size=Number(url.searchParams.get('size'));
   const source=mode==='empty'?[]:orders.filter(o=>['PENDIENTE','EN_PREPARACION'].includes(o.estado));
   const content=source.slice(page*size,(page+1)*size).map(o=>mode==='foreign'?{...o,restauranteId:8}:mode==='missing'?{...o,complejidadMaxima:null,tiempoPreparacionMaximoMinutos:null}:o);
   return send(200,{content,totalElements:source.length,totalPages:Math.ceil(source.length/size),number:page,size});
  }
  const id=Number(p.split('/').pop());const found=orders.find(o=>o.id===id);
  return found?send(200,mode==='foreign'?{...found,restauranteId:8}:found):send(404,{mensaje:'Pedido no encontrado'});
 }
 // Estas consultas proceden solo de la pantalla usada como entrada al servicio auth en el harness.
 if(p==='/restaurantes')return send(200,[]);
 return send(501,{mensaje:'Ruta no cubierta por esta simulación US19'});
}).listen(process.env.PORT||4504);
