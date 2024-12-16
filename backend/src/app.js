import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app=express();

app.use(express.json({limit:"16kb"})) //for accepting json 
app.use(cors()) // for connecting frotend and backend
app.use(express.urlencoded({extended:true,limit:"16kb"}))//for accepting data from urls
app.use(express.static("public"))// for uploading pdfs,images,etc.
app.use(cookieParser())//for doing crud operation on cookies

//routes
import userRouter from './routes/user.router.js';

//routes declaration
//earlier app.get()=>but not now as we are importing routes, so by now we will use middlewares for routes.

//this allows us to use different methods at single type of URL=> 'https:localhost:8080/api/v1/users/_____'


app.use("/api/v1/users",userRouter)//as user type 'https://localhost:8080/api/v1/users/register' in URL then control goes to userRouter and the particular method (/register)  in userRouter get called.

export {app}
