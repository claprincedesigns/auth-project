const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true // Removes whitespace before or after
    },
    name: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    favoriteBook: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    }
});
// authenticate input against database documents
UserSchema.statics.authenticate = (email, password, callback) => {
  User.findOne({email:email})
      .exec((error, user) => {
        if (error) {
            return callback(error);
        } else if (!user) {
            const err = new Error('User not found.');
            err.status = 401;
            return callback(err);
        }
        bcrypt.compare(password, user.password, (error, result) => {
            if (result === true) {
                return callback(null, user);
            } else {
                return callback();
            }
        })
      })
};
// hash password before saving to the database
UserSchema.pre('save', function(next) {
    const user = this;
    bcrypt.hash(this.password, 10, (err, hash) => {
        if(err) {
            return next(err);
        }
        user.password = hash;
        next();
    })
});

const User = mongoose.model('User', UserSchema);
module.exports = User;