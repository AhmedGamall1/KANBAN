ALTER TABLE cards DROP CONSTRAINT cards_assignee_id_workspace_id_fkey;

ALTER TABLE cards
  ADD CONSTRAINT cards_assignee_id_workspace_id_fkey
  FOREIGN KEY (assignee_id, workspace_id)
  REFERENCES workspace_members (user_id, workspace_id)
  ON DELETE SET NULL (assignee_id);
