/// <reference types="web-bluetooth" />
import { parse } from "path";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { Button } from "react-bootstrap";

import {useDispatch} from 'react-redux';
import {useSelector} from 'react-redux';
import { setSelectedDevice } from "../deviceModels/deviceModelsSlice";

import * as Sentry from "@sentry/react";


import { selectCO2, selectDebugText, selectBluetoothAvailableError, setCO2, setDebugText, setBluetoothAvailableError, selectBluetoothAvailable, setBluetoothAvailable, setTemperature, selectTemperature, setBarometricPressure, selectBarometricPressure, selectHumidity, setHumidity, selectBattery, setBattery, setDeviceNameFromCharacteristic, setDeviceID, selectDeviceID, setDeviceName, selectDeviceName, selectDeviceNameFromCharacteristic, setAranet4MeasurementInterval, selectAranet4MeasurementInterval, setAranet4TotalMeasurements, selectAranet4TotalMeasurements, setModelNumberString, selectModelNumberString, setFirmwareRevisionString, selectFirmwareRevisionString, setHardwareRevisionString, selectHardwareRevisionString, setSoftwareRevisionString, selectSoftwareRevisionString, setManufacturerName, selectManufacturerNameString, setAranet4SecondsSinceLastMeasurement, selectAranet4SecondsSinceLastUpdate, appendDebugText, setAranet4Color, selectAranet4Color, selectAranet4Calibration, setAranet4Calibration } from "./bluetoothSlice";

declare module BluetoothUUID {
    export function getService(name: BluetoothServiceUUID ): string;
    export function getCharacteristic(name: BluetoothCharacteristicUUID): string;
    export function getDescriptor(name: BluetoothDescriptorUUID): string;
    export function canonicalUUID(alias: number): string;
}



//https://gist.github.com/beaufortfrancois/1323816074f7383cfa574811abd6ea9c


const SENSOR_SERVICE_UUID = 'f0cd1400-95da-4f4b-9ac8-aa55d312af0c'

const GENERIC_GATT_DEVICE_NAME_UUID = '00002a00-0000-1000-8000-00805f9b34fb';
const GENERIC_GATT_DEVICE_BATTERY_LEVEL_UUID = '00002a19-0000-1000-8000-00805f9b34fb';
const GENERIC_GATT_DEVICE_MODEL_NUMBER_STRING_UUID = '00002a24-0000-1000-8000-00805f9b34fb';
const GENERIC_GATT_SERIAL_NUMBER_STRING_UUID = '00002a25-0000-1000-8000-00805f9b34fb';
const GENERIC_GATT_HARDWARE_REVISION_STRING_UUID = '00002a27-0000-1000-8000-00805f9b34fb';
const GENERIC_GATT_SOFTWARE_REVISION_STRING_UUID = '00002a28-0000-1000-8000-00805f9b34fb';
const GENERIC_GATT_MANUFACTURER_NAME_STRING_UUID = '00002a29-0000-1000-8000-00805f9b34fb';
const GENERIC_GATT_FIRMWARE_REVISION_STRING_UUID = '00002a26-0000-1000-8000-00805f9b34fb';
const GENERIC_GATT_DEVICE_INFORMATION_SYSTEM_ID_UUID = '00002a23-0000-1000-8000-00805f9b34fb';
const GENERIC_GATT_PREFERRED_PERIPHERAL_CONNECTION_PARAMETERS = '00002a04-0000-1000-8000-00805f9b34fb';

const DEVICE_INFORMATION_SERVICE_UUID = '0000180a-0000-1000-8000-00805f9b34fb';
const GENERIC_ACCESS_SERVICE_UUID = '00001800-0000-1000-8000-00805f9b34fb';


const GENERIC_GATT_SERVICE_SHORT_ID_DESCRIPTIONS = new Map([
    //these are hex strings, without the 0x. Chrome zero extends the devices... so 0x1800 becomes 0x00001800.
    // This is a hack to make things easy.
    ['1800', "generic_access"],
    ['1801', "generic_attribute"],
    ['1802', "immediate_alert"],
    ['1803', "link_loss"],
    ['1804', "tx_power"],
    ['1805', "current_time"],
    ['1806', "reference_time_update"],
    ['1807', "next_dst_change"],
    ['1808', "glucose"],
    ['1809', "health_thermometer"],
    ['180A', "device_information"],
    ['180D', "heart_rate"],
    ['180E', "phone_alert_status"],
    ['180F', "battery_service"],
    ['1810', "blood_pressure"],
    ['1811', "alert_notification"],
    ['1812', "human_interface_device"],
    ['1813', "scan_parameters"],
    ['1814', "running_speed_and_cadence"],
    ['1815', "automation_io"],
    ['1816', "cycling_speed_and_cadence"],
    ['1818', "cycling_power"],
    ['1819', "location_and_navigation"],
    ['181A', "environmental_sensing"],
    ['181B', "body_composition"],
    ['181C', "user_data"],
    ['181D', "weight_scale"],
    ['181E', "bond_management"],
    ['181F', "continuous_glucose_monitoring"],
    ['1820', "internet_protocol_support"],
    ['1821', "indoor_positioning"],
    ['1822', "pulse_oximeter"],
    ['1823', "http_proxy"],
    ['1824', "transport_discovery"],
    ['1825', "object_transfer"],
    ['1826', "fitness_machine"],
    ['1827', "mesh_provisioning"],
    ['1828', "mesh_proxy"],
    ['1829', "reconnection_configuration"],
]);

