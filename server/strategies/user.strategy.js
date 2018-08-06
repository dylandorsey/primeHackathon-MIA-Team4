const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const encryptLib = require('../modules/encryption');
const Person = require('../models/Person');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  Person.findById(id).then((result) => {
    // Handle Errors
    const user = result;

    if (!user) {
      // user not found
      done(null, false, { message: 'Incorrect credentials.' });
    } else {
      // user found
      const userInfo = {
        username: user.username,
        _id: user._id,
      };
      
      console.log('user info: ', userInfo);
      
      done(null, userInfo);
    }
  }).catch((err) => {
    console.log('query err ', err);
    done(err);
  });
});

// Does actual work of logging in
passport.use('local', new LocalStrategy({
  passReqToCallback: true,
  usernameField: 'username',
}, ((req, username, password, done) => {
    Person.find({ username })
      .then((result) => {
        const user = result && result[0];
        if (user && encryptLib.comparePassword(password, user.password)) {
          // all good! Passwords match!
          done(null, user);
        } else if (user) {
          // not good! Passwords don't match!
          done(null, false, { message: 'Incorrect credentials.' });
        } else {
          // not good! No user with that name
          done(null, false);
        }
      }).catch((err) => {
        console.log('error', err);
        done(null, {});
      });
  })));

module.exports = passport;
