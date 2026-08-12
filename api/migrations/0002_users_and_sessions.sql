CREATE TABLE users (
  id            uuid PRIMARY KEY DEFAULT uuidv7(),
  email         citext NOT NULL UNIQUE,
  password_hash text NOT NULL,
  name          text NOT NULL,
  avatar_color  text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE sessions (
  token_hash text PRIMARY KEY,
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX sessions_user_id_idx ON sessions (user_id);