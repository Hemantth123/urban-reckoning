import { type NextRequest, NextResponse } from "next/server"
import { LocalGameStorage } from "@/lib/localGameData"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const playerId = searchParams.get("player_id")

    if (!playerId) {
      return NextResponse.json({ error: "Player ID required" }, { status: 400 })
    }

    // Try to get player from local storage first
    let player = LocalGameStorage.getPlayer(playerId)

    if (!player) {
      // Create a default player if none exists
      player = LocalGameStorage.createDefaultPlayer(playerId, "Guest Player", "guest@example.com")
      LocalGameStorage.savePlayer(player)
    }

    return NextResponse.json({
      player,
      mode: "offline",
      message: "Playing in offline mode - progress saved locally",
    })
  } catch (error) {
    console.error("Player stats API error:", error)

    // Return default player data as fallback
    const defaultPlayer = LocalGameStorage.createDefaultPlayer("default", "Guest Player", "guest@example.com")

    return NextResponse.json({
      player: defaultPlayer,
      mode: "offline",
      error: "Using default player data",
    })
  }
}
