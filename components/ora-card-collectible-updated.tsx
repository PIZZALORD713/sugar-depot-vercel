"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CMPEditorModal } from "./cmp-editor-modal"
import { Brain, Palette, Download, Upload, Sparkles, Crown, Zap } from "lucide-react"
import type { OraWithCMP, CMPData } from "./cmp-data-types"

interface OraCardProps {
  ora: OraWithCMP
  onCMPUpdate: (oraId: string, cmpData: CMPData) => void
  isImported?: boolean
}

export function OraCardCollectibleUpdated({ ora, onCMPUpdate, isImported = false }: OraCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const hasCMP = ora.cmp && Object.keys(ora.cmp).length > 0
  const displayName = ora.cmp?.customName || `Ora #${ora.oraId}`

  const handleCMPSave = (cmpData: CMPData) => {
    onCMPUpdate(ora.oraId, cmpData)
    setIsModalOpen(false)
  }

  const handleExportCMP = () => {
    if (!hasCMP) return

    const exportData = {
      oraId: ora.oraId,
      image: ora.image,
      traits: ora.traits,
      cmp: ora.cmp,
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `Ora-${ora.oraId}-CMP-Profile.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <Card
        className={`group relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer ${
          hasCMP
            ? "bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 border-purple-200/50"
            : "bg-white/70 border-white/30"
        } backdrop-blur-sm`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsModalOpen(true)}
      >
        {/* Status Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          {isImported && (
            <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 text-xs px-2 py-1 shadow-lg">
              <Upload className="w-3 h-3 mr-1" />
              Imported
            </Badge>
          )}
          {hasCMP && (
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white border-0 text-xs px-2 py-1 shadow-lg">
              <Brain className="w-3 h-3 mr-1" />
              CMP
            </Badge>
          )}
        </div>

        {/* Export Button */}
        {hasCMP && (
          <div className="absolute top-3 right-3 z-10">
            <Button
              variant="ghost"
              size="sm"
              className={`bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-200 ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
              onClick={(e) => {
                e.stopPropagation()
                handleExportCMP()
              }}
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Ora Image */}
        <div className="aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          <img
            src={ora.image || "/placeholder.svg?height=400&width=400"}
            alt={displayName}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>

        <CardContent className="p-4">
          {/* Character Name */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-lg text-gray-800 truncate">{displayName}</h3>
            {hasCMP && <Crown className="w-5 h-5 text-purple-500 flex-shrink-0" />}
          </div>

          {/* CMP Info or Create CMP */}
          {hasCMP ? (
            <div className="space-y-3">
              {/* Archetype & Alignment */}
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-gradient-to-r from-purple-100 to-pink-100 border-purple-200 text-purple-700 text-xs"
                >
                  {ora.cmp.archetype}
                </Badge>
                <Badge variant="outline" className="bg-white/60 border-gray-200 text-gray-600 text-xs">
                  {ora.cmp.alignment}
                </Badge>
              </div>

              {/* Tagline */}
              <p className="text-sm text-gray-600 italic line-clamp-2">"{ora.cmp.tagline}"</p>

              {/* Personality Preview */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Personality</div>
                <div className="grid grid-cols-3 gap-1">
                  {Object.entries(ora.cmp.tone)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 3)
                    .map(([trait, value]) => (
                      <div key={trait} className="text-center">
                        <div className="text-xs font-medium text-gray-700 capitalize truncate">{trait}</div>
                        <div className="text-xs font-mono text-purple-600">{value}%</div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Edit Button */}
              <Button
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsModalOpen(true)
                }}
              >
                <Palette className="w-4 h-4 mr-2" />
                Edit Character
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 text-center py-4">
                Transform this Ora into a unique AI character with CMP
              </p>

              <Button
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsModalOpen(true)
                }}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Create Character
              </Button>
            </div>
          )}

          {/* Ora ID */}
          <div className="mt-3 pt-3 border-t border-gray-200/50">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="font-mono">#{ora.oraId}</span>
              {hasCMP && (
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  <span>AI Ready</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CMP Editor Modal */}
      <CMPEditorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        oraData={{
          id: ora.oraId,
          name: displayName,
          image: ora.image,
          oraNumber: ora.oraId,
          traits: ora.traits,
        }}
        initialData={ora.cmp}
        onSave={handleCMPSave}
      />
    </>
  )
}
