ALTER TABLE lists ADD COLUMN cover_id TEXT NOT NULL DEFAULT 'cover_01' CHECK(cover_id IN ('cover_01', 'cover_02', 'cover_03', 'cover_04', 'cover_05', 'cover_06', 'cover_07', 'cover_08', 'cover_09', 'cover_10', 'cover_11', 'cover_12', 'cover_13', 'cover_14', 'cover_15', 'cover_16', 'cover_17', 'cover_18', 'cover_19', 'cover_20', 'cover_21', 'cover_22', 'cover_23', 'cover_24', 'cover_25', 'cover_26', 'cover_27', 'cover_28', 'cover_29', 'cover_30', 'cover_31', 'cover_32', 'cover_33', 'cover_34', 'cover_35', 'cover_36', 'cover_37', 'cover_38', 'cover_39', 'cover_40'));
ALTER TABLE lists ADD COLUMN invite_code TEXT CHECK(invite_code IS NULL OR (length(invite_code) = 10 AND invite_code NOT GLOB '*[^0-9a-f]*'));
CREATE UNIQUE INDEX lists_invite_code ON lists(invite_code);
-- Backfill existing codes with backfill-invites.mjs (Node CSPRNG). Owner reads
-- also assign missing codes atomically; existing IDs/keys/claims are untouched.
CREATE TABLE invite_buckets (
  bucket INTEGER PRIMARY KEY CHECK(bucket >= 0 AND bucket < 256),
  window INTEGER NOT NULL,
  attempts INTEGER NOT NULL
);
