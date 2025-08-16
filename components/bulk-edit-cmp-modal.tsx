"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Copy, Check } from "lucide-react"
import { Card } from "@/components/ui/card"
import Image from "next/image"

interface BulkEditCMPModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedOras: Array<{
    tokenId: string
    name: string
    image: string
    traits: Record<string, string>
    rawTraits: Array<{ trait_type: string; value: string }>
  }>
}

export function BulkEditCMPModal({ open, onOpenChange, selectedOras }: BulkEditCMPModalProps) {
  const [copied, setCopied] = useState(false)

  const generateExportData = () => {
    const exportData = {
      collection: "Sugartown Oras",
      exportDate: new Date().toISOString(),
      totalCharacters: selectedOras.length,
      instructions: {
        purpose: "AI-powered CMP (Character Metadata Profile) generation",
        requirements: [
          "Analyze each character's visual traits and overall 'vibe' from their PFP",
          "Generate unique lore that fits their archetype and alignment",
          "Create memorable catchphrases that match their personality",
          "Provide 3 name options per character (or allow custom variations)",
          "Fill all CMP attributes based on visual analysis and traits",
        ],
        cmpAttributes: {
          archetype: "Character class/role (e.g., Warrior, Mystic, Trickster, Guardian)",
          alignment: "Moral compass (e.g., Chaotic Good, Lawful Neutral, True Neutral)",
          tone: "Communication style (e.g., Witty, Serious, Playful, Mysterious)",
          tagline: "Short memorable phrase (max 50 characters)",
          lore: "Character backstory and personality (100-200 words)",
          catchphrase: "Signature saying or quote",
          nameOptions: ["Option 1", "Option 2", "Option 3"],
        },
      },
      characters: selectedOras.map((ora) => ({
        tokenId: ora.tokenId,
        currentName: ora.name,
        imageUrl: ora.image,
        visualTraits: ora.rawTraits.reduce(
          (acc, trait) => {
            acc[trait.trait_type.toLowerCase().replace(/\s+/g, "_")] = trait.value
            return acc
          },
          {} as Record<string, string>,
        ),
        normalizedTraits: ora.traits,
        cmpToGenerate: {
          archetype: "", // AI to fill
          alignment: "", // AI to fill
          tone: "", // AI to fill
          tagline: "", // AI to fill
          lore: "", // AI to fill
          catchphrase: "", // AI to fill
          nameOptions: [], // AI to fill with 3 options
        },
        analysisNotes: {
          visualVibe: "", // AI to analyze PFP and describe overall aesthetic
          personalityHints: "", // AI to infer personality from visual traits
          suggestedThemes: [], // AI to suggest thematic elements
        },
      })),
    }

    return JSON.stringify(exportData, null, 2)
  }

  const handleExport = () => {
    const data = generateExportData()
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sugartown-oras-cmp-export-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCopyToClipboard = async () => {
    const data = generateExportData()
    try {
      await navigator.clipboard.writeText(data)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy to clipboard:", err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Bulk Edit CMP
            </span>
            <Badge variant="secondary">{selectedOras.length} selected</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Instructions */}
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">AI Generation Instructions</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Export this data to use with AI tools like ChatGPT to generate custom CMP profiles for each character.
            </p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• AI will analyze each character's PFP and traits to determine their "vibe"</p>
              <p>• Generate unique lore, catchphrases, and personality attributes</p>
              <p>• Provide 3 name options per character for user selection</p>
              <p>• Fill archetype, alignment, tone based on visual analysis</p>
            </div>
          </div>

          {/* Selected Characters Preview */}
          <div>
            <h3 className="font-semibold mb-3">Selected Characters ({selectedOras.length})</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-60 overflow-y-auto">
              {selectedOras.map((ora) => (
                <Card key={ora.tokenId} className="p-2">
                  <Image
                    src={ora.image || "/placeholder.svg"}
                    alt={ora.name}
                    width={80}
                    height={80}
                    className="w-full aspect-square object-cover rounded-lg bg-white/40 mb-2"
                    crossOrigin="anonymous"
                  />
                  <p className="text-xs font-medium truncate">{ora.name}</p>
                  <p className="text-xs text-muted-foreground">#{ora.tokenId}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Export Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={handleExport} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export JSON File
            </Button>
            <Button
              variant="outline"
              onClick={handleCopyToClipboard}
              className="flex items-center gap-2 bg-transparent"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy to Clipboard
                </>
              )}
            </Button>
          </div>

          {/* Sample prompt for AI */}
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border">
            <h4 className="font-medium mb-2">Sample AI Prompt</h4>
            <p className="text-xs text-muted-foreground font-mono">
              "Please analyze the attached JSON data containing Sugartown Ora NFT characters. For each character,
              examine their visual traits and PFP image to generate comprehensive CMP (Character Metadata Profile) data
              including archetype, alignment, tone, unique lore, catchphrases, and 3 name options. Base your analysis on
              their visual appearance and existing traits to create cohesive personalities."
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
