"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Brain,
  Palette,
  BookOpen,
  Clock,
  Save,
  Download,
  Copy,
  Sparkles,
  Zap,
  Shield,
  Sword,
  Wand2,
} from "lucide-react"

interface CMPData {
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

interface CMPEditorModalProps {
  isOpen: boolean
  onClose: () => void
  oraName: string
  oraNumber: string
  oraImage: string
  initialCMP?: Partial<CMPData>
}

const archetypes = [
  { id: "creator", label: "Creator", icon: Palette, color: "from-pink-500 to-rose-500" },
  { id: "explorer", label: "Explorer", icon: Zap, color: "from-blue-500 to-cyan-500" },
  { id: "guardian", label: "Guardian", icon: Shield, color: "from-green-500 to-emerald-500" },
  { id: "rebel", label: "Rebel", icon: Sword, color: "from-red-500 to-orange-500" },
  { id: "sage", label: "Sage", icon: Brain, color: "from-purple-500 to-indigo-500" },
  { id: "mystic", label: "Mystic", icon: Wand2, color: "from-violet-500 to-purple-500" },
]

const alignments = [
  "Chaotic Good",
  "Neutral Good",
  "Lawful Good",
  "Chaotic Neutral",
  "True Neutral",
  "Lawful Neutral",
  "Chaotic Evil",
  "Neutral Evil",
  "Lawful Evil",
]

export function CMPEditorModal({ isOpen, onClose, oraName, oraNumber, oraImage, initialCMP }: CMPEditorModalProps) {
  const [cmpData, setCMPData] = useState<CMPData>({
    tagline: initialCMP?.tagline || "",
    archetype: initialCMP?.archetype || "creator",
    tone: {
      playful: initialCMP?.tone?.playful || 50,
      serious: initialCMP?.tone?.serious || 50,
      creative: initialCMP?.tone?.creative || 50,
      analytical: initialCMP?.tone?.analytical || 50,
      empathetic: initialCMP?.tone?.empathetic || 50,
      assertive: initialCMP?.tone?.assertive || 50,
    },
    alignment: initialCMP?.alignment || "True Neutral",
    lore: initialCMP?.lore || "",
    memoryLog: initialCMP?.memoryLog || [],
  })

  const [showJSON, setShowJSON] = useState(false)

  const handleToneChange = (key: keyof CMPData["tone"], value: number[]) => {
    setCMPData((prev) => ({
      ...prev,
      tone: {
        ...prev.tone,
        [key]: value[0],
      },
    }))
  }

  const selectedArchetype = archetypes.find((a) => a.id === cmpData.archetype) || archetypes[0]

  const exportCMP = () => {
    const cmpJSON = JSON.stringify(cmpData, null, 2)
    navigator.clipboard.writeText(cmpJSON)
    // You could add a toast notification here
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-white via-pink-50/30 to-purple-50/30 backdrop-blur-xl border-0 shadow-2xl">
        <DialogHeader className="pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg">
              <img src={oraImage || "/placeholder.svg"} alt={oraName} className="w-full h-full object-cover" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                CMP Editor
              </DialogTitle>
              <p className="text-gray-600 font-mono text-sm">
                {oraName} #{oraNumber}
              </p>
            </div>
            <div className="ml-auto flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowJSON(!showJSON)} className="font-mono text-xs">
                {showJSON ? "UI" : "JSON"}
              </Button>
              <Button variant="outline" size="sm" onClick={exportCMP} className="gap-2 bg-transparent">
                <Copy className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
        </DialogHeader>

        {showJSON ? (
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-xl p-4 font-mono text-sm text-green-400 max-h-96 overflow-auto">
              <pre>{JSON.stringify(cmpData, null, 2)}</pre>
            </div>
            <div className="flex gap-2">
              <Button onClick={exportCMP} className="gap-2">
                <Download className="w-4 h-4" />
                Download CMP
              </Button>
              <Button variant="outline" onClick={() => setShowJSON(false)}>
                Back to Editor
              </Button>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="identity" className="flex-1 overflow-hidden">
            <TabsList className="grid w-full grid-cols-4 bg-white/50 backdrop-blur-sm rounded-xl p-1">
              <TabsTrigger
                value="identity"
                className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg"
              >
                <Brain className="w-4 h-4" />
                Identity
              </TabsTrigger>
              <TabsTrigger
                value="tone"
                className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg"
              >
                <Palette className="w-4 h-4" />
                ToneBoard
              </TabsTrigger>
              <TabsTrigger
                value="lore"
                className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg"
              >
                <BookOpen className="w-4 h-4" />
                LorePanel
              </TabsTrigger>
              <TabsTrigger
                value="memory"
                className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg"
              >
                <Clock className="w-4 h-4" />
                MemoryLog
              </TabsTrigger>
            </TabsList>

            <div className="mt-6 overflow-auto max-h-[60vh]">
              <TabsContent value="identity" className="space-y-6 mt-0">
                <Card className="bg-white/60 backdrop-blur-sm border-white/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Brain className="w-5 h-5 text-pink-500" />
                      Identity Core
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Tagline</Label>
                      <Input
                        value={cmpData.tagline}
                        onChange={(e) => setCMPData((prev) => ({ ...prev, tagline: e.target.value }))}
                        placeholder="A catchy one-liner that defines this Ora..."
                        className="mt-1 bg-white/70 border-white/30 focus:bg-white/90"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-gray-700 mb-3 block">Archetype</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {archetypes.map((archetype) => {
                          const Icon = archetype.icon
                          const isSelected = cmpData.archetype === archetype.id
                          return (
                            <button
                              key={archetype.id}
                              onClick={() => setCMPData((prev) => ({ ...prev, archetype: archetype.id }))}
                              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                                isSelected
                                  ? `bg-gradient-to-r ${archetype.color} text-white border-transparent shadow-lg scale-105`
                                  : "bg-white/60 border-white/30 hover:bg-white/80 hover:scale-102"
                              }`}
                            >
                              <Icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? "text-white" : "text-gray-600"}`} />
                              <div className={`text-sm font-semibold ${isSelected ? "text-white" : "text-gray-700"}`}>
                                {archetype.label}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-gray-700 mb-3 block">Alignment</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {alignments.map((alignment) => (
                          <button
                            key={alignment}
                            onClick={() => setCMPData((prev) => ({ ...prev, alignment }))}
                            className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                              cmpData.alignment === alignment
                                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                                : "bg-white/60 border border-white/30 hover:bg-white/80 text-gray-700"
                            }`}
                          >
                            {alignment}
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tone" className="space-y-6 mt-0">
                <Card className="bg-white/60 backdrop-blur-sm border-white/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Palette className="w-5 h-5 text-purple-500" />
                      ToneBoard Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {Object.entries(cmpData.tone).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label className="text-sm font-semibold text-gray-700 capitalize">{key}</Label>
                          <Badge variant="outline" className="font-mono text-xs">
                            {value}%
                          </Badge>
                        </div>
                        <Slider
                          value={[value]}
                          onValueChange={(newValue) => handleToneChange(key as keyof CMPData["tone"], newValue)}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 font-mono">
                          <span>0</span>
                          <span>50</span>
                          <span>100</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="lore" className="space-y-6 mt-0">
                <Card className="bg-white/60 backdrop-blur-sm border-white/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BookOpen className="w-5 h-5 text-blue-500" />
                      LorePanel
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Background & Story</Label>
                      <Textarea
                        value={cmpData.lore}
                        onChange={(e) => setCMPData((prev) => ({ ...prev, lore: e.target.value }))}
                        placeholder="Write the backstory, personality traits, quirks, and defining characteristics of this Ora..."
                        className="mt-1 bg-white/70 border-white/30 focus:bg-white/90 min-h-32"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                        <Sparkles className="w-4 h-4" />
                        AI Enhance
                      </Button>
                      <Button variant="outline" size="sm">
                        Templates
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="memory" className="space-y-6 mt-0">
                <Card className="bg-white/60 backdrop-blur-sm border-white/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Clock className="w-5 h-5 text-green-500" />
                      MemoryLog
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-sm">Memory logging coming soon...</p>
                      <p className="text-xs text-gray-400 mt-2">
                        This will track interactions, conversations, and personality evolution
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        )}

        <Separator className="my-4" />

        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500 font-mono">Powered by OraKit CMP v1.0</div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white gap-2"
              onClick={() => {
                // Save CMP data
                onClose()
              }}
            >
              <Save className="w-4 h-4" />
              Save CMP
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
