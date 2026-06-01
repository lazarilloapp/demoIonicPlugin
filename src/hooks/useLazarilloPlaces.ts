import { LazarilloMap } from '@lzdevelopers/lazarillo-maps'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { InnerFloor } from '../components/places/InnerFloor'
import { Place } from '../components/places/Place'

interface UseLazarilloPlacesResult {
  places: Place[]
  innerFloors: InnerFloor[]
  getFloorName: (floorId: string | undefined) => string
  ready: boolean
  error?: string
}

export function useLazarilloPlaces(
  parentPlace: Place,
  apiKey: string
): UseLazarilloPlacesResult {
  const [places, setPlaces] = useState<Place[]>([])
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)

  const innerFloors = useMemo<InnerFloor[]>(() => {
    const out: InnerFloor[] = []
    for (const [key, value] of Object.entries(parentPlace.innerFloors ?? {})) {
      out.push({ ...value, key })
    }
    return out
  }, [parentPlace])

  useEffect(() => {
    let cancelled = false
    async function init() {
      try {
        await LazarilloMap.initializeLazarilloPlugin({
          apiKey,
          place: parentPlace.id,
        })
        const sub = (await LazarilloMap.getSubPlaces(parentPlace.id)) ?? []
        const sorted = [...sub].sort((a: Place, b: Place) =>
          a.title.default.toLowerCase().localeCompare(b.title.default.toLowerCase())
        )
        if (cancelled) return
        setPlaces(sorted)
        setReady(true)
      } catch (e: unknown) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : String(e))
        setReady(true)
      }
    }
    init()
    return () => {
      cancelled = true
    }
  }, [apiKey, parentPlace.id])

  const getFloorName = useCallback(
    (floorId: string | undefined) => {
      if (!floorId) return 'Outdoor'
      return innerFloors.find((f) => f.key === floorId)?.title ?? 'Outdoor'
    },
    [innerFloors]
  )

  return { places, innerFloors, getFloorName, ready, error }
}
