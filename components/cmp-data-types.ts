// Create a shared types file for better type management
export interface CMPData {
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

export interface Ora {
  name: string
  oraNumber: string
  image: string
  traits: Record<string, string>
  openseaUrl: string
}

export const DEFAULT_CMP_DATA: CMPData = {
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
}

export const getAlignmentColor = (alignment: string): string => {
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

export const getToneGlow = (tone: CMPData["tone"]): string => {
  // Create a subtle glow based on dominant personality traits
  const dominant = Object.entries(tone).reduce((a, b) =>
    tone[a[0] as keyof typeof tone] > tone[b[0] as keyof typeof tone] ? a : b,
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
