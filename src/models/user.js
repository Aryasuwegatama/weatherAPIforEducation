import { ObjectId } from "mongodb";
import { db } from "../database.js";


/**
 * User object model constructor
 * 
 * @param {String | ObjectId | null} _id - The Id of the user (or null for new users)
 * @param {String} username - The username of the user
 * @param {String} email - The email address of the user
 * @param {String} password - The password of the user
 * @param {String} role - The role of the user (e.g, admin, teacher, student)
 * @param {Date} lastLogin - The date of the user's last login
 * @param {Date} createdAt - The date when the user account was created
 * @returns {Object} A user object with the specified properties
 */
export function User(
    _id,
    username,
    email,
    password,
    role,
    lastLogin,
    createdAt
){
    return {
        _id,
        username,
        email,
        password,
        role,
        lastLogin,
        createdAt   
    }
}





// GET ENDPOINT
/**
 * Get all user data
 * 
 * @export
 * @async
 * @returns {Promise<Object>} - A Promise for the matching user 
 */
export async function getAllUsers() {
    return db.collection("users").find().toArray();
}

/**
 * Get sing user data by id 
 * 
 * @export
 * @async
 * @param {ObjectId} id - The ObjectId for the desired user
 * @returns {Promise<Object>} - A Promise for the matching user
 */
export  async function getUserById(id) {
    return db.collection("users").findOne({_id: new ObjectId(id)});
}


/**
 * 
 * @param {String} authToken - The authentication token  
 * @returns {Promise<Object>}  - Returns a promise with the user's info if it is valid or null otherwise
 */
export async function getUserByAuthToken(authToken) {
    return db.collection("users").findOne({"authToken": authToken});
}

/**
 * 
 * @param {String} email -  User's email address
 * @returns {Promise<Object>} - Returns a promise that resolves to an object containing the matched user by email.
 */
export async function getUserByEmail(email){
    let users = await db.collection('users').findOne({email : email});

       return users;
}


// POST ENDPOINT
/**
 * Create new user data 
 * 
 * 
 * @export
 * @async
 * @param {object} user -  The new user object to be inserted
 * @returns {Promise<InsertOneResult>} - Returns a promise result of the insert operation 
 */ 
export async function createUser(user) {
    return db.collection('users').insertOne(user);
}

// PATCH ENDPOINT
/**
 * Update user data by id 
 * 
 * @param {String} userId - The Id of the user to update 
 * @param {Object} updatedData - Object that contain the new value for updating fields in the user document
 * @returns {Promise<Object>} - Promise resolving to the updated user data object
 */
export async function updateUserById(userId, updatedData) {
    // const deleteId = {...updatedData};
    // delete deleteId._id

    const updatedUser = await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        { $set: updatedData },
        { upsert: true }
    );
    return updatedUser;
}

// TODO: update access level for at least two users in the same query, based on a date range in which the users were created
/**
 * Update new role for users created within a date range.
 * 
 * @param {Date} startDate - The start date of the date range.
 * @param {Date} endDate - The end date of the date range.
 * @param {Object} updatedData - Object containing the updated access level information.
 * @returns {Promise<Object>} - A promise resolving to the result of the update operation.
 */
export async function updateRoleInDateRange(startDate, endDate, newRole) {
    const gteQuery = new Date(startDate)
    const lteQuery = new Date(endDate)
    // exclude the roles to be updated to a new role
    const excludedRole = ['station', 'admin']

    const result = await db.collection('users').updateMany(
        { 
            createdAt: { $gte: gteQuery, $lte: lteQuery },
            role: { $nin: excludedRole }
        },
        { 
            $set: newRole,
        }
    );
    return result;
}



// DELETE ENDPOINT
// TODO: delete user by id
/**
 * Delete user by id
 * 
 * @param {String} id - The Id of the user to be deleted
 * @returns {Promise<DeleteResult>} - A promise that will resolve with the response from MongoDB about the deletion process
 */
export async function deleteUserById(id) {
    return db.collection("users").deleteOne({_id: new ObjectId(id)})
}

// TODO: Delete multiple users that have the ‘Student’ role and last logged in between two given dates
/**
 * Delete multiple users with the 'Student' role and last logged in between two given dates.
 * 
 * @param {Date} startDate - The start date of the range for last login.
 * @param {Date} endDate - The end date of the range for last login.
 * @returns {Promise<DeleteResult>} A promise that resolves with the result of the deletion operation.
 */
export async function deleteStudentsByLastLogin(startDate, endDate) {
    return db.collection("users").deleteMany({
        role: "student",
        lastLogin: { $gte: new Date(startDate), $lte: new Date(endDate) }
    });
}
