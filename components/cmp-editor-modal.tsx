"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Save, X } from "lucide-react"
import type { CMPData } from "./cmp-data-types"

interface CMPEditorModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CMPData) => void
  initialData?: CMPData
  oraData: {
    id: string
    name: string
    image: string
  }
}

const archetypes = [
  "The Hero",
  "The Mentor",
  "The Ally",
  "The Guardian",
  "The Trickster",
  "The Shapeshifter",
  "The Shadow",
  "The Threshold Guardian",
  "The Herald",
  "The Creator",
  "The Innocent",
  "The Explorer",
  "The Sage",
  "The Outlaw",
  "The Magician",
  "The Regular Person",
  "The Lover",
  "The Jester",
  "The Caregiver",
  "The Ruler",
]

const alignments = [
  "Lawful Good",
  "Neutral Good",
  "Chaotic Good",
  "Lawful Neutral",
  "True Neutral",
  "Chaotic Neutral",
  "Lawful Evil",
  "Neutral Evil",
  "Chaotic Evil",
]

export function CMPEditorModal({ isOpen, onClose, onSave, initialData, oraData }: CMPEditorModalProps) {
  const [formData, setFormData] = useState<CMPData>({
    customName: "",
    archetype: "",
    alignment: "",
    background: "",
    personality: "",
    goals: "",
    relationships: "",
    secrets: "",
    notes: "",
  })

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    } else {
      setFormData({
        customName: "",
        archetype: "",
        alignment: "",
        background: "",
        personality: "",
        goals: "",
        relationships: "",
        secrets: "",
        notes: "",
      })
    }
  }, [initialData, isOpen])

  const handleSave = () => {
    onSave(formData)
  }

  const handleInputChange = (field: keyof CMPData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const displayName = formData.customName || oraData.name

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={oraData.image || "/placeholder.svg"} alt={displayName} />
            <AvatarFallback>#{oraData.id}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <DialogTitle className="text-2xl">{displayName}</DialogTitle>
            <p className="text-sm text-muted-foreground">Character Management Profile Editor</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <Tabs defaultValue="identity" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="identity">Identity</TabsTrigger>
            <TabsTrigger value="background">Background</TabsTrigger>
            <TabsTrigger value="relationships">Relationships</TabsTrigger>
            <TabsTrigger value="secrets">Secrets & Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="identity" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customName">Character Name</Label>
                <Input
                  id="customName"
                  placeholder={`Ora #${oraData.id}`}
                  value={formData.customName || ""}
                  onChange={(e) => handleInputChange("customName", e.target.value)}
                  maxLength={30}
                />
                <p className="text-xs text-muted-foreground">{formData.customName?.length || 0}/30 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="archetype">Archetype</Label>
                <Select
                  value={formData.archetype || ""}
                  onValueChange={(value) => handleInputChange("archetype", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an archetype" />
                  </SelectTrigger>
                  <SelectContent>
                    {archetypes.map((archetype) => (
                      <SelectItem key={archetype} value={archetype}>
                        {archetype}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="alignment">Alignment</Label>
                <Select
                  value={formData.alignment || ""}
                  onValueChange={(value) => handleInputChange("alignment", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select alignment" />
                  </SelectTrigger>
                  <SelectContent>
                    {alignments.map((alignment) => (
                      <SelectItem key={alignment} value={alignment}>
                        {alignment}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="personality">Personality Traits</Label>
              <Textarea
                id="personality"
                placeholder="Describe the character's personality, quirks, and mannerisms..."
                value={formData.personality || ""}
                onChange={(e) => handleInputChange("personality", e.target.value)}
                rows={4}
              />
            </div>
          </TabsContent>

          <TabsContent value="background" className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="background">Background Story</Label>
              <Textarea
                id="background"
                placeholder="Tell the character's origin story, history, and formative experiences..."
                value={formData.background || ""}
                onChange={(e) => handleInputChange("background", e.target.value)}
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goals">Goals & Motivations</Label>
              <Textarea
                id="goals"
                placeholder="What drives this character? What are their short-term and long-term goals?"
                value={formData.goals || ""}
                onChange={(e) => handleInputChange("goals", e.target.value)}
                rows={4}
              />
            </div>
          </TabsContent>

          <TabsContent value="relationships" className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="relationships">Relationships & Connections</Label>
              <Textarea
                id="relationships"
                placeholder="Describe relationships with other characters, family, friends, enemies, mentors..."
                value={formData.relationships || ""}
                onChange={(e) => handleInputChange("relationships", e.target.value)}
                rows={6}
              />
            </div>
          </TabsContent>

          <TabsContent value="secrets" className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="secrets">Secrets & Hidden Information</Label>
              <Textarea
                id="secrets"
                placeholder="What secrets does this character hold? Hidden knowledge, past mistakes, or concealed abilities..."
                value={formData.secrets || ""}
                onChange={(e) => handleInputChange("secrets", e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any other important details, plot hooks, or reminders about this character..."
                value={formData.notes || ""}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={4}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save CMP Data
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
