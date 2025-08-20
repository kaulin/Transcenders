CREATE TABLE IF NOT EXISTS user_credentials (
  id INTEGER PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL,
  pw_hash TEXT NULL,
  google_linked BOOLEAN DEFAULT FALSE,
  two_fac_enabled BOOLEAN DEFAULT FALSE,
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
  jti TEXT UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  revoked_at DATETIME NULL,
  revoke_reason TEXT,
  device_fingerprint TEXT,
  ip_address TEXT,
  user_agent TEXT,
  FOREIGN KEY (user_id) REFERENCES user_credentials(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_jti ON refresh_tokens (jti);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires ON refresh_tokens (expires_at);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_revoked_at ON refresh_tokens (revoked_at);

CREATE TABLE IF NOT EXISTS two_factor (
  id INTEGER PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('verified', 'pending')),
  verified_at DATETIME DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_two_factor_user_id ON two_factor (user_id);
CREATE INDEX IF NOT EXISTS idx_two_factor_email ON two_factor (email);
CREATE INDEX IF NOT EXISTS idx_two_factor_status ON two_factor (status);

CREATE TRIGGER IF NOT EXISTS two_factor_verified_at
AFTER UPDATE ON two_factor
  WHEN OLD.status = 'pending' AND NEW.status = 'verified'
BEGIN
  UPDATE two_factor
  SET 
    verified_at = CURRENT_TIMESTAMP
  WHERE
    id = NEW.id;
END;

CREATE TABLE IF NOT EXISTS two_factor_challenges (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  purpose TEXT NOT NULL CHECK (purpose IN ('enroll', 'login', 'stepup', 'disable')),
  code_hash TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  consumed_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES two_factor(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_2fa_challenges_user ON two_factor_challenges (user_id);
CREATE INDEX IF NOT EXISTS idx_2fa_challenges_purpose ON two_factor_challenges (purpose);
CREATE INDEX IF NOT EXISTS idx_2fa_challenges_expires ON two_factor_challenges (expires_at);
CREATE INDEX IF NOT EXISTS idx_2fa_challenges_consumed ON two_factor_challenges (consumed_at);