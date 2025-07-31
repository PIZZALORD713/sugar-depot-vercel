"use client"

import type React from "react"
import { useState, useEffect, useMemo, useRef } from "react"
import { useAccount } from "wagmi"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Loader2,
  Wallet,
  Search,
  Globe,
  Filter,
  Sparkles,
  Zap,
  Brain,
  Palette,
  BookOpen,
  Download,
  Upload,
} from "lucide-react"
import { FilterPanel } from "@/components/filter-panel"
import { FilterChips } from "@/components/filter-chips"
import { OraCardCollectibleUpdated } from "@/components/ora-card-collectible-updated"
import { WalletConnect } from "@/components/wallet-connect"
import { Badge } from "@/components/ui/badge"
import type { CMPData, OraWithCMP, ExportData } from "@/components/cmp-data-types"
import { toast } from "sonner"

interface ApiResponse {
  oras?: any[]
  resolvedFrom?: string
  resolvedAddress?: string
  error?: string
}

interface FilterState {
  search: string
  class: string[]
  element: string[]
  rarity: string[]
  levelRange: [number, number]
  powerRange: [number, number]
}

const initialFilters: FilterState = {
  search: "",
  class: [],
  element: [],
  rarity: [],
  levelRange: [1, 50],
  powerRange: [0, 1000],
}

