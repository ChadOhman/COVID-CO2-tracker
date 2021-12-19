/// <reference types="web-bluetooth" />
import { Button } from "react-bootstrap";

import {useDispatch} from 'react-redux';
import {useSelector} from 'react-redux';



import { selectCO2, selectDebugText, selectBluetoothAvailableError, setCO2, setDebugText, setBluetoothAvailableError, selectBluetoothAvailable, setBluetoothAvailable, setTemperature, selectTemperature, setBarometricPressure, selectBarometricPressure, selectHumidity, setHumidity, selectBattery, setBattery, setAranet4UnknownField, selectAranet4UnknownField } from "./bluetoothSlice";

declare module BluetoothUUID {
    export function getService(name: BluetoothServiceUUID ): string;
    export function getCharacteristic(name: BluetoothCharacteristicUUID): string;
    export function getDescriptor(name: BluetoothDescriptorUUID): string;
    export function canonicalUUID(alias: number): string;
}



//https://gist.github.com/beaufortfrancois/1323816074f7383cfa574811abd6ea9c


const SENSOR_SERVICE_UUID = 'f0cd1400-95da-4f4b-9ac8-aa55d312af0c'

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
    ['00002a00-0000-1000-8000-00805f9b34fb', 'Device Name'],
    ['00002a01-0000-1000-8000-00805f9b34fb', 'Appearance'],
    ['00002a02-0000-1000-8000-00805f9b34fb', 'Peripheral Privacy Flag'],
    ['00002a03-0000-1000-8000-00805f9b34fb', 'Reconnection Address'],
    ['00002a04-0000-1000-8000-00805f9b34fb', 'Peripheral Preferred Connection Parameters'],
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
    ['00002a19-0000-1000-8000-00805f9b34fb', 'Battery Level'],
    ['00002a1a-0000-1000-8000-00805f9b34fb', 'Battery Power State'],
    ['00002a1b-0000-1000-8000-00805f9b34fb', 'Battery Level State'],
    ['00002a1c-0000-1000-8000-00805f9b34fb', 'Temperature Measurement'],
    ['00002a1d-0000-1000-8000-00805f9b34fb', 'Temperature Type'],
    ['00002a1e-0000-1000-8000-00805f9b34fb', 'Intermediate Temperature'],
    ['00002a1f-0000-1000-8000-00805f9b34fb', 'Temperature Celsius'],
    ['00002a20-0000-1000-8000-00805f9b34fb', 'Temperature Fahrenheit'],
    ['00002a21-0000-1000-8000-00805f9b34fb', 'Measurement Interval'],
    ['00002a22-0000-1000-8000-00805f9b34fb', 'Boot Keyboard Input Report'],
    ['00002a23-0000-1000-8000-00805f9b34fb', 'System ID'],
    ['00002a24-0000-1000-8000-00805f9b34fb', 'Model Number String'],
    ['00002a25-0000-1000-8000-00805f9b34fb', 'Serial Number String'],
    ['00002a26-0000-1000-8000-00805f9b34fb', 'Firmware Revision String'],
    ['00002a27-0000-1000-8000-00805f9b34fb', 'Hardware Revision String'],
    ['00002a28-0000-1000-8000-00805f9b34fb', 'Software Revision String'],
    ['00002a29-0000-1000-8000-00805f9b34fb', 'Manufacturer Name String'],
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


const characteristicUUIDDescriptions = new Map([
    [ARANET_CO2_MEASUREMENT_CHARACTERISTIC_UUID, "Aranet4: CO2 measurements"],
    [ARANET_TOTAL_MEASUREMENTS_UUID, "Aranet4: total number of measurements"],
    [ARANET_MEASUREMENT_INTERVAL_UUID, "Aranet4: measurement interval"],
    [ARANET_SECONDS_LAST_UPDATE_UUID, "Aranet4: seconds since last update"],
    [ARANET_CO2_MEASUREMENT_WITH_INTERVAL_TIME_CHARACTERISTIC_UUID, "Aranet4: CO2 measurements, interval, time since measurements"],
    ["00002a00-0000-1000-8000-00805f9b34fb", "Device Name"],
    ["00002a19-0000-1000-8000-00805f9b34fb", "Aranet4: Battery level"],
    ["00002a24-0000-1000-8000-00805f9b34fb", "Model Number String"],
    ["00002a25-0000-1000-8000-00805f9b34fb", "Serial Number String"],
    ["00002a27-0000-1000-8000-00805f9b34fb", "Hardware Revision String"],
    ["00002a28-0000-1000-8000-00805f9b34fb", "Software Revision String"],
    ["00002a29-0000-1000-8000-00805f9b34fb", "Manufacturer Name String"]
]);


