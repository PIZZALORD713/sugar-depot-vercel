"use client"

import { Card } from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, Sparkles, RotateCcw } from "lucide-react"
import { useFilterStore } from "@/lib/store"

export function FilterChips() {
  const {
    searchNumber,
    selectedTraits,
    showFavoritesOnly,
    setSearchNumber,
    clearTraitFilter,
    setShowFavoritesOnly,
    clearAllFilters,
  } = useFilterStore()

  const hasActiveFilters = searchNumber || Object.keys(selectedTraits).length > 0 || showFavoritesOnly

  if (!hasActiveFilters) return null

  const handleTraitRemove = (traitType: string, value: string) => {
    const currentValues = selectedTraits[traitType] || []
    const newValues = currentValues.filter((v) => v !== value)

    if (newValues.length === 0) {
      clearTraitFilter(traitType)
    } else {
      // This would need to be implemented in the store
      // For now, we'll clear the entire trait filter
      clearTraitFilter(traitType)
    }
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (searchNumber) count++
    if (showFavoritesOnly) count++
    Object.values(selectedTraits).forEach((values) => (count += values.length))
    return count
  }

  return (
    <div className="mb-6">
      <Card className="p-4 bg-white/60 backdrop-blur-sm border-white/30 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {/* Search Chip */}
            {searchNumber && (
              <Badge
                variant="secondary"
                className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-blue-200 rounded-xl px-3 py-1.5 flex items-center gap-2 hover:shadow-md transition-shadow"
              >
                Search: {searchNumber}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-red-600 transition-colors"
                  onClick={() => setSearchNumber("")}
                />
              </Badge>
            )}

            {/* Favorites Chip */}
            {showFavoritesOnly && (
              <Badge
                variant="secondary"
                className="bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-200 rounded-xl px-3 py-1.5 flex items-center gap-2 hover:shadow-md transition-shadow"
              >
                <Sparkles className="h-3 w-3 fill-current" />
                Favorites
                <X
                  className="h-3 w-3 cursor-pointer hover:text-red-600 transition-colors"
                  onClick={() => setShowFavoritesOnly(false)}
                />
              </Badge>
            )}

            {/* Trait Chips */}
            {Object.entries(selectedTraits).map(([traitType, values]) =>
              values.map((value) => (
                <Badge
                  key={`${traitType}-${value}`}
                  variant="secondary"
                  className="bg-gradient-to-r from-green-100 to-teal-100 text-green-800 border-green-200 rounded-xl px-3 py-1.5 flex items-center gap-2 hover:shadow-md transition-shadow"
                >
                  {traitType.replace(/_/g, " ")}: {value}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-600 transition-colors"
                    onClick={() => handleTraitRemove(traitType, value)}
                  />
                </Badge>
              )),
            )}
          </div>

          {/* Clear All Button */}
          <Button
            onClick={clearAllFilters}
            variant="ghost"
            size="sm"
            className="ml-4 text-gray-600 hover:text-gray-900 hover:bg-white/50 rounded-xl transition-colors"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear All ({getActiveFilterCount()})
          </Button>
        </div>
      </Card>
    </div>
  )
}
