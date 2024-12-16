import {Router} from 'express'
import { registerUser, loginUser,logoutUser,RefreshAccessToken } from '../controllers/user.controller.js'
import { verifyJwt } from '../controllers/auth.middleware.js'
import {upload} from '../middlewares/multer.middleware.js'

const router=Router()

router.route("/register").post(
   //middleware injection
   //upload is imported from multer and have inbuilt array,single,fields
   //fields allow to store multiple files of any type.
    upload.fields([
        {name:"avatar",
         maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }]
    )
    ,registerUser//this function gets executed on '/register'
)

router.route("/login").post(loginUser)
// run middleware 'verifyjwt' before running 'logoutUser'.
router.route("/logout").post(verifyJwt,logoutUser)
//to login after a day.
router.route("/refresh-token").post(RefreshAccessToken)

export default router