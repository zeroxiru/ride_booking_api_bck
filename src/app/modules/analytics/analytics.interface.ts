export interface DashboardAnalytics {
  totalRides: number;
  totalUsers: number;
  totalDrivers: number;
  totalRevenue: number;
  activeRides: number;
  cancelledRides: number;
  completedRides: number;
  averageRating: number;
  dailyStats: DailyStat[];
  revenueTrend: RevenueTrend[];
  vehicleTypeDistribution: VehicleTypeDistribution[];
}

export interface DailyStat {
  date: string;
  rides: number;
  revenue: number;
  users: number;
}

export interface RevenueTrend {
  period: string; // "day", "week", "month"
  revenue: number;
  growth: number; // percentage
}

export interface VehicleTypeDistribution {
  vehicleType: string;
  count: number;
  percentage: number;
}

export interface AnalyticsTimeRange {
  startDate?: Date;
  endDate?: Date;
  period?: 'day' | 'week' | 'month' | 'year';
}