import './SelectParentPlaceContainer.css'

import {
  IonButton,
  IonCol,
  IonGrid,
  IonRow,
  IonSelect,
  IonSelectOption,
  useIonViewWillEnter,
} from '@ionic/react'
import { useState } from 'react'
import ExploreContainer from '../explore/ExploreContainer'

import { Place } from '../places/Place'
import { LazarilloMap } from '@lzdevelopers/lazarillo-maps'

interface ContainerProps {}

const SelectParentPlaceContainer: React.FC<ContainerProps> = () => {
  const [showExplore, setShowExplore] = useState(false)
  const [parentPlacesList, setParentPlacesList] = useState<Place[]>([])
  const [parentPlaceSelected, setParentPlace] = useState<Place>()

  const apiKey = process.env.REACT_APP_YOUR_API_KEY_HERE
    ? process.env.REACT_APP_YOUR_API_KEY_HERE
    : ''

  useIonViewWillEnter(() => {
    getParentPlaces()
  })

  const showParentPlaceMap = (e: CustomEvent) => {
    const placeId = e.detail.value
    console.log('num of places', parentPlacesList.length)
    console.log('selected place id: ', placeId)
    const parentPlace = parentPlacesList.find((p) => p.id === placeId)
    setParentPlace(parentPlace)
  }

  const getParentPlaces = async () => {
    await LazarilloMap.getAvailablePlaces(apiKey).then(async (response: any[]) => {
      setParentPlacesList(response)
    })
  }

  return showExplore ? (
    <ExploreContainer place={parentPlaceSelected} />
  ) : (
    <IonGrid>
      <IonCol>
        <IonRow className='center-row'>
          Select a parent place to use the map:
        </IonRow>
        <IonRow className='center-row'>
          <IonSelect
            placeholder='Select place'
            onIonChange={showParentPlaceMap}
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
        <IonButton onClick={() => setShowExplore(true)}>Show Map</IonButton>
      </IonCol>
    </IonGrid>
  )
}
export default SelectParentPlaceContainer
