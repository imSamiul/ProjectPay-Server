import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';

import { UserType, UserMethodsType, UserModelType } from '../types/userType';

// Define base UserType schema
const userSchema = new mongoose.Schema<
  UserType,
  UserModelType,
  UserMethodsType
>(
  {
    userName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
      validate: (value: string) => {
        if (!validator.isEmail(value)) {
          throw new Error('Email is invalid');
        }
      },
    },
    password: {
      type: String,
      minlength: 6,
      trim: true,
      validate: (value: string) => {
        if (validator.contains(value.toLowerCase(), 'password')) {
          throw new Error('Password cannot contain "password"');
        }
      },
    },
    role: {
      type: String,
    },
    googleId: {
      type: String,
    },
    avatar: {
      type: String,
      data: String,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function hashPassword(next) {
  // this gives to individual UserType that i will save
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  next();
});

// Create the base model
const User = mongoose.model<UserType, UserModelType>('User', userSchema);

export default User;
