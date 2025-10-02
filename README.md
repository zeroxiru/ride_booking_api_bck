🚖 Ride Booking API

A complete backend system for a ride-sharing platform, built with Express.js and MongoDB.
This API supports three roles — Rider, Driver, and Admin — with features like ride booking, driver management, role-based access control, and analytics.
Ride Booking API: Project Overview This project delivers a complete backend system for a ride-sharing platform using Express.js and MongoDB. The API supports three user roles with distinct functionalities: riders can book and track rides, drivers manage ride acceptance and status updates, and admins oversee system operations and user management.

The architecture follows a modular design with separate modules for authentication, user management, ride operations, and analytics. Key features include JWT-based security, role-based access control, ride lifecycle management, and comprehensive validation. The system handles essential ride-sharing workflows from booking to completion while maintaining scalability for future enhancements like ratings and fare calculations.

Built with production-ready practices, the API provides RESTful endpoints with proper error handling and security measures, forming a robust foundation for a modern transportation platform. Ride Booking App Project Structure

https://i.ibb.co.com/bRg1kcnd/ride-app-folder-structure.png

🚀 Features

🔐 Authentication & Authorization with JWT & OAuth (Google login)

👥 Role-based Access Control (Rider, Driver, Admin)

🚕 Ride Lifecycle Management (request → accept → complete/cancel)

💵 Fare Estimation & Configurable Pricing

📊 Analytics Dashboard with ride & earnings stats

⚡ Scalable Modular Design with clear separation of concerns

🛡 Production Ready – validation, error handling, logging, rate limiting

⚙️ Installation
# Clone repository
git clone https://github.com/zeroxiru/ride_booking_api_bck.git

# Navigate
cd ride-booking-app

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Run development server
npm run dev

🔑 Environment Variables

Update your .env file with:

PORT=9000
MONGO_URI=mongodb://localhost:27017/ride_booking
JWT_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

📡 API Endpoints
🔐 Auth (/api/v1/auth)

POST /auth/login – User login

POST /auth/refresh-token – Refresh JWT

POST /auth/logout – Logout

POST /auth/reset-password – Reset password

GET /auth/google – Google OAuth login

GET /auth/google/callback – OAuth callback

<details> <summary>Sample: Login</summary>
{
  "email": "user@example.com",
  "password": "password123"
}

</details>
👥 Users (/api/v1/users)

POST /users/register – Register user

GET /users/all-users – List all users

PATCH /users/:id – Update user

<details> <summary>Sample: Register</summary>
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "role": "rider"
}

</details>
🚖 Rider (/api/v1/rider)

POST /rider/request – Request ride

GET /rider/rides/history – Ride history

<details> <summary>Sample: Ride Request</summary>
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

</details>
🚕 Ride (/api/v1/rides)

PATCH /rides/:rideId/cancel – Cancel ride

POST /rides/:rideId/feedback – Submit feedback

GET /rides/:rideId/rejections – View rejections

💰 Fare (/api/v1/fares)

POST /fares/estimate – Estimate fare

GET /fares/configurations – View fare configs

PATCH /fares/configurations – Update fare configs

🧑‍✈️ Driver (/api/v1/driver)

PATCH /driver/availability – Update availability

PATCH /driver/rides/:rideId/accept – Accept ride

PATCH /driver/rides/:rideId/status – Update ride status

GET /driver/profile – View profile

PATCH /driver/profile – Update profile

GET /driver/earnings – View earnings

📊 Analytics (/api/v1/analytics)

GET /analytics/dashboard – Dashboard data

GET /analytics/rides/stats – Ride statistics

🛠 Admin (/api/v1/admin)

GET /admin/users – List all users

PATCH /admin/users/:userId/block – Block user

PATCH /admin/drivers/:driverId/approve – Approve driver

GET /admin/rides – List rides

GET /admin/reports/summary – Reports summary



Key Architecture Principles:
1. Modular Design
Feature-based organization - Each business capability in its own module

Separation of concerns - Clear boundaries between layers

Independent development - Teams can work on different modules

2. Scalable Structure
Horizontal scaling - Modules can be deployed independently

Database per service - Potential for microservices migration

API gateway ready - Clean endpoint organization

3. Maintainability
Consistent patterns - Same structure across all modules

Centralized config - Easy environment management

Comprehensive testing - Built-in test organization

4. Production Ready
Error handling - Global error management

Logging - Structured logging throughout

Security - Auth middleware and validation layers

Performance - Caching and optimization ready

Module Responsibilities:
Auth: User authentication, session management, OAuth flows

User: User profiles, registration, account management

Rider: Ride requests, booking, ride history

Driver: Driver profiles, ride acceptance, availability

Ride: Core ride logic, status updates, real-time tracking

Fare: Pricing calculations, surge pricing, fare estimates

Analytics: Business intelligence, reports, dashboard data
