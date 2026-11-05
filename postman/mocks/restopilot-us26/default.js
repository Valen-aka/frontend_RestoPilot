// Solo simulación local: fechas, cuentas y JWT sintéticos. No usar como backend.
const http=require('node:http');
const seed=()=>[800,801,802,803].map(id=>({id,mesaId:19,mesaNumero:4,restauranteId:7,restauranteNombre:'Local de prueba US26',clienteId:51,clienteNombre:'Cliente de prueba',
 fecha:'2026-11-03',horaInicio:'10:00:00',horaFin:'11:00:00',numeroComensales:2,notas:'Mesa junto a la ventana',creadoEn:'2026-11-01T09:00:00',motivoRechazo:null,
 estado:id===802?'EXPIRADA':id===803?'COMPLETADA':'CONFIRMADA',llegadaRegistradaEn:id===801||id===803?'2026-11-03T09:58:00':null,
 completadaEn:id===803?'2026-11-03T10:05:00':null,expiradaEn:id===802?'2026-11-03T10:15:00':null})).map(r=>({...r,mesaId:r.id-781,mesaNumero:r.id-796,...(r.id===802?{fecha:'2026-11-02',expiradaEn:'2026-11-02T10:15:00'}:{})}));
const now=mode=>mode==='expire-next'?'2026-11-03T10:16:00':mode==='early'?'2026-11-03T09:58:00':mode==='expired'?'2026-11-03T10:15:00':'2026-11-03T10:05:00';
const metadata=(r,mode)=>({...r,fechaHoraServidor:now(mode),puedeRegistrarLlegada:r.estado==='CONFIRMADA'&&!r.llegadaRegistradaEn,
 puedeCompletar:r.estado==='CONFIRMADA'&&!!r.llegadaRegistradaEn&&now(mode)>=r.fecha+'T'+r.horaInicio});
