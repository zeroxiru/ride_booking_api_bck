export const RideConstants = {
  CANCELLATION_WINDOWS: {
    RIDER_PRE_ACCEPTANCE: 5, // 5 mins before driver accepts
    DRIVER_POST_ACCEPTANCE: 2, // 2 mins after accepting
  },
  MAX_CANCELLATION_ATTEMPTS: 3,
  CANCELLATION_REASONS: {
    RIDER: [
      'change_of_plans',
      'driver_delayed',
      'found_another_ride',
      'price_issue',
      'other'
    ],
    DRIVER: [
      'vehicle_issue',
      'personal_emergency',
      'rider_unavailable',
      'location_inaccessible',
      'other'
    ]
  }
};