/* eslint-disable @typescript-eslint/no-unused-vars */
import { envVars } from "../config/env"
import { IAuthProvider, IUser, Role } from "../modules/user/user.interface";
import bcryptjs from "bcryptjs"
import { User } from "../modules/user/user.model";

export const seedSuperAdmin = async () => { 
try {
    
    const isSuperAdminExist =  await User.findOne({email: envVars.SUPER_ADMIN_EMAIL})
    if(isSuperAdminExist){ 
        console.log("Super Admin Already Exists");
        return;
    }
    console.log("Trying to create Super Admin");
    const hashPassword = await bcryptjs.hash(envVars.SUPER_ADMIN_PASSWORD, Number(envVars.BCRYPT_SALT_ROUND))
    
    const authProvider: IAuthProvider = { 
        provider: "credentials",
        providerId: envVars.SUPER_ADMIN_EMAIL
    }
    
    const payload: IUser = { 
        name:"Super admin",
        role: Role.SUPER_ADMIN,
        email:envVars.SUPER_ADMIN_EMAIL,
        password: hashPassword,
        phone: "+8801000000000",
        isVerified: true,
        auths: [authProvider]
    }

    const superAdmin =  await User.create(payload)
    console.log("Super Admin Created Successfully");

} catch (error) {
      console.error("❌ Failed to create Super Admin:", error);
    process.exit(1); // Exit if seeding fails
}
}