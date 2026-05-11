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

interface ContainerProps {
  onSelected: (place: Place) => void
}

const SelectParentPlaceContainer: React.FC<ContainerProps> = ({ onSelected }) => {
  const [parentPlacesList, setParentPlacesList] = useState<Place[]>([])

  const apiKey = 'AiNFZyJdbr5qa2KHmj7e-dev'

  useEffect(() => {
    getParentPlaces()
  }, [])

  const onSelectParentPlace = (e: CustomEvent) => {
    const placeId = e.detail.value
    const parentPlace = parentPlacesList.find((p) => p.id === placeId)
    if (parentPlace) {
      onSelected(parentPlace)
    }
  }

  const getParentPlaces = async () => {
    await LazarilloMap.getAvailablePlaces(apiKey).then(async (response: any[]) => {
      setParentPlacesList(response)
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
