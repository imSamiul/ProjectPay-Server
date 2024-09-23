import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { IUser, IUserMethods, UserModel } from '../interfaces/userDocumentType';

// Define base user schema
const userSchema = new mongoose.Schema<IUser, UserModel, IUserMethods>(
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
  // this gives to individual user that i will save
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
  const userObject: Partial<IUser> = this.toObject();

  delete userObject.password;
  delete userObject.tokens;

  return userObject;
};

// Static method to find user by credentials
userSchema.statics.findByCredentials = async function (
  email: string,
  password: string
) {
  const user = await this.findOne({ email });
  if (!user) {
    throw new Error('Email or password is incorrect');
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Email or password is incorrect');
  }

  return user;
};

// Create the base model
const User = mongoose.model<IUser, UserModel>('User', userSchema);

export default User;
