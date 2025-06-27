import { NextResponse } from "next/server"
import { sampleLeaderboard } from "@/lib/localGameData"

export async function GET() {
  try {
    // Always return sample leaderboard data for now
    // This ensures the game works without any database setup
    return NextResponse.json({
      leaderboard: sampleLeaderboard,
      mode: "offline",
      message: "Playing in offline mode - leaderboard shows sample data",
    })
  } catch (error) {
    console.error("Leaderboard API error:", error)
    return NextResponse.json({
      leaderboard: sampleLeaderboard,
      mode: "offline",
      error: "Using fallback data",
    })
  }
}
