import passport from "passport";
import jwt from "jsonwebtoken";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import UserModel from "../models/UserModel.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL}/auth/google/callback`,
      passReqToCallback: true, // lets us access req inside the callback
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const googleEmail = profile.emails[0].value.toLowerCase();
        const googlePic = profile.photos?.[0]?.value || "";

        // Case 1: User is already logged in → they want to LINK their Google account
        if (req.user) {
          const user = await UserModel.findById(req.user.id);
          if (!user) return done(null, false, { message: "User not found" });

          if (user.googleId) {
            return done(null, false, {
              message: "Google account already linked",
            });
          }

          user.googleId = profile.id;
          user.authProvider = "both";
          if (!user.profilePic) user.profilePic = googlePic;
          await user.save();
          return done(null, user);
        }

        // Case 2: Google account already linked to an existing user → normal OAuth login
        const existingByGoogleId = await UserModel.findOne({
          googleId: profile.id,
        });
        if (existingByGoogleId) {
          return done(null, existingByGoogleId);
        }

        // Case 3 — email exists locally, need password to link
        const existingByEmail = await UserModel.findOne({ email: googleEmail });
        if (existingByEmail) {
          // Encode Google profile as a short-lived JWT instead of storing in session
          const pendingToken = jwt.sign(
            {
              googleId: profile.id,
              profilePic: googlePic,
              email: googleEmail,
            },
            process.env.JWT_SECRET,
            { expiresIn: "10m" }, // 10 minutes is plenty
          );
          req.pendingToken = pendingToken;
          return done(null, false, {
            message: "account_exists_link_required",
          });
        }

        // Case 4: Brand new user → create account
        const baseUname = googleEmail
          .split("@")[0]
          .replace(/[^a-zA-Z0-9_]/g, "_");
        let uname = baseUname;
        let counter = 1;
        while (await UserModel.findOne({ uname })) {
          uname = `${baseUname}_${counter++}`; // ensure unique username
        }

        const newUser = new UserModel({
          email: googleEmail,
          uname,
          googleId: profile.id,
          profilePic: googlePic,
          authProvider: "google",
          timestamp: new Date(),
        });
        await newUser.save();
        return done(null, newUser);
      } catch (err) {
        return done(err, null);
      }
    },
  ),
);

// We don't use sessions for user data (we use JWT),
// but passport still needs these implemented
passport.serializeUser((user, done) => done(null, user._id.toString()));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await UserModel.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
