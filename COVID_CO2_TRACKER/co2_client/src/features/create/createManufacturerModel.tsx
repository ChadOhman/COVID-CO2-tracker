import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {Modal, Button, Form} from 'react-bootstrap';
import {useLocation, useHistory} from 'react-router-dom'
// import {ManufacturerDeviceModelsTable} from '../deviceModels/DeviceModelsTable';

import {API_URL} from '../../utils/UrlPath';
import {postRequestOptions, userRequestOptions} from '../../utils/DefaultRequestOptions';
import {formatErrors, ErrorObjectType} from '../../utils/ErrorObject';
import {fetchJSONWithChecks} from '../../utils/FetchHelpers';
import {setEnteredManufacturerText/*, setManufacturerFeedbackText*/} from './creationSlice';
import {selectEnteredManufacturerText} from './creationSlice';


import {SingleManufacturerInfoResponse} from '../manufacturers/manufacturerSlice';

import {ManufacturersArray} from '../manufacturers/Manufacturers';




interface NewManufacturerResponse {
    name: string,
    id: number,
    errors?: Array<ErrorObjectType>
}

// type AllManufacturersArrayReturnType = ManufacturersArray & withErrors;

const MANUFACTURERS_URL = API_URL + '/manufacturers';

function responseToManufacturersArrayStrongType(response: any): ManufacturersArray {
    console.assert(response.manufacturers !== undefined);
    if (response.manufacturers !== undefined) {
        if (response.manufacturers.length > 0) {
            //https://app.codacy.com/gh/ariccio/COVID-CO2-tracker/file/53649034797/issues/source?bid=22403719&fileBranchId=22403719#l43
            //https://stackoverflow.com/a/55701580/625687
            for (let i = 0; i < parseInt(response.manufacturers.length); ++i) {
                console.assert(response.manufacturers[i].name !== undefined);
                console.assert(response.manufacturers[i].id !== undefined);
            }
        }
    }
    if (response.errors !== undefined) {
        console.assert(response.errors !== null);
    }
    return response;
}


// type SingleManufacturerInfoReturnType = SingleManufacturerInfo & withErrors;


function manufacturerInfoResponseToStrongType(response: any): SingleManufacturerInfoResponse {
    console.assert(response.manufacturer_id !== undefined);
    console.assert(response.name !== undefined);
    console.assert(response.models !== undefined);
    if (response.models.length === undefined) {
        throw new Error("missing property length!");
    }
    for (let i = 0; i < parseInt(response.models.length); i++) {
        console.assert(response.models[i].model_id !== undefined);
        console.assert(response.models[i].name !== undefined);
        console.assert(response.models[i].count !== undefined);
    }
    if (response.errors !== undefined) {
        console.assert(response.errors !== null);
    }
    return response;
}


export async function queryManufacturerInfo(manufacturer_id: number): Promise<SingleManufacturerInfoResponse> {
    // if (manufacturer_id === '-1') {
    //     return null;
    // }
    const MANUFACTURER_SHOW_URL = (MANUFACTURERS_URL + `/${manufacturer_id}`);
    const fetchCallback = async (awaitedResponse: Response): Promise<SingleManufacturerInfoResponse> => {
        return manufacturerInfoResponseToStrongType(await awaitedResponse.json());
    }
    const result = fetchJSONWithChecks(MANUFACTURER_SHOW_URL, userRequestOptions(), 200, false, fetchCallback, fetchCallback) as Promise<SingleManufacturerInfoResponse>;
    return result;
    // try {
    //     const rawResponse: Promise<Response> = fetch(MANUFACTURER_SHOW_URL, userRequestOptions() );
    //     const awaitedResponse = await rawResponse;
    //     // const jsonResponse = await awaitedResponse.json();
    //     // const parsedJSONResponse = await jsonResponse;
    //     if (fetchFailed(awaitedResponse, 200, false)) {
    //         //Errors handled up the stack.
    //         // if (response.errors !== undefined) {
    //         //     return manufacturerInfoResponseToStrongType(response);
    //         // }
    //     }
        
    //     // debugger;
    //     return manufacturerInfoResponseToStrongType(await awaitedResponse.json());
    // }
    // catch (error) {
    //     fetchFilter(error);
    //   }
}


export async function queryManufacturers(): Promise<ManufacturersArray> {
    const ALL_MANUFACTURERS_URL = (API_URL + '/all_manufacturers');
    const fetchCallback = async (awaitedResponse: Response): Promise<ManufacturersArray> => {
        return responseToManufacturersArrayStrongType(await awaitedResponse.json());
    }

    const result = fetchJSONWithChecks(ALL_MANUFACTURERS_URL, userRequestOptions(), 200, false, fetchCallback, fetchCallback) as Promise<ManufacturersArray>;
    return result;
    // try {
    //     const rawResponse: Promise<Response> = fetch(ALL_MANUFACTURERS_URL, userRequestOptions() );
    //     const awaitedResponse = await rawResponse;
    //     // const jsonResponse = await awaitedResponse.json();
    //     // const parsedJSONResponse = await jsonResponse;
    //     if(fetchFailed(awaitedResponse, 200, false)) {
    //         //errors handled up the stack.
    //         // debugger;
    //         // throw new Error("hmm");
    //     }
    //     return responseToManufacturersArrayStrongType(await awaitedResponse.json());
    // }
    // catch (error) {
    //     fetchFilter(error);
    // }
}

function newManufacturerRequestInit(newManufacturerName: string): RequestInit {
    const defaultOptions = postRequestOptions();
    const newOptions = {
        ...defaultOptions,
        body: JSON.stringify({
            manufacturer: {
                name: newManufacturerName
            }
        })
    }
    return newOptions;
}

