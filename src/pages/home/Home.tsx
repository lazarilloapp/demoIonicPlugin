import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { arrowBackOutline, bagOutline } from 'ionicons/icons'
import { useState } from 'react'
import ExploreContainer from '../../components/explore/ExploreContainer'
import { Place } from '../../components/places/Place'
import SelectParentPlaceContainer from '../../components/select/SelectParentPlaceContainer'
import './Home.css'

const Home: React.FC = () => {
  const [parentPlace, setParentPlace] = useState<Place>()

  const handleSelected = (place: Place) => {
    setParentPlace(place)
  }

  const handleBack = () => {
    setParentPlace(undefined)
  }

  const isExploring = !!parentPlace

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          {isExploring && (
            <IonButtons slot='start'>
              <IonButton onClick={handleBack} aria-label='Back to places'>
                <IonIcon slot='icon-only' icon={arrowBackOutline} />
              </IonButton>
            </IonButtons>
          )}
          <IonTitle>
            <IonIcon icon={bagOutline} />
            Shop
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {isExploring && parentPlace ? (
          <ExploreContainer place={parentPlace} />
        ) : (
          <SelectParentPlaceContainer onSelected={handleSelected} />
        )}
      </IonContent>
    </IonPage>
  )
}

export default Home
