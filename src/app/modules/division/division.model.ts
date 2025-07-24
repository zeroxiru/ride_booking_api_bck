import { model, Schema } from "mongoose";
import { IDivison } from "./division.interface";

const divisionSchema = new Schema<IDivison>({
    name: {type: String, required: true, unique : true},
    slug: {type : String, required: true,unique:true},
    description: {type: String}

}, { 
    timestamps: true
})

export const Division =   model<IDivison>("Division", divisionSchema)