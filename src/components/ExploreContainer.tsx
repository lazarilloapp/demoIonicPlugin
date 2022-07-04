import './ExploreContainer.css';
import { LazarilloSDK } from "@lzdevelopers/lz-ionic-plugin";
import { IonButton } from '@ionic/react';

interface ContainerProps { }

const ExploreContainer: React.FC<ContainerProps> = () => {
  const apiKey: string = "";
  if (apiKey === "") {
    throw new Error("PLEASE add valid apiKey");
  }
  
  return (
    <div className="container">
      <strong>Ready to create an app?</strong>
      <IonButton expand="full" onClick={() => {      
          LazarilloSDK.initialize(apiKey);
          LazarilloSDK.mapSupport(true);
          LazarilloSDK.openMap();
       }}>
          Open the map
        </IonButton>
    </div>
  );
};

export default ExploreContainer;
