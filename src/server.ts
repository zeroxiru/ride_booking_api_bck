/* eslint-disable no-console */

import {Server} from "http";
import mongoose from "mongoose";
import app from "./app";
import { envVars } from "./app/config/env";

let server: Server;



const startServer = async() =>{ 
   try {
    console.log(envVars.NODE_ENV);
     await mongoose.connect(envVars.DB_URL)
     console.log("Connected to DB");
     server = app.listen(envVars.PORT, () => { 
    console.log(`PH Tour Management System is running on ${envVars.PORT}`);
   })
   } catch (error) {
    console.log(error);
   }
}

startServer();

/***
 * unhandled rejection error
 * uncaught rejection error
 * signal terminatio sigterm
*/
process.on("unhandledRejection", (err)=> {
  console.log("Unhandled Rejection detected...  Server shutting down..", err);

  if(server){ 
    server.close(() => { 
      process.exit(1)
    })
  }
  process.exit(1);
})
//unhandled rejection error
// Promise.reject(new Error("I forget to catch this promise"))

process.on("uncaughtException", (err)=> {
  console.log("Uncaught Exception detected...  Server shutting down..", err);

  if(server){ 
    server.close(() => { 
      process.exit(1)
    })
  }
  process.exit(1);
})

//uncaught rejection error
// throw new Error("I forget to handle this local error")

//  signal termination sigterm
process.on("SIGINT", ()=> {
  console.log("SIGINT Signal recieved...  Server shutting down..");

  if(server){ 
    server.close(() => { 
      process.exit(1)
    })
  }
  process.exit(1);
})

