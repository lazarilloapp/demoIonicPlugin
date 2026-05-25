import { createContext, ReactNode, useContext, useMemo, useState } from 'react'
import { Place } from '../components/places/Place'

interface ParentPlaceContextValue {
  parentPlace: Place | undefined
  setParentPlace: (place: Place | undefined) => void
}

const ParentPlaceContext = createContext<ParentPlaceContextValue | undefined>(undefined)

/**
 * Shares the currently selected parent place across the menu and its scenario
 * routes. The scenarios need a parent to drive subplace queries; routing via
 * URL params would force us to round-trip the full Place object as JSON, so
 * we keep it in memory instead.
 */
export const ParentPlaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [parentPlace, setParentPlace] = useState<Place | undefined>(undefined)
  const value = useMemo(() => ({ parentPlace, setParentPlace }), [parentPlace])
  return <ParentPlaceContext.Provider value={value}>{children}</ParentPlaceContext.Provider>
}

export function useParentPlace(): ParentPlaceContextValue {
  const ctx = useContext(ParentPlaceContext)
  if (!ctx) throw new Error('useParentPlace must be used within a ParentPlaceProvider')
  return ctx
}
