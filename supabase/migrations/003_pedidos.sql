BEGIN;
CREATE OR REPLACE FUNCTION restopilot.rp_order(oid bigint) RETURNS jsonb LANGUAGE sql STABLE SET search_path='' AS $$
SELECT jsonb_build_object('id',o.id,'restauranteId',o.restaurante_id,'restauranteNombre',r.nombre,'clienteId',o.cliente_id,'clienteNombre',u.nombre_completo,'mesaId',o.mesa_id,'estado',o.estado,'tipoEntrega',o.tipo_entrega,'direccionEntrega',o.direccion_entrega,'total',o.total,'fechaCreacion',o.fecha_creacion,'limiteCancelacion',o.limite_cancelacion,
 'detalles',(SELECT coalesce(jsonb_agg(restopilot.rp_camel(to_jsonb(d)-'pedido_id') ORDER BY d.id),'[]') FROM restopilot.detalles_pedido d WHERE d.pedido_id=o.id),
 'complejidadMaxima',(SELECT CASE max(CASE upper(btrim(p.complejidad)) WHEN 'ALTA' THEN 3 WHEN 'MEDIA' THEN 2 WHEN 'BAJA' THEN 1 ELSE 0 END) WHEN 3 THEN 'ALTA' WHEN 2 THEN 'MEDIA' WHEN 1 THEN 'BAJA' ELSE NULL END FROM restopilot.detalles_pedido d JOIN restopilot.platos p ON p.id=d.plato_id WHERE d.pedido_id=o.id),
 'tiempoPreparacionMaximoMinutos',(SELECT max(p.tiempo_preparacion_minutos) FILTER(WHERE p.tiempo_preparacion_minutos>=0) FROM restopilot.detalles_pedido d JOIN restopilot.platos p ON p.id=d.plato_id WHERE d.pedido_id=o.id))