const GENERIC_GATT_SERVICE_UUID_DESCRIPTIONS = new Map([
    [GENERIC_GATT_DEVICE_NAME_UUID, 'Device Name'],
    ['00002a01-0000-1000-8000-00805f9b34fb', 'Appearance'],
    ['00002a02-0000-1000-8000-00805f9b34fb', 'Peripheral Privacy Flag'],
    ['00002a03-0000-1000-8000-00805f9b34fb', 'Reconnection Address'],
    [GENERIC_GATT_PREFERRED_PERIPHERAL_CONNECTION_PARAMETERS, 'Peripheral Preferred Connection Parameters'],
    ['00002a05-0000-1000-8000-00805f9b34fb', 'Service Changed'],
    ['00002a06-0000-1000-8000-00805f9b34fb', 'Alert Level'],
    ['00002a07-0000-1000-8000-00805f9b34fb', 'Tx Power Level'],
    ['00002a08-0000-1000-8000-00805f9b34fb', 'Date Time'],
    ['00002a09-0000-1000-8000-00805f9b34fb', 'Day of Week'],
    ['00002a0a-0000-1000-8000-00805f9b34fb', 'Day Date Time'],
    ['00002a0b-0000-1000-8000-00805f9b34fb', 'Exact Time 100'],
    ['00002a0c-0000-1000-8000-00805f9b34fb', 'Exact Time 256'],
    ['00002a0d-0000-1000-8000-00805f9b34fb', 'DST Offset'],
    ['00002a0e-0000-1000-8000-00805f9b34fb', 'Time Zone'],
    ['00002a0f-0000-1000-8000-00805f9b34fb', 'Local Time Information'],
    ['00002a10-0000-1000-8000-00805f9b34fb', 'Secondary Time Zone'],
    ['00002a11-0000-1000-8000-00805f9b34fb', 'Time with DST'],
    ['00002a12-0000-1000-8000-00805f9b34fb', 'Time Accuracy'],
    ['00002a13-0000-1000-8000-00805f9b34fb', 'Time Source'],
    ['00002a14-0000-1000-8000-00805f9b34fb', 'Reference Time Information'],
    ['00002a15-0000-1000-8000-00805f9b34fb', 'Time Broadcast'],
    ['00002a16-0000-1000-8000-00805f9b34fb', 'Time Update Control Point'],
    ['00002a17-0000-1000-8000-00805f9b34fb', 'Time Update State'],
    ['00002a18-0000-1000-8000-00805f9b34fb', 'Glucose Measurement'],
    [GENERIC_GATT_DEVICE_BATTERY_LEVEL_UUID, 'Battery Level'],
    ['00002a1a-0000-1000-8000-00805f9b34fb', 'Battery Power State'],
    ['00002a1b-0000-1000-8000-00805f9b34fb', 'Battery Level State'],
    ['00002a1c-0000-1000-8000-00805f9b34fb', 'Temperature Measurement'],
    ['00002a1d-0000-1000-8000-00805f9b34fb', 'Temperature Type'],
    ['00002a1e-0000-1000-8000-00805f9b34fb', 'Intermediate Temperature'],
    ['00002a1f-0000-1000-8000-00805f9b34fb', 'Temperature Celsius'],
    ['00002a20-0000-1000-8000-00805f9b34fb', 'Temperature Fahrenheit'],
    ['00002a21-0000-1000-8000-00805f9b34fb', 'Measurement Interval'],
    ['00002a22-0000-1000-8000-00805f9b34fb', 'Boot Keyboard Input Report'],
    [GENERIC_GATT_DEVICE_INFORMATION_SYSTEM_ID_UUID, 'System ID'],
    [GENERIC_GATT_DEVICE_MODEL_NUMBER_STRING_UUID, 'Model Number String'],
    [GENERIC_GATT_SERIAL_NUMBER_STRING_UUID, 'Serial Number String'],
    [GENERIC_GATT_FIRMWARE_REVISION_STRING_UUID, 'Firmware Revision String'],
    [GENERIC_GATT_HARDWARE_REVISION_STRING_UUID, 'Hardware Revision String'],
    [GENERIC_GATT_SOFTWARE_REVISION_STRING_UUID, 'Software Revision String'],
    [GENERIC_GATT_MANUFACTURER_NAME_STRING_UUID, 'Manufacturer Name String'],
    ['00002a2a-0000-1000-8000-00805f9b34fb', 'IEEE 11073-20601 Regulatory Certification Data List'],
    ['00002a2b-0000-1000-8000-00805f9b34fb', 'Current Time'],
    ['00002a2c-0000-1000-8000-00805f9b34fb', 'Magnetic Declination'],
    ['00002a2f-0000-1000-8000-00805f9b34fb', 'Position 2D'],
    ['00002a30-0000-1000-8000-00805f9b34fb', 'Position 3D'],
    ['00002a31-0000-1000-8000-00805f9b34fb', 'Scan Refresh'],
    ['00002a32-0000-1000-8000-00805f9b34fb', 'Boot Keyboard Output Report'],
    ['00002a33-0000-1000-8000-00805f9b34fb', 'Boot Mouse Input Report'],
    ['00002a34-0000-1000-8000-00805f9b34fb', 'Glucose Measurement Context'],
    ['00002a35-0000-1000-8000-00805f9b34fb', 'Blood Pressure Measurement'],
    ['00002a36-0000-1000-8000-00805f9b34fb', 'Intermediate Cuff Pressure'],
    ['00002a37-0000-1000-8000-00805f9b34fb', 'Heart Rate Measurement'],
    ['00002a38-0000-1000-8000-00805f9b34fb', 'Body Sensor Location'],
    ['00002a39-0000-1000-8000-00805f9b34fb', 'Heart Rate Control Point'],
    ['00002a3a-0000-1000-8000-00805f9b34fb', 'Removable'],
    ['00002a3b-0000-1000-8000-00805f9b34fb', 'Service Required'],
    ['00002a3c-0000-1000-8000-00805f9b34fb', 'Scientific Temperature Celsius'],
    ['00002a3d-0000-1000-8000-00805f9b34fb', 'String'],
    ['00002a3e-0000-1000-8000-00805f9b34fb', 'Network Availability'],
    ['00002a3f-0000-1000-8000-00805f9b34fb', 'Alert Status'],
    ['00002a40-0000-1000-8000-00805f9b34fb', 'Ringer Control point'],
    ['00002a41-0000-1000-8000-00805f9b34fb', 'Ringer Setting'],
    ['00002a42-0000-1000-8000-00805f9b34fb', 'Alert Category ID Bit Mask'],
    ['00002a43-0000-1000-8000-00805f9b34fb', 'Alert Category ID'],
    ['00002a44-0000-1000-8000-00805f9b34fb', 'Alert Notification Control Point'],
    ['00002a45-0000-1000-8000-00805f9b34fb', 'Unread Alert Status'],
    ['00002a46-0000-1000-8000-00805f9b34fb', 'New Alert'],
    ['00002a47-0000-1000-8000-00805f9b34fb', 'Supported New Alert Category'],
    ['00002a48-0000-1000-8000-00805f9b34fb', 'Supported Unread Alert Category'],
    ['00002a49-0000-1000-8000-00805f9b34fb', 'Blood Pressure Feature'],
    ['00002a4a-0000-1000-8000-00805f9b34fb', 'HID Information'],
    ['00002a4b-0000-1000-8000-00805f9b34fb', 'Report Map'],
    ['00002a4c-0000-1000-8000-00805f9b34fb', 'HID Control Point'],
    ['00002a4d-0000-1000-8000-00805f9b34fb', 'Report'],
    ['00002a4e-0000-1000-8000-00805f9b34fb', 'Protocol Mode'],
    ['00002a4f-0000-1000-8000-00805f9b34fb', 'Scan Interval Window'],
    ['00002a50-0000-1000-8000-00805f9b34fb', 'PnP ID'],
    ['00002a51-0000-1000-8000-00805f9b34fb', 'Glucose Feature'],
    ['00002a52-0000-1000-8000-00805f9b34fb', 'Record Access Control Point'],
    ['00002a53-0000-1000-8000-00805f9b34fb', 'RSC Measurement'],
    ['00002a54-0000-1000-8000-00805f9b34fb', 'RSC Feature'],
    ['00002a55-0000-1000-8000-00805f9b34fb', 'SC Control Point'],
    ['00002a56-0000-1000-8000-00805f9b34fb', 'Digital'],
    ['00002a57-0000-1000-8000-00805f9b34fb', 'Digital Output'],
    ['00002a58-0000-1000-8000-00805f9b34fb', 'Analog'],
    ['00002a59-0000-1000-8000-00805f9b34fb', 'Analog Output'],
    ['00002a5a-0000-1000-8000-00805f9b34fb', 'Aggregate'],
    ['00002a5b-0000-1000-8000-00805f9b34fb', 'CSC Measurement'],
    ['00002a5c-0000-1000-8000-00805f9b34fb', 'CSC Feature'],
    ['00002a5d-0000-1000-8000-00805f9b34fb', 'Sensor Location'],
    ['00002a5e-0000-1000-8000-00805f9b34fb', 'PLX Spot-Check Measurement'],
    ['00002a5f-0000-1000-8000-00805f9b34fb', 'PLX Continuous Measurement Characteristic'],
    ['00002a60-0000-1000-8000-00805f9b34fb', 'PLX Features'],
    ['00002a62-0000-1000-8000-00805f9b34fb', 'Pulse Oximetry Control Point'],
    ['00002a63-0000-1000-8000-00805f9b34fb', 'Cycling Power Measurement'],
    ['00002a64-0000-1000-8000-00805f9b34fb', 'Cycling Power Vector'],
    ['00002a65-0000-1000-8000-00805f9b34fb', 'Cycling Power Feature'],
    ['00002a66-0000-1000-8000-00805f9b34fb', 'Cycling Power Control Point'],
    ['00002a67-0000-1000-8000-00805f9b34fb', 'Location and Speed Characteristic'],
    ['00002a68-0000-1000-8000-00805f9b34fb', 'Navigation'],
    ['00002a69-0000-1000-8000-00805f9b34fb', 'Position Quality'],
    ['00002a6a-0000-1000-8000-00805f9b34fb', 'LN Feature'],
    ['00002a6b-0000-1000-8000-00805f9b34fb', 'LN Control Point'],
    ['00002a6c-0000-1000-8000-00805f9b34fb', 'Elevation'],
    ['00002a6d-0000-1000-8000-00805f9b34fb', 'Pressure'],
    ['00002a6e-0000-1000-8000-00805f9b34fb', 'Temperature'],
    ['00002a6f-0000-1000-8000-00805f9b34fb', 'Humidity'],
    ['00002a70-0000-1000-8000-00805f9b34fb', 'True Wind Speed'],
    ['00002a71-0000-1000-8000-00805f9b34fb', 'True Wind Direction'],
    ['00002a72-0000-1000-8000-00805f9b34fb', 'Apparent Wind Speed'],
    ['00002a73-0000-1000-8000-00805f9b34fb', 'Apparent Wind Direction'],
    ['00002a74-0000-1000-8000-00805f9b34fb', 'Gust Factor'],
    ['00002a75-0000-1000-8000-00805f9b34fb', 'Pollen Concentration'],
    ['00002a76-0000-1000-8000-00805f9b34fb', 'UV Index'],
    ['00002a77-0000-1000-8000-00805f9b34fb', 'Irradiance'],
    ['00002a78-0000-1000-8000-00805f9b34fb', 'Rainfall'],
    ['00002a79-0000-1000-8000-00805f9b34fb', 'Wind Chill'],
    ['00002a7a-0000-1000-8000-00805f9b34fb', 'Heat Index'],
    ['00002a7b-0000-1000-8000-00805f9b34fb', 'Dew Point'],
    ['00002a7d-0000-1000-8000-00805f9b34fb', 'Descriptor Value Changed'],
    ['00002a7e-0000-1000-8000-00805f9b34fb', 'Aerobic Heart Rate Lower Limit'],
    ['00002a7f-0000-1000-8000-00805f9b34fb', 'Aerobic Threshold'],
    ['00002a80-0000-1000-8000-00805f9b34fb', 'Age'],
    ['00002a81-0000-1000-8000-00805f9b34fb', 'Anaerobic Heart Rate Lower Limit'],
    ['00002a82-0000-1000-8000-00805f9b34fb', 'Anaerobic Heart Rate Upper Limit'],
    ['00002a83-0000-1000-8000-00805f9b34fb', 'Anaerobic Threshold'],
    ['00002a84-0000-1000-8000-00805f9b34fb', 'Aerobic Heart Rate Upper Limit'],
    ['00002a85-0000-1000-8000-00805f9b34fb', 'Date of Birth'],
    ['00002a86-0000-1000-8000-00805f9b34fb', 'Date of Threshold Assessment'],
    ['00002a87-0000-1000-8000-00805f9b34fb', 'Email Address'],
    ['00002a88-0000-1000-8000-00805f9b34fb', 'Fat Burn Heart Rate Lower Limit'],
    ['00002a89-0000-1000-8000-00805f9b34fb', 'Fat Burn Heart Rate Upper Limit'],
    ['00002a8a-0000-1000-8000-00805f9b34fb', 'First Name'],
    ['00002a8b-0000-1000-8000-00805f9b34fb', 'Five Zone Heart Rate Limits'],
    ['00002a8c-0000-1000-8000-00805f9b34fb', 'Gender'],
    ['00002a8d-0000-1000-8000-00805f9b34fb', 'Heart Rate Max'],
    ['00002a8e-0000-1000-8000-00805f9b34fb', 'Height'],
    ['00002a8f-0000-1000-8000-00805f9b34fb', 'Hip Circumference'],
    ['00002a90-0000-1000-8000-00805f9b34fb', 'Last Name'],
    ['00002a91-0000-1000-8000-00805f9b34fb', 'Maximum Recommended Heart Rate'],
    ['00002a92-0000-1000-8000-00805f9b34fb', 'Resting Heart Rate'],
    ['00002a93-0000-1000-8000-00805f9b34fb', 'Sport Type for Aerobic and Anaerobic Thresholds'],
    ['00002a94-0000-1000-8000-00805f9b34fb', 'Three Zone Heart Rate Limits'],
    ['00002a95-0000-1000-8000-00805f9b34fb', 'Two Zone Heart Rate Limit'],
    ['00002a96-0000-1000-8000-00805f9b34fb', 'VO2 Max'],
    ['00002a97-0000-1000-8000-00805f9b34fb', 'Waist Circumference'],
    ['00002a98-0000-1000-8000-00805f9b34fb', 'Weight'],
    ['00002a99-0000-1000-8000-00805f9b34fb', 'Database Change Increment'],
    ['00002a9a-0000-1000-8000-00805f9b34fb', 'User Index'],
    ['00002a9b-0000-1000-8000-00805f9b34fb', 'Body Composition Feature'],
    ['00002a9c-0000-1000-8000-00805f9b34fb', 'Body Composition Measurement'],
    ['00002a9d-0000-1000-8000-00805f9b34fb', 'Weight Measurement'],
    ['00002a9e-0000-1000-8000-00805f9b34fb', 'Weight Scale Feature'],
    ['00002a9f-0000-1000-8000-00805f9b34fb', 'User Control Point'],
    ['00002aa0-0000-1000-8000-00805f9b34fb', 'Magnetic Flux Density - 2D'],
    ['00002aa1-0000-1000-8000-00805f9b34fb', 'Magnetic Flux Density - 3D'],
    ['00002aa2-0000-1000-8000-00805f9b34fb', 'Language'],
    ['00002aa3-0000-1000-8000-00805f9b34fb', 'Barometric Pressure Trend'],
    ['00002aa4-0000-1000-8000-00805f9b34fb', 'Bond Management Control Point'],
    ['00002aa5-0000-1000-8000-00805f9b34fb', 'Bond Management Features'],
    ['00002aa6-0000-1000-8000-00805f9b34fb', 'Central Address Resolution'],
    ['00002aa7-0000-1000-8000-00805f9b34fb', 'CGM Measurement'],
    ['00002aa8-0000-1000-8000-00805f9b34fb', 'CGM Feature'],
    ['00002aa9-0000-1000-8000-00805f9b34fb', 'CGM Status'],
    ['00002aaa-0000-1000-8000-00805f9b34fb', 'CGM Session Start Time'],
    ['00002aab-0000-1000-8000-00805f9b34fb', 'CGM Session Run Time'],
    ['00002aac-0000-1000-8000-00805f9b34fb', 'CGM Specific Ops Control Point'],
    ['00002aad-0000-1000-8000-00805f9b34fb', 'Indoor Positioning Configuration'],
    ['00002aae-0000-1000-8000-00805f9b34fb', 'Latitude'],
    ['00002aaf-0000-1000-8000-00805f9b34fb', 'Longitude'],
    ['00002ab0-0000-1000-8000-00805f9b34fb', 'Local North Coordinate'],
    ['00002ab1-0000-1000-8000-00805f9b34fb', 'Local East Coordinate'],
    ['00002ab2-0000-1000-8000-00805f9b34fb', 'Floor Number'],
    ['00002ab3-0000-1000-8000-00805f9b34fb', 'Altitude'],
    ['00002ab4-0000-1000-8000-00805f9b34fb', 'Uncertainty'],
    ['00002ab5-0000-1000-8000-00805f9b34fb', 'Location Name'],
    ['00002ab6-0000-1000-8000-00805f9b34fb', 'URI'],
    ['00002ab7-0000-1000-8000-00805f9b34fb', 'HTTP Headers'],
    ['00002ab8-0000-1000-8000-00805f9b34fb', 'HTTP Status Code'],
    ['00002ab9-0000-1000-8000-00805f9b34fb', 'HTTP Entity Body'],
    ['00002aba-0000-1000-8000-00805f9b34fb', 'HTTP Control Point'],
    ['00002abb-0000-1000-8000-00805f9b34fb', 'HTTPS Security'],
    ['00002abc-0000-1000-8000-00805f9b34fb', 'TDS Control Point'],
    ['00002abd-0000-1000-8000-00805f9b34fb', 'OTS Feature'],
    ['00002abe-0000-1000-8000-00805f9b34fb', 'Object Name'],
    ['00002abf-0000-1000-8000-00805f9b34fb', 'Object Type'],
    ['00002ac0-0000-1000-8000-00805f9b34fb', 'Object Size'],
    ['00002ac1-0000-1000-8000-00805f9b34fb', 'Object First-Created'],
    ['00002ac2-0000-1000-8000-00805f9b34fb', 'Object Last-Modified'],
    ['00002ac3-0000-1000-8000-00805f9b34fb', 'Object ID'],
    ['00002ac4-0000-1000-8000-00805f9b34fb', 'Object Properties'],
    ['00002ac5-0000-1000-8000-00805f9b34fb', 'Object Action Control Point'],
    ['00002ac6-0000-1000-8000-00805f9b34fb', 'Object List Control Point'],
    ['00002ac7-0000-1000-8000-00805f9b34fb', 'Object List Filter'],
    ['00002ac8-0000-1000-8000-00805f9b34fb', 'Object Changed'],
    ['00002ac9-0000-1000-8000-00805f9b34fb', 'Resolvable Private Address Only'],
    ['00002acc-0000-1000-8000-00805f9b34fb', 'Fitness Machine Feature'],
    ['00002acd-0000-1000-8000-00805f9b34fb', 'Treadmill Data'],
    ['00002ace-0000-1000-8000-00805f9b34fb', 'Cross Trainer Data'],
    ['00002acf-0000-1000-8000-00805f9b34fb', 'Step Climber Data'],
    ['00002ad0-0000-1000-8000-00805f9b34fb', 'Stair Climber Data'],
    ['00002ad1-0000-1000-8000-00805f9b34fb', 'Rower Data'],
    ['00002ad2-0000-1000-8000-00805f9b34fb', 'Indoor Bike Data'],
    ['00002ad3-0000-1000-8000-00805f9b34fb', 'Training Status'],
    ['00002ad4-0000-1000-8000-00805f9b34fb', 'Supported Speed Range'],
    ['00002ad5-0000-1000-8000-00805f9b34fb', 'Supported Inclination Range'],
    ['00002ad6-0000-1000-8000-00805f9b34fb', 'Supported Resistance Level Range'],
    ['00002ad7-0000-1000-8000-00805f9b34fb', 'Supported Heart Rate Range'],
    ['00002ad8-0000-1000-8000-00805f9b34fb', 'Supported Power Range'],
    ['00002ad9-0000-1000-8000-00805f9b34fb', 'Fitness Machine Control Point'],
    ['00002ada-0000-1000-8000-00805f9b34fb', 'Fitness Machine Status'],
    ['00002aed-0000-1000-8000-00805f9b34fb', 'Date UTC'],
    ['00002b1d-0000-1000-8000-00805f9b34fb', 'RC Feature'],
    ['00002b1e-0000-1000-8000-00805f9b34fb', 'RC Settings'],
    ['00002b1f-0000-1000-8000-00805f9b34fb', 'Reconnection Configuration Control Point']
])

