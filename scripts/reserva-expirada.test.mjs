import {test} from 'node:test';
import assert from 'node:assert/strict';
import {EXPIRY_SAMPLES, EXPIRY_CLIENT, EXPIRY_RESTAURANT, belongsToExpiryContext, expiredHistory,
  expiryEligibility, expirationDate, expirationIssue, expirationReason, validExpiryReservation} from '../src/app/pages/reserva-expirada-ui/reserva-expirada.model.ts';
const base=EXPIRY_SAMPLES[1], now=time=>'2026-10-24T'+time+'-05:00';
for(const [state,time,expected] of [
 ['Pendiente','18:59:59.999',false],['Pendiente','19:00:00',true],['Pendiente','19:01:00',true],
 ['Confirmada','19:14:59.999',false],['Confirmada','19:15:00',true],['Confirmada','19:16:00',true]
]) test(`${state} a las ${time}: regla temporal ${expected}`,()=>{
 const reservation=Object.freeze({...base,status:state,expiredAt:undefined,expiryReason:undefined});const before=structuredClone(reservation);
 assert.equal(expiryEligibility(reservation,now(time)),expected);assert.deepEqual(reservation,before);assert.equal(reservation.status,state);
});
test('llegada oportuna no vence por inasistencia aunque haya pasado la tolerancia',()=>{
 const reservation={...base,status:'Confirmada',expiredAt:undefined,expiryReason:undefined,arrivedAt:now('18:58:00')};
 assert.equal(expiryEligibility(reservation,now('19:15:00')),false);assert.equal(expiryEligibility(reservation,now('20:00:00')),false);
 assert.equal(reservation.status,'Confirmada');assert.equal(reservation.arrivedAt,now('18:58:00'));
});
test('estados finales no se vuelven a vencer',()=>{
 for(const status of ['Completada','Cancelada','Rechazada','Expirada']) assert.equal(expiryEligibility({...base,status},now('21:00:00')),false);
});
test('offsets diferentes conservan los límites exactos',()=>{
 const reservation={...base,status:'Confirmada',expiredAt:undefined};
 assert.equal(expiryEligibility(reservation,'2026-10-25T00:14:59.999Z'),false);
 assert.equal(expiryEligibility(reservation,'2026-10-25T00:15:00Z'),true);
});
test('datos incompletos no producen un vencimiento inventado',()=>{
 assert.equal(expiryEligibility({...base,startsAt:'incorrecta'},now('21:00:00')),undefined);
 assert.equal(expiryEligibility(base,'incorrecta'),undefined);
 assert.equal(expiryEligibility({...base,status:'Confirmada',arrivedAt:now('19:15:00')},now('21:00:00')),undefined);
 assert.equal(validExpiryReservation({...base,endsAt:base.startsAt}),false);
});
test('el historial solo filtra por estado recibido y no cambia los registros',()=>{
 const active={...base,id:300,status:'Confirmada',expiredAt:undefined};const list=Object.freeze([...EXPIRY_SAMPLES,active]);const before=structuredClone(list);
 assert.deepEqual(expiredHistory(list,'client').map(r=>r.id),[190,207]);assert.deepEqual(list,before);assert.equal(active.status,'Confirmada');
});
test('cliente consulta sus reservas y operación las de su restaurante',()=>{
 const otherClient={...base,id:301,clientId:'otro-cliente'},otherRestaurant={...base,id:302,restaurantId:'otro-restaurante'};
 const list=[...EXPIRY_SAMPLES,otherClient,otherRestaurant];
 assert.deepEqual(expiredHistory(list,'client').map(r=>r.id),[190,207,302]);
 assert.deepEqual(expiredHistory(list,'operation').map(r=>r.id),[190,207,301]);
 assert(belongsToExpiryContext({...base,clientId:EXPIRY_CLIENT},'client'));
 assert(belongsToExpiryContext({...base,restaurantId:EXPIRY_RESTAURANT},'operation'));
});
test('fecha recibida se conserva; la consulta no la reemplaza por el instante actual',()=>{
 for(const reservation of EXPIRY_SAMPLES){const before=structuredClone(reservation);assert.equal(expirationIssue(reservation),'');assert.notEqual(expirationDate(reservation),'No disponible');assert.deepEqual(reservation,before)}
 assert.match(expirationDate(EXPIRY_SAMPLES[0]),/19:00/);assert.match(expirationDate(EXPIRY_SAMPLES[1]),/19:15/);
});
test('fecha ausente o incoherente se informa sin calcular una alternativa',()=>{
 for(const expiredAt of [undefined,'incorrecta',now('18:00:00')]){
  const reservation={...base,expiredAt};assert(expirationIssue(reservation));assert.equal(expirationDate(reservation),'No disponible');assert.equal(reservation.expiredAt,expiredAt);
 }
});
test('motivos se distinguen y el desconocido no se adivina',()=>{
 assert.match(expirationReason(EXPIRY_SAMPLES[0]),/pendiente de confirmación/);
 assert.match(expirationReason(EXPIRY_SAMPLES[1]),/15 minutos/);
 assert.match(expirationReason({...base,expiryReason:undefined}),/no está disponible/);
 assert.match(expirationReason({...base,arrivedAt:now('18:58:00')}),/no está disponible/);
});
test('historial vacío no crea filas de ejemplo',()=>{assert.deepEqual(expiredHistory([],'client'),[])});
