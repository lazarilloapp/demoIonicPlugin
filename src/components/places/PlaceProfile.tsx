import {
  IonAccordion,
  IonAccordionGroup,
  IonChip,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonText,
} from '@ionic/react'
import { bluetooth, businessOutline, layersOutline, locationOutline, pricetagsOutline } from 'ionicons/icons'
import { Place } from './Place'

interface PlaceProfileProps {
  place: Place
  getFloorName?: (floorId: string | undefined) => string
}

// Place data from the SDK is loosely typed (`any`). We surface a curated
// set of well-known fields, then expose the full payload for inspection.
const PlaceProfile: React.FC<PlaceProfileProps> = ({ place, getFloorName }) => {
  const raw = place as Record<string, any>
  const description: string | undefined =
    raw.description?.default ?? raw.description ?? undefined
  const tags: string[] | undefined =
    Array.isArray(raw.tags) ? raw.tags : Array.isArray(raw.categories) ? raw.categories : undefined
  const imageUrl: string | undefined =
    raw.imageUrl ?? raw.image ?? raw.photoUrl ?? raw.logo ?? undefined
  const phone: string | undefined = raw.phone ?? raw.telephone
  const website: string | undefined = raw.website ?? raw.url
  const floorName = place.inFloor?.[0] ? getFloorName?.(place.inFloor[0]) : 'Outdoor'

  return (
    <div className='place-profile'>
      {imageUrl && (
        <div className='place-profile__hero'>
          <img src={imageUrl} alt={place.title?.default ?? place.id} loading='lazy' />
        </div>
      )}

      <div className='place-profile__header ion-padding'>
        <h2>{place.title?.default ?? place.id}</h2>
        {place.alias && (
          <IonText color='medium'>
            <p className='place-profile__alias'>{place.alias}</p>
          </IonText>
        )}
        {description && (
          <IonText>
            <p className='place-profile__description'>{description}</p>
          </IonText>
        )}
        {tags && tags.length > 0 && (
          <div className='place-profile__tags'>
            {tags.map((t) => (
              <IonChip key={t} color='primary' outline>
                <IonIcon icon={pricetagsOutline} />
                <IonLabel>{t}</IonLabel>
              </IonChip>
            ))}
          </div>
        )}
      </div>

      <IonList lines='full'>
        <IonItem>
          <IonIcon icon={layersOutline} slot='start' aria-hidden='true' />
          <IonLabel>
            <p>Floor</p>
            <h3>{floorName}</h3>
          </IonLabel>
        </IonItem>
        <IonItem>
          <IonIcon icon={locationOutline} slot='start' aria-hidden='true' />
          <IonLabel>
            <p>Coordinates</p>
            <h3>{place.lat?.toFixed(6)}, {place.lng?.toFixed(6)}</h3>
          </IonLabel>
        </IonItem>
        {place.address && (
          <IonItem>
            <IonIcon icon={businessOutline} slot='start' aria-hidden='true' />
            <IonLabel>
              <p>Address</p>
              <h3>{place.address}</h3>
            </IonLabel>
          </IonItem>
        )}
        {phone && (
          <IonItem>
            <IonLabel>
              <p>Phone</p>
              <h3>{phone}</h3>
            </IonLabel>
          </IonItem>
        )}
        {website && (
          <IonItem href={website} target='_blank' rel='noopener noreferrer'>
            <IonLabel>
              <p>Website</p>
              <h3>{website}</h3>
            </IonLabel>
          </IonItem>
        )}
        {place.externalId && (
          <IonItem>
            <IonLabel>
              <p>External ID</p>
              <h3>{place.externalId}</h3>
            </IonLabel>
          </IonItem>
        )}
        {place.hasBeacons && (
          <IonItem>
            <IonIcon icon={bluetooth} slot='start' color='primary' aria-hidden='true' />
            <IonLabel>
              <h3>Beacons available</h3>
            </IonLabel>
          </IonItem>
        )}
        <IonItem>
          <IonLabel>
            <p>Place ID</p>
            <IonNote>{place.id}</IonNote>
          </IonLabel>
        </IonItem>
      </IonList>

      <IonAccordionGroup>
        <IonAccordion value='raw'>
          <IonItem slot='header' color='light'>
            <IonLabel>Raw place data</IonLabel>
          </IonItem>
          <div className='ion-padding' slot='content'>
            <pre className='place-profile__raw'>{JSON.stringify(raw, null, 2)}</pre>
          </div>
        </IonAccordion>
      </IonAccordionGroup>
    </div>
  )
}

export default PlaceProfile