const ARANET_CO2_MEASUREMENT_CHARACTERISTIC_UUID = "f0cd1503-95da-4f4b-9ac8-aa55d312af0c";
const ARANET_TOTAL_MEASUREMENTS_UUID = "f0cd2001-95da-4f4b-9ac8-aa55d312af0c";
const ARANET_MEASUREMENT_INTERVAL_UUID = "f0cd2002-95da-4f4b-9ac8-aa55d312af0c";
const ARANET_SECONDS_LAST_UPDATE_UUID = "f0cd2004-95da-4f4b-9ac8-aa55d312af0c";
const ARANET_CO2_MEASUREMENT_WITH_INTERVAL_TIME_CHARACTERISTIC_UUID = "f0cd3001-95da-4f4b-9ac8-aa55d312af0c";
// const ARANET_DEVICE_NAME_UUID = GENERIC_GATT_DEVICE_NAME_UUID;
// const ARANET_UNKNOWN_FIELD_1_UUID = 'f0cd1401-95da-4f4b-9ac8-aa55d312af0c';
// const ARANET_UNKNOWN_FIELD_2_UUID = 'f0cd1502-95da-4f4b-9ac8-aa55d312af0c';
const ARANET_SET_INTERVAL_UUID = 'f0cd1402-95da-4f4b-9ac8-aa55d312af0c';
const ARANET_SET_HISTORY_PARAMETER_UUID = 'f0cd1402-95da-4f4b-9ac8-aa55d312af0c';

const ARANET_SENSOR_SETTINGS_STATE_UUID = 'f0cd1401-95da-4f4b-9ac8-aa55d312af0c';
const ARANET_SENSOR_CALIBRATION_DATA_UUID = 'f0cd1502-95da-4f4b-9ac8-aa55d312af0c';
const ARANET_UNSED_GATT_UUID = 'f0cd2003-95da-4f4b-9ac8-aa55d312af0c';
const ARANET_SENSOR_LOGS_UUID = 'f0cd2005-95da-4f4b-9ac8-aa55d312af0c';

const aranet4KnownCharacteristicUUIDDescriptions = new Map([
    [ARANET_CO2_MEASUREMENT_CHARACTERISTIC_UUID, "Aranet4: current CO2 measurement"],
    [ARANET_TOTAL_MEASUREMENTS_UUID, "Aranet4: total number of measurements"],
    [ARANET_MEASUREMENT_INTERVAL_UUID, "Aranet4: measurement interval"],
    [ARANET_SECONDS_LAST_UPDATE_UUID, "Aranet4: seconds since last update"],
    [ARANET_CO2_MEASUREMENT_WITH_INTERVAL_TIME_CHARACTERISTIC_UUID, "Aranet4: CO2 measurements, interval, time since measurements"],
    [GENERIC_GATT_DEVICE_NAME_UUID, "Device Name"],
    [GENERIC_GATT_DEVICE_BATTERY_LEVEL_UUID, "Aranet4: Battery level"],
    [GENERIC_GATT_DEVICE_MODEL_NUMBER_STRING_UUID, "Model Number String"],
    [GENERIC_GATT_SERIAL_NUMBER_STRING_UUID, "Serial Number String"],
    [GENERIC_GATT_HARDWARE_REVISION_STRING_UUID, "Hardware Revision String"],
    [GENERIC_GATT_SOFTWARE_REVISION_STRING_UUID, "Software Revision String"],
    [GENERIC_GATT_MANUFACTURER_NAME_STRING_UUID, "Manufacturer Name String"],
    [ARANET_SET_INTERVAL_UUID, "Set measurement interval"],
    [ARANET_SET_HISTORY_PARAMETER_UUID, "Set \"History Parameter\""],
    [ARANET_SENSOR_SETTINGS_STATE_UUID, "Aranet4 sensor settings state"],
    [ARANET_SENSOR_CALIBRATION_DATA_UUID, "Aranet4 sensor calibration"],
    [ARANET_UNSED_GATT_UUID, "Aranet4 UNUSED GATT characteristic"],
    [ARANET_SENSOR_LOGS_UUID, "Aranet4 sensor logs"]
]);


//0x10000000000000000 === 18446744073709551615 === 2 ^60
const ARANET4_MINIMUM_FACTORY_CALIBRATION_VALUE = BigInt(0x10000000000000000);
const UNIX_MONDAY_JANUARY_1_2018 = BigInt(1514764800);
const ARANET_4_BAD_CALIBRATION_STRING = "Calibration unstable, bad, or otherwise not at factory in unspecified ways.";

