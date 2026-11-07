-- Compatibilidad con los contratos Angular existentes. Aplicar después de 005.
-- Cambia solo nombres de campos JSON; conserva reglas, datos y permisos.
BEGIN;
CREATE OR REPLACE FUNCTION restopilot.rp_module(rid bigint) RETURNS jsonb LANGUAGE sql VOLATILE SET search_path='' AS $$
SELECT jsonb_build_object('restauranteId',r.id,'restauranteNombre',r.nombre,'habilitado',r.tiene_atencion_fisica,'reservasActivasPendientes',(SELECT count(*) FROM restopilot.reservas WHERE restaurante_id=r.id AND estado IN ('PENDIENTE','CONFIRMADA') AND fecha>=restopilot.rp_now()::date),'mensaje',CASE WHEN r.tiene_atencion_fisica THEN 'La atención física está habilitada.' ELSE 'La atención física está pausada.' END) FROM restopilot.restaurantes r WHERE r.id=rid $$;

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
  SELECT coalesce(jsonb_agg(jsonb_build_object('mesaId',mt.id,'numero',mt.numero,'capacidad',mt.capacidad,'coordenadaX',mt.coordenada_x,'coordenadaY',mt.coordenada_y,'disponible',NOT EXISTS(SELECT FROM restopilot.reservas WHERE mesa_id=mt.id AND fecha=dt AND estado IN ('PENDIENTE','CONFIRMADA') AND hora_inicio<hf AND hora_fin>hi)) ORDER BY mt.numero,mt.id),'[]') INTO data FROM restopilot.mesas mt WHERE mt.restaurante_id=rid AND mt.activo AND mt.capacidad>=people;
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

REVOKE ALL ON FUNCTION restopilot.rp_module(bigint) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION restopilot.rp_reservations(text,text[],jsonb,jsonb) FROM PUBLIC,anon,authenticated;
NOTIFY pgrst,'reload schema';
COMMIT;