http.createServer(async(req,res)=>{
 let body=req.body;if(body===undefined)body=await new Promise(resolve=>{let raw='';req.on('data',c=>raw+=c);req.on('end',()=>{try{resolve(JSON.parse(raw||'{}'));}catch{resolve({});}});});
 const url=new URL(req.url,'http://localhost'),p=url.pathname;
 res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Methods','GET,POST,PATCH,OPTIONS');res.setHeader('Access-Control-Allow-Headers','content-type,authorization');
 const send=(code,value)=>{res.writeHead(code,{'Content-Type':'application/json'});res.end(JSON.stringify(value));};
 if(req.method==='OPTIONS'){res.writeHead(204);return res.end();}
 if(p==='/__test'){
  if(req.method==='POST'){if(body.reset){await pm.state.set('us26-reservations',seed());await pm.state.set('us26-calls',[]);await pm.state.set('us26-after-change',false);}await pm.state.set('us26-mode',body.mode||'success');}
  return send(200,{calls:await pm.state.get('us26-calls')||[],mode:await pm.state.get('us26-mode')||'success'});
 }
 if(p==='/auth/login'&&req.method==='POST'){
  const role=body.correo==='cliente@example.test'?'CLIENTE':body.correo==='dueno@example.test'?'DUENO':'ADMINISTRADOR';
  const rid=role==='CLIENTE'||body.correo==='sinlocal@example.test'?null:7;
  const uid=role==='CLIENTE'?51:70;const claims={userId:uid,sub:body.correo,rol:role,exp:Math.floor(Date.now()/1000)+3600};if(rid)claims.restauranteId=rid;
  const enc=x=>Buffer.from(JSON.stringify(x)).toString('base64url');
  return send(200,{mensaje:'Acceso de prueba',id:uid,nombreCompleto:'Cuenta prueba',correo:body.correo,rol:role,restauranteId:rid,
   token:enc({alg:'HS256',typ:'JWT'})+'.'+enc(claims)+'.firma-sintetica'});
 }


 if(req.method==='GET'&&(p==='/reservas'||p==='/reservas/me'||p==='/reservas/disponibilidad')){
  const calls=await pm.state.get('us26-calls')||[];calls.push({method:req.method,path:p,query:url.search,authorized:!!req.headers.authorization});await pm.state.set('us26-calls',calls);
  if(!req.headers.authorization)return send(403,{mensaje:'Acceso restringido'});
  const mode=String(await pm.state.get('us26-mode')||'success'),data=await pm.state.get('us26-reservations')||seed();
  if(mode==='expire-next'){
   const r=data.find(r=>r.id===800);if(r.estado==='CONFIRMADA'&&!r.llegadaRegistradaEn){r.estado='EXPIRADA';r.expiradaEn='2026-11-03T10:16:00';await pm.state.set('us26-reservations',data);}
  }
  if(p==='/reservas/disponibilidad'){
   if(mode==='availability-error')return send(500,{mensaje:'Consulta de disponibilidad fallida'});
   if(mode==='availability-slow')await new Promise(resolve=>setTimeout(resolve,650));
   const mesas=mode==='availability-empty'?[]:data.map(r=>({mesaId:r.mesaId,numero:r.mesaNumero,capacidad:4,coordenadaX:0,coordenadaY:0,
    disponible:mode==='availability-busy'?false:!['CONFIRMADA','PENDIENTE'].includes(r.estado)}));
   return send(200,{mensaje:'Disponibilidad de prueba',mesas});
  }
  if(mode==='500')return send(500,{mensaje:'Consulta fallida'});
  if(mode==='read400')return send(400,{mensaje:'Consulta rechazada'});
  const reservas=mode==='empty'?[]:data.map(r=>metadata(r,mode)).map((r,i)=>mode==='foreign-list'&&i===0?{...r,clienteId:52,restauranteId:8}:r);
  return send(200,{mensaje:'Historial de prueba',reservas});
 }
 if(p.startsWith('/reservas/')){
  const calls=await pm.state.get('us26-calls')||[];calls.push({method:req.method,path:p,authorized:!!req.headers.authorization});await pm.state.set('us26-calls',calls);
  if(!req.headers.authorization)return send(403,{mensaje:'Acceso restringido'});
  const mode=String(await pm.state.get('us26-mode')||'success'),data=await pm.state.get('us26-reservations')||seed();
  const id=Number(p.split('/')[2]),index=data.findIndex(r=>r.id===id);if(index<0)return send(404,{mensaje:'Reserva no encontrada'});
  const r=data[index];
  if(mode==='expire-next'&&r.id===800&&r.estado==='CONFIRMADA'&&!r.llegadaRegistradaEn){r.estado='EXPIRADA';r.expiradaEn='2026-11-03T10:16:00';await pm.state.set('us26-reservations',data);}
  if(req.method==='GET'&&mode==='missing-date'&&r.estado==='EXPIRADA')r.expiradaEn=null;
  if(req.method==='PATCH'){
   const action=p.split('/')[3];
   if(mode==='patch403'||mode==='patch404')return send(mode==='patch403'?403:404,{mensaje:'Operación rechazada'});
   if(mode==='expired'){r.estado='EXPIRADA';r.expiradaEn=now(mode);await pm.state.set('us26-reservations',data);return send(400,{mensaje:'La reserva debe estar CONFIRMADA'});}
   if(mode==='reject400'||mode==='reject409'){r.llegadaRegistradaEn='2026-11-03T09:59:00';await pm.state.set('us26-reservations',data);return send(mode==='reject400'?400:409,{mensaje:'Llegada registrada por otro operador'});}
   const flags=metadata(r,mode);
   if(r.estado!=='CONFIRMADA'||(action==='llegada'?!flags.puedeRegistrarLlegada:action==='completar'?!flags.puedeCompletar:true))return send(400,{mensaje:'Operación no permitida'});
   if(mode==='slow')await new Promise(resolve=>setTimeout(resolve,650));
   if(action==='llegada')r.llegadaRegistradaEn=now(mode);else{r.estado='COMPLETADA';r.completadaEn=now(mode);}
   await pm.state.set('us26-reservations',data);await pm.state.set('us26-after-change',true);
   if(mode==='lost'||mode==='lost-unavailable')return send(500,{mensaje:'Respuesta perdida después de guardar'});
   if(mode==='bad-contract')return send(200,{...metadata(r,mode),id:999999});
   return send(200,metadata(r,mode));
  }
  if(req.method!=='GET')return send(501,{mensaje:'Fuera del alcance'});
  if(mode==='read400')return send(400,{mensaje:'No tiene permisos para ver reservas de otro restaurante'});
  if(mode==='500'||mode==='lost-unavailable'||mode==='refresh-fail'&&await pm.state.get('us26-after-change'))return send(500,{mensaje:'Consulta no disponible'});
  const result=metadata(r,mode);
  if(mode==='foreign')result.restauranteId=8;
  if(mode==='missing'){delete result.fechaHoraServidor;delete result.puedeRegistrarLlegada;delete result.puedeCompletar;}
  return send(200,result);
 }
 if(p==='/restaurantes')return send(200,[]);
 return send(501,{mensaje:'Ruta no cubierta por la simulación de US26'});
}).listen(process.env.PORT||4506);
