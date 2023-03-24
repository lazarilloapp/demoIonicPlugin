import './ExploreContainer.css';
import { LazarilloMap, LazarilloUtils } from '@lzdevelopers/lazarillo-maps';
import { useEffect, useRef, useState } from 'react';
import {
  IonAccordion,
  IonAccordionGroup,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemDivider,
  IonLabel,
  IonList,
  IonModal,
  IonRadio,
  IonRadioGroup,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonText,
  IonTitle,
  IonToast,
  IonToolbar,
  useIonToast,
} from '@ionic/react';
import { mapOutline, location, trashBinOutline, cameraOutline, locateOutline, caretForward, bluetooth, walk } from 'ionicons/icons';
import { GetPositionCallbackData, LzLocation, RouteReadyCallbackData } from '@lzdevelopers/lazarillo-maps/dist/typings/definitions';
import { StepDTO } from '../places/Step';
import { Place } from '../places/Place';

import { InnerFloor } from '../places/InnerFloor';


interface ContainerProps {
  place: Place | undefined
 }

const ExploreContainer: React.FC<ContainerProps> = ({place}) => {

  let parentPlaceRef = place !== undefined ? place :
    {  //costanera
      id: '',
      lat: 0,
      lng: 0,
      alias: '446564f853914c81d3158b8ad396680b',
      title: {
        default: 'Costanera',
        es: 'Costanera'
      }
    };



  const [places, setPlaces] = useState<Place[]>([]);

  const [present] = useIonToast();
  const [startPosition, setStartPosition] = useState(-1);
  const [finalPosition, setFinalPosition] = useState(-1);
  const [mapRef, setMapRef] = useState(useRef<HTMLElement>())
  const [showToast1, setShowToast1] = useState(false);
  const [steps, setSteps] = useState<StepDTO[]>([]);

  const [currentPositionState, setPosition] = useState<GetPositionCallbackData>();
  const currentPositionRef = useRef<GetPositionCallbackData>();

  const [initialized, setInitialized] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [newMap, setNewMap] = useState<LazarilloMap>();
  const [currentFloorKey, setCurrentFloorKey] = useState("");
  const [innerFloors, setInnerFloors] = useState<InnerFloor[]>([])
  const [currentSimulatedBeacon, setSimulatedBeacon] = useState<String>();
  const [routeId, setRouteId] = useState("");
  const [currentBeaconIndex, setCurrentBeaconIndex] = useState(-1);

  const [withMobility, setWithMobility] = useState(false)
  const [announceFormat, setAnnounceFormat] = useState<'RELATIVE'|'CLOCK'|'CARDINAL'>('RELATIVE')
  const [unitSystem, setUnitSystem] = useState<'METRIC'|'IMPERIAL'|'STEPS'>('METRIC')

  const [currentPositionWatching, setCurrentPositionWatching] = useState<GetPositionCallbackData>();

  const apiKey = process.env.REACT_APP_YOUR_API_KEY_HERE
    ? process.env.REACT_APP_YOUR_API_KEY_HERE
    : '';

  async function initPlugin() {

    if (!initialized) {

      await getParentPlace(parentPlaceRef.alias ? parentPlaceRef.alias : parentPlaceRef.id);

      await getSubPlaces(parentPlaceRef.id);

      await LazarilloMap.initializeLazarilloPlugin({
        apiKey: apiKey,
        place: parentPlaceRef.id
      })
      setInitialized(true);
    }


  }




  const listBeaconsToSimulate = [
    'c2f88d6fc12c645bc443ea3f1837301a',
    'a4c8f860cee20daa0c1cb0724a109218',
    'b8617a25013260f55ac8d8483bba4136',
    'b3cd13d94c6de4a94e6dc2ee10639114',
    '576d4cf8b412f1c5a8a4d9ee3773d22e',
    '6bcb004299eaff5da7deda7f42004217',
  ]

  async function createMap() {

    await initPlugin();

    if (!mapRef.current || !parentPlaceRef) return;

    const floors = Object.keys(parentPlaceRef.innerFloors ?? {}) ;
    console.log("asdada: "+ floors.length);
    if(floors.length > 0){
      setCurrentFloorKey( floors[0]|| "")
    }
    setNewMap(await LazarilloMap.create(
      {
        id: 'my-cool-map',
        element: mapRef.current,
        apiKey: apiKey,
        config: {
          center: {
            lat: parentPlaceRef.lat,
            lng: parentPlaceRef.lng,
          },
          zoom: 17,
          parentPlaceId: parentPlaceRef.id,
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


    let initialPos: LzLocation = {
      building: undefined,
      floor: undefined,
      polygons: undefined,
      latitude: undefined,
      longitude: undefined
    }
    // Using user location as initial position
    if (startLocationIndex == -1) {
      await getCurrentPosition();
      console.log(`STARTING ROUTE Current position ${JSON.stringify(currentPositionRef.current).toString()}`)
      if (currentPositionRef.current?.location.building != undefined &&
        currentPositionRef.current.location.floor != undefined &&
        currentPositionRef.current.location.latitude != undefined &&
        currentPositionRef.current.location.longitude != undefined) {
        console.log(`STARTING ROUTE Using current user position ${JSON.stringify(currentPositionRef.current).toString()}`)
        initialPos = {
          building: currentPositionRef.current.location.building,
          floor: currentPositionRef.current.location.floor,
          polygons: undefined,
          latitude: currentPositionRef.current.location.latitude,
          longitude: currentPositionRef.current.location.longitude,
        };
      }
    } else {
      console.log(`STARTING ROUTE Dont using current user position ${JSON.stringify(currentPositionRef.current).toString()}`)
      let initialPlace = places[startLocationIndex];
      initialPos = {
        building: parentPlaceRef.id,
        floor: initialPlace.inFloor ? initialPlace.inFloor[0] : undefined,
        polygons: undefined,
        latitude: initialPlace.lat,
        longitude: initialPlace.lng,
      };
    }
    let finalPos = {
      building: parentPlaceRef.id,
      floor: targetPlace.inFloor ? targetPlace.inFloor[0] : undefined,
      polygons: undefined,
      latitude: targetPlace.lat,
      longitude: targetPlace.lng,
    };

    console.log(`STARTING ROUTE Initial position ${JSON.stringify(initialPos).toString()}`)
    console.log(`STARTING ROUTE Final position ${JSON.stringify(finalPos).toString()}`)



    newMap.addRoute(
      {
        mapId: 'my-cool-map',
        initialPos: initialPos,
        finalPos: finalPos,
        initialFloor: initialPos.floor,
        finalFloor: finalPos.floor,
        place: parentPlaceRef.id,
        preferAccessibleRoute: withMobility,
        nextStepsRouteColor: '#0000FF',
        prevStepsRouteColor: '#aaaaaa',
        polylineWidth: 10,
        announceFormat: announceFormat,
        unitSystem: unitSystem,
      },
      async (data: RouteReadyCallbackData) => {
        console.log('Route added', data);
        let routeData = data.data as any
        let steps = routeData.legs[0].steps as StepDTO[]
        setRouteId(data.routeId);
        setSteps(steps)
        presentToast('top', 'Route loaded');
      },
    );
  }

  /**
   * This function will start the routing process and also set a listener for the routing status
   * @param routeId 
   * @returns 
   */
  async function watchPosition(routeId: string) {

    if (!newMap) return;

    console.log("LZ routeId", routeId);
    // Start routing
    newMap.startRouting({
      routeId: routeId
    })

    // Also add a watcher to the routing status
    LazarilloMap.watchPosition(undefined, async (data: GetPositionCallbackData) => {
      console.log('Position: ', JSON.stringify(data).toString());
      currentPositionRef.current = data
      setPosition(data);

      // Change to the floor of the user
      if (data.location.floor !== undefined && data.location.floor !== null) {
        newMap?.setFloor({
          mapId: 'my-cool-map',
          floorId: data.location.floor
        })
        setCurrentFloorKey(data.location.floor)

      }

    })
    console.log("added location watcher on route")
  }

  async function stopWatchPosition(routeId: string) {

    if (!newMap) return;

    console.log("LZ routeId", routeId);

    newMap.destroyRouting({ routeId })
    // TODO: STOP watchPosition
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
      const nextFloorId = innerFloors.find(i => i.key === currentFloorKey)
      if (nextFloorId) {
        newMap?.setFloor({
          mapId: 'my-cool-map',
          floorId: nextFloorId?.key
        })
      }



    }
    catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
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
    setCurrentFloorKey("")
    setSteps([])

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

  async function enableCurrentLocation() {
    newMap?.enableCurrentLocation(true)
    presentToast('top', 'Current location enabled');
  }
  async function disableCurrentLocation() {
    newMap?.enableCurrentLocation(false)
    presentToast('top', 'Current location disabled');
  }

  /**
   * Ask the plugin for the position
   */
  async function getCurrentPosition() {
    await initPlugin()

    await LazarilloMap.getCurrentPosition().then((response: GetPositionCallbackData) => {
      console.log("Current position", JSON.stringify(response).toString());
      currentPositionRef.current = response
      setPosition(response);

    });
  }

  /**
   * This funciton will use th service for fetch all the subplaces of the parent place
   * @param placeId
   */
  async function getSubPlaces(placeId: string) {
    LazarilloUtils.fetchSubplaces(apiKey, placeId)
      .then((response) => {

        // Load the places in the places variable
        response.json().then((data) => {
          const preparedPlaces: Place[] = []
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
          
          parentPlaceRef = data
          
          let innerFloors: InnerFloor[] = []
          for (let [key, value] of Object.entries(parentPlaceRef.innerFloors ?? {})){
            innerFloors.push({...value, key: key})
          }
          setInnerFloors(innerFloors)

          console.log("Inner floors :", Object.values(parentPlaceRef.innerFloors ?? {}))
          


        })
      })
  }


  /**
   * Iterate over the list of beacons to simulate. If there is the last beacon, the counter come back to the first
   */
  async function simulateNextBeacon() {
    await initPlugin();

    if (currentBeaconIndex < listBeaconsToSimulate.length) {
      await LazarilloMap.simulateBeacons({ simulateBeacons: listBeaconsToSimulate[currentBeaconIndex] })
      setSimulatedBeacon(listBeaconsToSimulate[currentBeaconIndex])
    } else {
      setCurrentBeaconIndex(0)
      await LazarilloMap.simulateBeacons({ simulateBeacons: listBeaconsToSimulate[currentBeaconIndex] })
      setSimulatedBeacon(listBeaconsToSimulate[currentBeaconIndex])
    }


    await LazarilloMap.getCurrentPosition().then((data) => {
      console.log("Current position", JSON.stringify(data).toString())
      currentPositionRef.current = data
      setPosition(data)
    })



  }

  /**
   * Will query the parent place for the given id and return the floor name
   * @param floorId 
   */
  function getFloorNameById(floorId: string){
    const innerFloors = Object.values(parentPlaceRef.innerFloors ?? {}) ?? []
    const floor = innerFloors.find((floor) => floor.key === floorId)
    return floor?.title ?? ""
  }


  async function destroyRoute() {

    if (newMap !== undefined) {
      newMap.destroyRouting({ routeId: routeId })
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
                <IonCardTitle>
                  <IonSelect
                    interface="popover"
                    onIonChange={changeFloor}
                    value={currentFloorKey}
                    defaultValue={currentFloorKey}
                  >
                    {
                      innerFloors.map((floor) => {
                        return (<IonSelectOption value={floor.key}>{floor.title}</IonSelectOption>)
                      })
                    }
                  </IonSelect>
                </IonCardTitle>
                <IonCardContent>
                  <IonButton onClick={destroyMap}>
                    <IonIcon icon={trashBinOutline}></IonIcon>
                    <IonText>Destroy Map</IonText>
                  </IonButton>
                </IonCardContent>
              </IonCard>
            ) : (<IonCard>
              <IonCardHeader>
                <IonCardTitle>Create a map to begin</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonButton onClick={createMap}>
                  <IonIcon icon={mapOutline}></IonIcon>
                  <IonText>Create Map</IonText>
                </IonButton>
              </IonCardContent>
            </IonCard>)}
          </IonCol>
        </IonRow>

        <IonRow>
          <IonCardHeader>
            <IonCardTitle> Location Response</IonCardTitle>
          </IonCardHeader>
        </IonRow>
        <IonRow>
          <IonCol>
            <IonButton onClick={getCurrentPosition}>
              <IonText>Get current position</IonText>
            </IonButton>
          </IonCol>
        </IonRow>

        {currentPositionRef.current ? (
          <IonList>
            <IonItem>
              <IonLabel>Latitude: {currentPositionRef.current.location.latitude}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Longitude: {currentPositionRef.current.location.longitude}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Floor: {
                innerFloors.find(i => {
                  return i.key === currentPositionRef?.current?.location.floor;
                })?.title}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Building: {currentPositionRef.current.location.building}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Current Step: {currentPositionRef.current.routingStatus?.currentStep}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Routing Status: {currentPositionRef.current.routingStatus?.status}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Building Status: {currentPositionRef.current.insideBuilding}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Route ID: {routeId}</IonLabel>
            </IonItem>
          </IonList>
        ) : ''
        }

        {newMap ? (
          <IonCol>
            <IonCardHeader>
              <IonCardTitle> Route</IonCardTitle>
            </IonCardHeader>
            <IonRow >
              <IonButton onClick={() => setIsOpen(true)}>
                <IonText>Make Route</IonText>
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
                <IonButton onClick={disableCurrentLocation}>
                  <IonIcon icon={locateOutline}></IonIcon>
                  <IonLabel>Disable location</IonLabel>
                </IonButton>
              </IonCol>
              <IonCol>
                <IonButton onClick={() => {
                  watchPosition(routeId)
                }}>
                  <IonIcon icon={bluetooth}></IonIcon>
                  <IonLabel>Start updating location</IonLabel>
                </IonButton>
                <IonButton onClick={() => {
                  stopWatchPosition(routeId)
                }}>
                  <IonIcon icon={bluetooth}></IonIcon>
                  <IonLabel>Stop updating location</IonLabel>
                </IonButton>
              </IonCol>
            </IonRow>
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
          </IonCol>

        ) : (<IonText></IonText>)
        }

        {steps.length > 0 && (
          <IonAccordionGroup>
            <IonAccordion value="first">
              <IonItem slot="header" color='light'>
                <IonLabel><h1>Current Route Instructions</h1></IonLabel>
              </IonItem>
              <IonList slot="content">
                {steps.map((step, i) => (
                  <IonItem key={i}>
                    <IonText color={currentPositionState?.routingStatus?.currentStep == i ? 'primary': ''}>{step.html_instructions}</IonText>
                  </IonItem>
                ))}
              </IonList>
            </IonAccordion>
          </IonAccordionGroup>
        )}

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
                  <IonSelect id="start_point" interface="popover" value={startPosition} onIonChange={(event) => {
                    if (event.detail.value === undefined) return;
                    setStartPosition(event.detail.value)
                  }} interfaceOptions={{translucent: false, cssClass: 'actionSheet'}}>              
                  <IonSelectOption value={-1}>User Position</IonSelectOption>
                    {places.map((place, i) => (
                      <IonSelectOption value={i} key={place.id}>
                        <IonLabel class="ion-text-wrap">
                          {place.title?.default} - {place.inFloor ? getFloorNameById(place.inFloor[0]) : ''}
                        </IonLabel>
                        <IonItemDivider />
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonList>
              </IonCol>
            </IonRow>

            <IonRow>
              <IonCol>
                <IonCardHeader> <IonCardTitle> To: </IonCardTitle></IonCardHeader>
                <IonList>
                  <IonSelect id="final_point" value={finalPosition} interface="popover" onIonChange={(event) => {
                    if (event.detail.value === undefined) return;
                    setFinalPosition(event.detail.value)
                  }} interfaceOptions={{translucent: false, cssClass: 'actionSheet'}}>              
                  <IonSelectOption value={-1}>User Position</IonSelectOption>
                    {places.map((place, i) => (
                      <IonSelectOption value={i} key={place.id}>
                        {place.title?.default} - {place.inFloor ? getFloorNameById(place.inFloor[0]) : ''}                        
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonList>
              </IonCol>
            </IonRow>

            <IonRow>
              <IonCol >
                <IonCardHeader> <IonCardTitle> Route Accessibility</IonCardTitle></IonCardHeader>
                <IonList>
                  <IonRadioGroup id="accessibility" value={withMobility ? '1' : '0'} onIonChange={(event) => {
                    console.log("pre cambio de variable", withMobility)
                    setWithMobility(event.detail.value !== '0')
                  }}>
                    <IonItem>
                      <IonLabel>Walking</IonLabel>
                      <IonRadio slot="end" value="0">

                      </IonRadio>
                    </IonItem>
                    <IonItem>
                      <IonLabel>Accessible</IonLabel>
                      <IonRadio slot="end" value="1">

                      </IonRadio>
                    </IonItem>
                  </IonRadioGroup>
                </IonList>

              </IonCol>

              <IonCol >
                <IonCardHeader> <IonCardTitle>Announce Format</IonCardTitle></IonCardHeader>

                <IonList>
                  <IonRadioGroup id='anounce-format' value={announceFormat} onIonChange={(event) => {
                    if (event.detail.value === undefined) return;
                    if (isOpen) {
                      setAnnounceFormat(event.detail.value.toString())
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
                <IonCardHeader> <IonCardTitle> Announce Unit System</IonCardTitle></IonCardHeader>
                <IonList>
                  <IonRadioGroup id='unit-metric' value={unitSystem} onIonChange={(event) => {
                    if (event.detail.value === undefined) return;
                    if (isOpen) {
                      setUnitSystem(event.detail.value.toString())
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