function responseToNewManufacturerStrongType(response: any): NewManufacturerResponse {
    if (response.errors !== undefined) {
        console.assert(response.name !== undefined);
        console.assert(response.id !== undefined);
    }
    return response;
}

async function createNewManufacturer(name: string): Promise<NewManufacturerResponse> {
    const fetchFailedCallback = async (awaitedResponse: Response): Promise<NewManufacturerResponse> => {
        console.error("failed to create new manufacturer");
        return responseToNewManufacturerStrongType(await awaitedResponse.json());
    }
    const fetchSuccessCallback = async (awaitedResponse: Response): Promise<NewManufacturerResponse> => {
        return responseToNewManufacturerStrongType(await awaitedResponse.json());
    }

    const result = fetchJSONWithChecks(MANUFACTURERS_URL, newManufacturerRequestInit(name), 201, true, fetchFailedCallback, fetchSuccessCallback) as Promise<NewManufacturerResponse>;
    return result;
    // try {
    //     const rawResponse: Promise<Response> = fetch(MANUFACTURERS_URL, newManufacturerRequestInit(name));
    //     const awaitedResponse = await rawResponse;
    //     // const jsonResponse = await awaitedResponse.json();
    //     // const parsedJSONResponse = await jsonResponse;
    //     if(fetchFailed(awaitedResponse, 201, true)) {
    //         // Now handled kinda correctly by frontend
    //         console.error("failed to create new manufacturer");
    //     }
    //     return responseToNewManufacturerStrongType(await awaitedResponse.json());
    // }
    // catch (error) {
    //     fetchFilter(error);
    // }
}




interface manufacturerDialogProps {
    showAddManufacturer: boolean,
    setShowAddManufacturer: React.Dispatch<React.SetStateAction<boolean>>
}

const submitHandler = (enteredManufacturerText: string, setShowAddManufacturer: React.Dispatch<React.SetStateAction<boolean>>, history: ReturnType<typeof useHistory>) => {
    const result = createNewManufacturer(enteredManufacturerText);
    result.then((response) => {
        if (response.errors !== undefined) {
            alert(formatErrors(response.errors));

            //Still having trouble.
            // dispatch(setManufacturerFeedbackText(firstErrorAsString(response.errors)));
            
        }
        else {
            setShowAddManufacturer(false)
            console.log(history);
            history.goBack();
            console.log(history);
            debugger;
        }
    }).catch((errors) => {
        alert(errors.message);
    })

}

const submit = (event: React.MouseEvent<HTMLElement, MouseEvent>, enteredManufacturerText: string, setShowAddManufacturer: React.Dispatch<React.SetStateAction<boolean>>, history: ReturnType<typeof useHistory>) => {
    event.stopPropagation();
    event.preventDefault();
    submitHandler(enteredManufacturerText, setShowAddManufacturer, history);
}

const cancelHandler = (event: React.MouseEvent<HTMLElement, MouseEvent>, setShowAddManufacturer: React.Dispatch<React.SetStateAction<boolean>>, history: ReturnType<typeof useHistory>) => {
    // event.stopPropagation();
    // event.preventDefault();
    setShowAddManufacturer(false);
    history.goBack();
}

const hideHandler = (setShowAddManufacturer: React.Dispatch<React.SetStateAction<boolean>>, history: ReturnType<typeof useHistory>) => {
    setShowAddManufacturer(false);
    history.goBack();
}

const onChangeEvent = (event: React.FormEvent<HTMLFormElement>, dispatch: any) => {
    const text = (event.currentTarget.elements[0] as HTMLInputElement).value;
    dispatch(setEnteredManufacturerText(text));
}

const onSubmitEvent = (event: React.FormEvent<HTMLFormElement>, enteredManufacturerText: string, setShowAddManufacturer: React.Dispatch<React.SetStateAction<boolean>>, history: ReturnType<typeof useHistory>) => {
    event.stopPropagation();
    event.preventDefault();
    submitHandler(enteredManufacturerText, setShowAddManufacturer, history);
    // debugger;
}

const ModalHeader = () =>
    <Modal.Header closeButton>
        <Modal.Title>Add a manufacturer to the database</Modal.Title>
    </Modal.Header>

export const CreateManufacturerModalDialog: React.FC<manufacturerDialogProps> = (props: manufacturerDialogProps) => {
    const location = useLocation();
    const enteredManufacturerText = useSelector(selectEnteredManufacturerText);
    const dispatch = useDispatch();
    const history = useHistory();

    // debugger;
    //TODO: this is not how you do nested routes.
    if (location.pathname.endsWith('create')) {
        props.setShowAddManufacturer(true);
    }
    if (!props.showAddManufacturer) {
        return null;
    }
    return (
        <Modal show={props.showAddManufacturer} onHide={() => hideHandler(props.setShowAddManufacturer, history)}>
            <ModalHeader/>
            <Modal.Body>
                (Please reduce administrative burden, don't add nuisance manufacturers. TODO: styling this text)
                <Form noValidate onChange={(event) => onChangeEvent(event, dispatch)} onSubmit={(event) => onSubmitEvent(event, enteredManufacturerText, props.setShowAddManufacturer, history)}>
                    <Form.Label>
                        Manufacturer name
                    </Form.Label>
                    <Form.Control type="text" placeholder="Contoso"></Form.Control>
                    {/* <Form.Control.Feedback type="invalid">{feedbackText}</Form.Control.Feedback> */}
                </Form>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={(event) => cancelHandler(event, props.setShowAddManufacturer, history)}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={(event) => submit(event, enteredManufacturerText, props.setShowAddManufacturer, history)}>
                    Submit new manufacturer
                </Button>
            </Modal.Footer>

        </Modal>
    )

}



// export const Manufacturers: React.FC<{}> = () => {

//     return (
//         <>

//         </>
//     )

// }
