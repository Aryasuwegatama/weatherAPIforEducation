import { Router } from "express";
import * as weatherReadingController from "../controllers/weatherReading.js"
import controlAccess from "../middlewares/auth.js";
import { updateDataAccess } from "../middlewares/studentAccess.js";

const weatherRouter = Router()

// GET: All weather data 
/**
 * @openapi
 * /weather-reading:
 *  get:
 *    summary: Get all weather data with pagination
 *    tags:
 *      - Weather
 *    security:
 *      - ApiKey: []
 *    parameters:
 *      - in: query
 *        name: page
 *        schema:
 *          type: integer
 *          minimum: 1
 *          default: 1
 *        description: The page number for pagination.
 *      - in: query
 *        name: limit
 *        schema:
 *          type: integer
 *          minimum: 1
 *          default: 10
 *        description: The number of records per page for pagination.
 *    responses:
 *      '200':
 *        description: Successful response with paginated weather data
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  example: 200
 *                message:
 *                  type: string
 *                  example: Got list of all weather data readings
 *                totalPages:
 *                  type: integer
 *                  example: 5
 *                data:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/WeatherData'
 *      '500':
 *        description: Internal server error if retrieval fails.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  example: 500
 *                message:
 *                  type: string
 *                  example: Failed to get all weather data readings
 */
weatherRouter.get("/",updateDataAccess , weatherReadingController.getAllReadings)

// GET: All weather data by device name
/**
 * @openapi
 * /weather-reading/by-device:
 *  get:
 *    summary: Get all weather data by device name
 *    tags:
 *      - Weather
 *    security:
 *      - ApiKey: []
 *    parameters:
 *      - in: query
 *        name: deviceName
 *        schema:
 *          type: string
 *          enum: [Noosa_Sensor, Woodford_Sensor, Yandina_Sensor]
 *        required: true
 *        description: The name of the device to filter weather data by.
 *      - in: query
 *        name: page
 *        schema:
 *          type: integer
 *          minimum: 1
 *          default: 1
 *        description: The page number for pagination.
 *      - in: query
 *        name: limit
 *        schema:
 *          type: integer
 *          minimum: 1
 *          default: 10
 *        description: The number of records per page for pagination.
 *    responses:
 *      '200':
 *        description: Successful response with weather data by device name
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  example: 200
 *                message:
 *                  type: string
 *                  example: Successfully fetched weather data for deviceName.
 *                totalPages:
 *                  type: integer
 *                  example: 5
 *                data:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/WeatherData'
 *      '400':
 *        description: Bad request if deviceName is missing or invalid.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  example: 400
 *                message:
 *                  type: string
 *                  example: Device Name is required. Please provide a device name.
 *      '404':
 *        description: No weather data found for the specified device name.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  example: 404
 *                message:
 *                  type: string
 *                  example: No weather data found for the specified device name.
 *      '500':
 *        description: Internal server error if retrieval fails.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: integer
 *                  example: 500
 *                message:
 *                  type: string
 *                  example: Failed to retrieve weather data.
 */
weatherRouter.get("/by-device",updateDataAccess, weatherReadingController.getAllReadingsByDeviceName)

// POST: Insert a new reading for a weather station
/**
 * @openapi
 * /weather-reading:
 *   post:
 *     summary: Insert a new reading for a weather station
 *     tags: [Weather]
 *     security:
 *       - ApiKey: []
 *     requestBody:
 *       required: true 
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewWeatherData'
 *     responses:
 *       '200':
 *         description: A new weather data reading was added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Added a new weather data reading.
 *                 reading:
 *                   $ref: '#/components/schemas/WeatherData'
 *       '401':
 *             $ref: "#/components/responses/401_invalidAuthToken"
 *       '403':
 *             $ref: "#/components/responses/403_accessForbidden"
 *       '500':
 *         description: Failed to add the new reading to the database.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *                   example: Failed to add the new reading to the database.
 */
weatherRouter.post("/", controlAccess(['station', 'teacher']), weatherReadingController.insertReading)

