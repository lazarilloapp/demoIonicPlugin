import { Device } from '@capacitor/device'
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
  IonPopover,
  IonRadio,
  IonRadioGroup,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonText,
  IonTitle,
  IonToast,
  IonToolbar,
  isPlatform,
  useIonToast,
} from '@ionic/react'
import { LazarilloMap, LazarilloUtils } from '@lzdevelopers/lazarillo-maps'
import {
  GetPositionCallbackData,
  GradientStyle,
  LazarilloMapConfig,
  LzLocation,
  RouteReadyCallbackData,
  SdkStepRoute,
  SolidStyle,
} from '@lzdevelopers/lazarillo-maps/dist/typings/definitions'
import {
  bluetooth,
  cameraOutline,
  caretForward,
  informationCircle,
  locateOutline,
  location,
  mapOutline,
  trashBinOutline,
  walk,
} from 'ionicons/icons'
import { useEffect, useRef, useState } from 'react'
import { InnerFloor } from '../places/InnerFloor'
import { Place } from '../places/Place'
import RouteInstruction from '../routeInstructions/RouteInstructions'
import './ExploreContainer.css'

interface ContainerProps {
  place: Place | undefined
}

const nextStepsRouteStyleGradientOption: GradientStyle = {
  type: 'GRADIENT',
  width: 10,
  colors: ['#4CA768', '#4CA1A7', '#1CC1CE'],
  positions: [0, 0.5, 1],
}
const nextStepsRouteStylePlainOption: SolidStyle = {
  type: 'SOLID',
  width: 10,
  color: '#1CC1CE',
}
const prevStepsRouteStyleGradientOption: GradientStyle = {
  type: 'GRADIENT',
  width: 10,
  colors: ['#BD7C12', '#C7BC4E', '#909C94'],
  positions: [0, 0.9, 1],
}
const prevStepsRouteStylePlainOption: SolidStyle = {
  type: 'SOLID',
  width: 10,
  color: '#9B9B9B',
}

const aheadStyleOptions: string[] = [
  nextStepsRouteStyleGradientOption,
  nextStepsRouteStylePlainOption,
].map((style) => style.type)

const behindStyleOptions: string[] = [
  prevStepsRouteStyleGradientOption,
  prevStepsRouteStylePlainOption,
].map((style) => style.type)