function aranet4DeviceRequestOptions(): RequestDeviceOptions {
    const filter: BluetoothLEScanFilter = {
        services: [SENSOR_SERVICE_UUID]
    }
    const services: BluetoothServiceUUID[] = [
        'device_information',
        'battery_service',
        'environmental_sensing',
        'generic_attribute',
        'generic_access',
        'immediate_alert',


        'link_loss',
        'tx_power',
        'current_time',
        'reference_time_update',
        'alert_notification',
        'scan_parameters',
        'automation_io',
        'user_data',
        'bond_management',
        'mesh_provisioning',
        'mesh_proxy',
        'reconnection_configuration'
      ];

    const deviceRequestOptions: RequestDeviceOptions = {
        filters: [filter],
        optionalServices: services,
        acceptAllDevices: false
    }
    return deviceRequestOptions;

}

function dumpBluetoothCharacteristicProperties(properties: BluetoothCharacteristicProperties, serviceIndex: number, characteristicIndex: number): string {
    // readonly broadcast: boolean;
    // readonly read: boolean;
    // readonly writeWithoutResponse: boolean;
    // readonly write: boolean;
    // readonly notify: boolean;
    // readonly indicate: boolean;
    // readonly authenticatedSignedWrites: boolean;
    // readonly reliableWrite: boolean;
    // readonly writableAuxiliaries: boolean;

    let messages = "";
    messages += (`\tservices[${serviceIndex}], characteristics[${characteristicIndex}].properties:\n`);
    if (properties.broadcast) {
        messages += (`\t\tbroadcast: ${properties.broadcast}\n`);
    }
    if (properties.read) {
        messages += (`\t\tread: ${properties.read}\n`);
    }
    if (properties.writeWithoutResponse) {
        messages += (`\t\twriteWithoutResponse: ${properties.writeWithoutResponse}\n`);
    }
    if (properties.write) {
        messages += (`\t\twrite: ${properties.write}\n`);
    }
    if (properties.notify) {
        messages += (`\t\tnotify: ${properties.notify}\n`);
    }
    if (properties.indicate) {
        messages += (`\t\tindicate: ${properties.indicate}\n`);
    }
    if (properties.authenticatedSignedWrites) {
        messages += (`\t\tauthenticatedSignedWrites: ${properties.authenticatedSignedWrites}\n`);
    }
    if (properties.reliableWrite) {
        messages += (`\t\treliableWrite: ${properties.reliableWrite}\n`);
    }
    if (properties.writableAuxiliaries) {
        messages += (`\t\twritableAuxiliaries: ${properties.writableAuxiliaries}\n`);
    }
    return messages;
}



function messages(objectOrString: string, dispatch: ReturnType<typeof useDispatch>): string {
    // let newMessagesString = messagesString + `${objectOrString}\r\n`;
    // console.log(objectOrString);
    // dispatch(setDebugText(newMessagesString))
    dispatch(appendDebugText(`${objectOrString}\r\n`));
    return `${objectOrString}\r\n`;
}


function aranet4ParseColor(data: DataView, dispatch: ReturnType<typeof useDispatch>): void {
    const unknownFieldMaybeColors = data.getUint8(8);
    const isRedOrYellow = (unknownFieldMaybeColors & 0b000000010);

    if (isRedOrYellow !== 0) {
        // messages(`\t\tCO2 level might be "red" or "yellow"`, dispatch);
        const isRed = (unknownFieldMaybeColors & 0b000000001);
        if (isRed) {
            dispatch(setAranet4Color('red'));
            return;
        }
        dispatch(setAranet4Color('yellow'));
        return;
    }
    // messages(`\t\tCO2 level might be "green" or something else.`, dispatch);
    const isGreen = (unknownFieldMaybeColors & 0b000000001);
    if (isGreen !== 0) {
        dispatch(setAranet4Color('green'));
        return;
    }
    dispatch(setAranet4Color('unspecified'));
}

function parse_ARANET_CO2_MEASUREMENT_CHARACTERISTIC_UUID(data: DataView, dispatch: ReturnType<typeof useDispatch>): void {
    const co2 = data.getUint16(0, true);
    dispatch(setCO2(co2))
    const temperature = (data.getUint16(2, true) / 20);
    dispatch(setTemperature(temperature));
    const barometricPressure = (data.getUint16(4, true) / 10);
    dispatch(setBarometricPressure(barometricPressure))
    const humidity = data.getUint8(6);
    dispatch(setHumidity(humidity));
    const battery = data.getUint8(7);
    dispatch(setBattery(battery));
    // const unknownField = data.getUint8(8);
    // dispatch(setAranet4UnknownField(unknownField));

    aranet4ParseColor(data, dispatch);

    // debugger;

}

function dumpUnknownGatt(data: DataView, dispatch: ReturnType<typeof useDispatch>): void {
    messages(`\t\tDataView length: ${data.byteLength} bytes`, dispatch);
    const asUTF8String = parseUTF8StringDataView(data);
    messages(`\t\tTrying to parse data as UTF-8 string: '${asUTF8String}'`, dispatch);
    const asUint8s = parseAsUint8Numbers(data);
    messages(`\t\tTrying to parse data as uint8 array: '${asUint8s}'`, dispatch);
    const asUint16s = parseAsUint16Numbers(data);
    if (asUint16s.length > 0) {
        messages(`\t\tTrying to parse data as uint16 array: '${asUint16s}'`, dispatch);
    }

    const asUint32s = parseAsUint32Numbers(data);
    if (asUint32s.length > 0) {
        messages(`\t\tTrying to parse data as uint32 array: '${asUint32s}'`, dispatch);
    }

    const asUint64s = parseAsUint64Numbers(data);
    if (asUint64s.length > 0) {
        messages(`\t\tTrying to parse data as uint64 array: '${asUint64s}'`, dispatch);
    }
    const asLEUint16 = parseAsUint16NumbersLittleEndian(data);
    if (asLEUint16.length > 0) {
        messages(`\t\tParsed data as uint16 array as LE: '${asLEUint16}'`, dispatch);
    }

    const asLEUint32 = parseAsUint32NumbersLittleEndian(data);
    if (asLEUint32.length > 0) {
        messages(`\t\tParsed data as uint32 array as LE: '${asLEUint32}'`, dispatch);
    }

    const asLEUint64 = parseAsUint64NumbersLittleEndian(data);
    if (asLEUint64.length > 0) {
        messages(`\t\tParsed data as uint64 array as LE: '${asLEUint64}'`, dispatch);
    }
}

function switchOverCharacteristics(data: DataView, dispatch: ReturnType<typeof useDispatch>, characteristic: BluetoothRemoteGATTCharacteristic): void {
    //yes yes, I know, needs to be genericised.
    switch (characteristic.uuid) {
        case (ARANET_CO2_MEASUREMENT_CHARACTERISTIC_UUID):
            parse_ARANET_CO2_MEASUREMENT_CHARACTERISTIC_UUID(data, dispatch);
            messages(`\t\tAranet4 CO2 measurement parsed.`, dispatch);
            break;
        case (ARANET_SECONDS_LAST_UPDATE_UUID):
            console.assert(data.byteLength === 2);
            const secondsSinceLastUpdate = data.getUint16(0, true);
            messages(`\t\tAranet4 seconds since last update: ${secondsSinceLastUpdate}`, dispatch);
            dispatch(setAranet4SecondsSinceLastMeasurement(secondsSinceLastUpdate))
            // debugger;
            break;
        case (ARANET_MEASUREMENT_INTERVAL_UUID):
            console.assert(data.byteLength === 2);
            const interval = data.getUint16(0, true);
            messages(`\t\tAranet4 measurement interval: ${interval}`, dispatch);
            dispatch(setAranet4MeasurementInterval(interval));
            break;
        case (ARANET_TOTAL_MEASUREMENTS_UUID):
            console.assert(data.byteLength === 2);
            const total = data.getUint16(0, true);
            messages(`\t\tAranet4 total measurements: ${total}`, dispatch);
            dispatch(setAranet4TotalMeasurements(total));
            break;
        case (GENERIC_GATT_DEVICE_INFORMATION_SYSTEM_ID_UUID):
            //e.g. https://www.bosch-connectivity.com/media/product_detail_scd/scd-ble-communication-protocol.pdf
            messages(`\t\tBluetooth device_information System ID, has variable structures (I think), let's try parsing...`, dispatch);
            console.assert(data.byteLength === 8);
            //first 24 bits/3 bytes
            const OUI = [data.getUint8(0), data.getUint8(1), data.getUint8(2)];
            messages(`\t\t\tOrganizationally Unique Identifier: ${OUI[0]} ${OUI[1]} ${OUI[2]} (NOTE: needs to be displayed as hex, not dec)`, dispatch);
            const MI = [data.getUint8(3), data.getUint8(4), data.getUint8(5), data.getUint8(6), data.getUint8(7)];
            messages(`\t\t\tManufacturer Identifier: ${MI[0]} ${MI[1]} ${MI[2]} ${MI[3]} ${MI[4]} (NOTE: needs to be displayed as hex, not dec)`, dispatch);
            break;
        case (GENERIC_GATT_DEVICE_MODEL_NUMBER_STRING_UUID):
            const modelNumberString = parseUTF8StringDataView(data);
            messages(`\t\tBluetooth model number string: ${modelNumberString}`, dispatch);
            dispatch(setModelNumberString(modelNumberString));
            break;
        case (GENERIC_GATT_FIRMWARE_REVISION_STRING_UUID):
            const firmwareRevisionString = parseUTF8StringDataView(data);
            messages(`\t\tBluetooth firmware revision string: ${firmwareRevisionString}`, dispatch);
            dispatch(setFirmwareRevisionString(firmwareRevisionString));
            break;
        case (GENERIC_GATT_HARDWARE_REVISION_STRING_UUID):
            const hardwareRevisionString = parseUTF8StringDataView(data);
            messages(`\t\tBluetooth hardware revision string: ${hardwareRevisionString}`, dispatch);
            dispatch(setHardwareRevisionString(hardwareRevisionString));
            break;
        case (GENERIC_GATT_SOFTWARE_REVISION_STRING_UUID):
            const softwareRevisionString = parseUTF8StringDataView(data);
            messages(`\t\tBluetooth software revision string: ${softwareRevisionString}`, dispatch);
            dispatch(setSoftwareRevisionString(softwareRevisionString));
            break;
        case (GENERIC_GATT_MANUFACTURER_NAME_STRING_UUID):
            const manufacturerName = parseUTF8StringDataView(data);
            messages(`\t\tBluetooth manufacturer name string: ${manufacturerName}`, dispatch);
            dispatch(setManufacturerName(manufacturerName));
            break;
        case (GENERIC_GATT_DEVICE_NAME_UUID):
            const name = parseUTF8StringDataView(data);
            messages(`\t\tBluetooth device name string (from GATT characteristic): ${name}`, dispatch);
            dispatch(setDeviceNameFromCharacteristic(name))
            break;
        case (GENERIC_GATT_DEVICE_BATTERY_LEVEL_UUID):
            const batteryLevel = data.getUint8(0);
            messages(`\t\tBluetooth device battery level: ${batteryLevel}`, dispatch);
            break;
        case (ARANET_SENSOR_CALIBRATION_DATA_UUID):
            const rawSensorCalibrationValue = data.getBigUint64(0, true);

            if (rawSensorCalibrationValue === ARANET4_MINIMUM_FACTORY_CALIBRATION_VALUE) {
                dispatch(setAranet4Calibration(ARANET_4_BAD_CALIBRATION_STRING));
                messages(`\t\tI think this calibration value is an error value. ${rawSensorCalibrationValue}`, dispatch);
            }
            else if (rawSensorCalibrationValue > ARANET4_MINIMUM_FACTORY_CALIBRATION_VALUE) {
                messages(`\t\tMaybe at factory calibration? (${rawSensorCalibrationValue})`, dispatch);
                dispatch(setAranet4Calibration(`Maybe at factory? (${rawSensorCalibrationValue})`));
                Sentry.captureMessage(`Aranet4 calibration: ${rawSensorCalibrationValue}`);
            }
            else if ((rawSensorCalibrationValue < ARANET4_MINIMUM_FACTORY_CALIBRATION_VALUE) && (rawSensorCalibrationValue > UNIX_MONDAY_JANUARY_1_2018)) {
                messages(`\t\tMaybe at factory calibration? (${rawSensorCalibrationValue})`, dispatch);
                dispatch(setAranet4Calibration(`Maybe at factory? (${rawSensorCalibrationValue})`));
                Sentry.captureMessage(`Aranet4 calibration: ${rawSensorCalibrationValue}`);
            }
            else if (rawSensorCalibrationValue < UNIX_MONDAY_JANUARY_1_2018) {
                dispatch(setAranet4Calibration(`Likely NON-factory: (${rawSensorCalibrationValue})`));
                messages(`\t\tLikely NON-Factory calibration (${rawSensorCalibrationValue})`, dispatch);
            }
            break;
        case (GENERIC_GATT_PREFERRED_PERIPHERAL_CONNECTION_PARAMETERS):
            const minimumConnectionInterval = data.getUint16(0, true);
            const maximumConnectionInterval = data.getUint16(2, true);
            const slaveLatency = data.getUint16(4,true);
            const connectionSupervisionTimeoutMultiplier = data.getUint16(6, true);
            messages(`\t\tMinimum Connection Interval: ${minimumConnectionInterval}, Maximum Connection Interval: ${maximumConnectionInterval}, Slave Latency: ${slaveLatency}, Connection Supervision Timeout Multiplier: ${connectionSupervisionTimeoutMultiplier}`, dispatch);

            break;
        case (ARANET_UNSED_GATT_UUID):
            messages(`\t\tAranet4 UNUSED characteristic. Should be all zeros!`, dispatch);
            let dataLoaded = [];
            for (let i = 0; i < data.byteLength; i++) {
                dataLoaded.push(data.getUint8(i));
            }
            const nonZero = dataLoaded.filter((value) => value !== 0);
            if (nonZero.length > 0) {
                messages(`\t\t\tNOT all zeros. Dumping & reporting...`, dispatch);
                dumpUnknownGatt(data, dispatch);
                // Sentry.sendMessage(`Aranet4 unused characteristic has non-zero values:`)
            }
            else {
                messages(`\t\t...yes, it's all zeros.`, dispatch)
            }
            break;
        default:
            dumpUnknownGatt(data, dispatch);
        }

}


