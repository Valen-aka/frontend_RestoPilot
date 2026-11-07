BEGIN;
CREATE UNIQUE INDEX IF NOT EXISTS ux_mesas_restaurante_numero ON restopilot.mesas(restaurante_id,numero);
CREATE OR REPLACE FUNCTION restopilot.rp_ok(b jsonb,s integer DEFAULT 200) RETURNS jsonb LANGUAGE sql IMMUTABLE SET search_path='' AS $$SELECT jsonb_build_object('status',s,'body',b)$$;
CREATE OR REPLACE FUNCTION restopilot.rp_restaurant(rid bigint) RETURNS jsonb LANGUAGE sql VOLATILE SET search_path='' AS $$
SELECT restopilot.rp_camel(to_jsonb(r))||jsonb_build_object('abierto',r.activo AND (r.hora_apertura IS NULL OR r.hora_cierre IS NULL OR (restopilot.rp_now()::time>=r.hora_apertura AND restopilot.rp_now()::time<r.hora_cierre))) FROM restopilot.restaurantes r WHERE r.id=rid $$;
CREATE OR REPLACE FUNCTION restopilot.rp_dish(pid bigint) RETURNS jsonb LANGUAGE sql STABLE SET search_path='' AS $$SELECT restopilot.rp_camel(to_jsonb(p))||jsonb_build_object('categoriaNombre',c.nombre) FROM restopilot.platos p JOIN restopilot.categorias c ON c.id=p.categoria_id WHERE p.id=pid$$;
CREATE OR REPLACE FUNCTION restopilot.rp_table(mid bigint) RETURNS jsonb LANGUAGE sql STABLE SET search_path='' AS $$SELECT restopilot.rp_camel(to_jsonb(m))||jsonb_build_object('restauranteNombre',r.nombre) FROM restopilot.mesas m JOIN restopilot.restaurantes r ON r.id=m.restaurante_id WHERE m.id=mid$$;

