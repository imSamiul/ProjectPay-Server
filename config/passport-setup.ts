import passport, { Profile } from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../src/models/user.model';

// google strategy
passport.use(
  new GoogleStrategy(
    {
      // options for the google strategy
      callbackURL: '/api/auth/google/redirect',
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done
    ) => {
      try {
        if (!profile.emails || profile.emails.length === 0) {
          return done(new Error('No email found in the Google profile'));
        }

        // Extract the email
        const email = profile.emails[0]?.value;

        // Check if user exists with this email (either Google or normal signup)
        const existingUser = await User.findOne({
          $or: [{ email }, { googleId: profile.id }],
        });

        if (existingUser) {
          if (!existingUser.googleId) {
            return done(new Error('User already exists with this email'));
          }
          return done(null, existingUser);
        }
        // Create a new user
        const newUser = new User({
          googleId: profile.id,
          email: email,
          userName: profile.displayName,
          avatar: profile.photos?.[0]?.value,
          role: 'pending',
        });
        await newUser.save();
        return done(null, newUser);
      } catch (error) {
        return done(error, undefined);
      }
    }
  )
);