// POST: Insert multiple sensor readings at once
/**
 * @openapi
 * /weather-reading/insert-readings:
 *   post:
 *     summary: Add multiple readings for a single station
 *     tags: [Weather]
 *     security:
 *       - ApiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/NewWeatherData'
 *           example:
 *             - deviceName: "Yandina_Sensor"
 *               precipitation: 0.5
 *               time: "2024-03-14T10:00:00Z"
 *               latitude: 51.5074
 *               longitude: -0.1278
 *               temperature: 15.5
 *               atmosphericPressure: 101.3
 *               maxWindSpeed: 5.2
 *               solarRadiation: 200
 *               vaporPressure: 1.8
 *               humidity: 60
 *               windDirection: 180
 *             - deviceName: "Woodford_Sensor"
 *               precipitation: 0.8
 *               time: "2024-03-14T11:00:00Z"
 *               latitude: 51.5074
 *               longitude: -0.1278
 *               temperature: 16.3
 *               atmosphericPressure: 101.5
 *               maxWindSpeed: 5.5
 *               solarRadiation: 220
 *               vaporPressure: 1.9
 *               humidity: 62
 *               windDirection: 175
 *     responses:
 *       '200':
 *         description: Added multiple weather data readings for a single station.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Added multiple weather data readings for a single station.
 *                 count:
 *                   type: integer
 *                   example: 2
 *       '401':
 *             $ref: "#/components/responses/401_invalidAuthToken"
 *       '403':
 *             $ref: "#/components/responses/403_accessForbidden"
 *       '500':
 *         description: Failed to add multiple readings to the database.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *                   example: Failed to add multiple readings to the database.
 *                 error:
 *                   type: string
 */
weatherRouter.post("/insert-readings", controlAccess(['station', 'teacher']), weatherReadingController.insertMultipleReadings)

// GET: Find the maximum precipitation recorded in the last 5 Months for a specific sensor
/**
 * @openapi
 * /weather-reading/max-precipitation:
 *   get:
 *     summary: Find the maximum precipitation recorded in the last 5 months for a specific sensor
 *     tags: [Weather]
 *     security:
 *      - ApiKey: []
 *     parameters:
 *       - in: query
 *         name: deviceName
 *         schema:
 *            type: string
 *            enum: [Noosa_Sensor, Woodford_Sensor, Yandina_Sensor, Brisbane_Sensor]
 *         required: true
 *         description: The name of the sensor/device to search for.
 *     responses:
 *       '200':
 *         description: Maximum precipitation recorded in the last 5 months for the specified sensor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Maximum precipitation recorded in the last 5 months for device "DEVICE_SENSOR"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MaxPrecipitationData'
 *       '400':
 *         description: Bad request. Device name is required.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: Device name is required.
 *       '404':
 *         description: No data recorded in the last 5 months for the specified sensor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: No data recorded in the last 5 months for device "DEVICE_SENSOR" Last recorded date "ISO DATE HERE"
 *       '500':
 *         description: Failed to retrieve maximum precipitation data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: Failed to retrieve maximum precipitation data. Internal server error.
 */
weatherRouter.get("/max-precipitation",updateDataAccess, weatherReadingController.getMaxPrecipitationLast5Months);

// GET: Find the temperature, atmospheric pressure, radiation, and precipitation recorded by a specific station at a given date and time.
/**
 * @openapi
 * /weather-reading/weather-data:
 *   get:
 *     summary: Find weather data for a specific station at a given date and time
 *     tags: [Weather]
 *     security:
 *      - ApiKey: []
 *     parameters:
 *       - in: query
 *         name: deviceName
 *         schema:
 *           type: string
 *           enum: [Noosa_Sensor, Woodford_Sensor, Yandina_Sensor]
 *         required: true
 *         description: The name of the station/device to search for.
 *       - in: query
 *         name: dateTime
 *         schema:
 *           type: string
 *           format: date-time
 *           example: 2024-03-14T10:00:00.000Z
 *         required: true
 *         description: The date and time of the weather data to retrieve in ISO format. 
 *     responses:
 *       '200':
 *         description: Weather data found for the specified station and date/time.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Weather data found for the specified station and date/time.
 *                 data:
 *                   type: array
 *                   items:
 *                      $ref: '#/components/schemas/WeatherDataForStationAtDateTime'
 *             example:
 *             - DeviceName: "Yandina_Sensor"
 *               Time: "2021-03-14T23:55:22.000Z"
 *               Temperature: 19.5
 *               AtmosphericPressure: 101
 *               SolarRadiation: 663
 *               Precipitation: 0
 *             - DeviceName: "Yandina_Sensor"
 *               Time: "2021-03-14T23:45:22.000Z"
 *               Temperature: 19
 *               AtmosphericPressure: 100.99
 *               SolarRadiation: 800
 *               Precipitation: 0
 *       '400':
 *         description: Bad request. Device name and date/time are required.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: Device name and date/time are required.
 *       '404':
 *         description: Weather data not found for the specified station and date/time.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: Weather data not found for the specified station and date/time.
 *       '500':
 *         description: Failed to retrieve weather data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: Failed to retrieve weather data. Internal server error.
 */
weatherRouter.get("/weather-data",updateDataAccess, weatherReadingController.getReadingsByDeviceAndDateTime);