FROM restopilot.pedidos o JOIN restopilot.restaurantes r ON r.id=o.restaurante_id JOIN restopilot.usuarios u ON u.id=o.cliente_id WHERE o.id=oid $$;
CREATE OR REPLACE FUNCTION restopilot.rp_payment(oid bigint) RETURNS jsonb LANGUAGE sql STABLE SET search_path='' AS $$SELECT restopilot.rp_camel(to_jsonb(p)-'actualizado_en')||jsonb_build_object('mensaje','Detalle de pago consultado.') FROM restopilot.pagos p WHERE p.pedido_id=oid$$;
CREATE OR REPLACE FUNCTION restopilot.rp_notify(uid bigint,msg text) RETURNS void LANGUAGE sql VOLATILE SET search_path='' AS $$INSERT INTO restopilot.notificaciones(usuario_id,mensaje,fecha_creacion) VALUES(uid,msg,restopilot.rp_now())$$;
CREATE OR REPLACE FUNCTION restopilot.rp_order_save(oid bigint,b jsonb) RETURNS bigint LANGUAGE plpgsql VOLATILE SET search_path='' AS $$
DECLARE u restopilot.usuarios:=restopilot.rp_user();o restopilot.pedidos;r restopilot.restaurantes;m restopilot.mesas;p restopilot.platos;d jsonb;qty integer;price numeric;order_total numeric:=0;now timestamp:=restopilot.rp_now();rid bigint:=(b->>'restauranteId')::bigint;mode text:=b->>'tipoEntrega';mid bigint;address text;BEGIN
 IF oid IS NULL THEN IF u.rol<>'CLIENTE' THEN PERFORM restopilot.rp_fail(403,'Solo un cliente puede registrar un pedido.');END IF;
 ELSE SELECT * INTO o FROM restopilot.pedidos WHERE id=oid FOR UPDATE;IF o.id IS NULL THEN PERFORM restopilot.rp_fail(404,'Pedido no encontrado.');END IF;PERFORM restopilot.rp_manage(o.restaurante_id);IF o.estado<>'PENDIENTE' OR EXISTS(SELECT FROM restopilot.pagos WHERE pedido_id=oid AND estado='PAGADO') THEN PERFORM restopilot.rp_fail(400,'Solo se puede modificar un pedido pendiente y no pagado.');END IF;IF rid IS DISTINCT FROM o.restaurante_id THEN PERFORM restopilot.rp_fail(400,'No se puede cambiar el restaurante del pedido.');END IF;END IF;
 SELECT * INTO r FROM restopilot.restaurantes WHERE id=rid FOR SHARE;IF r.id IS NULL THEN PERFORM restopilot.rp_fail(404,'Restaurante no encontrado.');END IF;
 IF oid IS NULL AND (NOT r.activo OR (r.hora_apertura IS NOT NULL AND r.hora_cierre IS NOT NULL AND (now::time<r.hora_apertura OR now::time>=r.hora_cierre))) THEN PERFORM restopilot.rp_fail(400,'El restaurante está inactivo o fuera del horario de atención.');END IF;
 IF mode IS NULL OR mode NOT IN ('SALON','LLEVAR','RECOGER','DELIVERY') THEN PERFORM restopilot.rp_fail(400,'Selecciona una modalidad válida.');END IF;
 IF mode='DELIVERY' THEN address:=btrim(b->>'direccionEntrega');IF NOT r.acepta_delivery OR address IS NULL OR length(address) NOT BETWEEN 1 AND 255 THEN PERFORM restopilot.rp_fail(400,'Delivery requiere estar habilitado y una dirección válida.');END IF;
 ELSIF mode='SALON' THEN mid:=(b->>'mesaId')::bigint;SELECT * INTO m FROM restopilot.mesas WHERE id=mid FOR SHARE;IF NOT r.tiene_atencion_fisica OR m.id IS NULL OR NOT m.activo OR m.restaurante_id<>rid THEN PERFORM restopilot.rp_fail(400,'Salón requiere atención física y una mesa activa del restaurante.');END IF;END IF;
 IF jsonb_typeof(b->'detalles') IS DISTINCT FROM 'array' OR jsonb_array_length(b->'detalles')=0 THEN PERFORM restopilot.rp_fail(400,'Selecciona al menos un plato.');END IF;
 IF oid IS NULL THEN INSERT INTO restopilot.pedidos(restaurante_id,cliente_id,mesa_id,estado,tipo_entrega,total,direccion_entrega,fecha_creacion,limite_cancelacion) VALUES(rid,u.id,mid,'PENDIENTE',mode,0,address,now,now+interval '5 minutes') RETURNING id INTO oid;
 ELSE UPDATE restopilot.pedidos SET mesa_id=mid,tipo_entrega=mode,direccion_entrega=address WHERE id=oid;DELETE FROM restopilot.detalles_pedido WHERE pedido_id=oid;END IF;
 FOR d IN SELECT * FROM jsonb_array_elements(b->'detalles') LOOP
  SELECT * INTO p FROM restopilot.platos WHERE id=(d->>'platoId')::bigint FOR SHARE;qty:=(d->>'cantidad')::integer;
  IF p.id IS NULL THEN PERFORM restopilot.rp_fail(404,'Plato no encontrado.');END IF;
  IF p.restaurante_id<>rid OR NOT p.disponible OR qty IS NULL OR qty<1 OR length(coalesce(d->>'notas',''))>255 THEN PERFORM restopilot.rp_fail(400,'Revisa disponibilidad, restaurante, cantidades y notas de hasta 255 caracteres.');END IF;
  price:=p.precio*qty;order_total:=order_total+price;INSERT INTO restopilot.detalles_pedido(pedido_id,plato_id,nombre_plato_snapshot,cantidad,precio_unitario,subtotal,notas) VALUES(oid,p.id,p.nombre,qty,p.precio,price,d->>'notas');
 END LOOP;
 UPDATE restopilot.pedidos SET total=order_total WHERE id=oid;
 INSERT INTO restopilot.pagos(pedido_id,monto,estado,creado_en) VALUES(oid,order_total,'PENDIENTE',now) ON CONFLICT(pedido_id) DO UPDATE SET monto=excluded.monto,actualizado_en=now;
 RETURN oid;
END $$;

