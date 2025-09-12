/* eslint-disable @typescript-eslint/no-extraneous-class */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DashboardAnalytics, AnalyticsTimeRange } from '../analytics/analytics.interface';
import { Ride } from '../ride/ride.model';
import { User } from '../user/user.model';

export class AnalyticsService {
  static async getDashboardOverview(timeRange?: AnalyticsTimeRange): Promise<DashboardAnalytics> {
    // Calculate date range (default: last 30 days)
    const startDate = timeRange?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = timeRange?.endDate || new Date();

    // Get total counts
    const [
      totalRides,
      totalUsers,
      totalDrivers,
      completedRides,
      cancelledRides,
      activeRides
    ] = await Promise.all([
      Ride.countDocuments(),
      User.countDocuments({ role: 'rider' }),
      User.countDocuments({ role: 'driver', isApproved: true }), // Only count approved drivers
      Ride.countDocuments({ status: 'completed', createdAt: { $gte: startDate, $lte: endDate } }),
      Ride.countDocuments({ status: 'cancelled', createdAt: { $gte: startDate, $lte: endDate } }),
      Ride.countDocuments({ status: { $in: ['accepted', 'in_progress'] } })
    ]);

    // Calculate total revenue (from completed rides in date range)
    const revenueResult = await Ride.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$actualFare' }
        }
      }
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    // Calculate average rating from both rider and driver ratings
    const ratingResult = await Ride.aggregate([
      {
        $match: {
          status: 'completed',
          $or: [
            { driverRating: { $exists: true, $gt: 0 } },
            { riderRating: { $exists: true, $gt: 0 } }
          ]
        }
      },
      {
        $group: {
          _id: null,
          averageDriverRating: { $avg: '$driverRating' },
          averageRiderRating: { $avg: '$riderRating' },
          totalRatings: { $sum: 1 }
        }
      }
    ]);

    const averageRating = ratingResult[0] ? 
      ((ratingResult[0].averageDriverRating || 0) + (ratingResult[0].averageRiderRating || 0)) / 2 : 0;

    // Get daily stats for the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const dailyStats = await this.getDailyStats(sevenDaysAgo, endDate);

    // Get vehicle type distribution
    const vehicleDistribution = await this.getVehicleTypeDistribution(startDate, endDate);

    // Calculate revenue trend
    const revenueTrend = await this.getRevenueTrend(startDate, endDate, totalRevenue);

    return {
      totalRides,
      totalUsers,
      totalDrivers,
      totalRevenue,
      activeRides,
      cancelledRides,
      completedRides,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      dailyStats,
      revenueTrend,
      vehicleTypeDistribution: vehicleDistribution
    };
  }

  private static async getDailyStats(startDate: Date, endDate: Date): Promise<any[]> {
    return Ride.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          rides: { $sum: 1 },
          revenue: { $sum: '$actualFare' },
          users: { $addToSet: '$rider' } // Count unique users
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $project: {
          date: '$_id',
          rides: 1,
          revenue: 1,
          users: { $size: '$users' },
          _id: 0
        }
      }
    ]);
  }

  private static async getRevenueTrend(startDate: Date, endDate: Date, currentRevenue: number): Promise<any[]> {
    // Calculate previous period revenue for comparison
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const previousStartDate = new Date(startDate.getTime() - daysDiff * 24 * 60 * 60 * 1000);
    const previousEndDate = new Date(startDate.getTime() - 1); // One millisecond before current start

    const previousRevenueResult = await Ride.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: previousStartDate, $lte: previousEndDate }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$actualFare' }
        }
      }
    ]);

    const previousRevenue = previousRevenueResult[0]?.totalRevenue || 0;
    const growth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    return [
      { period: 'day', revenue: Math.round(currentRevenue / daysDiff), growth: Math.round(growth * 10) / 10 },
      { period: 'week', revenue: Math.round(currentRevenue / (daysDiff / 7)), growth: Math.round(growth * 10) / 10 },
      { period: 'month', revenue: currentRevenue, growth: Math.round(growth * 10) / 10 }
    ];
  }

  private static async getVehicleTypeDistribution(startDate: Date, endDate: Date): Promise<any[]> {
    const distribution = await Ride.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$vehicleType',
          count: { $sum: 1 },
          revenue: { $sum: '$actualFare' }
        }
      }
    ]);

    const total = distribution.reduce((sum, item) => sum + item.count, 0);
    const totalRevenue = distribution.reduce((sum, item) => sum + item.revenue, 0);

    return distribution.map(item => ({
      vehicleType: item._id,
      count: item.count,
      revenue: item.revenue,
      percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
      revenuePercentage: totalRevenue > 0 ? Math.round((item.revenue / totalRevenue) * 100) : 0
    }));
  }
}