function aranet4DeviceRequestOptions(): RequestDeviceOptions {
    const filter: BluetoothLEScanFilter = {
        services: [SENSOR_SERVICE_UUID]
    }
    const services: BluetoothServiceUUID[] = [
        'device_information',
        'battery_service',
        'environmental_sensing',
        'generic_attribute',
        'generic_access'
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

// async function hasGetDevices() {
//     const devices = await navigator.bluetooth.getDevices()
//     console.log("bluetooth devices:");
//     console.table(devices);
//     if (devices.length === 0) {
//         debugger;
//     }
// }

function messages(messagesString: string, objectOrString: string, dispatch: ReturnType<typeof useDispatch>): string {
    let newMessagesString = messagesString + `${objectOrString}\r\n`;
    console.log(objectOrString);
    dispatch(setDebugText(newMessagesString))
    return `${objectOrString}\r\n`;
}

async function checkBluetooth(dispatch: ReturnType<typeof useDispatch>) {
    console.log(navigator.bluetooth);
    if (navigator.bluetooth === undefined) {
        dispatch(setBluetoothAvailableError('bluetooth is unavailable on your platform. (navigator.bluetooth undefined)'));
        dispatch(setBluetoothAvailable(false));
        alert('bluetooth is unavailable on your platform. (navigator.bluetooth undefined)');
        return;
    }
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

async function bluetoothTestingStuffFunc(dispatch: ReturnType<typeof useDispatch>) {

    // if ((navigator.bluetooth.getDevices as any)) {
    //     hasGetDevices();
    // }

    const options = aranet4DeviceRequestOptions();

    //https://developer.mozilla.org/en-US/docs/Web/API/Bluetooth/requestDevice
    const device = await navigator.bluetooth.requestDevice(options);
    // const co2_descriptor = BluetoothUUID.getCharacteristic('f0cd3001-95da-4f4b-9ac8-aa55d312af0c');
    // console.log(co2_descriptor);
    // debugger;

    let bluetoothMessages = "";

    bluetoothMessages += messages(bluetoothMessages, `device.id: ${device.id}`, dispatch);
    bluetoothMessages += messages(bluetoothMessages, `device.name: ${device.name}`, dispatch);
    bluetoothMessages += messages(bluetoothMessages, `device.uuids: ${device.uuids}`, dispatch);

    if (device.gatt === undefined) {
        debugger;
        return;
    }
    const deviceServer = await device.gatt.connect();


    const services = await deviceServer.getPrimaryServices();
    bluetoothMessages += messages(bluetoothMessages, `${services.length} services`, dispatch);
    for (let serviceIndex = 0; serviceIndex < services.length; serviceIndex++) {
        const uuid = services[serviceIndex].uuid;
        const short_uuid = uuid.substring(4,8).toUpperCase();
        if (GENERIC_GATT_SERVICE_UUID_DESCRIPTIONS.has(uuid)) {
            const serviceName = GENERIC_GATT_SERVICE_UUID_DESCRIPTIONS.get(uuid)
            bluetoothMessages += messages(bluetoothMessages, `services[${serviceIndex}].uuid: ${uuid}... Known service! ${serviceName}`, dispatch);
        }
        else if (GENERIC_GATT_SERVICE_SHORT_ID_DESCRIPTIONS.has(short_uuid)) {
            const serviceName = GENERIC_GATT_SERVICE_SHORT_ID_DESCRIPTIONS.get(short_uuid)
            bluetoothMessages += messages(bluetoothMessages, `services[${serviceIndex}].uuid: ${uuid}... Known service! ${serviceName}`, dispatch);
        }
        else {
            bluetoothMessages += messages(bluetoothMessages, `services[${serviceIndex}].uuid: ${uuid}`, dispatch);
        }
    }

    bluetoothMessages += messages(bluetoothMessages, `Got services (length: ${services.length}):`, dispatch)
    for (let serviceIndex = 0; serviceIndex < services.length; serviceIndex++) {
        const uuid = services[serviceIndex].uuid;
        bluetoothMessages += messages(bluetoothMessages, `services[${serviceIndex}].uuid: ${uuid}`, dispatch);
        // debugger;
        // if(GENERIC_GATT_SERVICE_UUID_DESCRIPTIONS.has(services[serviceIndex].uuid.substring(0,8))) {
        //     debugger;
        // }
        //
        const short_uuid = uuid.substring(4,8).toUpperCase();
        if (GENERIC_GATT_SERVICE_UUID_DESCRIPTIONS.has(uuid)) {
            const serviceName = GENERIC_GATT_SERVICE_UUID_DESCRIPTIONS.get(uuid)
            bluetoothMessages += messages(bluetoothMessages, `services[${serviceIndex}].uuid: ${uuid}... Known service! ${serviceName}`, dispatch);
        }
        else if (GENERIC_GATT_SERVICE_SHORT_ID_DESCRIPTIONS.has(short_uuid)) {
            const serviceName = GENERIC_GATT_SERVICE_SHORT_ID_DESCRIPTIONS.get(short_uuid)
            bluetoothMessages += messages(bluetoothMessages, `\t\tKnown service! ${serviceName}`, dispatch);
        }

        bluetoothMessages += messages(bluetoothMessages, `services[${serviceIndex}].isPrimary: ${services[serviceIndex].isPrimary}`, dispatch);
        // debugger;

        //getCharacteristics can fail!
        const characteristics = await services[serviceIndex].getCharacteristics();

        bluetoothMessages += messages(bluetoothMessages, `Got characteristics (length ${characteristics.length}):`, dispatch)
        for (let characteristicIndex = 0; characteristicIndex < characteristics.length; characteristicIndex++) {
            bluetoothMessages += messages(bluetoothMessages, `\tservices[${serviceIndex}], characteristics[${characteristicIndex}].uuid: ${characteristics[characteristicIndex].uuid}`, dispatch);
            if (characteristicUUIDDescriptions.has(characteristics[characteristicIndex].uuid)) {
                bluetoothMessages += messages(bluetoothMessages, `\t\tKnown characteristic! ${characteristicUUIDDescriptions.get(characteristics[characteristicIndex].uuid)}`, dispatch);
            }
            bluetoothMessages += messages(bluetoothMessages, `\tservices[${serviceIndex}], characteristics[${characteristicIndex}].value: ${characteristics[characteristicIndex].value}`, dispatch);
            bluetoothMessages += dumpBluetoothCharacteristicProperties(characteristics[characteristicIndex].properties, serviceIndex, characteristicIndex);
            if (characteristics[characteristicIndex].properties.read) {
                try {
                    const data = await characteristics[characteristicIndex].readValue();
                    bluetoothMessages += messages(bluetoothMessages, `\t\tdata: ${data.buffer}`, dispatch);
                    if (characteristics[characteristicIndex].uuid === ARANET_CO2_MEASUREMENT_CHARACTERISTIC_UUID) {
                        // debugger;
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
                        const unknownField = data.getUint8(8);
                        dispatch(setAranet4UnknownField(unknownField));
                    }
                            
                }
                catch(e) {
                    if (e instanceof DOMException) {
                        bluetoothMessages += messages(bluetoothMessages, `\t\tCannot read from ${characteristics[characteristicIndex].uuid}!`, dispatch)
                    }
                    else {
                        throw e;
                    }
                }
            }
            bluetoothMessages += messages(bluetoothMessages, '\n', dispatch);
        }
        bluetoothMessages += messages(bluetoothMessages, '\n', dispatch);
    }
}

function maybeCO2(co2: number | null) {
    if (co2 === null) {
        return (
            <div>
                No CO2 value.
            </div>
        );
    }
    return (
        <div>
            CO2: {co2}
        </div>
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

export function BluetoothTesting(): JSX.Element {
    const debugText = useSelector(selectDebugText);
    const co2 = useSelector(selectCO2);
    const temperature = useSelector(selectTemperature);
    const barometricPressure = useSelector(selectBarometricPressure);
    const humidity = useSelector(selectHumidity);
    const battery = useSelector(selectBattery);
    const aranet4UnknownField = useSelector(selectAranet4UnknownField);

    const bluetoothAvailableError = useSelector(selectBluetoothAvailableError);
    const bluetoothAvailable = useSelector(selectBluetoothAvailable);

    const dispatch = useDispatch();

    const checkBluetoothAvailable = () => {
        checkBluetooth(dispatch);
    }

    const queryDeviceOverBluetooth = () => {
        bluetoothTestingStuffFunc(dispatch);
    }


    return (
        <div>
            <h3>Experimental Bluetooth support</h3>
            <Button onClick={checkBluetoothAvailable}>Check bluetooth availability</Button>
            {maybeBluetoothAvailable(bluetoothAvailable)}
            {maybeBluetoothAvailableError(bluetoothAvailableError)}<br/>
            {maybeCO2(co2)}<br/>
            Temperature: {temperature}<br/>
            Pressure: {barometricPressure}<br/>
            Humidity: {humidity}<br/>
            Battery: {battery}<br/>
            Unknown/undocumented field: {aranet4UnknownField}<br/>
            <br/>
            <Button onClick={queryDeviceOverBluetooth}>Dump device info, attempt query</Button>
            <pre>{debugText}</pre>
        </div>
    )
}