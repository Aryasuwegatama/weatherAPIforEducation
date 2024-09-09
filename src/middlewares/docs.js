import { Router } from "express";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import * as OpenApiValidator from "express-openapi-validator";

const docs = Router()

const options = {
    failOnErrors: true,
    definition: {
        openapi: '3.0.0',
        info: {
            version: "1.0.0",
            title: "Weather API for Education",
            description:  "API to get weather information for education purposes",
        },
        components: {
            securitySchemes: {
                ApiKey: {
                    type: "apiKey",
                    in: "header",
                    name: "Auth-Key",
                },
            }
        }

    },

    apis: ["./src/routes/*.{js,yaml}", "./src/controllers/*/*.js", "./src/components.yaml"]
}

const specification = swaggerJSDoc(options)

docs.get("/test", (req, res) =>{
    res.json(specification)
})

docs.use("/docs", swaggerUi.serve, swaggerUi.setup(specification))
docs.use(
    OpenApiValidator.middleware({
        // apiSpec: "/docs",
        apiSpec: specification,
        validateRequests: true,
        validateResponses: true,
    })
)

/**
 * @openapi
 * /docs:
 *      get:
 *          summary: "View automatically generated API documentation"
 *          responses:
 *              "200":
 *                description: "Swagger documentation page"  
 */

docs.get("/docs", swaggerUi.setup(specification))

export default docs