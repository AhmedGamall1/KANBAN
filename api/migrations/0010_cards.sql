CREATE TABLE cards (
  id           uuid PRIMARY KEY DEFAULT uuidv7(),
  workspace_id uuid NOT NULL,
  board_id     uuid NOT NULL,
  column_id    uuid NOT NULL,
  title        text NOT NULL,
  description  text,
  assignee_id  uuid,
  label        label_enum,
  position     integer NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, workspace_id),
  FOREIGN KEY (column_id, workspace_id)
    REFERENCES columns (id, workspace_id) ON DELETE CASCADE,
  FOREIGN KEY (board_id, workspace_id)
    REFERENCES boards (id, workspace_id),
  FOREIGN KEY (assignee_id, workspace_id)
    REFERENCES workspace_members (user_id, workspace_id)
);

CREATE INDEX cards_column_position_idx ON cards (column_id, position);

ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY cards_select ON cards
  FOR SELECT USING (app_is_member(workspace_id));
CREATE POLICY cards_insert ON cards
  FOR INSERT WITH CHECK (app_is_member(workspace_id));
CREATE POLICY cards_update ON cards
  FOR UPDATE USING (app_is_member(workspace_id));
CREATE POLICY cards_delete ON cards
  FOR DELETE USING (app_is_member(workspace_id));