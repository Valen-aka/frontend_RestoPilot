const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),esbuild=require('esbuild');
require('@angular/compiler');
const bundle=esbuild.buildSync({entryPoints:['src/app/pages/reserva-expirada-ui/reserva-selection.ts'],bundle:true,platform:'node',format:'cjs',packages:'external',write:false});
const scope={module:{exports:{}},exports:{},require};vm.runInNewContext(bundle.outputFiles[0].text,scope);const {reservaSelection}=scope.module.exports;
const params=value=>{const p=new URLSearchParams(value);return {has:k=>p.has(k),get:k=>p.get(k)};};
test('enlaces actuales, anteriores y navegación conservan la identidad de la reserva',()=>{
 assert.equal(reservaSelection(params('reservaId=802'),{}),802);assert.equal(reservaSelection(params('id=803'),{}),803);
 assert.equal(reservaSelection(params(''),{expiredReservationId:802}),802);assert.equal(reservaSelection(params(''),{reservaId:803}),803);
 assert.equal(reservaSelection(params('reservaId=802&id=803'),{expiredReservationId:804}),802);
});
test('ID explícito inválido no consulta otra reserva desde una selección anterior',()=>{
 for(const value of ['','abc','0','-1','1.5','9007199254740992'])assert.equal(reservaSelection(params('reservaId='+value+'&id=802'),{expiredReservationId:803}),undefined);
 assert.equal(reservaSelection(params('id=abc'),{reservaId:803}),undefined);assert.equal(reservaSelection(params(''),{}),undefined);
});
