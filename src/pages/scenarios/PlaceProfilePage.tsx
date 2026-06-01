import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonNote,
  IonPage,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { LazarilloMap } from '@lzdevelopers/lazarillo-maps'
import { refreshOutline } from 'ionicons/icons'
import { useEffect, useMemo, useState } from 'react'
import { Redirect } from 'react-router-dom'
import PerfBadge, { PerfHistory } from '../../components/perf/PerfBadge'
import PlaceProfile from '../../components/places/PlaceProfile'
import PlaceSelect from '../../components/places/PlaceSelect'
import { Place } from '../../components/places/Place'
import { API_KEY } from '../../config'
import { useParentPlace } from '../../contexts/ParentPlaceContext'
import { usePerfMetrics } from '../../contexts/PerfMetricsContext'
import './ScenarioPage.css'

/**
 * Scenario 2: fetch a single place's full profile.
 *
 * Loads the parent's subplaces (cheap if cached from scenario 1) for the
 * picker, then on selection fetches `getPublicPlace(id)` and measures the
 * single-id round-trip — this is the metric that benefits most from the
 * per-place cache layer being designed in B1/B2.
 */
const PlaceProfilePage: React.FC = () => {
  const { parentPlace } = useParentPlace()
  const { record } = usePerfMetrics()
  const [places, setPlaces] = useState<Place[]>([])
  const [selectedId, setSelectedId] = useState<string | undefined>()
  const [profile, setProfile] = useState<Place | undefined>()
  const [loadingList, setLoadingList] = useState(true)
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [error, setError] = useState<string | undefined>()

  useEffect(() => {
    if (!parentPlace) return
    void loadList(parentPlace.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentPlace?.id])

  async function loadList(parentId: string) {
    setLoadingList(true)
    setError(undefined)
    try {
      await LazarilloMap.initializeLazarilloPlugin({ apiKey: API_KEY, place: parentId })
      const sub = ((await LazarilloMap.getSubPlaces(parentId)) as Place[] | null) ?? []
      setPlaces(sub)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoadingList(false)
    }
  }

  async function loadProfile(placeId: string) {
    setLoadingProfile(true)
    setError(undefined)
    const startedAt = performance.now()
    try {
      const detail = (await LazarilloMap.getPublicPlace(placeId, API_KEY)) as Place
      setProfile(detail)
      record('place_profile', performance.now() - startedAt)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoadingProfile(false)
    }
  }

  const handleChange = (id: string | undefined) => {
    setSelectedId(id)
    setProfile(undefined)
    if (id) void loadProfile(id)
  }

  const getFloorName = useMemo(
    () => (floorId: string | undefined) => floorId ?? 'Outdoor',
    []
  )

  if (!parentPlace) return <Redirect to='/menu' />

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot='start'>
            <IonBackButton defaultHref='/menu' />
          </IonButtons>
          <IonTitle>Place profile</IonTitle>
          <IonButtons slot='end'>
            <IonButton
              disabled={!selectedId || loadingProfile}
              aria-label='Reload profile'
              onClick={() => selectedId && loadProfile(selectedId)}
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
              Pick a sub-place of <strong>{parentPlace.title?.default}</strong> — the request goes
              through <code>getPublicPlace</code>.
            </p>
          </IonText>
          <div className='scenario-page__perf'>
            <PerfBadge name='place_profile' label='Profile ready' warnThresholdMs={500} />
            <PerfHistory name='place_profile' />
          </div>
        </div>

        <div className='scenario-page__picker'>
          {loadingList ? (
            <IonItem lines='none'>
              <IonSpinner slot='start' name='dots' />
              <IonLabel>Loading sub-places…</IonLabel>
            </IonItem>
          ) : (
            <PlaceSelect
              places={places}
              value={selectedId}
              onChange={handleChange}
              label='Select a place'
              placeholder={places.length === 0 ? 'No places available' : 'Tap to pick a place'}
              getFloorName={getFloorName}
              disabled={places.length === 0}
            />
          )}
        </div>

        {error && (
          <div className='scenario-page__error'>
            <IonText color='danger'>
              <p>{error}</p>
            </IonText>
          </div>
        )}

        {loadingProfile && (
          <div className='scenario-page__loading'>
            <IonSpinner name='dots' />
            <IonNote>Fetching place detail…</IonNote>
          </div>
        )}

        {profile && !loadingProfile && (
          <PlaceProfile place={profile} getFloorName={getFloorName} />
        )}
      </IonContent>
    </IonPage>
  )
}

export default PlaceProfilePage
