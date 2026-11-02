import {test} from 'node:test';
import assert from 'node:assert/strict';
import {SAMPLE_ORDERS, SAMPLE_RESTAURANT, isActive, maxComplexity, maxMinutes, orderUnits,
  prioritizeSample, validKitchenOrder} from '../src/app/pages/operacion/cocina-ui/cocina.model.ts';

const order = (id, complexity = 'Alta', preparationMinutes = 20, createdAt = '2026-10-20T13:10:00-05:00') => ({
  ...SAMPLE_ORDERS[0], id, createdAt,
  lines: [{...SAMPLE_ORDERS[0].lines[0], complexity, preparationMinutes}]
});
test('complejidad, tiempo, antigüedad e identificador determinan el orden sin mutar la entrada', () => {
  const entries = [order(206, 'Baja', 40, '2026-10-20T12:40:00-05:00'), order(203, 'Alta', 20, '2026-10-20T13:15:00-05:00'),
    order(202), order(204, 'Alta', 15, '2026-10-20T13:00:00-05:00'), order(205, 'Media', 30, '2026-10-20T12:50:00-05:00'), order(201)];
  const before = structuredClone(entries);
  assert.deepEqual(prioritizeSample(entries).map(o => o.id), [201,202,203,204,205,206]);
  assert.deepEqual(entries, before);
  assert.deepEqual(prioritizeSample(entries), prioritizeSample(entries));
});
test('los máximos se calculan sobre todos los platos y pueden proceder de líneas distintas', () => {
  const mixed = {...order(1), lines: [order(1, 'Alta', 5).lines[0], {...order(1, 'Baja', 30).lines[0], quantity: 50}]};
  assert.equal(maxComplexity(mixed), 'Alta');assert.equal(maxMinutes(mixed), 30);
  assert.deepEqual(prioritizeSample([order(2, 'Alta', 20), mixed]).map(o => o.id), [1,2]);
  assert.equal(orderUnits(mixed), 51);
});
test('el desempate por identificador es numérico y no lexicográfico', () => {
  assert.deepEqual(prioritizeSample([order(100),order(99)]).map(o => o.id), [99,100]);
});
test('la antigüedad compara instantes y no cadenas formateadas', () => {
  assert.deepEqual(prioritizeSample([order(1,'Alta',20,'2026-10-20T14:00:00-04:00'),
    order(2,'Alta',20,'2026-10-20T12:59:00-05:00')]).map(o => o.id),[2,1]);
});
test('una nueva entrada ocupa su prioridad; finalizados y otro restaurante quedan fuera de la muestra activa', () => {
  const collection = [...SAMPLE_ORDERS, order(50,'Alta',30), {...order(51),status:'Listo'},
    {...order(52),status:'Entregado'}, {...order(53),status:'Cancelado'}, {...order(54),restaurantId:'otro'}];
  const active = collection.filter(o => o.restaurantId === SAMPLE_RESTAURANT && isActive(o));
  assert.deepEqual(prioritizeSample(active).map(o => o.id),[50,1042,1041,1040]);
});
test('agrupar por estado conserva el orden relativo de la cola', () => {
  const queue = prioritizeSample([order(5,'Baja',30), {...order(2),status:'En preparación'}, order(1), {...order(4,'Media'),status:'En preparación'}]);
  assert.deepEqual(queue.filter(o => o.status === 'Pendiente').map(o => o.id), [1,5]);
  assert.deepEqual(queue.filter(o => o.status === 'En preparación').map(o => o.id), [2,4]);
});
test('datos incompletos no se aceptan como prioridad confirmada', () => {
  assert(SAMPLE_ORDERS.every(validKitchenOrder));
  for (const broken of [{...order(1),lines:[]},{...order(1),createdAt:'incorrecto'},order(1,'Desconocida'),
    order(1,'Alta',NaN),{...order(1),id:1.5},{...order(1),totalCents:-1}]) assert.equal(validKitchenOrder(broken),false);
});
test('cola vacía produce una colección vacía', () => {assert.deepEqual(prioritizeSample([]),[])});
