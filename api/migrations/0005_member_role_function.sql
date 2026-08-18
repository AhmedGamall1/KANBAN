CREATE FUNCTION app_member_role(ws uuid, uid uuid) RETURNS role_enum
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM workspace_members
   WHERE workspace_id = ws AND user_id = uid
$$;