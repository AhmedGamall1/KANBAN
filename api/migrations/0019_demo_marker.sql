ALTER TABLE users      ADD COLUMN is_demo boolean NOT NULL DEFAULT false;
ALTER TABLE workspaces ADD COLUMN is_demo boolean NOT NULL DEFAULT false;

CREATE INDEX users_is_demo_idx      ON users (created_at) WHERE is_demo;
CREATE INDEX workspaces_is_demo_idx ON workspaces (created_at) WHERE is_demo;