import {
  IonAvatar,
  IonBackButton,
  IonBadge,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemGroup,
  IonItemDivider,
  IonLabel,
  IonList,
  IonNote,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { LazarilloMap } from '@lzdevelopers/lazarillo-maps'
import { layersOutline, refreshOutline, storefrontOutline } from 'ionicons/icons'
import { useEffect, useMemo, useState } from 'react'
import { Redirect } from 'react-router-dom'
import PerfBadge, { PerfHistory } from '../../components/perf/PerfBadge'
import { Place } from '../../components/places/Place'
import { API_KEY } from '../../config'
import { useParentPlace } from '../../contexts/ParentPlaceContext'
import { usePerfMetrics } from '../../contexts/PerfMetricsContext'
import './ScenarioPage.css'

/** Pull tags/categories off the raw record without leaking the cast everywhere. */
function tagsFor(place: Place): string[] {
  const raw = place as unknown as Record<string, any>
  const candidate = Array.isArray(raw.tags) ? raw.tags : Array.isArray(raw.categories) ? raw.categories : []
  return candidate.filter((t: unknown): t is string => typeof t === 'string')
}

interface Section {
  key: string
  label: string
  places: Place[]
}

function groupByPrimaryTag(places: Place[]): Section[] {
  const buckets = new Map<string, Place[]>()
  for (const p of places) {
    const tag = tagsFor(p)[0] ?? 'Other'
    if (!buckets.has(tag)) buckets.set(tag, [])
    buckets.get(tag)!.push(p)
  }
  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, list]) => ({
      key,
      label: key === 'Other' ? 'Other' : key,
      places: list.sort((a, b) =>
        (a.title?.default ?? '').toLowerCase().localeCompare((b.title?.default ?? '').toLowerCase())
      ),
    }))
}

/**
 * Scenario 1: render every sub-place of the selected parent, grouped by primary
 * tag. We instrument the `LazarilloMap.getSubPlaces` round-trip so PerfBadge
 * can show cache vs network performance side-by-side as the user revisits.
 */
const SubplacesListPage: React.FC = () => {
  const { parentPlace } = useParentPlace()
  const { record } = usePerfMetrics()
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | undefined>()

  useEffect(() => {
    if (!parentPlace) return
    void loadSubplaces(parentPlace.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentPlace?.id])

  async function loadSubplaces(parentId: string) {
    setLoading(true)
    setError(undefined)
    const startedAt = performance.now()
    try {
      const t0 = performance.now()
      await LazarilloMap.initializeLazarilloPlugin({ apiKey: API_KEY, place: parentId })
      const tInit = performance.now()
      // Opt into the slim projection — this screen only needs id/title/alias/inFloor/tags
      // for the grouped list. The bridge serves a ~80 KB JSON instead of 1.29 MB.
      const fetched = (await LazarilloMap.getSubPlaces(parentId, {
        fields: ['id', 'title', 'alias', 'inFloor', 'tags', 'hasBeacons'],
      })) as Place[] | null
      const tFetch = performance.now()
      const sorted = (fetched ?? []) as Place[]
      setPlaces(sorted)
      const tRender = performance.now()
      // [B-PROBE-TS] Mirror of the native [B-PROBE] split — gives us the gap between
      // native "call.resolve" returning and React state being committed. Without this
      // the only visible TS number is the badge total and we can't tell whether the
      // overhead is JSON.parse, Capacitor's webview message hop, or React work.
      console.log(
        `[B-PROBE-TS] init=${(tInit - t0).toFixed(0)}ms ` +
          `getSubPlaces=${(tFetch - tInit).toFixed(0)}ms ` +
          `setState+render=${(tRender - tFetch).toFixed(0)}ms ` +
          `places=${sorted.length} firstPlaceKeys=${Object.keys(sorted[0] ?? {}).length}`
      )
      record('subplaces_list', performance.now() - startedAt)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  const sections = useMemo(() => groupByPrimaryTag(places), [places])

  if (!parentPlace) return <Redirect to='/menu' />

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot='start'>
            <IonBackButton defaultHref='/menu' />
          </IonButtons>
          <IonTitle>Subplaces</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className='scenario-page'>
        <IonRefresher
          slot='fixed'
          onIonRefresh={async (e) => {
            await loadSubplaces(parentPlace.id)
            e.detail.complete()
          }}
        >
          <IonRefresherContent pullingIcon={refreshOutline} refreshingSpinner='dots' />
        </IonRefresher>

        <div className='scenario-page__header'>
          <IonText color='medium'>
            <p className='scenario-page__subtitle'>
              Sub-places of <strong>{parentPlace.title?.default}</strong>
            </p>
          </IonText>
          <div className='scenario-page__perf'>
            <PerfBadge name='subplaces_list' label='Subplaces ready' warnThresholdMs={400} />
            <PerfHistory name='subplaces_list' />
          </div>
        </div>

        {loading && places.length === 0 && (
          <div className='scenario-page__loading'>
            <IonSpinner name='dots' />
            <p>Loading sub-places…</p>
          </div>
        )}

        {error && (
          <div className='scenario-page__error'>
            <IonText color='danger'>
              <p>Failed to load: {error}</p>
            </IonText>
          </div>
        )}

        {!loading && !error && places.length === 0 && (
          <div className='scenario-page__empty'>
            <IonText color='medium'>
              <p>No sub-places returned for this parent.</p>
            </IonText>
          </div>
        )}

        <IonList>
          {sections.map((section) => (
            <IonItemGroup key={section.key}>
              <IonItemDivider sticky>
                <IonLabel>{section.label}</IonLabel>
                <IonBadge slot='end' color='medium'>{section.places.length}</IonBadge>
              </IonItemDivider>
              {section.places.map((place) => (
                <IonItem key={place.id}>
                  <IonAvatar slot='start' className='scenario-page__avatar'>
                    <IonIcon icon={storefrontOutline} />
                  </IonAvatar>
                  <IonLabel>
                    <h3>{place.title?.default ?? place.id}</h3>
                    {place.alias && <p>{place.alias}</p>}
                    {place.inFloor?.[0] && (
                      <IonNote>
                        <IonIcon icon={layersOutline} /> {place.inFloor[0]}
                      </IonNote>
                    )}
                  </IonLabel>
                </IonItem>
              ))}
            </IonItemGroup>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  )
}

export default SubplacesListPage
