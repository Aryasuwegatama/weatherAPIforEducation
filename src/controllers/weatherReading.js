import * as Readings  from "../models/weatherReading.js";

/**
 * Controller for: GET /weather-reading
 * 
 * @param {Request} req The Request Object
 * @param {Response} res The Response Object
 */
export async function getAllReadings(req, res) {

    try {
        let { page, limit} = req.query;
        let pageNumber = parseInt(page) || 1;
        let limitNumber = parseInt(limit) || 10;

        const readings = await Readings.getAllReadings()
        // count how many reading
        const countDbReadings = await readings.count();

         // Calculate skip value for pagination
         let skip = (pageNumber - 1) * limitNumber;
        
         const weatherData = await readings.skip(skip).limit(limitNumber).toArray();
         
         // Calculate total pages
         const totalPages = Math.ceil(countDbReadings / limitNumber)

        res.status(200).json({
            status:200,
            message: "Got list of all weather data readings",
            totalPages,
            weatherData,
        })  
        

    
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 500,
            message:"Failed to get all weather data readings" + error,
        })
    }

};

/**
 * Controller for: GET /weather-reading?deviceName
 * 
 * @param {Request} req - The Request object 
 * @param {Response} res - The Response object
 * @returns 
 */
export async function getAllReadingsByDeviceName(req, res) {
    try {
        const {deviceName, page, limit} = req.query;
        const pageNumber = parseInt(page) || 1;
        const limitNumber = parseInt(limit) || 10;

        // Check is query is entered
        if (!deviceName) {
            return res.status(400).json({
                status: 400,
                message: "Device Name is required. Please provide a device name."
            })
        }


        const readings = await Readings.getAllReadingsByDeviceName(deviceName);
        // count how many reading
        const countDbReadings = await readings.count();


        // Calculate skip value for pagination
        const skip = (pageNumber - 1) * limitNumber;
        
        const weatherData = await readings.skip(skip).limit(limitNumber).toArray();
        
        // Calculate total pages
        const totalPages = Math.ceil(countDbReadings / limitNumber);
    


        // Check if data not found
        if (weatherData.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "No weather data found for the specified device name."
            })
        }
        
        // console.log(weatherData)
                 
        res.status(200).json({
            status: 200,
            message: `Successfully fetched weather data for ${deviceName}.`,
            totalPages: totalPages,
            // currentPage: pageNumber,
            // pageSize: limitNumber,
            // navigation: navigation,
            data: weatherData
        })

    } catch (error) {
        // console.log(error)
        res.status(500).json({
            status: 500,
            message:"Failed to retrieve weather data." + error,
        })
    }
}

/**
 * Controller for: GET /weather-reading
 * 
 * 
 * @param {Request} req - The request object
 * @param {Response} res - The response object 
 */
export async function getReadingById(req, res) {
    try{
        const readingId = req.params.id;
        console.log(readingId)
        const reading = await Readings.getReadingById(readingId);
        if(!reading){
            return res.status(404).json({
                status: 404,
                message: 'The requested reading does not exist.'
            });
        };
        res.status(200).json({
            status: 200,
            message: "Weather Reading found for id:" + readingId,
            data: reading
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 500,
            message: "Error retrieving the Weather Reading. " + error,
            error: error.message
         })
    }
}

/**
 * Controller for: POST /weather-reading     
 * Adds a new reading to the database
 *  
 * @param {Request} req The Request Object
 * @param {Response} res The Response Object
 */
export async function insertReading(req, res) {
    const  newReading = req.body;

    const reading = Readings.WeatherReading(
        newReading._id,
        newReading.deviceName,
        newReading.precipitation,
        newReading.time,
        newReading.latitude,
        newReading.longitude,
        newReading.temperature,
        newReading.atmosphericPressure,
        newReading.maxWindSpeed,
        newReading.solarRadiation,
        newReading.vaporPressure,
        newReading.humidity,
        newReading.windDirection,
    )

    Readings.insertReading(reading)
        .then(reading => {
            res.status(200).json({
                status: 200,
                message: "Added a new weather data reading.",
                reading,
            })
        })
        .catch(error => {
            console.log(error);
            res.status(500).json({
                status: 500,
                message: 'Failed to add the new reading to the database.' + error,
            });
        })
}

