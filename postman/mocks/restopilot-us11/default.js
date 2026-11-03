// Solo simulación local: datos sintéticos y token sin firma válida. No usar como backend.
const http=require('node:http');
const restaurant={id:7,nombre:'Restaurante de prueba',direccion:null,activo:true,abierto:true,
  tieneAtencionFisica:true,aceptaDelivery:true,horaApertura:'09:00:00',horaCierre:'22:00:00'};
const dish={id:31,restauranteId:7,categoriaId:1,categoriaNombre:'Prueba',nombre:'Plato de prueba',
  descripcion:'Dato sintético',precio:12.5,disponible:true,ingredientes:null,alergenos:null,
  complejidad:'BAJA',tiempoPreparacionMinutos:10,imagenUrl:null,creadoEn:'2026-11-02T12:00:00',actualizadoEn:null};
const table={id:19,restauranteId:7,restauranteNombre:restaurant.nombre,numero:4,capacidad:4,
  coordenadaX:0,coordenadaY:0,activo:true,creadoEn:'2026-11-02T12:00:00',actualizadoEn:null};
function read(req){if(req.body!==undefined)return Promise.resolve(req.body);return new Promise(resolve=>{let raw='';req.on('data',c=>raw+=c);req.on('end',()=>{try{resolve(raw?JSON.parse(raw):{});}catch{resolve({});}});});}
http.createServer(async(req,res)=>{
  const bodyPromise=read(req);
  const pathname=new URL(req.url,'http://localhost').pathname;
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','content-type,authorization');
  const send=(status,body)=>{res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(body));};
  if(req.method==='OPTIONS'){res.writeHead(204);return res.end();}
  if(pathname==='/__test'&&req.method==='POST'){
    const b=await bodyPromise;
    if(b.reset){await pm.state.set('us11-orders',[]);await pm.state.set('us11-calls',[]);}
    await pm.state.set('us11-mode',b.mode||'success');
    if(b.reset){await pm.state.set('us12-queries',[]);await pm.state.set('us12-disappeared',null);}
    await pm.state.set('us12-mode',b.readMode||'success');
    if(b.seed){
      const orders=Array.from({length:7},(_,i)=>({id:900+i,restauranteId:7,restauranteNombre:'Restaurante de prueba',clienteId:i===4?52:51,
        clienteNombre:i===4?'Otra cuenta de prueba':'Cliente de prueba',mesaId:i===0?19:null,
        estado:i===1?'ENTREGADO':'PENDIENTE',tipoEntrega:i===0?'SALON':i===1?'DELIVERY':'LLEVAR',
        direccionEntrega:i===1?'Calle de prueba 456':null,total:i===1?15:28,
        fechaCreacion:'2026-11-02T14:0'+i+':00',limiteCancelacion:null,
        detalles:[{id:1000+i,platoId:31,nombrePlatoSnapshot:i===1?'Segundo plato histórico':'Plato histórico',
          cantidad:i===1?1:2,precioUnitario:i===1?15:14,subtotal:i===1?15:28,notas:null}]}));
      await pm.state.set('us11-orders',orders);
    }
    if(b.tracking){
      const orders=await pm.state.get('us11-orders')||[];
      const allowed=['PENDIENTE','EN_PREPARACION','LISTO','ENTREGADO','CANCELADO'];
      if(!allowed.includes(b.tracking.estado))return send(400,{mensaje:'Estado de prueba inválido.'});
      await pm.state.set('us11-orders',orders.map(order=>order.id===b.tracking.id?{...order,estado:b.tracking.estado}:order));
    }
    if(b.removeId){const orders=await pm.state.get('us11-orders')||[];await pm.state.set('us11-orders',orders.filter(order=>order.id!==b.removeId));}
    return send(200,{ok:true});
  }
  if(pathname==='/__test'&&req.method==='GET')return send(200,{orders:await pm.state.get('us11-orders')||[],calls:await pm.state.get('us11-calls')||[],queries:await pm.state.get('us12-queries')||[]});
  if(pathname==='/auth/login'&&req.method==='POST'){
    const b=await bodyPromise;
    if(b.correo!=='cliente@example.test'||b.password!=='solo-pruebas')return send(403,{mensaje:'Credenciales incorrectas.'});
    const encode=o=>Buffer.from(JSON.stringify(o)).toString('base64url');
    const claims={userId:51,sub:b.correo,rol:'CLIENTE',exp:Math.floor(Date.now()/1000)+3600};
    const token=encode({alg:'HS256',typ:'JWT'})+'.'+encode(claims)+'.firma-sintetica-no-valida';
    return send(200,{mensaje:'Acceso de prueba',token,id:51,nombreCompleto:'Cliente de prueba',correo:b.correo,rol:'CLIENTE',restauranteId:null});
  }
  if(!req.headers.authorization?.startsWith('Bearer '))return send(401,{mensaje:'Sesión requerida.'});
  if(req.method==='GET'&&pathname==='/restaurantes')return send(200,[restaurant]);
  if(req.method==='GET'&&pathname==='/restaurantes/7')return send(200,restaurant);
  if(req.method==='GET'&&pathname==='/platos/restaurante/7')return send(200,[dish]);
  if(req.method==='GET'&&pathname==='/mesas/restaurante/7')return send(200,[table]);

  if(req.method==='GET'&&pathname.startsWith('/pedidos')){
    const queries=await pm.state.get('us12-queries')||[];queries.push(req.url);await pm.state.set('us12-queries',queries);
    const mode=await pm.state.get('us12-mode')||'success';
    const orders=await pm.state.get('us11-orders')||[];
    if(pathname==='/pedidos/me'){
      if(mode==='list-error')return send(500,{mensaje:'Error de prueba.'});
      const params=new URL(req.url,'http://localhost').searchParams;
      const page=Number(params.get('page')||0),size=Number(params.get('size')||5);
      let own=orders.filter(p=>p.clienteId===51).sort((a,b)=>b.fechaCreacion.localeCompare(a.fechaCreacion)||b.id-a.id);
      if(mode==='list-empty')own=[];
      if(mode==='list-foreign')own=[orders.find(p=>p.clienteId===52)];
      return send(200,{mensaje:'Consulta de prueba',pedidos:own.slice(page*size,(page+1)*size),totalElementos:own.length,totalPaginas:Math.ceil(own.length/size)});
    }
    const match=/^\/pedidos\/(\d+)(\/pagos)?$/.exec(pathname);
    if(!match)return send(501,{mensaje:'Consulta no incluida en la simulación.'});
    const id=Number(match[1]),order=orders.find(p=>p.id===id&&p.clienteId===51);
    if(!order)return send(404,{mensaje:'Pedido no encontrado.'});
    if(match[2]){
      if(mode==='pay-error')return send(500,{mensaje:'Error de prueba.'});
      if(mode==='pay-forbidden')return send(403,{mensaje:'Acceso restringido.'});
      if(mode==='pay-unauthorized')return send(401,{mensaje:'Sesión no válida.'});
      if(mode==='disappear-after-payment'){await pm.state.set('us12-disappeared',id);return send(404,{mensaje:'Pedido no encontrado.'});}
      if(id===903||mode==='pay-missing')return send(404,{mensaje:'No existe registro de pago para el pedido.'});
      if(mode==='pay-slow')await new Promise(r=>setTimeout(r,900));
      const paid=id===901;
      return send(200,{mensaje:'Detalle de pago consultado.',id:2000+id,pedidoId:mode==='pay-wrong-order'?901:id,
        monto:mode==='pay-malformed'?order.total+5:order.total,metodo:paid?'TARJETA':id===902?'EFECTIVO':null,
        estado:paid?'PAGADO':'PENDIENTE',codigoReferencia:paid?'REF-PRUEBA':null,
        fechaPago:paid?'2026-11-02T15:00:00':null,creadoEn:'2026-11-02T14:00:00'});
    }
    if(await pm.state.get('us12-disappeared')===id)return send(404,{mensaje:'Pedido no encontrado.'});
    if(mode==='order-error')return send(500,{mensaje:'Error de prueba.'});
    if(mode==='order-forbidden')return send(403,{mensaje:'Acceso restringido.'});
    if(mode==='order-unauthorized')return send(401,{mensaje:'Sesión no válida.'});
    if(mode==='order-slow'&&id===900)await new Promise(r=>setTimeout(r,900));
    if(mode==='order-malformed')return send(200,{...order,estado:'INVENTADO'});
    if(mode==='foreign-body')return send(200,{...order,clienteId:52,clienteNombre:'Otra cuenta de prueba'});
    return send(200,order);
  }

  if(req.method==='POST'&&pathname==='/pedidos'){
    const b=await bodyPromise;
    const calls=await pm.state.get('us11-calls')||[];calls.push(b);await pm.state.set('us11-calls',calls);
    const mode=await pm.state.get('us11-mode')||'success';
    if(mode==='reject')return send(400,{mensaje:'El plato se encuentra agotado.'});
    if(mode==='unauthorized')return send(401,{mensaje:'Sesión no válida.'});
    if(mode==='html500'){res.writeHead(500,{'Content-Type':'text/html'});return res.end('<h1>Error de prueba</h1>');}
    if(b.restauranteId!==7||!['SALON','DELIVERY','LLEVAR','RECOGER'].includes(b.tipoEntrega)||
       !Array.isArray(b.detalles)||b.detalles.length!==1||b.detalles[0].platoId!==31||
       !Number.isInteger(b.detalles[0].cantidad)||b.detalles[0].cantidad<1||'total'in b||'clienteId'in b||
       (b.tipoEntrega==='SALON'&&b.mesaId!==19)||(b.tipoEntrega!=='SALON'&&b.mesaId!==null)||
       (b.tipoEntrega==='DELIVERY'&&!b.direccionEntrega?.trim())||(b.tipoEntrega!=='DELIVERY'&&b.direccionEntrega!==null))return send(400,{mensaje:'Solicitud incompatible con el contrato.'});
    const orders=await pm.state.get('us11-orders')||[];
    // Precio confirmado diferente del estimado: verifica que la UI utiliza la respuesta.
    const order={id:900+orders.length,restauranteId:7,restauranteNombre:restaurant.nombre,clienteId:51,
      clienteNombre:'Cliente de prueba',mesaId:b.mesaId,estado:'PENDIENTE',tipoEntrega:b.tipoEntrega,
      direccionEntrega:b.direccionEntrega,total:14*b.detalles[0].cantidad,fechaCreacion:'2026-11-02T14:00:00',
      limiteCancelacion:'2026-11-02T14:05:00',detalles:[{id:1000+orders.length,platoId:31,nombrePlatoSnapshot:dish.nombre,
        cantidad:b.detalles[0].cantidad,precioUnitario:14,subtotal:14*b.detalles[0].cantidad,notas:b.detalles[0].notas}]};
    orders.push(order);await pm.state.set('us11-orders',orders);
    if(mode==='slow')await new Promise(r=>setTimeout(r,800));
    if(mode==='malformed')return send(201,{id:order.id});
    return send(201,order);
  }
  return send(501,{mensaje:'Ruta no incluida en esta simulación de US11.'});
}).listen(process.env.PORT||4501);
