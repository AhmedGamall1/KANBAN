ALTER TABLE cards DROP CONSTRAINT cards_board_id_workspace_id_fkey;

ALTER TABLE cards
  ADD CONSTRAINT cards_board_id_workspace_id_fkey
  FOREIGN KEY (board_id, workspace_id)
  REFERENCES boards (id, workspace_id)
  ON DELETE CASCADE;
