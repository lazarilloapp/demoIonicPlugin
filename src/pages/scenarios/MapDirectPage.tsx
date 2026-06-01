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
import type { MapReadyCallbackData, LazarilloMapConfig } from '@lzdevelopers/lazarillo-maps/dist/typings/definitions'
import { refreshOutline } from 'ionicons/icons'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Redirect } from 'react-router-dom'
import PerfBadge, { PerfHistory } from '../../components/perf/PerfBadge'
import { API_KEY } from '../../config'
import { useParentPlace } from '../../contexts/ParentPlaceContext'
import { usePerfMetrics } from '../../contexts/PerfMetricsContext'
import './ScenarioPage.css'

/**
 * Scenario 3: skip the full ExploreContainer chrome and just create a map.
 *
 * The whole point is to measure `LazarilloMap.create() → onMapReady` cleanly,
 * without subplace lookups or marker mounting muddying the timing. Each call
 * to `launchMap()` uses a fresh map id so the native side actually rebuilds
 * — otherwise `forceCreate: false` would short-circuit.
 */
const MapDirectPage: React.FC = () => {
  const { parentPlace } = useParentPlace()
  const { record } = usePerfMetrics()
  const containerRef = useRef<HTMLElement>()
  const mapRef = useRef<LazarilloMap | null>(null)
  const [status, setStatus] = useState<'idle' | 'creating' | 'ready' | 'error'>('idle')
  const [error, setError] = useState<string | undefined>()
  const [autoLaunched, setAutoLaunched] = useState(false)

  const destroyExisting = useCallback(async () => {
    if (mapRef.current) {
      try {
        await mapRef.current.destroy()
      } catch (err) {
        // Best effort — a freshly-mounted page won't have a map yet.
        // eslint-disable-next-line no-console
        console.warn('destroy failed', err)
      }
      mapRef.current = null
    }
  }, [])

  const launchMap = useCallback(async () => {
    if (!parentPlace || !containerRef.current) return
    setStatus('creating')
    setError(undefined)
    await destroyExisting()

    const config: LazarilloMapConfig = {
      parentPlaceId: parentPlace.id,
      zoom: 17,
      center: { lat: parentPlace.lat, lng: parentPlace.lng },
      hideFloorSelector: true,
      hideZoomIn: true,
      hideZoomOut: true,
      hideZoomToLocation: true,
    }

    const mapId = `map-direct-${Date.now()}`
    const startedAt = performance.now()
    try {
      // initializeLazarilloPlugin is idempotent — we still pass `place` so the
      // bridge fix from A1 propagates the parent on subsequent runs.
      await LazarilloMap.initializeLazarilloPlugin({ apiKey: API_KEY, place: parentPlace.id })
      mapRef.current = await LazarilloMap.create(
        {
          id: mapId,
          apiKey: API_KEY,
          element: containerRef.current,
          config,
          forceCreate: true,
        },
        (data: MapReadyCallbackData) => {
          const elapsed = performance.now() - startedAt
          record('map_direct', elapsed)
          if (data.error) {
            setStatus('error')
            setError(data.error)
          } else {
            setStatus('ready')
          }
        }
      )
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : String(err))
    }
  }, [parentPlace, destroyExisting, record])

  // Auto-launch the first time the page mounts so the user sees the metric
  // without needing an extra tap. Subsequent runs are explicit (refresh icon).
  useEffect(() => {
    if (autoLaunched || !parentPlace || !containerRef.current) return
    setAutoLaunched(true)
    void launchMap()
  }, [autoLaunched, parentPlace, launchMap])

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
          <IonTitle>Map direct</IonTitle>
          <IonButtons slot='end'>
            <IonButton
              aria-label='Rebuild map'
              onClick={launchMap}
              disabled={status === 'creating'}
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
              Bare-bones map for <strong>{parentPlace.title?.default}</strong>. Tap the refresh
              icon to rebuild (forceCreate=true) and capture a new cold/warm time.
            </p>
          </IonText>
          <div className='scenario-page__perf'>
            <PerfBadge name='map_direct' label='Map ready' warnThresholdMs={1200} />
            <PerfHistory name='map_direct' />
          </div>
        </div>

        <div className='scenario-page__map-container'>
          {/* The native map renders behind the WebView, anchored to this element. */}
          <capacitor-lazarillo-map ref={containerRef} class='scenario-page__map-element' />
          <div className='scenario-page__map-overlay'>
            <span>Status: <strong>{status}</strong></span>
            {error && <span className='scenario-page__map-overlay-error'>{error}</span>}
          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default MapDirectPage
