/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from "mongoose";
import { Ride } from "../ride/ride.model";
// import { IDriverProfile } from '../driver/driver.interface';
import { DriverProfile } from "../driver/driver.model";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { RideStatus } from "../ride/ride.interface";
import { IDriverProfile } from "./driver.interface";
import { User } from "../user/user.model";

export const DriverServices = {
  async acceptRide(params: {
    rideId: string;
    driverId: Types.ObjectId;
  }) {
    const ride = await Ride.findByIdAndUpdate(
      params.rideId,
      {
        status: "accepted",
        driver: params.driverId,
        acceptedAt: new Date()
      },
      { new: true }
    ).populate("rider driver");

    if (!ride) {
      throw new AppError(httpStatus.NOT_FOUND, "Ride not found");
    }

    // Update driver availability
    await DriverProfile.findByIdAndUpdate(
      params.driverId,
      { isAvailable: false }
    );

    return ride;
  },

  async rejectRide(params: {
    rideId: string;
    driverId: Types.ObjectId;
    reason?: string;
  }) {
    // console.log('Rejecting ride:', params.rideId, 'by driver:', params.driverId);
    const ride = await Ride.findById( params.rideId);

      if (!ride) {
    throw new AppError(httpStatus.NOT_FOUND, "Ride not found");
  }
      
        
          ride.rejectionHistory.push( {
            driver: params.driverId,
            reason: params.reason,
            timestamp: new Date()
          })
        const updatedRide = await ride.save();
        return updatedRide;

  },

  async updateAvailability(params: {
    driverId: Types.ObjectId;
    isOnline: boolean;
    currentLocation?: {
      coordinates: [number, number];
      address?: string;
    };
  }) {
    let driverProfile =  await  DriverProfile.findOne({user: params.driverId})
    if(!driverProfile){ 
      const user =  await User.findById(params.driverId)
      if(!user){
      throw new AppError(httpStatus.NOT_FOUND, "Driver not found.")
      }

      // Create a basic driver profile
    driverProfile = await DriverProfile.create({
      user: params.driverId,
      slug: `driver-${params.driverId.toString()}`,
      vehicle: {
        make: "Unknown",
        model: "Unknown",
        year: new Date().getFullYear(),
        color: "Unknown",
        licensePlate: "TBD"
      },
      licenseNumber: "TBD",
      insuranceProvider: "TBD",
      insuranceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      documents: {
        license: "TBD",
        insurance: "TBD",
        vehicleRegistration: "TBD"
      },
      isOnline: params.isOnline,
      isAvailable: params.isOnline,
      totalRidesCompleted: 0,
      approved: false
    });
  }
    
    const update: any = {
      isOnline: params.isOnline,
      isAvailable: params.isOnline // Available only when online
    };

    if (params.currentLocation) {
      update.currentLocation = {
        type: "Point",
        coordinates: params.currentLocation.coordinates,
        address: params.currentLocation.address
      };
    }

    const updatedDriver = await DriverProfile.findByIdAndUpdate(
      driverProfile._id,
      update,
      { new: true }
    );

    if (!updatedDriver) {
      throw new AppError(httpStatus.NOT_FOUND, "Failed to update driver availability");
    }

    return updatedDriver;
  },
  
  async updateRideStatus(params: { 
    rideId: string;
    driverId: Types.ObjectId;
    status: 'requested'|'accepted'|'picked_up'|'driver_arrived'| 'in_transit' | 'completed'|'cancelled';
  }){ 
        // Find the ride and verify the driver is assigned to it
        const ride =  await Ride.findOne({ 
          _id: params.rideId,
          driver: params.driverId
        });
        if(!ride) { 
throw new AppError(httpStatus.NOT_FOUND, "Ride not found or you are not assigned to this ride");
        }
 
        
    // Validate status transition
    const validTransitions: Record<RideStatus, RideStatus[]> = { 
  requested: ['accepted', 'cancelled'],
  accepted: ['driver_arrived', 'picked_up','cancelled'],
  driver_arrived: ['picked_up', 'cancelled'],
  picked_up: ['in_transit', 'cancelled'],
  in_transit: ['completed', 'cancelled'],
  completed: [],
  cancelled: []
    }
   if (!validTransitions[ride.status].includes(params.status)) {
    throw new AppError(
      httpStatus.BAD_REQUEST, 
      `Cannot change status from ${ride.status} to ${params.status}. Valid transitions: ${validTransitions[ride.status].join(', ')}`
    );
  }
  
  // Update ride status with appropriate timestamps
  const updateData: any = { status: params.status };
  
  switch (params.status) {
    case 'accepted':
      updateData.acceptedAt = new Date();
      break;
    case 'driver_arrived':
      updateData.driverArrivedAt = new Date();
      break;
    case 'picked_up':
      updateData.pickupTime = new Date();
      break;
    case 'completed':
      updateData.completedAt = new Date();
      // Calculate actual fare if needed
      break;
    case 'cancelled':
      updateData.cancelledAt = new Date();
      break;
  }
  
  const updatedRide = await Ride.findByIdAndUpdate(
    params.rideId,
    updateData,
    { new: true }
  ).populate('rider');
  
  return updatedRide;
  },

async getEarningsHistory(params: {
    driverId: Types.ObjectId;
    startDate?: string;
    endDate?: string;
    page: number;
    limit: number;
  }) {
    // Build date filter
    const dateFilter: any = {};
    if (params.startDate) {
      dateFilter.$gte = new Date(params.startDate);
    }
    if (params.endDate) {
      dateFilter.$lte = new Date(params.endDate);
    }
    
    // Build query
    const query: any = { 
      driver: params.driverId, 
      status: 'completed' 
    };
    
    if (params.startDate || params.endDate) {
      query.completedAt = dateFilter;
    }
    
    // Get paginated results
    const skip = (params.page - 1) * params.limit;
    
    const [rides, total] = await Promise.all([
      Ride.find(query)
        .select('rider estimatedFare actualFare completedAt distance duration')
        .populate('rider', 'name phone')
        .sort({ completedAt: -1 })
        .skip(skip)
        .limit(params.limit),
      Ride.countDocuments(query)
    ]);
    
    // Calculate total earnings
    const totalEarnings = rides.reduce((sum, ride) => {
      return sum + (ride.actualFare || ride.estimatedFare || 0);
    }, 0);
    
    return {
      earnings: rides,
      totalEarnings,
      meta: {
        page: params.page,
        limit: params.limit,
        total,
        pages: Math.ceil(total / params.limit)
      }
    };
  },
  
  async updateDriverProfile(params: {
    driverId: Types.ObjectId;
    updateData: Partial<IDriverProfile>;
  }) {
    // Find the driver profile
    const driverProfile = await DriverProfile.findOne({ user: params.driverId });
    
    if (!driverProfile) {
      throw new AppError(httpStatus.NOT_FOUND, "Driver profile not found");
    }
    
    // Update the profile
    const updatedProfile = await DriverProfile.findByIdAndUpdate(
      driverProfile._id,
      params.updateData,
      { new: true, runValidators: true }
    );
    
    return updatedProfile;
  },
  
  async getDriverProfile(driverId: Types.ObjectId) {
    const driverProfile = await DriverProfile.findOne({ user: driverId })
      .populate('user', 'name email phone');
    
    if (!driverProfile) {
      throw new AppError(httpStatus.NOT_FOUND, "Driver profile not found");
    }
    
    return driverProfile;
  },

  // In driver.service.ts
async getDriverRejectionHistory(params: {
  driverId: Types.ObjectId;
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
}) {
  // Build date filter
  const dateFilter: any = {};
  if (params.startDate) dateFilter.$gte = new Date(params.startDate);
  if (params.endDate) dateFilter.$lte = new Date(params.endDate);

  // Build query for rides where this driver rejected
  const query: any = {
    "rejectionHistory.driver": params.driverId
  };
  
  if (params.startDate || params.endDate) {
    query["rejectionHistory.timestamp"] = dateFilter;
  }

  const skip = (params.page - 1) * params.limit;

   // Use lean() and proper typing
  const rides = await Ride.find(query)
    .select('rider pickupLocation destination estimatedFare requestedAt rejectionHistory')
    .populate('rider', 'name phone')
    .populate('rejectionHistory.driver', 'name email phone') // Populate driver info in rejection history
    .sort({ "rejectionHistory.timestamp": -1 })
    .skip(skip)
    .limit(params.limit)
    .lean(); // Convert to plain JavaScript objects

  const total = await Ride.countDocuments(query);

  // Extract just the rejections by this driver
  const rejections = rides.flatMap(ride => {
    // Type assertion to help TypeScript understand the structure
    const typedRide = ride as unknown as {
      _id: Types.ObjectId;
      rider: any;
      pickupLocation: any;
      destination: any;
      estimatedFare: number;
      requestedAt: Date;
      rejectionHistory: {
        driver: Types.ObjectId | any;
        reason?: string;
        timestamp: Date;
        _id?: Types.ObjectId;
      }[];
    };
    
    return typedRide.rejectionHistory
      .filter(rejection => {
        // Handle both ObjectId and populated driver
        const driverId = rejection.driver instanceof Types.ObjectId 
          ? rejection.driver 
          : rejection.driver?._id;
        return driverId?.equals(params.driverId);
      })
      .map(rejection => ({
        rideId: typedRide._id,
        rider: typedRide.rider,
        pickupLocation: typedRide.pickupLocation,
        destination: typedRide.destination,
        estimatedFare: typedRide.estimatedFare,
        requestedAt: typedRide.requestedAt,
        reason: rejection.reason,
        timestamp: rejection.timestamp,
        driver: rejection.driver // This will be populated if you used populate()
      }));
  });

  return {
    rejections,
    meta: {
      page: params.page,
      limit: params.limit,
      total,
      pages: Math.ceil(total / params.limit)
    }
  };

}


};