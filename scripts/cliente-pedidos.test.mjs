import {test} from 'node:test';
import assert from 'node:assert/strict';
import {SAMPLE_CLIENT_ID, SAMPLE_CLIENT_ORDERS, clientOrderHistory, findClientOrder, validClientOrder, vistaForStatus} from '../src/app/pages/cliente/pedido-ui/pedido.model.ts';
test('historial conserva identidad, importe y orden cronológico sin mutar la fuente',()=>{
 const source=Object.freeze([...SAMPLE_CLIENT_ORDERS].reverse()),before=structuredClone(source);
 assert.deepEqual(clientOrderHistory(source).map(r=>r.order.id),[1042,1034,1028]);
 assert.deepEqual(source,before);assert(SAMPLE_CLIENT_ORDERS.every(validClientOrder));
 assert.deepEqual(clientOrderHistory(source).map(r=>r.order.total),[66,38,28]);
});
test('excluye pedidos ajenos incluso si comparten un identificador',()=>{
 const foreign={...SAMPLE_CLIENT_ORDERS[0],clientId:'otra-cuenta'};
 assert.equal(clientOrderHistory([foreign]).length,0);assert.equal(findClientOrder([foreign],1042),undefined);
 assert.equal(findClientOrder([foreign,...SAMPLE_CLIENT_ORDERS],1042)?.clientId,SAMPLE_CLIENT_ID);
});
test('selección inexistente, inválida o ambigua no se sustituye por el pedido de referencia',()=>{
 for(const id of [undefined,null,'1042',0,-1,999,NaN,1042.5])assert.equal(findClientOrder(SAMPLE_CLIENT_ORDERS,id),undefined);
 assert.equal(findClientOrder([...SAMPLE_CLIENT_ORDERS,SAMPLE_CLIENT_ORDERS[0]],1042),undefined);
});
test('cada selección conserva sus líneas, modalidad y pago propio',()=>{
 const a=findClientOrder(SAMPLE_CLIENT_ORDERS,1042),b=findClientOrder(SAMPLE_CLIENT_ORDERS,1034),c=findClientOrder(SAMPLE_CLIENT_ORDERS,1028);
 assert.equal(a.paymentRecord.orderId,1042);assert.equal(a.paymentRecord.amount,66);
 assert.equal(b.order.modality,'DELIVERY');assert.equal(b.order.lines.length,1);assert.equal(b.paymentRecord.amount,38);
 assert.equal(b.paymentRecord.method,'Efectivo');assert.equal(b.paymentRecord.reference,undefined);
 assert.equal(c.status,'Cancelado');assert.equal(c.payment,'missing');assert.equal(c.paymentRecord,undefined);
});
test('todos los estados navegan a una variante reconocida sin crear transiciones',()=>{
 assert.deepEqual(['Pendiente','En preparación','Listo','Entregado','Cancelado'].map(vistaForStatus),
 ['cliente-pedido-detalle','cliente-pedido-detalle','cliente-pedido-listo','cliente-pedido-entregado','cliente-pedido-cancelado']);
});
test('vacío legítimo y datos incompletos no generan pedidos alternativos',()=>{
 assert.deepEqual(clientOrderHistory([]),[]);
 const base=SAMPLE_CLIENT_ORDERS[0];
 assert.equal(validClientOrder({...base,createdAt:'inválida'}),false);
 assert.equal(validClientOrder({...base,order:{...base.order,lines:[]}}),false);
 assert.equal(validClientOrder({...base,order:{...base.order,total:NaN}}),false);
});
