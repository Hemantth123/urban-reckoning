-- Fix database operator errors and reinitialize
-- Drop existing objects first to avoid conflicts

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Players can view their own data" ON players;
DROP POLICY IF EXISTS "Players can update their own data" ON players;
DROP POLICY IF EXISTS "Players can insert their own data" ON players;
DROP POLICY IF EXISTS "Players can view their own sessions" ON game_sessions;
DROP POLICY IF EXISTS "Players can insert their own sessions" ON game_sessions;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS update_player_stats(UUID, INTEGER, INTEGER, INTEGER);

-- Drop existing view if it exists
DROP VIEW IF EXISTS leaderboard;

-- Drop existing tables if they exist (be careful with this in production)
DROP TABLE IF EXISTS game_sessions;
DROP TABLE IF EXISTS players;

-- Create players table with proper structure
CREATE TABLE players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 10),
  money INTEGER DEFAULT 1000 CHECK (money >= 0),
  reputation INTEGER DEFAULT 0 CHECK (reputation >= 0),
  vehicles INTEGER DEFAULT 3 CHECK (vehicles >= 0),
  total_score INTEGER DEFAULT 0 CHECK (total_score >= 0),
  missions_completed INTEGER DEFAULT 0 CHECK (missions_completed >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create game_sessions table
CREATE TABLE game_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL,
  score INTEGER DEFAULT 0 CHECK (score >= 0),
  duration INTEGER DEFAULT 0 CHECK (duration >= 0),
  money_earned INTEGER DEFAULT 0 CHECK (money_earned >= 0),
  reputation_gained INTEGER DEFAULT 0 CHECK (reputation_gained >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leaderboard view with proper syntax
CREATE VIEW leaderboard AS
SELECT 
  p.id,
  p.username,
  p.total_score,
  p.level,
  p.reputation,
  ROW_NUMBER() OVER (ORDER BY p.total_score DESC, p.reputation DESC) as rank
FROM players p
ORDER BY p.total_score DESC, p.reputation DESC;

-- Create indexes for better performance
CREATE INDEX idx_players_total_score ON players(total_score DESC);
CREATE INDEX idx_players_reputation ON players(reputation DESC);
CREATE INDEX idx_players_username ON players(username);
CREATE INDEX idx_game_sessions_player_id ON game_sessions(player_id);
CREATE INDEX idx_game_sessions_created_at ON game_sessions(created_at DESC);
CREATE INDEX idx_game_sessions_session_type ON game_sessions(session_type);

-- Create function to update player stats with proper error handling
CREATE OR REPLACE FUNCTION update_player_stats(
  p_player_id UUID,
  p_score_gained INTEGER,
  p_money_gained INTEGER,
  p_reputation_gained INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_total_score INTEGER;
  new_level INTEGER;
BEGIN
  -- Get current total score
  SELECT total_score INTO current_total_score 
  FROM players 
  WHERE id = p_player_id;
  
  -- Calculate new level based on total score
  current_total_score := COALESCE(current_total_score, 0) + p_score_gained;
  
  -- Determine new level
  IF current_total_score >= 10000 THEN
    new_level := 10;
  ELSIF current_total_score >= 5000 THEN
    new_level := 5;
  ELSIF current_total_score >= 2000 THEN
    new_level := 3;
  ELSIF current_total_score >= 1000 THEN
    new_level := 2;
  ELSE
    new_level := 1;
  END IF;
  
  -- Update player stats
  UPDATE players 
  SET 
    total_score = total_score + p_score_gained,
    money = money + p_money_gained,
    reputation = reputation + p_reputation_gained,
    level = new_level,
    updated_at = NOW()
  WHERE id = p_player_id;
  
  -- Check if update was successful
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Player with id % not found', p_player_id;
  END IF;
END;
$$;

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create trigger for players table
CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies with proper syntax
CREATE POLICY "players_select_own" ON players
  FOR SELECT 
  USING (auth.uid()::text = id::text);

CREATE POLICY "players_insert_own" ON players
  FOR INSERT 
  WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY "players_update_own" ON players
  FOR UPDATE 
  USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY "sessions_select_own" ON game_sessions
  FOR SELECT 
  USING (auth.uid()::text = player_id::text);

CREATE POLICY "sessions_insert_own" ON game_sessions
  FOR INSERT 
  WITH CHECK (auth.uid()::text = player_id::text);

-- Allow public read access to leaderboard data (usernames and scores only)
CREATE POLICY "leaderboard_public_read" ON players
  FOR SELECT 
  USING (true);

-- Insert sample data for testing with proper UUID format
INSERT INTO players (id, email, username, level, money, reputation, total_score, missions_completed) VALUES
('550e8400-e29b-41d4-a716-446655440001'::uuid, 'player1@example.com', 'StreetKing', 5, 25000, 1500, 5500, 15),
('550e8400-e29b-41d4-a716-446655440002'::uuid, 'player2@example.com', 'NightRider', 3, 15000, 800, 2800, 8),
('550e8400-e29b-41d4-a716-446655440003'::uuid, 'player3@example.com', 'UrbanLegend', 7, 45000, 2200, 8900, 25),
('550e8400-e29b-41d4-a716-446655440004'::uuid, 'player4@example.com', 'CityBoss', 4, 18000, 1100, 3200, 12),
('550e8400-e29b-41d4-a716-446655440005'::uuid, 'player5@example.com', 'ShadowRunner', 2, 8000, 400, 1200, 5)
ON CONFLICT (email) DO NOTHING;

-- Insert sample game sessions with proper UUID references
INSERT INTO game_sessions (player_id, session_type, score, duration, money_earned, reputation_gained) VALUES
('550e8400-e29b-41d4-a716-446655440001'::uuid, 'target_practice', 150, 30, 750, 75),
('550e8400-e29b-41d4-a716-446655440002'::uuid, 'target_practice', 120, 30, 600, 60),
('550e8400-e29b-41d4-a716-446655440003'::uuid, 'target_practice', 200, 30, 1000, 100),
('550e8400-e29b-41d4-a716-446655440001'::uuid, 'heist_mission', 500, 180, 2500, 250),
('550e8400-e29b-41d4-a716-446655440003'::uuid, 'street_race', 300, 120, 1500, 150);

-- Test the leaderboard view
SELECT 'Database fixed and reinitialized successfully!' as status;
SELECT 'Leaderboard test:' as test;
SELECT username, total_score, level, reputation, rank FROM leaderboard LIMIT 5;
