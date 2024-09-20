import passport, { use } from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import dotenv from "dotenv";
import { User } from "../types";
import { createUser, findUserByEmail, findUserById } from "../models/user";

dotenv.config();

// JWT strategy configuration
const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET!,
};

passport.use(
  new JwtStrategy(opts, async (jwtPayload, done) => {
    try {
      // Find user by ID from the JWT payload
      const user = await findUserById(jwtPayload.id);

      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (err) {
      return done(err, false);
    }
  })
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      const { id, displayName, emails } = profile;
      const email = emails![0].value;
      try {
        const user = await findUserByEmail(email);
        console.log(refreshToken);
        if (!user) {
          const newUser = await createUser(
            id,
            email,
            displayName,
            refreshToken
          );
          done(null, {
            user: newUser.rows[0],
            googleTokens: {
              accessToken,
              refreshToken,
            },
          });
        }

        done(null, {
          user,
          googleTokens: {
            accessToken,
            refreshToken,
          },
        });
      } catch (error) {
        done(error as Error);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  const sessionUser = {
    id: user.id,
    email: user.email,
    accessToken: user.accessToken,
    refreshToken: user.refreshToken,
  };
  done(null, sessionUser);
});

// Deserialize user from the session
passport.deserializeUser((sessionUser: User, done) => {
  done(null, sessionUser);
});

export default passport;
