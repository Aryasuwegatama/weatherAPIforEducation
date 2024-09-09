import * as UserModel from "../models/user.js"

export default function controlAccess(allowedRoles) {
    return async function(req, res, next) {
        const userAuthToken = req.get("Auth-Key");

        console.log(userAuthToken);

        if (!userAuthToken) {
            return res.status(400).json({
                status: 400,
                message: 'Authorization token not provided.'
            });
        }

        const userData = await UserModel.getUserByAuthToken(userAuthToken);
        console.log(userData);
        if (!userData) {
            return res.status(401).json({
                status: 401,
                message: 'Invalid authorization token.'
            });
        }
        

        // Check if user role is allowed
        if (!allowedRoles.includes(userData.role)) {
            return res.status(403).json({
                status: 403,
                message: 'Access forbidden for this role.'
            });
        }

        next();
    }
}
