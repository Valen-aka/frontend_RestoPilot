BEGIN;
CREATE OR REPLACE FUNCTION restopilot.rp_expirar() RETURNS integer LANGUAGE plpgsql VOLATILE SET search_path='' AS $$
DECLARE now timestamp:=restopilot.rp_now();r restopilot.reservas;n integer:=0;BEGIN
 FOR r IN SELECT * FROM restopilot.reservas WHERE (estado='PENDIENTE' AND fecha+hora_inicio<=now) OR (estado='CONFIRMADA' AND llegada_registrada_en IS NULL AND fecha+hora_inicio+interval '15 minutes'<=now) FOR UPDATE SKIP LOCKED LOOP
  UPDATE restopilot.reservas SET estado='EXPIRADA',expirada_en=now,actualizado_en=now,version=version+1 WHERE id=r.id;
  PERFORM restopilot.rp_notify(r.usuario_id,'Reserva #'||r.id||': EXPIRADA. Se liberó la mesa.');n:=n+1;
 END LOOP;RETURN n;
END $$;
CREATE OR REPLACE FUNCTION restopilot.rp_reservation(eid bigint) RETURNS jsonb LANGUAGE sql VOLATILE SET search_path='' AS $$
SELECT jsonb_build_object('id',v.id,'mesaId',v.mesa_id,'mesaNumero',m.numero,'restauranteId',v.restaurante_id,'restauranteNombre',r.nombre,'clienteId',v.usuario_id,'clienteNombre',u.nombre_completo,'fecha',v.fecha,'horaInicio',v.hora_inicio,'horaFin',v.hora_fin,'numeroComensales',v.numero_comensales,'estado',v.estado,'notas',v.notas,'creadoEn',v.creado_en,'motivoRechazo',v.motivo_rechazo,'llegadaRegistradaEn',v.llegada_registrada_en,'completadaEn',v.completada_en,'expiradaEn',v.expirada_en,'fechaHoraServidor',restopilot.rp_now(),'puedeRegistrarLlegada',v.estado='CONFIRMADA' AND v.llegada_registrada_en IS NULL AND restopilot.rp_now()<v.fecha+v.hora_inicio+interval '15 minutes','puedeCompletar',v.estado='CONFIRMADA' AND v.llegada_registrada_en IS NOT NULL AND restopilot.rp_now()>=v.fecha+v.hora_inicio)
FROM restopilot.reservas v JOIN restopilot.mesas m ON m.id=v.mesa_id JOIN restopilot.restaurantes r ON r.id=v.restaurante_id JOIN restopilot.usuarios u ON u.id=v.usuario_id WHERE v.id=eid $$;
CREATE OR REPLACE FUNCTION restopilot.rp_module(rid bigint) RETURNS jsonb LANGUAGE sql VOLATILE SET search_path='' AS $$
SELECT jsonb_build_object('restauranteId',r.id,'restauranteNombre',r.nombre,'habilitado',r.tiene_atencion_fisica,'reservasActivas',(SELECT count(*) FROM restopilot.reservas WHERE restaurante_id=r.id AND estado IN ('PENDIENTE','CONFIRMADA') AND fecha>=restopilot.rp_now()::date),'mensaje',CASE WHEN r.tiene_atencion_fisica THEN 'La atención física está habilitada.' ELSE 'La atención física está pausada.' END) FROM restopilot.restaurantes r WHERE r.id=rid $$;
CREATE OR REPLACE FUNCTION restopilot.rp_schedule(rid bigint,dt date,hi time,hf time,written boolean) RETURNS void LANGUAGE plpgsql VOLATILE SET search_path='' AS $$
DECLARE r restopilot.restaurantes;BEGIN SELECT * INTO r FROM restopilot.restaurantes WHERE id=rid;IF r.id IS NULL THEN PERFORM restopilot.rp_fail(404,'Restaurante no encontrado.');END IF;
 IF NOT r.activo OR NOT r.tiene_atencion_fisica THEN PERFORM restopilot.rp_fail(400,'El restaurante está inactivo o tiene pausada la atención física.');END IF;
 IF dt IS NULL OR hi IS NULL OR hf IS NULL OR hi>=hf OR (r.hora_apertura IS NOT NULL AND r.hora_cierre IS NOT NULL AND (hi<r.hora_apertura OR hf>r.hora_cierre)) THEN PERFORM restopilot.rp_fail(400,'La fecha y el horario deben ser válidos y estar dentro de la atención del restaurante.');END IF;
 IF written AND dt+hi<restopilot.rp_now() THEN PERFORM restopilot.rp_fail(400,'No se permiten reservas en el pasado.');END IF;
