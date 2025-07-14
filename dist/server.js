"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
let server;
const port = 8000;
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(`mongodb+srv://mongodb:mongodb@cluster0.fmsye.mongodb.net/ph-tour-mgt-bck?retryWrites=true&w=majority&appName=Cluster0`);
        console.log("Connected to DB");
        server = app_1.default.listen(port, () => {
            console.log(`PH Tour Management System is running on ${port}`);
        });
    }
    catch (error) {
        console.log(error);
    }
});
startServer();
/***
 * unhandled rejection error
 * uncaught rejection error
 * signal terminatio sigterm
*/
process.on("unhandledRejection", (err) => {
    console.log("Unhandled Rejection detected...  Server shutting down..", err);
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});
//unhandled rejection error
// Promise.reject(new Error("I forget to catch this promise"))
process.on("uncaughtException", (err) => {
    console.log("Uncaught Exception detected...  Server shutting down..", err);
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});
//uncaught rejection error
// throw new Error("I forget to handle this local error")
//  signal termination sigterm
process.on("SIGINT", () => {
    console.log("SIGINT Signal recieved...  Server shutting down..");
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});
