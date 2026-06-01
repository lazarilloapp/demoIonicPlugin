import './SelectParentPlaceContainer.css'

import {
  IonCol,
  IonGrid,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonText,
} from '@ionic/react'
import { useEffect, useState } from 'react'

import { Place } from '../places/Place'
import { LazarilloMap } from '@lzdevelopers/lazarillo-maps'
import { API_KEY } from '../../config'

interface ContainerProps {
  onSelected: (place: Place) => void
  /**
   * Optional perf hook: invoked once the parent-places fetch completes,
   * with the round-trip duration in ms. Used by the Cache & Preload Lab
   * menu to surface live timing — /home ignores it.
   */
  onMetric?: (name: string, durationMs: number) => void
}

const SelectParentPlaceContainer: React.FC<ContainerProps> = ({ onSelected, onMetric }) => {
  const [parentPlacesList, setParentPlacesList] = useState<Place[]>([])

  const apiKey = API_KEY

  useEffect(() => {
    getParentPlaces()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onSelectParentPlace = (e: CustomEvent) => {
    const placeId = e.detail.value
    const parentPlace = parentPlacesList.find((p) => p.id === placeId)
    if (parentPlace) {
      onSelected(parentPlace)
    }
  }

  const getParentPlaces = async () => {
    const startedAt = performance.now()
    await LazarilloMap.getAvailablePlaces(apiKey).then(async (response: any[]) => {
      setParentPlacesList(response)
      onMetric?.('available_places', performance.now() - startedAt)
    })
  }

  return (
    <IonGrid>
      <IonCol>
        <IonRow className='center-row'>
          <IonText>Select a parent place to use the map:</IonText>
        </IonRow>
        <IonRow className='center-row'>
          <IonSelect
            placeholder='Select place'
            interface='popover'
            onIonChange={onSelectParentPlace}
          >
            {parentPlacesList.map((place) => {
              return (
                <IonSelectOption key={place.id} value={place.id}>
                  {place.title.default}
                </IonSelectOption>
              )
            })}
          </IonSelect>
        </IonRow>
      </IonCol>
    </IonGrid>
  )
}
export default SelectParentPlaceContainer
