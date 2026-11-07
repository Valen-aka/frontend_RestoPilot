BEGIN;
CREATE OR REPLACE FUNCTION restopilot.rp_report(q jsonb,only_payments boolean) RETURNS jsonb LANGUAGE plpgsql VOLATILE SET search_path='' AS $$
DECLARE u restopilot.usuarios:=restopilot.rp_user();d1 date:=(q->>'fechaInicio')::date;d2 date:=(q->>'fechaFin')::date;kind text:=CASE WHEN only_payments THEN 'PAGOS' ELSE coalesce(q->>'tipo','CONSOLIDADO') END;platos jsonb;demanda jsonb;payments jsonb;atenciones integer;orders_done integer;reservations_done integer;occ numeric;days numeric;table_count bigint;minutes numeric;r restopilot.restaurantes;BEGIN
 PERFORM restopilot.rp_manage(u.restaurante_id);IF d1 IS NULL OR d2 IS NULL OR d1>d2 OR d2>='9999-12-31'::date OR kind NOT IN ('CONSOLIDADO','PLATOS','DEMANDA','ATENCIONES','OCUPACION','PAGOS') THEN PERFORM restopilot.rp_fail(400,'El período o tipo de reporte no es válido.');END IF;
 IF NOT EXISTS(SELECT FROM restopilot.pedidos WHERE restaurante_id=u.restaurante_id AND fecha_creacion>=d1 AND fecha_creacion<d2+1) AND NOT EXISTS(SELECT FROM restopilot.reservas WHERE restaurante_id=u.restaurante_id AND fecha BETWEEN d1 AND d2) THEN
  RETURN jsonb_build_object('mensaje','No existen datos registrados para el rango de fechas seleccionado.','platosMasVendidos',NULL,'horariosMayorDemanda',NULL,'volumenAtenciones',NULL,'ocupacionMesasPorcentaje',NULL,'estadoPagos',NULL,'pedidosAtendidos',NULL,'reservasCompletadas',NULL);
 END IF;
 IF kind IN ('CONSOLIDADO','PLATOS') THEN SELECT coalesce(jsonb_agg(n||' ('||qty||' unidades)' ORDER BY qty DESC,n),'[]') INTO platos FROM (SELECT d.nombre_plato_snapshot n,sum(d.cantidad) qty FROM restopilot.detalles_pedido d JOIN restopilot.pedidos p ON p.id=d.pedido_id WHERE p.restaurante_id=u.restaurante_id AND p.fecha_creacion>=d1 AND p.fecha_creacion<d2+1 AND p.estado='ENTREGADO' GROUP BY d.nombre_plato_snapshot) rows;END IF;
 IF kind IN ('CONSOLIDADO','DEMANDA') THEN SELECT coalesce(jsonb_object_agg(lpad(h::text,2,'0')||':00 - '||lpad((h+1)::text,2,'0')||':00',n),'{}') INTO demanda FROM (SELECT extract(hour FROM fecha_creacion)::integer h,count(*) n FROM restopilot.pedidos WHERE restaurante_id=u.restaurante_id AND fecha_creacion>=d1 AND fecha_creacion<d2+1 AND estado<>'CANCELADO' GROUP BY h ORDER BY h) rows;END IF;
 IF kind IN ('CONSOLIDADO','ATENCIONES') THEN SELECT count(*) INTO orders_done FROM restopilot.pedidos WHERE restaurante_id=u.restaurante_id AND fecha_creacion>=d1 AND fecha_creacion<d2+1 AND estado='ENTREGADO';SELECT count(*) INTO reservations_done FROM restopilot.reservas WHERE restaurante_id=u.restaurante_id AND fecha BETWEEN d1 AND d2 AND estado='COMPLETADA';atenciones:=orders_done+reservations_done;END IF;
 IF kind IN ('CONSOLIDADO','OCUPACION') THEN
  SELECT * INTO r FROM restopilot.restaurantes WHERE id=u.restaurante_id;SELECT count(*) INTO table_count FROM restopilot.mesas WHERE restaurante_id=u.restaurante_id AND activo;
  IF table_count=0 OR r.hora_apertura IS NULL OR r.hora_cierre IS NULL THEN occ:=0;ELSE
   days:=d2-d1+1;minutes:=extract(epoch FROM r.hora_cierre-r.hora_apertura)/60;IF minutes<=0 THEN PERFORM restopilot.rp_fail(400,'Configura un horario válido para calcular ocupación.');END IF;
   SELECT round(coalesce(sum(greatest(0,extract(epoch FROM least(v.hora_fin,r.hora_cierre)-greatest(v.hora_inicio,r.hora_apertura))/60)),0)*100/(table_count*minutes*days),2) INTO occ FROM restopilot.reservas v JOIN restopilot.mesas m ON m.id=v.mesa_id WHERE v.restaurante_id=u.restaurante_id AND v.fecha BETWEEN d1 AND d2 AND m.activo AND v.estado IN ('CONFIRMADA','COMPLETADA');
  END IF;
 END IF;
 IF kind IN ('CONSOLIDADO','PAGOS') THEN
  SELECT jsonb_build_object('montoTotal',coalesce(sum(g.monto) FILTER(WHERE g.estado='PAGADO'),0),'pedidosPagados',count(*) FILTER(WHERE g.estado='PAGADO'),'pagosPendientes',count(*)-count(*) FILTER(WHERE g.estado='PAGADO'),'metodosPagoUtilizados',(SELECT coalesce(jsonb_object_agg(method,n),'{}') FROM (SELECT pg.metodo method,count(*) n FROM restopilot.pagos pg JOIN restopilot.pedidos pp ON pp.id=pg.pedido_id WHERE pp.restaurante_id=u.restaurante_id AND pp.fecha_creacion>=d1 AND pp.fecha_creacion<d2+1 AND pp.estado<>'CANCELADO' AND pg.estado='PAGADO' AND pg.metodo IS NOT NULL GROUP BY pg.metodo) methods)) INTO payments FROM restopilot.pedidos p LEFT JOIN restopilot.pagos g ON g.pedido_id=p.id WHERE p.restaurante_id=u.restaurante_id AND p.fecha_creacion>=d1 AND p.fecha_creacion<d2+1 AND p.estado<>'CANCELADO';
 END IF;
 RETURN jsonb_build_object('mensaje','Reporte generado.','platosMasVendidos',platos,'horariosMayorDemanda',demanda,'volumenAtenciones',atenciones,'ocupacionMesasPorcentaje',occ,'estadoPagos',payments,'pedidosAtendidos',orders_done,'reservasCompletadas',reservations_done);
