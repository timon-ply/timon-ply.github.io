CREATE TABLE accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  claim_hash TEXT NOT NULL UNIQUE,
  previous_key_hash TEXT,
  auth_version INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL
);
ALTER TABLE lists ADD COLUMN account_id TEXT REFERENCES accounts(id);
ALTER TABLE lists ADD COLUMN owner_link_enabled INTEGER NOT NULL DEFAULT 1;
CREATE INDEX lists_account ON lists(account_id);
CREATE TABLE account_sessions (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id),
  token_hash TEXT NOT NULL UNIQUE,
  auth_version INTEGER NOT NULL,
  device_name TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX sessions_account ON account_sessions(account_id, expires_at);
CREATE TABLE account_joins (
  account_id TEXT NOT NULL REFERENCES accounts(id),
  list_id TEXT NOT NULL REFERENCES lists(id),
  created_at INTEGER NOT NULL,
  PRIMARY KEY(account_id, list_id)
);
CREATE INDEX items_claim ON items(claim_hash, deleted);
-- Account deletion and its owned data are one SQLite statement/transaction.
CREATE TRIGGER account_delete_data BEFORE DELETE ON accounts BEGIN
  UPDATE items SET claim_hash = NULL, reserved_at = NULL, purchased = 0 WHERE claim_hash = OLD.claim_hash;
  DELETE FROM account_joins WHERE account_id = OLD.id OR list_id IN (SELECT id FROM lists WHERE account_id = OLD.id);
  DELETE FROM items WHERE list_id IN (SELECT id FROM lists WHERE account_id = OLD.id);
  DELETE FROM lists WHERE account_id = OLD.id;
  DELETE FROM account_sessions WHERE account_id = OLD.id;
END;
-- Fixed 256 slots bound abuse-counter storage even with arbitrary source IPs.
CREATE TABLE auth_buckets (
  bucket INTEGER PRIMARY KEY CHECK(bucket >= 0 AND bucket < 256),
  window INTEGER NOT NULL,
  attempts INTEGER NOT NULL
);
