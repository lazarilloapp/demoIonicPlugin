import './SelectParentPlaceContainer.css'

import { LazarilloUtils } from '@lzdevelopers/lazarillo-maps';
import { IonButton, IonCol, IonContent, IonGrid, IonItem, IonLabel, IonRadio, IonRadioGroup, IonRow, useIonViewWillEnter } from "@ionic/react";
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Place } from '../places/Place';

interface ContainerProps { 

}

const SelectParentPlaceContainer: React.FC<ContainerProps> = () => {
    const [isSelected, setIsSelected] = useState(true);
    const [parentPlacesList, setParentPlacesList] = useState<Place[]>([]);
    const [parentPlaceSelected, setParentPlace] = useState<Place>();

    const history = useHistory();

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
        setIsSelected(false);
    }

    const getParentPlaces = async () => {
        await LazarilloUtils.fetchParentPlaces(apiKey)
        .then(async (response) => {
            await response.json().then((data) => {
                setParentPlacesList(data);
            })
        })
    }

    const handleOnClick = () => {
        console.log(parentPlaceSelected?.alias);
        if (parentPlaceSelected !== undefined){
            history.push(`/place/${parentPlaceSelected.alias}`);
        }
    }
    

    return (
            <IonGrid>
                <IonCol>
                    <IonRow className='center-row'>
                        Select a parent place to use the map:
                    </IonRow>
                    <IonRow className='center-row'>
                        <IonRadioGroup
                            onIonChange={showParentPlaceMap}>
                            {
                                parentPlacesList.map((place) => {
                                    return (
                                        <IonItem>
                                            <IonLabel>{place.title.default}</IonLabel>
                                            <IonRadio mode="ios" slot="end" value={place.id}></IonRadio>
                                        </IonItem>
                                    )
                                })
                            }
                            
                        </IonRadioGroup>
                    </IonRow>
                    <IonRow className='button-style'>
                        <IonButton disabled={isSelected} onClick={handleOnClick}>
                            Show Map
                        </IonButton>
                    </IonRow>
                </IonCol>
            </IonGrid>
    )
}
export default SelectParentPlaceContainer;