"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Star,
  ExternalLink,
  Edit3,
  MessageCircle,
  Share2,
  Brain,
  Palette,
  BookOpen,
  Zap,
  Shield,
  Sword,
  Wand2,
  Sparkles,
} from "lucide-react"
import Image from "next/image"
import { useFilterStore } from "@/lib/store"
import { CMPEditorModal } from "./cmp-editor-modal"

interface Ora {
  name: string
  oraNumber: string
  image: string
  traits: Record<string, string>
  openseaUrl: string
}

interface OraCardV2Props {
  ora: Ora
}

// Mock CMP data - in real app this would come from your backend
const mockCMPData = {
  tagline: "Digital dreamweaver with a sweet tooth for chaos",
  archetype: "creator",
  tone: {
    playful: 75,
    serious: 25,
    creative: 90,
    analytical: 40,
    empathetic: 60,
    assertive: 55,
  },
  alignment: "Chaotic Good",
  lore: "Born in the candy-coated streets of Sugartown, this Ora discovered their ability to weave digital dreams from crystallized sugar pixels. They spend their days crafting impossible geometries and their nights debugging reality itself.",
  memoryLog: [],
}

const archetypeIcons = {
  creator: Palette,
  explorer: Zap,
  guardian: Shield,
  rebel: Sword,
  sage: Brain,
  mystic: Wand2,
}

const archetypeColors = {
  creator: "from-pink-500 to-rose-500",
  explorer: "from-blue-500 to-cyan-500",
  guardian: "from-green-500 to-emerald-500",
  rebel: "from-red-500 to-orange-500",
  sage: "from-purple-500 to-indigo-500",
  mystic: "from-violet-500 to-purple-500",
}

export function OraCardV2({ ora }: OraCardV2Props) {
  const { toggleFavorite, isFavorite } = useFilterStore()
  const [cmpEditorOpen, setCmpEditorOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const isOraFavorited = isFavorite(ora.oraNumber)

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(ora.oraNumber)
  }

  const ArchetypeIcon = archetypeIcons[mockCMPData.archetype as keyof typeof archetypeIcons] || Palette
  const archetypeColor =
    archetypeColors[mockCMPData.archetype as keyof typeof archetypeColors] || "from-pink-500 to-purple-500"

  return (
    <>
      <Card
        className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm overflow-hidden rounded-3xl hover:scale-[1.02] hover:bg-white/90 cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-0">
          {/* Image Container with CMP Status */}
          <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-3xl">
            <Image
              src={ora.image || "/placeholder.svg"}
              alt={ora.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
              crossOrigin="anonymous"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* CMP Status Badge */}
            <div className="absolute top-3 left-3 flex gap-2">
              <div
                className={`px-3 py-1.5 bg-gradient-to-r ${archetypeColor} text-white text-xs font-bold rounded-xl shadow-lg backdrop-blur-sm flex items-center gap-1.5`}
              >
                <ArchetypeIcon className="w-3 h-3" />
                CMP
              </div>
            </div>

            {/* Action Buttons */}
            <div className="absolute top-3 right-3 flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFavoriteClick}
                className={`p-2 rounded-xl transition-all duration-300 transform hover:scale-110 ${
                  isOraFavorited
                    ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg scale-105"
                    : "bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white/90 opacity-0 group-hover:opacity-100"
                }`}
              >
                <Star className={`w-4 h-4 transition-all duration-200 ${isOraFavorited ? "fill-current" : ""}`} />
              </Button>

              <a
                href={ora.openseaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/80 backdrop-blur-sm rounded-xl text-gray-600 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/90 hover:scale-110"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* Archetype Badge */}
            <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Badge className={`bg-gradient-to-r ${archetypeColor} text-white border-0 shadow-lg`}>
                {mockCMPData.archetype.charAt(0).toUpperCase() + mockCMPData.archetype.slice(1)}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-xl text-gray-900 truncate group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-pink-500 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                  {ora.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="outline"
                    className="text-xs bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 text-blue-700 rounded-lg px-2 py-1 font-mono"
                  >
                    #{ora.oraNumber}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-700 rounded-lg px-2 py-1"
                  >
                    {mockCMPData.alignment}
                  </Badge>
                </div>
              </div>
            </div>

            {/* CMP Tagline */}
            <div className="mb-4 p-3 bg-gradient-to-r from-pink-50/50 to-purple-50/50 rounded-xl border border-pink-100/50">
              <p className="text-sm text-gray-700 italic font-medium leading-relaxed">"{mockCMPData.tagline}"</p>
            </div>

            {/* Tone Indicators */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Palette className="w-4 h-4 text-purple-500" />
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Tone Profile</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(mockCMPData.tone)
                  .slice(0, 3)
                  .map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className="text-xs text-gray-500 capitalize mb-1">{key}</div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-pink-500 to-purple-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                      <div className="text-xs font-mono text-gray-400 mt-1">{value}%</div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Lore Preview */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Lore</span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{mockCMPData.lore}</p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                onClick={() => setCmpEditorOpen(true)}
                variant="outline"
                size="sm"
                className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200 hover:from-pink-100 hover:to-purple-100 text-pink-700 hover:text-pink-800 rounded-xl transition-all duration-200 gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit CMP
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 hover:from-blue-100 hover:to-cyan-100 text-blue-700 hover:text-blue-800 rounded-xl transition-all duration-200 gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Chat
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:from-green-100 hover:to-emerald-100 text-green-700 hover:text-green-800 rounded-xl transition-all duration-200 gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                Post
              </Button>
            </div>

            {/* Traits (Collapsed by default, expandable) */}
            {Object.keys(ora.traits).length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <details className="group/details">
                  <summary className="cursor-pointer text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2 hover:text-gray-700 transition-colors">
                    <Sparkles className="w-3 h-3" />
                    NFT Traits ({Object.keys(ora.traits).length})
                    <span className="ml-auto group-open/details:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="mt-3 space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                    {Object.entries(ora.traits).map(([traitType, value]) => (
                      <div
                        key={traitType}
                        className="flex items-center justify-between text-xs p-2 bg-gray-50/60 rounded-lg"
                      >
                        <span className="text-gray-600 font-medium capitalize">{traitType.replace(/_/g, " ")}</span>
                        <Badge
                          variant="secondary"
                          className="bg-white/80 text-gray-700 text-xs px-2 py-1 rounded-lg border border-gray-200/50"
                        >
                          {value}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <CMPEditorModal
        isOpen={cmpEditorOpen}
        onClose={() => setCmpEditorOpen(false)}
        oraName={ora.name}
        oraNumber={ora.oraNumber}
        oraImage={ora.image}
        initialCMP={mockCMPData}
      />
    </>
  )
}
