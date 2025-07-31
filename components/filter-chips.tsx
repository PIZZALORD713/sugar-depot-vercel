"use client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useFilterStore } from "@/lib/store"

type FilterChipsProps = {}

export function FilterChips({}: FilterChipsProps) {
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

  const activeFilters: string[] = []

  if (searchNumber) activeFilters.push(`Search: ${searchNumber}`)
  if (showFavoritesOnly) activeFilters.push("Favorites")
  Object.entries(selectedTraits).forEach(([traitType, values]) =>
    values.forEach((value) => activeFilters.push(`${traitType.replace(/_/g, " ")}: ${value}`)),
  )

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
    <div className="flex flex-wrap gap-2 mb-6">
      {activeFilters.map((filter, index) => (
        <Badge
          key={index}
          variant="secondary"
          className="flex items-center gap-2 px-3 py-1 bg-white/60 backdrop-blur-sm border-white/30"
        >
          {filter}
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => {
              // Handle filter removal
              const [traitType, value] = filter.split(": ")
              if (traitType === "Search") {
                setSearchNumber("")
              } else if (traitType === "Favorites") {
                setShowFavoritesOnly(false)
              } else {
                handleTraitRemove(traitType, value)
              }
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
      <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700" onClick={clearAllFilters}>
        Clear all
      </Button>
    </div>
  )
}
