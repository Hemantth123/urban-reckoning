import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// Types for our database
export interface Player {
  id: string
  email: string
  username: string
  level: number
  money: number
  reputation: number
  vehicles: number
  total_score: number
  missions_completed: number
  created_at: string
  updated_at: string
}

export interface GameSession {
  id: string
  player_id: string
  session_type: string
  score: number
  duration: number
  money_earned: number
  reputation_gained: number
  created_at: string
}

export interface Leaderboard {
  id: string
  username: string
  total_score: number
  level: number
  reputation: number
  rank: number
}

// Test database connection
export async function testConnection() {
  try {
    const { data, error } = await supabase.from("players").select("count").limit(1)
    if (error) {
      console.error("Database connection error:", error)
      return false
    }
    return true
  } catch (error) {
    console.error("Database connection failed:", error)
    return false
  }
}
