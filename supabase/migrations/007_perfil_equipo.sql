BEGIN;

CREATE FUNCTION public.rp_update_workspace_profile(p_nombre_completo text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  account restopilot.usuarios := restopilot.rp_user();
  normalized_name text := regexp_replace(p_nombre_completo, '^[[:space:]]+|[[:space:]]+$', '', 'g');
  saved_name text;
BEGIN
  IF (account.rol IS NULL OR account.rol NOT IN ('ADMINISTRADOR', 'DUENO')) OR account.restaurante_id IS NULL THEN
    PERFORM restopilot.rp_fail(403, 'Solo un dueño o administrador puede editar su perfil desde este panel.');
  END IF;
  IF normalized_name IS NULL OR char_length(normalized_name) NOT BETWEEN 1 AND 150 THEN
    PERFORM restopilot.rp_fail(400, 'Indica un nombre completo de hasta 150 caracteres.');
  END IF;

  UPDATE restopilot.usuarios
  SET nombre_completo = normalized_name, actualizado_en = restopilot.rp_now()
  WHERE id = account.id AND auth_user_id = auth.uid() AND habilitado
    AND rol = account.rol AND restaurante_id = account.restaurante_id
  RETURNING nombre_completo INTO saved_name;

  IF NOT FOUND THEN
    PERFORM restopilot.rp_fail(403, 'Tu perfil ya no está disponible.');
  END IF;
  RETURN saved_name;
END;
$$;

REVOKE ALL ON FUNCTION public.rp_update_workspace_profile(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rp_update_workspace_profile(text) TO authenticated;
NOTIFY pgrst, 'reload schema';

COMMIT;
