"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Star, ExternalLink, Edit3 } from "lucide-react"
import Image from "next/image"
import { useFilterStore } from "@/lib/store"
import { OraProfileModal } from "./ora-profile-modal"

interface Ora {
  name: string
  oraNumber: string
  image: string
  traits: Record<string, string>
  openseaUrl: string
}

interface CMPData {
  customName: string
  tagline: string
  archetype: string
  tone: {
    playful: number
    serious: number
    creative: number
    analytical: number
    empathetic: number
    assertive: number
  }
  alignment: string
  lore: string
  memoryLog: string[]
}

interface OraCardCollectibleProps {
  ora: Ora
  initialCMPData?: CMPData
  isSelected?: boolean
  onSelectionChange?: (tokenId: string) => void
  showSelection?: boolean
}

// Mock CMP data - in real app this would come from your backend
// const mockCMPData = {
//   customName: "", // User-defined name
//   tagline: "Digital dreamweaver with a sweet tooth for chaos",
//   archetype: "creator",
//   tone: {
//     playful: 75,
//     serious: 25,
//     creative: 90,
//     analytical: 40,
//     empathetic: 60,
//     assertive: 55,
//   },
//   alignment: "Chaotic Good",
//   lore: "Born in the candy-coated streets of Sugartown, this Ora discovered their ability to weave digital dreams from crystallized sugar pixels. They spend their days crafting impossible geometries and their nights debugging reality itself.",
//   memoryLog: [],
// }

const getAlignmentColor = (alignment: string) => {
  const colorMap: Record<string, string> = {
    // Good alignments - warmer colors
    "Chaotic Good": "from-emerald-400 to-green-500",
    "Neutral Good": "from-blue-400 to-cyan-500",
    "Lawful Good": "from-yellow-400 to-amber-500",

    // Neutral alignments - balanced colors
    "Chaotic Neutral": "from-purple-400 to-violet-500",
    "True Neutral": "from-gray-400 to-slate-500",
    "Lawful Neutral": "from-indigo-400 to-blue-500",

    // Evil alignments - darker/cooler colors
    "Chaotic Evil": "from-red-500 to-rose-600",
    "Neutral Evil": "from-orange-500 to-red-600",
    "Lawful Evil": "from-pink-500 to-purple-600",
  }
  return colorMap[alignment] || "from-gray-400 to-slate-500"
}

const getToneGlow = (tone: CMPData["tone"]) => {
  // Create a subtle glow based on dominant personality traits
  const dominant = Object.entries(tone).reduce((a, b) =>
    tone[a[0] as keyof CMPData["tone"]] > tone[b[0] as keyof CMPData["tone"]] ? a : b,
  )

  const glowMap: Record<string, string> = {
    playful: "shadow-pink-200/50",
    serious: "shadow-blue-200/50",
    creative: "shadow-purple-200/50",
    analytical: "shadow-cyan-200/50",
    empathetic: "shadow-green-200/50",
    assertive: "shadow-orange-200/50",
  }

  return glowMap[dominant[0]] || "shadow-gray-200/50"
}

