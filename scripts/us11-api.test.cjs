const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),esbuild=require('esbuild');
const load=file=>{const out=esbuild.buildSync({entryPoints:[file],bundle:true,platform:'node',format:'cjs',write:false});
  const sandbox={module:{exports:{}},exports:{},require,Set,Error,Object,Number};vm.runInNewContext(out.outputFiles[0].text,sandbox);return sandbox.module.exports;};
const cart=load('src/app/pages/cliente/carrito-ui/carrito.model.ts'),api=load('src/app/core/models/pedido-api.model.ts');
const draft=()=>({restaurantId:7,restaurant:'Prueba',conditions:{active:true,open:true,salon:true,delivery:true},
  tables:[{id:19,restaurantId:7,label:'Mesa 4',active:true}],lines:[{id:31,restaurantId:7,name:'Plato',unitCents:1250,available:true,quantity:2}]});
test('payload de las cuatro modalidades limpia campos incompatibles y no envía total/cliente/precios',()=>{
  for(const modalidad of ['SALON','LLEVAR','RECOGER','DELIVERY']){
    const d=draft(),before=JSON.stringify(d),p=cart.buildPedidoRequest(d,modalidad,19,'  Avenida 123  ');
    assert.deepEqual(Object.keys(p).sort(),['detalles','direccionEntrega','mesaId','restauranteId','tipoEntrega']);
    assert.equal(p.mesaId,modalidad==='SALON'?19:null);assert.equal(p.direccionEntrega,modalidad==='DELIVERY'?'Avenida 123':null);
    assert.equal(p.detalles[0].platoId,31);assert.equal(p.detalles[0].cantidad,2);assert.equal(p.detalles[0].notas,null);
    assert.equal(JSON.stringify(d),before);
  }
});
test('rechaza IDs de muestra, platos de otro local, cantidades inválidas, agotados y notas largas',()=>{
  for(const patch of [{id:'lomo'},{restaurantId:8},{quantity:0},{quantity:null},{quantity:1.5},{quantity:2147483648},{available:false},{notes:'x'.repeat(256)}]){
    const d=draft();Object.assign(d.lines[0],patch);assert.throws(()=>cart.buildPedidoRequest(d,'LLEVAR',null,''));
  }
  assert.throws(()=>cart.buildPedidoRequest(null,'LLEVAR',null,''));
  const empty=draft();empty.lines=[];assert.throws(()=>cart.buildPedidoRequest(empty,'LLEVAR',null,''));
});
test('respeta condiciones de restaurante, mesa y delivery sin imponer campos a llevar/recoger',()=>{
  for(const field of ['active','open']){const d=draft();d.conditions[field]=false;assert.throws(()=>cart.buildPedidoRequest(d,'LLEVAR',null,''));}
  for(const patch of [{active:false},{restaurantId:8}]){const d=draft();Object.assign(d.tables[0],patch);assert.throws(()=>cart.buildPedidoRequest(d,'SALON',19,''));}
  assert.throws(()=>cart.buildPedidoRequest(draft(),'SALON',null,''));
  for(const address of ['   ','x'.repeat(256)])assert.throws(()=>cart.buildPedidoRequest(draft(),'DELIVERY',null,address));
  const d=draft();d.conditions.salon=false;d.conditions.delivery=false;
  assert.throws(()=>cart.buildPedidoRequest(d,'SALON',19,''));assert.throws(()=>cart.buildPedidoRequest(d,'DELIVERY',null,'Calle 1'));
  assert.doesNotThrow(()=>cart.buildPedidoRequest(d,'RECOGER',null,''));
});
const response=()=>({id:900,restauranteId:7,restauranteNombre:'Prueba',clienteId:51,clienteNombre:'Prueba',mesaId:null,
  estado:'PENDIENTE',tipoEntrega:'LLEVAR',direccionEntrega:null,total:28,fechaCreacion:'2026-11-02T12:00:00',limiteCancelacion:null,
  detalles:[{id:1,platoId:31,nombrePlatoSnapshot:'Histórico',cantidad:2,precioUnitario:14,subtotal:28,notas:null}]});
test('confirmación conserva total y snapshot del servidor aunque difieran del estimado',()=>{
  const p=api.confirmedPedido(response(),cart.buildPedidoRequest(draft(),'LLEVAR',null,''));
  assert.equal(p.total,28);assert.equal(p.detalles[0].nombrePlatoSnapshot,'Histórico');assert(Object.isFrozen(p));assert(Object.isFrozen(p.detalles[0]));
});
test('no acepta una confirmación incompleta, de otro restaurante o con detalles distintos',()=>{
  const request=cart.buildPedidoRequest(draft(),'LLEVAR',null,'');
  for(const patch of [{restauranteId:8},{estado:'LISTO'},{total:NaN},{detalles:[]},{mesaId:19},{fechaCreacion:'inventada'}])assert.throws(()=>api.confirmedPedido({...response(),...patch},request));
  assert.throws(()=>api.confirmedPedido({id:900},request));
  const r=response();r.detalles[0].cantidad=3;assert.throws(()=>api.confirmedPedido(r,request));
});
