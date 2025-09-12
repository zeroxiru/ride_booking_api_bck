import express, { NextFunction, Request, Response } from "express"
// import { UserRoutes } from "./app/modules/user/user.route"
import cors from 'cors'
import { router } from "./app/routes"

import { envVars } from "./app/config/env"
import { globalErrorHandeler } from "./app/middleWares/globalErrorHandler"
import notFound from "./app/middleWares/notFound"
import cookieParser from "cookie-parser"
import passport from "passport"
import expressSession from "express-session"
import "./app/config/passport"


const app =  express()

app.use(expressSession({ 
    secret: envVars.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

app.use(cookieParser())
app.use(express.json())
app.use(cors())

app.use("/api/v1", router)

app.get("/", (req:Request, res:Response)=>{ 
    res.status(200).json({ 
        message: "Welcome to Bike Riding API System Backend"
    })
})


// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
app.use(globalErrorHandeler)
app.use(notFound)
export default app;