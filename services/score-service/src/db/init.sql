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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  
  CHECK (winner_id != loser_id OR (winner_id = 0 AND loser_id = 0)),
  CHECK (winner_score = 3),
  CHECK (loser_score >= 0 AND loser_score < 3),
  CHECK (game_end > game_start),
  CHECK (game_duration = (julianday(game_end) - julianday(game_start)) * 86400),
  CHECK (tournament_level >= 0 AND tournament_level <= 2),
);