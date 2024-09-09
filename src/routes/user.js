import { Router } from "express";
import controlAccess from "../middlewares/auth.js";
import * as UserController from "../controllers/user.js";

const userRouter = Router();

// GET ENDPOINT
// GET: All users data
/**
 * @openapi
 * /user:
 *   get:
 *     summary: Get all user data
 *     tags: [User]
 *     security:
 *       - ApiKey: []
 *     responses:
 *       '200':
 *         description: Got all user data
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
 *                   example: Got all user data
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserData'
 *       '500':
 *         description: Error getting user data
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
 *                   example: Error getting user data
 */
userRouter.get("/", controlAccess(["teacher"]), UserController.getAllUsers);

// GET: retrieve user data by id 
/**
* @openapi
* /user/{id}:
*   get:
*     summary: Retrieve user data by ID
*     tags: [User]
*     security:
*       - ApiKey: []
*     parameters:
*       - in: path
*         name: id
*         required: true
*         schema:
*           type: string
*           format: ObjectId
*         description: The ID of the user to retrieve (in ObjectId format).
*     responses:
*       '200':
*         description: User data found
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
*                   example: User Found
*                 userData:
*                   $ref: '#/components/schemas/UserData'
*       '400':
*         description: Invalid User ID format
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
*                   example: Please provide a valid User ID (Insert In ObjectId format)
*       '404':
*         description: User not found
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
*                   example: No user was found with this ID!
*       '500':
*         description: Database error
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
*                   example: Database error finding user
*/
userRouter.get("/:id", controlAccess(["teacher"]), UserController.getUserById);

// POST ENDPOINT
// POST: insert new user 
/**
* @openapi
* /user/create-user:
*   post:
*     summary: Insert new user
*     tags: [User]
*     security:
*       - ApiKey: []
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/NewUserData'
*     responses:
*       '200':
*         description: New user created
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
*                   example: New user created
*                 data:
*                   $ref: '#/components/schemas/UserData'
*       '400':
*         description: Creating a new user failed
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
*                   example: Creating of new user failed!
*       '401':
*             $ref: "#/components/responses/401_invalidAuthToken"
*       '403':
*             $ref: "#/components/responses/403_accessForbidden"
*       '409':
*         description: Email already associated with an account
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 status:
*                   type: integer
*                   example: 409
*                 message:
*                   type: string
*                   example: The provided email address is already associated with an account.
*       '500':
*         description: Error creating new user
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
*                   example: Error creating new user
*/
userRouter.post("/create-user", controlAccess(["teacher"]), UserController.createUser)

// PATCH: update user
/**
* @openapi
* /user/update-user/{id}:
*   patch:
*     summary: Update user data
*     tags: [User]
*     security:
*       - ApiKey: []
*     parameters:
*       - in: path
*         name: id
*         required: true
*         schema:
*           type: string
*           format: ObjectId
*         description: The ID of the user to update (ObjectId format)
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/UpdateUserData'
*     responses:
*       '200':
*         description: User updated successfully
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
*                   example: User updated successfully.
*                 updatedUser:
*                   $ref: '#/components/schemas/UpdatedUser'
*                 updatedUserData:
*                   $ref: '#/components/schemas/UserData'
*       '401':
*             $ref: "#/components/responses/401_invalidAuthToken"
*       '403':
*             $ref: "#/components/responses/403_accessForbidden"
*       '404':
*         description: User not found
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
*                   example: User not found.
*       '500':
*         description: Failed to update user data
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
*                   example: Failed to update user data.
*/
userRouter.patch("/update-user/:id", controlAccess(["teacher"]), UserController.updateUserById)

/**
 * @openapi
 * paths:
 *   /user/update-role:
 *     patch:
 *       summary: Update user roles within a specified date range.
 *       tags: [User]
 *       security:
 *         - ApiKey: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 startDate:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-04-01T00:00:00Z"
 *                   description: Start date of the date/time range.
 *                 endDate:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-04-30T00:00:00Z"
 *                   description: End date of the date/time range.
 *                 newRole:
 *                   type: string
 *                   example: "student"
 *                   description: The new role to assign to users in the specified date range.
 *       responses:
 *         '200':
 *           description: User roles updated successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: integer
 *                     example: 200
 *                   message:
 *                     type: string
 *                     example: User roles updated successfully.
 *         '401':
 *             $ref: "#/components/responses/401_invalidAuthToken"
 *         '403':
 *             $ref: "#/components/responses/403_accessForbidden"
 *         '500':
 *           description: Failed to update new role
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: integer
 *                     example: 500
 *                   message:
 *                     type: string
 *                     example: Failed to update new role
 */
userRouter.patch("/update-role", controlAccess(["teacher"]), UserController.updateRoleInDateRange)

// DELETE: delete user account
/**
* @openapi
* /user/delete-user/{id}:
*   delete:
*     summary: Delete user account
*     tags: [User]
*     security:
*       - ApiKey: []
*     parameters:
*       - in: path
*         name: id
*         required: true
*         schema:
*           type: string
*           format: ObjectId
*           description: The ID of the user to delete (ObjectId format)
*     responses:
*       '200':
*         description: User account deleted successfully
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
*                   example: User account deleted
*                 deletedUser:
*                   example:
*                     acknowledged: true
*                     deletedCount: 1
*       '401':
*             $ref: "#/components/responses/401_invalidAuthToken"
*       '403':
*             $ref: "#/components/responses/403_accessForbidden"
*       '500':
*         description: Failed to delete user account
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
*                   example: Failed to delete user account.
 */
userRouter.delete("/delete-user/:id", controlAccess(["teacher"]), UserController.deleteUserById)

/**
 * @openapi
 * /user/delete-students:
 *   delete:
 *     summary: Delete multiple users with the role 'Student' and last logged in between two given dates.
 *     tags: [User]
 *     security:
 *       - ApiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-03-10T00:00:00.000Z"
 *                 description: The start date for filtering users.
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-04-18T00:00:00.000Z"
 *                 description: The end date for filtering users.
 *     responses:
 *       '200':
 *         description: Successfully deleted users with the 'Student' role and last logged in between the specified dates.
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
 *                   example: Deleted 5 student(s) who last logged in between 2024-03-10T00:00:00.000Z and 2024-04-18T00:00:00.000Z.
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
 *       '401':
 *             $ref: "#/components/responses/401_invalidAuthToken"
 *       '403':
 *             $ref: "#/components/responses/403_accessForbidden"
 *       '500':
 *         description: Failed to delete students by last login date.
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
 *                   example: Failed to delete students by last login date.
 */
userRouter.delete("/delete-students", controlAccess(['teacher']), UserController.deleteStudentsByLastLogin)

export default userRouter;