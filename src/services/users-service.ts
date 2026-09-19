import bcrypt from "bcrypt";
import Client from "../models/client-model";
import ProjectManager from "../models/manager-model";
import User from "../models/user-model";
import {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
} from "../utils/app-error";
import { UserType } from "../types/user-type";
import { generateClientKey } from "../utils/uuid-generator";

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  );
}

function toPublicUser(user: UserType) {
  return user.toJSON ? user.toJSON() : user;
}

async function generateUniqueClientKey(): Promise<string> {
  let key = generateClientKey();
  let attempts = 0;
  while (await Client.exists({ clientKey: key })) {
    key = generateClientKey();
    attempts += 1;
    if (attempts > 10) {
      throw new BadRequestError("Failed to generate a unique client key");
    }
  }
  return key;
}

export async function createUser(input: {
  name?: string;
  email?: string;
  phone?: string;
  password: string;
  userType: "client" | "project manager";
}) {
  const identifierFilters: Record<string, string>[] = [];
  if (input.email) {
    identifierFilters.push({ email: input.email.toLowerCase() });
  }
  if (input.phone) {
    identifierFilters.push({ phone: input.phone });
  }

  const existingUser = await User.findOne({ $or: identifierFilters });
  if (existingUser) {
    throw new ConflictError("Email or phone is already in use");
  }

  const baseFields = {
    name: input.name,
    email: input.email,
    phone: input.phone,
    password: input.password,
  };

  let newUser;
  if (input.userType === "client") {
    const clientKey = await generateUniqueClientKey();
    newUser = new Client({ ...baseFields, clientKey });
  } else {
    newUser = new ProjectManager(baseFields);
  }

  const token = await newUser.generateAuthToken();
  return { user: toPublicUser(newUser), token };
}

export async function loginUser(identifier: string, password: string) {
  try {
    const user = await User.findByCredentials(identifier, password);
    const token = await user.generateAuthToken();
    return { user: toPublicUser(user), token };
  } catch {
    throw new BadRequestError("Invalid credentials");
  }
}

export async function logoutUser(user: UserType, token: string) {
  const fullUser = await User.findById(user._id);
  if (!fullUser) {
    throw new UnauthorizedError();
  }

  const exists = fullUser.tokens.some((item) => item.token === token);
  if (!exists) {
    throw new BadRequestError("Token does not exist");
  }

  fullUser.tokens = fullUser.tokens.filter((item) => item.token !== token);
  await fullUser.save();
  return "Logged out successfully";
}

export function getUserDetails(user: UserType) {
  return { user: toPublicUser(user) };
}

export async function updateUserProfile(
  userId: string,
  input: { name?: string; phone?: string },
) {
  const updates: Record<string, string> = {};
  if (input.name) {
    updates.name = input.name;
  }
  if (input.phone) {
    updates.phone = input.phone;
  }

  if (Object.keys(updates).length === 0) {
    const user = await User.findById(userId);
    if (!user) {
      throw new UnauthorizedError();
    }
    return { user: toPublicUser(user) };
  }

  try {
    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      throw new UnauthorizedError();
    }
    return { user: toPublicUser(user) };
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new ConflictError("Phone number is already in use");
    }
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    throw new BadRequestError("Could not update profile");
  }
}

export async function changeUserPassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
) {
  const user = await User.findById(userId);
  if (!user) {
    throw new UnauthorizedError();
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new BadRequestError("Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();
  return "Password updated successfully";
}
