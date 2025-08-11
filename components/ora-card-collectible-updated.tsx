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
import { type CMPData, type Ora, DEFAULT_CMP_DATA, getAlignmentColor, getToneGlow } from "./cmp-data-types"

interface OraCardCollectibleProps {
  ora: Ora
  initialCMPData?: CMPData
}

export function OraCardCollectible({ ora, initialCMPData }: OraCardCollectibleProps) {
  const { toggleFavorite, isFavorite } = useFilterStore()
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)

  // Initialize CMP data with props or defaults
  const [cmpData, setCMPData] = useState<CMPData>(initialCMPData || DEFAULT_CMP_DATA)
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
    // In a real app, you'd also save to backend/localStorage here
    console.log("CMP data updated for Ora #" + ora.oraNumber, newCMPData)
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(ora.oraNumber)
  }

  const handleCardClick = () => {
    if (!isEditingName) {
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
    const newName = tempName.trim() || ""
    setCustomName(newName)
    setCMPData((prev) => ({ ...prev, customName: newName }))
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

            {/* Hover Actions - Top Right */}
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

            {/* CMP Ready Badge - Top Left */}
            <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white border-0 shadow-lg text-xs px-2 py-1">
                CMP
              </Badge>
            </div>
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

            {/* Alignment Badge - Now reflects current CMP data */}
            <Badge
              className={`bg-gradient-to-r ${alignmentColor} text-white border-0 shadow-lg px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300`}
            >
              {cmpData.alignment}
            </Badge>

            {/* Archetype indicator - subtle hint */}
            <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <p className="text-xs text-gray-500 font-medium capitalize">{cmpData.archetype} • Click to customize</p>
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
