import {test} from 'node:test';
import assert from 'node:assert/strict';
import {SAMPLE_ORDERS, NEXT_KITCHEN_STATUS, transitionSample} from '../src/app/pages/operacion/cocina-ui/cocina.model.ts';

const states=['Pendiente','En preparación','Listo','Entregado','Cancelado'];
for(const current of states) for(const target of states) {
  test(`${current} → ${target}: ${NEXT_KITCHEN_STATUS[current]===target?'avance válido':'rechazado'}`,()=>{
    const selected=Object.freeze({...SAMPLE_ORDERS[0],status:current});
    const orders=Object.freeze([selected,SAMPLE_ORDERS[1]]), before=structuredClone(orders);
    const result=transitionSample(orders,{id:selected.id,expected:current,target});
    assert.equal(result.ok,NEXT_KITCHEN_STATUS[current]===target);
    assert.deepEqual(orders,before);
    if(result.ok){assert.equal(result.order.status,target);assert.deepEqual({...result.order,status:current},selected);assert.strictEqual(result.orders[1],orders[1]);}
    else {assert.strictEqual(result.orders,orders);assert(result.reason);}
  });
}
test('estado cambiado entre apertura y confirmación conserva el nuevo estado y no aplica otro avance',()=>{
 const orders=[{...SAMPLE_ORDERS[0],status:'En preparación'}];
 const result=transitionSample(orders,{id:1042,expected:'Pendiente',target:'En preparación'});
 assert.equal(result.ok,false);assert.strictEqual(result.orders,orders);assert.equal(orders[0].status,'En preparación');
});
test('pedido inexistente, ajeno o ambiguo no modifica la colección',()=>{
 for(const orders of [SAMPLE_ORDERS.map(o=>({...o,restaurantId:'otro'})),[],[SAMPLE_ORDERS[0],SAMPLE_ORDERS[0]]]){
  const result=transitionSample(orders,{id:1042,expected:'Pendiente',target:'En preparación'});
  assert.equal(result.ok,false);assert.strictEqual(result.orders,orders);
 }
});
test('la pertenencia se valida aunque un pedido ajeno tenga el mismo identificador',()=>{
 const foreign={...SAMPLE_ORDERS[0],restaurantId:'otro'};
 const result=transitionSample([foreign,SAMPLE_ORDERS[0]],{id:1042,expected:'Pendiente',target:'En preparación'});
 assert.equal(result.ok,true);assert.strictEqual(result.orders[0],foreign);assert.equal(result.orders[1].status,'En preparación');
});
test('la segunda confirmación de la misma acción se rechaza y conserva la primera',()=>{
 const command={id:1042,expected:'Pendiente',target:'En preparación'};
 const first=transitionSample(SAMPLE_ORDERS,command);assert(first.ok);
 const second=transitionSample(first.orders,command);assert.equal(second.ok,false);assert.strictEqual(second.orders,first.orders);
});
test('el pago pendiente o pagado no impide un avance válido y permanece intacto',()=>{
 for(const payment of ['Pendiente','Pagado']){
  const order={...SAMPLE_ORDERS[0],status:'Listo',payment};
  const result=transitionSample([order],{id:order.id,expected:'Listo',target:'Entregado'});
  assert(result.ok);assert.equal(result.order.payment,payment);assert.deepEqual({...result.order,status:'Listo'},order);
 }
});
test('datos incompletos no permiten cambiar de estado',()=>{
 const orders=[{...SAMPLE_ORDERS[0],lines:[]}];const result=transitionSample(orders,{id:1042,expected:'Pendiente',target:'En preparación'});
 assert.equal(result.ok,false);assert.strictEqual(result.orders,orders);
});
