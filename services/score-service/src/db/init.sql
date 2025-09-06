CREATE TABLE IF NOT EXISTS scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  winner_id INTEGER NOT NULL,
  loser_id INTEGER NOT NULL,
  winner_score INTEGER NOT NULL,
  loser_score INTEGER NOT NULL,
  tournament_level INTEGER NOT NULL,
  game_duration INTEGER NOT NULL,
  game_start TIMESTAMP NOT NULL,
  game_end TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CHECK (winner_id != loser_id OR (winner_id = 0 AND loser_id = 0)),
  CHECK (winner_score > 0),
  CHECK (loser_score >= 0 AND loser_score < winner_score),
  CHECK (game_end > game_start),
  CHECK (game_duration = (julianday(game_end) - julianday(game_start)) * 86400),
  CHECK (tournament_level >= 0 AND tournament_level <= 2),
);
  
  CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY, -- UUID
  player1_id INTEGER NOT NULL,
  player2_id INTEGER NOT NULL,
  start_time TIMESTAMP NOT NULL,
  score_recorded BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  CHECK (player1_id != player2_id OR (player1_id = 0 AND player2_id = 0))
);

CREATE TRIGGER IF NOT EXISTS matches_updated_at
AFTER UPDATE ON matches
BEGIN
  UPDATE matches
  SET
    updated_at = CURRENT_TIMESTAMP
  WHERE
    id = NEW.id;
END;