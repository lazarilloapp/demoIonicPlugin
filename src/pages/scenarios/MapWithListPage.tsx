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
  Marker,
  MapReadyCallbackData,
  LazarilloMapConfig,
} from '@lzdevelopers/lazarillo-maps/dist/typings/definitions'
import { refreshOutline } from 'ionicons/icons'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Redirect } from 'react-router-dom'
import PerfBadge, { PerfHistory } from '../../components/perf/PerfBadge'
import { Place } from '../../components/places/Place'
import { API_KEY } from '../../config'
import { useParentPlace } from '../../contexts/ParentPlaceContext'
import { usePerfMetrics } from '../../contexts/PerfMetricsContext'
import './ScenarioPage.css'

/**
 * Scenario: open the map for a parent place AND drop a marker for every
 * sub-place — the real "show me everything in this mall" flow.
 *
 * Four timings exposed:
 *   map_with_list — `LazarilloMap.create` → `onMapReady`
 *   list_fetch — `getSubPlaces` slim round-trip (cached after first run)
 *   list_markers — `addMarkers` batch round-trip (N native calls in flight)
 *   map_with_list_total — total user-visible time from page mount to last marker drawn
 *
 * The slim cache (Phase B1) should make `list_fetch` ≈ 2 ms on warm runs;
 * the marker batch is where the next bottleneck lives because each marker
 * goes through the Capacitor IPC.
 */
const MapWithListPage: React.FC = () => {
  const { parentPlace } = useParentPlace()
  const { record } = usePerfMetrics()
  const containerRef = useRef<HTMLElement>()
  const mapRef = useRef<LazarilloMap | null>(null)
  const [status, setStatus] = useState<
    'idle' | 'fetching' | 'creating' | 'ready' | 'placing' | 'done' | 'error'
  >('idle')
  const [error, setError] = useState<string | undefined>()
  const [markerCount, setMarkerCount] = useState(0)
  const [autoLaunched, setAutoLaunched] = useState(false)

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
    setStatus('fetching')
    setError(undefined)
    await destroyExisting()
    const totalStart = performance.now()

    // 1. Fetch the sub-places via the slim path so the byte cost is
    // minimized — markers only need id + coordinate + floor + title.
    let places: Place[] = []
    try {
      await LazarilloMap.initializeLazarilloPlugin({ apiKey: API_KEY, place: parentPlace.id })
      const fetchStart = performance.now()
      places = ((await LazarilloMap.getSubPlaces(parentPlace.id, {
        // `inFloor` is the SDK's actual field name (array of floor IDs the
        // place sits on); the marker layer expects `floorId` per place so
        // we pick inFloor[0] below. Requesting `floorId` here would yield
        // undefined and disable floor filtering on every marker.
        fields: ['id', 'title', 'lat', 'lng', 'inFloor'],
      })) as Place[]) ?? []
      record('list_fetch', performance.now() - fetchStart)
      setMarkerCount(places.length)
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : String(err))
      return
    }

    setStatus('creating')
    const config: LazarilloMapConfig = {
      parentPlaceId: parentPlace.id,
      zoom: 17,
      center: { lat: parentPlace.lat, lng: parentPlace.lng },
      hideFloorSelector: true,
      hideZoomIn: true,
      hideZoomOut: true,
      hideZoomToLocation: true,
    }

    const mapId = `map-with-list-${Date.now()}`
    const mapStart = performance.now()
    try {
      mapRef.current = await LazarilloMap.create(
        {
          id: mapId,
          apiKey: API_KEY,
          element: containerRef.current,
          config,
          forceCreate: true,
        },
        async (data: MapReadyCallbackData) => {
          record('map_with_list', performance.now() - mapStart)
          if (data.error) {
            setStatus('error')
            setError(data.error)
            return
          }
          setStatus('placing')
          // 2. Drop all markers. addMarkers fans out into N native calls;
          // we measure the entire batch round-trip so the bench sees
          // realistic numbers for "what the user actually waits for."
          const markersStart = performance.now()
          try {
            const markers: Marker[] = places.map((p) => ({
              coordinate: { lat: p.lat, lng: p.lng },
              title: p.title?.default ?? p.id,
              // `inFloor` is the SDK's per-place floor list (a place can sit
              // on more than one floor in a multi-level store). The Marker
              // API takes a single `floorId`; we pick the first floor so the
              // SDK hides the marker when the user is on a different floor.
              // Places without an inFloor stay outdoor (no filtering).
              floorId: p.inFloor?.[0],
            }))
            if (markers.length > 0) {
              await mapRef.current?.addMarkers(markers)
            }
            record('list_markers', performance.now() - markersStart)
            record('map_with_list_total', performance.now() - totalStart)
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
  }, [parentPlace, destroyExisting, record])

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
          <IonTitle>Map + list</IonTitle>
          <IonButtons slot='end'>
            <IonButton
              aria-label='Rebuild'
              onClick={launch}
              disabled={status === 'creating' || status === 'placing' || status === 'fetching'}
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
              Map for <strong>{parentPlace.title?.default}</strong> with all{' '}
              <strong>{markerCount}</strong> sub-places dropped as markers. Stresses the slim cache
              + the addMarkers batch IPC simultaneously.
            </p>
          </IonText>
          <div className='scenario-page__perf'>
            <PerfBadge name='map_with_list_total' label='Visible total' warnThresholdMs={2500} />
            <PerfHistory name='map_with_list_total' />
          </div>
        </div>

        <div className='scenario-page__map-container'>
          <capacitor-lazarillo-map ref={containerRef} class='scenario-page__map-element' />
          <div className='scenario-page__map-overlay'>
            <span>
              Status: <strong>{status}</strong>
            </span>
            {markerCount > 0 && status === 'done' && (
              <span>· {markerCount} markers</span>
            )}
            {error && <span className='scenario-page__map-overlay-error'>{error}</span>}
          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default MapWithListPage
