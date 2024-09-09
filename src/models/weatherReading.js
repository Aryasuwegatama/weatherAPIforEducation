import { ObjectId } from "mongodb";
import { db } from "../database.js";

/**
 * Weather Reading object model constructor
 * 
 * @param {String | ObjectId | null} _id - The Id of the weather reading document (or null for new weather readings)
 * @param {String} deviceName - device name - the name of the device recording the weather data
 * @param {Number} precipitation - The precipitation value in mm/h
 * @param {Date} time - The timestamp of the weather reading
 * @param {Number} latitude - The latitude coordinate 
 * @param {Number} longitude - The longitude coordinate
 * @param {Number} temperature - The temperature value in C
 * @param {Number} atmosphericPressure - The atmospheric  pressure in kPa
 * @param {Number} maxWindSpeed - The maximum wind pressure value in m/s
 * @param {Number} solarRadiation - The solar radiation value in W/m^2
 * @param {Number} vaporPressure The vapor pressure value in kPa
 * @param {Number} windDirection - The wind direction value in degrees
 * @returns {Object} Object representing weather data reading
 */
export function WeatherReading (
    _id,
    deviceName,
    precipitation,
    time,
    latitude,
    longitude,
    temperature,
    atmosphericPressure,
    maxWindSpeed,
    solarRadiation,
    vaporPressure,
    humidity,
    windDirection,
){
    return {
        _id: new ObjectId(_id),
        "Device Name": deviceName,
        "Precipitation mm/h": parseFloat(precipitation),
        Time: new Date(time),
        Latitude: parseFloat(latitude),
        Longitude: parseFloat(longitude),
        "Temperature (°C)": parseFloat(temperature),
        "Atmospheric Pressure (kPa)": parseFloat(atmosphericPressure),
        "Max Wind Speed (m/s)": parseFloat(maxWindSpeed),
        "Solar Radiation (W/m2)": parseFloat(solarRadiation),
        "Vapor Pressure (kPa)": parseFloat(vaporPressure),
        "Humidity (%)": parseFloat(humidity),
        "Wind Direction (°)": parseFloat(windDirection),
    }; 
}

/**
 * get all weather data readings
 * 
 * @exports
 * @async
 * @returns {Promise<Object[]>} -A promise for the array of weather data readings.
 */
export async function getAllReadings() {
    return db.collection("WeatherData").find();
}

/**
 * 
 * @param {String} deviceName -  The name of the device to filter by.
 * @returns {Promise<Object[]>} A Promise that resolves with an array of Weather Data Readings from the specified Device.
 */
export async function getAllReadingsByDeviceName(deviceName) {
    return db.collection("WeatherData")
    .find({"Device Name": deviceName})
    .sort({Time: -1});
}


/**
 * 
 * @param {String} _id - The reading id in ObjectId format
 * @returns {Promise<Object>} -  The promise 
 */
export async function getReadingById(_id) {

   return db.collection("WeatherData").findOne({ _id: new ObjectId(_id) });
   
}

/**
 * Insert  a single weather data reading into the database. 
 * 
 * @export
 * @async
 * @param {Object} reading - The weather data reading to be inserted
 * @returns {Promise<InsertOneResult>} A Promise that resolves with the result of the insertion operation.
 */
export async function insertReading(reading) {
    // insertOne method
    return db.collection('WeatherData').insertOne(reading)
}

/**
 * Insert multiple weather data readings into the database.
 * 
 * @param {Object[]} readings - An array of weather data readings to be inserted
 * @returns {Promise<void>} - A Promise that resolves when all the readings have been inserted.
 */
// Insert multiple readings into WeatherData collection
export async function insertMultipleReadings(readings) {
    // Use insertMany method to insert multiple documents
    return db.collection('WeatherData').insertMany(readings)
}


/**
 * Finds the maximum precipitation recorded in the last 5 months for each sensor, returning sensor name, reading date/time, and precipitation value.
 *  
 * @export  
 * @async
 * @param {String} deviceName - The name of the device for which we want to retrieve the data.
 * @returns {Promise<Object[]>} A promise that resolves to an array of objects containing the maximum precipitation details for each sensor.
 */
export async function findMaxPrecipitationLast5Months(deviceName) {
    const currentDate = new Date();
    const fiveMonthsAgo = new Date();
    fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5);

    const result = await db.collection("WeatherData").aggregate([
        {
            $match: {
                "Device Name": deviceName,
                Time: { $gte: fiveMonthsAgo, $lte: currentDate }
            }
        },
        {
            $group: {
                _id: "$Device Name",
                maxPrecipitation: {
                  $max: "$Precipitation mm/h",
                },
                readingDateTime: {
                  $last: "$Time",
                },
                documentId: {
                    $last: "$_id",
                  },
              }
        },
        {
            $project: {
                _id: "$documentId",
                deviceName: "$_id",
                readingDateTime: 1,
                maxPrecipitation: 1,
              }
        },
    ]).toArray();

    return result;
}



/**
 * Find weather data recorded by a specific station within a given date range.
 * 
 * @param {String} deviceName - The name of the device for which we want to retrieve the data.
 * @param {String} inputDateTime - The user input date string in UTC format (e.g., "2024-03-15T10:00:00Z").
 * @returns {Promise<Array>} An array of WeatherData documents recorded by the specified station within the date range.
 */
