import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import pool from "./database";
import dotenv from 'dotenv';
import { User } from "../types";

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
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [jwtPayload.id]);
      const user = result.rows[0];

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
  new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: "/auth/google/callback",
  }, async (accessToken, refreshToken, profile, done) => {
    const { id, displayName, emails } = profile;
    const email = emails![0].value;
    try {
      const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      if (user.rows.length === 0) {
        const newUser = await pool.query("INSERT INTO users (google_id, name, email) VALUES ($1, $2, $3) RETURNING *", 
          [id, displayName, email]
        );
        done(null, { 
          user: newUser.rows[0], 
          googleTokens: { 
            accessToken, 
            refreshToken, 
          }
        });
      }
      done(null, {
        user: user.rows[0],
        googleTokens: {
          accessToken,
          refreshToken,
        }
      });
    } catch (error) {
      done(error as Error);
    }
  }
));

passport.serializeUser((user: any, done) => {
  const sessionUser = {
    id: user.id,
    email: user.email,
    accessToken: user.accessToken,
    refreshToken: user.refreshToken
  };
  done(null, sessionUser);  
});

// Deserialize user from the session
passport.deserializeUser((sessionUser: User, done) => {
  done(null, sessionUser); 
});

export default passport;