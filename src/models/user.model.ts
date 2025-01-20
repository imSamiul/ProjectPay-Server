import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env;

import Token from './token.model';
import { User, UserMethods, UserModel } from '../types/user.type';
import { TToken } from '../types/token.type';
import ms from 'ms';

// Define base UserType schema
const userSchema = new mongoose.Schema<User, UserModel, UserMethods>(
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
      enum: ['project_manager', 'client'],
      required: true,
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
    discriminatorKey: 'role',
  }
);

const REFRESH_TOKEN_LIFE = process.env.REFRESH_TOKEN_LIFE ?? '7d';
const ACCESS_TOKEN_LIFE = process.env.ACCESS_TOKEN_LIFE ?? '10m';

userSchema.method('createAccessToken', async function createAccessToken() {
  try {
    const { _id, role } = this;
    const accessToken = jwt.sign(
      { user: { _id, role } },
      ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: ACCESS_TOKEN_LIFE,
      }
    );
    return accessToken;
  } catch (error) {
    console.error(error);
    return;
  }
});
userSchema.method('createRefreshToken', async function createRefreshToken() {
  try {
    const { _id, role } = this;
    const refreshToken = jwt.sign(
      { user: { _id, role } },
      REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: process.env.REFRESH_TOKEN_LIFE,
      }
    );
    const token = new Token<TToken>({
      userId: _id,
      refreshToken: refreshToken,
      expirationTime: new Date(Date.now() + ms(REFRESH_TOKEN_LIFE)),
    });
    await token.save();
    return refreshToken;
  } catch (error) {
    console.error(error);
    return;
  }
});

//pre save hook to hash password before saving user into the database:
userSchema.pre('save', async function (next) {
  if (this.password && (this.isModified('password') || this.isNew)) {
    try {
      const salt = await bcrypt.genSalt(12); // generate hash salt of 12 rounds
      const hashedPassword = await bcrypt.hash(this.password, salt); // hash the current user's password
      this.password = hashedPassword;
    } catch (error) {
      console.error(error);
    }
  }
  return next();
});

// delete password field from user object before sending it to the client
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Create the base model
const UserModel = mongoose.model<User, UserModel>('User', userSchema);

export default UserModel;
