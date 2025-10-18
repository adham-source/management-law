
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passport from 'passport';
import User, { IUser } from '../models/User.model';
import dotenv from 'dotenv';
import { JwtPayload } from 'jsonwebtoken';

dotenv.config();

// JWT Strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.ACCESS_TOKEN_SECRET || 'supersecret',
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload: JwtPayload, done) => {
    try {
      const user = (await User.findById(payload.id)) as IUser;
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  })
);

// Google OAuth 2.0 Strategy
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = process.env;

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_REDIRECT_URI || '/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            return done(null, user);
          }

          user = await User.findOne({ email: profile._json.email });

          if (user) {
            user.googleId = profile.id;
            await user.save();
            return done(null, user);
          }

          const newUser = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile._json.email,
            role: 'client',
          });

          return done(null, newUser);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );
  console.log('Google OAuth strategy configured.');
} else {
  console.warn('Google OAuth environment variables not set. Google login will be disabled.');
}

export default passport;
