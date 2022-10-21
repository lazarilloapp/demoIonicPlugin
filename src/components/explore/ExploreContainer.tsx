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
import { RouteReadyCallbackData } from '@lzdevelopers/lazarillo-maps/dist/typings/definitions';

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

  // Floor list
  const innerFloors = {
    "-N1OJ6FIVBV6dpjCXEFM": {
        "floor": "Planta baja",
        "index": 0,
        "key": "-N1OJ6FIVBV6dpjCXEFM",
        "level": -1,
        "name": {
            "default": "Planta baja",
            "es": "Planta baja"
        },
        "title": "Planta baja",
        "vectorTile": true
    },
    "-NCtxDrJbDWE3gMkZ_45": {
        "floor": "Primer piso",
        "index": 1,
        "key": "-NCtxDrJbDWE3gMkZ_45",
        "level": 1,
        "name": {
            "default": "Primer piso",
            "es": "Primer piso"
        },
        "title": "Primer piso",
        "vectorTile": true
    },
    "-NCtxOT4E4n3XlW_-hzL": {
        "floor": "Segundo piso",
        "index": 2,
        "key": "-NCtxOT4E4n3XlW_-hzL",
        "level": 2,
        "name": {
            "default": "Segundo piso",
            "es": "Segundo piso"
        },
        "title": "Segundo piso",
        "vectorTile": true
    },
    "-NCtxUY6bYLXOEndcqMl": {
        "floor": "Tercer piso",
        "index": 3,
        "key": "-NCtxUY6bYLXOEndcqMl",
        "level": 3,
        "name": {
            "default": "Tercer piso",
            "es": "Tercer piso"
        },
        "title": "Tercer piso",
        "vectorTile": true
    },
    "-NCtxd01xaDOjDQSOPCT": {
        "floor": "Cuarto piso",
        "index": 4,
        "key": "-NCtxd01xaDOjDQSOPCT",
        "level": 4,
        "name": {
            "default": "Cuarto piso",
            "es": "Cuarto piso"
        },
        "title": "Cuarto piso",
        "vectorTile": true
    },
    "-NCtxg_OxCuCfGVevdck": {
        "floor": "Quinto piso",
        "index": 5,
        "key": "-NCtxg_OxCuCfGVevdck",
        "level": 5,
        "name": {
            "default": "Quinto piso",
            "es": "Quinto piso"
        },
        "title": "Quinto piso",
        "vectorTile": true
    },
    "-NCtxjm9HZsty9D0i-or": {
        "floor": "Sexto piso",
        "index": 6,
        "key": "-NCtxjm9HZsty9D0i-or",
        "level": 6,
        "name": {
            "default": "Sexto piso",
            "es": "Sexto piso"
        },
        "title": "Sexto piso",
        "vectorTile": true
    },
    "-ND-DoTPPnqUT_dWjW3e": {
        "floor": "Piso 61",
        "index": 7,
        "key": "-ND-DoTPPnqUT_dWjW3e",
        "level": 7,
        "name": {
            "default": "Piso 61",
            "es": "Piso 61"
        },
        "title": "Piso 61",
        "vectorTile": true
    },
    "-ND-DotO0jGRTA5-D-Jv": {
        "floor": "Piso 62",
        "index": 8,
        "key": "-ND-DotO0jGRTA5-D-Jv",
        "level": 8,
        "name": {
            "default": "Piso 62",
            "es": "Piso 62"
        },
        "title": "Piso 62",
        "vectorTile": true
    }
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
      },async (data: RouteReadyCallbackData) => {
        console.log('Route added', data)
        presentToast('top', "Route loaded")
      },
    );
  }

  const [present] = useIonToast();

  const presentToast = (position: 'top' | 'middle' | 'bottom', message='Event received') => {
    present({
      message: message,
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
