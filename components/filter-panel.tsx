"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { X, Filter, RotateCcw } from "lucide-react"
import type { OraWithCMP } from "./cmp-data-types"

interface FilterPanelProps {
  oras: OraWithCMP[]
  isOpen: boolean
  onClose: () => void
}

export function FilterPanel({ oras, isOpen, onClose }: FilterPanelProps) {
  const [filters, setFilters] = useState({
    hasCMP: false,
    archetypes: [] as string[],
    alignments: [] as string[],
    toneRanges: {
      playful: [0, 100] as [number, number],
      serious: [0, 100] as [number, number],
      creative: [0, 100] as [number, number],
    },
  })

  // Extract unique values from oras
  const archetypes = Array.from(new Set(oras.map((ora) => ora.cmp?.archetype).filter(Boolean)))
  const alignments = Array.from(new Set(oras.map((ora) => ora.cmp?.alignment).filter(Boolean)))

  const handleArchetypeChange = (archetype: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      archetypes: checked ? [...prev.archetypes, archetype] : prev.archetypes.filter((a) => a !== archetype),
    }))
  }

  const handleAlignmentChange = (alignment: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      alignments: checked ? [...prev.alignments, alignment] : prev.alignments.filter((a) => a !== alignment),
    }))
  }

  const clearFilters = () => {
    setFilters({
      hasCMP: false,
      archetypes: [],
      alignments: [],
      toneRanges: {
        playful: [0, 100],
        serious: [0, 100],
        creative: [0, 100],
      },
    })
  }

  const activeFilterCount =
    (filters.hasCMP ? 1 : 0) +
    filters.archetypes.length +
    filters.alignments.length +
    (filters.toneRanges.playful[0] !== 0 || filters.toneRanges.playful[1] !== 100 ? 1 : 0) +
    (filters.toneRanges.serious[0] !== 0 || filters.toneRanges.serious[1] !== 100 ? 1 : 0) +
    (filters.toneRanges.creative[0] !== 0 || filters.toneRanges.creative[1] !== 100 ? 1 : 0)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white/95 backdrop-blur-lg border-0 shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <div className="flex items-center gap-3">
            <Filter className="w-6 h-6 text-purple-600" />
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Advanced Filters
            </CardTitle>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                {activeFilterCount} active
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* CMP Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">CMP Status</h3>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasCMP"
                  checked={filters.hasCMP}
                  onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, hasCMP: checked as boolean }))}
                />
                <label htmlFor="hasCMP" className="text-sm font-medium">
                  Has CMP Profile
                </label>
              </div>
            </div>

            {/* Archetypes */}
            {archetypes.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Archetypes</h3>
                <div className="grid grid-cols-2 gap-2">
                  {archetypes.map((archetype) => (
                    <div key={archetype} className="flex items-center space-x-2">
                      <Checkbox
                        id={`archetype-${archetype}`}
                        checked={filters.archetypes.includes(archetype)}
                        onCheckedChange={(checked) => handleArchetypeChange(archetype, checked as boolean)}
                      />
                      <label htmlFor={`archetype-${archetype}`} className="text-sm font-medium capitalize">
                        {archetype}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Alignments */}
            {alignments.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Alignments</h3>
                <div className="grid grid-cols-1 gap-2">
                  {alignments.map((alignment) => (
                    <div key={alignment} className="flex items-center space-x-2">
                      <Checkbox
                        id={`alignment-${alignment}`}
                        checked={filters.alignments.includes(alignment)}
                        onCheckedChange={(checked) => handleAlignmentChange(alignment, checked as boolean)}
                      />
                      <label htmlFor={`alignment-${alignment}`} className="text-sm font-medium">
                        {alignment}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tone Ranges */}
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">Personality Tone Ranges</h3>

              {Object.entries(filters.toneRanges).map(([tone, range]) => (
                <div key={tone} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium capitalize">{tone}</label>
                    <span className="text-xs text-gray-500 font-mono">
                      {range[0]}% - {range[1]}%
                    </span>
                  </div>
                  <Slider
                    value={range}
                    onValueChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        toneRanges: {
                          ...prev.toneRanges,
                          [tone]: value as [number, number],
                        },
                      }))
                    }
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>

        <div className="flex justify-between items-center p-6 border-t bg-gray-50/50">
          <p className="text-sm text-gray-600">Showing {oras.length} characters</p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-600 text-white" onClick={onClose}>
              Apply Filters
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
