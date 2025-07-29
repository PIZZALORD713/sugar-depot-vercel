"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FilterPanel } from "@/components/filter-panel"
import { FilterChips } from "@/components/filter-chips"
import { OraCard } from "@/components/ora-card"
import { OraCardV2 } from "@/components/ora-card-v2"
import { OraCardCollectible } from "@/components/ora-card-collectible"
import { OraCardCollectibleUpdated } from "@/components/ora-card-collectible-updated"
import { WalletConnect } from "@/components/wallet-connect"
import { Search, Grid, List, Filter } from "lucide-react"

interface Ora {
  id: string
  name: string
  image: string
  rarity: string
  traits: Record<string, string>
  owner?: string
  price?: number
  lastSale?: number
}

export default function Dashboard() {
  const [oras, setOras] = useState<Ora[]>([])
  const [filteredOras, setFilteredOras] = useState<Ora[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<Record<string, string[]>>({})

  useEffect(() => {
    fetchOras()
  }, [])

  useEffect(() => {
    filterOras()
  }, [oras, searchTerm, filters])

  const fetchOras = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/oras")
      const data = await response.json()
      setOras(data)
    } catch (error) {
      console.error("Error fetching oras:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterOras = () => {
    let filtered = oras

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (ora) =>
          ora.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ora.id.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Trait filters
    Object.entries(filters).forEach(([trait, values]) => {
      if (values.length > 0) {
        filtered = filtered.filter((ora) => values.includes(ora.traits[trait]))
      }
    })

    setFilteredOras(filtered)
  }

  const handleFilterChange = (newFilters: Record<string, string[]>) => {
    setFilters(newFilters)
  }

  const clearFilters = () => {
    setFilters({})
    setSearchTerm("")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading Oras...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sugartown Ora Dashboard</h1>
            <p className="text-muted-foreground">Explore and manage your Sugartown Ora NFT collection</p>
          </div>
          <WalletConnect />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Oras</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{oras.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Filtered Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredOras.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Floor Price</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0.5 ETH</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Volume (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12.3 ETH</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant={showFilters ? "default" : "outline"} onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button variant={viewMode === "grid" ? "default" : "outline"} onClick={() => setViewMode("grid")}>
              <Grid className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === "list" ? "default" : "outline"} onClick={() => setViewMode("list")}>
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filter Chips */}
        <FilterChips filters={filters} onClearFilter={clearFilters} />

        <div className="flex gap-6">
          {/* Filter Panel */}
          {showFilters && (
            <div className="w-80 flex-shrink-0">
              <FilterPanel oras={oras} filters={filters} onFilterChange={handleFilterChange} />
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            <Tabs defaultValue="gallery" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="gallery">Gallery</TabsTrigger>
                <TabsTrigger value="v2">V2 Cards</TabsTrigger>
                <TabsTrigger value="collectible">Collectible</TabsTrigger>
                <TabsTrigger value="updated">Updated</TabsTrigger>
              </TabsList>

              <TabsContent value="gallery" className="mt-6">
                <div
                  className={`grid gap-6 ${
                    viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
                  }`}
                >
                  {filteredOras.map((ora) => (
                    <OraCard key={ora.id} ora={ora} viewMode={viewMode} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="v2" className="mt-6">
                <div
                  className={`grid gap-6 ${
                    viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
                  }`}
                >
                  {filteredOras.map((ora) => (
                    <OraCardV2 key={ora.id} ora={ora} viewMode={viewMode} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="collectible" className="mt-6">
                <div
                  className={`grid gap-6 ${
                    viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
                  }`}
                >
                  {filteredOras.map((ora) => (
                    <OraCardCollectible key={ora.id} ora={ora} viewMode={viewMode} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="updated" className="mt-6">
                <div
                  className={`grid gap-6 ${
                    viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
                  }`}
                >
                  {filteredOras.map((ora) => (
                    <OraCardCollectibleUpdated key={ora.id} ora={ora} viewMode={viewMode} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            {filteredOras.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No Oras found matching your criteria.</p>
                <Button onClick={clearFilters} className="mt-4">
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
