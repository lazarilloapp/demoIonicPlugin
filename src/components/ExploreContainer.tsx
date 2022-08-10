import './ExploreContainer.css';
import { LazarilloSDK, OpenMapOptions } from "@lzdevelopers/lz-ionic-plugin";
import { IonButton } from '@ionic/react';

interface ContainerProps { }

const ExploreContainer: React.FC<ContainerProps> = () => {
  const apiKey: string = "";
  const mapOptions : OpenMapOptions = {
    latitude: 0,
    longitude: 0,
    id: "my-map",
    element: null,
    parentPlaceId: "-N19VjzEVIj2RDKu7i4r",
    routingOptions: null
  }
  
  return (
    <div className="container">
      <strong>Ready to tes the plugin.</strong>
      <IonButton expand="full" onClick={() => {      
          LazarilloSDK.initialize(apiKey);
          LazarilloSDK.mapSupport(true);
          LazarilloSDK.openMap(mapOptions);
       }}>
          Open the map
        </IonButton>
        <IonButton expand="full" onClick={() => {      
          LazarilloSDK.initialize(apiKey);
          LazarilloSDK.mapSupport(true);
          LazarilloSDK.openCustomMap(mapOptions);
       }}>
          Open custom map
        </IonButton>
    </div>
  );
};

export default ExploreContainer;