/**
 * Controller for: POST /weather-reading/insert-readings
 * Adds multiple readings to the database for a single station.
 * 
 * @param {Request} req The Request Object containing the array of readings.
 * @param {Response} res The Response Object
 */
export async function insertMultipleReadings(req, res){
    const newReadings = req.body.map(reading => {
        return Readings.WeatherReading(
            reading._id,
            reading.deviceName,
            reading.precipitation,
            reading.time,
            reading.latitude,
            reading.longitude,
            reading.temperature,
            reading.atmosphericPressure,
            reading.maxWindSpeed,
            reading.solarRadiation,
            reading.vaporPressure,
            reading.humidity,
            reading.windDirection,
        )
    })

    try {
        const readings = await Readings.insertMultipleReadings(newReadings);
        res.status(200).json({
            status: 200,
            message: "Added multiple weather data readings for a single station.",
            count: newReadings.length,
            readings
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 500,
            message: "Failed to add multiple readings to the database. "+ error,
        });
    }
}


/**
 * Controller for: GET /weather-reading/max-precipitation?deviceName
 * finding the maximum precipitation recorded in the last 5 months for each sensor.
 * 
 * @param {Request} req The Request Object
 * @param {Response} res The Response Object
 */
export async function getMaxPrecipitationLast5Months(req, res) {
    try {
        const deviceName = req.query.deviceName;
        // console.log({deviceName})
        if (!deviceName) {
            return res.status(400).json({
                status: 400,
                message: "Device name is required."
            });
        }

        const maxPrecipitationData = await Readings.findMaxPrecipitationLast5Months(deviceName);

        // console.log(maxPrecipitationData)

        // Check if there is data recorded in last 5 moths, and send the last data recorded
        if (maxPrecipitationData.length === 0) {
            // No data recorded in the last 5 months
            const lastRecordedDate = await Readings.getLastRecordedDate(deviceName);
            return res.status(404).json({
                status: 404,
                message: `No data recorded in the last 5 months for device: ${deviceName}. Last recorded date: ${lastRecordedDate || "Unknown"}`
            });
        }

        res.status(200).json({
            status: 200,
            message: "Maximum precipitation recorded in the last 5 months for device: " + deviceName,
            data: maxPrecipitationData
        });
    } catch (error) {
        // console.error(error);
        res.status(500).json({
            status: 500,
            message: "Failed to retrieve maximum precipitation data. " + error,
        });
    }
}

/**
 * Controller for: GET /weather-reading/weather-data?deviceName="Device Name"&dateTime="Date and Time"
 * finding weather data recorded by a specific device name at a given date and time. 
 * 
 * @param {Request} req The Request Object
 * @param {Response} res The Response Object
 */
export async function getReadingsByDeviceAndDateTime(req, res) {
    try {
        const { deviceName, dateTime, page, limit } = req.query;
        const pageNumber = parseInt(page) || 1;
        const limitNumber = parseInt(limit) || 10;


// TODO: check the user input time for query (filter on time too)

        if (!deviceName || !dateTime) {
            return res.status(400).json({
                status: 400,
                message: "Device name and date/time are required."
            });
        }
        
        const weatherData = await Readings.getReadingsByDeviceAndDateTime(deviceName, dateTime);
        const totalPages = Math.round(weatherData.length / limitNumber); 
        
        if (!weatherData || weatherData.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "Weather data could not be found. Data may not recorded at that station or date/time."
            });
        }

        // TODO: if the weather data found and the data more than 10 reading, apply pagination
        // calculate the start and end index to paginate the result
        const startIndex = (pageNumber - 1) * limitNumber;
        const  endIndex = (pageNumber * limitNumber);
  
        const paginateData = weatherData.slice(startIndex, endIndex);
        // console.log(paginateData)

        res.status(200).json({
            status: 200,
            message: `Weather data found for the specified station '${deviceName}' at ${dateTime}.`,
            totalPages,
            data: paginateData
        });
    } catch (error) {
        // console.error(error);
        res.status(500).json({
            status: 500,
            message: "Failed to retrieve weather data. "+ error,
        });
    }
}

