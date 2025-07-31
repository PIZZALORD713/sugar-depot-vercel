"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, Edit3, FileText } from "lucide-react"
import { CMPEditorModal } from "./cmp-editor-modal"
import type { OraWithCMP, CMPData } from "./cmp-data-types"

interface OraCardCollectibleUpdatedProps {
  ora: OraWithCMP
  onCMPUpdate?: (oraId: string, cmp: CMPData) => void
  isImported?: boolean
}

export function OraCardCollectibleUpdated({ ora, onCMPUpdate, isImported = false }: OraCardCollectibleUpdatedProps) {
  const [isEditorOpen, setIsEditorOpen] = useState(false)

  const handleCMPSave = (cmpData: CMPData) => {
    onCMPUpdate?.(ora.oraId, cmpData)
    setIsEditorOpen(false)
  }

  const handleExport = () => {
    const exportData = {
      oraId: ora.oraId,
      image: ora.image,
      traits: ora.traits,
      cmp: ora.cmp || {},
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${ora.cmp?.customName || `Ora-${ora.oraId}`}-CMP.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const displayName = ora.cmp?.customName || `Ora #${ora.oraId}`

  return (
    <>
      <Card className="w-full max-w-sm mx-auto overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="relative">
          <img src={ora.image || "/placeholder.svg"} alt={displayName} className="w-full h-64 object-cover" />
          <div className="absolute top-2 right-2 flex gap-1">
            <Badge variant="secondary" className="bg-black/70 text-white">
              #{ora.oraId}
            </Badge>
            {isImported && (
              <Badge variant="secondary" className="bg-blue-600/80 text-white">
                <FileText className="w-3 h-3 mr-1" />
                Imported
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="p-4">
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg truncate">{displayName}</h3>
              {ora.cmp?.archetype && <p className="text-sm text-muted-foreground">{ora.cmp.archetype}</p>}
            </div>

            {ora.cmp?.alignment && (
              <Badge variant="outline" className="text-xs">
                {ora.cmp.alignment}
              </Badge>
            )}

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditorOpen(true)} className="flex-1">
                <Edit3 className="w-4 h-4 mr-1" />
                Edit CMP
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport} className="flex-1 bg-transparent">
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <CMPEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleCMPSave}
        initialData={ora.cmp}
        oraData={{
          id: ora.oraId,
          name: displayName,
          image: ora.image,
        }}
      />
    </>
  )
}
