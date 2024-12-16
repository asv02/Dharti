import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config({
    path:'../.env'
})

const connection = async ()=>
    {
        try {
            const connecetionInstance=await mongoose.connect(`${process.env.Mongo_URI}/${process.env.DB_NAME}`)
            console.log((connecetionInstance.connection.host))
        } catch (error) {
            console.log(error)
            process.exit(1)
        }
    }

export default connection;