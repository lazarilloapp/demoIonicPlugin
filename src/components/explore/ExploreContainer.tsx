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
import { RouteReadyCallbackData } from '@lzdevelopers/lazarillo-maps/dist/typings/definitions';
import { StepDTO } from '../places/Step';
import { CustomInnerFloors } from '../data/InnerFloor';
import { CustomPlaces } from '../data/Places';


interface ContainerProps { }

const ExploreContainer: React.FC<ContainerProps> = () => {

  const innerFloors = CustomInnerFloors
  const places = CustomPlaces
  let unitSystem = "METRIC" //default value
  let anounceSystem = "RELATIVE" //default value

  const [present] = useIonToast();
  const [mapRef, setMapRef] = useState(useRef<HTMLElement>())
  const [showToast1, setShowToast1] = useState(false);
  const [steps, setSteps] = useState<StepDTO[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [newMap, setNewMap] = useState<LazarilloMap>()
  const [currentFloorIndex, setCurrentFloorIndex] = useState(0)
  const [floorName, setFloorName] = useState("Planta baja")
  //const [randomBase, setRandomBase] = useState(0)


  // useEffect(() => {
  //   setRandomBase(Math.random())

  // })

  const apiKey = process.env.REACT_APP_YOUR_API_KEY_HERE
    ? process.env.REACT_APP_YOUR_API_KEY_HERE
    : '';

  async function initPlugin() {
    await LazarilloMap.initializeLazarilloPlugin({
      apiKey: apiKey,
    })
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
    ));

  }
  //if you only want to show the route on the map
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

    LazarilloUtils.fetchRoute(
      apiKey, // api key
      'WALKING', // travelMode
      places[0].latitude, // fromLat
      places[0].longitude, // fromLng
      targetPlace.latitude, // toLat
      targetPlace.longitude, // toLng
      1, // withMobility
      anounceSystem, // announceFormat
      undefined, // userBearing
      '-N1OJ6FIVBV6dpjCXEFM', // fromFloor
      '-N19VjzEVIj2RDKu7i4r', // fromBuilding|
      '-N1OJ6FIVBV6dpjCXEFM', // toFloor
      '-N19VjzEVIj2RDKu7i4r', // toBuilding
      'es',
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
          }
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
                <IonTitle>Unit System</IonTitle>
                <IonList>
                  <IonRadioGroup id='anounce-format' value={anounceSystem} onIonChange={(event) => {
                    if (event.detail.value === undefined) return;
                    updateAnounceSystem(event.detail.value.toString())
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
                    updateUnitSytem(event.detail.value.toString())
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
    </IonContent>
  );
};

export default ExploreContainer;
