const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),esbuild=require('esbuild');
const load=file=>{const out=esbuild.buildSync({entryPoints:[file],bundle:true,platform:'node',format:'cjs',write:false});const sandbox={module:{exports:{}},exports:{},require,Set,Date,Error,Object,Number};vm.runInNewContext(out.outputFiles[0].text,sandbox);return sandbox.module.exports;};
const api=load('src/app/core/models/pedido-query.model.ts'),ui=load('src/app/pages/cliente/pedido-ui/pedido-api.adapter.ts');
const order=()=>({id:900,restauranteId:7,restauranteNombre:'Prueba',clienteId:51,clienteNombre:'Cliente',mesaId:19,
 estado:'PENDIENTE',tipoEntrega:'SALON',direccionEntrega:null,total:28,fechaCreacion:'2026-11-02T14:00:00',limiteCancelacion:null,
 detalles:[{id:1000,platoId:31,nombrePlatoSnapshot:'Nombre histórico',cantidad:2,precioUnitario:14,subtotal:28,notas:null}]});
const pago=()=>({mensaje:'Detalle',id:2900,pedidoId:900,monto:28,estado:'PENDIENTE',metodo:null,codigoReferencia:null,fechaPago:null,creadoEn:'2026-11-02T14:00:00'});
test('IDs de URL válidos, sin coerciones ambiguas ni IDs inventados',()=>{
 for(const value of [null,undefined,'',0,'0','01','+900','9e2','900.0',NaN,[],900.5,'9007199254740992'])assert.equal(api.parsePedidoId(value),null);
 assert.equal(api.parsePedidoId('900'),900);assert.equal(api.parsePedidoId(900),900);
});
test('consulta conserva el snapshot histórico y total recibido, sin usar precios actuales',()=>{
 const raw=order(),p=api.readPedido(raw,900),snapshot=ui.orderSnapshot(p);
 assert.equal(snapshot.lines[0].name,'Nombre histórico');assert.equal(snapshot.lines[0].unitPrice,14);assert.equal(snapshot.total,28);
 assert.equal(snapshot.table,'Mesa asignada · ID 19');assert.equal(snapshot.restaurantAddress,undefined);
 assert.equal(snapshot.requestedAt,'02/11/2026 · 14:00');assert(Object.isFrozen(p.detalles[0]));
});
test('pedido inválido, distinto o incompleto produce error de contrato sin muestra de respaldo',()=>{
 for(const patch of [{id:901},{estado:'INVENTADO'},{total:Infinity},{detalles:[]},{mesaId:null},{fechaCreacion:'2026-02-30T14:00:00'}])assert.throws(()=>api.readPedido({...order(),...patch},900));
 const raw=order();raw.detalles=[raw.detalles[0],raw.detalles[0]];assert.throws(()=>api.readPedido(raw,900));
 assert.throws(()=>api.readPedido(null,900));
});
test('pago pendiente admite método registrado sin inventar fecha o confirmación',()=>{
 const raw=pago(),p=api.readPago(raw,900,28);assert.equal(ui.paymentSnapshot(p).method,undefined);assert.equal(ui.paymentSnapshot(p).registeredAt,undefined);
 raw.metodo='EFECTIVO';const saved=ui.paymentSnapshot(api.readPago(raw,900,28));assert.equal(saved.method,'Efectivo');assert.equal(saved.registeredAt,undefined);
});
test('pago confirmado conserva método, referencia y fecha propia',()=>{
 const p=api.readPago({...pago(),estado:'PAGADO',metodo:'PLIN',codigoReferencia:'REF',fechaPago:'2026-11-02T15:30:00'},900,28),s=ui.paymentSnapshot(p);
 assert.equal(s.method,'Plin');assert.equal(s.reference,'REF');assert.equal(s.registeredAt,'02/11/2026 · 15:30');
});
test('no acepta pagos de otro pedido, importes distintos ni datos incompatibles',()=>{
 for(const patch of [{pedidoId:901},{monto:66},{estado:'ENTREGADO'},{metodo:'OTRO'},{fechaPago:'2026-11-02T15:30:00'},{creadoEn:'ayer'}])assert.throws(()=>api.readPago({...pago(),...patch},900,28));
 assert.throws(()=>api.readPago([],900,28));
});
test('listado usa pedidos y metadatos de paginación reales, sin asumir content',()=>{
 const p=api.readPedidosPage({mensaje:'Consulta',pedidos:[order()],totalElementos:1,totalPaginas:1});assert.equal(p.pedidos[0].id,900);
 assert.throws(()=>api.readPedidosPage({content:[order()],totalElements:1}));
 assert.throws(()=>api.readPedidosPage({mensaje:'',pedidos:[order(),order()],totalElementos:2,totalPaginas:1}));
 assert.throws(()=>api.readPedidosPage({mensaje:'',pedidos:[],totalElementos:-1,totalPaginas:0}));
});
test('fechas locales no se reinterpretan como UTC y estados de pedido no deducen pago',()=>{
 assert(api.localDateTime('2024-02-29T23:59:59.123456789'));assert.equal(api.localDateTime('2026-02-29T23:59:59'),false);
 assert.equal(api.localDateTime('2026-11-02T24:00:00'),false);assert.equal(api.localDateTime('2026-11-02T14:00:00Z'),false);
 for(const estado of ['PENDIENTE','EN_PREPARACION','LISTO','ENTREGADO','CANCELADO']){
   const p=api.readPedido({...order(),estado},900);assert.equal(p.estado,estado);assert.equal(api.readPago(pago(),900,28).estado,'PENDIENTE');
 }
});
