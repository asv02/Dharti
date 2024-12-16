import multer from 'multer'

const storage=multer.diskStorage(
    {
        destination:function(req,file,cb)
        {
            cb(null,"C:/Users/Dell/Desktop/Video-Player/backend/public/temp")
            // console.log("Multer activated")
        },
        filename:function(req,file,cb)
        {
            cb(null,file.originalname) // not preferred to use original_name
        }
    })

    export const upload=multer(
        {
            storage:storage
        })

