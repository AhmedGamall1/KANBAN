CREATE EXTENSION IF NOT EXISTS citext;

CREATE TYPE role_enum AS ENUM ('owner', 'member', 'viewer');

CREATE TYPE label_enum AS ENUM ('infra', 'db', 'frontend', 'bug', 'chore');

CREATE TYPE event_type AS ENUM (
  'card_created',
  'card_updated',
  'card_moved',
  'card_deleted',
  'column_created',
  'column_renamed',
  'column_moved',
  'column_deleted',
  'board_created',
  'board_renamed'
);