async function bluetoothTestingStuffFunc(dispatch: ReturnType<typeof useDispatch>) {


    const device = await getADevice();

    messages(`device.id: ${device.id} (unique)`, dispatch);
    dispatch(setDeviceID(device.id));
    messages(`device.name: ${device.name}`, dispatch);
    if (device.name !== undefined) {
        dispatch(setDeviceName(device.name));
    }
    else {
        dispatch(setDeviceName(''));
    }

    if (device.gatt === undefined) {
        debugger;
        return;
    }
    const deviceServer = await device.gatt.connect();

    const services = await deviceServer.getPrimaryServices();
    messages(`${services.length} services:`, dispatch);
    checkServiceNames(services, dispatch);

    messages(`----`, dispatch);
    messages(`----`, dispatch);


    messages(`Got services (length: ${services.length}):`, dispatch)
    await loopOverServices(services, dispatch);
}

function checkServiceNames(services: BluetoothRemoteGATTService[], dispatch: ReturnType<typeof useDispatch>) {
    for (let serviceIndex = 0; serviceIndex < services.length; serviceIndex++) {
        const uuid = services[serviceIndex].uuid;
        const short_uuid = uuid.substring(4, 8).toUpperCase();
        if (GENERIC_GATT_SERVICE_UUID_DESCRIPTIONS.has(uuid)) {
            const serviceName = GENERIC_GATT_SERVICE_UUID_DESCRIPTIONS.get(uuid);
            messages(`\tservices[${serviceIndex}].uuid: ${uuid}... Known service! ${serviceName}`, dispatch);
        }
        else if (GENERIC_GATT_SERVICE_SHORT_ID_DESCRIPTIONS.has(short_uuid)) {
            const serviceName = GENERIC_GATT_SERVICE_SHORT_ID_DESCRIPTIONS.get(short_uuid);
            messages(`\tservices[${serviceIndex}].uuid: ${uuid}... Known service! ${serviceName}`, dispatch);
        }
        else {
            messages(`\tservices[${serviceIndex}].uuid: ${uuid}`, dispatch);
        }
    }
}

async function loopOverServices(services: BluetoothRemoteGATTService[], dispatch: ReturnType<typeof useDispatch>) {
    for (let serviceIndex = 0; serviceIndex < services.length; serviceIndex++) {
        const uuid = services[serviceIndex].uuid;
        messages(`services[${serviceIndex}].uuid: ${uuid}`, dispatch);
        // debugger;
        // if(GENERIC_GATT_SERVICE_UUID_DESCRIPTIONS.has(services[serviceIndex].uuid.substring(0,8))) {
        //     debugger;
        // }
        //
        const short_uuid = uuid.substring(4, 8).toUpperCase();
        if (GENERIC_GATT_SERVICE_UUID_DESCRIPTIONS.has(uuid)) {
            const serviceName = GENERIC_GATT_SERVICE_UUID_DESCRIPTIONS.get(uuid);
            messages(`services[${serviceIndex}].uuid: ${uuid}... Known service! ${serviceName}`, dispatch);
        }
        else if (GENERIC_GATT_SERVICE_SHORT_ID_DESCRIPTIONS.has(short_uuid)) {
            const serviceName = GENERIC_GATT_SERVICE_SHORT_ID_DESCRIPTIONS.get(short_uuid);
            messages(`\t\tKnown service! ${serviceName}`, dispatch);
        }

        messages(`services[${serviceIndex}].isPrimary: ${services[serviceIndex].isPrimary}`, dispatch);
        // debugger;
        //getCharacteristics can fail!
        //Unhandled Rejection (NetworkError): Failed to execute 'getCharacteristics' on 'BluetoothRemoteGATTService': GATT Server is disconnected. Cannot retrieve characteristics. (Re)connect first with `device.gatt.connect`.
        const characteristics = await services[serviceIndex].getCharacteristics();

        messages(`Got characteristics (length ${characteristics.length}):`, dispatch);
        await loopOverCharacteristics(characteristics, serviceIndex, dispatch);
        messages('\n', dispatch);
    }
}

async function loopOverCharacteristics(characteristics: BluetoothRemoteGATTCharacteristic[], serviceIndex: number, dispatch: ReturnType<typeof useDispatch>) {
    for (let characteristicIndex = 0; characteristicIndex < characteristics.length; characteristicIndex++) {
        messages(`\tservices[${serviceIndex}], characteristics[${characteristicIndex}].uuid: ${characteristics[characteristicIndex].uuid}`, dispatch);
        checkKnownFunctionDescription(characteristics, characteristicIndex, dispatch);
        // bluetoothMessages += messages(bluetoothMessages, `\tservices[${serviceIndex}], characteristics[${characteristicIndex}].value: ${characteristics[characteristicIndex].value}`, dispatch);
        const propertiesString = dumpBluetoothCharacteristicProperties(characteristics[characteristicIndex].properties, serviceIndex, characteristicIndex);
        dispatch(appendDebugText(propertiesString));
        if (characteristics[characteristicIndex].properties.read) {
            await readableCharacteristic(characteristics, characteristicIndex, dispatch);
        }
        messages('\n', dispatch);
    }
}

async function readableCharacteristic(characteristics: BluetoothRemoteGATTCharacteristic[], characteristicIndex: number, dispatch: ReturnType<typeof useDispatch>) {
    try {
        const data = await characteristics[characteristicIndex].readValue();
        switchOverCharacteristics(data, dispatch, characteristics[characteristicIndex]);

    }
    catch (e) {
        if (e instanceof DOMException) {
            messages(`\t\tCannot read from ${characteristics[characteristicIndex].uuid}! Error code: '${e.code}', Error message: '${e.message}'`, dispatch);
        }
        else {
            throw e;
        }
    }
}

function checkKnownFunctionDescription(characteristics: BluetoothRemoteGATTCharacteristic[], characteristicIndex: number, dispatch: ReturnType<typeof useDispatch>) {
    if (aranet4KnownCharacteristicUUIDDescriptions.has(characteristics[characteristicIndex].uuid)) {
        messages(`\t\tKnown Aranet4 characteristic! '${aranet4KnownCharacteristicUUIDDescriptions.get(characteristics[characteristicIndex].uuid)}'`, dispatch);
        return;
    }
    else if (GENERIC_GATT_SERVICE_UUID_DESCRIPTIONS.has(characteristics[characteristicIndex].uuid)) {
        messages(`\t\tKnown generic GATT characteristic! '${GENERIC_GATT_SERVICE_UUID_DESCRIPTIONS.get(characteristics[characteristicIndex].uuid)}'`, dispatch);
        return;
    }
    messages(`\t\tUNKNOWN GATT characteristic! '${characteristics[characteristicIndex].uuid}'`, dispatch);
}

