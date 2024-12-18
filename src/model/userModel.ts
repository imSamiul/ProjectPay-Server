import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserType, UserMethodsType, UserModelType } from '../types/userType';

// Define base UserType schema
const userSchema = new mongoose.Schema<
  UserType,
  UserModelType,
  UserMethodsType
>(
  {
    name: {
      type: String,
      required: true,
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
      required: true,
      minlength: 6,
      trim: true,
      validate: (value: string) => {
        if (validator.contains(value.toLowerCase(), 'password')) {
          throw new Error('Password cannot contain "password"');
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    phone: {
      type: String,
      required: true,
      trim: true,
    },
  },

  {
    discriminatorKey: 'userType',
    timestamps: true,
  }
);

userSchema.pre('save', async function hashPassword(next) {
  // this gives to individual UserType that i will save
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8);
  }

  next();
});
userSchema.methods.generateAuthToken = async function generateAuthToken() {
  // ... rest of your logic to generate and store the token (uncommented)
  const secretKey = process.env.JWT_TOKEN;
  if (!secretKey) {
    throw new Error('Secret key is not provided');
  }
  const token = jwt.sign({ id: this.id.toString() }, secretKey);
  this.tokens = this.tokens.concat({ token });
  await this.save();
  return token;
};

userSchema.methods.toJSON = function toJSON() {
  const userObject: Partial<UserType> = this.toObject();

  delete userObject.password;
  delete userObject.tokens;

  return userObject;
};

// Static method to find user by credentials
userSchema.statics.findByCredentials = async function (
  email: string,
  password: string
) {
  const foundUser = await this.findOne({ email });
  if (!foundUser) {
    throw new Error('Email is incorrect');
  }
  const isMatch = await bcrypt.compare(password, foundUser.password);
  if (!isMatch) {
    throw new Error(' Password is incorrect');
  }

  return foundUser;
};

// Create the base model
const User = mongoose.model<UserType, UserModelType>('User', userSchema);

export default User;
