"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
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
import { OraCardCollectible } from "@/components/ora-card-collectible-updated"
import { WalletConnect } from "@/components/wallet-connect"
import { useFilterStore } from "@/lib/store"
import { Badge } from "@/components/ui/badge"
import { DEFAULT_CMP_DATA, type CMPData } from "@/components/cmp-data-types"
import { toast } from "sonner"

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

interface ImportedCMPProfile {
  oraId: string
  image: string
  traits: Record<string, string>
  cmp: {
    customName?: string
    archetype: string
    alignment: string
    tone: {
      playful: number
      serious: number
      creative: number
      analytical: number
      empathetic: number
      assertive: number
    }
    tagline: string
    lore: string
    personalityAxes?: {
      chaotic: number
      empathy: number
      humor: number
      intensity: number
    }
  }
}

export default function OraDashboard() {
  const [walletInput, setWalletInput] = useState("Camol.eth")
  const [oras, setOras] = useState<Ora[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [resolvedInfo, setResolvedInfo] = useState<{ from: string; address: string } | null>(null)
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)
  const [autoFetched, setAutoFetched] = useState(false)
  const [importedCMPData, setImportedCMPData] = useState<Map<string, CMPData>>(new Map())
  const [importedOras, setImportedOras] = useState<Ora[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Wagmi hooks
  const { address, isConnected } = useAccount()

  // Combine fetched oras with imported oras, prioritizing fetched ones
  const allOras = [
    ...oras,
    ...importedOras.filter((importedOra) => !oras.some((ora) => ora.oraNumber === importedOra.oraNumber)),
  ]

  // Get filtered oras from store
  const { getFilteredOras, favorites } = useFilterStore()
  const filteredOras = getFilteredOras(allOras)

  // Auto-fetch when wallet connects
  useEffect(() => {
    if (isConnected && address && !autoFetched) {
      console.log("🔗 Wallet connected, auto-fetching Oras for:", address)
      setWalletInput(address)
      fetchOrasForAddress(address)
      setAutoFetched(true)
    }
  }, [isConnected, address, autoFetched])

  // Reset auto-fetch flag when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      setAutoFetched(false)
      setResolvedInfo(null)
    }
  }, [isConnected])

  const isENSName = (input: string) => {
    return (
      input.endsWith(".eth") || input.endsWith(".xyz") || input.endsWith(".com") || !/^0x[a-fA-F0-9]{40}$/.test(input)
    )
  }

  const fetchOrasForAddress = async (targetAddress: string) => {
    setLoading(true)
    setError("")

    try {
      const res = await fetch(`/api/oras?address=${encodeURIComponent(targetAddress)}`)
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
      } else if (isConnected && address === targetAddress) {
        // If this was auto-fetched from connected wallet, show that info
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
    // Clear resolved info when input changes
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

  // Handle CMP data updates from character cards
  const handleCMPDataUpdate = (oraNumber: string, newCMPData: CMPData) => {
    setImportedCMPData((prev) => {
      const updated = new Map(prev)
      updated.set(oraNumber, newCMPData)
      return updated
    })
  }

  const handleDownloadCMPProfile = () => {
    if (allOras.length === 0) {
      return
    }

    // Create the CMP profile data structure using imported data if available
    const cmpProfileData = allOras.map((ora) => {
      const importedData = importedCMPData.get(ora.oraNumber)
      const cmpData = importedData || DEFAULT_CMP_DATA

      return {
        oraId: ora.oraNumber,
        image: ora.image,
        traits: ora.traits,
        cmp: {
          customName: cmpData.customName,
          archetype: cmpData.archetype,
          alignment: cmpData.alignment,
          tone: cmpData.tone,
          tagline: cmpData.tagline,
          lore: cmpData.lore,
          personalityAxes: {
            chaotic: cmpData.tone.playful,
            empathy: cmpData.tone.empathetic,
            humor: cmpData.tone.playful,
            intensity: cmpData.tone.assertive,
          },
        },
      }
    })

    // Create and download the JSON file
    const jsonString = JSON.stringify(cmpProfileData, null, 2)
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = "cmp-profile.json"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success(`Downloaded CMP profiles for ${allOras.length} characters`)
  }

  const handleImportCMPProfile = () => {
    fileInputRef.current?.click()
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const importedData: ImportedCMPProfile[] = JSON.parse(text)

      // Validate the imported data structure
      if (!Array.isArray(importedData)) {
        throw new Error("Invalid file format: Expected an array of CMP profiles")
      }

      const newCMPData = new Map<string, CMPData>()
      const newImportedOras: Ora[] = []
      let importedCount = 0
      let matchedCount = 0

      importedData.forEach((profile) => {
        // Validate required fields
        if (!profile.oraId || !profile.cmp) {
          console.warn("Skipping invalid profile:", profile)
          return
        }

        importedCount++

        // Check if we have this Ora in our current collection
        const matchingOra = oras.find((ora) => ora.oraNumber === profile.oraId)
        if (matchingOra) {
          matchedCount++
        } else {
          // Create an Ora object from the imported profile - use customName for display
          const displayName = profile.cmp.customName || `Ora #${profile.oraId}`
          const importedOra: Ora = {
            name: displayName,
            oraNumber: profile.oraId,
            image: profile.image || "/placeholder.svg?height=400&width=400",
            traits: profile.traits || {},
            openseaUrl: `https://opensea.io/assets/ethereum/0x34d85c9cdeb23fa97cb08333b511ac86e1c4e258/${profile.oraId}`,
          }
          newImportedOras.push(importedOra)
        }

        // Convert imported CMP data to our internal format
        const cmpData: CMPData = {
          customName: profile.cmp.customName || "",
          tagline: profile.cmp.tagline || DEFAULT_CMP_DATA.tagline,
          archetype: profile.cmp.archetype || DEFAULT_CMP_DATA.archetype,
          tone: {
            playful: profile.cmp.tone?.playful ?? profile.cmp.personalityAxes?.humor ?? DEFAULT_CMP_DATA.tone.playful,
            serious: profile.cmp.tone?.serious ?? DEFAULT_CMP_DATA.tone.serious,
            creative: profile.cmp.tone?.creative ?? DEFAULT_CMP_DATA.tone.creative,
            analytical: profile.cmp.tone?.analytical ?? DEFAULT_CMP_DATA.tone.analytical,
            empathetic:
              profile.cmp.tone?.empathetic ?? profile.cmp.personalityAxes?.empathy ?? DEFAULT_CMP_DATA.tone.empathetic,
            assertive:
              profile.cmp.tone?.assertive ?? profile.cmp.personalityAxes?.intensity ?? DEFAULT_CMP_DATA.tone.assertive,
          },
          alignment: profile.cmp.alignment || DEFAULT_CMP_DATA.alignment,
          lore: profile.cmp.lore || DEFAULT_CMP_DATA.lore,
          memoryLog: DEFAULT_CMP_DATA.memoryLog,
        }

        newCMPData.set(profile.oraId, cmpData)
      })

      // Update the imported CMP data and Oras
      setImportedCMPData(newCMPData)
      setImportedOras(newImportedOras)

      // Show success message
      if (matchedCount > 0 && newImportedOras.length > 0) {
        toast.success(
          `Successfully imported ${importedCount} CMP profiles! ${matchedCount} profiles matched your current Oras and ${newImportedOras.length} new characters were added.`,
        )
      } else if (matchedCount > 0) {
        toast.success(
          `Successfully imported ${importedCount} CMP profiles! ${matchedCount} profiles matched your current Oras.`,
        )
      } else if (newImportedOras.length > 0) {
        toast.success(
          `Imported ${importedCount} CMP profiles and added ${newImportedOras.length} new characters to your collection.`,
        )
      } else if (importedCount > 0) {
        toast.success(
          `Imported ${importedCount} CMP profiles. Load the corresponding Oras to see the applied profiles.`,
        )
      } else {
        toast.error("No valid CMP profiles found in the file.")
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Hidden file input for import */}
      <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileUpload} className="hidden" />

      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-40 w-full border-b border-white/30 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo Section */}
          <div className="group flex cursor-pointer items-center gap-3">
            <div className="relative">
              <div className="rounded-2xl bg-gradient-to-br from-pink-400 via-purple-500 to-blue-500 p-2.5 shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-white">
                  <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-lg font-black text-transparent">
                    O
                  </span>
                </div>
              </div>
              <div className="absolute -top-0.5 -right-0.5 h-3 w-3 animate-pulse rounded-full bg-yellow-400"></div>
            </div>
            <div className="flex flex-col">
              <h1 className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-2xl leading-none font-black text-transparent">
                OraKit
              </h1>
              <div className="mt-0.5 font-mono text-xs leading-none tracking-wider text-gray-500 uppercase">
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
              className="rounded-xl border-white/30 bg-white/70 px-4 py-3 text-gray-700 shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-white/90 hover:text-gray-900 hover:shadow-xl"
              title="Import CMP profiles from JSON file"
            >
              <Upload className="mr-2 h-5 w-5" />
              Import CMP
            </Button>

            {/* Download CMP Profile Button */}
            {allOras.length > 0 && (
              <Button
                onClick={handleDownloadCMPProfile}
                variant="outline"
                className="rounded-xl border-white/30 bg-white/70 px-4 py-3 text-gray-700 shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-white/90 hover:text-gray-900 hover:shadow-xl"
                title="Export CMP profiles to JSON file"
              >
                <Download className="mr-2 h-5 w-5" />
                Export CMP
              </Button>
            )}
            <WalletConnect />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6">
        {/* Hero Section - Centered */}
        <div className="py-16 text-center">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-6 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-5xl leading-tight font-black text-transparent">
              Collect. Customize. Connect.
              <br />
              <span className="text-3xl">Your Oras, Your Personalities</span>
            </h2>
            <p className="mb-4 text-xl font-medium text-gray-700">
              Transform your Sugartown Oras into unique AI personalities with CMP
            </p>
            <p className="mb-12 font-mono text-sm text-gray-500">
              Supports wallet addresses (0x...) and ENS names (.eth, .xyz, .com)
            </p>

            {/* Import Status Message */}
            {importedCMPData.size > 0 && (
              <div className="mx-auto mb-8 max-w-2xl rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4">
                <div className="flex items-center justify-center gap-3">
                  <Upload className="h-5 w-5 text-green-600" />
                  <p className="text-center text-sm text-green-700">
                    <strong>{importedCMPData.size} CMP profiles imported</strong> and ready to apply to your Oras
                  </p>
                </div>
              </div>
            )}

            {/* Search Section - Centered */}
            <Card className="mx-auto max-w-3xl overflow-hidden rounded-2xl border-0 bg-white/70 shadow-xl backdrop-blur-lg">
              <CardContent className="p-8">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="relative flex-1">
                    {isENSName(walletInput) ? (
                      <Globe className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                    ) : (
                      <Wallet className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                    )}
                    <Input
                      placeholder="Enter wallet address (0x...) or ENS name (vitalik.eth)"
                      value={walletInput}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      className="h-16 rounded-xl border-white/30 bg-white/50 pl-12 text-lg transition-all duration-200 focus:border-blue-300 focus:bg-white/80 focus:ring-blue-200"
                      disabled={loading}
                    />
                  </div>
                  <div className="flex gap-3">
                    {/* Use Connected Wallet Button */}
                    {isConnected && address && address !== walletInput && (
                      <Button
                        onClick={handleUseConnectedWallet}
                        variant="outline"
                        className="h-16 rounded-xl border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 px-4 font-medium text-green-700 shadow-lg transition-all duration-200 hover:from-green-100 hover:to-emerald-100 hover:shadow-xl"
                        title="Use connected wallet address"
                      >
                        <Zap className="h-5 w-5" />
                      </Button>
                    )}

                    <Button
                      onClick={fetchOras}
                      disabled={loading || !walletInput.trim()}
                      className="h-16 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-8 font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-600 hover:to-purple-700 hover:shadow-xl"
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

                {/* Status Messages - Centered */}
                {isConnected && address && (
                  <div className="mt-6 rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4">
                    <div className="flex items-center justify-center gap-3">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                      <p className="text-center text-sm text-green-700">
                        <strong>Connected:</strong>{" "}
                        <code className="rounded-lg bg-green-100 px-2 py-1 font-mono text-xs">
                          {address.slice(0, 6)}...{address.slice(-4)}
                        </code>
                        {address !== walletInput && (
                          <Button
                            onClick={handleUseConnectedWallet}
                            variant="ghost"
                            size="sm"
                            className="ml-2 h-6 px-2 text-xs text-green-600 hover:bg-green-100 hover:text-green-700"
                          >
                            Use this wallet
                          </Button>
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {resolvedInfo && (
                  <div className="mt-4 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 p-4">
                    <div className="flex items-center justify-center gap-3">
                      {resolvedInfo.from === "Connected Wallet" ? (
                        <Zap className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Globe className="h-5 w-5 text-blue-600" />
                      )}
                      <p className="text-center text-sm text-blue-700">
                        <strong>{resolvedInfo.from}</strong>{" "}
                        {resolvedInfo.from !== "Connected Wallet" && "resolved to "}
                        <code className="rounded-lg bg-blue-100 px-2 py-1 font-mono text-xs">
                          {resolvedInfo.address}
                        </code>
                      </p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-pink-50 p-4">
                    <p className="text-center text-sm text-red-600">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Results Header - Full width but contained */}
        {allOras.length > 0 && (
          <div className="mb-8 flex flex-col gap-6 border-b border-white/30 pb-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="text-center lg:text-left">
              <h3 className="mb-3 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-4xl font-black text-transparent">
                Your Character Collection
              </h3>
              <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <div className="rounded-xl border border-white/30 bg-white/60 px-4 py-2 font-mono text-sm text-gray-600 backdrop-blur-sm">
                  {allOras.length} Characters • {filteredOras.length} shown • {favorites.size} ⭐
                </div>
                <div className="rounded-xl border border-pink-200 bg-gradient-to-r from-pink-100 to-purple-100 px-3 py-1.5 text-xs font-semibold text-pink-700">
                  CMP READY
                </div>
                {importedOras.length > 0 && (
                  <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-100 to-indigo-100 px-3 py-1.5 text-xs font-semibold text-blue-700">
                    {importedOras.length} IMPORTED
                  </div>
                )}
                {importedCMPData.size > 0 && (
                  <div className="rounded-xl border border-green-200 bg-gradient-to-r from-green-100 to-emerald-100 px-3 py-1.5 text-xs font-semibold text-green-700">
                    {
                      Array.from(importedCMPData.keys()).filter((oraId) =>
                        allOras.some((ora) => ora.oraNumber === oraId),
                      ).length
                    }{" "}
                    WITH CMP
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col justify-center gap-3 sm:flex-row lg:justify-end">
              <Button
                onClick={() => setFilterPanelOpen(true)}
                variant="outline"
                className="bg-white/70 backdrop-blur-sm border-white/30 hover:bg-white/90 rounded-xl px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Filter className="mr-2 h-5 w-5" />
                Filters
              </Button>
              <Button className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 text-white shadow-lg transition-all duration-200 hover:from-pink-600 hover:to-purple-700 hover:shadow-xl">
                <Sparkles className="mr-2 h-5 w-5" />
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
        <div className="mb-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {filteredOras.map((ora) => (
            <OraCardCollectible
              key={`${ora.name}-${ora.oraNumber}`}
              ora={ora}
              initialCMPData={importedCMPData.get(ora.oraNumber)}
              onCMPDataChange={(newCMPData) => handleCMPDataUpdate(ora.oraNumber, newCMPData)}
            />
          ))}
        </div>

        {/* Empty State - No results after filtering */}
        {!loading && allOras.length > 0 && filteredOras.length === 0 && (
          <div className="py-20 text-center">
            <div className="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg">
              <Filter className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="mb-4 text-3xl font-bold text-gray-900">No Matching Characters</h3>
            <p className="mx-auto mb-8 max-w-md text-lg text-gray-600">
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

        {/* Empty State - No Oras found */}
        {!loading && allOras.length === 0 && walletInput && !error && (
          <div className="py-20 text-center">
            <div className="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="mb-4 text-3xl font-bold text-gray-900">No Characters Found</h3>
            <p className="mx-auto max-w-md text-lg text-gray-600">
              This {isENSName(walletInput) ? "ENS name" : "wallet"} doesn't contain any Sugartown Oras to transform into
              characters.
            </p>
          </div>
        )}

        {/* Initial State */}
        {!loading && allOras.length === 0 && !walletInput && !error && (
          <div className="py-20 text-center">
            <div className="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-100 to-purple-100 shadow-lg">
              <Globe className="h-12 w-12 text-blue-500" />
            </div>
            <h3 className="mb-4 text-3xl font-bold text-gray-900">Ready to Build Your Collection</h3>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
              {isConnected
                ? "Your wallet is connected! Click the lightning bolt to discover your Oras, or enter any address below."
                : "Connect your wallet above or enter a wallet address/ENS name below to discover Sugartown Oras"}
            </p>
            <div className="mx-auto grid max-w-2xl grid-cols-1 gap-6 text-sm text-gray-500 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/30 bg-white/50 p-6 shadow-lg backdrop-blur-sm">
                <code className="font-mono text-sm font-semibold text-gray-700">0x1234...abcd</code>
                <p className="mt-2 text-gray-600">Wallet address</p>
              </div>
              <div className="rounded-2xl border border-white/30 bg-white/50 p-6 shadow-lg backdrop-blur-sm">
                <code className="font-mono text-sm font-semibold text-gray-700">vitalik.eth</code>
                <p className="mt-2 text-gray-600">ENS name</p>
              </div>
              <div className="rounded-2xl border border-white/30 bg-white/50 p-6 shadow-lg backdrop-blur-sm">
                <code className="font-mono text-sm font-semibold text-gray-700">example.xyz</code>
                <p className="mt-2 text-gray-600">ENS name</p>
              </div>
            </div>
          </div>
        )}

        {/* Powered by OraKit Section - Properly spaced */}
        <div className="mt-20 border-t border-white/30 pt-16">
          <div className="text-center">
            <div className="mb-8 inline-flex items-center gap-4 rounded-3xl border border-pink-200/50 bg-gradient-to-r from-pink-500/10 to-purple-500/10 px-8 py-4 shadow-lg">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 shadow-lg">
                <span className="text-lg font-black text-white">O</span>
              </div>
              <span className="text-lg font-bold text-gray-800">Powered by OraKit</span>
              <Badge className="border-0 bg-gradient-to-r from-pink-500 to-purple-600 px-3 py-1 text-sm text-white">
                CMP v1.0
              </Badge>
            </div>

            <h3 className="mb-6 text-4xl font-bold text-gray-800">The Character Modeling Protocol</h3>

            <div className="mx-auto mb-12 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
              <div className="rounded-3xl border border-white/30 bg-white/60 p-8 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 shadow-lg">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <h4 className="mb-3 text-xl font-bold text-gray-800">Identity Core</h4>
                <p className="leading-relaxed text-gray-600">
                  Define archetypes, alignments, and core personality traits for consistent character behavior
                </p>
              </div>

              <div className="rounded-3xl border border-white/30 bg-white/60 p-8 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 shadow-lg">
                  <Palette className="h-8 w-8 text-white" />
                </div>
                <h4 className="mb-3 text-xl font-bold text-gray-800">ToneBoard</h4>
                <p className="leading-relaxed text-gray-600">
                  Fine-tune personality dimensions with multi-axis tone controls for nuanced character expression
                </p>
              </div>

              <div className="rounded-3xl border border-white/30 bg-white/60 p-8 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <h4 className="mb-3 text-xl font-bold text-gray-800">LorePanel</h4>
                <p className="leading-relaxed text-gray-600">
                  Rich backstory management with AI-enhanced narrative generation and memory systems
                </p>
              </div>
            </div>

            <div className="mb-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                variant="outline"
                className="gap-3 rounded-xl border-white/30 bg-white/70 px-8 py-4 text-lg font-semibold shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-white/90 hover:shadow-xl"
              >
                <BookOpen className="h-5 w-5" />
                View Documentation
              </Button>
              <Button className="gap-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:from-pink-600 hover:to-purple-700 hover:shadow-xl">
                <Brain className="h-5 w-5" />
                Explore CMP Schema
              </Button>
            </div>

            <p className="font-mono text-sm text-gray-500">
              OraKit • Character-first • Open-source CMP toolkit for Web3 identity
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
