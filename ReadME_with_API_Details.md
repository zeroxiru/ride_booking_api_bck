Auth Routes (/api/v1/auth):
POST https://ridebookingapibck.vercel.app/api/v1/auth/login

GET https://ridebookingapibck.vercel.app/api/v1/auth/google

POST    /auth/login
POST    /auth/refresh-token
POST    /auth/logout
POST    /auth/reset-password
GET     /auth/google
GET     /auth/google/callback

Sample Body for /auth/login:
{
  "email": "user@example.com",
  "password": "password123"
}
Sample Body for /auth/reset-password:
{
  "oldPassword": "oldpass123",
  "newPassword": "newpass123"
}

User Routes (/api/v1/users):
POST https://ridebookingapibck.vercel.app/api/v1/users/register

GET https://ridebookingapibck.vercel.app/api/v1/users/all-users

POST    /users/register
GET     /users/all-users
PATCH   /users/:id

Sample Body for /users/register:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "role": "rider"
}

Sample Body for PATCH /users/:id:
{
  "name": "John Smith",
  "phone": "+1987654321"
}

Rider Routes (/api/v1/rider)
POST    /rider/request
GET     /rider/rides/history

Sample Body for POST /rider/request:
{
  "pickupLocation": {
    "address": "123 Main St",
    "coordinates": { "lat": 40.7128, "lng": -74.0060 }
  },
  "destination": {
    "address": "456 Park Ave",
    "coordinates": { "lat": 40.7589, "lng": -73.9851 }
  },
  "rideType": "standard"
}
Ride Routes (/api/v1/rides):
POST https://ridebookingapibck.vercel.app/api/v1/rider/request

PATCH https://ridebookingapibck.vercel.app/api/v1/rides/:rideId/cancel

POST https://ridebookingapibck.vercel.app/api/v1/rides/:rideId/feedback

PATCH   /rides/:rideId/cancel
GET     /rides/:rideId/rejections
POST    /rides/:rideId/feedback

Sample Body for PATCH /rides/:rideId/cancel:
{
  "reason": "Driver is taking too long"
}

Sample Body for POST /rides/:rideId/feedback:
{
  "userId": "user123",
  "target": "driver",
  "rating": 5,
  "review": "Excellent service!"
}

Fare Routes (/api/v1/fares):

POST https://ridebookingapibck.vercel.app/api/v1/fares/estimate

GET https://ridebookingapibck.vercel.app/api/v1/fares/configurations

POST    /fares/configurations/initialize
POST    /fares/estimate
GET     /fares/configurations
PATCH   /fares/configurations

Sample Body for POST /fares/estimate:
{
  "pickupLocation": { "lat": 40.7128, "lng": -74.0060 },
  "destination": { "lat": 40.7589, "lng": -73.9851 },
  "rideType": "standard"
}

Sample Body for PATCH /fares/configurations:
{
  "baseFare": 2.50,
  "costPerMile": 1.75,
  "costPerMinute": 0.25
}

Driver Routes (/api/v1/driver):
GET https://ridebookingapibck.vercel.app/api/v1/driver/profile

PATCH https://ridebookingapibck.vercel.app/api/v1/driver/availability

PATCH https://ridebookingapibck.vercel.app/api/v1/driver/rides/:rideId/accept

PATCH   /driver/rides/:rideId/accept
PATCH   /driver/rides/:rideId/reject
PATCH   /driver/availability
PATCH   /driver/rides/:rideId/status
GET     /driver/earnings
PATCH   /driver/profile
GET     /driver/profile
GET     /driver/rejections/history

Sample Body for PATCH /driver/availability:

{
  "isAvailable": true,
  "currentLocation": {
    "lat": 40.7128,
    "lng": -74.0060
  }
}

Sample Body for PATCH /driver/rides/:rideId/status:

{
  "status": "in_progress"
}

Sample Body for PATCH /driver/profile:
{
  "vehicle": {
    "make": "Toyota",
    "model": "Camry",
    "year": 2022,
    "color": "Blue"
  }
}

Analytics Routes (/api/v1/analytics):
GET https://ridebookingapibck.vercel.app/api/v1/analytics/dashboard
GET     /analytics/dashboard
GET     /analytics/rides/stats
Sample Query Params for GET /analytics/dashboard:
?startDate=2024-01-01&endDate=2024-01-31&timeRange=monthly

Admin Routes (/api/v1/admin):
GET https://ridebookingapibck.vercel.app/api/v1/admin/users

GET https://ridebookingapibck.vercel.app/api/v1/admin/drivers

GET https://ridebookingapibck.vercel.app/api/v1/admin/rides

GET     /admin/users
PATCH   /admin/users/:userId/block
PATCH   /admin/users/:userId/unblock
GET     /admin/drivers
PATCH   /admin/drivers/:driverId/approve
PATCH   /admin/drivers/:driverId/suspend
GET     /admin/rides
GET     /admin/rides/:rideId
GET     /admin/reports/summary
GET     /admin/reports/rides

Sample Body for PATCH /admin/users/:userId/block:

{
  "reason": "Violation of terms of service"
}


Sample Body for PATCH /admin/drivers/:driverId/approve:

{
  "notes": "Documents verified successfully"
}