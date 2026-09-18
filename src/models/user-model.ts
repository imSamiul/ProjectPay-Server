import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserType, UserMethodsType, UserModelType } from "../types/user-type";

const MAX_TOKENS = 5;
const JWT_EXPIRES_IN = "7d";

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
          throw new Error("Email is invalid");
        }
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      trim: true,
      validate: (value: string) => {
        if (validator.contains(value.toLowerCase(), "password")) {
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
    discriminatorKey: "userType",
    timestamps: true,
  },
);

userSchema.pre("save", async function hashPassword(next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

userSchema.methods.generateAuthToken = async function generateAuthToken() {
  const secretKey = process.env.JWT_TOKEN;
  if (!secretKey) {
    throw new Error("Secret key is not provided");
  }

  const token = jwt.sign({ id: this.id.toString() }, secretKey, {
    expiresIn: JWT_EXPIRES_IN,
  });

  this.tokens = this.tokens.concat({ token });
  if (this.tokens.length > MAX_TOKENS) {
    this.tokens = this.tokens.slice(-MAX_TOKENS);
  }

  await this.save();
  return token;
};

userSchema.methods.toJSON = function toJSON() {
  const userObject: Partial<UserType> = this.toObject();
  delete userObject.password;
  delete userObject.tokens;
  return userObject;
};

userSchema.statics.findByCredentials = async function (
  email: string,
  password: string,
) {
  const foundUser = await this.findOne({ email });
  if (!foundUser) {
    throw new Error("Email is incorrect");
  }
  const isMatch = await bcrypt.compare(password, foundUser.password);
  if (!isMatch) {
    throw new Error(" Password is incorrect");
  }
  return foundUser;
};

const User = mongoose.model<UserType, UserModelType>("User", userSchema);

export default User;
