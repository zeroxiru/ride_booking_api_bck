/* eslint-disable @typescript-eslint/no-unused-vars */
import { Location, DistanceMatrixResponse } from '../fare/fare.interface';

export class DistanceService {
  async calculateDistanceAndTime(
    origin: Location,
    destination: Location
  ): Promise<DistanceMatrixResponse> {
    try {
      // Simulate API call to Google Maps or other service
      const mockResponse = await this.mockDistanceApiCall(origin, destination);
      
      return {
        distance: mockResponse.distance / 1000, // meters to km
        duration: mockResponse.duration / 60, // seconds to minutes
        status: 'OK'
      };
    } catch (error) {
      // Fallback to Haversine formula
      return this.calculateStraightLineDistance(origin, destination);
    }
  }

  private async mockDistanceApiCall(
    origin: Location,
    destination: Location
  ): Promise<{ distance: number; duration: number }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Mock response - in real implementation, replace with actual API call
    const baseDistance = this.calculateHaversineDistance(origin, destination);
    const trafficFactor = 1.2; // Simulate road distance vs straight line
    
    return {
      distance: baseDistance * trafficFactor * 1000, // Convert to meters
      duration: (baseDistance * trafficFactor / 30) * 3600 // Assuming 30 km/h average speed
    };
  }

  private calculateStraightLineDistance(
    origin: Location,
    destination: Location
  ): DistanceMatrixResponse {
    const distance = this.calculateHaversineDistance(origin, destination);
    const duration = (distance / 30) * 60; // 30 km/h average speed, result in minutes

    return {
      distance,
      duration,
      status: 'ESTIMATED'
    };
  }

  private calculateHaversineDistance(origin: Location, destination: Location): number {
    const R = 6371; // Earth radius in km
    const dLat = this.deg2rad(destination.lat - origin.lat);
    const dLon = this.deg2rad(destination.lng - origin.lng);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(origin.lat)) * 
      Math.cos(this.deg2rad(destination.lat)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
}