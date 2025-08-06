-- Criar função para promover usuário a admin
CREATE OR REPLACE FUNCTION public.promote_user_to_admin(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Atualizar perfil do usuário para admin
  UPDATE public.profiles 
  SET user_type = 'admin'
  WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = user_email
  );
  
  -- Verificar se a atualização foi bem-sucedida
  IF FOUND THEN
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;