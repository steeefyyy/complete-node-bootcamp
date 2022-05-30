const crypto = require('crypto');
const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'User must have a name'],
    maxlength: [40, 'A user name must have less or equal than 40 characters'],
    minlength: [5, 'A user name must have more or equal than 5 characters'],
  },
  email: {
    type: String,
    required: [true, 'User must have an email'],
    unique: true,
    maxlength: [40, 'An email must have less or equal than 40 characters'],
    minlength: [5, 'An email must have more or equal than 5 characters'],
    lowercase: true,
    validate: [validator.isEmail, 'Email must be correct'],
  },
  photo: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'A user must have a pwd'],
    minlength: [8],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'A tour must have a pwd'],
    validate: {
      validator: function (el) {
        // this only works on SAVE (not updating)
        return el === this.password;
      },
      message: 'Please enter the same password',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

userSchema.pre('save', async function (next) {
  // only run if pwd was indeed modified
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// instance method - will be available on all documents of certain collection, defined on user schema
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  //"this" in instance method points to current document
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  // not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  // we need to encrypt it in case anyone gets access to DB, never storage data PLAIN
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // millis
  return resetToken;
};
const User = mongoose.model('User', userSchema); //uppercase model names
module.exports = User;
