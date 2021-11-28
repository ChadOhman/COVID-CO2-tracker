import React, {useEffect, useRef, Suspense} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {useParams} from 'react-router-dom';
// import {useLocation} from 'react-router-dom';
import { updatePlacesInfoFromBackend } from '../../utils/QueryPlacesInfo';
import { selectPlaceExistsInDatabase, selectPlacesInfoErrors, selectPlacesInfoFromDatabase } from './placesSlice';

// import { renderSelectedPlaceInfo} from '../home/HomePage';
import { selectMapsAPIKey, selectMapsAPIKeyErrorState, setMapsAPIKey, setMapsAPIKeyErrorState } from '../google/googleSlice';
import { getGoogleMapsJavascriptAPIKey } from '../../utils/GoogleAPIKeys';
import { RenderFromDatabaseNoGoogleParam } from './RenderPlaceFromDatabase';

import {PlaceDetails} from './PlaceDetails';

const DivElem = (props: {elementRef: React.MutableRefObject<HTMLDivElement | null>}) => {
    return (
        <div id='ghost-map' ref={props.elementRef}>
        </div>
    );
}

export const Place: React.FC<{}> = () => {
    // console.log("place")
    // const location = useLocation();
    const dispatch = useDispatch();
    const selectedPlaceInfoFromDatabase = useSelector(selectPlacesInfoFromDatabase);
    const selectedPlaceInfoFromDatabaseErrors = useSelector(selectPlacesInfoErrors);
    const selectedPlaceExistsInDatabase = useSelector(selectPlaceExistsInDatabase);
    
    const mapsAPIKey = useSelector(selectMapsAPIKey);
    const mapsAPIKeyErrorState = useSelector(selectMapsAPIKeyErrorState);

    const {placeId} = useParams();

    const elementRef = useRef(null as HTMLDivElement | null);
    useEffect(() => {
        if (mapsAPIKey !== '') {
            return;
        }
        getGoogleMapsJavascriptAPIKey().then((key: string) => {
            dispatch(setMapsAPIKey(key));
        }).catch((error) => {
            dispatch(setMapsAPIKeyErrorState(error.message));
        });
    }, [dispatch, mapsAPIKey]);



    useEffect(() => {
        if (placeId === undefined) {
            return;
        }
        if (placeId === '') {
            return;
        }
        updatePlacesInfoFromBackend(placeId, dispatch);
    }, [dispatch, placeId]);

    if (placeId === undefined) {
        return (
            <div>
                <DivElem elementRef={elementRef}/>
                No place selected.
            </div>
        )
    }

    if (placeId === '') {
        return (
            <div>
                <DivElem elementRef={elementRef}/>
                placeId empty.
            </div>
        )
    }

    if (mapsAPIKeyErrorState !== '') {
        return (
            <div>
                Error loading maps API key: {mapsAPIKeyErrorState}
                <DivElem elementRef={elementRef}/>
            </div>
        );
    }
    if (mapsAPIKey === '') {
        return (
            <div>
                Loading maps API key...
                <DivElem elementRef={elementRef}/>
            </div>
        );
    }

    return (
        <div>
            Place {placeId}
            <Suspense fallback="loading translations...">
                <DivElem elementRef={elementRef}/>
                <PlaceDetails mapsAPIKey={mapsAPIKey} placeId={placeId} divRef={elementRef}/>
                <RenderFromDatabaseNoGoogleParam selectedPlaceInfoFromDatabase={selectedPlaceInfoFromDatabase} selectedPlaceInfoErrors={selectedPlaceInfoFromDatabaseErrors} selectedPlaceExistsInDatabase={selectedPlaceExistsInDatabase}/>
            </Suspense>
            <br/>
            There will be graphs and risk analysis here, eventually.
        </div>
    )
}