import './ExploreContainer.css';
import { LazarilloMap, LazarilloUtils } from '@lzdevelopers/lazarillo-maps';
import { useRef, useState } from 'react';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardHeader,
  IonCardTitle,
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
import { mapOutline, location, trashBinOutline, cameraOutline, locateOutline, caretBack, caretForward } from 'ionicons/icons';
import { RouteReadyCallbackData } from '@lzdevelopers/lazarillo-maps/dist/typings/definitions';
import { StepDTO } from '../places/Step';
import { CustomInnerFloors } from '../data/InnerFloor';
import { CustomPlaces } from '../data/Places';


interface ContainerProps { }

const ExploreContainer: React.FC<ContainerProps> = () => {

  const innerFloors = CustomInnerFloors
  const places = CustomPlaces

  const [mapRef, setMapRef] = useState(useRef<HTMLElement>())
  const [showToast1, setShowToast1] = useState(false);
  const [steps, setSteps] = useState<StepDTO[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [newMap, setNewMap] = useState<LazarilloMap>()
  const [currentFloorIndex, setCurrentFloorIndex] = useState(0)
  const [floorName, setFloorName] = useState("Planta baja")

  const apiKey = process.env.REACT_APP_YOUR_API_KEY_HERE
    ? process.env.REACT_APP_YOUR_API_KEY_HERE
    : '';

  async function initPlugin() {
    await LazarilloMap.initializeLazarilloPlugin({
      apiKey: apiKey,
    })
  }

  const parentPlace = {
    id: '-N19VjzEVIj2RDKu7i4r',
    latitude: -33.417556917537524,
    longitude: -70.60716507932558,
  }


  async function createMap() {

    initPlugin();

    if (!mapRef.current) return;

    setNewMap(await LazarilloMap.create(
      {
        id: 'my-cool-map',
        element: mapRef.current,
        apiKey: apiKey,
        config: {
          center: {
            lat: parentPlace.latitude,
            lng: parentPlace.longitude,
          },
          zoom: 17,
          parentPlaceId: parentPlace.id,
        },
      },
      async () => {
        console.log('Map loaded');
        presentToast('top');
      },
    ));

  }
  async function startRoute(targetPlaceKey: number) {
    const targetPlace = places[targetPlaceKey];

    if (!newMap) return;

    // The intial pos for now will be the first place on the list
    let initialPos = {
      building: parentPlace.id,
      floor: places[0].floor,
      polygons: undefined,
      latitude: places[0].latitude,
      longitude: places[0].longitude,
    };
    let finalPos = {
      building: parentPlace.id,
      floor: targetPlace.floor,
      polygons: undefined,
      latitude: targetPlace.latitude,
      longitude: targetPlace.longitude,
    };

    newMap.addRoute(
      {
        mapId: 'my-cool-map',
        initialPos: initialPos,
        finalPos: finalPos,
        initialFloor: places[0].floor,
        finalFloor: targetPlace.floor,
        place: parentPlace.id,
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
    //to get route instructrions
    getRouteAndAddRoute()
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
    setFloorName('Planta baja')
    setCurrentFloorIndex(0)
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
      places[0].floor, // fromFloor
      parentPlace.id, // fromBuilding|
      places[1].floor, // toFloor
      parentPlace.id, // toBuilding
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
        setSteps(data[0].legs[0].steps)
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
  /**
   * Move the camare angle and location 
   */
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
    if (locationEnable) {
      presentToast('top', 'Current location enabled');
    }
    else {
      presentToast('top', 'Current location disabled');
    }
  }

  return (
    <IonContent>
      <IonGrid>
        <IonRow>
          <IonCol>

            {newMap ? (
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>{floorName}</IonCardTitle>
                </IonCardHeader>
              </IonCard>

            ) : (<IonCard>
              <IonCardHeader>
                <IonCardTitle>Create a map to begin</IonCardTitle>
              </IonCardHeader>
            </IonCard>)}
            <IonButton onClick={createMap}>
              <IonIcon icon={mapOutline}></IonIcon>
              <IonText>Create Map</IonText>
            </IonButton>
            <IonButton onClick={destroyMap}>
              <IonIcon icon={trashBinOutline}></IonIcon>
              <IonText>Destroy Map</IonText>
            </IonButton>
          </IonCol>
        </IonRow>

        <IonRow>

        </IonRow>

        <IonRow>
          <IonCol>
            <capacitor-lazarillo-map ref={mapRef}></capacitor-lazarillo-map>
          </IonCol>
        </IonRow>

        {newMap ? (
          <IonCol>
            <IonRow >

              <IonButton onClick={() => setIsOpen(true)}>
                <IonText>Destinations</IonText>
              </IonButton>
              <IonButton onClick={changePrevFloor}>
                <IonIcon icon={caretBack}></IonIcon>
                <IonText>Prev</IonText>
              </IonButton>
              <IonButton onClick={changeNextFloor}>
                <IonText>Next</IonText>
                <IonIcon icon={caretForward}></IonIcon>

              </IonButton>
            </IonRow>
            <IonRow>
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
              <IonButton onClick={setCamera}>
                <IonIcon icon={cameraOutline}></IonIcon>
              </IonButton>

            </IonRow>
          </IonCol>

        ) : (<IonText></IonText>)
        }


        {steps.length > 0 ? (
          <IonRow>
            <IonCol>
              <IonTitle>Current Route Instructions:</IonTitle>
            </IonCol>
          </IonRow>) : ''}

        {steps.length > 0 ? (
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
          </IonRow>) : ''}

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
                        <IonImg src={'https://ionicframework.com/docs/img/demos/thumbnail.svg'} />
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
