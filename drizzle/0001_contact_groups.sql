CREATE TABLE IF NOT EXISTS contact_groups (
  id text PRIMARY KEY, user_id text NOT NULL, name text NOT NULL, created_at text NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS contact_groups_user_name_idx ON contact_groups (user_id, lower(name));
CREATE TABLE IF NOT EXISTS contact_group_members (
  group_id text NOT NULL REFERENCES contact_groups(id) ON DELETE CASCADE,
  contact_id text NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  PRIMARY KEY (group_id, contact_id)
);
CREATE INDEX IF NOT EXISTS contact_group_members_contact_idx ON contact_group_members (contact_id);
