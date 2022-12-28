import './ExploreContainer.css';
import { LazarilloMap, LazarilloUtils } from '@lzdevelopers/lazarillo-maps';
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
import { map, mapOutline, playSkipForwardOutline, playBackOutline, location, trashBinOutline, addCircleOutline, cameraOutline, locateOutline } from 'ionicons/icons';
import { Place } from '../places/Place';
import { LzLocation, RouteReadyCallbackData } from '@lzdevelopers/lazarillo-maps/dist/typings/definitions';
import { InnerFloor } from '../places/InnerFloor';

interface ContainerProps {}

const ExploreContainer: React.FC<ContainerProps> = () => {
  const mapRef = useRef<HTMLElement>();
  let newMap: LazarilloMap;

  const [showToast1, setShowToast1] = useState(false);

  const apiKey = process.env.REACT_APP_YOUR_API_KEY_HERE
    ? process.env.REACT_APP_YOUR_API_KEY_HERE
    : '';

  async function initPlugin(){
    await LazarilloMap.initializeLazarilloPlugin({
      apiKey: apiKey,
    })
  }

  async function createMap() {
    if (!mapRef.current) return;




    newMap = await LazarilloMap.create(
      {
        id: 'my-cool-map',
        element: mapRef.current,
        apiKey: apiKey,
        config: {
          center: {
            lat: -33.41758007741259,
            lng: -70.60615300514021,
          },
          zoom: 17,
          parentPlaceId: '-N19VjzEVIj2RDKu7i4r',
        },
      },
      async () => {
        console.log('Map loaded');
        presentToast('top');
      },
    );
  }

  // Floor list
  const innerFloors: InnerFloor[] = [
    {
      index: 0,
      key: '-N1OJ6FIVBV6dpjCXEFM',
      level: -1,
      name: {
        default: 'Planta baja',
        es: 'Planta baja',
      },
      vectorTile: true,
    },
    {
      index: 1,
      key: '-NCtxDrJbDWE3gMkZ_45',
      level: 1,
      name: {
        default: 'Primer piso',
        es: 'Primer piso',
      },
      vectorTile: true,
    },
    {
      index: 2,
      key: '-NCtxOT4E4n3XlW_-hzL',
      level: 2,
      name: {
        default: 'Segundo piso',
        es: 'Segundo piso',
      },
      vectorTile: true,
    },
    {
      index: 3,
      key: '-NCtxUY6bYLXOEndcqMl',
      level: 3,
      name: {
        default: 'Tercer piso',
        es: 'Tercer piso',
      },
      vectorTile: true,
    },
    {
      index: 4,
      key: '-NCtxd01xaDOjDQSOPCT',
      level: 4,
      name: {
        default: 'Cuarto piso',
        es: 'Cuarto piso',
      },
      vectorTile: true,
    },
    {
      index: 5,
      key: '-NCtxg_OxCuCfGVevdck',
      level: 5,
      name: {
        default: 'Quinto piso',
        es: 'Quinto piso',
      },
      vectorTile: true,
    },
    {
      index: 6,
      key: '-NCtxjm9HZsty9D0i-or',
      level: 6,
      name: {
        default: 'Sexto piso',
        es: 'Sexto piso',
      },
      vectorTile: true,
    },
    {
      index: 7,
      key: '-ND-DoTPPnqUT_dWjW3e',
      level: 7,
      name: {
        default: 'Piso 61',
        es: 'Piso 61',
      },

      vectorTile: true,
    },
    {
      index: 8,
      key: '-ND-DotO0jGRTA5-D-Jv',
      level: 8,
      name: {
        default: 'Piso 62',
        es: 'Piso 62',
      },
      vectorTile: true,
    },
  ];

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
        nextStepsRouteColor:'#ff33b5',
        prevStepsRouteColor:'#aaaaaa',
        polylineWidth: 10,
      },
      async (data: RouteReadyCallbackData) => {
        console.log('Route added', data);
        presentToast('top', 'Route loaded');
      },
    );
  }

  const [present] = useIonToast();

  const presentToast = (
    position: 'top' | 'middle' | 'bottom',
    message = 'Event received',
  ) => {
    present({
      message: message,
      duration: 1500,
      position: position,
    });
  };

  let currentFloorIndex = 0


  async function changeNextFloor() {

    currentFloorIndex += 1

    const nextFloorId = innerFloors[currentFloorIndex].key;

    newMap.setFloor({
      mapId: 'my-cool-map',
      floorId : nextFloorId
    })

  }

  async function changePrevFloor() {

    currentFloorIndex -= 1

    const prevFloorId = innerFloors[currentFloorIndex].key;

    newMap.setFloor({
      mapId: 'my-cool-map',
      floorId : prevFloorId
    })

  }

  async function addMarker() {
    newMap.addMarker({
      coordinate: {
        lat: -33.417556917537524,
        lng: -70.60716507932558,
      },
      floorId: "outlined_person"
    });
  }


  async function addOutdoorMarker() {
    newMap.addMarker({
      coordinate: {
        lat: -33.417556917537524,
        lng: -70.60716507932558,
      },
      icon: "outlined_pin"
    });
  }

  async function destroyMap(){
    newMap.destroy()

  }


  async function getRouteAndAddRoute(){
    
    LazarilloUtils.fetchRoute(
        apiKey, // api key
        'WALKING', // travelMode
        places[0].latitude, // fromLat
        places[0].longitude, // fromLng
        places[1].latitude, // toLat
        places[1].longitude, // toLng
        1, // withMobility
        'RELATIVE', // announceFormat
        undefined, // userBearing
        '-N1OJ6FIVBV6dpjCXEFM', // fromFloor
        '-N19VjzEVIj2RDKu7i4r', // fromBuilding|
        '-N1OJ6FIVBV6dpjCXEFM', // toFloor
        '-N19VjzEVIj2RDKu7i4r', // toBuilding
        'es',
        'METRIC'
    ) 
    .then((response: { url: any; body: any; json: () => any; }) => {
      
      console.log(response.url)
      console.log(JSON.stringify(response.body).toString())
     return response.json()
    
    })
    .then((data: any) => {
      console.log("Got route: ",data)
      newMap.drawRoute(
        {
          mapId: 'my-cool-map',
          route: data
        }
      )
    })
    .catch(console.error);

   

  }

  async function setCamera() {
    newMap.setCamera({

     coordinate: {

        lat: -33.417556917537524,
        lng: -70.60716507932558,
     },
     zoom: 21,
     /**
      * Bearing of the camera, in degrees clockwise from true north.
      *
      * @default 0
      */
     bearing: 90,
     /**
      * The angle, in degrees, of the camera from the nadir (directly facing the Earth).
      *
      * The only allowed values are 0 and 45.
      *
      * @default 0
      */
     angle: 45,
     /**
      * Animate the transition to the new Camera properties.
      *
      * @default false
      */
     animate: true,
     /**
      *
      */
     animationDuration: 8000,
    });
    
  }

  let locationEnable = false

  async function enableCurrentLocation() {
    locationEnable = !locationEnable
    newMap.enableCurrentLocation(locationEnable)
  }


  // Get current location one time
  async function getCurrentPosition() {
    initPlugin()
    LazarilloMap.getCurrentPosition().then((location : any ) => {
      console.log("Hello location ", JSON.stringify(location).toString())
    }
    )


  }

  // Active current location
  async function watchPosition() {
    initPlugin()
   await LazarilloMap.watchPosition(undefined, (location : any ) => {
      console.log("Hello location ", JSON.stringify(location).toString())
    }
   )

  }


  return (
    <IonContent>
      <IonGrid>
        <IonRow>
          <IonCol>
            <IonButton onClick={createMap}>
              <IonIcon icon={mapOutline}></IonIcon>
            </IonButton>
            <IonButton onClick={changePrevFloor}>
              <IonIcon icon={playBackOutline}></IonIcon>
            </IonButton>
            <IonButton onClick={changeNextFloor}>
              <IonIcon icon={playSkipForwardOutline}></IonIcon>
            </IonButton>
            <IonButton onClick={destroyMap}>
              <IonIcon icon={trashBinOutline}></IonIcon>
            </IonButton>
            <IonButton onClick={setCamera}>
              <IonIcon icon={cameraOutline}></IonIcon>
            </IonButton>
            <IonButton onClick={getCurrentPosition}>
            <IonIcon icon={locateOutline}></IonIcon>
            </IonButton>
          </IonCol>

        </IonRow>

        <IonRow>
          <IonCol>
          <IonButton onClick={addMarker}>
              <IonIcon icon={location}></IonIcon>
              <IonText> Indoor</IonText>
            </IonButton>
            <IonButton onClick={addOutdoorMarker}>
              <IonIcon icon={location}></IonIcon>
              <IonText> Outdoor</IonText>
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