export function OraCardCollectible({
  ora,
  initialCMPData,
  isSelected = false,
  onSelectionChange,
  showSelection = false,
}: OraCardCollectibleProps) {
  const { toggleFavorite, isFavorite } = useFilterStore()
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)

  // Initialize CMP data with props or defaults
  const [cmpData, setCMPData] = useState<CMPData>(
    initialCMPData || {
      customName: "",
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
    },
  )

  const [customName, setCustomName] = useState(cmpData.customName)
  const [tempName, setTempName] = useState(customName)

  const isOraFavorited = isFavorite(ora.oraNumber)
  const displayName = customName || `#${ora.oraNumber}`
  const toneGlow = getToneGlow(cmpData.tone)
  const alignmentColor = getAlignmentColor(cmpData.alignment)

  // Handle CMP data updates from modal
  const handleCMPDataChange = (newCMPData: CMPData) => {
    setCMPData(newCMPData)
    setCustomName(newCMPData.customName)
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(ora.oraNumber)
  }

  const handleCardClick = () => {
    if (!isEditingName && !showSelection) {
      setProfileModalOpen(true)
    }
  }

  const handleEditName = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setTempName(customName)
    setIsEditingName(true)
  }

  const handleSaveName = () => {
    setCustomName(tempName.trim() || "")
    setIsEditingName(false)
  }

  const handleCancelEdit = () => {
    setTempName(customName)
    setIsEditingName(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveName()
    } else if (e.key === "Escape") {
      handleCancelEdit()
    }
  }

  const handleSelectionChange = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onSelectionChange?.(ora.oraNumber)
  }

  return (
    <>
      <Card
        className={`group hover:shadow-2xl transition-all duration-500 border-0 bg-white/90 backdrop-blur-sm overflow-hidden rounded-3xl hover:scale-[1.02] cursor-pointer ${toneGlow} hover:shadow-xl`}
        onClick={handleCardClick}
      >
        <CardContent className="p-0">
          {/* Image Container - Hero Element */}
          <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-3xl">
            <Image
              src={ora.image || "/placeholder.svg"}
              alt={displayName}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
              crossOrigin="anonymous"
            />

            {/* Subtle mood glow overlay */}
            <div
              className={`absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
            />

            {showSelection && (
              <div className="absolute top-3 right-3 z-10">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={handleSelectionChange}
                  className="w-5 h-5 rounded border-2 border-white bg-white/80 backdrop-blur checked:bg-gradient-to-r checked:from-pink-500 checked:to-purple-600 focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 cursor-pointer"
                  aria-label={`Select ${displayName} for bulk editing`}
                />
              </div>
            )}

            {/* Hover Actions - Top Right */}
            {!showSelection && (
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFavoriteClick}
                  className={`p-2.5 rounded-xl transition-all duration-300 transform hover:scale-110 backdrop-blur-sm ${
                    isOraFavorited
                      ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg scale-105"
                      : "bg-white/90 text-gray-600 hover:bg-white shadow-lg"
                  }`}
                >
                  <Star className={`w-4 h-4 transition-all duration-200 ${isOraFavorited ? "fill-current" : ""}`} />
                </Button>

                <a
                  href={ora.openseaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-2.5 bg-white/90 backdrop-blur-sm rounded-xl text-gray-600 transition-all duration-300 hover:bg-white hover:scale-110 shadow-lg"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}

            {/* CMP Ready Badge - Top Left */}
            {!showSelection && (
              <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white border-0 shadow-lg text-xs px-2 py-1">
                  CMP
                </Badge>
              </div>
            )}
          </div>

          {/* Content - Minimal and Clean */}
          <div className="p-6 text-center">
            {/* Name - Editable */}
            <div className="mb-3">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyDown={handleKeyPress}
                    onBlur={handleSaveName}
                    placeholder={`#${ora.oraNumber}`}
                    className="text-center font-bold text-lg border-2 border-blue-300 focus:border-blue-500 rounded-xl"
                    autoFocus
                    maxLength={20}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 group/name">
                  <h3 className="font-bold text-xl text-gray-900 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-pink-500 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                    {displayName}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEditName}
                    className="p-1 opacity-0 group-hover/name:opacity-100 transition-opacity duration-200 hover:bg-gray-100 rounded-lg"
                  >
                    <Edit3 className="w-3 h-3 text-gray-400" />
                  </Button>
                </div>
              )}
            </div>

            {/* Alignment Badge */}
            <Badge
              className={`bg-gradient-to-r ${alignmentColor} text-white border-0 shadow-lg px-3 py-1.5 rounded-full text-sm font-medium`}
            >
              {cmpData.alignment}
            </Badge>

            {/* Subtle hint for interaction */}
            <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <p className="text-xs text-gray-500 font-medium">Click to view profile</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <OraProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        ora={ora}
        cmpData={cmpData}
        customName={customName}
        onNameChange={setCustomName}
        onCMPDataChange={handleCMPDataChange}
      />
    </>
  )
}
