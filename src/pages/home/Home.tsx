import { IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import SelectParentPlaceContainer from '../../components/select/SelectParentPlaceContainer';
import './Home.css';
import { bagOutline } from 'ionicons/icons';
import { useState } from 'react';

const Home: React.FC = () => {
  const [title, setTitle] = useState("Home");

  const handleTitle = (t: string) => {setTitle(t)}
  
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            <IonIcon icon={bagOutline}></IonIcon>{title}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">{title}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <SelectParentPlaceContainer handleTitle={handleTitle}/>
      </IonContent>
    </IonPage>
  );
};

export default Home;
