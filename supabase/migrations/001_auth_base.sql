BEGIN;
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;
ALTER TABLE restopilot.usuarios ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id);
CREATE UNIQUE INDEX IF NOT EXISTS ux_usuarios_auth_user ON restopilot.usuarios(auth_user_id);
CREATE UNIQUE INDEX IF NOT EXISTS ux_usuarios_correo_normalizado ON restopilot.usuarios(lower(correo));

CREATE OR REPLACE FUNCTION restopilot.rp_now() RETURNS timestamp LANGUAGE sql VOLATILE SET search_path='' AS $$ SELECT clock_timestamp() AT TIME ZONE 'America/Lima' $$;
CREATE OR REPLACE FUNCTION restopilot.rp_fail(code integer,msg text) RETURNS void LANGUAGE plpgsql SET search_path='' AS $$ BEGIN RAISE EXCEPTION USING ERRCODE='PT'||code::text,MESSAGE=msg; END $$;
CREATE OR REPLACE FUNCTION restopilot.rp_user() RETURNS restopilot.usuarios LANGUAGE plpgsql STABLE SET search_path='' AS $$
DECLARE u restopilot.usuarios; BEGIN
 IF auth.uid() IS NULL THEN PERFORM restopilot.rp_fail(401,'Inicia sesión para continuar.'); END IF;
 IF auth.jwt()->>'session_id' IS NOT NULL AND NOT EXISTS(SELECT FROM auth.sessions WHERE id=(auth.jwt()->>'session_id')::uuid AND user_id=auth.uid()) THEN PERFORM restopilot.rp_fail(401,'La sesión fue cerrada.');END IF;
 SELECT * INTO u FROM restopilot.usuarios WHERE auth_user_id=auth.uid() AND habilitado;
 IF u.id IS NULL THEN PERFORM restopilot.rp_fail(403,'La cuenta no está habilitada en RestoPilot.'); END IF; RETURN u;
END $$;
CREATE OR REPLACE FUNCTION restopilot.rp_manage(rid bigint) RETURNS void LANGUAGE plpgsql STABLE SET search_path='' AS $$
DECLARE u restopilot.usuarios:=restopilot.rp_user(); BEGIN
 IF u.rol NOT IN ('ADMINISTRADOR','DUENO') OR u.restaurante_id IS DISTINCT FROM rid OR rid IS NULL THEN PERFORM restopilot.rp_fail(403,'No tienes permisos para gestionar este restaurante.'); END IF;
END $$;
CREATE OR REPLACE FUNCTION restopilot.rp_camel(v jsonb) RETURNS jsonb LANGUAGE plpgsql IMMUTABLE SET search_path='' AS $$
DECLARE result jsonb:='{}';k text;x jsonb;parts text[];n text;i integer;BEGIN
 FOR k,x IN SELECT * FROM jsonb_each(v) LOOP parts:=string_to_array(k,'_');n:=parts[1];IF cardinality(parts)>1 THEN FOR i IN 2..cardinality(parts) LOOP n:=n||upper(substr(parts[i],1,1))||substr(parts[i],2);END LOOP;END IF; result:=result||jsonb_build_object(n,x);END LOOP;RETURN result;END $$;
CREATE OR REPLACE FUNCTION restopilot.rp_profile() RETURNS jsonb LANGUAGE plpgsql STABLE SET search_path='' AS $$
DECLARE u restopilot.usuarios:=restopilot.rp_user();BEGIN RETURN jsonb_build_object('id',u.id,'authUserId',u.auth_user_id,'correo',u.correo,'nombreCompleto',u.nombre_completo,'rol',u.rol,'restauranteId',u.restaurante_id); END $$;

