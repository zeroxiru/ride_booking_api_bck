import passport from "passport";
import { Strategy as GoogleStrategy, Profile, VerifyCallback} from "passport-google-oauth20";
import { envVars } from "./env";
import { User } from "../modules/user/user.model";
import { Role } from "../modules/user/user.interface";

passport.use(
    new GoogleStrategy(
        {
            clientID: envVars.GOOGLE_CLIENT_ID,
            clientSecret: envVars.GOOGLE_CLIENT_SECRET,
            callbackURL: envVars.GOOGLE_CALLBACK_URL
        }, async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
            try {
                const email =  profile.emails?.[0].value
                if(!email) { 
                    return done(null, false, {message: "No Email Found"})
                }
                let user =  await User.findOne({email})

                if(!user){ 
                    user =  await User.create({ 
                        email,
                        name: profile.displayName,
                        picture: profile.photos?.[0].value,
                        isVerified: true,
                        role: Role.USER,
                        auths: [{ 
                            provider : "google",
                            providerId: profile.id
                        }]
                    })
                }
                return done(null, user, {message: " User created Successfully"})
            } catch (error) {
                console.log( "Google startegy Error", error);
                return done(error)
                
            }
        }
        
    )
)

// frontend localhost:5173 -> http://localhost:8000/api/v1/auth/google -> passport -> google oauth consent ->
// gmail login -> successful ->callback url:  http://localhost:8000/api/v1/auth/google/callback

//Bridge == Google -> user db store -> token
// Custom -> email, password, role: User, name... -> registration -> DB ->  1 User create
// Google ->  req -> google -> successful : JWt  token: Role, email ->  DB -store -> token - api access

// eslint-disable-next-line @typescript-eslint/no-explicit-any
passport.serializeUser((user: any, done: (err: any, id?: unknown) => void)=>{ 
    done(null, user._id)
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
passport.deserializeUser(async (id: string, done: any)=> { 
    try {
        const user = await User.findById(id)
        done(null, user)
    } catch (error) {
        console.log(error);
        done(error)
    }
})