CREATE TABLE IF NOT EXISTS user_credentials (
  id INTEGER PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL,
  pw_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_credentials_user_id ON user_credentials (user_id);

CREATE TRIGGER IF NOT EXISTS user_credentials_updated_at
AFTER UPDATE ON user_credentials
BEGIN
  UPDATE user_credentials
  SET updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
END;

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  revoked_at DATETIME NULL,
  device_info TEXT,
  FOREIGN KEY (user_id) REFERENCES user_credentials(user_id)
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires ON refresh_tokens (expires_at);

CREATE TRIGGER IF NOT EXISTS refresh_tokens_updated_at
AFTER UPDATE ON refresh_tokens
BEGIN
  UPDATE refresh_tokens
  SET updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
END;
