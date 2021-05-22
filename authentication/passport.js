const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

// Load User model
const User = require('../models/User');

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ username: 'username' }, (username, password, done) => {
      // Match user
      User.findOne({
        username: username
      },(err, foundUser) => {
        if (err)
          console.log(err);
        else {
          if (foundUser) {
            bcrypt.compare(password, foundUser.password, function(e, result) {
              if (result === true) {
                return done(null, foundUser);
              }
              else
                return done(null, false);
            });
          } else {
            return done(null, false);
          }
        }
      })
    })
  );
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(null, user);
    });
  });
};
