import { IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import SelectParentPlaceContainer from '../../components/select/SelectParentPlaceContainer';
import './Home.css';
import { bagOutline } from 'ionicons/icons';

const Home: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle><IonIcon icon={bagOutline}></IonIcon>  Shop</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">   Shop</IonTitle>
          </IonToolbar>
        </IonHeader>
        <SelectParentPlaceContainer />
      </IonContent>
    </IonPage>
  );
};

export default Home;
