const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { config } = require('./index');
const User = require('../models/user.model');

const setupPassport = () => {
  // We don't use sessions — only JWT. So we keep these minimal.
  // passport.serializeUser((user, done) => done(null, user.id));
  // passport.deserializeUser(async (id, done) => {
  //   const user = await User.findById(id);
  //   done(null, user);
  // });

  // Skip Google strategy if credentials aren't configured
  if (!config.google.clientId) {
    console.warn('⚠️  Google OAuth not configured — skipping');
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: config.google.clientId,
        clientSecret: config.google.clientSecret,
        callbackURL: config.google.callbackUrl,
        scope: ['profile', 'email'],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase();
          if (!email) return done(new Error('No email from Google'), null);

          
          // Check if user already exists (by Google ID or email)
          let user = await User.findOne({ googleId: profile.id });
          if (!user) user = await User.findOne({ email });

          if (user) {
            // Link Google to existing account if not already linked
            if (!user.googleId) {
              user.googleId = profile.id;
             // user.provider = 'google';
              user.isEmailVerified = true;
              await user.save({ validateBeforeSave: false });
            }
            return done(null, user);
          }

          // Create a brand new user from Google profile
          user = await User.create({
            name: profile.displayName,
            email,
            provider: 'google',
            googleId: profile.id,
            isEmailVerified: true, // Google already verified their email
          });

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
};

module.exports = setupPassport;