const ExploreContainer: React.FC<ContainerProps> = ({ place }) => {
  let parentPlaceRef = place ?? {
    //costanera
    id: '',
    lat: 0,
    lng: 0,
    alias: '446564f853914c81d3158b8ad396680b',
    title: {
      default: 'Costanera',
      es: 'Costanera',
    },
  }

  const [places, setPlaces] = useState<Place[]>([])

  const [present] = useIonToast()
  const [startPosition, setStartPosition] = useState(-1)
  const [finalPosition, setFinalPosition] = useState(-1)
  const mapRef = useRef<HTMLElement>()
  const [showToast1, setShowToast1] = useState(false)
  const [steps, setSteps] = useState<SdkStepRoute[]>([])

  const [currentPositionState, setPosition] =
    useState<GetPositionCallbackData>()
  const currentPositionRef = useRef<GetPositionCallbackData>()

  const [initialized, setInitialized] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [newMap, setNewMap] = useState<LazarilloMap>()
  const [currentFloorKey, setCurrentFloorKey] = useState('')
  const [innerFloors, setInnerFloors] = useState<InnerFloor[]>([])
  const [currentSimulatedBeacon, setSimulatedBeacon] = useState<String>()
  const [routeId, setRouteId] = useState('')
  const [currentBeaconIndex, setCurrentBeaconIndex] = useState(-1)

  const [withMobility, setWithMobility] = useState(false)
  const [announceFormat, setAnnounceFormat] = useState<
    'RELATIVE' | 'CLOCK' | 'CARDINAL'
  >('RELATIVE')
  const [unitSystem, setUnitSystem] = useState<'METRIC' | 'IMPERIAL' | 'STEPS'>(
    'METRIC'
  )
  const [instructionsLanguage, setInstructionsLanguage] =
    useState<string>('system')
  const [locationIconOption, setLocationIconOption] = useState('')
  const [locationIconWithBearingOption, setLocationIconWithBearingOption] =
    useState('')
  const [compassIconOption, setCompassIconOption] = useState('')
  const [aheadStyle, setAheadStyle] = useState<string>(aheadStyleOptions[0])
  const [behindStyle, setBehindStyle] = useState<string>(behindStyleOptions[1])

  const apiKey = process.env.REACT_APP_YOUR_API_KEY_HERE ?? ''

  async function initPlugin() {
    if (!initialized) {
      await getParentPlace(
        parentPlaceRef.alias ? parentPlaceRef.alias : parentPlaceRef.id
      )

      await getSubPlaces(parentPlaceRef.id)

      await LazarilloMap.initializeLazarilloPlugin({
        apiKey: apiKey,
        place: parentPlaceRef.id,
      })
      setInitialized(true)
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

  const getMapConfig = (): LazarilloMapConfig => {
    var mapConfig: LazarilloMapConfig = {
      center: {
        lat: parentPlaceRef.lat,
        lng: parentPlaceRef.lng,
      },
      zoom: 17,
      parentPlaceId: parentPlaceRef.id,
    }
    switch (locationIconOption) {
      case 'URL':
        mapConfig.locationIcon =
          'https://cdn-icons-png.flaticon.com/512/666/666201.png'
        break
      default:
        break
    }
    switch (locationIconWithBearingOption) {
      case 'URL':
        mapConfig.locationIconWithBearing =
          'https://cdn-icons-png.flaticon.com/512/5142/5142952.png'
    }
    switch (compassIconOption) {
      case 'URL':
        mapConfig.compassIcon =
          'https://cdn-icons-png.flaticon.com/512/16/16797.png'
        break
      default:
        break
    }
    return mapConfig
  }

  async function createMap() {
    await initPlugin()

    if (!mapRef.current || !parentPlaceRef) return

    const floors = Object.keys(parentPlaceRef.innerFloors ?? {})
    console.log('Number of floors: ' + floors.length)
    if (floors.length > 0) {
      setCurrentFloorKey(floors[0] || '')
    }
    const config = getMapConfig()
    console.log('Map config is :', config)
    setNewMap(
      await LazarilloMap.create(
        {
          id: 'my-cool-map',
          element: mapRef.current,
          apiKey: apiKey,
          config: config,
        },
        async () => {
          console.log('Map loaded')
          presentToast('top')
        }
      )
    )
  }
  //if you only want to show the route on the map
  //if startLocationIndex is -1, it starts from user location
  async function startRoute(
    startLocationIndex: number,
    targetPlaceKey: number
  ) {
    const targetPlace = places[targetPlaceKey]

    if (!newMap) return

    let initialPos: LzLocation = {
      building: undefined,
      floor: undefined,
      polygons: undefined,
      latitude: undefined,
      longitude: undefined,
    }
    // Using user location as initial position
    if (startLocationIndex === -1) {
      await getCurrentPosition()
      console.log(
        `STARTING ROUTE Current position ${JSON.stringify(
          currentPositionRef.current
        ).toString()}`
      )
      if (
        currentPositionRef.current?.location?.building &&
        currentPositionRef.current?.location?.floor &&
        currentPositionRef.current?.location?.latitude &&
        currentPositionRef.current?.location?.longitude
      ) {
        console.log(
          `STARTING ROUTE Using current user position ${JSON.stringify(
            currentPositionRef.current
          ).toString()}`
        )
        initialPos = {
          building: currentPositionRef.current.location.building,
          floor: currentPositionRef.current.location.floor,
          polygons: undefined,
          latitude: currentPositionRef.current.location.latitude,
          longitude: currentPositionRef.current.location.longitude,
        }
      }
    } else {
      console.log(
        `STARTING ROUTE Don't using current user position ${JSON.stringify(
          currentPositionRef.current
        ).toString()}`
      )
      let initialPlace = places[startLocationIndex]
      initialPos = {
        building: parentPlaceRef.id,
        floor: initialPlace.inFloor ? initialPlace.inFloor[0] : undefined,
        polygons: undefined,
        latitude: initialPlace.lat,
        longitude: initialPlace.lng,
      }
    }
    let finalPos = {
      building: parentPlaceRef.id,
      floor: targetPlace.inFloor ? targetPlace.inFloor[0] : undefined,
      polygons: undefined,
      latitude: targetPlace.lat,
      longitude: targetPlace.lng,
    }

    console.log(
      `STARTING ROUTE Initial position ${JSON.stringify(initialPos).toString()}`
    )
    console.log(
      `STARTING ROUTE Final position ${JSON.stringify(finalPos).toString()}`
    )

    const language =
      instructionsLanguage !== 'system'
        ? instructionsLanguage
        : (await Device.getLanguageCode()).value

    newMap.addRoute(
      {
        mapId: 'my-cool-map',
        initialPos: initialPos,
        finalPos: finalPos,
        initialFloor: initialPos.floor,
        finalFloor: finalPos.floor,
        place: parentPlaceRef.id,
        preferAccessibleRoute: withMobility,
        nextStepsRouteStyle:
          aheadStyle === 'SOLID'
            ? nextStepsRouteStylePlainOption
            : nextStepsRouteStyleGradientOption,
        prevStepsRouteStyle:
          behindStyle === 'SOLID'
            ? prevStepsRouteStylePlainOption
            : prevStepsRouteStyleGradientOption,
        announceFormat: announceFormat,
        unitSystem: unitSystem,
        language: language,
      },
      async (data: RouteReadyCallbackData) => {
        console.log('Route added', data)
        let routeData = data.data
        let steps = routeData.legs[0].steps
        setRouteId(data.routeId)
        setSteps(steps)
        presentToast('top', 'Route loaded')
      }
    )
  }

  /**
   * This function will start the routing process and also set a listener for the routing status
   * @param routeId
   * @returns
   */
  async function watchPosition(routeId: string) {
    if (!newMap) return

    console.log('LZ routeId', routeId)
    // Start routing
    newMap.startRouting({
      routeId: routeId,
    })

    // Also add a watcher to the routing status
    LazarilloMap.watchPosition(
      undefined,
      async (data: GetPositionCallbackData) => {
        console.log('Position: ', JSON.stringify(data).toString())
        currentPositionRef.current = data
        setPosition(data)

        // Change to the floor of the user
        if (data.location.floor !== undefined && data.location.floor !== null) {
          newMap?.setFloor({
            mapId: 'my-cool-map',
            floorId: data.location.floor,
          })
          setCurrentFloorKey(data.location.floor)
        }
      }
    )
    console.log('added location watcher on route')
  }

  async function stopWatchPosition(routeId: string) {
    if (!newMap) return

    console.log('LZ routeId', routeId)

    newMap.destroyRouting({ routeId })
    // TODO: STOP watchPosition
  }

  const presentToast = (
    position: 'top' | 'middle' | 'bottom',
    message = 'Event received'
  ) => {
    present({
      message: message,
      duration: 1500,
      position: position,
    })
  }

  function updateFloorMap() {
    try {
      const nextFloorId = innerFloors.find((i) => i.key === currentFloorKey)
      if (nextFloorId) {
        newMap?.setFloor({
          mapId: 'my-cool-map',
          floorId: nextFloorId?.key,
        })
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    updateFloorMap()
    if (currentBeaconIndex !== -1) {
      simulateNextBeacon()
    }
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
      floorId: 'outlined_person',
    })
  }

  async function addOutdoorMarker() {
    newMap?.addMarker({
      coordinate: {
        lat: -33.417556917537524,
        lng: -70.60716507932558,
      },
      icon: 'outlined_pin',
    })
  }

  async function destroyMap() {
    newMap?.destroy()
    setNewMap(undefined)
    setCurrentFloorKey('')
    setSteps([])
  }

  /**
   * Move the camera angle and location
   */
  async function setCamera() {
    const position = await LazarilloMap.getCurrentPosition()
    if (
      position.location.latitude !== undefined &&
      position.location.longitude !== undefined
    ) {
      newMap?.setCamera({
        coordinate: {
          lat: position.location.latitude,
          lng: position.location.longitude,
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
      })
    }
  }

  async function enableCurrentLocation() {
    newMap?.enableCurrentLocation(true)
    presentToast('top', 'Current location enabled')
  }
  async function disableCurrentLocation() {
    newMap?.enableCurrentLocation(false)
    presentToast('top', 'Current location disabled')
  }

  /**
   * Ask the plugin for the position
   */
  async function getCurrentPosition() {
    await initPlugin()

    await LazarilloMap.getCurrentPosition().then(
      (response: GetPositionCallbackData) => {
        console.log('Current position', JSON.stringify(response).toString())
        currentPositionRef.current = response
        setPosition(response)
      }
    )
  }

  /**
   * This function will use th service for fetch all the subplaces of the parent place
   * @param placeId
   */
  async function getSubPlaces(placeId: string) {
    LazarilloUtils.fetchSubplaces(apiKey, placeId).then((response) => {
      // Load the places in the places variable
      response.json().then((data) => {
        const preparedPlaces: Place[] = []
        data.sort((a: Place, b: Place) =>
          a.title.default.toLowerCase() > b.title.default.toLowerCase() ? 1 : -1
        )
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
    await LazarilloUtils.fetchPlaceInfo(apiKey, alias).then(
      async (response) => {
        // Load the place in the parentPlace variable
        await response.json().then((data) => {
          parentPlaceRef = data

          let innerFloors: InnerFloor[] = []
          for (let [key, value] of Object.entries(
            parentPlaceRef.innerFloors ?? {}
          )) {
            innerFloors.push({ ...value, key: key })
          }
          setInnerFloors(innerFloors)

          console.log(
            'Inner floors :',
            Object.values(parentPlaceRef.innerFloors ?? {})
          )
        })
      }
    )
  }

  /**
   * Iterate over the list of beacons to simulate. If there is the last beacon, the counter come back to the first
   */
  async function simulateNextBeacon() {
    await initPlugin()

    if (currentBeaconIndex < listBeaconsToSimulate.length) {
      await LazarilloMap.simulateBeacons({
        simulateBeacons: listBeaconsToSimulate[currentBeaconIndex],
      })
      setSimulatedBeacon(listBeaconsToSimulate[currentBeaconIndex])
    } else {
      setCurrentBeaconIndex(0)
      await LazarilloMap.simulateBeacons({
        simulateBeacons: listBeaconsToSimulate[currentBeaconIndex],
      })
      setSimulatedBeacon(listBeaconsToSimulate[currentBeaconIndex])
    }

    await LazarilloMap.getCurrentPosition().then((data) => {
      console.log('Current position', JSON.stringify(data).toString())
      currentPositionRef.current = data
      setPosition(data)
    })
  }

  /**
   * Will query the parent place for the given id and return the floor name
   * @param floorId
   */
  function getFloorNameById(floorId: string) {
    const innerFloors = Object.values(parentPlaceRef.innerFloors ?? {}) ?? []
    const floor = innerFloors.find((floor) => floor.key === floorId)
    return floor?.title ?? ''
  }

  async function destroyRoute() {
    if (newMap !== undefined) {
      newMap.destroyRouting({ routeId: routeId })
    }
  }

  return (
    <>
      <IonGrid>
        <IonRow>
          <IonCol>
            <capacitor-lazarillo-map ref={mapRef}></capacitor-lazarillo-map>
          </IonCol>
        </IonRow>
      </IonGrid>
      <IonGrid class='grid-2'>
        <IonRow>
          <IonCol>
            {newMap ? (
              <IonCard>
                <IonCardTitle>
                  <IonSelect
                    onIonChange={changeFloor}
                    value={currentFloorKey}
                    defaultValue={currentFloorKey}
                  >
                    {innerFloors.map((floor) => {
                      return (
                        <IonSelectOption value={floor.key}>
                          {floor.title}
                        </IonSelectOption>
                      )
                    })}
                  </IonSelect>
                </IonCardTitle>
                <IonCardContent>
                  <IonButton onClick={destroyMap}>
                    <IonIcon icon={trashBinOutline}></IonIcon>
                    <IonText>Destroy Map</IonText>
                  </IonButton>
                </IonCardContent>
              </IonCard>
            ) : (
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Create a map to begin</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  {isPlatform('android') && (
                    <IonItem key={'location-options'}>
                      <IonLabel position='stacked'>
                        Select location icon mode
                      </IonLabel>
                      <IonSelect
                        onIonChange={(e) =>
                          setLocationIconOption(e.detail.value)
                        }
                        value={locationIconOption}
                      >
                        <IonSelectOption value=''>Default</IonSelectOption>
                        <IonSelectOption value='URL'>
                          Icon available on url
                        </IonSelectOption>
                      </IonSelect>
                    </IonItem>
                  )}
                  <IonItem key={'location-with-bearing-options'}>
                    <IonLabel position='stacked'>
                      Select location with bearing icon mode
                    </IonLabel>
                    <IonSelect
                      onIonChange={(e) =>
                        setLocationIconWithBearingOption(e.detail.value)
                      }
                      value={locationIconWithBearingOption}
                    >
                      <IonSelectOption value=''>Default</IonSelectOption>
                      <IonSelectOption value='URL'>
                        Icon available on url
                      </IonSelectOption>
                    </IonSelect>
                  </IonItem>
                  <IonItem key={'compass-options'}>
                    <IonLabel position='stacked'>
                      Select compass icon mode
                    </IonLabel>
                    <IonSelect
                      onIonChange={(e) => setCompassIconOption(e.detail.value)}
                      value={compassIconOption}
                    >
                      <IonSelectOption value=''>Default</IonSelectOption>
                      <IonSelectOption value='URL'>
                        Icon available on url
                      </IonSelectOption>
                    </IonSelect>
                  </IonItem>
                  <IonButton onClick={createMap}>
                    <IonIcon icon={mapOutline}></IonIcon>
                    <IonText>Create Map</IonText>
                  </IonButton>
                </IonCardContent>
              </IonCard>
            )}
          </IonCol>
        </IonRow>

        <IonAccordionGroup multiple>
          <IonAccordion value='location-response'>
            <IonItem slot='header' color='light' key='Location'>
              <IonLabel>Location Response</IonLabel>
            </IonItem>
            <div className='ion-padding' slot='content'>
              <div>
                <IonText>
                  Get the current position of the user, also show this
                  information.
                </IonText>
              </div>
              <div>
                <IonButton onClick={getCurrentPosition}>
                  <IonText>Get current position</IonText>
                </IonButton>
                <IonButton
                  id='get-position-button-information'
                  fill='clear'
                  className='information-button'
                >
                  <IonIcon
                    slot='icon-only'
                    icon={informationCircle}
                    color='warning'
                    size='large'
                  />
                </IonButton>
                <IonPopover
                  trigger='get-position-button-information'
                  triggerAction='click'
                >
                  <IonContent class='ion-padding'>
                    Get the current position of the user.
                  </IonContent>
                </IonPopover>
              </div>

              {currentPositionRef.current && (
                <IonList>
                  <IonItem key='lat&lng'>
                    <IonLabel>
                      Lat & Lng:{' '}
                      {currentPositionRef.current.location.latitude?.toFixed(6)}{' '}
                      &{' '}
                      {currentPositionRef.current.location.longitude?.toFixed(
                        6
                      )}
                    </IonLabel>
                  </IonItem>
                  <IonItem>
                    <IonLabel key='floor'>
                      Floor:{' '}
                      {
                        innerFloors.find((i) => {
                          return (
                            i.key ===
                            currentPositionRef?.current?.location.floor
                          )
                        })?.title
                      }
                    </IonLabel>
                  </IonItem>
                  <IonItem key='building'>
                    <IonLabel>
                      Building: {currentPositionRef.current.location.building}
                    </IonLabel>
                  </IonItem>
                  <IonItem key='currentStep'>
                    <IonLabel>
                      Current Step:{' '}
                      {currentPositionRef.current.routingStatus?.currentStep}
                    </IonLabel>
                  </IonItem>
                  <IonItem key='routingStatus'>
                    <IonLabel>
                      Routing Status:{' '}
                      {currentPositionRef.current.routingStatus?.status}
                    </IonLabel>
                  </IonItem>
                  <IonItem key='buildingStatus'>
                    <IonLabel>
                      Building Status:{' '}
                      {currentPositionRef.current.insideBuilding}
                    </IonLabel>
                  </IonItem>
                  <IonItem key='heading'>
                    <IonLabel>
                      Heading {currentPositionRef.current.location.heading}
                    </IonLabel>
                  </IonItem>
                  <IonItem key='routeId'>
                    <IonLabel>Route ID: {routeId}</IonLabel>
                  </IonItem>
                </IonList>
              )}
            </div>
          </IonAccordion>

          {newMap && (
            <IonAccordion value='route'>
              <IonItem slot='header' color='light' key='routeHeader'>
                <IonLabel>Route</IonLabel>
              </IonItem>
              <div slot='content' className='ion-padding'>
                <div>
                  <IonText>
                    Make a route and display it on the map, also show the
                    instructions of the route.
                  </IonText>
                </div>
                <div>
                  <IonButton onClick={() => setIsOpen(true)}>
                    <IonText>Make Route</IonText>
                  </IonButton>
                  <IonButton
                    id='make-route-button-information'
                    fill='clear'
                    className='information-button'
                  >
                    <IonIcon
                      slot='icon-only'
                      icon={informationCircle}
                      color='warning'
                      size='large'
                    />
                  </IonButton>
                  <IonPopover
                    trigger='make-route-button-information'
                    triggerAction='click'
                  >
                    <IonContent class='ion-padding'>
                      Open a popover to select the parameters to generate a
                      route.
                    </IonContent>
                  </IonPopover>
                </div>
                <RouteInstruction
                  steps={steps}
                  currentStepIndex={
                    currentPositionState?.routingStatus?.currentStep
                  }
                />
              </div>
            </IonAccordion>
          )}

          {newMap && (
            <IonAccordion value='location-features'>
              <IonItem slot='header' color='light' key='LocationFeature'>
                <IonLabel>Location features</IonLabel>
              </IonItem>
              <div className='ion-padding' slot='content'>
                <div>
                  <IonText>
                    Features related to the user location showed on the map.
                  </IonText>
                </div>
                <div>
                  <IonButton onClick={enableCurrentLocation}>
                    <IonIcon icon={locateOutline}></IonIcon>
                    <IonLabel>Enable location</IonLabel>
                  </IonButton>
                  <IonButton
                    id='enable-location-button-information'
                    fill='clear'
                    className='information-button'
                  >
                    <IonIcon
                      slot='icon-only'
                      icon={informationCircle}
                      color='warning'
                      size='large'
                    />
                  </IonButton>
                  <IonPopover
                    trigger='enable-location-button-information'
                    triggerAction='click'
                  >
                    <IonContent class='ion-padding'>
                      Enable the user location feature to start showing the
                      current location on the map.
                    </IonContent>
                  </IonPopover>
                </div>
                <div>
                  <IonButton onClick={disableCurrentLocation}>
                    <IonIcon icon={locateOutline}></IonIcon>
                    <IonLabel>Disable location</IonLabel>
                  </IonButton>
                  <IonButton
                    id='disable-location-button-information'
                    fill='clear'
                    className='information-button'
                  >
                    <IonIcon
                      slot='icon-only'
                      icon={informationCircle}
                      color='warning'
                      size='large'
                    />
                  </IonButton>
                  <IonPopover
                    trigger='disable-location-button-information'
                    triggerAction='click'
                  >
                    <IonContent class='ion-padding'>
                      Disable the user location feature.
                    </IonContent>
                  </IonPopover>
                </div>
                <div>
                  <IonButton
                    onClick={() => {
                      watchPosition(routeId)
                    }}
                  >
                    <IonIcon icon={bluetooth}></IonIcon>
                    <IonLabel>Start updating location</IonLabel>
                  </IonButton>
                  <IonButton
                    id='start-updating-location-button-information'
                    fill='clear'
                    className='information-button'
                  >
                    <IonIcon
                      slot='icon-only'
                      icon={informationCircle}
                      color='warning'
                      size='large'
                    />
                  </IonButton>
                  <IonPopover
                    trigger='start-updating-location-button-information'
                    triggerAction='click'
                  >
                    <IonContent class='ion-padding'>
                      Start projecting the user location on the route currently
                      showed on the map. This need that a route has already been
                      created.
                    </IonContent>
                  </IonPopover>
                </div>
                <div>
                  <IonButton
                    onClick={() => {
                      stopWatchPosition(routeId)
                    }}
                  >
                    <IonIcon icon={bluetooth}></IonIcon>
                    <IonLabel>Stop updating location</IonLabel>
                  </IonButton>
                  <IonButton
                    id='stop-updating-location-button-information'
                    fill='clear'
                    className='information-button'
                  >
                    <IonIcon
                      slot='icon-only'
                      icon={informationCircle}
                      color='warning'
                      size='large'
                    />
                  </IonButton>
                  <IonPopover
                    trigger='stop-updating-location-button-information'
                    triggerAction='click'
                  >
                    <IonContent class='ion-padding'>
                      Stop projecting the user location on the route currently
                      showed on the map.
                    </IonContent>
                  </IonPopover>
                </div>
              </div>
            </IonAccordion>
          )}

          <IonAccordion value='beacons-simulation'>
            <IonItem slot='header' color='light' key='beaconsSimulation'>
              <IonLabel>Beacons simulation</IonLabel>
            </IonItem>
            <div className='ion-padding' slot='content'>
              <div>
                <IonText>
                  Change the beacon to simulate, also show the current beacon
                  simulated. The list of beacons to simulate is hardcoded on the
                  app.
                </IonText>
              </div>
              <div>
                <IonButton
                  onClick={() => setCurrentBeaconIndex(currentBeaconIndex + 1)}
                >
                  <IonIcon icon={caretForward}></IonIcon>
                  <IonLabel>Simulate Next Beacon</IonLabel>
                </IonButton>
                <IonButton
                  id='simulate-beacon-button-information'
                  fill='clear'
                  className='information-button'
                >
                  <IonIcon
                    slot='icon-only'
                    icon={informationCircle}
                    color='warning'
                    size='large'
                  />
                </IonButton>
                <IonPopover
                  trigger='simulate-beacon-button-information'
                  triggerAction='click'
                >
                  <IonContent class='ion-padding'>
                    Change to next beacon to simulate. If has not simulated,
                    start to simulate the first beacon.
                  </IonContent>
                </IonPopover>
              </div>
              <div>
                <IonText>Current beacon {currentSimulatedBeacon}</IonText>
              </div>
            </div>
          </IonAccordion>

          {newMap && (
            <IonAccordion value='pin-and-camera'>
              <IonItem slot='header' color='light' key='markers'>
                <IonLabel>Markers and Camera</IonLabel>
              </IonItem>
              <div className='ion-padding' slot='content'>
                <div>
                  <IonText>Add pin and change camera angle and zoom.</IonText>
                </div>
                <div>
                  <IonButton onClick={addMarker}>
                    <IonIcon icon={location}></IonIcon>
                    <IonText>Indoor</IonText>
                  </IonButton>
                  <IonButton
                    id='indoor-pin-button-information'
                    fill='clear'
                    className='information-button'
                  >
                    <IonIcon
                      slot='icon-only'
                      icon={informationCircle}
                      color='warning'
                      size='large'
                    />
                  </IonButton>
                  <IonPopover
                    trigger='indoor-pin-button-information'
                    triggerAction='click'
                  >
                    <IonContent class='ion-padding'>WIP</IonContent>
                  </IonPopover>
                </div>
                <div>
                  <IonButton onClick={addOutdoorMarker}>
                    <IonIcon icon={location}></IonIcon>
                    <IonText> Outdoor</IonText>
                  </IonButton>
                  <IonButton
                    id='outdoor-pin-button-information'
                    fill='clear'
                    className='information-button'
                  >
                    <IonIcon
                      slot='icon-only'
                      icon={informationCircle}
                      color='warning'
                      size='large'
                    />
                  </IonButton>
                  <IonPopover
                    trigger='outdoor-pin-button-information'
                    triggerAction='click'
                  >
                    <IonContent class='ion-padding'>WIP</IonContent>
                  </IonPopover>
                </div>
                <div>
                  <IonButton onClick={setCamera}>
                    <IonIcon icon={cameraOutline}></IonIcon>
                  </IonButton>
                  <IonButton
                    id='camera-button-information'
                    fill='clear'
                    className='information-button'
                  >
                    <IonIcon
                      slot='icon-only'
                      icon={informationCircle}
                      color='warning'
                      size='large'
                    />
                  </IonButton>
                  <IonPopover
                    trigger='camera-button-information'
                    triggerAction='click'
                  >
                    <IonContent class='ion-padding'>WIP</IonContent>
                  </IonPopover>
                </div>
              </div>
            </IonAccordion>
          )}
        </IonAccordionGroup>

        <IonModal
          id='example-modal'
          isOpen={isOpen}
          className='ion-padding modal-demo'
        >
          <IonHeader>
            <IonToolbar>
              <IonButtons slot='start'>
                <IonButton onClick={() => setIsOpen(false)}>Close</IonButton>
              </IonButtons>
              <IonTitle>Route Options: </IonTitle>
              <IonButtons slot='end'>
                <IonButton
                  onClick={() => {
                    startRoute(startPosition, finalPosition)
                    setIsOpen(false)
                  }}
                >
                  Start <IonIcon icon={walk}></IonIcon>
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className='ion-padding'>
            <IonRow>
              <IonCol>
                <IonCardHeader>
                  {' '}
                  <IonCardTitle> From: </IonCardTitle>
                </IonCardHeader>
                <IonList>
                  <IonSelect
                    id='start_point'
                    value={startPosition}
                    onIonChange={(event) => {
                      if (event.detail.value === undefined) return
                      setStartPosition(event.detail.value)
                    }}
                    interfaceOptions={{
                      translucent: false,
                      cssClass: 'actionSheet',
                    }}
                  >
                    <IonSelectOption value={-1}>User Position</IonSelectOption>
                    {places.map((place, i) => (
                      <IonSelectOption value={i} key={place.id}>
                        <IonLabel class='ion-text-wrap'>
                          {place.title?.default} -{' '}
                          {place.inFloor
                            ? getFloorNameById(place.inFloor[0])
                            : ''}
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
                <IonCardHeader>
                  {' '}
                  <IonCardTitle> To: </IonCardTitle>
                </IonCardHeader>
                <IonList>
                  <IonSelect
                    id='final_point'
                    value={finalPosition}
                    onIonChange={(event) => {
                      if (event.detail.value === undefined) return
                      setFinalPosition(event.detail.value)
                    }}
                    interfaceOptions={{
                      translucent: false,
                      cssClass: 'actionSheet',
                    }}
                  >
                    <IonSelectOption value={-1}>User Position</IonSelectOption>
                    {places.map((place, i) => (
                      <IonSelectOption value={i} key={place.id}>
                        {place.title?.default} -{' '}
                        {place.inFloor
                          ? getFloorNameById(place.inFloor[0])
                          : ''}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonList>
              </IonCol>
            </IonRow>

            <IonRow>
              <IonCol>
                <IonCardHeader>
                  {' '}
                  <IonCardTitle> Route Accessibility</IonCardTitle>
                </IonCardHeader>
                <IonList>
                  <IonRadioGroup
                    id='accessibility'
                    value={withMobility ? '1' : '0'}
                    onIonChange={(event) => {
                      console.log('pre cambio de variable', withMobility)
                      setWithMobility(event.detail.value !== '0')
                    }}
                  >
                    <IonItem>
                      <IonLabel>Walking</IonLabel>
                      <IonRadio slot='end' value='0'></IonRadio>
                    </IonItem>
                    <IonItem key='accessible'>
                      <IonLabel>Accessible</IonLabel>
                      <IonRadio slot='end' value='1'></IonRadio>
                    </IonItem>
                  </IonRadioGroup>
                </IonList>
              </IonCol>

              <IonCol>
                <IonCardHeader>
                  {' '}
                  <IonCardTitle>Announce Format</IonCardTitle>
                </IonCardHeader>

                <IonList>
                  <IonRadioGroup
                    id='announce-format'
                    value={announceFormat}
                    onIonChange={(event) => {
                      if (event.detail.value === undefined) return
                      if (isOpen) {
                        setAnnounceFormat(event.detail.value.toString())
                      }
                    }}
                  >
                    <IonItem>
                      <IonLabel>RELATIVE</IonLabel>
                      <IonRadio slot='end' value='RELATIVE'></IonRadio>
                    </IonItem>

                    <IonItem key='cardinal'>
                      <IonLabel>CARDINAL</IonLabel>
                      <IonRadio slot='end' value='CARDINAL'></IonRadio>
                    </IonItem>

                    <IonItem key='clock'>
                      <IonLabel>CLOCK</IonLabel>
                      <IonRadio slot='end' value='CLOCK'></IonRadio>
                    </IonItem>
                  </IonRadioGroup>
                </IonList>
              </IonCol>
              <IonCol>
                <IonCardHeader>
                  {' '}
                  <IonCardTitle> Announce Unit System</IonCardTitle>
                </IonCardHeader>
                <IonList>
                  <IonRadioGroup
                    id='unit-metric'
                    value={unitSystem}
                    onIonChange={(event) => {
                      if (event.detail.value === undefined) return
                      if (isOpen) {
                        setUnitSystem(event.detail.value.toString())
                      }
                    }}
                  >
                    <IonItem key='metric'>
                      <IonLabel>METRIC</IonLabel>
                      <IonRadio slot='end' value='METRIC'></IonRadio>
                    </IonItem>

                    <IonItem key='imperial'>
                      <IonLabel>IMPERIAL</IonLabel>
                      <IonRadio slot='end' value='IMPERIAL'></IonRadio>
                    </IonItem>

                    <IonItem key='steps'>
                      <IonLabel>STEPS</IonLabel>
                      <IonRadio slot='end' value='STEPS'></IonRadio>
                    </IonItem>
                  </IonRadioGroup>
                </IonList>
              </IonCol>
              <IonCol>
                <IonCardHeader>
                  {' '}
                  <IonCardTitle> Language</IonCardTitle>
                </IonCardHeader>
                <IonList>
                  <IonRadioGroup
                    id='language'
                    value={instructionsLanguage}
                    onIonChange={(event) => {
                      setInstructionsLanguage(event.detail.value.toString())
                    }}
                  >
                    <IonItem key='langDefault'>
                      <IonLabel>SYSTEM</IonLabel>
                      <IonRadio slot='end' value='system' />
                    </IonItem>

                    <IonItem key='langES'>
                      <IonLabel>SPANISH</IonLabel>
                      <IonRadio slot='end' value='es' />
                    </IonItem>

                    <IonItem key='langEN'>
                      <IonLabel>ENGLISH</IonLabel>
                      <IonRadio slot='end' value='en' />
                    </IonItem>
                  </IonRadioGroup>
                </IonList>
              </IonCol>
              <IonCol>
                <IonCardHeader>
                  <IonCardTitle>Behind Style</IonCardTitle>
                </IonCardHeader>
                <IonRadioGroup
                  id='behind-color'
                  value={behindStyle}
                  onIonChange={(e) => setBehindStyle(e.detail.value)}
                >
                  {behindStyleOptions.map((option) => (
                    <IonItem key={'behind-' + option}>
                      <IonLabel>{option}</IonLabel>
                      <IonRadio slot='end' value={option}></IonRadio>
                    </IonItem>
                  ))}
                </IonRadioGroup>
              </IonCol>
              <IonCol>
                <IonCardHeader>
                  <IonCardTitle>Ahead Color</IonCardTitle>
                </IonCardHeader>
                <IonRadioGroup
                  id='ahead-color'
                  value={aheadStyle}
                  onIonChange={(e) => setAheadStyle(e.detail.value)}
                >
                  {aheadStyleOptions.map((option) => (
                    <IonItem key={'ahead-' + option}>
                      <IonLabel>{option}</IonLabel>
                      <IonRadio slot='end' value={option}></IonRadio>
                    </IonItem>
                  ))}
                </IonRadioGroup>
              </IonCol>
            </IonRow>
          </IonContent>
        </IonModal>
        <IonRow>
          <IonCol>
            <IonToast
              isOpen={showToast1}
              onDidDismiss={() => setShowToast1(false)}
              message='Map loaded'
              duration={1500}
            />
          </IonCol>
        </IonRow>
      </IonGrid>
      {
        // <img src='/assets/icon/location.png' alt='icono de ubicación' />
        // Para chequear que esta bien colocada la imagen
      }
    </>
  )
}
export default ExploreContainer
