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
  
  CHECK (game_end > game_start),
  CHECK (game_duration = game_end - game_start),
  CHECK (tournament_level >= 0 AND tournament_level <= 2),
  CHECK (winner_id != loser_id OR (winner_id = 0 AND loser_id = 0))
);