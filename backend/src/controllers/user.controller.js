//controller means all methods of application

import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import jwt from 'jsonwebtoken'

const generateAccessAndRefreshTokens = async (userId) => {
    try {

        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.RefreshAccessToken()

        user.refreshToken = refreshToken
        //we just add refreshToken but during save database demand passwords,etc=>but we say do not validate and save what i give.
        await user.save({ validateBeforeSave: false })
        // console.log("accessToken->",accessToken)
        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, 'Something went wrong while generating refresh and access token')
    }
}


// ASYNChANDLER HAVE SOME PROBLEM
const registerUser = asyncHandler(async (req, res) => {

    //getting data from frontend
    const { username, email, fullName, password } = req.body;
    console.log(req.body)
    // console.log('Content-Type:', req.headers['content-type']);

    // Validation of recieved data.
    /* 
    if(fullname==="")
         {
             throw new ApiError(400,"fullname is required")
         }
     Now it is not good practice to use multiple if to validate all data,so.
    */

    if ([username, email, fullName, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    //Check whether user is already present

    const userExisted = await User.findOne(
        {
            $or: [{ username }, { email }]
        }
    )
    if (userExisted) {
        throw new ApiError(409, "User with same username or email already exist.")
    }

    //Check for images,avatar

    //due to injecting multer middleware we have req.files() 
    //'avatar'=> is demanded name by me in userRouter while injecting middleware.
    const avatarlocalpath = req.files?.avatar[0]?.path;
    const coverimagelocalpath = req.files?.coverImage[0].path;

    if (!avatarlocalpath) {
        throw new ApiError(400, "Avatar is required.")
    }

    //upload files on cloudinary

    const avatar = await uploadOnCloudinary(avatarlocalpath);
    const coverImage = await uploadOnCloudinary(coverimagelocalpath);

    if (!avatar) {
        throw new ApiError(400, "Avatar is required on server.")
    }
    //create user in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username
    })

    //from created user remove password and refreshToken from response.
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    //check createdUser
    if (!createdUser) {
        throw new ApiError(500, "Something happend wrong")
    }

    //return response

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registration successfully.")
    )
})

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;
    // console.log(req)
    console.log('Content-Type:', req.headers['content-type']);
    console.log(req.body)

    if (!(username || email)) {
        throw new ApiError(400, 'Username or Email is required to Login')
    }
    //If there is username or email already exist in database.
    const user = await User.findOne(
        {
            $or: [{ username }, { email }]
        })
    if (!user) {
        throw new ApiError('No user with this email or username')
    }
    // password check

    //We access methods defined in user model using 'user' whereas findOne,etc are function of MongoDB.
    const password_check = await user.isPasswordCorrect(password)

    if (!password_check) {
        throw new ApiError('Password Incorrect.')
    }
    //Now if password correct then create refresh and access token

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    //Now we want to update out 'user' variable as refreshToken is updated, so we can update object or query database.
    //We don't want password and refreshToken
    const loggeduser = await User.findById(user._id).select("-password -refreshToken")

    //send cookies
    const options = {
        httpOnly: true,//to restrict cookies to get modified at frontend side.
        secure: true//Only can be modified by server side.
    }
    const st = await res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(
            200,
            {
                user: loggeduser, accessToken, refreshToken
                //we send here along with in cookies,so that user can also use it to do it's stuff.(NOT RECOMMENDED)
            },
            "User logged In successfully"
        ))
    return st;
})

const logoutUser = asyncHandler(async (req, res) => {
    //Now to logout we need user, but here we cannot demand user._id.

    //So for this we design custom middleware to check is there a user or not.
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:
            {
                refreshToken: undefined
            }
        }
    )
    const options =
    {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User Logged out"))
})

const RefreshAccessToken = asyncHandler(async (req, res) => {
    const req_refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!req_refreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }
    // this will help to get particular user from database as we send _id with while generatingrefreshToken.

    //decoded token
    try {
        const decoded_incoming_token = jwt.verify(req_refreshToken, process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decoded_incoming_token._id)
    
        if (!user) {
            throw new ApiError(401, "Unauthorized request")
        }
    
        if(req_refreshToken !==user.refreshToken)
            {
                throw new ApiError("Refresh Token expired ot used");
            }
        
        const options=
        {
            httpsOnly:true,
            secure:true
        }
    
        const {accessToken,newrefreshToken}=await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newrefreshToken,options)
        .json(
            new ApiResponse(200,
                {accessToken,newrefreshToken},
                "Access Token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid refresh Token")
        console.log("Error in Refresh")
    }
})

export { registerUser, loginUser, logoutUser, RefreshAccessToken }