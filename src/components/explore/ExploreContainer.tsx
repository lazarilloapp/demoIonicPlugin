import './ExploreContainer.css';
import { LazarilloMap } from '@lzdevelopers/lazarillo-maps';
import { useRef, useState } from 'react';
import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonImg,
  IonItem,
  IonLabel,
  IonList,
  IonRow,
  IonSlide,
  IonSlides,
  IonText,
  IonThumbnail,
  IonTitle,
  IonToast,
  useIonToast,
} from '@ionic/react';
import { map, mapOutline } from 'ionicons/icons';
import { Place } from '../places/Place';

interface ContainerProps {}

const ExploreContainer: React.FC<ContainerProps> = () => {
  const mapRef = useRef<HTMLElement>();
  let newMap: LazarilloMap;

  const [showToast1, setShowToast1] = useState(false);

  const apiKey = process.env.REACT_APP_YOUR_API_KEY_HERE
    ? process.env.REACT_APP_YOUR_API_KEY_HERE
    : '';

  async function createMap() {
    if (!mapRef.current) return;

    newMap = await LazarilloMap.create({
      id: 'my-cool-map',
      element: mapRef.current,
      apiKey: apiKey,
      config: {
        center: {
          lat: -33.41758007741259,
          lng: -70.60615300514021,
        },
        zoom: 8,
        parentPlaceId: '-N19VjzEVIj2RDKu7i4r',
      },
    },async () => {
      console.log('Map loaded');
      presentToast('top')
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

  // Place list
  const places: Place[] = [
    {
      id: '-N1PFp8NOc5m4LVoPbLY',
      _name: 'Kayser',
      latitude: -33.41758007741259,
      longitude: -70.60615300514021,
    },
    {
      id: '-N2Ykjm5YnfNvesLgUmr',
      _name: 'Cajero Automático',
      latitude: -33.417556917537524,
      longitude: -70.60716507932558,
    },
    {
      id: '-N1PVMDgXNBWo1gWEpyg',
      _name: 'Easy',
      latitude: -33.417596318453455,
      longitude: -70.60672561495679,
    },
    {
      id: '-N1PI2eh94zmlbCLxSBl',
      _name: 'Vivero Verde',
      latitude: -33.41784916502634,
      longitude: -70.60716738108904,
    },
    {
      id: '-N1PF2rz-DUbQNZuuKbE',
      _name: 'Prontomatic',
      latitude: -33.417973584718986,
      longitude: -70.60601659047292,
    },
    {
      id: '-N2SeIeRqKV34PJ5Z6y7',
      _name: 'BCI',
      latitude: -33.41785379621859,
      longitude: -70.60568241131433,
    },
  ];

  const placesComponent = places.map(place => {
    <IonSlide>
      <IonRow>
        <IonText>{place._name}</IonText>
        <IonImg src={'https://random.imagecdn.app/150/150'} />
      </IonRow>
      ;
    </IonSlide>;
  });

  async function startRoute(targetPlaceKey: number) {
    const targetPlace = places[targetPlaceKey];

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
      latitude: targetPlace.latitude,
      longitude: targetPlace.longitude,
    };

    newMap.addRoute(
      {
        mapId: 'my-cool-map',
        initialPos: initialPos,
        finalPos: finalPos,
        initialFloor: '-N1OJ6FIVBV6dpjCXEFM',
        finalFloor: '-N1OJ6FIVBV6dpjCXEFM',
        place: '-N19VjzEVIj2RDKu7i4r',
        preferAccessibleRoute: true,
      },
      async () => {
        console.log('Map loaded');
      },
    );
  }

  const [present] = useIonToast();

  const presentToast = (position: 'top' | 'middle' | 'bottom') => {
    present({
      message: 'Hello World!',
      duration: 1500,
      position: position
    });
  };


  return (
    <IonContent>
      <IonGrid>
        <IonRow>
          <IonCol>
            <IonButton onClick={createMap}>
              <IonIcon icon={mapOutline}></IonIcon>
            </IonButton>
          </IonCol>
        </IonRow>

        <IonRow>
          <IonCol>
            <capacitor-lazarillo-map ref={mapRef}></capacitor-lazarillo-map>
          </IonCol>
        </IonRow>

        <IonRow>
          <IonCol>
            <IonTitle>See places of interest:</IonTitle>
          </IonCol>
        </IonRow>

        <IonRow>
          <IonCol>
            <IonList>
              {places.map((place, i) => (
                <IonItem key={i} onClick={() => startRoute(i)}>
                  <IonThumbnail slot="start">
                    <IonImg src={'https://random.imagecdn.app/150/150'} />
                  </IonThumbnail>
                  <IonLabel>{place._name}</IonLabel>
                </IonItem>
              ))}
            </IonList>
          </IonCol>
        </IonRow>

        <IonRow>
          <IonCol>
            <IonToast
              isOpen={showToast1}
              onDidDismiss={() => setShowToast1(false)}
              message="Map loaded"
              duration={1500}
            />
          </IonCol>
        </IonRow>
      </IonGrid>
    </IonContent>
  );
};

export default ExploreContainer;
