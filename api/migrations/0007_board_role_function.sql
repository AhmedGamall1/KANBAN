CREATE FUNCTION app_board_role(b uuid, uid uuid) RETURNS role_enum
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT m.role
    FROM boards bo
    JOIN workspace_members m ON m.workspace_id = bo.workspace_id
   WHERE bo.id = b AND m.user_id = uid
$$;