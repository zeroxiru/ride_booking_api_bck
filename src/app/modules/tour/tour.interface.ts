import {  Types } from "mongoose";

export interface ITourType{ 
    name : string;
}


export interface ITour { 
    division : Types.ObjectId;
    title : string;
    slug : string
    description ?: string;
    images ?: string[];
    location ?: string;
    costForm ?: number;
    startDate ?: Date;
    endDate ?: Date;
    tourType : Types.ObjectId;
    included ?: string[];
    excluded ?: string[];
    amenities ?: string[];
    tourPlan ?: string[];
    maxGuest ?: number;
    minAge ?: number;
}