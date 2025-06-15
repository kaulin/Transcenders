CREATE TABLE IF NOT EXISTS user_credentials (
  id INTEGER PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  pw_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_credentials_user_id ON user_credentials (user_id);
CREATE INDEX IF NOT EXISTS idx_user_credentials_username ON user_credentials (username);
CREATE INDEX IF NOT EXISTS idx_user_credentials_email ON user_credentials (email);

CREATE TRIGGER IF NOT EXISTS user_credentials_updated_at
AFTER
UPDATE
  ON user_credentials BEGIN
UPDATE
  user_credentials
SET
  updated_at = CURRENT_TIMESTAMP
WHERE
  id = NEW.id;

END;
