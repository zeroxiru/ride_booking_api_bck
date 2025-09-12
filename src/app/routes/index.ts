import { Router } from "express"
import { UserRoutes } from "../modules/user/user.route"
import { AuthRoutes } from "../modules/auth/auth.route"
import  {RiderRoutes}  from "../modules/rider/rider.route"
import { RideRoutes } from "../modules/ride/ride.route"
import { DriverRoutes } from "../modules/driver/driver.route"
import { AdminRoutes } from "../modules/admin/admin.route";
import { FareRoutes } from "../modules/fare/fare.route"
import { AnalyticsRoutes } from "../modules/analytics/analytics.route"
// import { riderRoutes } from "../modules/rider/rider.route"

export const router = Router()
const moduleRoutes =[{
    path: "/user",
    route: UserRoutes
},
{ 
    path: "/auth",
    route: AuthRoutes
},
{ 
    path: "/rider",
    route: RiderRoutes
},
{ 
    path: "/ride",
    route: RideRoutes
},
{ 
    path: "/driver",
    route: DriverRoutes
},
{
  path: "/admin",
    route: AdminRoutes
},
{
  path: "/fare",
    route: FareRoutes
},
{
  path: "/analytics",
    route: AnalyticsRoutes
}
]

moduleRoutes.forEach((route) => { 
    router.use(route.path, route.route)
})