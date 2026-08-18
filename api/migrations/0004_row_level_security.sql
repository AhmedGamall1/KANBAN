DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'collab_app') THEN
    CREATE ROLE collab_app LOGIN PASSWORD 'collab_app_dev_password';
  END IF;
END
$$;

GRANT CONNECT ON DATABASE collab TO collab_app;
GRANT USAGE ON SCHEMA public TO collab_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO collab_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO collab_app;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO collab_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO collab_app;

CREATE FUNCTION app_current_user_id() RETURNS uuid
LANGUAGE sql STABLE
AS $$ SELECT nullif(current_setting('app.user_id', true), '')::uuid $$;

CREATE FUNCTION app_is_member(ws uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM workspace_members
     WHERE workspace_id = ws
       AND user_id = app_current_user_id()
  )
$$;

CREATE FUNCTION app_invite_workspace(t text) RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$ SELECT workspace_id FROM invites WHERE token = t $$;

ALTER TABLE workspaces        ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites           ENABLE ROW LEVEL SECURITY;

CREATE POLICY workspaces_select ON workspaces
  FOR SELECT USING (app_is_member(id));
CREATE POLICY workspaces_insert ON workspaces
  FOR INSERT WITH CHECK (true);
CREATE POLICY workspaces_update ON workspaces
  FOR UPDATE USING (app_is_member(id));
CREATE POLICY workspaces_delete ON workspaces
  FOR DELETE USING (app_is_member(id));

CREATE POLICY members_select ON workspace_members
  FOR SELECT USING (app_is_member(workspace_id));
CREATE POLICY members_insert ON workspace_members
  FOR INSERT WITH CHECK (true);
CREATE POLICY members_update ON workspace_members
  FOR UPDATE USING (app_is_member(workspace_id));
CREATE POLICY members_delete ON workspace_members
  FOR DELETE USING (app_is_member(workspace_id));

CREATE POLICY invites_select ON invites
  FOR SELECT USING (app_is_member(workspace_id));
CREATE POLICY invites_insert ON invites
  FOR INSERT WITH CHECK (app_is_member(workspace_id));