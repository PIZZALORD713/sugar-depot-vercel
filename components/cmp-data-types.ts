export interface CMPData {
  customName?: string
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
  memoryLog: Array<{
    id: string
    timestamp: string
    content: string
    category: string
  }>
}

export interface OraWithCMP {
  oraId: string
  image: string
  traits: Record<string, any>
  cmp: CMPData
}

export interface ExportData {
  oraId: string
  image: string
  traits: Record<string, any>
  cmp: CMPData
}

export interface CMPCharacter {
  id: string
  name: string
  class: string
  level: number
  experience: number
  hitPoints: {
    current: number
    maximum: number
    temporary: number
  }
  armorClass: number
  proficiencyBonus: number
  speed: number
  stats: {
    strength: number
    dexterity: number
    constitution: number
    intelligence: number
    wisdom: number
    charisma: number
  }
  savingThrows: Record<string, number>
  skills: Record<string, number>
  equipment: Array<{
    id: string
    name: string
    quantity: number
    description?: string
  }>
  spells: Array<{
    id: string
    name: string
    level: number
    school: string
    description: string
  }>
  features: Array<{
    id: string
    name: string
    description: string
    source: string
  }>
  notes: Array<{
    id: string
    title: string
    content: string
    category: string
    timestamp: string
  }>
  background: string
  race: string
  alignment: string
}