// GET: Find the maximum Temp(C) recorded for all stations for a given Date / Time range (start and finish date)
/**
 * @openapi
 * /weather-reading/max-temperature:
 *   get:
 *     summary: Find the maximum temperature recorded for all stations within a given date/time range.
 *     tags: [Weather]
 *     security:
 *      - ApiKey: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *           example: "2024-03-14T00:00:00Z"
 *         description: Start date of the date/time range. 
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *           example: "2024-03-14T23:59:59Z"
 *         description: End date of the date/time range.
 *     responses:
 *       '200':
 *         description: Maximum temperatures found for the specified date/time range.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Maximum temperatures found for the specified date/time range.
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MaxTemperatureData' 
 *             example:
 *               status: 200
 *               message: Maximum temperatures found for the specified date/time range.
 *               data:
 *               - MaxTemperature: 37.17
 *                 ReadingDateTime: "2020-07-31T14:00:29.000Z"
 *                 DeviceName: "Noosa_Sensor"
 *               - MaxTemperature: 44.6
 *                 ReadingDateTime: "2020-07-31T14:00:29.000Z"
 *                 DeviceName: "Woodford_Sensor"
 *               - MaxTemperature: 40.4
 *                 ReadingDateTime: "2020-07-31T14:00:29.000Z"
 *                 DeviceName: "Yandina_Sensor"
 *       '400':
 *         description: Start date and end date are required.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: Start date and end date are required.
 *       '404':
 *         description: No data found for the specified date/time range.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: No data found for the specified date/time range.
 *       '500':
 *         description: Failed to retrieve maximum temperatures.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: Failed to retrieve maximum temperatures.
 *                 error:
 *                   type: string
 */
weatherRouter.get("/max-temperature",updateDataAccess, weatherReadingController.getMaxTemperatureInDateRange);

// PATCH: Update precipitation by id
/**
 * @openapi
 * /weather-reading/update-precipitation:
 *   patch:
 *     summary: Update precipitation value of a specified weather data entry.
 *     tags: [Weather]
 *     security:
 *       - ApiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *                 example: "65f027649250bb7f552f682c"
 *                 description: ID of the weather data entry to update.
 *               newPrecipitation:
 *                 type: number
 *                 example: 3.5
 *                 description: New precipitation value to update.
 *     responses:
 *       '200':
 *         description: Precipitation value updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Precipitation value updated successfully.
 *                 data:
 *                   $ref: '#/components/schemas/UpdatedWeatherData'
 *       '400':
 *         description: ID and new precipitation value are required. 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: ID and new precipitation value are required.
 *       '401':
 *             $ref: "#/components/responses/401_invalidAuthToken"
 *       '403':
 *             $ref: "#/components/responses/403_accessForbidden"
 *       '404':
 *         description: Weather data entry not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: Weather data entry not found.
 *       '500':
 *         description: Failed to update precipitation value.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: Failed to update precipitation value. Error details will be provided in the 'error' field.
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 */
weatherRouter.patch("/update-precipitation", controlAccess(['station', 'teacher']), weatherReadingController.updatePrecipitationById);

// DELETE: delete single weather data by id 
/**
 * @openapi
 * /weather-reading/delete:
 *   delete:
 *     summary: Delete weather data
 *     tags: [Weather]
 *     security:
 *       - ApiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               weatherDataId:
 *                 type: string
 *                 example: "65f027649250bb7f552f682c"
 *                 description: The ID of the weather data to delete.
 *     responses:
 *       '200':
 *         description: Weather data deleted and logged successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Weather data deleted and logged successfully.
 *                 deletedCount:
 *                   type: integer
 *                   example: 1
 *                   description: The number of weather data entries deleted.
 *       '400':
 *         description: Bad request. Invalid weatherDataId format. It must be a string.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: Invalid weatherDataId format. It must be a string.
 *       '401':
 *             $ref: "#/components/responses/401_invalidAuthToken"
 *       '403':
 *             $ref: "#/components/responses/403_accessForbidden"
 *       '404':
 *         description: Not found. No weather data found with the provided ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: No weather data found with the provided ID.
 *       '500':
 *         description: Internal server error. Failed to delete weather data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: Failed to delete weather data.
 */
weatherRouter.delete("/delete", controlAccess(['teacher']), weatherReadingController.deleteWeatherData);

// GET: Get single reading
/**
 * @openapi
 * /weather-reading/{id}:
 *   get:
 *     summary: Get a single weather reading by ID
 *     tags: [Weather]
 *     security:
 *       - ApiKey: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the weather reading to retrieve
 *         schema:
 *           type: string
 *           example: "605258a20729ca001e25c032"
 *     responses:
 *       '200':
 *         description: Weather Reading found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Weather Reading found for id 605258a20729ca001e25c032
 *                 data:
 *                   $ref: '#/components/schemas/WeatherData'
 *       '404':
 *         description: The requested reading does not exist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: The requested reading does not exist.
 *       '500':
 *         description: Error retrieving the Weather Reading
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: Error retrieving the Weather Reading.
 */
weatherRouter.get("/:id",updateDataAccess, weatherReadingController.getReadingById)

export default  weatherRouter;