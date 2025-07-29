import { create } from "zustand"
import { persist } from "zustand/middleware"

interface Ora {
  name: string
  oraNumber: string
  image: string
  traits: Record<string, string>
  openseaUrl: string
}

interface FilterState {
  // Search and filters
  searchNumber: string
  filters: Record<string, string[]>
  showFavoritesOnly: boolean

  // Favorites (persisted)
  favorites: Set<string>

  // Actions
  setSearchNumber: (number: string) => void
  setFilters: (filters: Record<string, string[]>) => void
  clearTraitFilter: (traitType: string) => void
  clearAllFilters: () => void
  setShowFavoritesOnly: (show: boolean) => void
  addFavorite: (id: string) => void
  removeFavorite: (id: string) => void
  toggleFavorite: (oraNumber: string) => void
  isFavorite: (oraNumber: string) => boolean

  // Computed
  getFilteredOras: (oras: Ora[]) => Ora[]
  getAvailableTraits: (oras: Ora[]) => Record<string, string[]>
}

export const useFilterStore = create<FilterState>()(
  persist(
    (set, get) => ({
      // Initial state
      searchNumber: "",
      filters: {},
      showFavoritesOnly: false,
      favorites: new Set<string>(),

      // Actions
      setSearchNumber: (number: string) => {
        set({ searchNumber: number })
      },

      setFilters: (filters: Record<string, string[]>) => {
        set({ filters })
      },

      clearTraitFilter: (traitType: string) => {
        set((state) => {
          const newFilters = { ...state.filters }
          delete newFilters[traitType]
          return { filters: newFilters }
        })
      },

      clearAllFilters: () => {
        set({
          searchNumber: "",
          filters: {},
          showFavoritesOnly: false,
        })
      },

      setShowFavoritesOnly: (show: boolean) => {
        set({ showFavoritesOnly: show })
      },

      addFavorite: (id: string) => {
        set((state) => ({
          favorites: new Set([...state.favorites, id]),
        }))
      },

      removeFavorite: (id: string) => {
        set((state) => {
          const newFavorites = new Set(state.favorites)
          newFavorites.delete(id)
          return { favorites: newFavorites }
        })
      },

      toggleFavorite: (oraNumber: string) => {
        set((state) => {
          const newFavorites = new Set(state.favorites)
          if (newFavorites.has(oraNumber)) {
            newFavorites.delete(oraNumber)
          } else {
            newFavorites.add(oraNumber)
          }
          return { favorites: newFavorites }
        })
      },

      isFavorite: (oraNumber: string) => {
        return get().favorites.has(oraNumber)
      },

      // Computed functions
      getFilteredOras: (oras: Ora[]) => {
        const state = get()
        let filtered = [...oras]

        // Search by number (overrides trait filters)
        if (state.searchNumber.trim()) {
          const searchTerm = state.searchNumber.trim().toLowerCase()
          filtered = filtered.filter(
            (ora) => ora.oraNumber.toLowerCase().includes(searchTerm) || ora.name.toLowerCase().includes(searchTerm),
          )
        } else {
          // Apply trait filters only if no search
          Object.entries(state.filters).forEach(([traitType, values]) => {
            if (values.length > 0) {
              filtered = filtered.filter((ora) => {
                const oraTraitValue = ora.traits[traitType]
                return oraTraitValue && values.includes(oraTraitValue)
              })
            }
          })
        }

        // Apply favorites filter
        if (state.showFavoritesOnly) {
          filtered = filtered.filter((ora) => state.favorites.has(ora.oraNumber))
        }

        return filtered
      },

      getAvailableTraits: (oras: Ora[]) => {
        const traitMap: Record<string, Set<string>> = {}

        oras.forEach((ora) => {
          Object.entries(ora.traits).forEach(([traitType, value]) => {
            if (!traitMap[traitType]) {
              traitMap[traitType] = new Set()
            }
            if (value && value.trim()) {
              traitMap[traitType].add(value)
            }
          })
        })

        // Convert Sets to sorted arrays
        const result: Record<string, string[]> = {}
        Object.entries(traitMap).forEach(([traitType, valueSet]) => {
          result[traitType] = Array.from(valueSet).sort()
        })

        return result
      },
    }),
    {
      name: "ora-filters",
      partialize: (state) => ({
        favorites: Array.from(state.favorites), // Convert Set to Array for persistence
      }),
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.favorites)) {
          // Convert Array back to Set after rehydration
          state.favorites = new Set(state.favorites as string[])
        }
      },
    },
  ),
)
