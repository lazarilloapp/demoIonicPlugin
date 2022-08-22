import './ExploreContainer.css';
import { LazarilloSDK, OpenMapOptions } from "@lzdevelopers/lz-ionic-plugin";
import { IonButton, IonToast } from '@ionic/react';
import { useState } from 'react';

interface ContainerProps { }



const ExploreContainer: React.FC<ContainerProps> = () => {

  const [showToast1, setShowToast1] = useState(false);



        // Add listener for the map when it is loaded
    LazarilloSDK.addListener("mapLoaded", () => { setShowToast1(true) })


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
      <strong>Ready to test the plugin.</strong>
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

        <IonToast
        isOpen={showToast1}
        onDidDismiss={() => setShowToast1(false)}
        message="Your settings have been saved."
        duration={200}
      />
    </div>
  );
};

export default ExploreContainer;
