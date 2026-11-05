// Solo simulación local: fechas, cuentas y JWT sintéticos. No usar como backend.
const http=require('node:http');
const seed=()=>[800,801,802,803].map(id=>({id,mesaId:19,mesaNumero:4,restauranteId:7,restauranteNombre:'Local de prueba US25',clienteId:51,clienteNombre:'Cliente de prueba',
 fecha:'2026-11-03',horaInicio:'10:00:00',horaFin:'11:00:00',numeroComensales:2,notas:'Mesa junto a la ventana',creadoEn:'2026-11-01T09:00:00',motivoRechazo:null,
 estado:id===802?'EXPIRADA':id===803?'COMPLETADA':'CONFIRMADA',llegadaRegistradaEn:id===801||id===803?'2026-11-03T09:58:00':null,
 completadaEn:id===803?'2026-11-03T10:05:00':null,expiradaEn:id===802?'2026-11-03T10:15:00':null}));
const now=mode=>mode==='early'?'2026-11-03T09:58:00':mode==='expired'?'2026-11-03T10:15:00':'2026-11-03T10:05:00';
const metadata=(r,mode)=>({...r,fechaHoraServidor:now(mode),puedeRegistrarLlegada:r.estado==='CONFIRMADA'&&!r.llegadaRegistradaEn,
 puedeCompletar:r.estado==='CONFIRMADA'&&!!r.llegadaRegistradaEn&&now(mode)>=r.fecha+'T'+r.horaInicio});
http.createServer(async(req,res)=>{
 let body=req.body;if(body===undefined)body=await new Promise(resolve=>{let raw='';req.on('data',c=>raw+=c);req.on('end',()=>{try{resolve(JSON.parse(raw||'{}'));}catch{resolve({});}});});
 const url=new URL(req.url,'http://localhost'),p=url.pathname;
 res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Methods','GET,POST,PATCH,OPTIONS');res.setHeader('Access-Control-Allow-Headers','content-type,authorization');
 const send=(code,value)=>{res.writeHead(code,{'Content-Type':'application/json'});res.end(JSON.stringify(value));};
 if(req.method==='OPTIONS'){res.writeHead(204);return res.end();}
 if(p==='/__test'){
  if(req.method==='POST'){if(body.reset){await pm.state.set('us25-reservations',seed());await pm.state.set('us25-calls',[]);await pm.state.set('us25-after-change',false);}await pm.state.set('us25-mode',body.mode||'success');}
  return send(200,{calls:await pm.state.get('us25-calls')||[],mode:await pm.state.get('us25-mode')||'success'});
 }
 if(p==='/auth/login'&&req.method==='POST'){
  const role=body.correo==='cliente@example.test'?'CLIENTE':body.correo==='dueno@example.test'?'DUENO':'ADMINISTRADOR';
  const rid=role==='CLIENTE'||body.correo==='sinlocal@example.test'?null:7;
  const claims={userId:70,sub:body.correo,rol:role,exp:Math.floor(Date.now()/1000)+3600};if(rid)claims.restauranteId=rid;
  const enc=x=>Buffer.from(JSON.stringify(x)).toString('base64url');
  return send(200,{mensaje:'Acceso de prueba',id:70,nombreCompleto:'Cuenta prueba',correo:body.correo,rol:role,restauranteId:rid,
   token:enc({alg:'HS256',typ:'JWT'})+'.'+enc(claims)+'.firma-sintetica'});
 }

 if(p.startsWith('/reservas/')){
  const calls=await pm.state.get('us25-calls')||[];calls.push({method:req.method,path:p,authorized:!!req.headers.authorization});await pm.state.set('us25-calls',calls);
  if(!req.headers.authorization)return send(403,{mensaje:'Acceso restringido'});
  const mode=String(await pm.state.get('us25-mode')||'success'),data=await pm.state.get('us25-reservations')||seed();
  const id=Number(p.split('/')[2]),index=data.findIndex(r=>r.id===id);if(index<0)return send(404,{mensaje:'Reserva no encontrada'});
  const r=data[index];
  if(req.method==='PATCH'){
   const action=p.split('/')[3];
   if(mode==='patch403'||mode==='patch404')return send(mode==='patch403'?403:404,{mensaje:'Operación rechazada'});
   if(mode==='expired'){r.estado='EXPIRADA';r.expiradaEn=now(mode);await pm.state.set('us25-reservations',data);return send(400,{mensaje:'La reserva debe estar CONFIRMADA'});}
   if(mode==='reject400'||mode==='reject409'){r.llegadaRegistradaEn='2026-11-03T09:59:00';await pm.state.set('us25-reservations',data);return send(mode==='reject400'?400:409,{mensaje:'Llegada registrada por otro operador'});}
   const flags=metadata(r,mode);
   if(r.estado!=='CONFIRMADA'||(action==='llegada'?!flags.puedeRegistrarLlegada:action==='completar'?!flags.puedeCompletar:true))return send(400,{mensaje:'Operación no permitida'});
   if(mode==='slow')await new Promise(resolve=>setTimeout(resolve,650));
   if(action==='llegada')r.llegadaRegistradaEn=now(mode);else{r.estado='COMPLETADA';r.completadaEn=now(mode);}
   await pm.state.set('us25-reservations',data);await pm.state.set('us25-after-change',true);
   if(mode==='lost'||mode==='lost-unavailable')return send(500,{mensaje:'Respuesta perdida después de guardar'});
   if(mode==='bad-contract')return send(200,{...metadata(r,mode),id:999999});
   return send(200,metadata(r,mode));
  }
  if(req.method!=='GET')return send(501,{mensaje:'Fuera del alcance'});
  if(mode==='read400')return send(400,{mensaje:'No tiene permisos para ver reservas de otro restaurante'});
  if(mode==='500'||mode==='lost-unavailable'||mode==='refresh-fail'&&await pm.state.get('us25-after-change'))return send(500,{mensaje:'Consulta no disponible'});
  const result=metadata(r,mode);
  if(mode==='foreign')result.restauranteId=8;
  if(mode==='missing'){delete result.fechaHoraServidor;delete result.puedeRegistrarLlegada;delete result.puedeCompletar;}
  return send(200,result);
 }
 if(p==='/restaurantes')return send(200,[]);
 return send(501,{mensaje:'Ruta no cubierta por la simulación de US25'});
}).listen(process.env.PORT||4505);
