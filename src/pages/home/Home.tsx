import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import SelectParentPlaceContainer from '../../components/select/SelectParentPlaceContainer';
import './Home.css';


const Home: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Home</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Home</IonTitle>
          </IonToolbar>
        </IonHeader>
        <SelectParentPlaceContainer/>
      </IonContent>
    </IonPage>
  );
};

export default Home;
