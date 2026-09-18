import crypto from "crypto";
import Client from "../models/client-model";
import ProjectManager from "../models/manager-model";
import User from "../models/user-model";
import {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
} from "../utils/app-error";
import { UserType } from "../types/user-type";

function toPublicUser(user: UserType) {
  return user.toJSON ? user.toJSON() : user;
}

export async function createUser(input: {
  name: string;
  email: string;
  phone: string;
  password: string;
  userType: "client" | "project manager";
}) {
  const existingUser = await User.findOne({ email: input.email });
  if (existingUser) {
    throw new ConflictError("Email already exists");
  }

  let newUser;
  if (input.userType === "client") {
    newUser = new Client({
      name: input.name,
      email: input.email,
      phone: input.phone,
      password: input.password,
    });
  } else {
    newUser = new ProjectManager({
      name: input.name,
      email: input.email,
      phone: input.phone,
      password: input.password,
    });
  }

  const token = await newUser.generateAuthToken();
  return { user: toPublicUser(newUser), token };
}

export async function loginUser(email: string, password: string) {
  try {
    const user = await User.findByCredentials(email, password);
    const token = await user.generateAuthToken();
    return { user: toPublicUser(user), token };
  } catch {
    throw new BadRequestError("Invalid email or password");
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

export async function createManagerClient(
  managerId: string,
  input: {
    clientName: string;
    clientPhone: string;
    clientEmail: string;
    password?: string;
  },
) {
  const existingUser = await User.findOne({ email: input.clientEmail });
  if (existingUser) {
    throw new ConflictError("Email already exists");
  }

  const password =
    input.password ??
    crypto.randomBytes(9).toString("base64url").slice(0, 12);

  const client = new Client({
    name: input.clientName,
    email: input.clientEmail,
    phone: input.clientPhone,
    password,
  });
  await client.save();

  await ProjectManager.findByIdAndUpdate(managerId, {
    $push: { clientList: client._id },
  });

  return {
    id: String(client._id),
    clientName: client.name,
    clientEmail: client.email,
    clientPhone: client.phone,
    ...(input.password ? {} : { temporaryPassword: password }),
  };
}

export async function listManagerClients(
  managerId: string,
  pageParam: number,
  limit: number,
) {
  const cappedLimit = Math.min(Math.max(limit, 1), 50);
  const page = Math.max(pageParam, 1);

  const manager = await ProjectManager.findById(managerId)
    .select("clientList")
    .lean();

  if (!manager) {
    throw new UnauthorizedError();
  }

  const clientIds = manager.clientList ?? [];
  const total = clientIds.length;
  const pageIds = clientIds.slice(
    (page - 1) * cappedLimit,
    page * cappedLimit,
  );

  const clientDocs = await Client.find({ _id: { $in: pageIds } })
    .select("name email phone")
    .lean();

  const byId = new Map(
    clientDocs.map((client) => [String(client._id), client]),
  );

  const clients = pageIds
    .map((id) => byId.get(String(id)))
    .filter(Boolean)
    .map((client) => ({
      id: String(client!._id),
      clientName: client!.name,
      clientEmail: client!.email,
      clientPhone: client!.phone,
    }));

  return {
    clients,
    pagination: {
      page,
      limit: cappedLimit,
      total,
      totalPages: Math.ceil(total / cappedLimit) || 0,
    },
  };
}
