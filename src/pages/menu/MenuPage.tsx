import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonNote,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import {
  bookOutline,
  flashOutline,
  list,
  locationOutline,
  mapOutline,
  personCircleOutline,
  refreshOutline,
} from 'ionicons/icons'
import { useHistory } from 'react-router-dom'
import SelectParentPlaceContainer from '../../components/select/SelectParentPlaceContainer'
import PerfBadge, { PerfHistory } from '../../components/perf/PerfBadge'
import { useParentPlace } from '../../contexts/ParentPlaceContext'
import { usePerfMetrics } from '../../contexts/PerfMetricsContext'
import './MenuPage.css'

interface ScenarioCardProps {
  icon: string
  title: string
  subtitle: string
  description: string
  metricName: string
  metricLabel: string
  metricThreshold?: number
  routerLink: string
  disabled: boolean
}

const ScenarioCard: React.FC<ScenarioCardProps> = ({
  icon,
  title,
  subtitle,
  description,
  metricName,
  metricLabel,
  metricThreshold,
  routerLink,
  disabled,
}) => (
  <IonCard
    button={!disabled}
    disabled={disabled}
    routerLink={disabled ? undefined : routerLink}
    routerDirection='forward'
    className='scenario-card'
  >
    <IonCardHeader>
      <div className='scenario-card__heading'>
        <IonIcon icon={icon} className='scenario-card__icon' aria-hidden='true' />
        <div>
          <IonCardSubtitle>{subtitle}</IonCardSubtitle>
          <IonCardTitle>{title}</IonCardTitle>
        </div>
      </div>
    </IonCardHeader>
    <IonCardContent>
      <p>{description}</p>
      <div className='scenario-card__metrics'>
        <PerfBadge name={metricName} label={metricLabel} warnThresholdMs={metricThreshold} />
        <PerfHistory name={metricName} />
      </div>
    </IonCardContent>
  </IonCard>
)

const MenuPage: React.FC = () => {
  const history = useHistory()
  const { parentPlace, setParentPlace } = useParentPlace()
  const { reset, record } = usePerfMetrics()

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            <IonIcon icon={flashOutline} className='menu-title__icon' />
            Cache &amp; Preload Lab
          </IonTitle>
          <IonButtons slot='end'>
            <IonButton
              aria-label='Reset perf history'
              onClick={() => reset()}
              title='Clear all timing samples'
            >
              <IonIcon slot='icon-only' icon={refreshOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className='menu-page'>
        <IonText>
          <h2 className='menu-page__heading'>What do you want to benchmark?</h2>
          <p className='menu-page__hint'>
            Pick a parent place to populate the SDK, then launch any scenario. The badge on each
            card shows the latest end-to-end time, so cache wins (lower numbers) and stale-state
            regressions are visible without reading logs.
          </p>
        </IonText>

        <IonCard className='menu-page__parent-card'>
          <IonCardHeader>
            <IonCardTitle>Parent place</IonCardTitle>
            <IonCardSubtitle>Selecting it triggers the SDK warm-up</IonCardSubtitle>
          </IonCardHeader>
          <IonCardContent>
            {parentPlace ? (
              <IonItem lines='none' className='menu-page__parent-current'>
                <IonIcon icon={locationOutline} slot='start' aria-hidden='true' />
                <IonLabel>
                  <h3>{parentPlace.title?.default ?? parentPlace.id}</h3>
                  <IonNote>{parentPlace.id}</IonNote>
                </IonLabel>
                <IonButton
                  fill='clear'
                  size='small'
                  onClick={() => setParentPlace(undefined)}
                  slot='end'
                >
                  Change
                </IonButton>
              </IonItem>
            ) : (
              <SelectParentPlaceContainer
                onSelected={setParentPlace}
                onMetric={record}
              />
            )}
            <PerfBadge name='available_places' label='Parent list fetch' warnThresholdMs={1000} />
          </IonCardContent>
        </IonCard>

        <div className='menu-page__cards'>
          <ScenarioCard
            icon={list}
            subtitle='Scenario 1'
            title='Subplaces list'
            description='Loads the parent’s sub-places and groups them by tag — exercises subplace cache hits on repeat visits.'
            metricName='subplaces_list'
            metricLabel='List ready'
            metricThreshold={400}
            routerLink='/scenario/list'
            disabled={!parentPlace}
          />
          <ScenarioCard
            icon={personCircleOutline}
            subtitle='Scenario 2'
            title='Place profile'
            description='Opens a specific place’s profile, exercising the per-place getPublicPlace cache for a single id.'
            metricName='place_profile'
            metricLabel='Profile ready'
            metricThreshold={500}
            routerLink='/scenario/profile'
            disabled={!parentPlace}
          />
          <ScenarioCard
            icon={mapOutline}
            subtitle='Scenario 3'
            title='Map direct'
            description='Skips the marker UI: just creates the map with the chosen parent so you can see the raw cold/warm start time.'
            metricName='map_direct'
            metricLabel='Map ready'
            metricThreshold={1200}
            routerLink='/scenario/map'
            disabled={!parentPlace}
          />
          <ScenarioCard
            icon={locationOutline}
            subtitle='Scenario 4'
            title='Map + place'
            description='Opens the map and drops a marker for one sub-place — the deep-linked store flow. Measures create + addMarker together.'
            metricName='map_with_place_total'
            metricLabel='Visible total'
            metricThreshold={1500}
            routerLink='/scenario/map-with-place'
            disabled={!parentPlace}
          />
          <ScenarioCard
            icon={list}
            subtitle='Scenario 5'
            title='Map + list'
            description='Opens the map and drops markers for every sub-place. Stresses slim getSubPlaces + addMarkers batch IPC.'
            metricName='map_with_list_total'
            metricLabel='Visible total'
            metricThreshold={2500}
            routerLink='/scenario/map-with-list'
            disabled={!parentPlace}
          />
        </div>

        <IonItem
          lines='none'
          className='menu-page__legacy-link'
          button
          detail
          onClick={() => history.push('/home')}
        >
          <IonIcon icon={bookOutline} slot='start' aria-hidden='true' />
          <IonLabel>
            <h3>Original demo</h3>
            <p>The full ExploreContainer with all map features</p>
          </IonLabel>
        </IonItem>
      </IonContent>

      <IonFooter>
        <IonToolbar>
          <IonNote className='menu-page__footer-note'>
            Targets: list &lt;400ms · profile &lt;500ms · map &lt;1200ms (warm)
          </IonNote>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  )
}

export default MenuPage
