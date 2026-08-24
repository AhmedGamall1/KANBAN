CREATE TABLE board_events (
  seq          bigserial PRIMARY KEY,
  workspace_id uuid NOT NULL,
  board_id     uuid NOT NULL,
  actor_id     uuid NOT NULL REFERENCES users(id),
  type         event_type NOT NULL,
  payload      jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at   timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (board_id, workspace_id)
    REFERENCES boards (id, workspace_id) ON DELETE CASCADE
);

CREATE INDEX board_events_board_seq_idx ON board_events (board_id, seq);

ALTER TABLE board_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY board_events_select ON board_events
  FOR SELECT USING (app_is_member(workspace_id));
CREATE POLICY board_events_insert ON board_events
  FOR INSERT WITH CHECK (app_is_member(workspace_id));