import './ExploreContainer.css';
import { LazarilloMap } from '@lzdevelopers/lazarillo-maps';
import { useRef, useState } from 'react';
import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonRow,
  IonText,
  IonTitle,
  IonToast,
} from '@ionic/react';

interface ContainerProps {}

const ExploreContainer: React.FC<ContainerProps> = () => {
  const mapRef = useRef<HTMLElement>();
  let newMap: LazarilloMap;

  const [showToast1, setShowToast1] = useState(false);

  async function createMap() {
    if (!mapRef.current) return;

    newMap = await LazarilloMap.create({
      id: 'my-cool-map',
      element: mapRef.current,
      apiKey: 'AiNFZyJdbr5qa2KHmj7e',
      config: {
        center: {
          lat: 33.6,
          lng: -117.9,
        },
        zoom: 8,
      },
    });
  }

  async function addRoute() {
    if (!newMap) return;

    let initialPos = {
      building: '-N19VjzEVIj2RDKu7i4r',
      floor: '-N1OJ6FIVBV6dpjCXEFM',
      polygons: undefined,
      latitude: -33.41758007741259,
      longitude: -70.60615300514021,
    };
    let finalPos = {
      building: '-N19VjzEVIj2RDKu7i4r',
      floor: '-N1OJ6FIVBV6dpjCXEFM',
      polygons: undefined,
      latitude: -33.417596318453455,
      longitude: -70.60672561495679,
    };

    newMap.addRoute({
      mapId: 'my-cool-map',
      initialPos: initialPos,
      finalPos: finalPos,
      initialFloor: '-N1OJ6FIVBV6dpjCXEFM',
      finalFloor: '-N1OJ6FIVBV6dpjCXEFM',
      place: '-N19VjzEVIj2RDKu7i4r',
      preferAccessibleRoute: true,
    });
  }

  return (
    <IonContent>
      <IonGrid>
        <IonRow>
          <IonCol>
            <IonRow>
              <IonButton onClick={createMap}>Open map</IonButton>
              <IonButton onClick={addRoute}>Add route</IonButton>
            </IonRow>
            <capacitor-lazarillo-map ref={mapRef}></capacitor-lazarillo-map>
          </IonCol>
        </IonRow>
      </IonGrid>
    </IonContent>
  );
};

export default ExploreContainer;
