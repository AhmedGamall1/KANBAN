ALTER TABLE invites
  ADD CONSTRAINT invites_one_per_workspace UNIQUE (workspace_id);