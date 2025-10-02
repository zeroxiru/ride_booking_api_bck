/* eslint-disable @typescript-eslint/no-explicit-any */
import passport from "passport";
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import { envVars } from "./env";
import { User } from "../modules/user/user.model";
import { Role, UserStatus } from "../modules/user/user.interface";
import bcryptjs from "bcryptjs";
import { IDriverProfile } from "../modules/driver/driver.interface";

// passport.use(
//   new LocalStrategy(
//     {
//       usernameField: "email",
//       passwordField: "password",
//     },
//     async (email: string, password: string, done) => {
//       try {
//         const isUserExist = await User.findOne({ email })
//         .populate('riderProfile')
//         .populate('driverProfile');

//         if (!isUserExist) {
//           return done(null, false, { message: "User does not exist" });
//         }
//         //  if (!isUserExist) {
//         //   return done("User does not exist" );
//         // }
//           if (!isUserExist.isVerified) {
//                 // throw new AppError(httpStatus.BAD_REQUEST, "User is not verified")
//                 return done("User is not verified")
//             }

//             if (isUserExist.status === UserStatus.BLOCKED || isUserExist.status === UserStatus.INACTIVE) {
//                 // throw new AppError(httpStatus.BAD_REQUEST, User is ${isUserExist.isActive})
//                 return done(`User is ${isUserExist.status}`)
//             }
//             if (isUserExist.isDeleted) {
//                 // throw new AppError(httpStatus.BAD_REQUEST, "User is deleted")
//                 return done("User is deleted")
//             }

      

//         const isGoogleAuthenticated = isUserExist.auths?.some((providerObjects) => providerObjects.provider == "google"
//         );

//         // if (isGoogleAuthenticated) {
//         //   return done(null, false, {
//         //     message:
//         //       "You have authenticated through Google. so" +
//         //       "if you want to login with credentials, then at first login with google and set a paaword" +
//         //       "for your gmail and then you can login with email and pasword",
//         //   });
//         // }


//              if (isGoogleAuthenticated && !isUserExist.password ) {
//           return done(
//               "You have authenticated through Google. so" +
//                " if you want to login with credentials, then at first login with google and set a paaword" +
//                " for your gmail and then you can login with email and pasword",
//           );
//         }
//         const isPasswordMatched = await bcryptjs.compare(
//           password as string,
//           isUserExist.password as string
//         );

//         if (!isPasswordMatched) {
//           return done(null, false, { message: "password does not matched" });
//         }

//         return done(null, isUserExist);
//       } catch (error) {
//         console.log("Google Strategy Error", error);
//         done(error);
//       }
//     }
//   )
// );

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email: string, password: string, done) => {
      try {
        const user = await User.findOne({ email })
        .populate('driverProfile')
        .populate('riderProfile');
          
         console.log('🔍 User found:', user ? {
          id: user._id,
          email: user.email,
          role: user.role,
          driverProfile: user.driverProfile,
          riderProfile: user.riderProfile
        } : 'No user found');
        if (!user) {
          return done(null, false, { message: "User does not exist" });
        }

        // Simplified verification check (riders are auto-verified)
        if (!user.isVerified) {
          // This will only affect drivers/admins who need manual verification
          return done(null, false, { message: "Account is not verified" });
        }

        // Common status checks for all users
        if (user.status === UserStatus.BLOCKED) {
          return done(null, false, { message: "Account is blocked" });
        }

        if (user.status === UserStatus.INACTIVE) {
          return done(null, false, { message: "Account is inactive" });
        }

        if (user.isDeleted) {
          return done(null, false, { message: "Account is deleted" });
        }

        // Driver-specific checks
        if (user.role === Role.DRIVER) {
        
          if (!user.driverProfile) {
                console.log('❌ Driver profile not found for user:', user.email);
            // return done(null, false, { message: "Driver profile not found" });
          } else {
const driverProfile = user.driverProfile as IDriverProfile;
              console.log('🔍 Driver profile approvalStatus:', driverProfile.approvalStatus);
          if (driverProfile.approvalStatus !== 'approved') {
            return done(null, false, { 
              message: `Driver account is ${driverProfile.approvalStatus}. Please wait for admin approval` 
            });
          }
     console.log('✅ Driver profile is approved');
          }

          
  
        }

        // Password validation for all users
        const isGoogleAuthenticated = user.auths?.some(
          (provider) => provider.provider === "google"
        );

        if (isGoogleAuthenticated && !user.password) {
          return done(null, false, {
            message: "Please use Google login or set a password first."
          });
        }

        if (!user.password) {
          return done(null, false, { message: "No password set for this account" });
        }

        const isPasswordMatched = await bcryptjs.compare(password, user.password);

        if (!isPasswordMatched) {
          return done(null, false, { message: "Password does not match" });
        }

        return done(null, user);
      } catch (error) {
        console.log("Local Strategy Error", error);
        return done(error);
      }
    }
  )
);
const callbackURL = process.env.NODE_ENV === 'production' 
  ? 'https://ridebookingapibck.vercel.app/api/v1/auth/google/callback'
  : 'http://localhost:9000/api/v1/auth/google/callback';

passport.use(
  new GoogleStrategy(
    {
      clientID: envVars.GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET,
      callbackURL:callbackURL,
      scope:['profile', 'email']
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback
    ) => {
      try {
        console.log('🔍 Google Profile:', profile);
        const email = profile.emails?.[0].value;
        if (!email) {
          return done(null, false, { message: "No Email Found" });
        }
        // let user = await User.findOne({ email });
          // Check if user exists by email or googleId
        let user = await User.findOne({ 
          $or: [
            { email },
            { 'auths.providerId': profile.id }
          ]
        });

        if (!user) {
          user = await User.create({
            email,
            name: profile.displayName,
            picture: profile.photos?.[0].value,
            isVerified: true,
           // role: Role.RIDER,
            auths: [
              {
                provider: "google",
                providerId: profile.id,
              },
            ],
          });
          console.log('✅ New user created:', user.email); 
        } else { 
           if (!user.auths) {
            user.auths = [];
          }
            // Update existing user with Google auth if not already linked
          const hasGoogleAuth = user.auths.some((auth: any) => auth.provider === 'google');
          if (!hasGoogleAuth) {
            user.auths.push({
              provider: "google",
              providerId: profile.id,
            });
            await user.save();
            console.log('✅ Google auth added to existing user:', user.email);
          }
        }
        return done(null, user, { message: " User created Successfully" });
      } catch (error) {
        console.log("Google startegy Error", error);
        return done(error);
      }
    }
  )
);

// frontend localhost:5173 -> http://localhost:8000/api/v1/auth/google -> passport -> google oauth consent ->
// gmail login -> successful ->callback url:  http://localhost:8000/api/v1/auth/google/callback

//Bridge == Google -> user db store -> token
// Custom -> email, password, role: User, name... -> registration -> DB ->  1 User create
// Google ->  req -> google -> successful : JWt  token: Role, email ->  DB -store -> token - api access

// eslint-disable-next-line @typescript-eslint/no-explicit-any
passport.serializeUser((user: any, done: (err: any, id?: unknown) => void) => {
  done(null, user._id);
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
passport.deserializeUser(async (id: string, done: any) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    console.log(error);
    done(error);
  }
});
