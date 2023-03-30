import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../../components/explore/ExploreContainer';
import { caretBack } from 'ionicons/icons';
import { useParams } from 'react-router';

const Explorer: React.FC = () => {
  const {alias} = useParams<{alias: string}>();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot='start'>
            <IonBackButton icon={caretBack} defaultHref="/home"></IonBackButton>
          </IonButtons>
          <IonTitle>Explorer</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <ExploreContainer alias={alias} />
      </IonContent>
    </IonPage>
  );
};

export default Explorer;
