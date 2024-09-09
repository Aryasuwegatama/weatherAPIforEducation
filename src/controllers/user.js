import * as UserModel from "../models/user.js"
import bcrypt from "bcryptjs"

/**
 * Controller for: GET /user
 * 
 * @param {Request} req The request Object
 * @param {Response} res The Response Object
 */
export async function getAllUsers(req, res) {
    try{
        const users = await UserModel.getAllUsers()
        // console.log(users)

        res.status(200).json({
            status: 200,
            message: "Got all user data",
            users
        })
    } catch (error) {
        res.status(500).json({
            status:500,
            message: "Error getting user data" + error,
        })
    }
    
}

/**
 * Controller for: GET /user/:id
 * 
 * @param {Request} req - The request object 
 * @param {Response} res - The response object
 */
export async function getUserById(req,res){
    
    try{
        // Get the parameter 'id' from the url
        const id = req.params.id;
        // console.log(id)
        
        if(!id){
            res.status(400).json({
                status: 400,
                message: "Please provide a valid User ID (insert in ObjectId format)"
            })
        }
        
        const userData = await UserModel.getUserById(id);
        
        // console.log(userData)

        if(userData == undefined){
            res.status(404).json({
                status: 404,
                message:"No user was found with this ID!"
            });
        } else {
            res.status(200).json({
                status: 200,
                message: "User Found",
                userData
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Database error finding user" + error,
        })
    }
}


// POST ENDPOINT
/**
 * Controller for: POST /user/create-user
 * 
 * @param {Request} req - The request object
 * @param {Response} res -  The response object
 * @returns 
 */
export async function createUser(req,res){
    try {
        const newUserData = req.body;

        // Check if the user exist
        const checkUserExists = await UserModel.getUserByEmail(newUserData.email);
        
        if(checkUserExists) {
            return res.status(409).json({
                status: 409,
                message: "The provided email address is already associated with an account."
            })
        }

        // Generate a salt to add random string to the password before hashing it
        const salt = bcrypt.genSaltSync();
        // hash the password
        const hashedPassword = bcrypt.hashSync(newUserData.password,salt);
        
    
        const userData = UserModel.User(
            null,
            newUserData.username,
            newUserData.email,
            hashedPassword,
            newUserData.role,
            false,
            new Date(),
        )

        // console.log(userData)

        const insertedUser = await UserModel.createUser(userData);
        if (!insertedUser) {
            return res.status(400).json({
              status: 400,
              message: 'Creating of new user failed!'
            })
          }
          
        res.status(200).json({
            status: 200,
            message: "New user created",
            data: insertedUser
        })
        
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Error create new user" +  error,
        })
    }
    
}

// PATCH ENDPOINT
/**
 * Controller for: PATCH /user/update-user/:id
 * 
 * @param {Request} req -  The request object 
 * @param {Response} res - The response object
 */
export async function updateUserById(req, res) {
    try {
        const id = req.params.id;
        const newUserData = req.body;
        // console.log(newUserData)
  
        // check the user data by the id 
        const existingUser = await UserModel.getUserById(id);
        if (!existingUser) {
            return res.status(404).json({
                status: 404,
                message: 'User not found.'
            });
        }

        const updateUser = await UserModel.updateUserById(id, newUserData);
        // console.log(updateUser)
        const updatedUserData = await UserModel.getUserById(id);

        res.status(200).json({
            status: 200,
            message: 'User updated successfully.',
            updateUser,
            updatedUserData,

        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 500,
            message: 'Failed to update user data. '+ error,
        });
    }
}

// TODO: update access level for at least two users in the same query, based on a date range in which the users were created
/**
 * Controller for updating user role for users within a date range.
 * 
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
export async function updateRoleInDateRange(req, res) {
    try {
        const { startDate, endDate, newRole } = req.body;

        // Validate input data
        if (!startDate || !endDate || !newRole) {
            return res.status(400).json({
                status: 400,
                message: 'Please provide valid input data.'
            });
        }

        const updatedRole = {role: newRole}

        const result = await UserModel.updateRoleInDateRange(startDate, endDate, updatedRole);

        res.status(200).json({
            status: 200,
            message: 'New Role updated successfully.',
            result,
        });
    } catch (error) {
        // console.error(error)
        res.status(500).json({
            status: 500,
            message: 'Failed to update new role.' + error,
        });
    }
}

// DELETE ENDPOINT
// TODO: delete user by id
/**
 * Controller for: DELETE /delete-user/:id
 * 
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 */
export async function deleteUserById(req, res) {
    try {
        const userId = req.params.id;

        const deletedUser = await UserModel.deleteUserById(userId);

        res.status(200).json({
            status: 200,
            message: "User account deleted",
            deletedUser
        })
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Failed to delete user account. " + error
        })
    }
}

// TODO: Delete multiple users that have the ‘Student’ role and last logged in between two given dates
/**
 * Controller for: DELETE /users/delete-students
 * Deletes multiple users with the 'Student' role and last logged in between two given dates.
 * 
 * @param {Request} req - The request object containing the start and end dates.
 * @param {Response} res - The response object.
 */
export async function deleteStudentsByLastLogin(req, res) {
    try {
        const { startDate, endDate } = req.body; 
        
        // Validate dates
        if (!startDate || !endDate) {
            return res.status(400).json({
                status: 400,
                message: "Start date and end date are required."
            });
        }

        const result = await UserModel.deleteStudentsByLastLogin(new Date(startDate), new Date(endDate));
        
        res.status(200).json({
            status: 200,
            message: `Deleted ${result.deletedCount} student(s) who last logged in between ${startDate} and ${endDate}.`
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 500,
            message: "Failed to delete students by last login date." + error,
        });
    }
}


