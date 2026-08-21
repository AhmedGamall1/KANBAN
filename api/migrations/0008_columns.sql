CREATE TABLE columns (
  id           uuid PRIMARY KEY DEFAULT uuidv7(),
  workspace_id uuid NOT NULL,
  board_id     uuid NOT NULL,
  name         text NOT NULL,
  position     integer NOT NULL,
  UNIQUE (id, workspace_id),
  FOREIGN KEY (board_id, workspace_id)
    REFERENCES boards (id, workspace_id) ON DELETE CASCADE
);

CREATE INDEX columns_board_position_idx ON columns (board_id, position);

ALTER TABLE columns ENABLE ROW LEVEL SECURITY;

CREATE POLICY columns_select ON columns
  FOR SELECT USING (app_is_member(workspace_id));
CREATE POLICY columns_insert ON columns
  FOR INSERT WITH CHECK (app_is_member(workspace_id));
CREATE POLICY columns_update ON columns
  FOR UPDATE USING (app_is_member(workspace_id));
CREATE POLICY columns_delete ON columns
  FOR DELETE USING (app_is_member(workspace_id));