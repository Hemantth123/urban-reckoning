import { type NextRequest, NextResponse } from "next/server"
import { LocalGameStorage } from "@/lib/localGameData"

export async function POST(request: NextRequest) {
  try {
    const { player_id, session_type, score, duration, money_earned, reputation_gained } = await request.json()

    // Validate input data
    if (!player_id || !session_type || score < 0 || duration < 0 || money_earned < 0 || reputation_gained < 0) {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 })
    }

    // Save session to local storage
    LocalGameStorage.saveGameSession({
      player_id,
      session_type,
      score: Math.floor(score),
      duration: Math.floor(duration),
      money_earned: Math.floor(money_earned),
      reputation_gained: Math.floor(reputation_gained),
    })

    // Update player stats in local storage
    const updatedPlayer = LocalGameStorage.updatePlayerStats(
      player_id,
      Math.floor(score),
      Math.floor(money_earned),
      Math.floor(reputation_gained),
    )

    return NextResponse.json({
      message: "Session saved successfully in offline mode",
      mode: "offline",
      player: updatedPlayer,
    })
  } catch (error) {
    console.error("Save session API error:", error)
    return NextResponse.json({ error: "Failed to save session" }, { status: 500 })
  }
}
