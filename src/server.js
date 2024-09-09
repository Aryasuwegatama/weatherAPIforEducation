import express from "express"
import cors from "cors"
import weatherRouter from "./routes/weatherReading.js"
import userRouter from "./routes/user.js"
import authRouter from "./routes/auth.js"
import docs from "./middlewares/docs.js"


// create the express application and the establish the local port
const port = 3000
const app =  express()

// Enable cross-origin resources sharing (CORS)
app.use(
    cors({
        // Allow all origins
        origin: true, 
    })
)

// middleware for parsing json data in request body
app.use(express.json())

// set up routes  
app.use(docs)
app.use("/auth", authRouter)
app.use("/user", userRouter)
app.use("/weather-reading", weatherRouter)

app.use((err, req, res, next) => {   // Error handling middleware
    res.status(err.status || 500) // Set status code
    .json({                      // Send JSON response
        status: err.status,     // Include status
        message: err.message,   // Include message
        errors: err.errors,     // Include errors
    })
 }
)
app.listen( port, ()=> {
    console.log(`Server is running on http://localhost:${port}`);
    console.log(`Documentation is running on http://localhost:${port}/docs`);
})


