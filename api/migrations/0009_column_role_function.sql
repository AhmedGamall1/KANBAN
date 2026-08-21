CREATE FUNCTION app_column_role(c uuid, uid uuid) RETURNS role_enum
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT m.role
    FROM columns co
    JOIN workspace_members m ON m.workspace_id = co.workspace_id
   WHERE co.id = c AND m.user_id = uid
$$;