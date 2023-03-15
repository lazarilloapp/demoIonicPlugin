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
  IonSelect,
  IonSelectOption,
  IonSkeletonText,
  IonText,
  IonThumbnail,
  IonTitle,
  IonToast,
  IonToolbar,
  useIonToast,
} from '@ionic/react';
import { mapOutline, location, trashBinOutline, cameraOutline, locateOutline, caretBack, caretForward, bluetooth, walk } from 'ionicons/icons';
import { GetPositionCallbackData, RouteReadyCallbackData } from '@lzdevelopers/lazarillo-maps/dist/typings/definitions';
import { StepDTO } from '../places/Step';
import { Place } from '../places/Place';

import { InnerFloor } from '../places/InnerFloor';


interface ContainerProps { }

const ExploreContainer: React.FC<ContainerProps> = () => {


  let unitSystem = "METRIC" //default value
  let anounceSystem = "RELATIVE" //default value
  let withMobility: boolean = false //default value

  const parentPlaceRef = useRef<Place>(
    {  //costanera
      id: '',
      lat: 0,
      lng: 0,
      alias: '446564f853914c81d3158b8ad396680b',
      title: {
        default : 'Costanera Center',
        es : 'Costanera Center'
      }
    }
  );



  const [places, setPlaces] = useState<Place[]>([]);

  const [present] = useIonToast();
  const [startPosition, setStartPosition] = useState(0);
  const [finalPosition, setFinalPosition] = useState(0);
  const [mapRef, setMapRef] = useState(useRef<HTMLElement>())
  const [showToast1, setShowToast1] = useState(false);
  const [steps, setSteps] = useState<StepDTO[]>([]);
  const [currentPositionState, setPosition] = useState<GetPositionCallbackData>();
  const [initialized, setInitialized] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [newMap, setNewMap] = useState<LazarilloMap>();
  const [currentFloorKey, setCurrentFloorKey] = useState("");
  const [innerFloors, setInnerFloors] = useState<InnerFloor[]>([])
  const [floorName, setFloorName] = useState("Planta baja");
  const [currentSimulatedBeacon, setSimulatedBeacon] = useState<String>();
  const [routeId, setRouteId] = useState("");
  const [currentBeaconIndex, setCurrentBeaconIndex] = useState(-1);

  const [currentPositionWatching, setCurrentPositionWatching] = useState<GetPositionCallbackData>();

  const apiKey = process.env.REACT_APP_YOUR_API_KEY_HERE
    ? process.env.REACT_APP_YOUR_API_KEY_HERE
    : '';

  async function initPlugin() {

    if(!initialized){


      await getParentPlace(parentPlaceRef.current.alias ? parentPlaceRef.current.alias : parentPlaceRef.current.id);

      await getSublaces(parentPlaceRef.current.id);

      await LazarilloMap.initializeLazarilloPlugin({
        apiKey: apiKey,
        place: parentPlaceRef.current.id
      })
      setInitialized(true);
    }


  }




  const listBeaconsToSimulate = [
    'f1a166c12ae08075dc5f40fc2eed832b',
    'c2f88d6fc12c645bc443ea3f1837301a',
    '5433ba3787ec662b0984457abbe36933'
  ]

  async function createMap() {

    await initPlugin();

    if (!mapRef.current) return;

    setNewMap(await LazarilloMap.create(
      {
        id: 'my-cool-map',
        element: mapRef.current,
        apiKey: apiKey,
        config: {
          center: {
            lat: parentPlaceRef.current.lat,
            lng: parentPlaceRef.current.lng,
          },
          zoom: 17,
          parentPlaceId: parentPlaceRef.current.id,
        },
      },
      async () => {
        console.log('Map loaded');
        presentToast('top');
      },
    ));

  }
  //if you only want to show the route on the map
  //if startLocationIndex is -1, it starts from user location
  async function startRoute(startLocationIndex: number, targetPlaceKey: number) {
    const targetPlace = places[targetPlaceKey];

    if (!newMap) return;

    let initialPos = {
      building: parentPlaceRef.current.id,
      floor: targetPlace.inFloor ? targetPlace.inFloor[0] : undefined,
      polygons: undefined,
      latitude: targetPlace.lat,
      longitude: targetPlace.lng,
    };
    // Using user location as initial position
    if (startLocationIndex == -1) {
      await getCurrentPosition();
      if (currentPositionState?.location.building != undefined && 
        currentPositionState.location.floor != undefined &&
        currentPositionState.location.latitude != undefined &&
        currentPositionState.location.longitude != undefined) {
          console.log(`Using current user position ${JSON.stringify(currentPositionState).toString()}`)
          initialPos = {
            building: currentPositionState.location.building,
            floor: currentPositionState.location.floor,
            polygons: undefined,
            latitude: currentPositionState.location.latitude,
            longitude: currentPositionState.location.longitude,
          };
      }
    } else {
      console.log(`Dont sing current user position ${JSON.stringify(currentPositionState).toString()}`)
      let initialPlace = places[startLocationIndex];
      initialPos = {
        building: parentPlaceRef.current.id,
        floor: targetPlace.inFloor ? targetPlace.inFloor[0] : undefined,
        polygons: undefined,
        latitude: initialPlace.lat,
        longitude: initialPlace.lng,
      };
    }
    let finalPos = {
      building: parentPlaceRef.current.id,
      floor: targetPlace.inFloor ? targetPlace.inFloor[0] : undefined,
      polygons: undefined,
      latitude: targetPlace.lat,
      longitude: targetPlace.lng,
    };

    newMap.addRoute(
      {
        mapId: 'my-cool-map',
        initialPos: initialPos,
        finalPos: finalPos,
        initialFloor: initialPos.floor,
        finalFloor: finalPos.floor,
        place: parentPlaceRef.current.id,
        preferAccessibleRoute: false,
        nextStepsRouteColor: '#0000FF',
        prevStepsRouteColor: '#aaaaaa',
        polylineWidth: 10,
      },
      async (data: RouteReadyCallbackData) => {
        console.log('Route added', data);
        setRouteId(data.routeId);
        presentToast('top', 'Route loaded');
      },
    );
  }

  /**
   * This function will start the routing proccess and also set a listener for the routing status
   * @param routeId 
   * @returns 
   */
  async function watchRoutingStatus(routeId: string) {

    if (!newMap) return;

    console.log("LZ routeId", routeId);
    // Start routing
    newMap.startRouting({
      routeId: routeId
    })

    // Also add a watcher to the routing status
    LazarilloMap.watchPosition(undefined, async (data: GetPositionCallbackData) => {
      console.log('Position: ', JSON.stringify(data).toString());
      setCurrentPositionWatching(data);

      // Change to the floor of the user
      if (data.location.floor != undefined) {
        newMap?.setFloor({
          mapId: 'my-cool-map',
          floorId: data.location.floor
        })
      }
      
    })
    console.log("added location watcher on route")
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


  function updateFloorMap() {



    try {



      const nextFloorId = parentPlaceRef.current.innerFloors?.get(currentFloorKey);
      if(nextFloorId){
        newMap?.setFloor({
          mapId: 'my-cool-map',
          floorId: nextFloorId?.key
        })
  
        setFloorName(nextFloorId.title)
      }

      
      
    }
    catch (error) {
      console.log(error)
    }
  }

  useEffect(()=> {
    updateFloorMap()
    simulateNextBeacon()
  }, [currentFloorKey, currentBeaconIndex])



  async function changeFloor(e: CustomEvent) {
    setCurrentFloorKey(e.detail.value)
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
    setCurrentFloorKey("")
    setSteps([])

  }


  async function getRouteAndAddRoute(targetPlaceKey: number) {
    const targetPlace = places[targetPlaceKey];
    let accesibility = withMobility ? 1 : 0

    LazarilloUtils.fetchRoute(
      apiKey, // api key
      'WALKING', // travelMode
      places[0].lat, // fromLat
      places[0].lng, // fromLng
      targetPlace.lat, // toLat
      targetPlace.lng, // toLng
      accesibility, // withMobility 0 Means a walking route and 1 a wheel chair route
      anounceSystem, // announceFormat
      undefined, // userBearing
      places[0].inFloor ? places[0].inFloor[0] : undefined, // fromFloor
      parentPlaceRef.current.id, // fromBuilding|
      targetPlace.inFloor ? targetPlace.inFloor[0] : undefined, // toFloor
      parentPlaceRef.current.id, // toBuilding
      'es', //language of the instructions
      unitSystem
    )
      .then((response) => {

        console.log(response.url)
        console.log(response.body)
        return response.json()

      })
      .then((data) => {
        console.log("Got route: ", JSON.stringify(data))
        setSteps(data[0].legs[0].steps)

        newMap?.drawRoute(
          {
            mapId: 'my-cool-map',
            route: data
          },
          async (routeData: RouteReadyCallbackData) => {
            console.log('Route added', routeData);
            setRouteId(routeData.routeId)
            //startAndWatchRoutingStatus(routeData.routeId)

            presentToast('top', 'Watching Route');
          },
        )
      })
      .catch(console.error);



  }
  /**
   * Move the camare angle and location 
   */
  async function setCamera() {
    const randomNumber = Math.floor(Math.random() * places.length)

    const place = places[randomNumber]
    newMap?.setCamera({

      coordinate: {

        lat: place.lat,
        lng: place.lng,
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
   * Ask the plugin for the position
   */
  async function getCurrentPosition() {
    await initPlugin()

    await LazarilloMap.getCurrentPosition().then((response : GetPositionCallbackData) => {
      console.log("Current position", JSON.stringify(response).toString());
      setPosition(response);

    });
  }

  /**
   * This funciton will use th service for fetch all the subplaces of the parent place
   * @param placeId
   */
  async function getSublaces(placeId: string) {
    LazarilloUtils.fetchSubplaces(apiKey, placeId)
      .then((response) => {

        // Load the places in the places variable
        response.json().then((data) => {
          const preparedPlaces : Place[] = []
          data.sort((a: Place, b: Place) => a.title.default.toLowerCase() > b.title.default.toLowerCase() ? 1 : -1);
          data.forEach((place: Place) => {
            preparedPlaces.push(place)
          })
          setPlaces(preparedPlaces)
        })

      })
  }

  /**
   * This function will use the service fetchPlaceInfo to get the parent place
   * @param alias
   */
  async function getParentPlace(alias: string) {
    await LazarilloUtils.fetchPlaceInfo(apiKey, alias)
      .then(async (response) => {

        // Load the place in the parentPlace variable
        await response.json().then((data) => {
          
          parentPlaceRef.current = data
          setInnerFloors(Object.values(parentPlaceRef.current.innerFloors ?? {}))

          console.log("Inner floors :", Object.values(parentPlaceRef.current.innerFloors ?? {}))
          

        })
      })
    }


  /**
   * Iterate over the list of beacons to simulate. If there is the last beacon, the counter come back to the first
   */
  async function simulateNextBeacon() {
    await initPlugin();

    if (currentBeaconIndex < listBeaconsToSimulate.length) {
      await LazarilloMap.simulateBeacons({simulateBeacons: listBeaconsToSimulate[currentBeaconIndex]})
      setSimulatedBeacon(listBeaconsToSimulate[currentBeaconIndex])
    } else {
      setCurrentBeaconIndex(0)
      await LazarilloMap.simulateBeacons({simulateBeacons: listBeaconsToSimulate[currentBeaconIndex]})
      setSimulatedBeacon(listBeaconsToSimulate[currentBeaconIndex])
    }

    
      await LazarilloMap.getCurrentPosition().then((data) => {
        console.log("Current position", JSON.stringify(data).toString())
        setPosition(data)
      })
  
    

  }

  function getListOfInnerFloors(){

    const targetFloors : InnerFloor[] = []

    if(parentPlaceRef.current.innerFloors != undefined){
      
      parentPlaceRef.current.innerFloors.forEach(function(value,key){
        console.log(`Map key is:${key} and value is:${value}`);
        targetFloors.push(value)
      })

    }

    return targetFloors
  }


 async function destroyRoute() {

  if(newMap != undefined){
    newMap.destroyRouting({routeId: routeId})
  }

 }

  return (
    <IonContent>
      <IonGrid>
        <IonRow>
          <IonCol>
            <capacitor-lazarillo-map ref={mapRef}></capacitor-lazarillo-map>
          </IonCol>
        </IonRow>
      </IonGrid>
      <IonGrid class="grid-2">
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
          <IonCol>
            <IonButton onClick={getCurrentPosition}>
              <IonText>Get current position</IonText>
            </IonButton>
          </IonCol>

          {currentPositionState ? (

            <IonCol>
              <IonSkeletonText>Position:
                {JSON.stringify(currentPositionState).toString()} </IonSkeletonText>
            </IonCol>
          ) : ''}


        </IonRow>

        {currentPositionState ? (
          <IonRow>
            <IonCol>
              <IonText>{JSON.stringify(currentPositionState).toString()}</IonText>
            </IonCol>
          </IonRow>) : ''}

        {newMap ? (
          <IonCol>
            <IonCardHeader>
              <IonCardTitle> Route Destination and Floor change</IonCardTitle>
            </IonCardHeader>
            <IonRow >
              <IonButton onClick={() => setIsOpen(true)}>
                <IonText>Destinations</IonText>
              </IonButton>
              <IonItem>
                <IonSelect
                  interface="popover"
                  placeholder="Select floor"
                  onIonChange={changeFloor}
                  >
                  { 
                    innerFloors.map((floor) => {
                      return (<IonSelectOption value={floor.key}>{floor.title}</IonSelectOption>)

                    })
                  }
                  
                </IonSelect>
              </IonItem>
            </IonRow>
            <IonRow>
              <IonCardHeader>
                <IonCardTitle> Add pin and change camera angle and zoom</IonCardTitle>
              </IonCardHeader>
            </IonRow>

            <IonRow>

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

            <IonRow>
              <IonCardHeader>
                <IonCardTitle> Location features</IonCardTitle>
              </IonCardHeader>
            </IonRow>
            <IonRow>
              <IonCol>
                <IonButton onClick={enableCurrentLocation}>
                  <IonIcon icon={locateOutline}></IonIcon>
                  <IonLabel>Enable location</IonLabel>
                </IonButton>
              </IonCol>
              <IonCol>
                <IonButton onClick={() => {
                  watchRoutingStatus(routeId)
                }}>
                  <IonIcon icon={bluetooth}></IonIcon>
                  <IonLabel>Start Routing</IonLabel>
                </IonButton>
              </IonCol>
            </IonRow>
            {currentPositionWatching ? (
              <IonList>
                <IonItem>
                  <IonLabel>Latitude: {currentPositionWatching.location.latitude}</IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>Longitude: {currentPositionWatching.location.longitude}</IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>Floor: {currentPositionWatching.location.floor}</IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>Building: {currentPositionWatching.location.building}</IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>Current Step: {currentPositionWatching.routingStatus?.currentStep}</IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>Route ID: {routeId}</IonLabel>
                </IonItem>
              </IonList>
              ) : ''
            }
            <IonRow>
              <IonCardHeader>
                <IonCardTitle>Beacons simulation</IonCardTitle>
              </IonCardHeader>
            </IonRow>
            <IonRow>
              <IonCol>
                <IonButton onClick={() => setCurrentBeaconIndex(currentBeaconIndex + 1)}>
                  <IonIcon icon={caretForward}></IonIcon>
                  <IonLabel>Simulate Next Beacon</IonLabel>
                </IonButton>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonText>Current beacon {currentSimulatedBeacon}</IonText>
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
              <IonButtons slot="start">
              <IonButton onClick={() => setIsOpen(false)}>Close</IonButton>
              </IonButtons>
              <IonTitle>Route Options: </IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => {
                  startRoute(startPosition, finalPosition);
                  setIsOpen(false);
                }}>Start <IonIcon icon={walk}></IonIcon></IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonRow>
              <IonCol>
                <IonCardHeader> <IonCardTitle> From: </IonCardTitle></IonCardHeader>
                <IonList>
                  <IonRadioGroup id="start_point" value={startPosition} onIonChange={(event) => {
                    if (event.detail.value === undefined) return;
                    setStartPosition(event.detail.value)
                  }}>              
                    <IonItem onClick={() => {setStartPosition(-1)}}>
                      <IonThumbnail slot="start">
                        <IonImg src={'https://ionicframework.com/docs/img/demos/thumbnail.svg'} />
                      </IonThumbnail>
                      <IonLabel>User Position</IonLabel>
                      <IonRadio slot="end" value={-1}></IonRadio>
                    </IonItem>
                    {places.map((place, i) => (
                      <IonItem key={i} onClick={() => {
                        //setIsOpen(false)
                        //getRouteAndAddRoute(i)
                        setStartPosition(i)
                      }}>
                        <IonThumbnail slot="start">
                          <IonImg src={'https://ionicframework.com/docs/img/demos/thumbnail.svg'} />
                        </IonThumbnail>
                        <IonLabel>{place.title?.default}</IonLabel>
                        <IonRadio slot="end" value={i}></IonRadio>
                      </IonItem>
                    ))}
                  </IonRadioGroup>
                </IonList>
              </IonCol>
            </IonRow>
            
            <IonRow>
              <IonCol>
                <IonCardHeader> <IonCardTitle> To: </IonCardTitle></IonCardHeader>
                <IonList>
                <IonRadioGroup id="start_point" value={finalPosition} onIonChange={(event) => {
                    if (event.detail.value === undefined) return;
                    setFinalPosition(event.detail.value)
                  }}>
                    {places.map((place, i) => (
                      <IonItem key={i} onClick={() => {
                        //setIsOpen(false)
                        //getRouteAndAddRoute(i)
                        setFinalPosition(i)
                      }}>
                        <IonThumbnail slot="start">
                          <IonImg src={'https://ionicframework.com/docs/img/demos/thumbnail.svg'} />
                        </IonThumbnail>
                        <IonLabel>{place.title?.default}</IonLabel>
                        <IonRadio slot="end" value={i}></IonRadio>
                      </IonItem>
                    ))}
                  </IonRadioGroup>
                </IonList>
              </IonCol>
            </IonRow>

            <IonRow>
              <IonCol >
                <IonCardHeader> <IonCardTitle> Route Accesibility</IonCardTitle></IonCardHeader>
                <IonList>
                  <IonRadioGroup id="accesibility" value="0" onIonChange={(event) => {
                    console.log("pre cambio de variable", withMobility)
                    if (event.detail.value === 0) {
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
                <IonCardHeader> <IonCardTitle>Unit System</IonCardTitle></IonCardHeader>

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
                <IonCardHeader> <IonCardTitle> Anounce System</IonCardTitle></IonCardHeader>
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