function parseAsUint8Numbers(data: DataView): string {
    let uint8Numbers = new Array(data.byteLength);
    for (let i = 0; i < (data.byteLength); i++) {
        uint8Numbers[i] = data.getUint8(i);
    }
    const numberStringArray = uint8Numbers.map((uint8Number) => {
        return String(uint8Number);
    })
    return numberStringArray.toString();
}

function parseAsUint16Numbers(data: DataView): string {
    if (data.byteLength < 2) {
        return "";
    }
    let uint16Numbers = new Array();
    for (let i = 0; i < (data.byteLength/2); i++) {
        if ((i*2) > data.byteLength) {
            debugger;
        }
        uint16Numbers[i] = data.getUint16(i);
    }
    // debugger;
    const numberStringArray = uint16Numbers.map((uint16Number) => {
        return String(uint16Number);
    })
    return numberStringArray.toString();
}

function parseAsUint16NumbersLittleEndian(data: DataView): string {
    if (data.byteLength < 2) {
        return "";
    }
    let uint16Numbers = new Array();
    for (let i = 0; i < (data.byteLength/2); i++) {
        if ((i*2) > data.byteLength) {
            debugger;
        }
        uint16Numbers[i] = data.getUint16(i, true);
    }
    // debugger;
    const numberStringArray = uint16Numbers.map((uint8Number) => {
        return String(uint8Number);
    })
    return numberStringArray.toString();
}


function parseAsUint32Numbers(data: DataView): string {
    if (data.byteLength < 4) {
        return "";
    }
    let uint32Numbers = new Array();
    for (let i = 0; i < (data.byteLength/4); i++) {
        if ((i*4) > data.byteLength) {
            debugger;
        }
        if ((data.byteLength/4) < 1) {
            return '';
        }
        uint32Numbers[i] = data.getUint32(i);
    }
    // debugger;
    const numberStringArray = uint32Numbers.map((uint32Number) => {
        return String(uint32Number);
    })
    return numberStringArray.toString();
}

function parseAsUint32NumbersLittleEndian(data: DataView): string {
    if (data.byteLength < 4) {
        return "";
    }
    let uint32Numbers = new Array();
    for (let i = 0; i < (data.byteLength/4); i++) {
        if ((i*4) > data.byteLength) {
            debugger;
        }
        if ((data.byteLength/4) < 1) {
            return '';
        }
        uint32Numbers[i] = data.getUint32(i, true);
    }
    // debugger;
    const numberStringArray = uint32Numbers.map((uint32Number) => {
        return String(uint32Number);
    })
    return numberStringArray.toString();
}


function parseAsUint64Numbers(data: DataView): string {
    if (data.byteLength < 8) {
        return "";
    }
    let uint64Numbers = new Array();
    for (let i = 0; i < (data.byteLength/8); i++) {
        if ((i*8) > data.byteLength) {
            debugger;
        }
        if ((data.byteLength/8) < 1) {
            return '';
        }

        uint64Numbers[i] = data.getBigUint64(i);
    }
    // debugger;
    const numberStringArray = uint64Numbers.map((uint64Number) => {
        return String(uint64Number);
    })
    return numberStringArray.toString();
}

function parseAsUint64NumbersLittleEndian(data: DataView): string {
    if (data.byteLength < 8) {
        return "";
    }
    let uint64Numbers = new Array();
    for (let i = 0; i < (data.byteLength/8); i++) {
        if ((i*8) > data.byteLength) {
            debugger;
        }
        if ((data.byteLength/8) < 1) {
            return '';
        }

        uint64Numbers[i] = data.getBigUint64(i, true);
    }
    // debugger;
    const numberStringArray = uint64Numbers.map((uint64Number) => {
        return String(uint64Number);
    })
    return numberStringArray.toString();
}


function parseUTF8StringDataView(data: DataView): string {
    let chars = new Array(data.byteLength);
    for (let i = 0; i < (data.byteLength); i++) {
        chars[i] = data.getUint8(i);
    }
    const converted = String.fromCharCode.apply(null, chars);
    return converted;
}

async function checkBluetooth(dispatch: ReturnType<typeof useDispatch>) {
    console.assert(navigator.bluetooth);
    if (navigator.bluetooth === undefined) {
        dispatch(setBluetoothAvailableError('bluetooth is unavailable on your platform. (navigator.bluetooth undefined)'));
        dispatch(setBluetoothAvailable(false));
        alert('bluetooth is unavailable on your platform. (navigator.bluetooth undefined)');
        return;
    }
    console.assert(navigator.bluetooth.getAvailability);
    const available = await navigator.bluetooth.getAvailability();
    console.log("bluetooth available: ", available);
    dispatch(setBluetoothAvailable(available));
    if (!available) {
        alert("bluetooth may not be available.");
        dispatch(setBluetoothAvailableError('bluetooth may not be available. navigator.bluetooth.getAvailability() returned false.'));
        return;
    }
    dispatch(setBluetoothAvailableError(null));
}

async function getAvailableDevices(): Promise<BluetoothDevice[] | null> {
    console.assert(navigator.bluetooth);
    console.assert(navigator.bluetooth.getDevices);
    const devices = await navigator.bluetooth.getDevices();
    if (devices.length === 0) {
        debugger;
        console.log("no devices available...")
        return null;
    }
    console.log("bluetooth devices:");

    console.table(devices);

    return devices;
}

async function getADevice(): Promise<BluetoothDevice> {

    const options = aranet4DeviceRequestOptions();

    console.assert(navigator.bluetooth);
    console.assert(navigator.bluetooth.referringDevice);
    //https://developer.mozilla.org/en-US/docs/Web/API/Bluetooth/requestDevice
    const device = await navigator.bluetooth.requestDevice(options);
    return device;


}

async function maybeConnectDevice(dispatch: ReturnType<typeof useDispatch>, maybeConnectedDevice: (BluetoothRemoteGATTServer | null)): Promise<BluetoothRemoteGATTServer | null> {
    if (maybeConnectedDevice) {
        return maybeConnectedDevice;
    }

    debugger;
    const options = aranet4DeviceRequestOptions();
    
    console.assert(navigator.bluetooth);
    console.assert(navigator.bluetooth.requestDevice);
    //https://developer.mozilla.org/en-US/docs/Web/API/Bluetooth/requestDevice


    const device = await navigator.bluetooth.requestDevice(options);
    if (device.gatt === undefined) {
        debugger;
        return null;
    }
    dispatch(setDeviceID(device.id));
    if (device.name !== undefined) {
        dispatch(setDeviceName(device.name));
    }
    else {
        dispatch(setDeviceName(''));
    }
    
    const deviceServer = await device.gatt.connect();
    return deviceServer;
}

// function unixTimeToJSTime(rawUnixTime: bigint): Date {
//    
//     const asNumber = Number(rawUnixTime);
//     debugger;
//     const date = new Date(asNumber);
//
//     // const milisecondsScale = BigInt(1000);
//     // const miliseconds = (milisecondsScale * rawUnixTime);
//     // if (miliseconds > Number.MAX_SAFE_INTEGER) {
//     //     Sentry.captureMessage(`miliseconds (${miliseconds}) > Number.MAX_SAFE_INTEGER (${Number.MAX_SAFE_INTEGER})`);
//     //     throw new Error(`miliseconds > Number.MAX_SAFE_INTEGER`);
//     // }
//     // const milisecondsNumber = Number(miliseconds);
//
//     return date;
// }

async function innerGetAranet4DataOverBluetooth(dispatch: ReturnType<typeof useDispatch>, maybeConnectedDevice: (BluetoothRemoteGATTServer | null)) {
    const deviceServer = await maybeConnectDevice(dispatch, maybeConnectedDevice);
    if (deviceServer === null) {
        debugger;
        return;
    }

    const Aranet4Service = await deviceServer.getPrimaryService(SENSOR_SERVICE_UUID);

    //TODO: should I batch with getCharacteristics instead?
    console.log("Got primary sensor service!");

    const co2Characteristic = await Aranet4Service.getCharacteristic(ARANET_CO2_MEASUREMENT_CHARACTERISTIC_UUID);
    console.log("Got co2 characteristic!");

    const co2Data = await co2Characteristic.readValue();
    parse_ARANET_CO2_MEASUREMENT_CHARACTERISTIC_UUID(co2Data, dispatch);

    const secondsSinceLastmeasurement = await queryAranet4SecondsSinceLastMeasurement(Aranet4Service);
    dispatch(setAranet4SecondsSinceLastMeasurement(secondsSinceLastmeasurement));


    const measurementInterval = await queryAranet4MeasurementInterval(Aranet4Service);
    dispatch(setAranet4MeasurementInterval(measurementInterval));

    const totalMeasurements = await queryAranet4TotalMeasurements(Aranet4Service);
    dispatch(setAranet4TotalMeasurements(totalMeasurements));

    const rawSensorCalibrationValue = await queryAranet4SensorCalibration(Aranet4Service);
    // ARANET4_AT_FACTORY_CALIBRATION_VALUE
    // const UNIX_MONDAY_JANUARY_1_2018 = 1514764800;

    if (rawSensorCalibrationValue === ARANET4_MINIMUM_FACTORY_CALIBRATION_VALUE) {
        dispatch(setAranet4Calibration(ARANET_4_BAD_CALIBRATION_STRING));
    }
    else if (rawSensorCalibrationValue > ARANET4_MINIMUM_FACTORY_CALIBRATION_VALUE) {
        dispatch(setAranet4Calibration(`Maybe at factory? (${rawSensorCalibrationValue})`));
        Sentry.captureMessage(`Aranet4 calibration: ${rawSensorCalibrationValue}`);
    }
    else if ((rawSensorCalibrationValue < ARANET4_MINIMUM_FACTORY_CALIBRATION_VALUE) && (rawSensorCalibrationValue > UNIX_MONDAY_JANUARY_1_2018)) {
        dispatch(setAranet4Calibration(`Maybe at factory? (${rawSensorCalibrationValue})`));
        Sentry.captureMessage(`Aranet4 calibration: ${rawSensorCalibrationValue}`);
    }
    else if (rawSensorCalibrationValue < UNIX_MONDAY_JANUARY_1_2018) {
        dispatch(setAranet4Calibration(`Likely NON-factory: (${rawSensorCalibrationValue})`));
    }

    // UNIX_MONDAY_JANUARY_1_2018

    // console.log("Getting sensor logs...");
    // const sensorLogsCharacteristic = await Aranet4Service.getCharacteristic(ARANET_SENSOR_LOGS_UUID);
    // const sensorLogsData = await sensorLogsCharacteristic.readValue();


    console.log("Getting device information service...")
    const deviceInformationService = await deviceServer.getPrimaryService(DEVICE_INFORMATION_SERVICE_UUID);


    const modelNumberString = await queryBluetoothModelNumberString(deviceInformationService);
    dispatch(setModelNumberString(modelNumberString));

    const firmwareRevisionString = await queryBluetoothFirmwareRevisionString(deviceInformationService);
    dispatch(setFirmwareRevisionString(firmwareRevisionString));


    const hardwareRevisionString = await queryBluetoothHardwareRevisionString(deviceInformationService);
    dispatch(setHardwareRevisionString(hardwareRevisionString));

    const softwareRevisionString = await queryBluetoothSoftwareRevisionSoftwareRevisionString(deviceInformationService);
    dispatch(setSoftwareRevisionString(softwareRevisionString));

    const manufacturernameString = await queryBluetoothManufacturerNameString(deviceInformationService);
    dispatch(setManufacturerName(manufacturernameString));

    // OK, so there's a problem here. Reading the serial number is currently blocklisted!
    // See:
    //  https://github.com/WebBluetoothCG/web-bluetooth/issues/24
    //  https://github.com/WebBluetoothCG/registries/issues/2#issuecomment-1000950490
    // This is essentially kinda understandable, since lots of devices may not even have unique serial numbers, but it means that I need to work around this. Grr.


    // const serialNumberStringCharacteristic = await deviceInformationService.getCharacteristic(GENERIC_GATT_SERIAL_NUMBER_STRING_UUID);
    // const serialNumberStringData = await serialNumberStringCharacteristic.readValue();
    // const serialNumberString = parseUTF8StringDataView(serialNumberStringData);
    // debugger;

    console.log("Getting generic access service...");
    const genericAccessService = await deviceServer.getPrimaryService(GENERIC_ACCESS_SERVICE_UUID);

    const name = await queryBluetoothDeviceNameString(genericAccessService);

    dispatch(setDeviceNameFromCharacteristic(name));


    //TODO: seconds last update, measurement interval, total measurements, model number string, firmware revision, hardware revision, software revision, manufacturer name

}


