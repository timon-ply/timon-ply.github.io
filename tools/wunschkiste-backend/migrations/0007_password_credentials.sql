ALTER TABLE accounts ADD COLUMN username TEXT CHECK(username IS NULL OR (length(username) BETWEEN 3 AND 32 AND username = lower(username) AND username NOT GLOB '*[^a-z0-9_]*' AND substr(username,1,1) GLOB '[a-z0-9]'));
ALTER TABLE accounts ADD COLUMN client_salt TEXT CHECK(client_salt IS NULL OR (length(client_salt) = 32 AND client_salt NOT GLOB '*[^a-f0-9]*'));
ALTER TABLE accounts ADD COLUMN server_salt TEXT CHECK(server_salt IS NULL OR (length(server_salt) = 32 AND server_salt NOT GLOB '*[^a-f0-9]*'));
ALTER TABLE accounts ADD COLUMN password_verifier TEXT CHECK(password_verifier IS NULL OR (length(password_verifier) = 64 AND password_verifier NOT GLOB '*[^a-f0-9]*'));
ALTER TABLE accounts ADD COLUMN kdf_version INTEGER CHECK(kdf_version IS NULL OR kdf_version = 1);
ALTER TABLE accounts ADD COLUMN client_iterations INTEGER CHECK(client_iterations IS NULL OR client_iterations = 600000);
ALTER TABLE accounts ADD COLUMN server_iterations INTEGER CHECK(server_iterations IS NULL OR server_iterations = 100000);
ALTER TABLE accounts ADD COLUMN password_change_token_hash TEXT;
CREATE UNIQUE INDEX accounts_username ON accounts(username);
CREATE UNIQUE INDEX accounts_password_change_token ON accounts(password_change_token_hash);
CREATE TABLE credential_buckets (
  bucket INTEGER PRIMARY KEY CHECK(bucket >= 0 AND bucket < 256),
  window INTEGER NOT NULL,
  attempts INTEGER NOT NULL
);
