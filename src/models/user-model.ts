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
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      lowercase: true,
      validate: (value: string) => {
        if (value && !validator.isEmail(value)) {
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
      trim: true,
      unique: true,
      sparse: true,
    },
  },
  {
    discriminatorKey: "userType",
    timestamps: true,
  },
);

userSchema.pre("validate", function requireIdentifier(next) {
  if (!this.email && !this.phone) {
    next(new Error("Either email or phone is required"));
    return;
  }
  next();
});

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
  identifier: string,
  password: string,
) {
  const foundUser = await this.findOne({
    $or: [{ email: identifier.toLowerCase() }, { phone: identifier }],
  });
  if (!foundUser) {
    throw new Error("Invalid credentials");
  }
  const isMatch = await bcrypt.compare(password, foundUser.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }
  return foundUser;
};

const User = mongoose.model<UserType, UserModelType>("User", userSchema);

export default User;
