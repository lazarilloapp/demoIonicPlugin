import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { LazarilloMap } from '@lzdevelopers/lazarillo-maps'
import type {
  MapReadyCallbackData,
  LazarilloMapConfig,
} from '@lzdevelopers/lazarillo-maps/dist/typings/definitions'
import { refreshOutline } from 'ionicons/icons'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Redirect, useLocation } from 'react-router-dom'
import PerfBadge, { PerfHistory } from '../../components/perf/PerfBadge'
import { Place } from '../../components/places/Place'
import { API_KEY } from '../../config'
import { useParentPlace } from '../../contexts/ParentPlaceContext'
import { usePerfMetrics } from '../../contexts/PerfMetricsContext'
import './ScenarioPage.css'

/**
 * Scenario: open the map for a parent place AND highlight a specific
 * sub-place — the real "tap on a store from a deep link" flow.
 *
 * Three timings exposed:
 *   map_with_place — `LazarilloMap.create` → `onMapReady`
 *   place_with_place_marker — addMarker round-trip after the map is up
 *   total_visible — sum of both, what the user actually waits for
 *
 * The bench harness drives the `?placeId=…` query param (resolved by
 * BenchAutoDrive); manual users can navigate from /menu after picking a
 * parent and the page falls back to the first sub-place.
 */
const MapWithPlacePage: React.FC = () => {
  const { parentPlace } = useParentPlace()
  const { record } = usePerfMetrics()
  const location = useLocation()
  const containerRef = useRef<HTMLElement>()
  const mapRef = useRef<LazarilloMap | null>(null)
  const [status, setStatus] = useState<'idle' | 'creating' | 'ready' | 'placing' | 'done' | 'error'>(
    'idle'
  )
  const [error, setError] = useState<string | undefined>()
  const [selectedPlace, setSelectedPlace] = useState<Place | undefined>()
  const [autoLaunched, setAutoLaunched] = useState(false)

  // The bench harness passes ?placeId=<id> via BenchAutoDrive's pre-resolve
  // step. We resolve the full Place for camera + marker positioning here.
  const placeIdFromUrl = new URLSearchParams(location.search).get('placeId') ?? undefined

  const resolvePlace = useCallback(async (): Promise<Place | undefined> => {
    if (!parentPlace) return undefined
    const sub = ((await LazarilloMap.getSubPlaces(parentPlace.id)) as Place[]) ?? []
    if (placeIdFromUrl) {
      const exact = sub.find((p) => p.id === placeIdFromUrl)
      if (exact) return exact
    }
    return sub[0]
  }, [parentPlace, placeIdFromUrl])

  const destroyExisting = useCallback(async () => {
    if (mapRef.current) {
      try {
        await mapRef.current.destroy()
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('destroy failed', err)
      }
      mapRef.current = null
    }
  }, [])

  const launch = useCallback(async () => {
    if (!parentPlace || !containerRef.current) return
    setStatus('creating')
    setError(undefined)
    await destroyExisting()

    const totalStart = performance.now()
    let place: Place | undefined
    try {
      place = await resolvePlace()
      if (!place) throw new Error('No sub-places available')
      setSelectedPlace(place)
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : String(err))
      return
    }

    const config: LazarilloMapConfig = {
      parentPlaceId: parentPlace.id,
      zoom: 18,
      center: { lat: place.lat, lng: place.lng },
      hideFloorSelector: true,
      hideZoomIn: true,
      hideZoomOut: true,
      hideZoomToLocation: true,
    }

    const mapId = `map-with-place-${Date.now()}`
    const mapStart = performance.now()
    try {
      await LazarilloMap.initializeLazarilloPlugin({ apiKey: API_KEY, place: parentPlace.id })
      const target = place
      mapRef.current = await LazarilloMap.create(
        {
          id: mapId,
          apiKey: API_KEY,
          element: containerRef.current,
          config,
          forceCreate: true,
        },
        async (data: MapReadyCallbackData) => {
          const mapMs = performance.now() - mapStart
          record('map_with_place', mapMs)
          if (data.error) {
            setStatus('error')
            setError(data.error)
            return
          }
          setStatus('placing')
          // Once the map is ready, drop a marker for the place. We measure
          // this separately because the marker round-trip is on top of the
          // cold-start budget — a deep-linked place open is map_ms + marker_ms.
          const markerStart = performance.now()
          try {
            await mapRef.current?.addMarker({
              coordinate: { lat: target.lat, lng: target.lng },
              title: target.title?.default ?? target.id,
              floorId: (target as any).floorId,
            })
            record('place_with_place_marker', performance.now() - markerStart)
            record('map_with_place_total', performance.now() - totalStart)
            setStatus('done')
          } catch (err) {
            setStatus('error')
            setError(err instanceof Error ? err.message : String(err))
          }
        }
      )
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : String(err))
    }
  }, [parentPlace, destroyExisting, record, resolvePlace])

  useEffect(() => {
    if (autoLaunched || !parentPlace || !containerRef.current) return
    setAutoLaunched(true)
    void launch()
  }, [autoLaunched, parentPlace, launch])

  useEffect(() => {
    return () => {
      void destroyExisting()
    }
  }, [destroyExisting])

  if (!parentPlace) return <Redirect to='/menu' />

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot='start'>
            <IonBackButton defaultHref='/menu' />
          </IonButtons>
          <IonTitle>Map + place</IonTitle>
          <IonButtons slot='end'>
            <IonButton
              aria-label='Rebuild'
              onClick={launch}
              disabled={status === 'creating' || status === 'placing'}
            >
              <IonIcon slot='icon-only' icon={refreshOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className='scenario-page'>
        <div className='scenario-page__header'>
          <IonText color='medium'>
            <p className='scenario-page__subtitle'>
              Map for <strong>{parentPlace.title?.default}</strong>{' '}
              {selectedPlace && (
                <>centered on <strong>{selectedPlace.title?.default ?? selectedPlace.id}</strong></>
              )}
              . Measures map create + per-place marker placement together.
            </p>
          </IonText>
          <div className='scenario-page__perf'>
            <PerfBadge name='map_with_place_total' label='Visible total' warnThresholdMs={1500} />
            <PerfHistory name='map_with_place_total' />
          </div>
        </div>

        <div className='scenario-page__map-container'>
          <capacitor-lazarillo-map ref={containerRef} class='scenario-page__map-element' />
          <div className='scenario-page__map-overlay'>
            <span>
              Status: <strong>{status}</strong>
            </span>
            {error && <span className='scenario-page__map-overlay-error'>{error}</span>}
          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default MapWithPlacePage
