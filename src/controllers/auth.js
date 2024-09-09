import bcrypt from "bcryptjs"
import {v4 as uuid4} from "uuid"
import * as UserModel from "../models/user.js"

/**
 * Controller for: POST /auth/login
 * 
 * 
 * @param {Request} req - The request object 
 * @param {Response} res - The response object 
 * @returns 
 */
export async function loginUser(req, res) {
    try {
        let loginData = req.body;

        const checkEmail = await UserModel.getUserByEmail(loginData.email);
        // console.log(checkEmail)

        if(!checkEmail){
            return res.status(404).json({
                status: 404,
                message: 'User not found with this email'
            });
        }
        
        const isValidPassword = await bcrypt.compare(loginData.password, checkEmail.password);
        if (!isValidPassword) {
            return res.status(401).json({
                status: 401,
                message: 'Invalid password' 
            });
        }  

        //Create token 
        const userToken = uuid4();

        // Insert the generated token to user data and update the login date
        await UserModel.updateUserById(checkEmail._id, {authToken: userToken, lastLogin: new Date() });

        // Get the user data back
        const userWithToken =  await UserModel.getUserById(checkEmail._id);
        // console.log(userWithToken)
        
        res.status(200).json({
          status:200,
          message: "Logged in successfully",
          authToken: userWithToken.authToken
        })

    } catch (error) {
        // console.error("Error in loginUser", error);
        res.status(500).json({ 
            status: 500,
            message: `Error in Login User: ${error}` 
        });
    }
}


/**
 * Controller for: POST auth/logout
 * 
 * 
 * @param {Request} req - The request object 
 * @param {Response} res - The response object
 * @returns 
 */
export async function logoutUser(req, res) {
    try {
        const authToken = req.body.authToken;
        if (!authToken) {
            return res.status(400).json({
                status: 400,
                message: 'Authentication token is required for logout.'
            });
        }

        // Find the user by authentication token
        const user = await UserModel.getUserByAuthToken(authToken);
        if (!user) {
            return res.status(404).json({
                status: 404,
                message: 'User not found. Invalid authentication token.'
            });
        }

        // Update the user's authentication token to null for logout
        const updatedUser = await UserModel.updateUserById(user._id, { authToken: false });

        res.status(200).json({
            status: 200,
            message: 'User logged out successfully.',
            updatedUser
        });
    } catch (error) {
        // console.error(error);
        res.status(500).json({
            status: 500,
            message: 'Failed to logout user. ' + error
        });
    }
}

/**
 * Controller for: POST /auth/register
 * 
 * @param {Request} req - The request object 
 * @param {Response} res - The response object 
 * @returns 
 */
export async function registerUser(req, res) {
    try {
        let registrationData = req.body;

        // Check if the email already exists
        const existingUser = await UserModel.getUserByEmail(registrationData.email);
        if(existingUser){
            return res.status(409).json({
                status: 409,
                message: 'Email already exists'
            });
        }

        // Hash the password
        const salt = bcrypt.genSaltSync();
        const hashedPassword = bcrypt.hashSync(registrationData.password,salt);

        // Create the user object
        const newUser = UserModel.User(
            null,
            registrationData.username,
            registrationData.email,
            hashedPassword,
            "student", 
            null, 
            new Date() 
        );

        // Insert the new user into the database
        await UserModel.createUser(newUser);

        res.status(200).json({
          status:200,
          message: "User registered successfully",
          data: newUser
        });

    } catch (error) {
        console.error("Error in registerUser", error);

        res.status(500).json({ 
            status: 500,
            message: "Failed to register user. " + error 
        });
    }
}
