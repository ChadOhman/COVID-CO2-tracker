/// <reference types="web-bluetooth" />
import { Button } from "react-bootstrap";

declare module BluetoothUUID {
    export function getService(name: BluetoothServiceUUID ): string;
    export function getCharacteristic(name: BluetoothCharacteristicUUID): string;
    export function getDescriptor(name: BluetoothDescriptorUUID): string;
    export function canonicalUUID(alias: number): string;
}

const SENSOR_SERVICE_UUID = 'f0cd1400-95da-4f4b-9ac8-aa55d312af0c'




const characteristicUUIDDescriptions = new Map([
    ["f0cd1503-95da-4f4b-9ac8-aa55d312af0c", "Aranet4: CO2 measurements"],
    ["f0cd3001-95da-4f4b-9ac8-aa55d312af0c", "Aranet4: CO2 measurements, interval, time since measurements"],
    ["f0cd2002-95da-4f4b-9ac8-aa55d312af0c", "Aranet4: measurement interval"],
    ["f0cd2004-95da-4f4b-9ac8-aa55d312af0c", "Aranet4: seconds since last update"],
    ["f0cd2001-95da-4f4b-9ac8-aa55d312af0c", "Aranet4: total number of measurements"],
    ["00002a00-0000-1000-8000-00805f9b34fb", "Aranet4: Device name"],
    ["00002a19-0000-1000-8000-00805f9b34fb", "Aranet4: Battery level"],
    ["00002a24-0000-1000-8000-00805f9b34fb", "Aranet4: Model number"],
    ["00002a25-0000-1000-8000-00805f9b34fb", "Aranet4: Serial number"],
    ["00002a27-0000-1000-8000-00805f9b34fb", "Aranet4: Hardware revision"],
    ["00002a28-0000-1000-8000-00805f9b34fb", "Aranet4: Software revision"],
    ["00002a29-0000-1000-8000-00805f9b34fb", "Aranet4: Manufacturer name (?)"]
]);


function aranet4DeviceRequestOptions(): RequestDeviceOptions {
    const filter: BluetoothLEScanFilter = {
        services: [SENSOR_SERVICE_UUID]
    }
    const services: BluetoothServiceUUID[] = [
        'device_information',
        'battery_service',
      ];

    const deviceRequestOptions: RequestDeviceOptions = {
        filters: [filter],
        optionalServices: services,
        acceptAllDevices: false
    }
    return deviceRequestOptions;

}

function dumpBluetoothCharacteristicProperties(properties: BluetoothCharacteristicProperties, serviceIndex: number, characteristicIndex: number): void {
    // readonly broadcast: boolean;
    // readonly read: boolean;
    // readonly writeWithoutResponse: boolean;
    // readonly write: boolean;
    // readonly notify: boolean;
    // readonly indicate: boolean;
    // readonly authenticatedSignedWrites: boolean;
    // readonly reliableWrite: boolean;
    // readonly writableAuxiliaries: boolean;

    
    console.log(`\tservices[${serviceIndex}], characteristics[${characteristicIndex}].properties:`);
    if (properties.broadcast) {
        console.log(`\t\tbroadcast: ${properties.broadcast}`);
    }
    if (properties.read) {
        console.log(`\t\tread: ${properties.read}`);
    }
    if (properties.writeWithoutResponse) {
        console.log(`\t\twriteWithoutResponse: ${properties.writeWithoutResponse}`);
    }
    if (properties.write) {
        console.log(`\t\twrite: ${properties.write}`);
    }
    if (properties.notify) {
        console.log(`\t\tnotify: ${properties.notify}`);
    }
    if (properties.indicate) {
        console.log(`\t\tindicate: ${properties.indicate}`);
    }
    if (properties.authenticatedSignedWrites) {
        console.log(`\t\tauthenticatedSignedWrites: ${properties.authenticatedSignedWrites}`);
    }
    if (properties.reliableWrite) {
        console.log(`\t\treliableWrite: ${properties.reliableWrite}`);
    }
    if (properties.writableAuxiliaries) {
        console.log(`\t\twritableAuxiliaries: ${properties.writableAuxiliaries}`);
    }
}

async function hasGetDevices() {
    const devices = await navigator.bluetooth.getDevices()
    console.log("bluetooth devices:");
    console.table(devices);
    if (devices.length === 0) {
        debugger;
    }


}

async function bluetoothTestingStuffFunc() {
    console.log(navigator.bluetooth);
    const available = await navigator.bluetooth.getAvailability();
    console.log("bluetooth available: ", available);
    if (!available) {
        alert("bluetooth not available?");
        debugger;
    }
    if ((navigator.bluetooth.getDevices as any)) {
        hasGetDevices();
    }
    const options = aranet4DeviceRequestOptions();

    //https://developer.mozilla.org/en-US/docs/Web/API/Bluetooth/requestDevice
    const device = await navigator.bluetooth.requestDevice(options);
    // const co2_descriptor = BluetoothUUID.getCharacteristic('f0cd3001-95da-4f4b-9ac8-aa55d312af0c');
    // console.log(co2_descriptor);
    // debugger;
    console.log(`device.id: ${device.id}`);
    console.log(`device.name: ${device.name}`);
    console.log(`device.uuids: ${device.uuids}`);

    if (device.gatt === undefined) {
        debugger;
        return;
    }
    const deviceServer = await device.gatt.connect();


    const services = await deviceServer.getPrimaryServices();
    console.log(`Got services (length: ${services.length}):`)
    for (let serviceIndex = 0; serviceIndex < services.length; serviceIndex++) {
        console.log(`services[${serviceIndex}].uuid: ${services[serviceIndex].uuid}`);
        console.log(`services[${serviceIndex}].isPrimary: ${services[serviceIndex].isPrimary}`);

        const characteristics = await services[serviceIndex].getCharacteristics();

        console.log(`Got characteristics (length ${characteristics.length}):`)
        for (let characteristicIndex = 0; characteristicIndex < characteristics.length; characteristicIndex++) {
            console.log(`\tservices[${serviceIndex}], characteristics[${characteristicIndex}].uuid: ${characteristics[characteristicIndex].uuid}`);
            if (characteristicUUIDDescriptions.has(characteristics[characteristicIndex].uuid)) {
                console.log(`\t\tKnown characteristic! ${characteristicUUIDDescriptions.get(characteristics[characteristicIndex].uuid)}`);
            }
            console.log(`\tservices[${serviceIndex}], characteristics[${characteristicIndex}].value: ${characteristics[characteristicIndex].value}`);
            dumpBluetoothCharacteristicProperties(characteristics[characteristicIndex].properties, serviceIndex, characteristicIndex);
            
            if (characteristics[characteristicIndex].properties.read) {
                try {
                    const data = await characteristics[characteristicIndex].readValue();
                    console.log(`\t\tdata: ${data.buffer}`);
                }
                catch(e) {
                    if (e instanceof DOMException) {
                        console.error(`\t\tCannot read from ${characteristics[characteristicIndex].uuid}!`)
                    }
                    else {
                        throw e;
                    }
                }
            }
            console.log('');
        }
        console.log('\n');
    }

    debugger;
}

export function BluetoothTesting(): JSX.Element {
    const onClickButton = () => {
        bluetoothTestingStuffFunc();
    }
    return (
        <div>
            Cool things are in progress...
            <br/>
            <Button onClick={onClickButton}>Do something secret</Button>
        </div>
    )
}