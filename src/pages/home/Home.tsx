import {
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { bagOutline } from 'ionicons/icons'
import SelectParentPlaceContainer from '../../components/select/SelectParentPlaceContainer'
import './Home.css'

const Home: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            <IonIcon icon={bagOutline} />
            Shop
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <SelectParentPlaceContainer />
      </IonContent>
    </IonPage>
  )
}

export default Home
