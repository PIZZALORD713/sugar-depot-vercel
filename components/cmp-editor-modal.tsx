"use client"

import { useState, useEffect } from "react"
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
  User,
  Palette,
  BookOpen,
  Share2,
  Gem,
  Save,
  Copy,
  ExternalLink,
  Edit3,
  Sparkles,
  Brain,
  Zap,
  Shield,
  Sword,
  Wand2,
  Heart,
  MessageCircle,
  Download,
} from "lucide-react"
import type { CMPData } from "@/components/cmp-data-types"

interface OraData {
  id?: string
  name?: string
  image?: string
  oraNumber?: string
  traits?: Record<string, string>
  openseaUrl?: string
}

interface CMPEditorModalProps {
  isOpen: boolean
  onClose: () => void
  oraData?: OraData
  initialData?: CMPData
  onSave: (cmpData: CMPData) => void
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

const defaultCMPData: CMPData = {
  customName: "",
  tagline: "A unique character with untold potential",
  archetype: "explorer",
  tone: {
    playful: 50,
    serious: 50,
    creative: 50,
    analytical: 50,
    empathetic: 50,
    assertive: 50,
  },
  alignment: "True Neutral",
  lore: "",
  memoryLog: [],
}

export function CMPEditorModal({ isOpen, onClose, oraData, initialData, onSave }: CMPEditorModalProps) {
  const [localCMPData, setLocalCMPData] = useState<CMPData>(initialData || defaultCMPData)
  const [isEditingName, setIsEditingName] = useState(false)
  const [tempName, setTempName] = useState("")

  // Provide default values for oraData
  const safeOraData: OraData = {
    id: oraData?.id || "unknown",
    name: oraData?.name || "Unknown Character",
    image: oraData?.image || "/placeholder.svg?height=400&width=400",
    oraNumber: oraData?.oraNumber || oraData?.id || "0",
    traits: oraData?.traits || {},
    openseaUrl: oraData?.openseaUrl || "#",
  }

  // Update local state when props change
  useEffect(() => {
    if (initialData) {
      setLocalCMPData(initialData)
    } else {
      setLocalCMPData(defaultCMPData)
    }
    setTempName(initialData?.customName || safeOraData.name || "")
  }, [initialData, safeOraData.name])

  const displayName = localCMPData.customName || safeOraData.name || `#${safeOraData.oraNumber}`
  const selectedArchetype = archetypes.find((a) => a.id === localCMPData.archetype) || archetypes[0]

  const handleToneChange = (key: keyof CMPData["tone"], value: number[]) => {
    setLocalCMPData((prev) => ({
      ...prev,
      tone: {
        ...prev.tone,
        [key]: value[0],
      },
    }))
  }

  const handleSaveName = () => {
    setLocalCMPData((prev) => ({
      ...prev,
      customName: tempName.trim(),
    }))
    setIsEditingName(false)
  }

  const handleCancelEdit = () => {
    setTempName(localCMPData.customName || safeOraData.name || "")
    setIsEditingName(false)
  }

  const generatePost = () => {
    const posts = [
      `Meet ${displayName}! This ${localCMPData.alignment} ${localCMPData.archetype} is ready to shake up the metaverse 🌟`,
      `${displayName} just dropped their CMP profile! ${localCMPData.tagline} ✨`,
      `Introducing ${displayName} - a ${localCMPData.archetype} with ${localCMPData.tone.creative}% creativity and ${localCMPData.tone.playful}% playfulness! 🎨`,
      `${displayName} is live on OraKit! Check out this ${localCMPData.alignment} personality 🚀`,
    ]
    return posts[Math.floor(Math.random() * posts.length)]
  }

  const handleSave = () => {
    const finalData = {
      ...localCMPData,
      customName: tempName.trim() || localCMPData.customName,
    }
    onSave(finalData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-white via-pink-50/30 to-purple-50/30 backdrop-blur-xl border-0 shadow-2xl">
        <DialogHeader className="pb-6 border-b border-white/20">
          <div className="flex items-center gap-6">
            {/* Ora Image */}
            <div className="w-20 h-20 rounded-3xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-xl flex-shrink-0">
              <img
                src={safeOraData.image || "/placeholder.svg"}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Name and Info */}
            <div className="flex-1 min-w-0">
              {isEditingName ? (
                <div className="flex items-center gap-3 mb-2">
                  <Input
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveName()
                      if (e.key === "Escape") handleCancelEdit()
                    }}
                    onBlur={handleSaveName}
                    placeholder={safeOraData.name}
                    className="text-2xl font-bold border-2 border-blue-300 focus:border-blue-500 rounded-xl"
                    autoFocus
                    maxLength={20}
                  />
                  <Button size="sm" onClick={handleSaveName} className="bg-green-500 hover:bg-green-600 text-white">
                    <Save className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3 mb-2 group/title">
                  <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    {displayName}
                  </DialogTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingName(true)}
                    className="opacity-0 group-hover/title:opacity-100 transition-opacity p-2 hover:bg-white/50 rounded-xl"
                  >
                    <Edit3 className="w-4 h-4 text-gray-500" />
                  </Button>
                </div>
              )}

              <div className="flex items-center gap-3 mb-3">
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 font-mono text-sm">
                  #{safeOraData.oraNumber}
                </Badge>
                <Badge className={`bg-gradient-to-r ${selectedArchetype.color} text-white border-0`}>
                  {selectedArchetype.label}
                </Badge>
                <Badge variant="outline" className="bg-white/60 border-white/30">
                  {localCMPData.alignment}
                </Badge>
              </div>

              <p className="text-gray-600 italic text-lg leading-relaxed">"{localCMPData.tagline}"</p>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2 bg-white/60 border-white/30">
                <Heart className="w-4 h-4" />
                Favorite
              </Button>
              <Button variant="outline" size="sm" className="gap-2 bg-white/60 border-white/30">
                <Copy className="w-4 h-4" />
                Share
              </Button>
              <a
                href={safeOraData.openseaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium bg-white/60 border border-white/30 rounded-lg hover:bg-white/80 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                OpenSea
              </a>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="profile" className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-5 bg-white/50 backdrop-blur-sm rounded-xl p-1 mb-6">
            <TabsTrigger
              value="profile"
              className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg"
            >
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="tone"
              className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg"
            >
              <Palette className="w-4 h-4" />
              Tone
            </TabsTrigger>
            <TabsTrigger
              value="lore"
              className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg"
            >
              <BookOpen className="w-4 h-4" />
              Lore
            </TabsTrigger>
            <TabsTrigger
              value="post"
              className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg"
            >
              <Share2 className="w-4 h-4" />
              Post
            </TabsTrigger>
            <TabsTrigger
              value="nft"
              className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg"
            >
              <Gem className="w-4 h-4" />
              NFT
            </TabsTrigger>
          </TabsList>

          <div className="overflow-auto max-h-[50vh]">
            <TabsContent value="profile" className="space-y-6 mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* CMP Overview */}
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
                        value={localCMPData.tagline}
                        onChange={(e) => setLocalCMPData((prev) => ({ ...prev, tagline: e.target.value }))}
                        placeholder="A catchy one-liner that defines this character..."
                        className="mt-1 bg-white/70 border-white/30 focus:bg-white/90"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-gray-700 mb-3 block">Archetype</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {archetypes.map((archetype) => {
                          const Icon = archetype.icon
                          const isSelected = localCMPData.archetype === archetype.id
                          return (
                            <button
                              key={archetype.id}
                              onClick={() => setLocalCMPData((prev) => ({ ...prev, archetype: archetype.id }))}
                              className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                                isSelected
                                  ? `bg-gradient-to-r ${archetype.color} text-white border-transparent shadow-lg scale-105`
                                  : "bg-white/60 border-white/30 hover:bg-white/80 hover:scale-102"
                              }`}
                            >
                              <Icon className={`w-5 h-5 mx-auto mb-1 ${isSelected ? "text-white" : "text-gray-600"}`} />
                              <div className={`text-xs font-semibold ${isSelected ? "text-white" : "text-gray-700"}`}>
                                {archetype.label}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Personality Snapshot */}
                <Card className="bg-white/60 backdrop-blur-sm border-white/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Sparkles className="w-5 h-5 text-purple-500" />
                      Personality Snapshot
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Dominant Traits */}
                    <div className="mb-6">
                      <Label className="text-sm font-semibold text-gray-700 mb-3 block">Dominant Traits</Label>
                      <div className="space-y-3">
                        {Object.entries(localCMPData.tone)
                          .sort(([, a], [, b]) => b - a)
                          .slice(0, 3)
                          .map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700 capitalize">{key}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${value}%` }}
                                  />
                                </div>
                                <span className="text-xs font-mono text-gray-500 w-8">{value}%</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Alignment Selector */}
                    <div>
                      <Label className="text-sm font-semibold text-gray-700 mb-3 block">Moral Alignment</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {alignments.map((alignment) => (
                          <button
                            key={alignment}
                            onClick={() => setLocalCMPData((prev) => ({ ...prev, alignment }))}
                            className={`p-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                              localCMPData.alignment === alignment
                                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105"
                                : "bg-white/60 border border-white/30 hover:bg-white/80 text-gray-700 hover:scale-102"
                            }`}
                          >
                            {alignment}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Personality Summary */}
                    <div className="mt-6 p-4 bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-xl border border-purple-100/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-4 h-4 text-purple-500" />
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">AI Summary</span>
                      </div>
                      <p className="text-sm text-gray-700 italic">
                        {(() => {
                          const topTrait = Object.entries(localCMPData.tone).reduce((a, b) =>
                            localCMPData.tone[a[0] as keyof typeof localCMPData.tone] >
                            localCMPData.tone[b[0] as keyof typeof localCMPData.tone]
                              ? a
                              : b,
                          )
                          const archetype = selectedArchetype.label.toLowerCase()
                          const alignment = localCMPData.alignment.toLowerCase()

                          return `A ${alignment} ${archetype} with strong ${topTrait[0]} tendencies (${topTrait[1]}%). This character brings a unique blend of ${localCMPData.archetype} energy to every interaction.`
                        })()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
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
                  {Object.entries(localCMPData.tone).map(([key, value]) => (
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
                    Character Lore
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={localCMPData.lore}
                    onChange={(e) => setLocalCMPData((prev) => ({ ...prev, lore: e.target.value }))}
                    placeholder="Write the backstory, personality traits, and defining characteristics..."
                    className="bg-white/70 border-white/30 focus:bg-white/90 min-h-32"
                  />
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

            <TabsContent value="post" className="space-y-6 mt-0">
              <Card className="bg-white/60 backdrop-blur-sm border-white/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Share2 className="w-5 h-5 text-green-500" />
                    Auto-Generated Post
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                    <p className="text-gray-800 font-medium">{generatePost()}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Share to Twitter
                    </Button>
                    <Button variant="outline" className="gap-2 bg-transparent">
                      <Copy className="w-4 h-4" />
                      Copy Text
                    </Button>
                    <Button variant="outline" className="gap-2 bg-transparent">
                      <Download className="w-4 h-4" />
                      Save Image
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="nft" className="space-y-6 mt-0">
              <Card className="bg-white/60 backdrop-blur-sm border-white/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Gem className="w-5 h-5 text-indigo-500" />
                    NFT Metadata
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Collection</Label>
                      <p className="text-gray-600">Sugartown Oras</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Token ID</Label>
                      <p className="text-gray-600 font-mono">#{safeOraData.oraNumber}</p>
                    </div>
                  </div>

                  {Object.keys(safeOraData.traits || {}).length > 0 && (
                    <div className="mt-6">
                      <Label className="text-sm font-semibold text-gray-700 mb-3 block">Traits</Label>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {Object.entries(safeOraData.traits || {}).map(([traitType, value]) => (
                          <div key={traitType} className="flex items-center justify-between p-2 bg-white/60 rounded-lg">
                            <span className="text-sm font-medium text-gray-700 capitalize">
                              {traitType.replace(/_/g, " ")}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {value}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>

        <Separator className="my-4" />

        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500 font-mono">Powered by OraKit CMP v1.0</div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white gap-2"
              onClick={handleSave}
            >
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
