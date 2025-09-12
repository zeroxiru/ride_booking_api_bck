export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface SurgeMultipliers {
  low: number;
  medium: number;
  high: number;
}

export interface FareConfiguration {
  baseFare: number;
  perKmRate: number;
  perMinuteRate: number;
  minimumFare: number;
  surgeMultipliers: SurgeMultipliers;
}

export interface IFare {
  _id?: string;
  vehicleType: string;
  configuration: FareConfiguration;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FareEstimationRequest {
  pickupLocation: Location;
  dropoffLocation: Location;
  vehicleType: string;
  rideType?: string;
  surgeMultiplier?: number;
  promoCode?: string;
}

export interface FareEstimationResponse {
  success: boolean;
  data?: {
    baseFare: number;
    distanceFare: number;
    timeFare: number;
    surgeMultiplier: number;
    totalFare: number;
    estimatedDistance: number;
    estimatedTime: number;
    currency: string;
    breakdown: FareBreakdown[];
  };
  error?: string;
}

export interface FareBreakdown {
  type: string;
  amount: number;
  description: string;
}

export interface DistanceMatrixResponse {
  distance: number;
  duration: number;
  status: string;
}