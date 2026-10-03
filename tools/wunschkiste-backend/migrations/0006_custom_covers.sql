ALTER TABLE lists ADD COLUMN cover_hash TEXT NOT NULL DEFAULT '';
ALTER TABLE lists ADD COLUMN cover_upload_day INTEGER NOT NULL DEFAULT 0;
ALTER TABLE lists ADD COLUMN cover_upload_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE lists ADD COLUMN cover_upload_at INTEGER NOT NULL DEFAULT 0;
CREATE TABLE list_covers (
  list_id TEXT PRIMARY KEY REFERENCES lists(id) ON DELETE CASCADE,
  jpeg BLOB NOT NULL CHECK(length(jpeg) > 0 AND length(jpeg) <= 200000),
  sha256 TEXT NOT NULL CHECK(length(sha256) = 64),
  updated_at INTEGER NOT NULL
);
CREATE TRIGGER cover_after_insert AFTER INSERT ON list_covers BEGIN
  UPDATE lists SET cover_hash = NEW.sha256,
    cover_upload_count = CASE WHEN cover_upload_day = CAST(NEW.updated_at / 86400000 AS INTEGER) THEN cover_upload_count + 1 ELSE 1 END,
    cover_upload_day = CAST(NEW.updated_at / 86400000 AS INTEGER), cover_upload_at = NEW.updated_at
  WHERE id = NEW.list_id;
END;
CREATE TRIGGER cover_after_update AFTER UPDATE ON list_covers BEGIN
  UPDATE lists SET cover_hash = NEW.sha256,
    cover_upload_count = CASE WHEN cover_upload_day = CAST(NEW.updated_at / 86400000 AS INTEGER) THEN cover_upload_count + 1 ELSE 1 END,
    cover_upload_day = CAST(NEW.updated_at / 86400000 AS INTEGER), cover_upload_at = NEW.updated_at
  WHERE id = NEW.list_id;
END;
-- An explicit preset selection clears its prior custom image, even if the
-- selected preset equals the existing fallback. Other metadata edits do not.
CREATE TRIGGER cover_preset_selected AFTER UPDATE OF cover_id ON lists BEGIN
  DELETE FROM list_covers WHERE list_id = NEW.id;
  UPDATE lists SET cover_hash = '' WHERE id = NEW.id;
END;