END $$;
CREATE OR REPLACE FUNCTION restopilot.rp_reservation_save(eid bigint,b jsonb) RETURNS bigint LANGUAGE plpgsql VOLATILE SET search_path='' AS $$
DECLARE u restopilot.usuarios:=restopilot.rp_user();v restopilot.reservas;m restopilot.mesas;rid bigint:=(b->>'restauranteId')::bigint;mid bigint:=(b->>'mesaId')::bigint;dt date:=(b->>'fecha')::date;hi time:=(b->>'horaInicio')::time;hf time:=(b->>'horaFin')::time;people integer:=(b->>'numeroComensales')::integer;BEGIN
 IF eid IS NOT NULL THEN SELECT * INTO v FROM restopilot.reservas WHERE id=eid FOR UPDATE;IF v.id IS NULL OR u.rol='CLIENTE' AND v.usuario_id<>u.id THEN PERFORM restopilot.rp_fail(404,'Reserva no encontrada.');END IF;IF u.rol<>'CLIENTE' THEN PERFORM restopilot.rp_manage(v.restaurante_id);END IF;
  IF v.estado NOT IN ('PENDIENTE','CONFIRMADA') OR v.llegada_registrada_en IS NOT NULL THEN PERFORM restopilot.rp_fail(400,'No se puede reprogramar una reserva terminal o con llegada registrada.');END IF;
  IF rid IS DISTINCT FROM v.restaurante_id THEN PERFORM restopilot.rp_fail(400,'No se puede cambiar el restaurante de la reserva.');END IF;
 END IF;
 PERFORM restopilot.rp_schedule(rid,dt,hi,hf,true);SELECT * INTO m FROM restopilot.mesas WHERE id=mid FOR UPDATE;PERFORM restopilot.rp_schedule(rid,dt,hi,hf,true);
 IF m.id IS NULL OR m.restaurante_id<>rid OR NOT m.activo OR people IS NULL OR people<1 OR people>m.capacidad OR length(coalesce(b->>'notas',''))>500 THEN PERFORM restopilot.rp_fail(400,'Revisa la mesa activa, su capacidad y las notas de hasta 500 caracteres.');END IF;
 IF EXISTS(SELECT FROM restopilot.reservas WHERE mesa_id=mid AND fecha=dt AND estado IN ('PENDIENTE','CONFIRMADA') AND hora_inicio<hf AND hora_fin>hi AND id IS DISTINCT FROM eid) THEN PERFORM restopilot.rp_fail(409,'La mesa ya está reservada en el horario solicitado.');END IF;
 IF eid IS NULL THEN INSERT INTO restopilot.reservas(restaurante_id,usuario_id,mesa_id,fecha,hora_inicio,hora_fin,numero_comensales,estado,notas,creado_en,version) VALUES(rid,u.id,mid,dt,hi,hf,people,'PENDIENTE',b->>'notas',restopilot.rp_now(),0) RETURNING id INTO eid;
 ELSE UPDATE restopilot.reservas SET mesa_id=mid,fecha=dt,hora_inicio=hi,hora_fin=hf,numero_comensales=people,notas=b->>'notas',estado='PENDIENTE',actualizado_en=restopilot.rp_now(),version=version+1 WHERE id=eid;END IF;RETURN eid;
END $$;

