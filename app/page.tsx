"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Wallet, Search, ExternalLink, Globe } from "lucide-react"
import Image from "next/image"

interface Ora {
  name: string
  oraNumber: string
  image: string
  traits: Record<string, string>
  openseaUrl: string
}

interface ApiResponse {
  oras?: Ora[]
  resolvedFrom?: string
  resolvedAddress?: string
  error?: string
}

export default function OraDashboard() {
  const [walletInput, setWalletInput] = useState("0x28af3356c6aaf449d20c59d2531941ddfb94d713")
  const [oras, setOras] = useState<Ora[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [resolvedInfo, setResolvedInfo] = useState<{ from: string; address: string } | null>(null)

  const isENSName = (input: string) => {
    return (
      input.endsWith(".eth") || input.endsWith(".xyz") || input.endsWith(".com") || !/^0x[a-fA-F0-9]{40}$/.test(input)
    )
  }

  const fetchOras = async () => {
    if (!walletInput.trim()) {
      setError("Please enter a wallet address or ENS name")
      return
    }

    setLoading(true)
    setError("")
    setResolvedInfo(null)

    try {
      const res = await fetch(`/api/oras?wallet=${encodeURIComponent(walletInput.trim())}`)
      const data: ApiResponse = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch Oras")
      }

      console.log("✅ CLIENT DEBUG: Successfully fetched Oras:", data)

      // Handle both old format (direct array) and new format (object with oras property)
      const orasData = Array.isArray(data) ? data : data.oras || []
      setOras(orasData)

      // Set resolved ENS info if available
      if (data.resolvedFrom && data.resolvedAddress) {
        setResolvedInfo({
          from: data.resolvedFrom,
          address: data.resolvedAddress,
        })
      }

      if (orasData.length === 0) {
        const inputType = isENSName(walletInput.trim()) ? "ENS name" : "wallet"
        setError(
          `No Sugartown Oras found for this ${inputType}. The ${inputType} may not contain any Oras from the Sugartown collection.`,
        )
      }
    } catch (err) {
      console.error("❌ CLIENT DEBUG: Fetch error:", err)
      setError(err instanceof Error ? err.message : "An error occurred while fetching data")
      setOras([])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      fetchOras()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWalletInput(e.target.value)
    // Clear resolved info when input changes
    if (resolvedInfo) {
      setResolvedInfo(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Sugartown Ora Dashboard</h1>
          <p className="text-gray-600 text-lg">Discover and explore your Sugartown Ora NFT collection</p>
          <p className="text-sm text-gray-500 mt-2">
            Supports wallet addresses (0x...) and ENS names (.eth, .xyz, .com)
          </p>
        </div>

        {/* Search Section */}
        <div className="max-w-2xl mx-auto mb-8">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  {isENSName(walletInput) ? (
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  ) : (
                    <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  )}
                  <Input
                    placeholder="Enter wallet address (0x...) or ENS name (vitalik.eth)"
                    value={walletInput}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    disabled={loading}
                  />
                </div>
                <Button
                  onClick={fetchOras}
                  disabled={loading || !walletInput.trim()}
                  className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isENSName(walletInput) ? "Resolving..." : "Fetching..."}
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Fetch Oras
                    </>
                  )}
                </Button>
              </div>

              {/* ENS Resolution Info */}
              {resolvedInfo && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-blue-600" />
                    <p className="text-blue-700 text-sm">
                      <strong>{resolvedInfo.from}</strong> resolved to{" "}
                      <code className="bg-blue-100 px-1 rounded text-xs">{resolvedInfo.address}</code>
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        {oras.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Found {oras.length} Sugartown Ora{oras.length !== 1 ? "s" : ""}
            </h2>
            <p className="text-gray-600">
              Displaying all Sugartown Oras from {resolvedInfo ? `${resolvedInfo.from}` : "this wallet"}
            </p>
          </div>
        )}

        {/* Ora Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {oras.map((ora) => (
            <Card
              key={`${ora.name}-${ora.oraNumber}`}
              className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm overflow-hidden"
            >
              <CardContent className="p-0">
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <Image
                    src={ora.image || "/placeholder.svg"}
                    alt={ora.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    crossOrigin="anonymous"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* OpenSea Link */}
                  <a
                    href={ora.openseaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/70"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg text-gray-900 truncate">{ora.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      #{ora.oraNumber}
                    </Badge>
                  </div>

                  {/* Traits */}
                  {Object.keys(ora.traits).length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Traits:</h4>
                      <div className="space-y-1.5 max-h-32 overflow-y-auto">
                        {Object.entries(ora.traits).map(([traitType, value]) => (
                          <div key={traitType} className="flex items-center justify-between text-xs">
                            <span className="text-gray-600 font-medium capitalize">{traitType.replace(/_/g, " ")}</span>
                            <Badge
                              variant="secondary"
                              className="ml-2 bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs px-2 py-0.5"
                            >
                              {value}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {Object.keys(ora.traits).length === 0 && (
                    <p className="text-sm text-gray-500 italic">No traits available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {!loading && oras.length === 0 && walletInput && !error && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Oras Found</h3>
            <p className="text-gray-600">
              This {isENSName(walletInput) ? "ENS name" : "wallet"} doesn't contain any Sugartown Oras.
            </p>
          </div>
        )}

        {/* Initial State */}
        {!loading && oras.length === 0 && !walletInput && !error && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center">
              <Globe className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Ready to Explore</h3>
            <p className="text-gray-600">Enter a wallet address or ENS name above to discover Sugartown Oras</p>
            <div className="mt-4 text-sm text-gray-500">
              <p>Examples:</p>
              <p>• 0x1234...abcd (wallet address)</p>
              <p>• vitalik.eth (ENS name)</p>
              <p>• example.xyz (ENS name)</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
