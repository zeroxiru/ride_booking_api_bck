import express, { NextFunction, request, Request, Response } from "express"
// import { UserRoutes } from "./app/modules/user/user.route"
import cors from 'cors'
import { router } from "./app/routes"
import { success } from "zod"
import { envVars } from "./app/config/env"
import { globalErrorHandeler } from "./app/middleWares/globalErrorHandler"
import httpStatus  from "http-status-codes"
import notFound from "./app/middleWares/notFound"
const app =  express()

app.use(express.json())
app.use(cors())

app.use("/api/v1", router)

app.get("/", (req:Request, res:Response)=>{ 
    res.status(200).json({ 
        message: "Welcome to PH Tour Management System Backend"
    })
})


// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
app.use(globalErrorHandeler)
app.use(notFound)
export default app;