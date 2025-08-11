import { type CMPData, DEFAULT_CMP_DATA } from "@/components/cmp-data-types"

const CMP_STORAGE_KEY = "orakit_cmp_data"

interface CMPStorage {
  [oraId: string]: CMPData
}

export const cmpStorage = {
  // Load all CMP data from localStorage
  loadAll(): CMPStorage {
    if (typeof window === "undefined") return {}

    try {
      const stored = localStorage.getItem(CMP_STORAGE_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error("Failed to load CMP data from localStorage:", error)
      return {}
    }
  },

  // Load CMP data for a specific Ora
  load(oraId: string): CMPData | null {
    const allData = this.loadAll()
    return allData[oraId] || null
  },

  // Save CMP data for a specific Ora
  save(oraId: string, cmpData: CMPData): void {
    if (typeof window === "undefined") return

    try {
      const allData = this.loadAll()
      allData[oraId] = cmpData
      localStorage.setItem(CMP_STORAGE_KEY, JSON.stringify(allData))
    } catch (error) {
      console.error("Failed to save CMP data to localStorage:", error)
    }
  },

  // Remove CMP data for a specific Ora
  remove(oraId: string): void {
    if (typeof window === "undefined") return

    try {
      const allData = this.loadAll()
      delete allData[oraId]
      localStorage.setItem(CMP_STORAGE_KEY, JSON.stringify(allData))
    } catch (error) {
      console.error("Failed to remove CMP data from localStorage:", error)
    }
  },

  // Get CMP data with fallback to defaults
  getOrDefault(oraId: string): CMPData {
    return this.load(oraId) || { ...DEFAULT_CMP_DATA }
  },

  // Clear all CMP data
  clear(): void {
    if (typeof window === "undefined") return

    try {
      localStorage.removeItem(CMP_STORAGE_KEY)
    } catch (error) {
      console.error("Failed to clear CMP data from localStorage:", error)
    }
  },
}
