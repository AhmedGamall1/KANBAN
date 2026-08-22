CREATE FUNCTION app_card_role(c uuid, uid uuid) RETURNS role_enum
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT m.role
    FROM cards ca
    JOIN workspace_members m ON m.workspace_id = ca.workspace_id
   WHERE ca.id = c AND m.user_id = uid
$$;