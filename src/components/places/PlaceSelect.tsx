import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonSearchbar,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { useMemo, useState } from 'react'
import { Place } from './Place'

export const USER_POSITION_VALUE = '__user_position__'

interface PlaceSelectProps {
  places: Place[]
  value: string | undefined
  onChange: (value: string | undefined) => void
  label: string
  placeholder?: string
  allowUserPosition?: boolean
  getFloorName?: (floorId: string) => string
  disabled?: boolean
}

const PlaceSelect: React.FC<PlaceSelectProps> = ({
  places,
  value,
  onChange,
  label,
  placeholder = 'Select a place',
  allowUserPosition = false,
  getFloorName,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return places
    return places.filter((p) => {
      const title = p.title?.default?.toLowerCase() ?? ''
      const alias = p.alias?.toLowerCase() ?? ''
      const floor = p.inFloor?.[0] && getFloorName ? getFloorName(p.inFloor[0]).toLowerCase() : ''
      return title.includes(q) || alias.includes(q) || floor.includes(q)
    })
  }, [places, search, getFloorName])

  const renderSubtitle = (place: Place) => {
    const floor = place.inFloor?.[0] && getFloorName ? getFloorName(place.inFloor[0]) : 'Outdoor'
    const parts = [place.alias, floor].filter(Boolean) as string[]
    return parts.join(' · ')
  }

  const displayLabel = (() => {
    if (allowUserPosition && value === USER_POSITION_VALUE) return 'My current position'
    const selected = places.find((p) => p.id === value)
    return selected?.title?.default ?? placeholder
  })()

  const handlePick = (next: string | undefined) => {
    onChange(next)
    setOpen(false)
    setSearch('')
  }

  return (
    <>
      <IonItem
        button
        detail
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        <IonLabel>
          <p>{label}</p>
          <h3>{displayLabel}</h3>
        </IonLabel>
      </IonItem>

      <IonModal isOpen={open} onDidDismiss={() => setOpen(false)}>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot='start'>
              <IonButton onClick={() => setOpen(false)}>Cancel</IonButton>
            </IonButtons>
            <IonTitle>{label}</IonTitle>
          </IonToolbar>
          <IonToolbar>
            <IonSearchbar
              value={search}
              debounce={150}
              placeholder='Search by name, alias or floor'
              onIonInput={(e) => setSearch(e.detail.value ?? '')}
            />
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonList>
            {allowUserPosition && (
              <IonItem button onClick={() => handlePick(USER_POSITION_VALUE)}>
                <IonLabel>
                  <h3>My current position</h3>
                  <p>Use the device location</p>
                </IonLabel>
              </IonItem>
            )}
            {filtered.length === 0 && (
              <IonItem lines='none'>
                <IonLabel>
                  <IonText color='medium'>No places match "{search}"</IonText>
                </IonLabel>
              </IonItem>
            )}
            {filtered.map((place) => (
              <IonItem
                button
                key={place.id}
                onClick={() => handlePick(place.id)}
              >
                <IonLabel>
                  <h3>{place.title?.default ?? place.id}</h3>
                  <p>{renderSubtitle(place)}</p>
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        </IonContent>
      </IonModal>
    </>
  )
}

export default PlaceSelect
