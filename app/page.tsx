"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Zap, Trophy, Settings, Target, Car, Users, MapPin, Shield, Coins, Wifi, WifiOff } from "lucide-react"
import { GameProvider, useGame } from "@/contexts/GameContext"
import { AuthModal } from "@/components/AuthModal"
import { Leaderboard } from "@/components/Leaderboard"

const UrbanReckoningGame = () => {
  return (
    <GameProvider>
      <UrbanReckoningGameContent />
    </GameProvider>
  )
}

function UrbanReckoningGameContent() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const { user, player, signOut, saveGameSession, error, mode, clearError } = useGame()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [targets, setTargets] = useState<Array<{ id: number; x: number; y: number }>>([])

  const slides = [
    {
      title: "Welcome to Urban Reckoning",
      subtitle: "The Ultimate Open-World Experience",
      image: "/placeholder.svg?height=400&width=800",
      description: "Enter a living, breathing city where every choice matters",
    },
    {
      title: "Massive Open World",
      subtitle: "Explore Every Corner",
      image: "/placeholder.svg?height=400&width=800",
      description: "From downtown skyscrapers to suburban neighborhoods",
    },
    {
      title: "Dynamic AI System",
      subtitle: "Living City",
      image: "/placeholder.svg?height=400&width=800",
      description: "NPCs with real routines, emotions, and reactions",
    },
  ]

  const features = [
    {
      icon: <Car className="h-8 w-8" />,
      title: "60+ Vehicles",
      description: "Cars, bikes, boats, helicopters with realistic physics",
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Dynamic Missions",
      description: "Story-driven campaigns with multiple outcomes",
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Living NPCs",
      description: "AI citizens with daily routines and emotions",
    },
    {
      icon: <MapPin className="h-8 w-8" />,
      title: "Massive City",
      description: "Multiple districts to explore and conquer",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Police System",
      description: "Escalating wanted levels with smart AI",
    },
    {
      icon: <Coins className="h-8 w-8" />,
      title: "Economy",
      description: "Earn money through missions and businesses",
    },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [slides.length])

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft])

  useEffect(() => {
    const spawnTarget = () => {
      const newTarget = {
        id: Date.now(),
        x: Math.random() * 80,
        y: Math.random() * 80,
      }
      setTargets((prev) => [...prev, newTarget])
      setTimeout(() => {
        setTargets((prev) => prev.filter((t) => t.id !== newTarget.id))
      }, 2000)
    }

    if (timeLeft > 0) {
      const interval = setInterval(spawnTarget, 1000)
      return () => clearInterval(interval)
    }
  }, [timeLeft])

  const hitTarget = (targetId: number) => {
    setTargets((prev) => prev.filter((t) => t.id !== targetId))
    setScore((prev) => prev + 10)
  }

  const MiniGame = () => {
    return (
      <div className="relative w-full h-96 bg-gradient-to-br from-blue-900 to-purple-900 rounded-lg overflow-hidden">
        <div className="absolute top-4 left-4 text-white">
          <div className="flex gap-4">
            <span>Score: {score}</span>
            <span>Time: {timeLeft}s</span>
          </div>
        </div>

        {targets.map((target) => (
          <button
            key={target.id}
            className="absolute w-8 h-8 bg-red-500 rounded-full animate-pulse hover:bg-red-400 transition-colors"
            style={{ left: `${target.x}%`, top: `${target.y}%` }}
            onClick={() => hitTarget(target.id)}
          >
            <Target className="h-4 w-4 text-white m-auto" />
          </button>
        ))}

        {timeLeft === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
            <div className="text-center text-white">
              <h3 className="text-2xl font-bold mb-2">Mission Complete!</h3>
              <p className="mb-4">Final Score: {score}</p>
              <Button
                onClick={() => {
                  setScore(0)
                  setTimeLeft(30)
                  setTargets([])
                }}
              >
                Play Again
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  const displayStats = player || {
    level: 1,
    money: 1000,
    reputation: 0,
    vehicles: 3,
  }

  useEffect(() => {
    if (user && timeLeft === 0) {
      saveGameSession({
        session_type: "target_practice",
        score: score,
        duration: 30,
        money_earned: score * 5,
        reputation_gained: Math.floor(score / 2),
      })
    }
  }, [timeLeft, score, user, saveGameSession])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative h-screen overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
          style={{
            backgroundImage: `url(${slides[currentSlide].image})`,
            filter: "brightness(0.7)",
          }}
        />

        <div className="relative z-20 h-full flex items-center justify-center text-center px-4">
          <div className="max-w-4xl">
            <Badge className="mb-4 bg-red-600 hover:bg-red-700">🎮 Now Available - Offline Mode</Badge>
            <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              URBAN RECKONING
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-300">{slides[currentSlide].description}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-lg px-8 py-4"
                onClick={() => setGameStarted(true)}
              >
                <Play className="mr-2 h-5 w-5" />
                Play Game
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-4 bg-transparent"
                onClick={() => setShowLeaderboard(true)}
              >
                <Trophy className="mr-2 h-5 w-5" />
                View Leaderboard
              </Button>
            </div>
            {!user && (
              <Button
                size="sm"
                variant="outline"
                className="mt-4 bg-transparent"
                onClick={() => setShowAuthModal(true)}
              >
                Sign In for Progress Saving
              </Button>
            )}
          </div>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? "bg-red-500" : "bg-gray-500"}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>

      {/* Error Notification */}
      {error && (
        <div className="fixed top-20 right-4 z-50 bg-yellow-900 border border-yellow-500 p-4 rounded-lg max-w-sm">
          <div className="flex justify-between items-start">
            <p className="text-sm text-white">{error}</p>
            <button onClick={clearError} className="text-yellow-400 hover:text-yellow-300 ml-2">
              ×
            </button>
          </div>
        </div>
      )}

      {/* Player Stats HUD */}
      <div className="fixed top-4 right-4 z-50 bg-black bg-opacity-80 p-4 rounded-lg border border-red-500">
        {/* Mode indicator */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">Mode:</span>
          <div className={`flex items-center text-xs ${mode === "online" ? "text-green-400" : "text-yellow-400"}`}>
            {mode === "online" ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
            {mode === "online" ? "Online" : "Offline"}
          </div>
        </div>

        {user ? (
          <>
            <div className="text-sm space-y-1 mb-2">
              <div className="text-green-400 font-semibold">{player?.username || "Player"}</div>
              <div className="flex justify-between">
                <span>Level:</span>
                <span className="text-red-400">{displayStats.level}</span>
              </div>
              <div className="flex justify-between">
                <span>Money:</span>
                <span className="text-green-400">${displayStats.money.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Rep:</span>
                <span className="text-blue-400">{displayStats.reputation}</span>
              </div>
              <div className="flex justify-between">
                <span>Vehicles:</span>
                <span className="text-yellow-400">{displayStats.vehicles}</span>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={signOut} className="w-full text-xs bg-transparent">
              Sign Out
            </Button>
          </>
        ) : (
          <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => setShowAuthModal(true)}>
            Sign In
          </Button>
        )}
      </div>

      {/* Game Demo Modal */}
      {gameStarted && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Target Practice Mission</h2>
              <Button variant="outline" onClick={() => setGameStarted(false)}>
                Exit Game
              </Button>
            </div>
            <MiniGame />
            <p className="text-center mt-4 text-gray-400">
              Click the red targets to earn money and reputation!
              {mode === "offline" && " (Playing in offline mode)"}
            </p>
          </div>
        </div>
      )}

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Game Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-gray-900 border-gray-700 hover:border-red-500 transition-colors">
                <CardHeader>
                  <div className="text-red-500 mb-2">{feature.icon}</div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-400">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Gameplay Tabs */}
      <section className="py-20 px-4 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Gameplay Systems</h2>
          <Tabs defaultValue="combat" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800">
              <TabsTrigger value="combat">Combat</TabsTrigger>
              <TabsTrigger value="driving">Driving</TabsTrigger>
              <TabsTrigger value="missions">Missions</TabsTrigger>
              <TabsTrigger value="world">World</TabsTrigger>
            </TabsList>

            <TabsContent value="combat" className="mt-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4">Advanced Combat System</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>• Hand-to-hand combat with combo system</li>
                    <li>• Wide variety of melee weapons</li>
                    <li>• Realistic gunplay with physics</li>
                    <li>• Stealth mechanics and takedowns</li>
                    <li>• Cover system for tactical gameplay</li>
                  </ul>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg">
                  <img src="/placeholder.svg?height=300&width=400" alt="Combat System" className="w-full rounded" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="driving" className="mt-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="bg-gray-800 p-6 rounded-lg">
                  <img src="/placeholder.svg?height=300&width=400" alt="Driving System" className="w-full rounded" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-4">Realistic Driving Physics</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>• 60+ unique vehicles to drive</li>
                    <li>• Realistic damage and physics</li>
                    <li>• Vehicle customization system</li>
                    <li>• Street racing and challenges</li>
                    <li>• Boats, helicopters, and motorcycles</li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="missions" className="mt-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4">Dynamic Mission System</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>• Story-driven main campaign</li>
                    <li>• Branching dialogue choices</li>
                    <li>• Side missions with consequences</li>
                    <li>• Heist planning and execution</li>
                    <li>• Multiple mission approaches</li>
                  </ul>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg">
                  <img src="/placeholder.svg?height=300&width=400" alt="Mission System" className="w-full rounded" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="world" className="mt-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="bg-gray-800 p-6 rounded-lg">
                  <img src="/placeholder.svg?height=300&width=400" alt="Open World" className="w-full rounded" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-4">Living Open World</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>• Multiple city districts to explore</li>
                    <li>• Dynamic weather and day/night cycle</li>
                    <li>• NPCs with daily routines</li>
                    <li>• Property ownership system</li>
                    <li>• Random events and encounters</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Technical Specs */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Technical Excellence</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="mr-2 h-5 w-5 text-yellow-500" />
                  Unreal Engine 5
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Ray Tracing</span>
                    <span className="text-green-400">✓ Enabled</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span>4K Resolution</span>
                    <span className="text-green-400">✓ 60 FPS</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span>DLSS/FSR</span>
                    <span className="text-green-400">✓ Supported</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5 text-blue-500" />
                  System Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>CPU:</span>
                  <span className="text-gray-400">Intel i7-8700 / Ryzen 5 3600</span>
                </div>
                <div className="flex justify-between">
                  <span>GPU:</span>
                  <span className="text-gray-400">RTX 2060 / RX 5700</span>
                </div>
                <div className="flex justify-between">
                  <span>RAM:</span>
                  <span className="text-gray-400">16GB</span>
                </div>
                <div className="flex justify-between">
                  <span>Storage:</span>
                  <span className="text-gray-400">100GB SSD</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 bg-gradient-to-r from-red-900 to-orange-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Rule the Streets?</h2>
          <p className="text-xl mb-8 text-gray-200">Play now in offline mode - no setup required!</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-black hover:bg-gray-200 text-lg px-8 py-4"
              onClick={() => setGameStarted(true)}
            >
              <Play className="mr-2 h-5 w-5" />
              Play Now - Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-black text-lg px-8 py-4 bg-transparent"
              onClick={() => setShowLeaderboard(true)}
            >
              <Trophy className="mr-2 h-5 w-5" />
              View Leaderboard
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-black border-t border-gray-800">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4">Urban Reckoning</h3>
          <p className="text-gray-400 mb-6">The ultimate open-world crime experience - Now playable offline!</p>
          <div className="flex justify-center space-x-6 text-gray-400">
            <span>© 2024 Urban Studios</span>
            <span>•</span>
            <span>All Rights Reserved</span>
          </div>
        </div>
      </footer>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {showLeaderboard && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full relative">
            <Button
              variant="outline"
              className="absolute -top-12 right-0 mb-4 bg-transparent"
              onClick={() => setShowLeaderboard(false)}
            >
              Close
            </Button>
            <Leaderboard />
          </div>
        </div>
      )}
    </div>
  )
}

export default UrbanReckoningGame
