import connection from "./db/index.js";
import {app} from './app.js'

const port=8080
//index mainly for connection and listening
connection();
app.listen(port,()=>
    {
        console.log(`Listening on ${port}`)
    })