export async function getReadingsByDeviceAndDateTime(deviceName, inputDateTime) {
    const inputDate = new Date(inputDateTime)
    const startDate = new Date(inputDateTime);
    const endDate = new Date(inputDateTime);

    // Set time range from input date and time to next hour
    startDate.setUTCHours(inputDate.getUTCHours(), 0, 0, 0); 
    endDate.setUTCHours(inputDate.getUTCHours() + 1, 0, 0, 0); 

    const weatherData = await db.collection("WeatherData").find({
        "Device Name": deviceName,
        Time: {
            $gte: startDate,
            $lte: endDate
        }
    }).toArray();

    // Sorting the time from the earliest to latest minutes
    weatherData.sort((a, b) => a.Time - b.Time);

    // Extract specific fields from each weather data record
    const formattedWeatherData = weatherData.map(data => ({
        DeviceName: data["Device Name"],
        Time: data.Time,
        Temperature: data["Temperature (°C)"],
        AtmosphericPressure: data["Atmospheric Pressure (kPa)"],
        SolarRadiation: data["Solar Radiation (W/m2)"],
        Precipitation: data["Precipitation mm/h"]
    }));
 
    return formattedWeatherData;
}


/**
 * Find the maximum temperature recorded for all stations within a given date/time range.
 * 
 * @param {Date} startDate The start date of the range.
 * @param {Date} endDate The end date of the range.
 * @returns {Promise<Object[]>} An array of objects containing the sensor name, reading date/time, and temperature value.
 */
export async function findMaxTemperatureInRange(startDateQuery, endDateQuery) {
    const startDate = new Date(startDateQuery);
    // Reset start date to start of the day
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(endDateQuery);
    // Set end date to end of the day
    endDate.setHours(23, 59, 59, 999);

    return db.collection("WeatherData").aggregate([
        {
            $match: { 
                Time: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: "$Device Name",
                MaxTemperature: { $max: "$Temperature (°C)" },
                ReadingDateTime: { $first: "$Time" }
            }
        },
        {
            $project: {
                _id: 0,
                DeviceName: "$_id",
                ReadingDateTime: 1,
                MaxTemperature: 1
            }
        }
    ]).toArray();
}

/**
 * Updates the precipitation value of a specified weather data entry.
 * 
 * @param {String} _id - The ID of the weather data entry to update
 * @param {Number} precipitation - The new precipitation value
 * @returns {Promise<Object>} A promise resolving to the updated weather data entry.
 */
export async function updatePrecipitationById(_id, precipitation) {
    // Find the weather data entry by ID
    const existingEntry = await db.collection("WeatherData").findOne({ _id: new ObjectId(_id) });

    // console.log(existingEntry)
    // If the entry exists, update its precipitation value
    if (existingEntry) {
        // get the previous precipitation value
        const previousValue = existingEntry["Precipitation mm/h"]; 

        // update the precipitation value
        const updatedEntry = await db.collection("WeatherData").updateOne(
            { _id: new ObjectId(_id) },
            { $set: { "Precipitation mm/h": precipitation } },
        );
        
        // return the previous and updated precipitation value
        return {
            PreviousValue: previousValue, 
            UpdatedValue: precipitation, 
            Data: updatedEntry
        }; 
    } else {
        // Return null if the entry does not exist
        return Promise.reject("Weather Data not found");
    }
}

/**
 * Finds the last recorded date in the weather data collection.
 * This function for getMaxPrecipitationLast5Months Function in controller
 * To sorting the last data recorded
 * 
 * @export
 * @async
 * @returns {Promise<Date>} A promise that resolves to the last recorded date.
 */
export async function getLastRecordedDate(deviceName) {
    const result = await db.collection("WeatherData").aggregate([
        {
            $match: {
                "Device Name": deviceName
            }
        },
        {
            $group: {
                _id: null,
                lastRecordedDate: { $max: "$Time" }
            }
        },
        {
            $project: {
                _id: 0,
                lastRecordedDate: 1
            }
        }
    ]).toArray();
    
    if (result.length === 0) {
        return null; 
    }
    
    return result[0].lastRecordedDate;   
}

/**
 * Update multiple weather data readings in the database.
 * 
//  * @param {Object[]} readings - An array of weather data readings to be updated
//  * @returns {Promise<void>} - A Promise that resolves when all the readings have been updated.
//  */
// export async function updateMultipleReadings(readings) {
//     const updatePromises = readings.map(async (reading) => {
//         const { _id, ...updatedFields } = reading;
//         await db.collection('WeatherData').updateOne(
//             { _id: new ObjectId(_id) },
//             { $set: updatedFields }
//         );
//     });

//     await Promise.all(updatePromises);
// }

// TODO: delete weather data by id

/**
 * Delete single weather data by its ID from the database.
 * 
 * @param {String} dataId - The Id of the Weather Data 
 * @returns {Promise<DeleteResult>} - A promise that will resolve with the response from MongoDB about the deletion process
 */
export async function deleteDataById(dataId) {
    return db.collection('WeatherData').deleteOne({_id: new ObjectId(dataId)})
}


/**
 * Insert the deleted weather data in the 'log' collection 
 * 
 * @param {Object} deletedData - The weather data object which is going to be deleted
 * @returns {Promise<void>} - A promise that resolves when insertion is completed.
 */
export async function insertDeletedData(deletedData) {
    deletedData.deletedDate = new Date();
    return db.collection('log').insertOne(deletedData)
}