-- El trigger participa en la misma transacción de Auth. Metadatos públicos nunca
-- asignan un restaurante existente ni roles administrativos.
CREATE OR REPLACE FUNCTION restopilot.rp_auth_created() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE m jsonb:=coalesce(new.raw_user_meta_data,'{}');a jsonb:=coalesce(new.raw_app_meta_data,'{}');r jsonb;rid bigint;nm text;existing restopilot.usuarios;BEGIN
 SELECT raw_user_meta_data,raw_app_meta_data INTO m,a FROM auth.users WHERE id=new.id;
 SELECT * INTO existing FROM restopilot.usuarios WHERE lower(correo)=lower(new.email);
 IF existing.id IS NOT NULL THEN
  IF a->>'restopilot_migration'='true' AND existing.auth_user_id IS NULL THEN
   UPDATE restopilot.usuarios SET auth_user_id=new.id,password_hash=new.encrypted_password,actualizado_en=restopilot.rp_now() WHERE id=existing.id;RETURN new;
  END IF;
  PERFORM restopilot.rp_fail(409,'Este correo ya pertenece a una cuenta del proyecto.');
 END IF;
 nm:=btrim(coalesce(m->>'nombreCompleto',''));IF length(nm)<1 OR length(nm)>150 OR length(new.email)>100 THEN PERFORM restopilot.rp_fail(400,'El nombre o correo no es válido.');END IF;
 IF a->>'restopilot_role'='ADMINISTRADOR' THEN
  rid:=(a->>'restopilot_restaurante_id')::bigint;IF NOT EXISTS(SELECT FROM restopilot.restaurantes WHERE id=rid) THEN PERFORM restopilot.rp_fail(400,'Restaurante no encontrado.');END IF;
  INSERT INTO restopilot.usuarios(correo,nombre_completo,password_hash,rol,restaurante_id,habilitado,creado_en,auth_user_id) VALUES(lower(new.email),nm,new.encrypted_password,'ADMINISTRADOR',rid,true,restopilot.rp_now(),new.id);
 ELSIF m->>'register_owner'='true' THEN
  r:=m->'restaurante';IF r IS NULL OR r ? 'id' OR r ? 'restauranteId' OR m ? 'rol' OR m ? 'restauranteId' OR nullif(btrim(r->>'nombre'),'') IS NULL OR length(r->>'nombre')>150 OR nullif(btrim(r->>'direccion'),'') IS NULL OR length(r->>'direccion')>255 OR nullif(btrim(r->>'telefono'),'') IS NULL OR length(r->>'telefono')>20 OR (r->>'horaApertura')::time >= (r->>'horaCierre')::time OR r->>'horaApertura' IS NULL OR r->>'horaCierre' IS NULL OR jsonb_typeof(r->'tieneAtencionFisica') IS DISTINCT FROM 'boolean' OR jsonb_typeof(r->'aceptaDelivery') IS DISTINCT FROM 'boolean' THEN PERFORM restopilot.rp_fail(400,'Completa los datos y un horario válido del restaurante.');END IF;
  INSERT INTO restopilot.restaurantes(nombre,direccion,telefono,hora_apertura,hora_cierre,activo,tiene_atencion_fisica,acepta_delivery,creado_en) VALUES(btrim(r->>'nombre'),btrim(r->>'direccion'),btrim(r->>'telefono'),(r->>'horaApertura')::time,(r->>'horaCierre')::time,true,(r->>'tieneAtencionFisica')::boolean,(r->>'aceptaDelivery')::boolean,restopilot.rp_now()) RETURNING id INTO rid;
  INSERT INTO restopilot.usuarios(correo,nombre_completo,password_hash,rol,restaurante_id,habilitado,creado_en,auth_user_id) VALUES(lower(new.email),nm,new.encrypted_password,'DUENO',rid,true,restopilot.rp_now(),new.id);
 ELSE
  IF m ? 'rol' OR m ? 'restauranteId' THEN PERFORM restopilot.rp_fail(400,'El rol y restaurante los determina el servidor.');END IF;
  INSERT INTO restopilot.usuarios(correo,nombre_completo,password_hash,rol,restaurante_id,habilitado,creado_en,auth_user_id) VALUES(lower(new.email),nm,new.encrypted_password,'CLIENTE',NULL,true,restopilot.rp_now(),new.id);
 END IF;RETURN new;
