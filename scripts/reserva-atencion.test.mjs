import {test} from 'node:test';
import assert from 'node:assert/strict';
import {SAMPLE_RESERVATIONS, ATTENDANCE_SAMPLE_NOW, reservationVersion, updateAttendanceSample, validReservation} from '../src/app/pages/operacion/reserva-atencion-ui/reserva-atencion.model.ts';
const base=SAMPLE_RESERVATIONS[0], command=(r,action)=>({id:r.id,action,expectedVersion:reservationVersion(r)});
const now=(time)=>'2026-10-24T'+time+'-05:00';
for(const time of ['18:58:00','19:00:00','19:14:59.999']) test('llegada válida '+time,()=>{
 const result=updateAttendanceSample(SAMPLE_RESERVATIONS,command(base,'arrival'),now(time));
 assert(result.ok);assert.equal(result.reservation.status,'Confirmada');assert.equal(Date.parse(result.reservation.arrivedAt),Date.parse(now(time)));
 assert.deepEqual({...result.reservation,arrivedAt:undefined},{...base,arrivedAt:undefined});assert.equal(base.arrivedAt,undefined);
});
for(const time of ['19:15:00','19:15:00.001','20:30:00']) test('tolerancia vencida '+time,()=>{
 const result=updateAttendanceSample(SAMPLE_RESERVATIONS,command(base,'arrival'),now(time));
 assert.equal(result.ok,false);assert.strictEqual(result.reservations,SAMPLE_RESERVATIONS);assert.equal(base.status,'Confirmada');
});
for(const status of ['Pendiente','Rechazada','Cancelada','Expirada']) for(const action of ['arrival','complete']) test(status+' rechaza '+action,()=>{
 const r={...base,status};const list=[r];const result=updateAttendanceSample(list,command(r,action),ATTENDANCE_SAMPLE_NOW);
 assert.equal(result.ok,false);assert.strictEqual(result.reservations,list);
});
test('llegada repetida conserva el registro original',()=>{
 const r={...base,arrivedAt:now('18:58:00')};const result=updateAttendanceSample([r],command(r,'arrival'),now('19:05:00'));
 assert.equal(result.ok,false);assert.match(result.reason,/ya fue registrada/);assert.equal(result.reservations[0].arrivedAt,r.arrivedAt);
});
test('completar sin llegada se rechaza',()=>{
 const result=updateAttendanceSample(SAMPLE_RESERVATIONS,command(base,'complete'),ATTENDANCE_SAMPLE_NOW);
 assert.equal(result.ok,false);assert.match(result.reason,/Registra la llegada/);
});
test('antes del inicio no se puede completar aunque la llegada sea válida',()=>{
 const r={...base,arrivedAt:now('18:58:00')};const result=updateAttendanceSample([r],command(r,'complete'),now('18:59:59.999'));
 assert.equal(result.ok,false);assert.match(result.reason,/antes de la hora/);
});
for(const time of ['19:00:00','19:15:00','20:40:00']) test('finalización válida '+time+' con llegada oportuna',()=>{
 const r={...base,arrivedAt:now('18:58:00')}, other={...base,id:209};const list=Object.freeze([Object.freeze(r),other]);
 const result=updateAttendanceSample(list,command(r,'complete'),now(time));assert(result.ok);
 assert.equal(result.reservation.status,'Completada');assert.equal(result.reservation.arrivedAt,r.arrivedAt);
 assert.equal(Date.parse(result.reservation.completedAt),Date.parse(now(time)));
 assert.deepEqual({...result.reservation,status:r.status,completedAt:undefined},{...r,completedAt:undefined});assert.strictEqual(result.reservations[1],other);
});
for(const action of ['arrival','complete']) test('Completada rechaza '+action,()=>{
 const r={...base,status:'Completada',arrivedAt:now('18:58:00'),completedAt:now('19:05:00')};const list=[r];
 const result=updateAttendanceSample(list,command(r,action),now('20:00:00'));assert.equal(result.ok,false);assert.strictEqual(result.reservations,list);
});
test('pedido de otro local, inexistente o ambiguo no modifica reservas',()=>{
 for(const list of [[],[{...base,restaurantId:'otro'}],[base,base]]){
  const result=updateAttendanceSample(list,command(base,'arrival'),ATTENDANCE_SAMPLE_NOW);assert.equal(result.ok,false);assert.strictEqual(result.reservations,list);
 }
});
test('el mismo ID de otro restaurante no se actualiza',()=>{
 const foreign={...base,restaurantId:'otro'};const result=updateAttendanceSample([foreign,base],command(base,'arrival'),ATTENDANCE_SAMPLE_NOW);
 assert(result.ok);assert.strictEqual(result.reservations[0],foreign);assert(result.reservations[1].arrivedAt);
});
test('cambio entre apertura y confirmación se rechaza aunque siga siendo válido el horario',()=>{
 const modified={...base,table:'Mesa 06'};const result=updateAttendanceSample([modified],command(base,'arrival'),ATTENDANCE_SAMPLE_NOW);
 assert.equal(result.ok,false);assert.match(result.reason,/cambió/);assert.equal(modified.arrivedAt,undefined);
});
test('la segunda confirmación de llegada no sobrescribe la primera',()=>{
 const request=command(base,'arrival');const first=updateAttendanceSample(SAMPLE_RESERVATIONS,request,ATTENDANCE_SAMPLE_NOW);assert(first.ok);
 const second=updateAttendanceSample(first.reservations,request,now('19:06:00'));assert.equal(second.ok,false);assert.strictEqual(second.reservations,first.reservations);
});
test('fechas incompletas, llegada tardía/futura o final incoherente no habilitan una acción',()=>{
 for(const r of [{...base,startsAt:'incorrecta'},{...base,endsAt:base.startsAt},{...base,arrivedAt:now('19:15:00')},
   {...base,status:'Completada'}, {...base,status:'Completada',arrivedAt:now('19:00:00'),completedAt:now('18:59:00')}]) assert.equal(validReservation(r),false);
 const future={...base,arrivedAt:now('19:10:00')};assert.equal(updateAttendanceSample([future],command(future,'complete'),ATTENDANCE_SAMPLE_NOW).ok,false);
 assert.equal(updateAttendanceSample(SAMPLE_RESERVATIONS,command(base,'arrival'),'incorrecta').ok,false);
});
test('compara instantes con offsets distintos',()=>{
 const result=updateAttendanceSample(SAMPLE_RESERVATIONS,command(base,'arrival'),'2026-10-25T00:14:59.999Z');assert(result.ok);
 assert.equal(updateAttendanceSample(SAMPLE_RESERVATIONS,command(base,'arrival'),'2026-10-25T00:15:00Z').ok,false);
});