async function queryBluetoothDeviceNameString(genericAccessService: BluetoothRemoteGATTService) {
    console.log("Getting generic GATT device name...");
    const nameCharacteristic = await genericAccessService.getCharacteristic(GENERIC_GATT_DEVICE_NAME_UUID);
    const nameData = await nameCharacteristic.readValue();
    const name = parseUTF8StringDataView(nameData);
    return name;
}

async function queryBluetoothManufacturerNameString(deviceInformationService: BluetoothRemoteGATTService) {
    console.log("Getting manufacturer name....");
    const manufactuterNameStringCharacteristic = await deviceInformationService.getCharacteristic(GENERIC_GATT_MANUFACTURER_NAME_STRING_UUID);
    const manufacturerNameData = await manufactuterNameStringCharacteristic.readValue();
    const manufacturernameString = parseUTF8StringDataView(manufacturerNameData);
    return manufacturernameString;
}

async function queryBluetoothSoftwareRevisionSoftwareRevisionString(deviceInformationService: BluetoothRemoteGATTService) {
    console.log("Getting software revision string...");
    const softwareRevisionStringCharacteristic = await deviceInformationService.getCharacteristic(GENERIC_GATT_SOFTWARE_REVISION_STRING_UUID);
    const softwareRevisionData = await softwareRevisionStringCharacteristic.readValue();
    const softwareRevisionString = parseUTF8StringDataView(softwareRevisionData);
    return softwareRevisionString;
}

async function queryBluetoothHardwareRevisionString(deviceInformationService: BluetoothRemoteGATTService) {
    console.log("Getting hardware revision string...");
    const hardwareRevisionStringCharacteristic = await deviceInformationService.getCharacteristic(GENERIC_GATT_HARDWARE_REVISION_STRING_UUID);
    const hardwareRevisionData = await hardwareRevisionStringCharacteristic.readValue();
    const hardwareRevisionString = parseUTF8StringDataView(hardwareRevisionData);
    return hardwareRevisionString;
}

async function queryBluetoothFirmwareRevisionString(deviceInformationService: BluetoothRemoteGATTService) {
    console.log("Getting firmware revision string...");
    const firmwareStringCharacteristic = await deviceInformationService.getCharacteristic(GENERIC_GATT_FIRMWARE_REVISION_STRING_UUID);
    const firmwareStringData = await firmwareStringCharacteristic.readValue();
    const firmwareRevisionString = parseUTF8StringDataView(firmwareStringData);
    return firmwareRevisionString;
}

async function queryBluetoothModelNumberString(deviceInformationService: BluetoothRemoteGATTService) {
    console.log("Getting model number string...");
    const modelNumberStringCharacteristic = await deviceInformationService.getCharacteristic(GENERIC_GATT_DEVICE_MODEL_NUMBER_STRING_UUID);
    const modelNumberStringData = await modelNumberStringCharacteristic.readValue();
    const modelNumberString = parseUTF8StringDataView(modelNumberStringData);
    return modelNumberString;
}

async function queryAranet4SensorCalibration(Aranet4Service: BluetoothRemoteGATTService) {
    console.log("Getting sensor calibration...");
    const sensorCalibrationCharacteristic = await Aranet4Service.getCharacteristic(ARANET_SENSOR_CALIBRATION_DATA_UUID);
    const sensorCalibrationData = await sensorCalibrationCharacteristic.readValue();
    const rawSensorCalibrationValue = sensorCalibrationData.getBigUint64(0, true);
    return rawSensorCalibrationValue;
}

async function queryAranet4TotalMeasurements(Aranet4Service: BluetoothRemoteGATTService) {
    console.log("Getting total number of measurements...");
    const totalMeasurementsCharacteristic = await Aranet4Service.getCharacteristic(ARANET_TOTAL_MEASUREMENTS_UUID);
    const totalMeasurementsData = await totalMeasurementsCharacteristic.readValue();
    const totalMeasurements = totalMeasurementsData.getUint16(0, true);
    return totalMeasurements;
}

async function queryAranet4MeasurementInterval(Aranet4Service: BluetoothRemoteGATTService) {
    console.log("Getting measurement interval...");
    const measurementIntervalCharacteristic = await Aranet4Service.getCharacteristic(ARANET_MEASUREMENT_INTERVAL_UUID);
    const measurementIntervalData = await measurementIntervalCharacteristic.readValue();
    const measurementInterval = measurementIntervalData.getUint16(0, true);
    return measurementInterval;
}

async function queryAranet4SecondsSinceLastMeasurement(Aranet4Service: BluetoothRemoteGATTService) {
    console.log("Getting seconds since last update...");
    const secondsSinceLastMeasurementCharacteristic = await Aranet4Service.getCharacteristic(ARANET_SECONDS_LAST_UPDATE_UUID);
    const secondsSinceLastMeasurementData = await secondsSinceLastMeasurementCharacteristic.readValue();
    const secondsSinceLastmeasurement = secondsSinceLastMeasurementData.getUint16(0, true);
    return secondsSinceLastmeasurement;
}

async function getAranet4DataOverBluetooth(dispatch: ReturnType<typeof useDispatch>, maybeConnectedDevice: (BluetoothRemoteGATTServer | null)) {
    try {
        innerGetAranet4DataOverBluetooth(dispatch, maybeConnectedDevice);
    }
    catch (e) {
        if (e instanceof DOMException) {
            debugger;
            alert(`DOMException bluetooth operation likely cancelled. Error code: ${e.code}, message: ${e.message}`);
            console.error(e);
            return;
        }
        else {
            console.error(`Unexpected exception during bluetooth. Exception type: ${typeof e}, e: ${e}`);
            alert(`Unexpected exception during bluetooth. Exception type: ${typeof e}, e: ${e}`);
            throw e;
        }

    }
}

function maybeCO2(co2: number | null) {
    if (co2 === null) {
        return (
            <span>
                No CO2 value.
            </span>
        );
    }
    return (
        <span>
            CO2: {co2}ppm
        </span>
    )
}

function maybeBluetoothAvailableError(bluetoothAvailableError: string | null) {
    if (bluetoothAvailableError === null) {
        return (
            <div></div>
        );
    }
    return (
        <div style={{color: 'red'}}>
            Bluetooth might not be available. Error: {bluetoothAvailableError}
        </div>
    )
}

function maybeBluetoothAvailable(bluetoothAvailable: boolean | null) {
    if (bluetoothAvailable === null) {
        return (
            <div></div>
        );
    }
    if (bluetoothAvailable) {
        return (
            <div>
                Bluetooth available.
            </div>
        );
    }
    return (
        <div style={{color: 'red'}}>
            Bluetooth not available.
        </div>
    );
}

interface WatchAdvertisementsOptions {
    signal: AbortSignal;
  }

type watchAdvertisements = (options: WatchAdvertisementsOptions) => Promise<undefined>;

type handlerType = ((device: BluetoothDevice, event: BluetoothAdvertisingEvent, abortController: AbortController) => Promise<void>);

