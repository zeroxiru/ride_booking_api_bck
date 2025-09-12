/* eslint-disable @typescript-eslint/no-extraneous-class */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-indexed-object-style */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { 
  FareEstimationRequest, 
  FareEstimationResponse, 
  FareBreakdown 
} from '../fare/fare.interface';
import { 
  initializeDefaultConfigurations,
  getFareConfiguration,
  getAllConfigurations,
  updateFareConfiguration,
  deactivateConfiguration,
  activateConfiguration,
  getAllFareDocuments as getAllFareDocsFromDB
} from '../fare/fare.model';
import { DistanceService } from '../fare/distance.service';

export class FareService {
  private static distanceService = new DistanceService();

  private static isErrorWithMessage(error: unknown): error is { message: string } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof (error as any).message === 'string'
    );
  }

  private static getErrorMessage(error: unknown): string {
    if (this.isErrorWithMessage(error)) {
      return error.message;
    } else if (typeof error === 'string') {
      return error;
    } else {
      return 'An unknown error occurred during fare estimation';
    }
  }

  private static validateFareRequest(request: FareEstimationRequest): void {
    
      if (!request) {
    throw new Error('Request data is required');
  }
    
    if (!request.pickupLocation ) {
      throw new Error('Pickup  locations are required');
    }

      if (!request.dropoffLocation) {
    throw new Error('Dropoff location is required');
  }

    if (!request.vehicleType) {
      throw new Error('Vehicle type is required');
    }

    const validVehicleTypes = ['standard', 'premium', 'luxury', 'bike'];
    if (!validVehicleTypes.includes(request.vehicleType)) {
      throw new Error(`Invalid vehicle type: ${request.vehicleType}. Must be one of: ${validVehicleTypes.join(', ')}`);
    }
  }

  private static applyPromoCode(totalFare: number, promoCode: string): number {
    const promoDiscounts: { [key: string]: number } = {
      'WELCOME10': 0.1,
      'RIDE20': 0.2,
      'SAVE15': 0.15
    };

    const discount = promoDiscounts[promoCode.toUpperCase()] || 0;
    return totalFare * (1 - discount);
  }

  private static generateFareBreakdown(
    baseFare: number,
    distanceFare: number,
    timeFare: number,
    surgeMultiplier: number
  ): FareBreakdown[] {
    const breakdown: FareBreakdown[] = [
      {
        type: 'base_fare',
        amount: this.roundToTwoDecimals(baseFare),
        description: 'Base fare'
      },
      {
        type: 'distance_fare',
        amount: this.roundToTwoDecimals(distanceFare),
        description: 'Distance charge'
      },
      {
        type: 'time_fare',
        amount: this.roundToTwoDecimals(timeFare),
        description: 'Time charge'
      }
    ];

    if (surgeMultiplier > 1.0) {
      breakdown.push({
        type: 'surge_multiplier',
        amount: surgeMultiplier,
        description: `Surge pricing (x${surgeMultiplier})`
      });
    }

    return breakdown;
  }

  private static roundToTwoDecimals(value: number): number {
    return Math.round(value * 100) / 100;
  }

  static async estimateFare(request: FareEstimationRequest): Promise<FareEstimationResponse> {
    try {

      // Validate input
      this.validateFareRequest(request);


      // Calculate distance and time
      const { distance, duration } = await this.distanceService.calculateDistanceAndTime(
        request.pickupLocation,
        request.dropoffLocation
      );

      // Get fare configuration from MongoDB
      // Get fare configuration from MongoDB
      const fareConfig = await getFareConfiguration(request.vehicleType);
      
         // Calculate fare components
      const baseFare = fareConfig.baseFare;
      const distanceFare = distance * fareConfig.perKmRate;
      const timeFare = duration * fareConfig.perMinuteRate;
      
      // Apply surge multiplier
      const surgeMultiplier = request.surgeMultiplier || 1.0;
      
      // Calculate total fare
      let totalFare = (baseFare + distanceFare + timeFare) * surgeMultiplier;
      
      // Apply minimum fare
      totalFare = Math.max(totalFare, fareConfig.minimumFare);

      // Apply promo code discount if provided
      if (request.promoCode) {
        totalFare = this.applyPromoCode(totalFare, request.promoCode);
      }

      // Round to 2 decimal places
      totalFare = this.roundToTwoDecimals(totalFare);

      return {
        success: true,
        data: {
          baseFare: this.roundToTwoDecimals(baseFare),
          distanceFare: this.roundToTwoDecimals(distanceFare),
          timeFare: this.roundToTwoDecimals(timeFare),
          surgeMultiplier,
          totalFare,
          estimatedDistance: this.roundToTwoDecimals(distance),
          estimatedTime: Math.round(duration),
          currency: 'USD',
          breakdown: this.generateFareBreakdown(baseFare, distanceFare, timeFare, surgeMultiplier)
        }
      };
    } catch (error) {

        console.error('❌ [FareService] Error in estimateFare:', error);
    console.error('📝 [FareService] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
      const errorMessage = this.getErrorMessage(error);
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  static async getFareConfigurations() {
    return await getAllConfigurations();
  }

  static async updateFareConfiguration(vehicleType: string, config: any) {
    await updateFareConfiguration(vehicleType, config);
  }

  static async initializeFareConfigurations() {
    await initializeDefaultConfigurations();
  }

  static async deactivateConfiguration(vehicleType: string) {
    await deactivateConfiguration(vehicleType);
  }

  static async activateConfiguration(vehicleType: string) {
    await activateConfiguration(vehicleType);
  }

  static async getAllFareDocuments(options: { page: number; limit: number }) {
    const documents = await getAllFareDocsFromDB();
    const startIndex = (options.page - 1) * options.limit;
    const endIndex = options.page * options.limit;
    const paginatedDocuments = documents.slice(startIndex, endIndex);

    return {
      documents: paginatedDocuments,
      meta: {
        page: options.page,
        limit: options.limit,
        total: documents.length,
        totalPages: Math.ceil(documents.length / options.limit)
      }
    };
  }
}