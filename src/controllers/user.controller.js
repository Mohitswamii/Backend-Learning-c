import { asyncHandler   }   from "../utils/asyncHandler.js";

import {ApiError} from ".../utils/ApiError.js"

import {User} from "../models/user.model.js"


import{uploadOnCloudinary} from "../utils/cloudinary.js"

import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser =  asyncHandler(async(req,res) => {
   // get user detail from frontend 
   // validation - not empty
   //  check if user already exists : username,email
   // check for images , check for avatar
   // upload them to cloudinary , avatar 
   // create user object  - crate entry in db
   // remove passward and refresh token feild from respone 
   // check for user creation 
   // return respone 


   // get user detail
   
   const {fullName,email,username,password} =req.body
   console.log("email : ",email);


//    if(fullName===""){
//     throw new ApiError(400, "fullname is required")
//    }

if (
    [fullName,email,username,password].some((field)=>
    field?.trim()=="")
) {
    throw new ApiError(400,"All fields are required")
}


// Already exist or not 

const existedUser= User.findOne({
    $or:[{username}, {email}]
})

if(existedUser){
    throw new ApiError(409, "User with email or username already exists")
}


// handling images 

const avatarLocalPath = req.files?.avatar[0]?.path;
const coverImageLocalPath = req.files?.coverImage[0]?.path;

if(!avatarLocalPath){
    throw new ApiError(400,"Avatar file is required")
}


// upload to cloudinary 

const avatar = await uploadOnCloudinary(avatarLocalPath)
const coverImage = await uploadOnCloudinary(coverImageLocalPath)


if(!avatar){
    throw new ApiError(400,"Avatar file is required")

}


// create object and entery in database 

const user = await User.create({
    fullName,
    avatar:avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username:username.toLowerCase()

})

// check user created or not 

const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
)

if(!createdUser){
    throw new ApiError(500,"Something went Wrong while regresteing the user")
}



// sending respone 


return res.status(201).json(
    new ApiResponse(200,createdUser,"user regristed succesfully")
)









})


export{registerUser}