END $$;
DROP TRIGGER IF EXISTS restopilot_auth_created ON auth.users;
CREATE CONSTRAINT TRIGGER restopilot_auth_created AFTER INSERT ON auth.users DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION restopilot.rp_auth_created();

CREATE OR REPLACE FUNCTION restopilot.rp_create_admin(b jsonb) RETURNS jsonb LANGUAGE plpgsql SET search_path='' AS $$
DECLARE u restopilot.usuarios:=restopilot.rp_user();k text;reply extensions.http_response;au jsonb;profile restopilot.usuarios;mail text:=lower(btrim(b->>'correo'));BEGIN
 IF u.rol<>'DUENO' THEN PERFORM restopilot.rp_fail(403,'Solo un dueño puede incorporar administradores.');END IF;PERFORM restopilot.rp_manage(u.restaurante_id);
 IF b ? 'rol' OR b ? 'restauranteId' OR nullif(btrim(b->>'nombreCompleto'),'') IS NULL OR length(b->>'nombreCompleto')>150 OR mail IS NULL OR length(mail)>100 OR mail !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' OR nullif(b->>'password','') IS NULL OR length(b->>'password')<8 OR octet_length(b->>'password')>72 THEN PERFORM restopilot.rp_fail(400,'Completa nombre, correo y contraseña válidos.');END IF;
 IF EXISTS(SELECT FROM restopilot.usuarios WHERE lower(correo)=mail) THEN PERFORM restopilot.rp_fail(409,'El correo ya está registrado.');END IF;
 SELECT decrypted_secret INTO k FROM vault.decrypted_secrets WHERE name='restopilot_auth_admin_key';IF k IS NULL THEN PERFORM restopilot.rp_fail(503,'La administración de cuentas no está configurada.');END IF;
 PERFORM extensions.http_set_curlopt('CURLOPT_TIMEOUT_MS','15000');
 SELECT * INTO reply FROM extensions.http(('POST','https://unvxosrwqmcwrtxplrsf.supabase.co/auth/v1/admin/users',ARRAY[extensions.http_header('apikey',k),extensions.http_header('Authorization','Bearer '||k),extensions.http_header('User-Agent','RestoPilot-Database/1.0')],'application/json',jsonb_build_object('email',mail,'password',b->>'password','email_confirm',true,'user_metadata',jsonb_build_object('nombreCompleto',btrim(b->>'nombreCompleto')),'app_metadata',jsonb_build_object('restopilot_role','ADMINISTRADOR','restopilot_restaurante_id',u.restaurante_id))::text)::extensions.http_request);
 IF reply.status NOT IN (200,201) THEN PERFORM restopilot.rp_fail(CASE WHEN reply.status IN (400,409,422) THEN 409 ELSE 503 END,'No se pudo incorporar el administrador. Revisa si el correo ya existe antes de reintentar.');END IF;
 au:=reply.content::jsonb;SELECT * INTO profile FROM restopilot.usuarios WHERE auth_user_id=(au->>'id')::uuid;
 IF profile.id IS NULL OR profile.rol<>'ADMINISTRADOR' OR profile.restaurante_id<>u.restaurante_id THEN PERFORM restopilot.rp_fail(503,'No pudimos verificar la cuenta creada. Consulta antes de reenviar.');END IF;
 RETURN jsonb_build_object('mensaje','Administrador incorporado con éxito.','id',profile.id,'nombreCompleto',profile.nombre_completo,'correo',profile.correo,'rol',profile.rol,'restauranteId',profile.restaurante_id);
END $$;

DO $$DECLARE t record;BEGIN FOR t IN SELECT tablename FROM pg_tables WHERE schemaname='restopilot' LOOP EXECUTE format('ALTER TABLE restopilot.%I ENABLE ROW LEVEL SECURITY',t.tablename);END LOOP;END $$;
REVOKE ALL ON SCHEMA restopilot FROM PUBLIC,anon,authenticated;
REVOKE ALL ON ALL TABLES IN SCHEMA restopilot FROM PUBLIC,anon,authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA restopilot FROM PUBLIC,anon,authenticated;
COMMIT;
