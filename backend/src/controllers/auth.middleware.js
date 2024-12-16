import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

//used in logout functionality
export const verifyJwt = asyncHandler(async (req, res, next) => {
    try {
        //req has cookies as we are using cookie-parser
        //in web=>we can have accessToken in cookies but for app we will have token in Authorization header(See JWT documentation)
        
        try {
        // ###############PROBLEM HERE###########
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        console.log("accessToken->", token);
            if (!token) {
                throw new ApiError(401, "Unauthorized request")
            }
        }
        catch
        {
             console.log("Token fetching problem")
        }

        //decode token to get info.
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        if (!user) {
            throw new ApiError(401, "Invalid Access Token")
        }
        req.user = user;//Now we store user in req=> this will help us in Logout functionality.
        next();
    } catch (error) {
        console.log(error)
        throw new ApiError(401, "Error in logout.")
    }
})