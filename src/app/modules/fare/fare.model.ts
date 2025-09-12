/* eslint-disable @typescript-eslint/consistent-indexed-object-style */
import { Schema, model } from "mongoose";
import { FareConfiguration, IFare } from "../fare/fare.interface";

// Define the surge multipliers sub-schema
const surgeMultipliersSchema = new Schema({
  low: { type: Number, required: true },
  medium: { type: Number, required: true },
  high: { type: Number, required: true }
}, { _id: false });

// Define the fare configuration schema
const fareConfigurationSchema = new Schema<FareConfiguration>({
  baseFare: { type: Number, required: true },
  perKmRate: { type: Number, required: true },
  perMinuteRate: { type: Number, required: true },
  minimumFare: { type: Number, required: true },
  surgeMultipliers: { type: surgeMultipliersSchema, required: true }
}, { _id: false });

// Define the main fare schema
const fareSchema = new Schema<IFare>({
  vehicleType: {
    type: String,
    enum: ['standard', 'premium', 'luxury', 'bike'],
    required: true,
    unique: true
  },
  configuration: { type: fareConfigurationSchema, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true, versionKey: false });

// Update the updatedAt field before saving
fareSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Fare = model<IFare>('Fare', fareSchema);

// Fare configuration management functions
export const initializeDefaultConfigurations = async (): Promise<void> => {
  const defaultConfigs = [
    {
      vehicleType: 'standard',
      configuration: {
        baseFare: 2.5,
        perKmRate: 1.5,
        perMinuteRate: 0.3,
        minimumFare: 5.0,
        surgeMultipliers: { low: 1.2, medium: 1.5, high: 2.0 }
      }
    },
    {
      vehicleType: 'premium',
      configuration: {
        baseFare: 5.0,
        perKmRate: 2.5,
        perMinuteRate: 0.5,
        minimumFare: 10.0,
        surgeMultipliers: { low: 1.3, medium: 1.7, high: 2.5 }
      }
    },
    {
      vehicleType: 'luxury',
      configuration: {
        baseFare: 8.0,
        perKmRate: 4.0,
        perMinuteRate: 0.8,
        minimumFare: 15.0,
        surgeMultipliers: { low: 1.4, medium: 1.8, high: 3.0 }
      }
    },
    {
      vehicleType: 'bike',
      configuration: {
        baseFare: 1.5,
        perKmRate: 0.8,
        perMinuteRate: 0.2,
        minimumFare: 3.0,
        surgeMultipliers: { low: 1.1, medium: 1.3, high: 1.8 }
      }
    }
  ];

  for (const config of defaultConfigs) {
    const existingConfig = await Fare.findOne({ vehicleType: config.vehicleType });
    if (!existingConfig) {
      await Fare.create(config);
    }
  }
};

export const getFareConfiguration = async (vehicleType: string): Promise<FareConfiguration> => {
  const config = await Fare.findOne({ vehicleType, isActive: true });
  if (!config) {
    throw new Error(`Fare configuration not found for vehicle type: ${vehicleType}`);
  }
  return config.configuration;
};

export const getAllConfigurations = async (): Promise<Record<string, FareConfiguration>> => {
  const configs = await Fare.find({ isActive: true });
  const result: Record<string, FareConfiguration> = {};
  
  configs.forEach(config => {
    result[config.vehicleType] = config.configuration;
  });
  
  return result;
};

export const updateFareConfiguration = async (
  vehicleType: string, 
  updates: Partial<FareConfiguration>
): Promise<void> => {
  const config = await Fare.findOne({ vehicleType });
  if (!config) {
    throw new Error(`Configuration not found for vehicle type: ${vehicleType}`);
  }

  if (updates.baseFare !== undefined) config.configuration.baseFare = updates.baseFare;
  if (updates.perKmRate !== undefined) config.configuration.perKmRate = updates.perKmRate;
  if (updates.perMinuteRate !== undefined) config.configuration.perMinuteRate = updates.perMinuteRate;
  if (updates.minimumFare !== undefined) config.configuration.minimumFare = updates.minimumFare;
  if (updates.surgeMultipliers !== undefined) {
    config.configuration.surgeMultipliers = {
      ...config.configuration.surgeMultipliers,
      ...updates.surgeMultipliers
    };
  }

  config.updatedAt = new Date();
  await config.save();
};

export const deactivateConfiguration = async (vehicleType: string): Promise<void> => {
  await Fare.findOneAndUpdate(
    { vehicleType },
    { isActive: false, updatedAt: new Date() }
  );
};

export const activateConfiguration = async (vehicleType: string): Promise<void> => {
  await Fare.findOneAndUpdate(
    { vehicleType },
    { isActive: true, updatedAt: new Date() }
  );
};

export const getConfigurationByVehicleType = async (vehicleType: string): Promise<IFare | null> => {
  return await Fare.findOne({ vehicleType, isActive: true });
};

export const getAllFareDocuments = async (): Promise<IFare[]> => {
  return await Fare.find().sort({ vehicleType: 1 });
};