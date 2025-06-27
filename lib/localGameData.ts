// Local game data store for offline functionality
export interface LocalPlayer {
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

export interface LocalGameSession {
  id: string
  player_id: string
  session_type: string
  score: number
  duration: number
  money_earned: number
  reputation_gained: number
  created_at: string
}

// Sample leaderboard data
export const sampleLeaderboard = [
  {
    id: "1",
    username: "UrbanLegend",
    total_score: 8900,
    level: 7,
    reputation: 2200,
    rank: 1,
  },
  {
    id: "2",
    username: "StreetKing",
    total_score: 5500,
    level: 5,
    reputation: 1500,
    rank: 2,
  },
  {
    id: "3",
    username: "CityBoss",
    total_score: 3200,
    level: 4,
    reputation: 1100,
    rank: 3,
  },
  {
    id: "4",
    username: "NightRider",
    total_score: 2800,
    level: 3,
    reputation: 800,
    rank: 4,
  },
  {
    id: "5",
    username: "ShadowRunner",
    total_score: 1200,
    level: 2,
    reputation: 400,
    rank: 5,
  },
]

// Local storage helpers
export const LocalGameStorage = {
  getPlayer: (playerId: string): LocalPlayer | null => {
    if (typeof window === "undefined") return null
    try {
      const stored = localStorage.getItem(`player_${playerId}`)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  },

  savePlayer: (player: LocalPlayer): void => {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(`player_${player.id}`, JSON.stringify(player))
    } catch (error) {
      console.error("Failed to save player data:", error)
    }
  },

  createDefaultPlayer: (id: string, username: string, email: string): LocalPlayer => {
    return {
      id,
      email,
      username,
      level: 1,
      money: 1000,
      reputation: 0,
      vehicles: 3,
      total_score: 0,
      missions_completed: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  },

  updatePlayerStats: (
    playerId: string,
    scoreGained: number,
    moneyEarned: number,
    reputationGained: number,
  ): LocalPlayer | null => {
    const player = LocalGameStorage.getPlayer(playerId)
    if (!player) return null

    const updatedPlayer: LocalPlayer = {
      ...player,
      total_score: player.total_score + scoreGained,
      money: player.money + moneyEarned,
      reputation: player.reputation + reputationGained,
      level: calculateLevel(player.total_score + scoreGained),
      updated_at: new Date().toISOString(),
    }

    LocalGameStorage.savePlayer(updatedPlayer)
    return updatedPlayer
  },

  saveGameSession: (session: Omit<LocalGameSession, "id" | "created_at">): void => {
    if (typeof window === "undefined") return
    try {
      const sessionWithId: LocalGameSession = {
        ...session,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
      }
      const sessions = LocalGameStorage.getGameSessions()
      sessions.push(sessionWithId)
      localStorage.setItem("game_sessions", JSON.stringify(sessions.slice(-50))) // Keep last 50 sessions
    } catch (error) {
      console.error("Failed to save game session:", error)
    }
  },

  getGameSessions: (): LocalGameSession[] => {
    if (typeof window === "undefined") return []
    try {
      const stored = localStorage.getItem("game_sessions")
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  },
}

function calculateLevel(totalScore: number): number {
  if (totalScore >= 10000) return 10
  if (totalScore >= 5000) return 5
  if (totalScore >= 2000) return 3
  if (totalScore >= 1000) return 2
  return 1
}