CREATE OR REPLACE FUNCTION restopilot.rp_catalog(method text,x text[],q jsonb,b jsonb) RETURNS jsonb LANGUAGE plpgsql VOLATILE SET search_path='' AS $$
DECLARE u restopilot.usuarios:=restopilot.rp_user();rid bigint;eid bigint;cat restopilot.categorias;p restopilot.platos;m restopilot.mesas;r restopilot.restaurantes;data jsonb;nm text;cap integer;num integer;cx double precision;cy double precision;val boolean;BEGIN
 IF x[1]='restaurantes' AND method='GET' THEN
  IF x[2] IS NULL THEN SELECT coalesce(jsonb_agg(restopilot.rp_restaurant(id) ORDER BY id),'[]') INTO data FROM restopilot.restaurantes;ELSE data:=restopilot.rp_restaurant(x[2]::bigint);END IF;
  IF data IS NULL THEN PERFORM restopilot.rp_fail(404,'Restaurante no encontrado.');END IF;RETURN restopilot.rp_ok(data);
 ELSIF x[1]='categorias' THEN
  IF method='GET' AND x[2]='restaurante' THEN SELECT coalesce(jsonb_agg(restopilot.rp_camel(to_jsonb(c)) ORDER BY c.id),'[]') INTO data FROM restopilot.categorias c WHERE restaurante_id=x[3]::bigint;RETURN restopilot.rp_ok(data);END IF;
  IF method='POST' AND x[2] IS NULL THEN
   rid:=(b->>'restauranteId')::bigint;PERFORM restopilot.rp_manage(rid);nm:=btrim(b->>'nombre');IF b ? 'id' OR nm IS NULL OR length(nm) NOT BETWEEN 1 AND 100 THEN PERFORM restopilot.rp_fail(400,'La categoría requiere un nombre de hasta 100 caracteres.');END IF;
   INSERT INTO restopilot.categorias(restaurante_id,nombre,descripcion,creado_en) VALUES(rid,nm,b->>'descripcion',restopilot.rp_now()) RETURNING * INTO cat;RETURN restopilot.rp_ok(restopilot.rp_camel(to_jsonb(cat)),201);
  END IF;
  eid:=x[2]::bigint;SELECT * INTO cat FROM restopilot.categorias WHERE id=eid FOR UPDATE;IF cat.id IS NULL THEN PERFORM restopilot.rp_fail(404,'Categoría no encontrada.');END IF;PERFORM restopilot.rp_manage(cat.restaurante_id);
  IF method='PUT' THEN nm:=coalesce(b->>'nombre',cat.nombre);IF length(btrim(nm)) NOT BETWEEN 1 AND 100 THEN PERFORM restopilot.rp_fail(400,'Ingrese un nombre válido.');END IF;UPDATE restopilot.categorias SET nombre=btrim(nm),descripcion=coalesce(b->>'descripcion',descripcion),actualizado_en=restopilot.rp_now() WHERE id=eid RETURNING * INTO cat;RETURN restopilot.rp_ok(restopilot.rp_camel(to_jsonb(cat)));
  ELSIF method='DELETE' THEN IF EXISTS(SELECT FROM restopilot.platos WHERE categoria_id=eid) THEN PERFORM restopilot.rp_fail(409,'No se puede eliminar la categoría porque tiene platos asociados.');END IF;DELETE FROM restopilot.categorias WHERE id=eid;RETURN restopilot.rp_ok(NULL,204);END IF;
 ELSIF x[1]='platos' THEN
  IF method='GET' THEN
   IF x[2]='restaurante' OR x[2] IS NULL THEN rid:=CASE WHEN x[2]='restaurante' THEN x[3]::bigint ELSE coalesce((q->>'restauranteId')::bigint,u.restaurante_id) END;IF rid IS NULL THEN PERFORM restopilot.rp_fail(400,'Selecciona un restaurante.');END IF;
    SELECT coalesce(jsonb_agg(restopilot.rp_dish(id) ORDER BY id),'[]') INTO data FROM restopilot.platos WHERE restaurante_id=rid AND (q->>'categoriaId' IS NULL OR categoria_id=(q->>'categoriaId')::bigint);
   ELSE data:=restopilot.rp_dish(x[2]::bigint);END IF;IF data IS NULL THEN PERFORM restopilot.rp_fail(404,'Plato no encontrado.');END IF;RETURN restopilot.rp_ok(data);
  END IF;
  IF method='POST' AND x[2] IS NULL THEN rid:=(b->>'restauranteId')::bigint;PERFORM restopilot.rp_manage(rid);p.restaurante_id:=rid;
  ELSE eid:=x[2]::bigint;SELECT * INTO p FROM restopilot.platos WHERE id=eid FOR UPDATE;IF p.id IS NULL THEN PERFORM restopilot.rp_fail(404,'Plato no encontrado.');END IF;rid:=p.restaurante_id;PERFORM restopilot.rp_manage(rid);END IF;
  IF method='DELETE' THEN IF EXISTS(SELECT FROM restopilot.detalles_pedido WHERE plato_id=eid) THEN PERFORM restopilot.rp_fail(409,'El plato tiene pedidos históricos; cambia su disponibilidad para conservarlos.');END IF;DELETE FROM restopilot.platos WHERE id=eid;RETURN restopilot.rp_ok(NULL,204);END IF;
  IF method='PATCH' AND x[3]='disponibilidad' THEN IF coalesce(b->>'disponible',q->>'disponible') NOT IN ('true','false') OR coalesce(b->>'disponible',q->>'disponible') IS NULL THEN PERFORM restopilot.rp_fail(400,'La disponibilidad es obligatoria.');END IF;UPDATE restopilot.platos SET disponible=coalesce(b->>'disponible',q->>'disponible')::boolean,actualizado_en=restopilot.rp_now() WHERE id=eid;RETURN restopilot.rp_ok(restopilot.rp_dish(eid));END IF;
  IF method NOT IN ('POST','PUT') THEN PERFORM restopilot.rp_fail(405,'Operación no admitida.');END IF;
  p.nombre:=coalesce(b->>'nombre',p.nombre);p.precio:=coalesce((b->>'precio')::numeric,p.precio);p.categoria_id:=coalesce((b->>'categoriaId')::bigint,p.categoria_id);p.complejidad:=upper(btrim(coalesce(b->>'complejidad',p.complejidad)));p.tiempo_preparacion_minutos:=coalesce((b->>'tiempoPreparacionMinutos')::integer,p.tiempo_preparacion_minutos);
  IF p.nombre IS NULL OR length(btrim(p.nombre)) NOT BETWEEN 1 AND 150 OR p.precio IS NULL OR p.precio<=0 OR p.precio>99999999.99 OR round(p.precio,2)<>p.precio OR p.complejidad IS NULL OR p.complejidad NOT IN ('BAJA','MEDIA','ALTA') OR p.tiempo_preparacion_minutos IS NULL OR p.tiempo_preparacion_minutos NOT BETWEEN 5 AND 15 OR length(coalesce(b->>'imagenUrl',''))>255 OR (b->>'restauranteId' IS NOT NULL AND (b->>'restauranteId')::bigint<>rid) THEN PERFORM restopilot.rp_fail(400,'Revisa nombre, precio, complejidad y preparación de 5 a 15 minutos.');END IF;
  IF NOT EXISTS(SELECT FROM restopilot.categorias WHERE id=p.categoria_id AND restaurante_id=rid) THEN PERFORM restopilot.rp_fail(400,'La categoría no pertenece al restaurante.');END IF;
  IF method='POST' THEN INSERT INTO restopilot.platos(restaurante_id,categoria_id,nombre,precio,descripcion,ingredientes,alergenos,complejidad,tiempo_preparacion_minutos,imagen_url,disponible,creado_en) VALUES(rid,p.categoria_id,btrim(p.nombre),p.precio,b->>'descripcion',b->>'ingredientes',b->>'alergenos',p.complejidad,p.tiempo_preparacion_minutos,b->>'imagenUrl',true,restopilot.rp_now()) RETURNING id INTO eid;
  ELSE UPDATE restopilot.platos SET categoria_id=p.categoria_id,nombre=btrim(p.nombre),precio=p.precio,descripcion=coalesce(b->>'descripcion',descripcion),ingredientes=coalesce(b->>'ingredientes',ingredientes),alergenos=coalesce(b->>'alergenos',alergenos),complejidad=p.complejidad,tiempo_preparacion_minutos=p.tiempo_preparacion_minutos,imagen_url=coalesce(b->>'imagenUrl',imagen_url),actualizado_en=restopilot.rp_now() WHERE id=eid;END IF;
  RETURN restopilot.rp_ok(restopilot.rp_dish(eid),CASE WHEN method='POST' THEN 201 ELSE 200 END);
 ELSIF x[1]='mesas' THEN
  IF method='GET' THEN
   IF x[2] IS NULL THEN PERFORM restopilot.rp_manage(u.restaurante_id);SELECT coalesce(jsonb_agg(restopilot.rp_table(id) ORDER BY numero,id),'[]') INTO data FROM restopilot.mesas WHERE restaurante_id=u.restaurante_id;
   ELSIF x[2]='restaurante' THEN rid:=x[3]::bigint;IF NOT EXISTS(SELECT FROM restopilot.restaurantes WHERE id=rid) THEN PERFORM restopilot.rp_fail(404,'Restaurante no encontrado.');END IF;SELECT coalesce(jsonb_agg(restopilot.rp_table(id) ORDER BY numero,id),'[]') INTO data FROM restopilot.mesas WHERE restaurante_id=rid AND activo;
   ELSE data:=restopilot.rp_table(x[2]::bigint);END IF;IF data IS NULL THEN PERFORM restopilot.rp_fail(404,'Mesa no encontrada.');END IF;RETURN restopilot.rp_ok(data);
  END IF;
  PERFORM restopilot.rp_manage(u.restaurante_id);rid:=u.restaurante_id;
  IF method='POST' AND x[2] IS NULL THEN IF NOT EXISTS(SELECT FROM restopilot.restaurantes WHERE id=rid AND tiene_atencion_fisica) THEN PERFORM restopilot.rp_fail(400,'La atención física está pausada.');END IF;
  ELSE eid:=x[2]::bigint;SELECT * INTO m FROM restopilot.mesas WHERE id=eid FOR UPDATE;IF m.id IS NULL THEN PERFORM restopilot.rp_fail(404,'Mesa no encontrada.');END IF;PERFORM restopilot.rp_manage(m.restaurante_id);END IF;
  IF method='PATCH' AND x[3]='estado' THEN
   IF jsonb_typeof(b->'activo') IS DISTINCT FROM 'boolean' THEN PERFORM restopilot.rp_fail(400,'El estado activo es obligatorio.');END IF;val:=(b->>'activo')::boolean;
   IF NOT val AND EXISTS(SELECT FROM restopilot.reservas WHERE mesa_id=eid AND estado IN ('PENDIENTE','CONFIRMADA') AND fecha+hora_fin>restopilot.rp_now()) THEN PERFORM restopilot.rp_fail(400,'No se puede desactivar una mesa con reservas vigentes.');END IF;UPDATE restopilot.mesas SET activo=val,actualizado_en=restopilot.rp_now() WHERE id=eid;RETURN restopilot.rp_ok(restopilot.rp_table(eid));
  END IF;
  IF method NOT IN ('POST','PUT') THEN PERFORM restopilot.rp_fail(405,'Operación no admitida.');END IF;
  num:=(b->>'numero')::integer;cap:=(b->>'capacidad')::integer;cx:=(b->>'coordenadaX')::double precision;cy:=(b->>'coordenadaY')::double precision;
  IF num IS NULL OR num<1 OR cap IS NULL OR cap<1 OR cx IS NULL OR cy IS NULL OR cx IN ('NaN'::double precision,'Infinity'::double precision,'-Infinity'::double precision) OR cy IN ('NaN'::double precision,'Infinity'::double precision,'-Infinity'::double precision) THEN PERFORM restopilot.rp_fail(400,'Ingresa número, capacidad y coordenadas válidas.');END IF;
  IF EXISTS(SELECT FROM restopilot.mesas WHERE restaurante_id=rid AND numero=num AND id IS DISTINCT FROM eid) THEN PERFORM restopilot.rp_fail(409,'El número de mesa ya existe.');END IF;
  IF eid IS NOT NULL AND EXISTS(SELECT FROM restopilot.reservas WHERE mesa_id=eid AND estado IN ('PENDIENTE','CONFIRMADA') AND fecha+hora_fin>restopilot.rp_now() AND numero_comensales>cap) THEN PERFORM restopilot.rp_fail(400,'La capacidad no puede ser menor que los comensales de una reserva vigente.');END IF;
  IF method='POST' THEN INSERT INTO restopilot.mesas(restaurante_id,numero,capacidad,coordenada_x,coordenada_y,activo,creado_en) VALUES(rid,num,cap,cx,cy,true,restopilot.rp_now()) RETURNING id INTO eid;ELSE UPDATE restopilot.mesas SET numero=num,capacidad=cap,coordenada_x=cx,coordenada_y=cy,actualizado_en=restopilot.rp_now() WHERE id=eid;END IF;
  RETURN restopilot.rp_ok(restopilot.rp_table(eid),CASE WHEN method='POST' THEN 201 ELSE 200 END);
 END IF;
 PERFORM restopilot.rp_fail(404,'Operación de catálogo no encontrada.');RETURN NULL;
END $$;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA restopilot FROM PUBLIC,anon,authenticated;
COMMIT;