const useBluetoothAdvertisementReceived = (bluetoothDevicesKnown: (BluetoothDevice[] | null)): (BluetoothRemoteGATTServer | null) => {
    // const savedHandler: MutableRefObject<handlerType | undefined> = useRef();
    const [deviceServer, setDeviceServer] = useState(null as (BluetoothRemoteGATTServer | null));
    const dispatch = useDispatch();

    const watchAdvertisementEventReceived = async (device: BluetoothDevice, event: BluetoothAdvertisingEvent, abortController: AbortController): Promise<void> => {
        abortController.abort();
        messages(`Received advertisement from '${device.name}', id: '${device.id}...`, dispatch);

        messages(`Event: name: '${event.name}', appearance: '${event.appearance}', rssi: '${event.rssi}', txPower: '${event.txPower}'`, dispatch);

        if (device.gatt === undefined) {
            messages("device.gatt undefined? CANNOT query seemlessly", dispatch);
            debugger;
            return;
        }
        dispatch(setDeviceID(device.id));
        if (device.name !== undefined) {
            dispatch(setDeviceName(device.name));
        }
        else {
            debugger;
            dispatch(setDeviceName(''));
        }

        const deviceServer = await device.gatt.connect();
        messages(`Connected seamlessly!`, dispatch);
        setDeviceServer(deviceServer);

    }

    useEffect(() => {
        if (bluetoothDevicesKnown === null) {
            messages('Loading known bluetooth devices...', dispatch);
            return;
        }
        if (bluetoothDevicesKnown.length === 0) {
            messages('Zero available bluetooth devices.', dispatch);
        }
        messages(`The browser reports ${bluetoothDevicesKnown.length} bluetooth devices known. NOTE: for now, only querying one.`, dispatch);
        for (let i = 0; i < bluetoothDevicesKnown.length; ++i) {
            messages(`\tDevice ${i}: ${bluetoothDevicesKnown[i].name}`, dispatch);
        }
        if (bluetoothDevicesKnown.length > 1) {
            console.warn(`There are ${bluetoothDevicesKnown.length} devices! Will ignore all but first.`);
        }
        // messages("let's try and request them without a user gesture using the 'advertisementreceived' event and 'watchAdvertisements'...", dispatch);

        //See  https://googlechrome.github.io/samples/web-bluetooth/watch-advertisements-and-connect.html
        //also https://googlechrome.github.io/samples/web-bluetooth/watch-advertisements-and-connect-async-await.html
        const abortController = new AbortController();

        const eventListenerRefShim = (event: BluetoothAdvertisingEvent) => {
            watchAdvertisementEventReceived(bluetoothDevicesKnown[0], event, abortController);
        }

        const options = {once: true};
        (bluetoothDevicesKnown[0].addEventListener as any)('advertisementreceived', eventListenerRefShim, options);

        messages("waiting for device advertisements?", dispatch);
        ((bluetoothDevicesKnown[0].watchAdvertisements as watchAdvertisements)({signal: abortController.signal }));

        return () => {
            (bluetoothDevicesKnown[0].removeEventListener as any)('advertisementreceived', eventListenerRefShim, options);
        };
    }, [bluetoothDevicesKnown]);

    return deviceServer;

}

const MaybeIfValue: React.FC<{text: string, value: any}> = ({text, value}) => {
    if (value === undefined) {
        return null;
    }
    if (value === null) {
        return (
        <div>
            <span>{text}</span>Loading...<br/>
        </div>            
        )
    }
    return (
        <div>
            <span>{text}</span>{value}<br/>
        </div>
    );
}


function falsyNavigatorBluetooth(dispatch: ReturnType<typeof useDispatch>) {
    dispatch(setBluetoothAvailable(false));
    if (navigator.bluetooth === null) {
        dispatch(setBluetoothAvailableError("navigator.bluetooth === null, bluetooth is not availabe."));
    }
    else if (navigator.bluetooth === undefined) {
        dispatch(setBluetoothAvailableError("navigator.bluetooth === undefined, bluetooth is not availabe."));
    }
    else {
        Sentry.captureMessage(`navigator.bluetooth === ${navigator.bluetooth}`);
        dispatch(setBluetoothAvailableError(`navigator.bluetooth === ${navigator.bluetooth}, bluetooth is not availabe.`));
    }
    messages('Cannot use bluetooth, navigator.bluetooth is not exposed properly.', dispatch);

}

function falsyGetDevices(dispatch: ReturnType<typeof useDispatch>) {
    if ((navigator.bluetooth.getDevices as any) === undefined) {
        messages('Cannot seamlessly connect, getDevices is undefined', dispatch);
        return;
    }
    else if ((navigator.bluetooth.getDevices as any) === null) {
        messages('Cannot seamlessly connect, getDevices is null', dispatch);
        return;
    }
    Sentry.captureMessage(`getDevices is an unexpected value: ${navigator.bluetooth.getDevices}`);
    messages(`Cannot seamlessly connect, getDevices is an unexpected value: ${navigator.bluetooth.getDevices}`, dispatch);
}

function getDevicesSupported(dispatch: ReturnType<typeof useDispatch>, setBluetoothDevicesKnown: React.Dispatch<React.SetStateAction<BluetoothDevice[] | null>>): boolean {
    if (!(navigator.bluetooth)) {
        falsyNavigatorBluetooth(dispatch);
        setBluetoothDevicesKnown([]);
        return false;
    }
    if(!(navigator.bluetooth.getDevices as any)) {
        falsyGetDevices(dispatch);
        setBluetoothDevicesKnown([]);
        return false;
    }
    return true;
}

// NOTE TO SELF, bluetooth can be finicky! Here's the chrome error handling class:
// https://source.chromium.org/chromium/chromium/src/+/main:third_party/blink/renderer/modules/bluetooth/bluetooth_error.h;l=36;drc=a817d852ea2f2085624d64154ad847dfa3faaeb6
// This should also work? https://source.chromium.org/chromium/chromium/src/+/main:third_party/blink/renderer/modules/bluetooth/bluetooth_error.h
// The full mapping code is here: https://source.chromium.org/chromium/chromium/src/+/main:third_party/blink/renderer/modules/bluetooth/bluetooth_error.cc;l=90


export function BluetoothTesting(): JSX.Element {
    const debugText = useSelector(selectDebugText);
    const co2 = useSelector(selectCO2);
    const temperature = useSelector(selectTemperature);
    const barometricPressure = useSelector(selectBarometricPressure);
    const humidity = useSelector(selectHumidity);
    const battery = useSelector(selectBattery);
    // const aranet4UnknownField = useSelector(selectAranet4UnknownField);
    const deviceNameFromCharacteristic = useSelector(selectDeviceNameFromCharacteristic);
    const deviceName = useSelector(selectDeviceName);
    const deviceID = useSelector(selectDeviceID);
    const measurementInterval = useSelector(selectAranet4MeasurementInterval);
    const totalMeasurements = useSelector(selectAranet4TotalMeasurements);
    const modelNumber = useSelector(selectModelNumberString);
    const firmwareRevision = useSelector(selectFirmwareRevisionString);
    const hardwareRevision = useSelector(selectHardwareRevisionString);
    const softwareRevision = useSelector(selectSoftwareRevisionString);
    const manufacturerName = useSelector(selectManufacturerNameString);
    const aranet4SecondsSinceLastMeasurement = useSelector(selectAranet4SecondsSinceLastUpdate);
    const aranet4Color = useSelector(selectAranet4Color);
    const aranet4Calibration = useSelector(selectAranet4Calibration);

    const bluetoothAvailableError = useSelector(selectBluetoothAvailableError);
    const bluetoothAvailable = useSelector(selectBluetoothAvailable);

    const [bluetoothDevicesKnown, setBluetoothDevicesKnown] = useState(null as (BluetoothDevice[] | null));

    const seamlesslyConnectedDeviceServer = useBluetoothAdvertisementReceived(bluetoothDevicesKnown);


    const dispatch = useDispatch();

    useEffect(() => {
        async function tryGetDevices() {
            if (!getDevicesSupported(dispatch, setBluetoothDevicesKnown)) {
                return;
            }
            console.assert(navigator.bluetooth.getDevices as any);
            //Aha! There's a google doc: https://docs.google.com/document/d/1h3uAVXJARHrNWaNACUPiQhLt7XI-fFFQoARSs1WgMDM/edit#heading=h.jdnga4sjs82y
            messages('User browser supports getDevices!', dispatch);
            const knownDevices = await getAvailableDevices();
            setBluetoothDevicesKnown(knownDevices);
        }
        tryGetDevices();
    }, []);

    useEffect(() => {
        if (seamlesslyConnectedDeviceServer === null) {
            return;
        }
        if (seamlesslyConnectedDeviceServer.device.name === undefined) {
            messages(`Something is WRONG. device.name is undefined!`, dispatch);
            return;
        }
        if (seamlesslyConnectedDeviceServer.device.name.includes('Aranet')) {
            messages('Starting automatic query...', dispatch);
            getAranet4DataOverBluetooth(dispatch, seamlesslyConnectedDeviceServer).then(() => {
                messages('query complete!', dispatch);
            })
        }
    }, [seamlesslyConnectedDeviceServer])
    
    const checkBluetoothAvailable = () => {
        checkBluetooth(dispatch);
    }

    const queryDeviceOverBluetooth = () => {
        dispatch(setDebugText(''));
        bluetoothTestingStuffFunc(dispatch);
    }

    const queryAranet4 = () => {
        getAranet4DataOverBluetooth(dispatch, seamlesslyConnectedDeviceServer);
    }
    return (
        <div>
            <h3>Experimental Bluetooth support</h3>

            <MaybeIfValue text={"Bluetooth device name: "} value={deviceName}/>
            <MaybeIfValue text={"Device name (GATT characteristic): "} value={deviceNameFromCharacteristic}/>
            <MaybeIfValue text={"Unique Bluetooth device ID: "} value={deviceID}/>

            {maybeCO2(co2)}<br/>
            Temperature: {temperature}°C<br/>
            Pressure: {barometricPressure}hPa<br/>
            Relative Humidity: {humidity}%<br/>
            Battery: {battery}%<br/>
            Aranet4 color: {aranet4Color}<br/>
            <br/>
            
            <MaybeIfValue text={"Measurement interval (seconds): "} value={measurementInterval}/>
            <MaybeIfValue text={"Seconds since last update: "} value={aranet4SecondsSinceLastMeasurement}/>
            <MaybeIfValue text={"Total number of measurements: "} value={totalMeasurements}/>
            <MaybeIfValue text={"Calibration: "} value={aranet4Calibration}/>
            <br/>
            <MaybeIfValue text={"Manufacturer: "} value={manufacturerName}/>
            <MaybeIfValue text={"Model number: "} value={modelNumber}/>
            <MaybeIfValue text={"Firmware revision: "} value={firmwareRevision}/>
            <MaybeIfValue text={"Software revision: "} value={softwareRevision}/>
            <MaybeIfValue text={"Hardware revision: "} value={hardwareRevision}/>
            <br/>
            <Button onClick={queryAranet4}>Query Aranet4</Button><br/>
            <Button onClick={queryDeviceOverBluetooth}>Dump ALL Bluetooth device info, attempt query</Button><br/>
            <Button onClick={checkBluetoothAvailable}>Check bluetooth availability</Button><br/>
            {maybeBluetoothAvailable(bluetoothAvailable)}<br/>
            {maybeBluetoothAvailableError(bluetoothAvailableError)}<br/>
            <br/>

            <pre>{debugText}</pre>
        </div>
    )
}