CREATE OR REPLACE FUNCTION restopilot.rp_reservations(method text,x text[],q jsonb,b jsonb) RETURNS jsonb LANGUAGE plpgsql VOLATILE SET search_path='' AS $$
DECLARE u restopilot.usuarios:=restopilot.rp_user();v restopilot.reservas;m restopilot.mesas;eid bigint;rid bigint;data jsonb;dt date;hi time;hf time;people integer;now timestamp:=restopilot.rp_now();state_new text;reason text;notes text;BEGIN
 IF x[2]='modulo' AND x[3]='estado' THEN
  rid:=CASE WHEN x[4]='restaurante' THEN x[5]::bigint ELSE u.restaurante_id END;
  IF x[4] IS NULL THEN PERFORM restopilot.rp_manage(rid);END IF;
  IF method='PATCH' AND x[4] IS NULL THEN IF jsonb_typeof(b->'habilitado') IS DISTINCT FROM 'boolean' THEN PERFORM restopilot.rp_fail(400,'Indica si la atención debe estar habilitada.');END IF;UPDATE restopilot.restaurantes SET tiene_atencion_fisica=(b->>'habilitado')::boolean,actualizado_en=now WHERE id=rid;
  ELSIF method<>'GET' THEN PERFORM restopilot.rp_fail(405,'Operación no admitida.');END IF;
  data:=restopilot.rp_module(rid);IF data IS NULL THEN PERFORM restopilot.rp_fail(404,'Restaurante no encontrado.');END IF;RETURN restopilot.rp_ok(data);
 END IF;
 IF method='GET' AND x[2]='disponibilidad' THEN
  rid:=(q->>'restauranteId')::bigint;dt:=(q->>'fecha')::date;hi:=(q->>'horaInicio')::time;hf:=(q->>'horaFin')::time;people:=coalesce((q->>'numeroComensales')::integer,1);IF people<1 THEN PERFORM restopilot.rp_fail(400,'Indica un número positivo de comensales.');END IF;PERFORM restopilot.rp_schedule(rid,dt,hi,hf,false);
  SELECT coalesce(jsonb_agg(jsonb_build_object('id',mt.id,'numero',mt.numero,'capacidad',mt.capacidad,'coordenadaX',mt.coordenada_x,'coordenadaY',mt.coordenada_y,'disponible',NOT EXISTS(SELECT FROM restopilot.reservas WHERE mesa_id=mt.id AND fecha=dt AND estado IN ('PENDIENTE','CONFIRMADA') AND hora_inicio<hf AND hora_fin>hi)) ORDER BY mt.numero,mt.id),'[]') INTO data FROM restopilot.mesas mt WHERE mt.restaurante_id=rid AND mt.activo AND mt.capacidad>=people;
  RETURN restopilot.rp_ok(jsonb_build_object('mensaje','Disponibilidad consultada.','mesas',data));
 END IF;
 IF method='GET' AND (x[2]='me' OR x[2] IS NULL) THEN
  IF x[2] IS NULL THEN PERFORM restopilot.rp_manage(u.restaurante_id);END IF;
  IF q->>'estado' IS NOT NULL AND q->>'estado' NOT IN ('PENDIENTE','CONFIRMADA','RECHAZADA','CANCELADA','COMPLETADA','EXPIRADA') THEN PERFORM restopilot.rp_fail(400,'Estado de reserva inválido.');END IF;
  SELECT coalesce(jsonb_agg(restopilot.rp_reservation(id) ORDER BY CASE WHEN q->>'fecha' IS NOT NULL THEN hora_inicio END ASC,fecha DESC,hora_inicio DESC,id DESC),'[]') INTO data FROM restopilot.reservas WHERE (CASE WHEN x[2]='me' THEN usuario_id=u.id ELSE restaurante_id=u.restaurante_id END) AND (q->>'estado' IS NULL OR estado=q->>'estado') AND (q->>'fecha' IS NULL OR fecha=(q->>'fecha')::date);
  RETURN restopilot.rp_ok(jsonb_build_object('mensaje','Reservas consultadas.','reservas',data));
 END IF;
 IF method='POST' AND x[2] IS NULL THEN eid:=restopilot.rp_reservation_save(NULL,b);RETURN restopilot.rp_ok(restopilot.rp_reservation(eid),201);END IF;
 eid:=x[2]::bigint;SELECT * INTO v FROM restopilot.reservas WHERE id=eid FOR UPDATE;now:=restopilot.rp_now();
 IF v.id IS NULL OR (u.rol='CLIENTE' AND v.usuario_id<>u.id) THEN PERFORM restopilot.rp_fail(404,'Reserva no encontrada.');END IF;IF u.rol<>'CLIENTE' THEN PERFORM restopilot.rp_manage(v.restaurante_id);END IF;
 IF method='GET' AND x[3] IS NULL THEN RETURN restopilot.rp_ok(restopilot.rp_reservation(eid));END IF;
 IF method='PUT' AND x[3] IS NULL THEN eid:=restopilot.rp_reservation_save(eid,b);RETURN restopilot.rp_ok(restopilot.rp_reservation(eid));END IF;
 IF method='PATCH' AND x[3]='cancelar' THEN
  reason:=btrim(coalesce(b->>'motivo',q->>'motivo',''));IF v.estado NOT IN ('PENDIENTE','CONFIRMADA') OR v.llegada_registrada_en IS NOT NULL THEN PERFORM restopilot.rp_fail(400,'No se puede cancelar una reserva terminal o con llegada registrada.');END IF;
  IF u.rol='CLIENTE' AND NOT now<v.fecha+v.hora_inicio-interval '2 hours' THEN PERFORM restopilot.rp_fail(400,'La cancelación requiere más de 2 horas de anticipación. Comunícate con recepción.');END IF;
  notes:=coalesce(v.notas,'');IF reason<>'' THEN notes:=CASE WHEN notes<>'' THEN notes||' | ' ELSE '' END||'Motivo cancelación: '||reason;END IF;IF length(reason)>300 OR length(notes)>500 THEN PERFORM restopilot.rp_fail(400,'Las notas y el motivo exceden el tamaño permitido.');END IF;
  UPDATE restopilot.reservas SET estado='CANCELADA',notas=notes,actualizado_en=now,version=version+1 WHERE id=eid;RETURN restopilot.rp_ok(restopilot.rp_reservation(eid));
 END IF;
 PERFORM restopilot.rp_manage(v.restaurante_id);
 IF method='PATCH' AND x[3]='estado' THEN
  state_new:=b->>'estado';reason:=btrim(b->>'motivo');IF v.estado<>'PENDIENTE' THEN PERFORM restopilot.rp_fail(409,'La reserva ya fue gestionada.');END IF;
  IF state_new IS NULL OR state_new NOT IN ('CONFIRMADA','RECHAZADA') OR length(coalesce(reason,''))>300 OR (state_new='RECHAZADA' AND nullif(reason,'') IS NULL) THEN PERFORM restopilot.rp_fail(400,'Solo puedes confirmar o rechazar; el rechazo requiere un motivo.');END IF;
  IF state_new='CONFIRMADA' THEN
   PERFORM restopilot.rp_schedule(v.restaurante_id,v.fecha,v.hora_inicio,v.hora_fin,true);SELECT * INTO m FROM restopilot.mesas WHERE id=v.mesa_id FOR UPDATE;IF NOT m.activo OR m.restaurante_id<>v.restaurante_id OR m.capacidad<v.numero_comensales THEN PERFORM restopilot.rp_fail(400,'La mesa debe estar activa y tener capacidad suficiente.');END IF;
   IF EXISTS(SELECT FROM restopilot.reservas WHERE mesa_id=v.mesa_id AND fecha=v.fecha AND estado IN ('PENDIENTE','CONFIRMADA') AND hora_inicio<v.hora_fin AND hora_fin>v.hora_inicio AND id<>eid) THEN PERFORM restopilot.rp_fail(409,'La mesa está ocupada en ese horario.');END IF;
  END IF;
  UPDATE restopilot.reservas SET estado=state_new,motivo_rechazo=CASE WHEN state_new='RECHAZADA' THEN reason ELSE NULL END,actualizado_en=now,version=version+1 WHERE id=eid;PERFORM restopilot.rp_notify(v.usuario_id,'Reserva #'||eid||': '||state_new||CASE WHEN state_new='RECHAZADA' THEN '. Motivo: '||reason ELSE '' END);RETURN restopilot.rp_ok(restopilot.rp_reservation(eid));
 ELSIF method='PATCH' AND x[3]='llegada' THEN
  IF v.estado<>'CONFIRMADA' OR v.llegada_registrada_en IS NOT NULL OR now>=v.fecha+v.hora_inicio+interval '15 minutes' THEN PERFORM restopilot.rp_fail(400,'La reserva debe estar confirmada, sin llegada previa y dentro de su tolerancia.');END IF;
  UPDATE restopilot.reservas SET llegada_registrada_en=now,actualizado_en=now,version=version+1 WHERE id=eid;PERFORM restopilot.rp_notify(v.usuario_id,'Reserva #'||eid||': llegada registrada.');RETURN restopilot.rp_ok(restopilot.rp_reservation(eid)||jsonb_build_object('mensaje','Llegada registrada con éxito.'));
 ELSIF method='PATCH' AND x[3]='completar' THEN
  IF v.estado<>'CONFIRMADA' OR v.llegada_registrada_en IS NULL OR now<v.fecha+v.hora_inicio THEN PERFORM restopilot.rp_fail(400,'Completar requiere llegada registrada y alcanzar la hora de inicio.');END IF;
  UPDATE restopilot.reservas SET estado='COMPLETADA',completada_en=now,actualizado_en=now,version=version+1 WHERE id=eid;PERFORM restopilot.rp_notify(v.usuario_id,'Reserva #'||eid||': COMPLETADA.');RETURN restopilot.rp_ok(restopilot.rp_reservation(eid)||jsonb_build_object('mensaje','Reserva completada con éxito.'));
 END IF;PERFORM restopilot.rp_fail(404,'Operación de reservas no encontrada.');RETURN NULL;
END $$;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA restopilot FROM PUBLIC,anon,authenticated;
COMMIT;