END $$;

CREATE OR REPLACE FUNCTION public.rp_api(p_method text,p_path text,p_query jsonb DEFAULT '{}',p_body jsonb DEFAULT '{}') RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE u restopilot.usuarios;x text[];answer jsonb;method text:=upper(p_method);code integer;msg text;BEGIN
 u:=restopilot.rp_user();
 -- La expiración precede a la subtransacción de la operación: se conserva incluso
 -- cuando una acción tardía es rechazada, sin depender del navegador.
 PERFORM restopilot.rp_expirar();
 BEGIN
  IF p_path IS NULL OR p_path !~ '^/[a-zA-Z0-9/_-]+$' OR p_path LIKE '%//%' OR method NOT IN ('GET','POST','PUT','PATCH','DELETE') OR jsonb_typeof(coalesce(p_query,'{}'))<>'object' OR jsonb_typeof(coalesce(p_body,'{}'))<>'object' THEN PERFORM restopilot.rp_fail(400,'Solicitud no válida.');END IF;
  x:=string_to_array(trim(both '/' FROM p_path),'/');
  IF x[1]='session' AND method='GET' AND cardinality(x)=1 THEN answer:=restopilot.rp_ok(restopilot.rp_profile());
  ELSIF x[1] IN ('restaurantes','categorias','platos','mesas') THEN answer:=restopilot.rp_catalog(method,x,coalesce(p_query,'{}'),coalesce(p_body,'{}'));
  ELSIF x[1]='pedidos' THEN answer:=restopilot.rp_orders(method,x,coalesce(p_query,'{}'),coalesce(p_body,'{}'));
  ELSIF x[1]='reservas' THEN answer:=restopilot.rp_reservations(method,x,coalesce(p_query,'{}'),coalesce(p_body,'{}'));
  ELSIF x[1]='reportes' AND method='GET' AND x[2] IN ('operativos','pagos') THEN answer:=restopilot.rp_ok(restopilot.rp_report(coalesce(p_query,'{}'),x[2]='pagos'));
  ELSIF x[1]='notificaciones' AND x[2]='me' AND method='GET' THEN SELECT restopilot.rp_ok(coalesce(jsonb_agg(restopilot.rp_camel(to_jsonb(n)) ORDER BY fecha_creacion DESC,id DESC),'[]')) INTO answer FROM restopilot.notificaciones n WHERE usuario_id=u.id;
  ELSIF x[1]='usuarios' AND x[2]='administradores' AND method='POST' THEN answer:=restopilot.rp_ok(restopilot.rp_create_admin(coalesce(p_body,'{}')),201);
  ELSE PERFORM restopilot.rp_fail(404,'La operación no existe en la conexión directa.');END IF;
  RETURN answer;
 EXCEPTION WHEN OTHERS THEN
  code:=CASE WHEN SQLSTATE~'^PT[0-9]{3}$' THEN substr(SQLSTATE,3)::integer WHEN SQLSTATE='23505' THEN 409 WHEN SQLSTATE='23503' THEN 409 WHEN SQLSTATE IN ('22P02','22003','22007','22008','22023','23502','23514') THEN 400 ELSE 500 END;
  msg:=CASE WHEN SQLSTATE~'^PT[0-9]{3}$' THEN SQLERRM WHEN code=409 THEN 'La operación entra en conflicto con datos relacionados o existentes.' WHEN code=400 THEN 'Los datos no son válidos o están incompletos.' ELSE 'No se pudo completar la operación. No reenvíes cambios sin consultar su estado.' END;
  PERFORM restopilot.rp_expirar();RETURN restopilot.rp_ok(jsonb_build_object('mensaje',msg),code);
 END;
EXCEPTION WHEN OTHERS THEN RETURN restopilot.rp_ok(jsonb_build_object('mensaje','La sesión no está vigente o la cuenta no está habilitada.'),CASE WHEN SQLSTATE='PT403' THEN 403 ELSE 401 END);
END $$;
REVOKE ALL ON FUNCTION public.rp_api(text,text,jsonb,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.rp_api(text,text,jsonb,jsonb) TO authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA restopilot FROM PUBLIC,anon,authenticated;
NOTIFY pgrst,'reload schema';
COMMIT;

-- Trabajo del servidor, aun cuando ningún navegador esté abierto.
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule('restopilot-expiracion','* * * * *','SELECT restopilot.rp_expirar();');
