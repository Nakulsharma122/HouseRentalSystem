const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/user');

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID, 
    clientSecret: process.env.CLIENT_SECRET, 
    callbackURL: "http://localhost:8080/auth/google/callback",
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Find user by Google ID
      let user = await User.findOne({ googleId: profile.id });

      if (!user) {
        // If no user found with Google ID, find user by email
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // If user found with email, update the user with Google ID
          user.googleId = profile.id;
          user.signupMethod = 'google';
          await user.save();
        } else {
          // If no user found with email, create a new user
          user = new User({
            username: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            signupMethod: 'google'
          });
          await user.save();
        }
      }
      return done(null, user);
    } catch (err) {
      return done(err, false, { message: 'An error occurred during authentication' });
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, false);
  }
});

module.exports = passport;
