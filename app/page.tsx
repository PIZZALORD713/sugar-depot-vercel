"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Wallet, Search, Globe, Filter, Sparkles, Zap, Brain, Palette, BookOpen } from "lucide-react"
import { FilterPanel } from "@/components/filter-panel"
import { FilterChips } from "@/components/filter-chips"
import { OraCardCollectible } from "@/components/ora-card-collectible"
import { WalletConnect } from "@/components/wallet-connect"
import { useFilterStore } from "@/lib/store"
import { Badge } from "@/components/ui/badge"
import { BulkEditCMPModal } from "@/components/bulk-edit-cmp-modal"

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
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)
  const [autoFetched, setAutoFetched] = useState(false)

  const [selectedOras, setSelectedOras] = useState<Set<string>>(new Set())
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [showBulkEditModal, setShowBulkEditModal] = useState(false)

  const { address, isConnected } = useAccount()

  const { getFilteredOras, favorites } = useFilterStore()
  const filteredOras = getFilteredOras(oras)

  useEffect(() => {
    if (isConnected && address && !autoFetched) {
      console.log("🔗 Wallet connected, auto-fetching Oras for:", address)
      setWalletInput(address)
      fetchOrasForAddress(address)
      setAutoFetched(true)
    }
  }, [isConnected, address, autoFetched])

  useEffect(() => {
    if (!isConnected) {
      setAutoFetched(false)
      setResolvedInfo(null)
    }
  }, [isConnected])

  const toggleOrasSelection = (tokenId: string) => {
    setSelectedOras((prev) => {
      const newSelected = new Set(prev)
      if (newSelected.has(tokenId)) {
        newSelected.delete(tokenId)
      } else {
        newSelected.add(tokenId)
      }
      return newSelected
    })
  }

  const selectAllOras = () => {
    setSelectedOras(new Set(filteredOras.map((ora) => ora.oraNumber)))
  }

  const clearSelection = () => {
    setSelectedOras(new Set())
  }

  const handleBulkEdit = () => {
    setIsSelectionMode(true)
  }

  const handleBulkEditCancel = () => {
    setIsSelectionMode(false)
    clearSelection()
  }

  const handleBulkEditProceed = () => {
    setShowBulkEditModal(true)
  }

  const normalizeTraits = (attributes: any[]) => {
    return attributes.reduce(
      (acc, attr) => {
        acc[attr.trait_type.toLowerCase().replace(/\s+/g, "_")] = attr.value
        return acc
      },
      {} as Record<string, string>,
    )
  }

  const selectedOrasData = filteredOras
    .filter((ora) => selectedOras.has(ora.oraNumber))
    .map((ora) => ({
      tokenId: ora.oraNumber,
      name: ora.name || `Ora #${ora.oraNumber}`,
      image: ora.image || "",
      traits: ora.traits,
      rawTraits: Object.entries(ora.traits).map(([trait_type, value]) => ({
        trait_type,
        value: String(value),
      })),
    }))

  const fetchOrasForAddress = async (targetAddress: string) => {
    setLoading(true)
    setError("")

    try {
      const res = await fetch(`/api/oras?wallet=${encodeURIComponent(targetAddress)}`)
      const data: ApiResponse = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch Oras")
      }

      console.log("✅ CLIENT DEBUG: Successfully fetched Oras:", data)

      const orasData = Array.isArray(data) ? data : data.oras || []
      setOras(orasData)

      if (data.resolvedFrom && data.resolvedAddress) {
        setResolvedInfo({
          from: data.resolvedFrom,
          address: data.resolvedAddress,
        })
      } else if (isConnected && address === targetAddress) {
        setResolvedInfo({
          from: "Connected Wallet",
          address: targetAddress,
        })
      }

      if (orasData.length === 0) {
        const inputType = isENSName(targetAddress) ? "ENS name" : "wallet"
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

  const fetchOras = async () => {
    if (!walletInput.trim()) {
      setError("Please enter a wallet address or ENS name")
      return
    }

    await fetchOrasForAddress(walletInput.trim())
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      fetchOras()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWalletInput(e.target.value)
    if (resolvedInfo) {
      setResolvedInfo(null)
    }
  }

  const handleUseConnectedWallet = () => {
    if (address) {
      setWalletInput(address)
      fetchOrasForAddress(address)
    }
  }

  const isENSName = (input: string) => {
    return (
      input.endsWith(".eth") || input.endsWith(".xyz") || input.endsWith(".com") || !/^0x[a-fA-F0-9]{40}$/.test(input)
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="w-full bg-white/80 backdrop-blur-lg border-b border-white/30 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <div className="p-2.5 bg-gradient-to-br from-pink-400 via-purple-500 to-blue-500 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <div className="w-7 h-7 bg-white rounded-xl flex items-center justify-center">
                  <span className="text-lg font-black bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                    O
                  </span>
                </div>
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-black bg-gradient-to-r from-pink-500 via-purple-600 to-blue-500 bg-clip-text text-transparent leading-none">
                OraKit
              </h1>
              <div className="text-xs font-mono text-gray-500 tracking-wider uppercase leading-none mt-0.5">
                CMP-Powered AI Toolkit
              </div>
            </div>
          </div>

          <WalletConnect />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl font-black bg-gradient-to-r from-pink-500 via-purple-600 to-blue-500 bg-clip-text text-transparent mb-6 leading-tight">
              Collect. Customize. Connect.
              <br />
              <span className="text-3xl">Your Oras, Your Personalities</span>
            </h2>
            <p className="text-xl text-gray-700 mb-4 font-medium">
              Transform your Sugartown Oras into unique AI personalities with CMP
            </p>
            <p className="text-sm text-gray-500 font-mono mb-12">
              Supports wallet addresses (0x...) and ENS names (.eth, .xyz, .com)
            </p>

            <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-lg rounded-2xl overflow-hidden max-w-3xl mx-auto">
              <CardContent className="p-8">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    {isENSName(walletInput) ? (
                      <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    ) : (
                      <Wallet className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    )}
                    <Input
                      placeholder="Enter wallet address (0x...) or ENS name (vitalik.eth)"
                      value={walletInput}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      className="pl-12 h-16 border-white/30 bg-white/50 focus:bg-white/80 focus:border-blue-300 focus:ring-blue-200 rounded-xl text-lg transition-all duration-200"
                      disabled={loading}
                    />
                  </div>
                  <div className="flex gap-3">
                    {isConnected && address && address !== walletInput && (
                      <Button
                        onClick={handleUseConnectedWallet}
                        variant="outline"
                        className="h-16 px-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:from-green-100 hover:to-emerald-100 text-green-700 font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                        title="Use connected wallet address"
                      >
                        <Zap className="w-5 h-5" />
                      </Button>
                    )}

                    <Button
                      onClick={fetchOras}
                      disabled={loading || !walletInput.trim()}
                      className="h-16 px-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                          {isENSName(walletInput) ? "Resolving..." : "Fetching..."}
                        </>
                      ) : (
                        <>
                          <Search className="mr-3 h-5 w-5" />
                          Discover Oras
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {isConnected && address && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <p className="text-green-700 text-sm text-center">
                        <strong>Connected:</strong>{" "}
                        <code className="bg-green-100 px-2 py-1 rounded-lg text-xs font-mono">
                          {address.slice(0, 6)}...{address.slice(-4)}
                        </code>
                        {address !== walletInput && (
                          <Button
                            onClick={handleUseConnectedWallet}
                            variant="ghost"
                            size="sm"
                            className="ml-2 h-6 px-2 text-xs text-green-600 hover:text-green-700 hover:bg-green-100"
                          >
                            Use this wallet
                          </Button>
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {resolvedInfo && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl">
                    <div className="flex items-center justify-center gap-3">
                      {resolvedInfo.from === "Connected Wallet" ? (
                        <Zap className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Globe className="h-5 w-5 text-blue-600" />
                      )}
                      <p className="text-blue-700 text-sm text-center">
                        <strong>{resolvedInfo.from}</strong>{" "}
                        {resolvedInfo.from !== "Connected Wallet" && "resolved to "}
                        <code className="bg-blue-100 px-2 py-1 rounded-lg text-xs font-mono">
                          {resolvedInfo.address}
                        </code>
                      </p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl">
                    <p className="text-red-600 text-sm text-center">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {oras.length > 0 && (
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6 mb-8 pb-6 border-b border-white/30">
            <div className="text-center lg:text-left">
              <h3 className="text-4xl font-black bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-3">
                Your Character Collection
              </h3>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <div className="text-sm text-gray-600 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30 font-mono">
                  {oras.length} Characters • {filteredOras.length} shown • {favorites.size} ⭐
                </div>
                <div className="px-3 py-1.5 bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 rounded-xl text-xs font-semibold border border-pink-200">
                  CMP READY
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-end">
              <Button
                onClick={() => setFilterPanelOpen(true)}
                variant="outline"
                className="bg-white/70 backdrop-blur-sm border-white/30 hover:bg-white/90 rounded-xl px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        )}

        <FilterChips />

        {filteredOras.length > 0 && (
          <div className="flex items-center justify-between bg-white/60 backdrop-blur rounded-xl p-4 border border-white/30 mb-6 shadow-lg">
            <div className="flex items-center gap-4">
              {!isSelectionMode ? (
                <Button
                  onClick={handleBulkEdit}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Bulk Edit CMP
                </Button>
              ) : (
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-pink-100 text-pink-800 border border-pink-200">
                    Selection Mode Active
                  </Badge>
                  <span className="text-sm text-gray-600 font-medium">
                    {selectedOras.size} of {filteredOras.length} selected
                  </span>
                </div>
              )}
            </div>

            {isSelectionMode && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={selectAllOras} className="bg-white/70 hover:bg-white/90">
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={clearSelection} className="bg-white/70 hover:bg-white/90">
                  Clear
                </Button>
                <Button
                  size="sm"
                  onClick={handleBulkEditProceed}
                  disabled={selectedOras.size === 0}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Export Selected ({selectedOras.size})
                </Button>
                <Button variant="ghost" size="sm" onClick={handleBulkEditCancel} className="hover:bg-white/70">
                  Cancel
                </Button>
              </div>
            )}
          </div>
        )}

        <FilterPanel oras={oras} isOpen={filterPanelOpen} onClose={() => setFilterPanelOpen(false)} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 mb-16">
          {filteredOras.map((ora) => (
            <OraCardCollectible
              key={`${ora.name}-${ora.oraNumber}`}
              ora={ora}
              initialCMPData={undefined}
              isSelected={selectedOras.has(ora.oraNumber)}
              onSelectionChange={toggleOrasSelection}
              showSelection={isSelectionMode}
            />
          ))}
        </div>

        {!loading && oras.length > 0 && filteredOras.length === 0 && (
          <div className="text-center py-20">
            <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center shadow-lg">
              <Filter className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">No Matching Characters</h3>
            <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
              Try adjusting your filters to find more characters in your collection.
            </p>
            <Button
              onClick={() => setFilterPanelOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Adjust Filters
            </Button>
          </div>
        )}

        {!loading && oras.length === 0 && walletInput && !error && (
          <div className="text-center py-20">
            <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center shadow-lg">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">No Characters Found</h3>
            <p className="text-gray-600 text-lg max-w-md mx-auto">
              This {isENSName(walletInput) ? "ENS name" : "wallet"} doesn't contain any Sugartown Oras to transform into
              characters.
            </p>
          </div>
        )}

        {!loading && oras.length === 0 && !walletInput && !error && (
          <div className="text-center py-20">
            <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center shadow-lg">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-lg">O</span>
              </div>
              <span className="font-bold text-gray-800 text-lg">Powered by OraKit</span>
              <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white border-0 text-sm px-3 py-1">
                CMP v1.0
              </Badge>
            </div>

            <h3 className="text-4xl font-bold text-gray-800 mb-6">The Character Modeling Protocol</h3>

            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="p-8 bg-white/60 backdrop-blur-sm rounded-3xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold text-gray-800 mb-3 text-xl">Identity Core</h4>
                <p className="text-gray-600 leading-relaxed">
                  Define archetypes, alignments, and core personality traits for consistent character behavior
                </p>
              </div>

              <div className="p-8 bg-white/60 backdrop-blur-sm rounded-3xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg">
                  <Palette className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold text-gray-800 mb-3 text-xl">ToneBoard</h4>
                <p className="text-gray-600 leading-relaxed">
                  Fine-tune personality dimensions with multi-axis tone controls for nuanced character expression
                </p>
              </div>

              <div className="p-8 bg-white/60 backdrop-blur-sm rounded-3xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold text-gray-800 mb-3 text-xl">LorePanel</h4>
                <p className="text-gray-600 leading-relaxed">
                  Rich backstory management with AI-enhanced narrative generation and memory systems
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
              <Button
                variant="outline"
                className="bg-white/70 backdrop-blur-sm border-white/30 hover:bg-white/90 rounded-xl px-8 py-4 gap-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <BookOpen className="w-5 h-5" />
                View Documentation
              </Button>
              <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl px-8 py-4 gap-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                <Brain className="w-5 h-5" />
                Explore CMP Schema
              </Button>
            </div>

            <p className="text-sm text-gray-500 font-mono">
              OraKit • Character-first • Open-source CMP toolkit for Web3 identity
            </p>
          </div>
        )}

        <BulkEditCMPModal
          open={showBulkEditModal}
          onOpenChange={setShowBulkEditModal}
          selectedOras={selectedOrasData}
        />
      </div>
    </div>
  )
}
