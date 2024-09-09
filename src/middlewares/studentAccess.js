import * as UserModel from "../models/user.js"

export async function updateDataAccess(req, res, next) {
 
        const checkUser = req.get("Auth-Key");
        // console.log(checkUser)
        if (!checkUser) {
            return next();
        } else {
            const userData = await UserModel.getUserByAuthToken(checkUser);
            if (userData && userData.role === "student") {
                const updatedUserData = await UserModel.updateUserById(userData._id, { lastAccess: new Date() });
    
                if (!updatedUserData) {
                    console.error('Failed to update last access timestamp.');
                    next();
                }
            }
        }
        next();
} 