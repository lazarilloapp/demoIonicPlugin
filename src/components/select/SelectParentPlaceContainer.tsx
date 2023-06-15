import './SelectParentPlaceContainer.css'

import { LazarilloUtils } from '@lzdevelopers/lazarillo-maps';
import { IonButton, IonCol, IonContent, IonGrid, IonRow, IonSelect, IonSelectOption, useIonViewWillEnter } from "@ionic/react";
import ExploreContainer from "../explore/ExploreContainer";
import { useEffect, useState } from 'react';

import { Place } from '../places/Place';

interface ContainerProps { }

const SelectParentPlaceContainer: React.FC<ContainerProps> = () => {
    const [showExplore, setShowExplore] = useState(false);
    const [parentPlacesList, setParentPlacesList] = useState<Place[]>([]);
    const [parentPlaceSelected, setParentPlace] = useState<Place>();

    const apiKey = process.env.REACT_APP_YOUR_API_KEY_HERE
    ? process.env.REACT_APP_YOUR_API_KEY_HERE
    : '';

    useIonViewWillEnter(() => {
        getParentPlaces()
    });

    const showParentPlaceMap = (e: CustomEvent) => {
        const placeId = e.detail.value;
        console.log("num of places", parentPlacesList.length)
        console.log("selected place id: ", placeId)
        const parentPlace = parentPlacesList.find(p => p.id === placeId)
        setParentPlace(parentPlace);
    }

    const getParentPlaces = async () => {
        await LazarilloUtils.fetchParentPlaces(apiKey)
        .then(async (response) => {
            await response.json().then((data) => {
                setParentPlacesList(data);
            })
        })
    }

    return (
            showExplore ? <ExploreContainer place={parentPlaceSelected}/> : 
            <IonContent>
                <IonGrid>
                    <IonCol>
                        <IonRow className='center-row'>
                            Select a parent place to use the map:
                        </IonRow>
                        <IonRow className='center-row'>
                            <IonSelect
                                placeholder="Select place"
                                onIonChange={showParentPlaceMap}>
                                {
                                    parentPlacesList.map((place) => {
                                        return (<IonSelectOption key={place.id} value={place.id}>{place.title.default}</IonSelectOption>)
                                    })
                                }
                                
                            </IonSelect>
                        </IonRow>
                        <IonButton
                        onClick={() => setShowExplore(true)}>Show Map</IonButton>
                    </IonCol>
                </IonGrid>
            </IonContent>
    )
}
export default SelectParentPlaceContainer;