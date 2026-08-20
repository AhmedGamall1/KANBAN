CREATE TABLE boards (
  id           uuid PRIMARY KEY DEFAULT uuidv7(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name         text NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, workspace_id)
);

CREATE INDEX boards_workspace_id_idx ON boards (workspace_id);

ALTER TABLE boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY boards_select ON boards
  FOR SELECT USING (app_is_member(workspace_id));
CREATE POLICY boards_insert ON boards
  FOR INSERT WITH CHECK (app_is_member(workspace_id));
CREATE POLICY boards_update ON boards
  FOR UPDATE USING (app_is_member(workspace_id));
CREATE POLICY boards_delete ON boards
  FOR DELETE USING (app_is_member(workspace_id));