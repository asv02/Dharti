import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


const UserSchema = new mongoose.Schema(
    {
        watchHistory:
            [
                { type: mongoose.Schema.Types.ObjectId, ref: "video" }
            ],
        username:
        {
            type: String,
            required: true,
            unique: true,
            index: true,
            lowercase: true
        },
        email:
        {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },
        fullName:
        {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        avatar:
        {
            type: String,// 3rd party url
            required: true
        },
        coverimage:
        {
            type: String,
        },
        password:
        {
            type: String, //should be encrypted
            required: [true, "Password is required"],
            unique: true
        },
        refreshToken:
        {
            type: String//
        }
    }, { timestamps: true })

    //encrption of password
    UserSchema.pre('save',async function (next){
        if(!this.isModified("password")) return next()
        this.password=await bcrypt.hash(this.password,10)
    next()
    })

    //comparing the password
    UserSchema.methods.isPasswordCorrect=async function (password) {
        return await bcrypt.compare(password,this.password)
    }

    UserSchema.methods.generateAccessToken=function()
    {
        return jwt.sign
        (
            {
                _id:this._id,
                username:this.username,
                email:this.email,
                password:this.password
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn:process.env.ACCESS_TOKEN_EXPIRY
            }
        )
    }

    UserSchema.methods.RefreshAccessToken=function()
    {
        return jwt.sign
        (
            {
                _id:this._id,
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn:process.env.REFRESH_TOKEN_EXPIRY
            }
        )
    }
export const User = mongoose.model("User", UserSchema)
//this is exported using mongoose,which means User can help to interact with db.