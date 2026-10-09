CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY, name text NOT NULL, email text NOT NULL UNIQUE,
  password_hash text, password_salt text, google_sub text UNIQUE, avatar_url text,
  role text NOT NULL DEFAULT 'user', status text NOT NULL DEFAULT 'active',
  balance integer NOT NULL DEFAULT 0, created_at text NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash text PRIMARY KEY, user_id text NOT NULL, expires_at text NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions (user_id);
CREATE TABLE IF NOT EXISTS api_keys (
  id text PRIMARY KEY, user_id text NOT NULL, name text NOT NULL, key_hash text NOT NULL UNIQUE,
  prefix text NOT NULL, created_at text NOT NULL, revoked_at text
);
CREATE TABLE IF NOT EXISTS contacts (
  id text PRIMARY KEY, user_id text NOT NULL, phone text NOT NULL, name text NOT NULL DEFAULT '',
  variables text NOT NULL DEFAULT '{}', created_at text NOT NULL
);
CREATE INDEX IF NOT EXISTS contacts_user_idx ON contacts (user_id);
CREATE TABLE IF NOT EXISTS campaigns (
  id text PRIMARY KEY, user_id text NOT NULL, name text NOT NULL, body text NOT NULL, scheduled_at text,
  status text NOT NULL DEFAULT 'draft', total integer NOT NULL DEFAULT 0, sent integer NOT NULL DEFAULT 0,
  failed integer NOT NULL DEFAULT 0, created_at text NOT NULL
);
CREATE INDEX IF NOT EXISTS campaigns_user_status_idx ON campaigns (user_id, status);
CREATE TABLE IF NOT EXISTS recipients (
  id text PRIMARY KEY, seq bigserial, campaign_id text NOT NULL, phone text NOT NULL, name text NOT NULL DEFAULT '',
  variables text NOT NULL DEFAULT '{}', status text NOT NULL DEFAULT 'pending', error text, provider_id text, sent_at text
);
CREATE INDEX IF NOT EXISTS recipients_campaign_status_idx ON recipients (campaign_id, status);
CREATE TABLE IF NOT EXISTS messages (
  id text PRIMARY KEY, user_id text NOT NULL, campaign_id text, phone text NOT NULL, body text NOT NULL,
  status text NOT NULL, segments integer NOT NULL DEFAULT 1, provider_id text, error text, created_at text NOT NULL
);
CREATE INDEX IF NOT EXISTS messages_user_date_idx ON messages (user_id, created_at);
CREATE TABLE IF NOT EXISTS ledger (
  id text PRIMARY KEY, user_id text NOT NULL, delta integer NOT NULL, reason text NOT NULL, created_at text NOT NULL
);
CREATE INDEX IF NOT EXISTS ledger_user_date_idx ON ledger (user_id, created_at);
CREATE TABLE IF NOT EXISTS orders (
  id text PRIMARY KEY, user_id text NOT NULL, credits integer NOT NULL, price integer NOT NULL,
  payment_link_id text, payment_url text, status text NOT NULL DEFAULT 'pending', created_at text NOT NULL
);
CREATE INDEX IF NOT EXISTS orders_user_date_idx ON orders (user_id, created_at);
CREATE TABLE IF NOT EXISTS packages (
  id text PRIMARY KEY, credits integer NOT NULL, price integer NOT NULL, active integer NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS rate_limits (
  key text PRIMARY KEY, window_start bigint NOT NULL, count integer NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS optouts (
  id text PRIMARY KEY, user_id text NOT NULL, phone text NOT NULL, created_at text NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS optouts_user_phone_idx ON optouts (user_id, phone);