export default function OraDashboard() {
  const [walletInput, setWalletInput] = useState("0x28af3356c6aaf449d20c59d2531941ddfb94d713")
  const [oras, setOras] = useState<OraWithCMP[]>([])
  const [importedOras, setImportedOras] = useState<OraWithCMP[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [resolvedInfo, setResolvedInfo] = useState<{ from: string; address: string } | null>(null)
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)
  const [autoFetched, setAutoFetched] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [sortBy, setSortBy] = useState<"name" | "level" | "power" | "rarity">("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [selectedOra, setSelectedOra] = useState<OraWithCMP | null>(null)

  // Wagmi hooks
  const { address, isConnected } = useAccount()

  const fetchOras = async (walletAddress: string) => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/oras?address=${walletAddress}`)
      if (!response.ok) throw new Error("Failed to fetch Oras")

      const data = await response.json()
      const orasWithCMP: OraWithCMP[] =
        data.oras?.map((ora: any) => ({
          oraId: ora.tokenId,
          image: ora.image,
          traits: ora.attributes || {},
          cmp: {},
        })) || []

      setOras(orasWithCMP)
      console.log("✅ CLIENT DEBUG: Successfully fetched Oras:", data)

      // Set resolved ENS info if available
      if (data.resolvedFrom && data.resolvedAddress) {
        setResolvedInfo({
          from: data.resolvedFrom,
          address: data.resolvedAddress,
        })
      } else if (isConnected && address === walletAddress) {
        // If this was auto-fetched from connected wallet, show that info
        setResolvedInfo({
          from: "Connected Wallet",
          address: walletAddress,
        })
      }

      if (orasWithCMP.length === 0) {
        const inputType =
          walletAddress.endsWith(".eth") || walletAddress.endsWith(".xyz") || walletAddress.endsWith(".com")
            ? "ENS name"
            : "wallet"
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

  useEffect(() => {
    if (isConnected && address && !autoFetched) {
      console.log("🔗 Wallet connected, auto-fetching Oras for:", address)
      setWalletInput(address)
      fetchOras(address)
      setAutoFetched(true)
    }
  }, [isConnected, address, autoFetched])

  useEffect(() => {
    if (!isConnected) {
      setAutoFetched(false)
      setResolvedInfo(null)
    }
  }, [isConnected])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      fetchOras(walletInput.trim())
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWalletInput(e.target.value)
    // Clear resolved info when input changes
    if (resolvedInfo) {
      setResolvedInfo(null)
    }
  }

  const handleUseConnectedWallet = () => {
    if (address) {
      setWalletInput(address)
      fetchOras(address)
    }
  }

  const handleCMPUpdate = (oraId: string, cmpData: CMPData) => {
    setOras((prev) => prev.map((ora) => (ora.oraId === oraId ? { ...ora, cmp: cmpData } : ora)))

    setImportedOras((prev) => prev.map((ora) => (ora.oraId === oraId ? { ...ora, cmp: cmpData } : ora)))

    toast.success("CMP data updated successfully")
  }

  const handleImportCMPProfile = () => {
    fileInputRef.current?.click()
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const importedData: ExportData = JSON.parse(text)

      if (!importedData.oraId || !importedData.image) {
        throw new Error("Invalid CMP file format")
      }

      const newOra: OraWithCMP = {
        oraId: importedData.oraId,
        image: importedData.image,
        traits: importedData.traits || {},
        cmp: importedData.cmp || {},
      }

      // Check if this Ora already exists in fetched Oras
      const existingOraIndex = oras.findIndex((ora) => ora.oraId === importedData.oraId)
      if (existingOraIndex !== -1) {
        // Update existing Ora with imported CMP data
        setOras((prev) =>
          prev.map((ora) => (ora.oraId === importedData.oraId ? { ...ora, cmp: importedData.cmp || {} } : ora)),
        )
        toast.success(`Updated CMP data for existing Ora #${importedData.oraId}`)
      } else {
        // Add to imported Oras if not found in fetched ones
        const existingImportedIndex = importedOras.findIndex((ora) => ora.oraId === importedData.oraId)
        if (existingImportedIndex !== -1) {
          // Update existing imported Ora
          setImportedOras((prev) => prev.map((ora) => (ora.oraId === importedData.oraId ? newOra : ora)))
          toast.success(`Updated CMP profile for imported Ora #${importedData.oraId}`)
        } else {
          // Add new imported Ora
          setImportedOras((prev) => [...prev, newOra])
          toast.success(`Imported CMP profile for Ora #${importedData.oraId}`)
        }
      }
    } catch (error) {
      console.error("Error importing CMP profiles:", error)
      toast.error("Failed to import CMP profiles. Please check the file format.")
    }

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleDownloadCMPProfile = () => {
    const allOras = [...oras, ...importedOras]
    const orasWithCMP = allOras.filter((ora) => ora.cmp && Object.keys(ora.cmp).length > 0)

    if (orasWithCMP.length === 0) {
      toast.error("No CMP data to export")
      return
    }

    const exportData = orasWithCMP.map((ora) => ({
      oraId: ora.oraId,
      image: ora.image,
      traits: ora.traits,
      cmp: ora.cmp || {},
    }))

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `All-CMP-Profiles-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success(`Exported ${orasWithCMP.length} CMP profiles`)
  }

  const allOras = [...oras, ...importedOras]
  const hasAnyOras = allOras.length > 0

  // Filter and sort Ora data
  const filteredAndSortedOras = useMemo(() => {
    const filtered = allOras.filter((ora) => {
      // Search filter
      if (filters.search && !ora.image.toLowerCase().includes(filters.search.toLowerCase())) {
        return false
      }

      // Attribute filters
      const oraClass = ora.traits?.Class?.value
      const oraElement = ora.traits?.Element?.value
      const oraRarity = ora.traits?.Rarity?.value
      const oraLevel = ora.traits?.Level?.value || 1
      const oraPower = ora.traits?.Power?.value || 0

      if (filters.class.length > 0 && !filters.class.includes(oraClass)) return false
      if (filters.element.length > 0 && !filters.element.includes(oraElement)) return false
      if (filters.rarity.length > 0 && !filters.rarity.includes(oraRarity)) return false
      if (oraLevel < filters.levelRange[0] || oraLevel > filters.levelRange[1]) return false
      if (oraPower < filters.powerRange[0] || oraPower > filters.powerRange[1]) return false

      return true
    })

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue

      switch (sortBy) {
        case "name":
          aValue = a.image
          bValue = b.image
          break
        case "level":
          aValue = a.traits?.Level?.value || 1
          bValue = b.traits?.Level?.value || 1
          break
        case "power":
          aValue = a.traits?.Power?.value || 0
          bValue = b.traits?.Power?.value || 0
          break
        case "rarity":
          const rarityOrder = { Common: 1, Rare: 2, Epic: 3, Legendary: 4 }
          aValue = rarityOrder[a.traits?.Rarity?.value as keyof typeof rarityOrder] || 0
          bValue = rarityOrder[b.traits?.Rarity?.value as keyof typeof rarityOrder] || 0
          break
        default:
          return 0
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      return sortOrder === "asc" ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number)
    })

    return filtered
  }, [filters, sortBy, sortOrder])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Hidden file input for import */}
      <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileUpload} className="hidden" />

      {/* Top Navigation Bar */}
      <div className="w-full bg-white/80 backdrop-blur-lg border-b border-white/30 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo Section */}
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

          {/* Right Side - Import/Export Buttons and Wallet Connect */}
          <div className="flex items-center gap-3">
            {/* Import CMP Profile Button */}
            <Button
              onClick={handleImportCMPProfile}
              variant="outline"
              className="bg-white/70 backdrop-blur-sm border-white/30 hover:bg-white/90 rounded-xl px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-200 text-gray-700 hover:text-gray-900"
              title="Import CMP profiles from JSON file"
            >
              <Upload className="w-5 h-5 mr-2" />
              Import CMP
            </Button>

            {/* Download CMP Profile Button */}
            {hasAnyOras && (
              <Button
                onClick={handleDownloadCMPProfile}
                variant="outline"
                className="bg-white/70 backdrop-blur-sm border-white/30 hover:bg-white/90 rounded-xl px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-200 text-gray-700 hover:text-gray-900"
                title="Export CMP profiles to JSON file"
              >
                <Download className="w-5 h-5 mr-2" />
                Export All
              </Button>
            )}
            <WalletConnect />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6">
          {/* Hero Section - Centered */}
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

              {/* Import Status Message */}
              {importedOras.length > 0 && (
                <div className="mb-8 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl max-w-2xl mx-auto">
                  <div className="flex items-center justify-center gap-3">
                    <Upload className="h-5 w-5 text-green-600" />
                    <p className="text-green-700 text-sm text-center">
                      <strong>{importedOras.length} CMP profiles imported</strong> and ready to apply to your Oras
                    </p>
                  </div>
                </div>
              )}

              {/* Search Section - Centered */}
              <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-lg rounded-2xl overflow-hidden max-w-3xl mx-auto">
                <CardContent className="p-8">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      {walletInput.endsWith(".eth") || walletInput.endsWith(".xyz") || walletInput.endsWith(".com") ? (
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
                      {/* Use Connected Wallet Button */}
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
                        onClick={() => fetchOras(walletInput.trim())}
                        disabled={loading || !walletInput.trim()}
                        className="h-16 px-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                            {walletInput.endsWith(".eth") ||
                            walletInput.endsWith(".xyz") ||
                            walletInput.endsWith(".com")
                              ? "Resolving..."
                              : "Fetching..."}
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

                  {/* Status Messages - Centered */}
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

          {/* Results Header - Full width but contained */}
          {hasAnyOras && (
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6 mb-8 pb-6 border-b border-white/30">
              <div className="text-center lg:text-left">
                <h3 className="text-4xl font-black bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-3">
                  Your Character Collection
                </h3>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <div className="text-sm text-gray-600 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30 font-mono">
                    {allOras.length} Characters • {allOras.length} shown • 0 ⭐
                  </div>
                  <div className="px-3 py-1.5 bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 rounded-xl text-xs font-semibold border border-pink-200">
                    CMP READY
                  </div>
                  {importedOras.length > 0 && (
                    <div className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-xl text-xs font-semibold border border-blue-200">
                      {importedOras.length} IMPORTED
                    </div>
                  )}
                  {allOras.some((ora) => Object.keys(ora.cmp).length > 0) && (
                    <div className="px-3 py-1.5 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-xl text-xs font-semibold border border-green-200">
                      {allOras.filter((ora) => Object.keys(ora.cmp).length > 0).length} WITH CMP
                    </div>
                  )}
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
                <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-200">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Bulk Edit CMP
                </Button>
              </div>
            </div>
          )}

          {/* Filter Chips */}
          <FilterChips />

          {/* Filter Panel */}
          <FilterPanel oras={allOras} isOpen={filterPanelOpen} onClose={() => setFilterPanelOpen(false)} />

          {/* Ora Grid - Character Collection */}
          {hasAnyOras ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 mb-16">
              {filteredAndSortedOras.map((ora) => (
                <OraCardCollectibleUpdated
                  key={ora.oraId}
                  ora={ora}
                  onCMPUpdate={handleCMPUpdate}
                  isImported={importedOras.some((importedOra) => importedOra.oraId === ora.oraId)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center shadow-lg">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">No Characters Found</h3>
              <p className="text-gray-600 text-lg max-w-md mx-auto">
                This{" "}
                {walletInput.endsWith(".eth") || walletInput.endsWith(".xyz") || walletInput.endsWith(".com")
                  ? "ENS name"
                  : "wallet"}{" "}
                doesn't contain any Sugartown Oras to transform into characters.
              </p>
            </div>
          )}

          {/* Powered by OraKit Section - Properly spaced */}
          <div className="mt-20 pt-16 border-t border-white/30">
            <div className="text-center">
              <div className="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-3xl border border-pink-200/50 mb-8 shadow-lg">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg">
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
          </div>
        </div>
      </div>
    </div>
  )
}
