-- Simple table creation script for Urban Reckoning
-- This ensures tables are created in the correct order

-- Drop existing objects if they exist (for clean setup)
DROP VIEW IF EXISTS leaderboard CASCADE;
DROP TABLE IF EXISTS game_sessions CASCADE;
DROP TABLE IF EXISTS players CASCADE;
DROP FUNCTION IF EXISTS update_player_stats(UUID, INTEGER, INTEGER, INTEGER) CASCADE;

-- Create players table first
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  level INTEGER DEFAULT 1,
  money INTEGER DEFAULT 1000,
  reputation INTEGER DEFAULT 0,
  vehicles INTEGER DEFAULT 3,
  total_score INTEGER DEFAULT 0,
  missions_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create game_sessions table
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  duration INTEGER DEFAULT 0,
  money_earned INTEGER DEFAULT 0,
  reputation_gained INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create simple leaderboard view
CREATE VIEW leaderboard AS
SELECT 
  id,
  username,
  total_score,
  level,
  reputation,
  ROW_NUMBER() OVER (ORDER BY total_score DESC) as rank
FROM players
ORDER BY total_score DESC;

-- Create update function
CREATE OR REPLACE FUNCTION update_player_stats(
  p_player_id UUID,
  p_score_gained INTEGER,
  p_money_gained INTEGER,
  p_reputation_gained INTEGER
)
RETURNS void AS $$
BEGIN
  UPDATE players 
  SET 
    total_score = total_score + p_score_gained,
    money = money + p_money_gained,
    reputation = reputation + p_reputation_gained,
    level = CASE 
      WHEN (total_score + p_score_gained) >= 10000 THEN 10
      WHEN (total_score + p_score_gained) >= 5000 THEN 5
      WHEN (total_score + p_score_gained) >= 2000 THEN 3
      WHEN (total_score + p_score_gained) >= 1000 THEN 2
      ELSE 1
    END,
    updated_at = NOW()
  WHERE id = p_player_id;
END;
$$ LANGUAGE plpgsql;

-- Insert sample data
INSERT INTO players (email, username, level, money, reputation, total_score, missions_completed) VALUES
('player1@example.com', 'StreetKing', 5, 25000, 1500, 5500, 15),
('player2@example.com', 'NightRider', 3, 15000, 800, 2800, 8),
('player3@example.com', 'UrbanLegend', 7, 45000, 2200, 8900, 25),
('player4@example.com', 'CityBoss', 4, 18000, 1100, 3200, 12),
('player5@example.com', 'ShadowRunner', 2, 8000, 400, 1200, 5);

SELECT 'Tables created successfully!' as result;
