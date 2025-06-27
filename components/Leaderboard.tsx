"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Medal, Award, Crown, Wifi, WifiOff } from "lucide-react"

interface LeaderboardEntry {
  id: string
  username: string
  total_score: number
  level: number
  reputation: number
  rank: number
}

export function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<"online" | "offline">("offline")
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch("/api/game/leaderboard")
      const data = await response.json()

      if (data.leaderboard) {
        setLeaderboard(data.leaderboard)
        setMode(data.mode || "offline")
        setMessage(data.message || "")
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error)
      // Set fallback data
      setLeaderboard([
        { id: "1", username: "UrbanLegend", total_score: 8900, level: 7, reputation: 2200, rank: 1 },
        { id: "2", username: "StreetKing", total_score: 5500, level: 5, reputation: 1500, rank: 2 },
        { id: "3", username: "CityBoss", total_score: 3200, level: 4, reputation: 1100, rank: 3 },
        { id: "4", username: "NightRider", total_score: 2800, level: 3, reputation: 800, rank: 4 },
        { id: "5", username: "ShadowRunner", total_score: 1200, level: 2, reputation: 400, rank: 5 },
      ])
      setMode("offline")
      setMessage("Using sample leaderboard data")
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Trophy className="h-5 w-5 text-gray-400" />
      case 3:
        return <Medal className="h-5 w-5 text-orange-500" />
      default:
        return <Award className="h-5 w-5 text-gray-600" />
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-500 to-orange-500"
      case 2:
        return "bg-gradient-to-r from-gray-400 to-gray-500"
      case 3:
        return "bg-gradient-to-r from-orange-500 to-red-500"
      default:
        return "bg-gray-700"
    }
  }

  if (loading) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Global Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-400">Loading leaderboard...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center">
            <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
            Global Leaderboard
          </div>
          <div className="flex items-center text-sm">
            {mode === "online" ? (
              <div className="flex items-center text-green-400">
                <Wifi className="h-4 w-4 mr-1" />
                Online
              </div>
            ) : (
              <div className="flex items-center text-yellow-400">
                <WifiOff className="h-4 w-4 mr-1" />
                Offline
              </div>
            )}
          </div>
        </CardTitle>
        {message && <p className="text-sm text-gray-400 mt-2">{message}</p>}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboard.map((entry) => (
            <div
              key={entry.id}
              className={`flex items-center justify-between p-3 rounded-lg ${
                entry.rank <= 3 ? getRankColor(entry.rank) : "bg-gray-800"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {getRankIcon(entry.rank)}
                  <span className="font-bold text-white">#{entry.rank}</span>
                </div>
                <div>
                  <div className="font-semibold text-white">{entry.username}</div>
                  <div className="text-sm text-gray-300">Level {entry.level}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-white">{entry.total_score.toLocaleString()}</div>
                <div className="text-sm text-gray-300">{entry.reputation} rep</div>
              </div>
            </div>
          ))}
          {leaderboard.length === 0 && (
            <div className="text-center text-gray-400 py-8">No players yet. Be the first to join!</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
