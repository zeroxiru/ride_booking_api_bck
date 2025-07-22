import passport from "passport";
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import { envVars } from "./env";
import { User } from "../modules/user/user.model";
import { Role } from "../modules/user/user.interface";
import AppError from "../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import bcryptjs from "bcryptjs";

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email: string, password: string, done) => {
      try {
        const isUserExist = await User.findOne({ email });
        if (!isUserExist) {
          return done(null, false, { message: "User does not exist" });
        }

        if (!isUserExist) {
          throw new AppError(httpStatus.BAD_REQUEST, "Email does not Exist");
        }
        
        const isGoogleAuthenticated =  isUserExist.auths.some(providerObjects => 
            providerObjects.provider == 'google')

            if(isGoogleAuthenticated){
                return done(null, false, { message: `You have authenticated through Google. so 
                    if you want to login with credentials, then at first login with google and set a paaword
                    for your gmail and then you can login with email and pasword`})
            }
        const isPasswordMatched = await bcryptjs.compare(
          password as string,
          isUserExist.password as string
        );

        if (!isPasswordMatched) {
          return done(null, false, { message: "password does not matched" });
        }

        return done(null, isUserExist, {})
      } catch (error) {
        console.log("Google Strategy Error", error);
        done(error);
      }
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: envVars.GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET,
      callbackURL: envVars.GOOGLE_CALLBACK_URL,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback
    ) => {
      try {
        const email = profile.emails?.[0].value;
        if (!email) {
          return done(null, false, { message: "No Email Found" });
        }
        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            email,
            name: profile.displayName,
            picture: profile.photos?.[0].value,
            isVerified: true,
            role: Role.USER,
            auths: [
              {
                provider: "google",
                providerId: profile.id,
              },
            ],
          });
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
