ALTER TABLE lists ADD COLUMN description TEXT NOT NULL DEFAULT '' CHECK (length(description) <= 240);