CREATE OR REPLACE FUNCTION restopilot.rp_orders(method text,x text[],q jsonb,b jsonb) RETURNS jsonb LANGUAGE plpgsql VOLATILE SET search_path='' AS $$
DECLARE u restopilot.usuarios:=restopilot.rp_user();o restopilot.pedidos;p restopilot.pagos;oid bigint;data jsonb;cnt bigint;sz integer:=coalesce((q->>'size')::integer,20);page integer:=coalesce((q->>'page')::integer,0);next_state text;method_pay text;state_pay text;BEGIN
 IF method='POST' AND x[2] IS NULL THEN oid:=restopilot.rp_order_save(NULL,b);RETURN restopilot.rp_ok(restopilot.rp_order(oid),201);END IF;
 IF method='GET' AND x[2] IN ('me','pendientes') THEN
  IF page<0 OR sz<1 OR sz>2000 THEN PERFORM restopilot.rp_fail(400,'La página solicitada no es válida.');END IF;
  IF x[2]='me' THEN
   IF u.rol<>'CLIENTE' THEN PERFORM restopilot.rp_fail(403,'Consulta disponible para clientes.');END IF;SELECT count(*) INTO cnt FROM restopilot.pedidos WHERE cliente_id=u.id;
   SELECT coalesce(jsonb_agg(restopilot.rp_order(id) ORDER BY fecha_creacion DESC,id DESC),'[]') INTO data FROM (SELECT id,fecha_creacion FROM restopilot.pedidos WHERE cliente_id=u.id ORDER BY fecha_creacion DESC,id DESC LIMIT sz OFFSET page::bigint*sz) list;
   RETURN restopilot.rp_ok(jsonb_build_object('mensaje','Historial de pedidos consultado.','pedidos',data,'totalElementos',cnt,'totalPaginas',ceil(cnt::numeric/sz)::integer));
  END IF;
  PERFORM restopilot.rp_manage(u.restaurante_id);
  SELECT count(*) INTO cnt FROM restopilot.pedidos WHERE restaurante_id=u.restaurante_id AND estado IN ('PENDIENTE','EN_PREPARACION');
  SELECT coalesce(jsonb_agg(restopilot.rp_order(id) ORDER BY complexity DESC,minutes DESC,fecha_creacion,id),'[]') INTO data FROM (
   SELECT ord.id,ord.fecha_creacion,coalesce(max(CASE upper(btrim(dish.complejidad)) WHEN 'ALTA' THEN 3 WHEN 'MEDIA' THEN 2 WHEN 'BAJA' THEN 1 ELSE 0 END),0) complexity,coalesce(max(dish.tiempo_preparacion_minutos) FILTER(WHERE dish.tiempo_preparacion_minutos>=0),0) minutes FROM restopilot.pedidos ord LEFT JOIN restopilot.detalles_pedido d ON d.pedido_id=ord.id LEFT JOIN restopilot.platos dish ON dish.id=d.plato_id WHERE ord.restaurante_id=u.restaurante_id AND ord.estado IN ('PENDIENTE','EN_PREPARACION') GROUP BY ord.id ORDER BY complexity DESC,minutes DESC,ord.fecha_creacion,ord.id LIMIT sz OFFSET page::bigint*sz) list;
  RETURN restopilot.rp_ok(jsonb_build_object('content',data,'number',page,'size',sz,'totalElements',cnt,'totalPages',ceil(cnt::numeric/sz)::integer,'numberOfElements',jsonb_array_length(data),'first',page=0,'last',(page::bigint+1)*sz>=cnt,'empty',jsonb_array_length(data)=0));
 END IF;
 oid:=x[2]::bigint;SELECT * INTO o FROM restopilot.pedidos WHERE id=oid FOR UPDATE;IF o.id IS NULL OR (u.rol='CLIENTE' AND o.cliente_id<>u.id) THEN PERFORM restopilot.rp_fail(404,'Pedido no encontrado.');END IF;
 IF u.rol<>'CLIENTE' THEN PERFORM restopilot.rp_manage(o.restaurante_id);END IF;
 IF x[3]='pagos' THEN
  IF method='GET' THEN data:=restopilot.rp_payment(oid);IF data IS NULL THEN PERFORM restopilot.rp_fail(404,'No existe registro de pago para el pedido.');END IF;RETURN restopilot.rp_ok(data);END IF;
  IF method='POST' THEN PERFORM restopilot.rp_manage(o.restaurante_id);IF o.estado='CANCELADO' THEN PERFORM restopilot.rp_fail(400,'No se puede pagar un pedido cancelado.');END IF;
   IF (b->>'monto')::numeric IS DISTINCT FROM o.total OR (b->>'monto')::numeric<=0 THEN PERFORM restopilot.rp_fail(400,'El monto debe ser positivo y coincidir con el total del pedido.');END IF;
   SELECT * INTO p FROM restopilot.pagos WHERE pedido_id=oid;IF p.estado='PAGADO' THEN PERFORM restopilot.rp_fail(409,'El pedido ya cuenta con un pago confirmado e inamovible.');END IF;
   method_pay:=b->>'metodo';state_pay:=coalesce(b->>'estado','PAGADO');IF method_pay IS NULL OR method_pay NOT IN ('YAPE','PLIN','TARJETA','EFECTIVO') OR state_pay NOT IN ('PENDIENTE','PAGADO') OR (state_pay='PAGADO' AND method_pay<>'EFECTIVO' AND nullif(btrim(b->>'codigoReferencia'),'') IS NULL) OR length(coalesce(b->>'codigoReferencia',''))>100 THEN PERFORM restopilot.rp_fail(400,'Selecciona un método y una referencia válida para pagos electrónicos.');END IF;
   INSERT INTO restopilot.pagos(pedido_id,monto,metodo,estado,codigo_referencia,fecha_pago,creado_en) VALUES(oid,o.total,method_pay,state_pay,b->>'codigoReferencia',CASE WHEN state_pay='PAGADO' THEN restopilot.rp_now() ELSE NULL END,restopilot.rp_now()) ON CONFLICT(pedido_id) DO UPDATE SET monto=excluded.monto,metodo=excluded.metodo,estado=excluded.estado,codigo_referencia=excluded.codigo_referencia,fecha_pago=excluded.fecha_pago,actualizado_en=restopilot.rp_now();RETURN restopilot.rp_ok(restopilot.rp_payment(oid),201);
  END IF;
 ELSIF method='GET' AND x[3] IS NULL THEN RETURN restopilot.rp_ok(restopilot.rp_order(oid));
 ELSIF method='PUT' AND x[3] IS NULL THEN oid:=restopilot.rp_order_save(oid,b);RETURN restopilot.rp_ok(restopilot.rp_order(oid));
 ELSIF method='PATCH' AND x[3]='estado' THEN
  PERFORM restopilot.rp_manage(o.restaurante_id);next_state:=CASE o.estado WHEN 'PENDIENTE' THEN 'EN_PREPARACION' WHEN 'EN_PREPARACION' THEN 'LISTO' WHEN 'LISTO' THEN 'ENTREGADO' ELSE NULL END;
  IF next_state IS NULL OR coalesce(q->>'nuevoEstado',b->>'nuevoEstado',b->>'estado') IS DISTINCT FROM next_state THEN PERFORM restopilot.rp_fail(400,'Transición de estado no válida. Debe respetarse la preparación, listo y entrega.');END IF;
  UPDATE restopilot.pedidos SET estado=next_state WHERE id=oid;PERFORM restopilot.rp_notify(o.cliente_id,'Pedido #'||oid||': '||next_state);RETURN restopilot.rp_ok(restopilot.rp_order(oid));
 ELSIF method='DELETE' AND x[3] IS NULL THEN
  PERFORM restopilot.rp_manage(o.restaurante_id);IF o.estado<>'PENDIENTE' OR EXISTS(SELECT FROM restopilot.pagos WHERE pedido_id=oid AND estado='PAGADO') THEN PERFORM restopilot.rp_fail(400,'Solo se puede cancelar un pedido pendiente y no pagado.');END IF;UPDATE restopilot.pedidos SET estado='CANCELADO' WHERE id=oid;PERFORM restopilot.rp_notify(o.cliente_id,'Pedido #'||oid||': CANCELADO');RETURN restopilot.rp_ok(NULL,204);
 END IF;PERFORM restopilot.rp_fail(404,'Operación de pedidos no encontrada.');RETURN NULL;
END $$;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA restopilot FROM PUBLIC,anon,authenticated;
COMMIT;
