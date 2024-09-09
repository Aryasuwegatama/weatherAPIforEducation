import { MongoClient } from "mongodb"
import * as dotenv from "dotenv"

// Load environment variables from the .env file
dotenv.config()

// Get the MongoDB connection URL from the .env file,
const connectionString = process.env.MDB_URL

// Get the JWT secret key from the .env file,
const jwtSecretKey = process.env.JWT_SECRET_KEY

// Create a new MongoClient instance with the connection string
const client = new MongoClient(connectionString);

// Connect to the MongoDB server
client.connect()
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch(err => {
        console.error("Failed to connect to MongoDB:", err);
        // Exit the process if unable to connect
        process.exit(1); 
    });

export const db = client.db("weather-api-for-education");
export const jwtSecret = jwtSecretKey;