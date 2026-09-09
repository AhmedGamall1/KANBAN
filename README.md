# Collab Board

A Trello-style kanban board where a whole team works on the same board at once — cards move under
your cursor as someone else drags them, avatars show who is looking, and every change is written to
an append-only event log that doubles as the activity feed.

Built to practise the two problems that turn a CRUD app into a real one: **hard multi-tenant
isolation** and **real-time collaboration**.

---

## What it does

**Workspaces and people**
- Sign up with email and password, or with Google or GitHub
- Create workspaces, invite people with a reusable link, manage their roles
- Three roles — owner, member, viewer — enforced on the server, not just hidden in the UI
- A user cannot read a single row belonging to a workspace they are not in

**Boards**
- Boards, columns and cards; drag cards within and between columns; drag columns to reorder
- Assign a card to a member, label it, describe it
- Per-card activity feed: who changed what, and when

**Live collaboration**
- Everyone's changes appear immediately, with no refresh
- Avatars of everyone currently on the board
- Live cursors with names, and a marker on any card someone else is editing
- Reconnects on its own and replays what was missed while you were gone

**Interface**
- Light and dark themes
- Collapsible sidebar, keyboard-dismissable dialogs, empty states that tell you what to do next

---

## Stack

| | |
| --- | --- |
| **Backend** | NestJS 11 · TypeScript · Socket.IO |
| **Database** | PostgreSQL 18 · `pg` with hand-written SQL · hand-rolled migration runner |
| **Frontend** | React 19 · Vite · TypeScript · Tailwind CSS v4 |
| **State** | TanStack Query v5 · React Router v8 · dnd-kit |
| **Auth** | Argon2id · server-side sessions · OAuth 2.0 authorization code flow |
| **Validation** | Zod 4, shared between environment config and request DTOs |

No ORM. The security model lives in SQL, so the queries do too.

---

## Six decisions worth explaining

### 1. Tenant isolation is enforced by Postgres, not by `WHERE` clauses

Around 25 Row-Level Security policies decide what every query can see. The app connects as a
restricted role and sets the caller once per transaction:

```sql
SELECT set_config('app.user_id', $1, true)
```

The `true` makes it **transaction-local**, which is what makes it safe behind a connection pool — the
setting cannot leak into the next request that borrows the same connection.

The alternative was a `WHERE workspace_id = $1` on roughly forty queries. Forgetting one is a data
leak that no test would obviously catch. This way, forgetting one returns nothing.

A removed member gets `404`, not `403` — under RLS the row simply is not visible, which is also the
answer that leaks the least.

### 2. `workspace_id` is denormalised onto every tenant-scoped table

RLS policies are evaluated per row. Without the tenant id on the row, every policy becomes a
multi-table subquery — hundreds of hidden lookups per board load. Composite foreign keys
(`cards(board_id, workspace_id) → boards(id, workspace_id)`) make a mismatched copy impossible at the
database level rather than by convention.

### 3. Ordering is fractional, and the client never computes the number

Card and column positions are `numeric`, not `integer`. Dropping a card between two others writes
**one row** instead of renumbering every sibling.

The client sends the two neighbours it dropped between, not a position:

```
PATCH /cards/:id/position   { columnId, prevCardId, nextCardId }
```

The server derives the midpoint. If it took a number instead, two people dragging into the same gap
would compute the same one; deriving it server-side means the second transaction sees the first.

### 4. One event log serves both live sync and the activity feed

`board_events` is append-only with a `bigserial` cursor. The same row renders as a socket event or as
a line of history depending on who is asking.

On reconnect the client sends the last sequence number it saw and gets everything after it — or, if
too much happened, a signal to refetch instead of replaying. The sequence is a **cursor, not a
counter**: it is shared across boards and consumed by rolled-back transactions, so gaps are normal
and `seq + 1` would be wrong.

### 5. Writes go over REST; the socket only receives

Authentication, validation and RLS are already wired into the HTTP path. Putting writes on the socket
would mean duplicating all three. The single exception is cursor movement, which fires ~20×/sec and
is never persisted.

### 6. Optimistic updates have to be idempotent

Measured on this machine, the socket broadcast about your own write arrives **before your own HTTP
response**:

```
http +17.6ms   socket +16.5ms
http +11.9ms   socket +10.9ms
```

So every write lands twice — once as a broadcast, once as a response — and both paths have to work
alone, because a client with a dead socket still has to see its own card appear. Every function that
writes into the board cache filters before it appends.

### Also worth a look

- **Sessions, not JWTs.** Removing a member has to revoke access immediately, and that needs server
  state. The raw token goes to the browser in an httpOnly cookie; only its SHA-256 hash is stored.
- **OAuth implemented rather than installed.** The authorization code flow is under 400 lines for
  both providers, with no Passport: a `state` cookie for CSRF, a server-to-server token exchange, and
  account linking that only happens when the provider reports the email as **verified** — linking on
  an unverified address is the classic account-takeover hole.
- **Dark mode without touching a component.** The palette has been semantic since the first screen
  (`bg-surface`, `text-ink`), so the dark theme redefines about thirty CSS variables and nothing else.

---

## Running it

**Requirements:** Node 22+, Docker.

```bash
git clone <this repo>
cd collab-board

# Postgres 18 and Adminer
docker compose up -d

# API on :3001
cd api
npm install
cp .env.example .env      # then fill it in, see below
npm run migrate
npm run start:dev

# Web on :5173
cd ../web
npm install
npm run dev
```

Open http://localhost:5173.

`api/.env`:

```
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://collab_app:collab_app_dev_password@localhost:5433/collab
MIGRATION_DATABASE_URL=postgresql://collab:collab_dev_password@localhost:5433/collab
WEB_ORIGIN=http://localhost:5173
```

Two connection strings on purpose: migrations run as the owner because they create roles and
policies, while the app connects as a restricted role so that RLS actually applies to it. A superuser
silently bypasses every policy, which is the quiet way to think you have tenant isolation and not
have it.

Social sign-in is optional — leave the four keys out and the app runs on email and password. To turn
it on, register an OAuth app with each provider using the callback
`http://localhost:5173/api/auth/oauth/<provider>/callback`, and add:

```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

The frontend talks to `/api` and proxies through Vite in development, so browser, API and socket all
share one origin and there is no CORS anywhere.

---

## Layout

```
api/
  migrations/        18 forward-only .sql files, including every RLS policy
  scripts/migrate.ts hand-rolled runner
  src/
    access/          role resolution and the guards that use it
    auth/            sessions, password login, oauth/
    workspaces/      workspaces, members, invites
    boards/ columns/ cards/
    events/          the append-only log, and the activity feed built from it
    realtime/        the Socket.IO gateway
web/
  src/
    auth/ workspaces/ boards/   server state, one file per resource
    realtime/                   socket client, event reducer, presence
    components/ routes/ theme/
```

Controller → service → repository throughout: SQL appears only in repositories, database rows are
`snake_case`, domain objects are `camelCase`, and the mapper is the boundary between them.


