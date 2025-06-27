-- Create players table
CREATE TABLE IF NOT EXISTS players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  level INTEGER DEFAULT 1,
  money INTEGER DEFAULT 1000,
  reputation INTEGER DEFAULT 0,
  vehicles INTEGER DEFAULT 3,
  total_score INTEGER DEFAULT 0,
  missions_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create game_sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  duration INTEGER DEFAULT 0,
  money_earned INTEGER DEFAULT 0,
  reputation_gained INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leaderboard view
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
  p.id,
  p.username,
  p.total_score,
  p.level,
  p.reputation,
  ROW_NUMBER() OVER (ORDER BY p.total_score DESC, p.reputation DESC) as rank
FROM players p
ORDER BY p.total_score DESC, p.reputation DESC
LIMIT 100;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_players_total_score ON players(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_players_reputation ON players(reputation DESC);
CREATE INDEX IF NOT EXISTS idx_game_sessions_player_id ON game_sessions(player_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_created_at ON game_sessions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Players can view their own data" ON players
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Players can update their own data" ON players
  FOR UPDATE USING (auth.uid()::text = id);

CREATE POLICY "Players can insert their own data" ON players
  FOR INSERT WITH CHECK (auth.uid()::text = id);

CREATE POLICY "Players can view their own sessions" ON game_sessions
  FOR SELECT USING (auth.uid()::text = player_id);

CREATE POLICY "Players can insert their own sessions" ON game_sessions
  FOR INSERT WITH CHECK (auth.uid()::text = player_id);

-- Create function to update player stats
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
