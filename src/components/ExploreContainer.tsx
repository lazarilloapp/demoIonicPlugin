import './ExploreContainer.css';
import { LazarilloSDK, OpenMapOptions } from "@lzdevelopers/lz-ionic-plugin";
import { IonButton } from '@ionic/react';

interface ContainerProps { }

const ExploreContainer: React.FC<ContainerProps> = () => {
  const apiKey: string = "";
  if (apiKey === "") {
    throw new Error("PLEASE add valid apiKey");
  }

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
      <strong>Ready to create an app?</strong>
      <IonButton expand="full" onClick={() => {      
          LazarilloSDK.initialize(apiKey);
          LazarilloSDK.mapSupport(true);
          LazarilloSDK.openMap(mapOptions);
       }}>
          Open the map
        </IonButton>
    </div>
  );
};

export default ExploreContainer;
