class AppError extends Error { 
    public statusCode : number;


constructor(statusCode : number, message: string, stack = ""){ 

    super(message) // through new Error("Somehting went wrong")
    this.statusCode = statusCode 
    if(stack){ 
        this.stack = stack
    }
    else { 
        Error.captureStackTrace(this, this.constructor)
    }
}
}
export default AppError