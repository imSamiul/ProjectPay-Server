import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as LocalStrategy } from 'passport-local';
import User from '../src/models/user.model';
import { UserType } from '../src/types/userType';

passport.serializeUser((user: Express.User, done) => {
  done(null, (user as UserType)._id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      // options for the google strategy
      callbackURL: '/auth/google/redirect',
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile,
      done: (err: Error | null, user?: UserType) => void
    ) => {
      // passport callback function
      // check if user already exists in our db
      const existingUser = await User.findOne({ googleId: profile.id });
      if (existingUser) {
        done(null, existingUser);
        return;
      }
      // if not, create user in our db
      const newUser = new User({
        name: profile.displayName,
        googleId: profile.id,
        email: profile.emails ? profile.emails[0].value : '',
        photo: profile.photos ? profile.photos[0].value : '',
      });

      const savedUser = await newUser.save();
      if (savedUser) {
        console.log('new user created: ', newUser);
        done(null, newUser);
      } else {
        done(new Error('User could not be saved'));
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
