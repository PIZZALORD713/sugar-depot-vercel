"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Star, ExternalLink, ChevronDown, Sparkles } from "lucide-react"
import Image from "next/image"
import { useFilterStore } from "@/lib/store"

interface Ora {
  name: string
  oraNumber: string
  image: string
  traits: Record<string, string>
  openseaUrl: string
}

interface OraCardProps {
  ora: Ora
}

export function OraCard({ ora }: OraCardProps) {
  const { toggleFavorite, isFavorite } = useFilterStore()
  const [traitsOpen, setTraitsOpen] = useState(false)
  const isOraFavorited = isFavorite(ora.oraNumber)

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(ora.oraNumber)
  }

  const traitCount = Object.keys(ora.traits).length

  return (
    <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm overflow-hidden rounded-2xl hover:scale-[1.02] hover:bg-white/90">
      <CardContent className="p-0">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-2xl">
          <Image
            src={ora.image || "/placeholder.svg"}
            alt={ora.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            crossOrigin="anonymous"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Star Favorite Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFavoriteClick}
            className={`absolute top-3 left-3 p-2 rounded-xl transition-all duration-300 transform hover:scale-110 ${
              isOraFavorited
                ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg scale-105"
                : "bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white/90 opacity-0 group-hover:opacity-100"
            }`}
          >
            <Star className={`w-4 h-4 transition-all duration-200 ${isOraFavorited ? "fill-current" : ""}`} />
          </Button>

          {/* OpenSea Link */}
          <a
            href={ora.openseaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-xl text-gray-600 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/90 hover:scale-110"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          {/* Favorite Glow Effect */}
          {isOraFavorited && (
            <div className="absolute top-3 left-3 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl blur-md opacity-50 animate-pulse" />
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {ora.name}
            </h3>
            <Badge
              variant="outline"
              className="text-xs bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 text-blue-700 rounded-lg px-2 py-1"
            >
              #{ora.oraNumber}
            </Badge>
          </div>

          {/* Traits Dropdown */}
          {traitCount > 0 ? (
            <Collapsible open={traitsOpen} onOpenChange={setTraitsOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-3 h-auto bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-purple-50 border border-gray-200 hover:border-blue-200 rounded-xl transition-all duration-200 group/trigger"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-500 group-hover/trigger:text-purple-500 transition-colors" />
                      <span className="font-medium text-gray-700 group-hover/trigger:text-blue-700">View Traits</span>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                      {traitCount}
                    </Badge>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-all duration-200 ${
                      traitsOpen ? "rotate-180 text-blue-500" : "group-hover/trigger:text-blue-500"
                    }`}
                  />
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="mt-3">
                <div className="space-y-2 p-3 bg-gradient-to-br from-gray-50/50 to-blue-50/30 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
                    <h4 className="text-sm font-semibold text-gray-700">Traits</h4>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                    {Object.entries(ora.traits).map(([traitType, value]) => (
                      <div
                        key={traitType}
                        className="flex items-center justify-between text-xs p-2 bg-white/60 backdrop-blur-sm rounded-lg border border-white/40 hover:bg-white/80 transition-colors"
                      >
                        <span className="text-gray-600 font-medium capitalize">{traitType.replace(/_/g, " ")}</span>
                        <Badge
                          variant="secondary"
                          className="ml-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 hover:from-blue-200 hover:to-purple-200 text-xs px-2 py-1 rounded-lg transition-all duration-200 cursor-default border border-blue-200/50"
                        >
                          {value}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <div className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-500 italic flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gray-400" />
                No traits available
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
