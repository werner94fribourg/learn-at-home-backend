const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcryptjs');
const { createLinkToken } = require('../utils/utils');
const { PASSWORD_VALIDATOR } = require('../utils/globals');

const validatePassword = value => PASSWORD_VALIDATOR.validate(value);

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide your email.'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: [isEmail, 'Please provide a valid email address.'],
  },
  username: {
    type: String,
    required: [true, 'Please provide your username.'],
    unique: true,
    trim: true,
    lowercase: true,
    maxLength: [30, 'An username must have less or equal than 30 characters.'],
    minLength: [4, 'A username must have at least 4 characters.'],
  },
  firstname: {
    type: String,
    required: [true, 'Please provide your first name.'],
    trim: true,
    minLength: [2, 'A first name must have at least 2 characters.'],
  },
  lastname: {
    type: String,
    required: [true, 'Please provide your last name.'],
    trim: true,
    minLength: [2, 'A last name must have at least 2 characters.'],
  },
  photo: {
    type: String,
    trim: true,
    default: 'https://learnathome.blob.core.windows.net/public/default.jpg',
  },
  password: {
    type: String,
    required: [true, 'Please provide your password.'],
    validate: [validatePassword, 'Please provide a valid password.'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password.'],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: 'Passwords are not the same.',
    },
  },
  role: {
    type: String,
    enum: ['admin', 'teacher', 'student'],
    default: 'student',
  },
  isConfirmed: {
    type: Boolean,
    default: false,
    select: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
    select: false,
  },
  deletedAt: {
    type: Date,
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
  confirmationToken: {
    type: String,
    select: false,
  },
  confirmationExpires: {
    type: Date,
    select: false,
  },
  passwordChangedAt: {
    type: Date,
    select: false,
  },
  passwordResetToken: {
    type: String,
    select: false,
  },
  passwordResetExpires: {
    type: Date,
    select: false,
  },
  contacts: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      select: false,
    },
  ],
  invitations: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      select: false,
    },
  ],
  supervisor: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    select: false,
  },
  supervised: {
    type: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  if (this.password && this.isModified('password'))
    this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;

  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) {
    next();
    return;
  }

  this.passwordChangedAt = Date.now() - 1000; // 1 s in past ensures the token was always created after the password has been changed

  next();
});

userSchema.pre(/^find/, function (next) {
  if (!this.options.disableMiddlewares) this.find({ isDeleted: { $ne: true } });

  next();
});

userSchema.methods.createConfirmToken = function () {
  const [confirmToken, hashedConfirmToken] = createLinkToken();
  this.confirmationToken = hashedConfirmToken;

  this.confirmationExpires = Date.now() + 10 * 24 * 60 * 60 * 1000;

  return confirmToken;
};

userSchema.methods.createPasswordResetToken = function () {
  const [resetToken, hashedResetToken] = createLinkToken();
  this.passwordResetToken = hashedResetToken;

  this.passwordResetExpires = Date.now() + 24 * 60 * 60 * 1000;

  return resetToken;
};

userSchema.methods.correctPassword = async (candidatePassword, userPassword) =>
  await bcrypt.compare(candidatePassword, userPassword);

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
