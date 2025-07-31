"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Wallet, ExternalLink } from "lucide-react"

interface Ora {
  id: string
  name: string
  image: string
  tokenId: string
  archetype: string
  alignment: string
  description: string
}

export default function SugartownOraDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [oras, setOras] = useState<Ora[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Mock data for demonstration
  const mockOras: Ora[] = [
    {
      id: "1",
      name: "Mystic Ora #1234",
      image: "/placeholder.svg?height=300&width=300",
      tokenId: "1234",
      archetype: "Mystic",
      alignment: "Neutral",
      description: "A mysterious character with ancient powers",
    },
    {
      id: "2",
      name: "Warrior Ora #5678",
      image: "/placeholder.svg?height=300&width=300",
      tokenId: "5678",
      archetype: "Warrior",
      alignment: "Good",
      description: "A brave warrior defending the realm",
    },
    {
      id: "3",
      name: "Sage Ora #9012",
      image: "/placeholder.svg?height=300&width=300",
      tokenId: "9012",
      archetype: "Sage",
      alignment: "Neutral",
      description: "A wise sage with knowledge of the ancients",
    },
  ]

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError("Please enter a wallet address or ENS name")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // For demo purposes, always return mock data
      setOras(mockOras)
    } catch (err) {
      setError("Failed to fetch NFTs. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getAlignmentColor = (alignment: string) => {
    switch (alignment.toLowerCase()) {
      case "good":
        return "bg-green-100 text-green-800"
      case "evil":
        return "bg-red-100 text-red-800"
      case "neutral":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  const getArchetypeColor = (archetype: string) => {
    switch (archetype.toLowerCase()) {
      case "warrior":
        return "bg-orange-100 text-orange-800"
      case "mystic":
        return "bg-purple-100 text-purple-800"
      case "sage":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg"></div>
              <h1 className="text-2xl font-bold text-gray-900">Sugartown Ora Dashboard</h1>
            </div>
            <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
              <Wallet className="w-4 h-4" />
              <span>Connect Wallet</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Discover Your Sugartown Ora Collection</h2>
          <p className="text-xl text-gray-600 mb-8">
            Explore and manage your unique Ora NFTs with advanced filtering and detailed character profiles
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Enter wallet address or ENS name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-lg"
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} disabled={loading} className="h-12 px-8 text-lg">
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>
            {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}
          </div>
        </div>

        {/* Results Section */}
        {oras.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Your Ora Collection ({oras.length})</h3>
            </div>

            {/* NFT Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {oras.map((ora) => (
                <Card key={ora.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square relative">
                    <img src={ora.image || "/placeholder.svg"} alt={ora.name} className="w-full h-full object-cover" />
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{ora.name}</CardTitle>
                    <div className="flex space-x-2">
                      <Badge className={getArchetypeColor(ora.archetype)}>{ora.archetype}</Badge>
                      <Badge className={getAlignmentColor(ora.alignment)}>{ora.alignment}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-600 text-sm mb-4">{ora.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">#{ora.tokenId}</span>
                      <Button variant="outline" size="sm" className="flex items-center space-x-1 bg-transparent">
                        <ExternalLink className="w-3 h-3" />
                        <span>View Details</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* CMP Info Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Character Modeling Protocol (CMP)</h3>
          <p className="text-gray-600 mb-6">
            The Character Modeling Protocol allows you to define and customize your Ora's personality, backstory, and
            behavioral traits. Each Ora can be uniquely tailored to your vision.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold text-xl">P</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Personality</h4>
              <p className="text-sm text-gray-600">Define your Ora's core personality traits and characteristics</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold text-xl">B</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Backstory</h4>
              <p className="text-sm text-gray-600">Create rich narratives and history for your character</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold text-xl">T</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Traits</h4>
              <p className="text-sm text-gray-600">Set behavioral patterns and interaction styles</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
