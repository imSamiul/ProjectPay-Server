import passport, { Profile } from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as LocalStrategy } from 'passport-local';
import User from '../src/models/user.model';
import { UserType } from '../src/types/userType';

passport.serializeUser((user, done) => {
  done(null, (user as UserType)._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id); // Fetch user from database
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
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
      // passport callback function
      // check if user already exists in our db
      console.log(profile);

      try {
        if (!profile.emails || profile.emails.length === 0) {
          return done(
            new Error('No email found in the Google profile'),
            undefined
          );
        }

        // Extract the email
        const email = profile.emails[0]?.value;

        const existingUser = await User.findOne({ googleId: profile.id });
        if (!existingUser) {
          const newUser = new User({
            googleId: profile.id,
            email: email,
            userName: profile.displayName,
          });
          await newUser.save();
          return done(null, newUser);
        }
        return done(null, existingUser);
      } catch (error) {
        return done(error, undefined);
      }
    }
  )
);

passport.use(
  new LocalStrategy({ usernameField: 'email' }, async function (
    email,
    password,
    done
  ) {
    try {
      const user = await User.findOne({ email: email });
      if (!user) {
        return done(null, false, { message: 'User not found' });
      }
      const loginSuccessful = await User.findByCredentials(email, password);
      if (!loginSuccessful) {
        return done(null, false, { message: 'Incorrect credentials' });
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);
