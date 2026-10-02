PRAGMA defer_foreign_keys = ON;
CREATE TABLE lists_next (
  slot INTEGER PRIMARY KEY,
  id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  event_date TEXT NOT NULL DEFAULT '',
  owner_hash TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL,
  description TEXT NOT NULL DEFAULT '' CHECK (length(description) <= 240),
  creator_hash TEXT NOT NULL DEFAULT ''
);
INSERT INTO lists_next (slot, id, title, event_date, owner_hash, created_at, description)
SELECT slot, id, title, event_date, owner_hash, created_at, description FROM lists;
DROP TABLE lists;
ALTER TABLE lists_next RENAME TO lists;
CREATE INDEX lists_created ON lists(created_at);
CREATE INDEX lists_creator_created ON lists(creator_hash, created_at);
PRAGMA defer_foreign_keys = OFF;
