"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { LocalGameStorage, type LocalPlayer } from "@/lib/localGameData"

interface GameContextType {
  user: { id: string; email: string } | null
  player: LocalPlayer | null
  loading: boolean
  error: string | null
  mode: "online" | "offline"
  signUp: (email: string, password: string, username: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  saveGameSession: (sessionData: any) => Promise<void>
  refreshPlayerStats: () => Promise<void>
  clearError: () => void
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [player, setPlayer] = useState<LocalPlayer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<"online" | "offline">("offline")

  useEffect(() => {
    // Check if user is logged in locally
    const savedUser = localStorage.getItem("current_user")
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        fetchPlayerData(userData.id)
      } catch (error) {
        console.error("Error loading saved user:", error)
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [])

  const fetchPlayerData = async (userId: string) => {
    try {
      setError(null)
      const response = await fetch(`/api/game/player-stats?player_id=${userId}`)
      const data = await response.json()

      if (data.player) {
        setPlayer(data.player)
        setMode(data.mode || "offline")
      }

      if (data.message) {
        console.log(data.message)
      }
    } catch (error) {
      console.error("Error fetching player data:", error)

      // Create default player data if fetch fails
      const defaultPlayer = LocalGameStorage.createDefaultPlayer(userId, "Guest Player", "guest@example.com")
      setPlayer(defaultPlayer)
      setMode("offline")
      setError("Playing in offline mode")
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, username: string) => {
    try {
      setError(null)
      setLoading(true)

      // Create user locally (offline mode)
      const userId = Date.now().toString()
      const newUser = { id: userId, email }
      const newPlayer = LocalGameStorage.createDefaultPlayer(userId, username, email)

      // Save to local storage
      localStorage.setItem("current_user", JSON.stringify(newUser))
      LocalGameStorage.savePlayer(newPlayer)

      setUser(newUser)
      setPlayer(newPlayer)
      setMode("offline")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Signup failed"
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      setLoading(true)

      // For offline mode, create a simple login
      const userId = Date.now().toString()
      const userData = { id: userId, email }

      localStorage.setItem("current_user", JSON.stringify(userData))
      setUser(userData)

      // Try to load existing player or create new one
      let existingPlayer = LocalGameStorage.getPlayer(userId)
      if (!existingPlayer) {
        existingPlayer = LocalGameStorage.createDefaultPlayer(userId, "Player", email)
        LocalGameStorage.savePlayer(existingPlayer)
      }

      setPlayer(existingPlayer)
      setMode("offline")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Sign in failed"
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setError(null)
      localStorage.removeItem("current_user")
      setUser(null)
      setPlayer(null)
    } catch (error) {
      console.error("Sign out error:", error)
      setError("Sign out failed")
    }
  }

  const saveGameSession = async (sessionData: any) => {
    if (!user) return

    try {
      setError(null)
      const response = await fetch("/api/game/save-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          player_id: user.id,
          ...sessionData,
        }),
      })

      const data = await response.json()

      if (data.player) {
        setPlayer(data.player)
      }

      if (data.mode) {
        setMode(data.mode)
      }

      if (data.message) {
        console.log(data.message)
      }
    } catch (error) {
      console.error("Save session error:", error)
      setError("Session saved locally only")
    }
  }

  const refreshPlayerStats = async () => {
    if (user) {
      await fetchPlayerData(user.id)
    }
  }

  const clearError = () => {
    setError(null)
  }

  return (
    <GameContext.Provider
      value={{
        user,
        player,
        loading,
        error,
        mode,
        signUp,
        signIn,
        signOut,
        saveGameSession,
        refreshPlayerStats,
        clearError,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export const useGame = () => {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider")
  }
  return context
}
