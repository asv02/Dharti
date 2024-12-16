import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET
});

//UPLOAD FILE

const uploadOnCloudinary=async(localfilepath)=>
    {
       try
       {
        const response=await cloudinary.uploader.upload(localfilepath, {
            resource_type:"auto"
            })
        console.log("file upload at public url:",response.url);
        //UNLINKING NOT WORKING 
        // fs.unlinkSync(localfilepath)
        return response;
       }
       catch(error)
       {
        //if we are trying uploading files on cloudinary means,file is on local server,but this catch will run if there is any error in uploading on cloudinary,means we should remove all corrupted file from server
        fs.unlinkSync(localfilepath)
        return null;
       }
    }

export {uploadOnCloudinary}