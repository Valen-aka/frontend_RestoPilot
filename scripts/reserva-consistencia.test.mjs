import {test} from 'node:test';
import assert from 'node:assert/strict';
import {reservationSamples} from '../src/app/pages/reserva-muestra-ui/reserva-muestra.model.ts';
import {SAMPLE_RESERVATIONS, reservationVersion, updateAttendanceSample} from '../src/app/pages/operacion/reserva-atencion-ui/reserva-atencion.model.ts';
import {EXPIRY_SAMPLES, EXPIRY_CLIENT, expiredHistory, expiryEligibility} from '../src/app/pages/reserva-expirada-ui/reserva-expirada.model.ts';

const samples = () => reservationSamples(SAMPLE_RESERVATIONS, EXPIRY_SAMPLES, EXPIRY_CLIENT, 'La Mesa Verde');
function apply(records, action, now) {
  const current = records.find(record => record.id === 208);
  const result = updateAttendanceSample(records, {id:208, action, expectedVersion:reservationVersion(current)}, now);
  assert.equal(result.ok,true);
  return result.reservations;
}

test('las muestras de atención y expiración no comparten una identidad con estados contradictorios',()=>{
  const records = samples();
  assert.equal(new Set(records.map(r=>r.restaurantId+':'+r.id)).size, records.length);
  assert.equal(records.find(r=>r.id===208).status,'Confirmada');
  assert.deepEqual(expiredHistory(records,'operation').map(r=>r.id),[190,207]);
  assert.deepEqual(expiredHistory(records,'client').map(r=>r.id),[190,207]);
});
test('una llegada oportuna conserva identidad y metadatos y no entra al historial de expiradas',()=>{
  const records = apply(samples(),'arrival','2026-10-24T19:05:00-05:00');
  const attended = records.find(r=>r.id===208);
  assert.equal(attended.status,'Confirmada');
  assert.equal(attended.clientId,EXPIRY_CLIENT);
  assert.equal(attended.restaurant,'La Mesa Verde');
  assert.equal(expiryEligibility(attended,'2026-10-24T20:00:00-05:00'),false);
  assert.equal(expiredHistory(records,'operation').some(r=>r.id===208),false);
});
test('finalizar después de la tolerancia conserva Completada, ambas fechas y el historial expirado',()=>{
  const original = samples(), before = structuredClone(original);
  const arrived = apply(original,'arrival','2026-10-24T19:05:00-05:00');
  const completed = apply(arrived,'complete','2026-10-24T19:30:00-05:00');
  const reservation = completed.find(r=>r.id===208);
  assert.equal(reservation.status,'Completada');
  assert.equal(reservation.arrivedAt,'2026-10-25T00:05:00.000Z');
  assert.equal(reservation.completedAt,'2026-10-25T00:30:00.000Z');
  assert.equal(reservation.expiredAt,undefined);
  for(const context of ['client','operation']) assert.deepEqual(expiredHistory(completed,context).map(r=>r.id),[190,207]);
  assert.deepEqual(completed.filter(r=>r.id!==208), original.filter(r=>r.id!==208));
  assert.deepEqual(original,before);
});
test('una expirada no admite atención y una completada conserva su finalización ante repetición',()=>{
  const original=samples(), expired=original.find(r=>r.id===207);
  const rejection=updateAttendanceSample(original,{id:207,action:'arrival',expectedVersion:reservationVersion(expired)},'2026-10-24T19:30:00-05:00');
  assert.equal(rejection.ok,false);assert.equal(rejection.reservations,original);
  const completed=apply(apply(original,'arrival','2026-10-24T19:05:00-05:00'),'complete','2026-10-24T19:30:00-05:00');
  const reservation=completed.find(r=>r.id===208);
  const repeat=updateAttendanceSample(completed,{id:208,action:'complete',expectedVersion:reservationVersion(reservation)},'2026-10-24T19:40:00-05:00');
  assert.equal(repeat.ok,false);assert.equal(repeat.reservations,completed);
});