/**
 * Controller for: GET /weather-reading/max-temperature
 * finding the maximum temperature recorded for all stations within a given date/time range.
 * 
 * @param {Request} req The Request object.
 * @param {Response} res The Response object.
 */
export async function getMaxTemperatureInDateRange(req, res) {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({
                status: 400,
                message: "Start date and end date are required."
            });
        }

        const maxTemperatures = await Readings.findMaxTemperatureInRange(startDate, endDate);
        if (maxTemperatures.length === 0) { 
            return res.status(404).json({
                status: 404,
                message: "No data found for the specified date/time range."
            });
        }

        res.status(200).json({
            status: 200,
            message: "Maximum temperatures found for the specified date/time range.",
            data: maxTemperatures
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 500,
            message: "Failed to retrieve maximum temperatures. " + error,
        });
    }
}

/**
 * Controller for: PATCH  /weather-reading/update-precipitation
 * updating the precipitation value of a specified weather data entry.
 * 
 * @param {Request} req The Request object
 * @param {Response} res The Response object
 */
export async function updatePrecipitationById(req, res) {
    try {
        const { _id, newPrecipitation } = req.body;

        if (!_id || !newPrecipitation) {
            return res.status(400).json({
                status: 400,
                message: "ID and new precipitation value are required."
            });
        }

        const updatedReading = await Readings.updatePrecipitationById(_id, newPrecipitation);
        if (!updatedReading) {
            return res.status(404).json({
                status: 404,
                message: "Weather data entry not found."
            });
        }

        res.status(200).json({
            status: 200,
            message: "Precipitation value updated successfully.",
            data: updatedReading
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 500,
            message: "Failed to update precipitation value. " + error,
        });
    }
}

/**
 * Controller for deleting weather data.
 * 
 * @param {Request} req - The request object containing criteria for deletion.
 * @param {Response} res - The response object.
 */
export async function deleteWeatherData(req, res) {
    try {
        const {weatherDataId} = req.body;
        // console.log(weatherDataId)

        if(!weatherDataId || weatherDataId === "") {
            return res.status(400).json({
                status: 400,
                message: "Invalid weatherDataId format."
            })
        }

        // Get the weather data to be deleted
        const weatherData = await Readings.getReadingById(weatherDataId);

        // console.log(weatherData)
        if(!weatherData) {
            return res.status(404).json({
                status: 404,
                message: `No weather data found with id ${weatherDataId}`
            })
        }

        // Insert the deleted data into the 'log' collection
        // await Readings.insertDeletedData(weatherData);

        // Delete the weather data
        const result = await Readings.deleteDataById(weatherDataId);
        // console.log(result)

        res.status(200).json({
            status: 200,
            message: "Weather data deleted and logged successfully.",
            deletedCount: result.deletedCount
        });
    } catch (error) {
        // console.error("Error deleting weather data:", error);
        res.status(500).json({
            status: 500,
            message: "Failed to delete weather data." + error,
        });
    }
}

/**
 * Controller for: PATCH /weather-reading/update-readings
 * 
//  * @param {Request} req - The request object 
//  * @param {Response} res - The response object
//  */
// export async function updateMultipleReadings(req, res) {
//     try {
//         const readings = req.body;
//         const updatedReadings = await Readings.updateMultipleReadings(readings);

//         console.log(updatedReadings)

//         res.status(200).json({
//             status: 200,
//             message: "Multiple readings updated successfully.",
//             data: updatedReadings
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             status: 500,
//             message: "Failed to update multiple readings." + error
//         });
//     }
// }


