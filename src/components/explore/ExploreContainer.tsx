import './ExploreContainer.css';
import { LazarilloMap, LazarilloUtils } from '@lzdevelopers/lazarillo-maps';
import { useEffect, useRef, useState } from 'react';
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
  IonRadio,
  IonRadioGroup,
  IonRow,
  IonText,
  IonThumbnail,
  IonTitle,
  IonToast,
  IonToolbar,
  useIonToast,
} from '@ionic/react';
import { mapOutline, location, trashBinOutline, cameraOutline, locateOutline, caretBack, caretForward } from 'ionicons/icons';
import { GetPositionCallbackData, RouteReadyCallbackData } from '@lzdevelopers/lazarillo-maps/dist/typings/definitions';
import { StepDTO } from '../places/Step';
import { CustomInnerFloors } from '../data/InnerFloor';
import { CustomPlaces } from '../data/Places';


interface ContainerProps { }

const ExploreContainer: React.FC<ContainerProps> = () => {

  const innerFloors = CustomInnerFloors
  const places = CustomPlaces
  let unitSystem = "METRIC" //default value
  let anounceSystem = "RELATIVE" //default value
  let withMobility: boolean = false //default value

  const [present] = useIonToast();
  const [mapRef, setMapRef] = useState(useRef<HTMLElement>())
  const [showToast1, setShowToast1] = useState(false);
  const [steps, setSteps] = useState<StepDTO[]>([]);
  const [currentPosition, setPosition] = useState<GetPositionCallbackData>();
  const [isOpen, setIsOpen] = useState(false);
  const [newMap, setNewMap] = useState<LazarilloMap>()
  const [currentFloorIndex, setCurrentFloorIndex] = useState(0)
  const [floorName, setFloorName] = useState("Planta baja")
  const [currentSimulatedBeacon, setSimulatedBeacon] = useState<String>()
  const [currentBeaconIndex, setCurrentBeaconIndex] = useState(-1)
  const [currentRouteId, setCurrentRouteId] = useState("")

  const apiKey = process.env.REACT_APP_YOUR_API_KEY_HERE
    ? process.env.REACT_APP_YOUR_API_KEY_HERE
    : '';

  async function initPlugin() {
    await LazarilloMap.initializeLazarilloPlugin({
      apiKey: apiKey,
      place: parentPlace.id,
    })
  }

  const parentPlace = {
    id: '-N19VjzEVIj2RDKu7i4r',
    latitude: -33.417556917537524,
    longitude: -70.60716507932558,
  }

  const listBeaconsToSimulate = [
'e2d63382fb9a6ea46c7482668802430c',
  'a31ef62afe2084f9687391009a129b0e',
  '82bba5ec1cb4459ef2b45e1fa0771b09',
  'b460f5101315f98145c1d27b8200cb11',
  '9f9dd2b1b26fb24c4c043d506a522e36',
  '768e38b09842dba13304a8b8c91c3536',
  'f1a166c12ae08075dc5f40fc2eed832b',
  'c2f88d6fc12c645bc443ea3f1837301a',
  'a4c8f860cee20daa0c1cb0724a109218',
  'b8617a25013260f55ac8d8483bba4136',
  // '576d4cf8b412f1c5a8a4d9ee3773d22e',
  // '1c282d6cdd25587b33019ed2e17b6914',
  '53f0cf9365d0eb18a05b0ffc2eaa492d',
  '76b03acfdaabd82c176310b2bfb9e00e',
]


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
  //if you only want to show the route on the map
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
    getRouteAndAddRoute(targetPlaceKey)
  }

  /**
   * This function will start the routing proccess and also set a listener for the routing status
   * @param routeId 
   * @returns 
   */
  async function watchRoutingStatus(routeId: string) {

    if (!newMap) return;

    // Start routing
    newMap.startRouting({
      routeId: routeId
    })

    // Also add a watcher to the routing status
    LazarilloMap.watchPosition(undefined, async (data: GetPositionCallbackData) => {
      console.log('Position: ', JSON.stringify(data).toString());
      setPosition(data);
      
    })
  }

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


  async function getRouteAndAddRoute(targetPlaceKey: number) {
    const targetPlace = places[targetPlaceKey];
    let accesibility = withMobility ? 1 : 0

    LazarilloUtils.fetchRoute(
      apiKey, // api key
      'WALKING', // travelMode
      places[0].latitude, // fromLat
      places[0].longitude, // fromLng
      targetPlace.latitude, // toLat
      targetPlace.longitude, // toLng
      accesibility, // withMobility 0 Means a walking route and 1 a wheel chair route
      anounceSystem, // announceFormat
      undefined, // userBearing
      places[0].floor, // fromFloor
      parentPlace.id, // fromBuilding|
      targetPlace.floor, // toFloor
      parentPlace.id, // toBuilding
      'es', //language of the instructions
      unitSystem
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
          },
          async (data: RouteReadyCallbackData) => {
            console.log('Route added', JSON.stringify(data).toString());
            presentToast('top', 'Route loaded');

            setCurrentRouteId(data.routeId)

            watchRoutingStatus(data.routeId)
          },
        )
      })
      .catch(console.error);



  }
  /**
   * Move the camare angle and location 
   */
  async function setCamera() {
    const min = -10
    const max = 10
    const randomNumber = Math.floor(Math.random() * places.length)

    const place = places[randomNumber]
    newMap?.setCamera({

      coordinate: {

        lat: place.latitude,
        lng: place.longitude,
      },
      zoom: 21,
      /**
       * Bearing of the camera, in degrees clockwise from true north.
       *
       * @default 0
       */
      bearing: Math.round(Math.random() * 90),
      /**
       * The angle, in degrees, of the camera from the nadir (directly facing the Earth).
       *
       * The only allowed values are 0 and 45.
       *
       * @default 0
       */
      angle: Math.round(Math.random() * 45),
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
  async function updateUnitSytem(newUnit: string) {
    console.log("antes", unitSystem)
    if (newUnit !== unitSystem) {
      unitSystem = newUnit
    }
    console.log("despues", unitSystem)

  }
  async function updateAnounceSystem(newAnnouncer: string) {
    console.log("antes", anounceSystem)
    if (newAnnouncer !== anounceSystem) {
      anounceSystem = newAnnouncer
    }
    console.log("despues", anounceSystem)
  }


  /**
   * Iterate over the list of beacons to simulate. If there is the last beacon, the counter come back to the first
   */
  async function simulateNextBeacon() {
    initPlugin();


    setCurrentBeaconIndex(currentBeaconIndex + 1)
    if (currentBeaconIndex < listBeaconsToSimulate.length) {
      await LazarilloMap.simulateBeacons({simulateBeacons: listBeaconsToSimulate[currentBeaconIndex]})
      setSimulatedBeacon(listBeaconsToSimulate[currentBeaconIndex])
    }else{
      setCurrentBeaconIndex(0)
      await LazarilloMap.simulateBeacons({simulateBeacons: listBeaconsToSimulate[currentBeaconIndex]})
      setSimulatedBeacon(listBeaconsToSimulate[currentBeaconIndex])
    }

    
      await LazarilloMap.getCurrentPosition().then((data) => {
        console.log("Current position", JSON.stringify(data).toString())
        setPosition(data)
      })
  
    

  }


 async function destroyRoute() {

  if(newMap != undefined){
    newMap.destroyRouting({routeId: currentRouteId})
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

        <IonRow>
        <IonButton onClick={destroyRoute}>
              <IonIcon icon={trashBinOutline}></IonIcon>
              <IonText>Destroy Routing</IonText>
            </IonButton>
              <IonCol>
              <IonTitle>Beacons simulation</IonTitle>
              <IonButton onClick={simulateNextBeacon}>
                <IonIcon icon={caretForward}></IonIcon>
              </IonButton>
              <IonText>Current beacon {currentSimulatedBeacon}</IonText>


              </IonCol>
           
            </IonRow>

            {currentPosition ? (
                  <IonRow>
                    <IonCol>
                      <IonTitle>Current position:</IonTitle>
                    </IonCol>
                  </IonRow>) : ''}

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


                  
        {currentPosition ? (
            <IonRow>
            <IonCol>
            <IonText>{JSON.stringify(currentPosition).toString()}</IonText>
            </IonCol>
            </IonRow>) : ''}

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
                      getRouteAndAddRoute(i)
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

            <IonRow>
              <IonCol >
                <IonTitle>Route Accesibility</IonTitle>
                <IonList>
                  <IonRadioGroup id="accesibility" value="0" onIonChange={(event) => {
                    console.log("pre cambio de variable", withMobility)
                    if (event.detail.value == 0) {
                      withMobility = false
                    }
                    else {
                      withMobility = true
                    }
                    console.log("tipo de ruta", withMobility)
                  }}>
                    <IonItem>
                      <IonLabel>Walking</IonLabel>
                      <IonRadio slot="end" value="0">

                      </IonRadio>
                    </IonItem>
                    <IonItem>
                      <IonLabel>Accesible</IonLabel>
                      <IonRadio slot="end" value="1">

                      </IonRadio>
                    </IonItem>
                  </IonRadioGroup>
                </IonList>

              </IonCol>

              <IonCol >
                <IonTitle>Unit System</IonTitle>
                <IonList>
                  <IonRadioGroup id='anounce-format' value={anounceSystem} onIonChange={(event) => {
                    if (event.detail.value === undefined) return;
                    if (isOpen) {
                      updateAnounceSystem(event.detail.value.toString())
                    }
                  }}>
                    <IonItem>
                      <IonLabel>RELATIVE</IonLabel>
                      <IonRadio slot="end" value="RELATIVE"></IonRadio>
                    </IonItem>

                    <IonItem>
                      <IonLabel>CARDINAL</IonLabel>
                      <IonRadio slot="end" value="CARDINAL"></IonRadio>
                    </IonItem>

                    <IonItem>
                      <IonLabel>CLOCK</IonLabel>
                      <IonRadio slot="end" value="CLOCK"></IonRadio>
                    </IonItem>

                  </IonRadioGroup>
                </IonList>
              </IonCol>
              <IonCol >
                <IonTitle>Anounce System</IonTitle>
                <IonList>
                  <IonRadioGroup id='unit-metric' value={unitSystem} onIonChange={(event) => {
                    if (event.detail.value === undefined) return;
                    if (isOpen) {
                      updateUnitSytem(event.detail.value.toString())
                    }
                  }}
                  >
                    <IonItem>
                      <IonLabel>METRIC</IonLabel>
                      <IonRadio slot="end" value="METRIC"></IonRadio>
                    </IonItem>

                    <IonItem>
                      <IonLabel>IMPERIAL</IonLabel>
                      <IonRadio slot="end" value="IMPERIAL"></IonRadio>
                    </IonItem>

                    <IonItem>
                      <IonLabel>STEPS</IonLabel>
                      <IonRadio slot="end" value="STEPS"></IonRadio>
                    </IonItem>
                  </IonRadioGroup>
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
    </IonContent >
  );
};

export default ExploreContainer;
