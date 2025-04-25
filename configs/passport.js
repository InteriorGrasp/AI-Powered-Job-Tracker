require("dotenv").config();
const passport = require("passport");
const axios = require('axios');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const User = require("../models/user");

// Local Strategy for Login
passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log("Login failed: User not found");
      return done(null, false, { message: "Invalid email or password" });
    }

    console.log("User found:", user.email);

    if (user.password !== password) {
      console.log("Login failed: Password does not match");
      return done(null, false, { message: "Invalid email or password" });
    }

    console.log("Login successful");
    return done(null, user);

  } catch (err) {
    console.error("Error during login:", err);
    return done(err);
  }
}));

// Serialize User to Store in Session
passport.serializeUser((user, done) => {
  done(null, user.id); // Store the user's ID in session
});

// Deserialize User from Session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user); // User found, store in session
  } catch (err) {
    done(err, null);
  }
});

// Google Strategy for OAuth
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ email: profile.emails[0].value });
    if (!user) {
      user = await User.create({
        googleId: profile.id,
        name: profile.displayName, 
        email: profile.emails[0].value,
        profilePicture: profile.photos[0].value,
        provider: "google", 
      });
      
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// GitHub Strategy for OAuth
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Fetch email using GitHub API if not in profile
    let email = null;
    if (!profile.emails || profile.emails.length === 0) {
      const response = await axios.get('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      email = response.data.find(email => email.primary).email;
    } else {
      email = profile.emails[0].value;
    }

    // Check if the user already exists by email or githubId
    let user = await User.findOne({ $or: [{ githubId: profile.id }, { email: email }] });

    if (!user) {
      // If no user exists, create a new one
      user = await User.create({
        githubId: profile.id,
        name: profile.displayName,
        email: email,
        provider: "github",
      });
    }
    
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

module.exports = passport;
