CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

CREATE INDEX IF NOT EXISTS idx_users_created_at ON users (created_at);

CREATE TABLE IF NOT EXISTS friend_requests (
  id INTEGER PRIMARY KEY,
  initiator_id INTEGER NOT NULL,
  recipient_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (initiator_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (recipient_id) REFERENCES users (id) ON DELETE CASCADE,
  UNIQUE (initiator_id, recipient_id),
  CHECK (initiator_id <> recipient_id)
);

CREATE TABLE IF NOT EXISTS friendships (
  user1_id INTEGER NOT NULL,
  user2_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user1_id, user2_id),
  FOREIGN KEY (user1_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (user2_id) REFERENCES users (id) ON DELETE CASCADE,
  CHECK (user1_id < user2_id) -- guarantees canonical order and uniqueness
);

CREATE INDEX IF NOT EXISTS idx_friend_requests_recipient ON friend_requests (recipient_id);

CREATE INDEX IF NOT EXISTS idx_friendships_user2 ON friendships (user2_id);

CREATE TRIGGER IF NOT EXISTS users_updated_at
AFTER
UPDATE
  ON users BEGIN
UPDATE
  users
SET
  updated_at = CURRENT_TIMESTAMP
WHERE
  id = NEW.id;

END;

CREATE TRIGGER IF NOT EXISTS friend_requests_updated_at
AFTER
UPDATE
  ON friend_requests BEGIN
UPDATE
  friend_requests
SET
  updated_at = CURRENT_TIMESTAMP
WHERE
  id = NEW.id;

END;
