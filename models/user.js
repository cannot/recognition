const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

var UserSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
    trim: true
  },
  lastname: {
    type: String,
    required: true,
    trim: true
  },  
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  },
  resetToken: String,
  resetTokenExpire: Date,
  loginAttempts: {
    type: Number,
    required: true
  },
  lockUntil: {
    type: Number
  },
  role: {
    type: Number
  },
  usertype: {
    type: String,
    required: true,
    trim: true
  }
});

  //authenticate input against database
UserSchema.statics.authenticate = function (email, password, callback) {
  
  User.findOne({ email: email })
    .exec(function (err, user) {

      
      bcrypt.genSalt(SALT_ROUNDS,  (err, salt) => {
        if (err) next(err); 
        bcrypt.hash(password, salt, function (err, hash) {
          if (err) return next(err);
          //console.log('password', password);
        })
      });

      if (err) {
        return callback(err)
      } else if (!user) {
        var err = new Error('User not found.');
        err.status = 401;
        return callback(err);
      }

      //console.log(user);

      // Check if the password was match from the database
      bcrypt.compare(password, user.password, function (err, result) {
        /* if (result === true) {
          return callback(null);
        } */
        if (err) { throw (err); }
        return callback(user);
      })
      
      /* bcrypt.hash(password, SALT_ROUNDS, function(err, hash) {
        if (err) { throw (err); }
        console.log(user.password + "   " + hash);
        bcrypt.compare(password, user.password, function(err, result) {
            if (err) { throw (err); }
            return callback(null);
        });
      }); */
    });
}

// Hashing a password before saving it to the database
UserSchema.pre('save', function (next) {
  var user = this;
  bcrypt.genSalt(SALT_ROUNDS,  (err, salt) => {
    if (err) next(err); 
    bcrypt.hash(user.password, SALT_ROUNDS, function (err, hash) {
      if (err) return next(err);
      user.password = hash;
     next();
    })
  });
});


var User = mongoose.model('User', UserSchema);
module.exports = User;
