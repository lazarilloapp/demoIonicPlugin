import './ExploreContainer.css';
import { LazarilloMap, LazarilloUtils } from '@lzdevelopers/lazarillo-maps';
import { useEffect, useRef, useState } from 'react';
import {
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonImg,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonRow,
  IonText,
  IonThumbnail,
  IonTitle,
  IonToast,
  IonToolbar,
  useIonToast,
} from '@ionic/react';
import { mapOutline, playSkipForwardOutline, playBackOutline, location, trashBinOutline, cameraOutline, locateOutline } from 'ionicons/icons';
import { Place } from '../places/Place';
import { RouteReadyCallbackData } from '@lzdevelopers/lazarillo-maps/dist/typings/definitions';
import { InnerFloor } from '../places/InnerFloor';
import { StepDTO } from '../places/Step';

  // Floor list
  const innerFloors: InnerFloor[] = [
    {
      "key": "-MuH9tsPqRPXFANSqXHI",
      "index": 1,
      "name": "Piso 1"
    },
    {
      "key": "-MuHAz2gWGlO42yrzRzu",
      "index": 2,
      "name":  "Piso 2"
    }
  ];

interface ContainerProps { }

const ExploreContainer: React.FC<ContainerProps> = () => {

  const [mapRef, setMapRef] = useState(useRef<HTMLElement>())
  const [showToast1, setShowToast1] = useState(false);
  const [steps, setSteps] = useState<StepDTO[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [newMap, setNewMap] = useState<LazarilloMap>()
  const [currentFloorIndex, setCurrentFloorIndex] = useState(innerFloors[0].index)
  const [floorName, setFloorName] = useState(innerFloors[0].name)

  const apiKey = process.env.REACT_APP_YOUR_API_KEY_HERE
    ? process.env.REACT_APP_YOUR_API_KEY_HERE
    : '';

  async function createMap() {
    if (!mapRef.current) return;

    setNewMap(await LazarilloMap.create(
      {
        id: 'my-cool-map',
        element: mapRef.current,
        apiKey: apiKey,
        config: {
          center: {
            lat: -33.4803395,
            lng: -70.755898,
          },
          zoom: 17,
          parentPlaceId: '-MuH95VRaEZkS6_YIsLM',
        },
      },
      async () => {
        console.log('Map loaded');
        presentToast('top');
      },
    ));

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
      building: '-MuH95VRaEZkS6_YIsLM',
      floor: '-MuH9tsPqRPXFANSqXHI',
      polygons: undefined,
      latitude: -33.41758007741259,
      longitude: -70.60615300514021,
    };
    let finalPos = {
      building: '-MuH95VRaEZkS6_YIsLM',
      floor: '-MuH9tsPqRPXFANSqXHI',
      polygons: undefined,
      latitude: targetPlace.latitude,
      longitude: targetPlace.longitude,
    };

    newMap.addRoute(
      {
        mapId: 'my-cool-map',
        initialPos: initialPos,
        finalPos: finalPos,
        initialFloor: '-MuH9tsPqRPXFANSqXHI',
        finalFloor: '-MuH9tsPqRPXFANSqXHI',
        place: '-MuH95VRaEZkS6_YIsLM',
        preferAccessibleRoute: true,
        nextStepsRouteColor: '#ff33b5',
        prevStepsRouteColor: '#aaaaaa',
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




  async function changeNextFloor() {
    if (currentFloorIndex < innerFloors.length - 1) {
      setCurrentFloorIndex(currentFloorIndex + 1)
    }
    const nextFloorId = innerFloors[currentFloorIndex].key;
    try {
      newMap?.setFloor({
        mapId: 'my-cool-map',
        floorId: nextFloorId
      })
      setFloorName(innerFloors[currentFloorIndex].name)
    }
    catch (error) {
      console.log(error)
    }

  }

  async function changePrevFloor() {
    if (currentFloorIndex > 0) {
      setCurrentFloorIndex(currentFloorIndex - 1)
    }
    const prevFloorId = innerFloors[currentFloorIndex].key;

    newMap?.setFloor({
      mapId: 'my-cool-map',
      floorId: prevFloorId
    })
    setFloorName(innerFloors[currentFloorIndex].name)

  }

  async function addMarker() {
    newMap?.addMarker({
      coordinate: {
        lat: -33.417556917537524,
        lng: -70.60716507932558,
      },
      floorId: "outlined_person"
    });
  }


  async function addOutdoorMarker() {
    newMap?.addMarker({
      coordinate: {
        lat: -33.417556917537524,
        lng: -70.60716507932558,
      },
      icon: "outlined_pin"
    });
  }

  async function destroyMap() {
    newMap?.destroy()
    setNewMap(undefined)
    setFloorName(innerFloors[0].name)
    setCurrentFloorIndex(innerFloors[0].index)
    setSteps([])

  }


  async function getRouteAndAddRoute() {

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
      .then((response) => {

        console.log(response.url)
        console.log(JSON.stringify(response.body).toString())
        return response.json()

      })
      .then((data) => {
        console.log("Got route: ", data)
        console.log(data)
        newMap?.drawRoute(
          {
            mapId: 'my-cool-map',
            route: data
          }
        )
      })
      .catch(console.error);



  }

  async function setCamera() {
    newMap?.setCamera({

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
    newMap?.enableCurrentLocation(locationEnable)
  }

  return (
    <IonContent>
      <IonGrid>
        <IonRow>
          <IonCol>
            <IonButton onClick={createMap}>
              <IonIcon icon={mapOutline}></IonIcon>
              <IonText>Create Map</IonText>
            </IonButton>
            <IonButton onClick={destroyMap}>
              <IonIcon icon={trashBinOutline}></IonIcon>
              <IonText>Destroy Map</IonText>
            </IonButton>
            <IonButton onClick={setCamera}>
              <IonIcon icon={cameraOutline}></IonIcon>
              <IonText>Go to </IonText>
            </IonButton>
            {newMap ? (<IonText id='floorName'>{floorName}</IonText>) : (<IonText></IonText>)}
          </IonCol>

        </IonRow>

        {/* Cerrado hasta nuevo aviso */}
        {/* <IonRow>
          <IonCol>
            <IonButton onClick={enableCurrentLocation}>
              <IonIcon icon={locateOutline}></IonIcon>
            </IonButton>
            <IonButton onClick={addMarker}>
              <IonIcon icon={location}></IonIcon>
              <IonText> Indoor</IonText>
            </IonButton>
            <IonButton onClick={addOutdoorMarker}>
              <IonIcon icon={location}></IonIcon>
              <IonText> Outdoor</IonText>
            </IonButton>
          </IonCol>
        </IonRow> */}

        <IonRow>
          <IonCol>
            <capacitor-lazarillo-map ref={mapRef}></capacitor-lazarillo-map>
          </IonCol>
        </IonRow>

        {/* <IonRow>
          <IonCol>
            <IonTitle>Current Route Instructions:</IonTitle>
          </IonCol>
        </IonRow>

        <IonRow>
          <IonCol>
            <IonList>
              {steps.map((step, i) => (
                <IonItem key={i}>
                  <IonText>{step.html_instructions}</IonText>
                </IonItem>
              ))}
            </IonList>
          </IonCol>
        </IonRow> */}




        {newMap ? (
          <IonRow >
            <IonButton onClick={() => setIsOpen(true)}>
              <IonText>Destinations</IonText>
            </IonButton>
            <IonButton onClick={changePrevFloor}>
              <IonIcon icon={playBackOutline}></IonIcon>
              <IonText>Prev</IonText>
            </IonButton>
            <IonButton onClick={changeNextFloor}>
              <IonIcon icon={playSkipForwardOutline}></IonIcon>
              <IonText>Next</IonText>
            </IonButton>
          </IonRow>

        ) : (
          <IonText></IonText>
        )

        }

        <IonModal id="example-modal" isOpen={isOpen} className="ion-padding modal-demo">
          <IonHeader>
            <IonToolbar>
              <IonTitle>From Kaiser to: </IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setIsOpen(false)}>Close</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonRow>
              <IonCol>
                <IonList>
                  {places.map((place, i) => (
                    <IonItem key={i} onClick={() => {
                      setIsOpen(false)
                      startRoute(i)
                    }}>
                      <IonThumbnail slot="start">
                        <IonImg src={'https://random.imagecdn.app/150/150'} />
                      </IonThumbnail>
                      <IonLabel>{place._name}</IonLabel>
                    </IonItem>
                  ))}
                </IonList>
              </IonCol>
            </IonRow>
          </IonContent>
        </IonModal>
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
