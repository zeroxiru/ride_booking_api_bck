/* eslint-disable @typescript-eslint/no-explicit-any */
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { UserStatus } from "../user/user.interface";
import { User } from "../user/user.model";
import { DriverProfile } from "../driver/driver.model";
import { Ride } from "../ride/ride.model";
import { Types } from "mongoose";



export const AdminServices = {
    async getAllUsers (params: { 
        page: number;
        limit: number;
        search?: string;
        role?: string;
        status?: string;
    }){
    
   const {  page, limit, search, role, status} = params;
      const skip = (page -1) * limit;
      const filter:  any = {}
      if(search) { 
        filter.$or = [ 
            {name: {$regex: search, $options: 'i'}},
            { email: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } }

        ]
      }
      if(role) filter.role =role;
      if(status) filter.status = status;

      const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter)
    ]);
    
    return {
      users,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },
  async blockUser(userId: string, reason?: string) {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        status: UserStatus.BLOCKED,
        $set: { 'blockedReason': reason }
      },
      { new: true }
    ).select('-password');
    
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }
    
    return user;
  },
  
  async unblockUser(userId: string) {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        status: UserStatus.ACTIVE,
        $unset: { 'blockedReason': '' }
      },
      { new: true }
    ).select('-password');
    
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }
    
    return user;
  },
  
  async getAllDrivers(params: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    approved?: string;
  }) {
    const { page, limit, search, status, approved } = params;
    const skip = (page - 1) * limit;
    
    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { 'user.name': { $regex: search, $options: 'i' } },
        { 'user.email': { $regex: search, $options: 'i' } },
        { licenseNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) filter.status = status;
    if (approved !== undefined) filter.approved = approved === 'true';
    
    const [drivers, total] = await Promise.all([
      DriverProfile.find(filter)
        .populate('user', 'name email phone status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      DriverProfile.countDocuments(filter)
    ]);
    
    return {
      drivers,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

   async approveDriver(driverUserId: string, adminId: Types.ObjectId, reason?: string) {
    let driverProfile = await DriverProfile.findOne({user: driverUserId});

    if(!driverProfile)
    { 
        const user =  await User.findById(driverUserId)
        if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    driverProfile = await DriverProfile.create({
      user: driverUserId,
      slug: `driver-${driverUserId.toString()}`,
      vehicle: {
        make: "Unknown",
        model: "Unknown", 
        year: new Date().getFullYear(),
        color: "Unknown",
        licensePlate: "TBD"
      },
      licenseNumber: "TBD",
      insuranceProvider: "TBD",
      insuranceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      documents: {
        license: "TBD",
        insurance: "TBD",
        vehicleRegistration: "TBD"
      },
      isOnline: false,
      isAvailable: false,
      totalRidesCompleted: 0,
      approved: false
    });
  }
    // Now approve the driver profile
  const updatedDriver = await DriverProfile.findByIdAndUpdate(
    driverProfile._id,
    {
      approved: true,
      approvedBy: adminId,
      approvedAt: new Date(),
      approvalReason: reason
    },
    { new: true }
  ).populate('user', 'name email phone');
  
  if (!updatedDriver) {
    throw new AppError(httpStatus.NOT_FOUND, "Failed to approve driver");
  }

  await User.findByIdAndUpdate( 
    driverUserId,
    { isVerified: true},
    {new: true}
  )
  
  return updatedDriver;
    },
  
  async suspendDriver(driverId: string, reason?: string) {
    const driver = await DriverProfile.findByIdAndUpdate(
      driverId,
      {
        approved: false,
        $set: { 'suspensionReason': reason }
      },
      { new: true }
    ).populate('user', 'name email phone');
    
    if (!driver) {
      throw new AppError(httpStatus.NOT_FOUND, "Driver not found");
    }
    
    return driver;
  },
  
  async getAllRides(params: {
    page: number;
    limit: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { page, limit, status, startDate, endDate } = params;
    const skip = (page - 1) * limit;
    
    const filter: any = {};
    
    if (status) filter.status = status;
    
    if (startDate || endDate) {
      filter.requestedAt = {};
      if (startDate) filter.requestedAt.$gte = new Date(startDate);
      if (endDate) filter.requestedAt.$lte = new Date(endDate);
    }
    
    const [rides, total] = await Promise.all([
      Ride.find(filter)
        .populate('rider', 'name email phone')
        .populate('driver', 'name email phone')
        .sort({ requestedAt: -1 })
        .skip(skip)
        .limit(limit),
      Ride.countDocuments(filter)
    ]);
    
    return {
      rides,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },
async getRideDetails(rideId: string) {
    const ride = await Ride.findById(rideId)
      .populate('rider', 'name email phone')
      .populate('driver', 'name email phone')
      .populate('rejectionHistory.driver', 'name email phone');
    
    if (!ride) {
      throw new AppError(httpStatus.NOT_FOUND, "Ride not found");
    }
    
    return ride;
  },

  async getSystemSummary() {
    const [
      totalUsers,
      totalDrivers,
      totalRides,
      activeRides,
      completedRides,
      totalRevenue
    ] = await Promise.all([
      User.countDocuments(),
      DriverProfile.countDocuments({ approved: true }),
      Ride.countDocuments(),
      Ride.countDocuments({ status: { $in: ['requested', 'accepted', 'in_progress'] } }),
      Ride.countDocuments({ status: 'completed' }),
      Ride.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$actualFare' } } }
      ])
    ]);
    
    return {
      users: {
        total: totalUsers,
        active: await User.countDocuments({ status: 'ACTIVE' }),
        blocked: await User.countDocuments({ status: 'BLOCKED' })
      },
      drivers: {
        total: totalDrivers,
        pendingApproval: await DriverProfile.countDocuments({ approved: false }),
        online: await DriverProfile.countDocuments({ isOnline: true })
      },
      rides: {
        total: totalRides,
        active: activeRides,
        completed: completedRides
      },
      revenue: {
        total: totalRevenue[0]?.total || 0
      }
    };
  },

  async getRideReports(params: {
    startDate?: string;
    endDate?: string;
    type?: string;
  }) {
    const { startDate, endDate, type = 'daily' } = params;
    
    const dateFilter: any = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);
    
    let groupFormat;
    switch (type) {
      case 'daily':
        groupFormat = { year: { $year: '$requestedAt' }, month: { $month: '$requestedAt' }, day: { $dayOfMonth: '$requestedAt' } };
        break;
      case 'weekly':
        groupFormat = { year: { $year: '$requestedAt' }, week: { $week: '$requestedAt' } };
        break;
      case 'monthly':
        groupFormat = { year: { $year: '$requestedAt' }, month: { $month: '$requestedAt' } };
        break;
    }
    
    const reports = await Ride.aggregate([
      { $match: { requestedAt: dateFilter } },
      {
        $group: {
          _id: groupFormat,
          totalRides: { $sum: 1 },
          completedRides: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          cancelledRides: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
          totalRevenue: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$actualFare', 0] } },
          avgFare: { $avg: { $cond: [{ $eq: ['$status', 'completed'] }, '$actualFare', null] } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } }
    ]);
    
    return reports;
  }
};
